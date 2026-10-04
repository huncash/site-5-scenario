import { describe, expect, it } from "vitest";

import { parseSupportPath, supportHref } from "./router";

describe("support router", () => {
  it("parses ticket and embed paths", () => {
    expect(parseSupportPath("/ticket")).toEqual({ embed: false, slug: "ticket" });
    expect(parseSupportPath("/embed/ticket")).toEqual({ embed: true, slug: "ticket" });
    expect(parseSupportPath("/")).toEqual({ embed: false, slug: "home" });
    expect(parseSupportPath("/embed")).toEqual({ embed: true, slug: "home" });
  });

  it("builds hrefs", () => {
    expect(supportHref("ticket")).toBe("/ticket");
    expect(supportHref("ticket", { embed: true, lang: "hu" })).toBe("/embed/ticket?lang=hu");
    expect(supportHref("home", { lang: "en" })).toBe("/?lang=en");
  });
});
