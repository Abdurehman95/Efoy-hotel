import express from 'express';
import {
  getTickets,
  createTicket,
  updateTicket,
} from '../controllers/maintenanceController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getTickets);
router.post('/', authenticate, authorize(['admin', 'receptionist', 'housekeeping']), createTicket);
router.patch('/:id', authenticate, authorize(['admin', 'receptionist', 'housekeeping']), updateTicket);

export default router;
