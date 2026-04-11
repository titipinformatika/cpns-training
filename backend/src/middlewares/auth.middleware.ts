import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service.js';
import { errorResponse } from '../utils/response.js';

/**
 * Middleware: Wajib login sebagai USER.
 *
 * Cara pakai di route:
 *   router.get('/profile', authenticateUser, controller.getProfile);
 *
 * Header yang dikirim client:
 *   Authorization: Bearer <token>
 */
export function authenticateUser(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(errorResponse('Token tidak ditemukan. Silakan login.'));
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json(errorResponse('Token tidak valid.'));
    return;
  }

  try {
    const payload = verifyToken(token);

    // Pastikan token ini memang untuk user (bukan admin)
    if (payload.type !== 'user') {
      res.status(403).json(errorResponse('Akses ditolak. Token bukan untuk user.'));
      return;
    }

    // Sisipkan data user ke req.user (tipe sudah di express.d.ts)
    req.user = {
      id: payload.id,
      email: payload.email,
      kategori: payload.kategori as any,
    };

    next();
  } catch (error) {
    res.status(401).json(errorResponse('Token expired atau tidak valid. Silakan login ulang.'));
    return;
  }
}

/**
 * Middleware: Wajib login sebagai ADMIN.
 *
 * Cara pakai di route:
 *   router.get('/admin/dashboard', authenticateAdmin, controller.dashboard);
 */
export function authenticateAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(errorResponse('Token tidak ditemukan. Silakan login.'));
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json(errorResponse('Token tidak valid.'));
    return;
  }

  try {
    const payload = verifyToken(token);

    if (payload.type !== 'admin') {
      res.status(403).json(errorResponse('Akses ditolak. Token bukan untuk admin.'));
      return;
    }

    req.admin = {
      id: payload.id,
      email: payload.email,
      role: payload.role as any,
    };

    next();
  } catch (error) {
    res.status(401).json(errorResponse('Token expired atau tidak valid. Silakan login ulang.'));
    return;
  }
}

/**
 * Middleware: Hanya SUPER_ADMIN yang boleh akses.
 * HARUS dipasang SETELAH authenticateAdmin.
 *
 * Cara pakai:
 *   router.post('/admin/create', authenticateAdmin, requireSuperAdmin, controller.create);
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.admin || req.admin.role !== 'SUPER_ADMIN') {
    res.status(403).json(errorResponse('Akses ditolak. Hanya Super Admin yang diizinkan.'));
    return;
  }
  next();
}
