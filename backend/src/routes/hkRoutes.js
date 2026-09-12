import express from 'express';
import { getHistory, certifyClean } from '../controllers/hkController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/history', optionalAuth, getHistory);
router.post('/clean', authenticate, authorize(['admin', 'housekeeping', 'receptionist']), certifyClean);

export default router;
