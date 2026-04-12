import { z } from 'zod';

/**
 * Validasi ID di parameter URL (e.g., /api/resource/:id)
 */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('ID harus berupa angka positif'),
});
