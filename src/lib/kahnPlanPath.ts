import { useEffect, useState } from "react";

import type { KahnContractId, KahnFinancingId } from "@/lib/strategyCases";

type Listener = () => void;

/** Bisztró minta: organikus tartás — azonnal számolt runway / kilépés / havi teher. */
const DEFAULT_FINANCING: KahnFinancingId = "organic";
const DEFAULT_LOAN_CONTRACT: KahnContractId = "flex";

let financing: KahnFinancingId | null = DEFAULT_FINANCING;
let contract: KahnContractId | null = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function readKahnPlanPath() {
  return { financing, contract };
}

export function setKahnFinancing(next: KahnFinancingId) {
  financing = next;
  if (next === "organic") contract = null;
  else if (!contract) contract = DEFAULT_LOAN_CONTRACT;
  emit();
}

export function setKahnContract(next: KahnContractId) {
  financing = "loan";
  contract = next;
  emit();
}

export function resetKahnPlanPath() {
  financing = DEFAULT_FINANCING;
  contract = null;
  emit();
}

export function useKahnPlanPath() {
  const [, tick] = useState(0);
  useEffect(() => {
    const on = () => tick((n) => n + 1);
    listeners.add(on);
    return () => {
      listeners.delete(on);
    };
  }, []);
  return {
    financing,
    contract,
    setFinancing: setKahnFinancing,
    setContract: setKahnContract,
  };
}
