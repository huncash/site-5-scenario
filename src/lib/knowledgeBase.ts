import { capacityTipHu, seatGuestCapacityTipHu } from "@/config/planCopy";
import {
  DAILY_OPS_BODY,
  PRO_ARTICLE_BODY,
  PRO_ARTICLE_SUMMARY,
  PRO_ARTICLE_TITLE,
  WHY_BODY,
  WHY_LEAD,
} from "@/content/branding";

export type KnowledgeBaseCategoryId =
  | "concepts"
  | "workspaces"
  | "promote"
  | "loans"
  | "cashflow"
  | "bank-sync"
  | "settings"
  | "scenario"
  | "lessons"
  | "nav";

export type KnowledgeBaseArticleId =
  | "concept-case-slot"
  | "concept-pro"
  | "concept-seat-guest"
  | "workspaces-projects"
  | "promote-member-loan"
  | "loans-liabilities"
  | "cashflow-savings"
  | "bank-sync-dedup"
  | "settings-danger-zone"
  | "piggy-expense-disabled"
  | "goals-remaining"
  | "goals-overview"
  | "goals-progress"
  | "buckets-overview"
  | "loan-repayment-linking"
  | "new-workspace"
  | "project-badges"
  | "settings-explicit-save"
  | "ledger-overview"
  | "ledger-count"
  | "ledger-income"
  | "ledger-expense"
  | "ledger-saving"
  | "ledger-loan-principal"
  | "ledger-balance"
  | "ledger-filters"
  | "ledger-bulk-actions"
  | "deals-overview"
  | "deals-margin"
  | "deals-promote"
  | "deals-consolidation"
  | "pro-chart"
  | "why-szcenario"
  | "kahn-rand"
  | "lesson-community"
  | "lesson-household"
  | "lesson-bcp"
  | "lesson-demography"
  | "lesson-campus"
  | "lesson-kahn"
  | "labs-dev-tree"
  | "poka-yoke-guard"
  | "language-persist";

export type KnowledgeBaseArticle = {
  id: KnowledgeBaseArticleId;
  category: KnowledgeBaseCategoryId;
  title: string;
  summary: string; // 1-2 mondat tooltiphez
  body: string; // részletes leírás (plain text / markdown-like)
  titleEn?: string;
  summaryEn?: string;
  bodyEn?: string;
  tags?: string[];
};

export const KB_CATEGORIES: Array<{ id: KnowledgeBaseCategoryId; title: string }> = [
  { id: "concepts", title: "0. Fogalmak & Kapacitások" },
  { id: "workspaces", title: "1. Slot / Munkaterek & Projektek" },
  { id: "promote", title: "2. Élesítés & Tagi kölcsön" },
  { id: "loans", title: "3. Hitelek & Kötelezettségek" },
  { id: "cashflow", title: "4. Cashflow & Megtakarítások" },
  { id: "bank-sync", title: "5. Helyi kivonat-import (CSV / XML)" },
  { id: "settings", title: "6. Beállítások & Danger Zone" },
  { id: "scenario", title: "7. P-R-O forgatókönyv & grafikon" },
  { id: "lessons", title: "8. Szcenárió-leckék" },
  { id: "nav", title: "9. Laboratórium, nyelv, hibabiztos zár" },
];

export const KB_ARTICLES: KnowledgeBaseArticle[] = [
  {
    id: "concept-case-slot",
    category: "concepts",
    title: "Case vs Slot – mi a különbség?",
    summary:
      "A Case az asztal. A Slot a fül rajta: Magán, Vállalkozás, Projekt — külön kassza.",
    titleEn: "Case vs Slot — what is the difference?",
    summaryEn: "The Case is the desk. A Slot is a tab on it: Personal, Business, Project — separate till.",
    body: `🎯 Fogalom
- **Case:** az asztal, amin dolgozol.
- **Slot:** a fül az asztalon (Magán, Vállalkozás, Projekt). A tétel oda esik, amelyik nyitva van. Nem KPI-csempe.

⚙️ Kapacitás
- ${capacityTipHu()}
- A Case / Slot a licenchez tartozik. Oktatási vagy BCP motor külön kvótát nem ad — ugyanaz a keret, moduláris legó.

💡 Tip
- A Slot a fiók. A három pálya abban a fiókban: rossz / közepes / jó. A gyors mutatók a lombik fáján vannak — az nem Slot.`,
    bodyEn: `🎯 Concept
- **Case:** the desk you work on.
- **Slot:** a tab on the desk (Personal, Business, Project). A posting lands on the open tab. Not a KPI tile.

⚙️ Capacity
- Case / Slot belong to the licence. An education or emergency engine does not add quota — same frame, modular add-on.

💡 Tip
- The Slot is the drawer. The three paths run inside that drawer. Quick indicators live on the flask tree — that is not a Slot.`,
    tags: ["case", "slot", "fogalom", "kapacitás"],
  },
  {
    id: "concept-pro",
    category: "concepts",
    title: "P-R-O Szcenárió – mit jelent?",
    summary:
      "Rossz / közepes / jó kimenet — ugyanaz a múlt, három számolás. Nem megmondja a jövőt.",
    body: `🎯 Fogalom
- A **P-R-O** három gomb: Pesszimista, Realista, Optimista.
- Ugyanazok a tételek, három világ. Azt mutatja: ha rosszul, ha átlagosan, ha jól alakul, meddig bírja a kassza.

⚙️ Miért nem egy szám?
- Egy szám hazudna. A kérdés: melyik ágon meddig bírod, és hol vágsz.

💡 Tip
- Ne az „igazit” keresd a grafikonon. Olvasd a P sávot: ott fogy el először a levegő.`,
    tags: ["pro", "p-r-o", "szcenárió", "fogalom"],
  },
  {
    id: "concept-seat-guest",
    category: "concepts",
    title: "Seat vs Guest",
    summary:
      "A Seat az, aki írhat; a Guest csak néz.",
    body: `🎯 Fogalom
- **Seat:** szerkesztői fiók (teljes szerkesztési és modelligazítási jogkörrel).
- **Guest:** vendégfiók csak olvasói joggal (nézelődő / ellenőrző hozzáférés).

⚙️ Kapacitás
- ${seatGuestCapacityTipHu()}
- Seat és Guest a licenckeret. Motorfelvétel nem nyit szerkesztőt és vendéget.

💡 Tip
- A Guest nem írhatja át a modelljeidet; a kulcs bármikor visszavonható.`,
    tags: ["seat", "guest", "fogalom", "hozzáférés"],
  },
  {
    id: "workspaces-projects",
    category: "workspaces",
    title: "Slotok & Projektek – mi a különbség?",
    summary:
      "A Slot típusa (Magán / Vállalkozás / Projekt) segít ugyanazt a pénzügyi adatot más fókuszban látni: mindennapi keret, céges cashflow+ÁFA, vagy jövőbeli tervezés.",
    body: `🎯 Mire jó?
- Hogy ugyanazokat a tételeket a megfelelő szemüvegen keresztül lásd: Magán (elkölthető keret), Vállalkozás (nettó+ÁFA és tartalék), Projekt (tervezés/szimuláció).
- Ezek a típusok egy **Case**-en belüli **Slotok** — nem külön Case-ek.

⚙️ Hogyan működik?
- Magán: bruttó szemlélet + perselyek/célok.
- Vállalkozás: nettó tárolás + ÁFA logika, cashflow és ÁFA tartalék.
- Projekt: fázis (Szimuláció / Pilot / Prep) + tétel státusz (tervezett / lekötött / tényleges) → P-R-O Szcenárió.

💡 Tipp
- Kezdd Projekttel, ha még formálódik az ötlet. Ha beérik, egy kattintással „élesítheted” (Promote) új Vállalkozássá vagy csatolhatod meglévőhöz.`,
    tags: ["projekt", "pilot", "szimuláció", "ernyő", "slot", "munkatér"],
  },
  {
    id: "promote-member-loan",
    category: "promote",
    title: "Élesítés (Promote) & Sunk costs – hogyan működik?",
    summary:
      "Az élesítés egy biztonságos átemelés: előtte automata snapshot készül, majd kiválaszthatod a célt és (opcionálisan) a korábbi ráfordítások pénzügyi értelmezését.",
    body: `🎯 Mire jó?
- Kockázatmentes tervezésből (projekt) kontrolláltan jutsz el az éles működésig (vállalkozás), úgy hogy közben vissza tudsz lépni.

⚙️ Hogyan működik?
1) Snapshot: automatikus mentés a jelenlegi állapotról.
2) Cél: új Vállalkozás vagy csatolás meglévőhöz.
3) Sunk costs (opcionális): a korábbi ráfordítások átminősíthetők (pl. „Céges előkészítési költség” vagy „Tagi kölcsön”).

💡 Tipp
- Élesítés előtt nézd át a nagy tételeket (ÁFA kezelés, törlesztések, átvezetések), és csak utána promótáld – így a riportok és tartalékok azonnal „helyükre kerülnek”.`,
    tags: ["promote", "snapshot", "tagi", "sunk"],
  },
  {
    id: "loans-liabilities",
    category: "loans",
    title: "Hitelek és kötelezettségek — hatás a céltartalékra",
    summary:
      "Az aktív hitelek fennálló tőkéje és havi törlesztője beleszámít a fix havi kiadásokba, így a 30/60/90 napos céltartalék reálisabb lesz.",
    body: `🎯 Mire jó?
- Hogy lásd: mennyi „fix teher” van a rendszerben, és ez hány hónap biztonsági tartalékot igényel.

⚙️ Hogyan működik?
- Fennálló tőke és eredeti összeg alapján látod az előrehaladást.
- Havi törlesztő automatikusan beleszámít a fix havi kiadásokba → a céltartalék számítás reálisabb.
- Lejárat segít időzítési kockázatot és csúcs-terhelést látni.

💡 Tipp
- A céltartalék célértéket állítsd 3–6 hónapra: ha a fix kiadások változnak (pl. új lízing), azonnal látod a hatását.`,
    tags: ["hitel", "lízing", "törlesztő", "runway"],
  },
  {
    id: "loan-repayment-linking",
    category: "loans",
    title: "Törlesztés tőke-visszagörgetéssel (loan link)",
    summary:
      "Ha egy tételt „Hitel törlesztés” kategóriára állítasz és hitelhez kötöd, a rendszer automatikusan csökkenti a fennálló tőkét a tőkerésszel.",
    body: `🎯 Mire jó?
- Hogy a hitel állapotod mindig naprakész legyen: a törlesztés „tőkerész” része csökkenti a fennálló tartozást.

⚙️ Hogyan működik?
1) Tételnél válaszd a „Hitel törlesztés” kategóriát.
2) Kösd a megfelelő aktív hitelhez.
3) (Opcionális) add meg a tőkerészt.

Mentéskor:
- a fennálló tőke csökken a tőkerésszel,
- szerkesztéskor a rendszer visszagörgeti a korábbi tőkerész hatását, majd alkalmazza az újat.

💡 Tipp
- Ha nincs kéznél bontás, hagyd üresen a tőkerészt: a rendszer konzervatívan számol (jó „minimum terv” készítéshez).`,
    tags: ["törlesztés", "tőkerész", "visszagörgetés"],
  },
  {
    id: "cashflow-savings",
    category: "cashflow",
    title: "Cashflow & megtakarítások – mit jelent a „szabad keret”?",
    summary:
      "Ami ÁFA és persely után elkölthető. A bruttó nem a tied — a fénykép sem a történet.",
    body: `🎯 Mire jó?
- Gyors döntés: mennyi mehet ki anélkül, hogy a bevallás vagy a cél üresen marad.

⚙️ Hogyan működik?
- Szabad keret ≈ ami a számlán van − perselyek − zárolt ÁFA.
- A persely félretett pénz. A kiadás a cashflow-ból megy ki.

💡 Tip
- Először a 60 nap. Aztán a persely. Ha a runway 0, ne új WANT-ot nyiss — ACT kell.`,
    tags: ["szabad keret", "persely", "célok", "cashflow"],
  },
  {
    id: "goals-remaining",
    category: "cashflow",
    title: "Célok – hogyan számolódik a hátralévő és a havi célösszeg?",
    summary:
      "A hátralévő a célösszeg mínusz a célhoz tartozó (név szerint egyező) persely(ek) + általános megtakarítás összege; a havi cél a hátralévő elosztva a hátralévő hónapok számával.",
    body: `🎯 Mire jó?
- Hogy tudd: mennyi hiányzik a célodig, és ezt mennyi havi félretétellel tudod kényelmesen elérni.

⚙️ Hogyan működik?
- Hátralévő = célösszeg − (általános megtakarítás + a céllal azonos nevű al-perselyek összege).
- Havi cél = hátralévő / hátralévő hónapok (a cél dátumáig), kerekítve.

💡 Tipp
- Adj a célhoz egy azonos nevű al-perselyt, és onnan vezesd át a félretételt: így tisztán látod, melyik cél mennyit „kapott”.`,
    tags: ["cél", "hátralévő", "havonta", "persely"],
  },
  {
    id: "piggy-expense-disabled",
    category: "cashflow",
    title: "Persely hozzárendelés – hogyan segít a félretételben?",
    summary:
      "💡 Megtakarítási lehetőség: a persely a pozitív félretételt jelöli, így célokra és tartalékra tudsz elkülöníteni – miközben a kiadások tisztán a valós cashflow-t mutatják.",
    body: `🎯 Mire jó?
- Hogy a persely egyenleg valódi „félretett keretet” jelentsen (tartalék, cél, felhalmozás), és a szabad keret ne legyen félrevezető.

⚙️ Hogyan működik?
- Perselyt pozitív tételekhez tudsz társítani (bevétel/megtakarítás), így elkülönített keretet építesz.
- A kiadások automatikusan csökkentik a valós egyenleget és a cashflow-t, ezért nem „perselyezésre” valók.

💡 Tipp
- Ha egy kiadásra készülsz (pl. biztosítás, szerviz), csinálj „felkészülési perselyt”, és a bevételeidből vezess át rá havonta egy kis összeget.`,
    tags: ["persely", "kiadás", "szabály"],
  },
  {
    id: "local-statement-import",
    category: "bank",
    title: "Helyi kivonat-import — ne jöjjön be kétszer ugyanaz",
    summary:
      "CSV, XML a gépedről. A rendszer megjegyzi a fájl ujjlenyomatát a Slotra, hogy ne importáld kétszer. A számolás a böngésződben marad.",
    body: `🎯 Mire jó?
- Hogy a kivonat a gépedről jöjjön be, ne a felhőből. És ne legyen véletlen dupla tétel.

⚙️ Hogyan működik?
- Magán: XML (SpreadsheetML). Vállalkozás (Pro): CSV. Figyelt mappa: Pro, belépéskor a tárolt mappa, ha a böngésző engedélyezi.
- A fájl tartalmából ujjlenyomat készül. Ugyanaz a fájl másik Slotra mehet.
- Beállításokban törölhető az import-emlékezet. Importnál választható a kényszerített újraolvasás.

💡 Tipp
- Ha hónapzáráskor több fájlt mozgatgatsz, tarts egy külön „Import” mappát és nevezd egységesen (dátum + számla), így az ellenőrzés gyorsabb.`,
    tags: ["bank", "dedup", "sha256", "force"],
  },
  {
    id: "settings-danger-zone",
    category: "settings",
    title: "Beállítások & Danger Zone – mit csinál pontosan?",
    summary:
      "A Danger Zone műveletek visszafordíthatatlan vagy nagy hatású törlések: import memória törlés, Slot ürítés, és végleges Slot törlés.",
    body: `🎯 Mire jó?
- Hogy kontrolláltan „rendbe tudd tenni” a munkateredet (pl. újrakezdés, teszt adatok takarítása), és közben tudd pontosan, mi fog változni.

⚙️ Hogyan működik?
- Import memória törlése: csak a beolvasott fájl-hash listát üríti (újraimport lehetővé válik).
- Workspace purge: törli az adott munkatér tételeit + import előzményeket (és a kapcsolódó adatokat).
- Végleges törlés: a munkatér meta is kikerül, és a hozzá tartozó adat is törlődik.

💡 Tipp
- Mielőtt nagy törlést indítasz, készíts egy titkosított mentést – így bármikor visszaállhatsz egy stabil pontra.`,
    tags: ["danger", "purge", "törlés"],
  },
  {
    id: "settings-explicit-save",
    category: "settings",
    title: "Miért nincs autosave a Beállításokban?",
    summary:
      "Az autosave gyakran véletlen és auditálhatatlan változtatásokhoz vezet. Itt minden módosítás explicit mentéshez kötött.",
    body: `🎯 Mire jó?
- Hogy tudatosan, „ellenőrző pontokkal” állíts be mindent: egy gombnyomás = egy döntés, ami visszakövethető.

⚙️ Hogyan működik?
- A beállítások módosítása „draft” állapotban történik.
- Csak a „Módosítások mentése” gomb rögzíti véglegesen.

💡 Tipp
- Állíts be egyszerre 1–2 dolgot, ments, és nézd meg a hatást a főképernyőn – így gyorsan kialakul a saját rutinod.`,
    tags: ["autosave", "explicit", "mentés"],
  },
  {
    id: "new-workspace",
    category: "workspaces",
    title: "„+ Új…” – hogyan válasszak Slot típust?",
    summary:
      "Magán, Vállalkozás vagy Projekt — új fül ugyanazon az asztalon. Extra hely a lombik fáján a kapacitás, nem új motor.",
    titleEn: "“+ New…” — which Slot type?",
    summaryEn:
      "Personal, Business or Project — a new tab on the same desk. Extra room on the flask tree is capacity, not a new engine.",
    body: `🎯 Mire jó?
- Hogy a megfelelő szemüveget kapd: Magán, Vállalkozás vagy Projekt — egy Case-en belüli új Slotként.
- A gyors mutatók a lombik fáján vannak, nem a fülek között.

⚙️ Hogyan működik?
- Magán: személyes költések + megtakarítások (elkölthető keret).
- Vállalkozás: céges cashflow + ÁFA + jogcímek (vezetői nézet).
- Projekt: szimuláció / próbaüzem / előkészítés — külön fiók, ugyanaz az asztal.
- Ha a hely betelt, a bővítés a licenc (Extra Case / Extra Slot), nem egy új motor.

💡 Tipp
- Ha még formálódik az ötlet, indulj Projekttel. Akkor élesíts, amikor a számok és a folyamat összeállt.`,
    bodyEn: `🎯 What it is for
- The right lens: Personal, Business or Project — a new Slot inside one Case.
- Quick indicators live on the flask tree, not among the tabs.

⚙️ How it works
- Personal: household spend and savings (spendable cap).
- Business: company cashflow, VAT and legal titles.
- Project: simulation / trial / prep — another drawer, same desk.
- If the place is full, expansion is the licence (Extra Case / Extra Slot), not a new engine.

💡 Tip
- If the idea is still forming, start as a Project. Promote only when the numbers and the process hold.`,
    tags: ["új", "slot", "munkatér", "típus"],
  },
  {
    id: "project-badges",
    category: "workspaces",
    title: "Projekt badge-ek (Szimuláció / Pilot / Prep) – mit jelentenek?",
    summary:
      "A badge jelzi, hogy a projekt milyen fázisban van, és hogyan értelmezzük a tételek státuszát és az összesítéseket.",
    body: `🎯 Mire jó?
- Hogy azonnal lásd: ez a projekt inkább „ötlet-labor”, „pilot futás”, vagy „előkészítés” – és ehhez igazodjanak a döntések.

⚙️ Hogyan működik?
- Szimuláció: kockázatmentes tervezés, gyakran „tervezett” tételekkel.
- Pilot: valós futtatás; ernyővállalkozáshoz kapcsolható, és (beállítástól függően) beleszámíthat összesítésekbe.
- Prep: sunk költségek és előkészítési tételek gyűjtése az élesítéshez.

💡 Tipp
- Pilotnál érdemes hamar beállítani a státusz-rutint (tervezett → lekötött → tényleges), így a fedezeti pont és a céltartalék előrejelzés sokkal tisztább.`,
    tags: ["badge", "pilot", "simulation", "prep"],
  },
  {
    id: "ledger-overview",
    category: "cashflow",
    title: "Tételek (Excel nézet) – hogyan használd gyors döntésekhez?",
    summary:
      "🎯 Döntéstámogató lista: egy képernyőn látod a teljes képet (bevétel, kiadás, megtakarítás, törlesztés), és szűrhetsz a lényegre.",
    body: `🎯 Mire jó?
- Hogy gyorsan átlásd: mi történt a pénzzel ebben a munkatérben, és mi a „nettó eredmény” a kiválasztott szűrők szerint.

⚙️ Hogyan működik?
- A felső mini KPI-k a jelenlegi szűrés alapján számolódnak (összesítés).
- A lista sorai bruttó pénzmozgást mutatnak; business módban nettó/bruttó bontás is látható.

💡 Tipp
- Ha audit jelleggel nézed: szűrj először „Hitel / Tervezett” vagy „Megtakarítás / Átvezetés” nézetre, így gyorsan elkülönülnek a speciális tételek.`,
    tags: ["tételek", "ledger", "excel", "kpi"],
  },
  {
    id: "ledger-count",
    category: "cashflow",
    title: "Tételek darabszáma – mit jelent?",
    summary: "🎯 Gyors aktivitás jelző: hány tétel vesz részt a jelenlegi szűrésben/nézetben.",
    body: `🎯 Mire jó?
- Megmutatja, mennyire „sűrű” a lista: 20 tétel = kézi áttekintés, 200+ tétel = érdemes szűrni.

⚙️ Hogyan működik?
- A darabszám a jelenleg szűrt (látható logikai készlet) elemeit számolja.

💡 Tipp
- Ha sok tétel van, kezdd a Bevétel/Kiadás szűrőkkel, majd csak utána nézd a részleteket soronként.`,
    tags: ["darabszám", "szűrő", "tételek"],
  },
  {
    id: "ledger-income",
    category: "cashflow",
    title: "Összes bevétel – mire figyelj?",
    summary: "🎯 Beáramló források összesen: segít látni, miből finanszírozható a működés és a félretétel.",
    body: `🎯 Mire jó?
- Megmutatja, mennyi pénz érkezett be a kiválasztott időszak/szűrés alapján.

⚙️ Hogyan működik?
- A listában szereplő bevétel típusú tételek összegzése.
- Business módban nettó tárolás mellett bruttó érték is megjelenhet (megjelenítés/tervezés célból).

💡 Tipp
- Ha a bevétel ingadozó, a fix költségeket érdemes a „reális” bevétel alsó sávjához igazítani.`,
    tags: ["bevétel", "cash-in", "kpi"],
  },
  {
    id: "ledger-expense",
    category: "cashflow",
    title: "Összes kiadás – mit mutat?",
    summary: "🎯 Kifolyó költségek: segít megtalálni a legnagyobb „szivárgásokat” és stabilizálni a cashflow-t.",
    body: `🎯 Mire jó?
- Azonnal jelzi, mekkora a pénzkiáramlás, és hogy a működés „súlya” mekkora a bevételekhez képest.

⚙️ Hogyan működik?
- A kiadás típusú tételek összegzése a jelenlegi szűrésben.

💡 Tipp
- Ha gyorsan kell levegő, először a fix, minden hónapban kimenő kiadásokat nyúld — ezek hónapról hónapra viszik a kasszát.`,
    tags: ["kiadás", "cash-out", "kpi"],
  },
  {
    id: "ledger-saving",
    category: "cashflow",
    title: "Megtakarítás – hogyan segít a persely szemlélet?",
    summary: "🎯 Félretételi fegyelem: külön keretként kezeli a célokra és tartalékra elkülönített összegeket.",
    body: `🎯 Mire jó?
- Hogy a „félretett” pénz ne keveredjen az elkölthető kerettel, és a célok haladása látható legyen.

⚙️ Hogyan működik?
- Megtakarítás/saving típusú tételek összegzése (pozitív félretétel).
- A persely hozzárendelés segít célokhoz kötni a félretett keretet.

💡 Tipp
- A félretételt kezeld úgy, mint egy „kötelező kiadást” a hónap elején – így a maradék keret valóban elkölthető.`,
    tags: ["megtakarítás", "persely", "kpi"],
  },
  {
    id: "ledger-loan-principal",
    category: "loans",
    title: "Tőketörlesztés / Hitel – mire jó ez a KPI?",
    summary: "🎯 Adósságcsökkentés fókusz: megmutatja, mennyi tőke épült le törlesztésen keresztül.",
    body: `🎯 Mire jó?
- Segít szétválasztani: mi volt „működési költség” és mi volt „tőkeépítés” (tartozás csökkentése).

⚙️ Hogyan működik?
- A hitelhez kötött törlesztés tételek tőkerészének összegzése.
- A „tervezett/függő” darabszám segít látni, mennyi tétel még nem tényleges (projekt státuszok).

💡 Tipp
- Ha cél a gyors tehercsökkentés: külön kövesd a tőkerészt, és nézd meg, hogyan változik tőle a céltartalék és a szabad keret.`,
    tags: ["hitel", "tőke", "törlesztés"],
  },
  {
    id: "ledger-balance",
    category: "cashflow",
    title: "Egyenleg – mit jelent a nettó eredmény a listában?",
    summary: "🎯 Gyors eredmény mutató: bevétel − kiadás − megtakarítás (a jelenlegi szűrés szerint).",
    body: `🎯 Mire jó?
- Egy mondatban: „pluszban vagy mínuszban volt ez a munkatér a kiválasztott tételek alapján?”

⚙️ Hogyan működik?
- Az összesített bevétel, kiadás és megtakarítás különbsége.
- Nettó/bruttó megjelenítés a workspacetől és a beviteli módtól függően.

💡 Tipp
- Ha az egyenleg negatív, először szűrj ki a nagy egyszeri tételekre (pl. beruházás), és nézd meg a „működési” egyenleget külön.`,
    tags: ["egyenleg", "balance", "kpi"],
  },
  {
    id: "ledger-filters",
    category: "cashflow",
    title: "Szűrők (Összes / Bevétel / Kiadás / Megtakarítás / Hitel)",
    summary: "🎯 Fókusz kapcsolók: ugyanazt a listát más szemszögből látod, így gyorsabb a döntés.",
    body: `🎯 Mire jó?
- Hogy 1 kattintással „tiszta képet” kapj egy tételcsoportról (pl. csak kiadások, csak félretétel).

⚙️ Hogyan működik?
- A szűrők a listát és a felső KPI összesítést is együtt állítják.

💡 Tipp
- Használd sorrendben: Összes → Kiadás → Hitel/tervezett. Így gyorsan megtalálod, mi a működés és mi a stratégiai tétel.`,
    tags: ["szűrő", "ledger"],
  },
  {
    id: "ledger-bulk-actions",
    category: "cashflow",
    title: "Tömeges kijelölés és műveletek – mire jó?",
    summary: "🎯 Gyors karbantartás: több tételt egyszerre törölhetsz, perselyezhetsz vagy projektbe másolhatsz.",
    body: `🎯 Mire jó?
- Sok tételnél időt spórol: nem egyesével kell kattintgatni.

⚙️ Hogyan működik?
- A kijelölt tételekre egy művelet fut (törlés / persely / projekt másolat).
- A rendszer best‑effort kezeli a kapcsolódó logikákat (pl. törlesztés hatások, belső átvezetések).

💡 Tipp
- Perselyezésnél előbb szűrj Bevétel vagy Megtakarítás nézetre, így a kijelölés „tiszta” és gyors.`,
    tags: ["bulk", "kijelölés", "műveletek"],
  },
  {
    id: "goals-overview",
    category: "cashflow",
    title: "Célok / Megtakarítási célok – hogyan segít a rendszer?",
    summary: "🎯 Konkrét pénzügyi célokra bontja a félretételt, és megmutatja a következő lépést (hátralévő, havonta).",
    body: `🎯 Mire jó?
- Hogy a megtakarítás ne „maradék pénz” legyen, hanem tudatos, mérhető terv.

⚙️ Hogyan működik?
- A célhoz számítjuk az általános megtakarítást + a cél nevével egyező alhalmazokat.
- Ezekből jön ki a hátralévő és a javasolt havi tempó.

💡 Tipp
- Ne csak egy nagy célt tarts: bontsd 2–3 részre (vésztartalék, adó/ÁFA, fejlesztés), így a döntések gyorsabbak.`,
    tags: ["célok", "megtakarítás"],
  },
  {
    id: "goals-progress",
    category: "cashflow",
    title: "Célösszeg vs. gyűjtött összeg – haladás",
    summary: "🎯 Haladás %: látod, mennyire vagy közel a célhoz, és mennyi a következő logikus lépés.",
    body: `🎯 Mire jó?
- Motiváció + döntéstámogatás: elég‑e a jelenlegi tempó, vagy érdemes módosítani a havi félretételt?

⚙️ Hogyan működik?
- Haladás % = (gyűjtött / célösszeg) × 100, plafon 100%.

💡 Tipp
- Ha a határidő közeleg, inkább emeld a havi tempót kicsit, mint hogy a végén egy nagy „ugrást” kelljen finanszírozni.`,
    tags: ["haladás", "progress", "cél"],
  },
  {
    id: "buckets-overview",
    category: "cashflow",
    title: "Megtakarítási alhalmazok (perselyek) – miért hasznosak?",
    summary: "🎯 Mentális könyvelés: külön „zsebekben” látod a félretett keretet (általános vs. célhoz kötött).",
    body: `🎯 Mire jó?
- Hogy egyszerre legyen átlátható a tartalék és a célokra elkülönített pénz.

⚙️ Hogyan működik?
- Alap (általános) megtakarítás + opcionális alhalmazok (pl. „Nyaralás”, „Szerviz”).
- Célhoz kötésnél a cél nevével egyező alhalmaz beleszámít a cél haladásába.

💡 Tipp
- Hozz létre alhalmazt minden nagyobb, ritkább kiadásra (biztosítás, adó, szerviz). Így a „hirtelen” kiadás valójában tervezett lesz.`,
    tags: ["alhalmaz", "persely", "megtakarítás"],
  },
  {
    id: "deals-overview",
    category: "workspaces",
    title: "Üzletek / Üzletágak – mire jó a teljesítmény nézet?",
    summary: "🎯 Profitabilitás fókusz: látod, melyik ügylet/üzletág termel, és hogyan áll össze a konszolidált kép.",
    body: `🎯 Mire jó?
- Hogy ne csak bevételt láss, hanem árrést/profitot is (mi „éri meg” valójában).

⚙️ Hogyan működik?
- A kapcsolt bevételekből és beszerzésekből árrést számolunk (Ft és %).
- A projekt élesítés (Promote) segít a tervezésből üzletággá/céggé lépni.
- Pilot/ernyő konszolidációval a projektek hatása megjelenhet a fő cég nézeteiben.

💡 Tipp
- Először a lezárt ügyleteket nézd (valós margin), utána a nyitottakat (pipeline). Így nem keveredik a terv és a tény.`,
    tags: ["üzlet", "árrés", "profit", "konszolidáció", "promote"],
  },
  {
    id: "deals-margin",
    category: "workspaces",
    title: "Üzletági árrés / profitabilitás – hogyan számoljuk?",
    summary: "🎯 Megmutatja a nyereséget: bevétel − beszerzés (és a százalékos arányt).",
    body: `🎯 Mire jó?
- Hogy tudd: melyik termék/ügylet hoz valódi értéket, és hol csúszik el a költség.

⚙️ Hogyan működik?
- Árrés (Ft) = kapcsolt bevétel − beszerzés.
- Árrés % = árrés / bevétel × 100.

💡 Tipp
- Ha a % alacsony, nem mindig árat kell emelni: sokszor a beszerzési oldalon vagy a járulékos költségeken van a gyors nyereség.`,
    tags: ["árrés", "margin", "profit"],
  },
  {
    id: "deals-promote",
    category: "promote",
    title: "Projekt élesítés / Promote – hogyan lesz ebből üzletág?",
    summary: "🎯 Kontrollált átmenet: a szimulációból/pilotból egy gombnyomással éles üzletmenet készül.",
    body: `🎯 Mire jó?
- Hogy a „terv” és a „tény” ugyanabban a rendszerben legyen, mégis külön kezelhető legyen a kockázat.

⚙️ Hogyan működik?
- Snapshot → cél (új business vagy csatolás) → sunk költségek értelmezése.

💡 Tipp
- Promote előtt készíts riportot és nézd meg a break-even/ROI képet – így tudatosabb a döntés az élesítés időzítéséről.`,
    tags: ["promote", "projekt", "élesítés"],
  },
  {
    id: "deals-consolidation",
    category: "workspaces",
    title: "Ernyővállalkozás konszolidáció – miért hasznos?",
    summary: "🎯 Egyben látod a képet: a kapcsolt projektek hatása megjelenhet a fő cég cashflow-jában.",
    body: `🎯 Mire jó?
- Hogy a vezetői döntések ne szigetekre épüljenek: látszik, melyik projekt „húzza” vagy „terheli” a fő működést.

⚙️ Hogyan működik?
- Pilot projektek ernyő business-hez kapcsolhatók; beállítás szerint beleszámíthatnak az összesítésekbe.

💡 Tipp
- Konszolidáció mellett is tartsd külön a projekt státuszokat (terv/lekötött/tény), így nem mosódik össze a pipeline és a tényleges pénzmozgás.`,
    tags: ["ernyő", "konszolidáció", "pilot"],
  },
  {
    id: "why-szcenario",
    category: "scenario",
    title: "Miért „Szcenárió” — túl a jó/rossz éven",
    summary:
      "Nem két statikus évvég-szám. A szcenárió élő forgatókönyv: időzítés, láncreakció és Stop-Loss a döntési idővonalon.",
    body: `🎯 Mire jó?
- Hogy a tervezés ne merüljön ki egy „jó” és egy „rossz” év beírásában — hanem lássd a folyamatot, a mikort és a döntési pontokat.

⚙️ Hogyan működik?
${WHY_LEAD}

${WHY_BODY}

${DAILY_OPS_BODY}

💡 Tipp
- Olvasd a P-R-O görbéket időrendben: nem az év végi összeget keresd, hanem azt a hónapot, amikor a pesszimista szál eléri a Stop-Loss határt.`,
    tags: ["szcenárió", "forgatókönyv", "idővonal", "stop-loss", "márka"],
  },
  {
    id: "pro-chart",
    category: "scenario",
    title: PRO_ARTICLE_TITLE,
    summary: PRO_ARTICLE_SUMMARY,
    body: `🎯 Mire jó?
- Mozgástér, nem jóslat: pesszimista tartalék vs. optimista kapacitás, szórási hibával.

⚙️ Hogyan működik?
${PRO_ARTICLE_BODY}

💡 Tipp
- A grafikont a saját múltad és a beállított paraméterek frissítésével olvasd. Ha egy szoftver „pontos negyedéves bevételt” ígér, az téved.`,
    tags: ["PRO", "pesszimista", "realista", "optimista", "szórás"],
  },
  {
    id: "kahn-rand",
    category: "scenario",
    title: "Herman Kahn döntési elágazás & P-R-O szórásmodell",
    summary:
      "Bisztró bővítés + magán ingatlanfedezet. P–R–O sávok és Stop-Loss a Core és a magánvagyon védelmére. DEMO 11, local-first.",
    body: `🎯 Mire jó?
- Hogy a döntés előtt három egyidejű pályát láss (🔴 P / 🔵 R / 🟢 O), ne egyetlen „legvalószínűbb” tervet — és lásd a magán–cég összefonódást.

⚙️ Hogyan működik?
Herman Kahn (RAND) szcenárió-módszere: kritikus elágazási pontok és szélsőséges kimenetek. A klasszikus fa korlátja: a magánvagyon kimaradt.

A Szcenárió engine (DEMO 11 — Bisztró elágazás):
1) Core: bisztró cash-flow, alapanyag, személyzet
2) Magán: ingatlanfedezet, magánhitel, vésztartalék
3) Projekt: terasz+konyha hitelből vs. adósságrendezés + organikus · P–R–O + Stop-Loss

A számítás a te eszközödön marad. Nulla telemetria, nincs felhő-adatbázis.

💡 Tipp
- Akkor lépj előre, ha a pesszimista pálya mellett is megmarad a minimális működési runway — magán és cég együtt.

Teljes lecke: support tudástár → kahn-strategiai-elagazas.`,
    tags: ["kahn", "rand", "bisztró", "P-R-O", "Stop-Loss", "demo11"],
  },
  {
    id: "lesson-kahn",
    category: "lessons",
    title: "Bisztró elágazás — Magán, Core, Projekt (P-R-O)",
    summary:
      "Kapacitásplafon, hitel vs. adósságrendezés, magán ingatlanfedezet. P–R–O és Stop-Loss. DEMO 11, local-first.",
    body: `🎯 Mire jó?
- Hogy a bővítés/hitelfelvétel előtt lásd a Cash Runway-t a pesszimista sávon — beleértve a magán fedezetet.

⚙️ Hogyan működik?
1) Core üzem (bisztró) runway és fix kötelezettségek.
2) Magán/ingatlan: jelzálog, törlesztő, vésztartalék.
3) Projekt elágazás + P–R–O (piros / kék / zöld) + Stop-Loss.

A teljes lecke a support.szcenario.hu tudástárban (kahn-strategiai-elagazas).

💡 Tipp
- A rugalmasabb konstrukció rossz ágon is kilépési mozgásteret ad — először a 🔴 pesszimista sávot olvasd.`,
    tags: ["kahn", "demo11", "bisztró", "P-R-O", "Core", "Stop-Loss", "runway"],
  },
  {
    id: "lesson-community",
    category: "lessons",
    title: "Kisközösségi válságkezelés — víz, LoRa, melegedő",
    summary:
      "Lajtoskocsi literben, offline LoRa mesh, téli melegedő zóna. A motor a runway-t és a lefedettséget számolja — local-first.",
    body: `🎯 Mire jó?
- Hogy a civil kör 72 órán literben, órában és lefedett utcában beszéljen, ne „kitartunk”-ban.

⚙️ Hogyan működik?
Három helyzet egy vázon: szennyezett vezetékes víz + lajtoskocsi, áram- és távközlés-kiesés + LoRa, extrém tél + melegedő. A Master Baseline (létszám, készlet, energia) adott; a szcenárió a sokkot mozgatja.

A teljes lecke a support tudástárban: helyzetlemez, potenciál, lépésről lépésre, kapcsolat a demo12 pályához.

💡 Tipp
- Először a pesszimista 72 órát számold. A kannás kör és a fűtött köbméter a muda, ha üresen megy.`,
    tags: ["közösség", "víz", "LoRa", "melegedő", "demo12"],
  },
  {
    id: "lesson-household",
    category: "lessons",
    title: "Háztartási tartalék — 72 óra, víz, néma hálózat",
    summary:
      "Power station + zóna, szűrési lánc, papírtérkép és PMR. Ugyanaz a fizikai motor, mint a céges BCP — kisebb lépték.",
    body: `🎯 Mire jó?
- Hogy a család Wh-ban, literben és találkozási pontban tervezzen, ne „van otthon valami”-ben.

⚙️ Hogyan működik?
Blackout, csapvíz-tilalom, mobilnet-kiesés. A demo13 ugyanezt a 72 órás ablakot viszi: Energy Autonomy, Resource Runway, TTR.

💡 Tipp
- A nyers, a köztes és az ivóvíz három edény. A találkozási pontot járjátok végig nappal.`,
    tags: ["háztartás", "blackout", "ivóvíz", "PMR", "demo13"],
  },
  {
    id: "lesson-bcp",
    category: "lessons",
    title: "Vállalati BCP — SaaS, ellátás, kulcsmunkatárs",
    summary:
      "Local-first élesítés, lean kvóta, keresztképzési mátrix. A TTR órában van, nem „amint lehet”. A BCP motor a meglévő Case / Slot kereten fut.",
    body: `🎯 Mire jó?
- Hogy a kiesés, a blokád és a hiányzó műszak ugyanazon a PDCA-héjon fusson.

⚙️ Hogyan működik?
A BCP motor a meglévő Case / Slot kereten fut. Külön licenckvótát nem ad. demo11 / demo26 a vendor-függés, demo21–24 a lánc és a dokk. A mátrix a szerephez ketőst rendel. A mentés az, amit üres gépre vissza tudsz állítani.

💡 Tipp
- Amit a felhőből olvasol, a kiesésben nincs. Amit a saját gépeden írsz, az a tartalék.`,
    tags: ["BCP", "SaaS", "SMED", "keresztképzés", "demo11"],
  },
  {
    id: "lesson-demography",
    category: "lessons",
    title: "Demográfiai implózió — TFR-mátrix",
    summary:
      "Korea, Kína, Olaszország, Japán, Magyarország: rés a 2,1-hez, kezelési pálya. Helyi másolat, nem élő API.",
    body: `🎯 Mire jó?
- Hogy a születésszámot korfával és időállandóval olvasd, ne szalagcímmel.

⚙️ Hogyan működik?
A demo14 a 2023-as helyi TFR-pillanatképet viszi. A lecke a közelmúltbeli sávot is kirakja. A robot nem TFR-eszköz; a támogatás késleltetett.

💡 Tipp
- Először a rést és a 65+ arányt tedd egymás mellé. Éves CHECK, nem 72 órás.`,
    tags: ["TFR", "demográfia", "foresight", "demo14"],
  },
  {
    id: "lesson-campus",
    category: "lessons",
    title: "Oktatási válság — kiber, hősziget, helyi kör",
    summary:
      "Analóg vizsga, kWh-kvóta, műanyagmentes menza. Az oktatási motor a meglévő Case / Slot kereten fut.",
    body: `🎯 Mire jó?
- Hogy a campus a portál kiesése, a hőhullám és a szakadó lánc alatt is vizsgáztasson és etessen.

⚙️ Hogyan működik?
Az oktatási motor a meglévő Case / Slot kereten fut. Külön licenckvótát nem ad. demo18 izolációs idő, demo17 kvóta, demo16 folyamat-audit (veszteségmentesítés) a konyhán és a laborban. A törzs a létszám és az épület; a sokk a változó.

💡 Tipp
- Az izolációt órában méred a riasztástól a leválasztásig. A dobott étel selejt: elhatárolod.`,
    tags: ["oktatás", "campus", "kiber", "hősziget", "demo17", "demo18"],
  },
  {
    id: "labs-dev-tree",
    category: "nav",
    title: "Laboratórium — hol a modul?",
    summary: "A fejléc lombikja nyitja a fejlesztési fát. A bogyóra kattintasz: a modul az asztalon jelenik meg.",
    titleEn: "Laboratory — where is the module?",
    summaryEn: "The flask in the header opens the development tree. Tap a berry: the module lands on the desk.",
    body: `🎯 Fogalom
- A **Laboratórium** a fejléc lombikja. Nem menü a láblécben.
- A **fejlesztési fa** a magból ágazik: motor, aztán modul. Legalább egy motor maradjon aktív.

⚙️ Használat
- Nyisd a lombikot. Kapcsold a bogyót. Ami kell, a saját asztalodon jelenik meg; ami kikapcsolva, az nem zsúfol.
- A gyors mutatók (KPI) is ezen a fán élnek. A főasztalon még előkészítés — ne keresd a fülek alatt.
- Extra Case / Slot a fa alján kapacitás, nem új motor.

💡 Tip
- Előbb a fül (Magán / Vállalkozás / Projekt), aztán a fa. Ugyanaz a szám más fiókban más döntés.`,
    bodyEn: `🎯 Concept
- The **Laboratory** is the flask in the header. Not a footer menu.
- The **development tree** branches from the core: engine, then module. Keep at least one engine on.

⚙️ Use
- Open the flask. Switch a berry. What you need lands on your desk; what is off does not clutter.
- The quick indicators (KPI) also live on this tree. The main desk still keeps them in preparation — do not hunt under the tabs.
- Extra Case / Slot at the foot of the tree is capacity, not a new engine.

💡 Tip
- Tab first (Personal / Business / Project), then the tree. The same number is a different decision in another drawer.`,
    tags: ["lombik", "laboratórium", "modul", "dev tree", "kpi"],
  },
  {
    id: "poka-yoke-guard",
    category: "nav",
    title: "Hibabiztos zár — miért kérdez?",
    summary: "A program megkérdez, mielőtt átír. Keret, ÁFA, import, nyelv: a hiba drágább, mint a kérdés.",
    titleEn: "Mistake-proof lock — why does it ask?",
    summaryEn: "The program asks before it overwrites. Cap, VAT, import, language: the error costs more than the question.",
    body: `🎯 Fogalom
- **Hibabiztos zár:** úgy van összerakva, hogy nehéz elrontani. Nem büntetés.

⚙️ Hol áll meg?
- WANT keret túllépés, gyanús ÁFA-kulcs, Szummában tiltott import.
- A nyelv a címsorban marad; ha hiányzik, a zár visszaírja.
- A fa is zár: ami nincs bekapcsolva, az nem mászik a főasztalra.

💡 Tip
- Egy kérdést fogadj el. Ha mindig felülírod, a hiba olcsónak tűnik — pedig a kasszán látszik.`,
    bodyEn: `🎯 Concept
- **Mistake-proof lock:** built so it is hard to mess up. Not punishment.

⚙️ Where it stops you
- WANT cap overrun, a flagged VAT rate, import blocked in Szumma.
- Language stays in the address bar; if it is missing, the lock writes it back.
- The tree is a lock too: what is off does not crawl onto the main desk.

💡 Tip
- Accept one question. If you always override, the error looks cheap — until it shows on the till.`,
    tags: ["poka-yoke", "zár", "hiba", "nyelv", "import"],
  },
  {
    id: "language-persist",
    category: "nav",
    title: "Nyelv — hogyan marad meg?",
    summary: "A fejléc HU / EN gombja. A címsor és a gép őrzi; oldalváltáskor a zár visszaírja.",
    titleEn: "Language — how does it stay?",
    summaryEn: "The HU / EN button in the header. The address bar and this machine keep it; on navigation the lock writes it back.",
    body: `🎯 Hol váltasz?
- A fejléc **HU / EN** gombja: magyar vagy angol.
- A modell, a forint és az ÁFA nem változik — csak a felirat.

⚙️ Mi őrzi?
- A címsor: \`lang=hu\` vagy \`lang=en\`.
- A helyi tároló és a süti ugyanazon a gépen.
- Ha egy linkből kiesik a nyelv, a program visszaírja, mielőtt a felület ugrana. Ez a hibabiztos zár.

💡 Tip
- Ha angolra ugrott, először a címsort nézd. Frissítés után is ez a zár tartja a választást.`,
    bodyEn: `🎯 Where do you switch?
- The header **HU / EN** button: Hungarian or English.
- The model, forint and VAT do not change — only the labels.

⚙️ What keeps it?
- The address bar: \`lang=hu\` or \`lang=en\`.
- Local storage and the cookie on this machine.
- If a link drops the language, the program writes it back before the UI jumps. That is the mistake-proof lock.

💡 Tip
- If it flipped to English, read the address bar first. The same lock holds after a refresh.`,
    tags: ["nyelv", "lang", "i18n", "perzisztencia"],
  },
];

export function kbById(id: KnowledgeBaseArticleId) {
  return KB_ARTICLES.find((a) => a.id === id) ?? null;
}

export function kbCopy(article: KnowledgeBaseArticle, locale: "hu" | "en" = "hu") {
  if (locale === "en") {
    return {
      title: article.titleEn ?? article.title,
      summary: article.summaryEn ?? article.summary,
      body: article.bodyEn ?? article.body,
    };
  }
  return { title: article.title, summary: article.summary, body: article.body };
}

