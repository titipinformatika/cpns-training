# Setup Prisma di Subdirektori Backend

**Deskripsi:**
Tugas ini bertujuan untuk melakukan setup dan integrasi Prisma ORM di dalam direktori `backend/` untuk memfasilitasi pengelolaan operasi database pada aplikasi. Dikarenakan *package* Prisma (`prisma` dan `@prisma/client`) sudah tersedia di `package.json`, tugas utamanya adalah menginisialisasi skema, konfigurasi database, dan mengonfigurasi instansiasi Prisma client.

## Rencana Implementasi (Plan)

- [ ] **1. Inisialisasi & Review Struktur Prisma**  
  Pastikan operasi dilakukan di dalam direktori `backend/`. Jika skema awal belum siap, jalankan `npx prisma init` untuk men-generate kerangka *folder* `prisma/` beserta `schema.prisma` dan penambahan *environment variable* `DATABASE_URL` pada `.env`.

- [ ] **2. Konfigurasi Koneksi Database (`.env`)**  
  Atur variabel `DATABASE_URL` pada file `.env` di dalam `backend/` untuk mengarah ke database utama yang akan digunakan (*MySQL*).

- [ ] **3. Perancangan Model Data (`schema.prisma`)**  
  Buka file `backend/prisma/schema.prisma` dan tentukan tabel-tabel basis data yang dibutuhkan (misal: entitas `User`, dsb). Konfirmasikan tipe relasi dan *provider* yang tepat.

- [ ] **4. Eksekusi Migrasi Database**  
  Jalankan perintah `npx prisma migrate dev --name init` untuk menyinkronkan *schema* yang telah dibuat dengan keadaan di *database provider* melalui pembuatan tabel atau relasi baru.

- [ ] **5. Menghasilkan Prisma Client**  
  Jalankan `npx prisma generate` untuk memperbarui modul *type-safe* operasi database yang dapat diimpor langsung oleh source code.

- [ ] **6. Setup Instance Terpusat Prisma Client**  
  Buat sebuah file yang berfungsi sebagai satu sumber instansiasi DB (contoh di `backend/src/lib/prisma.ts` atau `backend/src/config/db.ts`) untuk memastikan kita tidak meng-generate terlalu banyak *client instance*:

  ```typescript
  import { PrismaClient } from '@prisma/client';

  const prisma = new PrismaClient();

  export default prisma;
  ```
