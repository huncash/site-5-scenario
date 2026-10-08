import { describe, expect, it } from "vitest";

import { InMemoryDataStore } from "@/lib/mesh/dataStore";
import { createMeshRepository } from "@/lib/mesh/meshRepository";
import type { MeshSchema } from "@/lib/mesh/schema";
import {
  clearEngineInterest,
  incrementEngineInterest,
  noteEngineStart,
  readEngineInterest,
} from "@/lib/engineInterest";
import { readEngineOn } from "@/lib/labsEngines";
import {
  buildEnginePackProposal,
  projectTwoPillarFromInterest,
  scoreInterest,
} from "@/lib/private/enginePackProposal";

function repo() {
  return createMeshRepository(new InMemoryDataStore<MeshSchema>());
}

describe("engineInterest", () => {
  it("counts click / start / switch locally and turns the started engine on", async () => {
    const r = repo();
    await incrementEngineInterest(r, "education", "click");
    await noteEngineStart(r, "education");
    const map = await readEngineInterest(r);
    expect(map.education.clicks).toBe(1);
    expect(map.education.starts).toBe(1);
    expect(map.education.switches).toBe(1);
    expect(map.economic.starts).toBe(0);
    const on = await readEngineOn(r);
    expect(on.economic).toBe(true);
    expect(on.education).toBe(true);
  });

  it("ignores inner / unknown kinds and can reset", async () => {
    const r = repo();
    await noteEngineStart(r, "inner");
    await incrementEngineInterest(r, "resilience", "click");
    await clearEngineInterest(r);
    const map = await readEngineInterest(r);
    expect(map.resilience.clicks).toBe(0);
    expect(map.education.starts).toBe(0);
  });
});

describe("enginePackProposal", () => {
  it("weights starts over clicks and keeps economic as default copy when empty", () => {
    expect(scoreInterest({ id: "education", clicks: 2, starts: 1, switches: 1, updatedAt: 1 })).toBe(7);
    const empty = buildEnginePackProposal({
      economic: { id: "economic", clicks: 0, starts: 0, switches: 0, updatedAt: 0 },
      education: { id: "education", clicks: 0, starts: 0, switches: 0, updatedAt: 0 },
      resilience: { id: "resilience", clicks: 0, starts: 0, switches: 0, updatedAt: 0 },
    });
    expect(empty.leader).toBeNull();
    expect(empty.copyHu).toContain("Gazdasági motor");
    const edu = buildEnginePackProposal({
      economic: { id: "economic", clicks: 1, starts: 0, switches: 0, updatedAt: 1 },
      education: { id: "education", clicks: 1, starts: 2, switches: 1, updatedAt: 1 },
      resilience: { id: "resilience", clicks: 4, starts: 0, switches: 0, updatedAt: 1 },
    });
    expect(edu.leader).toBe("education");
    expect(edu.copyHu).toContain("oktatási");
    expect(edu.copyHu).toContain("Nincs havi előfizetés");
    expect(edu.projection.licenses).toBeGreaterThan(0);
  });

  it("converts local interest into Option A / Option B revenue only", () => {
    const map = {
      economic: { id: "economic" as const, clicks: 0, starts: 2, switches: 0, updatedAt: 1 },
      education: { id: "education" as const, clicks: 0, starts: 0, switches: 0, updatedAt: 0 },
      resilience: { id: "resilience" as const, clicks: 0, starts: 0, switches: 0, updatedAt: 0 },
    };
    const p = projectTwoPillarFromInterest(map, {
      y1: 399_000,
      installmentShare: 0.5,
      attachRate: 0.65,
    });
    expect(p.licenses).toBe(2);
    expect(p.optionARevenue).toBe(798_000);
    expect(p.optionACashMonth1 + p.optionACashDay60).toBe(798_000);
    expect(p.optionBRevenue36m).toBe(2 * 0.65 * (299_000 + 239_000));
    expect(p.total36mGross).toBe(p.optionARevenue + p.optionBRevenue36m);
  });
});
