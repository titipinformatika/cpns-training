import { Router } from 'express';
import { z } from 'zod';
import { 
  createBankSoal, getBankSoal, getBankSoalById, updateBankSoal, deleteBankSoal 
} from '../controllers/admin-bank-soal.controller.js';
import { 
  createSoal, getSoalByBank, updateSoal, deleteSoal 
} from '../controllers/admin-soal.controller.js';
import { 
  createPaketUjian, getPaketUjian, updatePaketUjian, 
  addSoalToPaket, removeSoalFromPaket, updateSoalOrder, getSoalInPaket 
} from '../controllers/admin-paket-ujian.controller.js';
import { validate, validateParams } from '../middlewares/validate.middleware.js';
import { authenticateAdmin } from '../middlewares/auth.middleware.js';
import { uploadSoal } from '../utils/upload.js';
import { 
  createBankSoalSchema, updateBankSoalSchema,
  createSoalSchema, updateSoalSchema,
  createPaketUjianSchema, updatePaketUjianSchema,
  addSoalToPaketSchema, updateSoalOrderSchema
} from '../validators/backoffice.validator.js';
import { idParamSchema } from '../validators/master.validator.js';

const router = Router();

// Proteksi Admin untuk semua rute di modul ini
router.use(authenticateAdmin);

// === 1. Bank Soal ===
router.post('/bank-soal', validate(createBankSoalSchema), createBankSoal);
router.get('/bank-soal', getBankSoal);
router.get('/bank-soal/:id', validateParams(idParamSchema), getBankSoalById);
router.patch('/bank-soal/:id', validateParams(idParamSchema), validate(updateBankSoalSchema), updateBankSoal);
router.delete('/bank-soal/:id', validateParams(idParamSchema), deleteBankSoal);

// === 2. Soal (Question) ===
// Khusus create dan update menggunakan middleware upload.fields
const soalUploadFields = [
  { name: 'pertanyaan_gambar', maxCount: 1 },
  { name: 'opsi_a_gambar', maxCount: 1 },
  { name: 'opsi_b_gambar', maxCount: 1 },
  { name: 'opsi_c_gambar', maxCount: 1 },
  { name: 'opsi_d_gambar', maxCount: 1 },
  { name: 'opsi_e_gambar', maxCount: 1 },
  { name: 'pembahasan_gambar', maxCount: 1 },
];

router.post('/soal', uploadSoal.fields(soalUploadFields), validate(createSoalSchema), createSoal);
router.get('/soal/bank/:bank_soal_id', getSoalByBank);
router.patch('/soal/:id', uploadSoal.fields(soalUploadFields), validateParams(idParamSchema), validate(updateSoalSchema), updateSoal);
router.delete('/soal/:id', validateParams(idParamSchema), deleteSoal);

// === 3. Paket Ujian (Ujian) ===
router.post('/paket-ujian', validate(createPaketUjianSchema), createPaketUjian);
router.get('/paket-ujian', getPaketUjian);
router.patch('/paket-ujian/:id', validateParams(idParamSchema), validate(updatePaketUjianSchema), updatePaketUjian);

// === 4. Mapping Soal ke Paket ===
router.post('/paket-ujian/:ujian_id/soal', validateParams(z.object({ ujian_id: z.coerce.number() })), validate(addSoalToPaketSchema), addSoalToPaket);
router.get('/paket-ujian/:ujian_id/soal', getSoalInPaket);
router.delete('/paket-ujian/soal/:mapping_id', removeSoalFromPaket);
router.patch('/paket-ujian/soal/reorder', validate(updateSoalOrderSchema), updateSoalOrder);

export default router;
