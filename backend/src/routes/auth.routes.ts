import { Router } from 'express';
import { register, login, refreshToken, getMe, changePassword } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import { registerUserSchema, loginUserSchema, refreshTokenSchema, changePasswordSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authLimiter, validate(registerUserSchema), register);
router.post('/login', authLimiter, validate(loginUserSchema), login);
router.post('/refresh-token', authLimiter, validate(refreshTokenSchema), refreshToken);
router.get('/me', authenticateUser, getMe);
router.put('/change-password', authenticateUser, validate(changePasswordSchema), changePassword);

export default router;
