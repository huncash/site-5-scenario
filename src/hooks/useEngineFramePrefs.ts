import { ACCESS_ROLE, readAccessRole } from "@/lib/accessRole";
import { BCP_VIEW_BLOCK, EDU_ANON_BLOCK, type BcpViewMode } from "@/lib/bcpEconomicOverlay";
import { guestMayDisableAnonymizer, guestMaySeeEngineRoom } from "@/lib/engineFrames";
import { effectiveBcpViewMode, rememberBcpViewMode } from "@/lib/pokaYokeLock";
import { useDashboardBlockOpen } from "@/hooks/useDashboardBlockOpen";

export function useEduAnonymize() {
  const block = useDashboardBlockOpen(EDU_ANON_BLOCK, false);
  const canOff = guestMayDisableAnonymizer(readAccessRole());
  return {
    on: block.isOpen,
    setOn: (next: boolean) => {
      if (!next && !canOff) return;
      block.setOpen(next);
    },
  };
}

export function useBcpView() {
  const overlay = useDashboardBlockOpen(BCP_VIEW_BLOCK.overlay, false);
  const room = useDashboardBlockOpen(BCP_VIEW_BLOCK.engineRoom, false);
  const role = readAccessRole();
  const canRoom = guestMaySeeEngineRoom(role);
  const mode = effectiveBcpViewMode(overlay.isOpen, room.isOpen, role);
  rememberBcpViewMode(mode);
  const setMode = (next: BcpViewMode) => {
    if (next === "engine-room" && !canRoom) return;
    if (next === "isolated") {
      overlay.setOpen(false);
      room.setOpen(false);
      return;
    }
    if (next === "overlay") {
      overlay.setOpen(true);
      room.setOpen(false);
      return;
    }
    overlay.setOpen(true);
    room.setOpen(true);
  };
  return { mode, setMode, canRoom, isGuest: role === ACCESS_ROLE.VIEWER_READONLY };
}
