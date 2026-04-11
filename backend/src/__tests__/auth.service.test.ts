import { describe, it, expect } from '@jest/globals';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyToken } from '../services/auth.service.js';
import type { JwtPayload } from '../services/auth.service.js';

describe('AuthService', () => {
  // ───── Password Hashing ─────

  describe('hashPassword()', () => {
    it('harus menghasilkan hash yang berbeda dari plain text', async () => {
      const plain = 'password123';
      const hashed = await hashPassword(plain);
      expect(hashed).not.toBe(plain);
      expect(hashed.length).toBeGreaterThan(50); // bcrypt hash selalu panjang
    });

    it('harus menghasilkan hash yang berbeda setiap kali dipanggil (salt berbeda)', async () => {
      const plain = 'password123';
      const hash1 = await hashPassword(plain);
      const hash2 = await hashPassword(plain);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword()', () => {
    it('harus return true jika password cocok', async () => {
      const plain = 'password123';
      const hashed = await hashPassword(plain);
      const result = await comparePassword(plain, hashed);
      expect(result).toBe(true);
    });

    it('harus return false jika password tidak cocok', async () => {
      const hashed = await hashPassword('password123');
      const result = await comparePassword('wrongpassword', hashed);
      expect(result).toBe(false);
    });
  });

  // ───── JWT Token ─────

  describe('generateAccessToken() & verifyToken()', () => {
    const mockPayload: JwtPayload = {
      id: 1,
      email: 'test@test.com',
      kategori: 'FREE',
      type: 'user',
    };

    it('harus generate token yang bisa di-verify kembali', () => {
      const token = generateAccessToken(mockPayload);
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.type).toBe('user');
    });

    it('harus throw error jika token invalid', () => {
      expect(() => verifyToken('invalid-token-here')).toThrow();
    });
  });

  describe('generateRefreshToken()', () => {
    const mockPayload: JwtPayload = {
      id: 99,
      email: 'admin@cpns.com',
      role: 'SUPER_ADMIN',
      type: 'admin',
    };

    it('harus generate refresh token yang valid', () => {
      const token = generateRefreshToken(mockPayload);
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(99);
      expect(decoded.type).toBe('admin');
      expect(decoded.role).toBe('SUPER_ADMIN');
    });
  });
});
