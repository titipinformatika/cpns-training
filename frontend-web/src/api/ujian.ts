import api from './axios';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Ujian, 
  MulaiUjianResponse, 
  HeartbeatResponse, 
  JawabResponse, 
  HasilUjianResponse 
} from '../types';

export const ujianApi = {
  getList: (params?: { page?: number; limit?: number; tipe?: string }) =>
    api.get<PaginatedResponse<Ujian>>('/ujian', { params }),
    
  getDetail: (id: number) => 
    api.get<ApiResponse<Ujian>>(`/ujian/${id}`),
    
  mulai: (ujianId: number) =>
    api.post<ApiResponse<MulaiUjianResponse>>('/ujian/simulasi/mulai', { ujian_id: ujianId }),
    
  heartbeat: (hasilUjianId: number) =>
    api.post<ApiResponse<HeartbeatResponse>>('/ujian/simulasi/heartbeat', { hasil_ujian_id: hasilUjianId }),
    
  jawab: (data: { 
    hasil_ujian_id: number; 
    ujian_soal_id: number; 
    jawaban: string | null; 
    is_ragu: boolean 
  }) =>
    api.post<ApiResponse<JawabResponse>>('/ujian/simulasi/jawab', data),
    
  selesai: (hasilUjianId: number) =>
    api.post<ApiResponse<HasilUjianResponse>>('/ujian/simulasi/selesai', { hasil_ujian_id: hasilUjianId }),
};
