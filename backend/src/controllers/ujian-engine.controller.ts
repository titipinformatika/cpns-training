import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { HEARTBEAT_TIMEOUT_SECONDS } from '../config/constants.js';

/**
 * Helper: Cek apakah sesi sudah timeout berdasarkan waktu server.
 * Jika ya, update statusnya menjadi TIMEOUT.
 */
async function checkAndHandleTimeout(hasilUjianId: number) {
  const hasil = await prisma.hasilUjian.findUnique({
    where: { id: hasilUjianId },
    include: { sesi_ujian: true },
  });

  if (!hasil || hasil.status !== 'BERLANGSUNG') return hasil;

  const now = new Date();
  const elapsedSeconds = (now.getTime() - hasil.waktu_mulai.getTime()) / 1000;
  
  // Jika sudah melewati durasi + toleransi heartbeat
  if (elapsedSeconds > hasil.durasi_detik + HEARTBEAT_TIMEOUT_SECONDS) {
    const updated = await prisma.$transaction(async (tx) => {
      const h = await tx.hasilUjian.update({
        where: { id: hasilUjianId },
        data: {
          status: 'TIMEOUT',
          waktu_selesai: now,
        },
      });

      await tx.sesiUjian.update({
        where: { hasil_ujian_id: hasilUjianId },
        data: {
          status_sesi: 'SELESAI',
          sisa_waktu_detik: 0,
        },
      });

      return h;
    });
    return updated;
  }

  return hasil;
}

/**
 * POST /ujian/mulai
 */
export async function mulaiUjian(req: Request, res: Response, next: NextFunction) {
  try {
    const { ujian_id } = req.body;
    const userId = req.user!.id;

    // 1. Validasi Ujian
    const ujian = await prisma.ujian.findUnique({
      where: { id: ujian_id, is_active: true },
    });

    if (!ujian) {
      res.status(404).json(errorResponse('Paket ujian tidak ditemukan atau tidak aktif'));
      return;
    }

    // 2. Cek Sesi Aktif
    const sesiAktif = await prisma.hasilUjian.findFirst({
      where: {
        user_id: userId,
        status: 'BERLANGSUNG',
      },
    });

    if (sesiAktif) {
      // Cek apakah sebenarnya sudah timeout
      const result = await checkAndHandleTimeout(sesiAktif.id);
      if (result && result.status === 'BERLANGSUNG') {
        res.status(400).json(errorResponse('Anda masih memiliki ujian yang sedang berlangsung'));
        return;
      }
    }

    // 3. Hitung Percobaan Ke
    const totalPercobaan = await prisma.hasilUjian.count({
      where: { user_id: userId, ujian_id },
    });

    // 4. Ambil Soal
    const soalList = await prisma.ujianSoal.findMany({
      where: { ujian_id },
      include: {
        soal: {
          select: {
            pertanyaan: true,
            pertanyaan_gambar: true,
            opsi_a: true,
            opsi_a_gambar: true,
            opsi_b: true,
            opsi_b_gambar: true,
            opsi_c: true,
            opsi_c_gambar: true,
            opsi_d: true,
            opsi_d_gambar: true,
            opsi_e: true,
            opsi_e_gambar: true,
            kategori_soal: { select: { kode: true, nama: true } },
          },
        },
      },
      orderBy: { nomor_urut: 'asc' },
    });

    if (soalList.length === 0) {
      res.status(400).json(errorResponse('Paket ujian ini belum memiliki soal'));
      return;
    }

    const durasiDetik = ujian.durasi_menit * 60;
    const now = new Date();

    // 5. Create HasilUjian & SesiUjian (Transaction)
    const result = await prisma.$transaction(async (tx) => {
      const hasil = await tx.hasilUjian.create({
        data: {
          user_id: userId,
          ujian_id,
          percobaan_ke: totalPercobaan + 1,
          total_soal: soalList.length,
          jumlah_kosong: soalList.length,
          status: 'BERLANGSUNG',
          waktu_mulai: now,
          durasi_detik: durasiDetik,
        },
      });

      const sesi = await tx.sesiUjian.create({
        data: {
          hasil_ujian_id: hasil.id,
          user_id: userId,
          ujian_id,
          nomor_soal_terakhir: 1,
          sisa_waktu_detik: durasiDetik,
          total_terjawab: 0,
          total_belum_jawab: soalList.length,
          total_ragu: 0,
          status_sesi: 'AKTIF',
          last_heartbeat: now,
          ip_address: req.ip ?? null,
          user_agent: (req.headers['user-agent'] as string) ?? null,
        },
      });

      return { hasil, sesi };
    });

    res.status(201).json(successResponse({
      hasil_ujian_id: result.hasil.id,
      sesi_ujian_id: result.sesi.id,
      sisa_waktu_detik: durasiDetik,
      total_soal: soalList.length,
      soal_list: soalList.map(s => ({
        ujian_soal_id: s.id,
        nomor_urut: s.nomor_urut,
        ...s.soal,
      })),
    }, 'Ujian berhasil dimulai'));

  } catch (error) {
    next(error);
  }
}

/**
 * POST /ujian/heartbeat
 */
export async function heartbeat(req: Request, res: Response, next: NextFunction) {
  try {
    const { hasil_ujian_id } = req.body;
    const userId = req.user!.id;

    // Cek timeout dulu
    const hasil = await checkAndHandleTimeout(hasil_ujian_id);

    if (!hasil || hasil.user_id !== userId) {
      res.status(404).json(errorResponse('Data ujian tidak ditemukan'));
      return;
    }

    if (hasil.status !== 'BERLANGSUNG') {
      res.json(successResponse({
        sisa_waktu_detik: 0,
        status: hasil.status,
      }, 'Ujian sudah berakhir'));
      return;
    }

    const now = new Date();
    const elapsedSeconds = (now.getTime() - hasil.waktu_mulai.getTime()) / 1000;
    const sisaWaktu = Math.max(0, Math.floor(hasil.durasi_detik - elapsedSeconds));

    // Update Sesi
    await prisma.sesiUjian.update({
      where: { hasil_ujian_id },
      data: {
        last_heartbeat: now,
        sisa_waktu_detik: sisaWaktu,
        ip_address: req.ip ?? null,
        user_agent: (req.headers['user-agent'] as string) ?? null,
      },
    });

    res.json(successResponse({
      sisa_waktu_detik: sisaWaktu,
      status: 'AKTIF',
    }, 'Heartbeat OK'));

  } catch (error) {
    next(error);
  }
}

/**
 * POST /ujian/jawab
 */
export async function simpanJawaban(req: Request, res: Response, next: NextFunction) {
  try {
    const { hasil_ujian_id, ujian_soal_id, jawaban, is_ragu } = req.body;
    const userId = req.user!.id;

    // 1. Validasi HasilUjian & Timeout
    const hasil = await checkAndHandleTimeout(hasil_ujian_id);

    if (!hasil || hasil.user_id !== userId) {
      res.status(404).json(errorResponse('Data ujian tidak ditemukan'));
      return;
    }

    if (hasil.status !== 'BERLANGSUNG') {
      res.status(400).json(errorResponse('Ujian sudah berakhir atau timeout'));
      return;
    }

    // 2. Ambil Data Ujian Soal
    const uSoal = await prisma.ujianSoal.findUnique({
      where: { id: ujian_soal_id },
      include: {
        soal: {
          include: { kategori_soal: true }
        },
        skor_tkp: true
      }
    });

    if (!uSoal || uSoal.ujian_id !== hasil.ujian_id) {
      res.status(404).json(errorResponse('Soal tidak ditemukan untuk paket ujian ini'));
      return;
    }

    // 3. Hitung Skor
    let isBenar: boolean | null = null;
    let skorDiperoleh = 0;

    if (jawaban) {
      const isTKP = uSoal.soal.kategori_soal.kode === 'TKP';

      if (isTKP && uSoal.skor_tkp) {
        const field = `skor_${jawaban.toLowerCase()}` as keyof typeof uSoal.skor_tkp;
        skorDiperoleh = (uSoal.skor_tkp[field] as number) || 0;
      } else if (!isTKP) {
        isBenar = (jawaban === uSoal.soal.jawaban_benar);
        skorDiperoleh = isBenar ? uSoal.skor : 0;
      }
    }

    const now = new Date();
    const waktuJawabDetik = Math.floor((now.getTime() - hasil.waktu_mulai.getTime()) / 1000);

    // 4. Upsert Jawaban & Update Sesi/Hasil (Transaction)
    const result = await prisma.$transaction(async (tx) => {
      // Simpan jawaban
      await tx.jawabanUjian.upsert({
        where: {
          hasil_ujian_id_ujian_soal_id: {
            hasil_ujian_id,
            ujian_soal_id
          }
        },
        create: {
          hasil_ujian_id,
          ujian_soal_id,
          jawaban_user: jawaban,
          is_benar: isBenar,
          skor_diperoleh: skorDiperoleh,
          is_ragu,
          waktu_jawab_detik: waktuJawabDetik,
        },
        update: {
          jawaban_user: jawaban,
          is_benar: isBenar,
          skor_diperoleh: skorDiperoleh,
          is_ragu,
          waktu_jawab_detik: waktuJawabDetik,
        }
      });

      // Hitung ulang stats
      const allJawaban = await tx.jawabanUjian.findMany({
        where: { hasil_ujian_id }
      });

      const totalTerjawab = allJawaban.filter(j => j.jawaban_user !== null).length;
      const totalRagu = allJawaban.filter(j => j.is_ragu).length;
      const totalBelumJawab = hasil.total_soal - totalTerjawab;

      // Update SesiUjian
      await tx.sesiUjian.update({
        where: { hasil_ujian_id },
        data: {
          total_terjawab: totalTerjawab,
          total_belum_jawab: totalBelumJawab,
          total_ragu: totalRagu,
          nomor_soal_terakhir: uSoal.nomor_urut,
        }
      });

      // Update HasilUjian Counters
      await tx.hasilUjian.update({
        where: { id: hasil_ujian_id },
        data: {
          jumlah_dijawab: totalTerjawab,
          jumlah_kosong: totalBelumJawab,
        }
      });

      return { totalTerjawab, totalBelumJawab, totalRagu };
    });

    res.json(successResponse({
      ujian_soal_id,
      jawaban_user: jawaban,
      is_ragu,
      ...result
    }, 'Jawaban berhasil disimpan'));

  } catch (error) {
    next(error);
  }
}
