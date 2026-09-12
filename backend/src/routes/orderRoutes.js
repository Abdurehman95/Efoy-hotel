import express from 'express';
import {
  getOrders,
  createOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getOrders);
router.post('/', optionalAuth, createOrder);
router.patch('/:id/status', authenticate, authorize(['admin', 'kitchen']), updateOrderStatus);

export default router;
