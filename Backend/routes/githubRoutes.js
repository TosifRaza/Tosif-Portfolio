import { Router } from 'express';
import { getStats } from '../controllers/githubController.js';

const router = Router();
router.get('/', getStats);

export default router;
