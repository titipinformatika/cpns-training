import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { comparePassword, generateAccessToken, generateRefreshToken, verifyToken } from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';
import { AppError } from '../middlewares/error.middleware.js';

/**
 * POST /api/admin/auth/login
 * Body: { email, password }
 */
export async function loginAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new AppError('Email atau password salah', 401);
    }

    if (!admin.is_active) {
      throw new AppError('Akun admin telah dinonaktifkan', 403);
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      throw new AppError('Email atau password salah', 401);
    }

    const payload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin' as const,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json(successResponse({
      admin: {
        id: admin.id,
        nama: admin.nama,
        email: admin.email,
        role: admin.role,
      },
      accessToken,
      refreshToken,
    }, 'Login admin berhasil'));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/auth/refresh-token
 * Body: { refreshToken }
 */
export async function refreshAdminToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken: token } = req.body;

    const payload = verifyToken(token);

    if (payload.type !== 'admin') {
      throw new AppError('Token tidak valid untuk admin', 403);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
    });

    if (!admin || !admin.is_active) {
      throw new AppError('Akun admin tidak ditemukan atau tidak aktif', 403);
    }

    const newPayload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin' as const,
    };

    const accessToken = generateAccessToken(newPayload);

    res.json(successResponse({ accessToken }, 'Token admin diperbarui'));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/auth/me
 * Header: Authorization: Bearer <token>
 * Harus melewati middleware authenticateAdmin
 */
export async function getAdminMe(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin!.id },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!admin) {
      throw new AppError('Admin tidak ditemukan', 404);
    }

    res.json(successResponse(admin, 'Data profil admin berhasil diambil'));
  } catch (error) {
    next(error);
  }
}
