import { describe, expect, it } from "vitest";

import { hu } from "@/i18n/hu";
import { en } from "@/i18n/en";
import { billCheckoutUrl } from "@/lib/billing";
import { supportCopy, supportPricingTiers } from "../../support/src/copy";

function hasPromise(text: string) {
  expect(text).toMatch(/böngésző|browser/i);
  expect(text).toMatch(/helyi|local/i);
  expect(text).toMatch(/felhős adatbázis|cloud database/i);
  expect(text).toMatch(/2027/);
  expect(text).toMatch(/ingyen|free/i);
}

describe("pre-flight public promise", () => {
  it("keeps the same promise on homepage, support pricing, and school", () => {
    hasPromise(hu.brand.heroMicro);
    hasPromise(hu.supportDoor.lead);
    hasPromise(hu.school.lead);
    hasPromise(supportCopy("hu").pricingLead);
    hasPromise(en.brand.heroMicro);
    hasPromise(en.school.lead);
  });

  it("does not advertise a wired desktop installer or an unwired payment", () => {
    expect(hu.pricing.thanksSub).not.toMatch(/placeholder|nincs bekötve/i);
    expect(en.pricing.thanksSub).not.toMatch(/placeholder|not wired/i);
    expect(hu.desktop.soonBody).toMatch(/2027/);
    expect(hu.desktop.soonNote).toMatch(/Nincs telepítő/);
    const pro = supportPricingTiers("hu").find((t) => t.id === "pro");
    expect(pro?.bullets.join(" ")).toMatch(/2027/);
  });

  it("states that business data stays on the device, not the company server", () => {
    expect(hu.legal.pageLead).toMatch(/nem megy a cég szerverére/);
    expect(hu.legal.localBody).toMatch(/nem menti szerverre/);
    expect(hu.legal.bannerBody).toMatch(/cég szerverére/);
    expect(hu.legal.bannerBody).toMatch(/soha nem látják/);
    expect(en.legal.pageLead).toMatch(/company server/);
  });

  it("sends Basic and Pro order buttons to the bill checkout origin", () => {
    const starter = billCheckoutUrl({
      tier: "starter",
      interval: "yearly",
      hostname: "szcenario.hu",
      pathname: "/",
    });
    const pro = billCheckoutUrl({
      tier: "pro",
      interval: "yearly",
      hostname: "szcenario.hu",
      pathname: "/",
    });
    expect(starter).toContain("https://bill.szcenario.hu/");
    expect(starter).toContain("tier=starter");
    expect(pro).toContain("https://bill.szcenario.hu/");
    expect(pro).toContain("tier=pro");
  });

  it("keeps Barion off operation and privacy copy; checkout may name it", () => {
    const operationHu = [
      hu.brand.localFirstBody,
      hu.brand.infraBody,
      hu.door.howStep1Body,
      hu.door.howStep2Body,
      hu.door.howStep3Body,
      hu.door.howStep4Body,
      hu.supportDoor.navIntegrationsLead,
      supportCopy("hu").pricingLocalBody,
      supportCopy("hu").pricingWorkflowBody,
    ].join("\n");
    const operationEn = [
      en.brand.localFirstBody,
      en.brand.infraBody,
      en.door.howStep1Body,
      en.door.howStep2Body,
      en.door.howStep3Body,
      en.door.howStep4Body,
      en.supportDoor.navIntegrationsLead,
      supportCopy("en").pricingLocalBody,
      supportCopy("en").pricingWorkflowBody,
    ].join("\n");
    expect(operationHu).not.toMatch(/Barion/i);
    expect(operationEn).not.toMatch(/Barion/i);
    expect(hu.supportDoor.faqBillingA).toMatch(/Barion/);
    expect(hu.pricing.checkoutSub).toMatch(/Barion/);
  });

  it("keeps P-R-O mosaics off public how-steps and pricing slogans", () => {
    const publicHu = [
      hu.door.howStep1Title,
      hu.door.howStep1Body,
      hu.door.howStep2Title,
      hu.door.howStep2Body,
      hu.door.howStep3Title,
      hu.door.howStep3Body,
      hu.door.howStep4Title,
      hu.door.howStep4Body,
      hu.pricing.sloganStarter,
      hu.pricing.hs3,
      hu.pricing.cf4,
      hu.brand.faqProConceptQ,
    ].join("\n");
    expect(publicHu).not.toMatch(/P-R-O|P–R–O/);
    expect(hu.door.howStep1Title).toMatch(/Törzsadatok/);
    expect(hu.door.howStep2Title).toMatch(/Mesh Data Manager/);
    expect(hu.door.howStep4Title).toMatch(/szabályok/);
  });

  it("keeps public leads free of editorial cross-talk", () => {
    const huBlob = [
      supportCopy("hu").pricingLead,
      hu.school.lead,
      hu.supportDoor.tiersLead,
      hu.supportDoor.faqSettingsA,
    ].join("\n");
    const enBlob = [
      supportCopy("en").pricingLead,
      en.school.lead,
      en.supportDoor.tiersLead,
      en.supportDoor.faqSettingsA,
    ].join("\n");
    expect(huBlob).not.toMatch(/főoldal csak röviden|pontos keret ide tartozik|nem promózzuk|visszaide/i);
    expect(enBlob).not.toMatch(/homepage stays short|exact frame|not promoted on the homepage|come back here/i);
  });
});
