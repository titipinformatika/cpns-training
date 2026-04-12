import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyToken } from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';
import { AppError } from '../middlewares/error.middleware.js';

/**
 * POST /api/auth/register
 * Body: { nama, email, password }
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { nama, email, password } = req.body;

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email sudah terdaftar', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Simpan user baru
    const user = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        kategori: true,
        created_at: true,
      },
    });

    res.status(201).json(successResponse(user, 'Registrasi berhasil'));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Email atau password salah', 401);
    }

    // Cek apakah akun aktif
    if (!user.is_active) {
      throw new AppError('Akun Anda telah dinonaktifkan', 403);
    }

    // Verifikasi password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new AppError('Email atau password salah', 401);
    }

    // Generate tokens
    const payload = {
      id: user.id,
      email: user.email,
      kategori: user.kategori,
      type: 'user' as const,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json(successResponse({
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        kategori: user.kategori,
      },
      accessToken,
      refreshToken,
    }, 'Login berhasil'));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/refresh-token
 * Body: { refreshToken }
 */
export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken: token } = req.body;

    // Verifikasi refresh token
    const payload = verifyToken(token);

    if (payload.type !== 'user') {
      throw new AppError('Token tidak valid untuk user', 403);
    }

    // Ambil data user terbaru dari DB (untuk memastikan akun masih aktif)
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user || !user.is_active) {
      throw new AppError('Akun tidak ditemukan atau tidak aktif', 403);
    }

    // Generate access token baru
    const newPayload = {
      id: user.id,
      email: user.email,
      kategori: user.kategori,
      type: 'user' as const,
    };

    const accessToken = generateAccessToken(newPayload);

    res.json(successResponse({ accessToken }, 'Token diperbarui'));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Harus melewati middleware authenticateUser terlebih dahulu
 */
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        nama: true,
        email: true,
        kategori: true,
        avatar: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    res.json(successResponse(user, 'Data profil berhasil diambil'));
  } catch (error) {
    next(error);
  }
}
/**
 * PUT /api/auth/change-password
 */
export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { old_password, new_password } = req.body;
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User tidak ditemukan', 404);

    const isMatch = await comparePassword(old_password, user.password);
    if (!isMatch) throw new AppError('Password lama tidak cocok', 401);

    const hashed = await hashPassword(new_password);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    res.json(successResponse(null, 'Password berhasil diubah'));
  } catch (error) {
    next(error);
  }
}
