import { Router } from 'express';
import { loginAdmin, refreshAdminToken, getAdminMe } from '../controllers/admin-auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateAdmin } from '../middlewares/auth.middleware.js';
import { loginAdminSchema, refreshTokenSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', validate(loginAdminSchema), loginAdmin);
router.post('/refresh-token', validate(refreshTokenSchema), refreshAdminToken);
router.get('/me', authenticateAdmin, getAdminMe);

export default router;
