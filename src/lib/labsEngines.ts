import type { MeshRepository } from "@/lib/mesh/meshRepository";
import type { MeshSchema } from "@/lib/mesh/schema";
import {
  applyEngineToggle,
  atLeastOneEngineActive,
  isLabsEngineId,
  resolveEngineOn,
  type EngineOnMap,
  type LabsEngineId,
} from "@/lib/labsTechTree";

const ENGINE_IDS: readonly LabsEngineId[] = ["economic", "resilience", "education"];

export function labsEngineQueryKey() {
  return ["labsEngines"] as const;
}

function forceCore(on: EngineOnMap): EngineOnMap {
  const next = resolveEngineOn({ ...on, economic: true });
  if (!atLeastOneEngineActive(next)) next.economic = true;
  return next;
}

export async function readEngineOn(repo: MeshRepository<MeshSchema>): Promise<EngineOnMap> {
  const rows = await repo.getAll("labsEngines");
  const partial: Partial<EngineOnMap> = {};
  for (const row of rows) {
    if (isLabsEngineId(row.id)) partial[row.id] = row.on;
  }
  return forceCore(resolveEngineOn(partial));
}

export async function writeEngineOn(
  repo: MeshRepository<MeshSchema>,
  on: EngineOnMap,
): Promise<EngineOnMap> {
  const next = forceCore(on);
  for (const id of ENGINE_IDS) {
    await repo.save("labsEngines", { id, on: next[id] });
  }
  return next;
}

export async function toggleEngine(
  repo: MeshRepository<MeshSchema>,
  id: LabsEngineId,
): Promise<{ on: EngineOnMap; switched: boolean; refused: boolean }> {
  const current = await readEngineOn(repo);
  const next = applyEngineToggle(id, current);
  if (!next) return { on: current, switched: false, refused: true };
  if (next[id] === current[id]) return { on: current, switched: false, refused: false };
  const saved = await writeEngineOn(repo, next);
  return { on: saved, switched: true, refused: false };
}

export async function ensureEngineOn(
  repo: MeshRepository<MeshSchema>,
  id: LabsEngineId,
): Promise<boolean> {
  const current = await readEngineOn(repo);
  if (current[id]) return false;
  await writeEngineOn(repo, { ...current, [id]: true });
  return true;
}
