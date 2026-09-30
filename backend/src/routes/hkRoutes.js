import express from 'express';
import {
  getTasks,
  createTask,
  updateTaskStatus,
  getHistory,
  certifyClean,
} from '../controllers/hkController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/tasks', optionalAuth, getTasks);
router.post('/tasks', authenticate, authorize(['admin', 'housekeeping', 'receptionist']), createTask);
router.patch('/tasks/:id/status', authenticate, authorize(['admin', 'housekeeping', 'receptionist']), updateTaskStatus);

router.get('/history', optionalAuth, getHistory);
router.post('/clean', authenticate, authorize(['admin', 'housekeeping', 'receptionist']), certifyClean);

export default router;
