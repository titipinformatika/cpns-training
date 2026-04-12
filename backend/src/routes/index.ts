import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminAuthRoutes from './admin-auth.routes.js';
import masterRoutes from './master.routes.js';
import adminMasterRoutes from './admin-master.routes.js';
import adminBackofficeRoutes from './admin-backoffice.routes.js';
import userRoutes from './user.routes.js';
import ujianEngineRoutes from './ujian-engine.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin/auth', adminAuthRoutes);
router.use('/master', masterRoutes);
router.use('/admin/master', adminMasterRoutes);
router.use('/admin/backoffice', adminBackofficeRoutes);
router.use('/user', userRoutes);
router.use('/ujian', ujianEngineRoutes);

export default router;
