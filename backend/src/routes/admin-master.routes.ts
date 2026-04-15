import { Router } from 'express';
import { 
  createKategori, updateKategori, deleteKategori,
  createJenis, updateJenis, deleteJenis,
  createPendidikan, updatePendidikan, deletePendidikan,
  createJurusan, updateJurusan, deleteJurusan,
  createInstansi, updateInstansi, deleteInstansi,
  createFormasi, updateFormasi, deleteFormasi
} from '../controllers/admin-master.controller.js';
import { validate, validateParams } from '../middlewares/validate.middleware.js';
import { authenticateAdmin } from '../middlewares/auth.middleware.js';
import { 
  createKategoriSchema, updateKategoriSchema,
  createJenisSoalSchema, updateJenisSoalSchema,
  createPendidikanSchema, updatePendidikanSchema,
  createJurusanSchema, updateJurusanSchema,
  createInstansiSchema, updateInstansiSchema,
  createFormasiSchema, updateFormasiSchema,
  idParamSchema
} from '../validators/master.validator.js';

const router = Router();

// Middleware auth untuk semua rute admin master
router.use(authenticateAdmin);

// --- Kategori Soal ---
router.post('/kategori', validate(createKategoriSchema), createKategori);
router.patch('/kategori/:id', validateParams(idParamSchema), validate(updateKategoriSchema), updateKategori);
router.delete('/kategori/:id', validateParams(idParamSchema), deleteKategori);

// --- Jenis Soal ---
router.post('/jenis', validate(createJenisSoalSchema), createJenis);
router.patch('/jenis/:id', validateParams(idParamSchema), validate(updateJenisSoalSchema), updateJenis);
router.delete('/jenis/:id', validateParams(idParamSchema), deleteJenis);

// --- Pendidikan & Jurusan ---
router.post('/pendidikan', validate(createPendidikanSchema), createPendidikan);
router.patch('/pendidikan/:id', validateParams(idParamSchema), validate(updatePendidikanSchema), updatePendidikan);
router.delete('/pendidikan/:id', validateParams(idParamSchema), deletePendidikan);

router.post('/jurusan', validate(createJurusanSchema), createJurusan);
router.patch('/jurusan/:id', validateParams(idParamSchema), validate(updateJurusanSchema), updateJurusan);
router.delete('/jurusan/:id', validateParams(idParamSchema), deleteJurusan);

// --- Instansi ---
router.post('/instansi', validate(createInstansiSchema), createInstansi);
router.patch('/instansi/:id', validateParams(idParamSchema), validate(updateInstansiSchema), updateInstansi);
router.delete('/instansi/:id', validateParams(idParamSchema), deleteInstansi);

// --- Formasi ---
router.post('/formasi', validate(createFormasiSchema), createFormasi);
router.patch('/formasi/:id', validateParams(idParamSchema), validate(updateFormasiSchema), updateFormasi);
router.delete('/formasi/:id', validateParams(idParamSchema), deleteFormasi);

export default router;
