import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { paginatedResponse, successResponse } from '../utils/response.js';
import { parsePagination } from '../utils/pagination.js';

/**
 * GET /admin/users
 * List all users with pagination and search
 */
export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { nama: { contains: String(search) } },
        { email: { contains: String(search) } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          nama: true,
          email: true,
          kategori: true,
          is_active: true,
          created_at: true,
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json(paginatedResponse(data, total, page, limit, 'Berhasil mengambil daftar user'));
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /admin/users/:id
 * Update user basic info or status
 */
export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = req.body;

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: body,
      select: {
        id: true,
        nama: true,
        email: true,
        kategori: true,
        is_active: true,
      }
    });

    res.json(successResponse(updated, 'User berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /admin/users/:id
 * Toggle user status (Soft Delete / Deactivate)
 */
export async function toggleUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { is_active: !user.is_active }
    });

    res.json(successResponse(null, `User berhasil ${updated.is_active ? 'diaktifkan' : 'dinonaktifkan'}`));
  } catch (error) {
    next(error);
  }
}
