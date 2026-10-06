import type { KnowledgeBaseArticleId } from "@/lib/knowledgeBase";
import {
  supportPageUrl,
  supportPricingHref,
  type SupportPricingAnchor,
} from "@/lib/support";

/** Gazdasági dashboard zsargon — SSOT. A szakmai név megmarad. A plain és az exact kávé melletti magyar. */
export type GlossaryTermId =
  | "case"
  | "slot"
  | "pro"
  | "pdca"
  | "plan"
  | "do"
  | "check"
  | "act"
  | "cashflow"
  | "runway"
  | "stopLoss"
  | "penalty"
  | "masterBaseline"
  | "core"
  | "szumma"
  | "muda"
  | "smed"
  | "pokaYoke"
  | "oee"
  | "vsm"
  | "wms"
  | "dock"
  | "vat"
  | "kpi"
  | "whatIf"
  | "burn"
  | "kaizen"
  | "ev"
  | "efo"
  | "idleCash"
  | "friction"
  | "breakEven"
  | "want"
  | "jit"
  | "heijunka"
  | "fiveS";

export type GlossaryLocaleCopy = {
  term: string;
  plain: string;
  exact: string;
};

export type GlossaryTerm = {
  id: GlossaryTermId;
  hu: GlossaryLocaleCopy;
  en: GlossaryLocaleCopy;
  supportSlug: string;
  supportAnchor?: SupportPricingAnchor;
  kbId?: KnowledgeBaseArticleId;
};

const GLOSSARY: Record<GlossaryTermId, GlossaryTerm> = {
  case: {
    id: "case",
    hu: {
      term: "Aktív Case",
      plain: "az asztal, amin most dolgozol",
      exact: "Egy nyitott helyzet. A licenc azt köti, hány ilyen asztal lehet egyszerre nyitva — nem azt, mennyi régi mentésed van.",
    },
    en: {
      term: "Active Case",
      plain: "the desk you are working on now",
      exact: "One open situation. The licence caps how many desks can be open at once — not how much old save you keep.",
    },
    supportSlug: "pricing",
    supportAnchor: "active-workspaces",
    kbId: "concept-case-slot",
  },
  slot: {
    id: "slot",
    hu: {
      term: "Aktív Slot",
      plain: "Magán / Vállalkozás / Projekt fül — külön kassza",
      exact: "Ugyanazon az asztalon három fiók. A tétel oda esik, amelyik fül nyitva van. Ha a hely betelt, bővíteni kell — a régi, nem használt fiókot simán felülírhatod.",
    },
    en: {
      term: "Active Slot",
      plain: "Personal / Business / Project tab — separate cash",
      exact: "Three drawers on the same desk. A posting lands on the open tab. If the place is full you need an add-on; an unused drawer can be overwritten.",
    },
    supportSlug: "lecke-dash-slot-ful",
    kbId: "concept-case-slot",
  },
  pro: {
    id: "pro",
    hu: {
      term: "P-R-O",
      plain: "rossz / közepes / jó kimenet — ugyanaz a múlt",
      exact: "Három számolás egymás mellett. Nem megmondja a jövőt. Azt mutatja: ha rosszul, ha átlagosan, ha jól alakul, meddig bírod.",
    },
    en: {
      term: "P-R-O",
      plain: "bad / mid / good — same past, three outcomes",
      exact: "Three calculations side by side. It does not tell the future. It shows how long you last if things go badly, normally, or well.",
    },
    supportSlug: "lecke-dash-what-if",
    kbId: "concept-pro",
  },
  pdca: {
    id: "pdca",
    hu: {
      term: "PDCA",
      plain: "tervezd → csináld → nézd meg → nyúlj hozzá",
      exact: "Négy lépés, körbe-körbe. A tárcsa párosával vált: előbb rakod a tervet, aztán mész, aztán méred, aztán javítasz. Nem pontszám.",
    },
    en: {
      term: "PDCA",
      plain: "plan → do → look → fix",
      exact: "Four steps, around and around. The dial swaps them in pairs: first you set the plan, then you run, then you measure, then you fix. Not a score.",
    },
    supportSlug: "lecke-3-pdca",
  },
  plan: {
    id: "plan",
    hu: {
      term: "PLAN",
      plain: "a kiinduló számok és a cél — még nem a napi munka",
      exact: "Itt rakod le, miből indulsz: törzs, készlet, merre nyúlnál. Napi tételt ne ide írj — az a DO.",
    },
    en: {
      term: "PLAN",
      plain: "starting numbers and the goal — not the daily run",
      exact: "Here you lay down what you start from: trunk, stock, where you would reach. Do not post daily items here — that is DO.",
    },
    supportSlug: "lecke-3-pdca",
  },
  do: {
    id: "do",
    hu: {
      term: "DO",
      plain: "ami most tényleg kimegy és bejön",
      exact: "A futó nap: tétel, ÁFA, persely, tartozás. Itt a valóság, nem a terv.",
    },
    en: {
      term: "DO",
      plain: "what is actually going out and coming in",
      exact: "The live day: posting, VAT, piggy, debt. Reality lives here, not the plan.",
    },
    supportSlug: "lecke-3-pdca",
  },
  check: {
    id: "check",
    hu: {
      term: "CHECK",
      plain: "összenézed, mit terveztél és mi jött ki",
      exact: "Itt látod a lyukat: pazarlás, súrlódás, holtpénz. Először mérj. Aztán nyúlj — az már ACT.",
    },
    en: {
      term: "CHECK",
      plain: "you put the plan next to what actually happened",
      exact: "Here you see the hole: waste, friction, idle cash. Measure first. Then touch — that is ACT.",
    },
    supportSlug: "lecke-3-pdca",
  },
  act: {
    id: "act",
    hu: {
      term: "ACT",
      plain: "nyúlsz hozzá — egy javítás, aztán méred újra",
      exact: "Tűzoltás vagy apró javítás. Egyet csinálj, nézd a számot. Ha a runway 0, itt vagy, nem új WANT-nál.",
    },
    en: {
      term: "ACT",
      plain: "you touch it — one fix, then you measure again",
      exact: "Firefighting or a small fix. Do one, watch the number. If runway is 0, you are here — not on a new WANT.",
    },
    supportSlug: "lecke-3-pdca",
  },
  cashflow: {
    id: "cashflow",
    hu: {
      term: "Cashflow",
      plain: "pénz be, pénz ki — nem a számlaegyenleg fényképe",
      exact: "Mi jön be, mi megy ki, mi van zárolva. A persely félretett pénz; a cashflow a mozgás. Az egyenleg csak egy pillanat.",
    },
    en: {
      term: "Cashflow",
      plain: "money in, money out — not a snapshot of the account",
      exact: "What comes in, what goes out, what is locked. A piggy is set-aside money; cashflow is the movement. The balance is just a moment.",
    },
    supportSlug: "lecke-cashflow-logika",
    kbId: "cashflow-savings",
  },
  runway: {
    id: "runway",
    hu: {
      term: "Runway",
      plain: "hány hónapig bírja a kassza, ha holnaptól semmi sem jön be",
      exact: "Nem hasraütés. Szabad tartalék osztva azzal, mennyi folyik ki havonta. Ha a szám 0, elfogyott a levegő — ACT kell, nem új WANT.",
    },
    en: {
      term: "Runway",
      plain: "how many months the till lasts if nothing comes in from tomorrow",
      exact: "Not a gut feel. Free reserve divided by what leaks out each month. If the number is 0, the air is gone — you need ACT, not a new WANT.",
    },
    supportSlug: "lecke-dash-runway",
    kbId: "lesson-kahn",
  },
  stopLoss: {
    id: "stopLoss",
    hu: {
      term: "Stop-loss",
      plain: "vészfék: itt vágsz, mielőtt a törzset viszi",
      exact: "Előre megmondod: ennyi nap / ennyi veszteség, és kész. Nem érzés. A rosszabb pályán rövidebb. Ha 0, ACT — nem új ötlet.",
    },
    en: {
      term: "Stop-loss",
      plain: "emergency brake: you cut here, before it eats the trunk",
      exact: "You say it in advance: this many days / this much loss, and you stop. Not a vibe. On the worse path it is shorter. If it is 0, ACT — not a new idea.",
    },
    supportSlug: "kahn-strategiai-elagazas",
    kbId: "lesson-kahn",
  },
  penalty: {
    id: "penalty",
    hu: {
      term: "Kötbér vs. kilépés",
      plain: "kiszállni olcsóbb-e, mint tovább etetni a veszteséget",
      exact: "Két szám: mennyibe kerül kilépni, és mennyibe kerül nyitva tartani. Amelyik kisebb, az a józan vágás.",
    },
    en: {
      term: "Penalty vs exit",
      plain: "is walking away cheaper than feeding the loss",
      exact: "Two numbers: what exit costs, and what keeping it open costs. The smaller one is the sane cut.",
    },
    supportSlug: "kahn-strategiai-elagazas",
    kbId: "lesson-kahn",
  },
  masterBaseline: {
    id: "masterBaseline",
    hu: {
      term: "Master Baseline",
      plain: "a cég / háztartás kiinduló számai — ezt nem gépeled újra minden ötletnél",
      exact: "Létszám, készlet, rezsi, készpénz. Az új ötlet ezt viszi magával. Itt csak azt nyúld, ami a döntés — a méretet ne írd át naponta.",
    },
    en: {
      term: "Master Baseline",
      plain: "the firm / household starting numbers — you do not retype them for every idea",
      exact: "Headcount, stock, overhead, cash. The new idea carries this. Only touch the decision — do not rewrite the size every day.",
    },
    supportSlug: "lecke-dash-master-baseline",
    kbId: "why-szcenario",
  },
  core: {
    id: "core",
    hu: {
      term: "Core",
      plain: "a mindennapi üzem — ezt a projekt nem eheti meg",
      exact: "A kenyér: fix bevétel, fix kiadás. A kockázatos lépés menjen külön Projektre. A törzset ne tartsd „majd meglátjuk” opcióban.",
    },
    en: {
      term: "Core",
      plain: "everyday operations — a project must not eat this",
      exact: "The bread: fixed income, fixed spend. Put the risky step on a Project. Do not keep the trunk as a “we’ll see” option.",
    },
    supportSlug: "kahn-strategiai-elagazas",
    kbId: "lesson-kahn",
  },
  szumma: {
    id: "szumma",
    hu: {
      term: "Szumma",
      plain: "az összes fiók összeadva — a zsebből zsebbe nem számít forgalomnak",
      exact: "Egy szám, három fül. Ami Magánból a Cégbe megy, az kiesik, különben kétszer látnád. Itt nem írsz tételt és nem importálsz.",
    },
    en: {
      term: "Szumma",
      plain: "all drawers added up — pocket-to-pocket is not turnover",
      exact: "One number, three tabs. Money from Personal to Business drops out, or you would see it twice. You do not post or import here.",
    },
    supportSlug: "lecke-dash-szumma",
    kbId: "workspaces-projects",
  },
  muda: {
    id: "muda",
    hu: {
      term: "MUDA",
      plain: "pazarlás — pénz kimegy, érték nem jön",
      exact: "A CHECK foltjai: holtpénz, díj, várakozás, dupla munka. Magas szám = több lyuk. Nem hibáztatás — merre nyúlj először.",
    },
    en: {
      term: "MUDA",
      plain: "waste — money leaves, no value comes back",
      exact: "The stains on CHECK: idle cash, fees, waiting, double work. High number = more holes. Not blame — where you reach first.",
    },
    supportSlug: "lecke-dash-muda",
  },
  smed: {
    id: "smed",
    hu: {
      term: "SMED",
      plain: "átállás percben, ne órában — a sor ne álljon",
      exact: "Amit a kapu előtt elvégezhetsz, hozd ki. A kapu alatt maradjon csak a csere. Egy óra várakozás pénz.",
    },
    en: {
      term: "SMED",
      plain: "swap in minutes, not hours — do not leave the line idle",
      exact: "What you can do before the gate, pull out. Only the swap stays under the gate. An hour of waiting is money.",
    },
    supportSlug: "lecke-motor-smed",
  },
  pokaYoke: {
    id: "pokaYoke",
    hu: {
      term: "Poka-Yoke",
      plain: "úgy rakd össze, hogy ne lehessen elrontani",
      exact: "A motor megkérdez, mielőtt átír. WANT keret, ÁFA-kulcs, Szummában tiltott import. A hiba drágább, mint a kérdés.",
    },
    en: {
      term: "Poka-Yoke",
      plain: "build it so it is hard to mess up",
      exact: "The engine asks before it overwrites. WANT cap, VAT rate, import blocked in Szumma. The error costs more than the question.",
    },
    supportSlug: "lecke-motor-poka-yoke",
  },
  oee: {
    id: "oee",
    hu: {
      term: "OEE",
      plain: "a gép / sor mennyi időt dolgozik tényleg — a lyuk pénz",
      exact: "Állás × tempó × hiba. 100% ritka. Ha zuhan, először az átállást vagy a hibát nézd, ne vegyél új gépet.",
    },
    en: {
      term: "OEE",
      plain: "how much of the time the line really works — the hole is money",
      exact: "Down time × pace × defects. 100% is rare. If it drops, look at changeover or the fault first — do not buy a new machine.",
    },
    supportSlug: "lecke-motor-oee",
  },
  vsm: {
    id: "vsm",
    hu: {
      term: "VSM",
      plain: "hol áll meg az anyag vagy a papír — ott a lyuk",
      exact: "Rajzold a lépéseket. Ami értéket ad, az marad. Ami vár, az muda. Egy szűk keresztmetszet, egy javítás — ne az egész falat fesd.",
    },
    en: {
      term: "VSM",
      plain: "where material or paper stops — that is the hole",
      exact: "Draw the steps. What adds value stays. What waits is waste. One bottleneck, one fix — do not paint the whole wall.",
    },
    supportSlug: "lecke-motor-vsm",
  },
  wms: {
    id: "wms",
    hu: {
      term: "WMS",
      plain: "raktárprogram — ha sötét, marad a papír és a kapu",
      exact: "Ha a képernyő áll, a teherautó akkor is a kapunál van. Mérd a sort, ne várd a szervert. A szimuláció a gépeden fut.",
    },
    en: {
      term: "WMS",
      plain: "warehouse software — if it is dark, paper and the gate remain",
      exact: "If the screen is down, the truck is still at the gate. Time the queue; do not wait for the server. The simulation runs on your machine.",
    },
    supportSlug: "lecke-motor-wms",
    kbId: "lesson-bcp",
  },
  dock: {
    id: "dock",
    hu: {
      term: "Dokk",
      plain: "rakodókapu — hol áll a teherautó / raklap",
      exact: "A kapu ideje pénz. Ha a program sötét, a sor akkor is ott van. Percben cseréld a rakományt, ne órában.",
    },
    en: {
      term: "Dock",
      plain: "loading bay — where the truck / pallet waits",
      exact: "Gate time is money. If the software is dark, the queue is still there. Swap the load in minutes, not hours.",
    },
    supportSlug: "lecke-motor-dokk",
    kbId: "lesson-bcp",
  },
  vat: {
    id: "vat",
    hu: {
      term: "ÁFA",
      plain: "forgalmi adó — a bruttó és a nettó köze, nem a tied",
      exact: "A motor a bruttóból számol. A különbözetet tedd félre a bevallásig. Ha „ott van a számlán” alapon költöd, a bevalláskor áll a működés.",
    },
    en: {
      term: "VAT",
      plain: "sales tax — the gap between gross and net, not yours",
      exact: "The engine works from gross. Set the gap aside until filing. If you spend it because “it is in the account”, operations stop at filing.",
    },
    supportSlug: "lecke-motor-afa-kor",
    kbId: "cashflow-savings",
  },
  kpi: {
    id: "kpi",
    hu: {
      term: "KPI",
      plain: "négy gyors szám fent — merre nézz tovább",
      exact: "KPI mutató #1–#4, egyedi beállítás. Nem mérleg, nem jegy. Ha 0 a runway, az nem „rossz mutató” — elfogyott a levegő.",
    },
    en: {
      term: "KPI",
      plain: "four quick numbers at the top — where to look next",
      exact: "KPI indicator #1–#4, each a custom setting. Not a balance sheet, not a grade. If runway is 0, that is not a “bad metric” — the air is gone.",
    },
    supportSlug: "lecke-dash-kpi-sav",
  },
  whatIf: {
    id: "whatIf",
    hu: {
      term: "What-if",
      plain: "mi lenne, ha — P / R / O gomb",
      exact: "Ugyanazok a tételek, más világ. P: ami elromolhat. R: a mai ritmus. O: ha összejön. Ne az „igazit” keresd — melyik ágon meddig bírod.",
    },
    en: {
      term: "What-if",
      plain: "what if — the P / R / O switch",
      exact: "Same postings, different world. P: what can break. R: today’s rhythm. O: if it works out. Do not hunt “the true one” — how long you last on each.",
    },
    supportSlug: "lecke-dash-what-if",
    kbId: "concept-pro",
  },
  burn: {
    id: "burn",
    hu: {
      term: "Burn",
      plain: "mennyi folyik ki havonta a kassza alján",
      exact: "NEED, a futó WANT, a tartozás. Nem az egyszeri nagy tétel. Runway = tartalék / burn. Ha nő a burn és a bevétel áll, előbb fogytál.",
    },
    en: {
      term: "Burn",
      plain: "how much leaks out of the till each month",
      exact: "NEED, running WANT, debt. Not the one-off big item. Runway = reserve / burn. If burn rises and income stands still, you run out sooner.",
    },
    supportSlug: "lecke-motor-burn",
    kbId: "lesson-kahn",
  },
  kaizen: {
    id: "kaizen",
    hu: {
      term: "Kaizen",
      plain: "egy apró javítás, aztán méred — nem nagy projekt",
      exact: "Egy tanács, egy lépés, egy szám. Ha mindent egyszerre pipálsz, nem tudod, mi változtatott.",
    },
    en: {
      term: "Kaizen",
      plain: "one small fix, then you measure — not a big project",
      exact: "One tip, one step, one number. If you tick everything at once, you do not know what moved.",
    },
    supportSlug: "lecke-dash-muda",
  },
  ev: {
    id: "ev",
    hu: {
      term: "EV",
      plain: "külső számla — nem bér, de ugyanúgy kimegy a kasszából",
      exact: "Bruttó, ÁFA-körrel. A burnbe beleszámít. Ha minden ev. ugyanarra a hétre esik, a 60 nap hazudik.",
    },
    en: {
      term: "EV",
      plain: "an outside invoice — not payroll, still leaves the till",
      exact: "Gross, with the VAT cycle. It counts in burn. If every EV lands in the same week, the 60-day cover lies.",
    },
    supportSlug: "lecke-motor-ev",
  },
  efo: {
    id: "efo",
    hu: {
      term: "EFO",
      plain: "alkalmi napidíj — add a napokat, ne „havi bérnek” nézd",
      exact: "Napi bruttó. A naptár viszi a burnt. Egy hétre zsúfolva csúcs. NEED, ha nélküle megáll a sor; különben WANT.",
    },
    en: {
      term: "EFO",
      plain: "a casual day rate — add the days, do not treat it as a monthly wage",
      exact: "Gross per day. The calendar eats burn. Pile them into one week and you get a peak. NEED if the line stops without them; otherwise WANT.",
    },
    supportSlug: "lecke-motor-efo",
  },
  idleCash: {
    id: "idleCash",
    hu: {
      term: "Holtpénz",
      plain: "pénz, ami ott áll — se tartalék, se munka",
      exact: "Nincs NEED-re, nincs 60 napra, nincs célhoz kötve. „Majd jól jön” — közben a runway fogy. Irányítsd: tartalék vagy munka.",
    },
    en: {
      term: "Idle cash",
      plain: "money that just sits — neither reserve nor work",
      exact: "Not on NEED, not on the 60 days, not tied to a goal. “It will come in handy” — meanwhile runway shrinks. Steer it: reserve or work.",
    },
    supportSlug: "lecke-motor-holtpenz",
    kbId: "cashflow-savings",
  },
  friction: {
    id: "friction",
    hu: {
      term: "Súrlódás",
      plain: "rejtett díj, késés, kétszer megcsinált munka",
      exact: "Ami ráül a NEED árára: banki díj, újraküldés, várakozó számla. Forintban a CHECK-en. Egy forrást vágj, aztán mérj.",
    },
    en: {
      term: "Friction",
      plain: "hidden fee, delay, work done twice",
      exact: "What sits on top of NEED: bank fees, resends, a waiting invoice. In forints on CHECK. Cut one source, then measure.",
    },
    supportSlug: "lecke-motor-surladas",
  },
  breakEven: {
    id: "breakEven",
    hu: {
      term: "Fedezeti pont",
      plain: "az első hónap, amikor a pálya már nem eszi a tartalékot",
      exact: "Be − ki összeadva eléri a nullát. Nem „gazdag cég”. P-n később jön, O-n hamarabb. A kérdés: melyik világban éred el.",
    },
    en: {
      term: "Break-even",
      plain: "the first month the path stops eating the reserve",
      exact: "In minus out added up hits zero. Not “a rich firm”. Later on P, sooner on O. The question: in which world you get there.",
    },
    supportSlug: "lecke-dash-fedezeti-pont",
    kbId: "concept-pro",
  },
  want: {
    id: "want",
    hu: {
      term: "WANT",
      plain: "vágy / extra ötlet — nem kötelező",
      exact: "Jólesik, de nélküle megy a működés. A havi sapka zárolható. Ha a runway 0, ne új WANT-ot nyiss — ACT kell.",
    },
    en: {
      term: "WANT",
      plain: "a want / extra idea — not required",
      exact: "Nice, but operations run without it. The monthly cap can lock. If runway is 0, do not open a new WANT — you need ACT.",
    },
    supportSlug: "lecke-2-szukseglet-vagy-befektetes",
    kbId: "cashflow-savings",
  },
  jit: {
    id: "jit",
    hu: {
      term: "JIT",
      plain: "épp időben — először a levegő, aztán a vágy",
      exact: "Amíg nincs meg a stabil 60 napos fedezet, a perselytöltés várólistára kerül. Először a biztonsági tartalék.",
    },
    en: {
      term: "JIT",
      plain: "just in time — air first, then the want",
      exact: "Until you have a solid 60-day cover, filling piggies waits. Safety reserve first.",
    },
    supportSlug: "lecke-motor-jit",
    kbId: "cashflow-savings",
  },
  heijunka: {
    id: "heijunka",
    hu: {
      term: "Heijunka",
      plain: "ne essen minden számla ugyanarra a hétre",
      exact: "Egy héten túl sok kimenő, aztán üres. A 60 napos fedezet ilyenkor hazudik. Ne a havi összeget told — a napot.",
    },
    en: {
      term: "Heijunka",
      plain: "do not dump every invoice on the same week",
      exact: "Too much outbound in one week, then idle. The 60-day cover lies. Do not push the monthly total — move the day.",
    },
    supportSlug: "lecke-motor-heijunka",
  },
  fiveS: {
    id: "fiveS",
    hu: {
      term: "5S",
      plain: "ami kell, az kéznél van — a keresgélés idő és pénz",
      exact: "Vedd le, ami zavar. Ami marad, annak legyen helye. Egy fiók, egy szűrő. A nézet is: rossz kontraszt = rossz döntés.",
    },
    en: {
      term: "5S",
      plain: "what you need is at hand — hunting is time and money",
      exact: "Remove what gets in the way. Give the rest a place. One drawer, one filter. The view too: bad contrast is a bad decision.",
    },
    supportSlug: "lecke-motor-otos-s",
  },
};

export const GLOSSARY_IDS = Object.keys(GLOSSARY) as GlossaryTermId[];

export function glossaryTerm(id: GlossaryTermId): GlossaryTerm {
  return GLOSSARY[id];
}

export function glossaryCopy(id: GlossaryTermId, locale: "hu" | "en" = "hu"): GlossaryLocaleCopy {
  const term = GLOSSARY[id];
  return locale === "en" ? term.en : term.hu;
}

export function glossarySupportHref(id: GlossaryTermId): string {
  const term = GLOSSARY[id];
  if (term.supportSlug === "pricing") {
    return supportPricingHref(term.supportAnchor ?? "active-workspaces");
  }
  return supportPageUrl(term.supportSlug);
}

export function glossaryTooltip(id: GlossaryTermId, locale: "hu" | "en" = "hu"): string {
  const c = glossaryCopy(id, locale);
  return `${c.term} — ${c.plain}\n${c.exact}`;
}
