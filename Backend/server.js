import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

import { connectDB, closeDB } from './config/db.js';
import { ensureUploadDir, uploadDir } from './config/uploads.js';
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
import { syncGitHubRepoSuggestions } from './services/githubRepoImportService.js';
import { migrateReferencedUploadImages } from './services/uploadMigrationService.js';
import { getUploadedImage } from './controllers/uploadedImageController.js';

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

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

function validateProductionEnv() {
  if (!isProduction) return;

  const required = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'CORS_ORIGINS', 'UPLOAD_DIR'];
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length) throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  if (Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
    throw new Error('JWT_SECRET must be at least 32 bytes in production');
  }
  if (process.env.ADMIN_PASSWORD.length < 12 || ['ChangeMe!2026', 'admin123'].includes(process.env.ADMIN_PASSWORD)) {
    throw new Error('ADMIN_PASSWORD must be a unique password of at least 12 characters');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.ADMIN_EMAIL)) {
    throw new Error('ADMIN_EMAIL must be a valid email address');
  }
  if (!path.isAbsolute(process.env.UPLOAD_DIR)) {
    throw new Error('UPLOAD_DIR must be an absolute path on persistent storage in production');
  }

  const origins = process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
  if (!origins.length) throw new Error('CORS_ORIGINS must contain at least one HTTPS origin');
  for (const origin of origins) {
    let parsed;
    try { parsed = new URL(origin); } catch { throw new Error(`Invalid CORS origin: ${origin}`); }
    if (parsed.protocol !== 'https:' || parsed.origin !== origin) {
      throw new Error(`CORS origin must be an exact HTTPS origin without a path: ${origin}`);
    }
  }
}

validateProductionEnv();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
  console.warn('[auth] JWT_SECRET not set; generated a temporary development secret for this boot');
}

const app = express();

// ── CORS: real whitelist (empty-string safe, wildcard-host support) ──
const allowedOrigins = (isProduction
  ? process.env.CORS_ORIGINS.split(',')
  : [process.env.CLIENT_URL || 'http://localhost:3000', process.env.ADMIN_URL || 'http://localhost:5174',
      'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'])
  .map((origin) => origin.trim()).filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl / same-origin via proxy
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      const error = new Error('Origin is not allowed by CORS');
      error.status = 403;
      cb(error);
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

// Static files stay disk-backed for resumes and legacy uploads; new images fall back to MongoDB below.
ensureUploadDir();
app.use('/uploads', express.static(uploadDir));
app.get('/uploads/:filename', getUploadedImage);

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({ status: databaseReady ? 'ok' : 'not-ready', database: databaseReady ? 'connected' : 'disconnected' });
});

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
  // Admin upsert — created whenever the configured ADMIN_EMAIL does not exist
  // yet (fixed: previously only ran when the users collection was completely
  // empty, which silently skipped the admin on non-empty databases).
  // An existing admin's password is NEVER overwritten (Settings changes win).
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const existing = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!existing) {
      await User.create({ name: 'Tosif Raza', email: adminEmail, password: adminPassword, role: 'admin' });
      console.log(`[bootstrap] Admin user created: ${adminEmail}`);
    } else if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`[bootstrap] Existing user ${adminEmail} promoted to admin`);
    } else {
      console.log(`[bootstrap] Admin user ready: ${adminEmail}`);
    }
  } else {
    console.log('[bootstrap] No ADMIN_EMAIL/ADMIN_PASSWORD configured; create the first user through /api/auth/register');
  }

  await ensureSiteConfigDefaults();

  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await seedContent({
      Project, Skill, Timeline, Achievement, LearningTopic,
      Profile, AboutContent, SiteConfig, Experience, Product, PlanSetting,
    });
    console.log('[bootstrap] ✓ Seed content inserted (profile, site, projects, skills, products, experience, timeline, achievements)');
  }
}

// v6.0: make sure newly-introduced sections/nav entries exist on databases
// seeded by earlier versions, without touching the admin's own edits.
async function ensureSiteConfigDefaults() {
  const { DEFAULT_SECTIONS, DEFAULT_NAV } = await import('./models/SiteConfig.js');
  const site = await SiteConfig.getSingleton();
  let changed = false;

  for (const section of DEFAULT_SECTIONS) {
    if (!site.sections.some((s) => s.key === section.key)) {
      site.sections.push({ ...section });
      changed = true;
    }
  }
  for (const item of DEFAULT_NAV) {
    if (!site.nav.some((n) => n.target === item.target && n.label === item.label)) {
      site.nav.push({ ...item, order: (site.nav.reduce((m, n) => Math.max(m, n.order || 0), 0) || 0) + 1 });
      changed = true;
    }
  }
  if (changed) {
    await site.save();
    console.log('[bootstrap] ✓ SiteConfig updated with new v6 sections/nav entries');
  }
}

// ── Start ────────────────────────────────────────────────────
let server;
let githubRepoSyncTimer;

async function start() {
  await connectDB();
  await ensureBootstrapData();
  const migratedImages = await migrateReferencedUploadImages();
  if (migratedImages) console.log(`[uploads] Migrated ${migratedImages} referenced image(s) into shared storage`);
  const runGitHubRepoSync = () => syncGitHubRepoSuggestions().catch((error) => {
    console.warn('[github-imports] Automatic check failed:', error.message);
  });
  void runGitHubRepoSync();
  githubRepoSyncTimer = setInterval(runGitHubRepoSync, 10 * 60 * 1000);
  githubRepoSyncTimer.unref?.();
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] TOSIF OS backend listening on port ${PORT}; uploads: ${uploadDir}`);
  });
}

start().catch(async (err) => {
  console.error('[server] Startup failed:', err.message);
  await closeDB().catch((closeError) => console.error('[server] Database cleanup failed:', closeError.message));
  process.exit(1);
});

const shutdown = async (signal) => {
  console.log(`[server] ${signal} received, shutting down`);
  if (githubRepoSyncTimer) clearInterval(githubRepoSyncTimer);
  const finish = async () => {
    await closeDB();
    process.exit(0);
  };
  if (server) server.close(finish);
  else await finish();
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
