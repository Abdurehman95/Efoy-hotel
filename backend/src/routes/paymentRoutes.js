import express from 'express';
import {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getPaymentStatus,
  reconcilePayment,
  processRefund,
} from '../controllers/paymentController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// 1. Initialize checkout (Rate limited to 15 req / 15 min per IP)
router.post('/initialize', paymentLimiter, optionalAuth, initializePayment);

// 2. Verify payment directly with Chapa
router.get('/verify/:txRef', optionalAuth, verifyPayment);
router.post('/verify/:txRef', optionalAuth, verifyPayment);

// 3. Chapa Asynchronous Webhook Notification Endpoint
router.post('/chapa/webhook', handleWebhook);

// 4. View Payment Status (RBAC protected: guest can only view their own payment)
router.get('/:id', optionalAuth, getPaymentStatus);

// 5. Reconcile Payment (Staff / Admin Protected)
router.post('/:id/reconcile', authenticate, authorize(['admin', 'manager', 'receptionist']), reconcilePayment);

// 6. Authorized Refund (Admin Protected & Audited)
router.post('/:id/refund', authenticate, authorize(['admin']), processRefund);

export default router;
