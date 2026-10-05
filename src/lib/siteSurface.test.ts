import { describe, expect, it } from "vitest";

import {
  isPublicMarketingPath,
  isWorkspacePath,
  MAIN_ORIGIN_PROD,
  mainPublicOrigin,
  currentSiteHost,
  resolveSiteHost,
  shouldShowSiteFooter,
  SITE_KIND_BOOT_SCRIPT,
} from "@/lib/siteSurface";
import { SUPPORT_ORIGIN_PROD, supportPublicOrigin } from "@/lib/support";

describe("siteSurface footer visibility", () => {
  it("classifies hosts by subdomain, not by local port", () => {
    expect(resolveSiteHost("szcenario.hu")).toBe("main");
    expect(resolveSiteHost("www.szcenario.hu")).toBe("main");
    expect(resolveSiteHost("localhost")).toBe("main");
    expect(resolveSiteHost("bill.szcenario.hu")).toBe("bill");
    expect(resolveSiteHost("support.szcenario.hu")).toBe("support");
    expect(resolveSiteHost("docs.szcenario.hu")).toBe("docs");
    expect(resolveSiteHost("blog.szcenario.hu")).toBe("blog");
    expect(resolveSiteHost("app.szcenario.hu")).toBe("app");
    expect(resolveSiteHost("app.example.test")).toBe("app");
  });

  it("classifies same-origin path prefixes without ports", () => {
    expect(resolveSiteHost("localhost", "", "/")).toBe("main");
    expect(resolveSiteHost("localhost", "", "/bill")).toBe("bill");
    expect(resolveSiteHost("szcenario.hu", "", "/bill/checkout")).toBe("bill");
    expect(resolveSiteHost("localhost", "", "/support")).toBe("support");
    expect(resolveSiteHost("szcenario.hu", "", "/support/pricing")).toBe("support");
    expect(resolveSiteHost("localhost", "", "/docs")).toBe("docs");
    expect(resolveSiteHost("localhost", "", "/blog")).toBe("blog");
  });

  it("currentSiteHost uses hostname + pathname, never a port", () => {
    expect(currentSiteHost({ hostname: "bill.szcenario.hu", port: "5110", pathname: "/" })).toBe("bill");
    expect(currentSiteHost({ hostname: "szcenario.hu", port: "5100", pathname: "/bill" })).toBe("bill");
    expect(currentSiteHost({ hostname: "support.szcenario.hu", port: "5120", pathname: "/" })).toBe("support");
    expect(currentSiteHost({ hostname: "szcenario.hu", port: "5100", pathname: "/support" })).toBe("support");
    expect(currentSiteHost({ hostname: "szcenario.hu", port: "5100", pathname: "/" })).toBe("main");
    expect(SITE_KIND_BOOT_SCRIPT).toContain("data-site-kind");
    expect(SITE_KIND_BOOT_SCRIPT).toContain("bill.szcenario.hu");
    expect(SITE_KIND_BOOT_SCRIPT).not.toMatch(/:\d{3,}/);
  });

  it("shows footer on the main door, about, funnels, bill and support", () => {
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/", homeMode: "door" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/about" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/gdpr" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/aszf" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/f/oktatas-szimulacio" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/bcp" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "bill.szcenario.hu", pathname: "/" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "localhost", pathname: "/bill" })).toBe(true);
    expect(shouldShowSiteFooter({ hostname: "support.szcenario.hu", pathname: "/" })).toBe(true);
  });

  it("hides footer on app host, dashboard and workspace routes", () => {
    expect(shouldShowSiteFooter({ hostname: "app.szcenario.hu", pathname: "/" })).toBe(false);
    expect(shouldShowSiteFooter({ hostname: "szcenario.hu", pathname: "/", homeMode: "dashboard" })).toBe(false);
    expect(shouldShowSiteFooter({ hostname: "localhost", pathname: "/", homeMode: "dashboard" })).toBe(false);
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

  it("resolves public origins from hostname, never localhost ports", () => {
    expect(mainPublicOrigin("bill.szcenario.hu")).toBe(MAIN_ORIGIN_PROD);
    expect(mainPublicOrigin("support.szcenario.hu")).toBe(MAIN_ORIGIN_PROD);
    expect(mainPublicOrigin("localhost")).toBe(MAIN_ORIGIN_PROD);
    expect(mainPublicOrigin("szcenario.hu")).toBe(MAIN_ORIGIN_PROD);
    expect(supportPublicOrigin("szcenario.hu", "/")).toBe(SUPPORT_ORIGIN_PROD);
    expect(supportPublicOrigin("bill.szcenario.hu", "/")).toBe(SUPPORT_ORIGIN_PROD);
    expect(supportPublicOrigin("support.szcenario.hu")).toBe(SUPPORT_ORIGIN_PROD);
    expect(mainPublicOrigin("localhost")).not.toMatch(/:\d+/);
    expect(supportPublicOrigin("localhost", "/")).not.toMatch(/:\d+/);
  });
});
