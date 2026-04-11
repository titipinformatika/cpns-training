import { Router } from 'express';
import { getBiodata, upsertBiodata } from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { upsertBiodataSchema } from '../validators/user.validator.js';

const router = Router();

router.get('/biodata', authenticateUser, getBiodata);
router.put('/biodata', authenticateUser, validate(upsertBiodataSchema), upsertBiodata);

export default router;
