import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse } from '../utils/response.js';
import { AppError } from '../middlewares/error.middleware.js';

// === Helper: Serialize BigInt for JSON ===
const serializeFormasi = (data: any) => {
  if (Array.isArray(data)) {
    return data.map((item) => ({
      ...item,
      gaji_min: item.gaji_min ? Number(item.gaji_min) : null,
      gaji_max: item.gaji_max ? Number(item.gaji_max) : null,
    }));
  }
  return {
    ...data,
    gaji_min: data.gaji_min ? Number(data.gaji_min) : null,
    gaji_max: data.gaji_max ? Number(data.gaji_max) : null,
  };
};

// --- Kategori Soal ---
export async function createKategori(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.kategoriSoal.create({ data: req.body });
    res.status(201).json(successResponse(data, 'Kategori berhasil dibuat'));
  } catch (error) {
    next(error);
  }
}

export async function updateKategori(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await prisma.kategoriSoal.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(successResponse(data, 'Kategori berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

export async function deleteKategori(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.kategoriSoal.delete({ where: { id: Number(id) } });
    res.json(successResponse(null, 'Kategori berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}

// --- Jenis Soal ---
export async function createJenis(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.jenisSoal.create({ data: req.body });
    res.status(201).json(successResponse(data, 'Jenis soal berhasil dibuat'));
  } catch (error) {
    next(error);
  }
}

export async function updateJenis(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await prisma.jenisSoal.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(successResponse(data, 'Jenis soal berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

export async function deleteJenis(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.jenisSoal.delete({ where: { id: Number(id) } });
    res.json(successResponse(null, 'Jenis soal berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}

// --- Pendidikan & Jurusan (Simple) ---
export async function createPendidikan(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.tingkatPendidikan.create({ data: req.body });
    res.status(201).json(successResponse(data, 'Tingkat pendidikan berhasil dibuat'));
  } catch (error) {
    next(error);
  }
}

export async function createJurusan(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.jurusan.create({ data: req.body });
    res.status(201).json(successResponse(data, 'Jurusan berhasil dibuat'));
  } catch (error) {
    next(error);
  }
}

// --- Instansi ---
export async function createInstansi(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.instansi.create({
      data: { ...req.body, created_by: req.admin!.id },
    });
    res.status(201).json(successResponse(data, 'Instansi berhasil dibuat'));
  } catch (error) {
    next(error);
  }
}

export async function updateInstansi(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await prisma.instansi.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(successResponse(data, 'Instansi berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

export async function deleteInstansi(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.instansi.delete({ where: { id: Number(id) } });
    res.json(successResponse(null, 'Instansi berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}

// --- Formasi ---
export async function createFormasi(req: Request, res: Response, next: NextFunction) {
  try {
    const { gaji_min, gaji_max, ...body } = req.body;
    const data = await prisma.formasi.create({
      data: {
        ...body,
        created_by: req.admin!.id,
        gaji_min: gaji_min ? BigInt(gaji_min) : null,
        gaji_max: gaji_max ? BigInt(gaji_max) : null,
      },
    });
    res.status(201).json(successResponse(serializeFormasi(data), 'Formasi berhasil dibuat'));
  } catch (error) {
    next(error);
  }
}

export async function updateFormasi(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { gaji_min, gaji_max, ...body } = req.body;
    
    const updateData: any = { ...body };
    if (gaji_min !== undefined) updateData.gaji_min = gaji_min ? BigInt(gaji_min) : null;
    if (gaji_max !== undefined) updateData.gaji_max = gaji_max ? BigInt(gaji_max) : null;

    const data = await prisma.formasi.update({
      where: { id: Number(id) },
      data: updateData,
    });
    res.json(successResponse(serializeFormasi(data), 'Formasi berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

export async function deleteFormasi(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.formasi.delete({ where: { id: Number(id) } });
    res.json(successResponse(null, 'Formasi berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}
