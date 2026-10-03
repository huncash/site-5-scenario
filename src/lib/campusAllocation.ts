import { EDUCATION_SEGMENTS } from "@/lib/educationCases";

export const CAMPUS_CAPITAL_HUF = 1_600_000;
export const MARKETING_LAG_MONTHS = 2;
export const PRODUCT_LAG_MONTHS = 3;
/** Helyi, „múltbeli” piaci szórás — nem élő API. */
export const MARKET_SIGMA = 0.18;
export const POKA_RESERVE_MIN_PCT = 12;

export type CampusAlloc = {
  marketing: number;
  product: number;
  payroll: number;
  reserve: number;
};

export type CampusPoint = { t: number; opt: number; real: number; pess: number };

export type CampusSim = {
  alloc: CampusAlloc;
  spendHuf: number;
  reserveHuf: number;
  pokaOk: boolean;
  series: CampusPoint[];
  beMonth: { opt: number | null; real: number | null; pess: number | null };
  insolventMonth: number | null;
  delayedNote: string;
};

export function defaultCampusAlloc(): CampusAlloc {
  return { marketing: 28, product: 32, payroll: 28, reserve: 12 };
}

export function clampAlloc(raw: CampusAlloc): CampusAlloc {
  const reserve = Math.max(0, Math.min(30, Math.round(raw.reserve)));
  let marketing = Math.max(0, raw.marketing);
  let product = Math.max(0, raw.product);
  let payroll = Math.max(0, raw.payroll);
  const spendShare = marketing + product + payroll;
  const room = Math.max(0, 100 - reserve);
  if (spendShare <= 0) {
    return { marketing: 0, product: 0, payroll: 0, reserve };
  }
  const k = room / spendShare;
  marketing = Math.round(marketing * k);
  product = Math.round(product * k);
  payroll = Math.max(0, room - marketing - product);
  return { marketing, product, payroll, reserve };
}

export function simulateCampus(raw: CampusAlloc, months = 12): CampusSim {
  const alloc = clampAlloc(raw);
  const reserveHuf = Math.round((CAMPUS_CAPITAL_HUF * alloc.reserve) / 100);
  const spendHuf = CAMPUS_CAPITAL_HUF - reserveHuf;
  const mHuf = (spendHuf * alloc.marketing) / Math.max(1, alloc.marketing + alloc.product + alloc.payroll);
  const pHuf = (spendHuf * alloc.product) / Math.max(1, alloc.marketing + alloc.product + alloc.payroll);
  const payHuf = spendHuf - mHuf - pHuf;
  const monthlyPay = payHuf / months;
  const pokaOk = alloc.reserve >= POKA_RESERVE_MIN_PCT;

  const series: CampusPoint[] = [];
  const cash0 = CAMPUS_CAPITAL_HUF - mHuf - pHuf;
  let o = cash0;
  let r = cash0;
  let p = cash0;
  let insolventMonth: number | null = null;
  const be = { opt: null as number | null, real: null as number | null, pess: null as number | null };

  for (let t = 0; t < months; t++) {
    const awareness = t >= MARKETING_LAG_MONTHS ? mHuf / 220_000 : 0;
    const quality = t >= PRODUCT_LAG_MONTHS ? pHuf / 260_000 : 0;
    const demand = Math.max(0, awareness * (0.45 + quality * 0.55));
    const baseRev = demand * 95_000 * (1 + t * 0.04);
    const optRev = baseRev * (1 + MARKET_SIGMA);
    const realRev = baseRev;
    const pessRev = baseRev * (1 - MARKET_SIGMA) * (pokaOk ? 1 : 0.88);
    const opex = 18_000;
    o += optRev - monthlyPay - opex;
    r += realRev - monthlyPay - opex;
    p += pessRev - monthlyPay - opex * 1.15;
    if (be.opt == null && o >= CAMPUS_CAPITAL_HUF) be.opt = t + 1;
    if (be.real == null && r >= CAMPUS_CAPITAL_HUF) be.real = t + 1;
    if (be.pess == null && p >= CAMPUS_CAPITAL_HUF) be.pess = t + 1;
    if (insolventMonth == null && p < 0) insolventMonth = t + 1;
    series.push({
      t: t + 1,
      opt: Math.round(o),
      real: Math.round(r),
      pess: Math.round(p),
    });
  }

  const delayedNote = `A marketing ${MARKETING_LAG_MONTHS} hónap, a fejlesztés ${PRODUCT_LAG_MONTHS} hónap késleltetéssel hat. A sáv ±${Math.round(MARKET_SIGMA * 100)}% helyi szórás.`;

  return { alloc, spendHuf: Math.round(spendHuf), reserveHuf, pokaOk, series, beMonth: be, insolventMonth, delayedNote };
}

export function campusCapitalLabel() {
  const cse = EDUCATION_SEGMENTS.find((s) => s.id === "demo15_edu_startup_cashflow");
  return cse?.goalName ?? "Fedezeti pont 8 hónap alatt";
}
