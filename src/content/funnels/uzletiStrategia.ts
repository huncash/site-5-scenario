import { buildTierOffers, DEMO_STARTER_BLURB, PRICING_VAT_FAQ, STANDARD_TIER_COPY, type TierId } from "@/content/pricing/tiers";
import { CONCEPT_FAQ_ITEMS, PRO_CHART_FAQ, WHY_FAQ } from "@/content/branding";

const packages = STANDARD_TIER_COPY;

export const UZLETI_STRATEGIA_FUNNEL = {
  hero: {
    eyebrow: "Üzleti és stratégiai tervezés",
    title: "Stratégiai minták a törzsből — a számok a gépeden maradnak",
    subtitle:
      "Elképzelt helyzetek a motor kipróbálásához. A cég törzsét egyszer viszed be; a projekt örökli. Hitel vagy organikus út, kötbér vagy rugalmas kilépés — rossz, közepes és jó pálya ugyanarra a múltra.",
    primaryCta: "Esetek megnyitása",
    secondaryCta: "Csomagok megtekintése",
  },
  proofBullets: [
    "A cég törzsét egyszer viszed be — a projekt örökli",
    "Rossz, közepes és jó pálya ugyanarra a múltra, a gépeden",
    "Elképzelt minták: a motor kipróbálása, nem élő ügyfél",
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
    ...CONCEPT_FAQ_ITEMS,
    {
      q: "Mi a törzs?",
      a: "A cég működő alapja: partnerek, fix költség, a mindennapi kassza. A stratégiai minták ezt öröklik. A projekt csak a döntés rétegét viszi.",
    },
    {
      q: "A stratégiai esetek külön adatbázis?",
      a: "Nem. Mindegyik a saját helyi profiljában fut. Nincs felhő-másolat. A fejlesztők nem látják.",
    },
    {
      q: "Mit látok a négy lépésben?",
      a: "Törzsadat helyben. Kivonat a Mesh Data Managerbe. A helyzetkép összeáll. Saját szabály — nem tanítás. Magán, vállalkozás, projekt egy asztalon.",
    },
    PRICING_VAT_FAQ,
    WHY_FAQ,
    PRO_CHART_FAQ,
  ],
} as const;
