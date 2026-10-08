import { SUPPORT_LESSON_INDEX } from "@/lib/supportRoutes";

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
  path?: string;
  aliases?: string[];
  title: string;
  body: string;
  summary?: string;
  youtubeId?: string;
  kbId?: string;
  markdown?: boolean;
};

function routeMeta(id: string) {
  return SUPPORT_LESSON_INDEX.find((m) => m.id === id || m.path === id) ?? null;
}

function withRoute(lesson: Lesson, id: string): Lesson {
  const meta = routeMeta(id);
  if (!meta) return lesson;
  return {
    ...lesson,
    slug: lesson.slug,
    path: meta.path,
    aliases: [...new Set([meta.id, meta.path, ...meta.aliases])],
    kbId: lesson.kbId ?? meta.kbId,
    summary: lesson.summary ?? meta.summaryHu,
  };
}

function yt(key: string, fallback = "") {
  const env = (import.meta as { env?: Record<string, string> }).env ?? {};
  return env[key] || fallback;
}

export const LESSONS: Lesson[] = [
  withRoute(
    {
      slug: "lecke-01",
      title: "Mintahelyzet",
      body: "Előre betöltött példa. Nem banki kivonat, nem élő ügyféladat. A számok a böngészőben készülnek.",
      youtubeId: yt("VITE_YT_LECKE_01"),
    },
    "lecke-01",
  ),
  withRoute(
    {
      slug: "lecke-02",
      title: "Dashboard kezelés",
      body:
        "Előbb a fül (Magán, Vállalkozás, Projekt), aztán a lombik: a modulok a fejlesztési fán kapcsolhatók. Középen a döntés. 0 hónap = elfogyott a levegő: először a kasszát kell megfogni.",
      youtubeId: yt("VITE_YT_LECKE_02"),
    },
    "lecke-02",
  ),
  withRoute(
    {
      slug: "lecke-want",
      title: "Szükséglet vagy befektetés",
      body:
        "NEED: kötelező működés (rezsi, bér, anyag). WANT: nem kötelező vágy — a havi keret zárolható. INVESTMENT: később termelő kiadás. A cashflow a tényleges be- és kifelé mozgás; az ÁFA tartalékot ne költsd el; a holtpénz ott áll. JIT: először a levegő, utána a persely/játék. 0 hónap = elfogyott a levegő, ACT kell, nem új WANT.",
    },
    "lecke-want",
  ),
  withRoute(
    {
      slug: "lecke-cashflow",
      title: "Cashflow logika",
      body: "Be, ki, zárolás — a mozgás, nem az egyenleg.",
    },
    "lecke-cashflow",
  ),
  withRoute(
    {
      slug: "lecke-03",
      title: "PDCA",
      body: "PLAN → DO → CHECK → ACT. A tárcsa a következő fázispárra fordít.",
      youtubeId: yt("VITE_YT_LECKE_03"),
    },
    "lecke-03",
  ),
  withRoute(
    {
      slug: "lecke-04",
      title: "Gyorsbillentyűk",
      body: "A billentyűzet-ikon a lista. Mentés: Ctrl/Cmd+S.",
      youtubeId: yt("VITE_YT_LECKE_04"),
    },
    "lecke-04",
  ),
  withRoute(
    {
      slug: "lecke-05",
      title: "Slot / Munkaterek",
      body: "Egy Eseten belül a Magán, Vállalkozás és Projekt külön terület. A felső fülek ezeket cserélik; mindegyikben ugyanaz a három jövőkép fut.",
      youtubeId: yt("VITE_YT_LECKE_05"),
    },
    "lecke-05",
  ),
  withRoute(
    {
      slug: "lecke-06",
      title: "Főmenü",
      body: "Mentés, GYIK és kilépés a három vonal mögött van. Nincs telefonos ügyintézés.",
      youtubeId: yt("VITE_YT_LECKE_06"),
    },
    "lecke-06",
  ),
];

export const THEORY_LESSONS: Lesson[] = [
  withRoute(
    {
      slug: "kozossegi-civil-valsagkezeles",
      kbId: "lesson-community",
      title: "Kisközösségi válságkezelés — víz, LoRa mesh és közösségi melegedő",
      summary: "Lajtoskocsi, offline LoRa és téli melegedő. Liter, óra, lefedett utca — local-first.",
      body: communityMd,
      markdown: true,
    },
    "kozossegi-civil-valsagkezeles",
  ),
  withRoute(
    {
      slug: "maganszemely-infrastruktura-korlatozas",
      kbId: "lesson-household",
      title: "Magánemberként a kiesésben — 72 órás blackout, víz és mobilnet",
      summary: "Háztartási tartalék: Wh, szűrési lánc, papírtérkép és PMR. Ugyanaz a motor, kisebb lépték.",
      body: householdMd,
      markdown: true,
    },
    "maganszemely-infrastruktura-korlatozas",
  ),
  withRoute(
    {
      slug: "vallalati-bcp-folytonossag",
      kbId: "lesson-bcp",
      title: "Vállalati BCP — SaaS-kiesés, ellátási lánc és kulcsmunkatárs-hiány",
      summary: "Local-first élesítés, lean kvóta, keresztképzési mátrix. TTR órában, nem „amint lehet”.",
      body: bcpMd,
      markdown: true,
    },
    "vallalati-bcp-folytonossag",
  ),
  withRoute(
    {
      slug: "demografiai-implozio-tfr-matrix",
      kbId: "lesson-demography",
      title: "Demográfiai implózió — TFR-mátrix Koreától Magyarországig",
      summary: "KR, CN, IT, JP, HU: rés a 2,1-hez, kezelési pálya. Strukturális foresight, helyi másolat.",
      body: tfrMd,
      markdown: true,
    },
    "demografiai-implozio-tfr-matrix",
  ),
  withRoute(
    {
      slug: "oktatasi-campus-valsaghelyzet",
      kbId: "lesson-campus",
      title: "Oktatási válsághelyzetek — kiber, hősziget és helyi körforgás",
      summary: "Analóg vizsga, kWh-kvóta, műanyagmentes menza. Hallgatói BCP a saját gépen.",
      body: campusMd,
      markdown: true,
    },
    "oktatasi-campus-valsaghelyzet",
  ),
  withRoute(
    {
      slug: "kahn-strategiai-elagazas",
      kbId: "lesson-kahn",
      title: "Herman Kahn döntési elágazás és szórásmodell",
      summary:
        "Nem jóslat — tartomány. Elágazási pontok, három pálya és tőkevédelmi határ a cégtörzs védelmére. DEMO 11, helyi adat.",
      body: kahnMd,
      markdown: true,
    },
    "kahn-strategiai-elagazas",
  ),
];

export const ALL_LESSONS: Lesson[] = [...LESSONS, ...THEORY_LESSONS];

export function lessonPublicPath(lesson: Lesson): string {
  return lesson.path ?? lesson.slug;
}

export function lessonBySlug(slug: string) {
  const key = slug.replace(/^kb\//, "");
  return (
    ALL_LESSONS.find(
      (l) =>
        l.slug === key ||
        l.path === key ||
        l.kbId === key ||
        l.aliases?.includes(key),
    ) ?? null
  );
}

export const KAHN_BONBON = {
  eyebrow: "Tudástár · három pálya szórásmodell",
  title: "Herman Kahn döntési elágazás & szórásmodell",
  p1: "Nem jóslat, hanem tartomány: kritikus elágazási pontok (1–2. forduló) és három egyidejűleg futó kimenet — Pesszimista, Realista, Optimista.",
  p2: "A tőkevédelmi határ a pesszimista sávon védi a törzsüzemet. Teljes lecke: döntési fa, finanszírozási konstrukció, tartalékhónapok. DEMO 11, helyi adat.",
  foot: "Local-first · nincs felhő-adat · nincs használatküldés",
} as const;

export const TIPS = [
  { q: "Hol vannak az adataim?", a: "A saját eszközödön. A fejlesztők soha nem látják és nem gyűjtik. Mentés fájlba, mint régen egy táblázatot — vagy meghívott vendég." },
  { q: "Van telefonos support?", a: "Nincs. Kizárólag írásban, jeggyel." },
  { q: "Mennyi a válaszidő?", a: "Átlagosan 24 órán belül, írásban." },
  { q: "Hol a videó?", a: "YouTube-on. A saját szerver nem tárol videófájlt." },
  {
    q: "A három pálya grafikonja a jövőt mutatja?",
    a: "Nem. Nem valóság és nem jóslat: a múlt adataidból a lehetséges kimenetelek szórását és a mozgásteret számolja.",
  },
  {
    q: "Hol a Laboratórium?",
    a: "A fejléc lombikja. Ott a fejlesztési fa: motor, modul, gyors mutató. A bogyóra kattintasz, a kép az asztalon jelenik meg.",
  },
  {
    q: "A nyelv megmarad oldalváltáskor?",
    a: "Igen. A fejléc HU / EN gombja a címsorban (lang=hu vagy lang=en) és a gépen is őrzi. Ha egy linkből kiesik, a zár visszaírja.",
  },
];

export const FAQ_CHECKLIST: FaqItem[] = [
  {
    id: "check-modules",
    q: "Hol találom a modulokat?",
    a: "A fejlécben a **lombik** nyitja a Laboratóriumot. Ott, a fejlesztési fán kapcsolhatók a motorok és a modulok: ami kell, a saját asztalodon jelenik meg. A gyors mutatók is ezen a fán vannak — ne a főasztal közepén keresd őket.",
  },
  {
    id: "check-slots",
    q: "Hol a Magán, a Vállalkozás és a Projekt?",
    a: "A fejléc alatt a **fülek**. Egy Eset egy asztal; a fül a Slot — külön kassza. Előbb a fület válaszd, aztán írj tételt. Új fül a **+** gombbal; ha a hely betelt, a bővítés a licenc, nem egy új motor.",
  },
  {
    id: "check-lang",
    q: "Hogyan váltok nyelvet?",
    a: "A fejléc **HU / EN** gombja. A választás a címsorban (`lang=hu` vagy `lang=en`) és ezen a gépen marad — oldalváltás után sem ugrik vissza.",
  },
  {
    id: "check-lang-lost",
    q: "Eltűnt a nyelv, vagy angolra ugrott a felület?",
    a: "Nézd a címsort: legyen benne `lang=hu` vagy `lang=en`. Ha hiányzik, a program visszaírja a mentett választást. Frissítés után is ez a zár tartja a nyelvet.",
  },
  {
    id: "check-lock-ws",
    q: "Hogyan zárom vagy nyitom a munkateret?",
    a: "A profilpanel **lakatja** zárja a helyi tárolót. Előbb ments (Ctrl/Cmd+S), aztán zárd. Nincs felhős kijelentkezés: a modell a gépeden marad. Másik Esethez zárd az aktuálisat.",
  },
  {
    id: "check-save",
    q: "Hogyan mentem vagy állítom vissza az adatot?",
    a: "A **Beállításokban** helyi fájlba menthetsz, és ugyanonnan tölthetsz vissza. Nincs felhős fiók: ami a gépeden van, az a tied. A fejlesztők nem látják és nem gyűjtik.",
  },
  {
    id: "check-lock",
    q: "Miért kér megerősítést, vagy miért tilt egy lépést?",
    a: "Ez a hibabiztos zár: a program megkérdez, mielőtt átírna egy keretet, adókulcsot vagy importot. A nyelv sem vész el csendben. Egy kérdést fogadj el — ne kapcsold ki a zárakat.",
  },
  {
    id: "check-offline",
    q: "Működik hálózat nélkül?",
    a: "Az asztal igen: a számolás a saját eszközödön marad. A support oldal hálózatot kér; offline a helyi súgó és a leckék elérhetők.",
  },
];

export type FaqItem = { q: string; a: string; id?: string };
export type FaqSection = { category: string; items: FaqItem[] };

/** Általános GYIK (a fogalom-szekció a `conceptFaq` forrásból jön a copy rétegben). */
export const FAQ_GENERAL: FaqItem[] = [
  { q: "Regisztráció kell?", a: "Nem. A helyi profil a készülékeden marad. A demók elképzelt minták a motor kipróbálásához." },
  { q: "Miért nincs telefonszám?", a: "A pontosabb ügyintézéshez írásos jegy kell — nincs telefonos sor." },
  { q: "Hol kérek segítséget?", a: "Először a GYIK és a tudásbázis. Ha nincs válasz, a „Nem találtam választ” gombbal nyílik a jegy — előtte egy ellenőrző lépés." },
  { q: "Működik offline?", a: "Az app igen. A support iframe hálózatot kér; offline a helyi súgó marad." },
  {
    q: "Látják a fejlesztők az adataimat?",
    a: "Nem. A Szcenárió a saját eszközödön számol. A kivonat a Mesh Data Managerbe kerül helyben. A fejlesztők soha, semmilyen szinten nem látják és nem gyűjtik a modellezett adatot.",
  },
  {
    q: "Miért hívják Szcenáriónak — ez több, mint egy jó és egy rossz év?",
    a: "Igen, sokkal több. A „jó év / rossz év” csak két statikus szám egy táblázat alján. A Szcenárió viszont egy élő forgatókönyv: megmutatja a döntéseid láncreakcióját és pontos időzítését. Nem azt találgatja, mi lesz év végén, hanem megmutatja, hogy egy váratlan kiadás vagy kieső bevétel pontosan melyik hónapban és napon éri el a kritikus biztonsági határodat — így nem utólag reagálsz, hanem előre látod a mozgásteredet.",
  },
  {
    q: "Hogyan értelmezzük a pesszimista, realista és optimista grafikont?",
    a: "Nem a valóságot és nem jóslatot látsz. A modell a múltbeli adataidból, szezonális mintákból és a beállított paraméterekből rajzol mozgásteret: szórási hibát csökkent, és megmutatja a pesszimista tartalékot vs. az optimista kapacitásigényt.",
  },
  {
    q: "Mi az opcionális saját vonal?",
    a: "Egyedi asztali és app-kiadásokban kapcsolható, közvetlen, titkosított vonal — a Te kezdeményezéseddel. Nem kötelező, nem része a nyilvános belépőígéretnek, és nem nyit üzemeltetői betekintést. A részletes leírás a Support árazási oldal Opcionális saját vonal szakaszában van.",
  },
  {
    q: "Új motort veszek, kapok extra Case-t?",
    a: "Nem. A Case / Slot / Seat / Guest a licenc kvótája. Az oktatási vagy BCP motor ugyanerre a keretre ül — moduláris legó, külön kvótát nem ad. Extra asztalhoz Extra Case vagy Extra Slot kell. A számolás a saját eszközödön marad; külső felhős adatbázist nem használunk.",
  },
];

/** @deprecated használjuk a `supportFaqSections` / `FAQ_GENERAL` párost */
export const FAQ = FAQ_GENERAL;
