import { useEffect, useState } from "react";

import { isViewerReadonly } from "@/lib/accessRole";
import {
  guestWatermarkLabel,
  readActiveGuestSession,
  subscribeGuestSession,
  type GuestSessionClaim,
} from "@/lib/auth/guestSlots";

/** Könnyű, privacy-preserving vízjel a Guest dashboardon (Slot ID + fragment). */
export function GuestWatermark() {
  const [claim, setClaim] = useState<GuestSessionClaim | null>(() =>
    typeof window !== "undefined" ? readActiveGuestSession() : null,
  );

  useEffect(() => {
    if (!isViewerReadonly()) {
      setClaim(null);
      return;
    }
    setClaim(readActiveGuestSession());
    return subscribeGuestSession({
      onKick: () => setClaim(readActiveGuestSession()),
      onPool: () => setClaim(readActiveGuestSession()),
    });
  }, []);

  if (!isViewerReadonly() || !claim) return null;

  const label = guestWatermarkLabel(claim);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[40] overflow-hidden select-none"
    >
      <div
        className="absolute left-1/2 top-1/2 w-[140vmax] -translate-x-1/2 -translate-y-1/2 -rotate-[-28deg] text-center text-[11px] font-medium tracking-[0.35em] text-slate-500/[0.14] sm:text-xs"
        style={{ textShadow: "0 0 1px rgba(0,0,0,0.05)" }}
      >
        {Array.from({ length: 8 }, (_, row) => (
          <div key={row} className="mb-16 whitespace-nowrap">
            {Array.from({ length: 6 }, (_, col) => (
              <span key={col} className="mx-10 inline-block">
                {label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
