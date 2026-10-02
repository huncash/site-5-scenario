import { buildTierOffers, DEMO_STARTER_BLURB, PRICING_VAT_FAQ, STANDARD_TIER_COPY, type TierId } from "@/content/pricing/tiers";
import { PRO_CHART_FAQ, WHY_FAQ } from "@/content/branding";

const packages = STANDARD_TIER_COPY;

export const ADOSSAG_HELYREALLITAS_FUNNEL = {
  hero: {
    eyebrow: "Adósság‑helyreállítás",
    title: "Tartozás teher → puffer → következő lépés. Helyreállítás helyben.",
    subtitle:
      "Lásd, mi a közeljövő teher, mennyi a szabad, és hol lehet ACT-ben beavatkozni — offline‑first, local‑first.",
    primaryCta: "Segédeszköz ingyenes kipróbálása",
    secondaryCta: "Csomagok megtekintése",
  },
  proofBullets: [
    "Runway és teher fókusz: gyors döntés, nem csak összeg",
    "Lokális számítás: nem a hálózatra vár",
    "Adatszuverenitás: nincs szerver‑oldali adatbázis, nincs telemetria",
  ],
  demoTeaser: {
    title: "Interaktív előnézet: tartozás + törlesztés (demó)",
    body: DEMO_STARTER_BLURB,
    cta: "Megnyitom a helyreállítás demót",
  },
  tiers: {
    defaultSelected: "pro" as TierId,
    note: "Minden csomag tiszta, lokális alapon működik, rejtett költségek nélkül.",
  },
  packages,
  tierOffers: buildTierOffers(packages),
  faq: [
    {
      q: "Hol tárolódik a tartozás adat?",
      a: "Local‑first: a te eszközödön, titkosítva. Nincs szerver‑oldali adattárolás.",
    },
    {
      q: "Mit mutat a demó?",
      a: "Előre betöltött tartozás és törlesztés mozgások, hogy a tartozás panel és a runway fókusz azonnal tesztelhető legyen.",
    },
    {
      q: "Ez automatikusan ‘zár’ vagy ‘kopogtat’?",
      a: "Nem. A funnel csak marketing wrapper. Nincs lezárás, nincs telemetria, nincs automatikus ping.",
    },
    PRICING_VAT_FAQ,
    WHY_FAQ,
    PRO_CHART_FAQ,
  ],
} as const;

