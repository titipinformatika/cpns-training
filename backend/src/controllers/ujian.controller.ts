import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse, paginatedResponse, errorResponse } from '../utils/response.js';
import { parsePagination } from '../utils/pagination.js';

/**
 * GET /api/ujian
 * List exams available for the user
 */
export async function getUjianList(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { tipe } = req.query;
    const userKategori = req.user!.kategori; // FREE / PREMIUM

    const where: any = { is_active: true };
    
    // Filter berdasarkan tipe jika ada
    if (tipe) where.tipe = tipe;

    // Filter peruntukan:
    // User FREE hanya bisa melihat yang FREE dan ALL.
    // User PREMIUM bisa melihat SEMUA (FREE, PREMIUM, ALL).
    if (userKategori === 'FREE') {
      where.peruntukan = { in: ['FREE', 'ALL'] };
    }

    const [data, total] = await Promise.all([
      prisma.ujian.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          _count: { select: { ujian_soal: true } }
        }
      }),
      prisma.ujian.count({ where })
    ]);

    res.json(paginatedResponse(data, total, page, limit, 'Berhasil mengambil daftar ujian'));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ujian/:id
 * Get exam detail
 */
export async function getUjianDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userKategori = req.user!.kategori;

    const ujian = await prisma.ujian.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        _count: { select: { ujian_soal: true } }
      }
    });

    if (!ujian || !ujian.is_active) {
      return res.status(404).json(errorResponse('Ujian tidak ditemukan atau tidak aktif'));
    }

    // Check access
    if (userKategori === 'FREE' && ujian.peruntukan === 'PREMIUM') {
      return res.status(403).json(errorResponse('Akses ditolak. Ujian ini hanya untuk member PREMIUM.'));
    }

    res.json(successResponse(ujian, 'Berhasil mengambil detail ujian'));
  } catch (error) {
    next(error);
  }
}
