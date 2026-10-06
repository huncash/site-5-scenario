import { useEffect, useState } from "react";

type Pair = { primary: string | null; secondary: string | null };
type Listener = () => void;

const byCase = new Map<string, Pair>();
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function blank(): Pair {
  return { primary: null, secondary: null };
}

export function readStrategyPlanPath(caseId: string): Pair {
  return byCase.get(caseId) ?? blank();
}

export function setStrategyPrimary(caseId: string, primary: string) {
  byCase.set(caseId, { primary, secondary: null });
  emit();
}

export function setStrategySecondary(caseId: string, secondary: string) {
  const cur = byCase.get(caseId) ?? blank();
  byCase.set(caseId, { primary: cur.primary, secondary });
  emit();
}

export function resetStrategyPlanPath(caseId?: string) {
  if (caseId) byCase.delete(caseId);
  else byCase.clear();
  emit();
}

export function useStrategyPlanPath(caseId: string) {
  const [, tick] = useState(0);
  useEffect(() => {
    const on = () => tick((n) => n + 1);
    listeners.add(on);
    return () => {
      listeners.delete(on);
    };
  }, []);
  const path = readStrategyPlanPath(caseId);
  return {
    primary: path.primary,
    secondary: path.secondary,
    setPrimary: (id: string) => setStrategyPrimary(caseId, id),
    setSecondary: (id: string) => setStrategySecondary(caseId, id),
  };
}
