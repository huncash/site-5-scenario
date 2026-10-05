/**
 * Publikus piaci kontroll-árak a privát monetizációs szimulátorhoz.
 * Csak localhost `/admin/monetization-sim` — nem része a publikus katalógusnak.
 */

import { loyaltyFeesFromYear1Huf } from "@/config/plans";

export type MarketTier = "starter" | "pro" | "enterprise";

export type SaasPriceBand = {
  monthlyUsd: { min: number; max: number };
  /** Explicit HUF, ha a forrás megadta; különben null. */
  monthlyHuf: { min: number; max: number } | null;
  note: string;
};

export type PerpetualPriceBand = {
  /** Egyszeri USD sáv; éves díjnál is USD (lásd billing). */
  usd: { min: number; max: number };
  huf: { min: number; max: number } | null;
  billing: "one_time" | "annual";
  note: string;
};

export type SaasCompetitor = {
  id: string;
  name: string;
  blurb: string;
  tiers: Record<MarketTier, SaasPriceBand | null>;
};

export type PerpetualCompetitor = {
  id: string;
  name: string;
  blurb: string;
  tiers: Record<MarketTier, PerpetualPriceBand | null>;
};

/** Klasszikus SaaS — felhő, előfizetés, lejáratkor leáll. */
export const SAAS_COMPETITORS: readonly SaasCompetitor[] = [
  {
    id: "liveplan",
    name: "LivePlan",
    blurb: "Kisvállalkozói SaaS tervező — pénzügyi előrejelzés.",
    tiers: {
      starter: {
        monthlyUsd: { min: 20, max: 20 },
        monthlyHuf: null,
        note: "Standard · $15/hó éves számlázással · 1 üzleti terv",
      },
      pro: {
        monthlyUsd: { min: 40, max: 40 },
        monthlyHuf: null,
        note: "Premium · $30/hó éves számlázással · több szcenárió, benchmark",
      },
      enterprise: {
        monthlyUsd: { min: 100, max: 200 },
        monthlyHuf: null,
        note: "Egyedi csoportos / tanácsadói keretek",
      },
    },
  },
  {
    id: "brixx",
    name: "Brixx",
    blurb: "Felhős P-R-O cash-flow és pénzügyi modellezés.",
    tiers: {
      starter: {
        monthlyUsd: { min: 20, max: 20 },
        monthlyHuf: { min: 7_500, max: 7_500 },
        note: "1-Year Forecast · 1 projekt",
      },
      pro: {
        monthlyUsd: { min: 40, max: 40 },
        monthlyHuf: { min: 15_000, max: 15_000 },
        note: "3-Year Forecast · P-R-O szcenáriók",
      },
      enterprise: {
        monthlyUsd: { min: 60, max: 100 },
        monthlyHuf: null,
        note: "10-Year Forecast · korlátlan modell, csoportos jogok",
      },
    },
  },
  {
    id: "causal",
    name: "Causal",
    blurb: "Közép-/nagyvállalati FP&A modeller (felhő).",
    tiers: {
      starter: {
        monthlyUsd: { min: 0, max: 0 },
        monthlyHuf: { min: 0, max: 0 },
        note: "Free / Light · erősen korlátozott",
      },
      pro: {
        monthlyUsd: { min: 250, max: 250 },
        monthlyHuf: { min: 92_000, max: 92_000 },
        note: "Startup · teljes szcenárió, korlátlan dashboard",
      },
      enterprise: {
        monthlyUsd: { min: 1_000, max: 2_500 },
        monthlyHuf: { min: 370_000, max: 370_000 },
        note: "Dedikált integrációk · egyedi egyeztetés ($1000+)",
      },
    },
  },
] as const;

/** Local-first / desktop örökös (+ karbantartás) kontroll. */
export const PERPETUAL_COMPETITORS: readonly PerpetualCompetitor[] = [
  {
    id: "tableplus-sublime",
    name: "TablePlus / Sublime Merge",
    blurb: "Asztali power-user eszköz · 1 év frissítéssel.",
    tiers: {
      starter: {
        usd: { min: 59, max: 59 },
        huf: { min: 22_000, max: 22_000 },
        billing: "one_time",
        note: "Basic Single · 1 eszköz, örökös + 1 év frissítés",
      },
      pro: {
        usd: { min: 99, max: 149 },
        huf: { min: 36_000, max: 55_000 },
        billing: "one_time",
        note: "Custom / Business · több eszköz, 1 év frissítés",
      },
      enterprise: {
        usd: { min: 299, max: 499 },
        huf: null,
        billing: "one_time",
        note: "Team Volume · szervezeti licenccsomagok",
      },
    },
  },
  {
    id: "quantrix",
    name: "Quantrix Modeler",
    blurb: "Offline/desktop többdimenziós pénzügyi modeller.",
    tiers: {
      starter: null,
      pro: {
        usd: { min: 2_730, max: 2_730 },
        huf: { min: 1_000_000, max: 1_000_000 },
        billing: "annual",
        note: "Standard Desktop · /év / user · korlátlan lokális modell",
      },
      enterprise: {
        usd: { min: 5_000, max: 15_000 },
        huf: null,
        billing: "annual",
        note: "Qloud + Modeler Server · on-premise",
      },
    },
  },
  {
    id: "jetbrains",
    name: "JetBrains (Perpetual Fallback)",
    blurb: "Örökös licenc + csökkenő megújítási díj etalon.",
    tiers: {
      starter: {
        usd: { min: 169, max: 169 },
        huf: { min: 62_000, max: 62_000 },
        billing: "one_time",
        note: "Personal/Solo · Y1 $169 → Y2 $135 → Y3+ $101",
      },
      pro: {
        usd: { min: 599, max: 599 },
        huf: { min: 220_000, max: 220_000 },
        billing: "one_time",
        note: "Commercial · Y1 $599 → Y2 $479 → Y3+ $359",
      },
      enterprise: {
        usd: { min: 879, max: 879 },
        huf: null,
        billing: "one_time",
        note: "All Products Pack · Y1 $879 → Y2 $703 → Y3+ $527",
      },
    },
  },
] as const;

export type MatrixRow = {
  tier: MarketTier;
  label: string;
  /** SaaS piaci kontroll (Ft/hó) — szimulátor seat-ár preset. */
  saasMonthlyHuf: { min: number; max: number };
  saasNote: string;
  /** Örökös / local-first piaci kontroll (Ft egyszeri, középsáv). */
  perpetualOnceHuf: { min: number; max: number } | null;
  perpetualNote: string;
  /** A mi Szcenárió listaárunk. */
  ours: {
    kind: "once" | "custom";
    priceHuf: number | null;
    detail: string;
  };
};

/** Összegző mátrix — Admin kontroll + a mi árazásunk. */
export const MARKET_CONTROL_MATRIX: readonly MatrixRow[] = [
  {
    tier: "starter",
    label: "Starter (Solo)",
    saasMonthlyHuf: { min: 7_500, max: 15_000 },
    saasNote: "$20–$40 / hó",
    perpetualOnceHuf: { min: 22_000, max: 62_000 },
    perpetualNote: "$59–$169 egyszeri",
    ours: {
      kind: "once",
      priceHuf: 199_000,
      detail: "199 000 Ft egyszeri · 1 Aktív Case, 3 Aktív Slot/Case, 1 Seat + 1 Guest",
    },
  },
  {
    tier: "pro",
    label: "Pro (Szcenárió)",
    saasMonthlyHuf: { min: 92_000, max: 92_000 },
    saasNote: "$250 / hó (Causal Pro)",
    perpetualOnceHuf: { min: 180_000, max: 220_000 },
    perpetualNote: "$499–$599 egyszeri",
    ours: {
      kind: "once",
      priceHuf: 399_000,
      detail: "399 → 299 → 239 e Ft · 2 Aktív Case · 4. évtől örökélet frissítés",
    },
  },
  {
    tier: "enterprise",
    label: "Enterprise & Csapatok",
    saasMonthlyHuf: { min: 370_000, max: 370_000 },
    saasNote: "$1 000+ / hó",
    perpetualOnceHuf: { min: 799_000, max: 799_000 },
    perpetualNote: "$2 730+ / év piaci Quantrix · nálunk hűséglétra",
    ours: {
      kind: "once",
      priceHuf: 799_000,
      detail: "799 → 599 → 479 e Ft · 5 Aktív Case · 4. évtől örökélet frissítés",
    },
  },
] as const;

/** Szimulátor seat-ár kontroll: SaaS Pro piaci referencia (Causal). */
export const SAAS_CONTROL_SEAT_MONTHLY_HUF = 92_000;

/** Szimulátor örökös kontroll: a mi Pro / Enterprise listaárunk. */
export const OURS_PRO_PERPETUAL_HUF = 399_000;
const OURS_PRO_LOYALTY = loyaltyFeesFromYear1Huf(OURS_PRO_PERPETUAL_HUF);
/** Pro hűség 2. év = 1. évi alapár 75%-a. */
export const OURS_PRO_MAINTENANCE_HUF = OURS_PRO_LOYALTY.y2;
export const OURS_PRO_Y3_HUF = OURS_PRO_LOYALTY.y3;
export const OURS_SOLO_PERPETUAL_HUF = 199_000;
export const OURS_ENTERPRISE_PERPETUAL_HUF = 799_000;
const OURS_ENT_LOYALTY = loyaltyFeesFromYear1Huf(OURS_ENTERPRISE_PERPETUAL_HUF);
/** Enterprise hűség 2. év = 1. évi alapár 75%-a. */
export const OURS_ENTERPRISE_MAINTENANCE_HUF = OURS_ENT_LOYALTY.y2;
export const OURS_ENTERPRISE_Y3_HUF = OURS_ENT_LOYALTY.y3;

/** Örökös Pro piaci középsáv (JetBrains / TablePlus sáv összefoglaló). */
export const PERPETUAL_MARKET_PRO_MID_HUF = 200_000;

export function formatUsdBand(min: number, max: number, suffix: string): string {
  if (min === max) return `$${min.toLocaleString("en-US")}${suffix}`;
  return `$${min.toLocaleString("en-US")}–$${max.toLocaleString("en-US")}${suffix}`;
}

export function formatHufBand(min: number, max: number, suffix: string): string {
  const a = min.toLocaleString("hu-HU");
  const b = max.toLocaleString("hu-HU");
  if (min === max) return `${a} Ft${suffix}`;
  return `${a}–${b} Ft${suffix}`;
}
