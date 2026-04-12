import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse } from '../utils/response.js';
import { AppError } from '../middlewares/error.middleware.js';
import fs from 'fs';
import path from 'path';

// Helper: Hapus file jika ada
const deleteFile = (filePath: string | null | undefined) => {
  if (filePath) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

// Helper: Ambil path file dari req.files
const getFilePath = (files: any, fieldName: string): string | null => {
  if (files && files[fieldName] && files[fieldName][0]) {
    // Simpan relative path untuk DB (contoh: uploads/soal/xxx.jpg)
    return files[fieldName][0].path.replace(/\\/g, '/');
  }
  return null;
};

export async function createSoal(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    const dataSoal = {
      ...req.body,
      pertanyaan_gambar: getFilePath(files, 'pertanyaan_gambar'),
      opsi_a_gambar: getFilePath(files, 'opsi_a_gambar'),
      opsi_b_gambar: getFilePath(files, 'opsi_b_gambar'),
      opsi_c_gambar: getFilePath(files, 'opsi_c_gambar'),
      opsi_d_gambar: getFilePath(files, 'opsi_d_gambar'),
      opsi_e_gambar: getFilePath(files, 'opsi_e_gambar'),
      pembahasan_gambar: getFilePath(files, 'pembahasan_gambar'),
      created_by_admin: req.admin!.id,
    };

    const soal = await prisma.soal.create({ data: dataSoal });
    res.status(201).json(successResponse(soal, 'Soal berhasil dibuat'));
  } catch (error) {
    next(error);
  }
}

export async function getSoalByBank(req: Request, res: Response, next: NextFunction) {
  try {
    const { bank_soal_id } = req.params;
    const data = await prisma.soal.findMany({
      where: { bank_soal_id: Number(bank_soal_id) },
      include: {
        kategori_soal: { select: { nama: true, kode: true } },
        jenis_soal: { select: { nama: true } },
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

export async function updateSoal(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Ambil data lama untuk hapus gambar lama jika diganti
    const existing = await prisma.soal.findUnique({ where: { id: Number(id) } });
    if (!existing) throw new AppError('Soal tidak ditemukan', 404);

    const updateData: any = { ...req.body };

    const imageFields = [
      'pertanyaan_gambar', 'opsi_a_gambar', 'opsi_b_gambar', 
      'opsi_c_gambar', 'opsi_d_gambar', 'opsi_e_gambar', 'pembahasan_gambar'
    ];

    imageFields.forEach(field => {
      const newPath = getFilePath(files, field);
      if (newPath) {
        // Hapus file lama jika ada
        deleteFile(existing[field as keyof typeof existing] as string);
        updateData[field] = newPath;
      }
    });

    const soal = await prisma.soal.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json(successResponse(soal, 'Soal berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

export async function deleteSoal(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existing = await prisma.soal.findUnique({ where: { id: Number(id) } });
    if (!existing) throw new AppError('Soal tidak ditemukan', 404);

    // Hapus semua gambar terkait
    const imageFields = [
      'pertanyaan_gambar', 'opsi_a_gambar', 'opsi_b_gambar', 
      'opsi_c_gambar', 'opsi_d_gambar', 'opsi_e_gambar', 'pembahasan_gambar'
    ];
    imageFields.forEach(field => {
      deleteFile(existing[field as keyof typeof existing] as string);
    });

    await prisma.soal.delete({ where: { id: Number(id) } });
    res.json(successResponse(null, 'Soal berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}
