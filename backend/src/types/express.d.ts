import { AdminRole, UserKategori } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        kategori: UserKategori;
      };
      admin?: {
        id: number;
        email: string;
        role: AdminRole;
      };
    }
  }
}
