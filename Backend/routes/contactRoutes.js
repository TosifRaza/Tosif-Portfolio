import { Router } from 'express';
import * as c from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/', c.create);            // public
router.get('/', protect, c.list);      // admin
router.patch('/:id/read', protect, c.markRead); // admin
router.delete('/:id', protect, c.remove);       // admin

export default router;
