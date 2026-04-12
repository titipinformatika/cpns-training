import { Router } from 'express';
import * as laporanController from '../controllers/laporan-soal.controller.js';
import * as sosialValidator from '../validators/sosial.validator.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadLaporan } from '../utils/upload.js';

const router = Router();

/**
 * @route   POST /api/laporan-soal
 * @desc    Kirim laporan soal
 * @access  Private (User)
 */
router.post(
  '/',
  authenticateUser,
  uploadLaporan.single('bukti_screenshot'),
  validate(sosialValidator.kirimLaporanSchema),
  laporanController.kirimLaporan
);

export default router;
