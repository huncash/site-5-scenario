import { buildTierOffers, DEMO_STARTER_BLURB, PRICING_VAT_FAQ, STANDARD_TIER_COPY, type TierId } from "@/content/pricing/tiers";

const packages = STANDARD_TIER_COPY;

export const PROJEKT_KONTROLLING_FUNNEL = {
  hero: {
    eyebrow: "Projektalapú & interim kontrolling",
    title: "Zseb-kontrolling és Cash-flow szimuláció interim szakértőknek és projektekhez",
    subtitle:
      "Ügyfél‑biztos működés: local‑first számítás, offline használat, nincs szerver‑oldali adattárolás. A demó preloadolt helyzetből indul, majd a meglévő app‑nézetbe visz.",
    primaryCta: "Segédeszköz ingyenes kipróbálása",
    secondaryCta: "Csomagok megtekintése",
  },
  proofBullets: [
    "Ügyféladat‑titoktartás: nincs szerver‑oldali adatbázis, nincs telemetria",
    "Offline‑first: terepen / ügyfélnél is fut, hálózat nélkül",
    "Valóság‑sokk + tartozás‑fókusz: döntési jelzések (nem csak összeglista)",
  ],
  demoTeaser: {
    title: "Interaktív előnézet: projekt + helyreállítás (demó)",
    body: DEMO_STARTER_BLURB,
    cta: "Megnyitom az interim demót",
  },
  tiers: {
    defaultSelected: "pro" as TierId,
    note: "Minden csomag tiszta, lokális alapon működik, rejtett költségek nélkül.",
  },
  packages,
  tierOffers: buildTierOffers(packages),
  faq: [
    {
      q: "Ügyféladat hova kerül? Van szerver‑oldali adattárolás?",
      a: "Nincs szerver‑oldali adattárolás. Local‑first: a működés a te eszközödön történik; nincs telemetria sem.",
    },
    {
      q: "Használható offline (ügyfélnél / helyszínen)?",
      a: "Igen. A cél az offline‑first működés: a számítás és a nézetek helyben futnak, nem a hálózatra támaszkodnak.",
    },
    {
      q: "Mit csinál pontosan a demó indítása?",
      a: "Wrapper-only: preloadolt demó‑állapotot aktivál, majd a meglévő app‑nézetbe irányít. A core motorhoz nem nyúl.",
    },
    {
      q: "Mi a „valóság‑sokk” ebben a kontextusban?",
      a: "Olyan jelzések összessége, ami kiemeli: hol borul a runway/teher, hol csúszik el a projekt‑fedezet, és hol kell ACT-ben beavatkozni (helyi számítással).",
    },
    PRICING_VAT_FAQ,
  ],
} as const;

