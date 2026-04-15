import { PrismaClient, JawabanOpsi, LevelSoal } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding 100 Soal simulasi SKD...');

  // 1. Setup Admin
  let admin = await prisma.admin.findFirst();
  if (!admin) {
    admin = await prisma.admin.create({
      data: {
        nama: 'Super Admin',
        email: 'admin@cpns.local',
        password: 'hashed_password', // Mocked
        role: 'SUPER_ADMIN'
      }
    });
  }

  // 2. Setup Kategori Soal
  const kategories = [
    { kode: 'TWK', nama: 'Tes Wawasan Kebangsaan', passing_grade: 65 },
    { kode: 'TIU', nama: 'Tes Intelegensi Umum', passing_grade: 80 },
    { kode: 'TKP', nama: 'Tes Karakteristik Pribadi', passing_grade: 166 }
  ];

  const dbKategories: Record<string, any> = {};
  for (const kat of kategories) {
    dbKategories[kat.kode] = await prisma.kategoriSoal.upsert({
      where: { kode: kat.kode },
      update: { passing_grade: kat.passing_grade },
      create: { kode: kat.kode, nama: kat.nama, passing_grade: kat.passing_grade }
    });
  }

  // 3. Setup Jenis Soal
  const getJenis = async (katId: number, nama: string) => {
    let jenis = await prisma.jenisSoal.findFirst({
      where: { kategori_soal_id: katId, nama: nama }
    });
    if (!jenis) {
      jenis = await prisma.jenisSoal.create({
        data: { kategori_soal_id: katId, nama: nama }
      });
    }
    return jenis;
  };

  const jenisTwk = await getJenis(dbKategories['TWK'].id, 'Nasionalisme');
  const jenisTiu = await getJenis(dbKategories['TIU'].id, 'Analogi');
  const jenisTkp = await getJenis(dbKategories['TKP'].id, 'Pelayanan Publik');

  // 4. Buat Bank Soal
  const bankSoal = await prisma.bankSoal.create({
    data: {
      nama: 'Bank Soal Simulasi 100 SKD CPNS',
      deskripsi: 'Bank soal lengkap sesuai CAT BKN',
      created_by: admin.id
    }
  });

  // 5. Generate Soals & Ujian
  const ujian = await prisma.ujian.create({
    data: {
      nama: 'Simulasi SKD CPNS BKN 100 Soal Lengkap',
      deskripsi: 'Paket simulasi gratis untuk menguji UI aplikasi',
      durasi_menit: 100,
      bank_soal_id: bankSoal.id,
      tipe: 'TRYOUT',
      peruntukan: 'FREE',
      created_by: admin.id
    }
  });

  let noUrut = 1;

  // --- TWK (35 Soal) ---
  for (let i = 1; i <= 35; i++) {
    const soal = await prisma.soal.create({
      data: {
        bank_soal_id: bankSoal.id,
        kategori_soal_id: dbKategories['TWK'].id,
        jenis_soal_id: jenisTwk.id,
        level: LevelSoal.SEDANG,
        pertanyaan: `Soal TWK nomor ${i}. Berikut ini yang mencerminkan sikap pengamalan Pancasila sila ke...`,
        opsi_a: 'Sikap toleransi antar umat beragama',
        opsi_b: 'Melakukan musyawarah untuk mufakat',
        opsi_c: 'Rela berkorban untuk nusa bangsa',
        opsi_d: 'Gemar menabung dan tidak boros',
        opsi_e: 'Memiliki tenggang rasa dan tepa selira',
        jawaban_benar: JawabanOpsi.B,
        pembahasan: 'Musyawarah adalah pengamalan sila ke 4.',
        created_by_admin: admin.id
      }
    });

    await prisma.ujianSoal.create({
      data: {
        ujian_id: ujian.id,
        soal_id: soal.id,
        nomor_urut: noUrut++,
        skor: 5
      }
    });
  }

  // --- TIU (30 Soal) ---
  for (let i = 1; i <= 30; i++) {
    const soal = await prisma.soal.create({
      data: {
        bank_soal_id: bankSoal.id,
        kategori_soal_id: dbKategories['TIU'].id,
        jenis_soal_id: jenisTiu.id,
        level: LevelSoal.SEDANG,
        pertanyaan: `Soal TIU Logika nomor ${i}. Jika semua A adalah B, dan C adalah A, maka kesimpulannya adalah...`,
        opsi_a: 'Semua C adalah B',
        opsi_b: 'Sebagian C adalah A',
        opsi_c: 'Tidak ada C yang B',
        opsi_d: 'Semua B adalah C',
        opsi_e: 'Selain A pasti C',
        jawaban_benar: JawabanOpsi.A,
        pembahasan: 'Sosiologisme rasional.',
        created_by_admin: admin.id
      }
    });

    await prisma.ujianSoal.create({
      data: {
        ujian_id: ujian.id,
        soal_id: soal.id,
        nomor_urut: noUrut++,
        skor: 5
      }
    });
  }

  // --- TKP (35 Soal) ---
  for (let i = 1; i <= 35; i++) {
    const soal = await prisma.soal.create({
      data: {
        bank_soal_id: bankSoal.id,
        kategori_soal_id: dbKategories['TKP'].id,
        jenis_soal_id: jenisTkp.id,
        level: LevelSoal.SULIT,
        pertanyaan: `Soal TKP Situasi nomor ${i}. Saat Anda diminta melayani klien yang sedang emosi sementara antrian panjang, Anda akan...`,
        opsi_a: 'Minta rekan menggantikan (1 Poin)',
        opsi_b: 'Tenangkan diri lalu dengarkan (4 Poin)',
        opsi_c: 'Tersenyum dan meminta maaf lalu memberi solusi empati (5 Poin)',
        opsi_d: 'Memarahi balik klien (0 Poin)',
        opsi_e: 'Memanggil satpam (2 Poin)',
        jawaban_benar: null,
        pembahasan: 'Opsi C paling menunjukan pelayanan publik berorientasi kepuasan hati.',
        created_by_admin: admin.id
      }
    });

    const ujianSoal = await prisma.ujianSoal.create({
      data: {
        ujian_id: ujian.id,
        soal_id: soal.id,
        nomor_urut: noUrut++,
        skor: 5
      }
    });

    // Create bobot TKP (1-5)
    await prisma.ujianSoalSkorTkp.create({
      data: {
        ujian_soal_id: ujianSoal.id,
        skor_a: 1,
        skor_b: 4,
        skor_c: 5,
        skor_d: 0,
        skor_e: 2
      }
    });
  }

  console.log(`✅ Berhasil membuat Ujian [${ujian.nama}] dengan total Soal: ${noUrut - 1}`);
  console.log('✨ Data berhasil dimuat sepenuhnya ke Database!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
