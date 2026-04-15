import { z } from 'zod';

export const upsertBiodataSchema = z.object({
  nama_lengkap: z.string().max(150, 'Nama lengkap terlalu panjang').optional().nullable(),
  no_hp: z.string().max(20, 'Nomor HP terlalu panjang').optional().nullable(),
  tanggal_lahir: z.string().datetime().optional().nullable(), // Validasi ketat format ISO
  jenis_kelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']).optional().nullable(),
  alamat: z.string().optional().nullable(),
  provinsi_kode: z.string().max(100).optional().nullable(),
  kota_kode: z.string().max(100).optional().nullable(),
  tingkat_pendidikan_id: z.number().int().optional().nullable(),
  jurusan_id: z.number().int().optional().nullable(),
  nama_universitas: z.string().max(200).optional().nullable(),
  tahun_lulus: z.number().int().optional().nullable(),
  instansi_id: z.number().int().optional().nullable(),
  formasi_id: z.number().int().positive().optional().nullable(),
});
