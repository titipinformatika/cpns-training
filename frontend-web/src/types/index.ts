// ===== API Response Types =====
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== User =====
export interface User {
  id: number;
  nama: string;
  email: string;
  kategori: 'FREE' | 'PREMIUM';
  avatar: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  user: Pick<User, 'id' | 'nama' | 'email' | 'kategori'>;
  accessToken: string;
  refreshToken: string;
}

// ===== Biodata =====
export interface BiodataUser {
  id: number;
  user_id: number;
  nama_lengkap: string | null;
  no_hp: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: 'LAKI_LAKI' | 'PEREMPUAN' | null;
  alamat: string | null;
  provinsi_kode: string | null;
  kota_kode: string | null;
  tingkat_pendidikan_id: number | null;
  jurusan_id: number | null;
  nama_universitas: string | null;
  tahun_lulus: number | null;
  instansi_id: number | null;
  formasi_id: number | null;
  tingkat_pendidikan?: { nama: string };
  jurusan?: { nama: string };
  instansi?: { nama: string };
  formasi?: { nama_jabatan: string };
  provinsi?: { kode: string; nama: string };
  kota?: { kode: string; nama: string };
}

// ===== Master Data =====
export interface KategoriSoal {
  id: number;
  kode: string;
  nama: string;
  deskripsi: string | null;
  passing_grade: number;
}

// ===== Ujian & Simulasi =====
export interface Ujian {
  id: number;
  nama: string;
  deskripsi: string | null;
  durasi_menit: number;
  tipe: 'TRYOUT' | 'LATIHAN' | 'QUIZ';
  peruntukan: 'FREE' | 'PREMIUM' | 'ALL';
  is_active: boolean;
  created_at: string;
  _count: { ujian_soal: number };
}

export interface SoalSimulasi {
  ujian_soal_id: number;
  nomor_urut: number;
  pertanyaan: string;
  pertanyaan_gambar: string | null;
  opsi_a: string;
  opsi_a_gambar: string | null;
  opsi_b: string;
  opsi_b_gambar: string | null;
  opsi_c: string;
  opsi_c_gambar: string | null;
  opsi_d: string;
  opsi_d_gambar: string | null;
  opsi_e: string;
  opsi_e_gambar: string | null;
  kategori_soal: {
    kode: string;
    nama: string;
  };
}

export interface MulaiUjianResponse {
  hasil_ujian_id: number;
  sesi_ujian_id: number;
  sisa_waktu_detik: number;
  total_soal: number;
  soal_list: SoalSimulasi[];
}

export interface HeartbeatResponse {
  sisa_waktu_detik: number;
  status: 'AKTIF' | 'TIMEOUT' | 'SELESAI';
}

export interface JawabResponse {
  ujian_soal_id: number;
  jawaban_user: string | null;
  is_ragu: boolean;
  totalTerjawab: number;
  totalBelumJawab: number;
  totalRagu: number;
}

export interface KategoriSkor {
  kode: string;
  nama: string;
  skor: number;
  passing_grade: number;
  lulus: boolean;
}

export interface HasilUjianResponse {
  hasil_ujian_id: number;
  status: string;
  waktu_mulai: string;
  waktu_selesai: string;
  durasi_pengerjaan_detik: number;
  total_soal: number;
  jumlah_dijawab: number;
  jumlah_benar: number;
  jumlah_salah: number;
  jumlah_kosong: number;
  skor_tiu: number;
  skor_twk: number;
  skor_tkp: number;
  skor_total: number;
  is_lulus: boolean;
  detail_kategori: KategoriSkor[];
}

// ===== Dashboard & Statistik =====
export interface DashboardStatistik {
  total_ujian: number;
  skor_tertinggi: number;
  rata_rata_skor: number;
  persentase_lulus: number;
  tren_skor: {
    tanggal: string;
    skor: number;
    ujian_nama: string;
  }[];
}

// ===== Riwayat Ujian =====
export interface RiwayatUjianItem {
  id: number;
  ujian: {
    id: number;
    nama: string;
    tipe: string;
  };
  skor_total: number;
  is_lulus: boolean;
  durasi_detik: number;
  waktu_selesai: string;
}

export interface DetailRiwayatResponse extends HasilUjianResponse {
  ujian_nama: string;
  detail_soal: {
    soal_id: number;
    pertanyaan: string;
    pertanyaan_gambar: string | null;
    jawaban_user: string | null;
    jawaban_benar: string;
    is_benar: boolean;
    pembahasan: string | null;
    pembahasan_gambar: string | null;
    opsi: {
      label: string;
      teks: string;
    }[];
  }[];
}

// ===== Leaderboard =====
export interface LeaderboardEntry {
  ranking: number;
  user_id: number;
  skor_total: number;
  skor_tiu: number;
  skor_twk: number;
  skor_tkp: number;
  is_lulus: boolean;
  durasi_detik: number;
  waktu_selesai: string;
  user: {
    id: number;
    biodata: { nama_lengkap: string | null } | null;
  };
}

export interface LeaderboardFormasiResponse {
  leaderboard: LeaderboardEntry[];
  info_formasi: {
    instansi_nama: string;
    formasi_nama: string;
    total_pesaing: number;
  };
}

// ===== Jenis Soal (untuk dropdown di kontribusi) =====
export interface JenisSoal {
  id: number;
  kategori_soal_id: number;
  nama: string;
  deskripsi: string | null;
}

// ===== Laporan Soal =====
export interface LaporanSoal {
  id: number;
  soal_id: number;
  jenis_laporan: 'JAWABAN_SALAH' | 'SOAL_SALAH' | 'TYPO' | 'PEMBAHASAN_SALAH' | 'GAMBAR_RUSAK' | 'DUPLIKAT' | 'LAINNYA';
  deskripsi: string;
  bukti_screenshot: string | null;
  status: 'PENDING' | 'DITINJAU' | 'DIPERBAIKI' | 'DITOLAK';
  review_note: string | null;
  created_at: string;
}

// ===== Kontribusi Soal =====
export interface KontribusiSoal {
  id: number;
  kategori_soal: { kode: string; nama: string };
  jenis_soal: { nama: string };
  level: 'MUDAH' | 'SEDANG' | 'SULIT' | 'HOST';
  pertanyaan: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  skor_a: number | null;
  skor_b: number | null;
  skor_c: number | null;
  skor_d: number | null;
  skor_e: number | null;
  review_note: string | null;
  created_at: string;
}
