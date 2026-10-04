import communityMd from "../content/lessons/01-kozossegi-civil-valsagkezeles.md?raw";
import householdMd from "../content/lessons/02-maganszemely-infrastruktura.md?raw";
import bcpMd from "../content/lessons/03-vallalati-bcp.md?raw";
import tfrMd from "../content/lessons/04-demografiai-implozio.md?raw";
import campusMd from "../content/lessons/05-oktatasi-campus.md?raw";
import kahnMd from "../content/lessons/06-kahn-strategiai-elagazas.md?raw";

export const SUPPORT_MAIL = "support@szcenario.hu";
export const SUPPORT_SLA =
  "Átlagos válaszadási idő: 24 órán belül, kizárólag írásban a pontosabb és gyorsabb ügyintézés érdekében.";

export type Lesson = {
  slug: string;
  title: string;
  body: string;
  summary?: string;
  youtubeId?: string;
  kbId?: string;
  markdown?: boolean;
};

function yt(key: string, fallback = "M7lc1UVf-VE") {
  const env = (import.meta as { env?: Record<string, string> }).env ?? {};
  return env[key] || fallback;
}

export const LESSONS: Lesson[] = [
  {
    slug: "lecke-01",
    title: "Mintahelyzet",
    body: "Előre betöltött példa. Nem banki kivonat, nem élő ügyféladat. A számok a böngészőben készülnek.",
    youtubeId: yt("VITE_YT_LECKE_01"),
  },
  {
    slug: "lecke-02",
    title: "Három sáv",
    body: "Felső vezérlés, középen a munka, alul a modulok. A fülek a Slot / Munkateret cserélik.",
    youtubeId: yt("VITE_YT_LECKE_02"),
  },
  {
    slug: "lecke-03",
    title: "PDCA",
    body: "PLAN → DO → CHECK → ACT. A tárcsa a következő fázispárra fordít.",
    youtubeId: yt("VITE_YT_LECKE_03"),
  },
  {
    slug: "lecke-04",
    title: "Gyorsbillentyűk",
    body: "A billentyűzet-ikon a lista. Mentés: Ctrl/Cmd+S.",
    youtubeId: yt("VITE_YT_LECKE_04"),
  },
  {
    slug: "lecke-05",
    title: "Slot / Munkaterek",
    body: "Egy Eseten belül a Magán, Vállalkozás és Projekt külön Slot. A felső fülek ezeket cserélik; mindegyikben fut a P-R-O Szcenárió.",
    youtubeId: yt("VITE_YT_LECKE_05"),
  },
  {
    slug: "lecke-06",
    title: "Főmenü",
    body: "Mentés, GYIK és kilépés a három vonal mögött van. Nincs telefonos ügyintézés.",
    youtubeId: yt("VITE_YT_LECKE_06"),
  },
];

export const THEORY_LESSONS: Lesson[] = [
  {
    slug: "kozossegi-civil-valsagkezeles",
    kbId: "lesson-community",
    title: "Kisközösségi válságkezelés — víz, LoRa mesh és közösségi melegedő",
    summary: "Lajtoskocsi, offline LoRa és téli melegedő. Liter, óra, lefedett utca — local-first.",
    body: communityMd,
    markdown: true,
  },
  {
    slug: "maganszemely-infrastruktura-korlatozas",
    kbId: "lesson-household",
    title: "Magánemberként a kiesésben — 72 órás blackout, víz és mobilnet",
    summary: "Háztartási tartalék: Wh, szűrési lánc, papírtérkép és PMR. Ugyanaz a motor, kisebb lépték.",
    body: householdMd,
    markdown: true,
  },
  {
    slug: "vallalati-bcp-folytonossag",
    kbId: "lesson-bcp",
    title: "Vállalati BCP — SaaS-kiesés, ellátási lánc és kulcsmunkatárs-hiány",
    summary: "Local-first élesítés, lean kvóta, keresztképzési mátrix. TTR órában, nem „amint lehet”.",
    body: bcpMd,
    markdown: true,
  },
  {
    slug: "demografiai-implozio-tfr-matrix",
    kbId: "lesson-demography",
    title: "Demográfiai implózió — TFR-mátrix Koreától Magyarországig",
    summary: "KR, CN, IT, JP, HU: rés a 2,1-hez, kezelési pálya. Strukturális foresight, helyi másolat.",
    body: tfrMd,
    markdown: true,
  },
  {
    slug: "oktatasi-campus-valsaghelyzet",
    kbId: "lesson-campus",
    title: "Oktatási válsághelyzetek — kiber, hősziget és helyi körforgás",
    summary: "Analóg vizsga, kWh-kvóta, műanyagmentes menza. Hallgatói BCP a saját gépen.",
    body: campusMd,
    markdown: true,
  },
  {
    slug: "kahn-strategiai-elagazas",
    kbId: "lesson-kahn",
    title: "Herman Kahn döntési elágazás & szórásmodell (P-R-O)",
    summary:
      "Nem jóslat — tartomány. Elágazási pontok, P–R–O sávok és Stop-Loss a cégtörzs védelmére. DEMO 11, local-first.",
    body: kahnMd,
    markdown: true,
  },
];

export const ALL_LESSONS: Lesson[] = [...LESSONS, ...THEORY_LESSONS];

export function lessonBySlug(slug: string) {
  return ALL_LESSONS.find((l) => l.slug === slug) ?? THEORY_LESSONS.find((l) => l.kbId === slug) ?? null;
}

export const KAHN_BONBON = {
  eyebrow: "Tudástár · P-R-O szórásmodell",
  title: "Herman Kahn döntési elágazás & szórásmodell",
  p1: "Nem jóslat, hanem tartomány: kritikus elágazási pontok (1–2. forduló) és három egyidejűleg futó kimenet — Pesszimista, Realista, Optimista.",
  p2: "Stop-Loss a pesszimista sávon védi a Core üzemet. Teljes lecke: döntési fa, finanszírozási konstrukció, Cash Runway. DEMO 11, local-first.",
  foot: "Local-first · nincs felhő-adat · nincs használatküldés",
} as const;

export const TIPS = [
  { q: "Hol vannak az adataim?", a: "A saját eszközödön, IndexedDB-ben. A VPS nem tárol szcenáriót." },
  { q: "Van telefonos support?", a: "Nincs. Kizárólag írásban, jeggyel." },
  { q: "Mennyi a válaszidő?", a: "Átlagosan 24 órán belül, írásban." },
  { q: "Hol a videó?", a: "YouTube-on. A saját szerver nem tárol videófájlt." },
  {
    q: "A PRO-grafikon a jövőt mutatja?",
    a: "Nem. Nem valóság és nem jóslat: a múlt adataidból a lehetséges kimenetelek szórását és a mozgásteret számolja.",
  },
];

export type FaqItem = { q: string; a: string; id?: string };
export type FaqSection = { category: string; items: FaqItem[] };

/** Általános GYIK (a fogalom-szekció a `conceptFaq` forrásból jön a copy rétegben). */
export const FAQ_GENERAL: FaqItem[] = [
  { q: "Regisztráció kell?", a: "Nem. A helyi profil a készülékeden marad." },
  { q: "Miért nincs telefonszám?", a: "A pontosabb ügyintézéshez írásos jegy kell — nincs telefonos sor." },
  { q: "Hol kérek segítséget?", a: "Először a GYIK és a tudásbázis. Ha nincs válasz, a „Nem találtam választ” gombbal nyílik a jegy — előtte egy ellenőrző lépés." },
  { q: "Működik offline?", a: "Az app igen. A support iframe hálózatot kér; offline a helyi súgó marad." },
  {
    q: "Miért hívják Szcenáriónak — ez több, mint egy jó és egy rossz év?",
    a: "Igen, sokkal több. A „jó év / rossz év” csak két statikus szám egy táblázat alján. A Szcenárió viszont egy élő forgatókönyv: megmutatja a döntéseid láncreakcióját és pontos időzítését. Nem azt találgatja, mi lesz év végén, hanem megmutatja, hogy egy váratlan kiadás vagy kieső bevétel pontosan melyik hónapban és napon éri el a kritikus biztonsági határodat — így nem utólag reagálsz, hanem előre látod a mozgásteredet.",
  },
  {
    q: "Hogyan értelmezzük a Pesszimista – Realista – Optimista (PRO) grafikont?",
    a: "Nem a valóságot és nem jóslatot látsz. A modell a múltbeli adataidból, szezonális mintákból és a beállított paraméterekből rajzol mozgásteret: szórási hibát csökkent, és megmutatja a pesszimista tartalékot vs. az optimista kapacitásigényt.",
  },
];

/** @deprecated használjuk a `supportFaqSections` / `FAQ_GENERAL` párost */
export const FAQ = FAQ_GENERAL;
