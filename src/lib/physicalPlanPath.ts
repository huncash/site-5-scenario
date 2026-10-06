import { useEffect, useState } from "react";

type Selected = Record<string, string>;
type Listener = () => void;

const byCase = new Map<string, Selected>();
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function readPhysicalPlanPath(caseId: string): Selected {
  return byCase.get(caseId) ?? {};
}

export function setPhysicalChoice(caseId: string, forkId: string, choiceId: string) {
  const cur = { ...(byCase.get(caseId) ?? {}) };
  cur[forkId] = choiceId;
  byCase.set(caseId, cur);
  emit();
}

export function resetPhysicalPlanPath(caseId?: string) {
  if (caseId) byCase.delete(caseId);
  else byCase.clear();
  emit();
}

export function usePhysicalPlanPath(caseId: string) {
  const [, tick] = useState(0);
  useEffect(() => {
    const on = () => tick((n) => n + 1);
    listeners.add(on);
    return () => {
      listeners.delete(on);
    };
  }, []);
  const selected = readPhysicalPlanPath(caseId);
  return {
    selected,
    setChoice: (forkId: string, choiceId: string) => setPhysicalChoice(caseId, forkId, choiceId),
  };
}
