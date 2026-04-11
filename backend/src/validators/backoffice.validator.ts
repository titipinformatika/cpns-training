import { z } from 'zod';

// === Bank Soal ===
export const createBankSoalSchema = z.object({
  nama: z.string().min(1, 'Nama bank soal wajib diisi').max(200),
  deskripsi: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});
export const updateBankSoalSchema = createBankSoalSchema.partial();

// === Soal ===
// Catatan: Gambar ditangani multer, validator hanya cek field text/enum/id
export const createSoalSchema = z.object({
  bank_soal_id: z.coerce.number().int().positive(),
  kategori_soal_id: z.coerce.number().int().positive(),
  jenis_soal_id: z.coerce.number().int().positive(),
  level: z.enum(['MUDAH', 'SEDANG', 'SULIT', 'HOTS']),
  pertanyaan: z.string().optional().nullable(),
  opsi_a: z.string().optional().nullable(),
  opsi_b: z.string().optional().nullable(),
  opsi_c: z.string().optional().nullable(),
  opsi_d: z.string().optional().nullable(),
  opsi_e: z.string().optional().nullable(),
  jawaban_benar: z.enum(['A', 'B', 'C', 'D', 'E']).optional().nullable(),
  pembahasan: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});
export const updateSoalSchema = createSoalSchema.partial();

// === Paket Ujian (Ujian) ===
export const createPaketUjianSchema = z.object({
  nama: z.string().min(1, 'Nama paket wajib diisi').max(200),
  deskripsi: z.string().optional().nullable(),
  durasi_menit: z.coerce.number().int().positive(),
  bank_soal_id: z.coerce.number().int().positive(),
  tipe: z.enum(['SIMULASI', 'LATIHAN', 'MATERI']),
  peruntukan: z.enum(['FREE', 'PREMIUM', 'ALL']),
  is_active: z.boolean().default(true),
});
export const updatePaketUjianSchema = createPaketUjianSchema.partial();

// === Mapping Soal ke Paket (UjianSoal) ===
export const addSoalToPaketSchema = z.object({
  soal_id: z.number().int().positive(),
  nomor_urut: z.number().int().positive(),
  skor: z.number().int().default(5),
  // Bobot TKP (Wajib jika kategori soal adalah TKP)
  skor_tkp: z.object({
    skor_a: z.number().int().min(0).max(5).default(1),
    skor_b: z.number().int().min(0).max(5).default(2),
    skor_c: z.number().int().min(0).max(5).default(3),
    skor_d: z.number().int().min(0).max(5).default(4),
    skor_e: z.number().int().min(0).max(5).default(5),
  }).optional(),
});

export const updateSoalOrderSchema = z.object({
  items: z.array(z.object({
    id: z.number().int().positive(), // ID UjianSoal
    nomor_urut: z.number().int().positive(),
  })),
});
