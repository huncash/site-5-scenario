import { describe, expect, it } from "vitest";

import {
  ANON_CASE_KIND,
  anonCaseFilename,
  buildAnonCasePack,
  isAnonCaseFilename,
  isLocalSzcPackText,
  parseAnonCasePack,
  slugAnonAlias,
  textContainsLivePii,
} from "@/lib/anonCasePack";
import { buildEconomicReadSnapshot } from "@/lib/bcpEconomicOverlay";
import { InMemoryDataStore } from "@/lib/mesh/dataStore";
import { createMeshRepository } from "@/lib/mesh/meshRepository";
import type { MeshSchema } from "@/lib/mesh/schema";
import { compareAnonSeries, importForumNote, readForumNotes } from "@/lib/forumNotes";

function snap() {
  return buildEconomicReadSnapshot({
    baseline: {
      orgKind: "business",
      orgLabel: "Acme Kft. valós cég",
      headcount: 14,
      sizeHint: "14 fős",
      startingResources: { cashHuf: 4_000_000 },
      monthlyRevenueNet: 8_000_000,
    },
    live: { cashHuf: 4_000_000, opexHuf: 300_000, runwayMonths: 12 },
  });
}

describe("anonCasePack", () => {
  it("builds a local .xyz_anonim_eset.szc pack with PD/CA shots and no live name", async () => {
    const res = await buildAnonCasePack(snap(), { anonOn: true, leakNeedles: ["Acme", "valós cég"] });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.pack.kind).toBe(ANON_CASE_KIND);
    expect(isAnonCaseFilename(res.pack.filename)).toBe(true);
    expect(res.pack.filename).toBe(anonCaseFilename(res.pack.study.orgAlias));
    expect(res.pack.filename.endsWith("_anonim_eset.szc")).toBe(true);
    expect(res.pack.study.orgAlias).not.toMatch(/Acme/i);
    expect(res.pack.shots.pd).toMatch(/^data:image\/svg\+xml/);
    expect(res.pack.shots.ca).toMatch(/^data:image\/svg\+xml/);
    expect(res.pack.shots.pd).toContain("PD");
    expect(decodeURIComponent(res.pack.shots.ca)).toContain("CA");
    expect(res.pack.nostr.tags).toContainEqual(["anon", "1"]);
    expect(res.pack.localOnly).toBe(true);
    const again = await parseAnonCasePack(res.text);
    expect(again.ok).toBe(true);
  });

  it("refuses export when anonymizer is off, and refuses live PII on parse", async () => {
    expect((await buildAnonCasePack(snap(), { anonOn: false })).ok).toBe(false);
    expect(textContainsLivePii("HU12345678901234567890")).toBe(true);
    const leaked = JSON.stringify({
      v: 1,
      kind: ANON_CASE_KIND,
      study: { orgAlias: "hello@example.com", cashHuf: 1, monthlyRevenueHuf: 1, monthlyOpexHuf: 1, costMix: [] },
    });
    expect((await parseAnonCasePack(leaked)).ok).toBe(false);
    expect(slugAnonAlias("Tanműhely 1")).toBe("tanmuhely-1");
    expect(isLocalSzcPackText(JSON.stringify({ orgLabel: "Acme Kft.", cashHuf: 1 }))).toBe(false);
  });
});

describe("forumNotes local nostr framework", () => {
  it("imports an unsigned note locally and compares two series", async () => {
    const store = new InMemoryDataStore<MeshSchema>();
    const repo = createMeshRepository(store);
    const a = await buildAnonCasePack(snap(), { anonOn: true, leakNeedles: ["Acme"] });
    expect(a.ok).toBe(true);
    if (!a.ok) return;
    const saved = await importForumNote(repo, a.text);
    expect(saved.ok).toBe(true);
    const bStudy = { ...a.pack.study, orgAlias: "Tanműhely 2", cashHuf: a.pack.study.cashHuf + 500_000 };
    const b = await importForumNote(repo, JSON.stringify(bStudy));
    expect(b.ok).toBe(true);
    const rows = await readForumNotes(repo);
    expect(rows.length).toBe(2);
    const cmp = compareAnonSeries(a.pack.study, bStudy);
    expect(cmp.cashDelta).toBe(500_000);
  });
});
