import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Jumlah salt rounds untuk bcrypt
const SALT_ROUNDS = 10;

/**
 * Hash password menggunakan bcrypt.
 * Digunakan saat: Register User, Create Admin.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifikasi password plain vs hash.
 * Digunakan saat: Login User, Login Admin.
 */
export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

/**
 * Payload yang disimpan di dalam JWT token.
 */
export interface JwtPayload {
  id: number;
  email: string;
  role?: string;       // Hanya untuk Admin: 'SUPER_ADMIN' | 'ADMIN'
  kategori?: string;   // Hanya untuk User: 'FREE' | 'PREMIUM'
  type: 'user' | 'admin';
}

/**
 * Generate access token (masa berlaku pendek: JWT_EXPIRY = '1d').
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload as any, env.JWT_SECRET as string, {
    expiresIn: env.JWT_EXPIRY as any,
  });
}

/**
 * Generate refresh token (masa berlaku panjang: JWT_REFRESH_EXPIRY = '7d').
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload as any, env.JWT_SECRET as string, {
    expiresIn: env.JWT_REFRESH_EXPIRY as any,
  });
}

/**
 * Verifikasi dan decode JWT token.
 * Mengembalikan payload jika valid, throw error jika tidak.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET as string) as JwtPayload;
}
