import api from './axios';
import type { ApiResponse, BiodataUser } from '../types';

export const userApi = {
  getBiodata: () => 
    api.get<ApiResponse<BiodataUser | null>>('/user/biodata'),
    
  upsertBiodata: (data: Partial<BiodataUser>) => 
    api.put<ApiResponse<BiodataUser>>('/user/biodata', data),
    
  getRiwayatUjian: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<any[]>>('/user/riwayat-ujian', { params }),
    
  getRiwayatDetail: (id: number) => 
    api.get<ApiResponse<any>>(`/user/riwayat-ujian/${id}`),
    
  getStatistik: () => 
    api.get<ApiResponse<any>>('/user/statistik'),
    
  getKontribusiSaya: (params?: { page?: number }) =>
    api.get<ApiResponse<any[]>>('/user/kontribusi-soal', { params }),
    
  getLaporanSaya: (params?: { page?: number }) =>
    api.get<ApiResponse<any[]>>('/user/laporan-soal', { params }),
};
