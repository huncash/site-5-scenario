import type { DemoSegmentId } from "@/lib/demoCatalog";

/**
 * Demó Case Slot* száma (Magán + Vállalkozás + Projekt seed).
 * A multi-site ugyanígy 3 Slotot indít; a több egység a Vállalkozás Sloton belüli helyszínek.
 */
export function demoCaseSlotCount(_segmentId: DemoSegmentId): number {
  return 3;
}
