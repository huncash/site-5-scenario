import { describe, expect, it } from "vitest";

import {
  GLOSSARY_IDS,
  glossaryCopy,
  glossarySupportHref,
  glossaryTerm,
  glossaryTooltip,
} from "@/lib/glossary";
import { SUPPORT_ORIGIN_PROD } from "@/lib/support";

describe("glossary", () => {
  it("covers dashboard jargon with a support URL", () => {
    expect(GLOSSARY_IDS).toEqual(expect.arrayContaining(["runway", "wms", "dock", "cashflow", "muda", "pdca"]));
    for (const id of GLOSSARY_IDS) {
      const t = glossaryTerm(id);
      expect(t.hu.term.length).toBeGreaterThan(1);
      expect(t.hu.plain.length).toBeGreaterThan(3);
      expect(t.hu.exact.length).toBeGreaterThan(12);
      expect(t.en.plain.length).toBeGreaterThan(3);
      const href = glossarySupportHref(id);
      expect(href.startsWith(SUPPORT_ORIGIN_PROD)).toBe(true);
    }
  });

  it("links Case/Slot to Support pricing and Kahn terms to the lesson", () => {
    expect(glossarySupportHref("case")).toContain("/pricing");
    expect(glossarySupportHref("case")).toContain("active-workspaces");
    expect(glossarySupportHref("runway")).toContain("lecke-dash-runway");
    expect(glossarySupportHref("wms")).toContain("lecke-motor-wms");
    expect(glossarySupportHref("jit")).toContain("lecke-motor-jit");
    expect(glossarySupportHref("idleCash")).toContain("lecke-motor-holtpenz");
    expect(glossarySupportHref("dock")).toContain("lecke-motor-dokk");
    expect(glossarySupportHref("vat")).toContain("lecke-motor-afa-kor");
    expect(glossarySupportHref("pdca")).toContain("lecke-3-pdca");
    expect(glossarySupportHref("kpi")).toContain("lecke-dash-kpi-sav");
    expect(glossarySupportHref("want")).toContain("lecke-2-szukseglet-vagy-befektetes");
    expect(glossarySupportHref("cashflow")).toContain("lecke-cashflow-logika");
  });

  it("keeps the professional term and a beginner plain line", () => {
    expect(glossaryCopy("runway").term).toBe("Runway");
    expect(glossaryCopy("runway").plain).toMatch(/hónap/i);
    expect(glossaryTooltip("dock")).toMatch(/rakodó/i);
    expect(glossaryCopy("cashflow").plain).toMatch(/pénz/i);
  });
});
