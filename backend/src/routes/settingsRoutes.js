import express from 'express';
import { getSettings, updateSettings, resetDemoData } from '../controllers/settingsController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getSettings);
router.put('/', authenticate, authorize(['admin']), updateSettings);
router.post('/reset-demo', authenticate, authorize(['admin']), resetDemoData);

export default router;
