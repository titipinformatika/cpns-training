import { z } from 'zod';

// == Helper: Schema id Params ==
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// == Kategori Soal ==
export const createKategoriSchema = z.object({
  kode: z.string().min(1, 'Kode wajib diisi').max(10, 'Kode maksimal 10 karakter'),
  nama: z.string().min(1, 'Nama kategori wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  deskripsi: z.string().optional(),
  passing_grade: z.number().min(0).default(0),
});
export const updateKategoriSchema = createKategoriSchema.partial();

// == Jenis Soal ==
export const createJenisSoalSchema = z.object({
  kategori_soal_id: z.number().int().positive('Kategori soal ID harus valid'),
  nama: z.string().min(1, 'Nama jenis soal wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  deskripsi: z.string().optional(),
});
export const updateJenisSoalSchema = createJenisSoalSchema.partial();

// == Pendidikan & Jurusan ==
export const createPendidikanSchema = z.object({
  nama: z.string().min(1, 'Nama pendidikan wajib diisi').max(50),
  urutan: z.number().int().default(0),
});

export const createJurusanSchema = z.object({
  nama: z.string().min(1, 'Nama jurusan wajib diisi').max(200),
  rumpun: z.string().optional(),
});

// == Instansi & Formasi ==
export const createInstansiSchema = z.object({
  nama: z.string().min(1, 'Nama instansi wajib diisi').max(200),
  singkatan: z.string().optional().nullable(),
  jenis: z.enum(['KEMENTERIAN', 'LEMBAGA', 'PEMDA', 'LAINNYA']).default('LEMBAGA'),
  is_active: z.boolean().default(true),
});
export const updateInstansiSchema = createInstansiSchema.partial();

export const createFormasiSchema = z.object({
  instansi_id: z.number().int().positive('Instansi ID harus valid'),
  nama_jabatan: z.string().min(1, 'Nama jabatan wajib diisi').max(200),
  kualifikasi_pendidikan: z.string().optional().nullable(),
  jumlah_formasi: z.number().int().positive().default(1),
  lokasi_penempatan: z.string().optional().nullable(),
  gaji_min: z.number().optional().nullable(),
  gaji_max: z.number().optional().nullable(),
  is_active: z.boolean().default(true),
});
export const updateFormasiSchema = createFormasiSchema.partial();
