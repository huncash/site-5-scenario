import { describe, expect, it } from "vitest";

import { formatCapacityFraction, readCapacityHud, usedSlotCount } from "@/lib/capacityHud";
import { szummaSnapshotLabel } from "@/lib/caseSnapshot";

describe("capacityHud", () => {
  it("formats used/summa fractions with a finite license frame", () => {
    expect(formatCapacityFraction(1, 2)).toBe("1 / 2");
    expect(formatCapacityFraction(0, "unlimited")).toBe("0 / 24");
    expect(formatCapacityFraction(1, "unlimited")).not.toMatch(/∞/);
  });

  it("counts slots with an implicit personal kassza", () => {
    expect(usedSlotCount(["Vállalkozás1", "Projekt1"])).toBe(3);
    expect(usedSlotCount(["personal", "Vállalkozás1"])).toBe(2);
  });

  it("reads Case / Slot / Seat / Guest rows", () => {
    const hud = readCapacityHud({
      profileCount: 2,
      workspaceIds: ["personal", "Vállalkozás1", "Projekt1"],
      seatsUsed: 1,
      guestsUsed: 0,
    });
    expect(hud.cases.used).toBe(2);
    expect(hud.slots.used).toBe(3);
    expect(hud.seats.label).toBe("Seat");
    expect(hud.guests.label).toBe("Guest");
    expect(typeof hud.cases.limit).toBe("number");
    expect(formatCapacityFraction(hud.seats.used, hud.seats.limit)).toMatch(/^1 \//);
    expect(formatCapacityFraction(hud.cases.used, hud.cases.limit)).not.toMatch(/∞/);
  });
});

describe("caseSnapshot", () => {
  it("labels the automatic szumma snapshot", () => {
    expect(szummaSnapshotLabel("DEMO 11")).toBe("Auto backup (szumma): DEMO 11");
  });
});
