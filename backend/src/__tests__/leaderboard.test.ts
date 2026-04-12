import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';
import * as leaderboardController from '../controllers/leaderboard.controller.js';
import prisma from '../lib/prisma.js';

// Mock Prisma
jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    hasilUjian: { findMany: jest.fn(), groupBy: jest.fn() },
    biodataUser: { findUnique: jest.fn(), findMany: jest.fn() }
  }
}));

const createMocks = () => {
  const req = {
    user: { id: 1 },
    body: {},
    params: {},
    query: { ujian_id: '1' }
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  } as unknown as Response;

  const next = jest.fn();

  return { req, res, next };
};

describe('Leaderboard Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Global Leaderboard', () => {
    it('harus berhasil mengambil ranking global', async () => {
      const { req, res, next } = createMocks();
      
      jest.spyOn(prisma.hasilUjian, 'findMany').mockResolvedValue([
        { user_id: 1, skor_total: 100, durasi_detik: 10, user: { id: 1, biodata: { nama_lengkap: 'User 1' } } },
        { user_id: 2, skor_total: 90, durasi_detik: 15, user: { id: 2, biodata: { nama_lengkap: 'User 2' } } }
      ] as any);
      jest.spyOn(prisma.hasilUjian, 'groupBy').mockResolvedValue([{ _count: { _all: 1 } }, { _count: { _all: 1 } }] as any);

      await leaderboardController.getGlobalLeaderboard(req, res, next);

      const jsonResponse = (res.json as jest.Mock).mock.calls[0]![0] as any;
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.data[0].ranking).toBe(1);
      expect(jsonResponse.data[1].ranking).toBe(2);
    });
  });

  describe('Formasi Leaderboard', () => {
    it('harus berhasil mengambil ranking pesaing se-formasi', async () => {
      const { req, res, next } = createMocks();
      
      jest.spyOn(prisma.biodataUser, 'findUnique').mockResolvedValue({
        id: 1, user_id: 1, instansi_id: 10, formasi_id: 20,
        instansi: { nama: 'Kemenkeu' },
        formasi: { nama_jabatan: 'Auditor' }
      } as any);

      jest.spyOn(prisma.biodataUser, 'findMany').mockResolvedValue([
        { user_id: 1 }, { user_id: 2 }
      ] as any);

      jest.spyOn(prisma.hasilUjian, 'findMany').mockResolvedValue([
        { user_id: 1, skor_total: 100, user: { id: 1, biodata: { nama_lengkap: 'User 1' } } }
      ] as any);
      jest.spyOn(prisma.hasilUjian, 'groupBy').mockResolvedValue([{ _count: { _all: 1 } }] as any);

      await leaderboardController.getFormasiLeaderboard(req, res, next);

      const jsonResponse = (res.json as jest.Mock).mock.calls[0]![0] as any;
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.data.instansi).toBe('Kemenkeu');
      expect(jsonResponse.data.rankings[0].ranking).toBe(1);
    });

    it('harus menolak jika biodata (instansi/formasi) belum lengkap', async () => {
      const { req, res, next } = createMocks();
      
      jest.spyOn(prisma.biodataUser, 'findUnique').mockResolvedValue({ id: 1, instansi_id: null } as any);

      await leaderboardController.getFormasiLeaderboard(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(((res.json as jest.Mock).mock.calls[0]![0] as any).message).toContain('Lengkapi biodata');
    });
  });
});
