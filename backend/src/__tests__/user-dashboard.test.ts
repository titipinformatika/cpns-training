import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';
import * as userController from '../controllers/user.controller.js';
import prisma from '../lib/prisma.js';

// Mock Prisma
jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    hasilUjian: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn() },
    statistikUserKategori: { findMany: jest.fn() },
    statistikUserJenis: { findMany: jest.fn() },
    kontribusiSoal: { findMany: jest.fn(), count: jest.fn() },
    laporanSoal: { findMany: jest.fn(), count: jest.fn() }
  }
}));

const createMocks = () => {
  const req = {
    user: { id: 1 },
    query: {},
    params: {}
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  } as unknown as Response;

  const next = jest.fn();

  return { req, res, next };
};

describe('User Dashboard Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRiwayatUjian', () => {
    it('harus berhasil mengambil riwayat ujian user', async () => {
      const { req, res, next } = createMocks();
      
      jest.spyOn(prisma.hasilUjian, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.hasilUjian, 'count').mockResolvedValue(0);

      await userController.getRiwayatUjian(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      expect(prisma.hasilUjian.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: 1 }
      }));
    });
  });

  describe('getStatistikUser', () => {
    it('harus berhasil mengambil statistik user', async () => {
      const { req, res, next } = createMocks();
      
      jest.spyOn(prisma.statistikUserKategori, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.statistikUserJenis, 'findMany').mockResolvedValue([]);

      await userController.getStatistikUser(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ statsKategori: [], statsJenis: [] })
      }));
    });
  });

  describe('getRiwayatDetail', () => {
    it('harus berhasil mengambil detail riwayat', async () => {
      const { req, res, next } = createMocks();
      req.params = { id: '100' };

      jest.spyOn(prisma.hasilUjian, 'findUnique').mockResolvedValue({
        id: 100, user_id: 1, ujian: { nama: 'Test' }, jawaban_ujian: []
      } as any);

      await userController.getRiwayatDetail(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const responseBody = (res.json as jest.Mock).mock.calls[0]![0] as any;
      expect(responseBody.data.id).toBe(100);
    });

    it('harus menolak akses jika record bukan milik user', async () => {
      const { req, res, next } = createMocks();
      req.params = { id: '100' };

      jest.spyOn(prisma.hasilUjian, 'findUnique').mockResolvedValue({
        id: 100, user_id: 2 // milik orang lain
      } as any);

      await userController.getRiwayatDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
