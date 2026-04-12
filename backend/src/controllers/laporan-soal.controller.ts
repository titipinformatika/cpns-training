import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';
import { parsePagination } from '../utils/pagination.js';

/**
 * USER: Kirim laporan soal
 */
export async function kirimLaporan(req: Request, res: Response, next: NextFunction) {
  try {
    const { soal_id, jenis_laporan, deskripsi } = req.body;
    const userId = req.user!.id;
    const bukti_screenshot = req.file?.path ?? null;

    // 1. Validasi soal exists
    const soal = await prisma.soal.findUnique({
      where: { id: soal_id, is_active: true }
    });

    if (!soal) {
      return res.status(404).json(errorResponse('Soal tidak ditemukan atau sudah tidak aktif'));
    }

    // 2. Cek duplikasi laporan user utk soal yang sama (opsional, tapi bagus utk mencegah spam)
    const existing = await prisma.laporanSoal.findFirst({
      where: { user_id: userId, soal_id, jenis_laporan, status: 'PENDING' }
    });

    if (existing) {
      return res.status(400).json(errorResponse('Anda sudah melaporkan jenis masalah ini untuk soal tersebut. Mohon tunggu tinjauan kami.'));
    }

    // 3. Simpan laporan
    const laporan = await prisma.laporanSoal.create({
      data: {
        user_id: userId,
        soal_id,
        jenis_laporan,
        deskripsi,
        bukti_screenshot
      }
    });

    res.status(201).json(successResponse(laporan, 'Laporan berhasil dikirim'));
  } catch (error) {
    next(error);
  }
}

/**
 * ADMIN: Get daftar laporan (paginated)
 */
export async function getLaporanAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.laporanSoal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { id: true, email: true, biodata: { select: { nama_lengkap: true } } } },
          soal: { select: { id: true, pertanyaan: true } }
        }
      }),
      prisma.laporanSoal.count({ where })
    ]);

    res.json(paginatedResponse(data, total, page, limit, 'Berhasil mengambil daftar laporan'));
  } catch (error) {
    next(error);
  }
}

/**
 * ADMIN: Review laporan
 */
export async function reviewLaporan(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, review_note } = req.body;
    const adminId = req.admin!.id;

    const laporan = await prisma.laporanSoal.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!laporan) {
      return res.status(404).json(errorResponse('Laporan tidak ditemukan'));
    }

    const updated = await prisma.laporanSoal.update({
      where: { id: laporan.id },
      data: {
        status,
        review_note,
        reviewed_by: adminId,
        reviewed_at: new Date()
      }
    });

    res.json(successResponse(updated, 'Status laporan berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}
