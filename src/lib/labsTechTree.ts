import type { JitAddonId } from "@/config/plans";
import { DASHBOARD_LABS, type DashboardLabId } from "@/lib/dashboardLabs";
import { CORE_SCENARIO_KIND, isStartableScenarioKind } from "@/lib/scenarioCatalog";

export type LabsEngineId = "economic" | "resilience" | "education";

export type LabsTreePoint = { x: number; y: number };

/** Kompakt bogyós fa — felső-jobb negyed / egy mobilképernyő. */
export const LABS_TREE_VIEW = { w: 400, h: 372 } as const;

export const LABS_ENGINES: ReadonlyArray<{
  id: LabsEngineId;
  label: string;
  alwaysOn: boolean;
  startable: boolean;
  pos: LabsTreePoint;
}> = [
  {
    id: "economic",
    label: "Gazdasági Szcenárió Motor",
    alwaysOn: true,
    startable: isStartableScenarioKind("economic"),
    pos: { x: 200, y: 168 },
  },
  {
    id: "resilience",
    label: "Vészhelyzeti Szcenárió Motor",
    alwaysOn: false,
    startable: isStartableScenarioKind("resilience"),
    pos: { x: 70, y: 86 },
  },
  {
    id: "education",
    label: "Oktatási Szcenárió Motor",
    alwaysOn: false,
    startable: isStartableScenarioKind("education"),
    pos: { x: 330, y: 86 },
  },
];

export const LABS_CORE = {
  id: "core",
  label: "Mag",
  hint: "Szcenárió mag — legalább egy motornak aktívnak kell lennie.",
  pos: { x: 200, y: 86 } as LabsTreePoint,
};

/** Tiszta szár: a fenti sor középvonala → mag. */
export const LABS_STEM = {
  from: { x: 200, y: 0 } as LabsTreePoint,
  to: LABS_CORE.pos,
};

/** Felső kerettől lefelé nyíló félkörlap — mag + 2 nézet. Nincs erős körvonal. */
export const LABS_CAP = { cx: 200, cy: 0, r: 120 } as const;

export function labsCapPath(): string {
  const { cx, cy, r } = LABS_CAP;
  return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`;
}

/** Minden motort érintő, főappból kilépő modulok. */
export const LABS_SHARED_IDS = ["labs-szumma", "mesh-desk"] as const;

export function isLabsSharedModule(id: string): boolean {
  return (LABS_SHARED_IDS as readonly string[]).includes(id);
}

export const LABS_TREE_MODULES: ReadonlyArray<{
  id: DashboardLabId;
  engine: LabsEngineId;
  pos: LabsTreePoint;
}> = [
  { id: "labs-kpi", engine: "economic", pos: { x: 70, y: 232 } },
  { id: "labs-baseline", engine: "economic", pos: { x: 113, y: 286 } },
  { id: "labs-sim", engine: "economic", pos: { x: 148, y: 340 } },
  { id: "labs-halmozott", engine: "economic", pos: { x: 200, y: 286 } },
  { id: "labs-edge", engine: "economic", pos: { x: 252, y: 340 } },
  { id: "labs-shock", engine: "economic", pos: { x: 287, y: 286 } },
  { id: "labs-advise", engine: "economic", pos: { x: 328, y: 232 } },
  { id: "labs-szumma", engine: "economic", pos: { x: 128, y: 40 } },
  { id: "labs-anon", engine: "education", pos: { x: 372, y: 128 } },
];

export const LABS_EDUCATION_MODULES = {
  id: "education-modules",
  label: "Oktatási modulok",
  hint: "Oktatási esetek a Case / Slot keretben.",
  pos: { x: 372, y: 52 } as LabsTreePoint,
};

export const LABS_BCP_PRACTICE = {
  id: "bcp-practice",
  label: "Vészhelyzeti nézet",
  hint: "Görgethető BCP szekció a dashboardon — a fejléc és a tabok szabadok.",
  pos: { x: 28, y: 52 } as LabsTreePoint,
};

export const LABS_MESH_DESK = {
  id: "mesh-desk",
  label: "Kísérleti asztal",
  hint: "Három motor egy képen — külön nézet, a stabil dashboardot nem bántja.",
  pos: { x: 272, y: 40 } as LabsTreePoint,
};

/** JIT kapacitás-bővítők a fán — nem külön HUD-sáv. Edge = labs-edge bogyó. */
export const LABS_JIT_ADDONS: ReadonlyArray<{
  id: Exclude<JitAddonId, "edge_sensor">;
  pos: LabsTreePoint;
}> = [
  { id: "case_plus_1", pos: { x: 150, y: 268 } },
  { id: "slot_plus_1", pos: { x: 200, y: 308 } },
  { id: "seat_plus_1", pos: { x: 250, y: 268 } },
  { id: "guest_plus_1", pos: { x: 300, y: 308 } },
];

/** @deprecated alias — a lock node kapcsolható oktatási ág lett. */
export const LABS_EDUCATION_LOCK = LABS_EDUCATION_MODULES;

export function isLabsEngineId(v: string): v is LabsEngineId {
  return v === "economic" || v === "resilience" || v === "education";
}

export function labsEngineById(id: LabsEngineId) {
  return LABS_ENGINES.find((e) => e.id === id)!;
}

export function labsModuleById(id: DashboardLabId) {
  const tree = LABS_TREE_MODULES.find((m) => m.id === id);
  const lab = DASHBOARD_LABS.find((l) => l.id === id)!;
  return { ...lab, engine: tree?.engine ?? "economic", pos: tree?.pos ?? LABS_CORE.pos };
}

export type EngineOnMap = Record<LabsEngineId, boolean>;

export function resolveEngineOn(partial?: Partial<EngineOnMap>): EngineOnMap {
  return {
    economic: partial?.economic ?? true,
    resilience: partial?.resilience ?? false,
    education: partial?.education ?? false,
  };
}

export function activeEngineCount(on: EngineOnMap): number {
  return (on.economic ? 1 : 0) + (on.resilience ? 1 : 0) + (on.education ? 1 : 0);
}

/** Poka-Yoke: az utolsó aktív motort nem lehet lekapcsolni. */
export function canDeactivateEngine(id: LabsEngineId, on: EngineOnMap): boolean {
  const meta = labsEngineById(id);
  if (meta.alwaysOn) return false;
  if (!on[id]) return false;
  return activeEngineCount(on) > 1;
}

/** Bekapcsolás mindig, kikapcsolás csak ha a mag / utolsó motor megmarad. */
export function applyEngineToggle(id: LabsEngineId, on: EngineOnMap): EngineOnMap | null {
  const current = resolveEngineOn(on);
  if (current[id]) {
    if (!canDeactivateEngine(id, current)) return null;
    return { ...current, [id]: false };
  }
  return { ...current, [id]: true };
}

export function atLeastOneEngineActive(on: EngineOnMap): boolean {
  return activeEngineCount(on) >= 1;
}

export function coreKindIsEconomic(): boolean {
  return CORE_SCENARIO_KIND === "economic";
}

export type LabsTreeEdge = { from: LabsTreePoint; to: LabsTreePoint };

export function labsTreeEdges(visible?: readonly LabsEngineId[]): LabsTreeEdge[] {
  const engines = visible ? LABS_ENGINES.filter((e) => visible.includes(e.id)) : LABS_ENGINES;
  const edges: LabsTreeEdge[] = engines.map((e) => ({ from: LABS_CORE.pos, to: e.pos }));
  for (const m of LABS_TREE_MODULES) {
    if (isLabsSharedModule(m.id)) continue;
    if (visible && !visible.includes(m.engine)) continue;
    edges.push({ from: labsEngineById(m.engine).pos, to: m.pos });
  }
  if (!visible || visible.includes("education")) {
    edges.push({ from: labsEngineById("education").pos, to: LABS_EDUCATION_MODULES.pos });
  }
  if (!visible || visible.includes("resilience")) {
    edges.push({ from: labsEngineById("resilience").pos, to: LABS_BCP_PRACTICE.pos });
  }
  return edges;
}

/** CSS-pixel sugár — a bogyó körlapja (h-8 / h-9 / h-11). */
export const LABS_BERRY_R_PX = {
  core: 18,
  engine: 22,
  signal: 22,
  plain: 22,
} as const;

export type LabsTreeNode = { pos: LabsTreePoint; rPx: number };

export function labsTreeNodes(visible?: readonly LabsEngineId[]): LabsTreeNode[] {
  const engines = visible ? LABS_ENGINES.filter((e) => visible.includes(e.id)) : LABS_ENGINES;
  const modules = visible
    ? LABS_TREE_MODULES.filter((m) => isLabsSharedModule(m.id) || visible.includes(m.engine))
    : LABS_TREE_MODULES;
  return [
    { pos: LABS_CORE.pos, rPx: LABS_BERRY_R_PX.core },
    ...engines.map((e) => ({ pos: e.pos, rPx: LABS_BERRY_R_PX.engine })),
    ...modules.map((m) => ({ pos: m.pos, rPx: LABS_BERRY_R_PX.signal })),
    ...(!visible || visible.includes("education")
      ? [{ pos: LABS_EDUCATION_MODULES.pos, rPx: LABS_BERRY_R_PX.plain }]
      : []),
    ...(!visible || visible.includes("resilience")
      ? [{ pos: LABS_BCP_PRACTICE.pos, rPx: LABS_BERRY_R_PX.plain }]
      : []),
    { pos: LABS_MESH_DESK.pos, rPx: LABS_BERRY_R_PX.plain },
  ];
}

export function labsStraightPath(from: LabsTreePoint, to: LabsTreePoint): string {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

/** Egyenes szakasz — a körök belsejében nincs vonal. */
export function labsBerryPath(from: LabsTreePoint, to: LabsTreePoint): string {
  return labsStraightPath(from, to);
}

function mergeIntervals(raw: Array<[number, number]>): Array<[number, number]> {
  const sorted = raw.filter(([a, b]) => b > a).sort((a, b) => a[0] - b[0]);
  const out: Array<[number, number]> = [];
  for (const iv of sorted) {
    const last = out[out.length - 1];
    if (!last || iv[0] > last[1]) out.push([iv[0], iv[1]]);
    else last[1] = Math.max(last[1], iv[1]);
  }
  return out;
}

/** Egyenes [from→to], a node-körök kivágva. box = a fa CSS mérete. */
export function labsClippedSegments(
  from: LabsTreePoint,
  to: LabsTreePoint,
  nodes: readonly LabsTreeNode[],
  box: { w: number; h: number },
  view: { w: number; h: number } = LABS_TREE_VIEW,
): Array<[LabsTreePoint, LabsTreePoint]> {
  const w = Math.max(1, box.w);
  const h = Math.max(1, box.h);
  const toPx = (p: LabsTreePoint) => ({ x: (p.x / view.w) * w, y: (p.y / view.h) * h });
  const toVb = (p: { x: number; y: number }): LabsTreePoint => ({
    x: (p.x / w) * view.w,
    y: (p.y / h) * view.h,
  });
  const A = toPx(from);
  const B = toPx(to);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-6) return [];

  const blocked: Array<[number, number]> = [];
  for (const n of nodes) {
    const C = toPx(n.pos);
    const r = n.rPx + 1;
    const fx = A.x - C.x;
    const fy = A.y - C.y;
    const a = len2;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - r * r;
    const disc = b * b - 4 * a * c;
    if (disc < 0) continue;
    const s = Math.sqrt(disc);
    const t1 = (-b - s) / (2 * a);
    const t2 = (-b + s) / (2 * a);
    const lo = Math.max(0, Math.min(t1, t2));
    const hi = Math.min(1, Math.max(t1, t2));
    if (hi > lo) blocked.push([lo, hi]);
  }

  const segs: Array<[LabsTreePoint, LabsTreePoint]> = [];
  let t = 0;
  for (const [lo, hi] of mergeIntervals(blocked)) {
    if (lo > t + 1e-4) {
      segs.push([
        toVb({ x: A.x + dx * t, y: A.y + dy * t }),
        toVb({ x: A.x + dx * lo, y: A.y + dy * lo }),
      ]);
    }
    t = Math.max(t, hi);
  }
  if (t < 1 - 1e-4) {
    segs.push([toVb({ x: A.x + dx * t, y: A.y + dy * t }), toVb({ x: B.x, y: B.y })]);
  }
  return segs;
}

export function labsClippedPath(
  from: LabsTreePoint,
  to: LabsTreePoint,
  nodes: readonly LabsTreeNode[],
  box: { w: number; h: number },
): string {
  return labsClippedSegments(from, to, nodes, box)
    .map(([a, b]) => labsStraightPath(a, b))
    .join(" ");
}
