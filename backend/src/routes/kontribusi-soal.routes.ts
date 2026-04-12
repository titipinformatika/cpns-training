import { Router } from 'express';
import * as kontribusiController from '../controllers/kontribusi-soal.controller.js';
import * as sosialValidator from '../validators/sosial.validator.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadKontribusi } from '../utils/upload.js';

const router = Router();

/**
 * @route   POST /api/kontribusi-soal
 * @desc    Kirim kontribusi soal
 * @access  Private (User)
 */
router.post(
  '/',
  authenticateUser,
  uploadKontribusi.fields([
    { name: 'pertanyaan_gambar', maxCount: 1 },
    { name: 'opsi_a_gambar', maxCount: 1 },
    { name: 'opsi_b_gambar', maxCount: 1 },
    { name: 'opsi_c_gambar', maxCount: 1 },
    { name: 'opsi_d_gambar', maxCount: 1 },
    { name: 'opsi_e_gambar', maxCount: 1 },
    { name: 'pembahasan_gambar', maxCount: 1 },
  ]),
  validate(sosialValidator.kirimKontribusiSchema),
  kontribusiController.kirimKontribusi
);

export default router;
