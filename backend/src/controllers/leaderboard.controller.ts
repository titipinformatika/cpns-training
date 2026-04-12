import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';
import { parsePagination } from '../utils/pagination.js';

/**
 * GET Global Leaderboard
 */
export async function getGlobalLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { ujian_id } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const where = {
      ujian_id: parseInt(ujian_id as string),
      status: 'SELESAI' as any
    };

    // Note: Prisma does NOT support sort + distinct easily for ranking.
    // We will fetch ordered by skor_total desc, durasi_detik asc, then distinct in query.
    const [data, total] = await Promise.all([
      prisma.hasilUjian.findMany({
        where,
        distinct: ['user_id'],
        orderBy: [
          { skor_total: 'desc' },
          { durasi_detik: 'asc' }
        ],
        skip,
        take: limit,
        select: {
          user_id: true,
          skor_total: true,
          skor_tiu: true,
          skor_twk: true,
          skor_tkp: true,
          is_lulus: true,
          durasi_detik: true,
          waktu_selesai: true,
          user: { select: { id: true, biodata: { select: { nama_lengkap: true } } } }
        }
      }),
      prisma.hasilUjian.groupBy({
        by: ['user_id'],
        where,
        _count: { _all: true }
      }).then((res: any) => res.length)
    ]);

    const rankings = data.map((item: any, index: number) => ({
      ranking: skip + index + 1,
      ...item
    }));

    res.json(paginatedResponse(rankings, total, page, limit, 'Berhasil mengambil leaderboard global'));
  } catch (error) {
    next(error);
  }
}

/**
 * GET Formasi Leaderboard (Pesaing se-Instansi & se-Formasi)
 */
export async function getFormasiLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { ujian_id } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    // 1. Get user biodata
    const biodata = await prisma.biodataUser.findUnique({
      where: { user_id: userId },
      include: { instansi: true, formasi: true }
    });

    if (!biodata || !biodata.instansi_id || !biodata.formasi_id) {
      return res.status(400).json(errorResponse('Lengkapi biodata (Instansi & Formasi) terlebih dahulu untuk melihat leaderboard ini'));
    }

    // 2. Get all user IDs in same instansi & formasi
    const pesaing = await prisma.biodataUser.findMany({
      where: {
        instansi_id: biodata.instansi_id,
        formasi_id: biodata.formasi_id
      },
      select: { user_id: true }
    });

    const pesaingIds = pesaing.map(p => p.user_id);

    const where = {
      ujian_id: parseInt(ujian_id as string),
      status: 'SELESAI' as any,
      user_id: { in: pesaingIds }
    };

    const [data, total] = await Promise.all([
      prisma.hasilUjian.findMany({
        where,
        distinct: ['user_id'],
        orderBy: [
          { skor_total: 'desc' },
          { durasi_detik: 'asc' }
        ],
        skip,
        take: limit,
        select: {
          user_id: true,
          skor_total: true,
          skor_tiu: true,
          skor_twk: true,
          skor_tkp: true,
          is_lulus: true,
          durasi_detik: true,
          waktu_selesai: true,
          user: { select: { id: true, biodata: { select: { nama_lengkap: true } } } }
        }
      }),
      prisma.hasilUjian.groupBy({
        by: ['user_id'],
        where,
        _count: { _all: true }
      }).then((res: any) => res.length)
    ]);

    const rankings = data.map((item: any, index: number) => ({
      ranking: skip + index + 1,
      ...item
    }));

    res.json(successResponse({
      instansi: biodata.instansi?.nama,
      formasi: biodata.formasi?.nama_jabatan,
      rankings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, 'Berhasil mengambil leaderboard formasi'));

  } catch (error) {
    next(error);
  }
}
