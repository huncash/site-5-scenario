/**
 * Privát árazási mátrix: csomag vs. JIT-legó, duplázás vs. 2 csomag, A/B/C pályák.
 * Csak localhost `/admin/monetization-sim`.
 */
import {
  ENTERPRISE_CASE_ADDON_HUF,
  JIT_ADDON_PRICES,
  PLANS_CONFIG,
  jitAddonPriceForPlan,
  totalSlots,
} from "@/config/plans";
import { INSTALLMENT2_DUE_DAYS, splitEqualParts } from "@/lib/installmentPlan";

export const LEGO_PLAN_IDS = ["starter", "pro", "expert"] as const;
export type LegoPlanId = (typeof LEGO_PLAN_IDS)[number];

export type CapacityKey = "cases" | "slots" | "seats" | "guests";

export type CapacityLine = {
  key: CapacityKey;
  labelHu: string;
  qty: number;
  unitHuf: number;
  lineHuf: number;
};

export const PUBLIC_JIT_ROWS = [
  { id: "case_plus_1" as const, labelHu: "+1 Extra aktív case", priceHuf: JIT_ADDON_PRICES.case_plus_1 },
  { id: "slot_plus_1" as const, labelHu: "+1 Extra aktív slot", priceHuf: JIT_ADDON_PRICES.slot_plus_1 },
  { id: "seat_plus_1" as const, labelHu: "+1 Extra szerkesztő", priceHuf: JIT_ADDON_PRICES.seat_plus_1 },
  { id: "guest_plus_1" as const, labelHu: "+1 Extra vendégfiók", priceHuf: JIT_ADDON_PRICES.guest_plus_1 },
  { id: "edge_sensor" as const, labelHu: "Szenzoros / Edge adatgyűjtő", priceHuf: JIT_ADDON_PRICES.edge_sensor },
] as const;

const CAP_LABEL: Record<CapacityKey, string> = {
  cases: "Aktív case",
  slots: "Aktív slot (összesen)",
  seats: "Szerkesztő",
  guests: "Vendégfiók",
};

export function formatNetHuf(n: number): string {
  return `${Math.round(n).toLocaleString("hu-HU")} Ft`;
}

export function formatPct(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1).replace(".", ",")}%`;
}

function planQty(id: LegoPlanId): { cases: number; slots: number; seats: number; guests: number } {
  const plan = PLANS_CONFIG[id];
  const cases = plan.quotas.cases === "unlimited" ? 0 : plan.quotas.cases;
  return {
    cases,
    slots: totalSlots(plan),
    seats: plan.quotas.seats,
    guests: plan.quotas.guests,
  };
}

function listUnit(key: CapacityKey): number {
  if (key === "cases") return JIT_ADDON_PRICES.case_plus_1;
  if (key === "slots") return JIT_ADDON_PRICES.slot_plus_1;
  if (key === "seats") return JIT_ADDON_PRICES.seat_plus_1;
  return JIT_ADDON_PRICES.guest_plus_1;
}

function billUnit(id: LegoPlanId, key: CapacityKey): number {
  if (key === "cases") return jitAddonPriceForPlan("case_plus_1", id);
  return listUnit(key);
}

function capacityLines(id: LegoPlanId, unit: (key: CapacityKey) => number): CapacityLine[] {
  const q = planQty(id);
  return (["cases", "slots", "seats", "guests"] as const).map((key) => ({
    key,
    labelHu: CAP_LABEL[key],
    qty: q[key],
    unitHuf: unit(key),
    lineHuf: q[key] * unit(key),
  }));
}

export type PlanLegoRow = {
  id: LegoPlanId;
  label: string;
  recommended: boolean;
  y1: number;
  y2: number;
  y3: number;
  sum3y: number;
  lines: CapacityLine[];
  /** Listaáras JIT-legó (Pro Case 49k). */
  legoListHuf: number;
  /** Számlázható JIT-legó (Enterprise Case 39k). */
  legoBillHuf: number;
  bundleGapListHuf: number;
  bundleGapListPct: number;
  doubleListHuf: number;
  doubleBillHuf: number;
  twoPackY1: number;
  twoPack3y: number;
  own3yPlusDoubleList: number;
  own3yPlusDoubleBill: number;
};

export function buildPlanLego(id: LegoPlanId): PlanLegoRow {
  const plan = PLANS_CONFIG[id];
  const ladder = plan.loyaltyLadder!;
  const y1 = ladder.year1.huf;
  const y2 = ladder.year2.huf;
  const y3 = ladder.year3.huf;
  const sum3y = y1 + y2 + y3;
  const lines = capacityLines(id, listUnit);
  const legoListHuf = lines.reduce((s, l) => s + l.lineHuf, 0);
  const legoBillHuf = capacityLines(id, (k) => billUnit(id, k)).reduce((s, l) => s + l.lineHuf, 0);
  const doubleListHuf = legoListHuf;
  const doubleBillHuf = legoBillHuf;
  return {
    id,
    label: plan.label,
    recommended: plan.badge === "recommended",
    y1,
    y2,
    y3,
    sum3y,
    lines,
    legoListHuf,
    legoBillHuf,
    bundleGapListHuf: legoListHuf - y1,
    bundleGapListPct: legoListHuf === 0 ? 0 : ((legoListHuf - y1) / legoListHuf) * 100,
    doubleListHuf,
    doubleBillHuf,
    twoPackY1: y1 * 2,
    twoPack3y: sum3y * 2,
    own3yPlusDoubleList: sum3y + doubleListHuf,
    own3yPlusDoubleBill: sum3y + doubleBillHuf,
  };
}

export function buildAllPlanLego(): PlanLegoRow[] {
  return LEGO_PLAN_IDS.map(buildPlanLego);
}

/** Opció A: örök + 1 év frissítés — egyszeri vagy 2 egyenlő részlet 60 napon belül. */
export type OptionAPayPlan = {
  id: LegoPlanId;
  y1: number;
  lump: number;
  parts: [number, number];
  dueDays: number;
};

export function optionAPayFor(id: LegoPlanId): OptionAPayPlan {
  const row = buildPlanLego(id);
  const parts = splitEqualParts(row.y1) as [number, number];
  return {
    id,
    y1: row.y1,
    lump: row.y1,
    parts,
    dueDays: INSTALLMENT2_DUE_DAYS,
  };
}

/** Opció B: opcionális Y2+ éves frissítés a meglévő örök licenc mellé. */
export type OptionBUpdatePlan = {
  id: LegoPlanId;
  y2: number;
  y3: number;
  y4: 0;
};

export function optionBUpdateFor(id: LegoPlanId): OptionBUpdatePlan {
  const row = buildPlanLego(id);
  return { id, y2: row.y2, y3: row.y3, y4: 0 };
}

export const ENTERPRISE_CASE_JIT_HUF = ENTERPRISE_CASE_ADDON_HUF;
export const EDGE_JIT_HUF = JIT_ADDON_PRICES.edge_sensor;
