import type { Locale } from "@/i18n/locale";
import { conceptFaq } from "@/content/concepts";
import {
  FAQ_CHECKLIST,
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
  checkTitle: "Gyors ellenőrző lista",
  checkLead: "Először ezt a listát nézd meg. A legtöbb elakadás itt dől el — jegyet csak utána nyiss.",
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
  pricingTocKb: "Tudásbázis",
  pricingTocLoyalty: "Hűségmodell",
  pricingTocAddons: "Bővítő modulok",
  pricingTocActive: "Aktív munkaterületek",
  pricingTocFrame: "Licenckeret és motorok",
  pricingTocLocal: "Lokális import/auto import",
  pricingTocWorkflow: "Működési elv",
  pricingTocDesktop: "ProDesktop",
  pricingTocEconomic: "Gazdasági szcenárió motor",
  pricingTocBcp: "Működésfolytonosság szcenárió motor",
  pricingTocEducation: "Oktatási szcenárió motor",
  pricingTocOwnLine: "Opcionális saját vonal",
  pricingRoadmapTitle: "Asztali alkalmazás és speciális motorok",
  pricingRoadmapLead:
    "A gazdasági, oktatási és működésfolytonossági motor a böngésződben, a saját gépeden fut, ugyanazon a licenckereten. A Case / Slot / Seat / Guest kvótát a licenc adja; motorfelvétel nem nyit új asztalt. Az asztali kliens külön ütemezéssel készül. Nincs külső felhős adatbázis; a szerkezet helyi-első, szigorú Poka-Yoke zárral.",
  pricingRoadmapDesktopTitle: "Pro Desktop",
  pricingRoadmapDesktopWhen: "Terv szerint • Várható érkezés: 2027. I. negyedév vége / II. negyedév eleje",
  pricingRoadmapDesktopBody:
    "A webes Case és Slot a Pro kerettel azonnal él. Az asztali early access ingyenes bónusz a Pro mellé, nem a mostani vásárlás feltétele. Addig a böngésző a munkahely.",
  pricingRoadmapBcpTitle: "Működésfolytonosság & reziliencia (BCP)",
  pricingRoadmapBcpWhen: "Elérhető",
  pricingRoadmapBcpBody:
    "Vállalati és közösségi felkészültség váratlan leállásokra: a vészhelyzeti szcenáriók a licenced meglévő Case / Slot keretében futnak, helyben, Poka-Yoke zárral. Motorfelvétel külön kvótát nem ad. A számolás a saját eszközödön marad; külső felhős adatbázist nem használunk.",
  pricingRoadmapEducationTitle: "Oktatási szcenárió motor",
  pricingRoadmapEducationWhen: "Elérhető",
  pricingRoadmapEducationBody:
    "Nem egy statikus oktatási környezetet szimulálunk, hanem fordítva: valódi, kritikus döntési helyzetek szimulációjával tanítunk meg gondolkodni, ahol a lépéseknek mérhető következményei vannak a rendszerben. Az oktatási motor a meglévő Case / Slot keretre ül — moduláris legó, külön licenckvótát nem ad. Helyben fut, Poka-Yoke zárral; külső felhős adatbázist nem használunk.",
  pricingAddonStatus:
    "Ez a modul most nem indítható. Előkészítés alatt áll, és megvásárolható bővítőként. További részletek a támogatási, míg a vásárlási folyamat a számlázási aloldalunkon található.",
  pricingAddonBuy: "Vásárlás a számlázáson",
  pricingAddonsTitle: "Bővítő modulok",
  pricingAddonsBody:
    "Örökös bővítők a párhuzamosan nyitott Case-ekre, Slotokra, Seat-ekre, vendégfiókokra és a helyi Edge-bekötésre — ezek kapacitást adnak a licenckerethez. A gazdasági, oktatási és BCP motor ugyanerre a keretre ül; motorfelvétel nem nyit új asztalt. A vásárlás a számlázási aloldalon történik.",
  pricingOwnLineTitle: "Opcionális saját vonal",
  pricingOwnLineWhen: "Egyedi asztali és app-kiadásokban · kapcsolható, soha nem kötelező",
  pricingOwnLineLead:
    "A nyilvános belépőígéret a saját eszközödön számol. Az opcionális saját vonal ezt a zárt kört nem bontja fel: ha bekapcsolod, a kapcsolat a Te oldaladról indul, titkosítva és közvetlenül — nem egy központi felhőn keresztül.",
  pricingOwnLineBody:
    "A vonal a Te kezdeményezésed. Nem figyelünk a háttérben, és nem nyitunk üzemeltetői betekintést a modellezett adatba. A számolás a saját gépeden marad.",
  pricingOwnLinePoints: [
    "Teljes adatszuverenitás: a modellezett adat nálad marad; a vonal nem hoz létre központi tárat, és nem ad betekintést a fejlesztőknek.",
    "Titkosított, közvetlen support-kapcsolat: ha segítséget kérsz, a beszélgetés zárt csatornán, a Te indításoddal jön létre.",
    "Helyi és mesh-alapú autonómia: a motor a saját eszközödön, illetve a Te általad összekötött helyi hálón is megállja a helyét — nem függ egy távoli adatközponttól.",
    "Hálózatfüggetlenség: a munka hálózati kapcsolat nélkül is él. A saját vonal opcionális; kikapcsolva a Szcenárió ugyanúgy a saját eszközödön számol.",
  ],
  pricingOwnLineClose:
    "A kapcsoló a beállításokban jelenik meg az egyedi igényű asztali és app-kiadásokban. Senkire nem erőltetjük, és nem része a nyilvános belépőígéretnek.",
  pricingAddonPriceMeta: "Ft nettó, örökös",
  pricingEconomicTitle: "Gazdasági szcenárió motor",
  pricingEconomicWhen: "Elérhető",
  pricingEconomicBody:
    "A gazdasági szcenárió motor a böngésződben, a saját gépeden fut. Basic, Pro és Enterprise ezen a motoron dolgozik — a webes Case és Slot azonnal él. A motor a licenc Case / Slot / Seat / Guest keretét használja; külön kvótát nem nyit.",
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
    "A licenc az egyidejűleg éles, vagyis párhuzamosan futó munkaterületek számához kötődik, nem pedig a rendszerben felhalmozott, archív adatok mennyiségéhez. A Case, a Slot, a Seat és a Guest a licenc kvótája. Az oktatási vagy működésfolytonossági motor felvétele ezt a keretet moduláris legóként bővíti, külön kvótát nem ad. Extra Case / Slot / Seat kapacitást vásárolsz, nem motort. A régebbi vagy inaktív esetek és slotok bármikor szabadon törölhetők, felülírhatók vagy újratölthetők extra költségek nélkül. Fizetni kizárólag abban az esetben kell, ha egyszerre több párhuzamos éles munkaterületet szeretnél nyitva tartani.",
  pricingFrameTitle: "Licenckeret: Case, Slot, Seat, Guest",
  pricingFrameBody:
    "A Case, a Slot, a Seat és a Guest a licenc kvótája: hány asztal, fül, szerkesztő és vendég lehet egyszerre nyitva. A gazdasági, oktatási és működésfolytonossági motor ugyanerre a keretre ül rá — moduláris legó, nem új asztal. Extra Case, extra Slot vagy extra Seat kapacitást ad; motorfelvétel kvótát nem. A számolás a saját eszközödön marad, Poka-Yoke zárral; külső felhős adatbázist nem használunk.",
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
  toTierPro: "Támogatás: Standard szint",
  toTierEnterprise: "Támogatás: Priority szint",
};

const en: typeof hu = {
  brand: "Szcenárió · support",
  homeTitle: "Szcenárió support",
  homeLead:
    "Start with the knowledge base and FAQ. Szcenárió calculates on your device: developers do not see or collect your data. No phone desk.",
  tips: "Tips",
    faq: "FAQ",
    faqTitle: "Frequently Asked Questions",
    checkTitle: "Quick checklist",
    checkLead: "Read this list first. Most stalls end here — open a ticket only after.",
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
  pricingTocKb: "Knowledge base",
  pricingTocLoyalty: "Loyalty model",
  pricingTocAddons: "Add-on modules",
  pricingTocActive: "Active workspaces",
  pricingTocFrame: "License frame and engines",
  pricingTocLocal: "Local import / auto import",
  pricingTocWorkflow: "How it works",
  pricingTocDesktop: "ProDesktop",
  pricingTocEconomic: "Economic scenario engine",
  pricingTocBcp: "Continuity scenario engine",
  pricingTocEducation: "Education scenario engine",
  pricingTocOwnLine: "Optional own line",
  pricingRoadmapTitle: "Desktop app and special engines",
  pricingRoadmapLead:
    "The economic, education and continuity engines run in your browser, on your machine, on the same licence frame. Case / Slot / Seat / Guest quota comes from the licence; adding an engine does not open a new desk. The desktop client follows a separate schedule. There is no external cloud database; the structure is local-first, with a strict Poka-Yoke lock.",
  pricingRoadmapDesktopTitle: "Pro Desktop",
  pricingRoadmapDesktopWhen: "Planned • Expected arrival: late Q1 / early Q2 2027",
  pricingRoadmapDesktopBody:
    "Web Case and Slot with the Pro plan are live at once. Desktop early access is a free bonus with Pro, not a condition of today’s purchase. Until then the browser is the workplace.",
  pricingRoadmapBcpTitle: "Business continuity & resilience (BCP)",
  pricingRoadmapBcpWhen: "Available",
  pricingRoadmapBcpBody:
    "Corporate and community readiness for unexpected stoppages: emergency scenarios run in your existing Case / Slot frame, locally, behind a Poka-Yoke lock. Adding the engine does not add quota. Calculation stays on your device; there is no external cloud database.",
  pricingRoadmapEducationTitle: "Education scenario engine",
  pricingRoadmapEducationWhen: "Available",
  pricingRoadmapEducationBody:
    "We do not simulate a static classroom. Quite the reverse: we teach people to think through genuine, critical decision situations, where steps have measurable consequences in the system. The education engine sits on the existing Case / Slot frame — modular Lego, no extra licence quota. It runs locally, behind a Poka-Yoke lock; there is no external cloud database.",
  pricingAddonStatus:
    "This module cannot be started now. It is in preparation, and can be purchased as an add-on. Further details are on the support page, while the purchase process is on billing.",
  pricingAddonBuy: "Purchase on billing",
  pricingAddonsTitle: "Add-on modules",
  pricingAddonsBody:
    "Perpetual add-ons for concurrently open Cases, Slots, Seats, guest accounts and local Edge intake — they add capacity to the licence frame. The economic, education and BCP engines sit on that same frame; adding an engine does not open a new desk. Purchase is on the billing page.",
  pricingOwnLineTitle: "Optional own line",
  pricingOwnLineWhen: "Custom desktop and app editions · optional, never required",
  pricingOwnLineLead:
    "The public promise is that Szcenárió calculates on your own device. The optional own line does not open that closed circle: if you turn it on, the connection starts from your side, encrypted and direct — not through a central cloud.",
  pricingOwnLineBody:
    "The line is yours to start. We do not watch in the background, and we do not open operator insight into modelled data. Calculation stays on your machine.",
  pricingOwnLinePoints: [
    "Full data sovereignty: modelled data stays with you; the line creates no central store and gives developers no view.",
    "Encrypted, direct support: if you ask for help, the conversation runs on a closed channel, started by you.",
    "Local and mesh-based autonomy: the engine holds on your own device, and on the local network you connect — it does not depend on a remote data centre.",
    "Network independence: work continues with no network. The own line is optional; with it off, Szcenárió still calculates on your device.",
  ],
  pricingOwnLineClose:
    "The switch appears in settings on custom desktop and app editions. We do not force it on anyone, and it is not part of the public entry promise.",
  pricingAddonPriceMeta: "HUF net, perpetual",
  pricingEconomicTitle: "Economic scenario engine",
  pricingEconomicWhen: "Available",
  pricingEconomicBody:
    "The economic scenario engine runs in your browser, on your machine. Basic, Pro and Enterprise work on this engine — web Case and Slot are live at once. The engine uses the licence Case / Slot / Seat / Guest frame; it does not open a separate quota.",
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
    "The license is tied to how many workspaces run live at the same time — not to how much archive data you keep. Case, Slot, Seat and Guest are the licence quota. Adding the education or continuity engine expands that frame as modular Lego; it does not add a separate quota. Extra Case / Slot / Seat buys capacity, not an engine. Older or inactive cases and slots can be deleted, overwritten or reloaded at any time with no extra charge. You pay only if you want several live workspaces open in parallel.",
  pricingFrameTitle: "License frame: Case, Slot, Seat, Guest",
  pricingFrameBody:
    "Case, Slot, Seat and Guest are the licence quota: how many desks, tabs, editors and guests may be open at once. The economic, education and continuity engines sit on that same frame — modular Lego, not a new desk. Extra Case, extra Slot or extra Seat add capacity; adding an engine does not add quota. Calculation stays on your device, behind a Poka-Yoke lock; there is no external cloud database.",
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
  toTierPro: "Support: Standard level",
  toTierEnterprise: "Support: Priority level",
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
  {
    q: "Where is the Laboratory?",
    a: "The flask in the header. That is the development tree: engine, module, quick indicator. Tap a berry; the picture lands on the desk.",
  },
  {
    q: "Does the language stay after I change pages?",
    a: "Yes. The header HU / EN button keeps lang=hu or lang=en in the address bar, and on this machine. If a link drops it, the lock writes it back.",
  },
];

const FAQ_CHECKLIST_EN: FaqItem[] = [
  {
    id: "check-modules",
    q: "Where do I find the modules?",
    a: "The **flask** in the header opens the Laboratory. There, on the development tree, you switch engines and modules: what you need lands on your desk. The quick indicators live on that tree too — do not hunt in the middle of the main desk.",
  },
  {
    id: "check-slots",
    q: "Where are Personal, Business and Project?",
    a: "The **tabs** under the header. A Case is one desk; a tab is a Slot — a separate till. Pick the tab first, then write a posting. A new tab is the **+** button; if the place is full, expansion is the licence, not a new engine.",
  },
  {
    id: "check-lang",
    q: "How do I switch language?",
    a: "The header **HU / EN** button. The choice stays in the address bar (`lang=hu` or `lang=en`) and on this machine — it does not jump back after a page change.",
  },
  {
    id: "check-lang-lost",
    q: "The language vanished, or the UI jumped to English?",
    a: "Read the address bar: it should show `lang=hu` or `lang=en`. If it is missing, the program writes back the saved choice. The same lock holds after a refresh.",
  },
  {
    id: "check-lock-ws",
    q: "How do I lock or open the workspace?",
    a: "The **lock** on the profile panel closes the local vault. Save first (Ctrl/Cmd+S), then lock. There is no cloud sign-out: the model stays on this machine. To open another Case, lock the current one.",
  },
  {
    id: "check-save",
    q: "How do I save or restore my data?",
    a: "In **Settings** you save to a local file and restore from the same place. There is no cloud account: what is on this machine is yours. Developers never see or collect it.",
  },
  {
    id: "check-lock",
    q: "Why does it ask for confirmation, or block a step?",
    a: "That is the mistake-proof lock: the program asks before it overwrites a cap, a tax rate or an import. Language does not vanish in silence either. Accept one question — do not switch the locks off.",
  },
  {
    id: "check-offline",
    q: "Does it work without a network?",
    a: "The desk does: calculation stays on your device. The support page needs a network; offline, local help and the lessons stay available.",
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
  {
    q: "What is the optional own line?",
    a: "On custom desktop and app editions you can turn on a direct, encrypted line — started by you. It is not required, not part of the public entry promise, and it does not open operator insight. The full description is in the Optional own line section of the Support pricing page.",
  },
  {
    q: "If I add an engine, do I get an extra Case?",
    a: "No. Case / Slot / Seat / Guest are the licence quota. Education or BCP sit on that same frame — modular Lego, no extra quota. An extra desk needs Extra Case or Extra Slot. Calculation stays on your device; there is no external cloud database.",
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
      category: locale === "en" ? "Quick checklist" : "Gyors ellenőrző lista",
      items: locale === "en" ? FAQ_CHECKLIST_EN : FAQ_CHECKLIST,
    },
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
    body: "Tab first (Personal, Business, Project), then the flask: modules switch on the development tree. The middle is the decision. 0 months = the air is gone: first hold the till.",
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

export function supportChecklist(locale: Locale): FaqItem[] {
  return locale === "en" ? FAQ_CHECKLIST_EN : FAQ_CHECKLIST;
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
  contentsTitle: string;
  bullets: string[];
  modulesHeading: string;
  modules: string[];
};

const MODULES_HU_BASIC = [
  "Master Baseline & Alapműködés",
  "CORE · PROJEKT · MAGÁN",
  "MASTER BASELINE",
  "ALAPMŰKÖDÉS — TÖRZS ÁLLAPOT",
  "Célok",
  "Részletes progresszió",
  "Megtakarítási alhalmazok",
  "Havi bevétel, kiadás és megtakarítás",
  "Tervezési és szimulációs (What-if)",
  "Tervezett kiadások / Projekt szimuláció",
  "What-if — munkaszimuláció",
  "Pénzáramlás",
  "Pénzügyi Valóság-Sokk & Adósságkezelés",
  "Cashflow – pénzáramlás és kivétel hőtérkép kimutatások több év adatai alapján",
  "Tartozások / Kötelezettségek",
  "Adósság-helyreállítás",
  "Eredménylevezetés",
  "Döntéstámogatás & Tanácsadás",
  "Magán-üzleti híd",
  "Döntési elágazások",
  "Okos tanácsadó*",
];

const MODULES_HU_PRO = [
  "Master Baseline & Alapműködés",
  "Core · Projekt · Magán",
  "Master Baseline",
  "Alapműködés — törzs állapot",
  "Célok",
  "Részletes progresszió",
  "Megtakarítási alhalmazok",
  "Havi bevétel, kiadás és megtakarítás",
  "Tervezési és szimulációs (What-if)",
  "Tervezett kiadások / Projekt szimuláció",
  "What-if — munkaszimuláció",
  "Pénzáramlás",
  "Pénzügyi Valóság-Sokk & Adósságkezelés",
  "Cashflow – pénzáramlás és kivétel hőtérkép kimutatások több év adatai alapján",
  "Tartozások / Kötelezettségek",
  "Adósság-helyreállítás",
  "Eredménylevezetés",
  "Döntéstámogatás & Tanácsadás",
  "Magán-üzleti híd",
  "Döntési elágazások",
  "Okos tanácsadó*",
];

const MODULES_EN = [
  "Master Baseline & base operation",
  "Core · Project · Personal",
  "Master Baseline",
  "Base operation — trunk state",
  "Goals",
  "Detailed progression",
  "Savings subsets",
  "Monthly income, spend and saving",
  "Planning & simulation (What-if)",
  "Planned spend / project simulation",
  "What-if — work simulation",
  "Cash flow",
  "Financial reality-shock & debt",
  "Cashflow — cash-flow and exception-heatmap reports from several years of data",
  "Liabilities / Payables",
  "Debt recovery",
  "Result walkthrough",
  "Decision support & advisory",
  "Personal–business bridge",
  "Decision forks",
  "Smart advisor*",
];

export function supportPricingTiers(locale: Locale): SupportPricingTier[] {
  if (locale === "en") {
    return [
      {
        id: "basic",
        title: "Basic plan",
        priceLine: "net €199 in year 1 — one-time fee [perpetual licence + 1 year of update rights]",
        ladder:
          "On the loyalty model: year 2 €149 (−25%): +1 year of update rights, year 3 €119 (−40%) +1 year of update rights, and from year 4 updates for life.",
        detail:
          "The Basic plan is designed for a single decision-maker: one concurrently active case, three active slots, plus one editor and one guest account. It includes full master-data handling, manual entry, file import (CSV, XML) and personal-wealth tracking. The app starts at once in your browser. Case / Slot / Seat / Guest are the licence quota; adding an education or BCP engine does not add quota. Inactive data may be overwritten without limit, and all computation runs entirely on your own machine.",
        contentsTitle: "What the Basic plan includes:",
        bullets: [
          "1 active case (no demo data): 3 active workspaces (Personal, Business1, Project1)",
          "1 editor (rights may be narrowed to a named person, not to an IP/device)",
          "1 guest account (read-only; rights may be narrowed to a named person)",
          "Unlimited overwrite of inactive slots — no archive fees",
          "Three outcome paths (pessimistic, realistic, optimistic)",
          "Built-in methods, primers and guides: from first project planning to running projects",
        ],
        modulesHeading: "MODULES:",
        modules: MODULES_EN,
      },
      {
        id: "pro",
        title: "Pro plan (Recommended)",
        priceLine: "€399 in year 1 — one-time net list entry [perpetual licence + 1 year of update rights].",
        ladder:
          "On the loyalty model: year 2 €299 (−25%): +1 year of update rights, year 3 €239 (−40%) +1 year of update rights, and from year 4 updates for life.",
        detail:
          "The Pro plan starts with 2 parallel empty active cases, each with 1 personal, 1 business and 1 project workspace, including shared movables and property if you need them. Schedulable local CSV/XML import is included. Processing stays on your machine throughout, with layered encryption. The Pro Desktop early-access build arriving in spring 2027 is free with Pro, and is not a condition of using the web app today. Case / Slot / Seat / Guest are the licence quota; adding an education or BCP engine does not add quota. Extras remain perpetual capacity modules.",
        contentsTitle: "What the Pro plan includes:",
        bullets: [
          "2 active cases (no demo data): 3 active workspaces per case (e.g. Personal, Business, Project), including shared movables and property",
          "1 editor (rights may be narrowed to a named person, not to an IP/device)",
          "5 guest accounts (read-only; rights may be narrowed to a named person)",
          "Local CSV/XML import, watched folder and your own rules on your machine",
          "Pro Desktop early access in spring 2027, free with Pro",
          "Extra active-case module: +€49 (yours for life)",
          "Three outcome paths (pessimistic, realistic, optimistic)",
          "Built-in methods, primers and guides: from first project planning to running projects",
        ],
        modulesHeading: "MODULES (full Basic plan inherited, plus Pro extras):",
        modules: MODULES_EN,
      },
      {
        id: "enterprise",
        title: "Enterprise & Teams",
        priceLine: "€799 in year 1 — one-time net list entry [perpetual licence + 1 year of update rights].",
        ladder:
          "On the loyalty model: year 2 €599 (−25%): +1 year of update rights, year 3 €479 (−40%) +1 year of update rights, and from year 4 updates for life.",
        detail:
          "The Enterprise plan provides team seats, several parallel active cases, automated accounting and bank-statement import (CSV, XML), and optional local sensor or Edge intake. Imported data stays closed on your machine. Case / Slot / Seat / Guest are the licence quota; adding an education or BCP engine does not add quota. The Enterprise Desktop add-on is in preparation (free access at launch) and does not affect launching existing web cases and slots. Because this plan needs a conversation, there is no self-serve checkout — please contact us for a quote.",
        contentsTitle: "What the Enterprise plan includes:",
        bullets: [
          "5 active cases (no demo data): 4 active slots per case, with scalable frames",
          "3 editors (rights may be narrowed to a named person, not to an IP/device)",
          "20 guest accounts (read-only; rights may be narrowed to a named person)",
          "Automated accounting/bank-statement import and sensor/Edge intake, run on your machine",
          "Enterprise Desktop add-on in preparation (free access at launch)",
          "Modular extras: case, slot, editor, guest account, Edge",
          "Three outcome paths (pessimistic, realistic, optimistic)",
          "Built-in methods, primers and guides",
        ],
        modulesHeading: "MODULES (full Basic and Pro features, plus enterprise automation and analytics):",
        modules: MODULES_EN,
      },
    ];
  }
  return [
    {
      id: "basic",
      title: "Basic csomag",
      priceLine: "nettó 199 000 Ft az 1. évben — egyszeri díj [örökéletű licensz +1 évre frissítés jogosultság]",
      ladder:
        "A hűségmodell alapján: 2. év 149 000 Ft (−25%): +1 évre frissítés jogosultság, 3. év 119 000 Ft (−40%) +1 évre frissítés jogosultság, a 4. évtől pedig örökéletű frissítés jár.",
      detail:
        "A Basic csomagot egyetlen döntéshozónak terveztük: egyidejűleg egy aktív esetet, három aktív slotot, valamint egy szerkesztői fiókot és egy vendégfiókot biztosít. Tartalmazza a teljes törzsadatkezelést, a kézi rögzítést, a fájl-alapú importot (CSV, XML) és a magánvagyon nyomon követését. Az alkalmazás azonnal elindul a böngésződben. A Case / Slot / Seat / Guest a licenc kvótája; oktatási vagy BCP motorfelvétel külön kvótát nem ad. Az inaktív adatok korlátozás nélkül, szabadon felülírhatók, a számítások pedig teljes egészében a saját gépeden futnak le.",
      contentsTitle: "A Basic csomag tartalma:",
      bullets: [
        "1 aktív eset (demó adat mentes): 3 aktív munkaterület (Magán, Vállalkozás1, Projekt1)",
        "1 szerkesztő (akár konkrét személyre szűkítve a jogkört, nem IP cím/eszközre)",
        "1 vendégfiók (olvasói hozzáférés, akár konkrét személyre szűkítve)",
        "Az inaktív slotok korlátlan felülírása — archív díjak nélkül",
        "Három kimeneti pálya (pesszimista, realista, optimista)",
        "Beépített módszertanok, segédletek, és útmutatások: Első projekt tervezéstől – projektek vezetéséig",
      ],
      modulesHeading: "MODULOK:",
      modules: MODULES_HU_BASIC,
    },
    {
      id: "pro",
      title: "Pro csomag (Ajánlott)",
      priceLine: "399 000 Ft az 1. évben — egyszeri, nettó listaáras belépő [örökéletű licensz +1 évre frissítés jogosultság].",
      ladder:
        "A hűségmodell alapján: 2. év 299 000 Ft (−25%): +1 évre frissítés jogosultság, 3. év 239 000 Ft (−40%) +1 évre frissítés jogosultság, a 4. évtől pedig örökéletű frissítés jár.",
      detail:
        "A Pro csomag már 2 párhuzamos aktív üres esettel indít, esetenként 1 magán, 1 vállalkozás, és egy projekt munkaterülettel, akár közös ingóság, és vagy ingatlan kezeléssel. Beütemezhető helyi CSV/XML import biztosítással. Az adatok feldolgozása mindvégig a te gépeden történik többszörös titkosítással. A 2027 tavaszán érkező Pro Desktop early access változat ingyenesen jár a Pro csomag mellé, de ez nem feltétele a jelenlegi webes használatnak. A Case / Slot / Seat / Guest a licenc kvótája; oktatási vagy BCP motorfelvétel külön kvótát nem ad. A bővítők örökös kapacitásmodulok maradnak.",
      contentsTitle: "A Pro csomag tartalma:",
      bullets: [
        "2 aktív eset (demó adat mentes): esetenként 3 aktív munkaterület (pl. Magán, Vállalkozás, Projekt), akár közös ingóság- és ingatlan kezeléssel",
        "1 szerkesztő (akár konkrét személyre szűkítve a jogkört, nem IP cím/eszközre)",
        "5 vendégfiók (olvasói hozzáférés, akár konkrét személyre szűkítve)",
        "Helyi CSV/XML import, figyelt mappa és saját szabályok a gépeden",
        "Pro Desktop early access 2027 tavaszán, a Pro csomag mellé ingyen",
        "Extra aktív eset modul: +49 000 Ft (örökös tulajdon)",
        "Három kimeneti pálya (pesszimista, realista, optimista)",
        "Beépített módszertanok, segédletek, és útmutatások: Első projekt tervezéstől – projektek vezetéséig",
      ],
      modulesHeading: "MODULOK (teljes Basic csomag örökölve, plusz Pro bővítések):",
      modules: MODULES_HU_PRO,
    },
    {
      id: "enterprise",
      title: "Enterprise & Csapatok",
      priceLine: "799 000 Ft az 1. évben — egyszeri, nettó listaáras belépő [örökéletű licensz +1 évre frissítés jogosultság].",
      ladder:
        "A hűségmodell alapján: 2. év 599 000 Ft (−25%): +1 évre frissítés jogosultság, 3. év 479 000 Ft (−40%) +1 évre frissítés jogosultság, a 4. évtől pedig örökéletű frissítés jár.",
      detail:
        "Az Enterprise csomag csapathelyeket, több párhuzamos aktív esetet, automatizált könyvelési és bankkivonat-importot (CSV, XML), valamint opcionális helyi érzékelő- vagy Edge-bekötést nyújt. Az importált adatok zártan a gépeden maradnak. A Case / Slot / Seat / Guest a licenc kvótája; oktatási vagy BCP motorfelvétel külön kvótát nem ad. Az Enterprise Desktop bővítő modul előkészítés alatt áll, de ez nem befolyásolja a meglévő webes esetek és slotok indítását. Mivel ez a csomag egyedi egyeztetést igényel, nincs önkiszolgáló checkout — kérjük, vedd fel velünk a kapcsolatot az ajánlatért.",
      contentsTitle: "Az Enterprise csomag tartalma:",
      bullets: [
        "5 aktív eset (demó adat mentes): esetenként 4 aktív slot, skálázható keretekkel",
        "3 szerkesztő (akár konkrét személyre szűkítve a jogkört, nem IP cím/eszközre)",
        "20 vendégfiók (olvasói hozzáférés, akár konkrét személyre szűkítve)",
        "Automatizált könyvelési/bankkivonat import és szenzoros/Edge adatgyűjtő bekötés a gépeden futtatva",
        "Enterprise Desktop bővítő modul előkészítés alatt (ingyenes hozzáféréssel a megjelenéskor)",
        "Moduláris bővítési lehetőségek: eset, slot, szerkesztő, vendégfiók, Edge",
        "Három kimeneti pálya (pesszimista, realista, optimista)",
        "Beépített módszertanok, segédletek, és útmutatások",
      ],
      modulesHeading: "MODULOK (teljes Basic és Pro funkciók, plusz vállalati szintű automatizációk és analitikák):",
      modules: MODULES_HU_PRO,
    },
  ];
}
