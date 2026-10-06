import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  listSessions, createSession, updateSession, sessionCrud,
  listTopics, topicCrud, toggleTopic, skillDevelopment, learningStats,
} from '../controllers/learningController.js';

const router = Router();
router.use(protect);

router.get('/', listSessions);
router.get('/skills', skillDevelopment);
router.get('/stats', learningStats);
router.get('/topics', listTopics);
router.post('/', createSession);
router.put('/:id', updateSession);
router.delete('/:id', sessionCrud.remove);

// Topics CRUD (mount last so /topics doesn't collide with /:id)
router.post('/topics', topicCrud.create);
router.put('/topics/:id', topicCrud.update);
router.patch('/topics/:id/toggle', toggleTopic);
router.delete('/topics/:id', topicCrud.remove);

export default router;
