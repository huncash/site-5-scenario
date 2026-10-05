import { describe, expect, it } from "vitest";

import {
  applyViewPrefsToSearch,
  cookieDomainForHost,
  parseViewPrefsToken,
  readViewPrefsFromSearch,
  serializeViewPrefs,
  VIEW_PREFS_BOOT_SCRIPT,
  withViewPrefs,
} from "@/lib/viewPrefs";

describe("viewPrefs", () => {
  it("serializes and parses the cookie token", () => {
    const token = serializeViewPrefs({ theme: "light", palette: "slate", a11y: true, locale: "en" });
    expect(token).toBe("light.slate.1.en");
    expect(parseViewPrefsToken(token)).toEqual({
      theme: "light",
      palette: "slate",
      a11y: true,
      locale: "en",
    });
    expect(parseViewPrefsToken("dark.forest.0.hu")).toEqual({
      theme: "dark",
      palette: "forest",
      a11y: false,
      locale: "hu",
    });
  });

  it("shares the cookie on szcenario subdomains", () => {
    expect(cookieDomainForHost("szcenario.hu")).toBe(".szcenario.hu");
    expect(cookieDomainForHost("bill.szcenario.hu")).toBe(".szcenario.hu");
    expect(cookieDomainForHost("support.szcenario.hu")).toBe(".szcenario.hu");
    expect(cookieDomainForHost("localhost")).toBeUndefined();
  });

  it("reads query overrides", () => {
    expect(readViewPrefsFromSearch("?theme=light&palette=bronze&a11y=1&lang=en")).toEqual({
      theme: "light",
      palette: "bronze",
      a11y: true,
      locale: "en",
    });
  });

  it("attaches prefs to outbound URLs", () => {
    const url = applyViewPrefsToSearch(new URL("https://bill.szcenario.hu/"), {
      theme: "light",
      palette: "slate",
      a11y: true,
      locale: "en",
    });
    expect(url.searchParams.get("theme")).toBe("light");
    expect(url.searchParams.get("palette")).toBe("slate");
    expect(url.searchParams.get("a11y")).toBe("1");
    expect(url.searchParams.get("lang")).toBe("en");
    expect(withViewPrefs("/gyik", { theme: "dark", palette: "forest", a11y: false, locale: "hu" })).toBe(
      "/gyik?theme=dark&palette=forest&a11y=0&lang=hu",
    );
  });

  it("keeps a blocking boot script for head inject", () => {
    expect(VIEW_PREFS_BOOT_SCRIPT).toContain("szcenario_view");
    expect(VIEW_PREFS_BOOT_SCRIPT).toContain("szcenario_theme");
    expect(VIEW_PREFS_BOOT_SCRIPT.startsWith("(function")).toBe(true);
  });
});
