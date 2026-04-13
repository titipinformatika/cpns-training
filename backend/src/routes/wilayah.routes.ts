import { Router } from 'express';
import { getProvinsi, getKota } from '../controllers/wilayah.controller.js';

const router = Router();

router.get('/provinsi', getProvinsi);
router.get('/kota/:provinsi_kode', getKota);

export default router;
