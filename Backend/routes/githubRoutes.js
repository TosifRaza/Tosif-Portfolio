import { Router } from 'express';
import { getContributions, getStats } from '../controllers/githubController.js';

const router = Router();
router.get('/contributions', getContributions);
router.get('/', getStats);

export default router;
