import type { JitAddonId, PlanId } from "@/config/plans";
import { isJitAddonId } from "@/content/pricing/addons";
import type { DashboardLabId } from "@/lib/dashboardLabs";
import { billCheckoutUrl } from "@/lib/billing";
import { bundleLockUpgradeCart, evaluateBundleLockFromCart } from "@/lib/bundleLock";
import { ENTERPRISE_SELF_SERVE_CHECKOUT, enterpriseInquiryHref } from "@/lib/enterpriseSchedule";
import { readLicense, type LicenseEntitlement } from "@/lib/license";
import { hasPermission, resolveCurrentPlanId, type PlanPermission } from "@/lib/planPermissions";
import { isSlotPackId } from "@/lib/scenarioSlots";

export type EntitlementId = DashboardLabId | JitAddonId;

export const ENTITLEMENT_CONVERSION_BODY =
  "Ez a bővítő modul (vagy Pro/Enterprise funkció) jelenleg nincs a licenceden. Hozzáadod egyszeri díjjal?";

export const ENTITLEMENT_CHECKOUT_CTA = "Tovább a pénztárhoz";

type PlanGate = {
  kind: "plan";
  permission: PlanPermission;
  checkoutTier: "pro" | "expert";
};

type AddonGate = {
  kind: "addon";
  addon: JitAddonId;
};

export type EntitlementGate = PlanGate | AddonGate;

export const ENTITLEMENT_GATES: Record<EntitlementId, EntitlementGate> = {
  "labs-baseline": { kind: "plan", permission: "EXPLORE_SCENARIOS", checkoutTier: "pro" },
  "labs-sim": { kind: "plan", permission: "EXPLORE_SCENARIOS", checkoutTier: "pro" },
  "labs-shock": { kind: "plan", permission: "EXPLORE_SCENARIOS", checkoutTier: "pro" },
  "labs-advise": { kind: "plan", permission: "EXPLORE_SCENARIOS", checkoutTier: "pro" },
  "labs-kpi": { kind: "plan", permission: "EXPLORE_SCENARIOS", checkoutTier: "pro" },
  "labs-halmozott": { kind: "plan", permission: "ADVANCED_SCENARIO", checkoutTier: "pro" },
  "labs-szumma": { kind: "plan", permission: "MULTI_PORTFOLIO", checkoutTier: "expert" },
  "labs-edge": { kind: "addon", addon: "edge_sensor" },
  "labs-anon": { kind: "plan", permission: "EXPLORE_SCENARIOS", checkoutTier: "pro" },
  case_plus_1: { kind: "addon", addon: "case_plus_1" },
  slot_plus_1: { kind: "addon", addon: "slot_plus_1" },
  seat_plus_1: { kind: "addon", addon: "seat_plus_1" },
  guest_plus_1: { kind: "addon", addon: "guest_plus_1" },
  edge_sensor: { kind: "addon", addon: "edge_sensor" },
};

export type EntitlementOffer = {
  ok: false;
  id: EntitlementId;
  body: string;
  checkoutHref: string;
  checkoutLabel: string;
};

export type EntitlementDecision = { ok: true; id: EntitlementId } | EntitlementOffer;

export function listGrantedAddons(lic: LicenseEntitlement | null): JitAddonId[] {
  const out = new Set<JitAddonId>();
  for (const raw of lic?.addons ?? []) {
    if (isJitAddonId(raw)) out.add(raw);
  }
  for (const pack of lic?.slotPacks ?? []) {
    if (isSlotPackId(pack)) out.add("slot_plus_1");
  }
  return [...out];
}

function publicCheckoutTier(planId: PlanId, fallback: "pro" | "expert"): "starter" | "pro" | "expert" {
  if (planId === "starter" || planId === "pro" || planId === "expert") return planId;
  return fallback;
}

/** JIT bővítő a számlázási kosárba — bundle-zár / következő csomag, nem webshop. */
export function jitAddonCartHref(
  addon: JitAddonId,
  opts?: { license?: LicenseEntitlement | null; planId?: PlanId },
): string {
  const license = opts?.license !== undefined ? opts.license : readLicense();
  const planId = opts?.planId ?? resolveCurrentPlanId();
  return checkoutHrefFor({ kind: "addon", addon }, planId, license);
}

export function nextPackageCartHref(opts?: {
  license?: LicenseEntitlement | null;
  planId?: PlanId;
}): { href: string; nextTier: "pro" | "expert" } | null {
  const planId = opts?.planId ?? resolveCurrentPlanId();
  if (planId === "campus") return null;
  if (planId === "starter" || planId === "demo" || planId === "local") {
    return { href: billCheckoutUrl({ tier: "pro", interval: "yearly" }), nextTier: "pro" };
  }
  if (planId === "pro") {
    if (!ENTERPRISE_SELF_SERVE_CHECKOUT) {
      return { href: enterpriseInquiryHref(), nextTier: "expert" };
    }
    return { href: billCheckoutUrl({ tier: "expert", interval: "yearly" }), nextTier: "expert" };
  }
  return null;
}

function checkoutHrefFor(gate: EntitlementGate, planId: PlanId, license: LicenseEntitlement | null): string {
  if (gate.kind === "plan") {
    return billCheckoutUrl({
      tier: gate.checkoutTier,
      interval: "yearly",
    });
  }
  const tier = publicCheckoutTier(planId, "pro");
  const lock = evaluateBundleLockFromCart({
    planId: tier,
    addon: gate.addon,
    ownedAddons: license?.addons,
    ownedSlotPacks: license?.slotPacks,
  });
  if (lock.tripped && lock.nextTier) {
    if (lock.nextTier === "expert" && !ENTERPRISE_SELF_SERVE_CHECKOUT) {
      return enterpriseInquiryHref();
    }
    const kept = bundleLockUpgradeCart({ addon: gate.addon });
    return billCheckoutUrl({
      tier: lock.nextTier,
      interval: "yearly",
      addon: kept.addon,
    });
  }
  return billCheckoutUrl({
    tier,
    interval: "yearly",
    addon: gate.addon,
  });
}

export function evaluateEntitlement(
  id: EntitlementId,
  opts?: { license?: LicenseEntitlement | null; planId?: PlanId },
): EntitlementDecision {
  const license = opts?.license !== undefined ? opts.license : readLicense();
  const planId = opts?.planId ?? resolveCurrentPlanId();
  const gate = ENTITLEMENT_GATES[id];
  const allowed =
    gate.kind === "plan"
      ? hasPermission(planId, "SEAT", gate.permission, license)
      : listGrantedAddons(license).includes(gate.addon);

  if (allowed) return { ok: true, id };

  return {
    ok: false,
    id,
    body: ENTITLEMENT_CONVERSION_BODY,
    checkoutHref: checkoutHrefFor(gate, planId, license),
    checkoutLabel: ENTITLEMENT_CHECKOUT_CTA,
  };
}

export function isEntitled(
  id: EntitlementId,
  opts?: { license?: LicenseEntitlement | null; planId?: PlanId },
): boolean {
  return evaluateEntitlement(id, opts).ok;
}

export type LabAccessKind = "none" | "plan" | "purchased" | "local";

export function labAccessKind(
  id: DashboardLabId,
  opts?: { license?: LicenseEntitlement | null; planId?: PlanId },
): LabAccessKind {
  if (!isEntitled(id, opts)) return "none";
  const license = opts?.license !== undefined ? opts.license : readLicense();
  const planId = opts?.planId ?? resolveCurrentPlanId();
  if (planId === "local" || license?.status === "local") return "local";
  const gate = ENTITLEMENT_GATES[id];
  if (gate.kind === "addon") return "purchased";
  return "plan";
}

export function labAccessReasonHu(kind: LabAccessKind): string {
  if (kind === "plan") return "Alapcsomagban";
  if (kind === "purchased") return "Megvásárolva";
  if (kind === "local") return "Tesztelés";
  return "";
}
