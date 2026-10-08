import { finiteQuota, getPlan, type JitAddonId, type QuotaCount } from "@/config/plans";
import { ACCESS_ROLE, readAccessRole } from "@/lib/accessRole";
import { ADVISOR_CASE_FRAME, ADVISOR_GUEST_FRAME, hasAdvisorDesk } from "@/lib/advisorDesk";
import { countActiveGuestCodes } from "@/lib/auth/guestSlots";
import { resolveCurrentPlanId } from "@/lib/planPermissions";
import { readLicense, readSlotLedger } from "@/lib/license";
import { totalScenarioSlots } from "@/lib/scenarioSlots";

export type CapacityFraction = {
  id: "cases" | "slots" | "seats" | "guests";
  label: string;
  used: number;
  /** Licenchez kötött szumma — soha nem ∞. */
  limit: number;
};

export type CapacityHud = {
  cases: CapacityFraction;
  slots: CapacityFraction;
  seats: CapacityFraction;
  guests: CapacityFraction;
};

function countOwnedAddon(id: JitAddonId, addons: readonly string[] | undefined): number {
  return (addons ?? []).filter((a) => a === id).length;
}

export function formatCapacityFraction(used: number, limit: QuotaCount | number): string {
  const cap = typeof limit === "number" ? Math.max(0, limit) : finiteQuota(limit);
  return `${Math.max(0, used)} / ${cap}`;
}

export function formatCapacityFrame(used: number, limit: QuotaCount | number): string {
  return `${formatCapacityFraction(used, limit)} keret`;
}

/** Personal mindig számít; ha nincs a listában, +1 (alap kassza). */
export function usedSlotCount(workspaceIds: readonly string[]): number {
  const n = workspaceIds.length;
  return n + (workspaceIds.includes("personal") ? 0 : 1);
}

export function readCapacityHud(input?: {
  profileCount?: number;
  workspaceIds?: readonly string[];
  seatsUsed?: number;
  guestsUsed?: number;
}): CapacityHud {
  const plan = getPlan(resolveCurrentPlanId());
  const q = plan.quotas;
  const addons = readLicense()?.addons;
  const extraCases = countOwnedAddon("case_plus_1", addons);
  const extraSeats = countOwnedAddon("seat_plus_1", addons);
  const extraGuests = countOwnedAddon("guest_plus_1", addons);
  const advisor = hasAdvisorDesk(addons);
  const usedSlots = usedSlotCount(input?.workspaceIds ?? []);
  const slotLimit = totalScenarioSlots(readSlotLedger());
  const seatsUsed =
    input?.seatsUsed ?? (readAccessRole() === ACCESS_ROLE.OWNER_EDITOR ? 1 : 0);
  let guestsUsed = input?.guestsUsed ?? 0;
  if (input?.guestsUsed == null && typeof window !== "undefined") {
    try {
      guestsUsed = countActiveGuestCodes();
    } catch {
      guestsUsed = 0;
    }
  }
  return {
    cases: {
      id: "cases",
      label: "Case",
      used: Math.max(0, input?.profileCount ?? 1),
      limit: Math.max(finiteQuota(q.cases) + extraCases, advisor ? ADVISOR_CASE_FRAME : 0),
    },
    slots: {
      id: "slots",
      label: "Slot",
      used: usedSlots,
      limit: slotLimit,
    },
    seats: {
      id: "seats",
      label: "Seat",
      used: seatsUsed,
      limit: finiteQuota(q.seats) + extraSeats,
    },
    guests: {
      id: "guests",
      label: "Guest",
      used: guestsUsed,
      limit: Math.max(finiteQuota(q.guests) + extraGuests, advisor ? ADVISOR_GUEST_FRAME : 0),
    },
  };
}

export function capacityHudRows(hud: CapacityHud): CapacityFraction[] {
  return [hud.cases, hud.slots, hud.seats, hud.guests];
}
