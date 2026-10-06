import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import Timeline from '../models/Timeline.js';
import Achievement from '../models/Achievement.js';
import Profile from '../models/Profile.js';
import SiteConfig from '../models/SiteConfig.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * POST /api/ai-recruiter/ask
 * Body: { question: string }
 *
 * Rule-based assistant that answers recruiter questions using live DB data.
 * Identity, contact details and the "why hire" pitch come from the Profile /
 * SiteConfig singletons — admins edit them in the Control Center, not in code.
 * If AI_API_KEY/AI_BASE_URL are configured, the rule-based data answer is
 * optionally rewritten by an OpenAI-compatible model (data stays truthful).
 */
export const ask = asyncHandler(async (req, res) => {
  const q = (req.body?.question || '').toLowerCase().trim();
  if (!q) return res.status(400).json({ message: 'Question is required' });

  const profile = await Profile.getSingleton();
  const site = await SiteConfig.getSingleton();
  const first = (profile.name || 'Tosif').split(' ')[0];

  // ── "why hire" ────────────────────────────────────────────
  if (q.includes('why') && q.includes('hire')) {
    return res.json({
      intent: 'why_hire',
      reply: profile.pitch || `${profile.name} is a ${profile.title} who ships complete products end-to-end — from schema design and REST APIs to responsive React UI and deployment.`,
      bullets: [
        'Full-stack ownership across the MERN stack',
        'Production patterns: JWT auth, validated APIs, error middleware',
        'Founder mindset — ships, measures, iterates',
      ],
    });
  }

  // ── projects ──────────────────────────────────────────────
  if (q.includes('project') || q.includes('mission') || q.includes('work')) {
    const items = await Project.find({ publishStatus: 'published' }).sort({ order: 1 }).limit(6);
    return res.json({
      intent: 'projects',
      reply: `Here are ${items.length} published project${items.length === 1 ? '' : 's'} from ${first}'s portfolio.`,
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
    const items = await Skill.find({ visible: true }).sort({ order: 1 });
    const grouped = items.reduce((acc, s) => {
      (acc[s.category] ||= []).push({ name: s.name, level: s.level });
      return acc;
    }, {});
    return res.json({
      intent: 'skills',
      reply: `${first}'s current stack, grouped by category. Levels are self-assessed against real production use.`,
      skills: grouped,
    });
  }

  // ── experience / timeline ─────────────────────────────────
  if (q.includes('experience') || q.includes('timeline') || q.includes('journey') || q.includes('background')) {
    const items = await Timeline.find({ visible: true }).sort({ order: 1 });
    return res.json({
      intent: 'experience',
      reply: `Here's ${first}'s professional journey so far.`,
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
    const items = await Achievement.find({ visible: true }).sort({ order: 1 });
    return res.json({
      intent: 'achievements',
      reply: 'Here are the milestones worth surfacing:',
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
      reply: `You can reach ${profile.name} via the contact section of this site${profile.email ? `, or email ${profile.email}` : ''}.`,
      contact: {
        email: profile.email || '',
        linkedin: profile.socials?.linkedin || '',
        github: profile.socials?.github || '',
        availability: profile.availability || null,
      },
    });
  }

  // ── fallback ──────────────────────────────────────────────
  return res.json({
    intent: 'unknown',
    reply: site.ai?.publicIntro ||
      'I can help with: Why hire? • Projects • Skills • Experience • Achievements • Contact info.',
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
