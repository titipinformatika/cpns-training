/*
  Warnings:

  - You are about to drop the column `kualifikasi_pendidikan` on the `formasi` table. All the data in the column will be lost.
  - You are about to drop the column `lokasi_penempatan` on the `formasi` table. All the data in the column will be lost.
  - You are about to alter the column `jenis` on the `instansi` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(14))`.

*/
-- AlterTable
ALTER TABLE `formasi` DROP COLUMN `kualifikasi_pendidikan`,
    DROP COLUMN `lokasi_penempatan`,
    ADD COLUMN `jurusan_id` INTEGER NULL,
    ADD COLUMN `kota_kode` VARCHAR(10) NULL,
    ADD COLUMN `provinsi_kode` VARCHAR(10) NULL,
    ADD COLUMN `tingkat_pendidikan_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `instansi` MODIFY `jenis` ENUM('KEMENTERIAN', 'LEMBAGA_NON_KEMENTERIAN', 'PEMDA_PROVINSI', 'PEMDA_KAB_KOTA', 'INSTANSI_VERTIKAL', 'LEMBAGA_NEGARA_INDEPENDEN') NOT NULL DEFAULT 'LEMBAGA_NON_KEMENTERIAN';

-- AlterTable
ALTER TABLE `jurusan` ADD COLUMN `tingkat_pendidikan_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `soal` ADD COLUMN `skor_a` INTEGER NULL,
    ADD COLUMN `skor_b` INTEGER NULL,
    ADD COLUMN `skor_c` INTEGER NULL,
    ADD COLUMN `skor_d` INTEGER NULL,
    ADD COLUMN `skor_e` INTEGER NULL;

-- CreateTable
CREATE TABLE `provinsi` (
    `kode` VARCHAR(10) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`kode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kota` (
    `kode` VARCHAR(10) NOT NULL,
    `provinsi_kode` VARCHAR(10) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`kode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jurusan` ADD CONSTRAINT `jurusan_tingkat_pendidikan_id_fkey` FOREIGN KEY (`tingkat_pendidikan_id`) REFERENCES `tingkat_pendidikan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formasi` ADD CONSTRAINT `formasi_tingkat_pendidikan_id_fkey` FOREIGN KEY (`tingkat_pendidikan_id`) REFERENCES `tingkat_pendidikan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formasi` ADD CONSTRAINT `formasi_jurusan_id_fkey` FOREIGN KEY (`jurusan_id`) REFERENCES `jurusan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formasi` ADD CONSTRAINT `formasi_provinsi_kode_fkey` FOREIGN KEY (`provinsi_kode`) REFERENCES `provinsi`(`kode`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formasi` ADD CONSTRAINT `formasi_kota_kode_fkey` FOREIGN KEY (`kota_kode`) REFERENCES `kota`(`kode`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kota` ADD CONSTRAINT `kota_provinsi_kode_fkey` FOREIGN KEY (`provinsi_kode`) REFERENCES `provinsi`(`kode`) ON DELETE CASCADE ON UPDATE CASCADE;
