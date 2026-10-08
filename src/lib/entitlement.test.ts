import { describe, expect, it } from "vitest";

import type { LicenseEntitlement } from "@/lib/license";
import {
  ENTITLEMENT_CHECKOUT_CTA,
  ENTITLEMENT_CONVERSION_BODY,
  evaluateEntitlement,
  isEntitled,
  jitAddonCartHref,
  labAccessKind,
  listGrantedAddons,
  nextPackageCartHref,
} from "@/lib/entitlement";

function lic(partial: Partial<LicenseEntitlement> = {}): LicenseEntitlement {
  return {
    token: "t",
    tier: "starter",
    interval: "perpetual",
    status: "paid",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("entitlement", () => {
  it("denies Labs without the matching plan or JIT roster and keeps conversion copy", () => {
    const starter = lic({ tier: "starter" });
    const denied = evaluateEntitlement("labs-edge", { license: starter, planId: "starter" });
    expect(denied.ok).toBe(false);
    if (denied.ok) return;
    expect(denied.body).toBe(ENTITLEMENT_CONVERSION_BODY);
    expect(denied.checkoutLabel).toBe(ENTITLEMENT_CHECKOUT_CTA);
    expect(denied.checkoutHref).toContain("tier=starter");
    expect(denied.checkoutHref).toContain("addon=edge_sensor");
    expect(isEntitled("labs-baseline", { license: starter, planId: "starter" })).toBe(true);
    expect(isEntitled("labs-sim", { license: starter, planId: "starter" })).toBe(true);
    expect(isEntitled("labs-shock", { license: starter, planId: "starter" })).toBe(true);
    expect(isEntitled("labs-advise", { license: starter, planId: "starter" })).toBe(true);
    expect(isEntitled("labs-kpi", { license: starter, planId: "starter" })).toBe(true);
    expect(isEntitled("labs-halmozott", { license: starter, planId: "starter" })).toBe(false);
    expect(isEntitled("labs-szumma", { license: starter, planId: "starter" })).toBe(false);
  });

  it("allows Pro consolidation and Enterprise Szumma, still gates Edge until the addon is on the roster", () => {
    const pro = lic({ tier: "pro" });
    expect(isEntitled("labs-halmozott", { license: pro, planId: "pro" })).toBe(true);
    expect(isEntitled("labs-szumma", { license: pro, planId: "pro" })).toBe(false);
    expect(isEntitled("labs-edge", { license: pro, planId: "pro" })).toBe(false);

    const expert = lic({ tier: "expert" });
    expect(isEntitled("labs-szumma", { license: expert, planId: "expert" })).toBe(true);
    expect(isEntitled("labs-edge", { license: expert, planId: "expert" })).toBe(false);

    const withEdge = lic({ tier: "pro", addons: ["edge_sensor"] });
    expect(isEntitled("labs-edge", { license: withEdge, planId: "pro" })).toBe(true);
    expect(isEntitled("edge_sensor", { license: withEdge, planId: "pro" })).toBe(true);
  });

  it("treats slot packs as extra Slot on the roster, not as Edge", () => {
    const packed = lic({ tier: "pro", slotPacks: ["slot_plus_1"] });
    expect(listGrantedAddons(packed)).toContain("slot_plus_1");
    expect(isEntitled("slot_plus_1", { license: packed, planId: "pro" })).toBe(true);
    expect(isEntitled("labs-edge", { license: packed, planId: "pro" })).toBe(false);
    expect(isEntitled("case_plus_1", { license: packed, planId: "pro" })).toBe(false);
  });

  it("sends plan-gated Labs to the matching checkout tier without an addon query", () => {
    const szumma = evaluateEntitlement("labs-szumma", {
      license: lic({ tier: "pro" }),
      planId: "pro",
    });
    expect(szumma.ok).toBe(false);
    if (szumma.ok) return;
    expect(szumma.checkoutHref).toContain("tier=expert");
    expect(szumma.checkoutHref).not.toContain("addon=");
  });

  it("reroutes addon checkout to the next package when stacked modules trip the lock", () => {
    const stacked = evaluateEntitlement("edge_sensor", {
      license: lic({ tier: "starter", slotPacks: ["slot_plus_5"] }),
      planId: "starter",
    });
    expect(stacked.ok).toBe(false);
    if (stacked.ok) return;
    expect(stacked.checkoutHref).toContain("tier=pro");
    expect(stacked.checkoutHref).toContain("addon=edge_sensor");
    expect(stacked.checkoutHref).not.toContain("slotPack=");
  });

  it("names how a lab is granted: plan, purchase, or local test", () => {
    expect(labAccessKind("labs-halmozott", { license: lic({ tier: "starter" }), planId: "starter" })).toBe("none");
    expect(labAccessKind("labs-halmozott", { license: lic({ tier: "pro" }), planId: "pro" })).toBe("plan");
    expect(labAccessKind("labs-szumma", { license: lic({ tier: "expert" }), planId: "expert" })).toBe("plan");
    expect(
      labAccessKind("labs-edge", { license: lic({ tier: "pro", addons: ["edge_sensor"] }), planId: "pro" }),
    ).toBe("purchased");
    expect(labAccessKind("labs-halmozott", { license: lic({ tier: "local", status: "local" }), planId: "local" })).toBe(
      "local",
    );
  });

  it("puts Extra Case into the billing cart on the current licence tier", () => {
    const href = jitAddonCartHref("case_plus_1", { license: lic({ tier: "pro" }), planId: "pro" });
    expect(href).toContain("tier=pro");
    expect(href).toContain("addon=case_plus_1");
    expect(nextPackageCartHref({ planId: "starter" })?.nextTier).toBe("pro");
    expect(nextPackageCartHref({ planId: "pro" })?.nextTier).toBe("expert");
    expect(nextPackageCartHref({ planId: "expert" })).toBeNull();
  });
});
