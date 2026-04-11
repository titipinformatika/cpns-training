import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import * as adminMasterController from '../controllers/admin-master.controller.js';
import prisma from '../lib/prisma.js';

function createMocks() {
  const req = {
    body: {},
    params: {},
    admin: { id: 1, email: 'admin@test.com', role: 'SUPER_ADMIN' },
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('Admin Master Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('createKategori()', () => {
    it('harus memanggil prisma.create dengan data yang benar', async () => {
      const { req, res, next } = createMocks();
      req.body = { kode: 'TIU', nama: 'Intelegensia Umum' };
      
      const spy = jest.spyOn(prisma.kategoriSoal, 'create').mockImplementation(() => Promise.resolve({ id: 1, ...req.body }) as any);

      await adminMasterController.createKategori(req, res, next);

      expect(spy).toHaveBeenCalledWith({ data: req.body });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('createFormasi()', () => {
    it('harus mengonversi gaji number ke BigInt sebelum simpan', async () => {
      const { req, res, next } = createMocks();
      req.body = { 
        instansi_id: 1, 
        nama_jabatan: 'Auditor', 
        gaji_min: 4000000 
      };
      
      const spy = jest.spyOn(prisma.formasi, 'create').mockImplementation(() => Promise.resolve({ 
        id: 10, 
        ...req.body, 
        gaji_min: BigInt(4000000) 
      }) as any);

      await adminMasterController.createFormasi(req, res, next);

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          gaji_min: BigInt(4000000)
        })
      }));
    });
  });
});
