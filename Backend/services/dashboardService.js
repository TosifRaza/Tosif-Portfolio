import Goal from '../models/Goal.js';
import Milestone from '../models/Milestone.js';
import Task from '../models/Task.js';
import DailyActivity from '../models/DailyActivity.js';
import LearningSession from '../models/LearningSession.js';
import TimeEntry from '../models/TimeEntry.js';
import { dayKey } from './progressService.js';
import { dailyView, planVsActual, weekStart, addDays, toDay, learningStreak } from './analyticsService.js';
import { estimateGoalTrajectory } from './trajectoryService.js';

/**
 * The Private Dashboard intelligence feed. Answers:
 *  - What am I doing today? (today's logged activity)
 *  - What should I do today? (rule-based focus list from priorities/due dates)
 *  - How much time have I spent? (today + this week)
 *  - What have I learned? (today's learning)
 *  - Which goals are progressing / behind?
 *  - Am I following my plan? (plan vs actual)
 *  - What is my current trajectory? (per-goal estimates)
 */
export async function buildDashboard() {
  const today = new Date();
  const day = dayKey(today);

  const [
    todayStats,
    todayActivities,
    todayLearning,
    allOpenTasks,
    completedTodayTasks,
    runningTimer,
    activeGoals,
    plan,
    streak,
  ] = await Promise.all([
    dailyView(today),
    DailyActivity.find({ date: day }).sort({ createdAt: -1 }).populate('skillId', 'name').lean(),
    LearningSession.find({ date: day }).populate('skillId', 'name').lean(),
    Task.find({ status: { $ne: 'done' } })
      .sort({ dueDate: 1, priority: 1, createdAt: 1 })
      .populate('goalId', 'title category')
      .populate('milestoneId', 'title')
      .lean(),
    Task.find({
      status: 'done',
      completedAt: { $gte: new Date(`${day}T00:00:00.000Z`), $lte: new Date(`${day}T23:59:59.999Z`) },
    })
      .sort({ completedAt: -1 })
      .populate('goalId', 'title category')
      .lean(),
    TimeEntry.findOne({ endedAt: null, source: 'timer' })
      .populate('goalId', 'title')
      .populate('taskId', 'title')
      .lean(),
    Goal.find({ status: 'active' }).sort({ priority: 1, targetDate: 1 }).lean(),
    planVsActual(weekStart(today), today),
    learningStreak(),
  ]);

  // ── Goals on track vs behind ─────────────────────────────────────
  // Behind = target date exists and expected linear progress (elapsed/target
  // span) exceeds actual progress by more than 10 points.
  const now = Date.now();
  const goalStatus = activeGoals.map((g) => {
    let expected = null;
    if (g.targetDate && g.createdAt) {
      const total = new Date(g.targetDate) - new Date(g.createdAt);
      if (total > 0) {
        expected = Math.min(100, Math.round(((now - new Date(g.createdAt)) / total) * 100));
      }
    }
    const behind = expected !== null && g.progress < expected - 10;
    return {
      id: g._id,
      title: g.title,
      category: g.category,
      priority: g.priority,
      progress: g.progress,
      targetDate: g.targetDate,
      expectedByNow: expected,
      health: g.progress >= 100 ? 'complete' : behind ? 'behind' : 'on-track',
    };
  });
  const behindGoals = goalStatus.filter((g) => g.health === 'behind');

  // ── Suggested focus (rule-based, transparent) ────────────────────
  // 1) tasks due today/overdue
  // 2) critical/high priority tasks
  // 3) first open task of the most behind goal
  const dueToday = allOpenTasks.filter((t) => t.dueDate && new Date(t.dueDate) <= new Date(`${day}T23:59:59.999Z`));
  const byPriority = allOpenTasks.filter((t) => ['critical', 'high'].includes(t.priority));
  const focus = [];

  for (const t of dueToday) {
    focus.push({
      taskId: t._id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      estimateMinutes: t.estimateMinutes || 0,
      dueDate: t.dueDate,
      goalId: t.goalId?._id || t.goalId || null,
      goal: t.goalId?.title || null,
      milestone: t.milestoneId?.title || null,
      reason: t.dueDate && String(t.dueDate).slice(0, 10) < day ? 'Overdue' : 'Due today',
    });
  }

  for (const t of byPriority) {
    if (!focus.find((f) => String(f.taskId) === String(t._id))) {
      focus.push({
        taskId: t._id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        estimateMinutes: t.estimateMinutes || 0,
        dueDate: t.dueDate,
        goalId: t.goalId?._id || t.goalId || null,
        goal: t.goalId?.title || null,
        milestone: t.milestoneId?.title || null,
        reason: `${t.priority} priority`,
      });
    }
  }

  if (behindGoals[0]) {
    const nextTask = allOpenTasks.find(
      (t) => String(t.goalId?._id || t.goalId) === String(behindGoals[0].id)
    );
    if (nextTask && !focus.find((f) => String(f.taskId) === String(nextTask._id))) {
      focus.push({
        taskId: nextTask._id,
        title: nextTask.title,
        status: nextTask.status,
        priority: nextTask.priority,
        estimateMinutes: nextTask.estimateMinutes || 0,
        dueDate: nextTask.dueDate,
        goalId: nextTask.goalId?._id || nextTask.goalId || null,
        goal: behindGoals[0].title,
        milestone: nextTask.milestoneId?.title || null,
        reason: `Goal behind: ${behindGoals[0].title}`,
      });
    }
  }

  // ── Next milestone per top goal ──────────────────────────────────
  const nextMilestone = activeGoals.length
    ? await Milestone.findOne({ goalId: activeGoals[0]._id, status: { $ne: 'done' } })
        .sort({ order: 1 })
        .lean()
    : null;

  const trajectories = await Promise.all(
    activeGoals.slice(0, 5).map((g) => estimateGoalTrajectory(g._id))
  );

  return {
    date: day,
    today: {
      activities: todayActivities,
      totalMinutes: todayStats.totalMinutes,
      timeByCategory: todayStats.timeByCategory,
      learningMinutes: todayLearning.reduce((s, l) => s + (l.durationMinutes || 0), 0),
      learning: todayLearning,
      tasksCompleted: todayStats.tasksCompleted,
    },
    focus,
    openTasks: allOpenTasks,
    completedToday: completedTodayTasks,
    runningTimer,
    goals: goalStatus,
    behindGoals,
    planVsActual: plan,
    learningStreak: streak,
    trajectories: trajectories.filter(Boolean),
    nextMilestone,
  };
}
