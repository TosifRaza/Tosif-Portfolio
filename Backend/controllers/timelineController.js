import Timeline from '../models/Timeline.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireFields, oneOf } from '../middleware/validate.js';

const PHASES = ['learning', 'student', 'developer', 'builder', 'founder'];
const CATEGORIES = ['career', 'learning', 'product', 'achievement', 'project', 'personal'];
const ALLOWED = [
  'title', 'description', 'year', 'date', 'phase', 'category',
  'image', 'relatedProjectId', 'visible', 'icon', 'order',
];

function validate(body) {
  requireFields(body, ['title', 'year', 'phase']);
  oneOf(body.phase, PHASES, 'phase');
  oneOf(body.category, CATEGORIES, 'category');
}

// GET /api/timeline        → visible events (public)
// GET /api/timeline?all=1  → all (admin)
export const list = asyncHandler(async (req, res) => {
  const filter = req.user && req.query.all === '1' ? {} : { visible: true };
  const items = await Timeline.find(filter).sort({ order: 1, createdAt: 1 });
  res.json(items);
});

export const get = asyncHandler(async (req, res) => {
  const item = await Timeline.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Timeline entry not found' });
  res.json(item);
});

export const create = asyncHandler(async (req, res) => {
  validate(req.body);
  const payload = {};
  for (const k of ALLOWED) if (req.body[k] !== undefined) payload[k] = req.body[k];
  const item = await Timeline.create(payload);
  res.status(201).json(item);
});

export const update = asyncHandler(async (req, res) => {
  validate(req.body);
  const payload = {};
  for (const k of ALLOWED) if (req.body[k] !== undefined) payload[k] = req.body[k];
  const item = await Timeline.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: 'Timeline entry not found' });
  res.json(item);
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Timeline.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Timeline entry not found' });
  res.json({ message: 'Deleted' });
});
