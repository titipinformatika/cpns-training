/*
  Warnings:

  - You are about to drop the column `kota` on the `biodata_user` table. All the data in the column will be lost.
  - You are about to drop the column `provinsi` on the `biodata_user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `biodata_user` DROP COLUMN `kota`,
    DROP COLUMN `provinsi`,
    ADD COLUMN `kota_kode` VARCHAR(10) NULL,
    ADD COLUMN `provinsi_kode` VARCHAR(10) NULL;

-- AlterTable
ALTER TABLE `kontribusi_soal` ADD COLUMN `skor_a` INTEGER NULL,
    ADD COLUMN `skor_b` INTEGER NULL,
    ADD COLUMN `skor_c` INTEGER NULL,
    ADD COLUMN `skor_d` INTEGER NULL,
    ADD COLUMN `skor_e` INTEGER NULL;

-- CreateIndex
CREATE INDEX `biodata_user_provinsi_kode_idx` ON `biodata_user`(`provinsi_kode`);

-- CreateIndex
CREATE INDEX `biodata_user_kota_kode_idx` ON `biodata_user`(`kota_kode`);

-- AddForeignKey
ALTER TABLE `biodata_user` ADD CONSTRAINT `biodata_user_provinsi_kode_fkey` FOREIGN KEY (`provinsi_kode`) REFERENCES `provinsi`(`kode`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biodata_user` ADD CONSTRAINT `biodata_user_kota_kode_fkey` FOREIGN KEY (`kota_kode`) REFERENCES `kota`(`kode`) ON DELETE SET NULL ON UPDATE CASCADE;
