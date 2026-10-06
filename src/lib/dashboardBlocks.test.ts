import { describe, expect, it } from "vitest";

import { InMemoryDataStore } from "@/lib/mesh/dataStore";
import { createMeshRepository } from "@/lib/mesh/meshRepository";
import type { MeshSchema } from "@/lib/mesh/schema";
import {
  readDashboardBlockOpen,
  resolveDashboardBlockOpen,
  writeDashboardBlockOpen,
} from "@/lib/dashboardBlocks";

describe("dashboardBlocks", () => {
  it("defaults when nothing is saved", () => {
    expect(resolveDashboardBlockOpen(undefined, true)).toBe(true);
    expect(resolveDashboardBlockOpen(undefined, false)).toBe(false);
  });

  it("uses the stored open flag", () => {
    expect(resolveDashboardBlockOpen({ id: "penzaramlas", open: false }, true)).toBe(false);
    expect(resolveDashboardBlockOpen({ id: "hoterkep", open: true }, false)).toBe(true);
  });

  it("keeps viz blocks closed until the user opens them", () => {
    expect(resolveDashboardBlockOpen(undefined, false)).toBe(false);
    expect(resolveDashboardBlockOpen({ id: "halmozott", open: true }, false)).toBe(true);
  });

  it("keeps the KPI bar closed until the user opens it", () => {
    expect(resolveDashboardBlockOpen(undefined, false)).toBe(false);
    expect(resolveDashboardBlockOpen({ id: "kpi-quick-bar", open: true }, false)).toBe(true);
  });

  it("keeps PDCA section frames open until the user closes them", () => {
    expect(resolveDashboardBlockOpen(undefined, true)).toBe(true);
    expect(resolveDashboardBlockOpen({ id: "pdca-plan", open: false }, true)).toBe(false);
  });

  it("persists through MeshRepository", async () => {
    const repo = createMeshRepository(new InMemoryDataStore<MeshSchema>());
    expect(await readDashboardBlockOpen(repo, "penzaramlas", true)).toBe(true);
    await writeDashboardBlockOpen(repo, "penzaramlas", false);
    expect(await readDashboardBlockOpen(repo, "penzaramlas", true)).toBe(false);
  });
});
