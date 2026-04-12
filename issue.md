# 📋 AUDIT BACKEND + TODOLIST FRONTEND (Mobile & Web)

---

# BAGIAN 1: AUDIT & SARAN PERBAIKAN BACKEND

## ✅ Status Penyelesaian Backend (Fase 1–8)

| Fase | Nama | Status | Catatan |
|------|------|--------|---------|
| 1 | Persiapan Fondasi & Server | ✅ Done | Express, Prisma, Zod, Multer sudah terkonfigurasi |
| 2 | Autentikasi & Otorisasi | ✅ Done | JWT User + Admin, Middleware Auth |
| 3 | Manajemen Data Master | ✅ Done | CRUD Kategori, Jenis, Pendidikan, Jurusan, Instansi, Formasi, Biodata |
| 4 | Inti Backoffice (Soal) | ✅ Done | Bank Soal, Paket Ujian, Pembuatan Soal + Upload Gambar |
| 5 | Core Engine Simulasi Ujian | ✅ Done | Mulai, Heartbeat, Simpan Jawaban, Auto-Timeout |
| 6 | Finalisasi & Kalkulasi Skor | ✅ Done | Submit Ujian, Skor TIU/TWK/TKP, Lulus/Gagal, Update Statistik |
| 7 | Fitur Sosial & Pelaporan | ✅ Done | Laporan Soal, Kontribusi Soal, Admin Approval + Copy ke Soal |
| 8 | Kompetisi & Leaderboards | ✅ Done | Leaderboard Global + Pesaing Formasi |

**Kesimpulan:** Seluruh 8 fase dalam todolist backend telah **SELESAI** diimplementasikan.

---

## ⚠️ SARAN PERBAIKAN BACKEND (Prioritas Tinggi)

Berikut temuan dari audit kode yang **sangat disarankan** untuk dikerjakan sebelum memulai frontend:

### 1. 🔴 Endpoint User yang Belum Ada (Missing User-Facing API)

Backend saat ini belum memiliki endpoint berikut yang **PASTI dibutuhkan oleh frontend**:

| Endpoint yang Diperlukan | Kegunaan | Prioritas |
|--------------------------|----------|-----------|
| `GET /api/ujian` | Daftar ujian yang tersedia (untuk ditampilkan di homepage) | 🔴 Wajib |
| `GET /api/ujian/:id` | Detail ujian sebelum memulai (info durasi, jumlah soal, dsb) | 🔴 Wajib |
| `GET /api/user/riwayat-ujian` | Riwayat ujian user (daftar `HasilUjian` milik user) | 🔴 Wajib |
| `GET /api/user/riwayat-ujian/:id` | Detail hasil ujian + pembahasan jawaban | 🔴 Wajib |
| `GET /api/user/statistik` | Statistik kompetensi user (dari `StatistikUserKategori` & `StatistikUserJenis`) | 🔴 Wajib |
| `GET /api/user/kontribusi-soal` | Daftar kontribusi soal milik user sendiri (lihat status PENDING/APPROVED/REJECTED) | 🟡 Sangat direkomendasikan |
| `GET /api/user/laporan-soal` | Daftar laporan soal milik user sendiri | 🟡 Sangat direkomendasikan |

### 2. 🟡 Static File Serving Belum Dikonfigurasi

File `app.ts` / `index.ts` utama belum menambahkan baris:
```typescript
app.use('/static', express.static('uploads'));
```
Tanpa ini, gambar soal, kontribusi, dan screenshot laporan **tidak bisa diakses oleh frontend**.

### 3. 🟡 Endpoint Daftar Ujian Belum Memfilter `peruntukan` (FREE/PREMIUM)

Saat user FREE mengakses daftar ujian, backend harus memfilter berdasarkan `peruntukan` ujian (`FREE` atau `ALL`). User PREMIUM bisa mengakses semua.

### 4. 🟢 Penambahan `jumlah_kosong` di Response `selesaiUjian`

Field `jumlah_kosong` pada `HasilUjian` belum dihitung di endpoint `POST /ujian/selesai`. Ini penting untuk tampilan ringkasan pada frontend.

---
---

# BAGIAN 2: TODOLIST IMPLEMENTASI FRONTEND

## Informasi Penting Sebelum Mulai

### Tech Stack yang Direkomendasikan

| Platform | Framework | Bahasa | State Management |
|----------|-----------|--------|-----------------|
| **Web** | Next.js 14+ (App Router) atau Vite + React | TypeScript | Zustand / React Query |
| **Mobile** | React Native + Expo | TypeScript | Zustand / React Query |

### Base URL API
```
http://localhost:3000/api
```

### Autentikasi
Semua endpoint (kecuali login/register) memerlukan header:
```
Authorization: Bearer <token>
```
Token didapat dari response `POST /api/auth/login`.

### Gambar / Aset Statis
```
http://localhost:3000/static/<path>
```
Contoh: `http://localhost:3000/static/soal/1712905200000-123.jpg`

---

## ARSITEKTUR HALAMAN FRONTEND

```
📱 USER APP (Mobile & Web)
├── Auth
│   ├── Login
│   ├── Register
│   └── Lupa Password (opsional)
├── Beranda / Dashboard
│   ├── Daftar Ujian Tersedia
│   ├── Ringkasan Statistik (TIU/TWK/TKP)
│   └── Ranking Singkat
├── Simulasi Ujian
│   ├── Detail Ujian (sebelum mulai)
│   ├── Layar Ujian (timer, navigasi soal, pilih jawaban)
│   ├── Konfirmasi Submit
│   └── Hasil & Pembahasan
├── Riwayat Ujian
│   ├── Daftar Riwayat
│   └── Detail Hasil + Pembahasan
├── Profiling / Statistik
│   ├── Grafik Kompetensi per Kategori
│   └── Tingkat Penguasaan per Jenis Soal
├── Leaderboard
│   ├── Global
│   └── Pesaing Formasi
├── Sosial
│   ├── Laporkan Soal
│   ├── Kontribusikan Soal
│   └── Status Kontribusi Saya
└── Profil
    ├── Edit Biodata
    └── Pilih Instansi & Formasi

🖥️ ADMIN DASHBOARD (Web Only)
├── Auth (Login Admin)
├── Dashboard Ringkasan
├── Master Data (CRUD)
│   ├── Kategori Soal
│   ├── Jenis Soal
│   ├── Instansi & Formasi
│   └── Pendidikan & Jurusan
├── Backoffice
│   ├── Bank Soal
│   ├── Soal (CRUD + Upload Gambar)
│   └── Paket Ujian
├── Review
│   ├── Laporan Soal (list + action DITINJAU/DIPERBAIKI/DITOLAK)
│   └── Kontribusi Soal (list + action APPROVE/REJECT)
└── Monitoring
    └── (opsional: statistik global)
```

---

## FASE F1: AUTENTIKASI USER

### Halaman Login
- [ ] Buat halaman Login dengan form Email + Password
- [ ] Panggil `POST /api/auth/login` dengan body `{ email, password }`
- [ ] Simpan `token` dari response ke `localStorage` (web) atau `AsyncStorage` (mobile)
- [ ] Redirect ke Dashboard setelah login sukses
- [ ] Tampilkan pesan error jika login gagal

#### Contoh Request & Response
```
POST /api/auth/login
Body: { "email": "user@test.com", "password": "123456" }

Response 200:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "user": { "id": 1, "nama": "Budi", "email": "user@test.com", "kategori": "FREE" }
  }
}
```

### Halaman Register
- [ ] Buat halaman Register dengan form Nama, Email, Password, Konfirmasi Password
- [ ] Panggil `POST /api/auth/register` dengan body `{ nama, email, password }`
- [ ] Redirect ke Login setelah registrasi sukses
- [ ] Validasi di sisi client: Email format, Password minimal 6 karakter, Password match

### Auth Guard / Protected Route
- [ ] Buat middleware/HOC yang memeriksa token di storage
- [ ] Jika tidak ada token atau token expired (401 dari API), redirect ke Login
- [ ] Pasang di semua halaman kecuali Login & Register

---

## FASE F2: DASHBOARD / BERANDA USER

### Endpoint yang Dipakai
| Endpoint | Kegunaan |
|----------|----------|
| `GET /api/ujian` | Daftar ujian tersedia **(PERLU DIBUAT DI BACKEND DULU)** |
| `GET /api/user/statistik` | Statistik kompetensi user **(PERLU DIBUAT DI BACKEND DULU)** |

### Tampilan Dashboard
- [ ] **Hero Section**: Sapaan "Halo, [Nama User]!" + ringkasan statistik
- [ ] **Kartu Statistik**: 3 kartu untuk TIU, TWK, TKP
  - Skor rata-rata
  - Persentase benar
  - Total ujian yang sudah dikerjakan
- [ ] **Daftar Ujian Tersedia**: Tampilkan daftar ujian dalam bentuk card:
  - Nama ujian
  - Tipe ujian (TRYOUT / LATIHAN / QUIZ)
  - Durasi (dalam menit)
  - Jumlah soal
  - Badge "FREE" / "PREMIUM"
  - Tombol "Mulai Ujian"

---

## FASE F3: PROFIL & BIODATA USER

### Endpoint yang Dipakai
| Endpoint | Kegunaan |
|----------|----------|
| `GET /api/user/biodata` | Ambil data biodata user |
| `PUT /api/user/biodata` | Simpan / update biodata |
| `GET /api/master/instansi` | Daftar instansi (untuk dropdown) |
| `GET /api/master/formasi?instansi_id=X` | Daftar formasi berdasarkan instansi |
| `GET /api/master/tingkat-pendidikan` | Daftar tingkat pendidikan |
| `GET /api/master/jurusan` | Daftar jurusan |

### Halaman Edit Biodata
- [ ] Form dengan field berikut (semua opsional kecuali nama_lengkap):
  - `nama_lengkap` (text)
  - `no_hp` (text)
  - `tanggal_lahir` (date picker)
  - `jenis_kelamin` (radio: LAKI_LAKI / PEREMPUAN)
  - `alamat` (textarea)
  - `provinsi`, `kota` (text)
  - `tingkat_pendidikan_id` (dropdown dari API)
  - `jurusan_id` (dropdown dari API)
  - `nama_universitas` (text)
  - `tahun_lulus` (number)
  - `instansi_id` (dropdown dari API)
  - `formasi_id` (dropdown, muncul setelah instansi dipilih)
- [ ] **Cascading Dropdown**: Ketika user memilih Instansi, formasi harus di-reload
- [ ] Kirim data ke `PUT /api/user/biodata`

> **⚠️ PENTING**: Biodata instansi & formasi **WAJIB DIISI** agar fitur Leaderboard Formasi bisa digunakan.

---

## FASE F4: SIMULASI UJIAN (KRITIS - PALING KOMPLEKS)

### Endpoint yang Dipakai
| Endpoint | Kegunaan |
|----------|----------|
| `GET /api/ujian/:id` | Detail ujian **(PERLU DIBUAT DI BACKEND)** |
| `POST /api/ujian/mulai` | Mulai ujian baru |
| `POST /api/ujian/heartbeat` | Sinkronisasi waktu setiap 30 detik |
| `POST /api/ujian/simpan-jawaban` | Simpan jawaban user |
| `POST /api/ujian/selesai` | Akhiri ujian dan hitung skor |

### Alur Lengkap Simulasi

```
User klik "Mulai Ujian"
    │
    ▼
[1] Panggil POST /ujian/mulai
    │   Body: { ujian_id: X }
    │   Response: { hasil_ujian_id, daftar_soal[], sisa_waktu }
    │
    ▼
[2] Tampilkan Layar Ujian:
    │   ┌──────────────────────────────────┐
    │   │ ⏱️ Timer: 01:59:00              │
    │   │                                  │
    │   │ [Soal 1/100]                     │
    │   │ Pertanyaan...                    │
    │   │ (gambar jika ada)                │
    │   │                                  │
    │   │ ○ A. Opsi A                      │
    │   │ ● B. Opsi B  ← dipilih          │
    │   │ ○ C. Opsi C                      │
    │   │ ○ D. Opsi D                      │
    │   │ ○ E. Opsi E                      │
    │   │                                  │
    │   │ [🔖 Ragu] [◀ Prev] [Next ▶]     │
    │   │                                  │
    │   │ Navigasi Soal:                   │
    │   │ [1✅][2✅][3⬜][4🔖][5⬜]...     │
    │   │                                  │
    │   │ [Selesai Ujian]                  │
    │   └──────────────────────────────────┘
    │
    ▼
[3] Setiap kali user memilih jawaban:
    │   → Panggil POST /ujian/simpan-jawaban
    │     Body: { hasil_ujian_id, ujian_soal_id, jawaban: "B", is_ragu: false }
    │
[4] Setiap 30 detik (setInterval):
    │   → Panggil POST /ujian/heartbeat
    │     Body: { hasil_ujian_id }
    │     Response: { sisa_waktu_detik, status }
    │     → Jika status = "TIMEOUT", otomatis tutup ujian
    │     → Update timer dari response server (JANGAN hitung dari client!)
    │
[5] Tombol "Selesai Ujian" diklik:
    │   → Tampilkan Konfirmasi: "Yakin ingin mengakhiri ujian?"
    │   → Jika Ya:
    │     Panggil POST /ujian/selesai
    │     Body: { hasil_ujian_id }
    │   → Tampilkan Halaman Hasil
    │
    ▼
[6] Halaman Hasil Ujian:
    │   ┌──────────────────────────────────┐
    │   │ 📊 HASIL UJIAN                   │
    │   │                                  │
    │   │ Status: ✅ LULUS / ❌ TIDAK LULUS │
    │   │ Skor Total: 380 / 500            │
    │   │                                  │
    │   │ TIU:  140 / 175  (PG: 80) ✅     │
    │   │ TWK:  120 / 150  (PG: 65) ✅     │
    │   │ TKP:  120 / 175  (PG: 166) ❌    │
    │   │                                  │
    │   │ Benar: 65  Salah: 20  Kosong: 15 │
    │   │ Durasi: 1 jam 45 menit           │
    │   │                                  │
    │   │ [Lihat Pembahasan] [Kembali]     │
    │   └──────────────────────────────────┘
```

### Komponen UI yang Dibutuhkan
- [ ] **Timer Countdown**: Menampilkan sisa waktu (format MM:SS atau HH:MM:SS)
  - ⚠️ Timer di-sync dari backend via heartbeat, BUKAN dihitung sendiri di client
  - Jika sisa_waktu <= 300 detik (5 menit), warnai timer merah + animasi berkedip
- [ ] **Kartu Soal**: Menampilkan pertanyaan + opsi A-E
  - Jika `pertanyaan_gambar` atau `opsi_X_gambar` terisi, tampilkan gambar dari `/static/...`
- [ ] **Navigasi Soal**: Grid tombol nomor soal
  - Warna hijau = sudah dijawab
  - Warna kuning = ditandai ragu (`is_ragu = true`)
  - Warna abu-abu = belum dijawab
- [ ] **Tombol Ragu-Ragu**: Toggle flag `is_ragu` saat menyimpan jawaban
- [ ] **Konfirmasi Submit**: Modal dialog sebelum menyelesaikan ujian
- [ ] **Blocking Navigation**: Cegah user keluar halaman ujian (browser back button, refresh)

---

## FASE F5: RIWAYAT UJIAN & PEMBAHASAN

### Endpoint yang Dipakai
| Endpoint | Kegunaan |
|----------|----------|
| `GET /api/user/riwayat-ujian` | Daftar riwayat ujian **(PERLU DIBUAT DI BACKEND)** |
| `GET /api/user/riwayat-ujian/:id` | Detail hasil + jawaban + pembahasan **(PERLU DIBUAT DI BACKEND)** |

### Halaman Daftar Riwayat
- [ ] Tampilkan list riwayat ujian user (paginasi):
  - Nama ujian
  - Tanggal mengerjakan
  - Skor total
  - Status: LULUS / GAGAL / TIMEOUT
  - Tombol "Lihat Detail"

### Halaman Detail & Pembahasan
- [ ] Tampilkan ringkasan skor (TIU/TWK/TKP) + status lulus/gagal
- [ ] Daftar soal + jawaban user vs jawaban benar:
  - ✅ Hijau = jawaban benar
  - ❌ Merah = jawaban salah
  - ⬜ Abu = tidak dijawab
- [ ] Tampilkan **pembahasan** per soal (teks + gambar jika ada)
- [ ] Filter berdasarkan kategori: TIU / TWK / TKP
- [ ] Filter berdasarkan status: Benar / Salah / Kosong

---

## FASE F6: STATISTIK & PROFILING KOMPETENSI

### Endpoint yang Dipakai
| Endpoint | Kegunaan |
|----------|----------|
| `GET /api/user/statistik` | Data statistik kompetensi user **(PERLU DIBUAT DI BACKEND)** |

### Tampilan Statistik
- [ ] **Chart Radar/Spider**: Visualisasi kekuatan per kategori (TIU, TWK, TKP)
- [ ] **Progress Bar per Jenis Soal**: Menampilkan tingkat penguasaan:
  - Label: Silogisme, Analogi Verbal, Deret Angka, dll.
  - Progress: 0-100%
  - Badge tingkat: BELUM / RENDAH / SEDANG / TINGGI / MAHIR
  - Warna:
    - BELUM = Abu
    - RENDAH = Merah
    - SEDANG = Kuning
    - TINGGI = Biru
    - MAHIR = Hijau
- [ ] **Kartu Ringkasan**:
  - Total ujian dikerjakan
  - Skor tertinggi & terendah per kategori
  - Rata-rata skor

---

## FASE F7: LEADERBOARD

### Endpoint yang Dipakai
| Endpoint | Kegunaan |
|----------|----------|
| `GET /api/leaderboard/global?ujian_id=X` | Ranking global |
| `GET /api/leaderboard/formasi?ujian_id=X` | Ranking pesaing formasi |

### Halaman Leaderboard
- [ ] **Tab / Switch**: Global vs Pesaing Formasi
- [ ] **Dropdown**: Pilih ujian (ambil dari daftar ujian)
- [ ] **Tabel Ranking**:
  - Nomor ranking
  - Nama user (dari `biodata.nama_lengkap`)
  - Skor Total
  - Status Lulus/Gagal
  - Durasi pengerjaan
- [ ] **Highlight user sendiri** di dalam tabel (baris berbeda warna)
- [ ] **Informasi Formasi** (khusus tab Formasi):
  - Nama Instansi + Jabatan
  - Jumlah pesaing

---

## FASE F8: FITUR SOSIAL (LAPORAN & KONTRIBUSI)

### Laporkan Soal
- [ ] Saat user sedang melihat soal (di ujian atau pembahasan), tampilkan tombol "🚩 Laporkan"
- [ ] Modal form laporan:
  - `jenis_laporan` (dropdown: TYPO, JAWABAN_SALAH, dll.)
  - `deskripsi` (textarea, min 10 karakter)
  - `bukti_screenshot` (upload gambar, opsional)
- [ ] Panggil `POST /api/laporan-soal` (form-data)
- [ ] Tampilkan notifikasi sukses

### Kontribusi Soal
- [ ] Halaman form membuat soal:
  - Pilih Kategori (TIU/TWK/TKP)
  - Pilih Jenis Soal (dropdown, tergantung kategori)
  - Level (MUDAH/SEDANG/SULIT)
  - Pertanyaan (teks + upload gambar)
  - Opsi A–E (teks + upload gambar masing-masing)
  - Jawaban Benar (A/B/C/D/E)
  - Pembahasan (opsional)
- [ ] Panggil `POST /api/kontribusi-soal` (form-data, multi-file)
- [ ] Tampilkan notifikasi sukses

### Status Kontribusi Saya
- [ ] Daftar kontribusi milik user (paginasi)
- [ ] Status badge: PENDING (kuning), APPROVED (hijau), REJECTED (merah)
- [ ] Jika ada `review_note`, tampilkan catatan dari admin

---

## FASE F9: ADMIN DASHBOARD (Khusus Web)

### Login Admin
- [ ] Panggil `POST /api/admin/auth/login`
- [ ] Simpan token admin terpisah dari token user

### Dashboard Overview
- [ ] Jumlah total soal, user, ujian, laporan pending, kontribusi pending

### Master Data CRUD
- [ ] Tabel + Form untuk: Kategori Soal, Jenis Soal, Instansi, Formasi, Pendidikan, Jurusan
- [ ] Gunakan endpoint `GET/POST/PUT/DELETE /api/admin/master/...`

### Backoffice Soal
- [ ] CRUD Bank Soal: `GET/POST /api/admin/backoffice/bank-soal`
- [ ] CRUD Soal: `GET/POST /api/admin/backoffice/soal` (dengan upload gambar multi-field)
- [ ] CRUD Paket Ujian: `GET/POST /api/admin/backoffice/ujian`

### Review Laporan Soal
- [ ] Tabel daftar laporan: `GET /api/admin/backoffice/laporan-soal?status=PENDING`
- [ ] Filter by status
- [ ] Tombol aksi per laporan:
  - "Tinjau" → `PATCH /api/admin/backoffice/laporan-soal/:id` `{ status: "DITINJAU" }`
  - "Perbaiki" → `{ status: "DIPERBAIKI", review_note: "..." }`
  - "Tolak"   → `{ status: "DITOLAK", review_note: "..." }`

### Review Kontribusi Soal
- [ ] Tabel daftar kontribusi: `GET /api/admin/backoffice/kontribusi-soal?status=PENDING`
- [ ] Preview soal kontribusi sebelum approve
- [ ] Tombol aksi:
  - "Approve" → `PATCH /api/admin/backoffice/kontribusi-soal/:id` `{ status: "APPROVED", bank_soal_id: X }`
    - Pilih Bank Soal tujuan (dropdown)
  - "Reject"  → `{ status: "REJECTED", review_note: "..." }`

---

## CATATAN TEKNIS UNTUK DEVELOPER FRONTEND

### 1. Penanganan Error dari API
Semua error dari API selalu memiliki format:
```json
{
  "success": false,
  "message": "Pesan error",
  "errors": [{ "field": "email", "message": "Email wajib diisi" }]
}
```
Gunakan `response.success` untuk membedakan antara sukses dan gagal.

### 2. Paginasi
Response yang memiliki banyak data selalu mengandung `meta`:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 57,
    "totalPages": 6
  }
}
```
Gunakan query parameter `?page=X&limit=Y` untuk navigasi halaman.

### 3. Upload File (Multipart)
Untuk endpoint yang menerima file, gunakan `FormData` dan jangan set `Content-Type` header (browser akan auto-set `multipart/form-data` + boundary).

```javascript
const formData = new FormData();
formData.append('soal_id', '42');
formData.append('jenis_laporan', 'TYPO');
formData.append('deskripsi', 'Ada typo di pertanyaan');
formData.append('bukti_screenshot', fileInput.files[0]);

await fetch('/api/laporan-soal', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  // JANGAN set Content-Type!
  body: formData,
});
```

### 4. Tampilkan Gambar dari Server
```html
<img src="http://localhost:3000/static/soal/1712905200000-123456789.jpg" />
```

### 5. Timer Ujian (KRITIS)
```javascript
// ❌ SALAH — mudah diretas
let sisaWaktu = 7200;
setInterval(() => sisaWaktu--, 1000);

// ✅ BENAR — sync dari server
setInterval(async () => {
  const res = await fetch('/api/ujian/heartbeat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ hasil_ujian_id }),
  });
  const data = await res.json();
  setSisaWaktu(data.data.sisa_waktu_detik); // Update dari server
  if (data.data.status === 'TIMEOUT') forceFinishExam();
}, 30000);
```

### 6. Daftar Semua API Endpoint (Quick Reference)

#### Auth
| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/admin/auth/login` | Public |

#### User
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/user/biodata` | User |
| PUT | `/api/user/biodata` | User |

#### Master Data (Read-Only untuk User)
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/master/kategori-soal` | User |
| GET | `/api/master/jenis-soal` | User |
| GET | `/api/master/tingkat-pendidikan` | User |
| GET | `/api/master/jurusan` | User |
| GET | `/api/master/instansi` | User |
| GET | `/api/master/formasi?instansi_id=X` | User |

#### Ujian Engine
| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/api/ujian/mulai` | User |
| POST | `/api/ujian/heartbeat` | User |
| POST | `/api/ujian/simpan-jawaban` | User |
| POST | `/api/ujian/selesai` | User |

#### Sosial
| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/api/laporan-soal` | User |
| POST | `/api/kontribusi-soal` | User |

#### Leaderboard
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/leaderboard/global?ujian_id=X` | User |
| GET | `/api/leaderboard/formasi?ujian_id=X` | User |

#### Admin Master
| Method | Endpoint | Role |
|--------|----------|------|
| GET/POST/PUT/DELETE | `/api/admin/master/kategori-soal` | Admin |
| GET/POST/PUT/DELETE | `/api/admin/master/jenis-soal` | Admin |
| GET/POST/PUT/DELETE | `/api/admin/master/tingkat-pendidikan` | Admin |
| GET/POST/PUT/DELETE | `/api/admin/master/jurusan` | Admin |
| GET/POST/PUT/DELETE | `/api/admin/master/instansi` | Admin |
| GET/POST/PUT/DELETE | `/api/admin/master/formasi` | Admin |

#### Admin Backoffice
| Method | Endpoint | Role |
|--------|----------|------|
| GET/POST | `/api/admin/backoffice/bank-soal` | Admin |
| GET/POST | `/api/admin/backoffice/soal` | Admin |
| GET/POST | `/api/admin/backoffice/ujian` | Admin |
| GET/PATCH | `/api/admin/backoffice/laporan-soal` | Admin |
| GET/PATCH | `/api/admin/backoffice/kontribusi-soal` | Admin |

---

# Definisi "Selesai" untuk Frontend

## MVP (Minimum Viable Product)
1. ✅ User bisa Register & Login
2. ✅ User melihat daftar ujian dan memulai simulasi
3. ✅ Timer berjalan & sync dari server
4. ✅ User menjawab soal dan submit ujian
5. ✅ Melihat hasil ujian (skor, lulus/gagal, pembahasan)
6. ✅ Melihat riwayat ujian
7. ✅ Edit biodata (pilih instansi & formasi)
8. ✅ Melihat leaderboard

## Full Version (Setelah MVP)
1. ✅ Statistik & grafik kompetensi
2. ✅ Laporan soal dengan upload bukti
3. ✅ Kontribusikan soal baru
4. ✅ Admin dashboard lengkap
5. ✅ Responsive design (mobile-first)
