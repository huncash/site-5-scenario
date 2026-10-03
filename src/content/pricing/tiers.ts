import { formatCurrency } from "@/i18n/currency";

export type TierId = "starter" | "pro" | "expert";

export type TierCore = {
  id: TierId;
  /** Short label used in UI (must be stable across funnels). */
  label: string;
  /** Optional badge. */
  badge?: "Ajánlott" | "Multi‑site";
};

export type TierCopy = {
  tagline: string;
  description: string;
  includes: string[];
  /** Explicit limits (marketing copy; NOT enforced in code). */
  limits: string[];
};

export type TierOffer = TierCore & TierCopy;

// Shared marketing bullets that should stay consistent across funnels.
// (Marketing-only; not enforced in the application engine.)
export const PRO_MULTIUSER_BULLET = "1 felhasználó, több eszközön";
export const PRO_P2P_SYNC_BULLET = "Titkosított lokális mentés, eszközök közötti átvitellel";

/**
 * NOTE: These tiers are marketing-only in this build.
 * They are NOT enforced in the application engine (zero feature expansion).
 *
 * Keep this file as the single source of truth for stable tier identities across all funnels.
 * Funnel-specific copy belongs in `src/content/funnels/*`.
 */
export const TIER_CORE: TierCore[] = [
  { id: "starter", label: "Alap" },
  { id: "pro", label: "Pro", badge: "Ajánlott" },
  { id: "expert", label: "Enterprise" },
];

export const PRICING_HERO =
  "Az Alap, Pro és Enterprise csomagok a technikai adatszervezési kapacitást és a szcenárió-helyeket skálázzák — nem a felhasználó státuszát vagy céljainak nagyságát. Minden csomag: 100%-ban lokális adatszuverenitás és kiszámítható, fix költségszerkezet.";

export const PRICING_SEAT_DEF =
  "Szerkesztői fiók (Seat): Önálló adatbeviteli és módosítási joggal rendelkező felhasználó. A díjmentes Olvasó/Vendég hozzáférések nem fogyasztanak szerkesztői fiókot.";

export const PRICING_IOT_NOTE =
  "Ipari IoT Integráció: A szoftver architektúrája fel van készítve valós idejű gyártósori és üzemviteli adatok (Modbus, MQTT, OPC-UA) fogadására, amely egyedi projektkeretben illeszthető az infrastruktúrához.";

export const PRICING_NET_NOTE =
  "Áraink nettóban értendőek, és a megrendelő országa szerinti áfával együtt kerülnek kiállításra.";

export const PRICING_VAT_FAQ = {
  q: "Nettó vagy bruttó árak szerepelnek a csomagoknál?",
  a: "Az árak nettó összegűek — kiszámítható, fix költségszerkezet. A számlázás a megrendelő országának megfelelő áfával történik.",
} as const;

export const DEMO_STARTER_BLURB =
  "Interaktív előnézet: a motor egy előre betöltött helyzeten fut. Nincs regisztráció — egy kattintással átláthatod a cash-flow fókuszokat és a likviditási mutatókat.";

export const TIER_SLOGAN: Record<TierId, string> = {
  starter: "Alap adatszervezés, cash-flow áttekintés, 100%-ban lokális adatszuverenitás.",
  pro: "Több szcenárió-hely, runway és likviditási kalkulátor, operatív jelzések.",
  expert: "Nagyobb adatszervezési kapacitás, több szerkesztői fiók, fejlett forgatókönyv-kezelés.",
};

export const TIER_AUDIENCE: Record<TierId, string> = {
  starter: "Akinek kevés szcenárió-hely és egy szerkesztői fiók elég a mozgástér-modellezéshez.",
  pro: "Akinek több párhuzamos szcenárió és részletesebb adatszervezés kell — magán vagy vállalkozási keretben.",
  expert: "Akinek nagyobb kapacitás, több Seat és összetett portfólió-szervezés kell — a célok mérete nem a csomag neve.",
};

/** Kártyán a funkció-bemutatás; a magasabb csomag első sora a kumulatív öröklés. */
export const TIER_CARD_HIGHLIGHTS: Record<TierId, string[]> = {
  starter: [
    "Alapvető cash-flow áttekintés",
    "Bank- és Excel-import",
    "Titkosított lokális mentés",
    "Alap tartozásnyilvántartás",
    "1 szerkesztői fiók (Seat)",
  ],
  pro: [
    "Minden az Alapból",
    "Részletes havi/éves cash-flow",
    "Runway és likviditási kalkulátor",
    "Lean / MUDA jelzések",
    "1 Seat, több eszközön",
  ],
  expert: [
    "Minden a Pro-ból",
    "Korlátlan multi-forgatókönyv",
    "Avalanche / Snowball stratégia",
    "Folyamat-optimalizálási audit",
    "Több Seat, csoportos jogosultságok",
  ],
};

export const PRICING_CUMULATIVE_NOTE =
  "A magasabb csomag tartalmazza az összes alsóbb csomag funkcióját. A táblázatban a bővített korlát vagy az extra modul szerepel; a pipa az öröklött funkciót jelöli.";

export const TIER_COMPARE_ROWS: Array<{
  feature: string;
  starter: string;
  pro: string;
  expert: string;
}> = [
  {
    feature: "Alsóbb csomagok funkciói",
    starter: "–",
    pro: "✓ Alap",
    expert: "✓ Alap + Pro",
  },
  {
    feature: "Átfogó cash-flow modul",
    starter: "Alapvető áttekintés",
    pro: "Részletes havi/éves",
    expert: "Korlátlan multi-forgatókönyv",
  },
  {
    feature: "Adatimport (Bank & Excel)",
    starter: "✓",
    pro: "✓ Tömeges import",
    expert: "✓ Prioritásos, automatizált",
  },
  {
    feature: "Adatszuverenitás & Biztonság",
    starter: "Titkosított lokális mentés",
    pro: "✓",
    expert: "✓ + opcionális szinkron",
  },
  {
    feature: "Kötelezettség- és tartozáskezelés",
    starter: "Alap nyilvántartás",
    pro: "Előre betöltött modulok & ütemezés",
    expert: "Fejlett Avalanche / Snowball",
  },
  {
    feature: "Runway és likviditási horizont",
    starter: "–",
    pro: "Közeljövő teher fókusz & kalkulátor",
    expert: "Teljes körű stresszteszt",
  },
  {
    feature: "Lean / MUDA pazarlásszűrés",
    starter: "–",
    pro: "Operatív veszteségazonosító jelzések",
    expert: "Részletes folyamat-optimalizálási audit",
  },
  {
    feature: "Szerkesztői fiók (Seat)",
    starter: "1 Seat",
    pro: "1 Seat, több eszközön",
    expert: "Több Seat, csoportos jogosultságok",
  },
];

export function isCompareAbsent(value: string): boolean {
  return value === "–" || value === "-" || value === "—" || value === "";
}

/** Placeholder listaárak (Ft / hó). A fizetési szolgáltató nincs bekötve. */
export const TIER_MONTHLY_HUF: Record<TierId, number> = {
  starter: 8_900,
  pro: 24_900,
  expert: 59_000,
};

export const YEARLY_DISCOUNT_PCT = 15;

export function yearlyPriceHuf(monthlyHuf: number): number {
  return Math.round(monthlyHuf * 12 * (1 - YEARLY_DISCOUNT_PCT / 100));
}

export function formatHuf(n: number): string {
  return formatCurrency(n);
}

export function getTierCore(id: string | null | undefined): TierCore | null {
  if (!id) return null;
  return TIER_CORE.find((t) => t.id === id) ?? null;
}

export function isTierId(v: unknown): v is TierId {
  return v === "starter" || v === "pro" || v === "expert";
}

const TIER_RANK: Record<TierId, number> = { starter: 0, pro: 1, expert: 2 };

/** Higher packages include every listed capability of the cheaper ones. */
export function tierIncludesFeature(offers: TierOffer[], tierId: TierId, feature: string): boolean {
  const rank = TIER_RANK[tierId];
  return offers.some((o) => TIER_RANK[o.id] <= rank && o.includes.includes(feature));
}

export function buildTierOffers(map: Record<TierId, TierCopy>): TierOffer[] {
  return TIER_CORE.map((t) => ({ ...t, ...map[t.id] }));
}

export const STANDARD_TIER_COPY: Record<TierId, TierCopy> = {
  starter: {
    tagline: TIER_SLOGAN.starter,
    description: TIER_AUDIENCE.starter,
    includes: TIER_COMPARE_ROWS.map((row) => row.feature),
    limits: [],
  },
  pro: {
    tagline: TIER_SLOGAN.pro,
    description: TIER_AUDIENCE.pro,
    includes: TIER_COMPARE_ROWS.map((row) => row.feature),
    limits: [],
  },
  expert: {
    tagline: TIER_SLOGAN.expert,
    description: TIER_AUDIENCE.expert,
    includes: TIER_COMPARE_ROWS.map((row) => row.feature),
    limits: [],
  },
};

