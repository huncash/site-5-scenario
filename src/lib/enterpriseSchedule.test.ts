import { describe, expect, it } from "vitest";

import { planCardBullets } from "@/config/planCopy";
import { PLANS_CONFIG } from "@/config/plans";
import {
  ENTERPRISE_SELF_SERVE_CHECKOUT,
  enterpriseInquiryHref,
  enterpriseInquirySubject,
  isEnterprisePlanId,
} from "@/lib/enterpriseSchedule";
import { SUPPORT_ORIGIN_PROD } from "@/lib/support";

describe("enterprise schedule", () => {
  it("keeps Enterprise visible without self-serve checkout", () => {
    expect(ENTERPRISE_SELF_SERVE_CHECKOUT).toBe(false);
    expect(isEnterprisePlanId("expert")).toBe(true);
    expect(isEnterprisePlanId("enterprise")).toBe(true);
    expect(isEnterprisePlanId("pro")).toBe(false);
    expect(PLANS_CONFIG.expert.public).toBe(true);
    expect(PLANS_CONFIG.expert.priceHuf).toBe(799_000);
  });

  it("routes Enterprise inquiry to the Support ticket form, not mailto", () => {
    const href = enterpriseInquiryHref({ locale: "hu" });
    const url = new URL(href);
    expect(href.startsWith("mailto:")).toBe(false);
    expect(href).toContain(`${SUPPORT_ORIGIN_PROD}/ticket`);
    expect(url.searchParams.get("subject")).toBe(enterpriseInquirySubject("hu"));
    expect(href).not.toMatch(/bill\.szcenario/);
  });

  it("keeps Enterprise inquiry on the local support ticket when under /support", () => {
    const href = enterpriseInquiryHref({ locale: "hu", pathname: "/support/pricing" });
    expect(href.startsWith("mailto:")).toBe(false);
    expect(href).toContain("/support/ticket");
    expect(href).not.toMatch(/^https:/);
    expect(new URL(href, "https://support.local").searchParams.get("subject")).toBe(enterpriseInquirySubject("hu"));
  });

  it("uses numbered capacity lines on the Enterprise card", () => {
    const hu = planCardBullets(PLANS_CONFIG.expert, "hu");
    expect(hu).toEqual(["5 aktív case", "4 aktív slot", "3 szerkesztő", "20 vendégfiók"]);
    expect(hu.join(" ")).not.toMatch(/szcenárió/i);
    const en = planCardBullets(PLANS_CONFIG.expert, "en");
    expect(en).toEqual(["5 active cases", "4 active slots", "3 editors", "20 guest accounts"]);
  });
});
