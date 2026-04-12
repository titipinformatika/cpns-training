import { Router } from 'express';
import { getDashboardSummary } from '../controllers/admin-dashboard.controller.js';
import { authenticateAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/summary', authenticateAdmin, getDashboardSummary);

export default router;
