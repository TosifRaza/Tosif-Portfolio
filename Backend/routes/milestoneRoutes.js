import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  createMilestone, updateMilestone, listMilestones, milestoneCrud,
} from '../controllers/goalController.js';

const router = Router();
router.use(protect);

router.get('/', listMilestones);
router.post('/', createMilestone);
router.put('/:id', updateMilestone);
router.delete('/:id', milestoneCrud.remove);

export default router;
