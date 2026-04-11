import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse } from '../utils/response.js';
import { AppError } from '../middlewares/error.middleware.js';

export async function createBankSoal(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.bankSoal.create({
      data: {
        ...req.body,
        created_by: req.admin!.id,
      },
    });
    res.status(201).json(successResponse(data, 'Bank soal berhasil dibuat'));
  } catch (error) {
    next(error);
  }
}

export async function getBankSoal(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.bankSoal.findMany({
      include: {
        _count: {
          select: { soal: true, ujian: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

export async function getBankSoalById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await prisma.bankSoal.findUnique({
      where: { id: Number(id) }
    });
    if (!data) throw new AppError('Bank soal tidak ditemukan', 404);
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

export async function updateBankSoal(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await prisma.bankSoal.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(successResponse(data, 'Bank soal berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

export async function deleteBankSoal(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.bankSoal.delete({
      where: { id: Number(id) }
    });
    res.json(successResponse(null, 'Bank soal berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}
