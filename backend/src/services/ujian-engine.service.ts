import prisma from '../lib/prisma.js';
import { HEARTBEAT_TIMEOUT_SECONDS } from '../config/constants.js';

export async function checkAndHandleTimeout(hasilUjianId: number) {
  const hasil = await prisma.hasilUjian.findUnique({
    where: { id: hasilUjianId },
    include: { sesi_ujian: true },
  });

  if (!hasil || hasil.status !== 'BERLANGSUNG') return hasil;

  const now = new Date();
  const elapsedSeconds = (now.getTime() - hasil.waktu_mulai.getTime()) / 1000;
  
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

export function calculateScore(jawaban: string | null, uSoal: any) {
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

  return { isBenar, skorDiperoleh };
}

export async function finalizeExamStatistics(userId: number, hasilUjianId: number, semuaJawaban: any[]) {
  const semuaKategori = await prisma.kategoriSoal.findMany();
  const now = new Date();

  const skorPerKategori: Record<string, number> = {};
  const statsKategori: Record<string, { dijawab: number, benar: number, salah: number }> = {};
  const statsJenis: Record<number, { dijawab: number, benar: number, salah: number, skor: number }> = {};

  let totalBenar = 0;
  let totalSalah = 0;

  for (const j of semuaJawaban) {
    const kodeKat = j.ujian_soal.soal.kategori_soal.kode;
    const jenisId = j.ujian_soal.soal.jenis_soal_id;

    skorPerKategori[kodeKat] = (skorPerKategori[kodeKat] || 0) + j.skor_diperoleh;
    
    if (!statsKategori[kodeKat]) statsKategori[kodeKat] = { dijawab: 0, benar: 0, salah: 0 };
    if (!statsJenis[jenisId]) statsJenis[jenisId] = { dijawab: 0, benar: 0, salah: 0, skor: 0 };

    if (j.jawaban_user) {
      statsKategori[kodeKat].dijawab++;
      statsJenis[jenisId].dijawab++;
      statsJenis[jenisId].skor += j.skor_diperoleh;

      if (j.is_benar === true) {
        totalBenar++;
        statsKategori[kodeKat].benar++;
        statsJenis[jenisId].benar++;
      } else if (j.is_benar === false) {
        totalSalah++;
        statsKategori[kodeKat].salah++;
        statsJenis[jenisId].salah++;
      }
    }
  }

  const skorTiu = skorPerKategori['TIU'] || 0;
  const skorTwk = skorPerKategori['TWK'] || 0;
  const skorTkp = skorPerKategori['TKP'] || 0;
  const skorTotal = skorTiu + skorTwk + skorTkp;

  let isLulus = true;
  const detailLulus = semuaKategori.map(kat => {
    const skorUser = skorPerKategori[kat.kode] || 0;
    const lulusKat = skorUser >= kat.passing_grade;
    if (!lulusKat) isLulus = false;
    return {
      kode: kat.kode,
      nama: kat.nama,
      skor: skorUser,
      passing_grade: kat.passing_grade,
      lulus: lulusKat
    };
  });

  return {
    now,
    totalBenar,
    totalSalah,
    skorTiu,
    skorTwk,
    skorTkp,
    skorTotal,
    isLulus,
    detailLulus,
    statsKategori,
    statsJenis,
    semuaKategori
  };
}
