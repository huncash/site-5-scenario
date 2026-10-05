import { loyaltyFeesFromYear1Huf } from "@/config/plans";
import {
  PRIVATE_MONETIZATION_CASE,
  type EnterpriseSliderState,
  type PerpetualSliderState,
  type SubscriptionSliderState,
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

type BandFactors = {
  growthMul: number;
  churnMul: number;
  salesMul: number;
  renewalMul: number;
};

const BAND: Record<ProBand, BandFactors> = {
  pessimistic: { growthMul: 0.55, churnMul: 1.7, salesMul: 0.6, renewalMul: 0.7 },
  realistic: { growthMul: 1, churnMul: 1, salesMul: 1, renewalMul: 1 },
  optimistic: { growthMul: 1.35, churnMul: 0.55, salesMul: 1.35, renewalMul: 1.15 },
};

function runSubscriptionBand(
  months: number,
  sliders: SubscriptionSliderState,
  band: ProBand,
): number[] {
  const base = PRIVATE_MONETIZATION_CASE.slot1.baseValues;
  const f = BAND[band];
  const growth = Math.max(0, (sliders.monthlyGrowthRatePct / 100) * f.growthMul);
  const churn = Math.max(0, (sliders.churnRatePct / 100) * f.churnMul);
  const price = sliders.seatPriceMonthly;
  const cac = base.cacPerSeat;

  let seats = base.initialSeats;
  let cumulative = 0;
  const series: number[] = [];

  for (let m = 1; m <= months; m++) {
    const acquired = seats * growth;
    const lost = seats * churn;
    seats = Math.max(0, seats + acquired - lost);
    const revenue = seats * price;
    const cacCost = acquired * cac;
    cumulative += revenue - cacCost;
    series.push(cumulative);
  }
  return series;
}

function loyaltyRenewalMonthly(month: number, y2: number, y3: number): number {
  if (month <= 12) return 0;
  if (month <= 24) return y2 / 12;
  if (month <= 36) return y3 / 12;
  return 0; // 4. évtől Lifetime Free
}

function runPerpetualBand(
  months: number,
  sliders: PerpetualSliderState,
  band: ProBand,
): number[] {
  const base = PRIVATE_MONETIZATION_CASE.slot2.baseValues;
  const f = BAND[band];
  const salesGrowth = base.salesGrowthRate * f.salesMul;
  const renewal = Math.min(1, Math.max(0, (sliders.renewalRatePct / 100) * f.renewalMul));
  const price = sliders.perpetualPrice;
  const cac = base.cacPerLicense;

  let monthlySales = base.initialSales * f.salesMul;
  let cumulativeSold = 0;
  let cumulative = 0;
  const series: number[] = [];

  for (let m = 1; m <= months; m++) {
    const newSales = monthlySales;
    cumulativeSold += newSales;
    let revenue = newSales * price;
    revenue += cumulativeSold * renewal * loyaltyRenewalMonthly(m, base.maintenanceFeeY2, base.maintenanceFeeY3);
    cumulative += revenue - newSales * cac;
    series.push(cumulative);
    monthlySales *= 1 + salesGrowth;
  }
  return series;
}

/** Transzparens Enterprise: fix havi volumennel + hűséglétra. */
function runEnterpriseBand(
  months: number,
  sliders: EnterpriseSliderState,
  band: ProBand,
): number[] {
  const base = PRIVATE_MONETIZATION_CASE.slot3.baseValues;
  const f = BAND[band];
  const monthlySales = Math.max(0, sliders.monthlySalesVolume * f.salesMul);
  const renewal = Math.min(1, Math.max(0, (sliders.renewalRatePct / 100) * f.renewalMul));
  const price = sliders.basePackagePrice;
  const cac = base.cacPerLicense;

  let cumulativeSold = 0;
  let cumulative = 0;
  const series: number[] = [];

  for (let m = 1; m <= months; m++) {
    cumulativeSold += monthlySales;
    let revenue = monthlySales * price;
    revenue +=
      cumulativeSold * renewal * loyaltyRenewalMonthly(m, base.maintenanceFeeY2, base.maintenanceFeeY3);
    cumulative += revenue - monthlySales * cac;
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

export function simulateSubscriptionSlot(
  sliders: SubscriptionSliderState,
  months = PRIVATE_MONETIZATION_CASE.timeHorizonMonths,
): MonetizationSlotResult {
  return toResult(
    runSubscriptionBand(months, sliders, "pessimistic"),
    runSubscriptionBand(months, sliders, "realistic"),
    runSubscriptionBand(months, sliders, "optimistic"),
    months,
  );
}

export function simulatePerpetualSlot(
  sliders: PerpetualSliderState,
  months = PRIVATE_MONETIZATION_CASE.timeHorizonMonths,
): MonetizationSlotResult {
  return toResult(
    runPerpetualBand(months, sliders, "pessimistic"),
    runPerpetualBand(months, sliders, "realistic"),
    runPerpetualBand(months, sliders, "optimistic"),
    months,
  );
}

export function simulateEnterpriseSlot(
  sliders: EnterpriseSliderState,
  months = PRIVATE_MONETIZATION_CASE.timeHorizonMonths,
): MonetizationSlotResult {
  return toResult(
    runEnterpriseBand(months, sliders, "pessimistic"),
    runEnterpriseBand(months, sliders, "realistic"),
    runEnterpriseBand(months, sliders, "optimistic"),
    months,
  );
}
