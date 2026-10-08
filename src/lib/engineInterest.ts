import { ensureEngineOn } from "@/lib/labsEngines";
import { isLabsEngineId, type LabsEngineId } from "@/lib/labsTechTree";
import { getMeshRepository, type MeshRepository } from "@/lib/mesh/meshRepository";
import type { EngineInterestRow, MeshSchema } from "@/lib/mesh/schema";

export type EngineInterestEvent = "click" | "start" | "switch";

export type EngineInterestMap = Record<LabsEngineId, EngineInterestRow>;

export function engineInterestQueryKey() {
  return ["engineInterest"] as const;
}

export function emptyInterest(id: LabsEngineId): EngineInterestRow {
  return { id, clicks: 0, starts: 0, switches: 0, updatedAt: 0 };
}

function normalize(row: EngineInterestRow, id: LabsEngineId): EngineInterestRow {
  return {
    id,
    clicks: Math.max(0, Math.floor(row.clicks) || 0),
    starts: Math.max(0, Math.floor(row.starts) || 0),
    switches: Math.max(0, Math.floor(row.switches) || 0),
    updatedAt: row.updatedAt || 0,
  };
}

export async function readEngineInterest(
  repo: MeshRepository<MeshSchema>,
): Promise<EngineInterestMap> {
  const map: EngineInterestMap = {
    economic: emptyInterest("economic"),
    resilience: emptyInterest("resilience"),
    education: emptyInterest("education"),
  };
  const rows = await repo.getAll("engineInterest");
  for (const row of rows) {
    if (isLabsEngineId(row.id)) map[row.id] = normalize(row, row.id);
  }
  return map;
}

let writeChain: Promise<unknown> = Promise.resolve();

function enqueueInterest<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeChain.then(fn, fn);
  writeChain = next.then(() => undefined, () => undefined);
  return next;
}

export async function incrementEngineInterest(
  repo: MeshRepository<MeshSchema>,
  id: LabsEngineId,
  event: EngineInterestEvent,
): Promise<EngineInterestRow> {
  return enqueueInterest(async () => {
    const all = await readEngineInterest(repo);
    const row = { ...all[id] };
    if (event === "click") row.clicks += 1;
    else if (event === "start") row.starts += 1;
    else row.switches += 1;
    row.updatedAt = Date.now();
    await repo.save("engineInterest", row);
    return row;
  });
}

export async function clearEngineInterest(repo: MeshRepository<MeshSchema>): Promise<void> {
  for (const id of ["economic", "resilience", "education"] as const) {
    await repo.delete("engineInterest", id);
  }
}

export async function noteEngineStart(
  repo: MeshRepository<MeshSchema>,
  kind: string,
): Promise<void> {
  if (!isLabsEngineId(kind)) return;
  await incrementEngineInterest(repo, kind, "start");
  const switched = await ensureEngineOn(repo, kind);
  if (switched) await incrementEngineInterest(repo, kind, "switch");
}

export async function noteEngineClick(
  repo: MeshRepository<MeshSchema>,
  kind: string,
): Promise<void> {
  if (!isLabsEngineId(kind)) return;
  await incrementEngineInterest(repo, kind, "click");
}

export async function noteEngineSwitch(
  repo: MeshRepository<MeshSchema>,
  kind: LabsEngineId,
): Promise<void> {
  await incrementEngineInterest(repo, kind, "click");
  await incrementEngineInterest(repo, kind, "switch");
}

function repoOrNull(): MeshRepository<MeshSchema> | null {
  if (typeof window === "undefined") return null;
  return getMeshRepository();
}

/** UI: accordion / kártya — nincs hálózat, nincs PII. */
export function recordEngineClick(kind: string): void {
  const repo = repoOrNull();
  if (!repo) return;
  void noteEngineClick(repo, kind);
}

/** UI: demó / case indítás. */
export function recordEngineStart(kind: string): void {
  const repo = repoOrNull();
  if (!repo) return;
  void noteEngineStart(repo, kind);
}
