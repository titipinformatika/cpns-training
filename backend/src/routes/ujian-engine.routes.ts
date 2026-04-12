import { Router } from 'express';
import * as ujianController from '../controllers/ujian-engine.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ujianValidator from '../validators/ujian-engine.validator.js';

const router = Router();

/**
 * @route   POST /api/ujian/mulai
 * @desc    Mulai simulasi ujian baru
 * @access  Private (User)
 */
router.post(
  '/mulai',
  authenticateUser,
  validate(ujianValidator.mulaiUjianSchema),
  ujianController.mulaiUjian
);

/**
 * @route   POST /api/ujian/heartbeat
 * @desc    Sinkronisasi waktu dan status aktif
 * @access  Private (User)
 */
router.post(
  '/heartbeat',
  authenticateUser,
  validate(ujianValidator.heartbeatSchema),
  ujianController.heartbeat
);

/**
 * @route   POST /api/ujian/jawab
 * @desc    Simpan atau update jawaban soal
 * @access  Private (User)
 */
router.post(
  '/jawab',
  authenticateUser,
  validate(ujianValidator.simpanJawabanSchema),
  ujianController.simpanJawaban
);

export default router;
