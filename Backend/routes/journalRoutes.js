import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { journalCrud, createJournal, updateJournal } from '../controllers/lifeController.js';

const router = Router();
router.use(protect);

router.get('/', journalCrud.list);
router.post('/', createJournal);
router.put('/:id', updateJournal);
router.delete('/:id', journalCrud.remove);

export default router;
