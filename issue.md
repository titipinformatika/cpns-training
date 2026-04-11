# FASE 3: Manajemen Data Master & Pembaruan Biodata Pesaing
## Akses Admin (CRUD) & Akses User (Read-Only / Self-Update)

**Deskripsi:** Membangun Endpoint API untuk referensi data statis (Tingkat Pendidikan, Jurusan, Kategori Soal, Jenis Soal, Instansi, dan Formasi). Data ini wajib ada agar entitas sistem lain seperti Bank Soal atau pendaftaran ujian dapat merujuk ke ID yang jelas. Terakhir, peserta dapat menyimpan pengisian profil (`BiodataUser`) mereka berdasarkan referensi master data ini.

---

## Prasyarat / Dependensi (Selesai di Fase 1 & 2)
1. Modul Database Prisma (`import prisma from '../lib/prisma.js'`).
2. Filter JWT `authenticateAdmin` & `authenticateUser` (`src/middlewares/auth.middleware.ts`).
3. Class `AppError` (`src/middlewares/error.middleware.ts`).
4. Ekstraktor Parameter: `validate`, `validateQuery`, `validateParams`.

---

## 📋 DAFTAR TUGAS DAN STRUKTUR FILE YANG HARUS DIBUAT

Di Fase ini, kamu akan membangun **Ratusan Endpoint Pendukung** dalam waktu singkat berkat bantuan Zod dan Prisma. Laksanakan langkah di bawah ini.

### TASK 1: Buat Zod Validation Schemas (Master Data)
**Buat File**: `src/validators/master.validator.ts`

```typescript
import { z } from 'zod';

// == Kategori Soal ==
export const createKategoriSchema = z.object({
  kode: z.string().min(1).max(10),
  nama: z.string().min(1).max(100),
  deskripsi: z.string().optional(),
  passing_grade: z.number().min(0).default(0),
});
export const updateKategoriSchema = createKategoriSchema.partial();

// == Jenis Soal ==
export const createJenisSoalSchema = z.object({
  kategori_soal_id: z.number().int().positive(),
  nama: z.string().min(1).max(100),
  deskripsi: z.string().optional(),
});
export const updateJenisSoalSchema = createJenisSoalSchema.partial();

// == Pendidikan & Jurusan ==
export const createPendidikanSchema = z.object({
  nama: z.string().min(1).max(50),
  urutan: z.number().int().default(0),
});
export const createJurusanSchema = z.object({
  nama: z.string().min(1).max(200),
  rumpun: z.string().optional(),
});

// == Instansi & Formasi ==
export const createInstansiSchema = z.object({
  nama: z.string().min(1).max(200),
  singkatan: z.string().optional(),
  jenis: z.enum(['KEMENTERIAN', 'LEMBAGA', 'PEMDA', 'LAINNYA']).default('LEMBAGA'),
  is_active: z.boolean().default(true),
});
export const updateInstansiSchema = createInstansiSchema.partial();

export const createFormasiSchema = z.object({
  instansi_id: z.number().int().positive(),
  nama_jabatan: z.string().min(1).max(200),
  kualifikasi_pendidikan: z.string().optional(),
  jumlah_formasi: z.number().int().positive().default(1),
  lokasi_penempatan: z.string().optional(),
  gaji_min: z.number().optional(), // BigInt di Prisma dikirim sebagai number dari API lalu di casting
  gaji_max: z.number().optional(),
  is_active: z.boolean().default(true),
});
export const updateFormasiSchema = createFormasiSchema.partial();

// == Schema id Params ==
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
```

---

### TASK 2: Buat Admin Master Controller
Controller ini menangani aksi CRUD (Create, Update, Delete) oleh pihak manajemen (Admin).
**Buat File**: `src/controllers/admin-master.controller.ts`

**Draft Fungsi yang harus kamu tulis isinya (Implementasikan CRUD ke `prisma`):**
1. `createKategori` / `updateKategori` / `deleteKategori`
2. `createJenis` / `updateJenis` / `deleteJenis`
3. `createPendidikan`, `createJurusan` (Update dan delete bersifat opsional)
4. `createInstansi` / `updateInstansi` / `deleteInstansi` (Gunakan `req.admin!.id` untuk kolom `created_by` saat create)
5. `createFormasi` / `updateFormasi` / `deleteFormasi` (Gunakan `req.admin!.id` untuk kolom `created_by` saat create)

> **Catatan Implementasi Create Formasi (Parsing BigInt):**
> Prisma Field `gaji_min` & `gaji_max` adalah tipe `BigInt`. Ketika menerima JSON Number, cast ke `BigInt(req.body.gaji_min)` saat di-*insert*, dan gunakan `JSON.stringify` custom atau *serialize* tipe data `BigInt` (ke tipe `Number` / `String`) ketika `res.json(successResponse(...))` agar tidak error *Cannot serialize BigInt to JSON*.

---

### TASK 3: Buat Public/General Master Controller
Controller terbuka untuk User mengambil daftar master. Semua fungsi ini hanya berisi Prisma `.findMany()` dan `.findUnique()`.
**Buat File**: `src/controllers/master.controller.ts`

**Draft Fungsi (Read-Only):**
1. `getKategori` & `getKategoriById`
2. `getJenisSoal` & `getJenisSoalById`
3. `getPendidikan` & `getJurusan`
4. `getInstansi` (Jangan lupa me-*map* hasil query agar elemen BigInt jika ada tidak menyebabkan error JSON, namun Instansi tidak memiliki BigInt).
5. `getFormasi` (Khusus fungsi ini, setiap respon dari Prisma *findMany* harus di mapping: `gaji_min: item.gaji_min ? Number(item.gaji_min) : null`).

---

### TASK 4: Buat Zod Schema & Controller untuk `BiodataUser`
Di sini User mendaftarkan detail pribadi mereka dan disinkronkan ke tabel referensi.
**Buat File**: `src/validators/user.validator.ts`

```typescript
import { z } from 'zod';

export const upsertBiodataSchema = z.object({
  nama_lengkap: z.string().max(150),
  no_hp: z.string().max(20).optional(),
  tanggal_lahir: z.string().datetime().optional(), // ISO 8601 string -> akan di cast ke Date nanti
  jenis_kelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']).optional(),
  alamat: z.string().optional(),
  provinsi: z.string().max(100).optional(),
  kota: z.string().max(100).optional(),
  tingkat_pendidikan_id: z.number().int().optional(),
  jurusan_id: z.number().int().optional(),
  nama_universitas: z.string().max(200).optional(),
  tahun_lulus: z.number().int().optional(),
  instansi_id: z.number().int().optional(),
  formasi_id: z.number().int().optional(),
});
```

**Buat File Controller**: `src/controllers/user.controller.ts`
1. `getBiodata (req, res)`: Gunakan `req.user!.id` untuk mencari `prisma.biodataUser.findUnique()`.
2. `upsertBiodata (req, res)`: Gunakan `prisma.biodataUser.upsert(...)` dimana `where: { user_id: req.user!.id }`. Jika record belum ada buat record baru, jika sudah ada maka update record tersebut! (Cast parameter `req.body.tanggal_lahir` dari string datetime menjadi `new Date(req.body.tanggal_lahir)` ke *database* jika ada).

---

### TASK 5: Routing Aggregation
Daftarkan semua endpoint tersebut di sistem routing Express.

1. **Buat File: `src/routes/master.routes.ts`**
   - Rute ini **TIDAK TERPROTEKSI** (Public) agar App Client bisa nge-*load* filter (kecuali jika dirasa rahasia `authenticateUser` bisa ditambahkan).
   - Rute berisi `router.get('/kategori', getKategori)` dll.

2. **Buat File: `src/routes/admin-master.routes.ts`**
   - Rute ini **TERPROTEKSI** dengan `authenticateAdmin`.
   - Rute berisi `router.post('/kategori', validate(createKategoriSchema), createKategori)` dll. Apabila rute mengharuskan `:id`, lindungi juga dengan middleware filter URI parameter `router.put('/kategori/:id', validateParams(idParamSchema), validate(updateKategoriSchema), updateKategori)`.

3. **Buat File: `src/routes/user.routes.ts`**
   - Rute ini **TERPROTEKSI** dengan `authenticateUser`.
   - Rute berisi `router.get('/biodata', getBiodata)` dan `router.put('/biodata', validate(upsertBiodataSchema), upsertBiodata)`.

4. **Registrasi di `src/routes/index.ts`**
   ```typescript
   import masterRoutes from './master.routes.js';
   import adminMasterRoutes from './admin-master.routes.js';
   import userRoutes from './user.routes.js';

   // pasangkan!
   router.use('/master', masterRoutes);
   router.use('/admin/master', adminMasterRoutes);
   router.use('/user', userRoutes);
   ```

---

## ✔️ Checklist dan Kriteria Penerimaan Pekerjaan (AC)

- [ ] Script Typescript tidak memberikan peringatan erosi kompilasi (`npx tsc --noEmit` sukses).
- [ ] Implementasi JSON parsing tipe Prisma `BigInt` pada Formasi sudah dilakukan dengan mengubah struktur ke `Number` sebelum direspon.
- [ ] Admin membutuhkan token (Bearer Header) saat create Formasi dan id admin sudah tersimpan sempurna di DB column `created_by`.
- [ ] Fitur update profil user sudah bersifat `upsert` yang stabil. User dapat memperbarui profil berkali-kali tanpa masalah duplikasi kunci foreign (Unique User ID constraint).

> Ingat: Seluruh file ini mengandalkan konsep `"type": "module"`, jangan lupa selalu bubuhkan format `.js` setiap import berkas statis lokal sistem di atas.
