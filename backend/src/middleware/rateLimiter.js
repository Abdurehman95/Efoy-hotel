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

const isDev = process.env.NODE_ENV !== 'production';

/**
 * 1. General API Endpoints Limiter:
 * In production: 100 requests per IP per 15 minutes.
 * In development: bypassed so local testing and fast refresh are never locked out.
 */
export const generalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 100,
  message: 'General API request limit exceeded. Maximum 100 requests per IP address every 15 minutes. Please try again later.',
  skip: (req) => {
    if (isDev) return true;
    return req.path === '/health' || req.path === '/api/health' || req.url === '/health';
  },
});

/**
 * 2. Login API Limiter:
 * Maximum 5 requests per IP address every 15 minutes in production.
 */
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 5,
  skip: () => isDev,
  message: 'Too many login attempts from this IP address. Maximum 5 requests per 15 minutes allowed. Please try again later.',
});

/**
 * 3. Registration API Limiter:
 * Maximum 5 requests per IP address every 15 minutes in production.
 */
export const registerLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 5,
  skip: () => isDev,
  message: 'Too many registration attempts from this IP address. Maximum 5 requests per 15 minutes allowed. Please try again later.',
});

/**
 * 4. Room Search and Availability APIs Limiter:
 * Maximum 30 requests per IP address every 15 minutes in production.
 */
export const roomSearchLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 30,
  skip: () => isDev,
  message: 'Too many room search and availability requests from this IP address. Maximum 30 requests per 15 minutes allowed. Please try again later.',
});

/**
 * 5. Booking Creation Limiter:
 * Maximum 20 booking requests per IP address every 15 minutes in production.
 */
export const bookingLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 20,
  skip: () => isDev,
  message: 'Too many booking requests from this IP address. Please try again later.',
});

/**
 * 6. Payment Initialization Limiter:
 * Maximum 15 payment initialization requests per IP address every 15 minutes in production.
 */
export const paymentLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 15,
  skip: () => isDev,
  message: 'Too many payment requests from this IP address. Please wait a few moments before trying again.',
});

export default {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  roomSearchLimiter,
  bookingLimiter,
  paymentLimiter,
  createLimiter,
};
