import { z } from 'zod';

export const leaderboardQuerySchema = z.object({
  ujian_id: z.coerce.number().int().positive('ID Ujian tidak valid'),
});
