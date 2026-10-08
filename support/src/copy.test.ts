import { describe, expect, it } from "vitest";

import { supportChecklist, supportFaqSections, supportTips } from "./copy";

describe("support copy", () => {
  it("puts the troubleshooting checklist first and keeps HU/EN in lockstep", () => {
    const hu = supportChecklist("hu");
    const en = supportChecklist("en");
    expect(hu).toHaveLength(8);
    expect(en).toHaveLength(hu.length);
    expect(hu.map((x) => x.id)).toEqual(en.map((x) => x.id));
    expect(hu[0]?.q).toMatch(/modul/i);
    expect(en[0]?.q).toMatch(/module/i);
    expect(hu.some((x) => /nyelv/i.test(x.q))).toBe(true);
    expect(en.some((x) => /language/i.test(x.q))).toBe(true);
    expect(hu.some((x) => /Magán|fül/i.test(x.q))).toBe(true);
    expect(en.some((x) => /Personal|tab/i.test(x.q))).toBe(true);
    expect(hu.some((x) => /zárom|nyitom/i.test(x.q))).toBe(true);
    expect(en.some((x) => /lock|open the workspace/i.test(x.q))).toBe(true);
    expect(supportFaqSections("hu")[0]?.category).toMatch(/ellenőrző/i);
    expect(supportFaqSections("en")[0]?.category).toMatch(/checklist/i);
    expect(supportTips("hu").some((x) => /Laboratórium/i.test(x.q))).toBe(true);
    expect(supportTips("en").some((x) => /Laboratory/i.test(x.q))).toBe(true);
  });
});
