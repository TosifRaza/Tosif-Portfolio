import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

function issueToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await user.matchPassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = issueToken(user._id);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me  (protected)
export const me = asyncHandler(async (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
  });
});

// PATCH /api/auth/change-password  (protected)
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'Current and new password are required' });
  if (String(newPassword).length < 8)
    return res.status(400).json({ message: 'New password must be at least 8 characters' });

  const user = await User.findById(req.user._id).select('+password');
  const ok = await user.matchPassword(currentPassword);
  if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

  user.password = newPassword; // hashed by the pre-save hook
  await user.save();
  res.json({ message: 'Password updated' });
});

// POST /api/auth/register  (open only if no users exist yet — bootstrap)
export const register = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production')
    return res.status(403).json({ message: 'Registration is disabled in production' });

  const count = await User.countDocuments();
  if (count > 0)
    return res.status(403).json({ message: 'Registration is closed. Use the admin portal.' });

  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  const user = await User.create({ name, email, password, role: 'admin' });
  const token = issueToken(user._id);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});
