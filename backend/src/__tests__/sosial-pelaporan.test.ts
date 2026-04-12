import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';
import * as laporanController from '../controllers/laporan-soal.controller.js';
import * as kontribusiController from '../controllers/kontribusi-soal.controller.js';
import prisma from '../lib/prisma.js';

// Mock Prisma
jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    soal: { findUnique: jest.fn(), create: jest.fn() },
    laporanSoal: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    kontribusiSoal: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    $transaction: jest.fn()
  }
}));

const createMocks = () => {
  const req = {
    user: { id: 1 },
    admin: { id: 1 },
    body: {},
    params: {},
    query: {},
    file: undefined,
    files: undefined
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  } as unknown as Response;

  const next = jest.fn();

  return { req, res, next };
};

describe('Sosial & Pelaporan Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Laporan Soal', () => {
    it('harus berhasil mengirim laporan soal', async () => {
      const { req, res, next } = createMocks();
      req.body = { soal_id: 1, jenis_laporan: 'TYPO', deskripsi: 'Ada typo di pertanyaan' };

      jest.spyOn(prisma.soal, 'findUnique').mockResolvedValue({ id: 1, is_active: true } as any);
      jest.spyOn(prisma.laporanSoal, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.laporanSoal, 'create').mockResolvedValue({ id: 100 } as any);

      await laporanController.kirimLaporan(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(prisma.laporanSoal.create).toHaveBeenCalled();
    });

    it('harus menolak laporan duplikat', async () => {
      const { req, res, next } = createMocks();
      req.body = { soal_id: 1, jenis_laporan: 'TYPO', deskripsi: 'Ada typo di pertanyaan' };

      jest.spyOn(prisma.soal, 'findUnique').mockResolvedValue({ id: 1, is_active: true } as any);
      jest.spyOn(prisma.laporanSoal, 'findFirst').mockResolvedValue({ id: 99 } as any);

      await laporanController.kirimLaporan(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(((res.json as jest.Mock).mock.calls[0]![0] as any).message).toContain('sudah melaporkan');
    });

    it('harus berhasil mengubah status laporan oleh admin', async () => {
      const { req, res, next } = createMocks();
      req.params = { id: '100' };
      req.body = { status: 'DIPERBAIKI', review_note: 'Sudah ok' };

      jest.spyOn(prisma.laporanSoal, 'findUnique').mockResolvedValue({ id: 100 } as any);
      jest.spyOn(prisma.laporanSoal, 'update').mockResolvedValue({ id: 100, status: 'DIPERBAIKI' } as any);

      await laporanController.reviewLaporan(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('berhasil') }));
    });
  });

  describe('Kontribusi Soal', () => {
    it('harus berhasil mengirim kontribusi soal', async () => {
      const { req, res, next } = createMocks();
      req.body = { pertanyaan: 'Apa itu CPNS?', jawaban_benar: 'A' };

      jest.spyOn(prisma.kontribusiSoal, 'create').mockResolvedValue({ id: 200 } as any);

      await kontribusiController.kirimKontribusi(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(prisma.kontribusiSoal.create).toHaveBeenCalled();
    });

    it('harus berhasil menyetujui kontribusi dan copy ke tabel Soal', async () => {
      const { req, res, next } = createMocks();
      req.params = { id: '200' };
      req.body = { status: 'APPROVED', bank_soal_id: 1 };

      jest.spyOn(prisma.kontribusiSoal, 'findUnique').mockResolvedValue({ id: 200, status: 'PENDING' } as any);
      
      // Mock Transaction
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback(prisma);
      });
      jest.spyOn(prisma.soal, 'create').mockResolvedValue({ id: 999 } as any);
      jest.spyOn(prisma.kontribusiSoal, 'update').mockResolvedValue({ id: 200, status: 'APPROVED' } as any);

      await kontribusiController.reviewKontribusi(req, res, next);

      expect(prisma.soal.create).toHaveBeenCalled();
      expect(prisma.kontribusiSoal.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'APPROVED', soal_id: 999 })
      }));
    });

    it('harus menolak approve tanpa bank_soal_id', async () => {
      const { req, res, next } = createMocks();
      req.params = { id: '200' };
      req.body = { status: 'APPROVED' };

      jest.spyOn(prisma.kontribusiSoal, 'findUnique').mockResolvedValue({ id: 200, status: 'PENDING' } as any);

      await kontribusiController.reviewKontribusi(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(((res.json as jest.Mock).mock.calls[0]![0] as any).message).toContain('Bank Soal ID diperlukan');
    });
  });
});
