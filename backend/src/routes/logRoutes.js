import express from 'express';
import { getLogs, createLog } from '../controllers/logController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getLogs);
router.post('/', authenticate, createLog);

export default router;
