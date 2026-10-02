import { MONTHLY_HUF, yearlyPriceHuf, type BillInterval, type BillTier } from "./catalog.ts";
import { resolveVat, splitVat, type VatDecision } from "./vat.ts";

export type MoneySplit = { net: number; vat: number; gross: number };

export type PackageQuote = {
  vat: VatDecision;
  monthlyNet: number;
  yearlyNet: number;
  dueNet: number;
  due: MoneySplit;
  yearly: MoneySplit;
  monthly: MoneySplit;
  monthly12: MoneySplit;
  saveNet: number;
};

export function quotePackage(
  tier: BillTier,
  interval: BillInterval,
  input: { country?: string; taxId?: string },
): PackageQuote {
  const vat = resolveVat(input);
  const monthlyNet = MONTHLY_HUF[tier];
  const yearlyNet = yearlyPriceHuf(monthlyNet);
  const dueNet = interval === "yearly" ? yearlyNet : monthlyNet;
  return {
    vat,
    monthlyNet,
    yearlyNet,
    dueNet,
    due: splitVat(dueNet, vat.rate),
    yearly: splitVat(yearlyNet, vat.rate),
    monthly: splitVat(monthlyNet, vat.rate),
    monthly12: splitVat(monthlyNet * 12, vat.rate),
    saveNet: monthlyNet * 12 - yearlyNet,
  };
}
