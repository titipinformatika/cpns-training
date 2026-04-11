import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminAuthRoutes from './admin-auth.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin/auth', adminAuthRoutes);

export default router;
