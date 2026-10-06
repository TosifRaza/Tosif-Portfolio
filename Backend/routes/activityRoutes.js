import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  listActivities, createActivity, updateActivity, activityCrud,
} from '../controllers/activityController.js';

const router = Router();
router.use(protect);

router.get('/', listActivities);
router.post('/', createActivity);
router.put('/:id', updateActivity);
router.delete('/:id', activityCrud.remove);

export default router;
