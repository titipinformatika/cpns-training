import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { errorHandler } from './middlewares/error.middleware.js';
import { UPLOAD_DIR } from './config/constants.js';

const app = express();

// === Security Middleware ===
app.use(helmet());
app.use(cors());

// === Body Parsing ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// === Static Files (untuk akses gambar yang di-upload) ===
app.use('/static', express.static(path.resolve(UPLOAD_DIR)));

// === Health Check ===
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'CPNS Training API is running',
    data: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

import apiRouter from './routes/index.js';
app.use('/api', apiRouter);

// === 404 Handler ===
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
  });
});

// === Global Error Handler (HARUS paling bawah) ===
app.use(errorHandler);

export default app;
