import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse, paginatedResponse, errorResponse } from '../utils/response.js';
import { parsePagination } from '../utils/pagination.js';
import { serializeFormasi } from '../utils/serializer.js';
import { AppError } from '../middlewares/error.middleware.js';
import { AdminRole, UserKategori } from '@prisma/client';

interface AuthRequest extends Request {
  user?: { id: number; email: string; kategori: UserKategori };
  admin?: { id: number; email: string; role: AdminRole };
}

export async function getKategori(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      prisma.kategoriSoal.findMany({
        skip,
        take: limit,
        orderBy: { kode: 'asc' },
      }),
      prisma.kategoriSoal.count()
    ]);
    res.json(paginatedResponse(data, total, page, limit, 'Berhasil mengambil kategori'));
  } catch (error) {
    next(error);
  }
}

export async function getJenisSoal(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query as any);
    const kategori_id = req.query['kategori_id'];
    
    const where: any = {};
    if (kategori_id) where.kategori_soal_id = Number(kategori_id);
    
    const [data, total] = await Promise.all([
      prisma.jenisSoal.findMany({
        where,
        skip,
        take: limit,
        include: { kategori: { select: { nama: true } } },
        orderBy: { nama: 'asc' },
      }),
      prisma.jenisSoal.count({ where })
    ]);
    res.json(paginatedResponse(data, total, page, limit, 'Berhasil mengambil jenis soal'));
  } catch (error) {
    next(error);
  }
}

export async function getPendidikan(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      prisma.tingkatPendidikan.findMany({
        skip,
        take: limit,
        orderBy: { urutan: 'asc' },
      }),
      prisma.tingkatPendidikan.count()
    ]);
    res.json(paginatedResponse(data, total, page, limit, 'Berhasil mengambil tingkat pendidikan'));
  } catch (error) {
    next(error);
  }
}

export async function getJurusan(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query as any);
    const search = req.query['search'];
    const pendidikan_id = req.query['pendidikan_id'];
    
    const where: any = {};
    if (search) where.nama = { contains: String(search) };
    if (pendidikan_id) where.tingkat_pendidikan_id = Number(pendidikan_id);
    
    const [data, total] = await Promise.all([
      prisma.jurusan.findMany({
        where,
        skip,
        take: limit,
        include: { tingkat_pendidikan: { select: { nama: true } } },
        orderBy: { nama: 'asc' },
      }),
      prisma.jurusan.count({ where })
    ]);
    res.json(paginatedResponse(data, total, page, limit, 'Berhasil mengambil jurusan'));
  } catch (error) {
    next(error);
  }
}

export async function getInstansi(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { jenis } = req.query;
    const where: any = { is_active: true };
    if (jenis) where.jenis = jenis;

    const [data, total] = await Promise.all([
      prisma.instansi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nama: 'asc' },
      }),
      prisma.instansi.count({ where })
    ]);
    res.json(paginatedResponse(data, total, page, limit, 'Berhasil mengambil instansi'));
  } catch (error) {
    next(error);
  }
}

export async function getFormasi(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query as any);
    const instansi_id = req.query['instansi_id'];
    const provinsi_kode = req.query['provinsi_kode'];
    const kota_kode = req.query['kota_kode'];
    
    const where: any = { is_active: true };
    if (instansi_id) where.instansi_id = Number(instansi_id);
    if (provinsi_kode) where.provinsi_kode = String(provinsi_kode);
    if (kota_kode) where.kota_kode = String(kota_kode);

    const [data, total] = await Promise.all([
      prisma.formasi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nama_jabatan: 'asc' },
        include: {
          instansi: { select: { nama: true } },
          tingkat_pendidikan: { select: { nama: true } },
          jurusan: { select: { nama: true } },
          provinsi: { select: { nama: true } },
          kota: { select: { nama: true } },
        }
      }),
      prisma.formasi.count({ where })
    ]);
    
    const serializedData = serializeFormasi(data) as any[];
    res.json(paginatedResponse(serializedData, total, page, limit, 'Berhasil mengambil formasi'));
  } catch (error) {
    next(error);
  }
}
