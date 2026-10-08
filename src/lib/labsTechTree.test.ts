import { describe, expect, it } from "vitest";

import {
  LABS_ENGINES,
  LABS_JIT_ADDONS,
  LABS_CAP,
  LABS_CORE,
  LABS_MESH_DESK,
  LABS_STEM,
  labsCapPath,
  LABS_TREE_MODULES,
  isLabsSharedModule,
  LABS_TREE_VIEW,
  activeEngineCount,
  applyEngineToggle,
  atLeastOneEngineActive,
  canDeactivateEngine,
  coreKindIsEconomic,
  labsBerryPath,
  labsClippedSegments,
  labsTreeEdges,
  resolveEngineOn,
} from "@/lib/labsTechTree";

describe("labsTechTree", () => {
  it("keeps the economic engine as the always-on core", () => {
    expect(coreKindIsEconomic()).toBe(true);
    const economic = LABS_ENGINES.find((e) => e.id === "economic")!;
    expect(economic.alwaysOn).toBe(true);
    expect(economic.startable).toBe(true);
    expect(LABS_ENGINES.find((e) => e.id === "education")?.startable).toBe(true);
    expect(LABS_ENGINES.find((e) => e.id === "resilience")?.startable).toBe(true);
    expect(LABS_ENGINES).toHaveLength(3);
    expect(economic.pos).toEqual({ x: 200, y: 168 });
    expect(LABS_ENGINES.find((e) => e.id === "resilience")?.pos).toEqual({ x: 70, y: 86 });
    expect(LABS_ENGINES.find((e) => e.id === "education")?.pos).toEqual({ x: 330, y: 86 });
  });

  it("branches dashboard labs from engines and refuses to drop the last motor", () => {
    expect(LABS_TREE_MODULES.map((m) => m.id)).toEqual([
      "labs-kpi",
      "labs-baseline",
      "labs-sim",
      "labs-halmozott",
      "labs-edge",
      "labs-shock",
      "labs-advise",
      "labs-szumma",
      "labs-anon",
    ]);
    expect(LABS_TREE_MODULES.find((m) => m.id === "labs-edge")?.engine).toBe("economic");
    expect(LABS_TREE_MODULES.find((m) => m.id === "labs-anon")?.engine).toBe("education");
    const on = resolveEngineOn();
    expect(atLeastOneEngineActive(on)).toBe(true);
    expect(canDeactivateEngine("economic", on)).toBe(false);
    expect(activeEngineCount(on)).toBe(1);
    expect(labsTreeEdges().length).toBeGreaterThanOrEqual(7);
    expect(labsTreeEdges(["economic"]).length).toBeLessThan(labsTreeEdges().length);
    expect(LABS_TREE_VIEW.w).toBeLessThanOrEqual(400);
    expect(LABS_MESH_DESK.id).toBe("mesh-desk");
    expect(LABS_MESH_DESK.pos.y).toBeLessThan(LABS_CORE.pos.y);
    expect(LABS_TREE_MODULES.find((m) => m.id === "labs-szumma")?.pos.y).toBeLessThan(LABS_CORE.pos.y);
    expect(labsCapPath()).toMatch(/^M /);
    expect(LABS_CAP.cy).toBe(0);
    expect(
      labsTreeEdges().some((e) => e.to.x === LABS_MESH_DESK.pos.x && e.to.y === LABS_MESH_DESK.pos.y),
    ).toBe(false);
    expect(isLabsSharedModule("labs-szumma")).toBe(true);
    expect(isLabsSharedModule("mesh-desk")).toBe(true);
    expect(isLabsSharedModule("labs-kpi")).toBe(false);
    expect(LABS_STEM.from).toEqual({ x: 200, y: 0 });
    expect(LABS_STEM.to).toEqual({ x: 200, y: 86 });
    expect(LABS_JIT_ADDONS.map((a) => a.id)).toEqual([
      "case_plus_1",
      "slot_plus_1",
      "seat_plus_1",
      "guest_plus_1",
    ]);
    expect(labsBerryPath({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe("M 0 0 L 10 0");
    const withEdu = applyEngineToggle("education", on);
    expect(withEdu?.education).toBe(true);
    expect(applyEngineToggle("economic", withEdu!)).toBeNull();
    expect(applyEngineToggle("education", withEdu!)?.education).toBe(false);
  });

  it("clips straight edges inside berry disks and keeps the complement", () => {
    const box = { w: 400, h: 372 };
    const segs = labsClippedSegments(
      { x: 0, y: 100 },
      { x: 200, y: 100 },
      [
        { pos: { x: 0, y: 100 }, rPx: 20 },
        { pos: { x: 200, y: 100 }, rPx: 20 },
      ],
      box,
    );
    expect(segs).toHaveLength(1);
    expect(segs[0]![0].x).toBeGreaterThan(18);
    expect(segs[0]![1].x).toBeLessThan(182);

    const through = labsClippedSegments(
      { x: 0, y: 50 },
      { x: 200, y: 50 },
      [
        { pos: { x: 0, y: 50 }, rPx: 10 },
        { pos: { x: 100, y: 50 }, rPx: 10 },
        { pos: { x: 200, y: 50 }, rPx: 10 },
      ],
      box,
    );
    expect(through.length).toBe(2);
  });
});
