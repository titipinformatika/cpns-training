import api from './axios';
import type { PaginatedResponse, ApiResponse, LeaderboardEntry, LeaderboardFormasiResponse } from '../types';

export const leaderboardApi = {
  /**
   * Leaderboard Global — semua peserta ujian tertentu
   * @param ujian_id - ID ujian yang dipilih (WAJIB)
   * @param page - halaman pagination (default: 1)
   * @param limit - jumlah per halaman (default: 10)
   */
  getGlobal: (params: { ujian_id: number; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<LeaderboardEntry>>('/leaderboard/global', { params }),

  /**
   * Leaderboard Formasi — peserta se-instansi & formasi yang sama
   * @param ujian_id - ID ujian yang dipilih (WAJIB)
   * ⚠️ Akan return error 400 jika biodata user belum lengkap
   */
  getFormasi: (ujianId: number) =>
    api.get<ApiResponse<LeaderboardFormasiResponse>>('/leaderboard/formasi', {
      params: { ujian_id: ujianId }
    }),
};
