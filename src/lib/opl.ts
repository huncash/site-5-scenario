import type { GlossaryTermId } from "@/lib/glossary";
import type { KnowledgeBaseArticleId } from "@/lib/knowledgeBase";
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
  kbId?: KnowledgeBaseArticleId;
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
    whyHu: "Előbb a fül, aztán a lombik. A modulok a fán vannak — a főasztal a döntésé.",
    whyEn: "Tab first, then the flask. Modules live on the tree — the desk is for the decision.",
    jargon: ["kpi", "whatIf", "pro", "slot", "devTree"],
    keywords: ["dashboard", "kpi", "what-if", "pro", "lombik", "dev tree", "laboratórium"],
    kbId: "labs-dev-tree",
    deepDiveHu:
      "A műszerfal nem könyvelés. Először a fület nézd — Magán, Vállalkozás vagy Projekt —, mert ugyanaz a szám más fiókban más döntés. A modulok és a gyors mutatók a fejléc lombikjában, a fejlesztési fán kapcsolhatók: a bogyóra kattintasz, a kép az asztalon jelenik meg. Középen a döntés: What-if, három pálya, kártyák. A fa Poka-Yoke: ami nincs bekapcsolva, az nem zsúfolja a főképet. Ha összekevered a fiókot a fával, zajnak tűnik — más kérdésre válaszolnak.",
    deepDiveEn:
      "The dashboard is not bookkeeping. Look at the tab first — Personal, Business or Project — because the same number is a different decision in another drawer. Modules and the quick indicators switch on the flask in the header, on the development tree: tap a berry, the picture lands on the desk. The middle is the decision: What-if, three paths, cards. The tree is poka-yoke: what is off does not clutter the main view. Mix the drawer with the tree and it looks like noise — they answer different questions.",
    steps: [
      {
        id: "s1",
        titleHu: "Fül",
        titleEn: "Tab",
        actionHu: "Előbb a Slot: Magán, Vállalkozás vagy Projekt.",
        actionEn: "Slot first: Personal, Business or Project.",
        image: { captionHu: "Slot fülek a fejlécben", captionEn: "Slot tabs in the header" },
      },
      {
        id: "s2",
        titleHu: "Lombik",
        titleEn: "Flask",
        actionHu: "A fa bogyói a modulok. Kapcsold, aztán keresd az asztalon.",
        actionEn: "The tree berries are modules. Switch one, then find it on the desk.",
        image: { captionHu: "Lombik — fejlesztési fa", captionEn: "Flask — development tree" },
      },
      {
        id: "s3",
        titleHu: "Döntés",
        titleEn: "Decision",
        actionHu: "Középen a What-if: három pálya ugyanarra a múltra.",
        actionEn: "In the middle, What-if: three paths on the same past.",
        image: { captionHu: "What-if gombok a munkaterületen", captionEn: "What-if buttons on the desk" },
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
  {
    id: "lecke-03",
    path: "lecke-3-pdca",
    categoryHu: "Ciklus",
    categoryEn: "Cycle",
    titleHu: "PDCA",
    titleEn: "PDCA",
    whyHu: "A tárcsa párosával fordul. Négy állás: PLAN|DO, DO|CHECK, CHECK|ACT, ACT|PLAN.",
    whyEn: "The dial turns in pairs. Four states: PLAN|DO, DO|CHECK, CHECK|ACT, ACT|PLAN.",
    jargon: ["pdca", "plan", "do", "check", "act"],
    keywords: ["pdca", "tárcsa", "plan", "do", "check", "act", "ciklus"],
    deepDiveHu:
      "A félkörös tárcsa mindig két szomszédos fázist mutat, nem egyet. PLAN: törzs és cél — ide a kiinduló számok kerülnek, nem a napi rezsi. DO: a futó üzem, cashflow, tétel. CHECK: ami eltért, a mérés. ACT: a javítás, amit bevezeted. A „Forgatás” gomb negyedfordulatot tesz: PD → DC → CA → AP, aztán vissza. Ha PLAN-be írsz napi tételt, összekevered a törzset a működéssel. A tárcsa nem ment új Case-t — csak a munkamódot cseréli. A kör akkor zárul, ha az ACT után újra PLAN-en indítod a következő tanulást.",
    deepDiveEn:
      "The semi-circle dial always shows two neighbouring phases, not one. PLAN: trunk and goal — starting numbers belong here, not daily overhead. DO: the live run, cashflow, posting. CHECK: what drifted, the measure. ACT: the fix you adopt. Rotate turns a quarter step: PD → DC → CA → AP, then back. If you post daily items in PLAN, you mix the trunk with operations. The dial does not save a new Case — it only swaps the work mode. The loop closes when after ACT you start the next learning on PLAN again.",
    steps: [
      {
        id: "s1",
        titleHu: "PLAN | DO",
        titleEn: "PLAN | DO",
        actionHu: "PD állás: balra a terv, jobbra a futó üzem.",
        actionEn: "PD state: plan on the left, live run on the right.",
        image: {
          captionHu: "Tárcsa PD — PLAN és DO oszlop",
          captionEn: "Dial PD — PLAN and DO columns",
          src: "/opl-frames/pdca-dial-pd.webp",
          altHu: "PDCA tárcsa PLAN|DO állásban, két oszlop egymás mellett",
          altEn: "PDCA dial in PLAN|DO state, two columns side by side",
        },
      },
      {
        id: "s2",
        titleHu: "DO | CHECK",
        titleEn: "DO | CHECK",
        actionHu: "Forgat: DC állás. Üzem balra, mérés jobbra.",
        actionEn: "Rotate: DC state. Run on the left, measure on the right.",
        image: {
          captionHu: "Tárcsa DC — DO és CHECK oszlop",
          captionEn: "Dial DC — DO and CHECK columns",
          src: "/opl-frames/pdca-dial-dc.webp",
          altHu: "PDCA tárcsa DO|CHECK állásban",
          altEn: "PDCA dial in DO|CHECK state",
        },
      },
      {
        id: "s3",
        titleHu: "CHECK | ACT",
        titleEn: "CHECK | ACT",
        actionHu: "CA állás: eltérés balra, beavatkozás jobbra.",
        actionEn: "CA state: drift on the left, intervention on the right.",
        image: {
          captionHu: "Tárcsa CA — CHECK és ACT oszlop",
          captionEn: "Dial CA — CHECK and ACT columns",
          src: "/opl-frames/pdca-dial-ca.webp",
          altHu: "PDCA tárcsa CHECK|ACT állásban",
          altEn: "PDCA dial in CHECK|ACT state",
        },
      },
      {
        id: "s4",
        titleHu: "ACT | PLAN",
        titleEn: "ACT | PLAN",
        actionHu: "AP állás: a javítás zárja a kört, új terv jobbra.",
        actionEn: "AP state: the fix closes the loop, new plan on the right.",
        image: {
          captionHu: "Tárcsa AP — ACT és PLAN oszlop",
          captionEn: "Dial AP — ACT and PLAN columns",
          src: "/opl-frames/pdca-dial-ap.webp",
          altHu: "PDCA tárcsa ACT|PLAN állásban",
          altEn: "PDCA dial in ACT|PLAN state",
        },
      },
    ],
  },
];

export const OPL_LESSONS: OplLesson[] = [...OPL_CORE_LESSONS, ...DASH_OPL_LESSONS, ...MOTOR_OPL_LESSONS];

export function oplByPath(path: string): OplLesson | null {
  const key = path.replace(/^\/+/, "").replace(/^(kb|embed)\//, "");
  return OPL_LESSONS.find((l) => l.path === key || l.id === key) ?? null;
}

export function isOplPath(path: string): boolean {
  return oplByPath(path) != null;
}
