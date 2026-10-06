/**
 * Pricing façade — kapacitás / ár / összehasonlítás a `PLANS_CONFIG`-ból.
 * Új korlátot vagy jogot a `src/config/plans.ts`-ben állíts.
 */

import { formatCurrency } from "@/i18n/currency";
import {
  getPlan,
  getPublicPlans,
  isPublicPlanId,
  PLANS_CONFIG,
  yearlyPriceHuf as yearlyFromPlans,
  YEARLY_DISCOUNT_PCT as YEARLY_FROM_PLANS,
  type PlanQuotas,
  type PublicPlanId,
} from "@/config/plans";
import { buildPricingCompareRows, buildStandardTierCopy, planAudience, planHighlights, planSlogan } from "@/config/planCopy";

export type TierId = PublicPlanId;

export type TierCore = {
  id: TierId;
  label: string;
  badge?: "Ajánlott" | "Multi‑site";
};

export type TierCopy = {
  tagline: string;
  description: string;
  includes: string[];
  limits: string[];
};

export type TierOffer = TierCore & TierCopy;

export type TierCapacity = {
  cases: number;
  slotsPerCase: number;
  editors: number;
  guests: number;
  bankAccountsPerSlot: number | "unlimited";
};

function quotasToCapacity(q: PlanQuotas): TierCapacity {
  return {
    cases: q.cases === "unlimited" ? 999 : q.cases,
    slotsPerCase: q.slotsPerCase,
    editors: q.seats,
    guests: q.guests,
    bankAccountsPerSlot: q.bankAccountsPerSlot,
  };
}

/** @deprecated Prefer `planQuotas` / `getPlan` from `@/config/plans`. */
export const TIER_CAPACITY: Record<TierId, TierCapacity> = {
  starter: quotasToCapacity(PLANS_CONFIG.starter.quotas),
  pro: quotasToCapacity(PLANS_CONFIG.pro.quotas),
  expert: quotasToCapacity(PLANS_CONFIG.expert.quotas),
};

export const PRO_MULTIUSER_BULLET = "1 Seat, több eszközön";
export const PRO_P2P_SYNC_BULLET = "Titkosított lokális mentés, eszközök közötti átvitellel";

export const TIER_CORE: TierCore[] = getPublicPlans().map((p) => ({
  id: p.id as TierId,
  label: p.label,
  badge: p.badge === "recommended" ? ("Ajánlott" as const) : undefined,
}));

export const PRICING_HERO =
  "Fizess egyszer, használd a gépeden — a számok nálad maradnak";

/** @deprecated Lábjegyzetbe került — ne ismételd a mátrix celláiban. */
export const PRICING_SEAT_DEF =
  "Seat: szerkesztői fiók (teljes szerkesztési és modelligazítási jogkörrel). Guest: vendégfiók csak olvasói joggal (nézelődő / ellenőrző hozzáférés).";

export const PRICING_IOT_NOTE =
  "Ipari IoT Integráció: valós idejű gyártósori és üzemviteli adatok (Modbus, MQTT, OPC-UA) fogadására felkészített architektúra — egyedi projektkeretben.";

export const PRICING_NET_NOTE = "A feltüntetett árak nettó összegek, az ÁFA-t nem tartalmazzák.";

export const PRICING_CASE_RESET_FAQ = {
  q: "Hogyan törölhetők vagy indíthatók újra a Case adatok az eszközön?",
  a: "A Case adatai 100%-ban lokálisan, a böngésző/eszköz saját tárhelyén tárolódnak. A beállítások menüben bármikor kezdeményezheted az adott Case teljes törlését vagy újraindítását.",
} as const;

/** @deprecated Use {@link PRICING_CASE_RESET_FAQ}. */
export const PRICING_VAT_FAQ = PRICING_CASE_RESET_FAQ;

export const DEMO_STARTER_BLURB =
  "Szabadon játszható, elképzelt minták a motor kipróbálásához. Nem baj, ha elsőre sűrű vagy idegen a szakterület: nincs regisztráció, a számok a gépeden maradnak.";

export const TIER_SLOGAN: Record<TierId, string> = {
  starter: planSlogan(PLANS_CONFIG.starter),
  pro: planSlogan(PLANS_CONFIG.pro),
  expert: planSlogan(PLANS_CONFIG.expert),
};

export const TIER_AUDIENCE: Record<TierId, string> = {
  starter: planAudience(PLANS_CONFIG.starter),
  pro: planAudience(PLANS_CONFIG.pro),
  expert: planAudience(PLANS_CONFIG.expert),
};

export const TIER_CARD_HIGHLIGHTS: Record<TierId, string[]> = {
  starter: planHighlights(PLANS_CONFIG.starter),
  pro: planHighlights(PLANS_CONFIG.pro),
  expert: planHighlights(PLANS_CONFIG.expert),
};

export const PRICING_CUMULATIVE_NOTE =
  "A magasabb csomag tartalmazza az összes alsóbb csomag funkcióját. A táblázatban a bővített korlát vagy az extra modul szerepel; a pipa az öröklött funkciót jelöli.";

export const TIER_COMPARE_ROWS: Array<{
  feature: string;
  starter: string;
  pro: string;
  expert: string;
}> = buildPricingCompareRows("hu").map((row) => ({
  feature: row.feature,
  starter: row.cells.starter,
  pro: row.cells.pro,
  expert: row.cells.expert,
}));

export function isCompareAbsent(value: string): boolean {
  return value === "–" || value === "-" || value === "—" || value === "";
}

export const TIER_MONTHLY_HUF: Record<TierId, number> = {
  starter: PLANS_CONFIG.starter.monthlyPriceHuf,
  pro: PLANS_CONFIG.pro.monthlyPriceHuf,
  expert: PLANS_CONFIG.expert.monthlyPriceHuf,
};

export const YEARLY_DISCOUNT_PCT = YEARLY_FROM_PLANS;

export function yearlyPriceHuf(monthlyHuf: number): number {
  return yearlyFromPlans(monthlyHuf);
}

export function formatHuf(n: number): string {
  return formatCurrency(n);
}

export function getTierCore(id: string | null | undefined): TierCore | null {
  if (!id) return null;
  return TIER_CORE.find((t) => t.id === id) ?? null;
}

export function isTierId(v: unknown): v is TierId {
  return isPublicPlanId(v);
}

const TIER_RANK: Record<TierId, number> = { starter: 0, pro: 1, expert: 2 };

export function tierIncludesFeature(offers: TierOffer[], tierId: TierId, feature: string): boolean {
  const rank = TIER_RANK[tierId];
  return offers.some((o) => TIER_RANK[o.id] <= rank && o.includes.includes(feature));
}

export function buildTierOffers(map: Record<TierId, TierCopy>): TierOffer[] {
  return TIER_CORE.map((t) => ({ ...t, ...map[t.id] }));
}

export const STANDARD_TIER_COPY: Record<TierId, TierCopy> = buildStandardTierCopy("hu");

/** Campus havidíj — PLANS_CONFIG. */
export const CAMPUS_MONTHLY_HUF = getPlan("campus").monthlyPriceHuf;
