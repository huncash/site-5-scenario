import type { PdcaMilestones, WorkspaceMeta } from "@/lib/finance";

export type PdcaPhaseMark = "plan" | "do" | "check" | "act";

export function getPdcaCycleCount(meta: WorkspaceMeta | null | undefined): number {
  return Math.max(0, Number(meta?.pdca_cycle_count ?? 0));
}

/** Globális PDCA ciklus szumma — minden workspace count összege */
export function getPdcaCycleSum(workspaces: WorkspaceMeta[] | null | undefined): number {
  if (!workspaces?.length) return 0;
  return workspaces.reduce((acc, w) => acc + getPdcaCycleCount(w), 0);
}

/** Top N workspace a legmagasabb pdca_cycle_count szerint */
export function getTopPdcaWorkspaces(
  workspaces: WorkspaceMeta[] | null | undefined,
  limit = 3,
): WorkspaceMeta[] {
  if (!workspaces?.length) return [];
  return [...workspaces]
    .sort((a, b) => getPdcaCycleCount(b) - getPdcaCycleCount(a) || a.id.localeCompare(b.id))
    .filter((w) => getPdcaCycleCount(w) > 0)
    .slice(0, Math.max(0, limit));
}

function nowIso() {
  return new Date().toISOString();
}

/**
 * Milestone jelölés. Ha ACT után új PLAN indul (completeCycle=true),
 * és a lánc teljes volt, növeli a ciklusszámlálót és reseteli a mérföldköveket.
 */
export function applyPdcaMilestone(
  meta: WorkspaceMeta,
  phase: PdcaPhaseMark,
  opts?: { completeCycle?: boolean },
): Partial<WorkspaceMeta> | null {
  const prev = meta.pdca_milestones ?? {};
  const ms: PdcaMilestones = { ...prev };
  const at = nowIso();
  let changed = false;
  if (phase === "plan" && !ms.plan_at) {
    ms.plan_at = at;
    changed = true;
  }
  if (phase === "do" && !ms.do_at) {
    ms.do_at = at;
    changed = true;
  }
  if (phase === "check" && !ms.check_at) {
    ms.check_at = at;
    changed = true;
  }
  if (phase === "act" && !ms.act_at) {
    ms.act_at = at;
    changed = true;
  }

  const chainComplete = Boolean(ms.plan_at && ms.do_at && ms.check_at && ms.act_at);

  // Teljes PLAN→DO→CHECK→ACT lánc után új PLAN: ciklus +1
  if (opts?.completeCycle && chainComplete) {
    const nextCount = getPdcaCycleCount(meta) + 1;
    return {
      pdca_cycle_count: nextCount,
      last_cycle_completed_at: at,
      pdca_milestones: { plan_at: at, do_at: null, check_at: null, act_at: null },
    };
  }

  // ACT→új PLAN, de a lánc még hiányos: csak új PLAN mérföldkő, számláló nélkül
  if (opts?.completeCycle && !chainComplete) {
    return {
      pdca_milestones: {
        plan_at: at,
        do_at: null,
        check_at: null,
        act_at: null,
      },
    };
  }

  if (!changed) return null;
  return { pdca_milestones: ms };
}
