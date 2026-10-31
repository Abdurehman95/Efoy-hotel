import rateLimit from 'express-rate-limit';

/**
 * Standard rate-limit error formatter returning HTTP 429 with descriptive JSON.
 */
const createRateLimitHandler = (customMessage, maxLimit, windowMs) => {
  return (req, res, next, options) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime
      ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : Math.ceil(windowMs / 1000);

    res.setHeader('Retry-After', retryAfter);

    return res.status(options.statusCode || 429).json({
      success: false,
      error: 'Too Many Requests',
      message: customMessage,
      limit: maxLimit,
      remaining: 0,
      retryAfter,
    });
  };
};

/**
 * Factory for creating configured rate limiters with RFC draft-7 headers and custom handling.
 */
export const createLimiter = ({
  windowMs = 15 * 60 * 1000,
  max,
  message,
  skip = () => false,
  keyGenerator,
}) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-7', // Sends RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
    legacyHeaders: true,        // Also sends X-RateLimit-* headers for legacy compatibility
    statusCode: 429,
    skip,
    keyGenerator: keyGenerator || undefined,
    handler: createRateLimitHandler(message, max, windowMs),
    message: {
      message,
    },
  });
};

/**
 * 1. General API Endpoints Limiter:
 * Maximum 100 requests per IP address every 15 minutes.
 * Does not block health checks or websocket traffic.
 */
export const generalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'General API request limit exceeded. Maximum 100 requests per IP address every 15 minutes. Please try again later.',
  skip: (req) => {
    // Health checks and internal monitoring bypass rate limiting
    return req.path === '/health' || req.path === '/api/health' || req.url === '/health';
  },
});

/**
 * 2. Login API Limiter:
 * Maximum 5 requests per IP address every 15 minutes.
 */
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts from this IP address. Maximum 5 requests per 15 minutes allowed. Please try again later.',
});

/**
 * 3. Registration API Limiter:
 * Maximum 5 requests per IP address every 15 minutes.
 */
export const registerLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many registration attempts from this IP address. Maximum 5 requests per 15 minutes allowed. Please try again later.',
});

/**
 * 4. Room Search and Availability APIs Limiter:
 * Maximum 30 requests per IP address every 15 minutes.
 */
export const roomSearchLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: 'Too many room search and availability requests from this IP address. Maximum 30 requests per 15 minutes allowed. Please try again later.',
});

export default {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  roomSearchLimiter,
  createLimiter,
};
