import { Router } from 'express';
import * as laporanController from '../controllers/laporan-soal.controller.js';
import * as sosialValidator from '../validators/sosial.validator.js';
import { authenticateAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

/**
 * @route   GET /api/admin/backoffice/laporan-soal
 * @desc    Get daftar laporan soal
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticateAdmin,
  laporanController.getLaporanAdmin
);

/**
 * @route   PATCH /api/admin/backoffice/laporan-soal/:id
 * @desc    Review laporan soal
 * @access  Private (Admin)
 */
router.patch(
  '/:id',
  authenticateAdmin,
  validate(sosialValidator.reviewLaporanSchema),
  laporanController.reviewLaporan
);

export default router;
