import { Router } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as c from '../controllers/resumeController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// Public
router.get('/', c.getActive);
router.get('/download', c.download);

// Admin
router.get('/all', protect, adminOnly, c.listAll);
router.post('/', protect, adminOnly, c.uploadResume);
router.delete('/:id', protect, adminOnly, c.remove);

export default router;
