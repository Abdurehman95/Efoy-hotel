import express from 'express';
import {
  getRooms,
  getAvailableRooms,
  getRoomByNumber,
  createRoom,
  updateRoom,
  updateCleanliness,
  updateMaintenanceStatus,
  deleteRoom,
  getRoomCategories,
  createRoomCategory,
  updateRoomCategory,
  deleteRoomCategory,
} from '../controllers/roomController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { roomSearchLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Middleware to apply roomSearchLimiter if search or filter query parameters are present
const searchRateLimitMiddleware = (req, res, next) => {
  if (req.query.search || req.query.category || req.query.type || req.query.checkIn || req.query.checkOut || req.query.guests) {
    return roomSearchLimiter(req, res, next);
  }
  next();
};

router.get('/', searchRateLimitMiddleware, optionalAuth, getRooms);
// Room availability API: Maximum 30 requests per IP address every 15 minutes
router.get('/available', roomSearchLimiter, optionalAuth, getAvailableRooms);

// Room Categories (must precede /:roomNumber)
router.get('/categories', optionalAuth, getRoomCategories);
router.post('/categories', authenticate, authorize(['admin']), createRoomCategory);
router.put('/categories/:id', authenticate, authorize(['admin']), updateRoomCategory);
router.delete('/categories/:id', authenticate, authorize(['admin']), deleteRoomCategory);

router.get('/:roomNumber', optionalAuth, getRoomByNumber);
router.post('/', authenticate, authorize(['admin']), createRoom);
router.put('/:roomNumber', authenticate, authorize(['admin']), updateRoom);
router.patch('/:roomNumber/cleanliness', authenticate, authorize(['admin', 'receptionist', 'housekeeping']), updateCleanliness);
router.patch('/:roomNumber/maintenance', authenticate, authorize(['admin', 'receptionist', 'housekeeping']), updateMaintenanceStatus);
router.delete('/:roomNumber', authenticate, authorize(['admin']), deleteRoom);

export default router;

