import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  goalCrud, createGoal, updateGoal, getGoalDetail, recalcGoal,
} from '../controllers/goalController.js';

const router = Router();
router.use(protect);

router.get('/', goalCrud.list);
router.get('/:id', getGoalDetail);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.patch('/:id/progress', recalcGoal);
router.delete('/:id', goalCrud.remove);

export default router;
