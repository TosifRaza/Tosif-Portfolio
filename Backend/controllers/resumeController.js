import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import Resume from '../models/Resume.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `resume-${Date.now()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword'];
    if (allowed.includes(file.mimetype) || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or DOC(X) files are allowed'));
    }
  },
});

// GET /api/resume  (public) — returns the active resume
export const getActive = asyncHandler(async (_req, res) => {
  const item = await Resume.findOne({ isActive: true }).sort({ createdAt: -1 });
  res.json(item || null);
});

// GET /api/resume/download  (public)
export const download = asyncHandler(async (req, res) => {
  const item = await Resume.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!item) return res.status(404).json({ message: 'No resume uploaded' });
  const abs = path.join(uploadDir, path.basename(item.fileUrl));
  if (!fs.existsSync(abs)) return res.status(404).json({ message: 'File missing on disk' });
  res.download(abs, item.fileName);
});

// POST /api/resume  (admin, multipart/form-data)
export const uploadResume = [
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // Mark previous resumes inactive
    await Resume.updateMany({}, { $set: { isActive: false } });
    const item = await Resume.create({
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      version: req.body.version || 'v1.0',
      isActive: true,
    });
    res.status(201).json(item);
  }),
];

// GET /api/resume/all  (admin)
export const listAll = asyncHandler(async (_req, res) => {
  const items = await Resume.find().sort({ createdAt: -1 });
  res.json(items);
});

// DELETE /api/resume/:id  (admin)
export const remove = asyncHandler(async (req, res) => {
  const item = await Resume.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Resume not found' });
  const abs = path.join(uploadDir, path.basename(item.fileUrl));
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
  res.json({ message: 'Deleted' });
});
