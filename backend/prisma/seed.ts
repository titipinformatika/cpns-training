import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  // 1. Kategori & Jenis Soal
  const kategoriData = [
    { kode: 'TIU', nama: 'Tes Intelegensia Umum', deskripsi: 'Analogi, Silogisme, Numerik, Figural', passing_grade: 80 },
    { kode: 'TWK', nama: 'Tes Wawasan Kebangsaan', deskripsi: 'Pancasila, UUD 1945, Bhinneka Tunggal Ika', passing_grade: 75 },
    { kode: 'TKP', nama: 'Tes Karakteristik Pribadi', deskripsi: 'Pelayanan Publik, Jejaring Kerja, TIK', passing_grade: 166 },
  ];

  for (const k of kategoriData) {
    await prisma.kategoriSoal.upsert({
      where: { kode: k.kode },
      update: k,
      create: k,
    });
  }

  const tius = await prisma.kategoriSoal.findUnique({ where: { kode: 'TIU' } });
  const twks = await prisma.kategoriSoal.findUnique({ where: { kode: 'TWK' } });
  const tkps = await prisma.kategoriSoal.findUnique({ where: { kode: 'TKP' } });

  const jenisSoals = [
    { kategori_soal_id: tius!.id, nama: 'Analogi' },
    { kategori_soal_id: tius!.id, nama: 'Silogisme' },
    { kategori_soal_id: tius!.id, nama: 'Analitis' },
    { kategori_soal_id: tius!.id, nama: 'Berhitung' },
    { kategori_soal_id: twks!.id, nama: 'Nasionalisme' },
    { kategori_soal_id: twks!.id, nama: 'Integritas' },
    { kategori_soal_id: twks!.id, nama: 'Bela Negara' },
    { kategori_soal_id: tkps!.id, nama: 'Pelayanan Publik' },
    { kategori_soal_id: tkps!.id, nama: 'Jejaring Kerja' },
    { kategori_soal_id: tkps!.id, nama: 'Sosial Budaya' },
  ];

  for (const j of jenisSoals) {
    await prisma.jenisSoal.upsert({
      where: { kategori_soal_id_nama: { kategori_soal_id: j.kategori_soal_id, nama: j.nama } },
      update: {},
      create: j
    });
  }

  // 2. Pendidikan & Jurusan
  const eduLevels = [
    { nama: 'SMA/Sederajat', urutan: 1 },
    { nama: 'DIII', urutan: 2 },
    { nama: 'DIV/S1', urutan: 3 },
    { nama: 'S2', urutan: 4 },
  ];

  for (const e of eduLevels) {
    await prisma.tingkatPendidikan.upsert({
      where: { nama: e.nama },
      update: { urutan: e.urutan },
      create: e
    });
  }

  const s1 = await prisma.tingkatPendidikan.findUnique({ where: { nama: 'DIV/S1' } });
  const sma = await prisma.tingkatPendidikan.findUnique({ where: { nama: 'SMA/Sederajat' } });

  const jurusans = [
    { tingkat_pendidikan_id: s1!.id, nama: 'Informatika / Ilmu Komputer / Sistem Informasi' },
    { tingkat_pendidikan_id: s1!.id, nama: 'Hukum' },
    { tingkat_pendidikan_id: s1!.id, nama: 'Akuntansi / Ekonomi' },
    { tingkat_pendidikan_id: s1!.id, nama: 'Pendidikan Guru (PGSD)' },
    { tingkat_pendidikan_id: sma!.id, nama: 'Semua Jurusan (SMA/MA/SMK)' },
  ];

  for (const jr of jurusans) {
    await prisma.jurusan.create({ data: jr });
  }

  // 3. Admin & Instansi
  let admin = await prisma.admin.findFirst({ where: { role: 'SUPER_ADMIN' } });
  
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin = await prisma.admin.create({
      data: {
        nama: 'Super Admin',
        email: 'admin@titipinformatika.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      }
    });
    console.log('✅ Default Super Admin created (admin123)');
  }
  
  const instansiList = [
    { nama: 'Kementerian Hukum dan Hak Asasi Manusia', singkatan: 'KEMENKUMHAM', jenis: 'KEMENTERIAN' },
    { nama: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi', singkatan: 'KEMENDIKBUDRISTEK', jenis: 'KEMENTERIAN' },
    { nama: 'Kejaksaan Agung Republik Indonesia', singkatan: 'KEJAKSAAN', jenis: 'LEMBAGA_NON_KEMENTERIAN' },
    { nama: 'Pemerintah Provinsi Jawa Barat', singkatan: 'PEMPROV JABAR', jenis: 'PEMDA_PROVINSI' },
    { nama: 'Pemerintah Kota Bandung', singkatan: 'PEMKOT BANDUNG', jenis: 'PEMDA_KAB_KOTA' },
  ];

  for (const ins of instansiList) {
    await prisma.instansi.create({
      data: { ...ins, created_by: admin!.id }
    });
  }

  // 4. Formasi (Sample)
  const instansiJabar = await prisma.instansi.findFirst({ where: { singkatan: 'PEMPROV JABAR' } });
  const jurHukum = await prisma.jurusan.findFirst({ where: { nama: { contains: 'Hukum' } } });
  const provJabar = await prisma.provinsi.findFirst({ where: { nama: { contains: 'JAWA BARAT' } } });
  const kotaBandung = await prisma.kota.findFirst({ where: { nama: { contains: 'BANDUNG' } } });

  if (instansiJabar && s1 && jurHukum && provJabar && kotaBandung && admin) {
    await prisma.formasi.create({
      data: {
        instansi_id: instansiJabar.id,
        nama_jabatan: 'Analis Hukum Ahli Pertama',
        tingkat_pendidikan_id: s1.id,
        jurusan_id: jurHukum.id,
        jumlah_formasi: 5,
        provinsi_kode: provJabar.kode,
        kota_kode: kotaBandung.kode,
        created_by: admin.id,
        gaji_min: BigInt(4500000),
        gaji_max: BigInt(7500000)
      }
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
