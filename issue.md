# FASE 4: INTI BACKOFFICE (PEMBUATAN SOAL)
**Deskripsi:** Membuat materi/bahan agar simulasi ujian bisa berjalan.

- [ ] **Bank Soal** - Admin buat "Wadah" soal.
- [ ] **Paket Ujian** - Mapping Wadah ke Ujian spesifik (Tipe Latihan, Peruntukan Premium/Free).
- [ ] **Endpoint Pembuatan Soal**. Handle upload `pertanyaan_gambar` & `opsi_gambar`.
- [ ] **Endpoint UjianSoal** (Mapping urutan soal ke Paket Ujian) & Scoring Khusus (tkp_skor).

---

## Panduan Implementasi Fase 4

### 1. Model Database Terkait (Prisma)
Pastikan kamu memahami relasi antara model-model berikut di `schema.prisma`:
- `BankSoal`: Wadah utama untuk kategori soal tertentu.
- `PaketUjian`: Pengelompokan soal untuk ujian tertentu.
- `Soal`: Isi soal, pilihan jawaban (opsi), dan kunci jawaban.
- `PaketUjianSoal`: Tabel pivot untuk menentukan soal apa saja yang masuk ke paket mana.

### 2. Fitur Utama
1. **CRUD Bank Soal & Paket Ujian**: Endpoint standard untuk Admin.
2. **Manajemen Soal**: 
   - Harus bisa menyimpan teks soal dan pilihan A-E.
   - Mendukung upload gambar (gunakan middleware upload yang sudah ada).
   - Penanganan khusus skor TKP (setiap opsi jawaban bisa memiliki bobot nilai 1-5).
3. **Penyusunan Paket**: 
   - Fitur untuk memasukkan soal-soal dari Bank Soal ke dalam Paket Ujian secara manual atau random (opsional).

### 3. Validasi & Keamanan
- Gunakan Zod untuk validasi input.
- Semua endpoint ini wajib menggunakan middleware `authenticateAdmin`.
- Lakukan pengecekan `BigInt` jika ada field numerik yang sangat besar di database (meskipun untuk soal biasanya Int cukup).

### 4. Testing
- Buat unit test untuk controller pembuatan soal.
- Pastikan logika scoring (terutama TKP) dihitung dengan benar.
