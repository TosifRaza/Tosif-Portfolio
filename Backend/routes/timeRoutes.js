import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  listTimeEntries, createTimeEntry, updateTimeEntry, timeCrud,
  startTimer, stopTimer, runningTimer, timeSummary,
} from '../controllers/timeController.js';

const router = Router();
router.use(protect);

router.get('/', listTimeEntries);
router.get('/running', runningTimer);
router.get('/summary', timeSummary);
router.post('/', createTimeEntry);
router.post('/start', startTimer);
router.post('/stop/:id', stopTimer);
router.put('/:id', updateTimeEntry);
router.delete('/:id', timeCrud.remove);

export default router;
