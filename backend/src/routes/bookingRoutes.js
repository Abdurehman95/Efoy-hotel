import express from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  checkInGuest,
  assignRoom,
  cancelBooking,
  markNoShow,
  getFolio,
  checkoutGuest,
  undoCheckout,
} from '../controllers/bookingController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getBookings);
router.get('/folio/:roomNumber', optionalAuth, getFolio);
router.get('/:id', optionalAuth, getBookingById);
router.post('/', optionalAuth, createBooking);
router.put('/:id', authenticate, authorize(['admin', 'receptionist']), updateBooking);
router.post('/:id/check-in', authenticate, authorize(['admin', 'receptionist']), checkInGuest);
router.patch('/:id/assign', authenticate, authorize(['admin', 'receptionist']), assignRoom);
router.patch('/:id/cancel', authenticate, authorize(['admin', 'receptionist', 'guest']), cancelBooking);
router.patch('/:id/no-show', authenticate, authorize(['admin', 'receptionist']), markNoShow);
router.post('/checkout/:roomNumber', authenticate, authorize(['admin', 'receptionist']), checkoutGuest);
router.post('/:id/undo-checkout', authenticate, authorize(['admin', 'receptionist']), undoCheckout);

export default router;

