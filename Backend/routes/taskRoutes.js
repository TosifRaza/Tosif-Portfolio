import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { listTasks, createTask, updateTask, toggleTask, taskCrud } from '../controllers/goalController.js';

const router = Router();
router.use(protect);

router.get('/', listTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/complete', toggleTask);
router.delete('/:id', taskCrud.remove);

export default router;
