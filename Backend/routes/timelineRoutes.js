import { Router } from 'express';
import * as c from '../controllers/timelineController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', protect, adminOnly, c.create);
router.put('/:id', protect, adminOnly, c.update);
router.delete('/:id', protect, adminOnly, c.remove);

export default router;
