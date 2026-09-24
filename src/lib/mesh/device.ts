import { z } from "zod";

export const MeshDeviceSchema = z.object({
  id: z.string().min(1), // profileId:deviceId
  profileId: z.string().min(1),
  deviceId: z.string().min(1),
  name: z.string().min(1),
  alias: z.string().nullable().optional(),
  lastSeenAt: z.string().min(1),
});

export type MeshDevice = z.infer<typeof MeshDeviceSchema>;

