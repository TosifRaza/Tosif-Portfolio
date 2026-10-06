import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { goalTrajectory, allTrajectories } from '../controllers/osController.js';

const router = Router();
router.use(protect);

router.get('/trajectory', allTrajectories);
router.get('/trajectory/:goalId', goalTrajectory);

export default router;
