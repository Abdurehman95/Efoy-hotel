import express from 'express';
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  toggleStock,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getMenu);
router.post('/', authenticate, authorize(['admin']), createMenuItem);
router.put('/:id', authenticate, authorize(['admin']), updateMenuItem);
router.patch('/:id/toggle-stock', authenticate, authorize(['admin', 'kitchen']), toggleStock);
router.delete('/:id', authenticate, authorize(['admin']), deleteMenuItem);

export default router;
