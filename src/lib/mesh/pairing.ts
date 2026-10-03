import { z } from "zod";

import { ACCESS_ROLE } from "@/lib/accessRole";

export const PairingSessionSchema = z.object({
  id: z.string().min(1),
  created_at: z.string().min(1),
  role: z.enum([ACCESS_ROLE.OWNER_EDITOR, ACCESS_ROLE.VIEWER_READONLY]).optional(),
  revoked: z.boolean().optional(),
});

export type PairingSession = z.infer<typeof PairingSessionSchema>;

