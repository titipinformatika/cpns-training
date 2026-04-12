import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse } from '../utils/response.js';
import { serializeFormasi } from '../utils/serializer.js';
import { AppError } from '../middlewares/error.middleware.js';

export async function getKategori(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.kategoriSoal.findMany({
      orderBy: { kode: 'asc' },
    });
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

export async function getJenisSoal(req: Request, res: Response, next: NextFunction) {
  try {
    const { kategori_id } = req.query;
    const where = kategori_id ? { kategori_soal_id: Number(kategori_id) } : {};
    
    const data = await prisma.jenisSoal.findMany({
      where,
      orderBy: { nama: 'asc' },
    });
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

export async function getPendidikan(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.tingkatPendidikan.findMany({
      orderBy: { urutan: 'asc' },
    });
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

export async function getJurusan(req: Request, res: Response, next: NextFunction) {
  try {
    const { search } = req.query;
    const where = search ? { nama: { contains: String(search) } } : {};
    
    const data = await prisma.jurusan.findMany({
      where,
      orderBy: { nama: 'asc' },
      take: 100, // Limit agar tidak terlalu berat jika tanpa search
    });
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

export async function getInstansi(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.instansi.findMany({
      where: { is_active: true },
      orderBy: { nama: 'asc' },
    });
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

export async function getFormasi(req: Request, res: Response, next: NextFunction) {
  try {
    const { instansi_id } = req.query;
    const where: any = { is_active: true };
    if (instansi_id) where.instansi_id = Number(instansi_id);

    const data = await prisma.formasi.findMany({
      where,
      orderBy: { nama_jabatan: 'asc' },
    });
    res.json(successResponse(serializeFormasi(data)));
  } catch (error) {
    next(error);
  }
}
