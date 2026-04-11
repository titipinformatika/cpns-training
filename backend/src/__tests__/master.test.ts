import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import * as masterController from '../controllers/master.controller.js';
import prisma from '../lib/prisma.js';

function createMocks() {
  const req = {
    query: {},
    params: {},
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('Master Controller (Public)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset manual spies if any
    jest.restoreAllMocks();
  });

  describe('getKategori()', () => {
    it('harus merespon dengan daftar kategori dari database', async () => {
      const { req, res, next } = createMocks();
      const mockData = [{ id: 1, nama: 'TIU' }];
      
      // Menggunakan spyOn pada instance prisma yang sudah di-import
      const spy = jest.spyOn(prisma.kategoriSoal, 'findMany').mockImplementation(() => Promise.resolve(mockData) as any);

      await masterController.getKategori(req, res, next);

      expect(spy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockData
      }));
    });
  });

  describe('getFormasi()', () => {
    it('harus melakukan casting BigInt ke Number agar JSON safe', async () => {
      const { req, res, next } = createMocks();
      const mockData = [{ 
        id: 1, 
        nama_jabatan: 'Analis', 
        gaji_min: BigInt(5000000), 
        gaji_max: BigInt(7000000) 
      }];
      
      const spy = jest.spyOn(prisma.formasi, 'findMany').mockImplementation(() => Promise.resolve(mockData) as any);

      await masterController.getFormasi(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: [expect.objectContaining({
          gaji_min: 5000000,
          gaji_max: 7000000
        })]
      }));
    });
  });
});
