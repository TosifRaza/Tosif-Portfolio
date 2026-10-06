import Milestone from '../models/Milestone.js';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import GoalSnapshot from '../models/GoalSnapshot.js';

/** YYYY-MM-DD for a given date (local). */
export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Recompute milestone progress from its tasks.
 * - If the milestone has tasks: progress = done/total * 100, and status
 *   follows completion (all done → done; any in-progress → in-progress).
 * - If it has no tasks: progress stays as manually set.
 * Then rolls up to the parent goal.
 */
export async function recomputeMilestone(milestoneId) {
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) return null;

  const tasks = await Task.find({ milestoneId: milestone._id });
  if (tasks.length > 0) {
    const done = tasks.filter((t) => t.status === 'done').length;
    milestone.progress = Math.round((done / tasks.length) * 100);
    if (done === tasks.length) {
      milestone.status = 'done';
      milestone.completedAt = milestone.completedAt || new Date();
    } else if (tasks.some((t) => t.status === 'in-progress') || done > 0) {
      milestone.status = 'in-progress';
      milestone.completedAt = null;
    } else {
      milestone.status = 'todo';
      milestone.completedAt = null;
    }
    await milestone.save();
  }

  await recomputeGoal(milestone.goalId);
  return milestone;
}

/**
 * Recompute goal progress:
 * - auto mode: average of milestone progress (milestones with tasks use their
 *   computed progress; those without use their manual progress value).
 *   Goals without milestones keep their manual/last progress.
 * - manual mode: untouched.
 * Also upserts today's GoalSnapshot (the trajectory history).
 */
export async function recomputeGoal(goalId) {
  const goal = await Goal.findById(goalId);
  if (!goal) return null;

  if (goal.progressMode === 'auto') {
    const milestones = await Milestone.find({ goalId: goal._id });
    if (milestones.length > 0) {
      const total = milestones.reduce((sum, m) => sum + (m.progress || 0), 0);
      goal.progress = Math.round(total / milestones.length);
    }

    if (goal.progress >= 100 && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = goal.completedAt || new Date();
    } else if (goal.progress < 100 && goal.status === 'completed') {
      goal.status = 'active';
      goal.completedAt = null;
    }
    await goal.save();
  }

  await snapshotGoal(goal);
  return goal;
}

/** Upsert today's snapshot for a goal (one per day — trajectory history). */
export async function snapshotGoal(goal) {
  const date = dayKey();
  await GoalSnapshot.updateOne(
    { goalId: goal._id, date },
    { $set: { progress: goal.progress ?? 0 } },
    { upsert: true }
  );
}

/** Full cascade for a task change: task → milestone → goal → snapshot. */
export async function cascadeFromTask(task) {
  if (task?.milestoneId) {
    await recomputeMilestone(task.milestoneId);
  } else if (task?.goalId) {
    await recomputeGoal(task.goalId);
  }
}
