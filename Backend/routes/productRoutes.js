import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  productCrud, createProduct, updateProduct,
} from '../controllers/lifeController.js';

const router = Router();

// Public: published products only
router.get('/', productCrud.list);

// Admin
router.get('/all', protect, adminOnly, (req, res, next) => { req.query.all = '1'; productCrud.list(req, res, next); });
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, productCrud.remove);

export default router;
