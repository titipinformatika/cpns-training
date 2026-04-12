# 📢 FASE 7: FITUR SOSIAL & PELAPORAN + 🏆 FASE 8: KOMPETISI & LEADERBOARDS

---

# FASE 7: FITUR SOSIAL & PELAPORAN

## Deskripsi Umum

Fase ini menangani **interaksi komunitas** yang membantu memelihara kualitas soal dalam aplikasi. Fiturnya terbagi dua sisi:

1. **Sisi User**: Melaporkan soal bermasalah (typo, jawaban salah, gambar rusak) dan mengkontribusikan soal buatan sendiri.
2. **Sisi Admin**: Mereview laporan masuk dan meng-approve/reject kontribusi soal dari user.

> **⚠️ CATATAN PENTING:** Fase ini melibatkan **upload gambar**. Pastikan middleware Multer sudah berfungsi. Utility upload sudah tersedia di `backend/src/utils/upload.ts` (`uploadLaporan` dan `uploadKontribusi`).

---

## Checklist Tugas Fase 7

- [ ] **Task 7.1**: Endpoint `POST /laporan-soal` — User mengirim laporan soal
- [ ] **Task 7.2**: Endpoint `GET /admin/laporan-soal` — Admin melihat daftar laporan (paginasi)
- [ ] **Task 7.3**: Endpoint `PATCH /admin/laporan-soal/:id` — Admin review & ubah status laporan
- [ ] **Task 7.4**: Endpoint `POST /kontribusi-soal` — User mengirim kontribusi soal baru
- [ ] **Task 7.5**: Endpoint `GET /admin/kontribusi-soal` — Admin melihat daftar kontribusi (paginasi)
- [ ] **Task 7.6**: Endpoint `PATCH /admin/kontribusi-soal/:id` — Admin approve/reject kontribusi
- [ ] **Task 7.7**: Unit Test untuk seluruh fitur di atas

---

## Referensi Codebase (WAJIB BACA DULU)

| File | Fungsi | Kenapa Harus Dibaca |
|------|--------|---------------------|
| `backend/prisma/schema.prisma` | Skema database | Model `LaporanSoal`, `KontribusiSoal`, `Soal` |
| `backend/src/utils/upload.ts` | Multer upload | Instance `uploadLaporan` dan `uploadKontribusi` sudah siap pakai |
| `backend/src/utils/pagination.ts` | Helper paginasi | Fungsi `parsePagination()` untuk query list |
| `backend/src/utils/response.ts` | Helper response | `successResponse()`, `errorResponse()`, `paginatedResponse()` |
| `backend/src/middlewares/auth.middleware.ts` | Auth middleware | `authenticateUser`, `authenticateAdmin` untuk proteksi endpoint |
| `backend/src/config/constants.ts` | Konstanta | `UPLOAD_LAPORAN_DIR`, `UPLOAD_KONTRIBUSI_DIR`, `MAX_FILE_SIZE` |
| `backend/src/__tests__/backoffice.test.ts` | Contoh test | Pola penulisan test dengan mock Prisma yang benar |

---

## TASK 7.1: Endpoint `POST /laporan-soal` (User)

### Tujuan
User melaporkan soal yang bermasalah (misalnya: typo, jawaban salah, gambar rusak, dsb). Bisa menyertakan bukti screenshot.

### Request

```
POST /api/laporan-soal
Content-Type: multipart/form-data
Authorization: Bearer <user_token>
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `soal_id` | number | ✅ | ID soal yang dilaporkan |
| `jenis_laporan` | enum | ✅ | `JAWABAN_SALAH`, `SOAL_SALAH`, `TYPO`, `PEMBAHASAN_SALAH`, `GAMBAR_RUSAK`, `DUPLIKAT`, `LAINNYA` |
| `deskripsi` | string | ✅ | Penjelasan detail dari user (min 10 karakter) |
| `bukti_screenshot` | file | ❌ | File gambar .jpg/.jpeg (max 2MB) |

### Validasi Zod

```typescript
export const kirimLaporanSchema = z.object({
  soal_id: z.coerce.number().int().positive(),
  jenis_laporan: z.enum([
    'JAWABAN_SALAH', 'SOAL_SALAH', 'TYPO', 'PEMBAHASAN_SALAH',
    'GAMBAR_RUSAK', 'DUPLIKAT', 'LAINNYA'
  ]),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter'),
});
```

### Alur Logika

```
[1] Validasi: Apakah soal_id valid? (soal exists & is_active)
    │
[2] Cek duplikasi: Apakah user sudah pernah melaporkan soal ini dengan jenis yang sama?
    │   → Jika ya, tolak (400) "Anda sudah melaporkan soal ini sebelumnya"
    │
[3] Simpan gambar jika ada:
    │   → Menggunakan middleware `uploadLaporan.single('bukti_screenshot')`
    │   → Simpan path file ke kolom `bukti_screenshot`
    │
[4] Create record di tabel `laporan_soal`:
    │   - user_id = dari token
    │   - soal_id, jenis_laporan, deskripsi = dari body
    │   - bukti_screenshot = path file (atau null)
    │   - status = 'PENDING' (default)
    │
[5] Return response 201
```

### Response Sukses (201)

```json
{
  "success": true,
  "message": "Laporan berhasil dikirim",
  "data": {
    "id": 1,
    "soal_id": 42,
    "jenis_laporan": "TYPO",
    "deskripsi": "Opsi A ada typo 'mafaat' seharusnya 'manfaat'",
    "bukti_screenshot": "uploads/laporan/1712905200000-123456789.jpg",
    "status": "PENDING"
  }
}
```

### Middleware yang Dibutuhkan di Route

```typescript
router.post(
  '/',
  authenticateUser,
  uploadLaporan.single('bukti_screenshot'),  // upload dulu, baru validasi body
  validate(kirimLaporanSchema),
  laporanController.kirimLaporan
);
```

> **⚠️ PENTING**: `uploadLaporan.single()` harus dipasang **SEBELUM** `validate()` karena Multer harus parse `multipart/form-data` dulu sebelum body bisa divalidasi oleh Zod.

---

## TASK 7.2: Endpoint `GET /admin/laporan-soal` (Admin)

### Tujuan
Admin melihat daftar laporan masuk dengan paginasi dan filter.

### Request

```
GET /api/admin/laporan-soal?page=1&limit=10&status=PENDING
Authorization: Bearer <admin_token>
```

| Query Param | Tipe | Default | Keterangan |
|-------------|------|---------|------------|
| `page` | number | 1 | Halaman |
| `limit` | number | 10 | Jumlah per halaman |
| `status` | enum? | - | Filter: `PENDING`, `DITINJAU`, `DIPERBAIKI`, `DITOLAK` |

### Alur Logika

```typescript
const { page, limit, skip } = parsePagination(req.query);

const where: any = {};
if (req.query.status) {
  where.status = req.query.status;
}

const [data, total] = await Promise.all([
  prisma.laporanSoal.findMany({
    where,
    skip,
    take: limit,
    orderBy: { created_at: 'desc' },
    include: {
      user: { select: { id: true, nama: true, email: true } },
      soal: { select: { id: true, pertanyaan: true } },
    }
  }),
  prisma.laporanSoal.count({ where })
]);

res.json(paginatedResponse(data, total, page, limit));
```

---

## TASK 7.3: Endpoint `PATCH /admin/laporan-soal/:id` (Admin)

### Tujuan
Admin mereview laporan dan mengubah statusnya.

### Request Body

```typescript
export const reviewLaporanSchema = z.object({
  status: z.enum(['DITINJAU', 'DIPERBAIKI', 'DITOLAK']),
  review_note: z.string().optional(),
});
```

### Alur Logika

```
[1] Cari laporan berdasarkan ID (params)
    │
[2] Validasi: Apakah laporan ada?
    │
[3] Update laporan:
    │   - status = dari body
    │   - review_note = dari body (opsional)
    │   - reviewed_by = admin ID dari token
    │   - reviewed_at = new Date()
    │
[4] Return response 200
```

### Response Sukses (200)

```json
{
  "success": true,
  "message": "Status laporan berhasil diperbarui",
  "data": {
    "id": 1,
    "status": "DIPERBAIKI",
    "review_note": "Typo sudah diperbaiki di soal ID 42",
    "reviewed_by": 1,
    "reviewed_at": "2026-04-12T10:00:00.000Z"
  }
}
```

---

## TASK 7.4: Endpoint `POST /kontribusi-soal` (User)

### Tujuan
User mengirimkan soal buatan sendiri untuk ditinjau oleh admin. Mirip format tabel `Soal`, tapi statusnya `PENDING` sampai di-approve.

### Request

```
POST /api/kontribusi-soal
Content-Type: multipart/form-data
Authorization: Bearer <user_token>
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `kategori_soal_id` | number | ✅ | ID kategori (TIU/TWK/TKP) |
| `jenis_soal_id` | number | ✅ | ID jenis soal (Verbal, Numerik, dll) |
| `level` | enum | ✅ | `MUDAH`, `SEDANG`, `SULIT`, `HOST` |
| `pertanyaan` | string | ✅ | Teks pertanyaan |
| `opsi_a` s/d `opsi_e` | string | ✅ | Teks opsi jawaban |
| `jawaban_benar` | enum | ✅ | `A`, `B`, `C`, `D`, `E` |
| `pembahasan` | string | ❌ | Penjelasan jawaban |
| `pertanyaan_gambar` | file | ❌ | Gambar pertanyaan (.jpg) |
| `opsi_a_gambar` s/d `opsi_e_gambar` | file | ❌ | Gambar opsi (.jpg) |
| `pembahasan_gambar` | file | ❌ | Gambar pembahasan (.jpg) |

### Validasi Zod

```typescript
export const kirimKontribusiSchema = z.object({
  kategori_soal_id: z.coerce.number().int().positive(),
  jenis_soal_id: z.coerce.number().int().positive(),
  level: z.enum(['MUDAH', 'SEDANG', 'SULIT', 'HOST']),
  pertanyaan: z.string().min(5, 'Pertanyaan terlalu pendek'),
  opsi_a: z.string().min(1),
  opsi_b: z.string().min(1),
  opsi_c: z.string().min(1),
  opsi_d: z.string().min(1),
  opsi_e: z.string().min(1),
  jawaban_benar: z.enum(['A', 'B', 'C', 'D', 'E']),
  pembahasan: z.string().optional(),
});
```

### Alur Logika

```
[1] Validasi: Apakah kategori_soal_id & jenis_soal_id valid?
    │
[2] Simpan gambar jika ada (multiple files):
    │   → Menggunakan uploadKontribusi.fields([
    │       { name: 'pertanyaan_gambar', maxCount: 1 },
    │       { name: 'opsi_a_gambar', maxCount: 1 },
    │       ... (sampai opsi_e_gambar & pembahasan_gambar)
    │     ])
    │
[3] Create record di tabel `kontribusi_soal`:
    │   - user_id = dari token
    │   - semua field dari body & path gambar
    │   - status = 'PENDING' (default)
    │
[4] Return response 201
```

### Middleware di Route (Multi-file Upload)

```typescript
router.post(
  '/',
  authenticateUser,
  uploadKontribusi.fields([
    { name: 'pertanyaan_gambar', maxCount: 1 },
    { name: 'opsi_a_gambar', maxCount: 1 },
    { name: 'opsi_b_gambar', maxCount: 1 },
    { name: 'opsi_c_gambar', maxCount: 1 },
    { name: 'opsi_d_gambar', maxCount: 1 },
    { name: 'opsi_e_gambar', maxCount: 1 },
    { name: 'pembahasan_gambar', maxCount: 1 },
  ]),
  validate(kirimKontribusiSchema),
  kontribusiController.kirimKontribusi
);
```

### Tips: Cara Mengambil Path File dari Multer

```typescript
// Setelah uploadKontribusi.fields(), file ada di req.files
const files = req.files as { [fieldname: string]: Express.Multer.File[] };

const pertanyaanGambar = files?.pertanyaan_gambar?.[0]?.path ?? null;
const opsiAGambar = files?.opsi_a_gambar?.[0]?.path ?? null;
// ... dan seterusnya
```

---

## TASK 7.5: Endpoint `GET /admin/kontribusi-soal` (Admin)

### Tujuan
Admin melihat daftar kontribusi soal dari user, dengan paginasi dan filter status.

### Request

```
GET /api/admin/kontribusi-soal?page=1&limit=10&status=PENDING
Authorization: Bearer <admin_token>
```

### Alur Logika

Sama persis polanya dengan Task 7.2 (`GET /admin/laporan-soal`), cukup ganti model dari `laporanSoal` → `kontribusiSoal`.

```typescript
const data = await prisma.kontribusiSoal.findMany({
  where,
  skip,
  take: limit,
  orderBy: { created_at: 'desc' },
  include: {
    user: { select: { id: true, nama: true } },
    kategori_soal: { select: { kode: true, nama: true } },
    jenis_soal: { select: { nama: true } },
  }
});
```

---

## TASK 7.6: Endpoint `PATCH /admin/kontribusi-soal/:id` (Admin Approve/Reject)

### Tujuan
Admin meng-approve atau me-reject kontribusi soal dari user.

> **⚠️ INI ADALAH TASK PALING KRITIS DI FASE 7**: Jika admin meng-**APPROVE**, maka data dari `kontribusi_soal` harus **otomatis di-copy** menjadi record baru di tabel `soal`.

### Request Body

```typescript
export const reviewKontribusiSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  review_note: z.string().optional(),
  bank_soal_id: z.coerce.number().int().positive().optional(),
  // bank_soal_id WAJIB jika status = APPROVED (di mana soal akan dimasukkan?)
});
```

### Alur Logika (dengan Diagram)

```
Admin klik Approve/Reject
    │
    ▼
[1] Cari kontribusi berdasarkan ID
    │
[2] Validasi: Status masih PENDING?
    │   → Jika sudah APPROVED/REJECTED, tolak (400)
    │
[3] Cek status:
    │
    ├─── Jika REJECTED ─────────────────────┐
    │                                        │
    │   [3a] Update kontribusi_soal:         │
    │     - status = 'REJECTED'              │
    │     - review_note, reviewed_by,        │
    │       reviewed_at                      │
    │   Return response 200                  │
    │                                        │
    └─── Jika APPROVED ─────────────────────┐
                                             │
        [3b] Validasi: bank_soal_id wajib!   │
          │                                  │
        [3c] Transaction:                    │
          │                                  │
          │  ① CREATE record baru di         │
          │    tabel `soal`:                  │
          │    - Copy semua field dari        │
          │      kontribusi (pertanyaan,      │
          │      opsi, jawaban, gambar, dll)  │
          │    - bank_soal_id = dari body     │
          │    - created_by_admin = admin ID  │
          │                                  │
          │  ② UPDATE kontribusi_soal:        │
          │    - status = 'APPROVED'          │
          │    - soal_id = ID soal baru (①)   │
          │    - review_note, reviewed_by,    │
          │      reviewed_at                  │
          │                                  │
        Return response 200 + data soal baru │
```

### Pseudocode untuk Approve

```typescript
const result = await prisma.$transaction(async (tx) => {
  // ① Copy ke tabel Soal
  const soalBaru = await tx.soal.create({
    data: {
      bank_soal_id: body.bank_soal_id,
      kategori_soal_id: kontribusi.kategori_soal_id,
      jenis_soal_id: kontribusi.jenis_soal_id,
      level: kontribusi.level,
      pertanyaan: kontribusi.pertanyaan,
      pertanyaan_gambar: kontribusi.pertanyaan_gambar,
      opsi_a: kontribusi.opsi_a,
      opsi_a_gambar: kontribusi.opsi_a_gambar,
      opsi_b: kontribusi.opsi_b,
      opsi_b_gambar: kontribusi.opsi_b_gambar,
      opsi_c: kontribusi.opsi_c,
      opsi_c_gambar: kontribusi.opsi_c_gambar,
      opsi_d: kontribusi.opsi_d,
      opsi_d_gambar: kontribusi.opsi_d_gambar,
      opsi_e: kontribusi.opsi_e,
      opsi_e_gambar: kontribusi.opsi_e_gambar,
      jawaban_benar: kontribusi.jawaban_benar,
      pembahasan: kontribusi.pembahasan,
      pembahasan_gambar: kontribusi.pembahasan_gambar,
      created_by_admin: adminId,
    }
  });

  // ② Update status kontribusi
  await tx.kontribusiSoal.update({
    where: { id: kontribusiId },
    data: {
      status: 'APPROVED',
      soal_id: soalBaru.id,
      reviewed_by: adminId,
      review_note: body.review_note ?? null,
      reviewed_at: new Date(),
    }
  });

  return soalBaru;
});
```

---

## TASK 7.7: Unit Test Fase 7

### File Target
Buat file baru: `backend/src/__tests__/sosial-pelaporan.test.ts`

### Test Cases Minimum

```typescript
describe('Laporan Soal', () => {
  it('harus berhasil mengirim laporan soal', async () => { ... });
  it('harus menolak jika soal tidak ditemukan', async () => { ... });
  it('harus menolak laporan duplikat (soal + jenis sama)', async () => { ... });
});

describe('Admin Review Laporan', () => {
  it('harus berhasil mengubah status laporan', async () => { ... });
  it('harus menolak jika laporan tidak ditemukan', async () => { ... });
});

describe('Kontribusi Soal', () => {
  it('harus berhasil mengirim kontribusi soal', async () => { ... });
  it('harus menolak jika kategori/jenis tidak valid', async () => { ... });
});

describe('Admin Review Kontribusi', () => {
  it('harus copy ke tabel soal jika APPROVED', async () => {
    // Assert: prisma.soal.create dipanggil dengan data yang dicopy
    // Assert: kontribusi.soal_id = soal baru
  });
  it('harus menolak approve tanpa bank_soal_id', async () => { ... });
  it('harus update status ke REJECTED tanpa copy', async () => { ... });
});
```

### Pola Mock yang Digunakan

```typescript
// ✅ Pola yang sudah terbukti tidak error TypeScript:
jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
  return callback(prisma);
});
jest.spyOn(prisma.soal, 'create').mockResolvedValue({ id: 999, ... } as any);
jest.spyOn(prisma.kontribusiSoal, 'update').mockResolvedValue({} as any);
```

---

## Dimana Menambahkan Kode (Fase 7)

| Apa | File |
|-----|------|
| Validator | `backend/src/validators/sosial.validator.ts` **(NEW)** |
| Controller Laporan | `backend/src/controllers/laporan-soal.controller.ts` **(NEW)** |
| Controller Kontribusi | `backend/src/controllers/kontribusi-soal.controller.ts` **(NEW)** |
| Route Laporan (User) | `backend/src/routes/laporan-soal.routes.ts` **(NEW)** |
| Route Kontribusi (User) | `backend/src/routes/kontribusi-soal.routes.ts` **(NEW)** |
| Route Admin Laporan | `backend/src/routes/admin-laporan.routes.ts` **(NEW)** |
| Route Admin Kontribusi | `backend/src/routes/admin-kontribusi.routes.ts` **(NEW)** |
| Register di Router Utama | `backend/src/routes/index.ts` (tambahkan import & mount) |
| Unit Test | `backend/src/__tests__/sosial-pelaporan.test.ts` **(NEW)** |

---
---

# FASE 8: KOMPETISI & LEADERBOARDS 🏆

## Deskripsi Umum

Fase ini mengimplementasikan fitur **perbandingan skor** antar user. Terdapat dua jenis leaderboard:

1. **Leaderboard Global**: Ranking semua user berdasarkan `skor_total` tertinggi pada ujian tertentu.
2. **Leaderboard Pesaing Formasi**: Ranking user yang mendaftar di **instansi + formasi yang sama** — sehingga user bisa melihat posisinya di antara "pesaing nyata" CPNS.

---

## Checklist Tugas Fase 8

- [ ] **Task 8.1**: Endpoint `GET /leaderboard/global` — Ranking global per ujian
- [ ] **Task 8.2**: Endpoint `GET /leaderboard/formasi` — Ranking antar pesaing se-formasi
- [ ] **Task 8.3**: Unit Test untuk kedua endpoint

---

## TASK 8.1: Endpoint `GET /leaderboard/global`

### Tujuan
Menampilkan ranking user berdasarkan **skor_total tertinggi** pada ujian tertentu.

### Request

```
GET /api/leaderboard/global?ujian_id=1&page=1&limit=20
Authorization: Bearer <user_token>
```

| Query Param | Tipe | Wajib | Default | Keterangan |
|-------------|------|-------|---------|------------|
| `ujian_id` | number | ✅ | - | ID ujian yang ingin dilihat |
| `page` | number | ❌ | 1 | Halaman |
| `limit` | number | ❌ | 20 | Jumlah per halaman |

### Alur Logika

```typescript
// 1. Untuk setiap user, ambil skor_total TERTINGGI pada ujian ini
const rankings = await prisma.hasilUjian.findMany({
  where: {
    ujian_id: Number(req.query.ujian_id),
    status: 'SELESAI',  // Hanya yang sudah selesai
  },
  select: {
    user_id: true,
    skor_total: true,
    skor_tiu: true,
    skor_twk: true,
    skor_tkp: true,
    is_lulus: true,
    waktu_selesai: true,
    durasi_detik: true,
    user: { select: { id: true, nama: true, avatar: true } },
  },
  orderBy: [
    { skor_total: 'desc' },
    { durasi_detik: 'asc' },  // Tie-breaker: durasi lebih cepat = ranking lebih tinggi
  ],
  distinct: ['user_id'],  // Hanya skor tertinggi per user
  skip,
  take: limit,
});
```

> **⚠️ CATATAN tentang `distinct`**: Prisma `distinct` mengambil row pertama per `user_id` setelah di-sort. Karena kita sort `skor_total desc`, maka otomatis yang terambil adalah skor tertinggi tiap user.

### Response

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "ranking": 1,
      "user": { "id": 5, "nama": "Andi", "avatar": null },
      "skor_total": 420,
      "skor_tiu": 140,
      "skor_twk": 130,
      "skor_tkp": 150,
      "is_lulus": true,
      "durasi_detik": 4200
    },
    {
      "ranking": 2,
      "user": { "id": 12, "nama": "Budi", "avatar": null },
      "skor_total": 415,
      "skor_tiu": 135,
      "skor_twk": 120,
      "skor_tkp": 160,
      "is_lulus": true,
      "durasi_detik": 5100
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}
```

### Tips: Tambahkan Nomor Ranking

```typescript
const withRanking = rankings.map((item, index) => ({
  ranking: skip + index + 1,  // Nomor ranking berdasarkan posisi + offset paginasi
  ...item,
}));
```

---

## TASK 8.2: Endpoint `GET /leaderboard/formasi`

### Tujuan
Menampilkan ranking user yang mendaftar di **instansi dan formasi yang sama** dengan user yang sedang login. Ini meniru fitur "lihat pesaing saya" pada aplikasi CPNS populer.

### Request

```
GET /api/leaderboard/formasi?ujian_id=1&page=1&limit=20
Authorization: Bearer <user_token>
```

### Alur Logika (Step-by-Step)

```
[1] Ambil biodata user yang login:
    │   const biodata = await prisma.biodataUser.findUnique({
    │     where: { user_id: userId }
    │   });
    │
[2] Validasi: Apakah user sudah mengisi instansi_id DAN formasi_id?
    │   → Jika belum, return 400: "Lengkapi biodata (instansi & formasi) terlebih dahulu"
    │
[3] Cari semua user_id yang memiliki instansi & formasi yang sama:
    │   const pesaing = await prisma.biodataUser.findMany({
    │     where: {
    │       instansi_id: biodata.instansi_id,
    │       formasi_id: biodata.formasi_id,
    │     },
    │     select: { user_id: true }
    │   });
    │   const pesaingIds = pesaing.map(p => p.user_id);
    │
[4] Query leaderboard seperti Task 8.1, tapi tambah filter:
    │   where: {
    │     ujian_id: ...,
    │     status: 'SELESAI',
    │     user_id: { in: pesaingIds },  // ← ini kuncinya!
    │   }
    │
[5] Return response dengan ranking + informasi formasi
```

### Response

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "formasi_info": {
      "instansi": "Kementerian Keuangan",
      "jabatan": "Analis Kebijakan",
      "jumlah_pesaing": 42
    },
    "rankings": [
      {
        "ranking": 1,
        "user": { "id": 5, "nama": "Andi" },
        "skor_total": 420,
        "is_lulus": true
      }
    ]
  },
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

---

## TASK 8.3: Unit Test Fase 8

### File Target
Buat file baru: `backend/src/__tests__/leaderboard.test.ts`

### Test Cases Minimum

```typescript
describe('Leaderboard Global', () => {
  it('harus menampilkan ranking berdasarkan skor_total tertinggi', async () => {
    // Mock hasilUjian.findMany → sorted by skor_total desc
    // Assert: ranking[0].skor_total >= ranking[1].skor_total
  });
  it('harus menolak jika ujian_id tidak diberikan', async () => { ... });
});

describe('Leaderboard Formasi', () => {
  it('harus hanya menampilkan user dengan instansi & formasi yang sama', async () => {
    // Mock biodataUser.findUnique → { instansi_id: 1, formasi_id: 2 }
    // Mock biodataUser.findMany → list of user_ids
    // Assert: setiap ranking item user_id ada di pesaingIds
  });
  it('harus menolak jika user belum mengisi biodata', async () => {
    // Mock biodataUser.findUnique → null
    // Assert: HTTP 400
  });
  it('harus menolak jika instansi/formasi belum diisi', async () => {
    // Mock biodataUser.findUnique → { instansi_id: null, formasi_id: null }
    // Assert: HTTP 400
  });
});
```

---

## Dimana Menambahkan Kode (Fase 8)

| Apa | File |
|-----|------|
| Validator | `backend/src/validators/leaderboard.validator.ts` **(NEW)** |
| Controller | `backend/src/controllers/leaderboard.controller.ts` **(NEW)** |
| Route | `backend/src/routes/leaderboard.routes.ts` **(NEW)** |
| Register di Router Utama | `backend/src/routes/index.ts` (tambahkan import & mount) |
| Unit Test | `backend/src/__tests__/leaderboard.test.ts` **(NEW)** |

---
---

# CATATAN PENTING & SARAN PRAKTIS (BEST PRACTICES)

## 1. 🔒 HATI-HATI PADA ENGINE UJIAN (Fase 5)
Jangan pernah meletakan state "Berapa lama waktu tersisa" hanya di Frontend/Browser karena mudah diretas. Selalu validasi `waktu_mulai` & `durasi_ujian` berpedoman ke **backend timestamp**. Ini sudah dihandle di controller `heartbeat()` dan `checkAndHandleTimeout()`.

## 2. 📄 PAGINASI
Gunakan Prisma `skip` & `take`, manfaatkan utilitas `parsePagination()` dari `backend/src/utils/pagination.ts` di setiap request `GET` yang mengembalikan daftar (list laporan, list kontribusi, leaderboard, dll). Selalu gunakan `paginatedResponse()` dari `response.ts` untuk format response.

## 3. 🖼️ ISOLATE DATABASE & IMAGE
Gambar soal, kontribusi, dan laporan disimpan di folder `uploads/...` yang dikonfigurasi di `config/constants.ts`. Pastikan Express sudah menserve folder ini secara statis:
```typescript
app.use('/static', express.static('uploads'));
```
Ini memungkinkan frontend mengakses gambar via URL: `/static/laporan/filename.jpg`.

## 4. 🗑️ SOFT DELETE
Kolom `is_active` digunakan untuk Soft Deletion. Jangan pernah `DELETE` record soal secara permanen karena bisa merusak foreign key pada `jawaban_ujian` dan `hasil_ujian`. Gunakan:
```typescript
await prisma.soal.update({
  where: { id },
  data: { is_active: false }
});
```

## 5. 🧪 POLA MOCK TESTING YANG BENAR
Selalu gunakan pola ini untuk mock transaksi Prisma agar **tidak ada error TypeScript**:
```typescript
// ✅ BENAR
jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
  return callback(prisma);
});

// ❌ SALAH — menyebabkan error "never"
jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
  return callback({ soal: { create: jest.fn() } });
});
```

---

# Definisi "Selesai" untuk Issue Ini

## Fase 7 dianggap DONE jika:
1. ✅ User bisa mengirim laporan soal (dengan/tanpa screenshot).
2. ✅ Admin bisa melihat daftar laporan dan mengubah statusnya.
3. ✅ User bisa mengirim kontribusi soal.
4. ✅ Admin bisa approve kontribusi → data otomatis dicopy ke tabel `soal`.
5. ✅ Admin bisa reject kontribusi.
6. ✅ Semua unit test PASSED.
7. ✅ `tsc --noEmit` menghasilkan **0 error**.

## Fase 8 dianggap DONE jika:
1. ✅ Leaderboard global menampilkan ranking per ujian berdasarkan skor tertinggi.
2. ✅ Leaderboard formasi hanya menampilkan pesaing se-instansi + se-formasi.
3. ✅ Error yang tepat jika user belum mengisi biodata.
4. ✅ Semua unit test PASSED.
5. ✅ `tsc --noEmit` menghasilkan **0 error**.
