import Skill from '../models/Skill.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const list = asyncHandler(async (_req, res) => {
  const items = await Skill.find().sort({ order: 1, createdAt: 1 });
  res.json(items);
});

export const get = asyncHandler(async (req, res) => {
  const item = await Skill.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Skill not found' });
  res.json(item);
});

export const create = asyncHandler(async (req, res) => {
  const item = await Skill.create(req.body);
  res.status(201).json(item);
});

export const update = asyncHandler(async (req, res) => {
  const item = await Skill.findByIdAndUpdate(req.params.id, req.body, {
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
