import { Router } from 'express';
import * as kontribusiController from '../controllers/kontribusi-soal.controller.js';
import * as sosialValidator from '../validators/sosial.validator.js';
import { authenticateAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

/**
 * @route   GET /api/admin/backoffice/kontribusi-soal
 * @desc    Get daftar kontribusi soal
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticateAdmin,
  kontribusiController.getKontribusiAdmin
);

/**
 * @route   PATCH /api/admin/backoffice/kontribusi-soal/:id
 * @desc    Review kontribusi soal (Approve/Reject)
 * @access  Private (Admin)
 */
router.patch(
  '/:id',
  authenticateAdmin,
  validate(sosialValidator.reviewKontribusiSchema),
  kontribusiController.reviewKontribusi
);

export default router;
