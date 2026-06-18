import Project from '../models/Project.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// GET /api/projects
export const list = asyncHandler(async (req, res) => {
  const items = await Project.find().sort({ order: 1, createdAt: 1 });
  res.json(items);
});

// GET /api/projects/:id
export const get = asyncHandler(async (req, res) => {
  const item = await Project.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Project not found' });
  res.json(item);
});

// POST /api/projects  (admin)
export const create = asyncHandler(async (req, res) => {
  const item = await Project.create(req.body);
  res.status(201).json(item);
});

// PUT /api/projects/:id  (admin)
export const update = asyncHandler(async (req, res) => {
  const item = await Project.findByIdAndUpdate(req.params.id, req.body, {
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
