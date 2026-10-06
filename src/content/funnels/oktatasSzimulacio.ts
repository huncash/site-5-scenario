import { buildTierOffers, DEMO_STARTER_BLURB, PRICING_VAT_FAQ, STANDARD_TIER_COPY, type TierId } from "@/content/pricing/tiers";
import { CONCEPT_FAQ_ITEMS, WHY_FAQ } from "@/content/branding";

const packages = STANDARD_TIER_COPY;

export const OKTATAS_SZIMULACIO_FUNNEL = {
  hero: {
    eyebrow: "Oktatási és szimulációs tréningek",
    title: "Két elképzelt tréning a motor kipróbálásához",
    subtitle:
      "Pénzügyi és működési sáv együtt, diák- és tanműhely-léptéken. A számok a gépeden maradnak. Nem baj, ha elsőre sűrű.",
    primaryCta: "Esetek megnyitása",
    secondaryCta: "Csomagok megtekintése",
  },
  proofBullets: [
    "Induló kassza és fedezet — három pálya a gépeden",
    "Működési veszteségek és beavatkozás ugyanazon a mintán",
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
    ...CONCEPT_FAQ_ITEMS,
    {
      q: "Mit látok a tréningen?",
      a: "Pénzügyi sáv és működési veszteségek ugyanazon a mintán. Diák- és tanműhely-lépték. A számok a gépeden maradnak.",
    },
    {
      q: "Ez ügyféladat?",
      a: "Nem. Diák- és tanműhely-léptékű minta. Nincs felhő. A fejlesztők nem látják.",
    },
    PRICING_VAT_FAQ,
    WHY_FAQ,
  ],
} as const;
