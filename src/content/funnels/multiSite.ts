import { buildTierOffers, DEMO_STARTER_BLURB, PRICING_VAT_FAQ, STANDARD_TIER_COPY, type TierId } from "@/content/pricing/tiers";

const packages = STANDARD_TIER_COPY;

export const MULTISITE_FUNNEL = {
  hero: {
    eyebrow: "Multi‑Site / Hálózati vállalkozások",
    title: "Irányítsd a többtelephelyes költségeket egy kézből, adatszivárgási kockázat nélkül.",
    subtitle:
      "Konszolidált cash‑flow, egység‑szintű drift jelzés, és Lean/MUDA fókusz — mindez a te eszközödön, szerver‑oldali adattárolás nélkül.",
    primaryCta: "Segédeszköz ingyenes kipróbálása",
    secondaryCta: "Csomagok megtekintése",
  },
  proofBullets: [
    "Több egység → egy áttekintés: központi beszerzés és telephelyek szétcsúszásának korai jelzése",
    "Import‑first: banki kivonatból indul, nem kézi adatpötyögésből",
    "Local‑first: nincs regisztráció, nincs telemetria, nincs szerver‑oldali adatbázis",
  ],
  demoTeaser: {
    title: "Interaktív előnézet: multi‑site (demó)",
    body: DEMO_STARTER_BLURB,
    cta: "Megnyitom a multi‑site demót",
  },
  tiers: {
    defaultSelected: "pro" as TierId,
    note: "Minden csomag tiszta, lokális alapon működik, rejtett költségek nélkül.",
  },
  packages,
  tierOffers: buildTierOffers(packages),
  faq: [
    {
      q: "Hol tárolódnak az adatok? Van szerver oldali adatbázis?",
      a: "Nincs szerver oldali adatbázis. Az adatok a te eszközödön maradnak (local‑first), titkosítva. Mentés/visszaállítás lokális export/importtal működik.",
    },
    {
      q: "Működik offline? Mi van, ha nincs net?",
      a: "Igen. A rendszer offline‑first: a fő funkciók internet nélkül is mennek. A hálózat csak kényelmi extra, nem előfeltétel.",
    },
    {
      q: "Multi‑site esetben hogyan látom egyben és külön a telephelyeket?",
      a: "A rendszer több munkaterületet (egység/projekt) kezel, és konszolidált nézetben is összerendez. Így látszik az egység‑szintű költés és a központi kép egyszerre.",
    },
    {
      q: "Kell regisztráció? Követitek a használatot?",
      a: "Nem. Nincs regisztráció és nincs használati telemetria. A cél: a működésed a te gépeden maradjon.",
    },
    {
      q: "Csapatban több eszközön is használható?",
      a: "Igen: több eszköz összeköthető, így a titkosított mentés eszközök között vihető át.",
    },
    PRICING_VAT_FAQ,
  ],
} as const;

