import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { habitCrud, toggleHabit } from '../controllers/lifeController.js';

const router = Router();
router.use(protect);

router.get('/', habitCrud.list);
router.post('/', habitCrud.create);
router.patch('/:id/toggle', toggleHabit);
router.put('/:id', habitCrud.update);
router.delete('/:id', habitCrud.remove);

export default router;
