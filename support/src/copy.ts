import type { Locale } from "@/i18n/locale";
import { FAQ, KAHN_BONBON, LESSONS, SUPPORT_SLA, THEORY_LESSONS, TIPS, type Lesson } from "./content";

const hu = {
  brand: "Szcenárió · support",
  homeTitle: "Szcenárió support",
  homeLead: "Három réteg: tippek, GYIK, írásos jegy. Nincs telefonos ügyintézés.",
  tips: "Tippek",
  faq: "GYIK",
  faqTitle: "Gyakran Ismételt Kérdések",
  ticket: "Jegy",
  ticketTitle: "Írásos ügyintézés",
  ticketHome: "Írásos jegy",
  lessons: "Tudástár — szcenárió-leckék",
  lessonsNote: "Részletes elmélet és know-how. A számítás a saját gépeden fut — nincs felhő-adat.",
  name: "Név",
  email: "E-mail",
  subject: "Tárgy",
  message: "Üzenet",
  send: "Jegy küldése e-mailben",
  mailSubject: "Szcenárió jegy",
  mailName: "Név",
  noLesson: "Nincs ilyen lecke",
  backTips: "Vissza a tippekhez",
  help: "Súgó",
  helpBody: "A fogalom a helyi appban is ott van. Részletes lecke a YouTube-on, nem a VPS-en.",
  noVideo: "A lecke videója YouTube-on jelenik meg. A saját szerver nem tárol és nem szolgál ki videófájlt.",
  sla: SUPPORT_SLA,
};

const en: typeof hu = {
  brand: "Szcenárió · support",
  homeTitle: "Szcenárió support",
  homeLead: "Three layers: tips, FAQ, written ticket. No phone desk.",
  tips: "Tips",
  faq: "FAQ",
  faqTitle: "Frequently Asked Questions",
  ticket: "Ticket",
  ticketTitle: "Written support",
  ticketHome: "Written ticket",
  lessons: "Knowledge — scenario lessons",
  lessonsNote: "Theory and know-how. Computation runs on your device — no cloud data.",
  name: "Name",
  email: "E-mail",
  subject: "Subject",
  message: "Message",
  send: "Send ticket by e-mail",
  mailSubject: "Szcenárió ticket",
  mailName: "Name",
  noLesson: "No such lesson",
  backTips: "Back to tips",
  help: "Help",
  helpBody: "The term is also in the local app. The full lesson is on YouTube, not on the VPS.",
  noVideo: "The lesson video appears on YouTube. This server does not store or serve video files.",
  sla: "Average reply within 24 hours, in writing only — faster and more precise than a phone queue.",
};

const TIPS_EN = [
  { q: "Where is my data?", a: "On your device, in IndexedDB. The VPS does not store a scenario." },
  { q: "Is there phone support?", a: "No. Writing only, by ticket." },
  { q: "How fast is the reply?", a: "On average within 24 hours, in writing." },
  { q: "Where is the video?", a: "On YouTube. This server does not store video files." },
  {
    q: "Does the PRO chart show the future?",
    a: "No. Not reality and not a forecast: it computes the spread of possible outcomes and your room to move from past data.",
  },
];

const FAQ_EN = [
  { q: "Do I need to register?", a: "No. The local profile stays on this device." },
  { q: "Why is there no phone number?", a: "Written tickets are more precise — there is no phone queue." },
  { q: "Where do I ask for help?", a: "Layer 3: the written ticket form, by e-mail." },
  { q: "Does it work offline?", a: "The app does. The support iframe needs a network; offline, local help stays." },
  {
    q: "Why is it called Szcenárió — more than a good year and a bad year?",
    a: "Yes. Guessing a “good/bad year” is not enough. Here scenario method runs with Lean tools and spread from past data: a structured outlook, in daily operations too.",
  },
  {
    q: "How to read the Pessimistic – Realistic – Optimistic (PRO) chart?",
    a: "You are not looking at reality or a forecast. The model draws room to move from your past data, seasonal patterns, and set parameters.",
  },
];

const KAHN_EN = {
  eyebrow: "Knowledge · historical template",
  title: "Herman Kahn and the RAND Corporation",
  p1: "Scenario planning is not two guessed years. At RAND in the Cold War, Kahn drew a multi-branch outlook: a fork before you bind the resource.",
  p2: "The same method now carries the Master Baseline trunk: optimistic expansion, realistic hold, pessimistic reserve. The tree runs on your device — local-first, zero telemetry.",
  foot: "Local-first · no cloud data · no usage send",
} as const;

const LESSON_EN: Record<string, { title: string; body: string }> = {
  "lecke-01": {
    title: "Sample case",
    body: "A preloaded example. Not a bank extract, not live client data. The numbers are made in the browser.",
  },
  "lecke-02": {
    title: "Three bands",
    body: "Controls on top, work in the middle, modules below. The tabs swap the workspace.",
  },
  "lecke-03": { title: "PDCA", body: "PLAN → DO → CHECK → ACT. The dial turns to the next phase pair." },
  "lecke-04": { title: "Shortcuts", body: "The keyboard icon opens the list. Save: Ctrl/Cmd+S." },
  "lecke-05": {
    title: "Workspaces",
    body: "Personal, business and project are separate ledgers. The top tabs swap them.",
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
};

export function supportCopy(locale: Locale) {
  return locale === "en" ? en : hu;
}

export function supportTips(locale: Locale) {
  return locale === "en" ? TIPS_EN : TIPS;
}

export function supportFaq(locale: Locale) {
  return locale === "en" ? FAQ_EN : FAQ;
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
