import { describe, expect, it } from "vitest";
import { applyPdcaMilestone, getPdcaCycleCount, getPdcaCycleSum, getTopPdcaWorkspaces } from "./pdcaCycle";
import type { WorkspaceMeta } from "./finance";

const base = (over: Partial<WorkspaceMeta> = {}): WorkspaceMeta => ({
  id: "ws1",
  type: "business",
  ...over,
});

describe("pdcaCycle", () => {
  it("marks milestones idempotently", () => {
    const m0 = base();
    const p1 = applyPdcaMilestone(m0, "plan");
    expect(p1?.pdca_milestones?.plan_at).toBeTruthy();
    const m1 = { ...m0, ...p1! };
    expect(applyPdcaMilestone(m1, "plan")).toBeNull();
  });

  it("increments cycle when ACT→new PLAN completes chain", () => {
    let m = base({
      pdca_milestones: {
        plan_at: "2026-01-01T00:00:00.000Z",
        do_at: "2026-01-02T00:00:00.000Z",
        check_at: "2026-01-03T00:00:00.000Z",
        act_at: null,
      },
      pdca_cycle_count: 3,
    });
    const withAct = applyPdcaMilestone(m, "act");
    m = { ...m, ...withAct! };
    const done = applyPdcaMilestone(m, "plan", { completeCycle: true });
    expect(done?.pdca_cycle_count).toBe(4);
    expect(done?.last_cycle_completed_at).toBeTruthy();
    expect(done?.pdca_milestones?.do_at).toBeNull();
    expect(getPdcaCycleCount({ ...m, ...done! })).toBe(4);
  });

  it("sums and ranks workspace cycles", () => {
    const list: WorkspaceMeta[] = [
      base({ id: "a", alias: "A", pdca_cycle_count: 2 }),
      base({ id: "b", alias: "B", pdca_cycle_count: 5 }),
      base({ id: "c", alias: "C", pdca_cycle_count: 0 }),
      base({ id: "d", alias: "D", pdca_cycle_count: 3 }),
    ];
    expect(getPdcaCycleSum(list)).toBe(10);
    expect(getTopPdcaWorkspaces(list, 3).map((w) => w.id)).toEqual(["b", "d", "a"]);
  });
});
