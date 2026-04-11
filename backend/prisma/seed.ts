import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // === 1. Kategori Soal ===
  const kategoriData = [
    { kode: 'TIU', nama: 'Tes Intelegensia Umum', deskripsi: 'Mengukur kemampuan verbal, numerik, dan figural.', passing_grade: 80 },
    { kode: 'TWK', nama: 'Tes Wawasan Kebangsaan', deskripsi: 'Mengukur wawasan kebangsaan, integritas, dan bela negara.', passing_grade: 75 },
    { kode: 'TKP', nama: 'Tes Karakteristik Pribadi', deskripsi: 'Mengukur karakteristik pribadi dalam pelayanan publik.', passing_grade: 135 },
  ];

  for (const data of kategoriData) {
    await prisma.kategoriSoal.upsert({
      where: { kode: data.kode },
      update: data,
      create: data,
    });
  }
  console.log('  ✅ Kategori soal seeded (3 record)');

  // === 2. Jenis Soal ===
  const kategoriTIU = await prisma.kategoriSoal.findUnique({ where: { kode: 'TIU' } });
  const kategoriTWK = await prisma.kategoriSoal.findUnique({ where: { kode: 'TWK' } });
  const kategoriTKP = await prisma.kategoriSoal.findUnique({ where: { kode: 'TKP' } });

  if (!kategoriTIU || !kategoriTWK || !kategoriTKP) {
    throw new Error('Kategori soal tidak ditemukan.');
  }

  const jenisData = [
    { kategori_soal_id: kategoriTIU.id, nama: 'Verbal', deskripsi: 'Kemampuan memahami makna kata, sinonim, antonim.' },
    { kategori_soal_id: kategoriTIU.id, nama: 'Numerik', deskripsi: 'Kemampuan berhitung dan logika angka.' },
    { kategori_soal_id: kategoriTIU.id, nama: 'Figural', deskripsi: 'Kemampuan mengenali pola gambar dan figur.' },
    { kategori_soal_id: kategoriTIU.id, nama: 'Analogi', deskripsi: 'Kemampuan mencari hubungan kata/konsep.' },
    { kategori_soal_id: kategoriTIU.id, nama: 'Silogisme', deskripsi: 'Kemampuan penalaran logis dari premis.' },
    { kategori_soal_id: kategoriTWK.id, nama: 'Nasionalisme', deskripsi: 'Pemahaman nilai-nilai kebangsaan.' },
    { kategori_soal_id: kategoriTWK.id, nama: 'Integritas', deskripsi: 'Pemahaman tentang kejujuran dan etika.' },
    { kategori_soal_id: kategoriTWK.id, nama: 'Bela Negara', deskripsi: 'Pemahaman tentang pertahanan negara.' },
    { kategori_soal_id: kategoriTWK.id, nama: 'Pilar Negara', deskripsi: 'Pemahaman Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika.' },
    { kategori_soal_id: kategoriTWK.id, nama: 'Bahasa Indonesia', deskripsi: 'Kemampuan berbahasa Indonesia yang baik dan benar.' },
    { kategori_soal_id: kategoriTKP.id, nama: 'Pelayanan Publik', deskripsi: 'Sikap dalam melayani masyarakat.' },
    { kategori_soal_id: kategoriTKP.id, nama: 'Jejaring Kerja', deskripsi: 'Kemampuan kerjasama dan networking.' },
    { kategori_soal_id: kategoriTKP.id, nama: 'Sosial Budaya', deskripsi: 'Kepekaan terhadap sosial dan budaya.' },
    { kategori_soal_id: kategoriTKP.id, nama: 'TIK', deskripsi: 'Teknologi Informasi dan Komunikasi.' },
    { kategori_soal_id: kategoriTKP.id, nama: 'Profesionalisme', deskripsi: 'Sikap profesional dalam bekerja.' },
  ];

  for (const data of jenisData) {
    await prisma.jenisSoal.upsert({
      where: {
        kategori_soal_id_nama: {
          kategori_soal_id: data.kategori_soal_id,
          nama: data.nama,
        },
      },
      update: data,
      create: data,
    });
  }
  console.log('  ✅ Jenis soal seeded (15 record)');

  // === 3. Admin Default ===
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@cpns.com' },
    update: {},
    create: {
      nama: 'Super Admin',
      email: 'admin@cpns.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('  ✅ Admin default seeded (email: admin@cpns.com, pass: admin123)');

  // === 4. Tingkat Pendidikan ===
  const pendidikanData = [
    { nama: 'SMA/SMK', urutan: 1 },
    { nama: 'D3', urutan: 2 },
    { nama: 'D4', urutan: 3 },
    { nama: 'S1', urutan: 4 },
    { nama: 'S2', urutan: 5 },
    { nama: 'S3', urutan: 6 },
  ];

  for (const data of pendidikanData) {
    await prisma.tingkatPendidikan.upsert({
      where: { nama: data.nama },
      update: data,
      create: data,
    });
  }
  console.log('  ✅ Tingkat pendidikan seeded (6 record)');

  // === 5. Jurusan ===
  const jurusanData = [
    { nama: 'Teknik Informatika', rumpun: 'Sains & Teknologi' },
    { nama: 'Sistem Informasi', rumpun: 'Sains & Teknologi' },
    { nama: 'Ilmu Hukum', rumpun: 'Sosial Humaniora' },
    { nama: 'Akuntansi', rumpun: 'Ekonomi & Bisnis' },
    { nama: 'Manajemen', rumpun: 'Ekonomi & Bisnis' },
    { nama: 'Administrasi Publik', rumpun: 'Sosial Humaniora' },
    { nama: 'Ilmu Komunikasi', rumpun: 'Sosial Humaniora' },
    { nama: 'Teknik Sipil', rumpun: 'Sains & Teknologi' },
  ];

  for (const data of jurusanData) {
    const existing = await prisma.jurusan.findFirst({
      where: { nama: data.nama, rumpun: data.rumpun },
    });
    if (!existing) {
      await prisma.jurusan.create({ data });
    }
  }
  console.log('  ✅ Jurusan seeded (8 record)');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
