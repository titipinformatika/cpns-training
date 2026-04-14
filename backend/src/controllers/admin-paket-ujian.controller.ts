import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse } from '../utils/response.js';
import { AppError } from '../middlewares/error.middleware.js';

// --- Paket Ujian (Ujian Model) ---
export async function createPaketUjian(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.ujian.create({
      data: {
        ...req.body,
        created_by: req.admin!.id,
      },
    });
    res.status(201).json(successResponse(data, 'Paket ujian berhasil dibuat'));
  } catch (error) {
    next(error);
  }
}

export async function getPaketUjian(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.ujian.findMany({
      include: {
        _count: { select: { ujian_soal: true } },
        bank_soal: { select: { nama: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

export async function updatePaketUjian(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await prisma.ujian.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(successResponse(data, 'Paket ujian berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

// --- Mapping Soal (UjianSoal) ---

export async function addSoalToPaket(req: Request, res: Response, next: NextFunction) {
  try {
    const { ujian_id } = req.params;
    const { soal_id, nomor_urut, skor, skor_tkp } = req.body;

    // Gunakan transaksi agar pendaftaran skor TKP aman
    const result = await prisma.$transaction(async (tx) => {
      const mapping = await tx.ujianSoal.create({
        data: {
          ujian_id: Number(ujian_id),
          soal_id,
          nomor_urut,
          skor,
        },
      });

      if (skor_tkp) {
        await tx.ujianSoalSkorTkp.create({
          data: {
            ujian_soal_id: mapping.id,
            ...skor_tkp,
          },
        });
      }

      return mapping;
    });

    res.status(201).json(successResponse(result, 'Soal berhasil ditambahkan ke paket'));
  } catch (error) {
    next(error);
  }
}

export async function removeSoalFromPaket(req: Request, res: Response, next: NextFunction) {
  try {
    const { mapping_id } = req.params;
    await prisma.ujianSoal.delete({
      where: { id: Number(mapping_id) }
    });
    res.json(successResponse(null, 'Soal berhasil dihapus dari paket'));
  } catch (error) {
    next(error);
  }
}

export async function updateSoalOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { items } = req.body; // Array of { id, nomor_urut }

    await prisma.$transaction(
      items.map((item: any) => 
        prisma.ujianSoal.update({
          where: { id: item.id },
          data: { nomor_urut: item.nomor_urut }
        })
      )
    );

    res.json(successResponse(null, 'Urutan soal berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

export async function getSoalInPaket(req: Request, res: Response, next: NextFunction) {
  try {
    const { ujian_id } = req.params;
    const data = await prisma.ujianSoal.findMany({
      where: { ujian_id: Number(ujian_id) },
      include: {
        soal: {
          include: {
            kategori_soal: { select: { nama: true } },
            jenis_soal: { select: { nama: true } },
          }
        },
        skor_tkp: true,
      },
      orderBy: { nomor_urut: 'asc' }
    });
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

export async function deletePaketUjian(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.ujian.delete({
      where: { id: Number(id) },
    });
    res.json(successResponse(null, 'Paket ujian berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}
