import TimeEntry, { TIME_CATEGORIES } from '../models/TimeEntry.js';
import { makeCrud } from '../utils/crudFactory.js';
import { requireFields, oneOf, isNumberInRange, isValidDay, badRequest } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { dayKey } from '../services/progressService.js';
import { timeByCategory, timeByDay, weekStart } from '../services/analyticsService.js';

function validateEntry(body) {
  oneOf(body.category, TIME_CATEGORIES, 'category');
  isNumberInRange(body.minutes, 0, 1440, 'minutes');
  isValidDay(body.date, 'date');
}

export const timeCrud = makeCrud(TimeEntry, 'Time entry', {
  defaultSort: { date: -1, createdAt: -1 },
});

export const createTimeEntry = asyncHandler(async (req, res) => {
  validateEntry(req.body);
  const entry = await TimeEntry.create({ ...req.body, date: req.body.date || dayKey(), source: 'manual' });
  res.status(201).json(entry);
});

export const updateTimeEntry = asyncHandler(async (req, res) => {
  validateEntry(req.body);
  const entry = await TimeEntry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!entry) return res.status(404).json({ message: 'Time entry not found' });
  res.json(entry);
});

// GET /api/time?from=&to=&date=
export const listTimeEntries = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.date) {
    filter.date = req.query.date;
  } else if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = req.query.from;
    if (req.query.to) filter.date.$lte = req.query.to;
  }
  if (req.query.category) filter.category = req.query.category;
  const items = await TimeEntry.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .populate('goalId', 'title')
    .populate('projectId', 'title missionId');
  res.json(items);
});

// POST /api/time/start { category, goalId?, projectId?, notes? } → starts a timer
export const startTimer = asyncHandler(async (req, res) => {
  const running = await TimeEntry.findOne({ endedAt: null, source: 'timer' });
  if (running) {
    return res.status(409).json({
      message: 'A timer is already running',
      running,
    });
  }
  oneOf(req.body.category, TIME_CATEGORIES, 'category');
  const entry = await TimeEntry.create({
    date: dayKey(),
    category: req.body.category || 'work',
    minutes: 0,
    startedAt: new Date(),
    endedAt: null,
    source: 'timer',
    goalId: req.body.goalId || null,
    projectId: req.body.projectId || null,
    notes: req.body.notes || '',
  });
  res.status(201).json(entry);
});

// POST /api/time/stop/:id → stops the timer and computes minutes
export const stopTimer = asyncHandler(async (req, res) => {
  const entry = await TimeEntry.findById(req.params.id);
  if (!entry) return res.status(404).json({ message: 'Timer not found' });
  if (entry.endedAt) return res.status(400).json({ message: 'Timer already stopped' });
  entry.endedAt = new Date();
  const computed = Math.max(1, Math.round((entry.endedAt - entry.startedAt) / 60000));
  entry.minutes = computed;
  await entry.save();
  res.json(entry);
});

// GET /api/time/running → current running timer
export const runningTimer = asyncHandler(async (_req, res) => {
  const entry = await TimeEntry.findOne({ endedAt: null, source: 'timer' }).lean();
  res.json(entry || null);
});

// GET /api/time/summary?from=&to= → category breakdown + daily totals
export const timeSummary = asyncHandler(async (req, res) => {
  const from = req.query.from ? new Date(req.query.from) : weekStart();
  const to = req.query.to ? new Date(req.query.to) : new Date();
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw badRequest('from/to must be valid dates');
  }
  const [byCategory, byDay] = await Promise.all([timeByCategory(from, to), timeByDay(from, to)]);
  res.json({
    from: req.query.from || dayKey(from),
    to: req.query.to || dayKey(to),
    totalMinutes: byCategory.reduce((s, r) => s + r.minutes, 0),
    byCategory,
    byDay,
  });
});

export { timeCrud as crud };
