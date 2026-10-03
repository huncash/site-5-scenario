import { describe, expect, it } from "vitest";

import {
  isPublicMarketingPath,
  isWorkspacePath,
  resolveSiteHost,
  shouldShowSiteFooter,
} from "@/lib/siteSurface";

describe("siteSurface footer visibility", () => {
  it("classifies hosts", () => {
    expect(resolveSiteHost("szcenario.hu")).toBe("main");
    expect(resolveSiteHost("localhost", "5100")).toBe("main");
    expect(resolveSiteHost("bill.szcenario.hu")).toBe("bill");
    expect(resolveSiteHost("localhost", "5110")).toBe("bill");
    expect(resolveSiteHost("support.szcenario.hu")).toBe("support");
    expect(resolveSiteHost("app.szcenario.hu")).toBe("app");
    expect(resolveSiteHost("app.example.test")).toBe("app");
  });

  it("shows footer on the main door, about, funnels, bill and support", () => {
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/", homeMode: "door" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/about" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/f/oktatas-szimulacio" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/bcp" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "bill.szcenario.hu", pathname: "/" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "localhost", port: "5110", pathname: "/" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "support.szcenario.hu", pathname: "/" })).toBe(true);
  });

  it("hides footer on app host, dashboard and workspace routes", () => {
    expect(shouldShowSiteFooter({ hostname: "app.szcenario.hu", pathname: "/" })).toBe(false);
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/", homeMode: "dashboard" })).toBe(false);
    expect(shouldShowSiteFooter({ hostname: "localhost", port: "5100", pathname: "/", homeMode: "dashboard" })).toBe(
      false,
    );
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/settings" })).toBe(false);
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/login/activate" })).toBe(false);
    expect(shouldShowSiteFooter({ hostname: "support.szcenario.hu", pathname: "/embed/gyik" })).toBe(false);
    expect(shouldShowSiteFooter({ hostname: "support.szcenario.hu", pathname: "/", embed: true })).toBe(false);
  });

  it("keeps marketing vs workspace path sets apart", () => {
    expect(isPublicMarketingPath("/")).toBe(true);
    expect(isPublicMarketingPath("/oktatas")).toBe(true);
    expect(isWorkspacePath("/settings")).toBe(true);
    expect(isWorkspacePath("/embed/tippek")).toBe(true);
    expect(isWorkspacePath("/about")).toBe(false);
  });
});
