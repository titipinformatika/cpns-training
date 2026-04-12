import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse } from '../utils/response.js';

/**
 * GET /api/admin/dashboard/summary
 */
export async function getDashboardSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const [totalUser, totalSoal, totalUjian, totalLaporan, totalKontribusi] = await Promise.all([
      prisma.user.count({ where: { is_active: true } }),
      prisma.soal.count({ where: { is_active: true } }),
      prisma.ujian.count({ where: { is_active: true } }),
      prisma.laporanSoal.count({ where: { status: 'PENDING' } }),
      prisma.kontribusiSoal.count({ where: { status: 'PENDING' } }),
    ]);

    res.json(successResponse({
      totalUser,
      totalSoal,
      totalUjian,
      laporanPending: totalLaporan,
      kontribusiPending: totalKontribusi,
    }, 'Berhasil mengambil ringkasan dashboard'));
  } catch (error) {
    next(error);
  }
}
