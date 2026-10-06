import type { GlossaryTermId } from "@/lib/glossary";
import { DASH_OPL_LESSONS } from "@/lib/oplDashboard";
import { MOTOR_OPL_LESSONS } from "@/lib/oplMotor";

/** Lean One-Point-Lesson — egy fogalom, egy cél, cselekvő lépések. Nem cikk. */
export type OplImageSlot = {
  captionHu: string;
  captionEn: string;
  /** Same-origin / http(s) URL. Nincs data:-payload — a kép on-demand cache-be megy. */
  src?: string;
  altHu?: string;
  altEn?: string;
};

export type OplStep = {
  id: string;
  titleHu: string;
  titleEn: string;
  actionHu: string;
  actionEn: string;
  image?: OplImageSlot;
};

export type OplLesson = {
  id: string;
  path: string;
  categoryHu: string;
  categoryEn: string;
  titleHu: string;
  titleEn: string;
  whyHu: string;
  whyEn: string;
  deepDiveHu: string;
  deepDiveEn: string;
  jargon: GlossaryTermId[];
  keywords: string[];
  steps: OplStep[];
};

export const OPL_FRAME = {
  widthPx: 320,
  heightPx: 180,
} as const;

export const OPL_CORE_LESSONS: OplLesson[] = [
  {
    id: "lecke-02",
    path: "lecke-1-dashboard-kezeles",
    categoryHu: "Műszerfal",
    categoryEn: "Dashboard",
    titleHu: "Dashboard kezelés",
    titleEn: "Dashboard handling",
    whyHu: "Ha nem tudod, melyik sáv mit mutat, a számok csak zajok. Először a három sávot rögzítsd.",
    whyEn: "If you cannot tell which band does what, the numbers are noise. Lock the three bands first.",
    jargon: ["kpi", "whatIf", "pro", "slot"],
    keywords: ["dashboard", "kpi", "what-if", "pro"],
    deepDiveHu:
      "A műszerfal nem könyvelés. Három sáv: fent a gyors állapot (KPI), középen a döntés (What-if, P-R-O, kártyák), alul a modulok (Cashflow, Tételek, Üzletek, Leltár). Először a fület nézd — Magán, Vállalkozás vagy Projekt —, mert ugyanaz a szám más fiókban más döntés. A P-R-O három világ ugyanarra a múltra: rossz, közepes, jó. Ha összekevered a sávokat, zajnak tűnik, pedig csak más kérdésre válaszolnak.",
    deepDiveEn:
      "The dashboard is not bookkeeping. Three bands: top is the quick read (KPI), the middle is the decision (What-if, P-R-O, cards), the bottom is modules (Cashflow, Ledger, Deals, Inventory). Look at the tab first — Personal, Business or Project — because the same number is a different decision in another drawer. P-R-O is three worlds on the same past: bad, mid, good. Mix the bands and it looks like noise; they are just answering different questions.",
    steps: [
      {
        id: "s1",
        titleHu: "Felső sáv",
        titleEn: "Top band",
        actionHu: "Nézd a 4 KPI-t. Nem könyvelés — gyors állapot.",
        actionEn: "Read the 4 KPIs. Not accounting — a quick status.",
        image: { captionHu: "KPI sáv a fejléc alatt", captionEn: "KPI bar under the header" },
      },
      {
        id: "s2",
        titleHu: "Középső munka",
        titleEn: "Middle work",
        actionHu: "What-if: válaszd a P / R / O pályát. Ugyanaz a múlt, más világ.",
        actionEn: "What-if: pick the P / R / O path. Same past, different world.",
        image: { captionHu: "What-if + P-R-O gombok", captionEn: "What-if + P-R-O buttons" },
      },
      {
        id: "s3",
        titleHu: "Alsó modulok",
        titleEn: "Bottom modules",
        actionHu: "A fülek Slotot cserélnek: Magán / Vállalkozás / Projekt. Előbb a fület, aztán a tételt.",
        actionEn: "Tabs swap the Slot: Personal / Business / Project. Tab first, then the posting.",
        image: { captionHu: "Slot fülek", captionEn: "Slot tabs" },
      },
    ],
  },
  {
    id: "lecke-want",
    path: "lecke-2-szukseglet-vagy-befektetes",
    categoryHu: "Kiadás",
    categoryEn: "Spend",
    titleHu: "Szükséglet, vágy, befektetés",
    titleEn: "Need, want, investment",
    whyHu: "Ha minden kiadás „kell”, a tartalék elfogy. Három címke — egy döntés tételenként.",
    whyEn: "If every spend is a “must”, the reserve dies. Three labels — one decision per posting.",
    jargon: ["want", "cashflow", "vat"],
    keywords: ["need", "want", "investment"],
    deepDiveHu:
      "Minden tétel egy döntés. NEED: nélküle megáll a működés — rezsi, bér, anyag. WANT: jólesik, de nem kötelező; ha viszi a tartalékot, zárd a havi sapkát. INVESTMENT: ma kimegy, később termelnie kellene — más kérdés, mint a vágy. A hiba, ha mindent „kell”-nek hívsz: a tartalék csendben elfogy, és a kasszát a vágy viszi, nem a működés. A címke nem erkölcs. Sorrend: előbb a levegő.",
    deepDiveEn:
      "Every posting is a decision. NEED: without it operations stop — overhead, payroll, materials. WANT: nice, not required; lock the monthly cap if it eats the reserve. INVESTMENT: money leaves now and should earn later — a different question than a want. The failure is calling everything a must: the reserve dies quietly, and wants drive the till, not operations. The label is not morals. Order: air first.",
    steps: [
      {
        id: "s1",
        titleHu: "NEED",
        titleEn: "NEED",
        actionHu: "Csak az, ami nélkül megáll a működés: rezsi, bér, anyag.",
        actionEn: "Only what stops the operation if missing: overhead, payroll, materials.",
        image: { captionHu: "Tétel típusa: NEED", captionEn: "Posting type: NEED" },
      },
      {
        id: "s2",
        titleHu: "WANT",
        titleEn: "WANT",
        actionHu: "Nem kötelező. Zárold a havi WANT keretet, ha viszi a tartalékot.",
        actionEn: "Optional. Lock the monthly WANT cap if it eats the reserve.",
        image: { captionHu: "WANT keret zárolás", captionEn: "WANT cap lock" },
      },
      {
        id: "s3",
        titleHu: "INVESTMENT",
        titleEn: "INVESTMENT",
        actionHu: "Később termel. Ne keverd a WANT-tal — más kérdés, más kockázat.",
        actionEn: "Should earn later. Do not mix with WANT — different question, different risk.",
        image: { captionHu: "INVESTMENT jelölés", captionEn: "INVESTMENT mark" },
      },
    ],
  },
  {
    id: "lecke-cashflow",
    path: "lecke-cashflow-logika",
    categoryHu: "Pénzmozgás",
    categoryEn: "Money movement",
    titleHu: "Cashflow logika",
    titleEn: "Cashflow logic",
    whyHu: "Az egyenleg nem a történet. A történet: mi jön be, mi megy ki, mi van zárolva.",
    whyEn: "The balance is not the story. The story: what comes in, what goes out, what is locked.",
    jargon: ["cashflow", "vat", "idleCash", "jit", "runway"],
    keywords: ["cashflow", "áfa", "holtpénz", "jit", "runway"],
    deepDiveHu:
      "Az egyenleg egy fénykép. A cashflow a film: mi jön be, mi megy ki, mi van zárolva. Az ÁFA nem a tied — a következő bevallásig tedd félre. Ami utána marad, az a szabad nettó. A holtpénz ott áll: se tartalék, se munka. JIT: először legyen meg a 60 nap, aztán tölts perselyt. A runway megmondja, hány hónapig bírja a kassza, ha holnaptól semmi sem jön be. Ez a gépeden számolt mozgás, nem banki kivonat.",
    deepDiveEn:
      "The balance is a snapshot. Cashflow is the film: what comes in, what goes out, what is locked. VAT is not yours — set it aside until filing. What remains is free net. Idle cash just sits: neither reserve nor work. JIT: get the 60 days first, then fill piggies. Runway says how many months the till lasts if nothing comes in from tomorrow. Movement on your machine, not a bank statement.",
    steps: [
      {
        id: "s1",
        titleHu: "Mozgás",
        titleEn: "Movement",
        actionHu: "Cashflow = bevétel − kiadás időben. A persely nem cashflow.",
        actionEn: "Cashflow = income − spend over time. A piggy bank is not cashflow.",
        image: { captionHu: "Cashflow kártya", captionEn: "Cashflow card" },
      },
      {
        id: "s2",
        titleHu: "Zárolás",
        titleEn: "Lock",
        actionHu: "Az ÁFA tartalékot ne költsd. A szabad nettó a maradék.",
        actionEn: "Do not spend the VAT reserve. Free net is what remains.",
        image: { captionHu: "ÁFA tartalék csempe", captionEn: "VAT reserve tile" },
      },
      {
        id: "s3",
        titleHu: "Tartalékidő",
        titleEn: "Cover time",
        actionHu: "Holtpénz ott áll. JIT: először 60 nap fedezet, aztán persely.",
        actionEn: "Idle cash just sits. JIT: 60-day cover first, then piggies.",
        image: { captionHu: "Runway / 60 nap", captionEn: "Runway / 60 days" },
      },
    ],
  },
];

export const OPL_LESSONS: OplLesson[] = [...OPL_CORE_LESSONS, ...DASH_OPL_LESSONS, ...MOTOR_OPL_LESSONS];

export function oplByPath(path: string): OplLesson | null {
  const key = path.replace(/^\/+/, "");
  return OPL_LESSONS.find((l) => l.path === key || l.id === key) ?? null;
}

export function isOplPath(path: string): boolean {
  return oplByPath(path) != null;
}
