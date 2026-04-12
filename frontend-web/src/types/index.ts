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
  provinsi: string | null;
  kota: string | null;
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
}

// ===== Master Data =====
export interface KategoriSoal {
  id: number;
  kode: string;
  nama: string;
  deskripsi: string | null;
  passing_grade: number;
}

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
