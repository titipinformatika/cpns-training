// ===== Upload Configuration =====
export const UPLOAD_DIR = 'uploads';
export const UPLOAD_SOAL_DIR = `${UPLOAD_DIR}/soal`;
export const UPLOAD_KONTRIBUSI_DIR = `${UPLOAD_DIR}/kontribusi`;
export const UPLOAD_LAPORAN_DIR = `${UPLOAD_DIR}/laporan`;
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg'];

// ===== Pagination Defaults =====
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// ===== Exam / Session =====
export const HEARTBEAT_TIMEOUT_SECONDS = 120;
export const HEARTBEAT_INTERVAL_SECONDS = 30;

// ===== Tingkat Penguasaan Thresholds (persentase benar) =====
export const PENGUASAAN_RENDAH = 40;
export const PENGUASAAN_SEDANG = 65;
export const PENGUASAAN_TINGGI = 85;
