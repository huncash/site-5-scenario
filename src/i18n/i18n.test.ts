import { describe, expect, it } from "vitest";

import { en } from "@/i18n/en";
import { hu } from "@/i18n/hu";
import { translate } from "@/i18n";
import { caseCopyIds, caseTitle } from "@/i18n/cases";
import { DISPLAY_HUF_PER_EUR, formatCurrency, currencyUnit } from "@/i18n/currency";
import { currencyForLocale, DEFAULT_LOCALE, isLocale, otherLocale } from "@/i18n/locale";
import { parseMnbEur } from "@/lib/mnbRate";
import { TERMS } from "@/i18n/terms";
import { surfaceTx } from "@/i18n/surfaceTx";

function keysOf(obj: unknown, prefix = ""): string[] {
  if (!obj || typeof obj !== "object") return prefix ? [prefix] : [];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    typeof v === "string" ? [`${prefix}${k}`] : keysOf(v, `${prefix}${k}.`),
  );
}

describe("i18n", () => {
  it("defaults to Hungarian", () => {
    expect(DEFAULT_LOCALE).toBe("hu");
    expect(isLocale("hu")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(otherLocale("hu")).toBe("en");
  });

  it("keeps HU and EN key trees aligned", () => {
    expect(keysOf(en).sort()).toEqual(keysOf(hu).sort());
  });

  it("covers references, settings, tour and stats chrome", () => {
    expect(translate("en", "ref.tabPartners")).toBe("Partners");
    expect(translate("en", "set.tabDanger")).toBe("Danger zone");
    expect(translate("en", "tour.skip")).toBe("Skip");
    expect(translate("en", "tour.next")).toBe("Next");
    expect(translate("en", "stats.title")).toBe("Activity & cycle statistics");
    expect(translate("en", "labs.preview")).toBe("Preview / Try");
    expect(translate("hu", "ref.saveConfirmDetail", { name: "Core", id: "ws1" })).toContain("Core");
    expect(surfaceTx("en", "Mentés")).toBe("Save");
    expect(surfaceTx("hu", "Mentés")).toBe("Mentés");
  });

  it("keeps dashboard money labels bilingual; user names stay out of the dictionary", () => {
    expect(translate("hu", "dash.cashflowTitle")).toBe("Pénzáramlás");
    expect(translate("en", "dash.cashflowTitle")).toBe("Cash Flow");
    expect(translate("hu", "dash.freeNet")).toBe("Szabad nettó");
    expect(translate("en", "dash.freeNet")).toBe("Free Net");
    expect(translate("hu", "dash.vatReserve")).toBe("ÁFA tartalék");
    expect(translate("en", "dash.vatReserve")).toBe("VAT Reserve");
    expect(translate("hu", "dash.bankBalance")).toBe("Banki egyenleg");
    expect(translate("en", "dash.bankBalance")).toBe("Bank Balance");
    expect(translate("hu", "dash.locked")).toBe("Zárolt");
    expect(translate("en", "dash.locked")).toBe("Locked");
    expect(translate("hu", "dash.heatmap")).toBe("Kivétel-hőtérkép");
    expect(translate("en", "dash.heatmap")).toBe("Exception Heatmap");
    expect(translate("hu", "dash.liabilities")).toBe("Tartozások / Kötelezettségek");
    expect(translate("en", "dash.liabilities")).toBe("Liabilities / Payables");
    expect(translate("hu", "dash.newLiability")).toBe("+ Új tartozás");
    expect(translate("en", "dash.newLiability")).toBe("+ New liability");
    expect(translate("hu", "dash.outstanding")).toBe("Fennálló tartozás");
    expect(translate("en", "dash.outstanding")).toBe("Outstanding debt");
    expect(translate("hu", "dash.publicDebt")).toBe("Köztartozás");
    expect(translate("en", "dash.publicDebt")).toBe("Tax arrears");
    expect(translate("hu", "dash.nextDue")).toBe("Következő esedékesség");
    expect(translate("en", "dash.nextDue")).toBe("Next due date");
    expect(translate("hu", "loan.typeCredit")).toBe("Forgóeszköz hitel");
    expect(translate("en", "loan.typeCredit")).toBe("Working capital loan");
    expect(translate("hu", "dash.itemsQuick")).toBe("Tételek (gyors szerkesztés)");
    expect(translate("en", "dash.itemsQuick")).toBe("Items (quick edit)");
    expect(translate("en", "dash.planned")).toBe("Planned spend");
    expect(translate("en", "dash.txnExpense")).toBe("Expense");
    expect(translate("en", "dash.txnDate")).toBe("Date");
    expect(translate("en", "dash.invoicePaid")).toBe("Paid");
    expect(translate("en", "dash.bankNote")).toMatch(/Bank/);
    expect(translate("en", "login.activateTitle")).toMatch(/password/i);
    expect(translate("en", "chrome.cmdEmpty")).toBe("No matches.");
    expect(translate("en", "chrome.help")).toBe("Help");
    expect(translate("en", "chrome.openLesson")).toBe("Open lesson");
    expect(surfaceTx("en", "Új tétel")).toBe("New item");
    expect(translate("hu", "pdca.actWord")).toBe("Beavatkozás");
    expect(translate("en", "pdca.actWord")).toBe("Intervention");
    expect(translate("hu", "loan.slotNote", { name: "Core üzem vállalkozás" })).toContain("Core üzem vállalkozás");
    expect(translate("en", "loan.slotNote", { name: "Core üzem vállalkozás" })).toContain("Core üzem vállalkozás");
  });

  it("keeps professional terms identical", () => {
    expect(hu.term).toEqual(TERMS);
    expect(en.term).toEqual(TERMS);
    expect(translate("hu", "term.pdca")).toBe("PDCA");
    expect(translate("en", "term.masterBaseline")).toBe("Master Baseline");
    expect(translate("en", "term.ttr")).toBe("TTR");
    expect(translate("hu", "term.lora")).toBe("LoRa");
  });

  it("interpolates and falls back", () => {
    expect(translate("en", "login.active", { name: "Ada" })).toBe("Active session: Ada");
    expect(translate("hu", "login.knownDevice", { count: 2 })).toContain("2");
  });

  it("maps language to display currency", () => {
    expect(currencyForLocale("hu")).toBe("HUF");
    expect(currencyForLocale("en")).toBe("EUR");
    expect(currencyUnit("hu")).toBe("Ft");
    expect(currencyUnit("en")).toBe("€");
  });

  it("formats HUF and converted EUR from the same HUF value", () => {
    const hu = formatCurrency(DISPLAY_HUF_PER_EUR, "hu");
    const en = formatCurrency(DISPLAY_HUF_PER_EUR, "en");
    expect(hu).toMatch(/368|367/);
    expect(hu).toMatch(/Ft|HUF/);
    expect(en).toMatch(/1/);
    expect(en).toMatch(/€|EUR/);
  });

  it("parses official MNB EUR mid-rate from SOAP XML", () => {
    const xml =
      '&lt;MNBCurrentExchangeRates&gt;&lt;Day date="2026-10-02"&gt;&lt;Rate unit="1" curr="EUR"&gt;367,87000&lt;/Rate&gt;&lt;/Day&gt;&lt;/MNBCurrentExchangeRates&gt;';
    const quote = parseMnbEur(xml);
    expect(quote?.rate).toBeCloseTo(367.87, 2);
    expect(quote?.date).toBe("2026-10-02");
  });

  it("overlays EN demo case titles", () => {
    expect(caseCopyIds()).toHaveLength(18);
    expect(caseTitle("demo1_multisite_operator", "hu")).toBe("Több vendéglátóhely egy kézben");
    expect(caseTitle("demo1_multisite_operator", "en")).toBe("Several hospitality sites in one hand");
    expect(caseTitle("demo12_resilience_saas_outage", "en")).toMatch(/SaaS/);
    expect(caseTitle("demo26_industry_saas_exit", "en")).toBeNull();
  });
});
