import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { errorResponse } from '../utils/response.js';

/**
 * Custom error class.
 * Contoh: throw new AppError('Email sudah terdaftar', 409);
 */
export class AppError extends Error {
  public statusCode: number;
  public errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'AppError';
  }
}

/**
 * Global error handler middleware.
 * HARUS di-register PALING AKHIR di app.ts.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log error (hanya di development)
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err);
  }

  // 1. Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message, err.errors));
    return;
  }

  // 2. Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[])?.join(', ') || 'unknown';
        res.status(409).json(errorResponse(`Data sudah ada (duplikat: ${target})`));
        return;
      }
      case 'P2025':
        res.status(404).json(errorResponse('Data tidak ditemukan'));
        return;
      case 'P2003':
        res.status(400).json(errorResponse('Referensi data tidak valid'));
        return;
      default:
        res.status(400).json(errorResponse(err.message));
        return;
    }
  }

  // 3. Prisma validation error
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json(errorResponse('Data yang dikirim tidak valid'));
    return;
  }

  // 4. Multer error (file upload)
  if (err.message?.includes('file') || err.message?.includes('File')) {
    res.status(400).json(errorResponse(err.message));
    return;
  }

  // 5. Error umum
  const message = process.env.NODE_ENV === 'development'
    ? err.message
    : 'Internal server error';
  res.status(500).json(errorResponse(message));
}
