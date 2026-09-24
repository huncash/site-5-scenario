import { z } from "zod";

export const PairingSessionSchema = z.object({
  id: z.string().min(1),
  created_at: z.string().min(1),
});

export type PairingSession = z.infer<typeof PairingSessionSchema>;

