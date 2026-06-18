import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { connectDB, closeDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { protect } from './middleware/auth.js';

import User from './models/User.js';
import Project from './models/Project.js';
import Skill from './models/Skill.js';
import Timeline from './models/Timeline.js';
import Achievement from './models/Achievement.js';
import Resume from './models/Resume.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import githubRoutes from './routes/githubRoutes.js';
import aiRecruiterRoutes from './routes/aiRecruiterRoutes.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174';

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: [CLIENT_URL, ADMIN_URL, 'https://preview-*.space-z.ai'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static folder for uploaded resumes
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/ai-recruiter', aiRecruiterRoutes);

// ── Error handler (last) ────────────────────────────────────
app.use(errorHandler);

// ── Bootstrap: ensure an admin + seed data exist on first boot
async function ensureBootstrapData() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@founderos.dev';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    await User.create({
      name: 'Tosif Raza',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`[bootstrap] ✓ Admin user created: ${adminEmail} / ${adminPassword}`);
  }

  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    // Reuse the seed file's data by importing it as data
    const { default: seedData } = await import('./utils/seedData.js').catch(() => ({ default: null }));
    if (seedData) {
      await Project.insertMany(seedData.projects);
      await Skill.insertMany(seedData.skills);
      await Timeline.insertMany(seedData.timeline);
      await Achievement.insertMany(seedData.achievements);
      console.log('[bootstrap] ✓ Seed data inserted (projects, skills, timeline, achievements)');
    }
  }
}

// ── Start ────────────────────────────────────────────────────
const server = app.listen(PORT, async () => {
  console.log(`\n┌────────────────────────────────────────────┐`);
  console.log(`│  FOUNDER OS · Backend v4.0                 │`);
  console.log(`│  Listening on http://localhost:${PORT}        │`);
  console.log(`└────────────────────────────────────────────┘\n`);
  await connectDB();
  await ensureBootstrapData();
  console.log(`[server] ✓ Ready. Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n[server] ${signal} received, shutting down…`);
  server.close(async () => {
    await closeDB();
    process.exit(0);
  });
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
