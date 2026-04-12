# 🔴 ISSUE: CORE ENGINE - SIMULASI UJIAN (FASE 5 - KRITIS)

> **Prioritas:** 🔴 KRITIS  
> **Tanggal dibuat:** 2026-04-12  
> **Status:** Belum Dikerjakan  
> **Prasyarat:** Fase 1–4 sudah selesai (Auth, Master Data, Backoffice)

---

## Deskripsi Umum

Ini adalah **jantung utama** aplikasi CPNS Training — yaitu Engine Simulasi Ujian.  
Fitur ini memungkinkan user memulai ujian, menjawab soal, dan waktu dikelola di sisi server.

**⚠️ SANGAT SENSITIF:** Semua logika waktu WAJIB dikelola di backend. Jangan pernah percaya timer dari frontend/browser karena mudah diretas.

---

## Konteks Teknis (Baca Dulu Sebelum Ngoding)

### Stack yang Dipakai
- **Runtime:** Node.js + Express + TypeScript
- **ORM:** Prisma
- **Validasi:** Zod (via `validate.middleware.ts`)
- **Auth:** JWT (middleware sudah ada di `auth.middleware.ts`)
- **Response format:** Gunakan `successResponse()` dan `errorResponse()` dari `utils/response.ts`

### Pola Kode yang Sudah Ada (Wajib Diikuti)
Lihat contoh file yang sudah ada sebagai referensi pola:
- **Controller:** `controllers/admin-paket-ujian.controller.ts`
- **Routes:** `routes/admin-backoffice.routes.ts`
- **Validator:** `validators/backoffice.validator.ts`
- **Middleware Auth:** `middlewares/auth.middleware.ts`

Semua endpoint user WAJIB pakai middleware `authenticateUser` (sudah tersedia).

### Tabel Database yang Terlibat
Referensi lengkap: baca file `rancangan_database.txt`

| Tabel | Kegunaan |
|---|---|
| `ujian` | Paket ujian (durasi, tipe, peruntukan) |
| `ujian_soal` | Mapping soal ke ujian + nomor urut + skor |
| `ujian_soal_skor_tkp` | Skor khusus TKP per opsi (A=1, B=3, dst.) |
| `hasil_ujian` | Record utama: skor, status (BERLANGSUNG/SELESAI/TIMEOUT), waktu mulai/selesai |
| `jawaban_ujian` | Jawaban per soal: opsi dipilih, is_ragu, skor_diperoleh |
| `sesi_ujian` | Heartbeat engine: sisa waktu, last_heartbeat, status sesi, IP |

### Konstanta yang Sudah Disiapkan (di `config/constants.ts`)
```typescript
HEARTBEAT_TIMEOUT_SECONDS = 120   // Batas toleransi timeout heartbeat
HEARTBEAT_INTERVAL_SECONDS = 30   // Interval heartbeat dari frontend
```

### Enum yang Relevan
```
StatusHasilUjian: BERLANGSUNG | SELESAI | TIMEOUT
StatusSesi: AKTIF | TERPUTUS | DILANJUTKAN | SELESAI
JawabanOpsi: A | B | C | D | E
```

---

## File yang Harus Dibuat

| File | Path |
|---|---|
| Controller | `src/controllers/ujian-engine.controller.ts` |
| Routes | `src/routes/ujian-engine.routes.ts` |
| Validator | `src/validators/ujian-engine.validator.ts` |
| Register route | Update `src/routes/index.ts` → tambahkan route `/ujian` |

---

## Checklist Task

### ✅ Task 1: Endpoint `POST /ujian/mulai`

**Tujuan:** User memulai ujian. Server meng-generate sesi ujian baru.

**Request Body:**
```json
{
  "ujian_id": 5
}
```

**Logika yang harus dilakukan (urut):**
1. Validasi `ujian_id` ada dan `is_active = true`.
2. Cek apakah user ini sudah punya `hasil_ujian` dengan `status = BERLANGSUNG` untuk ujian yang sama. **Jika sudah ada → tolak** (respon error: "Anda masih memiliki ujian yang sedang berlangsung").
3. Hitung `percobaan_ke` = jumlah `hasil_ujian` user untuk `ujian_id` ini + 1.
4. Ambil semua `ujian_soal` yang terhubung dengan ujian ini, hitung `total_soal`.
5. Buat record di tabel `hasil_ujian`:
   ```
   user_id        = dari req.user.id
   ujian_id       = dari body
   percobaan_ke   = hasil hitungan step 3
   total_soal     = hasil hitungan step 4
   jumlah_dijawab = 0
   jumlah_benar   = 0
   jumlah_salah   = 0
   jumlah_kosong  = total_soal
   skor_tiu/twk/tkp/total = 0
   status         = BERLANGSUNG
   waktu_mulai    = new Date()  ← waktu server!
   durasi_detik   = ujian.durasi_menit * 60
   ```
6. Buat record di tabel `sesi_ujian`:
   ```
   hasil_ujian_id     = id dari step 5
   user_id            = req.user.id
   ujian_id           = dari body
   nomor_soal_terakhir = 1
   sisa_waktu_detik   = ujian.durasi_menit * 60
   total_terjawab     = 0
   total_belum_jawab  = total_soal
   total_ragu         = 0
   status_sesi        = AKTIF
   last_heartbeat     = new Date()
   ip_address         = req.ip
   user_agent         = req.headers['user-agent']
   jumlah_resume      = 0
   ```
7. Ambil daftar soal (tanpa `jawaban_benar` dan `pembahasan`) untuk dikirim ke frontend.

**Gunakan `prisma.$transaction()`** untuk memastikan step 5-6 atomic.

**Response Sukses (201):**
```json
{
  "success": true,
  "message": "Ujian berhasil dimulai",
  "data": {
    "hasil_ujian_id": 123,
    "sesi_ujian_id": 456,
    "sisa_waktu_detik": 6000,
    "total_soal": 100,
    "soal_list": [
      {
        "ujian_soal_id": 1,
        "nomor_urut": 1,
        "pertanyaan": "...",
        "pertanyaan_gambar": null,
        "opsi_a": "...",
        "opsi_b": "...",
        "opsi_c": "...",
        "opsi_d": "...",
        "opsi_e": "...",
        "opsi_a_gambar": null,
        "kategori_soal": "TIU"
      }
    ]
  }
}
```

> **⚠️ PENTING:** Jangan kirim field `jawaban_benar`, `pembahasan`, dan `pembahasan_gambar` ke response! Ini bisa dieksploitasi user.

---

### ✅ Task 2: Endpoint `POST /ujian/heartbeat`

**Tujuan:** Frontend mengirim "saya masih aktif" setiap 30 detik. Server menghitung sisa waktu yang sebenarnya.

**Request Body:**
```json
{
  "hasil_ujian_id": 123
}
```

**Logika yang harus dilakukan:**
1. Cari `sesi_ujian` berdasarkan `hasil_ujian_id` dan pastikan `user_id == req.user.id`.
2. Cari `hasil_ujian` terkait. Pastikan `status = BERLANGSUNG`, jika tidak → tolak.
3. **Hitung sisa waktu dari sisi server:**
   ```
   waktu_berlalu_detik = (Date.now() - hasil_ujian.waktu_mulai) / 1000
   sisa_waktu_detik = hasil_ujian.durasi_detik - waktu_berlalu_detik
   ```
4. **Jika `sisa_waktu_detik <= 0`:** Waktu sudah habis!
   - Update `hasil_ujian.status` → `TIMEOUT`
   - Update `hasil_ujian.waktu_selesai` → `new Date()`
   - Update `sesi_ujian.status_sesi` → `SELESAI`
   - Update `sesi_ujian.sisa_waktu_detik` → `0`
   - Return response dengan status "TIMEOUT"
5. **Jika masih ada waktu:**
   - Update `sesi_ujian.last_heartbeat` → `new Date()`
   - Update `sesi_ujian.sisa_waktu_detik` → hasil hitungan step 3
   - Update `sesi_ujian.ip_address` dan `user_agent` (bisa berubah jika pindah device)

**Response Sukses (200):**
```json
{
  "success": true,
  "message": "Heartbeat OK",
  "data": {
    "sisa_waktu_detik": 5970,
    "status": "AKTIF"
  }
}
```

**Response Jika Waktu Habis (200):**
```json
{
  "success": true,
  "message": "Waktu ujian telah habis",
  "data": {
    "sisa_waktu_detik": 0,
    "status": "TIMEOUT"
  }
}
```

---

### ✅ Task 3: Endpoint `POST /ujian/jawab`

**Tujuan:** Menyimpan jawaban user untuk 1 soal. Bisa dipanggil berkali-kali (update jawaban).

**Request Body:**
```json
{
  "hasil_ujian_id": 123,
  "ujian_soal_id": 45,
  "jawaban": "B",
  "is_ragu": false
}
```

> **Catatan:** `jawaban` boleh `null` (artinya user menghapus jawaban / mengosongkan).

**Logika yang harus dilakukan:**
1. Validasi `hasil_ujian_id` milik `req.user.id` dan `status = BERLANGSUNG`.
2. **Cek waktu masih valid** (hitung seperti di heartbeat). Jika waktu habis → tolak, return error "Waktu ujian telah habis".
3. Validasi `ujian_soal_id` memang terdaftar di ujian ini (via tabel `ujian_soal` dimana `ujian_id` sama).
4. Cek apakah sudah ada record di `jawaban_ujian` untuk kombinasi `hasil_ujian_id + ujian_soal_id`:
   - **Jika belum ada → `create`**
   - **Jika sudah ada → `update`**
5. Tentukan `is_benar` dan `skor_diperoleh`:
   - **Jika `jawaban = null`** → `is_benar = null`, `skor_diperoleh = 0`
   - **Jika soal bertipe TKP** (cek via `ujian_soal.soal.kategori_soal.kode == 'TKP'`):
     - Ambil `ujian_soal_skor_tkp`, lalu `skor_diperoleh = skor_tkp['skor_' + jawaban.toLowerCase()]`
     - TKP tidak ada konsep benar/salah, set `is_benar = null`
   - **Jika soal bukan TKP** (TIU/TWK):
     - `is_benar = (jawaban == soal.jawaban_benar)`
     - `skor_diperoleh = is_benar ? ujian_soal.skor : 0`
6. Simpan data jawaban:
   ```
   jawaban_user     = jawaban (atau null)
   is_benar         = hasil step 5
   skor_diperoleh   = hasil step 5
   is_ragu          = dari body
   waktu_jawab_detik = hitung berapa detik sejak ujian dimulai
   ```
7. **Update counter di `sesi_ujian`** (hitung ulang dari database untuk akurasi):
   ```sql
   total_terjawab   = COUNT jawaban_ujian WHERE jawaban_user IS NOT NULL
   total_belum_jawab = total_soal - total_terjawab
   total_ragu       = COUNT jawaban_ujian WHERE is_ragu = true
   ```
8. **Update counter di `hasil_ujian`** juga:
   ```
   jumlah_dijawab = total_terjawab
   jumlah_kosong  = total_belum_jawab
   ```

**Response Sukses (200):**
```json
{
  "success": true,
  "message": "Jawaban berhasil disimpan",
  "data": {
    "ujian_soal_id": 45,
    "jawaban_user": "B",
    "is_ragu": false,
    "total_terjawab": 15,
    "total_belum_jawab": 85,
    "total_ragu": 3
  }
}
```

---

### ✅ Task 4: Logika Pemutusan Ujian Otomatis (Heartbeat Timeout)

**Tujuan:** Jika user menghilang (browser crash, internet putus, dll), server harus otomatis menghentikan ujian setelah batas toleransi.

**Cara implementasi** — Tidak perlu membuat cron job terpisah. Cukup **pasang pengecekan ini di 3 tempat:**

1. **Di endpoint heartbeat** (Task 2 step 4) — sudah ter-cover.
2. **Di endpoint jawab** (Task 3 step 2) — sudah ter-cover.
3. **Di endpoint mulai ujian** (Task 1 step 2) — saat cek apakah ada ujian berlangsung, cek juga apakah ujian sebelumnya sudah timeout berdasarkan waktu:
   ```
   // Saat menemukan hasil_ujian dengan status BERLANGSUNG:
   waktu_berlalu = (Date.now() - hasil_ujian.waktu_mulai) / 1000
   if (waktu_berlalu > hasil_ujian.durasi_detik + HEARTBEAT_TIMEOUT_SECONDS) {
     // Tandai sebagai TIMEOUT, lalu lanjutkan proses mulai ujian baru
   }
   ```

**Konstanta yang dipakai:**  
`HEARTBEAT_TIMEOUT_SECONDS = 120` (dari `config/constants.ts`)

Artinya: Jika waktu berlalu sudah melebihi `durasi_detik + 120 detik`, maka ujian itu dianggap TIMEOUT.

---

## Validasi Zod yang Harus Dibuat

Buat file `src/validators/ujian-engine.validator.ts`:

```typescript
// Contoh skema (sesuaikan dengan pola di backoffice.validator.ts):

mulaiUjianSchema = {
  body: z.object({
    ujian_id: z.number().int().positive(),
  })
}

heartbeatSchema = {
  body: z.object({
    hasil_ujian_id: z.number().int().positive(),
  })
}

simpanJawabanSchema = {
  body: z.object({
    hasil_ujian_id: z.number().int().positive(),
    ujian_soal_id: z.number().int().positive(),
    jawaban: z.enum(['A', 'B', 'C', 'D', 'E']).nullable(),
    is_ragu: z.boolean().default(false),
  })
}
```

---

## Routing yang Harus Dibuat

Buat file `src/routes/ujian-engine.routes.ts`:

```
POST   /ujian/mulai       → authenticateUser → mulaiUjian
POST   /ujian/heartbeat   → authenticateUser → heartbeat
POST   /ujian/jawab        → authenticateUser → simpanJawaban
```

Lalu register di `src/routes/index.ts`:
```typescript
import ujianEngineRoutes from './ujian-engine.routes.js';
router.use('/ujian', ujianEngineRoutes);
```

---

## Unit Test yang Diharapkan

Buat file `src/__tests__/ujian-engine.test.ts`. Minimal harus cover:

1. **Mulai ujian:** sukses membuat `hasil_ujian` + `sesi_ujian`
2. **Mulai ujian:** gagal jika sudah ada ujian berlangsung
3. **Mulai ujian:** sukses jika ujian sebelumnya sudah timeout (auto-terminate dulu)
4. **Heartbeat:** sukses update `sisa_waktu_detik` + `last_heartbeat`
5. **Heartbeat:** mengembalikan TIMEOUT jika waktu sudah habis
6. **Simpan jawaban:** sukses simpan jawaban baru (create)
7. **Simpan jawaban:** sukses update jawaban yang sudah ada
8. **Simpan jawaban:** scoring TKP menghitung skor dari tabel `ujian_soal_skor_tkp`
9. **Simpan jawaban:** scoring TIU/TWK menghitung skor dari `jawaban_benar`
10. **Simpan jawaban:** ditolak jika waktu sudah habis
11. **Counter:** `total_terjawab`, `total_ragu`, `total_belum_jawab` terupdate dengan benar

---

## Catatan Keamanan

1. **Selalu validasi ownership** — Setiap request WAJIB cek `user_id == req.user.id`. User tidak boleh bisa mengakses sesi ujian orang lain.
2. **Jangan percaya waktu dari frontend** — Sisa waktu selalu dihitung dari `waktu_mulai` di server.
3. **Jangan kirim jawaban benar ke response** — Field `jawaban_benar`, `pembahasan`, `pembahasan_gambar` TIDAK BOLEH ada di response soal.
4. **Gunakan `prisma.$transaction()`** untuk operasi yang melibatkan lebih dari 1 tabel.
