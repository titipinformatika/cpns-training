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
    { kode: 'TKP', nama: 'Tes Karakteristik Pribadi', deskripsi: 'Mengukur karakteristik pribadi dalam pelayanan publik.', passing_grade: 166 }, // Updated PG for TKP
  ];

  for (const data of kategoriData) {
    await prisma.kategoriSoal.upsert({
      where: { kode: data.kode },
      update: data,
      create: data,
    });
  }
  console.log('  ✅ Kategori soal seeded');

  const kategoriTIU = await prisma.kategoriSoal.findUnique({ where: { kode: 'TIU' } });
  const kategoriTWK = await prisma.kategoriSoal.findUnique({ where: { kode: 'TWK' } });
  const kategoriTKP = await prisma.kategoriSoal.findUnique({ where: { kode: 'TKP' } });

  if (!kategoriTIU || !kategoriTWK || !kategoriTKP) throw new Error('Kategori missing');

  // === 2. Jenis Soal ===
  const jenisData = [
    { kategori_soal_id: kategoriTIU.id, nama: 'Verbal' },
    { kategori_soal_id: kategoriTIU.id, nama: 'Numerik' },
    { kategori_soal_id: kategoriTWK.id, nama: 'Nasionalisme' },
    { kategori_soal_id: kategoriTWK.id, nama: 'Integritas' },
    { kategori_soal_id: kategoriTKP.id, nama: 'Pelayanan Publik' },
  ];

  for (const data of jenisData) {
    await prisma.jenisSoal.upsert({
      where: { kategori_soal_id_nama: { kategori_soal_id: data.kategori_soal_id, nama: data.nama } },
      update: {},
      create: data,
    });
  }
  console.log('  ✅ Jenis soal seeded');

  // === 3. Admin Default ===
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@cpns.com' },
    update: {},
    create: {
      nama: 'Super Admin',
      email: 'admin@cpns.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('  ✅ Admin default seeded');

  // === 4. Master Data (Pendidikan, Jurusan, Instansi) ===
  const pend = await prisma.tingkatPendidikan.upsert({
    where: { nama: 'S1' },
    update: {},
    create: { nama: 'S1', urutan: 4 }
  });

  const jur = await prisma.jurusan.upsert({
    where: { id: 1 }, // Simplistic id-based for jur in seed
    update: {},
    create: { nama: 'Teknik Informatika', rumpun: 'Sains' }
  });

  const ins = await prisma.instansi.create({
    data: {
      nama: 'Kementerian Hukum dan Hak Asasi Manusia',
      singkatan: 'KEMENKUMHAM',
      jenis: 'KEMENTERIAN',
      created_by: admin.id
    }
  });

  await prisma.formasi.create({
    data: {
      instansi_id: ins.id,
      nama_jabatan: 'Penjaga Tahanan',
      created_by: admin.id
    }
  });
  console.log('  ✅ Master data seeded (Pendidikan, Instansi, Formasi)');

  // === 5. Simulasi Data (Bank Soal, Soal, Ujian) ===
  const bank = await prisma.bankSoal.create({
    data: {
      nama: 'Bank Soal Utama 2024',
      deskripsi: 'Kumpulan soal CPNS TERUPDATE',
      created_by: admin.id
    }
  });

  const jenisVerbal = await prisma.jenisSoal.findFirst({ where: { nama: 'Verbal' } });
  const jenisNasional = await prisma.jenisSoal.findFirst({ where: { nama: 'Nasionalisme' } });
  const jenisLayanan = await prisma.jenisSoal.findFirst({ where: { nama: 'Pelayanan Publik' } });

  // Create Sample Soal
  const soal1 = await prisma.soal.create({
    data: {
      bank_soal_id: bank.id,
      kategori_soal_id: kategoriTIU.id,
      jenis_soal_id: jenisVerbal!.id,
      level: 'MUDAH',
      pertanyaan: 'Sinonim dari kata "Egois" adalah...',
      opsi_a: 'Individualis', opsi_b: 'Dermawan', opsi_c: 'Sabar', opsi_d: 'Rajin', opsi_e: 'Marah',
      jawaban_benar: 'A',
      pembahasan: 'Egois memiliki makna mementingkan diri sendiri atau individualis.',
      created_by_admin: admin.id
    }
  });

  const soal2 = await prisma.soal.create({
    data: {
      bank_soal_id: bank.id,
      kategori_soal_id: kategoriTWK.id,
      jenis_soal_id: jenisNasional!.id,
      level: 'SEDANG',
      pertanyaan: 'Pancasila sebagai ideologi terbuka mengandung nilai dasar yang bersifat...',
      opsi_a: 'Berubah-ubah', opsi_b: 'Tetap', opsi_c: 'Kaku', opsi_d: 'Modern', opsi_e: 'Barat',
      jawaban_benar: 'B',
      pembahasan: 'Nilai dasar Pancasila bersifat tetap dan tidak berubah.',
      created_by_admin: admin.id
    }
  });

  const soal3 = await prisma.soal.create({
    data: {
      bank_soal_id: bank.id,
      kategori_soal_id: kategoriTKP.id,
      jenis_soal_id: jenisLayanan!.id,
      level: 'SULIT',
      pertanyaan: 'Jika ada pelanggan yang marah karena pelayanan lambat, sikap Anda adalah...',
      opsi_a: 'Membalas marah', opsi_b: 'Diam saja', opsi_c: 'Meminta maaf dan melayani segera', opsi_d: 'Pura-pura tidak tahu', opsi_e: 'Lapor atasan',
      jawaban_benar: 'C',
      pembahasan: 'Pelayanan publik yang baik mengedepankan empati dan solusi cepat.',
      created_by_admin: admin.id
    }
  });

  // Create Ujian
  const ujian1 = await prisma.ujian.create({
    data: {
      nama: 'Try Out Nasional CPNS 2024 - Batch 1',
      deskripsi: 'Simulasi lengkap TIU, TWK, TKP dengan passing grade resmi.',
      durasi_menit: 120,
      bank_soal_id: bank.id,
      tipe: 'TRYOUT',
      peruntukan: 'ALL',
      created_by: admin.id
    }
  });

  const ujian2 = await prisma.ujian.create({
    data: {
      nama: 'Latihan TIU Dasar',
      deskripsi: 'Latihan khusus materi verbal dan numerik untuk pemula.',
      durasi_menit: 30,
      bank_soal_id: bank.id,
      tipe: 'LATIHAN',
      peruntukan: 'FREE',
      created_by: admin.id
    }
  });

  // Link Soal to Ujian
  await prisma.ujianSoal.createMany({
    data: [
      { ujian_id: ujian1.id, soal_id: soal1.id, nomor_urut: 1 },
      { ujian_id: ujian1.id, soal_id: soal2.id, nomor_urut: 2 },
      { ujian_id: ujian1.id, soal_id: soal3.id, nomor_urut: 3 },
      { ujian_id: ujian2.id, soal_id: soal1.id, nomor_urut: 1 },
    ]
  });

  // Special Skor TKP for soal3 (optional in schema but good for TKP logic)
  await prisma.ujianSoalSkorTkp.create({
    data: {
      ujian_soal_id: (await prisma.ujianSoal.findFirst({ where: { ujian_id: ujian1.id, nomor_urut: 3 } }))!.id,
      skor_a: 1, skor_b: 2, skor_c: 5, skor_d: 3, skor_e: 4
    }
  });

  console.log('  ✅ Ujian & Soal seeded (2 Ujian, 3 Soal)');
  console.log('\n🎉 Seed completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
