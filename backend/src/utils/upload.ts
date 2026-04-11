import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  MAX_FILE_SIZE,
  UPLOAD_SOAL_DIR,
  UPLOAD_KONTRIBUSI_DIR,
  UPLOAD_LAPORAN_DIR,
} from '../config/constants.js';

// Pastikan folder upload ada
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Buat storage factory
function createStorage(destination: string) {
  ensureDir(destination);
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });
}

// Filter: hanya .jpg dan .jpeg
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file .jpg/.jpeg yang diizinkan'));
  }
};

// === Export upload instances per konteks ===

/** Upload gambar soal (pertanyaan, opsi, pembahasan) */
export const uploadSoal = multer({
  storage: createStorage(UPLOAD_SOAL_DIR),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/** Upload gambar kontribusi soal dari user */
export const uploadKontribusi = multer({
  storage: createStorage(UPLOAD_KONTRIBUSI_DIR),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/** Upload bukti screenshot laporan soal */
export const uploadLaporan = multer({
  storage: createStorage(UPLOAD_LAPORAN_DIR),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
