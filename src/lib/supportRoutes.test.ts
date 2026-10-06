import { describe, expect, it } from "vitest";

import {
  canonicalizeSupportSlug,
  resolveSupportSlug,
  searchSupportLessons,
  supportLessonByRef,
  supportSlugForKb,
} from "@/lib/supportRoutes";

describe("supportRoutes", () => {
  it("canonicalizes dashboard and need/invest lesson URLs", () => {
    expect(canonicalizeSupportSlug("lecke-02")).toBe("lecke-1-dashboard-kezeles");
    expect(canonicalizeSupportSlug("lecke-1-dashboard-kezeles")).toBe("lecke-1-dashboard-kezeles");
    expect(canonicalizeSupportSlug("lecke-2-szukseglet-vagy-befektetes")).toBe(
      "lecke-2-szukseglet-vagy-befektetes",
    );
    expect(canonicalizeSupportSlug("lecke-03")).toBe("lecke-3-pdca");
    expect(canonicalizeSupportSlug("kb/lesson-kahn")).toBe("kahn-strategiai-elagazas");
  });

  it("keeps static layers", () => {
    expect(resolveSupportSlug("pricing").kind).toBe("static");
    expect(resolveSupportSlug("gyik").canonical).toBe("gyik");
    expect(resolveSupportSlug("").kind).toBe("home");
  });

  it("searches by keyword and content", () => {
    expect(searchSupportLessons("dashboard")[0]?.path).toBe("lecke-1-dashboard-kezeles");
    expect(searchSupportLessons("want").some((l) => l.path.includes("szukseglet"))).toBe(true);
    expect(searchSupportLessons("cashflow").some((l) => l.path === "lecke-cashflow-logika")).toBe(true);
    expect(searchSupportLessons("runway").some((l) => l.path === "kahn-strategiai-elagazas")).toBe(true);
    expect(searchSupportLessons("12 hónap").some((l) => l.path === "lecke-dash-horizont")).toBe(true);
    expect(canonicalizeSupportSlug("dash-kpi-sav")).toBe("lecke-dash-kpi-sav");
    expect(canonicalizeSupportSlug("motor-jit")).toBe("lecke-motor-jit");
    expect(searchSupportLessons("dokk").some((l) => l.path === "lecke-motor-dokk")).toBe(true);
    expect(searchSupportLessons("holtpénz").some((l) => l.path === "lecke-motor-holtpenz")).toBe(true);
    expect(searchSupportLessons("küszöb").some((l) => l.path === "lecke-motor-kuszob")).toBe(true);
    expect(searchSupportLessons("raktárdivat").some((l) => l.path === "lecke-motor-jit")).toBe(true);
    expect(searchSupportLessons("majd jól jön").some((l) => l.path === "lecke-motor-holtpenz")).toBe(true);
    expect(searchSupportLessons("opciódíj").some((l) => l.path === "lecke-motor-opcio")).toBe(true);
    expect(searchSupportLessons("zzzz-nincs")).toEqual([]);
  });

  it("maps knowledge-base ids to public lesson paths", () => {
    expect(supportSlugForKb("lesson-bcp")).toBe("vallalati-bcp-folytonossag");
    expect(supportLessonByRef("lesson-kahn")?.path).toBe("kahn-strategiai-elagazas");
  });
});
