import LearningSession from '../models/LearningSession.js';
import LearningTopic from '../models/LearningTopic.js';
import Skill from '../models/Skill.js';
import { makeCrud } from '../utils/crudFactory.js';
import { requireFields, oneOf, isNumberInRange, isValidDay } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { dayKey } from '../services/progressService.js';
import { learningByDay, learningBySkill, learningStreak } from '../services/analyticsService.js';

function validateSession(body) {
  isNumberInRange(body.durationMinutes, 0, 1440, 'durationMinutes');
  isValidDay(body.date, 'date');
  oneOf(body.difficulty, ['easy', 'medium', 'hard'], 'difficulty');
  isNumberInRange(body.confidence, 1, 5, 'confidence');
}

export const sessionCrud = makeCrud(LearningSession, 'Learning session', {
  defaultSort: { date: -1, createdAt: -1 },
});

export const createSession = asyncHandler(async (req, res) => {
  validateSession(req.body);
  const session = await LearningSession.create({ ...req.body, date: req.body.date || dayKey() });
  res.status(201).json(session);
});

export const updateSession = asyncHandler(async (req, res) => {
  validateSession(req.body);
  const session = await LearningSession.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!session) return res.status(404).json({ message: 'Learning session not found' });
  res.json(session);
});

export const listSessions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.date) filter.date = req.query.date;
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = req.query.from;
    if (req.query.to) filter.date.$lte = req.query.to;
  }
  if (req.query.skillId) filter.skillId = req.query.skillId;
  if (req.query.goalId) filter.goalId = req.query.goalId;
  const items = await LearningSession.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .populate('skillId', 'name category')
    .populate('goalId', 'title')
    .populate('topicId', 'title');
  res.json(items);
});

// ── Topics ──────────────────────────────────────────────────────────

export const topicCrud = makeCrud(LearningTopic, 'Learning topic', {
  defaultSort: { order: 1, createdAt: 1 },
});

export const listTopics = asyncHandler(async (req, res) => {
  const filter = req.query.skillId ? { skillId: req.query.skillId } : {};
  const topics = await LearningTopic.find(filter).sort({ order: 1, createdAt: 1 });
  res.json(topics);
});

// PATCH /api/learning/topics/:id/toggle
export const toggleTopic = asyncHandler(async (req, res) => {
  const topic = await LearningTopic.findById(req.params.id);
  if (!topic) return res.status(404).json({ message: 'Topic not found' });
  topic.status = topic.status === 'done' ? 'todo' : 'done';
  topic.completedAt = topic.status === 'done' ? new Date() : null;
  await topic.save();
  res.json(topic);
});

// ── Skill development view (private) ────────────────────────────────
// GET /api/learning/skills — skills + level/target + learning hours + topics
export const skillDevelopment = asyncHandler(async (_req, res) => {
  const skills = await Skill.find({}).sort({ category: 1, order: 1 }).lean();
  const totals = await LearningSession.aggregate([
    { $group: { _id: '$skillId', minutes: { $sum: '$durationMinutes' }, sessions: { $sum: 1 } } },
  ]);
  const topics = await LearningTopic.find({}).lean();
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const weekly = await LearningSession.aggregate([
    { $match: { date: { $gte: dayKey(since) } } },
    { $group: { _id: '$skillId', minutes: { $sum: '$durationMinutes' } } },
  ]);
  const totalMap = Object.fromEntries(totals.map((t) => [String(t._id), t]));
  const weekMap = Object.fromEntries(weekly.map((t) => [String(t._id), t.minutes]));

  res.json(
    skills.map((s) => {
      const st = totalMap[String(s._id)] || { minutes: 0, sessions: 0 };
      const myTopics = topics.filter((t) => String(t.skillId) === String(s._id));
      return {
        ...s,
        learningMinutes: st.minutes,
        sessions: st.sessions,
        weeklyMinutes: weekMap[String(s._id)] || 0,
        completedTopics: myTopics.filter((t) => t.status === 'done').map((t) => t.title),
        remainingTopics: myTopics.filter((t) => t.status !== 'done').map((t) => t.title),
        topics: myTopics,
      };
    })
  );
});

// GET /api/learning/stats?from=&to=
export const learningStats = asyncHandler(async (req, res) => {
  const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 86400000);
  const to = req.query.to ? new Date(req.query.to) : new Date();
  const [byDay, bySkill, streak] = await Promise.all([
    learningByDay(from, to),
    learningBySkill(from, to),
    learningStreak(),
  ]);
  const totalMinutes = byDay.reduce((s, d) => s + d.minutes, 0);
  const skillDocs = await Skill.find({ _id: { $in: bySkill.map((s) => s.skillId) } }).select('name category');
  const nameMap = Object.fromEntries(skillDocs.map((s) => [String(s._id), s.name]));
  res.json({
    totalMinutes,
    streakDays: streak,
    byDay,
    bySkill: bySkill.map((s) => ({ ...s, skillName: nameMap[String(s.skillId)] || 'General' })),
  });
});


