import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { askInsightController } from '../controllers/osController.js';

const router = Router();
router.use(protect);

router.post('/ask', askInsightController);

export default router;
