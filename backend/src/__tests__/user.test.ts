import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import * as userController from '../controllers/user.controller.js';
import prisma from '../lib/prisma.js';

function createMocks() {
  const req = {
    body: {},
    params: {},
    user: { id: 99, email: 'user@test.com' },
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('User Controller (Biodata)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getBiodata()', () => {
    it('harus merespon 200 dengan data biodata user jika ditemukan', async () => {
      const { req, res, next } = createMocks();
      const mockBiodata = { id: 1, user_id: 99, nama_lengkap: 'Budi' };
      
      const spy = jest.spyOn(prisma.biodataUser, 'findUnique').mockImplementation(() => Promise.resolve(mockBiodata) as any);

      await userController.getBiodata(req, res, next);

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: 99 }
      }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockBiodata
      }));
    });
  });

  describe('upsertBiodata()', () => {
    it('harus memanggil prisma.upsert dengan data yang benar', async () => {
      const { req, res, next } = createMocks();
      req.body = { nama_lengkap: 'Budi Santoso', kota: 'Jakarta' };
      
      const spy = jest.spyOn(prisma.biodataUser, 'upsert').mockImplementation(() => Promise.resolve({ id: 1, ...req.body }) as any);

      await userController.upsertBiodata(req, res, next);

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: 99 },
        update: expect.objectContaining({ nama_lengkap: 'Budi Santoso' }),
        create: expect.objectContaining({ user_id: 99, nama_lengkap: 'Budi Santoso' })
      }));
    });
  });
});
