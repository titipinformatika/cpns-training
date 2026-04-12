# 🔍 AUDIT KUALITAS KODE & KEAMANAN BACKEND — CPNS TRAINING

Hasil audit menyeluruh terhadap seluruh kode backend yang telah selesai (Fase 1-8).
Dokumen ini berisi temuan, saran perbaikan, dan penambahan fitur yang siap dikerjakan oleh programmer junior.

---

## DAFTAR ISI

1. [🔴 KEAMANAN (SECURITY)](#-keamanan-security)
2. [🟡 KUALITAS KODE (CODE QUALITY)](#-kualitas-kode-code-quality)
3. [🟢 PENAMBAHAN FITUR (FEATURE ENHANCEMENTS)](#-penambahan-fitur-feature-enhancements)
4. [🔵 INFRASTRUKTUR & DEVOPS](#-infrastruktur--devops)

---

## 🔴 KEAMANAN (SECURITY)

### SEC-01: Tidak Ada Rate Limiting ← KRITIS
**File:** `backend/src/app.ts`
**Masalah:** Endpoint login, register, dan refresh-token tidak memiliki rate limiter. Penyerang bisa melakukan brute-force password tanpa hambatan.
**Dampak:** Serangan Brute Force, Denial of Service (DoS).

**Solusi:**
```bash
npm install express-rate-limit
```
```typescript
// backend/src/middlewares/rateLimiter.middleware.ts
import rateLimit from 'express-rate-limit';

// Rate limiter ketat untuk auth (15 request per 15 menit)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter umum untuk semua API (100 request per menit)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Terlalu banyak request. Coba lagi nanti.' },
});
```
**Cara Pasang:**
```typescript
// app.ts
app.use('/api', apiLimiter);

// auth.routes.ts
router.post('/login', authLimiter, validate(loginUserSchema), login);
router.post('/register', authLimiter, validate(registerUserSchema), register);
```

- [ ] Install `express-rate-limit`
- [ ] Buat file `rateLimiter.middleware.ts`
- [ ] Pasang `authLimiter` di route login & register (user DAN admin)
- [ ] Pasang `apiLimiter` di `app.ts` secara global
- [ ] Buat unit test untuk memastikan rate limiter aktif

---

### SEC-02: JWT Secret Terlalu Lemah ← KRITIS
**File:** `backend/.env`
**Masalah:** `JWT_SECRET=cpns-training-secret-key-2026` — ini terlalu mudah ditebak. Siapapun yang membaca kode sumber bisa membuat token palsu.
**Dampak:** Pencurian identitas, akses tidak sah ke semua akun.

**Solusi:**
```bash
# Generate secret acak yang kuat (jalankan di terminal):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Kemudian ganti di `.env`:
```
JWT_SECRET=<hasil_dari_command_di_atas>
```

- [ ] Generate JWT_SECRET baru minimal 64 karakter random
- [ ] Pastikan `.env` sudah ada di `.gitignore` (✅ sudah di-gitignore)
- [ ] Buat file `.env.example` sebagai template tanpa value sensitif

---

### SEC-03: Refresh Token Menggunakan Secret yang Sama ← SEDANG
**File:** `backend/src/services/auth.service.ts` (baris 47-51)
**Masalah:** `generateRefreshToken` menggunakan `JWT_SECRET` yang sama dengan `generateAccessToken`. Jika access token dicuri, penyerang bisa menukarnya sebagai refresh token.

**Solusi:**
Tambahkan environment variable baru:
```
JWT_REFRESH_SECRET=<secret_berbeda>
```
```typescript
// auth.service.ts
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload as any, env.JWT_REFRESH_SECRET as string, {
    expiresIn: env.JWT_REFRESH_EXPIRY as any,
  });
}
```

- [ ] Tambahkan `JWT_REFRESH_SECRET` di `env.ts` schema dan `.env`
- [ ] Update `generateRefreshToken` agar menggunakan secret terpisah
- [ ] Update `refreshToken` dan `refreshAdminToken` controller untuk menggunakan secret terpisah saat verifikasi

---

### SEC-04: Tidak Ada Sanitasi Input HTML/XSS ← SEDANG
**File:** Semua controller yang menerima input teks (pertanyaan soal, deskripsi, pembahasan, review_note).
**Masalah:** Teks dari user langsung disimpan ke database tanpa sanitasi. Jika ditampilkan di frontend tanpa escape, bisa terjadi Stored XSS.
**Dampak:** Serangan Cross-Site Scripting (XSS).

**Solusi:**
```bash
npm install xss
```
```typescript
// backend/src/utils/sanitize.ts
import xss from 'xss';

export function sanitizeHtml(input: string): string {
  return xss(input);
}

export function sanitizeObject<T extends Record<string, any>>(obj: T, fields: string[]): T {
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      (result as any)[field] = sanitizeHtml(result[field]);
    }
  }
  return result;
}
```
**Cara Pakai:**
```typescript
// Di controller sebelum simpan ke DB:
const cleanBody = sanitizeObject(req.body, ['pertanyaan', 'opsi_a', 'opsi_b', ...]);
```

- [ ] Install `xss`
- [ ] Buat utility `sanitize.ts`
- [ ] Terapkan di `createSoal`, `kirimKontribusi`, `kirimLaporan`, dan `upsertBiodata`
- [ ] Buat unit test sanitasi

---

### SEC-05: Upload File Hanya Memeriksa Ekstensi, Tidak MIME Type ← SEDANG
**File:** `backend/src/utils/upload.ts` (baris 34-41)
**Masalah:** Filter hanya berdasarkan ekstensi `.jpg/.jpeg`. File berbahaya bisa diupload dengan mengganti ekstensi.

**Solusi:**
```typescript
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (jpg, png, webp) yang diizinkan'));
  }
};
```

- [ ] Tambahkan validasi `file.mimetype` di samping ekstensi
- [ ] Perluas format gambar yang diizinkan (tambahkan `.png` dan `.webp`)
- [ ] Update `ALLOWED_EXTENSIONS` di `constants.ts`

---

### SEC-06: Parameter `id` di Admin Delete Tidak Divalidasi ← RENDAH
**File:** `admin-master.controller.ts`, `admin-soal.controller.ts`
**Masalah:** `Number(id)` bisa menghasilkan `NaN` jika input bukan angka, yang menyebabkan error Prisma yang tidak terkontrol.

**Solusi:**
Gunakan `validateParams` middleware dengan Zod schema:
```typescript
// validators/common.validator.ts
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('ID harus angka positif'),
});
```
```typescript
// Di route:
router.delete('/:id', authenticateAdmin, validateParams(idParamSchema), deleteKategori);
```

- [ ] Buat `common.validator.ts` dengan `idParamSchema`
- [ ] Terapkan `validateParams` pada semua route yang menggunakan `:id`

---

## 🟡 KUALITAS KODE (CODE QUALITY)

### QC-01: Prisma Client Tidak Menangani Koneksi Graceful Shutdown
**File:** `backend/src/lib/prisma.ts`
**Masalah:** Saat server mati, koneksi database tidak ditutup dengan benar. Ini bisa menyebabkan connection leak.

**Solusi:**
```typescript
// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
```

- [ ] Update `prisma.ts` dengan logging kondisional dan graceful shutdown
- [ ] Tambahkan handler `SIGINT` dan `SIGTERM` di `server.ts`

---

### QC-02: Tidak Ada Request Logger ← PENTING
**File:** `backend/src/app.ts`
**Masalah:** Tidak ada logging request HTTP. Sulit untuk debugging dan monitoring di production.

**Solusi:**
```bash
npm install morgan
npm install -D @types/morgan
```
```typescript
// app.ts
import morgan from 'morgan';
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
```

- [ ] Install `morgan` dan `@types/morgan`
- [ ] Pasang di `app.ts` sebelum routes
- [ ] Gunakan format `combined` untuk production, `dev` untuk development

---

### QC-03: Fungsi `serializeFormasi` Diduplikasi ← RENDAH
**File:** `backend/src/controllers/master.controller.ts` DAN `admin-master.controller.ts`
**Masalah:** Fungsi helper `serializeFormasi` yang identik ada di 2 file.

**Solusi:**
Pindahkan ke `utils/serializer.ts`:
```typescript
// backend/src/utils/serializer.ts
export function serializeFormasi(data: any) { ... }
```

- [ ] Buat file `utils/serializer.ts`
- [ ] Pindahkan fungsi `serializeFormasi` ke sana
- [ ] Import dari kedua controller

---

### QC-04: Terlalu Banyak Penggunaan `any` ← SEDANG
**File:** Beberapa controller, terutama `admin-master.controller.ts`, `leaderboard.controller.ts`
**Masalah:** Type `any` mengurangi keamanan tipe TypeScript.

**Daftar lokasi perbaikan:**
| File | Baris | Konteks |
|------|-------|---------|
| `admin-master.controller.ts` | 7, 165 | `serializeFormasi`, `updateData` |
| `admin-soal.controller.ts` | 19 | `getFilePath(files: any, ...)` |
| `leaderboard.controller.ts` | 16, 50, 93, 126 | `status`, `rankings`, `where` |
| `kontribusi-soal.controller.ts` | 60 | `where: any` |
| `laporan-soal.controller.ts` | 58 | `where: any` |

**Solusi per kasus:**
```typescript
// Contoh: Ganti `const where: any = {}` menjadi:
import type { Prisma } from '@prisma/client';
const where: Prisma.KontribusiSoalWhereInput = {};
```

- [ ] Ganti `any` pada `where` clause menjadi `Prisma.XxxWhereInput`
- [ ] Ganti `any` pada `updateData` menjadi typed objects
- [ ] Buat interface untuk file upload helpers

---

### QC-05: Enum Mismatch Antara Validator dan Prisma Schema ← BUG
**File:** `backend/src/validators/backoffice.validator.ts` (baris 36)
**Masalah:** Validator `createPaketUjianSchema` menggunakan enum `['SIMULASI', 'LATIHAN', 'MATERI']`, tetapi Prisma schema mendefinisikan `TipeUjian` sebagai `['TRYOUT', 'LATIHAN', 'QUIZ']`. Ini akan menyebabkan error saat membuat paket ujian.

**Juga:** Di `createSoalSchema` baris 17, enum level menggunakan `'HOTS'`, tapi Prisma schema mendefinisikan `'HOST'`.

**Solusi:**
```typescript
// backoffice.validator.ts
tipe: z.enum(['TRYOUT', 'LATIHAN', 'QUIZ']),  // ← sesuai enum TipeUjian
level: z.enum(['MUDAH', 'SEDANG', 'SULIT', 'HOST']),  // ← sesuai enum LevelSoal
```

- [ ] Fix enum `tipe` di `createPaketUjianSchema` → `['TRYOUT', 'LATIHAN', 'QUIZ']`
- [ ] Fix enum `level` di `createSoalSchema` → `['MUDAH', 'SEDANG', 'SULIT', 'HOST']`
- [ ] Buat test untuk memastikan validasi sesuai enum Prisma

---

### QC-06: Controller `ujian-engine.controller.ts` Terlalu Besar (607 Baris) ← SEDANG
**File:** `backend/src/controllers/ujian-engine.controller.ts`
**Masalah:** File ini menangani mulai ujian, heartbeat, simpan jawaban, DAN kalkulasi skor. Terlalu banyak tanggung jawab.

**Solusi:** Refactor kalkulasi skor ke service terpisah:
```
controllers/ujian-engine.controller.ts  → Hanya handle request/response
services/ujian-engine.service.ts        → Logika bisnis kalkulasi skor & statistik
```

- [ ] Buat `services/ujian-engine.service.ts`
- [ ] Pindahkan fungsi `checkAndHandleTimeout` ke service
- [ ] Pindahkan logika kalkulasi skor (statsKategori, statsJenis, detailLulus) ke service
- [ ] Controller hanya memanggil service dan mengembalikan response

---

### QC-07: Hard Delete pada Master Data Berbahaya
**File:** `admin-master.controller.ts` — `deleteKategori`, `deleteJenis`, `deleteInstansi`, `deleteFormasi`
**Masalah:** Menggunakan `prisma.xxx.delete()` yang akan menyebabkan `Foreign Key Constraint Error` jika sudah ada data terkait (soal, hasil ujian, dll).

**Solusi:** Gunakan soft delete (sudah ada kolom `is_active` di beberapa tabel):
```typescript
// Ganti delete menjadi soft delete:
export async function deleteKategori(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    // Cek apakah masih digunakan
    const soalCount = await prisma.soal.count({ where: { kategori_soal_id: Number(id) } });
    if (soalCount > 0) {
      throw new AppError('Kategori masih digunakan oleh soal dan tidak bisa dihapus', 409);
    }
    await prisma.kategoriSoal.delete({ where: { id: Number(id) } });
    res.json(successResponse(null, 'Kategori berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}
```

- [ ] Tambahkan pengecekan "masih digunakan" sebelum delete pada semua master data
- [ ] Untuk data yang sudah ada relasi (instansi, formasi), gunakan soft delete (`is_active = false`)

---

## 🟢 PENAMBAHAN FITUR (FEATURE ENHANCEMENTS)

### FE-01: Endpoint Ganti Password User ← PRIORITAS TINGGI
**Saat ini belum tersedia.**

```typescript
// validators/auth.validator.ts
export const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Password lama wajib diisi'),
  new_password: z.string().min(6, 'Password baru minimal 6 karakter').max(100),
});
```
```typescript
// controllers/auth.controller.ts
export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { old_password, new_password } = req.body;
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User tidak ditemukan', 404);

    const isMatch = await comparePassword(old_password, user.password);
    if (!isMatch) throw new AppError('Password lama tidak cocok', 401);

    const hashed = await hashPassword(new_password);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    res.json(successResponse(null, 'Password berhasil diubah'));
  } catch (error) {
    next(error);
  }
}
```

- [ ] Tambahkan `changePasswordSchema` di validator
- [ ] Tambahkan `changePassword` di controller
- [ ] Daftarkan route `PUT /api/auth/change-password`
- [ ] Buat unit test

---

### FE-02: Endpoint Admin Dashboard Summary ← PRIORITAS SEDANG
**Saat ini frontend admin tidak punya data untuk halaman dashboard.**

```typescript
// controllers/admin-dashboard.controller.ts
export async function getDashboardSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const [totalUser, totalSoal, totalUjian, totalLaporan, totalKontribusi] = await Promise.all([
      prisma.user.count({ where: { is_active: true } }),
      prisma.soal.count({ where: { is_active: true } }),
      prisma.ujian.count({ where: { is_active: true } }),
      prisma.laporanSoal.count({ where: { status: 'PENDING' } }),
      prisma.kontribusiSoal.count({ where: { status: 'PENDING' } }),
    ]);

    res.json(successResponse({
      totalUser, totalSoal, totalUjian,
      laporanPending: totalLaporan,
      kontribusiPending: totalKontribusi,
    }));
  } catch (error) {
    next(error);
  }
}
```

- [ ] Buat file `admin-dashboard.controller.ts`
- [ ] Buat route `GET /api/admin/dashboard`
- [ ] Buat unit test

---

### FE-03: Endpoint Upload/Ganti Avatar User ← PRIORITAS RENDAH
**Kolom `avatar` sudah ada di tabel `users`, tapi belum ada endpoint untuk upload.**

- [ ] Buat multer instance untuk upload avatar: `uploads/avatar/`
- [ ] Buat endpoint `PUT /api/user/avatar` (form-data, field `avatar`)
- [ ] Hapus file lama saat ganti avatar
- [ ] Buat unit test

---

### FE-04: Soft Delete untuk Soal (Toggle `is_active`) ← PRIORITAS SEDANG
**File:** `admin-soal.controller.ts`
**Saat ini `deleteSoal` menghapus permanen. Ini berbahaya karena soal mungkin sudah terlanjur dipakai dalam ujian.**

- [ ] Tambahkan endpoint `PATCH /api/admin/backoffice/soal/:id/toggle-active`
- [ ] Logika: flip `is_active` dari true ke false atau sebaliknya
- [ ] Hapus atau nonaktifkan tombol "Hard Delete" di frontend admin

---

### FE-05: Endpoint Search/Filter Soal di Admin
**Saat ini `getSoalByBank` hanya filter berdasarkan `bank_soal_id`. Admin perlu search dan filter lebih lengkap.**

- [ ] Tambahkan query params: `?search=`, `?kategori_id=`, `?jenis_id=`, `?level=`
- [ ] Implementasi `contains` search pada field `pertanyaan`
- [ ] Tambahkan paginasi

---

### FE-06: Endpoint Hapus File yang Tidak Terpakai (Orphan Files) ← PRIORITAS RENDAH
**Saat kontribusi di-reject, file gambar yang diupload tetap tersimpan di server.**

- [ ] Buat utility/scheduler untuk membersihkan file orphan
- [ ] Atau, hapus file saat kontribusi di-reject di `reviewKontribusi`

---

## 🔵 INFRASTRUKTUR & DEVOPS

### INF-01: Buat File `.env.example`
**Masalah:** Developer baru tidak tahu variable environment apa saja yang diperlukan.

```env
# .env.example
DATABASE_URL=mysql://root:password@localhost:3306/cpns_training
PORT=3000
JWT_SECRET=ganti_dengan_random_string_64_karakter
JWT_REFRESH_SECRET=ganti_dengan_random_string_64_karakter_berbeda
JWT_EXPIRY=1d
JWT_REFRESH_EXPIRY=7d
NODE_ENV=development
```

- [ ] Buat file `.env.example`
- [ ] Pastikan `.env.example` TIDAK ada di `.gitignore`
- [ ] Tambahkan instruksi di `README.md`

---

### INF-02: Tambahkan CORS Whitelist ← SEDANG
**File:** `backend/src/app.ts` (baris 12)
**Masalah:** `app.use(cors())` mengizinkan request dari domain manapun. Ini tidak aman di production.

**Solusi:**
```typescript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://cpns-training.com', 'https://admin.cpns-training.com']
    : true, // Izinkan semua di development
  credentials: true,
};
app.use(cors(corsOptions));
```

- [ ] Tambahkan `CORS_ORIGIN` di env schema
- [ ] Konfigurasi whitelist di `app.ts`

---

### INF-03: Tambahkan Compression Middleware ← RENDAH
```bash
npm install compression
npm install -D @types/compression
```
```typescript
import compression from 'compression';
app.use(compression());
```

- [ ] Install dan pasang `compression` di `app.ts`

---

### INF-04: Documentasi API dengan Swagger/OpenAPI ← PRIORITAS RENDAH
**Saat ini tidak ada dokumentasi API resmi yang bisa diakses oleh frontend developer.**

- [ ] Install `swagger-jsdoc` dan `swagger-ui-express`
- [ ] Buat JSDoc annotation pada setiap route
- [ ] Serve di `/api/docs`

---

## RINGKASAN PRIORITAS

| Prioritas | Kode | Judul | Perkiraan Waktu |
|-----------|------|-------|-----------------|
| 🔴 Kritis | SEC-01 | Rate Limiting | 1-2 jam |
| 🔴 Kritis | SEC-02 | JWT Secret Lemah | 15 menit |
| 🔴 Kritis | QC-05 | Enum Mismatch (BUG) | 30 menit |
| 🟠 Tinggi | SEC-03 | Refresh Token Secret Terpisah | 1 jam |
| 🟠 Tinggi | SEC-04 | Sanitasi Input XSS | 2 jam |
| 🟠 Tinggi | FE-01 | Ganti Password | 1 jam |
| 🟠 Tinggi | QC-02 | Request Logger | 30 menit |
| 🟡 Sedang | SEC-05 | Validasi MIME Type Upload | 30 menit |
| 🟡 Sedang | SEC-06 | Validasi Param ID | 1 jam |
| 🟡 Sedang | QC-01 | Prisma Graceful Shutdown | 30 menit |
| 🟡 Sedang | QC-04 | Kurangi `any` | 2 jam |
| 🟡 Sedang | QC-06 | Refactor Engine ke Service | 3 jam |
| 🟡 Sedang | QC-07 | Soft Delete Master Data | 1 jam |
| 🟡 Sedang | FE-02 | Admin Dashboard Summary | 1 jam |
| 🟡 Sedang | FE-04 | Soft Delete Soal | 30 menit |
| 🟡 Sedang | FE-05 | Search/Filter Soal Admin | 1 jam |
| 🟡 Sedang | INF-02 | CORS Whitelist | 30 menit |
| 🟢 Rendah | QC-03 | Hapus Duplikasi `serializeFormasi` | 15 menit |
| 🟢 Rendah | FE-03 | Upload Avatar | 1 jam |
| 🟢 Rendah | FE-06 | Bersihkan Orphan Files | 1 jam |
| 🟢 Rendah | INF-01 | `.env.example` | 15 menit |
| 🟢 Rendah | INF-03 | Compression Middleware | 15 menit |
| 🟢 Rendah | INF-04 | Swagger API Docs | 3 jam |

**Estimasi Total:** ~22 jam kerja

---

## URUTAN PENGERJAAN YANG DIREKOMENDASIKAN

1. **Sprint 1 (Hari 1):** SEC-02, QC-05, INF-01, QC-03 — Quick wins dan bug fix
2. **Sprint 2 (Hari 2):** SEC-01, QC-02, QC-01 — Keamanan dasar dan monitoring
3. **Sprint 3 (Hari 3):** SEC-03, SEC-04, SEC-05, SEC-06 — Hardening keamanan
4. **Sprint 4 (Hari 4):** FE-01, FE-02, FE-04, FE-05 — Fitur baru
5. **Sprint 5 (Hari 5):** QC-04, QC-06, QC-07 — Refaktoring kode
6. **Sprint 6 (Opsional):** INF-02, INF-03, INF-04, FE-03, FE-06 — Polish
