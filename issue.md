# FASE 1: Persiapan Fondasi & Server Utama — CPNS Training Backend

## 📋 Deskripsi

Setup fondasi backend agar server Express dapat hidup, terhubung ke database MySQL, memiliki error handling yang rapi, validasi request otomatis, dan siap menerima upload gambar. Setelah fase ini selesai, backend memiliki pondasi kokoh untuk membangun semua fitur di fase selanjutnya.

**Estimasi:** 1 hari kerja
**Prioritas:** ★★★★★ WAJIB PERTAMA

---

## 📌 Konteks Proyek Saat Ini

| Item | Detail |
|------|--------|
| **Database** | MySQL 8 di `localhost:33061`, database `cpns_training` |
| **Schema Prisma** | Sudah selesai (23 tabel), file `backend/prisma/schema.prisma` |
| **Prisma Config** | Sudah ada di `backend/prisma.config.ts` |
| **Module system** | CommonJS (`"type": "commonjs"` di package.json) |
| **TypeScript** | `module: "nodenext"`, `target: "esnext"` |

**Package yang sudah terinstall:**
- **Runtime:** express@5, cors, helmet, dotenv, bcrypt, jsonwebtoken, zod@4, @prisma/client
- **Dev:** typescript@6, ts-node-dev, prisma, jest, supertest, semua @types/*

**Environment variables (.env) yang sudah ada:**
```
DATABASE_URL="mysql://root:root@localhost:33061/cpns_training"
PORT=3000
JWT_SECRET=cpns-training-secret-key-2026
JWT_EXPIRY=1d
JWT_REFRESH_EXPIRY=7d
NODE_ENV=development
```

---

## ⚠️ ATURAN PENTING — WAJIB DIBACA SEBELUM MULAI

### 1. Prisma 7 — Driver Adapter Wajib

Prisma 7 TIDAK bisa di-inisialisasi dengan `new PrismaClient()` saja. Wajib pakai **Driver Adapter**.

```bash
# Install dulu, kalau belum ada:
npm install @prisma/adapter-mariadb mariadb
```

Inisialisasi PrismaClient yang BENAR untuk Prisma 7 + MySQL:
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';

const pool = mariadb.createPool({
  uri: process.env.DATABASE_URL,
});
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
```

> **CATATAN:** Meskipun nama package-nya "mariadb", ini 100% kompatibel dengan MySQL 8. Ini adalah driver adapter resmi dari Prisma untuk MySQL.

### 2. Dev Runner — Gunakan `tsx`

`ts-node-dev --esm` memiliki bug dengan ESM. Gunakan `tsx` sebagai gantinya:

```bash
npm install -D tsx
```

Script dev di package.json:
```json
"dev": "tsx watch src/server.ts"
```

### 3. Zod v4 — Perhatikan Import Path

Package `zod@4.x` yang terinstall memiliki import path khusus. Coba urutan berikut:
```typescript
// Coba ini dulu:
import { z } from 'zod';
// Jika error, gunakan:
import { z } from 'zod/v4';
```

### 4. JANGAN UBAH file berikut:
- ❌ `prisma/schema.prisma`
- ❌ `prisma.config.ts`
- ❌ `tsconfig.json`

### 5. File yang BOLEH diubah:
- ✅ `package.json` (bagian scripts, dependencies, prisma.seed)
- ✅ `.env` (tambah variabel jika perlu)
- ✅ `.gitignore` (tambah entry)

---

## 📁 Struktur File yang Harus Dibuat

```
backend/
├── src/
│   ├── app.ts                              # [Task 1]
│   ├── server.ts                           # [Task 2]
│   ├── config/
│   │   ├── env.ts                          # [Task 3]
│   │   └── constants.ts                    # [Task 4]
│   ├── lib/
│   │   └── prisma.ts                       # [Task 5]
│   ├── utils/
│   │   ├── response.ts                     # [Task 6]
│   │   ├── pagination.ts                   # [Task 7]
│   │   └── upload.ts                       # [Task 8]
│   ├── middlewares/
│   │   ├── error.middleware.ts             # [Task 9]
│   │   └── validate.middleware.ts          # [Task 10]
│   ├── types/
│   │   └── express.d.ts                    # [Task 11]
│   ├── controllers/                        # [Kosong dulu, struktur saja]
│   ├── services/                           # [Kosong dulu, struktur saja]
│   └── routes/                             # [Kosong dulu, struktur saja]
├── prisma/
│   ├── schema.prisma                       # ✅ SUDAH ADA (jangan ubah)
│   └── seed.ts                             # [Task 13]
├── uploads/                                # [Task 8] Folder upload (auto-create)
│   ├── soal/
│   ├── kontribusi/
│   └── laporan/
├── package.json                            # [Task 12] update scripts & deps
├── .env                                    # ✅ SUDAH ADA
├── .gitignore                              # [Task 12] tambah entry
└── prisma.config.ts                        # ✅ SUDAH ADA (jangan ubah)
```

---

## ✅ Daftar Task

---

### Task 1 — Buat `src/app.ts`

Setup Express 5 application dengan middleware keamanan dan health check.

**File:** `backend/src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { errorHandler } from './middlewares/error.middleware.js';
import { UPLOAD_DIR } from './config/constants.js';

const app = express();

// === Security Middleware ===
app.use(helmet());
app.use(cors());

// === Body Parsing ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// === Static Files (untuk akses gambar yang di-upload) ===
app.use('/static', express.static(path.resolve(UPLOAD_DIR)));

// === Health Check ===
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'CPNS Training API is running',
    data: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

// TODO: Register routes di sini nanti (fase berikutnya)
// import apiRouter from './routes/index.js';
// app.use('/api', apiRouter);

// === 404 Handler ===
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
  });
});

// === Global Error Handler (HARUS paling bawah) ===
app.use(errorHandler);

export default app;
```

---

### Task 2 — Buat `src/server.ts`

Entry point. Load env, test koneksi DB, start server.

**File:** `backend/src/server.ts`

```typescript
import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';
import prisma from './lib/prisma.js';

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start server
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`📋 Health check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

main();
```

---

### Task 3 — Buat `src/config/env.ts`

Validasi environment variables pakai Zod. Server HARUS gagal start jika env tidak valid.

**File:** `backend/src/config/env.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRY: z.string().default('1d'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
```

> **CATATAN:** Jika `import { z } from 'zod'` error, ganti ke `import { z } from 'zod/v4'`.

---

### Task 4 — Buat `src/config/constants.ts`

Konstanta global yang dipakai di seluruh aplikasi.

**File:** `backend/src/config/constants.ts`

```typescript
// ===== Upload Configuration =====
export const UPLOAD_DIR = 'uploads';
export const UPLOAD_SOAL_DIR = `${UPLOAD_DIR}/soal`;
export const UPLOAD_KONTRIBUSI_DIR = `${UPLOAD_DIR}/kontribusi`;
export const UPLOAD_LAPORAN_DIR = `${UPLOAD_DIR}/laporan`;
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg'];

// ===== Pagination Defaults =====
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// ===== Exam / Session =====
export const HEARTBEAT_TIMEOUT_SECONDS = 120;
export const HEARTBEAT_INTERVAL_SECONDS = 30;

// ===== Tingkat Penguasaan Thresholds (persentase benar) =====
export const PENGUASAAN_RENDAH = 40;
export const PENGUASAAN_SEDANG = 65;
export const PENGUASAAN_TINGGI = 85;
```

---

### Task 5 — Buat `src/lib/prisma.ts`

Single instance Prisma Client dengan **MariaDB Driver Adapter** (wajib untuk Prisma 7).

**File:** `backend/src/lib/prisma.ts`

**Sebelum membuat file ini, pastikan sudah install:**
```bash
npm install @prisma/adapter-mariadb mariadb
```

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';

const pool = mariadb.createPool({
  uri: process.env.DATABASE_URL,
});

const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
```

> **PENTING:** Jangan lupa jalankan `npx prisma generate` setelah install adapter agar client ter-regenerate.

---

### Task 6 — Buat `src/utils/response.ts`

Helper format API response yang konsisten.

**File:** `backend/src/utils/response.ts`

```typescript
/**
 * Format response sukses.
 * Contoh: res.status(200).json(successResponse(data, 'Berhasil'))
 */
export function successResponse<T>(data: T, message = 'Success') {
  return {
    success: true as const,
    message,
    data,
  };
}

/**
 * Format response error.
 * Contoh: res.status(400).json(errorResponse('Validasi gagal', errors))
 */
export function errorResponse(message: string, errors?: unknown) {
  return {
    success: false as const,
    message,
    ...(errors !== undefined && { errors }),
  };
}

/**
 * Format response dengan paginasi.
 * Contoh: res.json(paginatedResponse(items, total, page, limit))
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success',
) {
  return {
    success: true as const,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

### Task 7 — Buat `src/utils/pagination.ts`

Helper parsing parameter paginasi dari query string.

**File:** `backend/src/utils/pagination.ts`

```typescript
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../config/constants.js';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Parse pagination dari query string.
 *
 * Contoh di controller:
 *   const { page, limit, skip } = parsePagination(req.query);
 *   const users = await prisma.user.findMany({ skip, take: limit });
 */
export function parsePagination(query: Record<string, unknown>): PaginationParams {
  let page = Number(query.page) || DEFAULT_PAGE;
  let limit = Number(query.limit) || DEFAULT_LIMIT;

  if (page < 1) page = 1;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
```

---

### Task 8 — Buat `src/utils/upload.ts`

Setup Multer untuk upload gambar (.jpg only, max 2MB).

**File:** `backend/src/utils/upload.ts`

**Sebelum membuat file ini, pastikan sudah install:**
```bash
npm install multer
npm install -D @types/multer
```

```typescript
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  MAX_FILE_SIZE,
  UPLOAD_SOAL_DIR,
  UPLOAD_KONTRIBUSI_DIR,
  UPLOAD_LAPORAN_DIR,
} from '../config/constants.js';

// Pastikan folder upload ada
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Buat storage factory
function createStorage(destination: string) {
  ensureDir(destination);
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });
}

// Filter: hanya .jpg dan .jpeg
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file .jpg/.jpeg yang diizinkan'));
  }
};

// === Export upload instances per konteks ===

/** Upload gambar soal (pertanyaan, opsi, pembahasan) */
export const uploadSoal = multer({
  storage: createStorage(UPLOAD_SOAL_DIR),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/** Upload gambar kontribusi soal dari user */
export const uploadKontribusi = multer({
  storage: createStorage(UPLOAD_KONTRIBUSI_DIR),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/** Upload bukti screenshot laporan soal */
export const uploadLaporan = multer({
  storage: createStorage(UPLOAD_LAPORAN_DIR),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
```

---

### Task 9 — Buat `src/middlewares/error.middleware.ts`

Global error handler yang menangkap semua error secara rapi.

**File:** `backend/src/middlewares/error.middleware.ts`

```typescript
import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { errorResponse } from '../utils/response.js';

/**
 * Custom error class.
 * Contoh: throw new AppError('Email sudah terdaftar', 409);
 */
export class AppError extends Error {
  public statusCode: number;
  public errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'AppError';
  }
}

/**
 * Global error handler middleware.
 * HARUS di-register PALING AKHIR di app.ts.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log error (hanya di development)
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err);
  }

  // 1. Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message, err.errors));
    return;
  }

  // 2. Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[])?.join(', ') || 'unknown';
        res.status(409).json(errorResponse(`Data sudah ada (duplikat: ${target})`));
        return;
      }
      case 'P2025':
        res.status(404).json(errorResponse('Data tidak ditemukan'));
        return;
      case 'P2003':
        res.status(400).json(errorResponse('Referensi data tidak valid'));
        return;
      default:
        res.status(400).json(errorResponse(err.message));
        return;
    }
  }

  // 3. Prisma validation error
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json(errorResponse('Data yang dikirim tidak valid'));
    return;
  }

  // 4. Multer error (file upload)
  if (err.message?.includes('file') || err.message?.includes('File')) {
    res.status(400).json(errorResponse(err.message));
    return;
  }

  // 5. Error umum
  const message = process.env.NODE_ENV === 'development'
    ? err.message
    : 'Internal server error';
  res.status(500).json(errorResponse(message));
}
```

---

### Task 10 — Buat `src/middlewares/validate.middleware.ts`

Middleware validasi request pakai Zod.

**File:** `backend/src/middlewares/validate.middleware.ts`

```typescript
import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { errorResponse } from '../utils/response.js';

/** Validasi req.body */
export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      res.status(400).json(errorResponse('Validasi gagal', errors));
      return;
    }
    req.body = result.data;
    next();
  };
}

/** Validasi req.query */
export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      res.status(400).json(errorResponse('Parameter query tidak valid', errors));
      return;
    }
    req.query = result.data;
    next();
  };
}

/** Validasi req.params */
export function validateParams(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      res.status(400).json(errorResponse('Parameter URL tidak valid', errors));
      return;
    }
    req.params = result.data;
    next();
  };
}
```

> **CATATAN:** Jika `import type { ZodType } from 'zod'` error, ganti ke `import type { ZodType } from 'zod/v4'`.

---

### Task 11 — Buat `src/types/express.d.ts`

Extend interface Express Request agar mendukung `req.user` dan `req.admin`.

**File:** `backend/src/types/express.d.ts`

```typescript
import type { UserKategori, AdminRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        kategori: UserKategori;
      };
      admin?: {
        id: number;
        email: string;
        role: AdminRole;
      };
    }
  }
}

export {};
```

> **PENTING:** Baris `export {};` di akhir WAJIB ada.

---

### Task 12 — Update `package.json` & `.gitignore`

#### 12a — Install dependency baru
```bash
npm install @prisma/adapter-mariadb mariadb multer
npm install -D tsx @types/multer
```

#### 12b — Update `package.json` scripts

Ubah bagian `"scripts"` menjadi:
```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "seed": "tsx prisma/seed.ts",
  "test": "jest"
}
```

Tambahkan property `prisma` di level root (sejajar scripts):
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

#### 12c — Update `.gitignore`

Tambahkan baris berikut di akhir file:
```
uploads/
dist/
```

---

### Task 13 — Buat `prisma/seed.ts`

Script mengisi data master awal. Harus **idempotent** (bisa dijalankan berulang tanpa duplikasi).

**File:** `backend/prisma/seed.ts`

**Data yang harus di-seed:**

| Tabel | Jumlah | Detail |
|-------|--------|--------|
| kategori_soal | 3 | TIU (passing: 80), TWK (passing: 75), TKP (passing: 135) |
| jenis_soal | 15 | 5 TIU + 5 TWK + 5 TKP |
| admins | 1 | admin@cpns.com / admin123 / SUPER_ADMIN |
| tingkat_pendidikan | 6 | SMA/SMK, D3, D4, S1, S2, S3 |
| jurusan | 8 | Teknik Informatika, Sistem Informasi, dll |

```typescript
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';
import bcrypt from 'bcrypt';

const pool = mariadb.createPool({
  uri: process.env.DATABASE_URL,
});
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // === 1. Kategori Soal ===
  const kategoriData = [
    { kode: 'TIU', nama: 'Tes Intelegensia Umum', deskripsi: 'Mengukur kemampuan verbal, numerik, dan figural.', passing_grade: 80 },
    { kode: 'TWK', nama: 'Tes Wawasan Kebangsaan', deskripsi: 'Mengukur wawasan kebangsaan, integritas, dan bela negara.', passing_grade: 75 },
    { kode: 'TKP', nama: 'Tes Karakteristik Pribadi', deskripsi: 'Mengukur karakteristik pribadi dalam pelayanan publik.', passing_grade: 135 },
  ];

  for (const data of kategoriData) {
    await prisma.kategoriSoal.upsert({
      where: { kode: data.kode },
      update: data,
      create: data,
    });
  }
  console.log('  ✅ Kategori soal seeded (3 record)');

  // === 2. Jenis Soal ===
  const kategoriTIU = await prisma.kategoriSoal.findUnique({ where: { kode: 'TIU' } });
  const kategoriTWK = await prisma.kategoriSoal.findUnique({ where: { kode: 'TWK' } });
  const kategoriTKP = await prisma.kategoriSoal.findUnique({ where: { kode: 'TKP' } });

  if (!kategoriTIU || !kategoriTWK || !kategoriTKP) {
    throw new Error('Kategori soal tidak ditemukan.');
  }

  const jenisData = [
    { kategori_soal_id: kategoriTIU.id, nama: 'Verbal', deskripsi: 'Kemampuan memahami makna kata, sinonim, antonim.' },
    { kategori_soal_id: kategoriTIU.id, nama: 'Numerik', deskripsi: 'Kemampuan berhitung dan logika angka.' },
    { kategori_soal_id: kategoriTIU.id, nama: 'Figural', deskripsi: 'Kemampuan mengenali pola gambar dan figur.' },
    { kategori_soal_id: kategoriTIU.id, nama: 'Analogi', deskripsi: 'Kemampuan mencari hubungan kata/konsep.' },
    { kategori_soal_id: kategoriTIU.id, nama: 'Silogisme', deskripsi: 'Kemampuan penalaran logis dari premis.' },
    { kategori_soal_id: kategoriTWK.id, nama: 'Nasionalisme', deskripsi: 'Pemahaman nilai-nilai kebangsaan.' },
    { kategori_soal_id: kategoriTWK.id, nama: 'Integritas', deskripsi: 'Pemahaman tentang kejujuran dan etika.' },
    { kategori_soal_id: kategoriTWK.id, nama: 'Bela Negara', deskripsi: 'Pemahaman tentang pertahanan negara.' },
    { kategori_soal_id: kategoriTWK.id, nama: 'Pilar Negara', deskripsi: 'Pemahaman Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika.' },
    { kategori_soal_id: kategoriTWK.id, nama: 'Bahasa Indonesia', deskripsi: 'Kemampuan berbahasa Indonesia yang baik dan benar.' },
    { kategori_soal_id: kategoriTKP.id, nama: 'Pelayanan Publik', deskripsi: 'Sikap dalam melayani masyarakat.' },
    { kategori_soal_id: kategoriTKP.id, nama: 'Jejaring Kerja', deskripsi: 'Kemampuan kerjasama dan networking.' },
    { kategori_soal_id: kategoriTKP.id, nama: 'Sosial Budaya', deskripsi: 'Kepekaan terhadap sosial dan budaya.' },
    { kategori_soal_id: kategoriTKP.id, nama: 'TIK', deskripsi: 'Teknologi Informasi dan Komunikasi.' },
    { kategori_soal_id: kategoriTKP.id, nama: 'Profesionalisme', deskripsi: 'Sikap profesional dalam bekerja.' },
  ];

  for (const data of jenisData) {
    await prisma.jenisSoal.upsert({
      where: {
        kategori_soal_id_nama: {
          kategori_soal_id: data.kategori_soal_id,
          nama: data.nama,
        },
      },
      update: data,
      create: data,
    });
  }
  console.log('  ✅ Jenis soal seeded (15 record)');

  // === 3. Admin Default ===
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@cpns.com' },
    update: {},
    create: {
      nama: 'Super Admin',
      email: 'admin@cpns.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('  ✅ Admin default seeded (email: admin@cpns.com, pass: admin123)');

  // === 4. Tingkat Pendidikan ===
  const pendidikanData = [
    { nama: 'SMA/SMK', urutan: 1 },
    { nama: 'D3', urutan: 2 },
    { nama: 'D4', urutan: 3 },
    { nama: 'S1', urutan: 4 },
    { nama: 'S2', urutan: 5 },
    { nama: 'S3', urutan: 6 },
  ];

  for (const data of pendidikanData) {
    await prisma.tingkatPendidikan.upsert({
      where: { nama: data.nama },
      update: data,
      create: data,
    });
  }
  console.log('  ✅ Tingkat pendidikan seeded (6 record)');

  // === 5. Jurusan ===
  const jurusanData = [
    { nama: 'Teknik Informatika', rumpun: 'Sains & Teknologi' },
    { nama: 'Sistem Informasi', rumpun: 'Sains & Teknologi' },
    { nama: 'Ilmu Hukum', rumpun: 'Sosial Humaniora' },
    { nama: 'Akuntansi', rumpun: 'Ekonomi & Bisnis' },
    { nama: 'Manajemen', rumpun: 'Ekonomi & Bisnis' },
    { nama: 'Administrasi Publik', rumpun: 'Sosial Humaniora' },
    { nama: 'Ilmu Komunikasi', rumpun: 'Sosial Humaniora' },
    { nama: 'Teknik Sipil', rumpun: 'Sains & Teknologi' },
  ];

  for (const data of jurusanData) {
    const existing = await prisma.jurusan.findFirst({
      where: { nama: data.nama, rumpun: data.rumpun },
    });
    if (!existing) {
      await prisma.jurusan.create({ data });
    }
  }
  console.log('  ✅ Jurusan seeded (8 record)');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
```

---

## 🧪 Task 14 — Verifikasi & Testing

Setelah SEMUA task 1-13 selesai, lakukan pengujian:

### Test 1: Server berjalan
```bash
cd backend
npm run dev
```
**Ekspektasi:**
```
✅ Database connected successfully
🚀 Server running on http://localhost:3000
```

### Test 2: Health check
```bash
curl http://localhost:3000/api/health
```
**Ekspektasi:** JSON response dengan `"success": true`

### Test 3: 404 handler
```bash
curl http://localhost:3000/api/tidak-ada
```
**Ekspektasi:** JSON response dengan `"message": "Endpoint tidak ditemukan"`

### Test 4: Env validation
Kosongkan `JWT_SECRET` di `.env`, jalankan `npm run dev`.
**Ekspektasi:** Server GAGAL start dengan pesan error Zod.
**Kembalikan `JWT_SECRET` setelah test.**

### Test 5: Seed data
```bash
cd backend
npm run seed
```
**Ekspektasi:**
```
🌱 Starting seed...
  ✅ Kategori soal seeded (3 record)
  ✅ Jenis soal seeded (15 record)
  ✅ Admin default seeded
  ✅ Tingkat pendidikan seeded (6 record)
  ✅ Jurusan seeded (8 record)
🎉 Seed completed successfully!
```

### Test 6: Seed idempotent
Jalankan `npm run seed` lagi. **Ekspektasi:** Berhasil tanpa error duplikasi.

---

## 📂 File Yang Sudah Ada (JANGAN DIUBAH)

| File | Keterangan |
|------|------------|
| `prisma/schema.prisma` | Schema 23 tabel sudah selesai |
| `prisma.config.ts` | Konfigurasi Prisma 7 |
| `tsconfig.json` | TypeScript config |
| `.env` | Environment variables |

---

## 📎 Urutan Pengerjaan yang Disarankan

1. Install dependencies dulu (Task 12a)
2. Buat config & utils (Task 3, 4, 6, 7, 8) — tidak ada dependensi
3. Buat types (Task 11) — tidak ada dependensi
4. Buat prisma client (Task 5) — butuh adapter terinstall
5. Buat middlewares (Task 9, 10) — butuh utils/response
6. Buat app.ts (Task 1) — butuh middleware & constants
7. Buat server.ts (Task 2) — butuh app, env, prisma
8. Update package.json & gitignore (Task 12b, 12c)
9. Buat seed (Task 13) — butuh prisma client
10. Verifikasi semua (Task 14)
