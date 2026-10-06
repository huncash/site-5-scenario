import type { GlossaryTermId } from "@/lib/glossary";
import type { OplLesson, OplStep } from "@/lib/opl";

function step(
  id: string,
  titleHu: string,
  titleEn: string,
  actionHu: string,
  actionEn: string,
  captionHu: string,
  captionEn: string,
  src?: string,
): OplStep {
  return {
    id,
    titleHu,
    titleEn,
    actionHu,
    actionEn,
    image: {
      captionHu,
      captionEn,
      ...(src
        ? { src, altHu: captionHu, altEn: captionEn }
        : {}),
    },
  };
}

function dash(p: {
  slug: string;
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
}): OplLesson {
  const { slug, ...rest } = p;
  const path = `lecke-dash-${slug}`;
  return { id: path, path, ...rest };
}

/** Fő műszerfal LTR/TTB letapogatás — egy OPL / vizuális elem. */
export const DASH_OPL_LESSONS: OplLesson[] = [
  dash({
    slug: "fooldal",
    categoryHu: "Fejléc",
    categoryEn: "Header",
    titleHu: "Főoldal / márka gomb",
    titleEn: "Home / brand button",
    whyHu: "Egy koppintás visz vissza a Case-választóra. Először tudd, melyik döntési térben vagy.",
    whyEn: "One tap returns you to the Case picker. First know which decision space you are in.",
    jargon: ["case", "slot"],
    keywords: ["főoldal", "márka", "wallet", "home", "brand"],
    deepDiveHu:
      "A bal felső tárca/márka nem dekoráció. A nyilvános ígéret: a szimuláció a gépeden fut, a Case-t te nyitod. A gomb bezárja a jelenlegi munkaterületet, és visszavisz oda, ahol a Case-t választod — Magán, Vállalkozás vagy Projekt Slot nélkül nem tudsz tételt rögzíteni. Ha „elvesztél” a kártyák között, ez a biztos kilépő. Nem ment automatikusan a felhőbe, és nem küld jelzést senkinek. A döntés ott marad, ahol elkezdted: a böngészőben.",
    deepDiveEn:
      "The top-left wallet/brand is not decoration. The public promise: the simulation runs on your machine, and you open the Case. The button leaves the current workspace and returns to the Case picker — without a Personal, Business or Project Slot you cannot post. If you get lost among cards, this is the safe exit. It does not auto-save to a cloud and it does not ping anyone. The decision stays where you started: in the browser.",
    steps: [
      step("s1", "Bal felső", "Top left", "A tárca/márka a létező Case-választóra visz.", "The wallet/brand returns you to the Case picker.", "Tárca ikon a fejlécben", "Wallet icon in the header"),
      step("s2", "Név", "Name", "A profilnév mutatja, melyik Case van nyitva.", "The profile name shows which Case is open.", "Profilnév a márka mellett", "Profile name beside the brand"),
      step("s3", "Vissza", "Back", "Ha eltévedtél a kártyákban, innen indulj újra.", "If you are lost among cards, restart from here.", "Főoldal gomb — kilépő", "Home button — the exit"),
    ],
  }),
  dash({
    slug: "pdca-szamlalo",
    categoryHu: "Fejléc",
    categoryEn: "Header",
    titleHu: "PDCA ciklusszámláló",
    titleEn: "PDCA cycle counter",
    whyHu: "A # mutatja, hányszor fordult a ciklus. Nem pontszám — aktivitás.",
    whyEn: "The # shows how many times the cycle turned. Not a score — activity.",
    jargon: ["pdca", "kaizen"],
    keywords: ["pdca", "számláló", "ciklus", "counter", "#"],
    deepDiveHu:
      "A PDCA nem naptár. Minden fordulat (PLAN→DO→CHECK→ACT) egy tanulási kör. A fejléc # összege azt mutatja, a nyitott Slotokon hány ilyen kör történt. Magas szám nem „jobb cég”, csak annyit jelent: döntöttél, mértél, javítottál. A felnyíló panelből aktivitás, beállítás és zárás is elérhető. Ha a szám áll, a modell áll — a számok frissek lehetnek, a tanulás nem.",
    deepDiveEn:
      "PDCA is not a calendar. Each turn (PLAN→DO→CHECK→ACT) is a learning loop. The header # sums how many such loops happened on the open Slots. A high number is not a “better firm”; it only means you decided, measured, and corrected. The popover also reaches activity, settings and lock. If the number is stuck, the model is stuck — the figures may be fresh, the learning is not.",
    steps: [
      step("s1", "A #", "The #", "Olvasd a számot a profilnév mellett.", "Read the number beside the profile name.", "PDCA # a fejlécben", "PDCA # in the header"),
      step("s2", "Panel", "Panel", "Nyisd ki: aktivitás, beállítás, zárás egy helyen.", "Open it: activity, settings, lock in one place.", "Számláló felnyíló panel", "Counter popover"),
      step("s3", "Értelmezés", "Read it", "Nem pontszám. Csak annyi: hányszor fordult a kör.", "Not a score. Only: how many times the loop turned.", "Ciklusösszeg jelentése", "What the cycle sum means"),
    ],
  }),
  dash({
    slug: "nezet",
    categoryHu: "Fejléc",
    categoryEn: "Header",
    titleHu: "Nézetbeállítások",
    titleEn: "View settings",
    whyHu: "A paletta a szemednek szól, nem a modellnek. Rossz kontraszt = rossz döntés.",
    whyEn: "The palette is for your eyes, not the model. Bad contrast is a bad decision.",
    jargon: ["fiveS"],
    keywords: ["nézet", "téma", "paletta", "theme", "a11y", "split"],
    deepDiveHu:
      "A nézetmenü (paletta) témát, kontrasztot, nyelvet és osztott/teljes nézetet állít. Ez 5S a képernyőn: ami zavar, azt vedd le, ami kell, az legyen olvasható. A számok nem változnak. A split nézet a PLAN/DO oszlopokat tartja egymás mellett — asztali munka. Mobilnál a full nézet kevesebb zaj. A nyelv csak a feliratot cseréli; a HUF és az ÁFA szabálya helyben marad.",
    deepDiveEn:
      "The view menu (palette) sets theme, contrast, language and split/full layout. That is 5S on screen: remove what distracts, keep what you must read. The numbers do not change. Split keeps PLAN/DO columns side by side — desktop work. On mobile, full is less noise. Language only swaps labels; HUF and VAT rules stay local.",
    steps: [
      step("s1", "Paletta", "Palette", "A paletta ikon a nézetmenüt nyitja.", "The palette icon opens the view menu.", "Paletta ikon jobbra fent", "Palette icon, top right"),
      step("s2", "Téma", "Theme", "Válassz kontrasztot és nyelvet. A modell nem változik.", "Pick contrast and language. The model does not change.", "Téma / nyelv / a11y", "Theme / language / a11y"),
      step("s3", "Split", "Split", "Asztalon oszd a PLAN/DO oszlopokat. Mobilnál full.", "On desktop split PLAN/DO. On mobile use full.", "Split / full váltó", "Split / full toggle"),
    ],
  }),
  dash({
    slug: "gyorsbillentyu",
    categoryHu: "Fejléc",
    categoryEn: "Header",
    titleHu: "Gyorsbillentyűk",
    titleEn: "Keyboard shortcuts",
    whyHu: "Kéz a billentyűzeten: mentés és fókusz ugrás egér nélkül.",
    whyEn: "Hands on the keys: save and jump focus without the mouse.",
    jargon: ["fiveS"],
    keywords: ["gyorsbillentyű", "shortcut", "billentyű", "ctrl+s"],
    deepDiveHu:
      "A billentyűzet-ikon a teljes listát mutatja. Mentés: Ctrl/Cmd+S — a vaultba, nem felhőbe. Beviteli mezőben a navigációs rövidítések szándékosan nem futnak, hogy ne írd felül a tételt. Desktopon ez ritmus: kevesebb egér, kevesebb súrlódás. Ha a lista üresnek tűnik, nézd a leírást: csak azok a billentyűk élnek, amikhez van bekötött művelet.",
    deepDiveEn:
      "In the view (glasses) menu the keyboard icon shows the full list. Save: Ctrl/Cmd+S — into the vault, not a cloud. Navigation shortcuts intentionally do not fire inside an input, so you do not overwrite a posting. On desktop this is rhythm: less mouse, less friction. If the list looks empty, read the copy: only keys with a wired action are live.",
    steps: [
      step("s1", "Ikon", "Icon", "A szemüveg menüben a billentyűzet-ikon a listát nyitja.", "In the glasses menu the keyboard icon opens the list.", "Nézet menü → billentyűzet", "View menu → keyboard"),
      step("s2", "Mentés", "Save", "Ctrl/Cmd+S a helyi vaultba ment.", "Ctrl/Cmd+S saves into the local vault.", "Ctrl/Cmd+S kártya", "Ctrl/Cmd+S card"),
      step("s3", "Fókusz", "Focus", "Gépelés közben a navigáció nem fut.", "While typing, navigation keys do not fire.", "Bevitel vs. navigáció", "Input vs navigation"),
    ],
  }),
  dash({
    slug: "fomenu",
    categoryHu: "Fejléc",
    categoryEn: "Header",
    titleHu: "Főmenü (három vonal)",
    titleEn: "Main menu (three lines)",
    whyHu: "Eszközök, napló, kisokos és túra egy helyen. Nincs telefonos pult.",
    whyEn: "Devices, log, primer and tour in one place. No phone desk.",
    jargon: ["case"],
    keywords: ["menü", "hamburger", "eszköz", "kisokos", "túra"],
    deepDiveHu:
      "A három vonal mögött van, ami nem a napi szám: eszközpárosítás, napló, aktivitás, tudástár és az onboarding túra. A Support/GYIK ide is elvezet, de a számlák és a licenc a Support `/pricing` oldalon él. Nincs telefonos ügyintézés — a súgó a lecke és a kisokos. Ha zárni akarsz, a vault lock a profilpanelből vagy innen indul. A menü nem cserél Slotot és nem ír tételt.",
    deepDiveEn:
      "Behind the three lines sits what is not the daily number: device pairing, log, activity, knowledge base and the onboarding tour. Support/FAQ also live here, but prices and licence sit on Support `/pricing`. There is no phone desk — help is the lesson and the primer. To lock, the vault lock starts from the profile popover or here. The menu does not swap Slots and does not write a posting.",
    steps: [
      step("s1", "Nyitás", "Open", "A három vonal a teljes eszköztárat nyitja.", "The three lines open the full toolkit.", "Hamburger a jobb szélen", "Hamburger on the right edge"),
      step("s2", "Súgó", "Help", "Kisokos, túra, GYIK — nem telefonos pult.", "Primer, tour, FAQ — not a phone desk.", "Tudástár / túra tételek", "KB / tour items"),
      step("s3", "Határ", "Bound", "A menü nem vált Slotot és nem ír tételt.", "The menu does not swap Slots or write postings.", "Menü vs. munkafelület", "Menu vs work surface"),
    ],
  }),
  dash({
    slug: "helyzet",
    categoryHu: "Fejléc",
    categoryEn: "Header",
    titleHu: "Helyzet sáv",
    titleEn: "Situation banner",
    whyHu: "Egy mondat: milyen döntési helyzetben vagy. Először ezt olvasd.",
    whyEn: "One sentence: which decision situation you are in. Read this first.",
    jargon: ["case", "masterBaseline"],
    keywords: ["helyzet", "situation", "banner", "lead"],
    deepDiveHu:
      "A helyzet sáv a tárcsa balján áll. Nem KPI és nem riasztás: a Case rövid emlékeztetője — milyen törzzsel, milyen döntést játszol. A mintahelyzetben ez a demó szövege; saját Case-ben a te megfogalmazásod. Ha a sáv üres, a modellnek nincs „címkéje”: először írd le a helyzetet, különben a What-if pályák ok nélkül ugrálnak. A számok a kártyákon vannak; itt a kérdés.",
    deepDiveEn:
      "The situation banner sits left of the dial. It is not a KPI and not an alert: a short reminder of the Case — which trunk, which decision you are playing. In the sample case this is demo copy; in your Case it is your wording. If the band is empty, the model has no label: write the situation first, or What-if paths jump without a reason. Numbers live on the cards; the question lives here.",
    steps: [
      step("s1", "Bal sáv", "Left band", "A tárcsa balján a helyzet-mondat áll.", "The situation sentence sits left of the dial.", "Helyzet sáv a tárcsa mellett", "Situation band beside the dial"),
      step("s2", "Olvasás", "Read", "Egy mondat: milyen döntést játszol.", "One sentence: which decision you are playing.", "Helyzet szöveg", "Situation text"),
      step("s3", "Üres", "Empty", "Ha üres, előbb címkézd a Case-t, aztán a számot.", "If empty, label the Case first, then the number.", "Üres helyzet sáv", "Empty situation band"),
    ],
  }),
  dash({
    slug: "pdca-tarcsa",
    categoryHu: "Fejléc",
    categoryEn: "Header",
    titleHu: "PDCA tárcsa és forgatás",
    titleEn: "PDCA dial and rotate",
    whyHu: "A tárcsa a fázispárt váltja. PLAN/DO nem ugyanaz a munka, mint CHECK/ACT.",
    whyEn: "The dial swaps the phase pair. PLAN/DO is not the same work as CHECK/ACT.",
    jargon: ["pdca", "plan", "do", "check", "act"],
    keywords: ["tárcsa", "dial", "forgatás", "pdca", "rotate"],
    deepDiveHu:
      "A félkörös tárcsa a nézet közepén áll, szándékosan. Négy mód: PD, DC, CA, AP — mindig két szomszédos fázis. A „Forgatás” gomb negyedfordulatot tesz. PLAN: kiinduló számok és cél. DO: a futó tétel. CHECK: ami eltért. ACT: a javítás, amit bevezeted. Ha PLAN-ben rögzítesz napi tételt, összekevered a törzset a működéssel. A tárcsa nem ment automatikusan új Case-t — csak a munkamódot cseréli.",
    deepDiveEn:
      "The semi-circle dial sits in the middle of the view on purpose. Four modes: PD, DC, CA, AP — always two neighbouring phases. Rotate turns a quarter step. PLAN: starting numbers and goal. DO: the live posting. CHECK: what drifted. ACT: the fix you adopt. If you post daily items in PLAN, you mix the trunk with operations. The dial does not save a new Case — it only swaps the work mode.",
    steps: [
      step("s1", "Közép", "Centre", "A tárcsa a képernyő középvonalán áll.", "The dial sits on the viewport centreline.", "PDCA félkörös tárcsa", "PDCA semi-rotary dial"),
      step("s2", "Forgat", "Rotate", "A 👈 gomb a következő fázispárra lép.", "The 👈 button steps to the next phase pair.", "Forgatás gomb a tárcsa mellett", "Rotate button beside the dial"),
      step("s3", "Mód", "Mode", "PD / DC / CA / AP — más oszlop, más kérdés.", "PD / DC / CA / AP — different columns, different question.", "Négy PDCA mód", "Four PDCA modes"),
    ],
  }),
  dash({
    slug: "kereses",
    categoryHu: "Fejléc",
    categoryEn: "Header",
    titleHu: "Globális kereső",
    titleEn: "Global search",
    whyHu: "Egy mező a tételhez, célhoz, Slot-hoz. Ne görgess vakon.",
    whyEn: "One field for posting, goal, Slot. Do not scroll blind.",
    jargon: ["slot", "kpi"],
    keywords: ["keresés", "omnibox", "search", "globális"],
    deepDiveHu:
      "A kereső a tárcsa jobb oldalán áll. Célja: tétel, cél, munkatér, törzs — egy index, egy találati lista. Amíg az indexelő készül, a mező a „hamarosan” panelt nyitja: ez nem hiba, hanem határ. Addig a Slot-fül és az alsó modulok a navigáció. Ne várd, hogy a kereső könyvelési szűrő legyen; először a helyes Slot, aztán a tétel.",
    deepDiveEn:
      "Search sits to the right of the dial. Its job: posting, goal, workspace, trunk — one index, one result list. While the indexer is in prep, the field opens the coming-soon panel: that is a bound, not a bug. Until then, Slot tabs and bottom modules are navigation. Do not expect search to be an accounting filter; correct Slot first, then the posting.",
    steps: [
      step("s1", "Mező", "Field", "A tárcsa jobbján a keresőmező áll.", "The search field sits right of the dial.", "Omnibox a fejlécben", "Omnibox in the header"),
      step("s2", "Enter", "Enter", "Enter vagy a nagyító indítja a keresést.", "Enter or the magnifier starts the search.", "Nagyító gomb", "Magnifier button"),
      step("s3", "Határ", "Bound", "Ha „hamarosan” jön, a fülekkel lépj tovább.", "If you see coming-soon, move with the tabs.", "Kereső határ / előkészítés", "Search bound / in prep"),
    ],
  }),
  dash({
    slug: "slot-ful",
    categoryHu: "Munkatér",
    categoryEn: "Workspace",
    titleHu: "Slot fülek",
    titleEn: "Slot tabs",
    whyHu: "Magán, Vállalkozás, Projekt külön pénz. Előbb a fül, aztán a tétel.",
    whyEn: "Personal, Business, Project are separate money. Tab first, then the posting.",
    jargon: ["slot", "case", "core"],
    keywords: ["slot", "fül", "magán", "vállalkozás", "projekt", "munkatér"],
    deepDiveHu:
      "Egy Case-en belül a Slot a kapacitáshely: Magán, középen a vállalkozás vagy projekt, külön színnel. A tétel mindig az aktív fülre esik. Ha a magán rezsit a céges fülre írod, a cashflow hazudik, a Szumma pedig duplán számolhat belső átvezetést. A licenc a párhuzamosan nyitott Case-eket köti, a Slot a Case-en belüli hely. Nincs „szcenárió-prefix” a fülön — a Slot a hely, a Case a modell.",
    deepDiveEn:
      "Inside one Case a Slot is a capacity place: Personal, and in the middle business or project, each with its own tint. A posting always lands on the active tab. If you write household overhead on the company tab, cashflow lies and Szumma may double-count an internal transfer. The licence caps concurrent Cases; a Slot is a place inside the Case. There is no “scenario prefix” on the tab — Slot is the place, Case is the model.",
    steps: [
      step("s1", "Sor", "Row", "A fejléc alatt a Slot-fülek állnak.", "Slot tabs sit under the header.", "Magán / középső / projekt fülek", "Personal / middle / project tabs"),
      step("s2", "Váltás", "Switch", "Kattints a fülre, mielőtt tételt írsz.", "Click the tab before you write a posting.", "Aktív Slot fül", "Active Slot tab"),
      step("s3", "Szín", "Tint", "A szín a Slotot jelöli, nem a KPI-t.", "The tint marks the Slot, not the KPI.", "Slot szín / mappa", "Slot tint / folder"),
    ],
  }),
  dash({
    slug: "uj-slot",
    categoryHu: "Munkatér",
    categoryEn: "Workspace",
    titleHu: "Új Slot",
    titleEn: "New Slot",
    whyHu: "Új hely a Case-en belül. Nem új Case, és nem bővíti magától a licencet.",
    whyEn: "A new place inside the Case. Not a new Case, and it does not expand the licence by itself.",
    jargon: ["slot", "case"],
    keywords: ["új slot", "létrehozás", "plusz", "workspace"],
    deepDiveHu:
      "Az „Új Slot” a fülek mellett áll. Projektet, vállalkozást vagy extra helyet nyit ugyanabban a Case-ben. A Basic/Pro/Enterprise (és a campus 1×2) a párhuzamos Case-t és a Slot-helyeket köti — a gomb nem számláz. Ha a hely betelt, a felület jelzi; a bővítés a Support `/pricing` #active-workspaces. Ne hozz létre Slotot minden ötlethez: a Core maradjon a törzsön, a kockázatos lépés menjen Projektre.",
    deepDiveEn:
      "“New Slot” sits beside the tabs. It opens a project, business or extra place in the same Case. Basic/Pro/Enterprise (and campus 1×2) cap concurrent Cases and Slot places — the button does not bill. If capacity is full, the UI says so; expansion is Support `/pricing` #active-workspaces. Do not open a Slot for every idea: keep Core on the trunk, put the risky step on a Project.",
    steps: [
      step("s1", "Gomb", "Button", "A fülek mellett az Új Slot áll.", "New Slot sits beside the tabs.", "Új Slot gomb", "New Slot button"),
      step("s2", "Hely", "Place", "Ugyanaz a Case, új kapacitáshely.", "Same Case, a new capacity place.", "Slot létrehozó párbeszéd", "Slot create dialog"),
      step("s3", "Limit", "Cap", "Ha betelt, a Support árazás a bővítés, nem a gomb.", "If full, Support pricing expands it — not the button.", "Kapacitás / licenc határ", "Capacity / licence bound"),
    ],
  }),
  dash({
    slug: "kpi-sav",
    categoryHu: "Állapot",
    categoryEn: "Status",
    titleHu: "KPI sáv",
    titleEn: "KPI bar",
    whyHu: "KPI mutató #1–#4. Nem mérleg — első pillantás, hogy merre nézz.",
    whyEn: "KPI indicator #1–#4. Not a balance sheet — a first glance at where to look.",
    jargon: ["kpi", "cashflow", "runway"],
    keywords: ["kpi", "sáv", "mutató", "összecsuk", "egyedi beállítás"],
    deepDiveHu:
      "A KPI sáv a fülek alatt négy gyorscsempét mutat: KPI mutató #1–#4, mindegyik egyedi beállítás. Célja a figyelem: melyik kártyára menj tovább. Nem Slot — a Slot a munkatér. Nem könyvelési minősítés, és nem helyettesíti a cashflow-kártyát. A jobb felső +/− összecsukja, hogy a PLAN/DO oszlopnak legyen hely. Üres csempe = a mutató még nincs bekötve. Ha a négy szám ellentmond, ne a sávot „javítsd” — nyisd a mögötte lévő kártyát.",
    deepDiveEn:
      "The KPI bar under the tabs shows four quick tiles: KPI indicator #1–#4, each a custom setting. Its job is attention: which card to open next. Not a Slot — a Slot is a workspace. It is not an accounting grade and it does not replace the cashflow card. The top-right +/− collapses it so PLAN/DO has room. An empty tile means that metric is not wired yet. If the four figures disagree, do not “fix” the bar — open the card behind them.",
    steps: [
      step("s1", "Négy csempe", "Four tiles", "Olvasd a KPI mutató #1–#4 feliratot.", "Read KPI indicator #1–#4.", "KPI mutató #1–#4", "KPI indicator #1–#4"),
      step("s2", "Összecsuk", "Collapse", "A +/− helyet ad a munkának.", "The +/− gives the work room.", "KPI sáv összecsukó", "KPI bar collapse"),
      step("s3", "Tovább", "Next", "Ellentmondásnál nyisd a mögöttes kártyát.", "If they disagree, open the card behind.", "KPI → kártya ugrás", "KPI → card jump"),
    ],
  }),
  dash({
    slug: "master-baseline",
    categoryHu: "PLAN",
    categoryEn: "PLAN",
    titleHu: "Master Baseline kártya",
    titleEn: "Master Baseline card",
    whyHu: "A törzs adott. Itt csak a szcenárió-változót mozgatod, nem a cég méretét.",
    whyEn: "The trunk is given. Here you move the scenario variable, not the firm’s size.",
    jargon: ["masterBaseline", "core", "plan"],
    keywords: ["master baseline", "törzs", "örökölt", "kiinduló"],
    deepDiveHu:
      "A Master Baseline a kiinduló szám: létszám, készlet, rezsi, készpénz. Új ötlet ezt viszi magával — „örökölt ← …” —, a törzs Case-en „törzs” van. Ezért nem gépeled újra a cégméretet minden alkalommal. PLAN-ben csak azt nyúld, ami a döntés. Ha naponta átírod az alapot, a három pályát nem tudod összehasonlítani — akkor minek a P-R-O.",
    deepDiveEn:
      "Master Baseline is the starting number: headcount, stock, overhead, cash. A new idea carries it — “inherited ← …” — the trunk Case is marked “trunk”. That is why you do not retype firm size every time. In PLAN only touch the decision. If you rewrite the base every day, you cannot compare the three paths — then what is P-R-O for.",
    steps: [
      step("s1", "Kártya", "Card", "PLAN-ben a törzs kártya a kiinduló számokat mutatja.", "In PLAN the trunk card shows starting numbers.", "Master Baseline kártya", "Master Baseline card"),
      step("s2", "Jelölés", "Badge", "„törzs” vagy „örökölt ← …” — honnan jön az alap.", "“trunk” or “inherited ← …” — where the base comes from.", "Törzs / örökölt jelvény", "Trunk / inherited badge"),
      step("s3", "Mozgás", "Move", "Csak a szcenárió-változót nyúlj. A méret marad.", "Touch only the scenario variable. Size stays.", "Kiinduló chippek", "Starting chips"),
    ],
  }),
  dash({
    slug: "what-if",
    categoryHu: "Döntés",
    categoryEn: "Decision",
    titleHu: "What-if / P-R-O",
    titleEn: "What-if / P-R-O",
    whyHu: "Három pálya ugyanarra a múltra. Rossz / közepes / jó — meddig bírod.",
    whyEn: "Three paths on the same past. Bad / mid / good — how long you last.",
    jargon: ["whatIf", "pro", "stopLoss"],
    keywords: ["what-if", "p-r-o", "pesszimista", "realista", "optimista"],
    deepDiveHu:
      "A What-if három gomb: P, R, O. P: ami elromolhat. R: ahogy ma megy. O: ha összejön. Ugyanazok a tételek, más világ — ezért lehet őket egymás mellé tenni. Ne az „igazit” keresd. Azt kérdezd: melyik ágon meddig bírja a kassza, és hol vágsz, mielőtt a törzset viszi.",
    deepDiveEn:
      "What-if is three buttons: P, R, O. P: what can break. R: how it goes today. O: if it works out. Same postings, different world — that is why you can put them side by side. Do not hunt “the true one”. Ask: how long the till lasts on each path, and where you cut before it eats the trunk.",
    steps: [
      step("s1", "Gombok", "Buttons", "Válaszd a P, R vagy O pályát.", "Pick the P, R or O path.", "P-R-O What-if gombok", "P-R-O What-if buttons"),
      step("s2", "Ugyanaz a múlt", "Same past", "A tételek nem változnak, a feltétel igen.", "Postings stay; the assumption changes.", "Három pálya egy múlton", "Three paths, one history"),
      step("s3", "Stop-loss", "Stop-loss", "A rosszabb ágon nézd, hol vágnád le.", "On the worse branch, see where you would cut.", "Stop-loss a P ágon", "Stop-loss on the P path"),
    ],
  }),
  dash({
    slug: "fedezeti-pont",
    categoryHu: "Döntés",
    categoryEn: "Decision",
    titleHu: "Fedezeti pont",
    titleEn: "Break-even",
    whyHu: "Az első hónap, amikor a választott pálya már nem veszteséges.",
    whyEn: "The first month the chosen path is no longer losing money.",
    jargon: ["breakEven", "pro", "whatIf"],
    keywords: ["fedezeti", "break-even", "nulla", "hónap"],
    deepDiveHu:
      "A fedezeti pont nem „gazdag cég”. Az a hónap, amikor a be − ki összeadva eléri a nullát a választott pályán. Előtte a tartalék viszi; utána már nem eszi magát — ha az a világ tart. P-re váltasz, a pont elcsúszik. Nem az a kérdés, „mikor leszek gazdag”. Az: melyik világban éred el a nullát.",
    deepDiveEn:
      "Break-even is not “a rich firm”. It is the month when in minus out added up hits zero on the path you picked. Before that the reserve carries you; after that it stops eating itself — if that world holds. Switch to P and the point slides. The question is not “when will I be rich”. It is: in which world you reach zero.",
    steps: [
      step("s1", "Kártya", "Card", "Keresd a Fedezeti pont feliratot a középső sávon.", "Find Break-even in the middle band.", "Fedezeti pont kártya", "Break-even card"),
      step("s2", "Pálya", "Path", "Előbb válassz P / R / O-t, aztán olvasd a hónapot.", "Pick P / R / O first, then read the month.", "Fedezeti pont + P-R-O", "Break-even + P-R-O"),
      step("s3", "Nulla", "Zero", "Halmozott bevétel − kiadás = 0. Nem osztalék.", "Cumulative income − spend = 0. Not a dividend.", "Nulla-hónap jelölés", "Zero-month mark"),
    ],
  }),
  dash({
    slug: "cashflow-kartya",
    categoryHu: "Pénz",
    categoryEn: "Money",
    titleHu: "Cashflow kártya",
    titleEn: "Cashflow card",
    whyHu: "Be, ki, időben. Az egyenleg fénykép — a kártya a film.",
    whyEn: "In, out, over time. The balance is a snapshot — the card is the film.",
    jargon: ["cashflow", "idleCash", "want"],
    keywords: ["cashflow kártya", "pénzmozgás", "be", "ki"],
    deepDiveHu:
      "A cashflow kártya a mozgást mutatja, nem a perselyt. Bevétel mínusz kiadás időben; a WANT és a NEED ugyanúgy kimegy, de más döntés. A Szumma nézetben a belső átvezetés kiesik, hogy ne fújd fel a forgalmat. Ha a kártya piros, ne a színt „javítsd” — nyisd a Tételeket, és nézd, melyik hét viszi. A holtpénz a kártyán kívül, ott áll: sem tartalék, sem működés.",
    deepDiveEn:
      "The cashflow card shows movement, not the piggy. Income minus spend over time; WANT and NEED both leave, but they are different decisions. In Szumma, internal transfers drop so you do not inflate volume. If the card is red, do not “fix” the colour — open Ledger and see which week is eating it. Idle cash sits outside the card: neither reserve nor operations.",
    steps: [
      step("s1", "Mozgás", "Movement", "Olvasd a be − ki idősort, ne csak az egyenleget.", "Read the in − out series, not only the balance.", "Cashflow kártya", "Cashflow card"),
      step("s2", "Tétel", "Posting", "Pirosnál nyisd a Tételek fület, ne a színt.", "If red, open Ledger — not the colour.", "Cashflow → Tételek", "Cashflow → Ledger"),
      step("s3", "Szumma", "Szumma", "Összegzésnél a belső átvezetés kiesik.", "In the sum, internal transfers drop out.", "Cashflow Szumma szűrés", "Cashflow Szumma filter"),
    ],
  }),
  dash({
    slug: "afa-tartalek",
    categoryHu: "Pénz",
    categoryEn: "Money",
    titleHu: "ÁFA tartalék",
    titleEn: "VAT reserve",
    whyHu: "A fizetendő ÁFA nem elkölthető. Zárolás, amíg a bevallás le nem megy.",
    whyEn: "VAT due is not spendable. Locked until the filing is done.",
    jargon: ["vat", "cashflow", "idleCash"],
    keywords: ["áfa", "tartalék", "zárolás", "vat", "bruttó", "nettó"],
    deepDiveHu:
      "Magyar ÁFA: a motor a bruttóból nettót számol, a különbség a forgalmi adó. A tartalék csempe azt mutatja, amit a következő bevallásig ne költs el. A szabad nettó = bruttó − zárolt ÁFA − perselyek. Ha a tartalékot „ott van a számlán” alapon elköltöd, a bevalláskor a működés áll. Ez nem holtpénz — ez idegen pénz nálad. A gyanús tételt a motor megjelöli; ne írd át kézzel a kulcsot, ha nem érted a bizonylatot.",
    deepDiveEn:
      "Hungarian VAT: the engine derives net from gross; the gap is sales tax. The reserve tile is what you must not spend until the next filing. Free net = gross − locked VAT − piggies. If you spend the reserve because “it is in the account”, operations stop at filing. This is not idle cash — it is someone else’s money in your hands. The engine flags suspicious lines; do not rewrite the rate if you do not understand the voucher.",
    steps: [
      step("s1", "Csempe", "Tile", "Keresd az ÁFA tartalék feliratot a pénz-sávon.", "Find the VAT reserve label on the money band.", "ÁFA tartalék csempe", "VAT reserve tile"),
      step("s2", "Zár", "Lock", "Ezt az összeget ne vidd WANT-ra vagy perselyre.", "Do not send this amount to WANT or a piggy.", "Zárolt ÁFA vs. szabad nettó", "Locked VAT vs free net"),
      step("s3", "Bruttó", "Gross", "HU tételnél a motor bruttóból nettót számol.", "On HU lines the engine derives net from gross.", "Bruttó → nettó ÁFA", "Gross → net VAT"),
    ],
  }),
  dash({
    slug: "runway",
    categoryHu: "Pénz",
    categoryEn: "Money",
    titleHu: "Runway / fedezet",
    titleEn: "Runway / cover",
    whyHu: "Hány hónapig bírja a kassza, ha holnaptól semmi sem jön be. Először a 60 nap.",
    whyEn: "How many months the till lasts if nothing comes in from tomorrow. Sixty days first.",
    jargon: ["runway", "burn", "jit"],
    keywords: ["runway", "fedezet", "60 nap", "burn", "hónap"],
    deepDiveHu:
      "A runway nem hasraütés. Pontosan hány hónapig bírja ki a kassza, ha holnaptól egy fillér új bevétel sem jön be: szabad tartalék osztva azzal, mennyi folyik ki havonta (burn). A 30/60 napos sáv azt jelzi, a fix kiadásaidból mekkora rész van biztonságosan letakarva a meglévő pénzből. JIT: amíg nincs meg a stabil tartalék, a perselytöltés — vágyak, extra fejlesztés — várólistára kerül. Először a levegő. A P pályán rövidebb a szám, mert ott rosszabb a világ. Ha a számláló 0, az nem elrontott KPI, amit simogatni kell. Elfogyott a levegő. Itt nem új WANT kell, hanem ACT: azonnali tűzoltás.",
    deepDiveEn:
      "Runway is not a gut feel. It is exactly how many months the till lasts if not one extra forint comes in from tomorrow: free reserve divided by what leaks out each month (burn). The 30/60-day bar shows how much of your fixed spend is safely covered by money you already have. JIT: until the safety reserve is solid, filling piggies — wants, extra build — waits. Air first. On the P path the number is shorter, because that world is worse. If the counter is 0, that is not a broken KPI to stroke. The air is gone. You do not need a new WANT. You need ACT: put the fire out.",
    steps: [
      step("s1", "Hónap", "Months", "Olvasd a runway hónapját a pénz-sávon.", "Read runway months on the money band.", "Runway hónap kijelző", "Runway months readout"),
      step("s2", "60 nap", "60 days", "A sáv: a fix kiadás mekkora része van letakarva.", "The bar: how much of fixed spend is covered.", "30 / 60 nap fedezet", "30 / 60 day cover"),
      step("s3", "JIT", "JIT", "60 nap alatt ne tölts perselyt. Először a levegő.", "Below 60 days do not fill piggies. Air first.", "JIT vs. persely", "JIT vs piggy"),
    ],
  }),
  dash({
    slug: "lean-tanacsado",
    categoryHu: "CHECK",
    categoryEn: "CHECK",
    titleHu: "Lean tanácsadó",
    titleEn: "Lean consultant",
    whyHu: "Helyi szabályok, nem felhő-AI. Egy tanács, egy beavatkozás.",
    whyEn: "Local rules, not cloud AI. One piece of advice, one intervention.",
    jargon: ["kaizen", "muda", "pdca"],
    keywords: ["lean", "tanácsadó", "consultant", "tanács", "kaizen"],
    deepDiveHu:
      "A Lean tanácsadó panel a nyitott Slot tételein fut, a gépeden. Nem külső modell: szabálykészlet (MUDA, Kaizen, import vs. kézi). Egy tanács egy beavatkozás — fogadd el, vagy hagyd. Az elfogadás helyi jelölés, nem telemetria. CHECK/ACT fázisban van értelme: PLAN-ben még a törzset rakod. Ha minden tanácsot egyszerre „pipálsz”, elveszted, melyik változtatott a cashflow-n.",
    deepDiveEn:
      "The Lean consultant panel runs on the open Slot’s postings, on your machine. Not an external model: a rule set (MUDA, Kaizen, import vs manual). One advice, one intervention — accept or leave it. Acceptance is a local mark, not telemetry. It belongs in CHECK/ACT: in PLAN you are still laying the trunk. If you tick every tip at once, you lose which change moved cashflow.",
    steps: [
      step("s1", "Panel", "Panel", "Nyisd a Lean tanácsadót a CHECK/ACT sávon.", "Open the Lean consultant on the CHECK/ACT band.", "Lean tanácsadó panel", "Lean consultant panel"),
      step("s2", "Egy tanács", "One tip", "Olvasd a szabályt, ne a hangnemet.", "Read the rule, not the tone.", "Tanács kártya", "Advice card"),
      step("s3", "Elfogad", "Accept", "Egyet fogadj el, aztán nézd a számot.", "Accept one, then watch the number.", "Elfogadás / helyi jelölés", "Accept / local mark"),
    ],
  }),
  dash({
    slug: "muda",
    categoryHu: "CHECK",
    categoryEn: "CHECK",
    titleHu: "MUDA hőtérkép",
    titleEn: "MUDA heatmap",
    whyHu: "A veszteség helye, nem a hibáztatás. Először a legnagyobb folt.",
    whyEn: "Where waste sits, not who to blame. The biggest stain first.",
    jargon: ["muda", "kaizen", "friction"],
    keywords: ["muda", "hőtérkép", "veszteség", "heatmap", "kaizen"],
    deepDiveHu:
      "A MUDA a hét veszteség lean nyelven: várakozás, készlet, mozgás, túltermelés, hiba, túlmunka, kihasználatlan képesség — pénzben a súrlódás és a holtpénz. A hőtérkép a Slot tételeit színezi: hol sűrűsödik a veszteség. Nem büntető tábla. Kaizen: egy foltot javíts, mérj, aztán a következőt. Ha mindent pirosnak látsz, a skála rossz — szűrj időszakra vagy Slot-ra, különben a Core és a projekt összekeveredik.",
    deepDiveEn:
      "MUDA is the seven wastes in lean language: waiting, stock, motion, overproduction, defect, overprocessing, unused skill — in money, friction and idle cash. The heatmap tints Slot postings: where waste clusters. It is not a punishment board. Kaizen: fix one stain, measure, then the next. If everything looks red, the scale is wrong — filter by period or Slot, or Core and project will mix.",
    steps: [
      step("s1", "Térkép", "Map", "Nézd, hol a legsötétebb a folt.", "See where the stain is darkest.", "MUDA hőtérkép", "MUDA heatmap"),
      step("s2", "Egy folt", "One stain", "Válassz egy veszteségtípust, ne mindet.", "Pick one waste type, not all of them.", "MUDA típus választó", "MUDA type picker"),
      step("s3", "Kaizen", "Kaizen", "Javíts egyet, mérj, csak aztán a következőt.", "Fix one, measure, only then the next.", "Kaizen a MUDA után", "Kaizen after MUDA"),
    ],
  }),
  dash({
    slug: "also-navigacio",
    categoryHu: "Alsó sáv",
    categoryEn: "Bottom bar",
    titleHu: "Alsó modulok",
    titleEn: "Bottom modules",
    whyHu: "Cashflow, Tételek, Üzletek, Leltár — ugyanaz a Slot, más kérdés.",
    whyEn: "Cashflow, Ledger, Deals, Inventory — same Slot, different question.",
    jargon: ["cashflow", "slot"],
    keywords: ["alsó", "fül", "tételek", "üzletek", "leltár", "bottom"],
    deepDiveHu:
      "A rögzített alsó sáv négy modult cserél anélkül, hogy Slotot váltana. Cashflow: mozgás. Tételek: a könyvelhető sorok. Üzletek: megállapodások, nem készpénz. Leltár: készlet és anyag, nem számla. A hiba, ha a leltárt cashflow-nak olvasod, vagy az üzletet már befolyt bevételnek. Előbb a felső Slot-fül, aztán az alsó modul. A szín a Slotot követi, hogy ne keverd a magánt a céggel.",
    deepDiveEn:
      "The fixed bottom bar swaps four modules without swapping the Slot. Cashflow: movement. Ledger: bookable lines. Deals: agreements, not cash. Inventory: stock and materials, not an invoice. The failure is reading inventory as cashflow, or a deal as money already in. Top Slot tab first, then the bottom module. The tint follows the Slot so you do not mix household with the firm.",
    steps: [
      step("s1", "Négy fül", "Four tabs", "Cashflow · Tételek · Üzletek · Leltár.", "Cashflow · Ledger · Deals · Inventory.", "Alsó négy modul", "Bottom four modules"),
      step("s2", "Slot marad", "Slot stays", "A fül a kérdést cseréli, nem a munkateret.", "The tab swaps the question, not the workspace.", "Alsó sáv + Slot szín", "Bottom bar + Slot tint"),
      step("s3", "Ne keverd", "Do not mix", "Üzlet ≠ bevétel. Leltár ≠ cashflow.", "A deal ≠ income. Inventory ≠ cashflow.", "Modulok jelentése", "What the modules mean"),
    ],
  }),
  dash({
    slug: "szumma",
    categoryHu: "Alsó sáv",
    categoryEn: "Bottom bar",
    titleHu: "Szumma",
    titleEn: "Szumma",
    whyHu: "Összegzi a Slotokat. Import és új tétel itt nem indul — előbb válts vissza.",
    whyEn: "It totals the Slots. Import and new posting do not start here — switch back first.",
    jargon: ["szumma", "slot", "cashflow"],
    keywords: ["szumma", "összeg", "összes", "total"],
    deepDiveHu:
      "A Szumma a Case összes nyitott Slotját egy nézetbe teszi, a belső átvezetések nélkül — hogy a cég és a magán közötti mozgás ne duzzassza a forgalmat. Ez ellenőrző kép, nem munkafelület: import és új tétel Szummában nem indul, mert nem lenne egyértelmű, hova kerül a sor. Kapcsold be, hasonlítsd a Slotok összegét, kapcsold ki, és dolgozz a helyes fülön. A licenc nem „Szumma-helyet” ad; a Szumma nézet.",
    deepDiveEn:
      "Szumma puts every open Slot of the Case in one view, without internal transfers — so movement between firm and household does not inflate volume. It is a check, not a work surface: import and new posting do not start in Szumma, because the line would have nowhere obvious to land. Turn it on, compare the Slot total, turn it off, and work on the right tab. The licence does not grant a “Szumma place”; Szumma is a view.",
    steps: [
      step("s1", "Gomb", "Button", "Az alsó sáv jobb szélén a Szumma áll.", "Szumma sits on the right of the bottom bar.", "Szumma gomb", "Szumma button"),
      step("s2", "Összeg", "Total", "Slotok együtt, belső átvezetés nélkül.", "Slots together, no internal transfers.", "Szumma összesített nézet", "Szumma combined view"),
      step("s3", "Vissza", "Back", "Tételhez vagy importhoz kapcsold ki, válts fülre.", "For a posting or import, turn it off and pick a tab.", "Szumma ki + Slot fül", "Szumma off + Slot tab"),
    ],
  }),
  dash({
    slug: "uj-tetel",
    categoryHu: "Alsó sáv",
    categoryEn: "Bottom bar",
    titleHu: "Új tétel",
    titleEn: "New posting",
    whyHu: "A + a nyitott Slotra ír. Előbb fül, aztán összeg, aztán NEED/WANT/INVEST.",
    whyEn: "The + writes to the open Slot. Tab first, then amount, then NEED/WANT/INVEST.",
    jargon: ["want", "slot", "cashflow"],
    keywords: ["új tétel", "plusz", "rögzítés", "posting"],
    deepDiveHu:
      "A + Új gomb a jobb alsó sarokban a létrehozót nyitja. A tétel az aktív Slotra esik — ezért állj meg, ha Szumma van bekapcsolva. A típus (NEED / WANT / INVESTMENT) likviditási sorrend, nem erkölcs. ÁFA-s HU sornál a motor bruttóból számol; ne keverd a nettót a bruttóval. Mentés a vaultba kerül, nem felhőbe. Ha a szám „nem stimmel”, először a fül és a dátum, aztán a címke.",
    deepDiveEn:
      "The + New button in the bottom-right opens the creator. The posting lands on the active Slot — stop if Szumma is on. NEED / WANT / INVESTMENT is a liquidity order, not morals. On a HU VAT line the engine computes from gross; do not mix net and gross. Save goes to the vault, not a cloud. If the number “looks wrong”, check tab and date first, then the label.",
    steps: [
      step("s1", "+", "+", "Az alsó jobb + Új tételt nyit.", "Bottom-right + opens a new posting.", "+ Új tétel gomb", "+ New posting button"),
      step("s2", "Slot", "Slot", "Nézd a felső fület. Szummában nem indul.", "Check the top tab. It will not start in Szumma.", "Aktív Slot a + előtt", "Active Slot before +"),
      step("s3", "Címke", "Label", "NEED, WANT vagy INVESTMENT — egy döntés.", "NEED, WANT or INVESTMENT — one decision.", "Tétel típusa a létrehozóban", "Posting type in the creator"),
    ],
  }),
  dash({
    slug: "vault-zar",
    categoryHu: "Fejléc",
    categoryEn: "Header",
    titleHu: "Vault zár / másik Case",
    titleEn: "Vault lock / other Case",
    whyHu: "A zár a gépeden hagyja a modellt. Senki nem kap pinget, ha kilépsz.",
    whyEn: "The lock leaves the model on your machine. Nobody gets a ping when you leave.",
    jargon: ["case"],
    keywords: ["zár", "lock", "vault", "másik case"],
    deepDiveHu:
      "A PDCA # panel alján a lakat a vaultot zárja, vagy látogatóban másik Case-t nyit. Ez nem kijelentkezés egy felhőből: a számok a böngészőben maradnak. A nyilvános ígéret: nincs automata „itt vagyok”. Ha ugrasz, a kéz üres — a belépő a lejátszásból számolódik, nem kész jelszóból. Előbb ments (Ctrl/Cmd+S), aztán zárd. A zár nem cserél Slotot.",
    deepDiveEn:
      "At the bottom of the PDCA # popover the lock closes the vault, or in a visitor shell opens another Case. This is not a cloud sign-out: the numbers stay in the browser. The public promise: no automatic “I am here”. If you jump, your hands are empty — entry is counted from play, not a baked password. Save first (Ctrl/Cmd+S), then lock. The lock does not swap a Slot.",
    steps: [
      step("s1", "Panel", "Panel", "Nyisd a PDCA # gombot a fejlécben.", "Open the PDCA # button in the header.", "PDCA # panel lakatja", "PDCA # panel lock"),
      step("s2", "Lakat", "Lock", "Zár vagy másik Case — a modell a gépen marad.", "Lock or other Case — the model stays on the machine.", "Vault zár gomb", "Vault lock button"),
      step("s3", "Mentés", "Save", "Előbb Ctrl/Cmd+S, aztán a lakat.", "Ctrl/Cmd+S first, then the lock.", "Mentés a zár előtt", "Save before lock"),
    ],
  }),
  dash({
    slug: "plan-oszlop",
    categoryHu: "PLAN",
    categoryEn: "PLAN",
    titleHu: "PLAN oszlop",
    titleEn: "PLAN column",
    whyHu: "Itt a törzs és a cél. Napi tételt ne ide írj — az a DO.",
    whyEn: "Here is the trunk and the goal. Do not post daily items here — that is DO.",
    jargon: ["plan", "masterBaseline", "core"],
    keywords: ["plan", "oszlop", "tervezés"],
    deepDiveHu:
      "A bal (vagy a tárcsa szerinti) PLAN oszlop a tervezés: Master Baseline, What-if, fedezeti pont. A szín borostyán. Itt még nem a napi üzem van. Ha PLAN-be írsz rezsit, a törzs és a működés összekeveredik, a P-R-O pálya pedig összehasonlíthatatlan lesz. A tárcsa PD módban PLAN | DO-t mutat. Előbb a számokat rögzítsd, aztán forgasd DO-ra.",
    deepDiveEn:
      "The left (or dial-driven) PLAN column is planning: Master Baseline, What-if, break-even. The tint is amber. This is not daily operations. If you post overhead into PLAN, trunk and operations mix and the P-R-O path stops being comparable. In PD mode the dial shows PLAN | DO. Lock the numbers first, then rotate to DO.",
    steps: [
      step("s1", "Fejléc", "Header", "Az oszlop tetején a PLAN felirat áll.", "PLAN sits at the top of the column.", "PLAN oszlop fejléc", "PLAN column header"),
      step("s2", "Tartalom", "Content", "Baseline, What-if, fedezeti pont — nem a napi sor.", "Baseline, What-if, break-even — not the daily line.", "PLAN kártyák", "PLAN cards"),
      step("s3", "Határ", "Bound", "Napi tételhez forgasd a tárcsát DO-ra.", "For a daily posting, rotate the dial to DO.", "PLAN → DO forgatás", "PLAN → DO rotate"),
    ],
  }),
  dash({
    slug: "do-oszlop",
    categoryHu: "DO",
    categoryEn: "DO",
    titleHu: "DO oszlop",
    titleEn: "DO column",
    whyHu: "Ami most történik: cashflow, tétel, ÁFA. Ez a futó üzem.",
    whyEn: "What is happening now: cashflow, posting, VAT. This is the live run.",
    jargon: ["do", "cashflow", "vat"],
    keywords: ["do", "oszlop", "végrehajtás"],
    deepDiveHu:
      "A DO oszlop cián. Itt él a cashflow-kártya, a szabad nettó, az ÁFA tartalék, a persely és a tartozás. Amit ide írsz, az a nyitott Slot ténye. Ne keverd a PLAN törzsével: a DO a ritmus, a PLAN a kiinduló kép. PD módban jobb oldalon van. Ha a szám piros, ne a PLAN-t told — nyisd a Tételeket a DO-ban.",
    deepDiveEn:
      "The DO column is cyan. This is where the cashflow card, free net, VAT reserve, piggies and debt live. What you write here is a fact of the open Slot. Do not mix it with the PLAN trunk: DO is the rhythm, PLAN is the starting picture. In PD mode it sits on the right. If the number is red, do not push PLAN — open Ledger in DO.",
    steps: [
      step("s1", "Fejléc", "Header", "Keresd a cián DO feliratot az oszlop tetején.", "Find the cyan DO label at the top of the column.", "DO oszlop fejléc", "DO column header"),
      step("s2", "Kártyák", "Cards", "Cashflow, ÁFA, persely, tartozás itt fut.", "Cashflow, VAT, piggies, debt run here.", "DO pénzkártyák", "DO money cards"),
      step("s3", "Tétel", "Posting", "A + Új a DO Slotra ír, nem a PLAN törzsre.", "The + New writes to the DO Slot, not the PLAN trunk.", "DO + Új tétel", "DO + New posting"),
    ],
  }),
  dash({
    slug: "check-oszlop",
    categoryHu: "CHECK",
    categoryEn: "CHECK",
    titleHu: "CHECK oszlop",
    titleEn: "CHECK column",
    whyHu: "A számok valósága: MUDA, súrlódás, holtpénz. Először mérj, aztán nyúlj.",
    whyEn: "The reality of the numbers: MUDA, friction, idle cash. Measure first, then touch.",
    jargon: ["check", "muda", "friction", "idleCash"],
    keywords: ["check", "ellenőrzés", "jegyzet", "muda score"],
    deepDiveHu:
      "CHECK akkor jön, ha a tárcsát DC vagy CA módra viszed. Itt a MUDA score, a hatékonyság, a súrlódás és a holtpénz. A jegyzetmező a te megfigyelésed — nem telemetria. CA módban a bal oszlop a CHECK. Ne javíts ACT nélkül: a CHECK megmondja, hol a folt, az ACT a beavatkozás. Ha a score 0, nincs elég tétel a Sloton, ne találj ki veszteséget.",
    deepDiveEn:
      "CHECK arrives when you turn the dial to DC or CA. Here sit the MUDA score, efficiency, friction and idle cash. The notes field is your observation — not telemetry. In CA mode the left column is CHECK. Do not fix without ACT: CHECK says where the stain is, ACT is the intervention. If the score is 0, the Slot has too few postings — do not invent waste.",
    steps: [
      step("s1", "Mód", "Mode", "Forgasd a tárcsát DC vagy CA módra.", "Rotate the dial to DC or CA.", "CHECK a tárcsa után", "CHECK after the dial"),
      step("s2", "Score", "Score", "Olvasd a MUDA score-t és a súrlódást.", "Read the MUDA score and the friction.", "CHECK MUDA score", "CHECK MUDA score"),
      step("s3", "Jegyzet", "Notes", "Írd le, mit látsz. Ez a te CHECK-ed.", "Write what you see. That is your CHECK.", "CHECK jegyzetmező", "CHECK notes field"),
    ],
  }),
  dash({
    slug: "act-javaslat",
    categoryHu: "ACT",
    categoryEn: "ACT",
    titleHu: "ACT javaslatok",
    titleEn: "ACT recommendations",
    whyHu: "Egy beavatkozás, egy mérés. CRITICAL előbb, OPTIMIZATION később.",
    whyEn: "One intervention, one measurement. CRITICAL first, OPTIMIZATION later.",
    jargon: ["act", "kaizen", "muda"],
    keywords: ["act", "javaslat", "critical", "warning"],
    deepDiveHu:
      "Az ACT panel helyi szabályokból rak sort: CRITICAL, WARNING, OPTIMIZATION, SUCCESS. Nem felhő-tanács. Egy sort fogadj el, nézd a cashflow-t, csak aztán a következőt — ez Kaizen. A bizonyíték (proof) a gépeden van. PLAN-ben ez a lista üresnek tűnhet, mert még nincs futó ritmus. Ha mindent egyszerre pipálsz, elveszted, melyik változtatott.",
    deepDiveEn:
      "The ACT panel ranks local rules: CRITICAL, WARNING, OPTIMIZATION, SUCCESS. Not cloud advice. Accept one row, watch cashflow, only then the next — that is Kaizen. The proof stays on your machine. In PLAN the list may look empty because there is no live rhythm yet. If you tick everything at once, you lose which change moved the number.",
    steps: [
      step("s1", "Lista", "List", "CA módban az ACT oszlop a javaslatokat mutatja.", "In CA mode the ACT column shows the recommendations.", "ACT javaslatlista", "ACT recommendation list"),
      step("s2", "Súly", "Weight", "CRITICAL előbb. A zöld SUCCESS nem munka.", "CRITICAL first. Green SUCCESS is not work.", "CRITICAL / WARNING jelvény", "CRITICAL / WARNING badge"),
      step("s3", "Egy sor", "One row", "Fogadj el egyet, mérj, aztán a következőt.", "Accept one, measure, then the next.", "ACT elfogadás", "ACT accept"),
    ],
  }),
  dash({
    slug: "stop-loss",
    categoryHu: "Döntés",
    categoryEn: "Decision",
    titleHu: "Stop-loss csempe",
    titleEn: "Stop-loss tile",
    whyHu: "Hol vágnád le, mielőtt a Core-t viszi. Napban van, nem érzésben.",
    whyEn: "Where you would cut before it eats Core. It is in days, not vibes.",
    jargon: ["stopLoss", "core", "pro"],
    keywords: ["stop-loss", "vágás", "döntési nap"],
    deepDiveHu:
      "A Stop-loss a What-if kártyán: hány napod van, mielőtt a tartalék a törzset kezdi enni. Te mondod meg a számot — nem a tőzsde. A P pályán rövidebb, mert ott rosszabb a világ. Ha a nap 0, ACT kell, nem új WANT. Itt vágsz, nem simogatod a mutatót.",
    deepDiveEn:
      "Stop-loss on the What-if card: how many days before the reserve starts eating the trunk. You say the number — not the market. On the P path it is shorter, because that world is worse. If days are 0, you need ACT, not a new WANT. You cut here. You do not stroke the metric.",
    steps: [
      step("s1", "Csempe", "Tile", "A What-if kártyán keresd a Stop-loss feliratot.", "Find Stop-loss on the What-if card.", "Stop-loss csempe", "Stop-loss tile"),
      step("s2", "Nap", "Days", "Olvasd a napot. Ez a vágás ideje, nem kamat.", "Read the days. That is cut time, not interest.", "Stop-loss napok", "Stop-loss days"),
      step("s3", "Pálya", "Path", "Válts P-re: a nap rövidül. Ez a tartomány.", "Switch to P: the days shrink. That is the range.", "Stop-loss a P pályán", "Stop-loss on the P path"),
    ],
  }),
  dash({
    slug: "kotber",
    categoryHu: "Döntés",
    categoryEn: "Decision",
    titleHu: "Kötbér / kilépési ár",
    titleEn: "Penalty / exit price",
    whyHu: "Mit fizetsz, ha kiszállsz. Olcsóbb-e, mint nyitva tartani.",
    whyEn: "What you pay if you exit. Is it cheaper than keeping it open.",
    jargon: ["penalty", "pro", "whatIf"],
    keywords: ["kötbér", "kilépés", "penalty", "opció"],
    deepDiveHu:
      "A kötbér csempe a What-if Kahn-sávján a kilépés árát mutatja forintban. Mellé a bullet: kilépés vs. az opció nyitva tartásának díja. Ha a kilépés olcsóbb, mint a rosszabb pálya továbbvitele, a racionális vágás a stop-loss. Ez nem büntetés erkölcsben — szerződéses súrlódás pénzben. A WMS-kieséses BCP-leckében ugyanez a kérdés: mit visz el a dokk, ha áll a kapu.",
    deepDiveEn:
      "The penalty tile on the What-if Kahn band shows the exit price in forints. Beside it the bullet: exit vs. the fee of keeping the option open. If exit is cheaper than riding the worse path, the rational cut is the stop-loss. This is not moral punishment — contractual friction in money. The WMS-outage BCP lesson asks the same: what the dock costs if the gate is still.",
    steps: [
      step("s1", "Csempe", "Tile", "A What-if kártyán a kötbér / kilépés áll.", "Penalty / exit sits on the What-if card.", "Kötbér csempe", "Penalty tile"),
      step("s2", "Összeg", "Amount", "Olvasd a forintot. Ez a kiszállás ára.", "Read the forints. That is the exit price.", "Kilépési ár", "Exit price"),
      step("s3", "Összevet", "Compare", "Olcsóbb-e, mint nyitva tartani a rosszabb ágat.", "Is it cheaper than keeping the worse branch open.", "Kilépés vs. opció", "Exit vs option"),
    ],
  }),
  dash({
    slug: "szabad-netto",
    categoryHu: "Pénz",
    categoryEn: "Money",
    titleHu: "Szabad nettó",
    titleEn: "Free net",
    whyHu: "Ami ÁFA és zárolás után elkölthető. A bruttó nem a tied.",
    whyEn: "What you may spend after VAT and locks. Gross is not yours.",
    jargon: ["cashflow", "vat", "idleCash"],
    keywords: ["szabad nettó", "egyenleg", "elkölthető"],
    deepDiveHu:
      "A szabad nettó a DO cashflow-kártyán: bruttó − zárolt ÁFA − perselyek. Magán Sloton „szabad egyenleg”, Szummában „likviditás” — más címke, ugyanaz a kérdés: mi marad. Ha a bruttót költöd, a bevalláskor a működés áll. A holtpénz ettől különbözik: az nincs sem zárolva, sem munkában. A csempe nem banki kivonat — a motor számolja a nyitott Slot tételeiből.",
    deepDiveEn:
      "Free net sits on the DO cashflow card: gross − locked VAT − piggies. On a Personal Slot it is “free balance”, in Szumma “liquidity” — different label, same question: what remains. If you spend the gross, operations stop at filing. Idle cash is different: it is neither locked nor in work. The tile is not a bank statement — the engine computes it from the open Slot’s postings.",
    steps: [
      step("s1", "Csempe", "Tile", "A cashflow-kártyán a Szabad nettó / egyenleg.", "On the cashflow card: Free net / balance.", "Szabad nettó csempe", "Free net tile"),
      step("s2", "Képlet", "Formula", "Bruttó − ÁFA − persely. A maradék a tied.", "Gross − VAT − piggies. The rest is yours.", "Szabad nettó bontás", "Free net breakdown"),
      step("s3", "Ne keverd", "Do not mix", "A bruttó nem elkölthető. A holtpénz nem tartalék.", "Gross is not spendable. Idle cash is not a reserve.", "Bruttó vs. szabad", "Gross vs free"),
    ],
  }),
  dash({
    slug: "persely",
    categoryHu: "Pénz",
    categoryEn: "Money",
    titleHu: "Perselyek",
    titleEn: "Piggies",
    whyHu: "Célra félretett alhalmaz. Először a 60 nap, aztán a persely.",
    whyEn: "A subset set aside for a goal. Sixty days first, then the piggy.",
    jargon: ["jit", "idleCash", "want"],
    keywords: ["persely", "megtakarítás", "cél", "piggy"],
    deepDiveHu:
      "A persely nem cashflow: zárolt alhalmaz célra, pufferre vagy ÁFA-ra. A DO kártyán a csempe az összegüket mutatja. JIT: amíg a 60 napos fedezet nincs meg, a motor nem tölt automatikusan. Ha a perselybe rakod a szabad nettót „hogy ne lássam”, holtpénzt csinálsz. A WANT-ot ne perselyezd — zárd a keretet. Átvezetés két persely között nem forgalom.",
    deepDiveEn:
      "A piggy is not cashflow: a locked subset for a goal, a buffer or VAT. The DO card tile shows their sum. JIT: until the 60-day cover is met, the engine does not auto-fill. If you hide free net in a piggy “so I do not see it”, you make idle cash. Do not piggy a WANT — lock the cap. A transfer between two piggies is not volume.",
    steps: [
      step("s1", "Csempe", "Tile", "A cashflow-kártyán a Perselyek összegét olvasd.", "Read the Piggies total on the cashflow card.", "Perselyek csempe", "Piggies tile"),
      step("s2", "JIT", "JIT", "60 nap alatt ne tölts. Először a fedezet.", "Below 60 days do not fill. Cover first.", "JIT vs. perselytöltés", "JIT vs piggy fill"),
      step("s3", "Cél", "Goal", "Egy persely = egy cél. Ne bújtasd a WANT-ot.", "One piggy = one goal. Do not hide a WANT.", "Persely célhoz rendelés", "Piggy assigned to a goal"),
    ],
  }),
  dash({
    slug: "konzisztencia",
    categoryHu: "DO",
    categoryEn: "DO",
    titleHu: "Konzisztencia lámpa",
    titleEn: "Consistency lamp",
    whyHu: "Ha a számok nem stimmelnek, először a forrást nézd, ne a KPI-t.",
    whyEn: "If the numbers disagree, look at the source first, not the KPI.",
    jargon: ["pokaYoke", "fiveS", "wms"],
    keywords: ["konzisztencia", "lámpa", "adatsor", "lineage"],
    deepDiveHu:
      "A lámpa a Szumma / DO sávon a tételek és a kivonat egyezését jelzi. Poka-yoke: hibát megelőző jelzés, nem büntetés. Ha piros, nyisd az adatsort (lineage) — melyik import, melyik kézi sor csúszott. Ugyanaz a kérdés, mint egy WMS-kiesésnél a dokkon: a kapu ideje és a sor nem stimmel, először a forrást egyeztesd. Ne „javítsd” a KPI-t kézzel.",
    deepDiveEn:
      "The lamp on the Szumma / DO band shows whether postings and the extract agree. Poka-yoke: a signal that prevents error, not a punishment. If it is red, open the lineage — which import, which manual line slipped. Same question as a WMS outage on the dock: gate time and the queue disagree, reconcile the source first. Do not “fix” the KPI by hand.",
    steps: [
      step("s1", "Lámpa", "Lamp", "A cashflow-sorban a konzisztencia csempe áll.", "The consistency tile sits in the cashflow row.", "Konzisztencia lámpa", "Consistency lamp"),
      step("s2", "Piros", "Red", "Nyisd az adatsort. Ne a KPI-t told.", "Open the lineage. Do not push the KPI.", "Adatsor / lineage", "Lineage / source"),
      step("s3", "Zöld", "Green", "Egyezik a kivonat és a tétel. Mehetsz tovább.", "Extract and posting agree. You may continue.", "Zöld lámpa", "Green lamp"),
    ],
  }),
  dash({
    slug: "tartozas",
    categoryHu: "DO",
    categoryEn: "DO",
    titleHu: "Tartozás / részlet",
    titleEn: "Debt / installment",
    whyHu: "A következő 30–60 nap terhe. Ez fix kiadás — a runwayt viszi.",
    whyEn: "The next 30–60 day burden. This is fixed spend — it eats runway.",
    jargon: ["burn", "runway", "cashflow"],
    keywords: ["tartozás", "részlet", "hitel", "esedékesség"],
    deepDiveHu:
      "A tartozás kártya a nyitott Slot hiteleit és a következő esedékességet mutatja. A havi teher a burn része: ha nem számolod, a runway hazudik. A 60 napos lista a közeli részlet, nem a teljes tőke. Szummában a belső kölcsön kieshet — ne hidd forgalomnak. Új tartozást a DO-ban rögzíts, a PLAN-ben csak a törzs törlesztőjét tervezd.",
    deepDiveEn:
      "The debt card shows the open Slot’s loans and the next due date. Monthly burden is part of burn: if you omit it, runway lies. The 60-day list is the near installment, not the full principal. In Szumma an internal loan may drop — do not treat it as volume. Post a new debt in DO; in PLAN only plan the trunk installment.",
    steps: [
      step("s1", "Kártya", "Card", "A DO sávon a tartozás / részlet kártya áll.", "The debt / installment card sits on the DO band.", "Tartozás kártya", "Debt card"),
      step("s2", "Teher", "Burden", "Olvasd a 30 napos terhet. Ez viszi a runwayt.", "Read the 30-day burden. That eats runway.", "Közeli részletteher", "Near installment burden"),
      step("s3", "Esedékesség", "Due", "A következő dátum. Ne a teljes tőkét ijeszd.", "The next date. Do not scare yourself with full principal.", "Következő esedékesség", "Next due date"),
    ],
  }),
  dash({
    slug: "want-keret",
    categoryHu: "Kiadás",
    categoryEn: "Spend",
    titleHu: "WANT keret",
    titleEn: "WANT cap",
    whyHu: "A vágy zárolható. Ha viszi a tartalékot, a motor megállít.",
    whyEn: "A want can be locked. If it eats the reserve, the engine stops you.",
    jargon: ["want", "cashflow", "jit"],
    keywords: ["want", "keret", "zárolás", "vágy"],
    deepDiveHu:
      "A havi WANT sapka a tétel oldalon él. NEED és INVESTMENT nem számít bele. Ha az új tétel átlépné, a motor megkérdez — nem ír titokban. Ha mindig feloldod, a runway fogy, a 60 nap nem jön össze. Előbb a NEED. Ha a számláló 0, nem új WANT kell, hanem ACT.",
    deepDiveEn:
      "The monthly WANT cap lives on the posting side. NEED and INVESTMENT do not count. If a new posting would breach it, the engine asks — it does not write in silence. If you always override, runway shrinks and the 60 days never land. NEED first. If the counter is 0, you do not need a new WANT. You need ACT.",
    steps: [
      step("s1", "Keret", "Cap", "Nézd a havi WANT sapkát, mielőtt tételt írsz.", "See the monthly WANT cap before you post.", "WANT keret kijelző", "WANT cap readout"),
      step("s2", "Zár", "Lock", "Ha a motor megállít, ne írd felül automatikusan.", "If the engine stops you, do not override by habit.", "WANT túllépés párbeszéd", "WANT overage dialog"),
      step("s3", "Sorrend", "Order", "NEED előbb. A WANT a maradék.", "NEED first. WANT is what remains.", "NEED vs. WANT sorrend", "NEED vs WANT order"),
    ],
  }),
  dash({
    slug: "bank-import",
    categoryHu: "DO",
    categoryEn: "DO",
    titleHu: "Banki XML import",
    titleEn: "Bank XML import",
    whyHu: "Helyi kivonat, nem felhő. Szummában nem indul — előbb Slot.",
    whyEn: "A local extract, not a cloud. It will not start in Szumma — Slot first.",
    jargon: ["vat", "slot", "wms"],
    keywords: ["import", "xml", "kivonat", "bank"],
    deepDiveHu:
      "Az XML gomb a Tételek / DO sávon a helyi fájlt olvassa. Nincs banki API. HU sornál a motor bruttóból nettót és ÁFA-t számol; a gyanús sort megjelöli. Szumma nézetben az import tiltott, mert nem tudná, melyik Slotra essen. Ugyanaz a határ, mint egy WMS-csatoló nélküli dokk: a kapu helyi, a sor a te gépeden. Ne importálj kétszer ugyanazt — a dedup a hash.",
    deepDiveEn:
      "The XML button on Ledger / DO reads a local file. No bank API. On HU lines the engine derives net and VAT from gross; it flags a suspicious row. In Szumma import is blocked, because it would not know which Slot to land on. Same bound as a dock without a WMS hook: the gate is local, the queue is on your machine. Do not import the same file twice — dedup is the hash.",
    steps: [
      step("s1", "Slot", "Slot", "Válts Magán vagy Vállalkozás fülre. Szumma tilt.", "Switch to Personal or Business. Szumma blocks it.", "Import a Slot fülön", "Import on a Slot tab"),
      step("s2", "Fájl", "File", "Az XML gomb a helyi kivonatot kéri.", "The XML button asks for the local extract.", "XML kivonat gomb", "XML extract button"),
      step("s3", "ÁFA", "VAT", "HU sornál a motor számol. A gyanúst nézd át.", "On HU lines the engine computes. Review the flagged.", "Import ÁFA felülvizsgálat", "Import VAT review"),
    ],
  }),
  dash({
    slug: "horizont",
    categoryHu: "Tételek",
    categoryEn: "Ledger",
    titleHu: "6 / 12 / 24 hónap nézet",
    titleEn: "6 / 12 / 24 month view",
    whyHu: "A 6, 12, 24 hónap gomb nem új adat. Ugyanaz a tétel, más ablak.",
    whyEn: "The 6, 12, 24 month button is not new data. Same posting, different window.",
    jargon: ["cashflow", "runway", "slot"],
    keywords: ["6 hónap", "12 hónap", "24 hónap", "horizont", "hőtérkép", "tételek"],
    deepDiveHu:
      "A horizont gomb a kártya tetején van: 6, 12, 24 hónap. Nem tölt új fájlt, nem más Case. Ugyanaz a bisztró, ugyanazok a sorok. 6 hónapnál a hőtérkép májustól októberig sűrű: kevés oszlop, a közelmúlt. 12 hónapnál novemberig nyílik: több oszlop, ugyanaz a tétel vékonyabb sávban. A 24 hónap ugyanígy — hosszabb ablak, nem más igazság. Előbb a gomb, aztán a tábla. Ha a mintázat 12-nél ritkul, az a ritka hónap, nem a hiba.",
    deepDiveEn:
      "The horizon control sits on the card: 6, 12, 24 months. It does not load a new file or another Case. Same bistro, same rows. At 6 months the heatmap is dense from May to October: few columns, the recent past. At 12 months it opens back to November: more columns, the same posting in a thinner band. 24 months works the same — a longer window, not a different truth. Button first, then the table. If the pattern thins at 12, that is a sparse month, not a bug.",
    steps: [
      step(
        "s1",
        "Gomb",
        "Button",
        "A kártyán a 6, 12, 24 gomb. Előbb a horizont, aztán a tábla.",
        "The 6, 12, 24 button is on the card. Horizon first, then the table.",
        "Cashflow kártya, 6 hónap gomb",
        "Cashflow card, 6-month button",
        "/opl-frames/horizon-6-cashflow.webp",
      ),
      step(
        "s2",
        "6 hónap",
        "6 months",
        "6 hónap: májustól októberig, kevés oszlop. A közelmúlt.",
        "6 months: May to October, few columns. The recent past.",
        "Hőtérkép 6 hónap — sűrű közelmúlt",
        "Heatmap 6 months — dense recent past",
        "/opl-frames/horizon-6-heatmap.webp",
      ),
      step(
        "s3",
        "12 hónap",
        "12 months",
        "12 hónap: novembertől októberig, több oszlop. Ugyanaz a sor.",
        "12 months: November to October, more columns. Same row.",
        "Hőtérkép 12 hónap — hosszabb ablak",
        "Heatmap 12 months — longer window",
        "/opl-frames/horizon-12-heatmap.webp",
      ),
    ],
  }),
];
