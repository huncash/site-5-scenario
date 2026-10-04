import { useEffect } from "react";
import { toast } from "sonner";

import { clearAccessRole, isViewerReadonly, readViewerToken } from "@/lib/accessRole";
import {
  clearActiveGuestSession,
  guestKickMessage,
  readActiveGuestSession,
  subscribeGuestSession,
} from "@/lib/auth/guestSlots";

/** Per-code single session: másik eszköz átvételekor Guest session lezárása. */
export function GuestSessionGuard() {
  useEffect(() => {
    if (!isViewerReadonly()) return;

    return subscribeGuestSession({
      onKick: (info) => {
        const active = readActiveGuestSession();
        const token = readViewerToken();
        if (!active && !token) return;
        const code = active?.code ?? token ?? "";
        if (info.code && code && info.code !== code) return;
        if (info.exceptSessionId && active?.sessionId === info.exceptSessionId) return;

        const idx = active?.slotIndex ?? 0;
        toast.warning(guestKickMessage(idx || 1));
        clearActiveGuestSession();
        clearAccessRole();
      },
    });
  }, []);

  return null;
}
