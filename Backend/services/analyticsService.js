import TimeEntry from '../models/TimeEntry.js';
import DailyActivity from '../models/DailyActivity.js';
import LearningSession from '../models/LearningSession.js';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import GoalSnapshot from '../models/GoalSnapshot.js';
import PlanSetting from '../models/PlanSetting.js';
import { dayKey } from './progressService.js';

// ── Date range helpers ──────────────────────────────────────────────

export function toDay(d) {
  return dayKey(d);
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** Monday-based week start. */
export function weekStart(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function rangeDays(from, to) {
  const days = [];
  let cur = new Date(from);
  while (cur <= to) {
    days.push(toDay(cur));
    cur = addDays(cur, 1);
  }
  return days;
}

// ── Time aggregates ─────────────────────────────────────────────────

export async function timeByCategory(from, to) {
  const rows = await TimeEntry.aggregate([
    { $match: { date: { $gte: toDay(from), $lte: toDay(to) } } },
    { $group: { _id: '$category', minutes: { $sum: '$minutes' }, entries: { $sum: 1 } } },
    { $sort: { minutes: -1 } },
  ]);
  return rows.map((r) => ({ category: r._id, minutes: r.minutes, entries: r.entries }));
}

export async function timeByDay(from, to) {
  const rows = await TimeEntry.aggregate([
    { $match: { date: { $gte: toDay(from), $lte: toDay(to) } } },
    {
      $group: {
        _id: { date: '$date', category: '$category' },
        minutes: { $sum: '$minutes' },
      },
    },
  ]);
  const byDate = {};
  for (const r of rows) {
    byDate[r._id.date] ||= { date: r._id.date, total: 0, byCategory: {} };
    byDate[r._id.date].total += r.minutes;
    byDate[r._id.date].byCategory[r._id.category] = r.minutes;
  }
  return rangeDays(from, to).map((d) => byDate[d] || { date: d, total: 0, byCategory: {} });
}

// ── Learning aggregates ─────────────────────────────────────────────

export async function learningByDay(from, to) {
  const rows = await LearningSession.aggregate([
    { $match: { date: { $gte: toDay(from), $lte: toDay(to) } } },
    { $group: { _id: '$date', minutes: { $sum: '$durationMinutes' }, sessions: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(rows.map((r) => [r._id, r]));
  return rangeDays(from, to).map((d) => ({
    date: d,
    minutes: map[d]?.minutes || 0,
    sessions: map[d]?.sessions || 0,
  }));
}

export async function learningBySkill(from, to) {
  const rows = await LearningSession.aggregate([
    { $match: { date: { $gte: toDay(from), $lte: toDay(to) } } },
    {
      $group: {
        _id: '$skillId',
        minutes: { $sum: '$durationMinutes' },
        sessions: { $sum: 1 },
      },
    },
    { $sort: { minutes: -1 } },
  ]);
  return rows.map((r) => ({ skillId: r._id, minutes: r.minutes, sessions: r.sessions }));
}

/** Consecutive days (ending today or yesterday) with any learning activity. */
export async function learningStreak() {
  const today = new Date();
  const from = addDays(today, -365);
  const sessions = await LearningSession.aggregate([
    { $match: { date: { $gte: toDay(from) }, durationMinutes: { $gt: 0 } } },
    { $group: { _id: '$date' } },
  ]);
  const activities = await DailyActivity.aggregate([
    { $match: { date: { $gte: toDay(from) }, type: 'learning', durationMinutes: { $gt: 0 } } },
    { $group: { _id: '$date' } },
  ]);
  const days = new Set([...sessions, ...activities].map((r) => r._id));
  let streak = 0;
  let cursor = new Date(today);
  if (!days.has(toDay(cursor))) cursor = addDays(cursor, -1); // allow "today not yet logged"
  while (days.has(toDay(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

// ── Task stats ──────────────────────────────────────────────────────

export async function taskStats(from, to) {
  const [completedInRange, open] = await Promise.all([
    Task.countDocuments({
      status: 'done',
      completedAt: { $gte: new Date(`${toDay(from)}T00:00:00`), $lte: new Date(`${toDay(to)}T23:59:59`) },
    }),
    Task.countDocuments({ status: { $ne: 'done' } }),
  ]);
  return { completed: completedInRange, open };
}

// ── Plan vs Actual ──────────────────────────────────────────────────
/**
 * Actual minutes per category:
 * - If the week has TimeEntries in that category, they are canonical.
 * - Otherwise DailyActivity durations of that type are used (no double count).
 */
export async function planVsActual(from = weekStart(), to = new Date()) {
  const plans = await PlanSetting.find({ enabled: true });
  const timeRows = await timeByCategory(from, to);
  const actRows = await DailyActivity.aggregate([
    { $match: { date: { $gte: toDay(from), $lte: toDay(to) } } },
    { $group: { _id: '$type', minutes: { $sum: '$durationMinutes' } } },
  ]);
  const timeMap = Object.fromEntries(timeRows.map((r) => [r.category, r.minutes]));
  const actMap = Object.fromEntries(actRows.map((r) => [r._id, r.minutes]));

  const rows = plans.map((p) => {
    const timeMin = timeMap[p.category] || 0;
    const actMin = actMap[p.category] || 0;
    const actual = timeMin > 0 ? timeMin : actMin;
    const target = p.weeklyTargetMinutes || 0;
    return {
      category: p.category,
      targetMinutes: target,
      actualMinutes: actual,
      execution: target > 0 ? Math.round((actual / target) * 100) : null, // null → no plan set
    };
  });
  // Categories with activity but no plan row — surfaced so nothing is hidden.
  const plannedCats = new Set(rows.map((r) => r.category));
  const unplanned = Object.entries({ ...actMap, ...timeMap })
    .filter(([cat, min]) => min > 0 && !plannedCats.has(cat))
    .map(([category, minutes]) => ({ category, targetMinutes: 0, actualMinutes: minutes, execution: null }));

  return { weekStart: toDay(from), weekEnd: toDay(to), rows: [...rows, ...unplanned] };
}

// ── Goal movement (from snapshots) ──────────────────────────────────

export async function goalMovement(from, to) {
  const snaps = await GoalSnapshot.find({
    date: { $gte: toDay(from), $lte: toDay(to) },
  }).sort({ date: 1 }).lean();
  const byGoal = {};
  for (const s of snaps) {
    byGoal[s.goalId] ||= { first: s.progress, last: s.progress };
    byGoal[s.goalId].last = s.progress;
  }
  const goals = await Goal.find({ _id: { $in: Object.keys(byGoal) } }).select('title category status');
  return goals.map((g) => ({
    goalId: g._id,
    title: g.title,
    category: g.category,
    status: g.status,
    start: byGoal[g._id]?.first ?? 0,
    end: byGoal[g._id]?.last ?? 0,
    delta: (byGoal[g._id]?.last ?? 0) - (byGoal[g._id]?.first ?? 0),
  }));
}

// ── Consistency ─────────────────────────────────────────────────────

export async function consistency(from, to) {
  const days = rangeDays(from, to);
  const [time, acts, learn] = await Promise.all([
    TimeEntry.distinct('date', { date: { $gte: toDay(from), $lte: toDay(to) }, minutes: { $gt: 0 } }),
    DailyActivity.distinct('date', { date: { $gte: toDay(from), $lte: toDay(to) }, durationMinutes: { $gt: 0 } }),
    LearningSession.distinct('date', { date: { $gte: toDay(from), $lte: toDay(to) }, durationMinutes: { $gt: 0 } }),
  ]);
  const active = new Set([...time, ...acts, ...learn]);
  const activeCount = days.filter((d) => active.has(d)).length;
  return {
    totalDays: days.length,
    activeDays: activeCount,
    percentage: days.length ? Math.round((activeCount / days.length) * 100) : 0,
  };
}

// ── Composite views ─────────────────────────────────────────────────

export async function dailyView(date = new Date()) {
  const day = toDay(date);
  const [time, tasksDone, learning] = await Promise.all([
    timeByCategory(date, date),
    Task.countDocuments({ status: 'done', completedAt: { $gte: new Date(`${day}T00:00:00`), $lte: new Date(`${day}T23:59:59`) } }),
    learningByDay(date, date),
  ]);
  const goalProgress = await goalMovement(date, date);
  return {
    date: day,
    timeByCategory: time,
    totalMinutes: time.reduce((s, r) => s + r.minutes, 0),
    tasksCompleted: tasksDone,
    learningMinutes: learning.reduce((s, r) => s + r.minutes, 0),
    goalMovement: goalProgress,
  };
}

export async function weeklyView(date = new Date()) {
  const from = weekStart(date);
  const to = addDays(from, 6);
  const [time, learning, plan, movement, consistencyStat] = await Promise.all([
    timeByDay(from, to),
    learningByDay(from, to),
    planVsActual(from, to),
    goalMovement(from, to),
    consistency(from, to),
  ]);
  return {
    weekStart: toDay(from),
    weekEnd: toDay(to),
    timeByDay: time,
    learningByDay: learning,
    totalLearningMinutes: learning.reduce((s, r) => s + r.minutes, 0),
    planVsActual: plan,
    goalMovement: movement,
    consistency: consistencyStat,
  };
}

export async function monthlyView(date = new Date()) {
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const [time, learning, movement, bySkill] = await Promise.all([
    timeByDay(from, to),
    learningByDay(from, to),
    goalMovement(from, to),
    learningBySkill(from, to),
  ]);
  const goals = await Goal.find({ status: 'active' }).select('title progress category updatedAt').sort({ updatedAt: -1 }).limit(12).lean();
  return {
    month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    timeByDay: time,
    learningByDay: learning,
    totalLearningMinutes: learning.reduce((s, r) => s + r.minutes, 0),
    goalMovement: movement,
    learningBySkill: bySkill,
    activeGoals: goals,
  };
}

export async function yearlyView(date = new Date()) {
  const from = new Date(date.getFullYear(), 0, 1);
  const to = new Date(date.getFullYear(), 11, 31);
  const Milestone = (await import('../models/Milestone.js')).default;
  const [learning, movement, completedMilestones, completedGoals] = await Promise.all([
    learningByDay(from, to),
    goalMovement(from, to),
    Milestone.countDocuments({ status: 'done', completedAt: { $gte: from, $lte: to } }),
    Goal.countDocuments({ status: 'completed', completedAt: { $gte: from, $lte: to } }),
  ]);
  // Group learning by month for the yearly chart.
  const byMonth = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, minutes: 0 }));
  for (const d of learning) {
    const m = Number(d.date.slice(5, 7));
    byMonth[m - 1].minutes += d.minutes;
  }
  return {
    year: date.getFullYear(),
    learningByMonth: byMonth,
    totalLearningMinutes: byMonth.reduce((s, r) => s + r.minutes, 0),
    goalMovement: movement,
    milestonesCompleted: completedMilestones,
    goalsCompleted: completedGoals,
  };
}
