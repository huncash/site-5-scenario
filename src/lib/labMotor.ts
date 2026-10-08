/**
 * Motor-kapu: a számítás, cashflow-pálya, tervezett bizonylat és PLAN→DO
 * a Dev Tree modulok aktuális állapotát követi.
 */

export type WhatIfScenario = "optimistic" | "realistic" | "pessimistic";
export type TxnLifecycleStatus = "planned" | "committed" | "actual";

export type PromotePlanToDoInput = {
  hasWorkspace: boolean;
  workspaceType?: string | null;
  baselineOn: boolean;
};

export type PromotePlanToDoResult =
  | { ok: true }
  | { ok: false; code: "no-workspace" | "not-project" | "baseline-off" };

/** Szimuláció ki: csak a realisztikus pálya él. */
export function resolveWhatIfForMotor(
  simOn: boolean,
  scenario: WhatIfScenario,
): WhatIfScenario {
  return simOn ? scenario : "realistic";
}

export function canPromotePlanToDo(input: PromotePlanToDoInput): PromotePlanToDoResult {
  if (!input.hasWorkspace) return { ok: false, code: "no-workspace" };
  if (input.workspaceType !== "project") return { ok: false, code: "not-project" };
  if (!input.baselineOn) return { ok: false, code: "baseline-off" };
  return { ok: true };
}

/** Tervezett tétel csak a szimulációs modul mellett. */
export function resolveTxnStatusForMotor(
  simOn: boolean,
  requested: TxnLifecycleStatus,
): TxnLifecycleStatus {
  if (!simOn && requested === "planned") return "committed";
  return requested;
}

export function plannedDocumentsAllowed(simOn: boolean): boolean {
  return simOn;
}

export function copyTxnStatusForMotor(
  simOn: boolean,
  sourceStatus: TxnLifecycleStatus | null | undefined,
  projectMode: string | null | undefined,
): TxnLifecycleStatus {
  if (sourceStatus && sourceStatus !== "actual") {
    return resolveTxnStatusForMotor(simOn, sourceStatus);
  }
  if (projectMode === "simulation" && simOn) return "planned";
  return "committed";
}
