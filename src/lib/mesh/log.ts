import { z } from "zod";

export const MeshLogEntrySchema = z.object({
  id: z.string().min(1),
  profileId: z.string().min(1),
  deviceId: z.string().min(1),
  at: z.string().min(1),
  op: z.enum(["save", "delete", "sync:full", "hello"]),
  store: z.string().min(1),
  key: z.string().optional(),
  message: z.string().optional(),
});

export type MeshLogEntry = z.infer<typeof MeshLogEntrySchema>;

