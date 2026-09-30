import express from 'express';
import {
  getRequests,
  createRequest,
  updateRequestStatus,
} from '../controllers/serviceRequestController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getRequests);
router.post('/', optionalAuth, createRequest);
router.patch('/:id/status', authenticate, authorize(['admin', 'receptionist', 'housekeeping']), updateRequestStatus);

export default router;
