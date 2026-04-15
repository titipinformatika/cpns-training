import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse } from '../utils/response.js';

/**
 * GET /api/wilayah/provinsi
 */
export async function getProvinsi(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.provinsi.findMany({
      orderBy: { nama: 'asc' }
    });
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/wilayah/kota/:provinsi_kode
 */
export async function getKota(req: Request, res: Response, next: NextFunction) {
  try {
    const pk = req.params['provinsi_kode'];
    const data = await prisma.kota.findMany({
      where: {
        provinsi_kode: pk ? String(pk) : ''
      },
      orderBy: { nama: 'asc' }
    });
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}
