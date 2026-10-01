import { buildTierOffers, PRO_MULTIUSER_BULLET, PRO_P2P_SYNC_BULLET, type TierCopy, type TierId } from "@/content/pricing/tiers";

const packages = {
  starter: {
    tagline: "Alap terv + gyors helyzetkép, ügyféladat-kímélően.",
    description:
      "Ha gyorsan akarsz rálátást adni egy projekt vagy magán‑keret helyzetére: helyi számítás, offline működés, és a tartozás‑fókusz (Avalanche/Snowball) alap egységei.",
    includes: [
      "Alap pénzügyi tervezés (PLAN/DO szemlélet)",
      "Avalanche/Snowball fókusz (tartozás‑prioritás javaslat)",
      "Banki/Excel import (hatékonyság)",
      "Local‑first mentés / export (titkosítva)",
    ],
    limits: [
      "Slotok és haladó beavatkozási ágak: korlátozott (marketing copy)",
      "Több eszköz / konzultációs keret: korlátozott (marketing copy)",
    ],
  },
  pro: {
    tagline: "Projekt‑cash‑flow + valóság‑sokk: gyors döntési fókusz.",
    description:
      "Interim ritmusra: projekt cash‑flow, import‑first banki kivonat feldolgozás, és „valóság‑sokk” jelzések — hogy az eltérés ne Excel‑vadászat legyen, hanem döntés‑jel.",
    includes: [
      "Teljes projekt cash‑flow fókusz (terv → tény → eltérés)",
      "Banki kivonat parser (import‑first) + gyors áttekintés",
      "Valóság‑sokk elemzés (marketing copy)",
      PRO_MULTIUSER_BULLET,
      PRO_P2P_SYNC_BULLET,
    ],
    limits: ["Slotok száma: rugalmas (nem korlátlan)"],
  },
  expert: {
    tagline: "Korlátlan projekt‑slot + teljes ACT döntési mátrix.",
    description:
      "Tanácsadói / interim portfólióra: több ügyfél‑helyzet, több projekt és több beavatkozási ág — egységes keretben, helyi futással.",
    includes: [
      "Korlátlan projekt‑slotok (marketing copy)",
      "Többfelhasználós konzultációs keretrendszer (marketing copy)",
      "Teljes ACT döntési mátrix (marketing copy)",
      "Prioritásos módszertani sablonok",
    ],
    limits: ["Korlátok: a valós működés és a módszertan szab határt (nem a funnel)."],
  },
} satisfies Record<TierId, TierCopy>;

export const PROJEKT_KONTROLLING_FUNNEL = {
  hero: {
    eyebrow: "Projektalapú & interim kontrolling",
    title: "Zseb-kontrolling és Cash-flow szimuláció interim szakértőknek és projektekhez",
    subtitle:
      "Ügyfél‑biztos működés: local‑first számítás, offline használat, nincs szerver‑oldali adattárolás. A demó preloadolt helyzetből indul, majd a meglévő app‑nézetbe visz.",
    primaryCta: "Segédeszköz ingyenes kipróbálása",
    secondaryCta: "Csomagok megtekintése",
  },
  proofBullets: [
    "Ügyféladat‑titoktartás: nincs szerver‑oldali adatbázis, nincs telemetria",
    "Offline‑first: terepen / ügyfélnél is fut, hálózat nélkül",
    "Valóság‑sokk + tartozás‑fókusz: döntési jelzések (nem csak összeglista)",
  ],
  demoTeaser: {
    title: "Interaktív előnézet: projekt + helyreállítás (demó)",
    body:
      "Preloadolt helyzetből indulsz: cash‑flow fókusz + tartozások, és Avalanche/Snowball javaslatok a priorizáláshoz — hogy 60 mp alatt lásd a „reality‑shock” pontokat.",
    cta: "Megnyitom az interim demót",
  },
  tiers: {
    defaultSelected: "pro" as TierId,
    note: "Tájékoztató jellegű csomagok (marketing). A funnel nem bővíti a core motort.",
  },
  packages,
  tierOffers: buildTierOffers(packages),
  faq: [
    {
      q: "Ügyféladat hova kerül? Van szerver‑oldali adattárolás?",
      a: "Nincs szerver‑oldali adattárolás. Local‑first: a működés a te eszközödön történik; nincs telemetria sem.",
    },
    {
      q: "Használható offline (ügyfélnél / helyszínen)?",
      a: "Igen. A cél az offline‑first működés: a számítás és a nézetek helyben futnak, nem a hálózatra támaszkodnak.",
    },
    {
      q: "Mit csinál pontosan a demó indítása?",
      a: "Wrapper-only: preloadolt demó‑állapotot aktivál, majd a meglévő app‑nézetbe irányít. A core motorhoz nem nyúl.",
    },
    {
      q: "Mi a „valóság‑sokk” ebben a kontextusban?",
      a: "Olyan jelzések összessége, ami kiemeli: hol borul a runway/teher, hol csúszik el a projekt‑fedezet, és hol kell ACT-ben beavatkozni (helyi számítással).",
    },
  ],
} as const;

