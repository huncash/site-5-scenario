import { useCallback, useContext, useEffect, useState } from "react";

import { EntitlementOfferContext } from "@/components/EntitlementModal";
import {
  evaluateEntitlement,
  isEntitled,
  type EntitlementId,
} from "@/lib/entitlement";
import { LICENSE_CHANGE_EVENT } from "@/lib/license";

export function useEntitled(id: EntitlementId): boolean {
  const [ok, setOk] = useState(() => isEntitled(id));

  useEffect(() => {
    const refresh = () => setOk(isEntitled(id));
    refresh();
    window.addEventListener(LICENSE_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(LICENSE_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [id]);

  return ok;
}

export function useEntitlementGuard() {
  const ctx = useContext(EntitlementOfferContext);

  const requestEnable = useCallback(
    (id: EntitlementId, onAllow?: () => void): boolean => {
      const decision = evaluateEntitlement(id);
      if (decision.ok) {
        onAllow?.();
        return true;
      }
      ctx?.offer(decision);
      return false;
    },
    [ctx],
  );

  return { requestEnable };
}
