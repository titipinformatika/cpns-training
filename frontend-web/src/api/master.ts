import api from './axios';
import type { ApiResponse } from '../types';

export const masterApi = {
  getKategori: () => 
    api.get<ApiResponse<any[]>>('/master/kategori'),
  
  getJenisSoal: (kategoriId?: number) =>
    api.get<ApiResponse<any[]>>('/master/jenis-soal', { 
      params: kategoriId ? { kategori_id: kategoriId } : {} 
    }),
    
  getPendidikan: () => 
    api.get<ApiResponse<any[]>>('/master/pendidikan'),
  
  getJurusan: (search?: string) =>
    api.get<ApiResponse<any[]>>('/master/jurusan', { 
      params: search ? { search } : {} 
    }),
    
  getInstansi: () => 
    api.get<ApiResponse<any[]>>('/master/instansi'),
  
  getFormasi: (instansiId?: number) =>
    api.get<ApiResponse<any[]>>('/master/formasi', { 
      params: instansiId ? { instansi_id: instansiId } : {} 
    }),
};
