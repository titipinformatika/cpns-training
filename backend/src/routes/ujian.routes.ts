import { Router } from 'express';
import * as ujianController from '../controllers/ujian.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route   GET /api/ujian
 * @desc    Get list of exams available for user
 * @access  Private (User)
 */
router.get('/', authenticateUser, ujianController.getUjianList);

/**
 * @route   GET /api/ujian/:id
 * @desc    Get exam detail
 * @access  Private (User)
 */
router.get('/:id', authenticateUser, ujianController.getUjianDetail);

export default router;
