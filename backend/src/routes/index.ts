import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminAuthRoutes from './admin-auth.routes.js';
import masterRoutes from './master.routes.js';
import adminMasterRoutes from './admin-master.routes.js';
import adminBackofficeRoutes from './admin-backoffice.routes.js';
import userRoutes from './user.routes.js';
import ujianEngineRoutes from './ujian-engine.routes.js';
import laporanSoalRoutes from './laporan-soal.routes.js';
import adminLaporanRoutes from './admin-laporan.routes.js';
import kontribusiSoalRoutes from './kontribusi-soal.routes.js';
import adminKontribusiRoutes from './admin-kontribusi.routes.js';
import leaderboardRoutes from './leaderboard.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin/auth', adminAuthRoutes);
router.use('/master', masterRoutes);
router.use('/admin/master', adminMasterRoutes);
router.use('/admin/backoffice', adminBackofficeRoutes);
router.use('/admin/backoffice/laporan-soal', adminLaporanRoutes);
router.use('/admin/backoffice/kontribusi-soal', adminKontribusiRoutes);
router.use('/user', userRoutes);
router.use('/ujian', ujianEngineRoutes);
router.use('/laporan-soal', laporanSoalRoutes);
router.use('/kontribusi-soal', kontribusiSoalRoutes);
router.use('/leaderboard', leaderboardRoutes);

export default router;
