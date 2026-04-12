import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';
import * as ujianController from '../controllers/ujian.controller.js';
import prisma from '../lib/prisma.js';

// Mock Prisma
jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    ujian: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn() }
  }
}));

const createMocks = (userKategori: 'FREE' | 'PREMIUM' = 'FREE') => {
  const req = {
    user: { id: 1, kategori: userKategori },
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

describe('Ujian Listing Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUjianList', () => {
    it('harus memfilter ujian PREMIUM untuk user FREE', async () => {
      const { req, res, next } = createMocks('FREE');
      
      jest.spyOn(prisma.ujian, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.ujian, 'count').mockResolvedValue(0);

      await ujianController.getUjianList(req, res, next);

      expect(prisma.ujian.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          peruntukan: { in: ['FREE', 'ALL'] }
        })
      }));
    });

    it('harus mengizinkan user PREMIUM melihat semua ujian', async () => {
      const { req, res, next } = createMocks('PREMIUM');
      
      jest.spyOn(prisma.ujian, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.ujian, 'count').mockResolvedValue(0);

      await ujianController.getUjianList(req, res, next);

      expect(prisma.ujian.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { is_active: true }
      }));
    });
  });

  describe('getUjianDetail', () => {
    it('harus menolak akses ujian PREMIUM jika user FREE', async () => {
      const { req, res, next } = createMocks('FREE');
      req.params = { id: '10' };

      jest.spyOn(prisma.ujian, 'findUnique').mockResolvedValue({
        id: 10, is_active: true, peruntukan: 'PREMIUM'
      } as any);

      await ujianController.getUjianDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(((res.json as jest.Mock).mock.calls[0]![0] as any).message).toContain('hanya untuk member PREMIUM');
    });
  });
});
