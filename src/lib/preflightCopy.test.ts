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
  it("keeps the same promise on homepage and support pricing", () => {
    hasPromise(hu.brand.heroMicro);
    hasPromise(hu.supportDoor.lead);
    hasPromise(supportCopy("hu").pricingLead);
    hasPromise(en.brand.heroMicro);
  });

  it("states school as local-first anonymous pack, not a 2027 desktop promise", () => {
    expect(hu.school.lead).toMatch(/böngésző/);
    expect(hu.school.lead).toMatch(/helyi|helyben/i);
    expect(hu.school.lead).toMatch(/felhős adatbázis/);
    expect(hu.school.lead).toMatch(/licenc/);
    expect(hu.school.lead).not.toMatch(/2027/);
    expect(en.school.lead).toMatch(/browser/i);
    expect(en.school.lead).toMatch(/local/i);
    expect(en.school.lead).toMatch(/cloud database/i);
    expect(en.school.lead).not.toMatch(/2027/);
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
      supportCopy("hu").pricingWorkflowBody2,
      supportCopy("hu").pricingRoadmapLead,
      supportCopy("hu").pricingRoadmapBcpBody,
      supportCopy("hu").pricingFrameBody,
      supportCopy("hu").pricingAddonStatus,
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
      supportCopy("en").pricingWorkflowBody2,
      supportCopy("en").pricingRoadmapLead,
      supportCopy("en").pricingRoadmapBcpBody,
      supportCopy("en").pricingFrameBody,
      supportCopy("en").pricingAddonStatus,
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

  it("states support pricing as a standalone page: no demo aside, no hash crumbs, financial data named", () => {
    const hu = supportCopy("hu");
    const workflow = `${hu.pricingWorkflowBody}\n${hu.pricingWorkflowBody2}`;
    expect(workflow).toMatch(/ellenőrzöl/);
    expect(workflow).toMatch(/helyi műszerfalon/);
    expect(workflow).not.toMatch(/demó/i);
    expect(hu.pricingLocalBody).toMatch(/pénzügyi adataidat se/);
    expect(hu.pricingLoyaltyTitle).not.toMatch(/#/);
    expect(hu.pricingActiveTitle).not.toMatch(/#/);
    expect(hu.pricingWorkflowTitle).not.toMatch(/#/);
    expect(hu.pricingLocalTitle).not.toMatch(/#/);
    expect(hu.pricingRoadmapTitle).not.toMatch(/#/);
    expect(hu.pricingAddonStatus).toBe(
      "Ez a modul most nem indítható. Előkészítés alatt áll, és megvásárolható bővítőként. További részletek a támogatási, míg a vásárlási folyamat a számlázási aloldalunkon található.",
    );
    expect(hu.pricingRoadmapDesktopWhen).toMatch(/I\. negyedév vége/);
    expect(hu.pricingRoadmapBcpWhen).toBe("Elérhető");
    expect(hu.pricingRoadmapEducationWhen).toBe("Elérhető");
    expect(hu.pricingRoadmapBcpBody).toMatch(/vészhelyzeti szcenáriók/);
    expect(hu.pricingRoadmapBcpBody).toMatch(/kvótát nem ad/);
    expect(hu.pricingRoadmapBcpBody).not.toMatch(/Tesztelés alatt|2027/);
    expect(hu.pricingRoadmapEducationBody).toMatch(/statikus oktatási környezetet/);
    expect(hu.pricingRoadmapEducationBody).toMatch(/kvótát nem ad/);
    expect(hu.pricingRoadmapEducationBody).not.toMatch(/nyilvános indítás|Tesztelés|2027/);
    expect(hu.pricingFrameBody).toMatch(/Case/);
    expect(hu.pricingFrameBody).toMatch(/kvót/);
    expect(hu.pricingFrameBody).toMatch(/Poka-Yoke/);
    expect(hu.pricingRoadmapLead).toMatch(/licenckeret/);
    expect(hu.pricingRoadmapLead).not.toMatch(/nem-gazdasági motorok külön ütemezéssel/);
    expect(supportCopy("en").pricingRoadmapBcpWhen).toBe("Available");
    expect(supportCopy("en").pricingRoadmapEducationWhen).toBe("Available");
    expect(supportCopy("en").pricingFrameBody).toMatch(/quota/i);
    const ownLine = [
      hu.pricingOwnLineTitle,
      hu.pricingOwnLineWhen,
      hu.pricingOwnLineLead,
      hu.pricingOwnLineBody,
      ...hu.pricingOwnLinePoints,
      hu.pricingOwnLineClose,
    ].join("\n");
    expect(hu.pricingOwnLineTitle).toBe("Opcionális saját vonal");
    expect(ownLine).toMatch(/adatszuverenitás/);
    expect(ownLine).toMatch(/titkosított/i);
    expect(ownLine).toMatch(/hálózat/i);
    expect(ownLine).not.toMatch(/Nostr|NIP-05|npub|relay/i);
    expect(supportCopy("en").pricingOwnLineTitle).toBe("Optional own line");
    expect(
      [
        supportCopy("en").pricingOwnLineLead,
        supportCopy("en").pricingOwnLineBody,
        ...supportCopy("en").pricingOwnLinePoints,
      ].join("\n"),
    ).not.toMatch(/Nostr|NIP-05|npub|relay/i);
    expect(supportPricingTiers("hu").find((t) => t.id === "basic")?.bullets.join(" ")).toMatch(/1 vendégfiók/);
    expect(supportPricingTiers("hu").find((t) => t.id === "pro")?.bullets.join(" ")).toMatch(/5 vendégfiók/);
    expect(supportPricingTiers("hu").find((t) => t.id === "enterprise")?.bullets.join(" ")).toMatch(/20 vendégfiók/);
    expect(hu.pricingRoadmapBcpTitle).toMatch(/Működésfolytonosság & reziliencia \(BCP\)/);
    expect(hu.pricingTocKb).toBe("Tudásbázis");
    expect(hu.pricingTocAddons).toBe("Bővítő modulok");
    expect(hu.pricingTocEconomic).toMatch(/Gazdasági szcenárió motor/);
    const blob = supportPricingTiers("hu")
      .flatMap((t) => [t.detail, t.ladder, t.contentsTitle, t.modulesHeading, ...t.bullets, ...t.modules])
      .join("\n");
    expect(blob).not.toMatch(/lásd #|see #/i);
    expect(supportPricingTiers("hu").find((t) => t.id === "pro")?.bullets.join(" ")).toMatch(/2027/);
    expect(supportPricingTiers("hu").find((t) => t.id === "basic")?.modules).toContain("Pénzáramlás");
    expect(supportPricingTiers("hu").find((t) => t.id === "basic")?.priceLine).toMatch(/örökéletű licensz/);
    expect(supportPricingTiers("hu").find((t) => t.id === "enterprise")?.contentsTitle).toMatch(/Enterprise csomag tartalma/);
  });
});
