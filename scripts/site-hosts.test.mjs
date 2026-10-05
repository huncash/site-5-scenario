import { describe, expect, it } from "vitest";
import { resolveSiteKey, resolveSiteRoot } from "./site-hosts.mjs";

describe("site-hosts", () => {
  it("classifies bill by hostname, not by serving the main root", () => {
    expect(resolveSiteKey("bill.szcenario.hu")).toBe("bill");
    expect(resolveSiteKey("szcenario.hu")).toBe("main");
    expect(resolveSiteRoot("bill", "/var/www/szcenario/.output/public")).toBe(
      "/var/www/szcenario/.output/public/sites/bill",
    );
    expect(resolveSiteRoot("main", "/var/www/szcenario/.output/public")).toBe(
      "/var/www/szcenario/.output/public",
    );
    expect(resolveSiteRoot("support", "/var/www/szcenario/.output/public")).toBe(
      "/var/www/szcenario/.output/public/sites/support",
    );
    expect(resolveSiteKey("school.szcenario.hu")).toBe("school");
    expect(resolveSiteRoot("school", "/var/www/szcenario/.output/public")).toBe(
      "/var/www/szcenario/.output/public",
    );
  });
});
