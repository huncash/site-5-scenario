import { buildTierOffers, type TierCopy, type TierId } from "@/content/pricing/tiers";

const packages = {
  starter: {
    tagline: "Sablonok és gyors rendrakás.",
    description:
      "Alap költségvetés és magánéleti büdzsé sablonok — hogy gyorsan lásd, hová folyik el a pénz, és legyen mire építeni a módszertant.",
    includes: [
      "Alap költségvetés és magánbüdzsé sablonok",
      "Gyors import és kategória-rutin",
      "Lokális mentés / export (titkosítva)",
    ],
    limits: [
      "Lean szimuláció: alap nézet (marketing copy)",
      "Forgatókönyv-slotok: korlátozott",
    ],
  },
  pro: {
    tagline: "Lean cash‑flow + MUDA hőtérkép a mikro‑szivárgásokra.",
    description:
      "Operatív és üzemvezetői döntésekhez: fedezeti pont, sávok, és veszteséghőtérkép — lokális számítással, gyors visszajelzéssel.",
    includes: [
      "Teljes Lean cash‑flow áttekintés",
      "MUDA mikro‑szivárgás hőtérkép",
      "Excel import",
      "Fedezeti pont kalkulátor",
    ],
    limits: [
      "Forgatókönyv-slotok: rugalmas (nem korlátlan)",
    ],
  },
  expert: {
    tagline: "Komplex üzem- és folyamatszimuláció, gyors ACT ágakkal.",
    description:
      "Ha több műszak, több termék, több korlát és több döntési ág van: komplex szimuláció és ACT beavatkozási ágak — nem szerveren, hanem helyben.",
    includes: [
      "Komplex üzem- és folyamatszimuláció (marketing copy)",
      "Korlátlan forgatókönyv-slotok",
      "Fejlett ACT beavatkozási ágak",
    ],
    limits: [
      "Korlátok: a módszertan és a valós működés szab határt, nem a csomag.",
    ],
  },
} satisfies Record<TierId, TierCopy>;

export const MINOSEG_KOLTSEG_FUNNEL = {
  hero: {
    eyebrow: "Lean Minőség & Költség",
    title: "Minőség vs. Költség. Találd meg, hol csúszik el a fedezet a folyamataidban.",
    subtitle:
      "Fedezeti pont, sávok, veszteséghőtérkép — helyi számítással, gyors visszacsatolással. Nincs szerver‑oldali adattárolás.",
    primaryCta: "Segédeszköz ingyenes kipróbálása",
    secondaryCta: "Csomagok megtekintése",
  },
  proofBullets: [
    "Üzemvezetői nézet: hol csúszik el a fedezet (nem csak az, hogy mennyit költöttél)",
    "Gyors lokális számítás: azonnali visszajelzés a sávokon és a hőtérképen",
    "Local‑first: nincs regisztráció, nincs telemetria, nincs szerver‑oldali adatbázis",
  ],
  demoTeaser: {
    title: "Interaktív előnézet: fedezeti pont + hőtérkép (demó)",
    body:
      "A demóban előre betöltött minőség‑költség helyzetet kapsz: fedezeti pont, sávok és veszteséghőtérkép — hogy lásd, mit jelent a Lean a napi döntésekben.",
    cta: "Megnyitom a Lean szimulációt",
  },
  tiers: {
    defaultSelected: "pro" as TierId,
    note:
      "A csomagok ebben a verzióban tájékoztató jellegűek (marketing). A funnel nem implementál új korlátozást a core motorban.",
  },
  packages,
  tierOffers: buildTierOffers(packages),
  faq: [
    {
      q: "Milyen adatot kér? Felmegy a szerverre bármi?",
      a: "Nem. A számítások helyben futnak, a működés local‑first. Nincs szerver‑oldali adatbázis és nincs telemetria.",
    },
    {
      q: "Mennyire gyors a számítás? Nem fog “elszállni” nagyobb adaton?",
      a: "A cél a gyors, operatív visszajelzés. A hőtérkép és a sávok lokálisan készülnek, így a késleltetés tipikusan alacsony, és nem függ a hálózattól.",
    },
    {
      q: "Mit jelent itt a “fedezeti pont” és a sávok?",
      a: "A demóban egy előre betöltött helyzeten látod, hol billen át a működés nyereségbe/veszteségbe, és mely költségsávok húzzák el a fedezetet.",
    },
    {
      q: "Hogyan tudom megosztani a képet a csapattal?",
      a: "Lokális mentés/export működik. Több eszközös használat esetén P2P szinkron is szóba jöhet — a funnel ezt csak marketingként jelzi, nem épít be új logikát.",
    },
  ],
} as const;

