import type { Locale } from "@/i18n/locale";
import { conceptFaq } from "@/content/concepts";
import {
  FAQ_GENERAL,
  KAHN_BONBON,
  LESSONS,
  SUPPORT_SLA,
  THEORY_LESSONS,
  TIPS,
  type FaqItem,
  type FaqSection,
  type Lesson,
} from "./content";

const hu = {
  brand: "Szcenárió · support",
  homeTitle: "Szcenárió support",
  homeLead:
    "Először a tudásbázis és a GYIK. A Szcenárió a saját eszközödön számol: a fejlesztők nem látják és nem gyűjtik az adataidat. Nincs telefonos ügyintézés.",
  tips: "Tippek",
  faq: "GYIK",
  faqTitle: "Gyakran Ismételt Kérdések",
  ticket: "Jegy",
  ticketTitle: "Írásos ügyintézés",
  ticketHome: "Írásos jegy",
  lessons: "Tudástár — szcenárió-leckék",
  lessonsNote: "A leckék a saját gépeden vannak. Nincs felhő-adat. Kávé mellett is érthető.",
  videos: "Videós segédletek",
  searchPlaceholder: "Keresés a GYIK témái között…",
  searchEmpty: "Nincs találat — próbálj más kulcsszót, vagy nézd a leckéket.",
  noTicketCta: "Nem találtam választ a kérdésemre → Jegy küldése",
  guardTitle: "Mielőtt üzenetet küldesz nekünk: Biztosan megnézted a Tudásbázist?",
  guardLead: "A legtöbb kérdésre a GYIK, a leckék vagy a videók azonnal választ adnak.",
  guardFaq: "GYIK / Gyakran Ismételt Kérdések",
  guardFaqHint: "Kategóriákra bontott válaszok",
  guardLessons: "Leckék & Használati útmutatók",
  guardLessonsHint: "Részletes tudástár a saját gépeden",
  guardVideos: "Videós segédletek",
  guardVideosHint: "YouTube útmutatók — nem a VPS-en tárolva",
  guardCommunity: "Egyéb lelőhelyek",
  guardCommunityHint: "Tippek és rövid súgórétegek",
  guardFound: "Megtaláltam a választ",
  guardProceed: "Kipróbáltam mindent, mégis jegyet küldök",
  name: "Név",
  email: "E-mail",
  subject: "Tárgy",
  message: "Üzenet",
  send: "Jegy küldése e-mailben",
  mailSubject: "Szcenárió jegy",
  mailName: "Név",
  noLesson: "Nincs ilyen lecke",
  backTips: "Vissza a tippekhez",
  backHome: "Vissza a support főoldalra",
  help: "Súgó",
  helpBody: "A fogalom a helyi appban is ott van. Részletes lecke a YouTube-on, nem a VPS-en.",
  noVideo: "A lecke videója YouTube-on jelenik meg. A saját szerver nem tárol és nem szolgál ki videófájlt.",
  sla: SUPPORT_SLA,
  pricingNav: "Árazás",
  pricingTitle: "Csomagok, licenc és helyi adatkezelés",
  pricingLead:
    "A Basic és a Pro azonnal a böngészőben él, a gépeden. Helyi adat, nincs felhős adatbázis. Itt a csomagok kapacitása, a hűségmodell és a helyi adatkezelés. Az asztali early access 2027 tavaszán jön, a Pro mellé ingyen.",
  pricingTocPlans: "Csomagok",
  pricingTocLoyalty: "Hűségmodell",
  pricingTocActive: "Aktív munkaterületek",
  pricingTocLocal: "Lokális import & Edge",
  pricingTocWorkflow: "Hogyan dolgozol vele",
  pricingLoyaltyTitle: "3 éves lépcsőzetes hűség (#tiered-loyalty)",
  pricingLoyaltyBody:
    "1. év: a belépő listaár 100%-a (egyszeri vásárlás) — a megvásárolt verzió véglegesen a tiéd marad. 2. év: frissítési díj −25%. 3. év: frissítési díj −40%. A 4. évtől minden jövőbeli frissítés díjmentes. Ha nem újítasz, a megvásárolt verzió továbbra is használható; csak az újabb motorverziókhoz kell a lépcső szerinti frissítés.",
  pricingActiveTitle: "Aktív Case & Aktív Slot — párhuzamos asztal és fül (#active-workspaces)",
  pricingActiveBody:
    "A licenc az egyidejűleg éles (párhuzamosan futó) munkaterületek számát köti — nem a felhalmozott, archív adatok mennyiségét. Inaktív vagy régi Case/Slot szabadon törölhető, felülírható és újratölthető díj nélkül. Fizetni csak akkor kell, ha újabb párhuzamos éles munkaterületet nyitsz (bővítő modul: Extra Aktív Case / Slot / Seat).",
  pricingLocalTitle: "Lokális bankkivonat-import & Edge (#local-import)",
  pricingLocalBody:
    "A bankkivonat (CSV, XML) a saját gépeden a Mesh Data Managerbe kerül — kézzel, vagy Proban egy figyelt mappából, amit belépéskor megnéz. Nincs kötelező felhő, nincs külső felhős adatbázis. A fejlesztők soha nem látják és nem gyűjtik. Az opcionális helyi bekötés is nálad marad: nem küldünk használatot. A megvett motor a gépeden él; ha nem frissítesz, a megvett verzió tovább megy.",
  pricingWorkflowTitle: "A valós munkamenet (#workflow)",
  pricingWorkflowBody:
    "Először a törzsadat: profil, magán vagyontárgyak, ingatlanok — titkosítva, helyben. Aztán a kivonat a Mesh Data Managerbe: Basicben kézi CSV/XML, Proban figyelt mappa és saját szabály. A helyzetkép ott áll össze: a tételek kategóriába kerülnek, te tervezel, futtatsz, ellenőrizsz, beavatkozol. A pontatlan beolvasást kézzel igazítod — nem mesterséges intelligenciát tanítasz. Vállalkozás és projekt a Pro asztalán. A demók elképzelt minták a motor kipróbálásához; elsőre sűrűnek is szabad lenniük.",
  pricingEnterpriseBadge: "Későbbi időpontban érhető el",
  pricingEnterpriseCta: "Kapcsolatfelvétel / Ajánlatkérés",
  pricingEnterpriseInquiryLead:
    "Az Enterprise csomag előjegyzésre érhető el. Az ár és a kapacitás (Aktív Case / Aktív Slot) tájékoztató értékhorgony. Nincs önkiszolgáló checkout.",
  toTierBasic: "Támogatás: Basic",
  toTierPro: "Támogatás: Standard",
  toTierEnterprise: "Támogatás: Priority",
};

const en: typeof hu = {
  brand: "Szcenárió · support",
  homeTitle: "Szcenárió support",
  homeLead:
    "Start with the knowledge base and FAQ. Szcenárió calculates on your device: developers do not see or collect your data. No phone desk.",
  tips: "Tips",
  faq: "FAQ",
  faqTitle: "Frequently Asked Questions",
  ticket: "Ticket",
  ticketTitle: "Written support",
  ticketHome: "Written ticket",
  lessons: "Knowledge — scenario lessons",
  lessonsNote: "Lessons live on your device. No cloud data. Plain talk, like a colleague over coffee.",
  videos: "Video guides",
  searchPlaceholder: "Search FAQ topics…",
  searchEmpty: "No matches — try another keyword, or browse the lessons.",
  noTicketCta: "I didn’t find an answer → Send a ticket",
  guardTitle: "Before you message us: Did you check the Knowledge base?",
  guardLead: "Most questions are answered by the FAQ, lessons, or videos.",
  guardFaq: "FAQ / Frequently Asked Questions",
  guardFaqHint: "Answers by category",
  guardLessons: "Lessons & how-to guides",
  guardLessonsHint: "Full knowledge base on your device",
  guardVideos: "Video guides",
  guardVideosHint: "YouTube walkthroughs — not stored on the VPS",
  guardCommunity: "Other places",
  guardCommunityHint: "Tips and short help layers",
  guardFound: "I found the answer",
  guardProceed: "I tried everything — still send a ticket",
  name: "Name",
  email: "E-mail",
  subject: "Subject",
  message: "Message",
  send: "Send ticket by e-mail",
  mailSubject: "Szcenárió ticket",
  mailName: "Name",
  noLesson: "No such lesson",
  backTips: "Back to tips",
  backHome: "Back to support home",
  help: "Help",
  helpBody: "The term is also in the local app. The full lesson is on YouTube, not on the VPS.",
  noVideo: "The lesson video appears on YouTube. This server does not store or serve video files.",
  sla: "Average reply within 24 hours, in writing only — faster and more precise than a phone queue.",
  pricingNav: "Pricing",
  pricingTitle: "Plans, license & local data handling",
  pricingLead:
    "Basic and Pro start at once in the browser, on your machine. Local data, no cloud database. This page states plan capacity, the loyalty model and local data handling. Desktop early access comes spring 2027, free with Pro.",
  pricingTocPlans: "Plans",
  pricingTocLoyalty: "Loyalty model",
  pricingTocActive: "Active workspaces",
  pricingTocLocal: "Local import & Edge",
  pricingTocWorkflow: "How you work with it",
  pricingLoyaltyTitle: "3-year tiered loyalty (#tiered-loyalty)",
  pricingLoyaltyBody:
    "Year 1: 100% of the entry list price (one-time purchase) — the purchased version stays yours permanently. Year 2: update fee −25%. Year 3: update fee −40%. From year 4, every future update is free. If you do not renew, the purchased version remains usable; only newer engine versions require the ladder update fee.",
  pricingActiveTitle: "Active Case & Active Slot — parallel desks and tabs (#active-workspaces)",
  pricingActiveBody:
    "The license limits concurrently live (parallel) workspaces — not accumulated archive data. Inactive or old Cases/Slots can be deleted, overwritten and reloaded at no charge. You pay only when you open an additional parallel live workspace (add-on: Extra Active Case / Slot / Seat).",
  pricingLocalTitle: "Local bank-statement import & Edge (#local-import)",
  pricingLocalBody:
    "The bank statement (CSV, XML) goes into Mesh Data Manager on your machine — by hand, or on Pro from a watched folder checked at sign-in. No required cloud, no external cloud database. Developers never see or collect it. Optional local intake stays under your control: we do not send usage. The purchased engine lives on your device; if you do not update, that version still runs.",
  pricingWorkflowTitle: "The real work sequence (#workflow)",
  pricingWorkflowBody:
    "First the master data: profile, personal assets, property — encrypted, local. Then the statement into Mesh Data Manager: on Basic by hand (CSV/XML), on Pro a watched folder and your own rule. The picture assembles there: lines fall into categories; you plan, run, check, act. You correct a bad read by hand — you are not training an artificial intelligence. Business and projects sit on Pro. Demos are fictional samples to try the engine; they may feel dense at first.",
  pricingEnterpriseBadge: "Available at a later date",
  pricingEnterpriseCta: "Contact / request a quote",
  pricingEnterpriseInquiryLead:
    "The Enterprise plan is available on waitlist. Price and capacity (Active Case / Active Slot) stay visible as a value anchor. There is no self-serve checkout.",
  toTierBasic: "Support: Basic",
  toTierPro: "Support: Standard",
  toTierEnterprise: "Support: Priority",
};

const TIPS_EN = [
  { q: "Where is my data?", a: "On your device. Developers never see or collect it. Save to a file, like a spreadsheet used to be — or invite a guest." },
  { q: "Is there phone support?", a: "No. Writing only, by ticket." },
  { q: "How fast is the reply?", a: "On average within 24 hours, in writing." },
  { q: "Where is the video?", a: "On YouTube. This server does not store video files." },
  {
    q: "Does the three-path chart show the future?",
    a: "No. Not reality and not a forecast: it computes the spread of possible outcomes and your room to move from past data.",
  },
];

const FAQ_GENERAL_EN: FaqItem[] = [
  { q: "Do I need to register?", a: "No. The local profile stays on this device. Demos are fictional samples to try the engine." },
  { q: "Why is there no phone number?", a: "Written tickets are more precise — there is no phone queue." },
  { q: "Where do I ask for help?", a: "Start with the FAQ and knowledge base. If that fails, use “I didn’t find an answer” — a short check runs before the ticket form." },
  { q: "Does it work offline?", a: "The app does. The support iframe needs a network; offline, local help stays." },
  {
    q: "Do developers see my data?",
    a: "No. Szcenárió calculates on your own device. The statement goes into Mesh Data Manager locally. Developers never see or collect modelled data at any level.",
  },
  {
    q: "Why is it called Szcenárió — more than a good year and a bad year?",
    a: "Yes — much more. A “good year / bad year” is just two static numbers at the bottom of a spreadsheet. A Szcenárió is a living storyline: it shows the chain reaction of your decisions and their exact timing. It does not guess what you will have at year-end; it shows which month and day an unexpected cost or lost revenue hits your critical safety bound — so you see your room to move ahead of time, instead of reacting after the fact.",
  },
  {
    q: "How to read the pessimistic, realistic and optimistic chart?",
    a: "You are not looking at reality or a forecast. The model draws room to move from your past data, seasonal patterns, and set parameters.",
  },
];

function toFaqSection(locale: Locale): FaqSection[] {
  const concepts = conceptFaq(locale);
  const general: FaqSection = {
    category: locale === "en" ? "General" : "Általános",
    items: locale === "en" ? FAQ_GENERAL_EN : FAQ_GENERAL,
  };
  return [
    {
      category: concepts.category,
      items: concepts.items.map((x) => ({ id: x.id, q: x.question, a: x.answer })),
    },
    general,
  ];
}

const KAHN_EN = {
  eyebrow: "Knowledge · three-path spread model",
  title: "Herman Kahn decision fork & spread model",
  p1: "Not a forecast — a range: critical decision nodes (rounds 1–2) and three simultaneously running outcomes — Pessimistic, Realistic, Optimistic.",
  p2: "The capital-protection bound on the pessimistic band protects the core plant. Full lesson: decision tree, financing structure, reserve months. DEMO 11, local data.",
  foot: "Local-first · no cloud data · no usage send",
} as const;

const LESSON_EN: Record<string, { title: string; body: string }> = {
  "lecke-01": {
    title: "Sample case",
    body: "A preloaded example. Not a bank extract, not live client data. The numbers are made in the browser.",
  },
  "lecke-02": {
    title: "Dashboard handling",
    body: "Controls on top, work in the middle, modules below. The tabs swap Personal, Business and Project. The top band is the quick read; the middle is the decision. 0 months = the air is gone: first hold the till.",
  },
  "lecke-want": {
    title: "Need or investment",
    body: "NEED: required operations (overhead, payroll, materials). WANT: optional desire — the monthly cap can be locked. INVESTMENT: spend that should earn later. Cashflow is the real movement; do not spend the VAT reserve; idle cash just sits. JIT: air first, then the piggy / the toy. 0 months = the air is gone: you need ACT, not a new WANT.",
  },
  "lecke-cashflow": {
    title: "Cashflow logic",
    body: "In, out, lock — the movement, not the balance.",
  },
  "lecke-03": { title: "PDCA", body: "PLAN → DO → CHECK → ACT. The dial turns to the next phase pair." },
  "lecke-04": { title: "Shortcuts", body: "The keyboard icon opens the list. Save: Ctrl/Cmd+S." },
  "lecke-05": {
    title: "Slots",
    body: "Inside one Case, Personal, Business and Project are separate rooms. The top tabs swap them; each runs the same three futures.",
  },
  "lecke-06": { title: "Main menu", body: "Save, FAQ and sign-out sit behind the three lines. No phone desk." },
};

const THEORY_EN: Record<string, { title: string; summary: string }> = {
  "kozossegi-civil-valsagkezeles": {
    title: "Community crisis — water, LoRa mesh and a warm room",
    summary: "Tanker, offline LoRa and a winter warm room. Litres, hours, covered street — local-first.",
  },
  "maganszemely-infrastruktura-korlatozas": {
    title: "A person in an outage — 72-hour blackout, water and mobile net",
    summary: "Household reserve: Wh, filter chain, paper map and PMR. Same engine, smaller scale.",
  },
  "vallalati-bcp-folytonossag": {
    title: "Corporate BCP — SaaS outage, supply chain and key-person gap",
    summary: "Local-first cutover, lean quota, cross-skill matrix. TTR in hours, not “as soon as we can”.",
  },
  "demografiai-implozio-tfr-matrix": {
    title: "Demographic implosion — TFR matrix from Korea to Hungary",
    summary: "KR, CN, IT, JP, HU: gap to 2.1, treatment path. Structural foresight, local copy.",
  },
  "oktatasi-campus-valsaghelyzet": {
    title: "Campus emergencies — cyber, heat island and local loop",
    summary: "Analog exam, kWh quota, plastic-free canteen. Student BCP on your own machine.",
  },
  "kahn-strategiai-elagazas": {
    title: "Herman Kahn decision fork and spread model",
    summary:
      "Not a forecast — a range. Decision nodes, three paths and a capital-protection bound to protect the core plant. DEMO 11, local data.",
  },
};

export function supportCopy(locale: Locale) {
  return locale === "en" ? en : hu;
}

export function supportTips(locale: Locale) {
  return locale === "en" ? TIPS_EN : TIPS;
}

export function supportFaqSections(locale: Locale): FaqSection[] {
  return toFaqSection(locale);
}

/** Lapos lista kereséshez / visszamenőleges használathoz. */
export function supportFaq(locale: Locale): FaqItem[] {
  return supportFaqSections(locale).flatMap((s) => s.items);
}
export function supportKahn(locale: Locale) {
  return locale === "en" ? KAHN_EN : KAHN_BONBON;
}

export function supportLessons(locale: Locale): Lesson[] {
  if (locale !== "en") return LESSONS;
  return LESSONS.map((l) => ({ ...l, ...(LESSON_EN[l.slug] ?? {}) }));
}

export function supportTheory(locale: Locale): Lesson[] {
  if (locale !== "en") return THEORY_LESSONS;
  return THEORY_LESSONS.map((l) => {
    const extra = THEORY_EN[l.slug];
    return extra ? { ...l, title: extra.title, summary: extra.summary } : l;
  });
}

export function localizeLesson(locale: Locale, lesson: Lesson): Lesson {
  if (locale !== "en") return lesson;
  const short = LESSON_EN[lesson.slug];
  if (short) return { ...lesson, ...short };
  const theory = THEORY_EN[lesson.slug];
  if (theory) return { ...lesson, title: theory.title, summary: theory.summary };
  return lesson;
}

export type SupportPricingTier = {
  id: "basic" | "pro" | "enterprise";
  title: string;
  priceLine: string;
  ladder: string;
  /** Részletes, horgonyhoz tartozó leírás (SSOT). */
  detail: string;
  bullets: string[];
};

export function supportPricingTiers(locale: Locale): SupportPricingTier[] {
  if (locale === "en") {
    return [
      {
        id: "basic",
        title: "Basic",
        priceLine: "€199 year 1 — one-time entry (net list)",
        ladder: "See #tiered-loyalty · Y2 €149 (−25%) · Y3 €119 (−40%) · Y4+ free updates for life",
        detail:
          "Basic is for one decision-maker: one concurrently active Case, three active slots, one editor seat and one guest. Master data, manual entry, file import (CSV, XML) and personal wealth. It starts at once in the browser. Inactive data can be overwritten freely. Computation stays on your device — no cloud database.",
        bullets: [
          "1 Active Case · 3 Active Slots · 1 Seat + 1 Guest",
          "Unlimited overwrite of inactive slots — no archive fee",
          "Three outcome paths (pessimistic / realistic / optimistic) locally",
        ],
      },
      {
        id: "pro",
        title: "Pro (Recommended)",
        priceLine: "€399 year 1 — one-time entry (net list)",
        ladder: "See #tiered-loyalty · Y2 €299 (−25%) · Y3 €239 (−40%) · Y4+ free updates for life",
        detail:
          "Pro adds a second parallel Active Case, business and project slots, custom rules, a watched folder, and local CSV/XML import — see #local-import. Import stays on your machine. You work in the browser now. Desktop early access comes spring 2027, free with Pro — not a condition of today’s purchase. Capacity is still concurrent-active only; extras are perpetual add-ons.",
        bullets: [
          "2 Active Cases · 3 Active Slots each · 1 Seat + 5 Guests",
          "Local CSV/XML import, watched folder, own rules — on your machine",
          "Pro Desktop early access · spring 2027 · free with Pro",
          "Extra Active Case add-on: +€49 perpetual",
        ],
      },
      {
        id: "enterprise",
        title: "Enterprise & Teams",
        priceLine: "€799 year 1 — one-time entry (net list)",
        ladder: "See #tiered-loyalty · Y2 €599 (−25%) · Y3 €479 (−40%) · Y4+ free updates for life",
        detail:
          "Enterprise covers team seats, several parallel Active Cases, local accounting/bank import (CSV, XML) and optional local intake (#local-import). Import stays on your machine. Enterprise Desktop is an add-on in preparation and does not stop the web Case/Slot launch. The plan comes later — no self-serve checkout; ask for a quote.",
        bullets: [
          "5 Active Cases · 4 Active Slots each · 3 Seats + 20 Guests",
          "Automated accounting/bank-statement import + Sensor / Edge data feed",
          "Enterprise Desktop: add-on module / in preparation — does not block the web launch",
          "Add-ons: Case · Slot · Seat · Edge (perpetual modules)",
        ],
      },
    ];
  }
  return [
    {
      id: "basic",
      title: "Basic",
      priceLine: "199 000 Ft az 1. évben — egyszeri belépő (nettó listaár)",
      ladder: "Lásd #tiered-loyalty · 2. év 149 000 Ft (−25%) · 3. év 119 000 Ft (−40%) · 4. évtől örökélet frissítés",
      detail:
        "Basic egy döntéshozónak: egyidejűleg egy Aktív Case, három aktív slot, egy szerkesztő és egy vendég. Törzsadat, kézi rögzítés, fájl-import (CSV, XML) és magánvagyon. Azonnal a böngészőben indul. Az inaktív adat szabadon felülírható. A számítás a saját gépeden marad — nincs felhős adatbázis.",
      bullets: [
        "1 Aktív Case · 3 Aktív Slot · 1 Seat + 1 Guest",
        "Inaktív slot korlátlan felülírása — nincs archív díj",
        "Három kimeneti pálya (pesszimista / realista / optimista) helyben",
      ],
    },
    {
      id: "pro",
      title: "Pro (Ajánlott)",
      priceLine: "399 000 Ft az 1. évben — egyszeri belépő (nettó listaár)",
      ladder: "Lásd #tiered-loyalty · 2. év 299 000 Ft (−25%) · 3. év 239 000 Ft (−40%) · 4. évtől örökélet frissítés",
      detail:
        "A Pro második párhuzamos Aktív Case-t, vállalkozást és projektet, saját szabályt, figyelt mappát és helyi CSV/XML importot ad — lásd #local-import. Az import a gépeden marad. Most a böngészőben dolgozol. Az asztali early access 2027 tavaszán jön, ingyen a Pro mellé — nem a mostani vásárlás feltétele. A keret továbbra is az egyidejűleg nyitott asztalokra és fülekre vonatkozik; a bővítők örökös modulok.",
      bullets: [
        "2 Aktív Case · 3 Aktív Slot / Case · 1 Seat + 5 Guest",
        "Helyi CSV/XML import, figyelt mappa, saját szabály — a gépeden",
        "Pro Desktop early access · 2027 tavasz · ingyen a Pro mellé",
        "Extra Aktív Case modul: +49 000 Ft örökös",
      ],
    },
    {
      id: "enterprise",
      title: "Enterprise & Csapatok",
      priceLine: "799 000 Ft az 1. évben — egyszeri belépő (nettó listaár)",
      ladder: "Lásd #tiered-loyalty · 2. év 599 000 Ft (−25%) · 3. év 479 000 Ft (−40%) · 4. évtől örökélet frissítés",
      detail:
        "Az Enterprise csapathelyeket, több párhuzamos Aktív Case-t, helyi könyvelési/bankkivonat importot (CSV, XML) és opcionális helyi bekötést ad (#local-import). Az import a gépeden marad. Az Enterprise Desktop bővítő modul készül; a webes Case/Slot indítást nem állítja meg. A csomag később jön — nincs önkiszolgáló checkout, írj ajánlatért.",
      bullets: [
        "5 Aktív Case · 4 Aktív Slot / Case · 3 Seat + 20 Guest",
        "Automatizált könyvelési/bankkivonat import + Szenzoros / Edge adatgyűjtő bekötés",
        "Enterprise Desktop: Bővítő modul / Előkészítés alatt — a webes indítást nem érinti",
        "Bővítők: Case · Slot · Seat · Edge (örökös modulok)",
      ],
    },
  ];
}
