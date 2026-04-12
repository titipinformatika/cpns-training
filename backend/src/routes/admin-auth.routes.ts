import { Router } from 'express';
import { loginAdmin, refreshAdminToken, getAdminMe } from '../controllers/admin-auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateAdmin } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import { loginAdminSchema, refreshTokenSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', authLimiter, validate(loginAdminSchema), loginAdmin);
router.post('/refresh-token', authLimiter, validate(refreshTokenSchema), refreshAdminToken);
router.get('/me', authenticateAdmin, getAdminMe);

export default router;
