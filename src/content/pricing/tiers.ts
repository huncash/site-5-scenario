export type TierId = "starter" | "pro" | "expert";

export type TierDefinition = {
  id: TierId;
  /** Short label used in UI (must be stable across funnels). */
  label: string;
  /** Display name (must be stable across funnels). */
  name: string;
  /** One-liner used under the name. */
  tagline: string;
  /** Short “what it is” paragraph. */
  description: string;
  /** Included capabilities (marketing copy). */
  includes: string[];
  /** Explicit limits (marketing copy; NOT enforced in code). */
  limits: string[];
  /** Optional badge. */
  badge?: "Ajánlott" | "Multi‑site";
};

/**
 * NOTE: These tiers are marketing-only in this build.
 * They are NOT enforced in the application engine (zero feature expansion).
 *
 * Keep this file as the single source of truth so we can update tiers across all funnels at once.
 */
export const TIERS: TierDefinition[] = [
  {
    id: "starter",
    label: "Starter / Solo",
    name: "Starter",
    tagline: "Belépő csomag: azonnali rend a kasszában.",
    description:
      "Ha most akarsz tiszta képet és egy működő rutint: cash‑flow, kategóriák, tervezés — mindezt a saját eszközödön.",
    includes: [
      "1× Magán + 1× Vállalkozás + 1× Projekt alap nézet (PLAN/DO értelmesen működjön)",
      "Banki kivonat import (alap hatékonyság)",
      "Lokális mentés / export (titkosítva)",
    ],
    limits: [
      "Új munkaterület hozzáadása: nincs (csak az alap 1‑1‑1)",
      "Használat: 1 eszköz (multi‑device / csapat nélkül)",
    ],
  },
  {
    id: "pro",
    label: "Pro / Vállalkozás",
    name: "Pro",
    tagline: "Működés- és döntéstámogatás üzemi szinten.",
    description:
      "Ha már nem csak követni akarod a költést, hanem rendszert építesz: import‑first, Lean/MUDA jelzések, több munkaterület.",
    includes: [
      "Vállalkozási cash‑flow + import‑first workflow",
      "Lean / MUDA elemzések (vizuális jelzések és fókuszok)",
      "Multi‑site fa‑struktúra (több egység és projekt kezelés a napi munkában)",
      "Több eszközös használat és P2P szinkron (csapatmunka export/import helyett)",
    ],
    limits: [
      "Slotok száma: rugalmas (nem korlátlan)",
    ],
    badge: "Ajánlott",
  },
  {
    id: "expert",
    label: "Expert / Multi‑Site",
    name: "Expert",
    tagline: "Konszolidáció több egységre, gyors beavatkozásokkal.",
    description:
      "Hálózati üzemeltetőknek: több telephely, több kassza, központi kontroll. A cél: gyorsan látni a driftet és lépni ACT-ben.",
    includes: [
      "Korlátlan slotok (egységek, projektek, nézetek)",
      "Többegységes konszolidáció és összevetés",
      "Fejlett ACT beavatkozási modulok (operátori döntés támogatás)",
      "Prioritásos módszertani sablonok (multi‑site rutinok)",
    ],
    limits: [
      "Korlátok: a módszertan és a valós működés szab határt, nem a csomag.",
    ],
    badge: "Multi‑site",
  },
];

export function getTier(id: string | null | undefined): TierDefinition | null {
  if (!id) return null;
  return TIERS.find((t) => t.id === id) ?? null;
}

