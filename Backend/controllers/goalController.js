import Goal from '../models/Goal.js';
import Milestone from '../models/Milestone.js';
import Task from '../models/Task.js';
import { recomputeGoal, recomputeMilestone, cascadeFromTask, snapshotGoal } from '../services/progressService.js';
import { makeCrud, ensureObjectId } from '../utils/crudFactory.js';
import { requireFields, oneOf, isNumberInRange, isValidDate, badRequest } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const GOAL_CATEGORIES = ['career', 'founder', 'learning', 'financial', 'health', 'personal'];
export const PRIORITIES = ['low', 'medium', 'high', 'critical'];
export const STATUSES = ['todo', 'in-progress', 'done'];

function validateGoal(body) {
  requireFields(body, ['title']);
  oneOf(body.category, GOAL_CATEGORIES, 'category');
  oneOf(body.priority, PRIORITIES, 'priority');
  oneOf(body.status, ['active', 'paused', 'completed', 'archived'], 'status');
  oneOf(body.progressMode, ['auto', 'manual'], 'progressMode');
  isNumberInRange(body.progress, 0, 100, 'progress');
  isValidDate(body.targetDate, 'targetDate');
}

/** Goal CRUD with snapshot hook. */
export const goalCrud = makeCrud(Goal, 'Goal', {
  afterSave: async (goal, body) => {
    if (goal.progressMode === 'manual' || goal.progress >= 100) {
      await snapshotGoal(goal);
    }
    if (body?.status === 'completed' && !goal.completedAt) {
      goal.completedAt = new Date();
      await goal.save();
    }
  },
  defaultSort: { order: 1, createdAt: -1 },
});

// POST /api/goals
export const createGoal = asyncHandler(async (req, res) => {
  validateGoal(req.body);
  const goal = await Goal.create(goalCrud.clean(req.body));
  await snapshotGoal(goal);
  res.status(201).json(goal);
});

// PUT /api/goals/:id
export const updateGoal = asyncHandler(async (req, res) => {
  validateGoal(req.body);
  const goal = await Goal.findByIdAndUpdate(req.params.id, goalCrud.clean(req.body), {
    new: true,
    runValidators: true,
  });
  if (!goal) return res.status(404).json({ message: 'Goal not found' });
  await recomputeGoal(goal._id); // refresh rollup + snapshot
  res.json(goal);
});

// GET /api/goals/:id — full detail with milestones + tasks
export const getGoalDetail = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id).populate('relatedSkills', 'name category level targetLevel').lean();
  if (!goal) return res.status(404).json({ message: 'Goal not found' });
  const milestones = await Milestone.find({ goalId: goal._id }).sort({ order: 1 }).lean();
  const tasks = await Task.find({ goalId: goal._id }).sort({ order: 1, createdAt: 1 }).lean();
  const milestoneMap = Object.fromEntries(milestones.map((m) => [String(m._id), []]));
  const orphans = [];
  for (const t of tasks) {
    const key = t.milestoneId ? String(t.milestoneId) : null;
    if (key && milestoneMap[key]) milestoneMap[key].push(t);
    else orphans.push(t);
  }
  res.json({ ...goal, milestones: milestones.map((m) => ({ ...m, tasks: milestoneMap[String(m._id)] })), tasksWithoutMilestone: orphans });
});

// GET /api/goals/:id/progress — forces a rollup recompute
export const recalcGoal = asyncHandler(async (req, res) => {
  const goal = await recomputeGoal(req.params.id);
  if (!goal) return res.status(404).json({ message: 'Goal not found' });
  res.json({ progress: goal.progress, status: goal.status });
});

// ── Milestones ──────────────────────────────────────────────────────

function validateMilestone(body) {
  requireFields(body, ['goalId', 'title']);
  oneOf(body.status, STATUSES, 'status');
  isValidDate(body.dueDate, 'dueDate');
}

export const createMilestone = asyncHandler(async (req, res) => {
  validateMilestone(req.body);
  const goal = await Goal.findById(req.body.goalId);
  if (!goal) return res.status(404).json({ message: 'Goal not found' });
  const milestone = await Milestone.create({ ...req.body, progress: bodyProgress(req.body) });
  await recomputeGoal(milestone.goalId);
  res.status(201).json(milestone);
});

export const updateMilestone = asyncHandler(async (req, res) => {
  oneOf(req.body.status, STATUSES, 'status');
  isValidDate(req.body.dueDate, 'dueDate');
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
  Object.assign(milestone, req.body);
  // Recompute from tasks if the milestone has any (keeps numbers honest).
  const taskCount = await Task.countDocuments({ milestoneId: milestone._id });
  if (taskCount > 0 && req.body.status) {
    if (req.body.status === 'done') {
      await Task.updateMany({ milestoneId: milestone._id, status: { $ne: 'done' } }, { $set: { status: 'done', completedAt: new Date() } });
    } else if (milestone.progress === 100 && req.body.status !== 'done') {
      await Task.updateMany({ milestoneId: milestone._id }, { $set: { status: req.body.status, completedAt: null } });
    }
  }
  if (req.body.status === 'done' && taskCount === 0) {
    milestone.progress = 100;
    milestone.completedAt = milestone.completedAt || new Date();
  }
  await milestone.save();
  await recomputeMilestone(milestone._id);
  res.json(milestone);
});

function bodyProgress(body) {
  const p = Number(body.progress ?? 0);
  return Number.isNaN(p) ? 0 : Math.max(0, Math.min(100, p));
}

// ── Tasks ───────────────────────────────────────────────────────────

function validateTask(body) {
  requireFields(body, ['title']);
  oneOf(body.status, STATUSES, 'status');
  oneOf(body.priority, PRIORITIES, 'priority');
  isNumberInRange(body.estimateMinutes, 0, 100000, 'estimateMinutes');
  isValidDate(body.dueDate, 'dueDate');
  if (body.milestoneId) ensureObjectId(String(body.milestoneId));
}

export const createTask = asyncHandler(async (req, res) => {
  validateTask(req.body);
  let goalId = req.body.goalId || null;
  if (req.body.milestoneId) {
    const milestone = await Milestone.findById(req.body.milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
    goalId = milestone.goalId;
  } else if (goalId) {
    ensureObjectId(String(goalId));
    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
  }
  const task = await Task.create({ ...req.body, goalId });
  await cascadeFromTask(task);
  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  validateTask(req.body);
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  await cascadeFromTask(task);
  res.json(task);
});

export const taskCrud = makeCrud(Task, 'Task', {
  afterSave: (task) => cascadeFromTask(task),
  afterDelete: (task) => cascadeFromTask(task),
});

// PATCH /api/tasks/:id/complete — quick toggle
export const toggleTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.status === 'done') {
    task.status = 'todo';
    task.completedAt = null;
  } else {
    task.status = 'done';
    task.completedAt = new Date();
  }
  await task.save();
  await cascadeFromTask(task);
  res.json(task);
});

// GET /api/tasks — with optional filters
export const listTasks = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.goalId) filter.goalId = req.query.goalId;
  if (req.query.milestoneId) filter.milestoneId = req.query.milestoneId;
  if (req.query.status) filter.status = req.query.status;
  const tasks = await Task.find(filter)
    .sort({ status: 1, priority: 1, dueDate: 1, createdAt: -1 })
    .populate('goalId', 'title category')
    .populate('milestoneId', 'title');
  res.json(tasks);
});

// GET /api/milestones?goalId=
export const listMilestones = asyncHandler(async (req, res) => {
  const filter = req.query.goalId ? { goalId: req.query.goalId } : {};
  const milestones = await Milestone.find(filter).sort({ order: 1, createdAt: 1 });
  res.json(milestones);
});

export const milestoneCrud = makeCrud(Milestone, 'Milestone', {
  afterSave: (m) => recomputeMilestone(m._id),
  afterDelete: (m) => recomputeGoal(m.goalId),
});
