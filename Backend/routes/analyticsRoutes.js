import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  daily, weekly, monthly, yearly, planVsActualView, getPlan, updatePlan,
} from '../controllers/analyticsController.js';

const router = Router();
router.use(protect);

router.get('/daily', daily);
router.get('/weekly', weekly);
router.get('/monthly', monthly);
router.get('/yearly', yearly);
router.get('/plan-vs-actual', planVsActualView);
router.get('/plan', getPlan);
router.put('/plan/:category', updatePlan);

export default router;
