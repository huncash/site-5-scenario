export const SUPPORT_MAIL = "support@szcenario.hu";
export const SUPPORT_SLA =
  "Átlagos válaszadási idő: 24 órán belül, kizárólag írásban a pontosabb és gyorsabb ügyintézés érdekében.";

export type Lesson = {
  slug: string;
  title: string;
  body: string;
  youtubeId: string;
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
    body: "Felső vezérlés, középen a munka, alul a modulok. A fülek a munkateret cserélik.",
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
    title: "Munkaterek",
    body: "Magán, vállalkozás és projekt külön könyvelési tér. A felső fülek ezeket cserélik.",
    youtubeId: yt("VITE_YT_LECKE_05"),
  },
  {
    slug: "lecke-06",
    title: "Főmenü",
    body: "Mentés, GYIK és kilépés a három vonal mögött van. Nincs telefonos ügyintézés.",
    youtubeId: yt("VITE_YT_LECKE_06"),
  },
];

export const KAHN_BONBON = {
  eyebrow: "Tudástár · Történeti sablon",
  title: "Herman Kahn és a RAND Corporation",
  p1: "A szcenárió-alapú tervezés nem két találgatott év. Kahn a RAND-nál a hidegháborúban többágú jövőképet rajzolt: elágazás, mielőtt elkötelezed az erőforrást.",
  p2: "Ugyanez a módszer viszi ma a Master Baseline törzset: optimista bővítés, realista tartás, pesszimista tartalék. A fa a te eszközödön fut — local-first, nulla telemetria.",
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

export const FAQ = [
  { q: "Regisztráció kell?", a: "Nem. A helyi profil a készülékeden marad." },
  { q: "Miért nincs telefonszám?", a: "A pontosabb ügyintézéshez írásos jegy kell — nincs telefonos sor." },
  { q: "Hol kérek segítséget?", a: "A 3. réteg: írásos jegyűrlap, e-mailben." },
  { q: "Működik offline?", a: "Az app igen. A support iframe hálózatot kér; offline a helyi súgó marad." },
  {
    q: "Miért hívják Szcenáriónak — ez több, mint egy jó és egy rossz év?",
    a: "Igen. A hagyományos „jó/rossz év” találgatás kevés. Itt a szcenárió-módszertan Lean eszközökkel és a múlt adataiból számolt szórással fut: strukturált jövőkép, a napi működtetésben is.",
  },
  {
    q: "Hogyan értelmezzük a Pesszimista – Realista – Optimista (PRO) grafikont?",
    a: "Nem a valóságot és nem jóslatot látsz. A modell a múltbeli adataidból, szezonális mintákból és a beállított paraméterekből rajzol mozgásteret: szórási hibát csökkent, és megmutatja a pesszimista tartalékot vs. az optimista kapacitásigényt.",
  },
];
