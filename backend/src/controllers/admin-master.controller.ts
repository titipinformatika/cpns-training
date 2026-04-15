import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse } from '../utils/response.js';
import { serializeFormasi } from '../utils/serializer.js';
import { AppError } from '../middlewares/error.middleware.js';

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
    
    // Safety check: is it being used?
    const count = await prisma.soal.count({ where: { kategori_soal_id: Number(id) } });
    if (count > 0) {
      throw new AppError('Kategori tidak bisa dihapus karena masih digunakan oleh soal', 409);
    }
    
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
    
    // Safety check: is it being used?
    const count = await prisma.soal.count({ where: { jenis_soal_id: Number(id) } });
    if (count > 0) {
      throw new AppError('Jenis soal tidak bisa dihapus karena masih digunakan oleh soal', 409);
    }

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

export async function updatePendidikan(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await prisma.tingkatPendidikan.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(successResponse(data, 'Tingkat pendidikan berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

export async function deletePendidikan(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const numId = Number(id);

    // Safety check: is it being used?
    const [jurusanCount, formasiCount, biodataCount] = await Promise.all([
      prisma.jurusan.count({ where: { tingkat_pendidikan_id: numId } }),
      prisma.formasi.count({ where: { tingkat_pendidikan_id: numId } }),
      prisma.biodataUser.count({ where: { tingkat_pendidikan_id: numId } }),
    ]);

    const relations = [];
    if (jurusanCount > 0) relations.push(`${jurusanCount} Jurusan`);
    if (formasiCount > 0) relations.push(`${formasiCount} Formasi`);
    if (biodataCount > 0) relations.push(`${biodataCount} Biodata User`);

    if (relations.length > 0) {
      throw new AppError(
        `Tingkat Pendidikan tidak bisa dihapus karena masih digunakan oleh ${relations.join(', ')}`,
        409
      );
    }

    await prisma.tingkatPendidikan.delete({ where: { id: numId } });
    res.json(successResponse(null, 'Tingkat pendidikan berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}

export async function createJurusan(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.jurusan.create({ 
      data: {
        nama: req.body.nama,
        rumpun: req.body.rumpun,
        tingkat_pendidikan_id: req.body.tingkat_pendidikan_id ? Number(req.body.tingkat_pendidikan_id) : null
      }
    });
    res.status(201).json(successResponse(data, 'Jurusan berhasil dibuat'));
  } catch (error) {
    next(error);
  }
}

export async function updateJurusan(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await prisma.jurusan.update({
      where: { id: Number(id) },
      data: {
        nama: req.body.nama,
        rumpun: req.body.rumpun,
        tingkat_pendidikan_id: req.body.tingkat_pendidikan_id ? Number(req.body.tingkat_pendidikan_id) : null,
      },
    });
    res.json(successResponse(data, 'Jurusan berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

export async function deleteJurusan(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const numId = Number(id);

    // Safety check: is it being used?
    const [formasiCount, biodataCount] = await Promise.all([
      prisma.formasi.count({ where: { jurusan_id: numId } }),
      prisma.biodataUser.count({ where: { jurusan_id: numId } }),
    ]);

    const relations = [];
    if (formasiCount > 0) relations.push(`${formasiCount} Formasi`);
    if (biodataCount > 0) relations.push(`${biodataCount} Biodata User`);

    if (relations.length > 0) {
      throw new AppError(
        `Jurusan tidak bisa dihapus karena masih digunakan oleh ${relations.join(', ')}`,
        409
      );
    }

    await prisma.jurusan.delete({ where: { id: numId } });
    res.json(successResponse(null, 'Jurusan berhasil dihapus'));
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
    // Gunakan Soft Delete untuk data yang berpotensi memiliki banyak relasi
    await prisma.instansi.update({ 
      where: { id: Number(id) },
      data: { is_active: false }
    });
    res.json(successResponse(null, 'Instansi berhasil dinonaktifkan'));
  } catch (error) {
    next(error);
  }
}

// --- Formasi ---
export async function createFormasi(req: Request, res: Response, next: NextFunction) {
  try {
    const { 
      gaji_min, gaji_max, 
      tingkat_pendidikan_id, jurusan_id,
      provinsi_kode, kota_kode,
      ...body 
    } = req.body;
    
    const data = await prisma.formasi.create({
      data: {
        ...body,
        created_by: req.admin!.id,
        tingkat_pendidikan_id: tingkat_pendidikan_id ? Number(tingkat_pendidikan_id) : null,
        jurusan_id: jurusan_id ? Number(jurusan_id) : null,
        provinsi_kode: provinsi_kode ? String(provinsi_kode) : null,
        kota_kode: kota_kode ? String(kota_kode) : null,
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
    const { 
      gaji_min, gaji_max, 
      tingkat_pendidikan_id, jurusan_id,
      provinsi_kode, kota_kode,
      ...body 
    } = req.body;
    
    const updateData: any = { ...body };
    if (tingkat_pendidikan_id !== undefined) updateData.tingkat_pendidikan_id = tingkat_pendidikan_id ? Number(tingkat_pendidikan_id) : null;
    if (jurusan_id !== undefined) updateData.jurusan_id = jurusan_id ? Number(jurusan_id) : null;
    if (provinsi_kode !== undefined) updateData.provinsi_kode = provinsi_kode ? String(provinsi_kode) : null;
    if (kota_kode !== undefined) updateData.kota_kode = kota_kode ? String(kota_kode) : null;
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
    // Gunakan Soft Delete
    await prisma.formasi.update({ 
      where: { id: Number(id) },
      data: { is_active: false }
    });
    res.json(successResponse(null, 'Formasi berhasil dinonaktifkan'));
  } catch (error) {
    next(error);
  }
}
