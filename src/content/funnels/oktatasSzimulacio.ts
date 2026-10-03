import { buildTierOffers, DEMO_STARTER_BLURB, PRICING_VAT_FAQ, STANDARD_TIER_COPY, type TierId } from "@/content/pricing/tiers";
import { WHY_FAQ } from "@/content/branding";

const packages = STANDARD_TIER_COPY;

export const OKTATAS_SZIMULACIO_FUNNEL = {
  hero: {
    eyebrow: "Oktatási és szimulációs tréningek",
    title: "Négy PDCA-eset: startup cash-flow, Lean VSM, campus energia, kiberincidens",
    subtitle:
      "Pénzügyi sáv és Lean / Poka-Yoke mikro együtt. Diák-, tanműhely- és campus-lépték, helyi számítás.",
    primaryCta: "Esetek megnyitása",
    secondaryCta: "Csomagok megtekintése",
  },
  proofBullets: [
    "Startup: burn rate, fedezeti pont, fix/változó — PRO sáv",
    "Lean VSM: OEE, SMED, Poka-Yoke, átfutási idő + kiesés Ft",
    "Campus: hőhullám, passzív hűtés, kollégiumi kWh-kvóta",
    "Kiber: izolációs idő, analóg vizsga, helyreállás",
  ],
  demoTeaser: {
    title: "Interaktív előnézet: oktatási tréning (demó)",
    body: DEMO_STARTER_BLURB,
    cta: "Megnyitom a tréning-eseteket",
  },
  tiers: {
    defaultSelected: "pro" as TierId,
    note: "Minden csomag tiszta, lokális alapon működik, rejtett költségek nélkül.",
  },
  packages,
  tierOffers: buildTierOffers(packages),
  faq: [
    {
      q: "Mi keveredik itt?",
      a: "A fix PDCA keret. A pénzügyi sáv (burn, rezsi, helyreállás) és a Lean / Poka-Yoke mikro (OEE, SMED, kvóta, izoláció) ugyanazon a moszaikon van.",
    },
    {
      q: "Ez ügyféladat?",
      a: "Nem. Diák- és campus-léptékű minta. Nincs felhő, nincs telemetria.",
    },
    PRICING_VAT_FAQ,
    WHY_FAQ,
  ],
} as const;
