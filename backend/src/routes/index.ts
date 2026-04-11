import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminAuthRoutes from './admin-auth.routes.js';
import masterRoutes from './master.routes.js';
import adminMasterRoutes from './admin-master.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin/auth', adminAuthRoutes);
router.use('/master', masterRoutes);
router.use('/admin/master', adminMasterRoutes);
router.use('/user', userRoutes);

export default router;
