import Profile from '../models/Profile.js';
import AboutContent from '../models/AboutContent.js';
import SiteConfig, { DEFAULT_SECTIONS, DEFAULT_NAV } from '../models/SiteConfig.js';
import Project from '../models/Project.js';
import Product from '../models/Product.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Achievement from '../models/Achievement.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import UploadedImage from '../models/UploadedImage.js';
import multer from 'multer';

// ── Profile (singleton) ─────────────────────────────────────────────
// GET /api/profile — public
export const getProfile = asyncHandler(async (_req, res) => {
  res.json(await Profile.getSingleton());
});

// PUT /api/profile — admin
export const updateProfile = asyncHandler(async (req, res) => {
  const doc = await Profile.getSingleton();
  const allowed = ['name', 'title', 'roles', 'tagline', 'shortBio', 'longBio', 'avatarUrl', 'coverUrl', 'location', 'email', 'phone', 'availability', 'socials', 'pitch'];
  for (const key of allowed) if (req.body[key] !== undefined) doc[key] = req.body[key];
  await doc.save();
  res.json(doc);
});

// ── About (singleton) ───────────────────────────────────────────────
// GET /api/about — public
export const getAbout = asyncHandler(async (_req, res) => {
  const doc = await AboutContent.getSingleton();
  // Hide entirely when admin disabled it.
  if (!doc.visible) return res.json(null);
  res.json(doc);
});

// PUT /api/about — admin
export const updateAbout = asyncHandler(async (req, res) => {
  const doc = await AboutContent.getSingleton();
  const allowed = ['paragraphs', 'highlights', 'values', 'visible'];
  for (const key of allowed) if (req.body[key] !== undefined) doc[key] = req.body[key];
  await doc.save();
  res.json(doc);
});

// ── SiteConfig (singleton) ──────────────────────────────────────────
// GET /api/site — public: hero, nav, sections (enabled only for public nav),
// current mission, stats mode. No admin-only material.
export const getSite = asyncHandler(async (_req, res) => {
  const doc = await SiteConfig.getSingleton();
  res.json(doc);
});

// PUT /api/site — admin
export const updateSite = asyncHandler(async (req, res) => {
  const doc = await SiteConfig.getSingleton();
  const allowed = ['hero', 'currentMission', 'sections', 'nav', 'globalReach', 'statsMode', 'manualStats', 'footer', 'ai'];
  for (const key of allowed) if (req.body[key] !== undefined) doc[key] = req.body[key];
  if (doc.sections.length === 0) doc.sections = DEFAULT_SECTIONS;
  if (doc.nav.length === 0) doc.nav = DEFAULT_NAV;
  await doc.save();
  res.json(doc);
});

// ── Public stats — computed from real data, optionally overridden ────
// GET /api/stats
export const getStats = asyncHandler(async (_req, res) => {
  const [projects, products, skills, experience, achievements] = await Promise.all([
    Project.countDocuments({ publishStatus: 'published' }),
    Product.countDocuments({ publishStatus: 'published' }),
    Skill.countDocuments({ visible: true }),
    Experience.countDocuments({ publishStatus: 'published' }),
    Achievement.countDocuments({ visible: true }),
  ]);
  const auto = [
    { label: 'Projects', value: String(projects) },
    { label: 'Products', value: String(products) },
    { label: 'Technologies', value: String(skills) },
    { label: 'Roles', value: String(experience) },
    { label: 'Achievements', value: String(achievements) },
  ];
  const site = await SiteConfig.getSingleton();
  if (site.statsMode === 'manual') {
    return res.json({ mode: 'manual', stats: site.manualStats });
  }
  res.json({ mode: 'auto', stats: auto });
});

// ── Image upload (admin) — reuses the project's existing /uploads strategy ──
const IMAGE_MAX = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/avif': '.avif',
};
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMAGE_MAX },
  fileFilter: (_req, file, cb) => {
    if (IMAGE_EXTENSIONS[file.mimetype]) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
}).single('image');

export const uploadImage = [
  (req, res, next) => {
    if (!req.headers['content-type']?.startsWith('multipart/form-data')) {
      return res.status(400).json({ message: 'Send multipart/form-data with an "image" file field' });
    }
    imageUpload(req, res, (error) => error ? res.status(400).json({ message: error.message }) : next());
  },
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e6)}${IMAGE_EXTENSIONS[req.file.mimetype]}`;
    await UploadedImage.create({
      filename,
      contentType: req.file.mimetype,
      data: req.file.buffer,
      size: req.file.size,
    });
    res.status(201).json({ url: `/uploads/${filename}`, fileName: req.file.originalname });
  }),
];

// 404 fallback helper used by server.js for unknown /api routes
export function apiNotFound(req, res) {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
}
