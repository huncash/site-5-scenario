import { buildTierOffers, type TierCopy, type TierId } from "@/content/pricing/tiers";

const packages = {
  starter: {
    tagline: "Átlátható költség és terv, 1 projektre.",
    description:
      "Ha most szeretnél projekt‑szintű rálátást: terv → tény → eltérés, gyorsan és helyben.",
    includes: [
      "1 projekt alap nézet (PLAN/DO)",
      "Banki/Excel import (hatékonyság)",
      "Lokális mentés / export (titkosítva)",
    ],
    limits: [
      "Új projektek: korlátozott (marketing copy)",
      "Csapat / több eszköz: korlátozott (marketing copy)",
    ],
  },
  pro: {
    tagline: "Kontrolling ritmus: eltérés, fókusz, döntés.",
    description:
      "Ha a projekt nem csak ‘költség’, hanem ütemezett döntések sora: követhető eltérés és fókusz a következő lépéshez.",
    includes: [
      "Projekt‑szintű cash‑flow fókusz",
      "Excel import + gyors áttekintés",
      "Lean/MUDA jelzések a pazarlásra (marketing copy)",
    ],
    limits: ["Slotok száma: rugalmas (nem korlátlan)"],
  },
  expert: {
    tagline: "Több projekt, több forgatókönyv, ACT ágak.",
    description:
      "Komplexebb portfólióra: több projekt párhuzamosan, több forgatókönyv-slot és módszertani sablonok.",
    includes: [
      "Korlátlan forgatókönyv-slotok (marketing copy)",
      "Fejlett ACT beavatkozási ágak (marketing copy)",
      "Prioritásos módszertani sablonok",
    ],
    limits: ["Korlátok: a valós folyamatok és a módszertan szab határt."],
  },
} satisfies Record<TierId, TierCopy>;

export const PROJEKT_KONTROLLING_FUNNEL = {
  hero: {
    eyebrow: "Projekt‑kontrolling",
    title: "Terv → Tény → Eltérés. Projekt-kontrolling helyben, gyorsan.",
    subtitle:
      "Lásd, hol csúszik el a projekt költsége és üteme — import‑first, lokális számítás, adatszuverenitás.",
    primaryCta: "Segédeszköz ingyenes kipróbálása",
    secondaryCta: "Csomagok megtekintése",
  },
  proofBullets: [
    "Projekt fókusz: eltérés nem Excel‑vadászat, hanem döntés‑jel",
    "Import‑first: banki/Excel alap, nem kézi táblázat",
    "Local‑first: nincs telemetria, nincs szerver‑oldali adatbázis",
  ],
  demoTeaser: {
    title: "Interaktív előnézet: Projekt1 (demó)",
    body:
      "Preloadolt projekt helyzet: cél, idővonal és döntési fókusz — hogy lásd, mire jó a kontrolling ritmus.",
    cta: "Megnyitom a projekt demót",
  },
  tiers: {
    defaultSelected: "pro" as TierId,
    note: "Tájékoztató jellegű csomagok (marketing). A funnel nem bővíti a core motort.",
  },
  packages,
  tierOffers: buildTierOffers(packages),
  faq: [
    {
      q: "Kontrolling = új funkció? Kényszerít a funnel valamire?",
      a: "Nem. A funnel csak wrapper oldal. A demó a meglévő állapotot nyitja meg, a core motor változatlan.",
    },
    {
      q: "Milyen gyors a betöltés és számítás?",
      a: "A cél a gyors lokális visszajelzés. Import után a nézetek helyben számolódnak, nem a hálózatra várnak.",
    },
    {
      q: "Hol maradnak az adataim?",
      a: "Local‑first: a működés a te eszközödön történik, nincs szerver‑oldali adattárolás.",
    },
  ],
} as const;

