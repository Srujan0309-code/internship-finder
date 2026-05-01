const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

/**
 * Strict limiter for auth routes (register, login)
 * 10 requests per 15 minutes per IP
 */
const authLimiter = createLimiter(
  15 * 60 * 1000,
  Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  'Too many authentication attempts. Please try again after 15 minutes.'
);

/**
 * Moderate limiter for AI endpoints (expensive operations)
 * 20 requests per hour per IP
 */
const aiLimiter = createLimiter(
  60 * 60 * 1000,
  20,
  'AI rate limit exceeded. Please try again after an hour.'
);

/**
 * General API limiter (already applied globally, kept for selective use)
 */
const generalLimiter = createLimiter(
  Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  Number(process.env.RATE_LIMIT_MAX) || 100,
  'Too many requests, please try again later.'
);

module.exports = { authLimiter, aiLimiter, generalLimiter };
