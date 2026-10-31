import express from 'express';
import { login, register, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Login API: Maximum 5 requests per IP every 15 minutes
router.post('/login', loginLimiter, login);

// Registration API: Maximum 5 requests per IP every 15 minutes
router.post('/register', registerLimiter, register);

router.get('/me', authenticate, getMe);

export default router;
