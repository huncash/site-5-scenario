import { describe, expect, it } from "vitest";

import {
  hrefWithLang,
  inheritedLang,
  keepLang,
  langHrefNeedsRestore,
  langSearch,
  parseLangSearch,
  withInheritedLang,
} from "@/lib/langSearch";

describe("langSearch", () => {
  it("parses lang and locale query keys", () => {
    expect(parseLangSearch({ lang: "en" })).toEqual({ lang: "en" });
    expect(parseLangSearch({ locale: "hu" })).toEqual({ lang: "hu" });
    expect(parseLangSearch({ lang: "de" })).toEqual({ lang: undefined });
    expect(parseLangSearch({ profile: "p" })).toEqual({ lang: undefined });
  });

  it("inherits lang onto a new search object without dropping extra keys", () => {
    expect(withInheritedLang({ profile: "p1" }, { lang: "en", tab: "backup" })).toEqual({
      profile: "p1",
      lang: "en",
    });
  });

  it("keeps an explicit lang on the extra search", () => {
    expect(inheritedLang({ lang: "en" })).toBe("en");
    expect(withInheritedLang({ profile: "p", lang: "hu" }, { lang: "en" })).toEqual({
      profile: "p",
      lang: "hu",
    });
  });

  it("keepLang preserves other keys and locks lang", () => {
    expect(keepLang({ profile: "p1", tab: "backup", lang: "en" })).toEqual({
      profile: "p1",
      tab: "backup",
      lang: "en",
    });
  });

  it("langSearch is lang-only", () => {
    expect(langSearch({ lang: "en", tab: "x" })).toEqual({ lang: "en" });
  });

  it("hrefWithLang restores missing query", () => {
    expect(langHrefNeedsRestore("/settings", "en")).toBe(true);
    expect(hrefWithLang("/settings?tab=backup", "en")).toBe("/settings?tab=backup&lang=en");
    expect(langHrefNeedsRestore("/?lang=en", "en")).toBe(false);
  });
});
