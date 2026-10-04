import { buildTierOffers, PRICING_VAT_FAQ, STANDARD_TIER_COPY, type TierId } from "@/content/pricing/tiers";
import { CONCEPT_FAQ_ITEMS, WHY_FAQ } from "@/content/branding";
import type { CampaignId } from "@/lib/campaignFunnels";

const packages = STANDARD_TIER_COPY;

const MEASURE_FAQ = {
  q: "Hogyan látom, melyik belépő működik?",
  a: "Dedikált aloldal (/bcp, /strategia, /kozosseg, /oktatas, /makro) és tiszta UTM. A csatorna a címből és a checkouton továbbvitt jelölőből látszik. Az app nem küld használatot, nincs telemetria.",
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
      "IT-kiesés, logisztikai sokk, folytonosság. TTR és local-first BCP-eset a te eszközödön. Nincs regisztráció, nincs telemetria.",
    hero: {
      eyebrow: "Vállalati BCP és működési reziliencia",
      title: "Folytonosság IT-kiesésnél és logisztikai sokknál",
      subtitle:
        "Cégvezetőknek és operációs vezetőknek. TTR, local-first másolat, redundáns hálózat. Egy BCP-eset a PDCA-ban — a motor a te eszközödön fut.",
      primaryCta: "BCP-eset megnyitása",
      secondaryCta: "Csomagok",
    },
    chooserIntro:
      "Vállalati BCP: kritikus SaaS / felhő kiesése. TTR, tartalék link, helyi másolat. Nem riadó — működési reziliencia.",
    proofBullets: [
      "Kritikus SaaS / felhő: TTR, tartalék link, helyi másolat",
      "Ugyanaz a PDCA-keret, mint a stratégiai és oktatási eseteknél",
      "Nincs felhő-adatbázis, nincs telemetria",
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
      MEASURE_FAQ,
      PRICING_VAT_FAQ,
      WHY_FAQ,
    ],
  },
  strategia: {
    id: "strategia",
    seoTitle: "Szcenárió — Stratégiai és pénzügyi what-if",
    seoDescription:
      "Cash-flow, árrés, optimista–pesszimista sáv. Master Baseline, stratégiai esetek, helyi számítás.",
    hero: {
      eyebrow: "Stratégiai és pénzügyi what-if",
      title: "Cash-flow, árrés, három pálya — ugyanabból a törzsből",
      subtitle:
        "Klasszikus vállalkozói kérdés: mi történik, ha a vonal, a beszerzés vagy a piac változik. Master Baseline, PRO sáv, helyi számítás.",
      primaryCta: "Stratégiai esetek",
      secondaryCta: "Csomagok",
    },
    chooserIntro:
      "A cég törzse a Master Baseline. Kahn-esettanulmány: 4,5 M hitel vagy 3×1,1 M organikus; A kötbéres / B rugalmas. PRO pályák, helyi cash-flow.",
    proofBullets: [
      "Master Baseline: a core számokat nem kell duplán megadni",
      "Kahn: hitel/organikus → A kötbér / B rugalmas → PRO",
      "PRO: likviditási csapda, árrés, runway, stop-loss",
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
        q: "Mi a Master Baseline?",
        a: "A cég működő törzse: partnerek, fix költség, core cash-flow. A stratégiai esetek ezt öröklik. A projekt csak a döntés rétegét viszi.",
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
      "Helyi ellátás, önellátás, hálózati függetlenség. Víz, energia, 72 órás működési tartalék. Local-first, nincs telemetria.",
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
      "Közösség: decentralizált víz, energia, helyi mesh",
      "Háztartás: 72 órás működési tartalék — akkumulátor, készlet",
      "Ugyanaz a ResourceRunway / EnergyAutonomy / TTR számítás",
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
      "Fix PDCA. Pénzügyi sáv és Lean / Poka-Yoke mikro ugyanazon a moszaikon. Diák- és tanműhely-lépték.",
    proofBullets: [
      "Startup: burn rate, fedezeti pont, PRO sáv",
      "Lean VSM: OEE, SMED, Poka-Yoke",
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
        a: "Nem. Diák- és tanműhely-léptékű minta. Nincs felhő, nincs telemetria.",
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
