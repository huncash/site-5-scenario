import {
  addonNetForTier,
  chargeHuf,
  invoicePackageName,
  isJitAddonId,
  isSlotPackId,
  JIT_ADDON_LABELS,
  SLOT_PACK_LABELS,
  slotPackAllowedForTier,
  slotPackNetForInterval,
  type BillInterval,
  type BillTier,
} from "./catalog.ts";
import { parseCheckoutAddons } from "../../src/content/pricing/addons.ts";
import { evaluateBundleLockFromCart, type BundleLockDecision } from "../../src/lib/bundleLock.ts";
import { resolveVat, splitVat, type VatDecision } from "./vat.ts";

export type MoneySplit = { net: number; vat: number; gross: number };

export type QuoteLine = {
  name: string;
  quantity: number;
  unit: string;
  netUnitPrice: number;
};

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
  lines: QuoteLine[];
  bundleLock: BundleLockDecision;
};

export function packageLines(
  tier: BillTier,
  interval: BillInterval,
  extras: { addon?: string; slotPack?: string } = {},
): QuoteLine[] {
  const lines: QuoteLine[] = [
    {
      name: invoicePackageName(tier, interval),
      quantity: 1,
      unit: "db",
      netUnitPrice: chargeHuf(tier, interval),
    },
  ];
  const slotPack = extras.slotPack;
  for (const addon of parseCheckoutAddons(extras.addon)) {
    if (addon === slotPack) continue;
    if (!isJitAddonId(addon)) continue;
    lines.push({
      name: `Szcenárió — ${JIT_ADDON_LABELS[addon]}`,
      quantity: 1,
      unit: "db",
      netUnitPrice: addonNetForTier(addon, tier),
    });
  }
  if (slotPack && isSlotPackId(slotPack) && slotPackAllowedForTier(tier)) {
    lines.push({
      name: `Szcenárió — ${SLOT_PACK_LABELS[slotPack]}`,
      quantity: 1,
      unit: "db",
      netUnitPrice: slotPackNetForInterval(slotPack, interval),
    });
  }
  return lines;
}

export function quotePackage(
  tier: BillTier,
  interval: BillInterval,
  input: { country?: string; taxId?: string; addon?: string; slotPack?: string },
): PackageQuote {
  const vat = resolveVat(input);
  const lines = packageLines(tier, interval, input);
  const dueNet = lines.reduce((sum, line) => sum + line.netUnitPrice * line.quantity, 0);
  const packageNet = chargeHuf(tier, interval);
  const bundleLock = evaluateBundleLockFromCart({
    planId: tier,
    addon: input.addon,
    slotPack: slotPackAllowedForTier(tier) ? input.slotPack : undefined,
  });
  return {
    vat,
    monthlyNet: packageNet,
    yearlyNet: packageNet,
    dueNet,
    due: splitVat(dueNet, vat.rate),
    yearly: splitVat(packageNet, vat.rate),
    monthly: splitVat(packageNet, vat.rate),
    monthly12: splitVat(packageNet, vat.rate),
    saveNet: 0,
    lines,
    bundleLock,
  };
}
