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

  describe('selesaiUjian()', () => {
    it('harus berhasil menyelesaikan ujian dan menghitung skor dengan benar', async () => {
      const { req, res, next } = createMocks();
      req.body = { hasil_ujian_id: 100 };

      const startTime = new Date(Date.now() - 3600000); // 1 jam lalu
      jest.spyOn(prisma.hasilUjian, 'findUnique').mockResolvedValue({
        id: 100, user_id: 1, status: 'BERLANGSUNG', waktu_mulai: startTime, durasi_detik: 7200, total_soal: 3
      } as any);

      // Mock Jawaban
      jest.spyOn(prisma.jawabanUjian, 'findMany').mockResolvedValue([
        { 
          skor_diperoleh: 5, is_benar: true, jawaban_user: 'A',
          ujian_soal: { soal: { kategori_soal: { kode: 'TIU', id: 1 }, jenis_soal_id: 1 } } 
        },
        { 
          skor_diperoleh: 0, is_benar: false, jawaban_user: 'B',
          ujian_soal: { soal: { kategori_soal: { kode: 'TWK', id: 2 }, jenis_soal_id: 2 } } 
        },
        { 
          skor_diperoleh: 4, is_benar: null, jawaban_user: 'C',
          ujian_soal: { soal: { kategori_soal: { kode: 'TKP', id: 3 }, jenis_soal_id: 3 } } 
        }
      ] as any);

      // Mock Kategori & Passing Grade
      jest.spyOn(prisma.kategoriSoal, 'findMany').mockResolvedValue([
        { id: 1, kode: 'TIU', nama: 'TIU', passing_grade: 80 },
        { id: 2, kode: 'TWK', nama: 'TWK', passing_grade: 65 },
        { id: 3, kode: 'TKP', nama: 'TKP', passing_grade: 166 },
      ] as any);

      // Mock Transaction
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback(prisma);
      });

      jest.spyOn(prisma.hasilUjian, 'update').mockResolvedValue({} as any);
      jest.spyOn(prisma.sesiUjian, 'update').mockResolvedValue({} as any);
      jest.spyOn(prisma.statistikUserKategori, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.statistikUserKategori, 'create').mockResolvedValue({} as any);
      jest.spyOn(prisma.statistikUserJenis, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.statistikUserJenis, 'create').mockResolvedValue({} as any);

      await ujianController.selesaiUjian(req, res, next);

      const jsonResponse = (res.json as jest.Mock).mock.calls[0]![0] as any;
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.data.skor_total).toBe(9); // 5 + 0 + 4
      expect(jsonResponse.data.is_lulus).toBe(false); // Semua di bawah pass grade
    });

    it('harus menolak jika ujian sudah selesai atau timeout', async () => {
      const { req, res, next } = createMocks();
      req.body = { hasil_ujian_id: 100 };

      jest.spyOn(prisma.hasilUjian, 'findUnique').mockResolvedValue({
        id: 100, user_id: 1, status: 'SELESAI'
      } as any);

      await ujianController.selesaiUjian(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(((res.json as jest.Mock).mock.calls[0]![0] as any).message).toContain('berakhir');
    });

    it('harus lulus jika semua skor kategori di atas passing grade', async () => {
      const { req, res, next } = createMocks();
      req.body = { hasil_ujian_id: 100 };

      const startTime = new Date(Date.now() - 1000);
      jest.spyOn(prisma.hasilUjian, 'findUnique').mockResolvedValue({
        id: 100, user_id: 1, status: 'BERLANGSUNG', waktu_mulai: startTime, durasi_detik: 3600, total_soal: 3
      } as any);

      jest.spyOn(prisma.jawabanUjian, 'findMany').mockResolvedValue([
        { 
          skor_diperoleh: 100, is_benar: true, jawaban_user: 'A',
          ujian_soal: { soal: { kategori_soal: { kode: 'TIU', id: 1 }, jenis_soal_id: 1 } } 
        },
        { 
          skor_diperoleh: 100, is_benar: true, jawaban_user: 'B',
          ujian_soal: { soal: { kategori_soal: { kode: 'TWK', id: 2 }, jenis_soal_id: 2 } } 
        },
        { 
          skor_diperoleh: 200, is_benar: null, jawaban_user: 'C',
          ujian_soal: { soal: { kategori_soal: { kode: 'TKP', id: 3 }, jenis_soal_id: 3 } } 
        }
      ] as any);

      jest.spyOn(prisma.kategoriSoal, 'findMany').mockResolvedValue([
        { id: 1, kode: 'TIU', nama: 'TIU', passing_grade: 80 },
        { id: 2, kode: 'TWK', nama: 'TWK', passing_grade: 65 },
        { id: 3, kode: 'TKP', nama: 'TKP', passing_grade: 166 },
      ] as any);

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback(prisma);
      });
      jest.spyOn(prisma.hasilUjian, 'update').mockResolvedValue({} as any);
      jest.spyOn(prisma.sesiUjian, 'update').mockResolvedValue({} as any);
      jest.spyOn(prisma.statistikUserKategori, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.statistikUserKategori, 'create').mockResolvedValue({} as any);
      jest.spyOn(prisma.statistikUserJenis, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.statistikUserJenis, 'create').mockResolvedValue({} as any);

      await ujianController.selesaiUjian(req, res, next);

      const jsonResponse = (res.json as jest.Mock).mock.calls[0]![0] as any;
      expect(jsonResponse.data.is_lulus).toBe(true);
    });
  });
});
