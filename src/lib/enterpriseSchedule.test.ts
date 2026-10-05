import { describe, expect, it } from "vitest";

import { planCardBullets } from "@/config/planCopy";
import { PLANS_CONFIG } from "@/config/plans";
import {
  ENTERPRISE_SELF_SERVE_CHECKOUT,
  enterpriseInquiryMailto,
  isEnterprisePlanId,
} from "@/lib/enterpriseSchedule";
import { SUPPORT_MAIL } from "@/lib/support";

describe("enterprise schedule", () => {
  it("keeps Enterprise visible without self-serve checkout", () => {
    expect(ENTERPRISE_SELF_SERVE_CHECKOUT).toBe(false);
    expect(isEnterprisePlanId("expert")).toBe(true);
    expect(isEnterprisePlanId("enterprise")).toBe(true);
    expect(isEnterprisePlanId("pro")).toBe(false);
    expect(PLANS_CONFIG.expert.public).toBe(true);
    expect(PLANS_CONFIG.expert.priceHuf).toBe(799_000);
  });

  it("builds a mailto inquiry, not a bill checkout URL", () => {
    const href = enterpriseInquiryMailto({ locale: "hu", name: "Teszt", email: "a@b.hu" });
    expect(href.startsWith(`mailto:${SUPPORT_MAIL}?`)).toBe(true);
    expect(href).toContain("Enterprise");
    expect(href).not.toMatch(/bill\.szcenario/);
  });

  it("uses Aktív Case / Aktív Slot on the Enterprise card", () => {
    const hu = planCardBullets(PLANS_CONFIG.expert, "hu");
    expect(hu[0]).toBe("5 Aktív Case");
    expect(hu[1]).toBe("4 Aktív Slot / Case");
    expect(hu.join(" ")).not.toMatch(/szcenárió/i);
    const en = planCardBullets(PLANS_CONFIG.expert, "en");
    expect(en[0]).toBe("5 Active Cases");
    expect(en[1]).toBe("4 Active Slots / Case");
  });
});
