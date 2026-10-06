import { describe, expect, it } from "vitest";

import { SEO_HOME_DESCRIPTION, SEO_HOME_TITLE, SEO_OG_DESCRIPTION, SEO_OG_TITLE } from "@/content/seo";
import { publicSeoHead, seoCanonicalUrl, supportSeoPageFromPath } from "@/lib/seo";

describe("public SEO", () => {
  it("indexes local-first browser Case/Slot and 2027 desktop bonus", () => {
    expect(SEO_HOME_TITLE).toMatch(/^Szcenárió/);
    expect(SEO_HOME_TITLE).not.toMatch(/Szenárió —/);
    expect(SEO_HOME_TITLE).toMatch(/böngészőben/);
    expect(SEO_HOME_TITLE).toMatch(/Case\/Slot/);
    expect(SEO_HOME_DESCRIPTION).toMatch(/felhős adatbázis/);
    expect(SEO_HOME_DESCRIPTION).toMatch(/2027/);
    expect(SEO_HOME_DESCRIPTION).toMatch(/ingyen/);
    expect(SEO_OG_TITLE).toMatch(/böngésződben/);
    expect(SEO_OG_DESCRIPTION).toMatch(/2027/);
  });

  it("sets og:url and canonical per surface", () => {
    expect(seoCanonicalUrl("home")).toBe("https://szcenario.hu");
    expect(seoCanonicalUrl("school")).toBe("https://school.szcenario.hu");
    expect(seoCanonicalUrl("pricing")).toBe("https://support.szcenario.hu/pricing");
    const home = publicSeoHead("home");
    expect(home.meta.some((m) => "property" in m && m.property === "og:type" && m.content === "website")).toBe(true);
    expect(home.links[0]?.href).toBe("https://szcenario.hu");
  });

  it("maps support splat to pricing vs support", () => {
    expect(supportSeoPageFromPath("/support/pricing")).toBe("pricing");
    expect(supportSeoPageFromPath("/support/gyik")).toBe("support");
  });
});
