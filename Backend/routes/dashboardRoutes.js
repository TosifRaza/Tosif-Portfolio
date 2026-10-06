import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { dashboard } from '../controllers/osController.js';
import { askInsightController } from '../controllers/osController.js';

const router = Router();
router.use(protect);

router.get('/', dashboard);

export default router;
