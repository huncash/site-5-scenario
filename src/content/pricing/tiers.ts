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

/**
 * Elsődleges fogalmak (UI): Case**, Slot*, P-R-O Szcenárió***, Seat / Guest****.
 * Másodlagos magyarázat csak lábjegyzetben / Fogalmi GYIK-ban.
 */
export type TierCapacity = {
  cases: number;
  slotsPerCase: number;
  editors: number;
  /** Unique anonymous Guest Code slots (1 concurrent session / code). */
  guests: number;
  /** Bankszámla / Slot (Basic: 1). */
  bankAccountsPerSlot: number | "unlimited";
};

export const TIER_CAPACITY: Record<TierId, TierCapacity> = {
  starter: { cases: 1, slotsPerCase: 2, editors: 1, guests: 1, bankAccountsPerSlot: 1 },
  pro: { cases: 2, slotsPerCase: 4, editors: 1, guests: 5, bankAccountsPerSlot: "unlimited" },
  expert: { cases: 5, slotsPerCase: 8, editors: 3, guests: 20, bankAccountsPerSlot: "unlimited" },
};

export const PRO_MULTIUSER_BULLET = "1 Seat, több eszközön";
export const PRO_P2P_SYNC_BULLET = "Titkosított lokális mentés, eszközök közötti átvitellel";

/**
 * NOTE: These tiers are marketing-only in this build for feature gates.
 * Capacity numbers are the product matrix; full enforcement may lag.
 */
export const TIER_CORE: TierCore[] = [
  { id: "starter", label: "Basic" },
  { id: "pro", label: "Pro", badge: "Ajánlott" },
  { id: "expert", label: "Enterprise" },
];

export const PRICING_HERO =
  "A Basic, Pro és Enterprise csomagok a Case**, Slot* és Seat / Guest**** kapacitását skálázzák. Minden csomag: 100%-ban lokális adatszuverenitás és kiszámítható, fix költségszerkezet.";

/** @deprecated Lábjegyzetbe került — ne ismételd a mátrix celláiban. */
export const PRICING_SEAT_DEF =
  "Seat: szerkesztői jog. Guest: csak olvasható megosztás — nem fogyaszt Seat-et.";

export const PRICING_IOT_NOTE =
  "Ipari IoT Integráció: valós idejű gyártósori és üzemviteli adatok (Modbus, MQTT, OPC-UA) fogadására felkészített architektúra — egyedi projektkeretben.";

export const PRICING_NET_NOTE = "A feltüntetett árak nettó összegek, az ÁFA-t nem tartalmazzák.";

/** Standard GYIK: Case helyi törlés / újraindítás (nem kiemelt blokk). */
export const PRICING_CASE_RESET_FAQ = {
  q: "Hogyan törölhetők vagy indíthatók újra a Case adatok az eszközön?",
  a: "A Case adatai 100%-ban lokálisan, a böngésző/eszköz saját tárhelyén tárolódnak. A beállítások menüben bármikor kezdeményezheted az adott Case teljes törlését vagy újraindítását.",
} as const;

/** @deprecated Use {@link PRICING_CASE_RESET_FAQ}. */
export const PRICING_VAT_FAQ = PRICING_CASE_RESET_FAQ;

export const DEMO_STARTER_BLURB =
  "Interaktív előnézet: a motor egy előre betöltött helyzeten fut. Nincs regisztráció — egy kattintással átláthatod a cash-flow fókuszokat és a likviditási mutatókat.";

export const TIER_SLOGAN: Record<TierId, string> = {
  starter: "1 Active Case** · 2 Slot* / Case · 1 banki kivonat / Slot*",
  pro: "2 Active Case** · 4 Slot* / Case · több bankfiók & kivonat / Slot*",
  expert: "5 Active Case** · 8 Slot* / Case · 3 Seat + 20 Guest",
};

export const TIER_AUDIENCE: Record<TierId, string> = {
  starter: "Egy elmenthető Case**, két Slot* — banki kivonat import bármilyen időszakra.",
  pro: "Két párhuzamos Case**, Case-enként négy Slot* — több csatolt bankfiók & kivonat.",
  expert: "Öt Case**, 8 Slot* / Case, 3 Seat — automata banki/könyvelési API.",
};

/** Kártyán a kapacitás-mátrix + kulcsképességek (elsődleges fogalmak). */
export const TIER_CARD_HIGHLIGHTS: Record<TierId, string[]> = {
  starter: [
    "1 Active Case**",
    "2 Slot* / Case",
    "1 Seat + 1 Guest****",
    "1 Banki kivonat import / Slot*",
    "Alapvető P-R-O Szcenárió*** & BCP",
  ],
  pro: [
    "2 Active Case**",
    "4 Slot* / Case",
    "1 Seat + 5 Guest****",
    "Több bankfiók & kivonat import / Slot*",
    "Haladó kapacitás- és kockázatszimuláció",
  ],
  expert: [
    "5 Active Case**",
    "8 Slot* / Case",
    "3 Seat + 20 Guest****",
    "Automata banki/könyvelési API",
    "Multi-portfolio & szervezeti BCP audit",
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
    pro: "✓ Basic",
    expert: "✓ Basic + Pro",
  },
  {
    feature: "Active Case**",
    starter: "1",
    pro: "2",
    expert: "5",
  },
  {
    feature: "Slot* / Case",
    starter: "2",
    pro: "4",
    expert: "8",
  },
  {
    feature: "Seat + Guest****",
    starter: "1 Seat + 1 Guest",
    pro: "1 Seat + 5 Guest",
    expert: "3 Seat + 20 Guest",
  },
  {
    feature: "Banki kivonat import",
    starter: "✓ 1 kivonat / Slot* (bármilyen időszakra)",
    pro: "✓ Több bankfiók & kivonat Slot*-onként",
    expert: "✓ Automata banki/könyvelési API + multi-bank",
  },
  {
    feature: "Adatszuverenitás & Biztonság",
    starter: "Titkosított lokális mentés",
    pro: "✓",
    expert: "✓ + opcionális szinkron",
  },
  {
    feature: "P-R-O Szcenárió*** & BCP",
    starter: "Alapvető P-R-O & BCP számítás",
    pro: "Haladó kapacitás- és kockázatszimuláció",
    expert: "Szervezeti BCP audit",
  },
  {
    feature: "Portfólió / tanácsadói használat",
    starter: "–",
    pro: "–",
    expert: "✓ Multi-portfolio & szervezeti BCP audit",
  },
];

export function isCompareAbsent(value: string): boolean {
  return value === "–" || value === "-" || value === "—" || value === "";
}

/** Listaárak (Ft / hó, nettó). */
export const TIER_MONTHLY_HUF: Record<TierId, number> = {
  starter: 8_900,
  pro: 24_420,
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
    limits: TIER_CARD_HIGHLIGHTS.starter,
  },
  pro: {
    tagline: TIER_SLOGAN.pro,
    description: TIER_AUDIENCE.pro,
    includes: TIER_COMPARE_ROWS.map((row) => row.feature),
    limits: TIER_CARD_HIGHLIGHTS.pro,
  },
  expert: {
    tagline: TIER_SLOGAN.expert,
    description: TIER_AUDIENCE.expert,
    includes: TIER_COMPARE_ROWS.map((row) => row.feature),
    limits: TIER_CARD_HIGHLIGHTS.expert,
  },
};
