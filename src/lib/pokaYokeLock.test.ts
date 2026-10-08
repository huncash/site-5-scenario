import { describe, expect, it } from "vitest";

import { ACCESS_ROLE } from "@/lib/accessRole";
import { bcpWriteAllowed } from "@/lib/bcpEconomicOverlay";
import { canExportEducationPack, guestMaySeeEngineRoom } from "@/lib/engineFrames";
import {
  effectiveBcpViewMode,
  economicLayerWriteAllowed,
  POKA_YOKE_LOCK,
  pokaYokeLockSnapshot,
  rememberBcpViewMode,
} from "@/lib/pokaYokeLock";

describe("pokaYokeLock", () => {
  it("freezes the security snapshot: guest out of engine room and raw copy, one-way, local .szc", () => {
    expect(pokaYokeLockSnapshot()).toEqual({
      v: 1,
      guestEngineRoom: false,
      guestRawCopy: false,
      guestDisableAnonymizer: false,
      oneWayEducation: "anonymized",
      oneWayBcp: "read_overlay",
      reverseBlocked: true,
      szcClipboardLocal: true,
      szcNetwork: false,
    });
    expect(Object.isFrozen(POKA_YOKE_LOCK)).toBe(true);
  });

  it("clamps a guest off the engine room even if the stored flag is on", () => {
    expect(guestMaySeeEngineRoom(ACCESS_ROLE.VIEWER_READONLY)).toBe(false);
    expect(guestMaySeeEngineRoom(ACCESS_ROLE.OWNER_EDITOR)).toBe(true);
    expect(effectiveBcpViewMode(true, true, ACCESS_ROLE.VIEWER_READONLY)).toBe("overlay");
    expect(effectiveBcpViewMode(false, true, ACCESS_ROLE.VIEWER_READONLY)).toBe("isolated");
    expect(effectiveBcpViewMode(true, true, ACCESS_ROLE.OWNER_EDITOR)).toBe("engine-room");
  });

  it("blocks guest live-desk export and economic write-back from overlay / engine-room", () => {
    expect(canExportEducationPack({ anonOn: true, role: ACCESS_ROLE.VIEWER_READONLY }).ok).toBe(false);
    expect(canExportEducationPack({ anonOn: true, role: ACCESS_ROLE.OWNER_EDITOR }).ok).toBe(true);
    rememberBcpViewMode("engine-room");
    expect(economicLayerWriteAllowed("engine-room", ACCESS_ROLE.OWNER_EDITOR)).toBe(false);
    expect(bcpWriteAllowed("overlay")).toBe(false);
    rememberBcpViewMode("isolated");
    expect(economicLayerWriteAllowed("isolated", ACCESS_ROLE.OWNER_EDITOR)).toBe(true);
  });
});
