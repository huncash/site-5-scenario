import { isEducationSegment, type EducationCaseId } from "@/lib/educationCases";
import { industryCaseById, isIndustrySegment, type IndustryCaseId } from "@/lib/industryCases";
import type { MasterBaselineContext } from "@/lib/masterBaseline";
import { baselineForSegment } from "@/lib/scenarioSurface";
import { isResilienceSegment, type ResilienceCaseId } from "@/lib/resilienceCases";

export type ResourceKind = "water" | "food" | "fuel";
export type CommLinkKind = "mesh" | "lora" | "analog" | "internet";
export type MeshNodeKind = "unit" | "depot" | "repeater" | "hq" | "home";
export type SurvivalBand = "green" | "yellow" | "red";
export type PhysicalTone = "opt" | "real" | "pess";

/** Ivóvíz L / fő / nap — WHO-sáv, helyi modell. */
export const WATER_L_PER_PERSON_DAY = 3;
/** Élelmiszer kg / fő / nap. */
export const FOOD_KG_PER_PERSON_DAY = 0.5;
/** Üzemanyag L / fő / nap (generátor + főzés, háztartási/közösségi sáv). */
export const FUEL_L_PER_PERSON_DAY = 0.35;

export function resourceRunwayHours(input: {
  stock: number;
  headcount: number;
  perPersonPerDay: number;
}): number {
  const need = Math.max(0.0001, input.headcount) * Math.max(0.0001, input.perPersonPerDay);
  return (Math.max(0, input.stock) / need) * 24;
}

export function energyAutonomyHours(input: {
  batteryWh: number;
  solarW: number;
  loadW: number;
}): number {
  const netDrainW = Math.max(0, input.loadW - Math.max(0, input.solarW));
  if (netDrainW <= 0) return 168;
  return Math.max(0, input.batteryWh) / netDrainW;
}

export function survivalBand(remaining: number, target: number): SurvivalBand {
  const ratio = remaining / Math.max(0.0001, target);
  if (ratio >= 0.66) return "green";
  if (ratio >= 0.33) return "yellow";
  return "red";
}

export function formatDuration(hours: number): string {
  if (!Number.isFinite(hours) || hours >= 168) return "7+ nap";
  if (hours >= 24) {
    const d = hours / 24;
    return `${d.toLocaleString("hu-HU", { maximumFractionDigits: 1 })} nap`;
  }
  if (hours >= 1) return `${hours.toLocaleString("hu-HU", { maximumFractionDigits: 1 })} óra`;
  const min = Math.max(0, Math.round(hours * 60));
  return `${min} perc`;
}

export type CommNode = {
  id: string;
  label: string;
  kind: MeshNodeKind;
  x: number;
  y: number;
  up: boolean;
  links: CommLinkKind[];
};

export type CommEdge = {
  from: string;
  to: string;
  kind: CommLinkKind;
  up: boolean;
};

export type CommRedundancy = {
  activeNodes: number;
  totalNodes: number;
  coveragePct: number;
  linkMix: Record<CommLinkKind, number>;
};

export function communicationRedundancy(nodes: CommNode[]): CommRedundancy {
  const active = nodes.filter((n) => n.up);
  const mix: Record<CommLinkKind, number> = { mesh: 0, lora: 0, analog: 0, internet: 0 };
  for (const n of active) {
    for (const l of n.links) mix[l] += 1;
  }
  const diversity = (["mesh", "lora", "analog", "internet"] as const).filter((k) => mix[k] > 0).length;
  const base = nodes.length ? (active.length / nodes.length) * 100 : 0;
  const coveragePct = Math.min(100, Math.round(base * (0.7 + 0.1 * diversity)));
  return { activeNodes: active.length, totalNodes: nodes.length, coveragePct, linkMix: mix };
}

export type PokaYokeEvent = {
  step: number;
  label: string;
  violated: boolean;
};

export function pokaYokeErrorIndex(events: PokaYokeEvent[]): {
  violations: number;
  steps: number;
  index: number;
} {
  const steps = events.length;
  const violations = events.filter((e) => e.violated).length;
  return { violations, steps, index: Math.round((violations / Math.max(1, steps)) * 100) };
}

export type SurvivalGauge = {
  id: string;
  label: string;
  remaining: number;
  target: number;
  unit: "óra" | "nap" | "%" | "db";
  display: string;
  band: SurvivalBand;
  hint: string;
};

export type TtrMetric = {
  hours: number;
  targetHours: number;
  process: string;
  band: SurvivalBand;
};

export type CrisisChoice = {
  id: string;
  label: string;
  tone: PhysicalTone;
  effect: string;
  runwayDeltaHours?: number;
  energyDeltaHours?: number;
  ttrDeltaHours?: number;
  errorDelta?: number;
};

export type CrisisFork = {
  id: string;
  hour: number;
  question: string;
  choices: CrisisChoice[];
};

export type PhysicalDashboard = {
  gauges: SurvivalGauge[];
  nodes: CommNode[];
  edges: CommEdge[];
  comm: CommRedundancy;
  ttr: TtrMetric;
  pokaYoke: { violations: number; steps: number; index: number; events: PokaYokeEvent[] };
  forks: CrisisFork[];
};

function gauge(
  id: string,
  label: string,
  remaining: number,
  target: number,
  unit: SurvivalGauge["unit"],
  hint: string,
  invert = false,
): SurvivalGauge {
  const band =
    id === "ttr" || invert
      ? survivalBand(target, remaining)
      : unit === "%"
        ? survivalBand(remaining, 100)
        : survivalBand(remaining, target);
  const display =
    unit === "óra" ? formatDuration(remaining) : unit === "nap" ? formatDuration(remaining * 24) : `${Math.round(remaining)}${unit === "%" ? "%" : ` ${unit}`}`;
  return { id, label, remaining, target, unit, display, band, hint };
}

function defaultNodes(kind: "bcp" | "community" | "household" | "campus" | "cyber" | "lean" | "hospital" | "wms" | "supply"): { nodes: CommNode[]; edges: CommEdge[] } {
  if (kind === "household") {
    const nodes: CommNode[] = [
      { id: "home", label: "Lakás", kind: "home", x: 50, y: 42, up: true, links: ["mesh", "analog"] },
      { id: "inv", label: "Inverter", kind: "repeater", x: 22, y: 68, up: true, links: ["mesh"] },
      { id: "nb", label: "Szomszéd", kind: "unit", x: 78, y: 70, up: true, links: ["analog"] },
    ];
    return {
      nodes,
      edges: [
        { from: "home", to: "inv", kind: "mesh", up: true },
        { from: "home", to: "nb", kind: "analog", up: true },
      ],
    };
  }
  if (kind === "community") {
    const nodes: CommNode[] = [
      { id: "hq", label: "Közösségi pont", kind: "hq", x: 50, y: 18, up: true, links: ["lora", "analog"] },
      { id: "dep", label: "Raktár / lajtos", kind: "depot", x: 18, y: 48, up: true, links: ["lora"] },
      { id: "rep1", label: "Átjátszó É", kind: "repeater", x: 78, y: 36, up: true, links: ["lora", "mesh"] },
      { id: "u1", label: "Egység A", kind: "unit", x: 32, y: 78, up: true, links: ["mesh"] },
      { id: "u2", label: "Egység B", kind: "unit", x: 70, y: 80, up: false, links: ["mesh"] },
    ];
    return {
      nodes,
      edges: [
        { from: "hq", to: "dep", kind: "lora", up: true },
        { from: "hq", to: "rep1", kind: "lora", up: true },
        { from: "rep1", to: "u2", kind: "mesh", up: false },
        { from: "dep", to: "u1", kind: "mesh", up: true },
      ],
    };
  }
  if (kind === "campus" || kind === "cyber") {
    const nodes: CommNode[] = [
      { id: "hq", label: kind === "cyber" ? "Kar / admin" : "Campus HQ", kind: "hq", x: 50, y: 16, up: true, links: ["internet", "analog"] },
      { id: "lab", label: kind === "cyber" ? "Tanszéki szerver" : "Elosztó", kind: "depot", x: 22, y: 48, up: kind !== "cyber", links: ["internet"] },
      { id: "dorm", label: kind === "cyber" ? "Vizsgaterem" : "Kollégium", kind: "unit", x: 78, y: 46, up: true, links: ["analog", "mesh"] },
      { id: "rep", label: "Local-first node", kind: "repeater", x: 50, y: 78, up: true, links: ["mesh"] },
    ];
    return {
      nodes,
      edges: [
        { from: "hq", to: "lab", kind: "internet", up: kind !== "cyber" },
        { from: "hq", to: "dorm", kind: "analog", up: true },
        { from: "dorm", to: "rep", kind: "mesh", up: true },
      ],
    };
  }
  if (kind === "hospital") {
    const nodes: CommNode[] = [
      { id: "hq", label: "Üzemeltetés", kind: "hq", x: 50, y: 14, up: true, links: ["analog", "mesh"] },
      { id: "icu", label: "ICU", kind: "unit", x: 18, y: 48, up: true, links: ["analog"] },
      { id: "or", label: "Műtő", kind: "unit", x: 50, y: 52, up: true, links: ["analog"] },
      { id: "nicu", label: "NICU", kind: "unit", x: 82, y: 48, up: true, links: ["analog"] },
      { id: "gen", label: "Aggregátor", kind: "depot", x: 50, y: 82, up: true, links: ["mesh"] },
    ];
    return {
      nodes,
      edges: [
        { from: "hq", to: "icu", kind: "analog", up: true },
        { from: "hq", to: "or", kind: "analog", up: true },
        { from: "hq", to: "nicu", kind: "analog", up: true },
        { from: "hq", to: "gen", kind: "mesh", up: true },
      ],
    };
  }
  if (kind === "wms") {
    const nodes: CommNode[] = [
      { id: "hq", label: "Diszpécser", kind: "hq", x: 50, y: 16, up: true, links: ["analog"] },
      { id: "wms", label: "WMS szerver", kind: "depot", x: 20, y: 48, up: false, links: ["internet"] },
      { id: "dock", label: "Dokk", kind: "unit", x: 78, y: 48, up: true, links: ["analog", "mesh"] },
      { id: "scan", label: "Vonalkód BCP", kind: "repeater", x: 50, y: 80, up: true, links: ["mesh"] },
    ];
    return {
      nodes,
      edges: [
        { from: "hq", to: "wms", kind: "internet", up: false },
        { from: "hq", to: "dock", kind: "analog", up: true },
        { from: "dock", to: "scan", kind: "mesh", up: true },
      ],
    };
  }
  if (kind === "supply") {
    const nodes: CommNode[] = [
      { id: "hq", label: "Sorvezető", kind: "hq", x: 50, y: 18, up: true, links: ["analog"] },
      { id: "a", label: "Sor A", kind: "unit", x: 20, y: 62, up: true, links: ["analog"] },
      { id: "b", label: "Sor B — kieső alkatrész", kind: "unit", x: 80, y: 62, up: false, links: ["analog"] },
      { id: "alt", label: "Helyettesítő / SMED", kind: "depot", x: 50, y: 82, up: true, links: ["analog"] },
    ];
    return {
      nodes,
      edges: [
        { from: "hq", to: "a", kind: "analog", up: true },
        { from: "hq", to: "b", kind: "analog", up: false },
        { from: "hq", to: "alt", kind: "analog", up: true },
      ],
    };
  }
  if (kind === "lean") {
    const nodes: CommNode[] = [
      { id: "hq", label: "Sorvezető", kind: "hq", x: 50, y: 20, up: true, links: ["analog"] },
      { id: "a", label: "Állomás A", kind: "unit", x: 22, y: 62, up: true, links: ["analog"] },
      { id: "b", label: "Állomás B", kind: "unit", x: 78, y: 62, up: true, links: ["analog"] },
    ];
    return {
      nodes,
      edges: [
        { from: "hq", to: "a", kind: "analog", up: true },
        { from: "hq", to: "b", kind: "analog", up: true },
      ],
    };
  }
  const nodes: CommNode[] = [
    { id: "hq", label: "Üzem HQ", kind: "hq", x: 50, y: 16, up: true, links: ["mesh"] },
    { id: "db", label: "Local-first DB", kind: "depot", x: 20, y: 52, up: true, links: ["mesh"] },
    { id: "isp", label: "Tartalék ISP", kind: "repeater", x: 80, y: 40, up: true, links: ["internet"] },
    { id: "wh", label: "Raktár", kind: "depot", x: 36, y: 82, up: true, links: ["analog", "mesh"] },
    { id: "cloud", label: "Felhő / SaaS", kind: "unit", x: 78, y: 78, up: false, links: ["internet"] },
  ];
  return {
    nodes,
    edges: [
      { from: "hq", to: "db", kind: "mesh", up: true },
      { from: "hq", to: "isp", kind: "internet", up: true },
      { from: "db", to: "wh", kind: "mesh", up: true },
      { from: "isp", to: "cloud", kind: "internet", up: false },
    ],
  };
}

function forksFor(kind: string): CrisisFork[] {
  if (kind === "household") {
    return [
      {
        id: "gen",
        hour: 6,
        question: "Indítjuk a generátort, vagy spórolunk a terhelésen?",
        choices: [
          { id: "run", label: "Generátor", tone: "opt", effect: "Terhelés tartva, üzemanyag fogy.", energyDeltaHours: 18, runwayDeltaHours: -8 },
          { id: "shed", label: "Terhelésvágás", tone: "real", effect: "Csak létfontosságú kör. Energia tovább visz.", energyDeltaHours: 10 },
          { id: "wait", label: "Várunk a hálózatra", tone: "pess", effect: "Akkumulátor fogy, TTR nő.", energyDeltaHours: -8, ttrDeltaHours: 12 },
        ],
      },
    ];
  }
  if (kind === "community") {
    return [
      {
        id: "water",
        hour: 12,
        question: "Lajtoskocsi a raktárhoz, vagy mesh a szélekre?",
        choices: [
          { id: "truck", label: "Lajtos a raktárra", tone: "opt", effect: "Ivóvíz-runway nő. Lefedettség stagnál.", runwayDeltaHours: 18 },
          { id: "mesh", label: "Átjátszó a szélre", tone: "real", effect: "LoRa lefedettség nő, víz üteme lassabb.", energyDeltaHours: 4 },
          { id: "hold", label: "Tartjuk a központot", tone: "pess", effect: "Egység B marad sötétben.", ttrDeltaHours: 16, errorDelta: 1 },
        ],
      },
    ];
  }
  if (kind === "campus") {
    return [
      {
        id: "cool",
        hour: 8,
        question: "Passzív hűtés, vagy kvóta a klímára?",
        choices: [
          { id: "passive", label: "Passzív hűtés", tone: "opt", effect: "Kvóta tart. Túlterhelés esik.", energyDeltaHours: 12 },
          { id: "quota", label: "Kvóta + sáv", tone: "real", effect: "Kollégiumok osztoznak. Rezsi nő kicsit.", energyDeltaHours: 4 },
          { id: "ac", label: "Klíma csúcsban", tone: "pess", effect: "Hálózat túlterhel. Poka-Yoke sérül.", energyDeltaHours: -10, errorDelta: 2 },
        ],
      },
    ];
  }
  if (kind === "cyber") {
    return [
      {
        id: "iso",
        hour: 1,
        question: "Izoláljuk a tanszéket, vagy próbáljuk a helyreállítást élőn?",
        choices: [
          { id: "cut", label: "Izoláció + analóg", tone: "opt", effect: "TTR rövid. Vizsga papíron megy.", ttrDeltaHours: -2, errorDelta: 0 },
          { id: "hybrid", label: "Szegmens + backup", tone: "real", effect: "Local-first élesítés 4 óra.", ttrDeltaHours: 0 },
          { id: "live", label: "Élő helyreállás", tone: "pess", effect: "Terjedés. Poka-Yoke sérül.", ttrDeltaHours: 14, errorDelta: 3 },
        ],
      },
    ];
  }
  if (kind === "hospital") {
    return [
      {
        id: "triage",
        hour: 1,
        question: "A dízel a létfontosságú körre megy, vagy mindent tartunk?",
        choices: [
          { id: "vital", label: "ICU + NICU először", tone: "opt", effect: "Lean triázs. A ward leosztva. Runway nő.", energyDeltaHours: 6, runwayDeltaHours: 8 },
          { id: "share", label: "Arányos osztás", tone: "real", effect: "Minden osztály kap kevesebbet.", energyDeltaHours: 0 },
          { id: "all", label: "Minden kör él", tone: "pess", effect: "A generátor túlterhel. UPS fogy.", energyDeltaHours: -6, ttrDeltaHours: 8, errorDelta: 2 },
        ],
      },
    ];
  }
  if (kind === "wms") {
    return [
      {
        id: "dock",
        hour: 2,
        question: "Papír-BCP a dokkon, vagy vársz a WMS-re?",
        choices: [
          { id: "paper", label: "Vonalkód + papír", tone: "opt", effect: "Lead time ×1,6. A dokk forog.", ttrDeltaHours: -2 },
          { id: "hybrid", label: "Csak indítás kézzel", tone: "real", effect: "Lassabb, nem áll.", ttrDeltaHours: 4 },
          { id: "wait", label: "Várunk a szerverre", tone: "pess", effect: "Torlódás. TTR nő.", ttrDeltaHours: 16, errorDelta: 2 },
        ],
      },
    ];
  }
  if (kind === "supply") {
    return [
      {
        id: "alt",
        hour: 3,
        question: "SMED a helyettesítőre, vagy áll a sor?",
        choices: [
          { id: "smed", label: "Helyettesítő + SMED", tone: "opt", effect: "OEE lyuk rövid. Poka zár.", ttrDeltaHours: -2, errorDelta: -1 },
          { id: "hold", label: "Sorállás", tone: "real", effect: "Nincs selejt, nincs kihozatal.", ttrDeltaHours: 6 },
          { id: "push", label: "Hajtás audit nélkül", tone: "pess", effect: "Rejtett hiba. Hibaindex nő.", errorDelta: 3, ttrDeltaHours: 2 },
        ],
      },
    ];
  }
  if (kind === "lean") {
    return [
      {
        id: "smed",
        hour: 2,
        question: "SMED most, vagy hajtjuk a sort Poka-Yoke nélkül?",
        choices: [
          { id: "smed", label: "SMED + Poka-Yoke", tone: "opt", effect: "Átállás rövid. Hibaindex esik.", errorDelta: -2, ttrDeltaHours: -1 },
          { id: "mix", label: "Részleges korlát", tone: "real", effect: "3 próba-pont. Selejthányad közepes.", errorDelta: 0 },
          { id: "push", label: "Hajtás korlát nélkül", tone: "pess", effect: "Utólagos selejt. Hibaindex nő.", errorDelta: 3, ttrDeltaHours: 4 },
        ],
      },
    ];
  }
  return [
    {
      id: "fail",
      hour: 2,
      question: "Redundáns link, local-first, vagy manuális P2P?",
      choices: [
        { id: "link", label: "Tartalék link", tone: "opt", effect: "Fail-over. TTR percben.", ttrDeltaHours: -2, energyDeltaHours: 6 },
        { id: "local", label: "Local-first másolat", tone: "real", effect: "Élesítés ~3 óra. Raktár él.", ttrDeltaHours: 0 },
        { id: "p2p", label: "Manuális P2P", tone: "pess", effect: "Egyetlen út. TTR 36 óra.", ttrDeltaHours: 18, errorDelta: 2 },
      ],
    },
  ];
}

function pokaEvents(kind: string): PokaYokeEvent[] {
  if (kind === "hospital") {
    return [
      { step: 1, label: "ICU kör UPS-teszt 30 napon belül", violated: false },
      { step: 2, label: "NICU aggregátor-prioritás", violated: false },
      { step: 3, label: "Általános klíma a dízelkörön", violated: true },
      { step: 4, label: "Üzemanyag-szint riasztás", violated: false },
    ];
  }
  if (kind === "wms") {
    return [
      { step: 1, label: "Papír komissió-sablon a dokkon", violated: false },
      { step: 2, label: "Vonalkód-olvasó töltve", violated: false },
      { step: 3, label: "Indítás csak WMS-ből", violated: true },
      { step: 4, label: "Dokk-sorrend tábla", violated: false },
    ];
  }
  if (kind === "lean") {
    return [
      { step: 1, label: "Átállás előtti checklista", violated: false },
      { step: 2, label: "Hibás alkatrész-retesz", violated: false },
      { step: 3, label: "Sorindítás interlock nélkül", violated: true },
      { step: 4, label: "Selejtszűrő a kimeneten", violated: false },
      { step: 5, label: "Utólagos javítás a soron", violated: true },
    ];
  }
  if (kind === "cyber") {
    return [
      { step: 1, label: "Szegmens leválasztás 15 percen belül", violated: false },
      { step: 2, label: "Offline vizsga-sablon", violated: false },
      { step: 3, label: "Élő hálózat a fertőzött gépen", violated: true },
      { step: 4, label: "Napi local-first másolat", violated: false },
    ];
  }
  return [
    { step: 1, label: "Tartalék link próba", violated: false },
    { step: 2, label: "Manuális raktárjegyzék", violated: false },
    { step: 3, label: "Egyetlen felhő-függő számla", violated: true },
    { step: 4, label: "UPS teszt 90 napnál régebbi", violated: true },
  ];
}

export function applyCrisisChoice(dash: PhysicalDashboard, choice: CrisisChoice): PhysicalDashboard {
  const nextGauges = dash.gauges.map((g) => {
    let remaining = g.remaining;
    if (g.id.startsWith("runway") && choice.runwayDeltaHours) remaining += choice.runwayDeltaHours;
    if (g.id.startsWith("energy") && choice.energyDeltaHours) remaining += choice.energyDeltaHours;
    if (g.id === "ttr" && choice.ttrDeltaHours) remaining = Math.max(0.1, remaining + choice.ttrDeltaHours);
    if (g.id === "poka" && choice.errorDelta) remaining = Math.max(0, remaining + choice.errorDelta);
    if (g.id === "comm" && choice.tone === "pess") remaining = Math.max(0, remaining - 12);
    if (g.id === "comm" && choice.tone === "opt") remaining = Math.min(100, remaining + 8);
    remaining = Math.max(0, remaining);
    return gauge(g.id, g.label, remaining, g.target, g.unit, g.hint);
  });
  const ttrHours = Math.max(0.1, dash.ttr.hours + (choice.ttrDeltaHours ?? 0));
  const events = dash.pokaYoke.events.map((e, i) =>
    choice.errorDelta && choice.errorDelta > 0 && i === dash.pokaYoke.events.length - 1 ? { ...e, violated: true } : e,
  );
  return {
    ...dash,
    gauges: nextGauges,
    ttr: { ...dash.ttr, hours: ttrHours, band: survivalBand(dash.ttr.targetHours, ttrHours) },
    pokaYoke: { ...pokaYokeErrorIndex(events), events },
  };
}

export function buildPhysicalDashboard(
  segmentId: string | null | undefined,
  baseline?: MasterBaselineContext | null,
): PhysicalDashboard | null {
  const ctx = baseline ?? baselineForSegment(segmentId);
  const head = Math.max(1, ctx.headcount || 1);

  if (isResilienceSegment(segmentId)) {
    return dashboardForResilience(segmentId, ctx, head);
  }
  if (isEducationSegment(segmentId)) {
    return dashboardForEducation(segmentId, ctx, head);
  }
  if (isIndustrySegment(segmentId)) {
    return dashboardForIndustry(segmentId, ctx, head);
  }
  return null;
}

function dashboardForResilience(id: ResilienceCaseId, ctx: MasterBaselineContext, head: number): PhysicalDashboard {
  if (id === "demo14_resilience_demography") {
    const events = pokaEvents("bcp");
    return {
      gauges: [],
      nodes: [],
      edges: [],
      comm: communicationRedundancy([]),
      ttr: { hours: 24, targetHours: 12, process: "TFR-pálya felülvizsgálat (év, nem óra)", band: "yellow" },
      pokaYoke: { ...pokaYokeErrorIndex(events), events },
      forks: [],
    };
  }
  if (id === "demo13_resilience_home_blackout") {
    const waterL = ctx.startingResources.waterLiters ?? 48;
    const foodDays = ctx.startingResources.stockDays ?? 5;
    const batteryWh = (ctx.startingResources.energyKwh ?? 5.2) * 1000;
    const waterH = resourceRunwayHours({ stock: waterL, headcount: head, perPersonPerDay: WATER_L_PER_PERSON_DAY });
    const foodH = foodDays * 24;
    const energyH = energyAutonomyHours({ batteryWh, solarW: 280, loadW: 220 });
    const topo = defaultNodes("household");
    const comm = communicationRedundancy(topo.nodes);
    const events = pokaEvents("household");
    const poka = pokaYokeErrorIndex(events);
    const ttrH = 48;
    return {
      gauges: [
        gauge("runway-water", "Ivóvíz-runway", waterH, 72, "óra", "Készlet / (létszám × 3 L/nap)."),
        gauge("runway-food", "Élelmiszer-runway", foodH, 120, "óra", "Racionális készlet a háztartási logisztikában."),
        gauge("energy", "Energetikai önállóság", energyH, 72, "óra", "Akkumulátor Wh / (terhelés − napelem)."),
        gauge("comm", "Kommunikációs lefedettség", comm.coveragePct, 100, "%", "Aktív csomópont × linktípus."),
        gauge("ttr", "TTR — hálózati visszatérés", ttrH, 24, "óra", "72 órás kiesés a pesszimista felső szél."),
        gauge("poka", "Poka-Yoke hibaindex", poka.index, 20, "%", "Korlát-sértés a szimulációs lépéseken."),
      ],
      ...topo,
      comm,
      ttr: { hours: ttrH, targetHours: 24, process: "Hálózati visszatérés / létfontosságú kör", band: survivalBand(24, ttrH) },
      pokaYoke: { ...poka, events },
      forks: forksFor("household"),
    };
  }
  if (id === "demo12_resilience_community_grid") {
    const waterL = ctx.startingResources.waterLiters ?? 4_800;
    const waterH = resourceRunwayHours({ stock: waterL, headcount: head, perPersonPerDay: WATER_L_PER_PERSON_DAY });
    const energyH = energyAutonomyHours({
      batteryWh: (ctx.startingResources.energyKwh ?? 42) * 1000,
      solarW: 1200,
      loadW: 2400,
    });
    const topo = defaultNodes("community");
    const comm = communicationRedundancy(topo.nodes);
    const events = pokaEvents("community");
    const poka = pokaYokeErrorIndex(events);
    const ttrH = 30;
    return {
      gauges: [
        gauge("runway-water", "Ivóvíz-runway", waterH, 72, "óra", "Lajtoskocsi + háztartási tartalék, létszámra vetítve."),
        gauge("runway-fuel", "Üzemanyag-runway", resourceRunwayHours({ stock: 180, headcount: Math.min(head, 12), perPersonPerDay: FUEL_L_PER_PERSON_DAY }), 48, "óra", "Generátor + lajtos."),
        gauge("energy", "Energetikai önállóság", energyH, 72, "óra", "Közösségi telep vs. terhelés."),
        gauge("comm", "LoRa / mesh lefedettség", comm.coveragePct, 100, "%", "Aktív átjátszó és egység."),
        gauge("ttr", "TTR — víz + hálózat", ttrH, 12, "óra", "Mikor tér vissza a vezetékes szolgáltatás."),
        gauge("poka", "Poka-Yoke hibaindex", poka.index, 20, "%", "Protokoll-sértés a 72 órán."),
      ],
      ...topo,
      comm,
      ttr: { hours: ttrH, targetHours: 12, process: "Víz + áram helyreállás", band: survivalBand(12, ttrH) },
      pokaYoke: { ...poka, events },
      forks: forksFor("community"),
    };
  }
  const energyH = energyAutonomyHours({ batteryWh: 8_000, solarW: 0, loadW: 900 });
  const topo = defaultNodes("bcp");
  const comm = communicationRedundancy(topo.nodes);
  const events = pokaEvents("bcp");
  const poka = pokaYokeErrorIndex(events);
  const ttrH = 3;
  return {
    gauges: [
      gauge("runway-ops", "Működési runway", 36, 72, "óra", "Local-first + tartalék link viszi a kritikus folyamatot."),
      gauge("energy", "UPS / EnergyAutonomy", energyH, 18, "óra", "Telephelyi szünetmentes a helyi node-on."),
      gauge("comm", "Kommunikációs redundancia", comm.coveragePct, 100, "%", "Mesh, tartalék ISP, kiesett felhő."),
      gauge("ttr", "TTR — offline számla / raktár", ttrH, 4, "óra", "Manuális raktározás vagy offline számlázás élesítése."),
      gauge("poka", "Poka-Yoke hibaindex", poka.index, 20, "%", "Felhő-függő lépés a protokollban."),
    ],
    ...topo,
    comm,
    ttr: { hours: ttrH, targetHours: 4, process: "Offline számlázás / manuális raktár", band: survivalBand(4, ttrH) },
    pokaYoke: { ...poka, events },
    forks: forksFor("bcp"),
  };
}

function dashboardForEducation(id: EducationCaseId, ctx: MasterBaselineContext, head: number): PhysicalDashboard | null {
  if (id === "demo15_edu_startup_cashflow") return null;
  if (id === "demo16_edu_lean_vsm") {
    const topo = defaultNodes("lean");
    const comm = communicationRedundancy(topo.nodes);
    const events = pokaEvents("lean");
    const poka = pokaYokeErrorIndex(events);
    return {
      gauges: [
        gauge("poka", "Poka-Yoke hibaindex", poka.index, 15, "%", "Korlát-sértés a tanműhely lépésein."),
        gauge("ttr", "Átállási TTR", 0.6, 0.3, "óra", "SMED: belső/külső átállás."),
        gauge("comm", "Sor-kommunikáció", comm.coveragePct, 100, "%", "Állomások elérhetősége."),
      ],
      ...topo,
      comm,
      ttr: { hours: 0.6, targetHours: 0.3, process: "SMED átszerszámozás", band: survivalBand(0.3, 0.6) },
      pokaYoke: { ...poka, events },
      forks: forksFor("lean"),
    };
  }
  if (id === "demo17_edu_campus_energy") {
    const batteryWh = (ctx.startingResources.energyKwh ?? 1_860) * 1000;
    const energyH = energyAutonomyHours({ batteryWh, solarW: 400, loadW: 6_200 });
    const topo = defaultNodes("campus");
    const comm = communicationRedundancy(topo.nodes);
    const events = pokaEvents("campus");
    const poka = pokaYokeErrorIndex(events);
    return {
      gauges: [
        gauge("energy", "Kvóta / EnergyAutonomy", energyH, 48, "óra", "Campus telep vs. hőhullám-terhelés."),
        gauge("runway-water", "Ivóvíz-runway (kollégium)", resourceRunwayHours({ stock: 2_400, headcount: Math.min(head, 80), perPersonPerDay: WATER_L_PER_PERSON_DAY }), 48, "óra", "Létszámra vetített tartalék."),
        gauge("comm", "Campus mesh", comm.coveragePct, 100, "%", "HQ, elosztó, kollégium."),
        gauge("poka", "Poka-Yoke hibaindex", poka.index, 20, "%", "Kvóta-sértés a klímán."),
      ],
      ...topo,
      comm,
      ttr: { hours: 10, targetHours: 6, process: "Kvóta-visszaállítás", band: "yellow" },
      pokaYoke: { ...poka, events },
      forks: forksFor("campus"),
    };
  }
  const topo = defaultNodes("cyber");
  const comm = communicationRedundancy(topo.nodes);
  const events = pokaEvents("cyber");
  const poka = pokaYokeErrorIndex(events);
  const ttrH = 4;
  return {
    gauges: [
      gauge("ttr", "TTR — izoláció", ttrH, 4, "óra", "Tanszéki szegmens leválasztása."),
      gauge("comm", "Kommunikációs redundancia", comm.coveragePct, 100, "%", "Analóg vizsga + local-first."),
      gauge("poka", "Poka-Yoke hibaindex", poka.index, 15, "%", "Élő hálózat a fertőzött gépen."),
    ],
    ...topo,
    comm,
    ttr: { hours: ttrH, targetHours: 4, process: "Izoláció + analóg vizsga", band: survivalBand(4, ttrH) },
    pokaYoke: { ...poka, events },
    forks: forksFor("cyber"),
  };
}

function dashboardForIndustry(id: IndustryCaseId, ctx: MasterBaselineContext, head: number): PhysicalDashboard | null {
  const kind = industryCaseById(id).kind;
  if (kind === "fuel" || kind === "tax") return null;
  if (kind === "hospital") {
    const energyH = energyAutonomyHours({
      batteryWh: (ctx.startingResources.energyKwh ?? 420) * 1000,
      solarW: 0,
      loadW: 48_000,
    });
    const fuelH = resourceRunwayHours({ stock: 380, headcount: Math.min(head, 8), perPersonPerDay: FUEL_L_PER_PERSON_DAY });
    const topo = defaultNodes("hospital");
    const comm = communicationRedundancy(topo.nodes);
    const events = pokaEvents("hospital");
    const poka = pokaYokeErrorIndex(events);
    return {
      gauges: [
        gauge("energy", "UPS / aggregátor", energyH, 12, "óra", "Dízel + szünetmentes a létfontosságú körön."),
        gauge("runway-fuel", "Dízel-runway", fuelH, 12, "óra", "Tartály / (aggregátor-fogyasztás)."),
        gauge("comm", "Osztály-kommunikáció", comm.coveragePct, 100, "%", "ICU, műtő, NICU, üzemeltetés."),
        gauge("ttr", "TTR — hálózati visszatérés", 18, 8, "óra", "Mikor jön vissza a külső áram."),
        gauge("poka", "Triázs / Poka-Yoke", poka.index, 15, "%", "Létfontosságú kör vágása tilos."),
      ],
      ...topo,
      comm,
      ttr: { hours: 18, targetHours: 8, process: "Hálózati visszatérés", band: survivalBand(8, 18) },
      pokaYoke: { ...poka, events },
      forks: forksFor("hospital"),
    };
  }
  if (kind === "wms") {
    const topo = defaultNodes("wms");
    const comm = communicationRedundancy(topo.nodes);
    const events = pokaEvents("wms");
    const poka = pokaYokeErrorIndex(events);
    return {
      gauges: [
        gauge("ttr", "Lead time / TTR", 6, 3, "óra", "Manuális komissiózás vs. WMS."),
        gauge("comm", "Dokk-kommunikáció", comm.coveragePct, 100, "%", "WMS sötét, vonalkód BCP él."),
        gauge("runway-ops", "Dokk-runway", 10, 16, "óra", "Meddig forog a fizikai sor torlódás nélkül."),
        gauge("poka", "Poka-Yoke hibaindex", poka.index, 20, "%", "Digitális-függő lépés a BCP-ben."),
      ],
      ...topo,
      comm,
      ttr: { hours: 6, targetHours: 3, process: "Papír / vonalkód komissiózás", band: survivalBand(3, 6) },
      pokaYoke: { ...poka, events },
      forks: forksFor("wms"),
    };
  }
  if (kind === "supply" || kind === "quality") {
    const topo = defaultNodes("supply");
    const comm = communicationRedundancy(topo.nodes);
    const events = pokaEvents("lean");
    const poka = pokaYokeErrorIndex(events);
    return {
      gauges: [
        gauge("ttr", kind === "supply" ? "SMED / átállás" : "Tétel-elhatárolás", kind === "supply" ? 6 : 4, 2, "óra", kind === "supply" ? "Helyettesítő anyag átállása." : "Hibás tétel zárása."),
        gauge("poka", "Poka-Yoke hibaindex", poka.index, 15, "%", "Sorindítás interlock / selejtszűrő."),
        gauge("comm", "Sor-kommunikáció", comm.coveragePct, 100, "%", "Álló sor B a kieső alkatrészen."),
      ],
      ...topo,
      comm,
      ttr: { hours: kind === "supply" ? 6 : 4, targetHours: 2, process: kind === "supply" ? "SMED helyettesítő" : "Tételzár + gyökérok", band: "yellow" },
      pokaYoke: { ...poka, events },
      forks: forksFor(kind === "supply" ? "supply" : "lean"),
    };
  }
  const topo = defaultNodes("bcp");
  const comm = communicationRedundancy(topo.nodes);
  const events = pokaEvents("bcp");
  const poka = pokaYokeErrorIndex(events);
  return {
    gauges: [
      gauge("ttr", "TTR — local-first", 10, 4, "óra", "SaaS helyett saját gép."),
      gauge("comm", "Kommunikációs redundancia", comm.coveragePct, 100, "%", "Felhő kiesett, mesh + analog él."),
      gauge("runway-ops", "Működési runway", 28, 72, "óra", "Meddig viszi a helyi másolat."),
      gauge("poka", "Poka-Yoke hibaindex", poka.index, 20, "%", "Felhő-függő lépés a protokollban."),
    ],
    ...topo,
    comm,
    ttr: { hours: 10, targetHours: 4, process: "Local-first élesítés", band: survivalBand(4, 10) },
    pokaYoke: { ...poka, events },
    forks: forksFor("bcp"),
  };
}

export const COMM_LINK_LABEL: Record<CommLinkKind, string> = {
  mesh: "Mesh",
  lora: "LoRa",
  analog: "Analóg rádió",
  internet: "Internet",
};

export const NODE_KIND_LABEL: Record<MeshNodeKind, string> = {
  unit: "Egység",
  depot: "Raktár",
  repeater: "Átjátszó",
  hq: "Központ",
  home: "Háztartás",
};
