# 🏁 FASE 6: FINALISASI & KALKULASI SKOR (POST-EXAM)

## Deskripsi Umum

Fase ini menangani **apa yang terjadi ketika ujian berakhir** — baik karena user menekan tombol "Selesai" secara manual, maupun karena timer habis (timeout). Fungsi utamanya adalah:

1. Menutup sesi ujian secara resmi.
2. Menghitung skor akhir per kategori (TIU, TWK, TKP).
3. Menentukan status kelulusan berdasarkan **passing grade**.
4. Memperbarui data profiling kompetensi user (statistik per kategori & jenis soal).

> **⚠️ CATATAN PENTING:** Fase ini sangat bergantung pada Fase 5 (Core Engine). Pastikan endpoint `/ujian/mulai`, `/ujian/heartbeat`, dan `/ujian/jawab` sudah berfungsi dengan benar sebelum mulai mengerjakan fase ini.

---

## Checklist Tugas

- [ ] **Task 1**: Endpoint `POST /ujian/selesai` — Akhiri Ujian / Submit
- [ ] **Task 2**: Logika Kalkulasi Skor Otomatis (`skor_tiu`, `skor_twk`, `skor_tkp`, `skor_total`)
- [ ] **Task 3**: Logika Penentuan Kelulusan (`is_lulus`) berdasarkan Passing Grade
- [ ] **Task 4**: Update Profiling — Perbarui `StatistikUserKategori` & `StatistikUserJenis`
- [ ] **Task 5**: Unit Test untuk seluruh logika di atas

---

## Referensi Codebase (WAJIB BACA DULU)

Sebelum mulai coding, **baca dan pahami** file-file berikut:

| File | Fungsi | Kenapa Harus Dibaca |
|------|--------|---------------------|
| `backend/prisma/schema.prisma` | Skema database | Memahami struktur tabel `HasilUjian`, `JawabanUjian`, `StatistikUserKategori`, `StatistikUserJenis` |
| `backend/src/controllers/ujian-engine.controller.ts` | Controller Fase 5 | Memahami pola yang sudah ada (fungsi `checkAndHandleTimeout`, pattern response, dll) |
| `backend/src/validators/ujian-engine.validator.ts` | Validator Fase 5 | Pola validasi Zod yang digunakan |
| `backend/src/routes/ujian-engine.routes.ts` | Router Fase 5 | Cara mendaftarkan endpoint baru |
| `backend/src/config/constants.ts` | Konstanta global | Threshold tingkat penguasaan (`PENGUASAAN_RENDAH`, `PENGUASAAN_SEDANG`, `PENGUASAAN_TINGGI`) |
| `backend/src/utils/response.ts` | Helper response | Fungsi `successResponse()` dan `errorResponse()` |
| `backend/src/__tests__/ujian-engine.test.ts` | Unit test Fase 5 | Pola penulisan unit test dan cara mock Prisma |

---

## TASK 1: Endpoint `POST /ujian/selesai`

### Tujuan
User menekan tombol "Selesai Ujian" di frontend. Endpoint ini akan menutup sesi, menghitung skor, dan mengembalikan laporan akhir.

### Request Body (Validasi dengan Zod)

```typescript
// Tambahkan di: backend/src/validators/ujian-engine.validator.ts
export const selesaiUjianSchema = z.object({
  body: z.object({
    hasil_ujian_id: z.number().int().positive(),
  }),
});
```

### Alur Logika (Step-by-Step)

```
User klik "Selesai"
    │
    ▼
[1] Validasi: Apakah hasil_ujian_id valid & milik user ini?
    │
    ▼
[2] Validasi: Apakah status masih "BERLANGSUNG"?
    │   - Jika sudah "SELESAI" atau "TIMEOUT" → tolak (400)
    │
    ▼
[3] Hitung waktu pengerjaan:
    │   waktu_selesai = new Date()
    │   durasi_actual = waktu_selesai - waktu_mulai (dalam detik)
    │
    ▼
[4] Ambil SEMUA jawaban user untuk ujian ini:
    │   SELECT * FROM jawaban_ujian WHERE hasil_ujian_id = ?
    │   JOIN ujian_soal → soal → kategori_soal (untuk tahu TIU/TWK/TKP)
    │
    ▼
[5] KALKULASI SKOR (lihat Task 2 untuk detail)
    │   - Hitung skor_tiu, skor_twk, skor_tkp
    │   - Hitung skor_total = skor_tiu + skor_twk + skor_tkp
    │   - Hitung jumlah_benar, jumlah_salah
    │
    ▼
[6] CEK KELULUSAN (lihat Task 3 untuk detail)
    │   - Bandingkan setiap skor kategori dengan passing_grade-nya
    │
    ▼
[7] UPDATE DATABASE (dalam satu TRANSACTION):
    │   a. Update tabel `hasil_ujian` → skor, status, waktu_selesai, is_lulus
    │   b. Update tabel `sesi_ujian` → status_sesi = 'SELESAI', sisa_waktu = 0
    │   c. Update tabel `statistik_user_kategori` (Task 4)
    │   d. Update tabel `statistik_user_jenis` (Task 4)
    │
    ▼
[8] Return response berisi laporan skor akhir
```

### Contoh Response Sukses (HTTP 200)

```json
{
  "success": true,
  "message": "Ujian berhasil diselesaikan",
  "data": {
    "hasil_ujian_id": 100,
    "status": "SELESAI",
    "waktu_mulai": "2026-04-12T09:00:00.000Z",
    "waktu_selesai": "2026-04-12T10:30:00.000Z",
    "durasi_pengerjaan_detik": 5400,
    "total_soal": 100,
    "jumlah_dijawab": 95,
    "jumlah_benar": 78,
    "jumlah_salah": 17,
    "jumlah_kosong": 5,
    "skor_tiu": 120,
    "skor_twk": 130,
    "skor_tkp": 165,
    "skor_total": 415,
    "is_lulus": true,
    "detail_kategori": [
      { "kode": "TIU", "nama": "Tes Intelegensi Umum", "skor": 120, "passing_grade": 80, "lulus": true },
      { "kode": "TWK", "nama": "Tes Wawasan Kebangsaan", "skor": 130, "passing_grade": 65, "lulus": true },
      { "kode": "TKP", "nama": "Tes Karakteristik Pribadi", "skor": 165, "passing_grade": 166, "lulus": false }
    ]
  }
}
```

### Validasi Error yang Harus Ditangani

| Kondisi | HTTP Code | Pesan |
|---------|-----------|-------|
| `hasil_ujian_id` tidak ditemukan atau bukan milik user | 404 | "Data ujian tidak ditemukan" |
| Status sudah `SELESAI` atau `TIMEOUT` | 400 | "Ujian sudah berakhir sebelumnya" |

### Dimana Menambahkan Kode

| Apa | File |
|-----|------|
| Validator | `backend/src/validators/ujian-engine.validator.ts` |
| Controller | `backend/src/controllers/ujian-engine.controller.ts` (tambahkan fungsi `selesaiUjian`) |
| Route | `backend/src/routes/ujian-engine.routes.ts` (tambahkan `POST /selesai`) |

---

## TASK 2: Logika Kalkulasi Skor Otomatis

### Tujuan
Menghitung total skor per kategori soal (TIU, TWK, TKP) dari semua jawaban yang sudah disimpan di tabel `jawaban_ujian`.

### Cara Kerja

Skor sudah dihitung per-jawaban saat user menjawab (di endpoint `/ujian/jawab` Fase 5). Jadi di fase ini, kita **hanya perlu menjumlahkan** (`SUM`) skor yang sudah ada.

### Pseudocode

```typescript
// 1. Ambil semua jawaban beserta info kategori soalnya
const semuaJawaban = await tx.jawabanUjian.findMany({
  where: { hasil_ujian_id },
  include: {
    ujian_soal: {
      include: {
        soal: {
          include: { kategori_soal: true }  // Untuk tahu kode: TIU / TWK / TKP
        }
      }
    }
  }
});

// 2. Kelompokkan & jumlahkan skor per kategori
const skorPerKategori: Record<string, number> = {};
// Contoh hasil: { "TIU": 120, "TWK": 130, "TKP": 165 }

let jumlahBenar = 0;
let jumlahSalah = 0;

for (const jawaban of semuaJawaban) {
  const kodeKategori = jawaban.ujian_soal.soal.kategori_soal.kode;

  // Inisialisasi jika belum ada
  if (!skorPerKategori[kodeKategori]) {
    skorPerKategori[kodeKategori] = 0;
  }

  // Akumulasi skor
  skorPerKategori[kodeKategori] += jawaban.skor_diperoleh;

  // Hitung benar/salah (hanya untuk non-TKP, karena TKP tidak ada benar/salah)
  if (jawaban.is_benar === true) jumlahBenar++;
  if (jawaban.is_benar === false) jumlahSalah++;
}

// 3. Extract skor individual
const skorTiu = skorPerKategori['TIU'] || 0;
const skorTwk = skorPerKategori['TWK'] || 0;
const skorTkp = skorPerKategori['TKP'] || 0;
const skorTotal = skorTiu + skorTwk + skorTkp;
```

### ⚠️ Catatan Penting tentang TKP
- Soal TKP **tidak memiliki jawaban benar/salah** (`is_benar` selalu `null`).
- Skor TKP sudah dihitung per jawaban di Fase 5 menggunakan mapping `ujian_soal_skor_tkp` (nilai 1-5 per opsi).
- Jadi di sini cukup di-SUM saja, **jangan hitung ulang**.

---

## TASK 3: Logika Penentuan Kelulusan

### Tujuan
Menentukan apakah user **lulus** berdasarkan passing grade setiap kategori soal.

### Aturan Kelulusan CPNS
User dinyatakan **LULUS** jika dan hanya jika **SEMUA kategori** memenuhi passing grade masing-masing. Jika **satu saja** di bawah passing grade, maka **TIDAK LULUS**.

### Pseudocode

```typescript
// 1. Ambil data passing grade dari tabel kategori_soal
const semuaKategori = await tx.kategoriSoal.findMany();
// Contoh isi: [
//   { kode: "TIU", passing_grade: 80 },
//   { kode: "TWK", passing_grade: 65 },
//   { kode: "TKP", passing_grade: 166 }
// ]

// 2. Cek setiap kategori
let isLulus = true;
const detailKategori = [];

for (const kategori of semuaKategori) {
  const skorUser = skorPerKategori[kategori.kode] || 0;
  const lulusKategori = skorUser >= kategori.passing_grade;

  if (!lulusKategori) {
    isLulus = false;  // Satu saja tidak lulus → keseluruhan tidak lulus
  }

  detailKategori.push({
    kode: kategori.kode,
    nama: kategori.nama,
    skor: skorUser,
    passing_grade: kategori.passing_grade,
    lulus: lulusKategori,
  });
}

// 3. isLulus = true hanya jika SEMUA kategori lulus
```

### Dimana `passing_grade` Disimpan?
Di tabel `kategori_soal`, kolom `passing_grade` (tipe `Float`, default `0`).
Admin harus sudah mengisi nilai ini terlebih dahulu lewat fitur CRUD Kategori Soal (Fase 3).

---

## TASK 4: Update Profiling Statistik

### Tujuan
Setelah ujian selesai, perbarui data statistik kompetensi user agar fitur "Profiling" dan "Analisis Kelemahan" bisa bekerja.

### Tabel yang Diupdate

#### A. `statistik_user_kategori` (per TIU / TWK / TKP)

Untuk **setiap kategori soal** yang ada di ujian tersebut, lakukan `upsert`:

```typescript
// Untuk setiap kategori (TIU, TWK, TKP):
for (const kategori of semuaKategori) {
  const kode = kategori.kode;
  const skorKategori = skorPerKategori[kode] || 0;

  // Hitung soal yang dijawab untuk kategori ini
  const jawabanKategori = semuaJawaban.filter(
    j => j.ujian_soal.soal.kategori_soal.kode === kode
  );
  const totalDijawab = jawabanKategori.filter(j => j.jawaban_user !== null).length;
  const totalBenarKat = jawabanKategori.filter(j => j.is_benar === true).length;
  const totalSalahKat = jawabanKategori.filter(j => j.is_benar === false).length;

  await tx.statistikUserKategori.upsert({
    where: {
      user_id_kategori_soal_id: {
        user_id: userId,
        kategori_soal_id: kategori.id,
      }
    },
    create: {
      user_id: userId,
      kategori_soal_id: kategori.id,
      total_soal_dijawab: totalDijawab,
      total_benar: totalBenarKat,
      total_salah: totalSalahKat,
      total_skor: skorKategori,
      skor_tertinggi: skorKategori,
      skor_terendah: skorKategori,
      skor_rata_rata: skorKategori,
      persentase_benar: totalDijawab > 0
        ? (totalBenarKat / totalDijawab) * 100
        : 0,
      total_ujian: 1,
    },
    update: {
      total_soal_dijawab: { increment: totalDijawab },
      total_benar: { increment: totalBenarKat },
      total_salah: { increment: totalSalahKat },
      total_skor: { increment: skorKategori },
      total_ujian: { increment: 1 },
      // skor_tertinggi → update hanya jika skorKategori > skor_tertinggi saat ini
      // skor_terendah  → update hanya jika skorKategori < skor_terendah saat ini
      // skor_rata_rata → hitung ulang: total_skor / total_ujian
      // persentase_benar → hitung ulang: (total_benar / total_soal_dijawab) * 100
    },
  });
}
```

> **⚠️ PERHATIAN untuk `update`:** Kolom `skor_tertinggi`, `skor_terendah`, `skor_rata_rata`, dan `persentase_benar` tidak bisa pakai `increment`. Kamu harus **baca dulu data yang ada**, lalu hitung manual sebelum update. Contoh:

```typescript
// Cara aman untuk update skor_tertinggi & skor_terendah:
const existing = await tx.statistikUserKategori.findUnique({
  where: { user_id_kategori_soal_id: { user_id: userId, kategori_soal_id: kategori.id } }
});

if (existing) {
  const newTotalSkor = existing.total_skor + skorKategori;
  const newTotalUjian = existing.total_ujian + 1;
  const newTotalDijawab = existing.total_soal_dijawab + totalDijawab;
  const newTotalBenar = existing.total_benar + totalBenarKat;

  await tx.statistikUserKategori.update({
    where: { id: existing.id },
    data: {
      total_soal_dijawab: newTotalDijawab,
      total_benar: newTotalBenar,
      total_salah: existing.total_salah + totalSalahKat,
      total_skor: newTotalSkor,
      total_ujian: newTotalUjian,
      skor_tertinggi: Math.max(existing.skor_tertinggi, skorKategori),
      skor_terendah: existing.skor_terendah === 0
        ? skorKategori
        : Math.min(existing.skor_terendah, skorKategori),
      skor_rata_rata: newTotalSkor / newTotalUjian,
      persentase_benar: newTotalDijawab > 0
        ? (newTotalBenar / newTotalDijawab) * 100
        : 0,
    },
  });
} else {
  // create baru (first time)
  await tx.statistikUserKategori.create({ ... });
}
```

#### B. `statistik_user_jenis` (per Jenis Soal: Verbal, Numerik, Analogi, dll)

Logikanya mirip dengan kategori, tapi dikelompokkan per `jenis_soal_id`:

```typescript
// Kelompokkan jawaban per jenis_soal_id
const jawabanPerJenis: Record<number, typeof semuaJawaban> = {};

for (const jawaban of semuaJawaban) {
  const jenisId = jawaban.ujian_soal.soal.jenis_soal_id;
  if (!jawabanPerJenis[jenisId]) jawabanPerJenis[jenisId] = [];
  jawabanPerJenis[jenisId].push(jawaban);
}

// Untuk setiap jenis soal, upsert statistik
for (const [jenisIdStr, jawabanList] of Object.entries(jawabanPerJenis)) {
  const jenisId = Number(jenisIdStr);
  const totalDijawab = jawabanList.filter(j => j.jawaban_user !== null).length;
  const totalBenar = jawabanList.filter(j => j.is_benar === true).length;
  const totalSalah = jawabanList.filter(j => j.is_benar === false).length;
  const totalSkor = jawabanList.reduce((sum, j) => sum + j.skor_diperoleh, 0);
  const persentaseBenar = totalDijawab > 0 ? (totalBenar / totalDijawab) * 100 : 0;

  // Tentukan tingkat penguasaan berdasarkan persentase
  // Lihat constants.ts untuk threshold:
  //   PENGUASAAN_RENDAH  = 40%
  //   PENGUASAAN_SEDANG  = 65%
  //   PENGUASAAN_TINGGI  = 85%
  let tingkatPenguasaan: 'BELUM' | 'RENDAH' | 'SEDANG' | 'TINGGI' | 'MAHIR';
  if (totalDijawab === 0)       tingkatPenguasaan = 'BELUM';
  else if (persentaseBenar < 40)  tingkatPenguasaan = 'RENDAH';
  else if (persentaseBenar < 65)  tingkatPenguasaan = 'SEDANG';
  else if (persentaseBenar < 85)  tingkatPenguasaan = 'TINGGI';
  else                            tingkatPenguasaan = 'MAHIR';

  await tx.statistikUserJenis.upsert({
    where: {
      user_id_jenis_soal_id: {
        user_id: userId,
        jenis_soal_id: jenisId,
      }
    },
    create: {
      user_id: userId,
      jenis_soal_id: jenisId,
      total_soal_dijawab: totalDijawab,
      total_benar: totalBenar,
      total_salah: totalSalah,
      skor_rata_rata: totalSkor,
      persentase_benar: persentaseBenar,
      tingkat_penguasaan: tingkatPenguasaan,
    },
    update: {
      // Sama seperti kategori: baca dulu, hitung ulang, baru update
      // Kecuali tingkat_penguasaan → hitung ulang dari persentase_benar terbaru
    },
  });
}
```

> **⚠️ CATATAN tentang TKP & Statistik Jenis:**
> Untuk soal TKP, field `is_benar` selalu `null`. Jadi saat menghitung `total_benar` dan `total_salah` untuk jenis soal yang termasuk kategori TKP, **jangan hitung** yang `is_benar === null`. Cukup hitung `total_soal_dijawab` dan `skor_rata_rata` saja.

---

## TASK 5: Unit Test

### File Target
`backend/src/__tests__/ujian-engine.test.ts` (tambahkan `describe` baru)

### Test Cases yang WAJIB Ada

```typescript
describe('selesaiUjian()', () => {
  it('harus menghitung skor per kategori dengan benar', async () => {
    // Setup:
    //   - Mock 3 jawaban: 1 TIU (benar, skor 5), 1 TWK (salah, skor 0), 1 TKP (skor 4)
    //   - Mock kategori_soal dengan passing_grade
    // Assert:
    //   - skor_tiu = 5
    //   - skor_twk = 0
    //   - skor_tkp = 4
    //   - skor_total = 9
  });

  it('harus menentukan is_lulus = false jika satu kategori di bawah passing grade', async () => {
    // Setup:
    //   - Mock skor_tiu = 120 (passing_grade TIU = 80) ✅
    //   - Mock skor_twk = 50  (passing_grade TWK = 65) ❌
    //   - Mock skor_tkp = 170 (passing_grade TKP = 166) ✅
    // Assert:
    //   - is_lulus = false (karena TWK tidak lulus)
  });

  it('harus menentukan is_lulus = true jika semua kategori memenuhi passing grade', async () => {
    // Setup & Assert sebaliknya dari test di atas
  });

  it('harus menolak jika ujian sudah selesai sebelumnya', async () => {
    // Setup: Mock hasilUjian dengan status = 'SELESAI'
    // Assert: HTTP 400
  });

  it('harus mengupdate statistik_user_kategori setelah selesai', async () => {
    // Assert: prisma.statistikUserKategori.upsert dipanggil
  });

  it('harus mengupdate statistik_user_jenis setelah selesai', async () => {
    // Assert: prisma.statistikUserJenis.upsert dipanggil
  });
});
```

### Pola Mock yang Digunakan (PENTING!)

Gunakan pola yang **sudah terbukti bersih dari error TypeScript** di Fase 5:

```typescript
// ✅ BENAR - Pola yang sudah teruji (tanpa error TypeScript)
jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
  return callback(prisma);  // Pass global prisma, bukan objek custom
});

// Lalu spy individual methods:
jest.spyOn(prisma.hasilUjian, 'update').mockResolvedValue({ ... } as any);
jest.spyOn(prisma.statistikUserKategori, 'upsert').mockResolvedValue({ ... } as any);
```

```typescript
// ❌ SALAH - Jangan pakai pola ini (menyebabkan error TypeScript "never")
jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
  return callback({
    hasilUjian: { update: jest.fn().mockResolvedValue({}) },  // ← Error TS2345!
  });
});
```

---

## Diagram Alur Keseluruhan

```
┌──────────────────────────────────────────────────────────────────┐
│                     USER KLIK "SELESAI"                          │
│                    atau TIMER HABIS                               │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────────┐
              │  POST /ujian/selesai│
              └────────┬───────────┘
                       │
          ┌────────────┴────────────┐
          │    VALIDASI & GUARD     │
          │  • Milik user?          │
          │  • Status BERLANGSUNG?  │
          └────────────┬────────────┘
                       │
          ┌────────────┴────────────┐
          │   KALKULASI SKOR        │
          │  • SUM skor_diperoleh   │
          │    per kategori         │
          │  • Hitung benar/salah   │
          └────────────┬────────────┘
                       │
          ┌────────────┴────────────┐
          │   CEK KELULUSAN         │
          │  • Setiap kategori >=   │
          │    passing_grade?       │
          │  • is_lulus = ALL pass  │
          └────────────┬────────────┘
                       │
     ┌─────────────────┼─────────────────┐
     │                 │                 │
     ▼                 ▼                 ▼
┌─────────┐    ┌─────────────┐   ┌──────────────┐
│ UPDATE   │    │ UPDATE      │   │ UPDATE       │
│ hasil_   │    │ sesi_ujian  │   │ statistik_*  │
│ ujian    │    │ status=     │   │ upsert per   │
│ skor,    │    │ SELESAI     │   │ kategori &   │
│ status,  │    │             │   │ jenis soal   │
│ is_lulus │    │             │   │              │
└─────────┘    └─────────────┘   └──────────────┘
     │                 │                 │
     └─────────────────┼─────────────────┘
                       │
                       ▼
              ┌────────────────────┐
              │  RETURN LAPORAN    │
              │  SKOR AKHIR        │
              └────────────────────┘
```

---

## Tips Teknis untuk Implementasinya

### 1. Gunakan `prisma.$transaction()`
Seluruh operasi di Task 1 step [7] HARUS dibungkus dalam satu transaction. Jika salah satu gagal, rollback semua.

### 2. Jangan Hitung Ulang Skor Per-Jawaban
Skor sudah dihitung di Fase 5 (saat user menjawab). Di sini cukup `SUM(skor_diperoleh)` per kategori.

### 3. Handle Edge Case: Ujian Tanpa Jawaban
Jika user submit tanpa menjawab satu soal pun:
- `skor_tiu`, `skor_twk`, `skor_tkp` = 0
- `jumlah_benar` = 0, `jumlah_salah` = 0
- `is_lulus` = false
- Statistik tetap diupdate (increment `total_ujian`)

### 4. Handle Edge Case: Timeout dari Heartbeat
Jika ujian sudah di-timeout oleh fungsi `checkAndHandleTimeout()` dari Fase 5, endpoint ini harus mengembalikan response 400 dengan pesan "Ujian sudah berakhir sebelumnya". Jangan proses ulang.

### 5. Skor TKP Minimum
Pada CPNS asli, skor TKP minimum per soal adalah 1 (bukan 0). Sistem kita sudah menangani ini di Fase 5 melalui mapping `skor_tkp`. Pastikan tidak ada soal TKP yang menghasilkan skor 0.

---

## Definisi "Selesai" untuk Issue Ini

Issue ini dianggap **DONE** jika:

1. ✅ Endpoint `POST /ujian/selesai` berfungsi dan mengembalikan laporan skor lengkap.
2. ✅ Skor per kategori (TIU, TWK, TKP) dihitung dengan benar.
3. ✅ Status kelulusan ditentukan berdasarkan passing grade dari tabel `kategori_soal`.
4. ✅ Tabel `statistik_user_kategori` ter-update setiap ujian selesai.
5. ✅ Tabel `statistik_user_jenis` ter-update setiap ujian selesai.
6. ✅ Semua unit test PASSED.
7. ✅ `tsc --noEmit` menghasilkan **0 error** (tidak ada garis merah).
