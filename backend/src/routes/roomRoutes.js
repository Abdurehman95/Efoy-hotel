import express from 'express';
import {
  getRooms,
  getRoomByNumber,
  createRoom,
  updateRoom,
  updateCleanliness,
  deleteRoom,
} from '../controllers/roomController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getRooms);
router.get('/:roomNumber', optionalAuth, getRoomByNumber);
router.post('/', authenticate, authorize(['admin']), createRoom);
router.put('/:roomNumber', authenticate, authorize(['admin']), updateRoom);
router.patch('/:roomNumber/cleanliness', authenticate, authorize(['admin', 'receptionist', 'housekeeping']), updateCleanliness);
router.delete('/:roomNumber', authenticate, authorize(['admin']), deleteRoom);

export default router;
