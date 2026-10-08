/**
 * Case / Slot / Seat / Guest: licenc-keret, nem motor-keret.
 * Motorvásárlás nem duzzaszt kvótát. Két token továbbra sem olvad össze.
 */
import { ACCESS_ROLE, canExportRaw, readAccessRole, type AccessRole } from "@/lib/accessRole";
import type { CapacityHud } from "@/lib/capacityHud";
import { isLabsEngineId, type LabsEngineId } from "@/lib/labsTechTree";
import { grantLocalLicense, readLicense, writeLicense, type LicenseEntitlement } from "@/lib/license";
import { currentLicenseFingerprint } from "@/lib/licenseFusion";

export const ENGINE_FRAME_ERROR_HU =
  "A Case / Slot / Seat / Guest keret a licenchez kötött, nem a motorhoz. Új motor nem ad kvótát, és idegen token adata nem olvadhat bele.";

export type EngineShareChannel = "raw" | "anonymized" | "read_overlay";

export type EngineShareDecision =
  | { ok: true; channel: EngineShareChannel }
  | { ok: false; reason: "fusion" | "guest" | "channel" | "direction"; message: string };

export function licensedEngines(lic: LicenseEntitlement | null | undefined): LabsEngineId[] {
  const extra = (lic?.engines ?? []).filter(isLabsEngineId);
  const set = new Set<LabsEngineId>(["economic", ...extra]);
  return ["economic", "education", "resilience"].filter((id) => set.has(id));
}

/** Motor felvétele ugyanarra a tokenre — kvóta érintetlen. */
export function grantEngineOnLicense(
  lic: LicenseEntitlement,
  engine: LabsEngineId,
): LicenseEntitlement {
  if (engine === "economic") return lic;
  const engines = licensedEngines({ ...lic, engines: [...(lic.engines ?? []), engine] });
  return { ...lic, engines: engines.filter((id) => id !== "economic") };
}

export function grantAllExtraEngines(lic: LicenseEntitlement): LicenseEntitlement {
  return grantEngineOnLicense(grantEngineOnLicense(lic, "education"), "resilience");
}

/** Teszt: mindhárom motor a tokenen. */
export function activateAllLicenseEngines(): LicenseEntitlement | null {
  let lic = readLicense();
  if (!lic) {
    try {
      lic = grantLocalLicense();
    } catch {
      return null;
    }
  }
  const next = grantAllExtraEngines(lic);
  const already =
    (lic.engines ?? []).includes("education") && (lic.engines ?? []).includes("resilience");
  if (already) return lic;
  writeLicense(next);
  return next;
}

export function engineAddonQuotaDelta(): { cases: 0; slots: 0; seats: 0; guests: 0 } {
  return { cases: 0, slots: 0, seats: 0, guests: 0 };
}

export function quotasUnchangedByEngine(before: CapacityHud, after: CapacityHud): boolean {
  return (
    before.cases.limit === after.cases.limit &&
    before.slots.limit === after.slots.limit &&
    before.seats.limit === after.seats.limit &&
    before.guests.limit === after.guests.limit
  );
}

export function sameLicenseFingerprint(remoteFp?: string | null): boolean {
  const local = currentLicenseFingerprint();
  if (!remoteFp || !local) return true;
  return remoteFp === local;
}

export function canCrossEngineShare(input: {
  from: LabsEngineId;
  to: LabsEngineId;
  channel: EngineShareChannel;
  sameLicense?: boolean;
  role?: AccessRole;
}): EngineShareDecision {
  const same = input.sameLicense ?? true;
  const role = input.role ?? readAccessRole();
  if (!same) {
    return { ok: false, reason: "fusion", message: ENGINE_FRAME_ERROR_HU };
  }
  if (input.from === input.to) {
    if (input.channel === "raw" && role === ACCESS_ROLE.VIEWER_READONLY) {
      return { ok: false, reason: "guest", message: ENGINE_FRAME_ERROR_HU };
    }
    return { ok: true, channel: input.channel };
  }
  if (input.from === "economic" && input.to === "education") {
    if (input.channel === "anonymized") return { ok: true, channel: "anonymized" };
    return { ok: false, reason: "channel", message: ENGINE_FRAME_ERROR_HU };
  }
  if (input.from === "economic" && input.to === "resilience") {
    if (input.channel === "read_overlay") {
      if (role === ACCESS_ROLE.VIEWER_READONLY) {
        return { ok: false, reason: "guest", message: ENGINE_FRAME_ERROR_HU };
      }
      return { ok: true, channel: "read_overlay" };
    }
    return { ok: false, reason: "channel", message: ENGINE_FRAME_ERROR_HU };
  }
  return { ok: false, reason: "direction", message: ENGINE_FRAME_ERROR_HU };
}

export function guestMaySeeEngineRoom(role: AccessRole = readAccessRole()): boolean {
  return role === ACCESS_ROLE.OWNER_EDITOR;
}

export function guestMayDisableAnonymizer(role: AccessRole = readAccessRole()): boolean {
  return role === ACCESS_ROLE.OWNER_EDITOR;
}

export function canExportEducationPack(input: {
  anonOn: boolean;
  role?: AccessRole;
}): EngineShareDecision {
  const role = input.role ?? readAccessRole();
  if (!canExportRaw(role)) {
    return { ok: false, reason: "guest", message: ENGINE_FRAME_ERROR_HU };
  }
  if (!input.anonOn) {
    return { ok: false, reason: "channel", message: ENGINE_FRAME_ERROR_HU };
  }
  return canCrossEngineShare({
    from: "economic",
    to: "education",
    channel: "anonymized",
    role,
  });
}
