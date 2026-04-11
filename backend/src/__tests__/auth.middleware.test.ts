import { describe, it, expect, jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { authenticateUser, authenticateAdmin, requireSuperAdmin } from '../middlewares/auth.middleware.js';
import { generateAccessToken } from '../services/auth.service.js';
import type { JwtPayload } from '../services/auth.service.js';

// Helper: buat mock Request, Response, NextFunction
function createMocks(authHeader?: string) {
  const req = {
    headers: { authorization: authHeader },
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const next = jest.fn() as NextFunction;

  return { req, res, next };
}

describe('Auth Middleware', () => {
  // ───── authenticateUser ─────

  describe('authenticateUser()', () => {
    it('harus return 401 jika tidak ada header Authorization', () => {
      const { req, res, next } = createMocks();
      authenticateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('harus return 401 jika format bukan Bearer', () => {
      const { req, res, next } = createMocks('Basic abc123');
      authenticateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('harus return 403 jika token bertipe admin (bukan user)', () => {
      const adminPayload: JwtPayload = { id: 1, email: 'x@x.com', role: 'ADMIN', type: 'admin' };
      const token = generateAccessToken(adminPayload);
      const { req, res, next } = createMocks(`Bearer ${token}`);
      authenticateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('harus memanggil next() dan set req.user jika token user valid', () => {
      const userPayload: JwtPayload = { id: 5, email: 'user@test.com', kategori: 'FREE', type: 'user' };
      const token = generateAccessToken(userPayload);
      const { req, res, next } = createMocks(`Bearer ${token}`);
      authenticateUser(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user!.id).toBe(5);
      expect(req.user!.email).toBe('user@test.com');
    });

    it('harus return 401 jika token expired/rusak', () => {
      const { req, res, next } = createMocks('Bearer token-yang-pasti-salah');
      authenticateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  // ───── authenticateAdmin ─────

  describe('authenticateAdmin()', () => {
    it('harus return 401 jika tidak ada token', () => {
      const { req, res, next } = createMocks();
      authenticateAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('harus return 403 jika token bertipe user (bukan admin)', () => {
      const userPayload: JwtPayload = { id: 1, email: 'u@u.com', kategori: 'FREE', type: 'user' };
      const token = generateAccessToken(userPayload);
      const { req, res, next } = createMocks(`Bearer ${token}`);
      authenticateAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('harus set req.admin jika token admin valid', () => {
      const adminPayload: JwtPayload = { id: 10, email: 'admin@cpns.com', role: 'SUPER_ADMIN', type: 'admin' };
      const token = generateAccessToken(adminPayload);
      const { req, res, next } = createMocks(`Bearer ${token}`);
      authenticateAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.admin).toBeDefined();
      expect(req.admin!.role).toBe('SUPER_ADMIN');
    });
  });

  // ───── requireSuperAdmin ─────

  describe('requireSuperAdmin()', () => {
    it('harus return 403 jika role bukan SUPER_ADMIN', () => {
      const { req, res, next } = createMocks();
      req.admin = { id: 1, email: 'a@a.com', role: 'ADMIN' as any };
      requireSuperAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('harus memanggil next() jika role SUPER_ADMIN', () => {
      const { req, res, next } = createMocks();
      req.admin = { id: 1, email: 'a@a.com', role: 'SUPER_ADMIN' as any };
      requireSuperAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
