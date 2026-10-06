import Goal from '../models/Goal.js';
import Skill from '../models/Skill.js';
import Task from '../models/Task.js';
import DailyActivity from '../models/DailyActivity.js';
import LearningSession from '../models/LearningSession.js';
import TimeEntry from '../models/TimeEntry.js';
import { dayKey } from './progressService.js';
import { weekStart, addDays, toDay, planVsActual } from './analyticsService.js';
import { buildDashboard } from './dashboardService.js';

/**
 * Personal AI — PRIVATE insight engine.
 *
 * Rule-based by default: every answer is computed from the owner's real
 * database records (goals, activities, time entries, learning sessions).
 * If AI_API_KEY + AI_BASE_URL are configured, the same computed summary is
 * passed to an OpenAI-compatible chat endpoint for a more conversational
 * reply — but the numbers still come from the data, never invented.
 */

function minutesLabel(min) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

async function weeklyAchievements() {
  const from = toDay(weekStart());
  const to = dayKey();
  const [tasks, learning, acts] = await Promise.all([
    Task.find({ status: 'done', completedAt: { $gte: new Date(`${from}T00:00:00`) } })
      .limit(10)
      .select('title completedAt')
      .lean(),
    LearningSession.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: null, minutes: { $sum: '$durationMinutes' }, sessions: { $sum: 1 } } },
    ]),
    DailyActivity.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: '$type', minutes: { $sum: '$durationMinutes' }, count: { $sum: 1 } } },
    ]),
  ]);
  return {
    tasksCompleted: tasks,
    taskCount: tasks.length,
    learningMinutes: learning[0]?.minutes || 0,
    learningSessions: learning[0]?.sessions || 0,
    activities: acts,
  };
}

async function timeSpendBreakdown() {
  const from = toDay(addDays(new Date(), -30));
  const rows = await TimeEntry.aggregate([
    { $match: { date: { $gte: from } } },
    { $group: { _id: '$category', minutes: { $sum: '$minutes' } } },
    { $sort: { minutes: -1 } },
  ]);
  const actRows = await DailyActivity.aggregate([
    { $match: { date: { $gte: from }, $or: [{ durationMinutes: { $gt: 0 } }] } },
    { $group: { _id: '$type', minutes: { $sum: '$durationMinutes' } } },
  ]);
  const map = {};
  for (const r of rows) map[r._id] = (map[r._id] || 0) + r.minutes;
  for (const r of actRows) if (!map[r._id]) map[r._id] = r.minutes; // don't double count
  return Object.entries(map)
    .map(([category, minutes]) => ({ category, minutes }))
    .sort((a, b) => b.minutes - a.minutes);
}

/** Rule-based answer generation from live data. */
export async function answerFromData(question) {
  const q = (question || '').toLowerCase().trim();
  const today = dayKey();

  // What did I learn today?
  if (q.includes('learn') && (q.includes('today') || q.includes('learning today'))) {
    const sessions = await LearningSession.find({ date: today }).populate('skillId', 'name').lean();
    if (!sessions.length) {
      return { reply: 'No learning sessions logged for today yet. Add one in the Learning module and I will summarise it here.' };
    }
    const total = sessions.reduce((s, x) => s + (x.durationMinutes || 0), 0);
    const list = sessions.map((s) => `• ${s.skillId?.name || 'General'} — ${minutesLabel(s.durationMinutes || 0)}${s.notes ? ` (${s.notes})` : ''}`);
    return { reply: `Today you logged ${sessions.length} learning session(s), totalling ${minutesLabel(total)}:\n${list.join('\n')}` };
  }

  // What did I accomplish this week?
  if (q.includes('week') && (q.includes('accomplish') || q.includes('did') || q.includes('done'))) {
    const w = await weeklyAchievements();
    if (!w.taskCount && !w.learningMinutes && !w.activities.length) {
      return { reply: 'Nothing recorded for this week yet. Log tasks, activities or learning sessions and check back.' };
    }
    const parts = [];
    if (w.taskCount) parts.push(`completed ${w.taskCount} task(s)`);
    if (w.learningMinutes) parts.push(`logged ${minutesLabel(w.learningMinutes)} of learning across ${w.learningSessions} session(s)`);
    if (w.activities.length) parts.push(`recorded ${w.activities.reduce((s, a) => s + a.count, 0)} activity entries`);
    return { reply: `This week you ${parts.join(', ')}.`, data: w };
  }

  // Which goal is behind?
  if (q.includes('behind') || (q.includes('goal') && q.includes('which'))) {
    const dash = await buildDashboard();
    if (!dash.behindGoals.length) {
      return { reply: dash.goals.length ? 'None of your active goals are behind their expected pace right now. Keep going.' : 'You have no active goals yet. Create one in the Goals module.' };
    }
    const list = dash.behindGoals.map((g) => `• ${g.title}: ${g.progress}% done${g.expectedByNow !== null ? ` (expected ~${g.expectedByNow}% by now)` : ''}`);
    return { reply: `These goals are behind their expected pace:\n${list.join('\n')}`, data: dash.behindGoals };
  }

  // Where am I spending most of my time?
  if (q.includes('spending') || q.includes('most of my time') || q.includes('time distribution')) {
    const rows = await timeSpendBreakdown();
    if (!rows.length) return { reply: 'No time entries or activities recorded in the last 30 days, so I cannot show a distribution yet.' };
    const total = rows.reduce((s, r) => s + r.minutes, 0);
    const list = rows.slice(0, 5).map((r) => `• ${r.category}: ${minutesLabel(r.minutes)} (${Math.round((r.minutes / total) * 100)}%)`);
    return { reply: `Over the last 30 days your recorded time breaks down as:\n${list.join('\n')}`, data: rows };
  }

  // What should I focus on tomorrow?
  if (q.includes('tomorrow') || q.includes('focus') || q.includes('next')) {
    const dash = await buildDashboard();
    if (!dash.focus.length) return { reply: 'I have no open tasks or behind goals to point at. Add tasks to your goals and I will suggest what to pick up next.' };
    const list = dash.focus.slice(0, 4).map((f) => `• ${f.title}${f.goal ? ` (${f.goal})` : ''} — ${f.reason}`);
    return { reply: `Suggested focus, based on due dates, priorities and goal health:\n${list.join('\n')}`, data: dash.focus };
  }

  // How much time did I spend learning <skill>?
  if (q.includes('how much time') || (q.includes('time') && q.includes('learning')) || q.includes('hours')) {
    const skills = await Skill.find({}).select('name').lean();
    const match = skills.find((s) => q.includes(s.name.toLowerCase()));
    if (match) {
      const agg = await LearningSession.aggregate([
        { $match: { skillId: match._id } },
        { $group: { _id: null, minutes: { $sum: '$durationMinutes' }, sessions: { $sum: 1 } } },
      ]);
      const minutes = agg[0]?.minutes || 0;
      return { reply: minutes ? `You have logged ${minutesLabel(minutes)} of learning on ${match.name} across ${agg[0].sessions} session(s).` : `No learning sessions logged for ${match.name} yet.` };
    }
    const total = await LearningSession.aggregate([{ $group: { _id: null, minutes: { $sum: '$durationMinutes' } } }]);
    return { reply: total[0]?.minutes ? `Total learning time recorded so far: ${minutesLabel(total[0].minutes)}. Ask about a specific skill (e.g. "how much time learning Node.js") for a breakdown.` : 'No learning sessions recorded yet.' };
  }

  // Am I progressing toward my goal?
  if (q.includes('progressing') || q.includes('trajectory') || q.includes('on track')) {
    const dash = await buildDashboard();
    if (!dash.trajectories.length) return { reply: 'No active goals found. Create a goal and log progress; after a couple of days I can estimate your trajectory.' };
    const lines = dash.trajectories.map((t) => {
      if (t.status === 'insufficient_data') return `• ${t.title}: not enough data yet (progress history needs 2+ days).`;
      if (t.status === 'complete') return `• ${t.title}: complete.`;
      if (!t.estimate) return `• ${t.title}: ${t.currentProgress}% done — no measurable progress in the observation window yet.`;
      return `• ${t.title}: ${t.currentProgress}% done — estimated completion around ${t.estimate.completionAround} at your current pace (${t.observedPacePerWeek} pts/week).`;
    });
    return { reply: `Estimated trajectories (projections, not guarantees):\n${lines.join('\n')}`, data: dash.trajectories };
  }

  // What skill am I neglecting?
  if (q.includes('neglect')) {
    const skills = await Skill.find({ visible: true }).select('name').lean();
    if (!skills.length) return { reply: 'No skills configured yet.' };
    const since = toDay(addDays(new Date(), -21));
    const counts = await LearningSession.aggregate([
      { $match: { date: { $gte: since } } },
      { $group: { _id: '$skillId', minutes: { $sum: '$durationMinutes' } } },
    ]);
    const map = new Map(counts.map((c) => [String(c._id), c.minutes]));
    const neglected = skills
      .map((s) => ({ name: s.name, minutes: map.get(String(s._id)) || 0 }))
      .sort((a, b) => a.minutes - b.minutes);
    const zero = neglected.filter((n) => n.minutes === 0);
    if (zero.length) {
      return { reply: `No learning time recorded in the last 21 days for: ${zero.slice(0, 5).map((z) => z.name).join(', ')}.`, data: neglected };
    }
    return { reply: `Least-attended skill in the last 21 days: ${neglected[0].name} (${minutesLabel(neglected[0].minutes)}).`, data: neglected };
  }

  // Plan adherence
  if (q.includes('plan') || q.includes('on plan') || q.includes('execution')) {
    const plan = await planVsActual(weekStart(), new Date());
    const rows = plan.rows.filter((r) => r.execution !== null);
    if (!rows.length) return { reply: 'No weekly plan targets set yet. Configure them in Settings → Plan, then log time to see execution percentages.' };
    const list = rows.map((r) => `• ${r.category}: ${minutesLabel(r.actualMinutes)} of ${minutesLabel(r.targetMinutes)} (${r.execution}%)`);
    return { reply: `This week's plan execution:\n${list.join('\n')}`, data: plan.rows };
  }

  return null; // no rule matched
}

/** Optional LLM enrichment via an OpenAI-compatible endpoint (env-configured). */
export async function llmEnrich(question, baseAnswer) {
  const { AI_API_KEY, AI_BASE_URL, AI_MODEL } = process.env;
  if (!AI_API_KEY || !AI_BASE_URL || !baseAnswer) return null;
  try {
    const url = `${AI_BASE_URL.replace(/\/$/, '')}/chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({
        model: AI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are the Personal AI inside TOSIF OS. You are given a computed data answer derived from the user\u2019s own records. Rewrite it as one short, warm, factual paragraph. Never invent numbers or achievements. If data is missing, say so.',
          },
          { role: 'user', content: `Question: ${question}\nComputed answer: ${JSON.stringify(baseAnswer)}` },
        ],
        max_tokens: 220,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const reply = json.choices?.[0]?.message?.content;
    return reply ? { reply } : null;
  } catch {
    return null; // graceful fallback to the rule-based answer
  }
}

export async function askInsight(question) {
  const base = await answerFromData(question);
  if (!base) {
    return {
      reply:
        'I can answer from your OS data. Try: "What did I learn today?" • "What did I accomplish this week?" • "Which goal is behind?" • "Where am I spending most of my time?" • "What should I focus on tomorrow?" • "How much time learning Node.js?" • "Am I progressing toward my goal?" • "Which skill am I neglecting?"',
      suggestions: [
        'What did I learn today?',
        'What did I accomplish this week?',
        'Which goal is behind?',
        'Where am I spending most of my time?',
        'What should I focus on tomorrow?',
        'Which skill am I neglecting?',
      ],
      source: 'insights-engine',
    };
  }
  const enriched = await llmEnrich(question, base);
  return { ...base, source: enriched ? 'insights-engine+llm' : 'insights-engine' };
}
