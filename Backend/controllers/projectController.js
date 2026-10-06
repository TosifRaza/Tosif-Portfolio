import Project from '../models/Project.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireFields, oneOf } from '../middleware/validate.js';

const STATUSES = ['Active', 'Completed', 'Archived', 'In Progress'];
const CATEGORIES = ['professional', 'personal', 'learning', 'open-source'];
const PUBLISH = ['draft', 'published', 'archived'];
const ALLOWED = [
  'missionId', 'title', 'tagline', 'description', 'problem', 'solution', 'role',
  'caseStudy', 'image', 'images', 'stack', 'relatedSkills', 'category', 'status',
  'difficulty', 'githubUrl', 'liveUrl', 'featured', 'publishStatus', 'order',
];

function validate(body) {
  requireFields(body, ['missionId', 'title', 'description']);
  oneOf(body.status, STATUSES, 'status');
  oneOf(body.difficulty, ['Low', 'Medium', 'High', 'Extreme'], 'difficulty');
  oneOf(body.category, CATEGORIES, 'category');
  oneOf(body.publishStatus, PUBLISH, 'publishStatus');
}

// GET /api/projects          → published only (public)
// GET /api/projects?all=1    → everything (admin, auth required)
export const list = asyncHandler(async (req, res) => {
  const filter = req.user && req.query.all === '1' ? {} : { publishStatus: 'published' };
  const items = await Project.find(filter).sort({ order: 1, createdAt: 1 });
  res.json(items);
});

// GET /api/projects/:id
export const get = asyncHandler(async (req, res) => {
  const item = await Project.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Project not found' });
  if (item.publishStatus !== 'published' && !req.user) {
    return res.status(404).json({ message: 'Project not found' });
  }
  res.json(item);
});

// POST /api/projects  (admin)
export const create = asyncHandler(async (req, res) => {
  validate(req.body);
  const payload = {};
  for (const k of ALLOWED) if (req.body[k] !== undefined) payload[k] = req.body[k];
  const item = await Project.create(payload);
  res.status(201).json(item);
});

// PUT /api/projects/:id  (admin)
export const update = asyncHandler(async (req, res) => {
  validate(req.body);
  const payload = {};
  for (const k of ALLOWED) if (req.body[k] !== undefined) payload[k] = req.body[k];
  const item = await Project.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: 'Project not found' });
  res.json(item);
});

// DELETE /api/projects/:id  (admin)
export const remove = asyncHandler(async (req, res) => {
  const item = await Project.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Project not found' });
  res.json({ message: 'Deleted' });
});
