import { Router } from 'express';
import * as leaderboardController from '../controllers/leaderboard.controller.js';
import * as leaderboardValidator from '../validators/leaderboard.validator.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { validateQuery } from '../middlewares/validate.middleware.js';

const router = Router();

/**
 * @route   GET /api/leaderboard/global
 * @desc    Get global leaderboard per ujian
 * @access  Private (User)
 */
router.get(
  '/global',
  authenticateUser,
  validateQuery(leaderboardValidator.leaderboardQuerySchema),
  leaderboardController.getGlobalLeaderboard
);

/**
 * @route   GET /api/leaderboard/formasi
 * @desc    Get competitor leaderboard per ujian
 * @access  Private (User)
 */
router.get(
  '/formasi',
  authenticateUser,
  validateQuery(leaderboardValidator.leaderboardQuerySchema),
  leaderboardController.getFormasiLeaderboard
);

export default router;
