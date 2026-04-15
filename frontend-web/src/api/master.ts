import api from './axios';
import type { ApiResponse, PaginatedResponse } from '../types';

export const masterApi = {
  getKategori: (params?: any) => 
    api.get<PaginatedResponse<any>>('/master/kategori', { params }),
  
  getJenisSoal: (params?: any) =>
    api.get<PaginatedResponse<any>>('/master/jenis-soal', { params }),
    
  getPendidikan: (params?: any) => 
    api.get<PaginatedResponse<any>>('/master/pendidikan', { params }),
  
  getJurusan: (params?: any) =>
    api.get<PaginatedResponse<any>>('/master/jurusan', { params }),
    
  getInstansi: (params?: any) => 
    api.get<PaginatedResponse<any>>('/master/instansi', { params }),
  
  getFormasi: (params?: any) => 
    api.get<PaginatedResponse<any>>('/master/formasi', { params }),
};

export const wilayahApi = {
  getProvinsi: () => 
    api.get<ApiResponse<any[]>>('/wilayah/provinsi'),
  getKota: (provinsi_kode: string) => 
    api.get<ApiResponse<any[]>>(`/wilayah/kota/${provinsi_kode}`),
};
