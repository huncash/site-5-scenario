import { describe, expect, it } from "vitest";

import { kbById, kbCopy } from "@/lib/knowledgeBase";

describe("knowledgeBase", () => {
  it("ships bilingual nav articles for the flask tree, lock and language", () => {
    const tree = kbById("labs-dev-tree");
    const lock = kbById("poka-yoke-guard");
    const lang = kbById("language-persist");
    expect(tree?.title).toMatch(/Laboratórium/);
    expect(lock?.title).toMatch(/zár/i);
    expect(lang?.title).toMatch(/Nyelv/);
    expect(kbCopy(tree!, "en").title).toMatch(/Laboratory/i);
    expect(kbCopy(lock!, "en").summary).toMatch(/asks/i);
    expect(kbCopy(lang!, "en").body).toMatch(/lang=hu/);
    expect(kbCopy(lang!, "hu").body).toMatch(/HU \/ EN/);
    expect(kbCopy(kbById("concept-case-slot")!, "en").title).toMatch(/Case vs Slot/);
    expect(kbCopy(kbById("new-workspace")!, "en").summary).toMatch(/flask/i);
  });
});
