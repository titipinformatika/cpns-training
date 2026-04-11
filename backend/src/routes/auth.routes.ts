import { Router } from 'express';
import { register, login, refreshToken, getMe } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { registerUserSchema, loginUserSchema, refreshTokenSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(registerUserSchema), register);
router.post('/login', validate(loginUserSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.get('/me', authenticateUser, getMe);

export default router;
