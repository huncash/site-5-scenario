import { useEffect, useMemo, useState } from "react";

import { readAccessRole, type AccessRole } from "@/lib/accessRole";
import { readLicense } from "@/lib/license";
import {
  hasPermission,
  resolveCurrentPlanId,
  resolvePlanActorRole,
  type PlanActorRole,
  type PlanPermission,
} from "@/lib/planPermissions";
import { getPlan, type PlanConfig, type PlanId } from "@/config/plans";

type Snapshot = {
  planId: PlanId;
  plan: PlanConfig;
  role: PlanActorRole;
  accessRole: AccessRole;
};

function readSnapshot(): Snapshot {
  const accessRole = readAccessRole();
  const planId = resolveCurrentPlanId();
  return {
    planId,
    plan: getPlan(planId),
    role: resolvePlanActorRole({ accessRole }),
    accessRole,
  };
}

/** Aktuális csomag + szerepkör jogai a PLANS_CONFIG-ból. */
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
    const check = (permission: PlanPermission) =>
      hasPermission(snap.planId, snap.role, permission);
    return {
      planId: snap.planId,
      plan: snap.plan,
      role: snap.role,
      accessRole: snap.accessRole,
      quotas: snap.plan.quotas,
      features: snap.plan.features,
      hasPermission: check,
      /** Alias a brief szerinti API-hoz. */
      can: check,
      license: readLicense(),
    };
  }, [snap]);
}
