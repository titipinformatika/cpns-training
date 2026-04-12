import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter for all API requests.
 * Standard limit: 100 requests per minute.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    message: 'Terlalu banyak request. Coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication routes (login, register).
 * Limit: 15 requests per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login/registrasi. Coba lagi dalam 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
