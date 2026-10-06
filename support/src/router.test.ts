import { describe, expect, it } from "vitest";

import { parseSupportPath, supportHref } from "./router";

describe("support router", () => {
  it("parses ticket and embed paths", () => {
    expect(parseSupportPath("/ticket")).toEqual({ embed: false, slug: "ticket" });
    expect(parseSupportPath("/embed/ticket")).toEqual({ embed: true, slug: "ticket" });
    expect(parseSupportPath("/")).toEqual({ embed: false, slug: "home" });
    expect(parseSupportPath("/embed")).toEqual({ embed: true, slug: "home" });
  });

  it("strips /support mount without ports", () => {
    expect(parseSupportPath("/support")).toEqual({ embed: false, slug: "home" });
    expect(parseSupportPath("/support/pricing")).toEqual({ embed: false, slug: "pricing" });
    expect(parseSupportPath("/support/embed/gyik")).toEqual({ embed: true, slug: "gyik" });
  });

  it("builds hrefs", () => {
    expect(supportHref("ticket")).toBe("/ticket");
    expect(supportHref("ticket", { embed: true, lang: "hu" })).toBe("/embed/ticket?lang=hu");
    expect(supportHref("home", { lang: "en" })).toBe("/?lang=en");
  });

  it("canonicalizes lesson aliases in hrefs", () => {
    expect(supportHref("lecke-02")).toBe("/lecke-1-dashboard-kezeles");
    expect(supportHref("lecke-03", { embed: true, lang: "hu" })).toBe("/embed/lecke-3-pdca?lang=hu");
    expect(parseSupportPath("/lecke-1-dashboard-kezeles")).toEqual({
      embed: false,
      slug: "lecke-1-dashboard-kezeles",
    });
  });
});
