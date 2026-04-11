import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse } from '../utils/response.js';
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
