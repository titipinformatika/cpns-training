import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse, paginatedResponse, errorResponse } from '../utils/response.js';
import { parsePagination } from '../utils/pagination.js';
import { AppError } from '../middlewares/error.middleware.js';

/**
 * GET /api/user/biodata
 */
export async function getBiodata(req: Request, res: Response, next: NextFunction) {
  try {
    const biodata = await prisma.biodataUser.findUnique({
      where: { user_id: req.user!.id },
      include: {
        tingkat_pendidikan: true,
        jurusan: true,
        instansi: true,
        formasi: true,
      },
    });

    if (!biodata) {
      // Jika belum diisi, kembalikan null atau data kosong yang rapi
      return res.json(successResponse(null, 'Biodata belum diisi'));
    }

    res.json(successResponse(biodata, 'Biodata berhasil diambil'));
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/user/biodata
 */
export async function upsertBiodata(req: Request, res: Response, next: NextFunction) {
  try {
    const { tanggal_lahir, ...body } = req.body;
    
    const updateData: any = {
      ...body,
      tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : undefined,
    };

    const biodata = await prisma.biodataUser.upsert({
      where: { user_id: req.user!.id },
      update: updateData,
      create: {
        ...updateData,
        user_id: req.user!.id,
      },
      include: {
        tingkat_pendidikan: true,
        jurusan: true,
        instansi: true,
        formasi: true,
      },
    });

    res.json(successResponse(biodata, 'Biodata berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/user/riwayat-ujian
 * List user's exam results
 */
export async function getRiwayatUjian(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const userId = req.user!.id;

    const [data, total] = await Promise.all([
      prisma.hasilUjian.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          ujian: { select: { nama: true, tipe: true } }
        }
      }),
      prisma.hasilUjian.count({ where: { user_id: userId } })
    ]);

    res.json(paginatedResponse(data, total, page, limit, 'Berhasil mengambil riwayat ujian'));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/user/riwayat-ujian/:id
 * Detailed result with discussion
 */
export async function getRiwayatDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const detail = await prisma.hasilUjian.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        ujian: true,
        jawaban_ujian: {
          include: {
            ujian_soal: {
              include: {
                soal: {
                  include: { kategori_soal: true, jenis_soal: true }
                }
              }
            }
          },
          orderBy: { ujian_soal: { nomor_urut: 'asc' } }
        }
      }
    });

    if (!detail || detail.user_id !== userId) {
      return res.status(404).json(errorResponse('Data riwayat tidak ditemukan'));
    }

    res.json(successResponse(detail, 'Berhasil mengambil detail riwayat ujian'));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/user/statistik
 * Aggregated user competency stats
 */
export async function getStatistikUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;

    const [statsKategori, statsJenis] = await Promise.all([
      prisma.statistikUserKategori.findMany({
        where: { user_id: userId },
        include: { kategori_soal: true }
      }),
      prisma.statistikUserJenis.findMany({
        where: { user_id: userId },
        include: { jenis_soal: true }
      })
    ]);

    res.json(successResponse({ statsKategori, statsJenis }, 'Berhasil mengambil statistik user'));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/user/kontribusi-soal
 */
export async function getKontribusiSaya(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const userId = req.user!.id;

    const [data, total] = await Promise.all([
      prisma.kontribusiSoal.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { kategori_soal: true, jenis_soal: true }
      }),
      prisma.kontribusiSoal.count({ where: { user_id: userId } })
    ]);

    res.json(paginatedResponse(data, total, page, limit, 'Berhasil mengambil daftar kontribusi saya'));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/user/laporan-soal
 */
export async function getLaporanSaya(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const userId = req.user!.id;

    const [data, total] = await Promise.all([
      prisma.laporanSoal.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { soal: { select: { pertanyaan: true } } }
      }),
      prisma.laporanSoal.count({ where: { user_id: userId } })
    ]);

    res.json(paginatedResponse(data, total, page, limit, 'Berhasil mengambil daftar laporan saya'));
  } catch (error) {
    next(error);
  }
}
