import { afterEach, describe, expect, it } from "vitest";

import { markDemoCaseEngines } from "@/lib/engineFrames";

import { InMemoryDataStore } from "@/lib/mesh/dataStore";
import { createMeshRepository } from "@/lib/mesh/meshRepository";
import type { MeshSchema } from "@/lib/mesh/schema";
import { activateDemoCaseEngines, readEngineOn, toggleEngine, writeEngineOn } from "@/lib/labsEngines";

function repo() {
  return createMeshRepository(new InMemoryDataStore<MeshSchema>());
}

describe("labsEngines", () => {
  afterEach(() => {
    markDemoCaseEngines(false);
  });

  it("keeps economic always on and persists education / BCP toggles", async () => {
    const r = repo();
    expect(await readEngineOn(r)).toEqual({ economic: true, resilience: false, education: false });
    const onEdu = await toggleEngine(r, "education");
    expect(onEdu.switched).toBe(true);
    expect(onEdu.on.education).toBe(true);
    expect(onEdu.on.economic).toBe(true);
    const refuse = await toggleEngine(r, "economic");
    expect(refuse.refused).toBe(true);
    expect(refuse.on.economic).toBe(true);
    await writeEngineOn(r, { economic: false, resilience: true, education: true });
    expect(await readEngineOn(r)).toEqual({ economic: true, resilience: true, education: true });
  });

  it("turns all three engines on for a demo case", async () => {
    const r = repo();
    expect(await activateDemoCaseEngines(r)).toEqual({
      economic: true,
      resilience: true,
      education: true,
    });
    expect(await readEngineOn(r)).toEqual({ economic: true, resilience: true, education: true });
  });
});
