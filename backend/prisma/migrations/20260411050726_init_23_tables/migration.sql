-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `kategori` ENUM('FREE', 'PREMIUM') NOT NULL DEFAULT 'FREE',
    `avatar` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `url` VARCHAR(255) NULL,
    `icon` VARCHAR(100) NULL,
    `parent_id` INTEGER NULL,
    `urutan` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_access` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `menu_id` INTEGER NOT NULL,
    `user_kategori` ENUM('FREE', 'PREMIUM', 'ALL') NOT NULL,
    `is_allowed` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `menu_access_menu_id_user_kategori_key`(`menu_id`, `user_kategori`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kategori_soal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(10) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `deskripsi` TEXT NULL,
    `passing_grade` DOUBLE NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kategori_soal_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jenis_soal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kategori_soal_id` INTEGER NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `deskripsi` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `jenis_soal_kategori_soal_id_nama_key`(`kategori_soal_id`, `nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_soal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(200) NOT NULL,
    `deskripsi` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `soal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bank_soal_id` INTEGER NOT NULL,
    `kategori_soal_id` INTEGER NOT NULL,
    `jenis_soal_id` INTEGER NOT NULL,
    `level` ENUM('MUDAH', 'SEDANG', 'SULIT', 'HOST') NOT NULL,
    `pertanyaan` TEXT NULL,
    `pertanyaan_gambar` VARCHAR(255) NULL,
    `opsi_a` TEXT NULL,
    `opsi_a_gambar` VARCHAR(255) NULL,
    `opsi_b` TEXT NULL,
    `opsi_b_gambar` VARCHAR(255) NULL,
    `opsi_c` TEXT NULL,
    `opsi_c_gambar` VARCHAR(255) NULL,
    `opsi_d` TEXT NULL,
    `opsi_d_gambar` VARCHAR(255) NULL,
    `opsi_e` TEXT NULL,
    `opsi_e_gambar` VARCHAR(255) NULL,
    `jawaban_benar` ENUM('A', 'B', 'C', 'D', 'E') NULL,
    `pembahasan` TEXT NULL,
    `pembahasan_gambar` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by_admin` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kontribusi_soal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `kategori_soal_id` INTEGER NOT NULL,
    `jenis_soal_id` INTEGER NOT NULL,
    `level` ENUM('MUDAH', 'SEDANG', 'SULIT', 'HOST') NOT NULL,
    `pertanyaan` TEXT NULL,
    `pertanyaan_gambar` VARCHAR(255) NULL,
    `opsi_a` TEXT NULL,
    `opsi_a_gambar` VARCHAR(255) NULL,
    `opsi_b` TEXT NULL,
    `opsi_b_gambar` VARCHAR(255) NULL,
    `opsi_c` TEXT NULL,
    `opsi_c_gambar` VARCHAR(255) NULL,
    `opsi_d` TEXT NULL,
    `opsi_d_gambar` VARCHAR(255) NULL,
    `opsi_e` TEXT NULL,
    `opsi_e_gambar` VARCHAR(255) NULL,
    `jawaban_benar` ENUM('A', 'B', 'C', 'D', 'E') NULL,
    `pembahasan` TEXT NULL,
    `pembahasan_gambar` VARCHAR(255) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewed_by` INTEGER NULL,
    `review_note` TEXT NULL,
    `reviewed_at` DATETIME(3) NULL,
    `soal_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ujian` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(200) NOT NULL,
    `deskripsi` TEXT NULL,
    `durasi_menit` INTEGER NOT NULL,
    `bank_soal_id` INTEGER NOT NULL,
    `tipe` ENUM('TRYOUT', 'LATIHAN', 'QUIZ') NOT NULL,
    `peruntukan` ENUM('FREE', 'PREMIUM', 'ALL') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ujian_soal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ujian_id` INTEGER NOT NULL,
    `soal_id` INTEGER NOT NULL,
    `nomor_urut` INTEGER NOT NULL,
    `skor` INTEGER NOT NULL DEFAULT 5,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ujian_soal_ujian_id_soal_id_key`(`ujian_id`, `soal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ujian_soal_skor_tkp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ujian_soal_id` INTEGER NOT NULL,
    `skor_a` INTEGER NOT NULL DEFAULT 1,
    `skor_b` INTEGER NOT NULL DEFAULT 2,
    `skor_c` INTEGER NOT NULL DEFAULT 3,
    `skor_d` INTEGER NOT NULL DEFAULT 4,
    `skor_e` INTEGER NOT NULL DEFAULT 5,

    UNIQUE INDEX `ujian_soal_skor_tkp_ujian_soal_id_key`(`ujian_soal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hasil_ujian` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `ujian_id` INTEGER NOT NULL,
    `percobaan_ke` INTEGER NOT NULL DEFAULT 1,
    `total_soal` INTEGER NOT NULL,
    `jumlah_dijawab` INTEGER NOT NULL DEFAULT 0,
    `jumlah_benar` INTEGER NOT NULL DEFAULT 0,
    `jumlah_salah` INTEGER NOT NULL DEFAULT 0,
    `jumlah_kosong` INTEGER NOT NULL DEFAULT 0,
    `skor_tiu` DOUBLE NOT NULL DEFAULT 0,
    `skor_twk` DOUBLE NOT NULL DEFAULT 0,
    `skor_tkp` DOUBLE NOT NULL DEFAULT 0,
    `skor_total` DOUBLE NOT NULL DEFAULT 0,
    `is_lulus` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('BERLANGSUNG', 'SELESAI', 'TIMEOUT') NOT NULL DEFAULT 'BERLANGSUNG',
    `waktu_mulai` DATETIME(3) NOT NULL,
    `waktu_selesai` DATETIME(3) NULL,
    `durasi_detik` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `hasil_ujian_user_id_ujian_id_idx`(`user_id`, `ujian_id`),
    INDEX `hasil_ujian_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jawaban_ujian` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hasil_ujian_id` INTEGER NOT NULL,
    `ujian_soal_id` INTEGER NOT NULL,
    `jawaban_user` ENUM('A', 'B', 'C', 'D', 'E') NULL,
    `is_benar` BOOLEAN NULL,
    `skor_diperoleh` DOUBLE NOT NULL DEFAULT 0,
    `waktu_jawab_detik` INTEGER NOT NULL DEFAULT 0,
    `is_ragu` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jawaban_ujian_hasil_ujian_id_ujian_soal_id_key`(`hasil_ujian_id`, `ujian_soal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statistik_user_kategori` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `kategori_soal_id` INTEGER NOT NULL,
    `total_soal_dijawab` INTEGER NOT NULL DEFAULT 0,
    `total_benar` INTEGER NOT NULL DEFAULT 0,
    `total_salah` INTEGER NOT NULL DEFAULT 0,
    `total_skor` DOUBLE NOT NULL DEFAULT 0,
    `skor_tertinggi` DOUBLE NOT NULL DEFAULT 0,
    `skor_terendah` DOUBLE NOT NULL DEFAULT 0,
    `skor_rata_rata` DOUBLE NOT NULL DEFAULT 0,
    `persentase_benar` DOUBLE NOT NULL DEFAULT 0,
    `total_ujian` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `statistik_user_kategori_user_id_kategori_soal_id_key`(`user_id`, `kategori_soal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statistik_user_jenis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `jenis_soal_id` INTEGER NOT NULL,
    `total_soal_dijawab` INTEGER NOT NULL DEFAULT 0,
    `total_benar` INTEGER NOT NULL DEFAULT 0,
    `total_salah` INTEGER NOT NULL DEFAULT 0,
    `skor_rata_rata` DOUBLE NOT NULL DEFAULT 0,
    `persentase_benar` DOUBLE NOT NULL DEFAULT 0,
    `tingkat_penguasaan` ENUM('BELUM', 'RENDAH', 'SEDANG', 'TINGGI', 'MAHIR') NOT NULL DEFAULT 'BELUM',
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `statistik_user_jenis_user_id_jenis_soal_id_key`(`user_id`, `jenis_soal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sesi_ujian` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hasil_ujian_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `ujian_id` INTEGER NOT NULL,
    `nomor_soal_terakhir` INTEGER NOT NULL DEFAULT 1,
    `sisa_waktu_detik` INTEGER NOT NULL,
    `total_terjawab` INTEGER NOT NULL DEFAULT 0,
    `total_belum_jawab` INTEGER NOT NULL,
    `total_ragu` INTEGER NOT NULL DEFAULT 0,
    `status_sesi` ENUM('AKTIF', 'TERPUTUS', 'DILANJUTKAN', 'SELESAI') NOT NULL DEFAULT 'AKTIF',
    `last_heartbeat` DATETIME(3) NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `jumlah_resume` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sesi_ujian_hasil_ujian_id_key`(`hasil_ujian_id`),
    INDEX `sesi_ujian_user_id_status_sesi_idx`(`user_id`, `status_sesi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tingkat_pendidikan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(50) NOT NULL,
    `urutan` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tingkat_pendidikan_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jurusan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(200) NOT NULL,
    `rumpun` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `jurusan_nama_idx`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instansi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(200) NOT NULL,
    `singkatan` VARCHAR(50) NULL,
    `jenis` ENUM('KEMENTERIAN', 'LEMBAGA', 'PEMDA', 'LAINNYA') NOT NULL DEFAULT 'LEMBAGA',
    `logo` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `instansi_nama_idx`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `formasi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `instansi_id` INTEGER NOT NULL,
    `nama_jabatan` VARCHAR(200) NOT NULL,
    `kualifikasi_pendidikan` VARCHAR(100) NULL,
    `jumlah_formasi` INTEGER NOT NULL DEFAULT 1,
    `lokasi_penempatan` VARCHAR(200) NULL,
    `gaji_min` BIGINT NULL,
    `gaji_max` BIGINT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `formasi_instansi_id_idx`(`instansi_id`),
    INDEX `formasi_nama_jabatan_idx`(`nama_jabatan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biodata_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `nama_lengkap` VARCHAR(150) NULL,
    `no_hp` VARCHAR(20) NULL,
    `tanggal_lahir` DATE NULL,
    `jenis_kelamin` ENUM('LAKI_LAKI', 'PEREMPUAN') NULL,
    `alamat` TEXT NULL,
    `provinsi` VARCHAR(100) NULL,
    `kota` VARCHAR(100) NULL,
    `tingkat_pendidikan_id` INTEGER NULL,
    `jurusan_id` INTEGER NULL,
    `nama_universitas` VARCHAR(200) NULL,
    `tahun_lulus` INTEGER NULL,
    `instansi_id` INTEGER NULL,
    `formasi_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `biodata_user_user_id_key`(`user_id`),
    INDEX `biodata_user_instansi_id_formasi_id_idx`(`instansi_id`, `formasi_id`),
    INDEX `biodata_user_tingkat_pendidikan_id_idx`(`tingkat_pendidikan_id`),
    INDEX `biodata_user_jurusan_id_idx`(`jurusan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laporan_soal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `soal_id` INTEGER NOT NULL,
    `jenis_laporan` ENUM('JAWABAN_SALAH', 'SOAL_SALAH', 'TYPO', 'PEMBAHASAN_SALAH', 'GAMBAR_RUSAK', 'DUPLIKAT', 'LAINNYA') NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `bukti_screenshot` VARCHAR(255) NULL,
    `status` ENUM('PENDING', 'DITINJAU', 'DIPERBAIKI', 'DITOLAK') NOT NULL DEFAULT 'PENDING',
    `reviewed_by` INTEGER NULL,
    `review_note` TEXT NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `laporan_soal_soal_id_status_idx`(`soal_id`, `status`),
    INDEX `laporan_soal_user_id_idx`(`user_id`),
    INDEX `laporan_soal_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `menus` ADD CONSTRAINT `menus_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `menus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menus` ADD CONSTRAINT `menus_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `admins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_access` ADD CONSTRAINT `menu_access_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jenis_soal` ADD CONSTRAINT `jenis_soal_kategori_soal_id_fkey` FOREIGN KEY (`kategori_soal_id`) REFERENCES `kategori_soal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_soal` ADD CONSTRAINT `bank_soal_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `admins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `soal` ADD CONSTRAINT `soal_bank_soal_id_fkey` FOREIGN KEY (`bank_soal_id`) REFERENCES `bank_soal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `soal` ADD CONSTRAINT `soal_kategori_soal_id_fkey` FOREIGN KEY (`kategori_soal_id`) REFERENCES `kategori_soal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `soal` ADD CONSTRAINT `soal_jenis_soal_id_fkey` FOREIGN KEY (`jenis_soal_id`) REFERENCES `jenis_soal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `soal` ADD CONSTRAINT `soal_created_by_admin_fkey` FOREIGN KEY (`created_by_admin`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kontribusi_soal` ADD CONSTRAINT `kontribusi_soal_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kontribusi_soal` ADD CONSTRAINT `kontribusi_soal_kategori_soal_id_fkey` FOREIGN KEY (`kategori_soal_id`) REFERENCES `kategori_soal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kontribusi_soal` ADD CONSTRAINT `kontribusi_soal_jenis_soal_id_fkey` FOREIGN KEY (`jenis_soal_id`) REFERENCES `jenis_soal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kontribusi_soal` ADD CONSTRAINT `kontribusi_soal_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kontribusi_soal` ADD CONSTRAINT `kontribusi_soal_soal_id_fkey` FOREIGN KEY (`soal_id`) REFERENCES `soal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ujian` ADD CONSTRAINT `ujian_bank_soal_id_fkey` FOREIGN KEY (`bank_soal_id`) REFERENCES `bank_soal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ujian` ADD CONSTRAINT `ujian_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `admins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ujian_soal` ADD CONSTRAINT `ujian_soal_ujian_id_fkey` FOREIGN KEY (`ujian_id`) REFERENCES `ujian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ujian_soal` ADD CONSTRAINT `ujian_soal_soal_id_fkey` FOREIGN KEY (`soal_id`) REFERENCES `soal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ujian_soal_skor_tkp` ADD CONSTRAINT `ujian_soal_skor_tkp_ujian_soal_id_fkey` FOREIGN KEY (`ujian_soal_id`) REFERENCES `ujian_soal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hasil_ujian` ADD CONSTRAINT `hasil_ujian_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hasil_ujian` ADD CONSTRAINT `hasil_ujian_ujian_id_fkey` FOREIGN KEY (`ujian_id`) REFERENCES `ujian`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jawaban_ujian` ADD CONSTRAINT `jawaban_ujian_hasil_ujian_id_fkey` FOREIGN KEY (`hasil_ujian_id`) REFERENCES `hasil_ujian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jawaban_ujian` ADD CONSTRAINT `jawaban_ujian_ujian_soal_id_fkey` FOREIGN KEY (`ujian_soal_id`) REFERENCES `ujian_soal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `statistik_user_kategori` ADD CONSTRAINT `statistik_user_kategori_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `statistik_user_kategori` ADD CONSTRAINT `statistik_user_kategori_kategori_soal_id_fkey` FOREIGN KEY (`kategori_soal_id`) REFERENCES `kategori_soal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `statistik_user_jenis` ADD CONSTRAINT `statistik_user_jenis_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `statistik_user_jenis` ADD CONSTRAINT `statistik_user_jenis_jenis_soal_id_fkey` FOREIGN KEY (`jenis_soal_id`) REFERENCES `jenis_soal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesi_ujian` ADD CONSTRAINT `sesi_ujian_hasil_ujian_id_fkey` FOREIGN KEY (`hasil_ujian_id`) REFERENCES `hasil_ujian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesi_ujian` ADD CONSTRAINT `sesi_ujian_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesi_ujian` ADD CONSTRAINT `sesi_ujian_ujian_id_fkey` FOREIGN KEY (`ujian_id`) REFERENCES `ujian`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instansi` ADD CONSTRAINT `instansi_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `admins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formasi` ADD CONSTRAINT `formasi_instansi_id_fkey` FOREIGN KEY (`instansi_id`) REFERENCES `instansi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formasi` ADD CONSTRAINT `formasi_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `admins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biodata_user` ADD CONSTRAINT `biodata_user_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biodata_user` ADD CONSTRAINT `biodata_user_tingkat_pendidikan_id_fkey` FOREIGN KEY (`tingkat_pendidikan_id`) REFERENCES `tingkat_pendidikan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biodata_user` ADD CONSTRAINT `biodata_user_jurusan_id_fkey` FOREIGN KEY (`jurusan_id`) REFERENCES `jurusan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biodata_user` ADD CONSTRAINT `biodata_user_instansi_id_fkey` FOREIGN KEY (`instansi_id`) REFERENCES `instansi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biodata_user` ADD CONSTRAINT `biodata_user_formasi_id_fkey` FOREIGN KEY (`formasi_id`) REFERENCES `formasi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laporan_soal` ADD CONSTRAINT `laporan_soal_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laporan_soal` ADD CONSTRAINT `laporan_soal_soal_id_fkey` FOREIGN KEY (`soal_id`) REFERENCES `soal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laporan_soal` ADD CONSTRAINT `laporan_soal_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
