import { describe, expect, it } from "vitest";

import {
  canPromotePlanToDo,
  copyTxnStatusForMotor,
  plannedDocumentsAllowed,
  resolveTxnStatusForMotor,
  resolveWhatIfForMotor,
} from "@/lib/labMotor";

describe("labMotor", () => {
  it("forces realistic what-if when simulation is off", () => {
    expect(resolveWhatIfForMotor(true, "optimistic")).toBe("optimistic");
    expect(resolveWhatIfForMotor(true, "pessimistic")).toBe("pessimistic");
    expect(resolveWhatIfForMotor(false, "optimistic")).toBe("realistic");
    expect(resolveWhatIfForMotor(false, "pessimistic")).toBe("realistic");
    expect(resolveWhatIfForMotor(false, "realistic")).toBe("realistic");
  });

  it("blocks PLAN→DO without a project or when baseline is off", () => {
    expect(canPromotePlanToDo({ hasWorkspace: false, workspaceType: "project", baselineOn: true })).toEqual({
      ok: false,
      code: "no-workspace",
    });
    expect(canPromotePlanToDo({ hasWorkspace: true, workspaceType: "business", baselineOn: true })).toEqual({
      ok: false,
      code: "not-project",
    });
    expect(canPromotePlanToDo({ hasWorkspace: true, workspaceType: "project", baselineOn: false })).toEqual({
      ok: false,
      code: "baseline-off",
    });
    expect(canPromotePlanToDo({ hasWorkspace: true, workspaceType: "project", baselineOn: true })).toEqual({
      ok: true,
    });
  });

  it("collapses planned documents when simulation is off", () => {
    expect(plannedDocumentsAllowed(true)).toBe(true);
    expect(plannedDocumentsAllowed(false)).toBe(false);
    expect(resolveTxnStatusForMotor(false, "planned")).toBe("committed");
    expect(resolveTxnStatusForMotor(false, "actual")).toBe("actual");
    expect(resolveTxnStatusForMotor(true, "planned")).toBe("planned");
    expect(copyTxnStatusForMotor(false, "planned", "simulation")).toBe("committed");
    expect(copyTxnStatusForMotor(true, null, "simulation")).toBe("planned");
    expect(copyTxnStatusForMotor(false, null, "simulation")).toBe("committed");
  });
});
