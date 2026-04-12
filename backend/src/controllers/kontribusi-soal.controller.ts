import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';
import { parsePagination } from '../utils/pagination.js';

interface MultiFiles {
  [fieldname: string]: Express.Multer.File[];
}

/**
 * USER: Kirim kontribusi soal
 */
export async function kirimKontribusi(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const body = req.body;
    const files = req.files as MultiFiles;

    const pullImagePath = (fieldname: string) => files?.[fieldname]?.[0]?.path ?? null;

    const kontribusi = await prisma.kontribusiSoal.create({
      data: {
        user_id: userId,
        kategori_soal_id: body.kategori_soal_id,
        jenis_soal_id: body.jenis_soal_id,
        level: body.level,
        pertanyaan: body.pertanyaan,
        pertanyaan_gambar: pullImagePath('pertanyaan_gambar'),
        opsi_a: body.opsi_a,
        opsi_a_gambar: pullImagePath('opsi_a_gambar'),
        opsi_b: body.opsi_b,
        opsi_b_gambar: pullImagePath('opsi_b_gambar'),
        opsi_c: body.opsi_c,
        opsi_c_gambar: pullImagePath('opsi_c_gambar'),
        opsi_d: body.opsi_d,
        opsi_d_gambar: pullImagePath('opsi_d_gambar'),
        opsi_e: body.opsi_e,
        opsi_e_gambar: pullImagePath('opsi_e_gambar'),
        jawaban_benar: body.jawaban_benar,
        pembahasan: body.pembahasan,
        pembahasan_gambar: pullImagePath('pembahasan_gambar'),
        status: 'PENDING'
      }
    });

    res.status(201).json(successResponse(kontribusi, 'Kontribusi soal berhasil dikirim dan menunggu tinjauan'));
  } catch (error) {
    next(error);
  }
}

/**
 * ADMIN: Get daftar kontribusi
 */
export async function getKontribusiAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.kontribusiSoal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { id: true, email: true, biodata: { select: { nama_lengkap: true } } } },
          kategori_soal: true,
          jenis_soal: true
        }
      }),
      prisma.kontribusiSoal.count({ where })
    ]);

    res.json(paginatedResponse(data, total, page, limit, 'Berhasil mengambil daftar kontribusi soal'));
  } catch (error) {
    next(error);
  }
}

/**
 * ADMIN: Review kontribusi (Approve/Reject)
 */
export async function reviewKontribusi(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, review_note, bank_soal_id } = req.body;
    const adminId = req.admin!.id;

    const kontribusi = await prisma.kontribusiSoal.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!kontribusi) {
      return res.status(404).json(errorResponse('Kontribusi tidak ditemukan'));
    }

    if (kontribusi.status !== 'PENDING') {
      return res.status(400).json(errorResponse(`Kontribusi sudah berstatus ${kontribusi.status}`));
    }

    if (status === 'APPROVED') {
      if (!bank_soal_id) {
        return res.status(400).json(errorResponse('Bank Soal ID diperlukan jika kontribusi disetujui'));
      }

      // Copy ke tabel Soal via transaction
      const result = await prisma.$transaction(async (tx) => {
        const soalBaru = await tx.soal.create({
          data: {
            bank_soal_id: parseInt(bank_soal_id as string),
            kategori_soal_id: kontribusi.kategori_soal_id,
            jenis_soal_id: kontribusi.jenis_soal_id,
            level: kontribusi.level,
            pertanyaan: kontribusi.pertanyaan,
            pertanyaan_gambar: kontribusi.pertanyaan_gambar,
            opsi_a: kontribusi.opsi_a,
            opsi_a_gambar: kontribusi.opsi_a_gambar,
            opsi_b: kontribusi.opsi_b,
            opsi_b_gambar: kontribusi.opsi_b_gambar,
            opsi_c: kontribusi.opsi_c,
            opsi_c_gambar: kontribusi.opsi_c_gambar,
            opsi_d: kontribusi.opsi_d,
            opsi_d_gambar: kontribusi.opsi_d_gambar,
            opsi_e: kontribusi.opsi_e,
            opsi_e_gambar: kontribusi.opsi_e_gambar,
            jawaban_benar: kontribusi.jawaban_benar,
            pembahasan: kontribusi.pembahasan,
            pembahasan_gambar: kontribusi.pembahasan_gambar,
            is_active: true,
            created_by_admin: adminId
          }
        });

        const updatedKontribusi = await tx.kontribusiSoal.update({
          where: { id: kontribusi.id },
          data: {
            status: 'APPROVED',
            review_note,
            reviewed_by: adminId,
            reviewed_at: new Date(),
            soal_id: soalBaru.id
          }
        });

        return { soal: soalBaru, kontribusi: updatedKontribusi };
      });

      return res.json(successResponse(result, 'Kontribusi disetujui dan berhasil ditambahkan ke Bank Soal'));
    } else {
      // REJECTED
      const updated = await prisma.kontribusiSoal.update({
        where: { id: kontribusi.id },
        data: {
          status: 'REJECTED',
          review_note,
          reviewed_by: adminId,
          reviewed_at: new Date()
        }
      });

      return res.json(successResponse(updated, 'Kontribusi ditolak'));
    }
  } catch (error) {
    next(error);
  }
}
