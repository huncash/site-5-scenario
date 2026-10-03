import { buildTierOffers, DEMO_STARTER_BLURB, PRICING_VAT_FAQ, STANDARD_TIER_COPY, type TierId } from "@/content/pricing/tiers";
import { WHY_FAQ } from "@/content/branding";

const packages = STANDARD_TIER_COPY;

export const VALSAG_REZILIENCIA_FUNNEL = {
  hero: {
    eyebrow: "BCP és működési reziliencia",
    title: "Aki a nehéz sávot is számolja, az érett — nem vakon optimista",
    subtitle:
      "Fekete hattyú, felhőleállás, logisztikai sokk, demográfiai pálya. ResourceRunway, EnergyAutonomy, TTR. Local-first: olyat tud, amit a steril enterprise Excel nem.",
    primaryCta: "Esetek megnyitása",
    secondaryCta: "Csomagok megtekintése",
  },
  proofBullets: [
    "Vállalati BCP: redundáns hálózat, local-first, TTR — kockázatkezelés, nem pánik",
    "Közösség: decentralizált helyi ellátás és biztonság",
    "Háztartás: ugyanaz a motor, működési tartalék 72 órás kiesésre",
    "Makró: strategic foresight — TFR és munkaképes kor, 20 éves gazdasági kihívás",
  ],
  demoTeaser: {
    title: "Interaktív előnézet: BCP / reziliencia (demó)",
    body: DEMO_STARTER_BLURB,
    cta: "Megnyitom a reziliencia-eseteket",
  },
  tiers: {
    defaultSelected: "pro" as TierId,
    note: "Minden csomag tiszta, lokális alapon működik, rejtett költségek nélkül.",
  },
  packages,
  tierOffers: buildTierOffers(packages),
  faq: [
    {
      q: "Ez világvége- vagy prepper-szimulátor?",
      a: "Nem. Vállalatnál BCP és működési reziliencia, makróban stratégiai előrejelzés, közösségben helyi önfenntartás. A pesszimista sáv érettség: a piac azt keresi, aki reziliens, nem aki vakon optimista.",
    },
    {
      q: "Miért fizikai mutató, nem csak forint?",
      a: "Ha a motor kiáll egy 72 órás hálózati kiesést vagy egy ellátási sokkot, látszik, hogy nem vékony Excel. Ugyanaz a számítás viszi a cash-flow-t és a fizikai korlátot.",
    },
    {
      q: "Honnan jön a TFR?",
      a: "2023-as közzétett értékek helyi másolata (Statistics Korea, NBS, ISTAT/Eurostat sáv, MHLW, KSH). Strukturális trend, nem riadó. Nincs élő hívás.",
    },
    PRICING_VAT_FAQ,
    WHY_FAQ,
  ],
} as const;
