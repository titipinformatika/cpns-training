import api from './axios';
import type { ApiResponse, PaginatedResponse, LaporanSoal, KontribusiSoal } from '../types';

export const sosialApi = {
  /**
   * Kirim laporan soal bermasalah
   * ⚠️ Gunakan FormData! JANGAN set Content-Type header manual!
   * 
   * Fields wajib: soal_id (number), jenis_laporan (enum), deskripsi (min 10 karakter)
   * File opsional: bukti_screenshot (max 2MB, .jpg/.jpeg)
   */
  kirimLaporan: (formData: FormData) =>
    api.post<ApiResponse<LaporanSoal>>('/laporan-soal', formData),

  /**
   * Kirim kontribusi soal baru
   * ⚠️ Gunakan FormData! JANGAN set Content-Type header manual!
   *
   * Fields wajib: kategori_soal_id, jenis_soal_id, level, pertanyaan (min 5),
   *               opsi_a-opsi_e (min 1 char each), jawaban_benar (A-E)
   * Fields opsional: pembahasan
   * Files opsional: pertanyaan_gambar, opsi_a_gambar..opsi_e_gambar, pembahasan_gambar
   *                 (masing-masing max 2MB, .jpg/.jpeg)
   */
  kirimKontribusi: (formData: FormData) =>
    api.post<ApiResponse<KontribusiSoal>>('/kontribusi-soal', formData),

  /**
   * Riwayat laporan saya (paginated)
   */
  getRiwayatLaporan: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<LaporanSoal>>('/user/laporan-soal', { params }),

  /**
   * Riwayat kontribusi saya (paginated)
   */
  getRiwayatKontribusi: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<KontribusiSoal>>('/user/kontribusi-soal', { params }),
};
