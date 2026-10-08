import { describe, expect, it } from "vitest";

import { InMemoryDataStore } from "@/lib/mesh/dataStore";
import { createMeshRepository } from "@/lib/mesh/meshRepository";
import type { MeshSchema } from "@/lib/mesh/schema";
import {
  readDashboardBlockOpen,
  resolveDashboardBlockOpen,
  writeDashboardBlockOpen,
} from "@/lib/dashboardBlocks";
import {
  DASHBOARD_LABS,
  LAB_STATUS_ACTIVE,
  LAB_STATUS_PREVIEW,
  LABS_DEFAULT_ON_DASHBOARD,
  isDashboardLabId,
  isSubsetLabId,
  labChipVisible,
  labDefaultOnDashboard,
  labShowsOnDashboard,
  resolveLabSurface,
} from "@/lib/dashboardLabs";

describe("dashboardLabs", () => {
  it("keeps paid labs off the dashboard until toggled; PDCA subsets default on", () => {
    expect(LABS_DEFAULT_ON_DASHBOARD).toBe(false);
    expect(DASHBOARD_LABS.map((lab) => lab.id)).toEqual([
      "labs-baseline",
      "labs-sim",
      "labs-shock",
      "labs-advise",
      "labs-kpi",
      "labs-halmozott",
      "labs-szumma",
      "labs-edge",
      "labs-anon",
    ]);
    expect(labDefaultOnDashboard("labs-baseline")).toBe(true);
    expect(labDefaultOnDashboard("labs-sim")).toBe(true);
    expect(labDefaultOnDashboard("labs-shock")).toBe(true);
    expect(labDefaultOnDashboard("labs-advise")).toBe(true);
    expect(labDefaultOnDashboard("labs-kpi")).toBe(false);
    expect(labShowsOnDashboard("labs-kpi")).toBe(false);
    expect(labShowsOnDashboard("labs-baseline")).toBe(true);
    expect(labDefaultOnDashboard("labs-halmozott")).toBe(false);
    expect(labDefaultOnDashboard("labs-szumma")).toBe(false);
    expect(labDefaultOnDashboard("labs-edge")).toBe(false);
    expect(labDefaultOnDashboard("labs-anon")).toBe(false);
    expect(labShowsOnDashboard("labs-anon")).toBe(true);
    expect(resolveDashboardBlockOpen(undefined, labDefaultOnDashboard("labs-baseline"))).toBe(true);
    expect(resolveDashboardBlockOpen(undefined, labDefaultOnDashboard("labs-szumma"))).toBe(false);
    for (const lab of DASHBOARD_LABS) {
      expect(isDashboardLabId(lab.id)).toBe(true);
    }
  });

  it("persists a lab toggle through MeshRepository", async () => {
    const repo = createMeshRepository(new InMemoryDataStore<MeshSchema>());
    expect(await readDashboardBlockOpen(repo, "labs-szumma", LABS_DEFAULT_ON_DASHBOARD)).toBe(false);
    await writeDashboardBlockOpen(repo, "labs-szumma", true);
    expect(await readDashboardBlockOpen(repo, "labs-szumma", LABS_DEFAULT_ON_DASHBOARD)).toBe(true);
  });

  it("keeps a value pitch and preview status until the lab is on the dashboard", () => {
    expect(LAB_STATUS_PREVIEW).toBe("Megtekintés / Kipróbálás");
    expect(LAB_STATUS_ACTIVE).toBe("Aktív");
    for (const lab of DASHBOARD_LABS) {
      expect(lab.value.length).toBeGreaterThan(24);
    }
    expect(resolveLabSurface({ entitled: true, pipedToDashboard: false })).toEqual({
      onDashboard: false,
      status: "preview",
    });
    expect(resolveLabSurface({ entitled: true, pipedToDashboard: true })).toEqual({
      onDashboard: true,
      status: "active",
    });
    expect(resolveLabSurface({ entitled: false, pipedToDashboard: true }).onDashboard).toBe(false);
  });

  it("keeps lab chips off the dashboard strip unless the lab is piped on", () => {
    expect(labChipVisible("labs-halmozott", { engineOn: true, onDashboard: false })).toBe(false);
    expect(labChipVisible("labs-halmozott", { engineOn: true, onDashboard: true })).toBe(true);
    expect(labChipVisible("labs-halmozott", { engineOn: false, onDashboard: true })).toBe(false);
    expect(labChipVisible("labs-edge", { engineOn: true, onDashboard: false })).toBe(false);
    expect(labChipVisible("labs-edge", { engineOn: true, onDashboard: true })).toBe(true);
  });

  it("never shows a chip for the four PDCA subset labs", () => {
    expect(isSubsetLabId("labs-baseline")).toBe(true);
    expect(isSubsetLabId("labs-halmozott")).toBe(false);
    expect(labChipVisible("labs-baseline", { engineOn: true, onDashboard: true })).toBe(false);
    expect(labChipVisible("labs-sim", { engineOn: true, onDashboard: true })).toBe(false);
    expect(labChipVisible("labs-shock", { engineOn: true, onDashboard: true })).toBe(false);
    expect(labChipVisible("labs-advise", { engineOn: true, onDashboard: true })).toBe(false);
    expect(labChipVisible("labs-kpi", { engineOn: true, onDashboard: true })).toBe(false);
  });
});
