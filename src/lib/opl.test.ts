import { describe, expect, it } from "vitest";

import { DASH_OPL_LESSONS } from "@/lib/oplDashboard";
import { MOTOR_OPL_LESSONS } from "@/lib/oplMotor";
import { OPL_CORE_LESSONS, OPL_FRAME, OPL_LESSONS, oplByPath } from "@/lib/opl";

describe("opl", () => {
  it("keeps the three overview OPLs", () => {
    expect(OPL_CORE_LESSONS.map((l) => l.path)).toEqual([
      "lecke-1-dashboard-kezeles",
      "lecke-2-szukseglet-vagy-befektetes",
      "lecke-cashflow-logika",
      "lecke-3-pdca",
    ]);
  });

  it("ships a unique dash OPL for each scanned dashboard element", () => {
    expect(DASH_OPL_LESSONS.length).toBeGreaterThanOrEqual(25);
    const paths = DASH_OPL_LESSONS.map((l) => l.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const lesson of DASH_OPL_LESSONS) {
      expect(lesson.path).toMatch(/^lecke-dash-[a-z0-9-]+$/);
    }
  });

  it("requires why, steps, figure slots and a deep-dive on every OPL", () => {
    for (const lesson of OPL_LESSONS) {
      expect(lesson.whyHu.length).toBeLessThan(180);
      expect(lesson.deepDiveHu.length).toBeGreaterThan(200);
      expect(lesson.deepDiveEn.length).toBeGreaterThan(160);
      expect(lesson.steps.length).toBeGreaterThanOrEqual(3);
      expect(lesson.jargon.length).toBeGreaterThan(0);
      for (const step of lesson.steps) {
        expect(step.actionHu.split(" ").length).toBeLessThan(22);
        expect(step.image?.captionHu.length).toBeGreaterThan(3);
      }
    }
  });

  it("keeps a fixed figure frame", () => {
    expect(OPL_FRAME).toEqual({ widthPx: 320, heightPx: 180 });
  });

  it("ships a unique motor OPL for each engine element", () => {
    expect(MOTOR_OPL_LESSONS.length).toBeGreaterThanOrEqual(15);
    const paths = MOTOR_OPL_LESSONS.map((l) => l.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const slug of ["jit", "dokk", "afa-kor", "holtpenz", "kuszob", "opcio"]) {
      expect(paths).toContain(`lecke-motor-${slug}`);
    }
    for (const lesson of MOTOR_OPL_LESSONS) {
      expect(lesson.path).toMatch(/^lecke-motor-[a-z0-9-]+$/);
    }
  });

  it("resolves by path", () => {
    expect(oplByPath("lecke-cashflow-logika")?.id).toBe("lecke-cashflow");
    expect(oplByPath("lecke-3-pdca")?.steps.every((s) => Boolean(s.image?.src))).toBe(true);
    expect(oplByPath("lecke-dash-pdca-tarcsa")?.steps.every((s) => Boolean(s.image?.src))).toBe(true);
    expect(oplByPath("lecke-dash-horizont")?.titleHu).toMatch(/6 \/ 12 \/ 24/);
    expect(oplByPath("lecke-dash-horizont")?.steps.every((s) => Boolean(s.image?.src))).toBe(true);
    expect(oplByPath("lecke-motor-jit")?.titleHu).toMatch(/JIT/i);
    expect(oplByPath("nincs")).toBeNull();
  });
});
