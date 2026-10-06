import type { MeshRepository } from "@/lib/mesh/meshRepository";
import type { DashboardBlock, MeshSchema } from "@/lib/mesh/schema";

const LEGACY_REVEAL_PREFIX = "ui:reveal:";

export function dashboardBlockQueryKey(id: string) {
  return ["dashboardBlocks", id] as const;
}

export function resolveDashboardBlockOpen(
  saved: DashboardBlock | undefined,
  defaultOpen: boolean,
): boolean {
  return saved?.open ?? defaultOpen;
}

function readLegacyReveal(id: string): boolean | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const v = window.localStorage.getItem(`${LEGACY_REVEAL_PREFIX}${id}`);
    if (v === "1") return true;
    if (v === "0") return false;
  } catch {
    /* private mode */
  }
  return undefined;
}

function clearLegacyReveal(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${LEGACY_REVEAL_PREFIX}${id}`);
  } catch {
    /* private mode */
  }
}

export async function readDashboardBlockOpen(
  repo: MeshRepository<MeshSchema>,
  id: string,
  defaultOpen = true,
): Promise<boolean> {
  const row = await repo.get("dashboardBlocks", id);
  if (row) return resolveDashboardBlockOpen(row, defaultOpen);
  const legacy = readLegacyReveal(id);
  if (legacy !== undefined) {
    await repo.save("dashboardBlocks", { id, open: legacy });
    clearLegacyReveal(id);
    return legacy;
  }
  return defaultOpen;
}

export async function writeDashboardBlockOpen(
  repo: MeshRepository<MeshSchema>,
  id: string,
  open: boolean,
): Promise<void> {
  await repo.save("dashboardBlocks", { id, open });
}
