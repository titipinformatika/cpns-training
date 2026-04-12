import { z } from 'zod';

export const mulaiUjianSchema = z.object({
  ujian_id: z.coerce.number().int().positive('ID Ujian tidak valid'),
});

export const heartbeatSchema = z.object({
  hasil_ujian_id: z.coerce.number().int().positive('ID Hasil Ujian tidak valid'),
});

export const simpanJawabanSchema = z.object({
  hasil_ujian_id: z.coerce.number().int().positive('ID Hasil Ujian tidak valid'),
  ujian_soal_id: z.coerce.number().int().positive('ID Ujian Soal tidak valid'),
  jawaban: z.enum(['A', 'B', 'C', 'D', 'E']).nullable(),
  is_ragu: z.boolean().default(false),
});
