import { z } from 'zod';

// --- Laporan Soal ---

export const kirimLaporanSchema = z.object({
  soal_id: z.coerce.number().int().positive('ID Soal tidak valid'),
  jenis_laporan: z.enum([
    'JAWABAN_SALAH', 'SOAL_SALAH', 'TYPO', 'PEMBAHASAN_SALAH',
    'GAMBAR_RUSAK', 'DUPLIKAT', 'LAINNYA'
  ]),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter'),
});

export const reviewLaporanSchema = z.object({
  status: z.enum(['DITINJAU', 'DIPERBAIKI', 'DITOLAK']),
  review_note: z.string().optional(),
});

// --- Kontribusi Soal ---

export const kirimKontribusiSchema = z.object({
  kategori_soal_id: z.coerce.number().int().positive('ID Kategori tidak valid'),
  jenis_soal_id: z.coerce.number().int().positive('ID Jenis tidak valid'),
  level: z.enum(['MUDAH', 'SEDANG', 'SULIT', 'HOST']),
  pertanyaan: z.string().min(5, 'Pertanyaan terlalu pendek'),
  opsi_a: z.string().min(1, 'Opsi A wajib diisi'),
  opsi_b: z.string().min(1, 'Opsi B wajib diisi'),
  opsi_c: z.string().min(1, 'Opsi C wajib diisi'),
  opsi_d: z.string().min(1, 'Opsi D wajib diisi'),
  opsi_e: z.string().min(1, 'Opsi E wajib diisi'),
  jawaban_benar: z.enum(['A', 'B', 'C', 'D', 'E']).optional(),
  skor_a: z.coerce.number().int().min(1).max(5).optional(),
  skor_b: z.coerce.number().int().min(1).max(5).optional(),
  skor_c: z.coerce.number().int().min(1).max(5).optional(),
  skor_d: z.coerce.number().int().min(1).max(5).optional(),
  skor_e: z.coerce.number().int().min(1).max(5).optional(),
  pembahasan: z.string().optional(),
}).refine(data => {
  // Untuk TKP (diindikasikan dengan adanya skor), skor harus lengkap.
  // Untuk non-TKP, jawaban_benar harus ada.
  const hasSkor = data.skor_a !== undefined || data.skor_b !== undefined;
  const hasJawaban = data.jawaban_benar !== undefined;
  return hasSkor || hasJawaban;
}, {
  message: 'Jawaban benar atau skor TKP harus diisi',
  path: ['jawaban_benar']
});

export const reviewKontribusiSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  review_note: z.string().optional(),
  bank_soal_id: z.coerce.number().int().positive('ID Bank Soal wajib diisi jika disetujui').optional(),
});
