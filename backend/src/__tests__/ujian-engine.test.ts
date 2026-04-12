import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import * as ujianController from '../controllers/ujian-engine.controller.js';
import prisma from '../lib/prisma.js';

function createMocks() {
  const req = {
    body: {},
    params: {},
    user: { id: 1, email: 'user@test.com', kategori: 'FREE' },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test-agent' },
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('Ujian Engine Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('mulaiUjian()', () => {
    it('harus berhasil memulai ujian baru', async () => {
      const { req, res, next } = createMocks();
      req.body = { ujian_id: 1 };

      // Mock Ujian
      jest.spyOn(prisma.ujian, 'findUnique').mockResolvedValue({
        id: 1,
        nama: 'TO 1',
        durasi_menit: 100,
        is_active: true,
      } as any);

      // Mock Sesi Aktif (tidak ada)
      jest.spyOn(prisma.hasilUjian, 'findFirst').mockResolvedValue(null);
      // Mock Percobaan Ke
      jest.spyOn(prisma.hasilUjian, 'count').mockResolvedValue(0);

      // Mock Soal List
      jest.spyOn(prisma.ujianSoal, 'findMany').mockResolvedValue([
        { id: 10, nomor_urut: 1, soal: { pertanyaan: 'Apa itu...?' } }
      ] as any);

      // Mock Transaction
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback(prisma);
      });
      jest.spyOn(prisma.hasilUjian, 'create').mockResolvedValue({ id: 100 } as any);
      jest.spyOn(prisma.sesiUjian, 'create').mockResolvedValue({ id: 200 } as any);

      await ujianController.mulaiUjian(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      const jsonResponse = (res.json as jest.Mock).mock.calls[0]![0] as any;
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.data.hasil_ujian_id).toBe(100);
      expect(jsonResponse.data.soal_list).toHaveLength(1);
    });

    it('harus menolak jika ada sesi yang masih berlangsung', async () => {
      const { req, res, next } = createMocks();
      req.body = { ujian_id: 1 };

      jest.spyOn(prisma.ujian, 'findUnique').mockResolvedValue({ id: 1, is_active: true } as any);
      
      // Mock Sesi Aktif
      const startTime = new Date();
      jest.spyOn(prisma.hasilUjian, 'findFirst').mockResolvedValue({
        id: 99,
        user_id: 1,
        status: 'BERLANGSUNG',
        waktu_mulai: startTime,
        durasi_detik: 3600
      } as any);

      // Mock checkAndHandleTimeout (findUnique)
      jest.spyOn(prisma.hasilUjian, 'findUnique').mockResolvedValue({
        id: 99, status: 'BERLANGSUNG', waktu_mulai: startTime, durasi_detik: 3600, user_id: 1
      } as any);

      await ujianController.mulaiUjian(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(((res.json as jest.Mock).mock.calls[0]![0] as any).message).toContain('berlangsung');
    });
  });

  describe('heartbeat()', () => {
    it('harus mengembalikan sisa waktu yang benar', async () => {
      const { req, res, next } = createMocks();
      req.body = { hasil_ujian_id: 100 };

      const now = new Date('2026-04-12T09:00:00Z');
      jest.useFakeTimers().setSystemTime(now.getTime());
      
      const startTime = new Date(now.getTime() - 60000); // Exactly 1 minute ago

      jest.spyOn(prisma.hasilUjian, 'findUnique').mockResolvedValue({
        id: 100,
        user_id: 1,
        status: 'BERLANGSUNG',
        waktu_mulai: startTime,
        durasi_detik: 600, // 10 menit
      } as any);

      jest.spyOn(prisma.sesiUjian, 'update').mockResolvedValue({} as any);

      await ujianController.heartbeat(req, res, next);

      const jsonResponse = (res.json as jest.Mock).mock.calls[0]![0] as any;
      expect(jsonResponse.data.sisa_waktu_detik).toBe(540); // 600 - 60
    });

    it('harus mengubah status ke TIMEOUT jika waktu habis', async () => {
      const { req, res, next } = createMocks();
      req.body = { hasil_ujian_id: 100 };

      const startTime = new Date(Date.now() - 7200000); // 2 jam yang lalu

      jest.spyOn(prisma.hasilUjian, 'findUnique').mockResolvedValue({
        id: 100,
        user_id: 1,
        status: 'BERLANGSUNG',
        waktu_mulai: startTime,
        durasi_detik: 3600, // 1 jam
      } as any);

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback(prisma);
      });
      jest.spyOn(prisma.hasilUjian, 'update').mockResolvedValue({ id: 100, status: 'TIMEOUT', user_id: 1 } as any);
      jest.spyOn(prisma.sesiUjian, 'update').mockResolvedValue({} as any);

      await ujianController.heartbeat(req, res, next);

      const jsonResponse = (res.json as jest.Mock).mock.calls[0]![0] as any;
      expect(jsonResponse.data.status).toBe('TIMEOUT');
    });
  });

  describe('simpanJawaban() - TKP Scoring', () => {
    it('harus menghitung skor TKP berdasarkan mapping yang ada', async () => {
      const { req, res, next } = createMocks();
      req.body = {
        hasil_ujian_id: 100,
        ujian_soal_id: 500,
        jawaban: 'A',
        is_ragu: false
      };

      const startTime = new Date();
      jest.spyOn(prisma.hasilUjian, 'findUnique').mockResolvedValue({
        id: 100, user_id: 1, status: 'BERLANGSUNG', waktu_mulai: startTime, durasi_detik: 3600, ujian_id: 1
      } as any);

      jest.spyOn(prisma.ujianSoal, 'findUnique').mockResolvedValue({
        id: 500,
        ujian_id: 1,
        soal: { kategori_soal: { kode: 'TKP' } },
        skor_tkp: { skor_a: 5, skor_b: 4, skor_c: 3, skor_d: 2, skor_e: 1 }
      } as any);

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback(prisma);
      });
 
      const upsertSpy = jest.spyOn(prisma.jawabanUjian, 'upsert').mockResolvedValue({} as any);
      jest.spyOn(prisma.jawabanUjian, 'findMany').mockResolvedValue([{ jawaban_user: 'A', is_ragu: false }] as any);
      jest.spyOn(prisma.sesiUjian, 'update').mockResolvedValue({} as any);
      jest.spyOn(prisma.hasilUjian, 'update').mockResolvedValue({} as any);

      await ujianController.simpanJawaban(req, res, next);

      expect(upsertSpy).toHaveBeenCalledWith(expect.objectContaining({
        create: expect.objectContaining({ skor_diperoleh: 5 })
      }));
    });
  });
});
