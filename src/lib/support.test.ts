import { describe, expect, it } from "vitest";

import {
  SUPPORT_ORIGIN_PROD,
  readSupportTicketSearch,
  supportMountPrefix,
  supportPricingHref,
  supportTicketHref,
  supportTierDomId,
  supportTierHref,
} from "@/lib/support";

describe("support pricing ↔ tier hrefs", () => {
  it("maps plan cards to pricing hashes", () => {
    expect(supportPricingHref("basic")).toContain(`${SUPPORT_ORIGIN_PROD}/pricing`);
    expect(supportPricingHref("basic")).toContain("#basic");
    expect(supportPricingHref("pro")).toContain("#pro");
    expect(supportPricingHref("enterprise")).toContain("#enterprise");
    expect(supportPricingHref("workflow")).toContain("#workflow");
    expect(supportPricingHref("local-import")).toContain("#local-import");
    expect(supportPricingHref("desktop-engines")).toContain("#desktop-engines");
    expect(supportPricingHref("desktop")).toContain("#desktop");
    expect(supportPricingHref("bcp")).toContain("#bcp");
    expect(supportPricingHref("education-engine")).toContain("#education-engine");
  });

  it("opens the ticket form with a subject query, not mailto", () => {
    expect(supportTicketHref({ subject: "Enterprise & Csapatok ajánlatkérés" })).toContain("/ticket");
    expect(supportTicketHref({ subject: "Enterprise & Csapatok ajánlatkérés" })).toContain("subject=");
    expect(supportTicketHref()).not.toMatch(/^mailto:/);
    expect(readSupportTicketSearch("?subject=Enterprise%20teszt").subject).toBe("Enterprise teszt");
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
