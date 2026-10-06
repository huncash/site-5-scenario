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
  send: "Jegy küldése",
  ticketSent: "Köszönjük. A jegyet rögzítettük — külső levelező nem nyílik. Írásban válaszolunk 24 órán belül.",
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
    "A Basic és a Pro verzió közvetlenül a te számítógépeden, a böngésződben fut. Minden adat helyben marad, külső felhős adatbázist nem használunk. Az alábbiakban részletesen bemutatjuk a csomagok kapacitásait, a kedvezményes hűségmodellt és a helyi adatkezelés elveit. Az asztali alkalmazás korai hozzáférése 2027 tavaszán érkezik, amelyet a Pro csomag tulajdonosai ingyenesen megkapnak.",
  pricingTocPlans: "Csomagok",
  pricingTocModels: "Modellek",
  pricingTocLoyalty: "Hűségmodell",
  pricingTocActive: "Aktív munkaterületek",
  pricingTocLocal: "Lokális import",
  pricingTocWorkflow: "Működési elv",
  pricingTocRoadmap: "Ütemezés",
  pricingTocDesktop: "Pro Desktop",
  pricingTocBcp: "Működésfolytonosság",
  pricingTocEducation: "Oktatási motor",
  pricingRoadmapTitle: "Asztali alkalmazás és speciális motorok",
  pricingRoadmapLead:
    "A gazdasági szcenárió motor a böngésződben, a saját gépeden fut. Az asztali kliens és a nem-gazdasági motorok külön ütemezéssel készülnek — a webes Case és Slot ettől nem áll meg.",
  pricingRoadmapDesktopTitle: "Pro Desktop",
  pricingRoadmapDesktopWhen: "Terv szerint • Várható érkezés: 2027. I. negyedév vége / II. negyedév eleje",
  pricingRoadmapDesktopBody:
    "A webes Case és Slot a Pro kerettel azonnal él. Az asztali early access ingyenes bónusz a Pro mellé, nem a mostani vásárlás feltétele. Addig a böngésző a munkahely.",
  pricingRoadmapBcpTitle: "Működésfolytonosság & reziliencia (BCP)",
  pricingRoadmapBcpWhen: "Tesztelés alatt • Várható érkezés: 2027. I. negyedév",
  pricingRoadmapBcpBody:
    "Vállalati és közösségi felkészültség váratlan leállásokra: a vészhelyzeti szcenáriók vizsgálata azért izgalmas a motorunk számára, mert stresszhelyzetben a láncolatos döntések és a „mi lenne, ha” ágak hatásai olyan komplex összefüggéseket rajzolnak ki, amelyek szemléltetik, hogy egyetlen elhibázott lépés hogyan rántja magával a vállalkozás többi pillérét.",
  pricingRoadmapEducationTitle: "Oktatási szcenárió motor",
  pricingRoadmapEducationWhen: "Tesztelés alatt • Várható érkezés: 2027. I. negyedév",
  pricingRoadmapEducationBody:
    "Nem egy statikus oktatási környezetet szimulálunk, hanem fordítva: valódi, kritikus döntési helyzetek szimulációjával tanítunk meg gondolkodni, ahol a lépéseknek és stratégiáknak azonnali, mérhető következményei vannak a rendszerben. A nyilvános indítás a tesztelés lezárása után várható.",
  pricingAddonStatus:
    "Ez a modul most nem indítható. Előkészítés alatt áll, és megvásárolható bővítőként. További részletek a támogatási, míg a vásárlási folyamat a számlázási aloldalunkon található.",
  pricingAddonBuy: "Vásárlás a számlázáson",
  pricingLoyaltyTitle: "Hároméves lépcsőzetes hűségmodell",
  pricingLoyaltyYears: [
    "1. év: A belépő listaár 100%-a egyszeri vásárlásként — a megvásárolt verzió véglegesen a tiéd marad.",
    "2. év: Kedvezményes frissítési díj (−25%).",
    "3. év: Kedvezményes frissítési díj (−40%).",
    "4. évtől: Minden jövőbeni frissítés teljesen díjmentes.",
  ],
  pricingLoyaltyBody:
    "Ha úgy döntesz, hogy nem élsz a frissítési lehetőséggel, a korábban megvásárolt verzió korlátozás nélkül továbbra is használható marad; frissítési díjat kizárólag akkor szükséges fizetni, ha a jövőbeli új motorverziók újdonságait is szeretnéd elérni.",
  pricingActiveTitle: "Párhuzamos asztalok és fülek (Aktív Case & Slot)",
  pricingActiveBody:
    "A licenc az egyidejűleg éles, vagyis párhuzamosan futó munkaterületek számához kötődik, nem pedig a rendszerben felhalmozott, archív adatok mennyiségéhez. A régebbi vagy inaktív esetek és slotok bármikor szabadon törölhetők, felülírhatók vagy újratölthetők extra költségek nélkül. Fizetni kizárólag abban az esetben kell, ha egyszerre több párhuzamos éles munkaterületet szeretnél nyitva tartani (ehhez külön örökös bővítőmodulok állnak rendelkezésre).",
  pricingLocalTitle: "Lokális bankkivonat-import és Edge",
  pricingLocalBody:
    "A bankkivonatok (CSV, XML formátumban) kizárólag a saját gépeden, a Mesh Data Manager kerete között dolgozódnak fel — kézi feltöltéssel, vagy a Pro csomagban egy általad megadott figyelt mappából. Nincs kötelező felhőkapcsolat, nincs külső szerveren tárolt adatbázis. A fejlesztők soha nem látják és nem gyűjtik a pénzügyi adataidat se. Az opcionális helyi bekötések szintén nálad maradnak, semmilyen használati statisztikát nem küldünk vissza. A megvásárolt motor a te hardvereden él és dolgozik.",
  pricingWorkflowTitle: "Így működik a gyakorlatban",
  pricingWorkflowBody:
    "A folyamat logikus lépésekből épül fel. Első lépésként rögzíted a törzsadatokat: a profilodat, a magánvagyontárgyakat és az ingatlanokat, amelyek titkosítva, kizárólag helyben tárolódnak. Ezt követően érkezik meg a bankkivonat a Mesh Data Managerbe: a Basic csomagban kézi CSV vagy XML fájlformátumban, a Pro csomagban pedig figyelt mappából és saját szabályok alapján. A helyzetkép ekkor áll össze: a tételek a megadott szabályok szerint a megfelelő kategóriákba rendeződnek.",
  pricingWorkflowBody2:
    "Futtatsz, ellenőrzöl, beavatkozol. A pontatlan beolvasást kézzel igazítod ki — ez a te egyéni preferenciáid finomhangolása, nem pedig mesterséges intelligencia tanítása. A magánélet pénzügyei mellett a vállalkozás és a projektek slotjai egyaránt biztonságosan helyet kapnak a helyi műszerfalon.",
  pricingOrder: "Megrendelem",
  pricingEnterpriseBadge: "Későbbi időpontban érhető el",
  pricingEnterpriseCta: "Kapcsolatfelvétel / Ajánlatkérés",
  pricingEnterpriseInquiryLead:
    "Az Enterprise csomag egyedi egyeztetést igényel. Nincs önkiszolgáló checkout.",
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
  send: "Send ticket",
  ticketSent: "Thank you. The ticket is recorded — no external mail app opens. We reply in writing within 24 hours.",
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
    "Basic and Pro run directly on your computer, in your browser. All data stays local; we do not use an external cloud database. Below we set out plan capacity, the loyalty discount model, and the principles of local data handling. Desktop early access arrives in spring 2027, free for Pro owners.",
  pricingTocPlans: "Plans",
  pricingTocModels: "Models",
  pricingTocLoyalty: "Loyalty model",
  pricingTocActive: "Active workspaces",
  pricingTocLocal: "Local import",
  pricingTocWorkflow: "How it works",
  pricingTocRoadmap: "Roadmap",
  pricingTocDesktop: "Pro Desktop",
  pricingTocBcp: "Continuity",
  pricingTocEducation: "Education engine",
  pricingRoadmapTitle: "Desktop app and special engines",
  pricingRoadmapLead:
    "The economic scenario engine runs in your browser, on your machine. The desktop client and the non-economic engines follow a separate schedule — web Case and Slot do not wait.",
  pricingRoadmapDesktopTitle: "Pro Desktop",
  pricingRoadmapDesktopWhen: "Planned • Expected arrival: late Q1 / early Q2 2027",
  pricingRoadmapDesktopBody:
    "Web Case and Slot with the Pro plan are live at once. Desktop early access is a free bonus with Pro, not a condition of today’s purchase. Until then the browser is the workplace.",
  pricingRoadmapBcpTitle: "Business continuity & resilience (BCP)",
  pricingRoadmapBcpWhen: "In testing • Expected arrival: Q1 2027",
  pricingRoadmapBcpBody:
    "Corporate and community readiness for unexpected stoppages: examining emergency scenarios is compelling for our engine, because under stress the chain of decisions and the effects of “what if” branches draw out complex relations that show how a single misstep can pull the rest of the enterprise with it.",
  pricingRoadmapEducationTitle: "Education scenario engine",
  pricingRoadmapEducationWhen: "In testing • Expected arrival: Q1 2027",
  pricingRoadmapEducationBody:
    "We do not simulate a static classroom. Quite the reverse: we teach people to think through genuine, critical decision situations, where steps and strategies have immediate, measurable consequences in the system. Public launch follows the close of testing.",
  pricingAddonStatus:
    "This module cannot be started now. It is in preparation, and can be purchased as an add-on. Further details are on the support page, while the purchase process is on billing.",
  pricingAddonBuy: "Purchase on billing",
  pricingLoyaltyTitle: "Three-year tiered loyalty model",
  pricingLoyaltyYears: [
    "Year 1: 100% of the entry list price as a one-time purchase — the purchased version stays yours permanently.",
    "Year 2: discounted update fee (−25%).",
    "Year 3: discounted update fee (−40%).",
    "From year 4: every future update is free.",
  ],
  pricingLoyaltyBody:
    "If you choose not to take the update, the version you already bought remains fully usable; you pay an update fee only if you also want the new engine versions.",
  pricingActiveTitle: "Parallel desks and tabs (Active Case & Slot)",
  pricingActiveBody:
    "The license is tied to how many workspaces run live at the same time — not to how much archive data you keep. Older or inactive cases and slots can be deleted, overwritten or reloaded at any time with no extra charge. You pay only if you want several live workspaces open in parallel (perpetual add-on modules cover that).",
  pricingLocalTitle: "Local bank-statement import and Edge",
  pricingLocalBody:
    "Bank statements (CSV, XML) are processed only on your own machine, inside Mesh Data Manager — by hand, or on Pro from a watched folder you choose. No required cloud link, no database stored on an external server. Developers never see or collect your financial data either. Optional local hook-ups also stay with you; we send back no usage statistics. The purchased engine lives and works on your hardware.",
  pricingWorkflowTitle: "How it works in practice",
  pricingWorkflowBody:
    "The sequence is a set of clear steps. First you record master data: your profile, personal assets and property, stored encrypted and only locally. Then the bank statement arrives in Mesh Data Manager: on Basic as a hand-chosen CSV or XML file, on Pro from a watched folder and your own rules. That is when the picture comes together: lines fall into the right categories under the rules you set.",
  pricingWorkflowBody2:
    "You run, check, and act. You correct a bad read by hand — that is fine-tuning your own preferences, not training an artificial intelligence. Beside the finances of private life, business and project slots all sit safely on the local dashboard.",
  pricingOrder: "Order",
  pricingEnterpriseBadge: "Available at a later date",
  pricingEnterpriseCta: "Contact / request a quote",
  pricingEnterpriseInquiryLead:
    "The Enterprise plan needs a conversation. There is no self-serve checkout.",
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
        title: "Basic plan",
        priceLine: "€199 in year 1 — one-time net list entry.",
        ladder:
          "On the loyalty model: year 2 €149 (−25%), year 3 €119 (−40%), and from year 4 updates for life.",
        detail:
          "The Basic plan is designed for a single decision-maker: one concurrently active case, three active slots, plus one editor and one guest. It includes full master-data handling, manual entry, file import (CSV, XML) and personal-wealth tracking. The app starts at once in your browser. Inactive data may be overwritten without limit, and all computation runs entirely on your own machine.",
        bullets: [
          "1 active case · 3 active slots · 1 editor and 1 guest",
          "Unlimited overwrite of inactive slots — no archive fees",
          "Three outcome paths (pessimistic, realistic, optimistic) processed locally",
        ],
      },
      {
        id: "pro",
        title: "Pro plan (Recommended)",
        priceLine: "€399 in year 1 — one-time net list entry.",
        ladder:
          "On the loyalty model: year 2 €299 (−25%), year 3 €239 (−40%), and from year 4 updates for life.",
        detail:
          "The Pro plan already covers a second parallel active case, business and project slots, editing your own rules, watched-folder sync and local CSV/XML import. Processing stays on your machine throughout. The Pro Desktop early-access build arriving in spring 2027 is free with Pro, and is not a condition of using the web app today. The frame applies to desks and tabs open at the same time; extras remain perpetual modules.",
        bullets: [
          "2 active cases · 3 active slots per case · 1 editor and 5 guests",
          "Local CSV/XML import, watched folder and your own rules on your machine",
          "Pro Desktop early access in spring 2027, free with Pro",
          "Extra active-case module: +€49 (yours for life)",
          "Support: Standard level",
        ],
      },
      {
        id: "enterprise",
        title: "Enterprise & Teams",
        priceLine: "€799 in year 1 — one-time net list entry.",
        ladder:
          "On the loyalty model: year 2 €599 (−25%), year 3 €479 (−40%), and from year 4 updates for life.",
        detail:
          "The Enterprise plan provides team seats, several parallel active cases, automated accounting and bank-statement import (CSV, XML), and optional local sensor or Edge intake. Imported data stays closed on your machine. The Enterprise Desktop add-on is in preparation and does not affect launching existing web cases and slots. Because this plan needs a conversation, there is no self-serve checkout — please contact us for a quote.",
        bullets: [
          "5 active cases · 4 active slots per case · 3 editors and 20 guests",
          "Automated accounting/bank-statement import and sensor/Edge intake",
          "Enterprise Desktop add-on in preparation",
          "Modular extras: case, slot, editor, Edge",
          "Support: Priority level",
        ],
      },
    ];
  }
  return [
    {
      id: "basic",
      title: "Basic csomag",
      priceLine: "199 000 Ft az 1. évben — egyszeri, nettó listaáras belépő.",
      ladder:
        "A hűségmodell alapján: 2. év 149 000 Ft (−25%), 3. év 119 000 Ft (−40%), a 4. évtől pedig örökéletű frissítés jár.",
      detail:
        "A Basic csomagot egyetlen döntéshozónak terveztük: egyidejűleg egy aktív esetet, három aktív slotot, valamint egy szerkesztői és egy vendég hozzáférést biztosít. Tartalmazza a teljes törzsadatkezelést, a kézi rögzítést, a fájl-alapú importot (CSV, XML) és a magánvagyon nyomon követését. Az alkalmazás azonnal elindul a böngésződben. Az inaktív adatok korlátozás nélkül, szabadon felülírhatók, a számítások pedig teljes egészében a saját gépeden futnak le.",
      bullets: [
        "1 aktív eset · 3 aktív slot · 1 szerkesztő és 1 vendég hozzáférés",
        "Az inaktív slotok korlátlan felülírása — archív díjak nélkül",
        "Három kimeneti pálya (pesszimista, realista, optimista) helyi feldolgozásban",
      ],
    },
    {
      id: "pro",
      title: "Pro csomag (Ajánlott)",
      priceLine: "399 000 Ft az 1. évben — egyszeri, nettó listaáras belépő.",
      ladder:
        "A hűségmodell alapján: 2. év 299 000 Ft (−25%), 3. év 239 000 Ft (−40%), a 4. évtől pedig örökéletű frissítés jár.",
      detail:
        "A Pro csomag már a második párhuzamos aktív esetet, a vállalkozási és projektslotokat, a saját szabályok szerkesztését, a figyelt mappás szinkront és a helyi CSV/XML importot is biztosítja. Az adatok feldolgozása mindvégig a te gépeden történik. A 2027 tavaszán érkező Pro Desktop early access változat ingyenesen jár a Pro csomag mellé, de ez nem feltétele a jelenlegi webes használatnak. A keretrendszer az egyidejűleg nyitott asztalokra és fülekre vonatkozik; a bővítők örökös modulok maradnak.",
      bullets: [
        "2 aktív eset · 3 aktív slot esetenként · 1 szerkesztő és 5 vendég hozzáférés",
        "Helyi CSV/XML import, figyelt mappa és saját szabályok a gépeden",
        "Pro Desktop early access 2027 tavaszán, a Pro csomag mellé ingyen",
        "Extra aktív eset modul: +49 000 Ft (örökös tulajdon)",
        "Támogatás: Standard szint",
      ],
    },
    {
      id: "enterprise",
      title: "Enterprise & Csapatok",
      priceLine: "799 000 Ft az 1. évben — egyszeri, nettó listaáras belépő.",
      ladder:
        "A hűségmodell alapján: 2. év 599 000 Ft (−25%), 3. év 479 000 Ft (−40%), a 4. évtől pedig örökéletű frissítés jár.",
      detail:
        "Az Enterprise csomag csapathelyeket, több párhuzamos aktív esetet, automatizált könyvelési és bankkivonat-importot (CSV, XML), valamint opcionális helyi érzékelő- vagy Edge-bekötést nyújt. Az importált adatok zártan a gépeden maradnak. Az Enterprise Desktop bővítő modul előkészítés alatt áll, de ez nem befolyásolja a meglévő webes esetek és slotok indítását. Mivel ez a csomag egyedi egyeztetést igényel, nincs önkiszolgáló checkout — kérjük, vedd fel velünk a kapcsolatot az ajánlatért.",
      bullets: [
        "5 aktív eset · 4 aktív slot esetenként · 3 szerkesztő és 20 vendég hozzáférés",
        "Automatizált könyvelési/bankkivonat import és szenzoros/Edge adatgyűjtő bekötés",
        "Enterprise Desktop bővítő modul előkészítés alatt",
        "Moduláris bővítési lehetőségek: eset, slot, szerkesztő, Edge",
        "Támogatás: Priority szint",
      ],
    },
  ];
}
