import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import * as paketUjianController from '../controllers/admin-paket-ujian.controller.js';
import prisma from '../lib/prisma.js';

function createMocks() {
  const req = {
    body: {},
    params: {},
    admin: { id: 1, email: 'admin@test.com' },
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('Admin Paket Ujian Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('createPaketUjian()', () => {
    it('harus berhasil membuat paket ujian baru', async () => {
      const { req, res, next } = createMocks();
      req.body = { nama: 'Simulasi TO 1', durasi_menit: 100, bank_soal_id: 1, tipe: 'SIMULASI', peruntukan: 'FREE' };
      
      const spy = jest.spyOn(prisma.ujian, 'create').mockImplementation(() => Promise.resolve({ id: 1, ...req.body }) as any);

      await paketUjianController.createPaketUjian(req, res, next);

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ nama: 'Simulasi TO 1' })
      }));
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('addSoalToPaket() - TKP', () => {
    it('harus membuat record skor_tkp jika data skor_tkp diberikan', async () => {
      const { req, res, next } = createMocks();
      req.params = { ujian_id: '1' };
      req.body = { 
        soal_id: 10, 
        nomor_urut: 1, 
        skor: 5,
        skor_tkp: { skor_a: 5, skor_b: 4, skor_c: 3, skor_d: 2, skor_e: 1 } 
      };

      // Mock transaction
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback(prisma);
      });

      const spyMapping = jest.spyOn(prisma.ujianSoal, 'create').mockImplementation(() => Promise.resolve({ id: 50, ...req.body }) as any);
      const spySkor = jest.spyOn(prisma.ujianSoalSkorTkp, 'create').mockImplementation(() => Promise.resolve({ id: 1 }) as any);

      await paketUjianController.addSoalToPaket(req, res, next);

      expect(spyMapping).toHaveBeenCalled();
      expect(spySkor).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          ujian_soal_id: 50,
          skor_a: 5
        })
      }));
    });
  });
});
