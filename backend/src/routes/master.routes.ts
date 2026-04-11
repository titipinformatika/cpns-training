import { Router } from 'express';
import { 
  getKategori, 
  getJenisSoal, 
  getPendidikan, 
  getJurusan, 
  getInstansi, 
  getFormasi 
} from '../controllers/master.controller.js';

const router = Router();

router.get('/kategori', getKategori);
router.get('/jenis-soal', getJenisSoal);
router.get('/pendidikan', getPendidikan);
router.get('/jurusan', getJurusan);
router.get('/instansi', getInstansi);
router.get('/formasi', getFormasi);

export default router;
