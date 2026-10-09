import { Router } from 'express';
import { getContributions, getStats } from '../controllers/githubController.js';
import * as imports from '../controllers/githubImportController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
router.get('/contributions', getContributions);
router.get('/imports/count', protect, adminOnly, imports.pendingCount);
router.get('/imports', protect, adminOnly, imports.listSuggestions);
router.post('/imports/sync', protect, adminOnly, imports.syncNow);
router.post('/imports/:id/approve', protect, adminOnly, imports.approveSuggestion);
router.post('/imports/:id/dismiss', protect, adminOnly, imports.dismissSuggestion);
router.get('/', getStats);

export default router;
