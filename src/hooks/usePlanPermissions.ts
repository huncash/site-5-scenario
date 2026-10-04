import { useEffect, useMemo, useState } from "react";

import { readAccessRole, type AccessRole } from "@/lib/accessRole";
import { readLicense } from "@/lib/license";
import {
  evaluateLicenseGate,
  hasPermission,
  resolveCurrentPlanId,
  resolvePlanActorRole,
  type LicenseGate,
  type PlanActorRole,
  type PlanPermission,
} from "@/lib/planPermissions";
import { getPlan, type PlanConfig, type PlanId } from "@/config/plans";

type Snapshot = {
  planId: PlanId;
  plan: PlanConfig;
  role: PlanActorRole;
  accessRole: AccessRole;
  gate: LicenseGate;
};

function readSnapshot(): Snapshot {
  const accessRole = readAccessRole();
  const planId = resolveCurrentPlanId();
  const license = readLicense();
  return {
    planId,
    plan: getPlan(planId),
    role: resolvePlanActorRole({ accessRole }),
    accessRole,
    gate: evaluateLicenseGate(license),
  };
}

/** Aktuális csomag + szerepkör + verzió/frissítés kapu a PLANS_CONFIG-ból. */
export function usePlanPermissions() {
  const [snap, setSnap] = useState<Snapshot>(() => readSnapshot());

  useEffect(() => {
    const refresh = () => setSnap(readSnapshot());
    window.addEventListener("szcenario:access_role", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("szcenario:access_role", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return useMemo(() => {
    const license = readLicense();
    const check = (permission: PlanPermission) =>
      hasPermission(snap.planId, snap.role, permission, license);
    return {
      planId: snap.planId,
      plan: snap.plan,
      role: snap.role,
      accessRole: snap.accessRole,
      quotas: snap.plan.quotas,
      features: snap.plan.features,
      /** Verzió / updatesUntil / licenseExpiryDate kapu (nem havi lejárat). */
      licenseGate: snap.gate,
      updatesActive: snap.gate.updatesActive,
      engineOk: snap.gate.engineOk,
      runtimeOk: snap.gate.runtimeOk,
      hasPermission: check,
      can: check,
      license,
    };
  }, [snap]);
}
