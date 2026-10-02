import { buildTierOffers, DEMO_STARTER_BLURB, STANDARD_TIER_COPY, type TierId } from "@/content/pricing/tiers";

const packages = STANDARD_TIER_COPY;

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
    body: DEMO_STARTER_BLURB,
    cta: "Megnyitom a Lean szimulációt",
  },
  tiers: {
    defaultSelected: "pro" as TierId,
    note: "Minden csomag tiszta, lokális alapon működik, rejtett költségek nélkül.",
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
      a: "Lokális mentés/export működik. Több eszközös használat esetén a titkosított mentés eszközök között vihető át.",
    },
  ],
} as const;

export type MinosegKoltsegVariantId = "a" | "b" | "c";

export const MINOSEG_KOLTSEG_VARIANTS: Record<
  MinosegKoltsegVariantId,
  {
    heroTitle: string;
    heroSubtitle: string;
    primaryCta: string;
    secondaryCta: string;
    proofBullets: string[];
    demoTeaserBody: string;
  }
> = {
  a: {
    heroTitle: "Minőség vs. Költség. Találd meg, hol csúszik el a fedezet a folyamataidban.",
    heroSubtitle:
      "Fedezeti pont, sávok, veszteséghőtérkép — helyi számítással, gyors visszacsatolással. Nincs szerver‑oldali adattárolás.",
    primaryCta: "Segédeszköz ingyenes kipróbálása",
    secondaryCta: "Csomagok megtekintése",
    proofBullets: [
      "Üzemvezetői nézet: hol csúszik el a fedezet (nem csak az, hogy mennyit költöttél)",
      "Gyors lokális számítás: azonnali visszajelzés a sávokon és a hőtérképen",
      "Local‑first: nincs regisztráció, nincs telemetria, nincs szerver‑oldali adatbázis",
    ],
    demoTeaserBody: DEMO_STARTER_BLURB,
  },
  b: {
    heroTitle: "Hol folyik el a fedezet? Nézd meg 60 másodperc alatt.",
    heroSubtitle:
      "Veszteséghőtérkép + fedezeti pont: pontosan látod, mely sávok húzzák el a profitot — internet nélkül is.",
    primaryCta: "Ingyenes kipróbálás (1 kattintás)",
    secondaryCta: "Mutasd a hőtérképet",
    proofBullets: [
      "Nem “riport”: operatív döntés — hőtérképen látszik a drift",
      "Lokális számítás → gyors, nem vár a hálózatra",
      "Adatszuverenitás: a működés a te eszközödön marad",
    ],
    demoTeaserBody: DEMO_STARTER_BLURB,
  },
  c: {
    heroTitle: "Minőség‑költség döntések: láss rá a driftre műszakonként.",
    heroSubtitle:
      "Sávok és veszteséghőtérkép — hogy a minőség javítása ne “vak költség” legyen, hanem kontrollált beavatkozás.",
    primaryCta: "Kipróbálom a szimulációt",
    secondaryCta: "Csomagok",
    proofBullets: [
      "Fedezeti pont: mikor borul a működés veszteségbe",
      "Hőtérkép: hol vannak a mikro‑szivárgások (MUDA jelzések)",
      "Local‑first: nincs központi adatbázis, nincs telemetria",
    ],
    demoTeaserBody: DEMO_STARTER_BLURB,
  },
};

export function pickMinosegKoltsegVariant(v: string | null | undefined) {
  if (v === "b" || v === "c") return v;
  return "a";
}

