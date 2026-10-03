import { describe, expect, it } from "vitest";

import { en } from "@/i18n/en";
import { hu } from "@/i18n/hu";
import { translate } from "@/i18n";
import { caseCopyIds, caseTitle } from "@/i18n/cases";
import { DISPLAY_HUF_PER_EUR, formatCurrency, currencyUnit } from "@/i18n/currency";
import { currencyForLocale, DEFAULT_LOCALE, isLocale, otherLocale } from "@/i18n/locale";
import { parseMnbEur } from "@/lib/mnbRate";
import { TERMS } from "@/i18n/terms";

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
    expect(caseTitle("demo11_resilience_saas_outage", "en")).toMatch(/SaaS/);
    expect(caseTitle("demo26_industry_saas_exit", "en")).toBeNull();
  });
});
