import { Router } from 'express';
import { getUsers, updateUser, toggleUserStatus } from '../controllers/admin-user.controller.js';
import { authenticateAdmin } from '../middlewares/auth.middleware.js';
import { validateParams } from '../middlewares/validate.middleware.js';
import { idParamSchema } from '../validators/master.validator.js';

const router = Router();

router.use(authenticateAdmin);

router.get('/', getUsers);
router.patch('/:id', validateParams(idParamSchema), updateUser);
router.delete('/:id', validateParams(idParamSchema), toggleUserStatus);

export default router;
