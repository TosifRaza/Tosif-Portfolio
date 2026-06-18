import Contact from '../models/Contact.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// POST /api/contact  (public)
export const create = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ message: 'Name, email, and message are required' });

  const item = await Contact.create({
    name,
    email,
    subject,
    message,
    ipAddress: req.ip,
  });
  res.status(201).json({ message: 'Message received', id: item._id });
});

// GET /api/contact  (admin)
export const list = asyncHandler(async (_req, res) => {
  const items = await Contact.find().sort({ createdAt: -1 });
  res.json(items);
});

// PATCH /api/contact/:id/read  (admin)
export const markRead = asyncHandler(async (req, res) => {
  const item = await Contact.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );
  if (!item) return res.status(404).json({ message: 'Message not found' });
  res.json(item);
});

// DELETE /api/contact/:id  (admin)
export const remove = asyncHandler(async (req, res) => {
  const item = await Contact.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Message not found' });
  res.json({ message: 'Deleted' });
});
