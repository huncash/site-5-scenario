import { describe, expect, it } from "vitest";

import { buildEconomicReadSnapshot } from "@/lib/bcpEconomicOverlay";
import {
  aliasOrgLabel,
  anonymizeEconomicSnapshot,
  applyAnonOverrides,
  buildAnonLexicon,
  classifyAnonKind,
  formatAnonCover,
  studyContainsRawLeak,
  buildEducationNostrNote,
} from "@/lib/educationAnonymize";

describe("educationAnonymize", () => {
  it("strips live names and rounds amounts, then builds a local Nostr note", () => {
    const snap = buildEconomicReadSnapshot({
      baseline: {
        orgKind: "business",
        orgLabel: "Acme Kft. valós cég",
        headcount: 14,
        sizeHint: "14 fős",
        startingResources: { cashHuf: 4_217_333 },
        monthlyRevenueNet: 8_412_001,
      },
      live: { cashHuf: 4_217_333, opexHuf: 310_440, runwayMonths: 13.58 },
    });
    const study = anonymizeEconomicSnapshot(snap);
    expect(study.orgAlias).toBe(aliasOrgLabel("Acme Kft. valós cég"));
    expect(study.orgAlias).not.toMatch(/Acme/i);
    expect(study.cashHuf % 1_000).toBe(0);
    expect(studyContainsRawLeak(study, ["Acme", "valós cég"])).toBe(false);
    const note = buildEducationNostrNote(study);
    expect(note.kind).toBe(1);
    expect(note.tags).toContainEqual(["anon", "1"]);
    expect(note.content).toContain(study.orgAlias);
    expect(note.content).not.toMatch(/Acme/i);
    expect(study.covers.some((c) => c.kind === "org")).toBe(true);
    expect(JSON.stringify(study.covers)).not.toMatch(/Acme/i);
  });

  it("assigns category cover names A/C/P and keeps overrides leak-free", () => {
    expect(classifyAnonKind("Rozsdamentes acél alapanyag")).toBe("material");
    expect(classifyAnonKind("Saját késztermék — terasz menü")).toBe("product");
    expect(classifyAnonKind("Molnár Pékség Kft.")).toBe("partner");
    expect(formatAnonCover("material", 1).label).toBe("A1 alapanyag");
    expect(formatAnonCover("product", 2).label).toBe("C2 termék");
    expect(formatAnonCover("partner", 1).label).toBe("P1 partner");
    const lex = buildAnonLexicon({
      orgLabel: "Acme Kft. valós cég",
      rows: [
        { raw: "búza alapanyag" },
        { raw: "kenyér késztermék" },
        { raw: "Molnár Pékség Kft." },
      ],
    });
    expect(lex.covers.map((c) => c.label)).toEqual(
      expect.arrayContaining(["A1 alapanyag", "C1 termék", "P1 partner"]),
    );
    const patched = applyAnonOverrides(lex, { [lex.covers.find((c) => c.kind === "partner")!.key]: "P1 nagyker" });
    expect(patched.covers.find((c) => c.kind === "partner")?.label).toBe("P1 nagyker");
    const study = anonymizeEconomicSnapshot(
      buildEconomicReadSnapshot({
        baseline: {
          orgKind: "business",
          orgLabel: "Acme Kft. valós cég",
          headcount: 8,
          sizeHint: "8 fős",
          startingResources: { cashHuf: 2_000_000 },
          monthlyRevenueNet: 1_000_000,
        },
      }),
      undefined,
      { rows: [{ raw: "Molnár Pékség Kft." }] },
    );
    expect(studyContainsRawLeak(study, ["Acme", "Molnár"])).toBe(false);
  });
});
