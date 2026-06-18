import { Router } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as c from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// Public
router.get('/', c.getActive);
router.get('/download', c.download);

// Admin
router.get('/all', protect, c.listAll);
router.post('/', protect, c.uploadResume);
router.delete('/:id', protect, c.remove);

export default router;
