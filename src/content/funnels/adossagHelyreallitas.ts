import { buildTierOffers, PRO_MULTIUSER_BULLET, PRO_P2P_SYNC_BULLET, type TierCopy, type TierId } from "@/content/pricing/tiers";

const packages = {
  starter: {
    tagline: "Átlátható cash‑flow és alap puffer.",
    description:
      "Ha első körben azt akarod látni, mennyi a teher és mennyi a szabad: gyors rálátás és lokális mentés.",
    includes: [
      "Alap cash‑flow áttekintés",
      "Banki/Excel import (hatékonyság)",
      "Lokális mentés / export (titkosítva)",
    ],
    limits: [
      "Adósság‑rutinok: alap szint (marketing copy)",
      "Forgatókönyvek: korlátozott",
    ],
  },
  pro: {
    tagline: "Runway + tartozás‑teher: operatív döntési ritmus.",
    description:
      "Ha ütemezni akarod a helyreállítást: teher, puffer és következő lépés fókusz, gyorsan és helyben.",
    includes: [
      "Tartozások / kötelezettségek panel (demóban előre betöltve)",
      "Runway és közeljövő teher fókusz",
      "Lean/MUDA jelzések a pazarlásra (marketing copy)",
      PRO_MULTIUSER_BULLET,
      PRO_P2P_SYNC_BULLET,
    ],
    limits: ["Slotok száma: rugalmas (nem korlátlan)"],
  },
  expert: {
    tagline: "Komplex helyreállítás: több ág, több forgatókönyv.",
    description:
      "Ha több tartozás, több ütemezés és több döntési ág van: fejlett ACT beavatkozások és korlátlan forgatókönyvek.",
    includes: [
      "Korlátlan forgatókönyv-slotok (marketing copy)",
      "Fejlett ACT beavatkozási ágak (marketing copy)",
      "Prioritásos módszertani sablonok (helyreállítási rutinok)",
    ],
    limits: ["Korlátok: a valós működés szab határt, nem a csomag."],
  },
} satisfies Record<TierId, TierCopy>;

export const ADOSSAG_HELYREALLITAS_FUNNEL = {
  hero: {
    eyebrow: "Adósság‑helyreállítás",
    title: "Tartozás teher → puffer → következő lépés. Helyreállítás helyben.",
    subtitle:
      "Lásd, mi a közeljövő teher, mennyi a szabad, és hol lehet ACT-ben beavatkozni — offline‑first, local‑first.",
    primaryCta: "Segédeszköz ingyenes kipróbálása",
    secondaryCta: "Csomagok megtekintése",
  },
  proofBullets: [
    "Runway és teher fókusz: gyors döntés, nem csak összeg",
    "Lokális számítás: nem a hálózatra vár",
    "Adatszuverenitás: nincs szerver‑oldali adatbázis, nincs telemetria",
  ],
  demoTeaser: {
    title: "Interaktív előnézet: tartozás + törlesztés (demó)",
    body:
      "Preloadolt tartozás és törlesztés helyzet — hogy azonnal lásd a terhet és a fókuszt a következő 30 napra.",
    cta: "Megnyitom a helyreállítás demót",
  },
  tiers: {
    defaultSelected: "pro" as TierId,
    note: "Tájékoztató jellegű csomagok (marketing). A funnel nem bővíti a core motort.",
  },
  packages,
  tierOffers: buildTierOffers(packages),
  faq: [
    {
      q: "Hol tárolódik a tartozás adat?",
      a: "Local‑first: a te eszközödön, titkosítva. Nincs szerver‑oldali adattárolás.",
    },
    {
      q: "Mit mutat a demó?",
      a: "Előre betöltött tartozás és törlesztés mozgások, hogy a tartozás panel és a runway fókusz azonnal tesztelhető legyen.",
    },
    {
      q: "Ez automatikusan ‘zár’ vagy ‘kopogtat’?",
      a: "Nem. A funnel csak marketing wrapper. Nincs lezárás, nincs telemetria, nincs automatikus ping.",
    },
  ],
} as const;

