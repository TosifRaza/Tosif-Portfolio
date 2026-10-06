import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { connectDB, closeDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// ── Models needed by the bootstrap seeder ───────────────────
import User from './models/User.js';
import Project from './models/Project.js';
import Skill from './models/Skill.js';
import Timeline from './models/Timeline.js';
import Achievement from './models/Achievement.js';
import LearningTopic from './models/LearningTopic.js';
import Profile from './models/Profile.js';
import AboutContent from './models/AboutContent.js';
import SiteConfig from './models/SiteConfig.js';
import Experience from './models/Experience.js';
import Product from './models/Product.js';
import PlanSetting from './models/PlanSetting.js';
import { seedContent } from './utils/seedData.js';

// ── Routes ──────────────────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import githubRoutes from './routes/githubRoutes.js';
import aiRecruiterRoutes from './routes/aiRecruiterRoutes.js';

import goalRoutes from './routes/goalRoutes.js';
import milestoneRoutes from './routes/milestoneRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import timeRoutes from './routes/timeRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import planRoutes from './routes/analyticsRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import productRoutes from './routes/productRoutes.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174';

// JWT secret policy:
//  - production: JWT_SECRET is REQUIRED (fail fast, no unsafe defaults)
//  - development: a random secret is generated per boot so the project runs
//    out of the box; sessions reset on restart until you set one in .env
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('\n[x] JWT_SECRET is not set. Add it to Backend/.env (see .env.example). Refusing to start.\n');
    process.exit(1);
  }
  process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
  console.warn('[auth] ⚠ JWT_SECRET not set — generated a temporary one for this boot (set it in Backend/.env for persistent sessions)');
}

const app = express();

// ── CORS: real whitelist (empty-string safe, wildcard-host support) ──
const allowedOrigins = [CLIENT_URL, ADMIN_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174']
  .filter(Boolean);
const allowedPatterns = [/\.space-z\.ai$/, /\.vercel\.app$/];

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl / same-origin via proxy
      if (allowedOrigins.includes(origin) || allowedPatterns.some((re) => re.test(origin))) {
        return cb(null, true);
      }
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ── Rate limiting (light global + strict on sensitive endpoints) ──
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: 'draft-7', legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false });

app.use(apiLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));

// Static folder for uploaded files (resumes, images)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// ── Routes ──────────────────────────────────────────────────
// Public website + shared content (absolute-path routers mounted at root)
const authLimiterOn = authLimiter;
app.use('/api/auth', authLimiterOn, authRoutes);
app.use(contentRoutes); // /api/profile /api/about /api/site /api/stats /api/upload
app.use('/api/experience', experienceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/ai-recruiter', aiRecruiterRoutes);

// Private OS (all require auth via router-level protect)
app.use('/api/goals', goalRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/time', timeRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/analytics', planRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/journal', journalRoutes);

// ── 404 + error handling ────────────────────────────────────
app.use('/api', (req, res) => res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` }));
app.use(errorHandler);

// ── Bootstrap: ensure an admin + seed content exist on first boot ──
async function ensureBootstrapData() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tosifos.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe!2026';
    await User.create({ name: 'Tosif Raza', email: adminEmail, password: adminPassword, role: 'admin' });
    console.log(`[bootstrap] ✓ Admin user created: ${adminEmail} — change this password after first login`);
  }

  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await seedContent({
      Project, Skill, Timeline, Achievement, LearningTopic,
      Profile, AboutContent, SiteConfig, Experience, Product, PlanSetting,
    });
    console.log('[bootstrap] ✓ Seed content inserted (profile, site, projects, skills, products, experience, timeline, achievements)');
  }
}

// ── Start ────────────────────────────────────────────────────
const server = app.listen(PORT, async () => {
  console.log(`\n┌────────────────────────────────────────────┐`);
  console.log(`│  TOSIF OS · Backend v5.0                   │`);
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
