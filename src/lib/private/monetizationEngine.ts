import { loyaltyFeesFromYear1Huf } from "@/config/plans";
import { INSTALLMENT2_DUE_DAYS, splitEqualParts } from "@/lib/installmentPlan";
import {
  PRIVATE_MONETIZATION_CASE,
  type OptionASliderState,
  type OptionBSliderState,
} from "@/lib/private/monetizationCase";

export type ProBand = "pessimistic" | "realistic" | "optimistic";

export type MonetizationMonthPoint = {
  month: number;
  pessimistic: number;
  realistic: number;
  optimistic: number;
};

export type MonetizationSlotResult = {
  chart: MonetizationMonthPoint[];
  /** 36. havi halmozott nettó (bevétel − CAC) band-enként. */
  cumulativeEnd: Record<ProBand, number>;
};

/** 60 nap ≈ 2 szimulációs hónap. */
export const INSTALLMENT_LAG_MONTHS = Math.round(INSTALLMENT2_DUE_DAYS / 30);

type BandFactors = {
  growthMul: number;
  salesMul: number;
  attachMul: number;
};

const BAND: Record<ProBand, BandFactors> = {
  pessimistic: { growthMul: 0.55, salesMul: 0.6, attachMul: 0.7 },
  realistic: { growthMul: 1, salesMul: 1, attachMul: 1 },
  optimistic: { growthMul: 1.35, salesMul: 1.35, attachMul: 1.15 },
};

export type PillarKind = "a" | "b" | "ab";

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function salesSeries(
  months: number,
  sliders: OptionASliderState,
  band: ProBand,
): number[] {
  const f = BAND[band];
  const growth = Math.max(0, (sliders.salesGrowthPct / 100) * f.growthMul);
  let monthlySales = Math.max(0, sliders.initialSales) * f.salesMul;
  const out: number[] = [];
  for (let m = 1; m <= months; m++) {
    out.push(monthlySales);
    monthlySales *= 1 + growth;
  }
  return out;
}

/** Opció A készpénz: egyszeri és/vagy 2 egyenlő részlet, a 2. a 60. napon. */
export function optionACashAtMonth(
  salesByMonth: readonly number[],
  month: number,
  price: number,
  installmentShare: number,
): number {
  const share = clamp01(installmentShare);
  const [p1, p2] = splitEqualParts(price);
  const lump = 1 - share;
  const idx = month - 1;
  const now = salesByMonth[idx] ?? 0;
  let cash = now * (lump * price + share * p1);
  const priorIdx = idx - INSTALLMENT_LAG_MONTHS;
  if (priorIdx >= 0) {
    cash += (salesByMonth[priorIdx] ?? 0) * share * p2;
  }
  return cash;
}

/** Opció B: opcionális éves csomag a kohorsz évfordulóján (13. és 25. hónap). */
export function optionBCashAtMonth(
  salesByMonth: readonly number[],
  month: number,
  attach: number,
  y2: number,
  y3: number,
): number {
  const rate = clamp01(attach);
  let cash = 0;
  const y2Idx = month - 1 - 12;
  if (y2Idx >= 0) cash += (salesByMonth[y2Idx] ?? 0) * rate * y2;
  const y3Idx = month - 1 - 24;
  if (y3Idx >= 0) cash += (salesByMonth[y3Idx] ?? 0) * rate * y3;
  return cash;
}

function runPillarBand(
  months: number,
  optionA: OptionASliderState,
  optionB: OptionBSliderState,
  pillar: PillarKind,
  band: ProBand,
): number[] {
  const baseA = PRIVATE_MONETIZATION_CASE.optionA.baseValues;
  const f = BAND[band];
  const price = Math.max(0, optionA.perpetualPrice);
  const fees = loyaltyFeesFromYear1Huf(price);
  const installmentShare = clamp01(optionA.installmentSharePct / 100);
  const attach = clamp01((optionB.attachRatePct / 100) * f.attachMul);
  const cac = baseA.cacPerLicense;
  const sales = salesSeries(months, optionA, band);
  const series: number[] = [];
  let cumulative = 0;

  for (let m = 1; m <= months; m++) {
    const neu = sales[m - 1] ?? 0;
    let revenue = 0;
    let cost = 0;
    if (pillar === "a" || pillar === "ab") {
      revenue += optionACashAtMonth(sales, m, price, installmentShare);
      cost += neu * cac;
    }
    if (pillar === "b" || pillar === "ab") {
      revenue += optionBCashAtMonth(sales, m, attach, fees.y2, fees.y3);
    }
    cumulative += revenue - cost;
    series.push(cumulative);
  }
  return series;
}

function toChart(
  pess: number[],
  real: number[],
  opt: number[],
): MonetizationMonthPoint[] {
  return pess.map((_, i) => ({
    month: i + 1,
    pessimistic: Math.round(pess[i]!),
    realistic: Math.round(real[i]!),
    optimistic: Math.round(opt[i]!),
  }));
}

function toResult(pess: number[], real: number[], opt: number[], months: number): MonetizationSlotResult {
  return {
    chart: toChart(pess, real, opt),
    cumulativeEnd: {
      pessimistic: Math.round(pess[months - 1] ?? 0),
      realistic: Math.round(real[months - 1] ?? 0),
      optimistic: Math.round(opt[months - 1] ?? 0),
    },
  };
}

function simulatePillar(
  optionA: OptionASliderState,
  optionB: OptionBSliderState,
  pillar: PillarKind,
  months = PRIVATE_MONETIZATION_CASE.timeHorizonMonths,
): MonetizationSlotResult {
  return toResult(
    runPillarBand(months, optionA, optionB, pillar, "pessimistic"),
    runPillarBand(months, optionA, optionB, pillar, "realistic"),
    runPillarBand(months, optionA, optionB, pillar, "optimistic"),
    months,
  );
}

export function simulateOptionA(
  optionA: OptionASliderState,
  optionB: OptionBSliderState,
  months = PRIVATE_MONETIZATION_CASE.timeHorizonMonths,
): MonetizationSlotResult {
  return simulatePillar(optionA, optionB, "a", months);
}

export function simulateOptionB(
  optionA: OptionASliderState,
  optionB: OptionBSliderState,
  months = PRIVATE_MONETIZATION_CASE.timeHorizonMonths,
): MonetizationSlotResult {
  return simulatePillar(optionA, optionB, "b", months);
}

export function simulateTwoPillars(
  optionA: OptionASliderState,
  optionB: OptionBSliderState,
  months = PRIVATE_MONETIZATION_CASE.timeHorizonMonths,
): MonetizationSlotResult {
  return simulatePillar(optionA, optionB, "ab", months);
}
