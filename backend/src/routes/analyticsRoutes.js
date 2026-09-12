import express from 'express';
import { getOverviewAnalytics } from '../controllers/analyticsController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overview', optionalAuth, getOverviewAnalytics);

export default router;
