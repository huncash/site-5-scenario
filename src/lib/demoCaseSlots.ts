import type { DemoSegmentId } from "@/lib/demoCatalog";
import { isSchoolHost, SCHOOL_SLOTS_PER_CASE } from "@/lib/school";

/**
 * Demó Case Slot** száma (Magán + Vállalkozás + Projekt seed).
 * A multi-site ugyanígy 3 Slotot indít; a több egység a Vállalkozás Sloton belüli helyszínek.
 * School: 2 Aktív Slot, nem bővíthető.
 */
export function demoCaseSlotCount(_segmentId: DemoSegmentId): number {
  if (typeof window !== "undefined" && isSchoolHost()) return SCHOOL_SLOTS_PER_CASE;
  return 3;
}
