import { decryptJSON, encryptJSON, importRawKey } from "@/lib/crypto";
import { localdb } from "@/lib/localdb";
import type { CustomSettings, Transaction, WorkspaceMeta } from "@/lib/finance";
import { EMPTY_SETTINGS } from "@/lib/finance";
import { inheritMasterBaseline, MASTER_BASELINE } from "@/lib/masterBaseline";
import { baselineForSegment } from "@/lib/scenarioSurface";
import { DEMO_PASSWORD, HOSPITALITY_SEGMENTS, type DemoSegmentId } from "@/lib/demoCatalog";
import {
  EDUCATION_SEGMENTS,
  educationCaseById,
  educationSurface,
  isEducationSegment,
} from "@/lib/educationCases";
import {
  INDUSTRY_SEGMENTS,
  industryCaseById,
  industrySurface,
  isIndustrySegment,
} from "@/lib/industryCases";
import {
  isResilienceSegment,
  RESILIENCE_SEGMENTS,
  resilienceCaseById,
  resilienceSurface,
} from "@/lib/resilienceCases";
import {
  isKahnForkSegment,
  isStrategySegment,
  KAHN_FORK,
  kahnReserveTargetHuf,
  STRATEGY_SEGMENTS,
  strategyCaseById,
  strategySurface,
} from "@/lib/strategyCases";

export { DEMO_PASSWORD, type DemoSegmentId };

const VAULT_SESSION_KEY = "vault:key:v2";

export const DEMO_GENERATED_TAG = "generated:test";

export const DEMO_SEGMENTS: Array<{
  id: DemoSegmentId;
  name: string;
  title: string;
  blurb: string;
  lead: string;
  baseRevenueNetHuf: number;
}> = [...HOSPITALITY_SEGMENTS, ...STRATEGY_SEGMENTS, ...RESILIENCE_SEGMENTS, ...EDUCATION_SEGMENTS, ...INDUSTRY_SEGMENTS];

/** Visitor-facing names + törzsadat per economic case (not the generic Vállalkozás2/Projekt2 shells). */
export function caseSurface(segmentId: DemoSegmentId): {
  businessAlias: string;
  projectAlias: string;
  partners: Array<{ id: string; kind: string; name: string; tax_id: string | null; payment_term_days: number | null; note: string }>;
  duties: Array<{ id: string; name: string; cadence: string; fixed_cost_huf: number }>;
} {
  const p = (key: string) => `p:${segmentId}:${key}`;
  const d = (key: string) => `d:${segmentId}:${key}`;
  if (isStrategySegment(segmentId)) return strategySurface(segmentId);
  if (isResilienceSegment(segmentId)) return resilienceSurface(segmentId);
  if (isEducationSegment(segmentId)) return educationSurface(segmentId);
  if (isIndustrySegment(segmentId)) return industrySurface(segmentId);
  if (segmentId === "demo1_multisite_operator") {
    return {
      businessAlias: "Lánc / multi-site",
      projectAlias: "Központi beszerzés",
      partners: [
        { id: p("cust"), kind: "customer", name: "Egységek (belső elszámolás)", tax_id: null, payment_term_days: 7, note: "Több egység összesített forgalma." },
        { id: p("sup"), kind: "supplier", name: "Központi nagyker", tax_id: "11112222-2-42", payment_term_days: 21, note: "Láncbeszerzés." },
        { id: p("log"), kind: "supplier", name: "Központi logisztika", tax_id: "33334444-2-13", payment_term_days: 14, note: "Ellátás az egységek felé." },
        { id: p("auth"), kind: "authority", name: "Hatóság / láncengedély", tax_id: null, payment_term_days: null, note: "Több telephely admin." },
      ],
      duties: [
        { id: d("haccp"), name: "HACCP — lánc kör", cadence: "negyedéves", fixed_cost_huf: 95_000 },
        { id: d("audit"), name: "Belső audit (több egység)", cadence: "éves", fixed_cost_huf: 420_000 },
        { id: d("lab"), name: "Labor — mintavétel egységenként", cadence: "féléves", fixed_cost_huf: 260_000 },
      ],
    };
  }
  if (segmentId === "demo2_premium_nightlife") {
    return {
      businessAlias: "Éjszakai bár",
      projectAlias: "Szezonmodell",
      partners: [
        { id: p("cust"), kind: "customer", name: "Vendégforgalom (éjszaka)", tax_id: null, payment_term_days: 0, note: "Kártya / készpénz, hétvégi csúcs." },
        { id: p("sup"), kind: "supplier", name: "Italnagyker / import", tax_id: "22223333-2-42", payment_term_days: 14, note: "Prémium palack." },
        { id: p("sec"), kind: "supplier", name: "Biztonság / hostess", tax_id: "55556666-2-13", payment_term_days: 8, note: "Hétvégi műszak." },
        { id: p("auth"), kind: "authority", name: "Szórakoztatóhely engedély", tax_id: null, payment_term_days: null, note: "Nyitvatartás, zaj." },
      ],
      duties: [
        { id: d("haccp"), name: "HACCP — bár", cadence: "negyedéves", fixed_cost_huf: 55_000 },
        { id: d("sec"), name: "Biztonsági szemle", cadence: "éves", fixed_cost_huf: 180_000 },
        { id: d("lic"), name: "Szórakoztatóengedély", cadence: "éves", fixed_cost_huf: 240_000 },
      ],
    };
  }
  if (segmentId === "demo3_specialty_cafe_tea") {
    return {
      businessAlias: "Specialty kávézó",
      projectAlias: "Új italprofil",
      partners: [
        { id: p("cust"), kind: "customer", name: "Nappali vendégkosár", tax_id: null, payment_term_days: 0, note: "Kávé / tea, helyben." },
        { id: p("sup"), kind: "supplier", name: "Pörkölő / teaimport", tax_id: "12121212-2-42", payment_term_days: 14, note: "Bab és tea." },
        { id: p("bak"), kind: "supplier", name: "Péksütemény", tax_id: "34343434-2-13", payment_term_days: 7, note: "Napi beszállítás." },
        { id: p("auth"), kind: "authority", name: "Vendéglátó engedély", tax_id: null, payment_term_days: null, note: "Egység admin." },
      ],
      duties: [
        { id: d("haccp"), name: "HACCP — kávézó", cadence: "negyedéves", fixed_cost_huf: 42_000 },
        { id: d("lab"), name: "Víz / allergén kontroll", cadence: "féléves", fixed_cost_huf: 90_000 },
        { id: d("lic"), name: "Működési engedély", cadence: "éves", fixed_cost_huf: 110_000 },
      ],
    };
  }
  if (segmentId === "demo4_fine_dining_bistro") {
    return {
      businessAlias: "Fine dining / bisztró",
      projectAlias: "Menüprojekt",
      partners: [
        { id: p("cust"), kind: "customer", name: "Asztalfoglalás / kártya", tax_id: null, payment_term_days: 0, note: "Esti forgalom." },
        { id: p("sup"), kind: "supplier", name: "Prémium alapanyag", tax_id: "56565656-2-42", payment_term_days: 10, note: "Napi piac + import." },
        { id: p("win"), kind: "supplier", name: "Bor / italkészlet", tax_id: "78787878-2-13", payment_term_days: 21, note: "Kártya." },
        { id: p("auth"), kind: "authority", name: "Étterem hatóság", tax_id: null, payment_term_days: null, note: "Audit, HACCP." },
      ],
      duties: [
        { id: d("haccp"), name: "HACCP — konyha", cadence: "negyedéves", fixed_cost_huf: 78_000 },
        { id: d("audit"), name: "Minőségi audit", cadence: "éves", fixed_cost_huf: 320_000 },
        { id: d("lab"), name: "Labor — ételminta", cadence: "féléves", fixed_cost_huf: 210_000 },
      ],
    };
  }
  if (segmentId === "demo5_pastry_gelato") {
    return {
      businessAlias: "Cukrászda / fagylalt",
      projectAlias: "Szezonhűtés",
      partners: [
        { id: p("cust"), kind: "customer", name: "Pult + elvitel", tax_id: null, payment_term_days: 0, note: "Szezonális kosár." },
        { id: p("sup"), kind: "supplier", name: "Cukrász alapanyag", tax_id: "90909090-2-42", payment_term_days: 14, note: "Liszt, tej, gyümölcs." },
        { id: p("cold"), kind: "supplier", name: "Hűtés / szerviz", tax_id: "10101010-2-13", payment_term_days: 15, note: "Vitrin, sokkoló." },
        { id: p("auth"), kind: "authority", name: "Élelmiszer hatóság", tax_id: null, payment_term_days: null, note: "Hűtési lánc." },
      ],
      duties: [
        { id: d("haccp"), name: "HACCP — cukrászat", cadence: "negyedéves", fixed_cost_huf: 48_000 },
        { id: d("cold"), name: "Hűtési lánc ellenőrzés", cadence: "féléves", fixed_cost_huf: 140_000 },
        { id: d("lab"), name: "Mikrobiológia (fagyi / krém)", cadence: "féléves", fixed_cost_huf: 160_000 },
      ],
    };
  }
  if (segmentId === "demo6_event_catering_popup") {
    return {
      businessAlias: "Catering / pop-up",
      projectAlias: "Eseményprojekt",
      partners: [
        { id: p("cust"), kind: "customer", name: "Esemény megrendelők", tax_id: null, payment_term_days: 14, note: "Számla, előleg." },
        { id: p("sup"), kind: "supplier", name: "Esemény alapanyag", tax_id: "20202020-2-42", payment_term_days: 7, note: "Tételre rendelés." },
        { id: p("log"), kind: "supplier", name: "Kiszállítás / berendezés", tax_id: "30303030-2-13", payment_term_days: 10, note: "Furgon, asztal." },
        { id: p("auth"), kind: "authority", name: "Rendezvényengedély", tax_id: null, payment_term_days: null, note: "Helyszín, HACCP." },
      ],
      duties: [
        { id: d("haccp"), name: "HACCP — mobil konyha", cadence: "negyedéves", fixed_cost_huf: 58_000 },
        { id: d("ins"), name: "Rendezvénybiztosítás", cadence: "éves", fixed_cost_huf: 190_000 },
        { id: d("lab"), name: "Helyszíni mintavétel", cadence: "éves", fixed_cost_huf: 120_000 },
      ],
    };
  }
  return {
    businessAlias: "Pilot vendéglátás",
    projectAlias: "Standard vs prémium",
    partners: [
      { id: p("cust"), kind: "customer", name: "Szezonális pult", tax_id: null, payment_term_days: 0, note: "Készpénz / kártya." },
      { id: p("sup"), kind: "supplier", name: "Kis nagyker", tax_id: "40404040-2-42", payment_term_days: 7, note: "Készlet a pultra." },
      { id: p("own"), kind: "supplier", name: "Magán zseb / tagi", tax_id: null, payment_term_days: null, note: "Induló tőke." },
      { id: p("auth"), kind: "authority", name: "Szezonális engedély", tax_id: null, payment_term_days: null, note: "Időszakos egység." },
    ],
    duties: [
      { id: d("haccp"), name: "HACCP — pult", cadence: "negyedéves", fixed_cost_huf: 36_000 },
      { id: d("lic"), name: "Időszakos működés", cadence: "éves", fixed_cost_huf: 85_000 },
    ],
  };
}

export const DEMO_GHOST_WORKSPACES = new Set(["Vállalkozás2", "Projekt2"]);

export function isDemoSegmentId(id: string | null | undefined): id is DemoSegmentId {
  return DEMO_SEGMENTS.some((s) => s.id === id);
}

function isLayeredCase(id: DemoSegmentId) {
  return isStrategySegment(id) || isResilienceSegment(id) || isEducationSegment(id) || isIndustrySegment(id);
}

export function segmentIdFromDemoName(name: string | null | undefined): DemoSegmentId | null {
  const n = String(name ?? "").trim();
  return DEMO_SEGMENTS.find((s) => s.name === n)?.id ?? null;
}

function newId(prefix = "demo"): string {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `${prefix}:${crypto.randomUUID()}`
    : `${prefix}:${Math.random().toString(36).slice(2)}:${Date.now().toString(36)}`;
}

function isoYmd(y: number, m1: number, d: number) {
  const mm = String(m1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function addMonths(y: number, m1: number, add: number): { y: number; m1: number } {
  const base = new Date(y, m1 - 1, 1);
  const next = new Date(base.getFullYear(), base.getMonth() + add, 1);
  return { y: next.getFullYear(), m1: next.getMonth() + 1 };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seasonFactor(seg: DemoSegmentId, month: number): number {
  // month: 1..12
  if (seg === "demo1_multisite_operator") {
    // multi-site: less seasonal, more stable, mild Q4 peak
    if ([11, 12].includes(month)) return 1.08;
    if ([1, 2].includes(month)) return 0.92;
    return 1.0;
  }
  if (seg === "demo2_premium_nightlife") {
    if ([6, 7, 8].includes(month)) return 1.22;
    if (month === 12) return 1.35;
    if ([1, 2].includes(month)) return 0.72;
    return 1.0;
  }
  if (seg === "demo3_specialty_cafe_tea") {
    if ([10, 11, 12].includes(month)) return 1.06;
    if ([7, 8].includes(month)) return 0.92;
    return 1.0;
  }
  if (seg === "demo4_fine_dining_bistro") {
    if ([11, 12].includes(month)) return 1.1;
    if ([1].includes(month)) return 0.9;
    return 1.0;
  }
  if (seg === "demo5_pastry_gelato") {
    if ([4, 5, 6, 7, 8, 9].includes(month)) return 1.55;
    if ([1, 2, 3].includes(month)) return 0.55;
    return 0.85;
  }
  if (seg === "demo6_event_catering_popup") {
    if ([5, 6, 7, 8, 9].includes(month)) return 1.35;
    if (month === 12) return 1.22;
    if ([1, 2].includes(month)) return 0.7;
    return 1.0;
  }
  if (seg === "demo7_personal_pocket_seasonal_pilot") {
    // pilot: erősen szezonális (tavasz-nyár csúcs), télen minimál
    if ([5, 6, 7, 8, 9].includes(month)) return 1.65;
    if ([3, 4, 10].includes(month)) return 1.15;
    if ([1, 2].includes(month)) return 0.55;
    if (month === 12) return 1.05;
    return 0.85;
  }
  if (isStrategySegment(seg)) {
    if ([11, 12].includes(month)) return 1.06;
    if ([1, 2].includes(month)) return 0.94;
    return 1.0;
  }
  if (isResilienceSegment(seg) || isEducationSegment(seg) || isIndustrySegment(seg)) return 1.0;
  return 1.0;
}

function macroFactor(ym: string): number {
  // ym: YYYY-MM (approx. "piacgazdasági hullámok" – visszafogott, hihető)
  if (/^2023-/.test(ym)) return 1.0;
  if (/^2024-(03|04|05|06|07|08)$/.test(ym)) return 0.88;
  if (/^2024-(09|10|11|12)$/.test(ym)) return 0.95;
  if (/^2025-(01|02)$/.test(ym)) return 0.95;
  if (/^2025-(03|04|05|06|07|08)$/.test(ym)) return 1.05;
  if (/^2025-(09|10|11|12)$/.test(ym)) return 1.1;
  if (/^2026-(01|02)$/.test(ym)) return 1.1;
  if (/^2026-(03|04|05|06|07|08)$/.test(ym)) return 1.08;
  return 1.0;
}

function workspaceDefaults(segmentId: DemoSegmentId): WorkspaceMeta[] {
  const locSzekhely = `loc:${segmentId}:szekhely`;
  const locTelephely = `loc:${segmentId}:telephely`;
  const propHome = `prop:${segmentId}:home`;
  const propOther = `prop:${segmentId}:other`;

  const properties =
    segmentId === "demo1_multisite_operator"
      ? [
          {
            id: propHome,
            name: "Saját lakás",
            type: "primary_residence",
            address: "Budapest — lakóingatlan",
            estimatedValue: 78_000_000,
            isIncomeGenerating: false,
          },
          {
            id: propOther,
            name: "Kiadott garzon",
            type: "rental",
            address: "Budapest — bérbeadott ingatlan",
            estimatedValue: 46_000_000,
            isIncomeGenerating: true,
          },
        ]
      : [
          {
            id: propHome,
            name: "Saját lakás",
            type: "primary_residence",
            address:
              segmentId === "demo4_fine_dining_bistro"
                ? "Belváros — lakóingatlan"
                : segmentId === "demo6_event_catering_popup"
                  ? "Agglomeráció — lakóingatlan"
                  : "Város — lakóingatlan",
            estimatedValue:
              segmentId === "demo2_premium_nightlife"
                ? 62_000_000
                : segmentId === "demo4_fine_dining_bistro"
                  ? 74_000_000
                  : segmentId === "demo5_pastry_gelato"
                    ? 54_000_000
                    : 58_000_000,
            isIncomeGenerating: false,
          },
        ];

  const vehicles =
    segmentId === "demo1_multisite_operator"
      ? [
          { id: `veh:${segmentId}:1`, name: "Céges furgon (ellátás)", plateNumber: "MSO-101", type: "company_fleet", reimbursementRate: 0 },
          { id: `veh:${segmentId}:2`, name: "Céges furgon (kiszállítás)", plateNumber: "MSO-202", type: "company_fleet", reimbursementRate: 0 },
          { id: `veh:${segmentId}:3`, name: "Saját autó (üzleti használat)", plateNumber: "KLM-778", type: "private_business", reimbursementRate: 100 },
        ]
      : segmentId === "demo7_personal_pocket_seasonal_pilot"
        ? [
            { id: `veh:${segmentId}:1`, name: "Saját autó (üzleti használat)", plateNumber: "PIL-707", type: "private_business", reimbursementRate: 100 },
          ]
      : segmentId === "demo6_event_catering_popup"
        ? [
            { id: `veh:${segmentId}:1`, name: "Céges furgon (kiszállítás)", plateNumber: "EVT-201", type: "company_fleet", reimbursementRate: 0 },
            { id: `veh:${segmentId}:2`, name: "Saját autó (üzleti használat)", plateNumber: "ABC-123", type: "private_business", reimbursementRate: 100 },
          ]
        : segmentId === "demo3_specialty_cafe_tea"
          ? [
              { id: `veh:${segmentId}:1`, name: "Saját autó (üzleti használat)", plateNumber: "ABC-123", type: "private_business", reimbursementRate: 100 },
            ]
          : [
              { id: `veh:${segmentId}:1`, name: "Céges furgon", plateNumber: "FUZ-201", type: "company_fleet", reimbursementRate: 0 },
              { id: `veh:${segmentId}:2`, name: "Saját autó (üzleti használat)", plateNumber: "KLM-778", type: "private_business", reimbursementRate: 100 },
            ];

  const surface = caseSurface(segmentId);
  const partners = surface.partners as any[];
  const duties = surface.duties as any[];

  return [
    {
      id: "personal",
      type: "personal",
      alias: "Magán",
      description: null,
      color_tag: null,
      bank_sync_folder: null,
      imported_file_hashes: [],
      realEstateProperties: properties as any,
    } as any,
    {
      id: "Vállalkozás1",
      type: "business",
      alias: surface.businessAlias,
      description: isStrategySegment(segmentId)
        ? MASTER_BASELINE.description
        : isResilienceSegment(segmentId)
          ? resilienceCaseById(segmentId).lead
        : isEducationSegment(segmentId)
          ? educationCaseById(segmentId).lead
        : isIndustrySegment(segmentId)
          ? industryCaseById(segmentId).lead
        : segmentId === "demo7_personal_pocket_seasonal_pilot"
          ? "DEMO szezonális pilot vendéglátás (magán zsebből; tagi kölcsön; belépő egység modell)"
          : "DEMO élelmiszeripari vállalkozás (Y1 Batch 01 cél-szegmens szerint)",
      color_tag: null,
      bank_sync_folder: null,
      imported_file_hashes: [],
      locationIds: [locSzekhely, locTelephely],
      vehicles,
      partners,
      duties,
      master_baseline: baselineForSegment(segmentId),
      inherits_baseline: false,
    } as any,
    {
      id: "Projekt1",
      type: "project",
      project_mode: isStrategySegment(segmentId) ? "pilot" : "simulation",
      project_budget_huf: isStrategySegment(segmentId)
        ? 6_400_000
        : isResilienceSegment(segmentId)
          ? segmentId === "demo13_resilience_home_blackout"
            ? 480_000
            : segmentId === "demo12_resilience_community_grid"
              ? 1_200_000
              : segmentId === "demo14_resilience_demography"
                ? 180_000
                : 2_400_000
        : isEducationSegment(segmentId)
          ? segmentId === "demo15_edu_startup_cashflow"
            ? 1_600_000
            : segmentId === "demo16_edu_lean_vsm"
              ? 2_800_000
              : 720_000
        : isIndustrySegment(segmentId)
          ? industryCaseById(segmentId).kind === "hospital"
            ? 2_800_000
            : 4_200_000
        : segmentId === "demo7_personal_pocket_seasonal_pilot"
          ? 3_900_000
          : 9_900_000,
      alias: surface.projectAlias,
      description: isStrategySegment(segmentId)
        ? "Stratégiai eset — Master Baseline öröklés, PRO pályák a PDCA-ban"
        : isResilienceSegment(segmentId)
          ? "BCP / működési reziliencia — ResourceRunway, EnergyAutonomy, TTR a PDCA-ban"
        : isEducationSegment(segmentId)
          ? "Oktatási tréning — pénzügyi sáv + Lean / Poka-Yoke a PDCA-ban"
        : isIndustrySegment(segmentId)
          ? "Iparági / egészségügyi eset — Lean, BCP, local-first a PDCA-ban"
        : "Projekt-szimuláció: új természetes profil (modell)",
      color_tag: null,
      bank_sync_folder: null,
      imported_file_hashes: [],
      completion_pct: isLayeredCase(segmentId) ? 35 : 25,
      scenario: "realistic",
      ...(isLayeredCase(segmentId)
        ? {
            parent_business_id: "Vállalkozás1",
            counts_in_business: true,
            inherits_baseline: true,
            master_baseline: inheritMasterBaseline(baselineForSegment(segmentId), surface.projectAlias),
            pdca_cycle_count: 0,
            pdca_milestones: {
              plan_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
              do_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
              check_at: null,
              act_at: null,
            },
          }
        : segmentId === "demo7_personal_pocket_seasonal_pilot"
          ? {
              pdca_cycle_count: 0,
              pdca_milestones: {
                plan_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
                do_at: null,
                check_at: null,
                act_at: null,
              },
            }
          : {}),
    } as any,
  ] as any;
}

/** Drop leftover Vállalkozás2/Projekt2 shells and stamp case-specific törzsadat. */
export function sanitizeVisitorWorkspaces(
  workspaces: WorkspaceMeta[] | null | undefined,
  segmentId: DemoSegmentId,
): WorkspaceMeta[] {
  const surface = caseSurface(segmentId);
  const incoming = (workspaces ?? []).filter(
    (w) => w && typeof w.id === "string" && Boolean(w.id) && !DEMO_GHOST_WORKSPACES.has(w.id),
  );
  const byId = new Map(incoming.map((w) => [w.id, w]));
  const out: WorkspaceMeta[] = [];
  for (const def of workspaceDefaults(segmentId)) {
    const cur = byId.get(def.id);
    byId.delete(def.id);
    if (!cur) {
      out.push(def);
      continue;
    }
    if (def.id === "Vállalkozás1") {
      const baseline = baselineForSegment(segmentId);
      out.push({
        ...cur,
        alias: surface.businessAlias,
        partners: surface.partners as any,
        duties: surface.duties as any,
        master_baseline: baseline,
        inherits_baseline: false,
      });
      continue;
    }
    if (def.id === "Projekt1") {
      const baseline = inheritMasterBaseline(baselineForSegment(segmentId), surface.projectAlias);
      out.push({
        ...cur,
        alias: surface.projectAlias,
        inherits_baseline: true,
        master_baseline: baseline,
      });
      continue;
    }
    out.push(cur);
  }
  for (const leftover of byId.values()) out.push(leftover);
  return out;
}

async function getVaultKeyFromSession(): Promise<CryptoKey> {
  const raw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(VAULT_SESSION_KEY) : null;
  if (!raw) throw new Error("Nincs feloldott profil (vault kulcs hiányzik).");
  return importRawKey(raw);
}

function txn(
  input: Omit<Transaction, "id" | "user_id"> & { id?: string; user_id?: string },
): Transaction {
  // Demo UX: make "Kategória szűrő" (bank/card/transfer/other) testable.
  // The Cashflow filter considers a txn "bank" only if `bank_raw_id` is set.
  // - For demo business txns, default to bank-like rows unless explicitly overridden.
  // - Passing `bank_raw_id: null` forces a manual/non-bank row (so "Egyéb" stays testable too).
  const defaultBankRaw =
    input.bank_raw_id !== undefined
      ? input.bank_raw_id
      : input.workspace === "Vállalkozás1"
        ? `demo:bankraw:${String(input.id ?? newId("bankraw"))}`
        : null;

  return {
    id: input.id ?? newId("txn"),
    user_id: input.user_id ?? "demo",
    type: input.type,
    amount: Math.round(Number(input.amount ?? 0)),
    category: String(input.category ?? "uncategorized"),
    note: input.note ?? null,
    occurred_at: input.occurred_at,
    workspace: input.workspace ?? "personal",
    title: input.title ?? null,
    party: input.party ?? null,
    payment_method: input.payment_method ?? "transfer",
    expense_type: input.expense_type,
    muda_type: input.muda_type,
    is_recurring: input.is_recurring,
    tags: Array.isArray(input.tags) ? input.tags : [],
    vat_rate: input.vat_rate ?? null,
    vat_treatment: (input as any).vat_treatment ?? null,
    vat_review: Boolean((input as any).vat_review),
    vat_deductibility: (input as any).vat_deductibility ?? null,
    status: input.status ?? null,
    project_id: input.project_id ?? null,
    location_id: (input as any).location_id ?? null,
    property_id: (input as any).property_id ?? null,
    asset_id: (input as any).asset_id ?? null,
    cost_kind: (input as any).cost_kind ?? null,
    is_asset: Boolean((input as any).is_asset),
    is_resale: Boolean((input as any).is_resale),
    customer_name: (input as any).customer_name ?? null,
    linked_revenue_id: (input as any).linked_revenue_id ?? null,
    calculated_margin: (input as any).calculated_margin ?? null,
    internal_transfer_kind: (input as any).internal_transfer_kind ?? null,
    internal_transfer_group_id: (input as any).internal_transfer_group_id ?? null,
    internal_transfer_peer_id: (input as any).internal_transfer_peer_id ?? null,
    internal_transfer_from: (input as any).internal_transfer_from ?? null,
    internal_transfer_to: (input as any).internal_transfer_to ?? null,
    eur_amount: (input as any).eur_amount ?? null,
    eur_rate: (input as any).eur_rate ?? null,
    bucket_id: input.bucket_id ?? null,
    bank_raw_id: defaultBankRaw,
    bank_account_id: input.bank_account_id ?? null,
    frsz: input.frsz ?? null,
    invoice_status: (input as any).invoice_status ?? null,
    due_date: (input as any).due_date ?? null,
    loan_id: (input as any).loan_id ?? null,
    loan_principal_paid: (input as any).loan_principal_paid ?? null,
  };
}

function withGeneratedNote(note: string | null | undefined) {
  const base = (note ?? "").trim();
  const suffix = "[GENERÁLT/teszt adat]";
  if (!base) return suffix;
  return base.includes(suffix) ? base : `${base} ${suffix}`;
}

function demoTags(segmentId: DemoSegmentId, extra?: string[]) {
  const family = isEducationSegment(segmentId)
    ? "demo:education"
    : isResilienceSegment(segmentId)
    ? "demo:resilience"
    : isStrategySegment(segmentId)
      ? "demo:strategy"
      : isIndustrySegment(segmentId)
        ? "demo:industry"
      : "demo:food";
  return [DEMO_GENERATED_TAG, `demo:${segmentId}`, family, ...(extra ?? [])];
}

function projectUnit(segmentId: DemoSegmentId) {
  if (segmentId === "demo1_multisite_operator") return { inc: 2_200, cost: 650 };
  if (segmentId === "demo5_pastry_gelato") return { inc: 2_400, cost: 700 };
  if (segmentId === "demo7_personal_pocket_seasonal_pilot") return { inc: 2_050, cost: 680 }; // standard baseline (premium uplift comes via extra templates)
  if (segmentId === "demo8_strategy_new_line") return { inc: 2_850, cost: 980 };
  if (segmentId === "demo9_strategy_input_inflation") return { inc: 2_600, cost: 1_120 };
  if (segmentId === "demo10_strategy_new_market") return { inc: 2_400, cost: 890 };
  if (segmentId === "demo19_strategy_kahn_fork") return { inc: 2_550, cost: 860 };
  if (isResilienceSegment(segmentId)) return { inc: 400, cost: 180 };
  if (segmentId === "demo15_edu_startup_cashflow") return { inc: 1_150, cost: 420 };
  if (segmentId === "demo16_edu_lean_vsm") return { inc: 2_100, cost: 760 };
  if (isEducationSegment(segmentId)) return { inc: 280, cost: 160 };
  if (isIndustrySegment(segmentId)) return { inc: 1_800, cost: 640 };
  return { inc: 2_600, cost: 700 };
}

function segmentById(id: DemoSegmentId) {
  const seg = DEMO_SEGMENTS.find((s) => s.id === id);
  if (!seg) throw new Error("Ismeretlen DEMO szegmens.");
  return seg;
}

export async function seedDemoDataForSegment(segmentId: DemoSegmentId): Promise<void> {
  const seg = segmentById(segmentId);

  const vaultKey = await getVaultKeyFromSession();

  // Settings: ensure workspaces + add a seed marker (idempotent)
  const cur = await localdb.getSettings();
  let curPlain: any = null;
  if (cur?.data_enc) {
    try {
      // We deliberately avoid importing decryptJSON here to keep this module minimal.
      // If settings exist, we only append the marker if missing by blind overwrite with a safe baseline.
      curPlain = null;
    } catch {
      curPlain = null;
    }
  }

  const seedMarker = { kind: "demo-pack", version: 1, segmentId, seededAt: new Date().toISOString() };
  const locSzekhely = `loc:${segmentId}:szekhely`;
  const locTelephely = `loc:${segmentId}:telephely`;
  const propHome = `prop:${segmentId}:home`;
  const propOther = `prop:${segmentId}:other`;
  const planBySeg: Record<
    DemoSegmentId,
    {
      setup: number;
      lab: number;
      permit: number;
      recInternet: number;
      recPhone: number;
      recBankFees: number;
      recAccounting: number;
    }
  > = {
    demo1_multisite_operator: {
      setup: 690_000,
      lab: 420_000,
      permit: 210_000,
      recInternet: 36_000,
      recPhone: 24_000,
      recBankFees: 19_500,
      recAccounting: 85_000,
    },
    demo2_premium_nightlife: {
      setup: 520_000,
      lab: 310_000,
      permit: 160_000,
      recInternet: 32_000,
      recPhone: 22_000,
      recBankFees: 17_500,
      recAccounting: 72_000,
    },
    demo3_specialty_cafe_tea: {
      setup: 290_000,
      lab: 180_000,
      permit: 110_000,
      recInternet: 26_000,
      recPhone: 16_000,
      recBankFees: 12_500,
      recAccounting: 55_000,
    },
    demo4_fine_dining_bistro: {
      setup: 460_000,
      lab: 260_000,
      permit: 180_000,
      recInternet: 30_000,
      recPhone: 18_000,
      recBankFees: 15_500,
      recAccounting: 68_000,
    },
    demo5_pastry_gelato: {
      setup: 330_000,
      lab: 210_000,
      permit: 140_000,
      recInternet: 28_000,
      recPhone: 15_000,
      recBankFees: 13_500,
      recAccounting: 58_000,
    },
    demo6_event_catering_popup: {
      setup: 410_000,
      lab: 250_000,
      permit: 190_000,
      recInternet: 34_000,
      recPhone: 20_000,
      recBankFees: 16_500,
      recAccounting: 74_000,
    },
    demo7_personal_pocket_seasonal_pilot: {
      setup: 260_000,
      lab: 160_000,
      permit: 120_000,
      recInternet: 18_000,
      recPhone: 12_000,
      recBankFees: 8_900,
      recAccounting: 42_000,
    },
    demo8_strategy_new_line: { ...MASTER_BASELINE.plan },
    demo9_strategy_input_inflation: { ...MASTER_BASELINE.plan },
    demo10_strategy_new_market: { ...MASTER_BASELINE.plan },
    demo19_strategy_kahn_fork: { ...MASTER_BASELINE.plan },
    demo11_resilience_saas_outage: {
      setup: 180_000,
      lab: 40_000,
      permit: 30_000,
      recInternet: 12_000,
      recPhone: 8_000,
      recBankFees: 4_500,
      recAccounting: 18_000,
    },
    demo12_resilience_community_grid: {
      setup: 140_000,
      lab: 28_000,
      permit: 22_000,
      recInternet: 8_000,
      recPhone: 6_000,
      recBankFees: 3_200,
      recAccounting: 12_000,
    },
    demo13_resilience_home_blackout: {
      setup: 86_000,
      lab: 12_000,
      permit: 0,
      recInternet: 4_500,
      recPhone: 3_200,
      recBankFees: 1_800,
      recAccounting: 0,
    },
    demo14_resilience_demography: {
      setup: 48_000,
      lab: 16_000,
      permit: 0,
      recInternet: 3_200,
      recPhone: 2_400,
      recBankFees: 1_200,
      recAccounting: 8_000,
    },
    demo15_edu_startup_cashflow: {
      setup: 120_000,
      lab: 24_000,
      permit: 18_000,
      recInternet: 6_400,
      recPhone: 4_200,
      recBankFees: 2_400,
      recAccounting: 12_000,
    },
    demo16_edu_lean_vsm: {
      setup: 210_000,
      lab: 48_000,
      permit: 22_000,
      recInternet: 9_000,
      recPhone: 6_000,
      recBankFees: 3_600,
      recAccounting: 22_000,
    },
    demo17_edu_campus_energy: {
      setup: 86_000,
      lab: 18_000,
      permit: 0,
      recInternet: 5_200,
      recPhone: 3_600,
      recBankFees: 1_800,
      recAccounting: 8_000,
    },
    demo18_edu_cyber_incident: {
      setup: 96_000,
      lab: 28_000,
      permit: 0,
      recInternet: 7_200,
      recPhone: 4_800,
      recBankFees: 2_200,
      recAccounting: 10_000,
    },
    demo20_industry_hospital_blackout: {
      setup: 210_000,
      lab: 48_000,
      permit: 0,
      recInternet: 8_000,
      recPhone: 6_400,
      recBankFees: 3_200,
      recAccounting: 18_000,
    },
    demo21_industry_supply_shock: { ...MASTER_BASELINE.plan },
    demo22_industry_poka_recall: { ...MASTER_BASELINE.plan },
    demo23_industry_wms_outage: {
      setup: 160_000,
      lab: 32_000,
      permit: 18_000,
      recInternet: 14_000,
      recPhone: 8_000,
      recBankFees: 4_800,
      recAccounting: 22_000,
    },
    demo24_industry_fuel_crisis: { ...MASTER_BASELINE.plan },
    demo25_industry_tax_shock: { ...MASTER_BASELINE.plan },
    demo26_industry_saas_exit: {
      setup: 140_000,
      lab: 36_000,
      permit: 0,
      recInternet: 16_000,
      recPhone: 7_200,
      recBankFees: 4_200,
      recAccounting: 20_000,
    },
  };
  const plan = planBySeg[segmentId];

  const hasOwnMovable =
    segmentId === "demo3_specialty_cafe_tea" ||
    segmentId === "demo5_pastry_gelato" ||
    segmentId === "demo6_event_catering_popup" ||
    segmentId === "demo7_personal_pocket_seasonal_pilot" ||
    isStrategySegment(segmentId) ||
    isResilienceSegment(segmentId) ||
    isEducationSegment(segmentId) ||
    isIndustrySegment(segmentId);

  const demoAssets = [
    {
      id: `asset:${segmentId}:company_pc`,
      name: "Vállalati számítógép",
      location_id: locSzekhely,
      project_id: null,
      created_at: new Date(Date.now() - 220 * 24 * 60 * 60 * 1000).toISOString(),
    },
    ...(hasOwnMovable
      ? [
          {
            id: `asset:${segmentId}:personal_laptop`,
            name: "Saját laptop",
            location_id: locSzekhely,
            project_id: null,
            created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]
      : []),
    {
      id: `asset:${segmentId}:cash_register`,
      name: segmentId === "demo2_premium_nightlife" ? "Pénztárgép + POS pult" : "Pénztárgép / POS",
      location_id: locTelephely,
      project_id: null,
      created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    },
    ...(segmentId === "demo1_multisite_operator"
      ? [
          {
            id: `asset:${segmentId}:cash_register2`,
            name: "Pénztárgép / POS (2. egység)",
            location_id: locTelephely,
            project_id: null,
            created_at: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]
      : []),
    {
      id: `asset:${segmentId}:kitchen_equipment`,
      name:
        segmentId === "demo2_premium_nightlife"
          ? "Bár berendezések (jég + shaker + pult)"
          : segmentId === "demo4_fine_dining_bistro"
            ? "Konyhai berendezések (sütő + elszívó)"
            : segmentId === "demo5_pastry_gelato"
              ? "Konyhai berendezések (hűtő + fagyasztó)"
              : segmentId === "demo1_multisite_operator"
                ? "Konyhai/előállító eszközök (prep + címkéző)"
                : segmentId === "demo6_event_catering_popup"
                  ? "Mobil konyhai eszközcsomag"
                  : "Kisgép / eszközcsomag",
      location_id: locTelephely,
      project_id: null,
      created_at: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ] as any;

  const demoBuckets = [
    { id: `bucket:${segmentId}:vat`, name: "ÁFA tartalék" },
    { id: `bucket:${segmentId}:runway`, name: "Céltartalék-puffer" },
    ...(segmentId === "demo1_multisite_operator" || segmentId === "demo6_event_catering_popup"
      ? [{ id: `bucket:${segmentId}:capex`, name: "Eszközalap" }]
      : []),
  ] as any;

  const usageBase =
    segmentId === "demo1_multisite_operator"
      ? 260
      : segmentId === "demo2_premium_nightlife"
        ? 180
        : segmentId === "demo3_specialty_cafe_tea"
          ? 140
          : segmentId === "demo4_fine_dining_bistro"
            ? 210
            : segmentId === "demo5_pastry_gelato"
              ? 120
      : segmentId === "demo7_personal_pocket_seasonal_pilot"
        ? 95
        : 200;
  const demoUsageEvents = [
    {
      id: `ev:${segmentId}:uplift:1`,
      template_id: "tpl_uplift_income",
      at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      count: usageBase,
      workspace: "Projekt1",
    },
    {
      id: `ev:${segmentId}:uplift:1c`,
      template_id: "tpl_uplift_cost",
      at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      count: usageBase,
      workspace: "Projekt1",
    },
    {
      id: `ev:${segmentId}:uplift:2`,
      template_id: "tpl_uplift_income",
      at: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      count: Math.round(usageBase * 1.25),
      workspace: "Projekt1",
    },
    {
      id: `ev:${segmentId}:uplift:2c`,
      template_id: "tpl_uplift_cost",
      at: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      count: Math.round(usageBase * 1.25),
      workspace: "Projekt1",
    },
    ...(segmentId === "demo7_personal_pocket_seasonal_pilot"
      ? ([
          {
            id: `ev:${segmentId}:std:1`,
            template_id: "tpl_standard_income",
            at: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            count: Math.round(usageBase * 1.55),
            workspace: "Projekt1",
          },
          {
            id: `ev:${segmentId}:std:1c`,
            template_id: "tpl_standard_cost",
            at: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            count: Math.round(usageBase * 1.55),
            workspace: "Projekt1",
          },
        ] as any)
      : []),
  ] as any;

  const nextSettings: CustomSettings = {
    ...EMPTY_SETTINGS,
    ...(curPlain && typeof curPlain === "object" ? curPlain : {}),
    // Global location catalog + workspace-specific references in WorkspaceMeta.locationIds
    locations: [
      {
        id: locSzekhely,
        name:
          segmentId === "demo4_fine_dining_bistro"
            ? "Székhely (belváros)"
            : segmentId === "demo6_event_catering_popup"
              ? "Székhely (logisztikai bázis)"
              : segmentId === "demo7_personal_pocket_seasonal_pilot"
                ? "Székhely (magán iroda)"
              : isStrategySegment(segmentId)
                ? "Székhely (core üzem)"
              : isResilienceSegment(segmentId)
                ? segmentId === "demo13_resilience_home_blackout"
                  ? "Lakás (háztartás)"
                  : "Székhely (reziliencia / BCP)"
              : isEducationSegment(segmentId)
                ? "Székhely (campus / tanműhely)"
              : isIndustrySegment(segmentId)
                ? industryCaseById(segmentId).kind === "hospital"
                  ? "Székhely (kórház / üzemeltetés)"
                  : "Székhely (üzem / raktár)"
              : segmentId === "demo1_multisite_operator"
                ? "Székhely (beszerzés / központ)"
              : "Székhely (város)",
        kind: "szekhely",
      },
      {
        id: locTelephely,
        name:
          segmentId === "demo4_fine_dining_bistro"
            ? "Telephely (konyha + tálaló)"
            : segmentId === "demo5_pastry_gelato"
              ? "Telephely (műhely + hűtő)"
              : segmentId === "demo6_event_catering_popup"
                ? "Telephely (konyha + raktár + kiszállítás)"
                : segmentId === "demo7_personal_pocket_seasonal_pilot"
                  ? "Pilot egység (szezonális pult)"
                : isStrategySegment(segmentId)
                  ? "Telephely (gyártás / raktár)"
                : isResilienceSegment(segmentId)
                  ? segmentId === "demo13_resilience_home_blackout"
                    ? "Tartalék (pince / napelem)"
                    : "Telephely (tartalék / mesh)"
                : isEducationSegment(segmentId)
                  ? "Telephely (labor / kollégium)"
                : isIndustrySegment(segmentId)
                  ? industryCaseById(segmentId).kind === "hospital"
                    ? "Telephely (ICU / aggregátor)"
                    : "Telephely (sor / dokk)"
                : segmentId === "demo1_multisite_operator"
                  ? "Telephely (központi raktár / prep)"
                  : "Telephely (raktár / előkészítő)",
        kind: "telephely",
      },
    ] as any,
    workspaces: workspaceDefaults(segmentId),
    assets: demoAssets as any,
    buckets: demoBuckets as any,
    projects: [
      {
        id: "proj_demo_1",
        name: isStrategySegment(segmentId)
          ? strategyCaseById(segmentId).title
          : isResilienceSegment(segmentId)
            ? resilienceCaseById(segmentId).title
          : isEducationSegment(segmentId)
            ? educationCaseById(segmentId).title
          : isIndustrySegment(segmentId)
            ? industryCaseById(segmentId).title
          : segmentId === "demo7_personal_pocket_seasonal_pilot"
            ? "Belépő vendéglátó pilot — standard vs prémium X‑faktor"
            : "Projekt1 — modell (profit potenciál)",
      },
    ],
    usageTemplates: [
      {
        id: "tpl_uplift_income",
        name:
          segmentId === "demo7_personal_pocket_seasonal_pilot"
            ? "Prémium X‑faktor (modell) — felár / kosárérték"
            : "Új természetes profil (modell) — felár / kosárérték",
        type: "income",
        category: "ÉRTÉKESÍTÉS",
        unit_amount: segmentId === "demo7_personal_pocket_seasonal_pilot" ? 4_350 : 2_600,
        vat_rate: null,
        workspace: "Projekt1",
      },
      {
        id: "tpl_uplift_cost",
        name:
          segmentId === "demo7_personal_pocket_seasonal_pilot"
            ? "Prémium X‑faktor (modell) — változó költség"
            : "Új természetes profil (modell) — változó költség",
        type: "expense",
        category: "EGYEBEK: Program költség",
        unit_amount: segmentId === "demo7_personal_pocket_seasonal_pilot" ? 720 : 700,
        vat_rate: null,
        workspace: "Projekt1",
      },
      ...(segmentId === "demo7_personal_pocket_seasonal_pilot"
        ? ([
            {
              id: "tpl_standard_income",
              name: "Standard termék (modell) — kosárérték",
              type: "income",
              category: "ÉRTÉKESÍTÉS",
              unit_amount: 2_050,
              vat_rate: null,
              workspace: "Projekt1",
            },
            {
              id: "tpl_standard_cost",
              name: "Standard termék (modell) — változó költség",
              type: "expense",
              category: "EGYEBEK: Program költség",
              unit_amount: 680,
              vat_rate: null,
              workspace: "Projekt1",
            },
          ] as any)
        : []),
    ],
    usageEvents: demoUsageEvents as any,
    plannedOneOff: [
      {
        id: `one:${segmentId}:proj:setup`,
        name: "Projekt1 — bevezetési setup",
        type: "expense",
        at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        category: "FEJLESZTÉS: Folyamatfejlesztés",
        amount: plan.setup,
        vat_rate: 27,
        workspace: "Projekt1",
      },
      {
        id: `one:${segmentId}:proj:lab`,
        name: "Projekt1 — labor / validáció",
        type: "expense",
        at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        category: "FEJLESZTÉS: Folyamatfejlesztés",
        amount: plan.lab,
        vat_rate: 27,
        workspace: "Projekt1",
      },
      {
        id: `one:${segmentId}:proj:permit`,
        name: "Projekt1 — engedély / audit",
        type: "expense",
        at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        category: "FEJLESZTÉS: Folyamatfejlesztés",
        amount: plan.permit,
        vat_rate: 27,
        workspace: "Projekt1",
      },
    ] as any,
    recurring: [
      {
        id: `rec:${segmentId}:internet`,
        name: "Internet + tárhely",
        type: "expense",
        interval: "monthly",
        next_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        category: "REZSI: Internet +tárhely.eu",
        amount: plan.recInternet,
        vat_rate: 27,
        workspace: "Vállalkozás1",
      },
      {
        id: `rec:${segmentId}:phone`,
        name: "Telefon / mobil",
        type: "expense",
        interval: "monthly",
        next_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        category: "REZSI: Tel., mobitelefon",
        amount: plan.recPhone,
        vat_rate: 27,
        workspace: "Vállalkozás1",
      },
      {
        id: `rec:${segmentId}:bankfees`,
        name: "Banki számladíj",
        type: "expense",
        interval: "monthly",
        next_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        category: "REZSI: Bank szla.díjak",
        amount: plan.recBankFees,
        vat_rate: 0,
        workspace: "Vállalkozás1",
      },
      {
        id: `rec:${segmentId}:accounting`,
        name: "Könyvelés",
        type: "expense",
        interval: "monthly",
        next_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        category: "REZSI: Könyvelés",
        amount: plan.recAccounting,
        vat_rate: 27,
        workspace: "Vállalkozás1",
      },
      {
        id: `rec:${segmentId}:insurance`,
        name: "Biztosítás (flotta proxy)",
        type: "expense",
        interval: "monthly",
        next_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        category: "FLOTTA: Biztosítás KGFB",
        amount:
          segmentId === "demo1_multisite_operator"
            ? 72_000
            : isStrategySegment(segmentId)
              ? MASTER_BASELINE.plan.recInsurance
            : isResilienceSegment(segmentId)
              ? 12_000
            : isEducationSegment(segmentId)
              ? 8_000
            : segmentId === "demo6_event_catering_popup"
              ? 44_000
              : segmentId === "demo3_specialty_cafe_tea"
                ? 22_000
                : 34_000,
        vat_rate: 0,
        workspace: "Vállalkozás1",
      } as any,
    ] as any,
  } as any;
  (nextSettings as any).master_baseline = baselineForSegment(segmentId);
  (nextSettings as any).__demo = seedMarker;

  const settingsEnc = await encryptJSON(vaultKey, nextSettings);
  await localdb.putSettings(settingsEnc);

  // Seed a demo "active goal" so the Goals panel is immediately meaningful.
  // Keep it segment-specific (and stable) to avoid identical demo planning across profiles.
  const goalId = `demo:goal:${segmentId}:project1`;
  const goalDeadline = new Date(
    Date.now() + (isKahnForkSegment(segmentId) ? 60 : 120) * 24 * 60 * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10);
  const goalTarget = isKahnForkSegment(segmentId)
    ? kahnReserveTargetHuf()
    : Math.round((plan.setup + plan.lab + plan.permit) * 1.35);
  const goalPayload = {
    name: isStrategySegment(segmentId)
      ? strategyCaseById(segmentId).goalName
      : isResilienceSegment(segmentId)
        ? resilienceCaseById(segmentId).goalName
      : isEducationSegment(segmentId)
        ? educationCaseById(segmentId).goalName
      : isIndustrySegment(segmentId)
        ? industryCaseById(segmentId).goalName
      : "Projekt1 — Break-even + 60 nap puffer",
    target_amount: goalTarget,
    workspace: segmentId === "demo13_resilience_home_blackout" ? "personal" : "Projekt1",
    property_id: null,
  };
  const goalEnc = await encryptJSON(vaultKey, goalPayload);
  await localdb.putGoal({
    id: goalId,
    deadline: goalDeadline,
    is_active: true,
    created_at: new Date().toISOString(),
    data_enc: goalEnc,
  });

  // Also seed a small BUSINESS goal so Vállalkozás1 "Célok" is not empty in demos.
  const bizGoalId = `demo:goal:${segmentId}:business1`;
  const bizGoalDeadline = new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const bizGoalPayload = {
    name:
      segmentId === "demo2_premium_nightlife"
        ? "Vállalkozás1 — Bár pult fejlesztés"
        : segmentId === "demo5_pastry_gelato"
          ? "Vállalkozás1 — Hűtő kapacitás bővítés"
          : segmentId === "demo6_event_catering_popup"
            ? "Vállalkozás1 — Mobil eszközcsomag puffer"
            : isKahnForkSegment(segmentId)
              ? "Működő üzem — ≥4 hó tartalék a rosszabb kimeneten"
            : isStrategySegment(segmentId)
              ? "Működő üzem — készpénz puffer"
            : isResilienceSegment(segmentId)
              ? "Reziliencia — készlet / energia puffer"
            : isEducationSegment(segmentId)
              ? "Tréning — tartalék / kvóta puffer"
            : isIndustrySegment(segmentId)
              ? "Iparági eset — tartalék / BCP puffer"
            : "Vállalkozás1 — Készpénz puffer",
    target_amount:
      segmentId === "demo4_fine_dining_bistro"
        ? 1_250_000
        : segmentId === "demo1_multisite_operator"
          ? 2_400_000
          : isKahnForkSegment(segmentId)
            ? MASTER_BASELINE.startingCashHuf
          : 950_000,
    workspace: "Vállalkozás1",
    property_id: null,
  };
  const bizGoalEnc = await encryptJSON(vaultKey, bizGoalPayload);
  await localdb.putGoal({
    id: bizGoalId,
    deadline: bizGoalDeadline,
    is_active: false,
    created_at: new Date().toISOString(),
    data_enc: bizGoalEnc,
  });
  // Ensure only this demo goal is active (demo UX).
  try {
    const goals = await localdb.listGoals();
    for (const g of goals) {
      if (g.id === goalId) continue;
      if (g.is_active) await localdb.putGoal({ ...g, is_active: false });
    }
  } catch {
    /* ignore */
  }

  // Transactions: 36 months back (Vállalkozás1). We keep it compact: 1 income + 4 expenses / month.
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  const start = new Date(end.getFullYear(), end.getMonth() - 36, 1);

  const seedNum =
    segmentId
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) ^
    start.getFullYear() ^
    (start.getMonth() + 1);
  const rnd = mulberry32(seedNum);

  const txns: Transaction[] = [];

  for (let i = 0; i < 36; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const y = d.getFullYear();
    const m1 = d.getMonth() + 1;
    const ym = `${y}-${String(m1).padStart(2, "0")}`;

    const sf = seasonFactor(segmentId, m1);
    const mf = macroFactor(ym);
    const noise = clamp(0.95 + rnd() * 0.1, 0.93, 1.07);

    const revenue = Math.round(seg.baseRevenueNetHuf * sf * mf * noise);

    // Not “low‑COGS/high‑margin”: keep net profit typically ~5–12%
    const payroll = Math.round(revenue * clamp(0.24 + rnd() * 0.06, 0.22, 0.32));
    const payrollNet = Math.round(payroll * 0.71);
    const payrollNav = payroll - payrollNet;
    const rent = Math.round(revenue * clamp(0.07 + rnd() * 0.02, 0.06, 0.1));
    const overhead = Math.round(revenue * clamp(0.06 + rnd() * 0.03, 0.05, 0.11));
    const marketing = Math.round(revenue * clamp(0.02 + rnd() * 0.03, 0.01, 0.06));
    const materials = Math.round(revenue * clamp(0.32 + rnd() * 0.08, 0.28, 0.44));
    const packaging = Math.round(revenue * clamp(0.06 + rnd() * 0.03, 0.05, 0.11));
    const courier = Math.round(revenue * clamp(0.012 + rnd() * 0.01, 0.01, 0.03));
    const cardMisc = Math.round(revenue * clamp(0.004 + rnd() * 0.004, 0.002, 0.01));
    const contractor = Math.round(
      revenue *
        (segmentId === "demo6_event_catering_popup" || segmentId === "demo1_multisite_operator"
          ? clamp(0.04 + rnd() * 0.03, 0.03, 0.08)
          : segmentId === "demo2_premium_nightlife"
            ? clamp(0.035 + rnd() * 0.02, 0.03, 0.06)
            : clamp(0.012 + rnd() * 0.012, 0.008, 0.03)),
    );
    const drinkShare =
      segmentId === "demo2_premium_nightlife"
        ? 0.62
        : segmentId === "demo4_fine_dining_bistro"
          ? 0.28
          : segmentId === "demo3_specialty_cafe_tea"
            ? 0.22
            : segmentId === "demo1_multisite_operator"
              ? 0.2
              : 0.12;
    const drinkBuy = Math.round(materials * drinkShare);
    const foodBuy = materials - drinkBuy;

    const occurredIncome = new Date(Date.UTC(y, m1 - 1, 15, 12, 0, 0)).toISOString();
    const occurredExp = (day: number) =>
      new Date(Date.UTC(y, m1 - 1, day, 12, 0, 0)).toISOString();

    const tid = (kind: string) => `demo:${segmentId}:${ym}:${kind}`;

    txns.push(
      txn({
        id: tid("income"),
        type: "income",
        amount: revenue,
        category: "ÉRTÉKESÍTÉS",
        title: "Havi értékesítés (modell)",
        party: "Vevők (összesített)",
        note: withGeneratedNote(`Havi értékesítés összesítve • ${ym}`),
        occurred_at: occurredIncome,
        workspace: "Vállalkozás1",
        tags: demoTags(segmentId, ["txn:monthly"]),
      }),
    );

    txns.push(
      txn({
        id: tid("payroll"),
        type: "expense",
        amount: payrollNet,
        category: "BÉR: Bér nettó",
        title: "Nettó bér",
        party: "Személyzet",
        note: withGeneratedNote(`Bérköltség nettó • ${ym}`),
        occurred_at: occurredExp(20),
        workspace: "Vállalkozás1",
        location_id: locTelephely,
        expense_type: "FIX_NEED",
        tags: demoTags(segmentId, ["cost:payroll"]),
      }),
      txn({
        id: tid("payroll_nav"),
        type: "expense",
        amount: payrollNav,
        category: "BÉR: NAV bér járulék",
        title: "NAV bérjárulék",
        party: "NAV",
        note: withGeneratedNote(`Járulék • ${ym}`),
        occurred_at: occurredExp(20),
        workspace: "Vállalkozás1",
        expense_type: "FIX_NEED",
        tags: demoTags(segmentId, ["cost:payroll-nav"]),
      }),
      txn({
        id: tid("contractor"),
        type: "expense",
        amount: contractor,
        category: "BÉR: Alvállalkozói kifizetések",
        title:
          segmentId === "demo2_premium_nightlife"
            ? "Biztonság / hostess"
            : segmentId === "demo6_event_catering_popup"
              ? "Eseményes alvállalkozó"
              : "Alvállalkozói díj",
        party: "Alvállalkozó",
        note: withGeneratedNote(`Számla • ${ym}`),
        occurred_at: occurredExp(17),
        workspace: "Vállalkozás1",
        expense_type: "VARIABLE_NEED",
        tags: demoTags(segmentId, ["cost:contractor"]),
      }),
      txn({
        id: tid("rent"),
        type: "expense",
        amount: rent,
        category: "REZSI: Iroda bérlet",
        title: "Bérleti díj",
        party: "Bérbeadó",
        note: withGeneratedNote(`Bérleti díj • átutalás • ${ym}`),
        occurred_at: occurredExp(5),
        workspace: "Vállalkozás1",
        location_id: locSzekhely,
        expense_type: "FIX_NEED",
        tags: demoTags(segmentId, ["cost:rent"]),
      }),
      txn({
        id: tid("overhead"),
        type: "expense",
        amount: overhead,
        category: "REZSI: Egyéb rezsi ktg.",
        title: "Üzemeltetés / rezsi",
        party: "Szolgáltatók",
        note: withGeneratedNote(`Üzemeltetés • ${ym}`),
        occurred_at: occurredExp(10),
        workspace: "Vállalkozás1",
        location_id: locTelephely,
        expense_type: "VARIABLE_NEED",
        tags: demoTags(segmentId, ["cost:overhead"]),
      }),
      txn({
        id: tid("marketing"),
        type: "expense",
        amount: marketing,
        category: "FEJLESZTÉS: Marketing",
        title: "Marketing kampány",
        party: "Hirdetés",
        note: withGeneratedNote(`Kampány / teszt • ${ym}`),
        occurred_at: occurredExp(12),
        workspace: "Vállalkozás1",
        expense_type: "WANT",
        tags: demoTags(segmentId, ["cost:marketing"]),
      }),
      txn({
        id: tid("materials"),
        type: "expense",
        amount: foodBuy,
        category: "BESZERZÉS: Alapanyag",
        title:
          segmentId === "demo5_pastry_gelato"
            ? "Cukrász alapanyag"
            : segmentId === "demo3_specialty_cafe_tea"
              ? "Kávé / tea alapanyag"
              : "Konyhai alapanyag",
        party: "Nagyker / piac",
        note: withGeneratedNote(`Alapanyag beszerzés • ${ym}`),
        occurred_at: occurredExp(18),
        workspace: "Vállalkozás1",
        bank_raw_id: null,
        location_id: locTelephely,
        expense_type: "VARIABLE_NEED",
        tags: demoTags(segmentId, ["cost:materials"]),
      }),
      txn({
        id: tid("drinks"),
        type: "expense",
        amount: drinkBuy,
        category: "BESZERZÉS: Ital / nagyker",
        title:
          segmentId === "demo2_premium_nightlife"
            ? "Italnagyker / import"
            : segmentId === "demo3_specialty_cafe_tea"
              ? "Pörkölő / teaimport"
              : "Italkészlet",
        party: "Italnagyker",
        note: withGeneratedNote(`Ital / nagyker • ${ym}`),
        occurred_at: occurredExp(19),
        workspace: "Vállalkozás1",
        location_id: locTelephely,
        expense_type: "VARIABLE_NEED",
        tags: demoTags(segmentId, ["cost:drinks"]),
      }),
      txn({
        id: tid("packaging"),
        type: "expense",
        amount: packaging,
        category: "BESZERZÉS: Csomagolás",
        title: "Csomagolóanyag",
        party: "Csomagoló beszállító",
        note: withGeneratedNote(`Doboz / fólia / címke • ${ym}`),
        occurred_at: occurredExp(16),
        workspace: "Vállalkozás1",
        bank_raw_id: null,
        location_id: locTelephely,
        expense_type: "VARIABLE_NEED",
        tags: demoTags(segmentId, ["cost:packaging"]),
      }),
      txn({
        id: tid("courier"),
        type: "expense",
        amount: courier,
        category: "BESZERZÉS: Kiszállítás",
        title: "Futár / logisztika",
        party: "Futár",
        note: withGeneratedNote(`Szállítás / futár díj • ${ym}`),
        occurred_at: occurredExp(14),
        workspace: "Vállalkozás1",
        bank_raw_id: null,
        expense_type: "VARIABLE_NEED",
        tags: demoTags(segmentId, ["cost:courier"]),
      }),
      txn({
        id: tid("card_misc"),
        type: "expense",
        amount: cardMisc,
        category: "REZSI: Irodaszerek",
        title: "Kártyás irodaszer",
        party: "Vegyes bolt",
        note: withGeneratedNote(`POS kártya **** 1047 • apró eszköz • ${ym}`),
        occurred_at: occurredExp(8),
        workspace: "Vállalkozás1",
        expense_type: "VARIABLE_NEED",
        tags: demoTags(segmentId, ["ch:card"]),
      }),
    );

    // Utility-like monthly items + fleet costs (food-industry realistic but still generic)
    const utilBase =
      segmentId === "demo1_multisite_operator"
        ? 260_000
        : segmentId === "demo4_fine_dining_bistro"
          ? 150_000
          : segmentId === "demo5_pastry_gelato"
            ? 135_000
            : segmentId === "demo3_specialty_cafe_tea"
              ? 105_000
              : segmentId === "demo6_event_catering_popup"
                ? 175_000
                : 125_000;
    txns.push(
      txn({
        id: `demo:${segmentId}:${ym}:internet`,
        type: "expense",
        amount: 28_000 + Math.round(rnd() * 6_000),
        category: "REZSI: Internet +tárhely.eu",
        title: "Internet + tárhely",
        party: "Szolgáltató",
        note: withGeneratedNote(`Havi előfizetés • átutalás • ${ym}`),
        occurred_at: occurredExp(2),
        workspace: "Vállalkozás1",
        expense_type: "FIX_NEED",
        tags: demoTags(segmentId, ["rezsi:internet"]),
      }),
      txn({
        id: `demo:${segmentId}:${ym}:phone`,
        type: "expense",
        amount: 18_000 + Math.round(rnd() * 8_000),
        category: "REZSI: Tel., mobitelefon",
        title: "Telefon / mobil",
        party: "Telekom",
        note: withGeneratedNote(`Havi díj • átutalás • ${ym}`),
        occurred_at: occurredExp(3),
        workspace: "Vállalkozás1",
        expense_type: "FIX_NEED",
        tags: demoTags(segmentId, ["rezsi:phone"]),
      }),
      txn({
        id: `demo:${segmentId}:${ym}:bankfees`,
        type: "expense",
        amount: 11_000 + Math.round(rnd() * 6_000),
        category: "REZSI: Bank szla.díjak",
        title: "Banki díjak",
        party: "Bank",
        note: withGeneratedNote(`Számlavezetés + tranzakciós díjak • ${ym}`),
        occurred_at: occurredExp(4),
        workspace: "Vállalkozás1",
        expense_type: "FIX_NEED",
        tags: demoTags(segmentId, ["rezsi:bank"]),
      }),
      txn({
        id: `demo:${segmentId}:${ym}:accounting`,
        type: "expense",
        amount: 55_000 + Math.round(rnd() * 18_000),
        category: "REZSI: Könyvelés",
        title: "Könyvelés",
        party: "Könyvelő iroda",
        note: withGeneratedNote(`Havi könyvelés • átutalás • ${ym}`),
        occurred_at: occurredExp(7),
        workspace: "Vállalkozás1",
        expense_type: "FIX_NEED",
        tags: demoTags(segmentId, ["rezsi:accounting"]),
      }),
      txn({
        id: `demo:${segmentId}:${ym}:utilities`,
        type: "expense",
        amount: utilBase + Math.round(rnd() * 25_000),
        category: "REZSI: Egyéb rezsi ktg.",
        title: "Közüzem / rezsi",
        party: "Közmű",
        note: withGeneratedNote(`Villany/víz/gáz proxy • ${ym}`),
        occurred_at: occurredExp(9),
        workspace: "Vállalkozás1",
        location_id: locTelephely,
        expense_type: "FIX_NEED",
        tags: demoTags(segmentId, ["rezsi:utilities"]),
      }),
    );

    const fleetScale =
      segmentId === "demo1_multisite_operator"
        ? 1.7
        : segmentId === "demo6_event_catering_popup"
          ? 1.35
          : segmentId === "demo5_pastry_gelato"
            ? 0.8
            : segmentId === "demo3_specialty_cafe_tea"
              ? 0.55
              : 1.0;
    txns.push(
      txn({
        id: `demo:${segmentId}:${ym}:fuel`,
        type: "expense",
        amount: Math.round((95_000 + rnd() * 85_000) * fleetScale),
        category: "FLOTTA: Tankolás",
        title: "Üzemanyag",
        party: "Benzinkút",
        note: withGeneratedNote(`POS kártya **** 7782 • tankolás • ${ym}`),
        occurred_at: occurredExp(11),
        workspace: "Vállalkozás1",
        expense_type: "VARIABLE_NEED",
        tags: demoTags(segmentId, ["fleet:fuel", "ch:card"]),
      }),
      txn({
        id: `demo:${segmentId}:${ym}:toll`,
        type: "expense",
        amount: Math.round((18_000 + rnd() * 22_000) * fleetScale),
        category: "FLOTTA: Autópályadíj",
        title: "Útdíj / matrica",
        party: "Útdíj",
        note: withGeneratedNote(`Útdíj / matrica • ${ym}`),
        occurred_at: occurredExp(13),
        workspace: "Vállalkozás1",
        expense_type: "VARIABLE_NEED",
        tags: demoTags(segmentId, ["fleet:toll"]),
      }),
    );

    if (m1 % 6 === 0) {
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:service`,
          type: "expense",
          amount: Math.round((85_000 + rnd() * 140_000) * fleetScale),
          category: "FLOTTA: Szerviz",
          title: "Szerviz / karbantartás",
          party: "Szerviz",
          note: withGeneratedNote(`Időszakos szerviz • ${ym}`),
          occurred_at: occurredExp(21),
          workspace: "Vállalkozás1",
          expense_type: "VARIABLE_NEED",
          tags: demoTags(segmentId, ["fleet:service"]),
        } as any),
      );
    }

    // Compliance/admin bursts (food-industry flavored but generic)
    if (m1 === 2 && (String(y) === "2024" || String(y) === "2026")) {
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:haccp`,
          type: "expense",
          amount: 240_000 + Math.round(rnd() * 90_000),
          category: "FEJLESZTÉS: Folyamatfejlesztés",
          title: "HACCP kör / dokumentáció",
          party: "Tanácsadó",
          note: withGeneratedNote(`HACCP felülvizsgálat / oktatás jelleg • ${ym}`),
          occurred_at: occurredExp(22),
          workspace: "Vállalkozás1",
          location_id: locTelephely,
          expense_type: "FIX_NEED",
          tags: demoTags(segmentId, ["compliance:haccp"]),
        }),
      );
    }
    if (m1 === 9 && (String(y) === "2023" || String(y) === "2025")) {
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:audit`,
          type: "expense",
          amount: 320_000 + Math.round(rnd() * 140_000),
          category: "FEJLESZTÉS: Üzletviteli tanácsadás",
          title: "Audit / önellenőrzés",
          party: "Auditor",
          note: withGeneratedNote(`Éves audit jelleg • ${ym}`),
          occurred_at: occurredExp(24),
          workspace: "Vállalkozás1",
          expense_type: "FIX_NEED",
          tags: demoTags(segmentId, ["compliance:audit"]),
        }),
      );
    }
    if (m1 === 4 && String(y) === "2024") {
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:permit`,
          type: "expense",
          amount: 180_000 + Math.round(rnd() * 120_000),
          category: "EGYEBEK: Telephely engedély kérelem",
          title: "Engedély / bejelentés",
          party: "Hatóság / engedély",
          note: withGeneratedNote(`Telephely jellegű admin díj • ${ym}`),
          occurred_at: occurredExp(6),
          workspace: "Vállalkozás1",
          location_id: locSzekhely,
          expense_type: "FIX_NEED",
          tags: demoTags(segmentId, ["compliance:permit"]),
        }),
      );
    }
    if (m1 === 11) {
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:lab`,
          type: "expense",
          amount: 210_000 + Math.round(rnd() * 160_000),
          category: "FEJLESZTÉS: Folyamatfejlesztés",
          title: "Laborvizsgálat / mintavétel",
          party: "Labor / vizsgálat",
          note: withGeneratedNote(`Mikrobiológia / összetétel jelleg (generikus) • ${ym}`),
          occurred_at: occurredExp(26),
          workspace: "Vállalkozás1",
          location_id: locTelephely,
          expense_type: "VARIABLE_NEED",
          tags: demoTags(segmentId, ["compliance:lab"]),
        }),
      );
    }

    if (m1 % 3 === 0) {
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:ipa`,
          type: "expense",
          amount: Math.round(revenue * 0.012 + rnd() * 18_000),
          category: "REZSI: IPA",
          title: "Helyi iparűzési adó",
          party: "Önkormányzat",
          note: withGeneratedNote(`IPA előleg • ${ym}`),
          occurred_at: occurredExp(15),
          workspace: "Vállalkozás1",
          expense_type: "FIX_NEED",
          tags: demoTags(segmentId, ["tax:ipa"]),
        }),
      );
    }
    if (m1 === 3 || m1 === 9) {
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:tax`,
          type: "expense",
          amount: Math.round(revenue * 0.018 + 40_000 + rnd() * 25_000),
          category: "REZSI: Adók",
          title: "Adóelőleg",
          party: "NAV",
          note: withGeneratedNote(`Társasági / átalány jellegű adó • ${ym}`),
          occurred_at: occurredExp(12),
          workspace: "Vállalkozás1",
          expense_type: "FIX_NEED",
          tags: demoTags(segmentId, ["tax:nav"]),
        }),
      );
    }
    if (m1 === 6) {
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:legal`,
          type: "expense",
          amount: 85_000 + Math.round(rnd() * 70_000),
          category: "REZSI: Ügyvéd",
          title: "Jogi tanácsadás",
          party: "Ügyvédi iroda",
          note: withGeneratedNote(`Szerződés / ügyvédi díj • ${ym}`),
          occurred_at: occurredExp(23),
          workspace: "Vállalkozás1",
          expense_type: "VARIABLE_NEED",
          tags: demoTags(segmentId, ["cost:legal"]),
        }),
      );
    }
    if (m1 === 1 || m1 === 8) {
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:tool`,
          type: "expense",
          amount: 120_000 + Math.round(rnd() * 180_000),
          category: "FEJLESZTÉS: Új eszköz",
          title: "Kisgép / eszköz",
          party: "Eszközbeszállító",
          note: withGeneratedNote(`Üzemi eszköz • ${ym}`),
          occurred_at: occurredExp(27),
          workspace: "Vállalkozás1",
          expense_type: "INVESTMENT",
          tags: demoTags(segmentId, ["cost:tool"]),
        }),
      );
    }
    if (m1 === 2) {
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:casco`,
          type: "expense",
          amount: Math.round((42_000 + rnd() * 18_000) * fleetScale),
          category: "FLOTTA: Biztosítás casco",
          title: "Casco díj",
          party: "Biztosító",
          note: withGeneratedNote(`Casco • ${ym}`),
          occurred_at: occurredExp(8),
          workspace: "Vállalkozás1",
          expense_type: "FIX_NEED",
          tags: demoTags(segmentId, ["fleet:casco"]),
        }),
      );
    }
    if (m1 % 2 === 1) {
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:park`,
          type: "expense",
          amount: Math.round((6_500 + rnd() * 9_000) * fleetScale),
          category: "FLOTTA: Parkolás",
          title: "Parkolás",
          party: "Parkolás",
          note: withGeneratedNote(`Parkolás • ${ym}`),
          occurred_at: occurredExp(21),
          workspace: "Vállalkozás1",
          expense_type: "VARIABLE_NEED",
          tags: demoTags(segmentId, ["fleet:park", "ch:card"]),
        }),
      );
    }

    // 2-3 overdue invoice samples near the end to light up Lean recommendations.
    if (i >= 34) {
      const due = new Date(Date.UTC(y, m1 - 1, 25, 12, 0, 0)).toISOString().slice(0, 10);
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:invoice_overdue`,
          type: "income",
          amount: Math.round(revenue * 0.08),
          category: "ÉRTÉKESÍTÉS",
          title: "Számla — rendezvény / megrendelés",
          party: "Ügyfél",
          note: withGeneratedNote(`Kintlévőség minta • invoice_status=unpaid • ${ym}`),
          occurred_at: new Date(Date.UTC(y, m1 - 1, 5, 12, 0, 0)).toISOString(),
          workspace: "Vállalkozás1",
          invoice_status: "unpaid",
          due_date: due,
          tags: demoTags(segmentId, ["invoice:unpaid"]),
        } as any),
      );
    }

    // One reverse-charge flavored item for realism (not sensitive).
    if (ym === "2025-05") {
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:reverse_charge`,
          type: "expense",
          amount: 210_000,
          category: "REZSI: Informatikus",
          title: "Szoftver / szolgáltatás (EU fordított)",
          party: "EU szolgáltató",
          note: withGeneratedNote(`Fordított adózás minta • ${ym}`),
          occurred_at: new Date(Date.UTC(y, m1 - 1, 19, 12, 0, 0)).toISOString(),
          workspace: "Vállalkozás1",
          vat_treatment: "reverse_charge",
          vat_rate: 27,
          vat_review: false,
          tags: demoTags(segmentId, ["vat:reverse_charge"]),
        } as any),
      );
    }
  }

  // Ensure the CURRENT month has visible WANT + MUDA days in the heatmap (realistic "micro-leaks").
  // MudaHeatmap only looks at expenses inside the current month, so we seed a few small events "now".
  {
    const nowD = new Date();
    const y = nowD.getFullYear();
    const m1 = nowD.getMonth() + 1;
    const iso = (day: number) => new Date(Date.UTC(y, m1 - 1, Math.min(28, Math.max(1, day)), 12, 0, 0)).toISOString();
    const scale = clamp(seg.baseRevenueNetHuf / 6_000_000, 0.6, 2.0);
    const amt = (n: number) => Math.round(n * scale);

    // WANT + MUDA (impulse) on a card-like row
    txns.push(
      txn({
        id: `demo:${segmentId}:curr:impulse`,
        type: "expense",
        amount: amt(segmentId === "demo7_personal_pocket_seasonal_pilot" ? 8_900 : 14_900),
        category: "shopping",
        title: "Apró impulzus költés",
        party: "Vegyes bolt",
        note: withGeneratedNote("POS kártya **** 1047 • apró impulzus"),
        occurred_at: iso(6),
        workspace: segmentId === "demo7_personal_pocket_seasonal_pilot" ? "personal" : "Vállalkozás1",
        expense_type: "WANT",
        muda_type: "IMPULSE_SPEND",
        bank_raw_id: `demo:bankraw:${segmentId}:curr:impulse`,
        tags: demoTags(segmentId, ["lean:muda", "ch:card"]),
      } as any),
    );

    // MUDA (fees) — small but persistent
    txns.push(
      txn({
        id: `demo:${segmentId}:curr:fees`,
        type: "expense",
        amount: amt(segmentId === "demo7_personal_pocket_seasonal_pilot" ? 3_200 : 6_500),
        category: "REZSI: Bank szla.díjak",
        title: "Tranzakciós díjak",
        party: "Bank",
        note: withGeneratedNote("Számlavezetés + tranzakciós díjak"),
        occurred_at: iso(12),
        workspace: "Vállalkozás1",
        expense_type: "FIX_NEED",
        muda_type: "FEES",
        bank_raw_id: `demo:bankraw:${segmentId}:curr:fees`,
        tags: demoTags(segmentId, ["lean:muda", "ch:bank"]),
      } as any),
    );

    // MUDA (waste) — occasional real-world spoilage / mis-order
    txns.push(
      txn({
        id: `demo:${segmentId}:curr:waste`,
        type: "expense",
        amount: amt(segmentId === "demo7_personal_pocket_seasonal_pilot" ? 12_000 : 24_000),
        category: "BESZERZÉS: Alapanyag",
        title: "Selejt / romlás",
        party: "Készlet",
        note: withGeneratedNote("Selejt / romlás • újrarendelés miatti veszteség"),
        occurred_at: iso(18),
        workspace: "Vállalkozás1",
        expense_type: "VARIABLE_NEED",
        muda_type: "WASTE",
        bank_raw_id: null, // keep "Egyéb" filter testable too
        tags: demoTags(segmentId, ["lean:muda", "manual"]),
      } as any),
    );
  }

  // DEMO 7: personal-first finances + member loan flows (Magán ↔ Vállalkozás1).
  if (segmentId === "demo7_personal_pocket_seasonal_pilot") {
    const persAt = (y: number, m1: number, d: number) => new Date(Date.UTC(y, m1 - 1, d, 12, 0, 0)).toISOString();
    const pOcc = (monthOffset: number, day = 6) =>
      new Date(Date.UTC(end.getFullYear(), end.getMonth() - monthOffset, day, 12, 0, 0)).toISOString();
    // Salary + small side income (last 18 months)
    for (let back = 0; back < 18; back++) {
      const { y, m1 } = addMonths(end.getFullYear(), end.getMonth() + 1, -back);
      const ym = `${y}-${String(m1).padStart(2, "0")}`;
      const salary = 520_000 + Math.round(rnd() * 55_000); // gross-ish, personal
      txns.push(
        txn({
          id: `demo:${segmentId}:personal:${ym}:salary`,
          type: "income",
          amount: salary,
          category: "salary",
          title: "Munkabér (magán)",
          party: "Munkáltató",
          note: withGeneratedNote(`Jóváírás • fix fizetés • ${ym}`),
          occurred_at: persAt(y, m1, 3),
          workspace: "personal",
          tags: demoTags(segmentId, ["personal:salary"]),
          bank_raw_id: `demo:bankraw:${segmentId}:personal:${ym}:salary`,
        } as any),
      );
      // small side income during season (May–Sep): pilot gives extra
      if ([5, 6, 7, 8, 9].includes(m1)) {
        txns.push(
          txn({
            id: `demo:${segmentId}:personal:${ym}:side`,
            type: "income",
            amount: 85_000 + Math.round(rnd() * 65_000),
            category: "other-income",
            title: "Szezonális plusz (magán)",
            party: "Pilot egység (osztalék / extra)",
            note: withGeneratedNote(`Jóváírás • szezonális kiegészítés • ${ym}`),
            occurred_at: persAt(y, m1, 23),
            workspace: "personal",
            tags: demoTags(segmentId, ["personal:side"]),
            bank_raw_id: `demo:bankraw:${segmentId}:personal:${ym}:side`,
          } as any),
        );
      }
      // a few personal expenses for movement
      if (back % 3 === 0) {
        txns.push(
          txn({
            id: `demo:${segmentId}:personal:${ym}:groceries`,
            type: "expense",
            amount: 92_000 + Math.round(rnd() * 48_000),
            category: "groceries",
            title: "Bevásárlás (magán)",
            party: "Élelmiszer bolt",
            note: withGeneratedNote(`POS kártya **** 7782 • háztartás • ${ym}`),
            occurred_at: persAt(y, m1, 10),
            workspace: "personal",
            expense_type: "FIX_NEED",
            tags: demoTags(segmentId, ["personal:life"]),
            bank_raw_id: `demo:bankraw:${segmentId}:personal:${ym}:groceries`,
          } as any),
        );
      }
    }

    const INTERNAL_INCOME = "PÉNZÜGYI BEVÉTELEK: Tagi kölcsön befizetés";
    const INTERNAL_EXPENSE = "PÉNZÜGYI KIADÁSOK: Tagi kölcsön kifizetés";
    const pushInternal = (n: string, kind: "member_loan_out" | "member_loan_repay", fromWs: string, toWs: string, amount: number, atIso: string, note: string) => {
      const groupId = `demo:${segmentId}:internal:${n}`;
      const senderId = `demo:${segmentId}:internal:${n}:sender`;
      const receiverId = `demo:${segmentId}:internal:${n}:receiver`;
      const base: any = {
        internal_transfer_kind: kind,
        internal_transfer_group_id: groupId,
        internal_transfer_from: fromWs,
        internal_transfer_to: toWs,
        vat_rate: 0,
        vat_treatment: "no_vat",
        vat_review: false,
        vat_deductibility: 0,
        note: withGeneratedNote(note),
        bank_raw_id: null,
      };
      txns.push(
        txn({
          id: senderId,
          type: "expense",
          amount,
          category: INTERNAL_EXPENSE,
          title: kind === "member_loan_out" ? "Tagi kölcsön beadás (magán→cég)" : "Tagi kölcsön visszafizetés (cég→magán)",
          party: "Belső átvezetés",
          occurred_at: atIso,
          workspace: fromWs,
          expense_type: "INVESTMENT",
          tags: demoTags(segmentId, ["internal:transfer"]),
          ...base,
          internal_transfer_peer_id: receiverId,
        } as any),
        txn({
          id: receiverId,
          type: "income",
          amount,
          category: INTERNAL_INCOME,
          title: kind === "member_loan_out" ? "Tagi kölcsön befizetés" : "Tagi kölcsön jóváírás",
          party: "Belső átvezetés",
          occurred_at: atIso,
          workspace: toWs,
          tags: demoTags(segmentId, ["internal:transfer"]),
          ...base,
          internal_transfer_peer_id: senderId,
        } as any),
      );
    };

    // Two injections from personal to business (setup + first season stock), then one partial repay back.
    pushInternal("1", "member_loan_out", "personal", "Vállalkozás1", 680_000, pOcc(2, 7), "Tagi kölcsön — pilot indulás (setup)");
    pushInternal("2", "member_loan_out", "personal", "Vállalkozás1", 420_000, pOcc(1, 7), "Tagi kölcsön — szezon előtti készlet/puffer");
    pushInternal("3", "member_loan_repay", "Vállalkozás1", "personal", 210_000, pOcc(0, 16), "Tagi kölcsön — részbeni visszafizetés (jó hónap)");
  }

  // Personal real-estate related transactions (so the "Ingatlanok" panel is testable).
  const personalOcc = (monthOffset: number, day = 6) =>
    new Date(Date.UTC(end.getFullYear(), end.getMonth() - monthOffset, day, 12, 0, 0)).toISOString();
  const ymNow = new Date().toISOString().slice(0, 7);

  // Ensure "Kategória szűrő" works in personal workspace too (card/transfer/bank/other).
  // For non-demo7 segments, seed a tiny personal bank-like stream (best-effort, not identity-bearing).
  if (segmentId !== "demo7_personal_pocket_seasonal_pilot") {
    const atIso = personalOcc(1, 3);
    txns.push(
      txn({
        id: `demo:${segmentId}:personal:mini:salary`,
        type: "income",
        amount: 410_000 + Math.round(rnd() * 65_000),
        category: "salary",
        title: "Jöváírás (magán)",
        party: "Munkáltató",
        note: withGeneratedNote("Jóváírás • magán"),
        occurred_at: atIso,
        workspace: "personal",
        bank_raw_id: `demo:bankraw:${segmentId}:personal:mini:salary`,
        tags: demoTags(segmentId, ["personal:mini"]),
      } as any),
      txn({
        id: `demo:${segmentId}:personal:mini:card`,
        type: "expense",
        amount: 18_900 + Math.round(rnd() * 9_500),
        category: "shopping",
        title: "Kis beszerzés (magán)",
        party: "Vegyes bolt",
        note: withGeneratedNote("POS kártya **** 1047 • magán"),
        occurred_at: personalOcc(1, 9),
        workspace: "personal",
        bank_raw_id: `demo:bankraw:${segmentId}:personal:mini:card`,
        expense_type: "WANT",
        tags: demoTags(segmentId, ["personal:mini"]),
      } as any),
      txn({
        id: `demo:${segmentId}:personal:mini:cash`,
        type: "expense",
        amount: 30_000,
        category: "cash",
        title: "KP felvét (magán)",
        party: "ATM",
        note: withGeneratedNote("ATM készpénz felvét • kp"),
        occurred_at: personalOcc(1, 11),
        workspace: "personal",
        bank_raw_id: `demo:bankraw:${segmentId}:personal:mini:cash`,
        expense_type: "VARIABLE_NEED",
        tags: demoTags(segmentId, ["personal:mini"]),
      } as any),
      txn({
        id: `demo:${segmentId}:personal:mini:manual`,
        type: "expense",
        amount: 7_500,
        category: "other",
        title: "Apró kiadás (kézi) (magán)",
        party: null,
        note: withGeneratedNote("Kézi tétel (nincs bank link)"),
        occurred_at: personalOcc(1, 13),
        workspace: "personal",
        bank_raw_id: null,
        expense_type: "VARIABLE_NEED",
        tags: demoTags(segmentId, ["personal:mini", "manual"]),
      } as any),
    );
  }

  // Utilities + maintenance linked to the primary residence
  txns.push(
    txn({
      id: `demo:${segmentId}:personal:${ymNow}:utilities`,
      type: "expense",
      amount: 48_000 + Math.round(rnd() * 22_000),
      category: "utilities",
      title: "Közüzem / rezsi (magán)",
      party: "Közmű",
      note: withGeneratedNote("Lakóingatlan rezsi • átutalás"),
      occurred_at: personalOcc(1),
      workspace: "personal",
      property_id: propHome,
      expense_type: "FIX_NEED",
      tags: demoTags(segmentId, ["personal:property"]),
      bank_raw_id: `demo:bankraw:${segmentId}:personal:${ymNow}:utilities`,
    } as any),
    txn({
      id: `demo:${segmentId}:personal:${ymNow}:maint`,
      type: "expense",
      amount: 35_000 + Math.round(rnd() * 55_000),
      category: "housing",
      title: "Karbantartás / javítás (magán)",
      party: "Szerelő",
      note: withGeneratedNote("POS kártya **** 8821 • lakóingatlan karbantartás"),
      occurred_at: personalOcc(3),
      workspace: "personal",
      property_id: propHome,
      expense_type: "VARIABLE_NEED",
      tags: demoTags(segmentId, ["personal:property"]),
      bank_raw_id: `demo:bankraw:${segmentId}:personal:${ymNow}:maint`,
    } as any),
  );
  // Optional rental income + related cost for demo1 (multisite operator) to test income-generating property
  if (segmentId === "demo1_multisite_operator") {
    txns.push(
      txn({
        id: `demo:${segmentId}:personal:rental:income`,
        type: "income",
        amount: 185_000,
        category: "other-income",
        title: "Bérleti díj (magán)",
        party: "Bérlő",
        note: withGeneratedNote("Kiadott ingatlan bérleti díj"),
        occurred_at: personalOcc(1, 2),
        workspace: "personal",
        property_id: propOther,
        tags: demoTags(segmentId, ["personal:rental"]),
        bank_raw_id: null,
      } as any),
      txn({
        id: `demo:${segmentId}:personal:rental:tax`,
        type: "expense",
        amount: 42_000,
        category: "other",
        title: "Ingatlan költség (magán)",
        party: "Közös költség",
        note: withGeneratedNote("Kiadott ingatlan költség"),
        occurred_at: personalOcc(1, 4),
        workspace: "personal",
        property_id: propOther,
        expense_type: "FIX_NEED",
        tags: demoTags(segmentId, ["personal:rental"]),
        bank_raw_id: null,
      } as any),
    );
  }

  // Resale deals: ensure the "Üzletek & Árrés" tab has real demo data in every segment.
  // 1 closed deal (purchase linked to revenue) + 1 open deal (purchase only).
  const resaleAt = new Date(Date.UTC(end.getFullYear(), end.getMonth() - 1, 19, 12, 0, 0)).toISOString();
  const resaleRevId = `demo:${segmentId}:resale:rev:1`;
  txns.push(
    txn({
      id: `demo:${segmentId}:resale:buy:1`,
      type: "expense",
      amount: segmentId === "demo1_multisite_operator" ? 310_000 : 185_000,
      category: "ANYAG: Továbbértékesítés",
      title: "Beszerzés: Továbbértékesítésre",
      party: "Beszállító",
      note: withGeneratedNote("Továbbértékesítés — vétel, kapcsolt bevétellel"),
      occurred_at: resaleAt,
      workspace: "Vállalkozás1",
      is_resale: true,
      customer_name:
        segmentId === "demo4_fine_dining_bistro"
          ? "Fine dining partner"
          : segmentId === "demo2_premium_nightlife"
            ? "Nightlife partner"
            : "B2B partner",
      linked_revenue_id: resaleRevId,
      expense_type: "VARIABLE_NEED",
      tags: demoTags(segmentId, ["resale:purchase"]),
    } as any),
    txn({
      id: resaleRevId,
      type: "income",
      amount: segmentId === "demo1_multisite_operator" ? 430_000 : 265_000,
      category: "ÉRTÉKESÍTÉS",
      title: "Továbbértékesítés bevétel",
      party: "Vevő",
      note: withGeneratedNote("Továbbértékesítés bevétel — lezárt ügylet"),
      occurred_at: new Date(Date.UTC(end.getFullYear(), end.getMonth() - 1, 22, 12, 0, 0)).toISOString(),
      workspace: "Vállalkozás1",
      tags: demoTags(segmentId, ["resale:revenue"]),
    } as any),
    txn({
      id: `demo:${segmentId}:resale:buy:open`,
      type: "expense",
      amount: segmentId === "demo2_premium_nightlife" ? 240_000 : 160_000,
      category: "ANYAG: Továbbértékesítés",
      title: "Beszerzés: Továbbértékesítésre (nyitott)",
      party: "Beszállító",
      note: withGeneratedNote("Továbbértékesítés — nyitott ügylet, még nincs bevétel"),
      occurred_at: new Date(Date.UTC(end.getFullYear(), end.getMonth() - 0, 8, 12, 0, 0)).toISOString(),
      workspace: "Vállalkozás1",
      is_resale: true,
      customer_name: "B2B partner",
      linked_revenue_id: null,
      expense_type: "VARIABLE_NEED",
      tags: demoTags(segmentId, ["resale:purchase", "resale:open"]),
    } as any),
  );

  // VAT-review: seed at least one item flagged for review so the VAT-review queue is testable.
  txns.push(
    txn({
      id: `demo:${segmentId}:vat_review:1`,
      type: "expense",
      amount: 92_000,
      category: "FEJLESZTÉS: Folyamatfejlesztés",
      title: "EU szolgáltatás / szoftver",
      party: "EU szolgáltató",
      note: withGeneratedNote("ÁFA kezelés: reverse charge (ellenőrzésre jelölve)"),
      occurred_at: new Date(Date.UTC(end.getFullYear(), end.getMonth() - 2, 11, 12, 0, 0)).toISOString(),
      workspace: "Vállalkozás1",
      vat_treatment: "reverse_charge",
      vat_review: true,
      vat_rate: 0,
      expense_type: "FIX_NEED",
      tags: demoTags(segmentId, ["vat:review"]),
    } as any),
  );

  // Assets: seed CAPEX + maintenance per asset so "Ingóságok" has visible cost.
  // (No new manual entry needed to test AssetTree.)
  const assetCapexBase =
    segmentId === "demo1_multisite_operator"
      ? 1.25
      : segmentId === "demo4_fine_dining_bistro"
        ? 1.15
        : segmentId === "demo5_pastry_gelato"
          ? 1.05
          : 1.0;
  const assetMoney = (n: number) => Math.round(n * assetCapexBase);
  const assetOcc = (monthOffset: number, day = 13) => {
    const dd = new Date(Date.UTC(end.getFullYear(), end.getMonth() - monthOffset, day, 12, 0, 0));
    return dd.toISOString();
  };
  for (const a of demoAssets as any[]) {
    const key = String(a.id).split(":").slice(-1)[0] ?? "asset";
    const capex =
      key === "company_pc"
        ? assetMoney(520_000)
        : key === "personal_laptop"
          ? assetMoney(420_000)
          : key.startsWith("cash_register")
            ? assetMoney(segmentId === "demo2_premium_nightlife" ? 420_000 : 260_000)
            : key === "kitchen_equipment" && segmentId === "demo4_fine_dining_bistro"
              ? assetMoney(1_600_000)
              : key === "kitchen_equipment" && segmentId === "demo2_premium_nightlife"
                ? assetMoney(980_000)
                : key === "kitchen_equipment" && segmentId === "demo5_pastry_gelato"
                  ? assetMoney(1_250_000)
                  : key === "kitchen_equipment" && segmentId === "demo6_event_catering_popup"
                    ? assetMoney(720_000)
                    : assetMoney(540_000);
    const maint = assetMoney(18_000 + Math.round(rnd() * 14_000));
    const m1 = 3 + Math.floor(rnd() * 10); // 3..12 months back
    const m2 = 1 + Math.floor(rnd() * 6); // 1..6 months back
    txns.push(
      txn({
        id: `demo:${segmentId}:asset:${key}:capex`,
        type: "expense",
        amount: capex,
        category: "BERUHÁZÁS: Eszköz beszerzés",
        title: `${String(a.name).replace("(demo)", "").trim()} beszerzés`,
        party: "Eszköz beszállító",
        note: withGeneratedNote(`CAPEX eszköz • ${key}`),
        occurred_at: assetOcc(m1, 9),
        workspace: "Vállalkozás1",
        asset_id: a.id,
        location_id: a.location_id ?? null,
        is_asset: true,
        expense_type: "INVESTMENT",
        cost_kind: "capex",
        tags: demoTags(segmentId, ["asset:capex"]),
      } as any),
      txn({
        id: `demo:${segmentId}:asset:${key}:maint`,
        type: "expense",
        amount: maint,
        category: "REZSI: Egyéb rezsi ktg.",
        title: `${String(a.name).replace("(demo)", "").trim()} karbantartás`,
        party: "Szerviz / karbantartás",
        note: withGeneratedNote(`Karbantartás • ${key}`),
        occurred_at: assetOcc(m2, 21),
        workspace: "Vállalkozás1",
        asset_id: a.id,
        location_id: a.location_id ?? null,
        expense_type: "FIX_NEED",
        cost_kind: "maintenance",
        tags: demoTags(segmentId, ["asset:maint"]),
      } as any),
    );
  }

  // Seed a few savings (bucket) transactions so Perselyek/Buckets are testable without manual entry.
  const bVat = (demoBuckets as any[]).find((b) => String(b.id).includes(":vat"))?.id ?? null;
  const bRun = (demoBuckets as any[]).find((b) => String(b.id).includes(":runway"))?.id ?? null;
  const bCapex = (demoBuckets as any[]).find((b) => String(b.id).includes(":capex"))?.id ?? null;
  const saveOcc = (monthOffset: number, day = 27) =>
    new Date(Date.UTC(end.getFullYear(), end.getMonth() - monthOffset, day, 12, 0, 0)).toISOString();
  if (bVat) {
    txns.push(
      txn({
        id: `demo:${segmentId}:saving:vat`,
        type: "saving",
        amount: 180_000 + Math.round(rnd() * 120_000),
        category: "Megtakarítás",
        title: "ÁFA tartalék félretétel",
        party: null,
        note: withGeneratedNote("Persely: ÁFA tartalék"),
        occurred_at: saveOcc(1),
        workspace: "Vállalkozás1",
        bucket_id: bVat,
        tags: demoTags(segmentId, ["bucket:vat"]),
      } as any),
    );
  }
  if (bRun) {
    txns.push(
      txn({
        id: `demo:${segmentId}:saving:runway`,
        type: "saving",
        amount: 260_000 + Math.round(rnd() * 180_000),
        category: "Megtakarítás",
        title: "Céltartalék-puffer félretétel",
        party: null,
        note: withGeneratedNote("Persely: céltartalék-puffer"),
        occurred_at: saveOcc(2),
        workspace: "Vállalkozás1",
        bucket_id: bRun,
        tags: demoTags(segmentId, ["bucket:runway"]),
      } as any),
    );
  }
  if (bCapex) {
    txns.push(
      txn({
        id: `demo:${segmentId}:saving:capex`,
        type: "saving",
        amount: 140_000 + Math.round(rnd() * 160_000),
        category: "Megtakarítás",
        title: "Eszközalap félretétel",
        party: null,
        note: withGeneratedNote("Persely: eszközalap"),
        occurred_at: saveOcc(3),
        workspace: "Vállalkozás1",
        bucket_id: bCapex,
        tags: demoTags(segmentId, ["bucket:capex"]),
      } as any),
    );
  }

  // Bank accounts + raw rows (so bank-related screens are testable without any manual input).
  // Keep everything demo-prefixed so purge/reset can wipe it.
  const bankAcc = await localdb.putBankAccount({
    id: `demo:bankacc:${segmentId}:huf`,
    name: segmentId === "demo2_premium_nightlife" ? "Üzleti számla (HUF) — bár" : "Üzleti számla (HUF)",
    iban: "11700000-00000000-00000000",
    currency: "HUF",
    bank_type: "MBH",
  });
  await localdb.setBankAccountWorkspaceMapping({ bank_account_id: bankAcc.id, workspace_id: "Vállalkozás1", enabled: true });

  const bankRawAt = (daysBack: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    return d.toISOString().slice(0, 10);
  };
  const rawRows = [
    {
      id: `demo:bankraw:${segmentId}:1`,
      workspace: "Vállalkozás1",
      bank_account_id: bankAcc.id,
      ingested_at: new Date().toISOString(),
      booking_date_iso: bankRawAt(2),
      value_date_iso: bankRawAt(2),
      amount_signed: -24850,
      currency: "HUF",
      booking_text: "POS kártya **** 7782",
      message: "Tankolás",
      partner: "Benzinkút",
      partner_account: "",
      source_file: "DEMO",
    },
    {
      id: `demo:bankraw:${segmentId}:2`,
      workspace: "Vállalkozás1",
      bank_account_id: bankAcc.id,
      ingested_at: new Date().toISOString(),
      booking_date_iso: bankRawAt(4),
      value_date_iso: bankRawAt(4),
      amount_signed: -72000,
      currency: "HUF",
      booking_text: "Belföldi Ft átut",
      message: "Könyvelés havi díj",
      partner: "Könyvelő iroda",
      partner_account: "",
      source_file: "DEMO",
    },
    {
      id: `demo:bankraw:${segmentId}:3`,
      workspace: "Vállalkozás1",
      bank_account_id: bankAcc.id,
      ingested_at: new Date().toISOString(),
      booking_date_iso: bankRawAt(6),
      value_date_iso: bankRawAt(6),
      amount_signed: -18900,
      currency: "HUF",
      booking_text: "Netbank utalás",
      message: "Telefon / mobil",
      partner: "Telekom",
      partner_account: "",
      source_file: "DEMO",
    },
    {
      id: `demo:bankraw:${segmentId}:4`,
      workspace: "Vállalkozás1",
      bank_account_id: bankAcc.id,
      ingested_at: new Date().toISOString(),
      booking_date_iso: bankRawAt(1),
      value_date_iso: bankRawAt(1),
      amount_signed: -5600,
      currency: "HUF",
      booking_text: "Számlavezetés + díjak",
      message: "Banki díjak",
      partner: "Bank",
      partner_account: "",
      source_file: "DEMO",
    },
    {
      id: `demo:bankraw:${segmentId}:5`,
      workspace: "Vállalkozás1",
      bank_account_id: bankAcc.id,
      ingested_at: new Date().toISOString(),
      booking_date_iso: bankRawAt(3),
      value_date_iso: bankRawAt(3),
      amount_signed: 186500,
      currency: "HUF",
      booking_text: "Jóváírás",
      message: "Napi bevétel",
      partner: "Ügyfél",
      partner_account: "",
      source_file: "DEMO",
    },
  ] as any[];
  for (const r of rawRows) {
    await localdb.putBankRaw(r);
  }

  // Create a few recent transactions linked to the seeded bank_raw rows (audit + channel filters).
  txns.push(
    txn({
      id: `demo:${segmentId}:banklink:fuel`,
      type: "expense",
      amount: 24_850,
      category: "FLOTTA: Tankolás",
      title: "Üzemanyag (banki)",
      party: "Benzinkút",
      note: withGeneratedNote("POS kártya **** 7782 • tankolás"),
      occurred_at: new Date(rawRows[0].booking_date_iso + "T12:00:00.000Z").toISOString(),
      workspace: "Vállalkozás1",
      bank_raw_id: rawRows[0].id,
      bank_account_id: bankAcc.id,
      expense_type: "VARIABLE_NEED",
      tags: demoTags(segmentId, ["bank:linked", "ch:card"]),
    } as any),
    txn({
      id: `demo:${segmentId}:banklink:accounting`,
      type: "expense",
      amount: 72_000,
      category: "REZSI: Könyvelés",
      title: "Könyvelés (banki)",
      party: "Könyvelő iroda",
      note: withGeneratedNote("Átutalás • könyvelés havi díj"),
      occurred_at: new Date(rawRows[1].booking_date_iso + "T12:00:00.000Z").toISOString(),
      workspace: "Vállalkozás1",
      bank_raw_id: rawRows[1].id,
      bank_account_id: bankAcc.id,
      expense_type: "FIX_NEED",
      tags: demoTags(segmentId, ["bank:linked", "ch:transfer"]),
    } as any),
    txn({
      id: `demo:${segmentId}:banklink:income`,
      type: "income",
      amount: 186_500,
      category: "ÉRTÉKESÍTÉS",
      title: "Napi bevétel (banki)",
      party: "Ügyfél",
      note: withGeneratedNote("Jóváírás • napi bevétel"),
      occurred_at: new Date(rawRows[4].booking_date_iso + "T12:00:00.000Z").toISOString(),
      workspace: "Vállalkozás1",
      bank_raw_id: rawRows[4].id,
      bank_account_id: bankAcc.id,
      tags: demoTags(segmentId, ["bank:linked", "ch:transfer"]),
    } as any),
  );

  // One profile: active leasing/loan + repayments so Debts/Runway panels become meaningful.
  if (segmentId === "demo1_multisite_operator") {
    const loanId = `demo:${segmentId}:loan:leasing-1`;
    const loanPayload: any = {
      workspace_id: "Vállalkozás1",
      name: "Autó lízing",
      type: "leasing",
      original_amount: 12_800_000,
      remaining_principal: 6_450_000,
      monthly_installment: 298_000,
      due_date: new Date(new Date().getFullYear() + 1, 11, 10).toISOString().slice(0, 10),
      payment_day_of_month: 10,
      interest_rate_percent: 11.5,
      status: "active",
      partner_name: "Lízing cég",
      frequency: "monthly",
      schedule: [],
    };
    const loanEnc = await encryptJSON(vaultKey, loanPayload);
    await localdb.putLoan({ id: loanId, data_enc: loanEnc });

    // Last 10 months repayments (actual) linked to loan_id
    const repayStart = new Date(end.getFullYear(), end.getMonth() - 10, 1);
    for (let i = 0; i < 10; i++) {
      const d = new Date(repayStart.getFullYear(), repayStart.getMonth() + i, 1);
      const y = d.getFullYear();
      const m1 = d.getMonth() + 1;
      const ym = `${y}-${String(m1).padStart(2, "0")}`;
      const atIso = new Date(Date.UTC(y, m1 - 1, 10, 12, 0, 0)).toISOString();
      const amt = 298_000 + Math.round(rnd() * 35_000);
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:leasing_repay`,
          type: "expense",
          amount: amt,
          category: "PÉNZÜGYI KIADÁSOK: Hitel törlesztés",
          title: "Lízing törlesztés",
          party: "Lízing cég",
          note: withGeneratedNote(`Havi törlesztés • ${ym}`),
          occurred_at: atIso,
          workspace: "Vállalkozás1",
          expense_type: "FIX_NEED",
          loan_id: loanId,
          loan_principal_paid: Math.round(amt * 0.72),
          tags: demoTags(segmentId, ["debt:leasing"]),
        } as any),
      );
    }
  }
  // Other profiles: seed a smaller working-capital loan + a few repayments so the Debts panel is always testable.
  if (segmentId !== "demo1_multisite_operator") {
    const loanId = `demo:${segmentId}:loan:wc-1`;
    const loanPayload: any = {
      workspace_id: "Vállalkozás1",
      name: "Forgóeszköz hitel",
      type: "loan",
      original_amount: segmentId === "demo4_fine_dining_bistro" ? 4_800_000 : 2_900_000,
      remaining_principal: segmentId === "demo4_fine_dining_bistro" ? 2_250_000 : 1_380_000,
      monthly_installment: segmentId === "demo2_premium_nightlife" ? 178_000 : 142_000,
      due_date: new Date(new Date().getFullYear() + 1, 8, 10).toISOString().slice(0, 10),
      payment_day_of_month: 10,
      interest_rate_percent: 12.9,
      status: "active",
      partner_name: "Bank",
      frequency: "monthly",
      schedule: [],
    };
    const loanEnc = await encryptJSON(vaultKey, loanPayload);
    await localdb.putLoan({ id: loanId, data_enc: loanEnc });

    // Last 6 months repayments linked to loan_id
    const repayStart = new Date(end.getFullYear(), end.getMonth() - 6, 1);
    for (let i = 0; i < 6; i++) {
      const d = new Date(repayStart.getFullYear(), repayStart.getMonth() + i, 1);
      const y = d.getFullYear();
      const m1 = d.getMonth() + 1;
      const ym = `${y}-${String(m1).padStart(2, "0")}`;
      const atIso = new Date(Date.UTC(y, m1 - 1, 10, 12, 0, 0)).toISOString();
      const amt = (loanPayload.monthly_installment ?? 140_000) + Math.round(rnd() * 18_000);
      txns.push(
        txn({
          id: `demo:${segmentId}:${ym}:wc_repay`,
          type: "expense",
          amount: amt,
          category: "PÉNZÜGYI KIADÁSOK: Hitel törlesztés",
          title: "Hitel törlesztés",
          party: "Bank",
          note: withGeneratedNote(`Havi törlesztés • ${ym}`),
          occurred_at: atIso,
          workspace: "Vállalkozás1",
          expense_type: "FIX_NEED",
          loan_id: loanId,
          loan_principal_paid: Math.round(amt * 0.68),
          tags: demoTags(segmentId, ["debt:loan"]),
        } as any),
      );
    }
  }

  // Project1: usage events + planned project transactions (so it demonstrates simulation)
  const usageEvents: any[] = [];
  const baseCount =
    segmentId === "demo1_multisite_operator"
      ? 240
      : segmentId === "demo2_premium_nightlife"
        ? 140
        : segmentId === "demo3_specialty_cafe_tea"
          ? 115
          : segmentId === "demo4_fine_dining_bistro"
            ? 155
            : segmentId === "demo5_pastry_gelato"
              ? 175
              : 190;

  // Add a small "recent history" (last 6 months)
  for (let i = 6; i >= 1; i--) {
    const { y, m1 } = addMonths(end.getFullYear(), end.getMonth() + 1, -i);
    const at = isoYmd(y, m1, 15);
    const sf = seasonFactor(segmentId, m1);
    const c = Math.round(baseCount * clamp(0.75 + 0.5 * sf, 0.15, 1.8) * clamp(0.9 + rnd() * 0.25, 0.8, 1.25));
    usageEvents.push({
      id: `demo:${segmentId}:${String(at).slice(0, 7)}:use:inc`,
      template_id: "tpl_uplift_income",
      at,
      count: Math.max(0, c),
      workspace: "Projekt1",
    });
    usageEvents.push({
      id: `demo:${segmentId}:${String(at).slice(0, 7)}:use:exp`,
      template_id: "tpl_uplift_cost",
      at,
      count: Math.max(0, c),
      workspace: "Projekt1",
    });
  }

  // Seed a minimal ACTUAL baseline for Project1 in the last 90 days so the What‑If chart has something to work with.
  const projectBaselineTxns: Transaction[] = [];
  for (let back = 2; back >= 0; back--) {
    const { y, m1 } = addMonths(end.getFullYear(), end.getMonth() + 1, -back);
    const ym = `${y}-${String(m1).padStart(2, "0")}`;
    const atIso = new Date(Date.UTC(y, m1 - 1, 15, 12, 0, 0)).toISOString();
    const sf = seasonFactor(segmentId, m1);
    const noise = clamp(0.9 + rnd() * 0.2, 0.85, 1.15);
    const baselineFactor =
      segmentId === "demo1_multisite_operator"
        ? 0.62
        : segmentId === "demo6_event_catering_popup"
          ? 0.55
          : segmentId === "demo5_pastry_gelato"
            ? 0.6
            : 0.5;
    const count = Math.round(
      clamp(baseCount * baselineFactor * clamp(0.8 + 0.45 * sf, 0.2, 1.9) * noise, 0, 220),
    );
    const u = projectUnit(segmentId);
    const unitInc = u.inc;
    const unitCost = u.cost;
    const inc = Math.round(Math.max(0, count) * unitInc);
    const exp = Math.round(Math.max(0, count) * unitCost);
    projectBaselineTxns.push(
      txn({
        id: `demo:${segmentId}:proj_base:${ym}:income`,
        type: "income",
        amount: inc,
        category: "ÉRTÉKESÍTÉS",
        title: "Projekt1 — baseline bevétel",
        party: "Vevők (szimulált)",
        note: withGeneratedNote(`Baseline (actual) • mennyiség: ${Math.max(0, count)} • ${ym}`),
        occurred_at: atIso,
        workspace: "Projekt1",
        status: "actual",
        tags: demoTags(segmentId, ["project:baseline", "status:actual"]),
      } as any),
      txn({
        id: `demo:${segmentId}:proj_base:${ym}:expense`,
        type: "expense",
        amount: exp,
        category: "EGYEBEK: Program költség",
        title: "Projekt1 — baseline költség",
        party: "Vegyes költség",
        note: withGeneratedNote(`Baseline (actual) • egységköltség proxy • ${ym}`),
        occurred_at: atIso,
        workspace: "Projekt1",
        status: "actual",
        expense_type: "VARIABLE_NEED",
        tags: demoTags(segmentId, ["project:baseline", "status:actual"]),
      } as any),
    );
  }

  if (isStrategySegment(segmentId)) {
    const overlayAt = new Date(Date.UTC(end.getFullYear(), end.getMonth(), 12, 12, 0, 0)).toISOString();
    if (segmentId === "demo8_strategy_new_line") {
      projectBaselineTxns.push(
        txn({
          id: `demo:${segmentId}:overlay:wc`,
          type: "expense",
          amount: 1_850_000,
          category: "BESZERZÉS: Alapanyag",
          title: "Előszerződött alapanyag — likviditási kötés",
          party: "Keretszerződéses nagyker",
          note: withGeneratedNote("Optimista ág csapdája: a készlet előre viszi a pénzt."),
          occurred_at: overlayAt,
          workspace: "Projekt1",
          status: "actual",
          expense_type: "VARIABLE_NEED",
          muda_type: "NONE",
          tags: demoTags(segmentId, ["strategy:overlay", "strategy:liquidity-trap"]),
        } as any),
      );
    } else if (segmentId === "demo9_strategy_input_inflation") {
      projectBaselineTxns.push(
        txn({
          id: `demo:${segmentId}:overlay:infl`,
          type: "expense",
          amount: 980_000,
          category: "BESZERZÉS: Alapanyag",
          title: "Árinflációs felár — beszerzés",
          party: "Keretszerződéses nagyker",
          note: withGeneratedNote("Realista ág: fokozatos drágulás, árrés-nyomás."),
          occurred_at: overlayAt,
          workspace: "Projekt1",
          status: "actual",
          expense_type: "VARIABLE_NEED",
          tags: demoTags(segmentId, ["strategy:overlay", "strategy:inflation"]),
        } as any),
      );
    } else if (segmentId === "demo19_strategy_kahn_fork") {
      const day = (d: number) =>
        new Date(Date.UTC(end.getFullYear(), end.getMonth(), d, 12, 0, 0)).toISOString();
      projectBaselineTxns.push(
        txn({
          id: `demo:${segmentId}:overlay:option`,
          type: "expense",
          amount: KAHN_FORK.optionFeeHuf,
          category: "FEJLESZTÉS: Folyamatfejlesztés",
          title: "Kapacitás-opció — döntési fa nyitva tartása",
          party: "Gépsor / 2. műszak (copacker)",
          note: withGeneratedNote("Kahn: az opciók költsége, mielőtt egy ágat viszel — nem jóslat."),
          occurred_at: day(8),
          workspace: "Projekt1",
          status: "actual",
          expense_type: "INVESTMENT",
          tags: demoTags(segmentId, ["strategy:overlay", "strategy:kahn-option"]),
        } as any),
        txn({
          id: `demo:${segmentId}:overlay:deposit`,
          type: "expense",
          amount: KAHN_FORK.capacityDepositHuf,
          category: "BESZERZÉS: Beruházás",
          title: "Gépsor / 2. műszak foglaló — bővítési ág",
          party: "Gépsor / 2. műszak (copacker)",
          note: withGeneratedNote("Bővítési út: előre kötött kapacitás — csak ha ezt az ágat viszed."),
          occurred_at: day(12),
          workspace: "Projekt1",
          status: "planned",
          expense_type: "INVESTMENT",
          tags: demoTags(segmentId, ["strategy:overlay", "strategy:kahn-capacity"]),
        } as any),
        txn({
          id: `demo:${segmentId}:overlay:interest-a`,
          type: "expense",
          amount: KAHN_FORK.contractA.monthlyInterestHuf,
          category: "PÉNZÜGY: Kamat / díj",
          title: "Hitel A — havi kamat (olcsó + kötbéres)",
          party: "Bank A — olcsó + kötbéres",
          note: withGeneratedNote(
            `A konstrukció: ${KAHN_FORK.contractA.monthlyRatePct}%/hó, ${KAHN_FORK.contractA.lockMonths} hó zár.`,
          ),
          occurred_at: day(15),
          workspace: "Projekt1",
          status: "planned",
          expense_type: "FIXED_NEED",
          tags: demoTags(segmentId, ["strategy:overlay", "strategy:kahn-loan-a"]),
        } as any),
        txn({
          id: `demo:${segmentId}:overlay:interest-b`,
          type: "expense",
          amount: KAHN_FORK.contractB.monthlyInterestHuf,
          category: "PÉNZÜGY: Kamat / díj",
          title: "Hitel B — havi kamat (drága + rugalmas)",
          party: "Bank B — drága + rugalmas",
          note: withGeneratedNote(
            `B konstrukció: ${KAHN_FORK.contractB.monthlyRatePct}%/hó, előtörlesztés szabad, kötbér 0.`,
          ),
          occurred_at: day(16),
          workspace: "Projekt1",
          status: "planned",
          expense_type: "FIXED_NEED",
          tags: demoTags(segmentId, ["strategy:overlay", "strategy:kahn-loan-b"]),
        } as any),
        txn({
          id: `demo:${segmentId}:overlay:organic`,
          type: "expense",
          amount: KAHN_FORK.organicMonthlyCommitHuf,
          category: "FEJLESZTÉS: Folyamatfejlesztés",
          title: "Organikus kötés — 1. hó (törzsből)",
          party: "Core vevők (baseline)",
          note: withGeneratedNote(
            `Organikus ág: ${KAHN_FORK.organicCommitMonths} hó × belső cash-kötés, kamat/kötbér nélkül.`,
          ),
          occurred_at: day(18),
          workspace: "Projekt1",
          status: "planned",
          expense_type: "INVESTMENT",
          tags: demoTags(segmentId, ["strategy:overlay", "strategy:kahn-organic"]),
        } as any),
        txn({
          id: `demo:${segmentId}:overlay:penalty`,
          type: "expense",
          amount: KAHN_FORK.contractA.exitPenaltyHuf,
          category: "PÉNZÜGY: Kötbér / kilépés",
          title: "Hitel A — szimulált kilépési kötbér (pesszimista)",
          party: "Bank A — olcsó + kötbéres",
          note: withGeneratedNote(
            "Pesszimista stop-loss: az olcsó hitel a kilépésnél drága. Kahn: a nehéz sávot előbb számolod.",
          ),
          occurred_at: day(22),
          workspace: "Projekt1",
          status: "planned",
          expense_type: "INVESTMENT",
          tags: demoTags(segmentId, ["strategy:overlay", "strategy:kahn-penalty"]),
        } as any),
        txn({
          id: `demo:${segmentId}:overlay:draw`,
          type: "income",
          amount: KAHN_FORK.loanDrawHuf,
          category: "PÉNZÜGY: Hitel lehívás",
          title: "Bővítési hitel lehívás — 4,5 M Ft",
          party: "Bank A — olcsó + kötbéres",
          note: withGeneratedNote("Hitelág cash-in: a projekt örökli a törzset, ez csak a döntés rétege."),
          occurred_at: day(10),
          workspace: "Projekt1",
          status: "planned",
          tags: demoTags(segmentId, ["strategy:overlay", "strategy:kahn-draw"]),
        } as any),
      );
    } else {
      projectBaselineTxns.push(
        txn({
          id: `demo:${segmentId}:overlay:entry`,
          type: "expense",
          amount: 720_000,
          category: "FEJLESZTÉS: Folyamatfejlesztés",
          title: "Új piaci belépés — core finanszírozás",
          party: "Új piaci disztribútor",
          note: withGeneratedNote("A Master Baseline üzem tartja a belépést."),
          occurred_at: overlayAt,
          workspace: "Projekt1",
          status: "actual",
          expense_type: "INVESTMENT",
          tags: demoTags(segmentId, ["strategy:overlay", "strategy:new-market"]),
        } as any),
        txn({
          id: `demo:${segmentId}:overlay:muda`,
          type: "expense",
          amount: 210_000,
          category: "EGYEBEK: Program költség",
          title: "Pazarlás a belépésen — muda",
          party: "Vegyes költség",
          note: withGeneratedNote("Pesszimista ág: stop-loss előtt vágandó tétel."),
          occurred_at: overlayAt,
          workspace: "Projekt1",
          status: "actual",
          expense_type: "WANT",
          muda_type: "WASTE",
          tags: demoTags(segmentId, ["strategy:overlay", "strategy:muda"]),
        } as any),
      );
    }
  }

  if (isResilienceSegment(segmentId) && segmentId !== "demo14_resilience_demography") {
    const overlayAt = new Date(Date.UTC(end.getFullYear(), end.getMonth(), 12, 12, 0, 0)).toISOString();
    projectBaselineTxns.push(
      txn({
        id: `demo:${segmentId}:overlay:drill`,
        type: "expense",
        amount: segmentId === "demo13_resilience_home_blackout" ? 42_000 : 96_000,
        category: "FEJLESZTÉS: Folyamatfejlesztés",
        title:
          segmentId === "demo11_resilience_saas_outage"
            ? "BCP gyakorlat — local-first élesítés"
            : segmentId === "demo12_resilience_community_grid"
              ? "Lajtoskocsi + LoRa mesh gyakorlat"
              : "Háztartási működési tartalék feltöltés",
        party: "Reziliencia-gyakorlat",
        note: withGeneratedNote("Fizikai mutatók a PDCA-ban; ez csak a gyakorlat rögzített költsége."),
        occurred_at: overlayAt,
        workspace: segmentId === "demo13_resilience_home_blackout" ? "personal" : "Projekt1",
        status: "actual",
        expense_type: "INVESTMENT",
        tags: demoTags(segmentId, ["resilience:overlay", "resilience:drill"]),
      } as any),
    );
  }

  if (isEducationSegment(segmentId)) {
    const overlayAt = new Date(Date.UTC(end.getFullYear(), end.getMonth(), 12, 12, 0, 0)).toISOString();
    const edu =
      segmentId === "demo15_edu_startup_cashflow"
        ? { amount: 86_000, title: "Inkubátor-díj + muda a változón", extra: "edu:burn" }
        : segmentId === "demo16_edu_lean_vsm"
          ? { amount: 124_000, title: "SMED + Poka-Yoke bevezetés", extra: "edu:smed" }
          : segmentId === "demo17_edu_campus_energy"
            ? { amount: 78_000, title: "Hőhullám-csúcs — kvóta-túllépés", extra: "edu:quota" }
            : { amount: 156_000, title: "Izoláció + analóg vizsga-protokoll", extra: "edu:iso" };
    projectBaselineTxns.push(
      txn({
        id: `demo:${segmentId}:overlay:edu`,
        type: "expense",
        amount: edu.amount,
        category: "FEJLESZTÉS: Folyamatfejlesztés",
        title: edu.title,
        party: "Oktatási tréning",
        note: withGeneratedNote("Pénzügyi sáv + Lean / Poka-Yoke mikro a PDCA-ban."),
        occurred_at: overlayAt,
        workspace: "Projekt1",
        status: "actual",
        expense_type: "INVESTMENT",
        tags: demoTags(segmentId, ["education:overlay", edu.extra]),
      } as any),
    );
  }

  if (isIndustrySegment(segmentId)) {
    const overlayAt = new Date(Date.UTC(end.getFullYear(), end.getMonth(), 12, 12, 0, 0)).toISOString();
    const kind = industryCaseById(segmentId).kind;
    const row =
      kind === "hospital"
        ? { amount: 186_000, title: "Blackout-gyakorlat — aggregátor + UPS", extra: "ind:hospital" }
        : kind === "supply"
          ? { amount: 248_000, title: "Helyettesítő anyag + SMED", extra: "ind:supply" }
          : kind === "quality"
            ? { amount: 312_000, title: "Tétel-elhatárolás + Poka-Yoke", extra: "ind:quality" }
            : kind === "wms"
              ? { amount: 164_000, title: "Papír / vonalkód BCP a dokkon", extra: "ind:wms" }
              : kind === "fuel"
                ? { amount: 420_000, title: "Dízelugrás — üres km muda", extra: "ind:fuel" }
                : kind === "tax"
                  ? { amount: 380_000, title: "Adósokk — árrés-lyuk", extra: "ind:tax" }
                  : { amount: 210_000, title: "Local-first migráció — belső óra", extra: "ind:saas" };
    projectBaselineTxns.push(
      txn({
        id: `demo:${segmentId}:overlay:industry`,
        type: "expense",
        amount: row.amount,
        category: "FEJLESZTÉS: Folyamatfejlesztés",
        title: row.title,
        party: "Iparági gyakorlat",
        note: withGeneratedNote("Lean / BCP / local-first mikro a PDCA-ban."),
        occurred_at: overlayAt,
        workspace: "Projekt1",
        status: "actual",
        expense_type: "INVESTMENT",
        tags: demoTags(segmentId, ["industry:overlay", row.extra]),
      } as any),
    );
  }

  // Seed next 36 months for Project1 simulation (so users can "simulate 3 years")
  const projectTxns: Transaction[] = [];
  const projStart = new Date(end.getFullYear(), end.getMonth() + 1, 1); // next month
  for (let i = 0; i < 36; i++) {
    const d = new Date(projStart.getFullYear(), projStart.getMonth() + i, 1);
    const y = d.getFullYear();
    const m1 = d.getMonth() + 1;
    const ym = `${y}-${String(m1).padStart(2, "0")}`;
    const atIso = new Date(Date.UTC(y, m1 - 1, 15, 12, 0, 0)).toISOString();

    // Ramp-up curve: cautious start → mid adoption → stable.
    const ramp =
      i < 4 ? 0.35 + i * 0.12 : i < 12 ? 0.85 + (i - 4) * 0.03 : 1.1 + Math.min(0.35, (i - 12) * 0.01);
    const sf = seasonFactor(segmentId, m1);
    const noise = clamp(0.92 + rnd() * 0.18, 0.9, 1.15);
    const maxCount =
      segmentId === "demo1_multisite_operator"
        ? 240
        : segmentId === "demo6_event_catering_popup"
          ? 210
          : segmentId === "demo5_pastry_gelato"
            ? 220
            : 180;
    const countRaw = baseCount * ramp * clamp(0.8 + 0.45 * sf, 0.2, 1.9) * noise;
    const count = Math.round(clamp(countRaw, 0, maxCount));

    // Keep it generic: "new natural profile" uplift vs variable cost
    const u = projectUnit(segmentId);
    const unitInc = u.inc; // net HUF / use (model)
    const unitCost = u.cost; // net HUF / use (model)
    const inc = Math.round(Math.max(0, count) * unitInc);
    const exp = Math.round(Math.max(0, count) * unitCost);

    projectTxns.push(
      txn({
        id: `demo:${segmentId}:proj:${ym}:income`,
        type: "income",
        amount: inc,
        category: "ÉRTÉKESÍTÉS",
        title: "Projekt1 — uplift bevétel (modell)",
        party: "Vevők (szimulált)",
        note: withGeneratedNote(`Új természetes profil (modell) • mennyiség: ${Math.max(0, count)} • ${ym}`),
        occurred_at: atIso,
        workspace: "Projekt1",
        status: "planned",
        tags: demoTags(segmentId, ["project:planned"]),
      } as any),
      txn({
        id: `demo:${segmentId}:proj:${ym}:expense`,
        type: "expense",
        amount: exp,
        category: "EGYEBEK: Program költség",
        title: "Projekt1 — változó költség (modell)",
        party: "Vegyes költség",
        note: withGeneratedNote(`Új természetes profil (modell) • egységköltség proxy • ${ym}`),
        occurred_at: atIso,
        workspace: "Projekt1",
        status: "planned",
        expense_type: "VARIABLE_NEED",
        tags: demoTags(segmentId, ["project:planned"]),
      } as any),
    );

    // Also add usage events (within the planner UX) for the next 36 months
    const at = isoYmd(y, m1, 15);
    usageEvents.push({
      id: `demo:${segmentId}:${ym}:use:inc:fwd`,
      template_id: "tpl_uplift_income",
      at,
      count: Math.max(0, count),
      workspace: "Projekt1",
    });
    usageEvents.push({
      id: `demo:${segmentId}:${ym}:use:exp:fwd`,
      template_id: "tpl_uplift_cost",
      at,
      count: Math.max(0, count),
      workspace: "Projekt1",
    });
  }

  // Persist updated settings with usageEvents (planner)
  const settingsEnc2 = await encryptJSON(vaultKey, { ...(nextSettings as any), usageEvents } as any);
  await localdb.putSettings(settingsEnc2);

  // Seed a few category rules to demonstrate auto-suggestion (DEMO only).
  try {
    await localdb.putCategoryRule({
      id: `demo:${segmentId}:rule:pack`,
      workspace_id: "Vállalkozás1",
      keyword: "csomagol",
      match_field: "any",
      operator: "contains",
      pattern: "csomagol",
      target_category: "BESZERZÉS: Csomagolás",
      target_partner: "Csomagolóanyag beszállító",
      target_type: "expense",
      target_tags: [DEMO_GENERATED_TAG, "rule:packaging"],
      target_expense_type: "VARIABLE_NEED",
      target_muda_type: "NONE",
      target_is_recurring: null,
      is_active: true,
    } as any);
    await localdb.putCategoryRule({
      id: `demo:${segmentId}:rule:courier`,
      workspace_id: "Vállalkozás1",
      keyword: "futár",
      match_field: "any",
      operator: "contains",
      pattern: "futár",
      target_category: "BESZERZÉS: Kiszállítás",
      target_partner: "Futár / logisztika",
      target_type: "expense",
      target_tags: [DEMO_GENERATED_TAG, "rule:courier"],
      target_expense_type: "VARIABLE_NEED",
      target_muda_type: "NONE",
      target_is_recurring: null,
      is_active: true,
    } as any);
    await localdb.putCategoryRule({
      id: `demo:${segmentId}:rule:lab`,
      workspace_id: "Vállalkozás1",
      keyword: "labor",
      match_field: "any",
      operator: "contains",
      pattern: "labor",
      target_category: "FEJLESZTÉS: Folyamatfejlesztés",
      target_partner: "Labor / vizsgálat",
      target_type: "expense",
      target_tags: [DEMO_GENERATED_TAG, "rule:lab"],
      target_expense_type: "VARIABLE_NEED",
      target_muda_type: "NONE",
      target_is_recurring: null,
      is_active: true,
    } as any);
  } catch {
    // best-effort demo only
  }

  for (const t of [...txns, ...projectBaselineTxns, ...projectTxns]) {
    const data_enc = await encryptJSON(vaultKey, t);
    await localdb.putTxn({
      id: t.id,
      type: t.type,
      occurred_at: t.occurred_at,
      data_enc,
    });
  }

  // Seed a couple of snapshots so "Mentés & Helyreállítás" is immediately testable in demos.
  try {
    const fullEnc = await localdb.exportEncryptedData({ scope: "ALL" });
    const fullSnap = await encryptJSON(vaultKey, fullEnc);
    await localdb.putSnapshot({
      label: `[DEMO] Full snapshot — ${segmentId} @ ${new Date().toISOString()}`,
      data_enc: fullSnap,
    });
    const bizEnc = await localdb.exportEncryptedData({ scope: "Vállalkozás1" });
    const bizSnap = await encryptJSON(vaultKey, bizEnc);
    await localdb.putSnapshot({
      label: `[DEMO] Workspace snapshot — Vállalkozás1 — ${segmentId} @ ${new Date().toISOString()}`,
      data_enc: bizSnap,
    });
  } catch {
    // best-effort demo only
  }
}

export async function purgeDemoGeneratedDataForActiveProfile(): Promise<void> {
  const vaultKey = await getVaultKeyFromSession();

  // Delete seeded transactions (IDs are prefixed with "demo:")
  const rows = await localdb.listTxns();
  for (const r of rows) {
    if (String(r.id).startsWith("demo:")) {
      await localdb.deleteTxn(r.id);
    }
  }

  // Delete seeded goals (IDs are prefixed with "demo:")
  try {
    const goals = await localdb.listGoals();
    for (const g of goals) {
      if (String(g.id).startsWith("demo:")) {
        await localdb.deleteGoal(g.id);
      }
    }
  } catch {
    // ignore
  }

  // Delete seeded loans (IDs are prefixed with "demo:")
  const loans = await localdb.listLoans();
  for (const l of loans) {
    if (String(l.id).startsWith("demo:")) {
      await localdb.deleteLoan(l.id);
    }
  }

  // Delete seeded rules (IDs are prefixed with "demo:")
  try {
    const rules = await localdb.listCategoryRules();
    for (const r of rules) {
      if (String(r.id).startsWith("demo:")) {
        await localdb.deleteCategoryRule(r.id);
      }
    }
  } catch {
    // ignore
  }

  // Delete seeded bank raw rows / accounts (IDs are demo-prefixed).
  try {
    const raws = await localdb.listBankRaw();
    for (const r of raws) {
      if (String(r.id).startsWith("demo:")) await localdb.deleteBankRaw(r.id);
    }
  } catch {
    // ignore
  }
  try {
    const accs = await localdb.listBankAccounts();
    for (const a of accs) {
      if (String(a.id).startsWith("demo:")) await localdb.deleteBankAccount(a.id);
    }
  } catch {
    // ignore
  }

  // Delete demo snapshots (label is prefixed with "[DEMO]").
  try {
    const snaps = await localdb.listSnapshots();
    for (const s of snaps) {
      if (String(s.label ?? "").startsWith("[DEMO]")) await localdb.deleteSnapshot(s.id);
    }
  } catch {
    // ignore
  }

  // Reset *only* demo-planning master data to avoid mixing, but keep workspace shells.
  const row = await localdb.getSettings();
  let cur: any = null;
  if (row?.data_enc) {
    try {
      cur = await decryptJSON<any>(vaultKey, row.data_enc);
    } catch {
      cur = null;
    }
  }

  const seg = String(cur?.__demo?.segmentId ?? "").trim() as any;
  const baseWorkspaces = isDemoSegmentId(seg)
    ? workspaceDefaults(seg)
    : (cur?.workspaces ?? workspaceDefaults(DEMO_SEGMENTS[0]!.id));

  const clean: any = {
    ...EMPTY_SETTINGS,
    workspaces: baseWorkspaces,
    // keep references, but clear planner-like lists
    recurring: [],
    plannedOneOff: [],
    usageTemplates: [],
    usageEvents: [],
    projects: [],
    assets: [],
    locations: cur?.locations ?? [],
  };
  clean.__demo = null;

  const enc = await encryptJSON(vaultKey, clean);
  await localdb.putSettings(enc);
}

