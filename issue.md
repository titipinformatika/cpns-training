# Setup Prisma di Subdirektori Backend

**Deskripsi:**
Melakukan setup dan integrasi Prisma ORM di dalam direktori `backend/` dengan koneksi ke database MySQL.

## Informasi Koneksi Database

| Parameter  | Nilai            |
|------------|------------------|
| Provider   | MySQL            |
| Host       | localhost        |
| Port       | 33061            |
| Database   | cpns_training    |
| User       | root             |
| Password   | root             |

**DATABASE_URL:**
```
mysql://root:root@localhost:33061/cpns_training
```

## Rencana Implementasi (Plan)

- [ ] **1. Inisialisasi Prisma**  
  Jalankan `npx prisma init` di dalam direktori `backend/` untuk men-generate folder `prisma/` beserta file `schema.prisma` dan `.env`.

- [ ] **2. Konfigurasi Koneksi Database (`.env`)**  
  Atur variabel `DATABASE_URL` pada file `backend/.env`:
  ```
  DATABASE_URL="mysql://root:root@localhost:33061/cpns_training"
  ```

- [ ] **3. Konfigurasi Schema (`schema.prisma`)**  
  Ubah provider di `backend/prisma/schema.prisma` menjadi `mysql`:
  ```prisma
  datasource db {
    provider = "mysql"
    url      = env("DATABASE_URL")
  }

  generator client {
    provider = "prisma-client-js"
  }
  ```
- [ ] **4. Setup Instance Terpusat Prisma Client**  
  Buat file `backend/src/lib/prisma.ts` sebagai single instance:
  ```typescript
  import { PrismaClient } from '@prisma/client';

  const prisma = new PrismaClient();

  export default prisma;
  ```
