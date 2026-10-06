import Achievement from '../models/Achievement.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireFields, oneOf } from '../middleware/validate.js';

const ALLOWED = [
  'title', 'description', 'issuer', 'date', 'icon', 'color', 'image',
  'category', 'featured', 'relatedProjectId', 'relatedGoalId', 'visible', 'order',
];

function validate(body) {
  requireFields(body, ['title']);
  oneOf(body.category, ['professional', 'personal'], 'category');
}

// GET /api/achievements        → visible (public)
// GET /api/achievements?all=1  → all (admin)
export const list = asyncHandler(async (req, res) => {
  const filter = req.user && req.query.all === '1' ? {} : { visible: true };
  const items = await Achievement.find(filter).sort({ order: 1, createdAt: 1 });
  res.json(items);
});

export const get = asyncHandler(async (req, res) => {
  const item = await Achievement.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Achievement not found' });
  res.json(item);
});

export const create = asyncHandler(async (req, res) => {
  validate(req.body);
  const payload = {};
  for (const k of ALLOWED) if (req.body[k] !== undefined) payload[k] = req.body[k];
  const item = await Achievement.create(payload);
  res.status(201).json(item);
});

export const update = asyncHandler(async (req, res) => {
  validate(req.body);
  const payload = {};
  for (const k of ALLOWED) if (req.body[k] !== undefined) payload[k] = req.body[k];
  const item = await Achievement.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: 'Achievement not found' });
  res.json(item);
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Achievement.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Achievement not found' });
  res.json({ message: 'Deleted' });
});
