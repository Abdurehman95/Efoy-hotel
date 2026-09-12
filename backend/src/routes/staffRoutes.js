import express from 'express';
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getStaff);
router.post('/', authenticate, authorize(['admin']), createStaff);
router.put('/:id', authenticate, authorize(['admin']), updateStaff);
router.delete('/:id', authenticate, authorize(['admin']), deleteStaff);

export default router;
