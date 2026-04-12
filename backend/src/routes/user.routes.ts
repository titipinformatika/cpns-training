import { Router } from 'express';
import { 
  getBiodata, 
  upsertBiodata, 
  getRiwayatUjian, 
  getRiwayatDetail, 
  getStatistikUser,
  getKontribusiSaya,
  getLaporanSaya
} from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { upsertBiodataSchema } from '../validators/user.validator.js';

const router = Router();

router.get('/biodata', authenticateUser, getBiodata);
router.put('/biodata', authenticateUser, validate(upsertBiodataSchema), upsertBiodata);

router.get('/riwayat-ujian', authenticateUser, getRiwayatUjian);
router.get('/riwayat-ujian/:id', authenticateUser, getRiwayatDetail);
router.get('/statistik', authenticateUser, getStatistikUser);
router.get('/kontribusi-soal', authenticateUser, getKontribusiSaya);
router.get('/laporan-soal', authenticateUser, getLaporanSaya);

export default router;
