# Issue: Bug Fix — Formasi "Validasi Gagal" saat Tambah Data

**Priority:** 🔴 HIGH  
**Halaman:** http://localhost:5173/admin/master → Tab "Formasi" → Klik "Tambah Data"  
**Gejala:** Saat user mengisi form Tambah Formasi dan klik tombol "Tambah", data tidak tersimpan dan muncul pesan toast yang tidak spesifik: **"Validasi gagal"** tanpa detail field apa yang salah.

---

## 📋 Hasil Analisa Root Cause

### Masalah Utama: Frontend mengirim payload yang TIDAK BERSIH ke backend

Ada **3 masalah yang saling berkaitan** yang menyebabkan bug ini:

---

### 🔴 Root Cause #1: Field `jenis_instansi` ikut terkirim ke backend

**Lokasi:** `frontend-web/src/pages/admin/MasterDataPage.tsx` line 290

```tsx
// Line 290: Form menambahkan field "jenis_instansi" ke formData
<div className="col-span-2">{select('Jenis Instansi (Filter)', 'jenis_instansi', JENIS_INSTANSI_OPTS, false)}</div>
```

**Masalah:**  
- Field `jenis_instansi` adalah field filter UI saja (untuk menyaring dropdown instansi), bukan field database.
- Meskipun `cleanFormasiPayload` (line 160) menghapus `jenis_instansi` via destructuring, ada **bug edge case**:
  - Jika user memilih `jenis_instansi`, value-nya disimpan di `formData` sebagai string enum (contoh: `"KEMENTERIAN"`)
  - Fungsi `cleanFormasiPayload` hanya melakukan `const { jenis_instansi, ...payload } = data;` — ini SUDAH benar.
  - **TAPI**, masalah sebenarnya bukan di `jenis_instansi`, melainkan di bagaimana `cleanFormasiPayload` menangani field `instansi_id` yang kosong (lihat Root Cause #2).

---

### 🔴 Root Cause #2: `instansi_id` bernilai `undefined` saat dikirim ke backend

**Lokasi:** `frontend-web/src/pages/admin/MasterDataPage.tsx` line 169-171

```typescript
// cleanFormasiPayload logic:
} else if (field === 'instansi_id' || field === 'jumlah_formasi') {
  result[field] = field === 'jumlah_formasi' ? 1 : undefined;
}
```

**Masalah:**
- Jika user belum memilih instansi (atau field kosong), `instansi_id` dikirim sebagai `undefined`
- Backend validator (`createFormasiSchema` di `master.validator.ts` line 56) mensyaratkan:
  ```typescript
  instansi_id: z.coerce.number().int().positive('Instansi ID harus valid')
  ```
- `z.coerce.number()` terhadap `undefined` menghasilkan `NaN`, yang gagal di `.positive()`
- Ini menyebabkan validasi gagal, tapi PESAN ERROR yang muncul di frontend tidak menampilkan detail field karena...

---

### 🔴 Root Cause #3: Frontend salah membaca response error dari backend

**Lokasi:** `frontend-web/src/pages/admin/MasterDataPage.tsx` line 220-226

```typescript
catch (err: any) {
  const resData = err.response?.data;
  if (resData?.data && Array.isArray(resData.data)) {    // ← CEK "data"
    const details = resData.data.map(...)
  } else {
    toast.error(resData?.message || 'Terjadi kesalahan pada server');
  }
}
```

**VS Backend response format** (`validate.middleware.ts` line 14 + `response.ts` line 17-22):

```typescript
// Backend mengirim:
{
  success: false,
  message: "Validasi gagal",
  errors: [                    // ← Key = "errors", BUKAN "data"
    { field: "instansi_id", message: "Instansi ID harus valid" }
  ]
}
```

**Masalah:**
- Backend menyimpan detail error di key `errors` (dari `errorResponse('Validasi gagal', errors)`)
- Frontend **mengecek `resData.data`** padahal seharusnya mengecek **`resData.errors`**
- Akibatnya detail error TIDAK PERNAH ditampilkan, dan user hanya melihat pesan generik "Validasi gagal"

---

## ✅ Solusi yang Harus Dilakukan

### Fix 1: Perbaiki error handler di frontend untuk membaca `errors` bukan `data`

**File:** `frontend-web/src/pages/admin/MasterDataPage.tsx`  
**Line:** 220-226

```diff
  catch (err: any) {
    const resData = err.response?.data;
-   if (resData?.data && Array.isArray(resData.data)) {
-     const details = resData.data.map((e: any) => `${e.field}: ${e.message}`).join('\n');
+   if (resData?.errors && Array.isArray(resData.errors)) {
+     const details = resData.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
      toast.error(`Validasi gagal:\n${details}`, { duration: 5000 });
    } else {
      toast.error(resData?.message || 'Terjadi kesalahan pada server');
    }
  }
```

### Fix 2: Perbaiki `cleanFormasiPayload` agar tidak mengirim `undefined`

**File:** `frontend-web/src/pages/admin/MasterDataPage.tsx`  
**Line:** 159-180

Hapus logika yang membuat `instansi_id` menjadi `undefined`. Biarkan saja Zod yang menangani validasi. Jangan delete field dari payload jika kosong, karena backend memerlukan field ini.

```diff
  for (const field of numFields) {
    if (result[field] !== undefined && result[field] !== null && result[field] !== '') {
      result[field] = Number(result[field]);
-   } else if (field === 'instansi_id' || field === 'jumlah_formasi') {
-     result[field] = field === 'jumlah_formasi' ? 1 : undefined;
    }
  }
```

> **Catatan:** Dengan Zod `z.coerce.number()`, backend sudah bisa menangani string → number otomatis. Jadi tidak perlu cleanup tambahan di frontend untuk field numerik. Cukup kirim apa adanya, biarkan Zod yang validasi.

### Fix 3 (Opsional/Enhancement): Validasi frontend sebelum submit

Tambahkan pengecekan sederhana di `handleSubmit` sebelum memanggil API:

```typescript
// Sebelum memanggil createFormasi
if (activeTab === 'Formasi') {
  if (!formData.instansi_id) {
    toast.error('Instansi wajib dipilih');
    setIsSubmitting(false);
    return;
  }
  if (!formData.nama_jabatan?.trim()) {
    toast.error('Nama jabatan wajib diisi');
    setIsSubmitting(false);
    return;
  }
}
```

---

## 🧪 Cara Pengujian

### Skenario 1: Tambah Formasi dengan data lengkap
1. Buka http://localhost:5173/admin/master → Tab "Formasi"
2. Klik "Tambah Data"
3. Pilih Jenis Instansi → pilih Instansi → isi Nama Jabatan → isi Jumlah Formasi
4. Klik "Tambah"
5. **Expected:** Data tersimpan, toast "Data berhasil ditambahkan" muncul

### Skenario 2: Tambah Formasi dengan data TIDAK lengkap (tanpa instansi)
1. Buka form Tambah Formasi
2. JANGAN pilih instansi, langsung isi Nama Jabatan
3. Klik "Tambah"
4. **Expected:** Toast error muncul dengan detail spesifik: "instansi_id: Instansi ID harus valid"

### Skenario 3: Tambah Formasi dengan field opsional kosong
1. Isi instansi + nama jabatan + jumlah formasi saja
2. Biarkan Pendidikan, Jurusan, Provinsi, Kota, Gaji kosong
3. Klik "Tambah"
4. **Expected:** Data tersimpan dengan field opsional bernilai NULL

---

## 📂 File yang Perlu Diubah

| No | File | Perubahan |
|----|------|-----------|
| 1 | `frontend-web/src/pages/admin/MasterDataPage.tsx` | Fix error handler: `resData.data` → `resData.errors` |
| 2 | `frontend-web/src/pages/admin/MasterDataPage.tsx` | Fix `cleanFormasiPayload`: hapus logika `undefined` untuk `instansi_id` |
| 3 | `frontend-web/src/pages/admin/MasterDataPage.tsx` | (Opsional) Tambah validasi frontend sebelum submit |

---

## 📌 Referensi Cepat

- **Backend Validator Schema:** `backend/src/validators/master.validator.ts` line 55-66
- **Validate Middleware:** `backend/src/middlewares/validate.middleware.ts` line 6-19
- **Error Response Format:** `backend/src/utils/response.ts` line 17-23 → `{ success, message, errors }`
- **Frontend API Call:** `frontend-web/src/api/admin.ts` line 70-71
- **Frontend Form:** `frontend-web/src/pages/admin/MasterDataPage.tsx` line 287-303
