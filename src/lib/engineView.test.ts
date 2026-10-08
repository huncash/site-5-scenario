import { describe, expect, it } from "vitest";

import {
  applyExclusiveEngineEye,
  ENGINE_SECTION_ID,
  engineEyeOpen,
  engineLicenseLed,
  exclusiveEngineView,
  LABS_MESH_DESK_PATH,
} from "@/lib/engineView";

describe("engine view", () => {
  it("keeps exclusive focus on one engine for the stable dashboard", () => {
    expect(exclusiveEngineView("economic", "economic")).toBe(true);
    expect(exclusiveEngineView("economic", "resilience")).toBe(false);
    expect(exclusiveEngineView("resilience", "resilience")).toBe(true);
    expect(LABS_MESH_DESK_PATH).toBe("/labs/desk");
    expect(ENGINE_SECTION_ID.resilience).toBe("engine-bcp-section");
    const all = { engines: ["education", "resilience"] as const };
    const none = { engines: [] as const };
    expect(applyExclusiveEngineEye("economic", "education", all)).toBe("education");
    expect(applyExclusiveEngineEye("economic", "education", none)).toBe("economic");
    expect(engineEyeOpen("education", "education", all)).toBe(true);
    expect(engineEyeOpen("education", "education", none)).toBe(false);
    expect(engineEyeOpen("education", "economic", all)).toBe(false);
    expect(engineEyeOpen("education", "resilience", all)).toBe(false);
    expect(engineLicenseLed("economic", { engines: [] })).toBe("green");
    expect(engineLicenseLed("resilience", { engines: [] })).toBe("red");
    expect(engineLicenseLed("resilience", { engines: ["resilience"] })).toBe("green");
  });
});
