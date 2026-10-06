import Goal from '../models/Goal.js';
import GoalSnapshot from '../models/GoalSnapshot.js';
import DailyActivity from '../models/DailyActivity.js';
import LearningSession from '../models/LearningSession.js';
import { dayKey, snapshotGoal } from './progressService.js';
import { addDays, weekStart, toDay } from './analyticsService.js';

/**
 * Goal trajectory estimator.
 *
 * Method (deliberately simple and honest):
 *  - Pull the goal's daily progress snapshots.
 *  - Pace = progress gained per week, averaged over the last 4 weeks of
 *    history (or all history if shorter, minimum 2 data points).
 *  - ETA = weeks needed for (100 - current progress) / pace.
 *  - Scenario rows re-use the *observed* progress-per-hour ratio:
 *      ratePerHour = pace / avg weekly hours actually spent on this goal.
 *    Then ETA(h) = remaining / (ratePerHour * h) for h = 15 and 20 h/week.
 *  - If there is not enough history, returns status 'insufficient_data'.
 *    Nothing is invented — the UI shows "Not enough data yet."
 */
export async function estimateGoalTrajectory(goalId) {
  const goal = await Goal.findById(goalId).lean();
  if (!goal) return null;

  await snapshotGoal(goal); // make sure today is recorded before estimating

  const snaps = await GoalSnapshot.find({ goalId }).sort({ date: 1 }).lean();
  const current = goal.progress ?? 0;

  if (!snaps || snaps.length < 2) {
    return {
      goalId,
      title: goal.title,
      status: 'insufficient_data',
      message: 'Not enough data yet. Progress history needs at least two recorded days.',
      currentProgress: current,
      targetDate: goal.targetDate || null,
    };
  }

  // ── Pace over the observation window ─────────────────────────────
  const last = snaps[snaps.length - 1];
  const windowDays = Math.max(
    7,
    Math.min(28, (new Date(last.date) - new Date(snaps[0].date)) / 86400000 || 7)
  );
  const windowStart = toDay(addDays(new Date(last.date), -windowDays));
  const windowSnaps = snaps.filter((s) => s.date >= windowStart);
  const gain = (windowSnaps[windowSnaps.length - 1]?.progress ?? current) - windowSnaps[0].progress;
  const weeks = Math.max(0.5, windowDays / 7);
  const pacePerWeek = Math.max(0, gain / weeks); // progress points per week

  // ── Weekly hours actually spent on this goal (activity + learning) ──
  const weekFrom = toDay(weekStart());
  const weekTo = toDay(new Date());
  const [actMin, learnMin] = await Promise.all([
    DailyActivity.aggregate([
      { $match: { goalId: goal._id, date: { $gte: weekFrom, $lte: weekTo } } },
      { $group: { _id: null, minutes: { $sum: '$durationMinutes' } } },
    ]),
    LearningSession.aggregate([
      { $match: { goalId: goal._id, date: { $gte: weekFrom, $lte: weekTo } } },
      { $group: { _id: null, minutes: { $sum: '$durationMinutes' } } },
    ]),
  ]);
  const weeklyHours = (actMin[0]?.minutes || 0) / 60 + (learnMin[0]?.minutes || 0) / 60;

  const remaining = Math.max(0, 100 - current);
  const result = {
    goalId,
    title: goal.title,
    status: 'estimated',
    currentProgress: current,
    remaining,
    targetDate: goal.targetDate || null,
    observedPacePerWeek: Math.round(pacePerWeek * 10) / 10,
    observedWeeklyHours: Math.round(weeklyHours * 10) / 10,
    isEstimate: true,
    disclaimer:
      'Estimated trajectory based on your recorded progress history. This is a projection, not a guarantee.',
  };

  if (pacePerWeek <= 0) {
    result.estimate = null;
    result.message =
      current >= 100
        ? 'Goal already complete.'
        : 'No measurable progress recorded in the observation window yet.';
    if (current >= 100) result.status = 'complete';
    return result;
  }

  const weeksNeeded = remaining / pacePerWeek;
  const etaDate = addDays(new Date(last.date), Math.ceil(weeksNeeded * 7));
  result.estimate = {
    weeksNeeded: Math.ceil(weeksNeeded),
    completionAround: toDay(etaDate),
    // Range ±15% of remaining time to communicate uncertainty honestly.
    rangeStart: toDay(addDays(etaDate, -Math.ceil(weeksNeeded * 7 * 0.15))),
    rangeEnd: toDay(addDays(etaDate, Math.ceil(weeksNeeded * 7 * 0.15))),
  };

  // ── Scenario estimates (only meaningful if we have an hours baseline) ──
  if (weeklyHours > 0.5) {
    const ratePerHour = pacePerWeek / weeklyHours; // progress points per hour
    result.scenarios = [10, 15, 20].map((h) => ({
      hoursPerWeek: h,
      weeksNeeded: Math.ceil(remaining / (ratePerHour * h)),
      completionAround: toDay(addDays(new Date(), Math.ceil((remaining / (ratePerHour * h)) * 7))),
    }));
  }

  return result;
}

/** Trajectories for all active goals (dashboard summary). */
export async function estimateAllTrajectories() {
  const goals = await Goal.find({ status: 'active' }).select('_id').lean();
  const results = await Promise.all(goals.map((g) => estimateGoalTrajectory(g._id)));
  return results.filter(Boolean);
}
