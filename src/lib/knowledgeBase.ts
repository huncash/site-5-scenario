import {
  DAILY_OPS_BODY,
  PRO_ARTICLE_BODY,
  PRO_ARTICLE_SUMMARY,
  PRO_ARTICLE_TITLE,
  WHY_BODY,
  WHY_LEAD,
} from "@/content/branding";

export type KnowledgeBaseCategoryId =
  | "workspaces"
  | "promote"
  | "loans"
  | "cashflow"
  | "bank-sync"
  | "settings"
  | "scenario";

export type KnowledgeBaseArticleId =
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
  | "why-szcenario";

export type KnowledgeBaseArticle = {
  id: KnowledgeBaseArticleId;
  category: KnowledgeBaseCategoryId;
  title: string;
  summary: string; // 1-2 mondat tooltiphez
  body: string; // részletes leírás (plain text / markdown-like)
  tags?: string[];
};

export const KB_CATEGORIES: Array<{ id: KnowledgeBaseCategoryId; title: string }> = [
  { id: "workspaces", title: "1. Munkaterületek & Projektek" },
  { id: "promote", title: "2. Élesítés & Tagi kölcsön" },
  { id: "loans", title: "3. Hitelek & Kötelezettségek" },
  { id: "cashflow", title: "4. Cashflow & Megtakarítások" },
  { id: "bank-sync", title: "5. Banki Szinkron & Hash Dedup" },
  { id: "settings", title: "6. Beállítások & Danger Zone" },
  { id: "scenario", title: "7. Szcenárió & PRO-grafikon" },
];

export const KB_ARTICLES: KnowledgeBaseArticle[] = [
  {
    id: "workspaces-projects",
    category: "workspaces",
    title: "Munkaterületek & Projektek – mi a különbség?",
    summary:
      "A munkaterület típusa (Magán / Vállalkozás / Projekt) segít ugyanazt a pénzügyi adatot más fókuszban látni: mindennapi keret, céges cashflow+ÁFA, vagy jövőbeli tervezés.",
    body: `🎯 Mire jó?
- Hogy ugyanazokat a tételeket a megfelelő szemüvegen keresztül lásd: Magán (elkölthető keret), Vállalkozás (nettó+ÁFA és tartalék), Projekt (tervezés/szimuláció).

⚙️ Hogyan működik?
- Magán: bruttó szemlélet + perselyek/célok.
- Vállalkozás: nettó tárolás + ÁFA logika, cashflow és ÁFA tartalék.
- Projekt: fázis (Szimuláció / Pilot / Prep) + tétel státusz (tervezett / lekötött / tényleges) → forgatókönyv építés.

💡 Pro Tip / Legjobb gyakorlat
- Kezdd Projekttel, ha még formálódik az ötlet. Ha beérik, egy kattintással „élesítheted” (Promote) új Vállalkozássá vagy csatolhatod meglévőhöz.`,
    tags: ["projekt", "pilot", "szimuláció", "ernyő", "workspaces"],
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
- Ha nincs kéznél bontás, hagyd üresen a tőkerészt: a rendszer konzervatívan számol (jó „minimum terv” készítéshez).`,
    tags: ["törlesztés", "tőkerész", "visszagörgetés"],
  },
  {
    id: "cashflow-savings",
    category: "cashflow",
    title: "Cashflow & megtakarítások – mit jelent a „szabad keret”?",
    summary:
      "A szabad keret az elkölthető pénz: banki egyenlegből levonjuk a megtakarítások/perselyek és célok által lekötött részt (ahol releváns).",
    body: `🎯 Mire jó?
- Hogy gyors döntést tudj hozni: „mennyi pénz költhető el biztonságosan”, miközben a célokra félretett keret nem „keveredik bele”.

⚙️ Hogyan működik?
- Szabad keret ≈ (banki bruttó egyenleg) − (megtakarítások/perselyek) − (célokra lekötött rész), ahol ez releváns.
- A persely hozzárendelés a pozitív tételekből épít cél-keretet; a kiadások közben a valós cashflow-t csökkentik.

💡 Pro Tip / Legjobb gyakorlat
- Ha minden hónapban félreteszel (akár kis összeget is), a szabad keret stabilabb lesz, és a „meglepetés kiadások” kevésbé rántják meg a működést.`,
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
- Ha egy kiadásra készülsz (pl. biztosítás, szerviz), csinálj „felkészülési perselyt”, és a bevételeidből vezess át rá havonta egy kis összeget.`,
    tags: ["persely", "kiadás", "szabály"],
  },
  {
    id: "bank-sync-dedup",
    category: "bank-sync",
    title: "Banki szinkron & SHA-256 deduplikáció",
    summary:
      "A rendszer SHA-256 hash alapján megjegyzi a beolvasott fájlokat munkaterületenként, így elkerülhető a duplikált import – és van felülbírálás is.",
    body: `🎯 Mire jó?
- Hogy gyorsan és magabiztosan tudj importálni: a rendszer segít elkerülni a véletlen dupla beolvasást.

⚙️ Hogyan működik?
- A CSV/XML tartalmából SHA-256 hash készül.
- A hash workspace-scope: ugyanaz a fájl másik munkaterületre importálható.
- Beállításokban törölhető az import memória (hash lista).
- Importnál választható a „Force re-import” (dedup figyelmen kívül hagyása).

💡 Pro Tip / Legjobb gyakorlat
- Ha hónapzáráskor több fájlt mozgatgatsz, tarts egy külön „Import” mappát és nevezd egységesen (dátum + számla), így az ellenőrzés gyorsabb.`,
    tags: ["bank", "dedup", "sha256", "force"],
  },
  {
    id: "settings-danger-zone",
    category: "settings",
    title: "Beállítások & Danger Zone – mit csinál pontosan?",
    summary:
      "A Danger Zone műveletek visszafordíthatatlan vagy nagy hatású törlések: import memória törlés, workspace purge, és végleges workspace törlés.",
    body: `🎯 Mire jó?
- Hogy kontrolláltan „rendbe tudd tenni” a munkaterületedet (pl. újrakezdés, teszt adatok takarítása), és közben tudd pontosan, mi fog változni.

⚙️ Hogyan működik?
- Import memória törlése: csak a beolvasott fájl-hash listát üríti (újraimport lehetővé válik).
- Workspace purge: törli az adott munkaterület tételeit + import előzményeket (és a kapcsolódó adatokat).
- Végleges törlés: a munkaterület meta is kikerül, és a hozzá tartozó adat is törlődik.

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
- Állíts be egyszerre 1–2 dolgot, ments, és nézd meg a hatást a főképernyőn – így gyorsan kialakul a saját rutinod.`,
    tags: ["autosave", "explicit", "mentés"],
  },
  {
    id: "new-workspace",
    category: "workspaces",
    title: "„+ Új…” – hogyan válasszak munkaterület típust?",
    summary:
      "Magán = személyes, Vállalkozás = éles céges cashflow, Projekt = tervezés/szimuláció. Pilot projekt ernyővállalkozáshoz kapcsolható.",
    body: `🎯 Mire jó?
- Hogy a megfelelő „üzemmódot” kapd: más KPI-k, más hangsúly, és gyorsabb döntéshozás.

⚙️ Hogyan működik?
- Magán: személyes költések + megtakarítások (elkölthető keret).
- Vállalkozás: céges cashflow + ÁFA + jogcímek (vezetői nézet).
- Projekt: szimuláció/pilot/prep → státuszokkal és forgatókönyvekkel tervezel.

💡 Pro Tip / Legjobb gyakorlat
- Ha nem biztos a konstrukció, indulj Projekttel (🧪 szimulációs szabadság), és csak akkor élesíts, amikor a számok és a folyamat összeállt.`,
    tags: ["új", "workspace", "típus"],
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

💡 Pro Tip / Legjobb gyakorlat
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
- Hogy gyorsan átlásd: mi történt a pénzzel ebben a munkaterületben, és mi a „nettó eredmény” a kiválasztott szűrők szerint.

⚙️ Hogyan működik?
- A felső mini KPI-k a jelenlegi szűrés alapján számolódnak (összesítés).
- A lista sorai bruttó pénzmozgást mutatnak; business módban nettó/bruttó bontás is látható.

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
- Ha gyors javulás kell, először a fix/előfizetés jellegű kiadásokat érdemes optimalizálni – ezek hónapról hónapra hatnak.`,
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
- Ha cél a gyors tehercsökkentés: külön kövesd a tőkerészt, és nézd meg, hogyan változik tőle a céltartalék és a szabad keret.`,
    tags: ["hitel", "tőke", "törlesztés"],
  },
  {
    id: "ledger-balance",
    category: "cashflow",
    title: "Egyenleg – mit jelent a nettó eredmény a listában?",
    summary: "🎯 Gyors eredmény mutató: bevétel − kiadás − megtakarítás (a jelenlegi szűrés szerint).",
    body: `🎯 Mire jó?
- Egy mondatban: „pluszban vagy mínuszban volt ez a munkaterület a kiválasztott tételek alapján?”

⚙️ Hogyan működik?
- Az összesített bevétel, kiadás és megtakarítás különbsége.
- Nettó/bruttó megjelenítés a workspacetől és a beviteli módtól függően.

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
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

💡 Pro Tip / Legjobb gyakorlat
- Konszolidáció mellett is tartsd külön a projekt státuszokat (terv/lekötött/tény), így nem mosódik össze a pipeline és a tényleges pénzmozgás.`,
    tags: ["ernyő", "konszolidáció", "pilot"],
  },
  {
    id: "why-szcenario",
    category: "scenario",
    title: "Miért „Szcenárió” — túl a jó/rossz éven",
    summary:
      "Nem két találgatott év. A szcenárió-módszertan Lean eszközökkel és a múlt adataiból számolt szórással ad strukturált, alacsonyabb hibahatárú jövőképet.",
    body: `🎯 Mire jó?
- Hogy a tervezés ne merüljön ki egy „jó” és egy „rossz” év beírásában.

⚙️ Hogyan működik?
${WHY_LEAD}

${WHY_BODY}

${DAILY_OPS_BODY}

💡 Pro Tip / Legjobb gyakorlat
- Frissítsd a múltbeli adatokat, ha változik a piac: a szórás és a mozgástér azonnal újraszámolódik, és látszik, hol kell beavatkozni.`,
    tags: ["szcenárió", "lean", "jövőkép", "márka"],
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

💡 Pro Tip / Legjobb gyakorlat
- A grafikont a saját múltad és a beállított paraméterek frissítésével olvasd. Ha egy szoftver „pontos negyedéves bevételt” ígér, az téved.`,
    tags: ["PRO", "pesszimista", "realista", "optimista", "szórás"],
  },
];

export function kbById(id: KnowledgeBaseArticleId) {
  return KB_ARTICLES.find((a) => a.id === id) ?? null;
}

