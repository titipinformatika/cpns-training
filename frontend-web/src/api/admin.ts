import adminApi from './adminAxios';

// ===== Auth Admin =====
export const adminAuthApi = {
  login: (data: { email: string; password: string }) =>
    adminApi.post('/admin/auth/login', data),
  getMe: () =>
    adminApi.get('/admin/auth/me'),
};

// ===== Dashboard =====
export const adminDashboardApi = {
  getSummary: () =>
    adminApi.get('/admin/dashboard/summary'),
};

// ===== Master Data CRUD =====
export const adminMasterApi = {
  // Kategori Soal
  createKategori: (data: { kode: string; nama: string; deskripsi?: string; passing_grade: number }) =>
    adminApi.post('/admin/master/kategori', data),
  updateKategori: (id: number, data: any) =>
    adminApi.patch(`/admin/master/kategori/${id}`, data),
  deleteKategori: (id: number) =>
    adminApi.delete(`/admin/master/kategori/${id}`),

  // Jenis Soal
  createJenis: (data: { kategori_soal_id: number; nama: string; deskripsi?: string }) =>
    adminApi.post('/admin/master/jenis', data),
  updateJenis: (id: number, data: any) =>
    adminApi.patch(`/admin/master/jenis/${id}`, data),
  deleteJenis: (id: number) =>
    adminApi.delete(`/admin/master/jenis/${id}`),

  // Pendidikan
  createPendidikan: (data: { nama: string; urutan: number }) =>
    adminApi.post('/admin/master/pendidikan', data),

  // Jurusan
  createJurusan: (data: { nama: string; rumpun?: string }) =>
    adminApi.post('/admin/master/jurusan', data),

  // Instansi
  createInstansi: (data: { nama: string; singkatan?: string; jenis?: string }) =>
    adminApi.post('/admin/master/instansi', data),
  updateInstansi: (id: number, data: any) =>
    adminApi.patch(`/admin/master/instansi/${id}`, data),
  deleteInstansi: (id: number) =>
    adminApi.delete(`/admin/master/instansi/${id}`),

  // Formasi
  createFormasi: (data: any) =>
    adminApi.post('/admin/master/formasi', data),
  updateFormasi: (id: number, data: any) =>
    adminApi.patch(`/admin/master/formasi/${id}`, data),
  deleteFormasi: (id: number) =>
    adminApi.delete(`/admin/master/formasi/${id}`),
};

// ===== Bank Soal =====
export const adminBankSoalApi = {
  create: (data: { nama: string; deskripsi?: string }) =>
    adminApi.post('/admin/backoffice/bank-soal', data),
  getAll: (params?: { page?: number; limit?: number }) =>
    adminApi.get('/admin/backoffice/bank-soal', { params }),
  getById: (id: number) =>
    adminApi.get(`/admin/backoffice/bank-soal/${id}`),
  update: (id: number, data: any) =>
    adminApi.patch(`/admin/backoffice/bank-soal/${id}`, data),
  delete: (id: number) =>
    adminApi.delete(`/admin/backoffice/bank-soal/${id}`),
};

// ===== Soal (multipart upload) =====
export const adminSoalApi = {
  create: (formData: FormData) =>
    adminApi.post('/admin/backoffice/soal', formData),
  getByBankSoal: (bankSoalId: number, params?: { search?: string; kategori_id?: number; jenis_id?: number; level?: string; page?: number; limit?: number }) =>
    adminApi.get(`/admin/backoffice/soal/bank/${bankSoalId}`, { params }),
  update: (id: number, formData: FormData) =>
    adminApi.patch(`/admin/backoffice/soal/${id}`, formData),
  toggleActive: (id: number) =>
    adminApi.patch(`/admin/backoffice/soal/${id}/toggle-active`),
  delete: (id: number) =>
    adminApi.delete(`/admin/backoffice/soal/${id}`),
};

// ===== Paket Ujian =====
export const adminPaketUjianApi = {
  create: (data: { nama: string; deskripsi?: string; durasi_menit: number; tipe: string; peruntukan: string }) =>
    adminApi.post('/admin/backoffice/paket-ujian', data),
  getAll: (params?: { page?: number; limit?: number }) =>
    adminApi.get('/admin/backoffice/paket-ujian', { params }),
  update: (id: number, data: any) =>
    adminApi.patch(`/admin/backoffice/paket-ujian/${id}`, data),
  addSoal: (ujianId: number, data: { soal_ids: number[] }) =>
    adminApi.post(`/admin/backoffice/paket-ujian/${ujianId}/soal`, data),
  getSoal: (ujianId: number) =>
    adminApi.get(`/admin/backoffice/paket-ujian/${ujianId}/soal`),
  removeSoal: (mappingId: number) =>
    adminApi.delete(`/admin/backoffice/paket-ujian/soal/${mappingId}`),
  reorderSoal: (data: { items: { id: number; nomor_urut: number }[] }) =>
    adminApi.patch('/admin/backoffice/paket-ujian/soal/reorder', data),
};

// ===== Review Laporan & Kontribusi =====
export const adminReviewApi = {
  getLaporan: (params?: { page?: number; limit?: number; status?: string }) =>
    adminApi.get('/admin/backoffice/laporan-soal', { params }),
  updateLaporan: (id: number, data: { status: string; review_note?: string }) =>
    adminApi.patch(`/admin/backoffice/laporan-soal/${id}`, data),
  getKontribusi: (params?: { page?: number; limit?: number; status?: string }) =>
    adminApi.get('/admin/backoffice/kontribusi-soal', { params }),
  updateKontribusi: (id: number, data: { status: string; review_note?: string; bank_soal_id?: number }) =>
    adminApi.patch(`/admin/backoffice/kontribusi-soal/${id}`, data),
};
