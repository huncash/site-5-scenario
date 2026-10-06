import { describe, expect, it } from "vitest";

import {
  SUPPORT_ORIGIN_PROD,
  supportMountPrefix,
  supportPricingHref,
  supportTierDomId,
  supportTierHref,
} from "@/lib/support";

describe("support pricing ↔ tier hrefs", () => {
  it("maps plan cards to pricing hashes", () => {
    expect(supportPricingHref("basic")).toContain(`${SUPPORT_ORIGIN_PROD}/pricing`);
    expect(supportPricingHref("basic")).toContain("#basic");
    expect(supportPricingHref("pro")).toContain("#pro");
    expect(supportPricingHref("enterprise")).toContain("#enterprise");
  });

  it("maps support levels to home hashes", () => {
    expect(supportTierDomId("basic")).toBe("support-basic");
    expect(supportTierHref("basic")).toContain(`${SUPPORT_ORIGIN_PROD}/`);
    expect(supportTierHref("basic")).toContain("#support-basic");
    expect(supportTierHref("pro")).toContain("#support-pro");
    expect(supportTierHref("enterprise")).toContain("#support-enterprise");
  });

  it("keeps /support prefix only on the main-site path, not on the support host", () => {
    expect(supportMountPrefix("szcenario.hu", "/")).toBe("");
    expect(supportMountPrefix("szcenario.hu", "/support")).toBe("/support");
    expect(supportMountPrefix("support.szcenario.hu", "/pricing")).toBe("");
  });
});
