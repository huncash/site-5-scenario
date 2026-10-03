import { buildTierOffers, DEMO_STARTER_BLURB, PRICING_VAT_FAQ, STANDARD_TIER_COPY, type TierId } from "@/content/pricing/tiers";
import { PRO_CHART_FAQ, WHY_FAQ } from "@/content/branding";

const packages = STANDARD_TIER_COPY;

export const UZLETI_STRATEGIA_FUNNEL = {
  hero: {
    eyebrow: "Üzleti és stratégiai tervezés",
    title: "Stratégiai esetek a PDCA-ban, Master Baseline törzzsel",
    subtitle:
      "Termékvonal, beszerzési infláció, új piac, Kahn-féle elágazás. A cég alapadatait egyszer viszed be — a projektek öröklik. PRO pályák, helyi cash-flow.",
    primaryCta: "Esetek megnyitása",
    secondaryCta: "Csomagok megtekintése",
  },
  proofBullets: [
    "Master Baseline: a core üzem számait nem kell duplán megadni",
    "PDCA keret: PLAN / DO / CHECK / ACT ugyanazon a moszaikon",
    "PRO pályák: likviditási csapda, árrés, runway, stop-loss — helyben számolva",
  ],
  demoTeaser: {
    title: "Interaktív előnézet: stratégiai eset (demó)",
    body: DEMO_STARTER_BLURB,
    cta: "Megnyitom a stratégiai eseteket",
  },
  tiers: {
    defaultSelected: "pro" as TierId,
    note: "Minden csomag tiszta, lokális alapon működik, rejtett költségek nélkül.",
  },
  packages,
  tierOffers: buildTierOffers(packages),
  faq: [
    {
      q: "Mi a Master Baseline?",
      a: "A cég működő törzse: partnerek, fix költség, core cash-flow. A stratégiai esetek ezt öröklik. A projekt csak a döntés rétegét viszi.",
    },
    {
      q: "A stratégiai esetek külön adatbázis?",
      a: "Nem. Mindegyik a saját helyi profiljában fut, de ugyanabból a Master Baseline sémából indul. Nincs felhő-másolat.",
    },
    {
      q: "Mit látok a PDCA-ban?",
      a: "PLAN-ben a törzs + a döntés. CHECK-ben a három PRO pálya mikrojelzéseit. ACT-ben a csapda, az árrés vagy a kilépés beavatkozását.",
    },
    PRICING_VAT_FAQ,
    WHY_FAQ,
    PRO_CHART_FAQ,
  ],
} as const;
