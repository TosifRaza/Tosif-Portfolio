import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getProfile, updateProfile, getAbout, updateAbout, getSite, updateSite, getStats, uploadImage,
} from '../controllers/contentController.js';

// Absolute paths — mounted with app.use(router) so the public API follows
// the conventions: /api/profile /api/about /api/site /api/stats /api/upload
const router = Router();

// Public (singletons carry only public information)
router.get('/api/profile', getProfile);
router.get('/api/about', getAbout);
router.get('/api/site', getSite);
router.get('/api/stats', getStats);

// Admin
router.put('/api/profile', protect, adminOnly, updateProfile);
router.put('/api/about', protect, adminOnly, updateAbout);
router.put('/api/site', protect, adminOnly, updateSite);
router.post('/api/upload', protect, adminOnly, ...uploadImage);

export default router;
