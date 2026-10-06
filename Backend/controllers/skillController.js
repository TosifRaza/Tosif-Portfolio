import Skill from '../models/Skill.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireFields, oneOf, isNumberInRange } from '../middleware/validate.js';

const CATEGORIES = ['Frontend', 'Backend', 'Tools', 'Database', 'DevOps', 'Soft'];
const ALLOWED = ['name', 'category', 'level', 'targetLevel', 'description', 'icon', 'visible', 'order'];

function validate(body) {
  requireFields(body, ['name', 'category']);
  oneOf(body.category, CATEGORIES, 'category');
  isNumberInRange(body.level, 0, 100, 'level');
  isNumberInRange(body.targetLevel, 0, 100, 'targetLevel');
}

// GET /api/skills        → visible skills (public)
// GET /api/skills?all=1  → all skills (admin)
export const list = asyncHandler(async (req, res) => {
  const filter = req.user && req.query.all === '1' ? {} : { visible: true };
  const items = await Skill.find(filter).sort({ category: 1, order: 1, createdAt: 1 });
  res.json(items);
});

export const get = asyncHandler(async (req, res) => {
  const item = await Skill.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Skill not found' });
  res.json(item);
});

export const create = asyncHandler(async (req, res) => {
  validate(req.body);
  const payload = {};
  for (const k of ALLOWED) if (req.body[k] !== undefined) payload[k] = req.body[k];
  const item = await Skill.create(payload);
  res.status(201).json(item);
});

export const update = asyncHandler(async (req, res) => {
  validate(req.body);
  const payload = {};
  for (const k of ALLOWED) if (req.body[k] !== undefined) payload[k] = req.body[k];
  const item = await Skill.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: 'Skill not found' });
  res.json(item);
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Skill.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Skill not found' });
  res.json({ message: 'Deleted' });
});
