# FASE 11: Enhancement Admin Panel & Struktur Database Master Data

Dokumen ini berisi panduan teknis langkah demi langkah untuk melakukan perbaikan (enhancement) pada Admin Panel CPNS Training. Tugas ini mencakup pembuatan Manajemen User, implementasi pagination, penguatan relasi database (Pendidikan, Jurusan, Lokasi), dan sinkronisasi data wilayah menggunakan API eksternal.

## 🎯 Tujuan Utama
Memastikan data master (terutama formasi dan instansi) konsisten, terstruktur, dan memiliki relasi yang jelas hingga ke tingkat kota/kabupaten agar dapat dianalisis di masa depan.

---

## 🛠️ Rincian Tugas (Langkah demi Langkah)

### 1. Perubahan Skema Database (`backend/prisma/schema.prisma`)
Anda harus mengedit file schema untuk memperbarui dan menambah relasi berikut:

*   **Update Enum `JenisInstansi`**:
    Ubah nilai enum agar lebih spesifik. Contoh:
    `KEMENTERIAN`, `LEMBAGA_NON_KEMENTERIAN`, `PEMDA PROVINSI`,`PEMDA KAB/KOTA`, `INSTANSI_VERTIKAL`, `LEMBAGA_NEGARA_INDEPENDEN`
*   **Relasi Pendidikan & Jurusan (1 to Many)**:
    Tambahkan field `tingkat_pendidikan_id Int` pada model `Jurusan` dan buat relasinya ke model `TingkatPendidikan`.
*   **Model Baru: Provinsi & Kota**:
    Buat model `Provinsi` (kode, nama) dan `Kota` (kode, provinsi_kode, nama). Pastikan berelasi 1 to Many dari Provinsi ke Kota.
*   **Update Relasi Formasi**:
    Hapus field string `kualifikasi_pendidikan` dan `lokasi_penempatan`. Gantilah dengan relasi Foreign Key:
    - `tingkat_pendidikan_id`
    - `jurusan_id`
    - `provinsi_kode`
    - `kota_kode`
*   **Update Relasi BiodataUser (Opsional tapi Direkomendasikan)**:
    Ubah `provinsi` dan `kota` yang berupa string menjadi relasi FK ke model Provinsi dan Kota yang baru.

> **PENTING:** Setelah mengubah schema, jalankan `npx prisma migrate dev --name enhance_master_data`. Jangan lupa perbarui `backend/prisma/seed.ts` karena skema lama pasti akan error.

### 2. Implementasi Seeder Data Wilayah
*   Buat script khusus di backend (misal: `prisma/seedWilayah.ts`) untuk mengambil data wilayah secara otomatis saat inisialisasi:
    - **API Provinsi**: `https://wilayah.id/api/provinces.json`
    - **API Kota**: `https://wilayah.id/api/regencies/[PROVINCE_CODE].json`
*   Simpan hasil *fetch* API tersebut ke dalam tabel `Provinsi` dan `Kota` yang baru saja dibuat.

### 3. Pembuatan & Update Endpoint Backend API
*   **API Manajemen User**:
    Buat controller baru (`admin-user.controller.ts`) lengkap dengan endpoint CRUD (Create, Read dengan pagination, Update, Delete/Deactivate) untuk tabel `User`.
*   **API Wilayah**:
    Buat endpoint `GET /api/wilayah/provinsi` dan `GET /api/wilayah/kota/:provinsi_kode` agar frontend bisa merender dropdown.
*   **Pagination Master Data**:
    Modifikasi semua endpoint `GET` di `admin-master.controller.ts` (Kategori, Jenis Soal, Pendidikan, Jurusan, Instansi, Formasi) agar menerima query params `?page=1&limit=10` dan mengembalikan *metadata pagination* (total data, total pages).
*   **Validasi Payload Formasi & Jurusan**:
    Sesuaikan schema validasi (Zod) untuk menerima ID referensi (Pendidikan, Jurusan, Kota) yang baru saat operasi Create/Update.

### 4. Perbaikan Frontend Panel Admin (`frontend-web/src/pages/admin/`)

*   **Buat Halaman Manajemen Data User** (`UserManagementPage.tsx`):
    - Buat tabel yang menampilkan data user dengan *Pagination*.
    - Tambahkan fitur: Edit Profil User, Reset Password, dan Toggle Aktif/Nonaktif.
    - Daftarkan route-nya di `routes/index.tsx` dan tambahkan ke sidebar `AdminLayout.tsx`.
*   **Update `MasterDataPage.tsx`**:
    - **Pagination**: Tambahkan state UI untuk menangani *next/prev page* pada semua tab data master.
    - **Tab Jenis Soal**: Pada kolom tabel "Kategori", pastikan yang tampil adalah **Nama Kategorinya** (misal: TIU, TWK), bukan sekadar ID atau Kode kategori.
    - **Tab Jurusan**: Tambahkan dropdown untuk memilih "Tingkat Pendidikan" saat *Tambah Jurusan*.
    - **Tab Instansi**: Ubah input field jenis instansi menjadi `<select>` dropdown (Kementerian, Lembaga Pemerintah Non-Kementerian, Instansi Daerah, dll) agar nilai input selalu konsisten.
    - **Tab Formasi (CASCADING DROPDOWN)**: Rombak form *Tambah/Edit Formasi* menjadi sangat dinamis secara berurutan:
        1. Pilih **Jenis Instansi** -> (Trigger filter) -> Muncul pilihan dropdown **Instansi**.
        2. Pilih **Tingkat Pendidikan** -> (Trigger filter) -> Muncul pilihan dropdown **Jurusan** yang terkait.
        3. Lokasi Formasi : Pilih **Provinsi** -> (Trigger filter) -> Muncul pilihan dropdown **Kabupaten/Kota**.
        4. Simpan ID relasi tersebut saat mensubmit form.

---

## 📝 Panduan untuk Programmer Junior / AI Executor

1.  **Kerjakan Backend Terlebih Dahulu**: Jangan sentuh repopsitori frontend sebelum memastikan migrasi database berhasil, seeder wilayah berfungsi, dan API endpoints dapat diuji via Postman/Thunder Client.
2.  **Manajemen State Frontend**: Untuk *Cascading Dropdown* di Formasi, gunakan `useEffect` yang akan melakukan *fetch* data dependent (misal: fetch daftar kota *hanya* jika state `selectedProvinsi` berubah).
3.  **Hati-hati dengan Tipe Data**: Struktur API `wilayah.id` menggunakan `code` sebagai string angka (misal: `"32"` untuk Jawa Barat). Pastikan tipe relasi ID provinsi/kota Anda di Prisma schema diset sebagai `String`, bukan `Int`.

Selamat Mengerjakan!
