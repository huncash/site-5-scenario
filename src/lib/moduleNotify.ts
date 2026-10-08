import type { MeshRepository } from "@/lib/mesh/meshRepository";
import type { MeshSchema, ModuleNotifyRow } from "@/lib/mesh/schema";

export const MODULE_NOTIFY_EVENT = "szcenario:module-notify";

export function moduleNotifyQueryKey() {
  return ["moduleNotify"] as const;
}

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MODULE_NOTIFY_EVENT));
}

export async function hasModuleNotify(
  repo: MeshRepository<MeshSchema>,
  id: string,
): Promise<boolean> {
  const row = await repo.get("moduleNotify", id);
  return Boolean(row?.id);
}

export async function saveModuleNotify(
  repo: MeshRepository<MeshSchema>,
  id: string,
): Promise<ModuleNotifyRow> {
  const row: ModuleNotifyRow = { id, at: Date.now() };
  await repo.save("moduleNotify", row);
  emit();
  return row;
}
