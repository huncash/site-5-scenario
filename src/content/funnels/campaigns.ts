import { buildTierOffers, PRICING_VAT_FAQ, STANDARD_TIER_COPY, type TierId } from "@/content/pricing/tiers";
import { CONCEPT_FAQ_ITEMS, WHY_FAQ } from "@/content/branding";
import type { CampaignId } from "@/lib/campaignFunnels";

const packages = STANDARD_TIER_COPY;

const MEASURE_FAQ = {
  q: "Hogyan látom, melyik belépő működik?",
  a: "Dedikált aloldal (/bcp, /strategia, /kozosseg, /oktatas, /makro) és tiszta UTM. A csatorna a címből és a checkouton továbbvitt jelölőből látszik. Az app nem küld használatot.",
} as const;

export type CampaignFunnelCopy = {
  id: CampaignId;
  seoTitle: string;
  seoDescription: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  chooserIntro: string;
  proofBullets: readonly string[];
  caseHeading: string;
  demoTeaser: { title: string; body: string; cta: string };
  tiers: { defaultSelected: TierId; note: string };
  packages: typeof packages;
  tierOffers: ReturnType<typeof buildTierOffers>;
  faq: ReadonlyArray<{ q: string; a: string }>;
};

export const CAMPAIGN_FUNNELS: Record<CampaignId, CampaignFunnelCopy> = {
  bcp: {
    id: "bcp",
    seoTitle: "Szcenárió — Vállalati BCP és reziliencia",
    seoDescription:
      "IT-kiesés, logisztikai sokk, folytonosság. Tartalék a saját eszközödön. Nincs regisztráció. A fejlesztők nem látják az adataidat.",
    hero: {
      eyebrow: "Vállalati BCP és működési reziliencia",
      title: "Folytonosság IT-kiesésnél és logisztikai sokknál",
      subtitle:
        "Cégvezetőknek és operációs vezetőknek. Elképzelt minta: leállás és tartalék a saját eszközön. A fejlesztők nem látják az adataidat.",
      primaryCta: "BCP-eset megnyitása",
      secondaryCta: "Csomagok",
    },
    chooserIntro:
      "Vállalati BCP: kritikus SaaS / felhő kiesése. TTR, tartalék link, helyi másolat. Nem riadó — működési reziliencia.",
    proofBullets: [
      "Kritikus szoftver-kiesés: tartalék út és helyi másolat",
      "Ugyanaz a négy lépéses munkamenet, mint a többi mintánál",
      "Nincs felhő-adatbázis, nincs használatküldés",
    ],
    caseHeading: "Egy BCP-eset",
    demoTeaser: {
      title: "Interaktív előnézet: vállalati BCP",
      body: "Egy helyzet a választóban. Nincs automata belépés, nincs regisztráció.",
      cta: "Megnyitom a BCP-esetet",
    },
    tiers: {
      defaultSelected: "pro",
      note: "Minden csomag tiszta, lokális alapon működik, rejtett költségek nélkül.",
    },
    packages,
    tierOffers: buildTierOffers(packages),
    faq: [
      ...CONCEPT_FAQ_ITEMS,
      {
        q: "Ez világvége-szimulátor?",
        a: "Nem. Vállalati BCP és működési reziliencia. A pesszimista sáv érettség: aki a kiesést is számolja, az tartja a folytonosságot.",
      },
      {
        q: "Új motort veszek, kapok extra Case-t?",
        a: "Nem. A Case / Slot / Seat / Guest a licenc kvótája. A BCP motor ugyanerre a keretre ül — moduláris legó, külön kvótát nem ad.",
      },
      MEASURE_FAQ,
      PRICING_VAT_FAQ,
      WHY_FAQ,
    ],
  },
  strategia: {
    id: "strategia",
    seoTitle: "Szcenárió — Stratégiai és pénzügyi what-if",
    seoDescription:
      "Kassza, árrés, rossz–közepes–jó pálya. Elképzelt minták, helyi számítás. A fejlesztők nem látják az adataidat.",
    hero: {
      eyebrow: "Stratégiai és pénzügyi what-if",
      title: "Cash-flow, árrés, három pálya — ugyanabból a törzsből",
      subtitle:
        "Klasszikus vállalkozói kérdés: mi történik, ha a vonal, a beszerzés vagy a piac változik. A törzset egyszer viszed be. A számok a gépeden maradnak.",
      primaryCta: "Stratégiai esetek",
      secondaryCta: "Csomagok",
    },
    chooserIntro:
      "A cég törzsét egyszer viszed be. Elképzelt minták: hitel vagy organikus út, kötbér vagy rugalmas kilépés. A számok a gépeden maradnak.",
    proofBullets: [
      "A törzset nem kell duplán megadni",
      "Hitel vagy organikus út, kötbér vagy rugalmas kilépés",
      "Rossz, közepes és jó pálya ugyanarra a múltra",
    ],
    caseHeading: "Stratégiai esetek",
    demoTeaser: {
      title: "Interaktív előnézet: stratégiai what-if",
      body: "Az esetek a választóban. Nincs automata belépés egyetlen pályára.",
      cta: "Megnyitom a stratégiai eseteket",
    },
    tiers: {
      defaultSelected: "pro",
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
      MEASURE_FAQ,
      PRICING_VAT_FAQ,
      WHY_FAQ,
    ],
  },
  kozosseg: {
    id: "kozosseg",
    seoTitle: "Szcenárió — Kisközösség és helyi biztonság",
    seoDescription:
      "Helyi ellátás, önellátás, hálózati függetlenség. Víz, energia, működési tartalék. A számok a gépeden maradnak.",
    hero: {
      eyebrow: "Kisközösség, civil, helyi függetlenség",
      title: "Helyi ellátás, önellátás, hálózati függetlenség",
      subtitle:
        "Magánszemélyeknek és civil szervezeteknek. Víz, energia, helyi mesh, 72 órás működési tartalék. Ugyanaz a motor, mint a vállalati BCP-nél — kisebb lépték.",
      primaryCta: "Helyi esetek",
      secondaryCta: "Csomagok",
    },
    chooserIntro:
      "Helyi ellátás és háztartási működési tartalék. Víz, energia, mesh, 72 óra. Ugyanaz a fizikai motor, mint a vállalati BCP-nél.",
    proofBullets: [
      "Közösség: helyi víz, energia, saját kör",
      "Háztartás: működési tartalék kiesésre",
      "Ugyanaz a motor, mint a céges tartalék-mintánál",
    ],
    caseHeading: "Két helyi eset",
    demoTeaser: {
      title: "Interaktív előnézet: helyi biztonság",
      body: "Két helyzet a választóban. Nincs automata belépés, nincs regisztráció.",
      cta: "Megnyitom a helyi eseteket",
    },
    tiers: {
      defaultSelected: "pro",
      note: "Minden csomag tiszta, lokális alapon működik, rejtett költségek nélkül.",
    },
    packages,
    tierOffers: buildTierOffers(packages),
    faq: [
      ...CONCEPT_FAQ_ITEMS,
      {
        q: "Ez prepper- vagy bunker-szimulátor?",
        a: "Nem. Helyi önfenntartás és működési tartalék. A motor ugyanazokat a fizikai korlátokat számolja, mint a céges BCP — kisebb lépték.",
      },
      MEASURE_FAQ,
      PRICING_VAT_FAQ,
      WHY_FAQ,
    ],
  },
  oktatas: {
    id: "oktatas",
    seoTitle: "Szcenárió — Oktatás és szimulációs tréning",
    seoDescription:
      "Kockázatmentes döntési szimuláció képzéshez. Startup cash-flow és Lean VSM.",
    hero: {
      eyebrow: "Oktatás és szimulációs tréning",
      title: "Kockázatmentes döntési szimuláció képzéshez",
      subtitle:
        "Oktatóknak, hallgatóknak, mentoroknak. Startup cash-flow és Lean VSM. Diák-lépték, helyi számítás.",
      primaryCta: "Tréning-esetek",
      secondaryCta: "Csomagok",
    },
    chooserIntro:
      "Elképzelt tréning-minták a motor kipróbálásához. Pénzügyi és működési sáv együtt. Diák- és tanműhely-lépték.",
    proofBullets: [
      "Induló kassza és fedezet — három pálya a gépeden",
      "Működési veszteségek és beavatkozás ugyanazon a mintán",
    ],
    caseHeading: "Két tréning-eset",
    demoTeaser: {
      title: "Interaktív előnézet: oktatási tréning",
      body: "Két eset a választóban. Nincs automata belépés egyetlen pályára.",
      cta: "Megnyitom a tréning-eseteket",
    },
    tiers: {
      defaultSelected: "pro",
      note: "Minden csomag tiszta, lokális alapon működik, rejtett költségek nélkül.",
    },
    packages,
    tierOffers: buildTierOffers(packages),
    faq: [
      ...CONCEPT_FAQ_ITEMS,
      {
        q: "Ez ügyféladat?",
        a: "Nem. Diák- és tanműhely-léptékű minta. Nincs felhő. A fejlesztők nem látják.",
      },
      {
        q: "Új motort veszek, kapok extra Case-t?",
        a: "Nem. A Case / Slot / Seat / Guest a licenc kvótája. Az oktatási motor ugyanerre a keretre ül — moduláris legó, külön kvótát nem ad.",
      },
      MEASURE_FAQ,
      PRICING_VAT_FAQ,
      WHY_FAQ,
    ],
  },
  makro: {
    id: "makro",
    seoTitle: "Szcenárió — Makró és demográfiai stratégia",
    seoDescription:
      "TFR, munkaképes kor, 20 éves pálya. Öt nemzet helyi mátrixa. Strukturális trend, nem riadó. Nincs élő API.",
    hero: {
      eyebrow: "Makró és demográfiai stratégia",
      title: "TFR, munkaképes kor, 20 éves pálya",
      subtitle:
        "Elemzőknek és döntéshozóknak. Öt nemzet TFR-mátrixa, helyettesítési rés, kezelési pálya. Strukturális trend, nem riadó. 2023-as helyi másolat, nincs élő API.",
      primaryCta: "Makró-eset",
      secondaryCta: "Csomagok",
    },
    chooserIntro:
      "Strategic foresight: TFR és munkaképes kor. KR, CN, IT/WE, JP, HU — 2023-as helyi másolat. Strukturális trend, nem riadó.",
    proofBullets: [
      "Öt nemzet TFR-je, rés a 2,1-es helyettesítéshez",
      "20 éves gazdasági kihívás — kormányzatnak és nagyvállalatnak",
      "Helyi konstans, nincs élő statisztikai API",
    ],
    caseHeading: "Egy makró-eset",
    demoTeaser: {
      title: "Interaktív előnézet: demográfiai pálya",
      body: "Egy helyzet a választóban. Nincs automata belépés, nincs regisztráció.",
      cta: "Megnyitom a makró-esetet",
    },
    tiers: {
      defaultSelected: "pro",
      note: "Minden csomag tiszta, lokális alapon működik, rejtett költségek nélkül.",
    },
    packages,
    tierOffers: buildTierOffers(packages),
    faq: [
      ...CONCEPT_FAQ_ITEMS,
      {
        q: "Honnan jön a TFR?",
        a: "2023-as közzétett értékek helyi másolata. Strukturális trend, nem riadó. Nincs élő hívás.",
      },
      MEASURE_FAQ,
      PRICING_VAT_FAQ,
      WHY_FAQ,
    ],
  },
};
