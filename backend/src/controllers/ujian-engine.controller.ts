import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { HEARTBEAT_TIMEOUT_SECONDS } from '../config/constants.js';
import * as engineService from '../services/ujian-engine.service.js';

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
      const result = await engineService.checkAndHandleTimeout(sesiAktif.id);
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
    const hasil = await engineService.checkAndHandleTimeout(hasil_ujian_id);

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
    const hasil = await engineService.checkAndHandleTimeout(hasil_ujian_id);

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
      console.log('DEBUG: Soal not found or ujian_id mismatch');
      res.status(404).json(errorResponse('Soal tidak ditemukan untuk paket ujian ini'));
      return;
    }

    // 3. Hitung Skor
    const { isBenar, skorDiperoleh } = engineService.calculateScore(jawaban, uSoal);

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

/**
 * POST /ujian/selesai
 */
export async function selesaiUjian(req: Request, res: Response, next: NextFunction) {
  try {
    const { hasil_ujian_id } = req.body;
    const userId = req.user!.id;

    // 1. Validasi & Cek Timeout
    const hasil = await engineService.checkAndHandleTimeout(hasil_ujian_id);

    if (!hasil || hasil.user_id !== userId) {
      res.status(404).json(errorResponse('Data ujian tidak ditemukan'));
      return;
    }

    if (hasil.status !== 'BERLANGSUNG') {
      res.status(400).json(errorResponse('Ujian sudah berakhir sebelumnya'));
      return;
    }

    const durasiActual = Math.floor((new Date().getTime() - hasil.waktu_mulai.getTime()) / 1000);

    // 2. Ambil Semua Jawaban & Kategori
    const semuaJawaban = await prisma.jawabanUjian.findMany({
      where: { hasil_ujian_id },
      include: {
        ujian_soal: {
          include: {
            soal: {
              include: { kategori_soal: true, jenis_soal: true }
            }
          }
        }
      }
    });

    // 3. Kalkulasi Skor & Statistik (Service)
    const {
      now, totalBenar, totalSalah, skorTiu, skorTwk, skorTkp,
      skorTotal, isLulus, detailLulus, statsKategori, statsJenis, semuaKategori
    } = await engineService.finalizeExamStatistics(userId, hasil_ujian_id, semuaJawaban);

    const jumlahDijawab = totalBenar + totalSalah;
    const jumlahKosong = hasil.total_soal - jumlahDijawab;

    // 5. Transaction Update
    await prisma.$transaction(async (tx) => {
      // a. Update HasilUjian
      await tx.hasilUjian.update({
        where: { id: hasil_ujian_id },
        data: {
          status: 'SELESAI',
          waktu_selesai: now,
          durasi_detik: durasiActual,
          skor_tiu: skorTiu,
          skor_twk: skorTwk,
          skor_tkp: skorTkp,
          skor_total: skorTotal,
          jumlah_dijawab: jumlahDijawab,
          jumlah_benar: totalBenar,
          jumlah_salah: totalSalah,
          jumlah_kosong: jumlahKosong,
          is_lulus: isLulus
        }
      });

      // b. Update SesiUjian
      await tx.sesiUjian.update({
        where: { hasil_ujian_id },
        data: {
          status_sesi: 'SELESAI',
          sisa_waktu_detik: 0
        }
      });

      // c. Update Statistik User Kategori
      for (const kat of semuaKategori) {
        const sKat = statsKategori[kat.kode] || { dijawab: 0, benar: 0, salah: 0 };
        const skorKat = kat.kode === 'TIU' ? skorTiu : (kat.kode === 'TWK' ? skorTwk : (kat.kode === 'TKP' ? skorTkp : 0));

        const existing = await tx.statistikUserKategori.findUnique({
          where: { user_id_kategori_soal_id: { user_id: userId, kategori_soal_id: kat.id } }
        });

        if (existing) {
          const newTotalSkor = existing.total_skor + skorKat;
          const newTotalUjian = existing.total_ujian + 1;
          const newTotalDijawab = existing.total_soal_dijawab + sKat.dijawab;
          const newTotalBenar = existing.total_benar + sKat.benar;

          await tx.statistikUserKategori.update({
            where: { id: existing.id },
            data: {
              total_soal_dijawab: newTotalDijawab,
              total_benar: newTotalBenar,
              total_salah: existing.total_salah + sKat.salah,
              total_skor: newTotalSkor,
              total_ujian: newTotalUjian,
              skor_tertinggi: Math.max(existing.skor_tertinggi, skorKat),
              skor_terendah: existing.skor_terendah === 0 ? skorKat : Math.min(existing.skor_terendah, skorKat),
              skor_rata_rata: newTotalSkor / newTotalUjian,
              persentase_benar: newTotalDijawab > 0 ? (newTotalBenar / newTotalDijawab) * 100 : 0
            }
          });
        } else {
          await tx.statistikUserKategori.create({
            data: {
              user_id: userId,
              kategori_soal_id: kat.id,
              total_soal_dijawab: sKat.dijawab,
              total_benar: sKat.benar,
              total_salah: sKat.salah,
              total_skor: skorKat,
              skor_tertinggi: skorKat,
              skor_terendah: skorKat,
              skor_rata_rata: skorKat,
              persentase_benar: sKat.dijawab > 0 ? (sKat.benar / sKat.dijawab) * 100 : 0,
              total_ujian: 1
            }
          });
        }
      }

      // d. Update Statistik User Jenis
      for (const [jenisIdStr, sJ] of Object.entries(statsJenis)) {
        const jenisId = parseInt(jenisIdStr);
        const persentaseBenar = sJ.dijawab > 0 ? (sJ.benar / sJ.dijawab) * 100 : 0;
        
        let tingkat: 'BELUM' | 'RENDAH' | 'SEDANG' | 'TINGGI' | 'MAHIR' = 'BELUM';
        if (sJ.dijawab > 0) {
          if (persentaseBenar < 40) tingkat = 'RENDAH';
          else if (persentaseBenar < 65) tingkat = 'SEDANG';
          else if (persentaseBenar < 85) tingkat = 'TINGGI';
          else tingkat = 'MAHIR';
        }

        const existingJ = await tx.statistikUserJenis.findUnique({
          where: { user_id_jenis_soal_id: { user_id: userId, jenis_soal_id: jenisId } }
        });

        if (existingJ) {
          const newTotalDijawab = existingJ.total_soal_dijawab + sJ.dijawab;
          const newTotalBenar = existingJ.total_benar + sJ.benar;
          const newPersen = newTotalDijawab > 0 ? (newTotalBenar / newTotalDijawab) * 100 : 0;
          
          let newTingkat: 'BELUM' | 'RENDAH' | 'SEDANG' | 'TINGGI' | 'MAHIR' = 'BELUM';
          if (newTotalDijawab > 0) {
            if (newPersen < 40) newTingkat = 'RENDAH';
            else if (newPersen < 65) newTingkat = 'SEDANG';
            else if (newPersen < 85) newTingkat = 'TINGGI';
            else newTingkat = 'MAHIR';
          }

          await tx.statistikUserJenis.update({
            where: { id: existingJ.id },
            data: {
              total_soal_dijawab: newTotalDijawab,
              total_benar: newTotalBenar,
              total_salah: existingJ.total_salah + sJ.salah,
              skor_rata_rata: (existingJ.skor_rata_rata * existingJ.total_soal_dijawab + sJ.skor) / newTotalDijawab, // Rata-rata per soal
              persentase_benar: newPersen,
              tingkat_penguasaan: newTingkat
            }
          });
        } else {
          await tx.statistikUserJenis.create({
            data: {
              user_id: userId,
              jenis_soal_id: jenisId,
              total_soal_dijawab: sJ.dijawab,
              total_benar: sJ.benar,
              total_salah: sJ.salah,
              skor_rata_rata: sJ.dijawab > 0 ? sJ.skor / sJ.dijawab : 0,
              persentase_benar: persentaseBenar,
              tingkat_penguasaan: tingkat
            }
          });
        }
      }
    });

    res.json(successResponse({
      hasil_ujian_id,
      status: 'SELESAI',
      waktu_mulai: hasil.waktu_mulai,
      waktu_selesai: now,
      durasi_pengerjaan_detik: durasiActual,
      total_soal: hasil.total_soal,
      jumlah_dijawab: (statsKategori.TIU?.dijawab ?? 0) + (statsKategori.TWK?.dijawab ?? 0) + (statsKategori.TKP?.dijawab ?? 0),
      jumlah_benar: totalBenar,
      jumlah_salah: totalSalah,
      jumlah_kosong: jumlahKosong,
      skor_tiu: skorTiu,
      skor_twk: skorTwk,
      skor_tkp: skorTkp,
      skor_total: skorTotal,
      is_lulus: isLulus,
      detail_kategori: detailLulus
    }, 'Ujian berhasil diselesaikan'));

  } catch (error) {
    next(error);
  }
}
