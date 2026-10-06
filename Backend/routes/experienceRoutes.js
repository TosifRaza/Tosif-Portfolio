import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  experienceCrud, createExperience, updateExperience,
} from '../controllers/lifeController.js';

const router = Router();

// Public: published experience only
router.get('/', experienceCrud.list);

// Admin
router.get('/all', protect, adminOnly, (req, res, next) => { req.query.all = '1'; experienceCrud.list(req, res, next); });
router.post('/', protect, adminOnly, createExperience);
router.put('/:id', protect, adminOnly, updateExperience);
router.delete('/:id', protect, adminOnly, experienceCrud.remove);

export default router;
