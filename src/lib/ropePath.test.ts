import { describe, expect, it } from "vitest";

import {
  ampsAtProgress,
  ampsAtStep,
  buildRopeAtProgress,
  buildTangledRope,
  hitchXAtHaul,
  phasesFromProgress,
  ROPE_FIXED_X,
  ROPE_HAUL_REST_X,
  ROPE_O_KACSA_GAP,
  ROPE_ROPE_START,
  ROPE_ROLLER,
  ROPE_STRAIGHTEN_STEPS,
  ROPE_TOTAL_STEPS,
  ROPE_VB,
  ropeGroundY,
  ropeTotalLength,
} from "./ropePath";

describe("ropePath", () => {
  it("builds a left-drum to right-fixed spine with waves, loops, and knots", () => {
    const bp = buildTangledRope();
    expect(bp.spine.startsWith("M ")).toBe(true);
    expect(bp.segments.some((s) => s.kind === "wave")).toBe(true);
    expect(bp.segments.some((s) => s.kind === "loop")).toBe(true);
    expect(bp.segments.some((s) => s.kind === "knot")).toBe(true);
    expect(bp.crossings.length).toBeGreaterThanOrEqual(1);
    expect(ropeTotalLength(bp)).toBeGreaterThan(900);
    expect(bp.start.x).toBe(ROPE_ROPE_START);
    expect(bp.end.x).toBe(ROPE_FIXED_X);
    expect(ROPE_ROPE_START).toBe(ROPE_ROLLER.cx); // tetőpont — ott tekeredik fel
    expect(ROPE_ROLLER.r).toBeCloseTo(28.8, 5);
    expect(ROPE_FIXED_X - ROPE_ROPE_START).toBe(1050);
    expect(ROPE_VB.w).toBe(1828);
    expect(ROPE_TOTAL_STEPS).toBe(16);
    // Körvonal alsó éle a földvonalon (r + fél stroke)
    expect(ROPE_ROLLER.cy + ROPE_ROLLER.r + 1.5).toBeCloseTo(ropeGroundY(), 5);
  });

  it("straightens by mid progress, then hauls the hitch to the o-kacsa rest gap", () => {
    const mid = phasesFromProgress(0.5);
    expect(mid.straighten).toBeCloseTo(1, 5);
    expect(mid.haul).toBeCloseTo(0, 5);

    const straight = buildRopeAtProgress(0.5);
    expect(straight.viewBox).toEqual(ROPE_VB);
    expect(straight.end.x).toBe(ROPE_FIXED_X);
    const ySpread =
      Math.max(...straight.samples.map((p) => p.y)) - Math.min(...straight.samples.map((p) => p.y));
    expect(ySpread).toBeLessThan(8);

    const hauled = buildRopeAtProgress(1);
    expect(hauled.haul).toBeCloseTo(1, 5);
    expect(ROPE_O_KACSA_GAP).toBeCloseTo(27.83, 5);
    expect(hauled.end.x).toBeCloseTo(ROPE_HAUL_REST_X, 5);
    expect(hitchXAtHaul(0)).toBeCloseTo(ROPE_FIXED_X, 5);
    expect(hitchXAtHaul(1)).toBeCloseTo(ROPE_HAUL_REST_X, 5);
    expect(hauled.end.x).toBeLessThan(straight.end.x);
    expect(hauled.end.x).toBeGreaterThan(ROPE_ROPE_START);
    // Megereszkedett o-kacsa (fele sag): enyhén lefelé kilóg
    const maxY = Math.max(...hauled.samples.map((p) => p.y));
    expect(maxY).toBeGreaterThan(hauled.end.y + 4);
  });

  it("removes left-side slack before right-side slack", () => {
    const mid = ampsAtStep(3);
    expect(mid.wave1).toBeLessThan(mid.wave5);
    expect(mid.loop1).toBeLessThan(mid.loop3);
    const done = ampsAtStep(ROPE_STRAIGHTEN_STEPS);
    expect(Object.values(done).every((v) => v === 0)).toBe(true);
    const p = ampsAtProgress(0.5);
    expect(p.wave1).toBeLessThanOrEqual(p.wave5);
  });
});
