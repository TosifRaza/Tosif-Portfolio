import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import Timeline from '../models/Timeline.js';
import Achievement from '../models/Achievement.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * POST /api/ai-recruiter/ask
 * Body: { question: string }
 *
 * Rule-based assistant that answers recruiter questions using real DB data.
 * Returns a friendly, recruiter-facing response.
 */
export const ask = asyncHandler(async (req, res) => {
  const q = (req.body?.question || '').toLowerCase().trim();

  if (!q) return res.status(400).json({ message: 'Question is required' });

  // ── "why hire" ────────────────────────────────────────────
  if (q.includes('why') && q.includes('hire')) {
    return res.json({
      intent: 'why_hire',
      reply:
        "Tosif is a MERN stack developer who ships complete products — not just components. He owns the full lifecycle: schema design, REST APIs, JWT auth, responsive React UI, deployment. He's built marketplaces, dashboards, and auth toolkits that real people use. Most importantly, he thinks like a founder: he optimises for impact, not for lines of code. Hire him if you need someone who can take a vague idea and turn it into a shipped product.",
      bullets: [
        'Full-stack ownership (MongoDB → Express → React → Node)',
        'Production patterns: JWT auth, multer uploads, error middleware',
        'Founder mindset — ships, measures, iterates',
      ],
    });
  }

  // ── projects ──────────────────────────────────────────────
  if (q.includes('project') || q.includes('mission') || q.includes('work')) {
    const items = await Project.find().sort({ order: 1 }).limit(6);
    return res.json({
      intent: 'projects',
      reply: `Here are ${items.length} live missions from Tosif's portfolio. Each one is a complete MERN product — click "Launch Mission" to see the code and the live demo.`,
      projects: items.map((p) => ({
        missionId: p.missionId,
        title: p.title,
        tagline: p.tagline,
        status: p.status,
        stack: p.stack,
        difficulty: p.difficulty,
        githubUrl: p.githubUrl,
        liveUrl: p.liveUrl,
      })),
    });
  }

  // ── skills ────────────────────────────────────────────────
  if (q.includes('skill') || q.includes('stack') || q.includes('tech')) {
    const items = await Skill.find().sort({ order: 1 });
    const grouped = items.reduce((acc, s) => {
      (acc[s.category] ||= []).push({ name: s.name, level: s.level });
      return acc;
    }, {});
    return res.json({
      intent: 'skills',
      reply:
        "Tosif's stack is MERN-native. Here's the breakdown by category. Levels are self-assessed against years of production use.",
      skills: grouped,
    });
  }

  // ── experience / timeline ─────────────────────────────────
  if (q.includes('experience') || q.includes('timeline') || q.includes('journey') || q.includes('background')) {
    const items = await Timeline.find().sort({ order: 1 });
    return res.json({
      intent: 'experience',
      reply: "Here's the journey — from learning to program to becoming a product builder and future founder.",
      timeline: items.map((t) => ({
        title: t.title,
        year: t.year,
        phase: t.phase,
        description: t.description,
      })),
    });
  }

  // ── achievements ──────────────────────────────────────────
  if (q.includes('achievement') || q.includes('award') || q.includes('accomplish')) {
    const items = await Achievement.find().sort({ order: 1 });
    return res.json({
      intent: 'achievements',
      reply: "Here are some milestones worth surfacing:",
      achievements: items.map((a) => ({
        title: a.title,
        description: a.description,
        issuer: a.issuer,
        date: a.date,
      })),
    });
  }

  // ── contact / hire / reach ────────────────────────────────
  if (q.includes('contact') || q.includes('hire') || q.includes('reach') || q.includes('email')) {
    return res.json({
      intent: 'contact',
      reply:
        'You can reach Tosif directly via the Contact Dock at the bottom of the portfolio, or email tosif@founderos.dev. Typical response time: under 24 hours.',
      contact: { email: 'tosif@founderos.dev', linkedin: 'linkedin.com/in/tosifraza', github: 'github.com/tosifraza' },
    });
  }

  // ── fallback ──────────────────────────────────────────────
  return res.json({
    intent: 'unknown',
    reply:
      "I can help with: Why hire Tosif? • Show projects • Show skills • Show experience • Show achievements • Contact info. Try asking one of those.",
    suggestions: [
      'Why hire Tosif?',
      'Show projects',
      'Show skills',
      'Show experience',
      'Show achievements',
      'Contact info',
    ],
  });
});
