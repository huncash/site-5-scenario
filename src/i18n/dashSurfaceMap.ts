/** HU → EN leftovers on the dashboard (forms, toasts, tooltips not yet keyed). */
export const DASH_HU_EN: Record<string, string> = {
  "Az első hónap, amikor a választott pálya halmozott eredménye eléri a nullát. Halmozott eredmény = a havi (bevétel − kiadás) összege a horizont elejétől.":
    "The first month the chosen path’s cumulative result hits zero. Cumulative result = monthly (income − spend) from the start of the horizon.",
  "A havi kiadásból mennyi a kötött tétel (bérleti díj, előfizetés). A maradék a forgalommal mozog. Magas arány: kevesebb mozgástér, ha esik a bevétel.":
    "How much of monthly spend is locked (rent, subscription). The rest moves with turnover. A high share: less room if income falls.",
  "EV: alvállalkozó / egyéni vállalkozó díja. EFO: alkalmi foglalkoztatás napidíja. Az arány ezeknek a költsége az összes kiadáshoz képest.":
    "EV: sole-trader / subcontractor fee. EFO: casual daily rate. The ratio is these costs versus all spend.",
  "Automatikus ismétlődő bevétel/kiadás generálás és naptár nézet. A scheduler modul előkészítés alatt áll — a célok listája már működik.":
    "Automatic recurring income/spend and a calendar view. The scheduler is in preparation — the goals list already works.",
  "Fix arány = kötött havi kiadás / átlagos havi kiadás. Az 50% fölött a működés kevésbé enged, ha esik a forgalom.":
    "Fixed ratio = locked monthly spend / average monthly spend. Above 50% operations flex less if turnover falls.",
  "(A horizont teljes bevétele mínusz a teljes költség) osztva a költséggel. Százalék. Nem diszkontált, nem kamat.":
    "(Horizon income minus total cost) divided by cost. Percent. Not discounted, not interest.",
  "Árazás módosítása — árrés / óradíj döntés az Üzletek nézetben, ha a céges kassza nem fedezi a magán áthidalást.":
    "Change pricing — margin / hourly rate in Deals if the business till does not cover the personal bridge.",
  "veszteség-arány — mennyivel kevesebb vagy több a pazarlás ebben a hónapban, mint az előző három hónap átlaga.":
    "waste ratio — how much less or more waste this month versus the last three-month average.",
  "Két sorrend ugyanazokra a tartozásokra. lavina: a legmagasabb kamat előre. hólabda: a legkisebb tőke előre.":
    "Two orders on the same debts. avalanche: highest interest first. snowball: smallest principal first.",
  "pénzáramlás-híd — a magán kassza és a cég között: mennyi vihető át, mire kell, mennyi a javasolt áthidalás.":
    "cash-flow bridge — between the personal till and the firm: what can move, what is needed, the suggested bridge.",
  "Fix arány — a havi kiadásból mennyi a kötött tétel (bérlet, előfizetés). Magas arány: kevesebb mozgástér.":
    "Fixed ratio — how much of monthly spend is locked (rent, subscription). A high share: less room to move.",
  "Többéves tükör — három évnyi minta: mennyi a pazarlás évesítve, és meddig tart a kassza, ha ezt elhagyod.":
    "Multi-year mirror — three years of pattern: annualised waste, and how long the till lasts if you drop it.",
  "lavina — először a legmagasabb kamatú tartozást törleszted extra összeggel. A kamaton spórolsz.":
    "avalanche — extra goes to the highest-interest debt first. You save on interest.",
  "Nincs olvasási jog a figyelt mappához. Válassz mappát újra, vagy használd a fájl kiválasztást.":
    "No read access to the watched folder. Pick the folder again, or use file choose.",
  "hólabda — először a legkisebb tartozást zárod le. Gyorsabb sikerélmény, utána jöhet a kamatos.":
    "snowball — close the smallest debt first. Faster wins, then the interest-heavy ones.",
  "folyamatos javítás — kis, ismétlődő ellenőrzés. Heti és havi jelzés, hogy javul-e a pazarlás.":
    "continuous improvement — small repeating checks. Weekly and monthly marks on whether waste is falling.",
  "ACT: Projekt átütemezés javasolt — a Cash‑Flow híd szerint az üzleti puffer 90 nap alá esne.":
    "ACT: reschedule the project — the cash-flow bridge says the business buffer would fall under 90 days.",
  "Fedezeti pont — az első hónap, amikor a választott pálya halmozott eredménye eléri a nullát.":
    "Break-even — the first month the chosen path’s cumulative result hits zero.",
  "HIBA: Az XML struktúrából nem sikerült tranzakciókat kinyerni. Ellenőrizd a fájl formátumát!":
    "ERROR: Could not extract transactions from the XML. Check the file format.",
  "Megtakarítási alhalmazok — perselyek célra, pufferre vagy ÁFA-ra. Ikonnal célhoz rendelhető.":
    "Saving subsets — piggies for a goal, buffer or VAT. Assign to a goal with an icon.",
  "ROI = (bevétel − költség) / költség a 12 hónapon. A 20% összehasonlító küszöb, nem előírás.":
    "ROI = (income − cost) / cost over 12 months. 20% is a comparison line, not a rule.",
  "hány hónapig tart a kassza a mostani ütemmel, és mennyivel tovább, ha a pazarlást elhagyod.":
    "how many months the till lasts at the current pace, and how much longer if you drop the waste.",
  "Add meg a mesterjelszót a helyi profil megnyitásához (az eseteid ezen az eszközön vannak).":
    "Enter the master password to open the local profile (your cases are on this device).",
  "Ez a Magán szinkron XML (SpreadsheetML) kivonatot vár. CSV-t a Vállalkozás import kezeli.":
    "Personal sync expects an XML (SpreadsheetML) extract. CSV is handled by Business import.",
  "Javasolt áthidalás — ennyit érdemes a cég és a magán között vinni. Javaslat, nem utalás.":
    "Suggested bridge — this much is worth moving between firm and personal. A suggestion, not a transfer.",
  "Döntési elágazások — három beavatkozás: árazás, extra-költés keret, projekt átütemezés.":
    "Decision forks — three interventions: pricing, extra-spend frame, project reschedule.",
  "Üzleti mozgósítható — a céges kasszából amennyi a kötelezettségek után még átvihető.":
    "Business movable — what can still move from the company till after liabilities.",
  "Lean: Import-first mód — a kézi rögzítést innentől inkább finomhangolásra használd.":
    "Lean: import-first — from here use manual entry for fine-tuning.",
  "Nincs bankszámla azonosítás ehhez az XML-hez. Beállítások → Bankszámlák & Profilok.":
    "No bank-account match for this XML. Settings → Bank accounts & profiles.",
  "Nincs bankszámla azonosítás ehhez a CSV-hez. Beállítások → Bankszámlák & Profilok.":
    "No bank-account match for this CSV. Settings → Bank accounts & profiles.",
  "Projekt átütemezése — új tervezési ciklus, ha az üzleti puffer 90 nap alá esne.":
    "Reschedule the project — a new planning cycle if the business buffer would fall under 90 days.",
  "Tételek — a napló: bevétel, kiadás, átvezetés. Kattints egy sorra a részlethez.":
    "Items — the ledger: income, spend, transfer. Click a row for the detail.",
  "veszteség — ha a mostani pazarlás így marad, ennyi forint megy el egy év alatt.":
    "waste — if today’s waste stays, this many forints go in a year.",
  "Ez a banki fájl már be lett olvasva (SHA-256). Újraellenőrzés (rawId dedup)...":
    "This bank file has already been read (SHA-256). Rechecking (rawId dedup)…",
  "vágy — ha a mostani extra (nem kötelező) költés így marad, ennyi egy év alatt.":
    "want — if today’s extra (optional) spend stays, this much in a year.",
  "A bankszámla nincs ehhez a munkatérhez rendelve. Állítsd be a Beállításokban.":
    "The bank account is not assigned to this workspace. Set it in Settings.",
  "Megtérülés — (bevétel − költség) / költség a 12 hónapon. Százalék, nem kamat.":
    "Return — (income − cost) / cost over 12 months. Percent, not interest.",
  "Az első hónap, amikor a választott pálya halmozott eredménye eléri a nullát.":
    "The first month the chosen path’s cumulative result hits zero.",
  "Csak az általános megtakarítás és a cél nevével egyező alhalmaz számít bele.":
    "Only general saving and the subset matching the goal name count.",
  "Célok — mennyi van meg, mennyi hiányzik, és havonta mennyit kell félretenni.":
    "Goals — how much is in, how much is missing, and how much to set aside per month.",
  "lavina — először a legmagasabb kamatú tartozást törleszted extra összeggel.":
    "avalanche — extra goes to the highest-interest debt first.",
  "veszteség — pazarlás a tételeken (impulzus, díj, selejt, dupla előfizetés).":
    "waste — waste on items (impulse, fee, scrap, double subscription).",
  "Figyelt mappa: a böngésző olvasási engedélyt kér. Nyomd a Magán szinkront.":
    "Watched folder: the browser asks for read permission. Press Personal sync.",
  "A böngésző nem támogatja a mappa-szinkront. Használd a fájl kiválasztást.":
    "This browser does not support folder sync. Use file choose.",
  "Lean: Jelöltem a kézi vs banki forrást a listákban (finom, nem tolakodó).":
    "Lean: marked manual vs bank source on the lists (quiet, not loud).",
  "Szumma nézetben import nem indítható. Válts Magán/Vállalkozás munkatérre.":
    "Import cannot start in Szumma view. Switch to Personal / Business.",
  "hólabda — először a legkisebb tartozást zárod le, a gyorsabb lezárásért.":
    "snowball — close the smallest debt first, for a faster close.",
  "Magán igény — amennyi a magán oldalon hiányzik (deficit vagy tartozás).":
    "Personal need — how much is missing on the personal side (deficit or debt).",
  "Még nincs profil ezen az eszközön. Hozz létre egyet a folytatáshoz.":
    "No profile on this device yet. Create one to continue.",
  "Nem ismert XML formátum. (HISTORY_… SpreadsheetML kivonatot várok.)":
    "Unknown XML format. (Expecting a HISTORY_… SpreadsheetML extract.)",
  "Nem találok .xml (vagy .csv) kivonat fájlt a kiválasztott mappában.":
    "No .xml (or .csv) extract in the chosen folder.",
  "Nincs beállított fix kiadás — add meg a Magán ismétlődő tételeket.":
    "No fixed spend set — add Personal recurring items.",
  "ROI: (bevétel − költség) / költség a 12 hónapon. Nem diszkontált.":
    "ROI: (income − cost) / cost over 12 months. Not discounted.",
  "Havi vágy-limit rögzítése, hogy az extra költés ne nőjön tovább.":
    "Set a monthly want-limit so extra spend does not keep growing.",
  "Magán: szinkron a kiválasztott mappa legfrissebb XML kivonatából":
    "Personal: sync from the latest XML extract in the chosen folder",
  "Nem ismert CSV formátum. (Fejlécet keresek: Számlaazonosító;...)":
    "Unknown CSV format. (Looking for header: Számlaazonosító;...)",
  "melyik tartozást érdemes először csökkenteni, ha van extra pénz.":
    "which debt to cut first if there is extra money.",
  "HIBA: Nem megfelelő formátum (Magán). Csak XML (SpreadsheetML).":
    "ERROR: Wrong format (Personal). XML (SpreadsheetML) only.",
  "Likviditás — azonnal elérhető pénz az összesített munkatereken.":
    "Liquidity — immediately available money across summed workspaces.",
  "beavatkozás — árazás, költségkeret, átütemezés, Lean javaslat.":
    "intervention — pricing, spend frame, reschedule, Lean advice.",
  "veszteség-pont — 0–100: minél magasabb, annál több a pazarlás.":
    "waste score — 0–100: higher means more waste.",
  "értékáram-térkép — 1 Ft beáramlásból mennyi lesz valódi érték.":
    "value-stream map — how much of 1 Ft inflow becomes real value.",
  "A pillanatmentés nem sikerült — a kezelő ettől még megnyílik.":
    "The snapshot failed — the handler still opens.",
  "Ez a művelet túllépi a havi WANT keretet. Biztosan rögzíted?":
    "This action exceeds the monthly WANT frame. Record it anyway?",
  "Szabad egyenleg — ami a kötelezettségek után még elkölthető.":
    "Free balance — what is still spendable after liabilities.",
  "Tagi befizetés / Tagi kölcsön nyújtása (Magán → Vállalkozás)":
    "Owner payment / owner loan (Personal → Business)",
  "alvállalkozói és alkalmi díjak az összes kiadáshoz képest.":
    "subcontractor and casual fees versus all spend.",
  "Nincs bankszámla azonosítás (Beállítások → Bankszámlák).":
    "No bank-account match (Settings → Bank accounts).",
  "ugyanaz a két sorrend: kamat előre vagy kis tőke előre.":
    "the same two orders: interest first or small principal first.",
  "Figyelem: lehetséges duplikáció vagy hiányos besorolás":
    "Note: possible duplicate or incomplete classification",
  "Magán kassza — a személyes banki egyenleg, nem a cégé.":
    "Personal till — the personal bank balance, not the firm’s.",
  "Tiszta eredmény — céges bevétel mínusz kiadás (nettó).":
    "Net result — business income minus spend (net).",
  "Hány hónapig tart a kassza a mostani költési ütemmel.":
    "How many months the till lasts at the current spend pace.",
  "Támogatott formátum: Banki XML / SpreadsheetML (.xml)":
    "Supported format: bank XML / SpreadsheetML (.xml)",
  "hány hónapig tart a kassza a mostani költési ütemmel.":
    "how many months the till lasts at the current spend pace.",
  "Ez a banki fájl már be lett olvasva (SHA-256 dedup).":
    "This bank file has already been read (SHA-256 dedup).",
  "Kötött havi kiadás osztva az átlagos havi kiadással.":
    "Locked monthly spend divided by average monthly spend.",
  "hirtelen, nem tervezett költések az elmúlt 7 napban.":
    "sudden, unplanned spend in the last 7 days.",
  "veszteség-pont — álló tőke, súrlódás, adat-hulladék.":
    "waste score — idle capital, friction, data waste.",
  "ACT: Árazás / margin döntések az Üzletek nézetben.":
    "ACT: pricing / margin decisions in the Deals view.",
  "pl. tervezett fejlesztés / beszerzés megelőlegezés":
    "e.g. planned development / purchase advance",
  "A kiadások szükséglet / vágy / befektetés aránya.":
    "Spend split: need / want / investment.",
  "Tagi kölcsön visszafizetése (Vállalkozás → Magán)":
    "Owner-loan repayment (Business → Personal)",
  "szükséges — nem érték, de ma még elkerülhetetlen.":
    "necessary — not value, but still unavoidable today.",
  "Hány hónapig bírja a készpénz a rosszabb pályán.":
    "How many months cash lasts on the worse path.",
  "Magán szinkron: Banki XML / SpreadsheetML (.xml)":
    "Personal sync: bank XML / SpreadsheetML (.xml)",
  "A törzs adott. Itt a bővítési döntést mozgatod.":
    "The trunk is given. Here you move the expansion decision.",
  "Adatok konzisztensek (0 duplikáció / 0 ütközés)": "Data is consistent (0 duplicates / 0 clashes)",
  "Hiba: logikai ellentmondás / biztos adatátfedés": "Error: logical clash / definite overlap",
  "Bankszámla nincs ehhez a munkatérhez rendelve.": "Bank account is not assigned to this workspace.",
  "Ha a bevétel csúszik vagy esik, a költség nő.": "If income slips or falls, cost rises.",
  "Lezárt / összes továbbértékesítési beszerzés": "Closed / all resale purchases",
  "Olcsóbb hitel kilépési ára — nem megtérülés.": "Cheaper-loan exit price — not a return.",
  "Támogatott: Banki XML / SpreadsheetML (.xml)": "Supported: bank XML / SpreadsheetML (.xml)",
  "WANT keret túllépés — megerősítés szükséges.": "WANT frame exceeded — confirmation needed.",
  "[DEMO] Banki tétel összerendelés (szimulált)": "[DEMO] Bank item matching (simulated)",
  "Magán szinkron (legfrissebb XML a mappából)": "Personal sync (latest XML in the folder)",
  "EUR összeghez kötelező árfolyamot megadni.": "An FX rate is required for an EUR amount.",
  "PÉNZÜGYI BEVÉTELEK: Tagi kölcsön befizetés": "FINANCIAL INCOME: owner-loan payment in",
  "Belső átvezetéshez kötelező a cél számla.": "Internal transfer requires a target account.",
  "PÉNZÜGYI KIADÁSOK: Tagi kölcsön kifizetés": "FINANCIAL SPEND: owner-loan payment out",
  "Bevétel, levonások és a maradó eredmény.": "Income, deductions and remaining result.",
  "Ha a forgalom jobb, a költség szorosabb.": "If turnover is better, cost is tighter.",
  "Kézi tételek + KP jellegű banki mozgások": "Manual items + cash-like bank movements",
  "Nincs elég egyenleg a forrás-perselyben.": "Not enough balance in the source piggy.",
  "értékteremtő — ami a vevőnek értéket ad.": "value-creating — what gives the customer value.",
  "pl. Lidl bevásárlás, Irodaszer, Kávézó…": "e.g. Lidl shop, stationery, café…",
  "veszteség — pazarlás, elhagyható tétel.": "waste — waste, an item you can drop.",
  "pl. extra részletek, belső megjegyzés…": "e.g. extra detail, internal note…",
  "Megtakarítás, tőke, jövőbe tett pénz.": "Saving, capital, money put into the future.",
  "Válassz egy workspace-t a zároláshoz.": "Choose a workspace to lock.",
  "[DEMO] Eszköz csatlakozás (szimulált)": "[DEMO] Device join (simulated)",
  "pl. Ügyfél A / Telephely 2 fejlesztés": "e.g. Client A / Site 2 development",
  "Adj meg HUF vagy EUR nettó összeget.": "Enter a HUF or EUR net amount.",
  "Célok: a Tételek nézet jobb oldalán.": "Goals: on the right of the Items view.",
  "Guest módban nem hozható létre Slot.": "A Slot cannot be created in Guest mode.",
  "Havi bevétel, kiadás és megtakarítás": "Monthly income, spend and saving",
  "hány fillér marad 1 Ft beáramlásból.": "how many fillers remain from 1 Ft inflow.",
  "pl. telephely, beszerzés, fejlesztés": "e.g. site, purchase, development",
  "Hogyan értelmezzük a PRO-grafikont?": "How to read the PRO chart?",
  "Kattints egy hónapra a részletekhez": "Click a month for the details",
  "PÉNZÜGYI KIADÁSOK: Hitel törlesztés": "FINANCIAL SPEND: loan repayment",
  "Banki szinkron (fájl kiválasztása)": "Bank sync (choose file)",
  "Csak projekt élesíthető PLAN → DO.": "Only a project can go live PLAN → DO.",
  "Munkatér-kötés personal-re állítva": "Workspace binding set to personal",
  "[DEMO] Teljes szinkron (szimulált)": "[DEMO] Full sync (simulated)",
  "pl. Nyomtató, Laptop, Raktári polc": "e.g. Printer, laptop, warehouse shelf",
  "Kötelező, el nem hagyható kiadás.": "Mandatory spend you cannot drop.",
  "Tartozás / törlesztés / tervezett": "Debt / repayment / planned",
  "pl. Székhely, Telephely 1, Raktár": "e.g. HQ, Site 1, Warehouse",
  "pl. ügyfél / beszállító / partner": "e.g. client / supplier / partner",
  "Adj meg HUF vagy EUR egységárat.": "Enter a HUF or EUR unit price.",
  "Automatikus szabály létrehozása": "Create an automatic rule",
  "Magán: XML kivonat kiválasztása": "Personal: choose XML extract",
  "Nem sikerült beolvasni a fájlt.": "Could not read the file.",
  "Szűrés utáni lista (max 80 sor)": "Filtered list (max 80 rows)",
  "Válassz két különböző perselyt.": "Choose two different piggies.",
  "A jelenlegi ritmus folytatása.": "Keep the current rhythm.",
  "Nem megfelelő formátum (Magán)": "Wrong format (Personal)",
  "Szumma nézet (összes munkatér)": "Szumma view (all workspaces)",
  "Vezetői riport (nyomtatás/PDF)": "Management report (print/PDF)",
  "Alapértelmezés: teljes összeg": "Default: full amount",
  "Fix arány az 50%-os küszöbhöz": "Fixed ratio vs the 50% line",
  "Gyors mentés (encrypted JSON)": "Quick save (encrypted JSON)",
  "Megtakarítás tétel létrehozva": "Saving item created",
  "PDCA ciklus lezárás + új PLAN": "Close PDCA cycle + new PLAN",
  "Projekt élesítése (PLAN → DO)": "Go live with project (PLAN → DO)",
  "Projekt-vonatkoztatás törölve": "Project link cleared",
  "Belső átvezetés bekapcsolása": "Turn on internal transfer",
  "Kézi tétel (nincs bank link)": "Manual item (no bank link)",
  "Megtakarítások / átvezetések": "Savings / transfers",
  "Banki vonatkoztatás törölve": "Bank link cleared",
  "Extra, nem kötelező költés.": "Extra, optional spend.",
  "Ismétlődő tételek & ütemező": "Recurring items & scheduler",
  "Magán banki szinkron indult": "Personal bank sync started",
  "Projekt élesítése (PLAN→DO)": "Go live with project (PLAN→DO)",
  "Szabály mentése sikertelen.": "Could not save the rule.",
  "Tömeges persely visszavonva": "Bulk piggy undone",
  "Átcsoportosítás visszavonva": "Reallocation undone",
  "Legalább 12 karakter kell.": "At least 12 characters required.",
  "Slot létrehozva a gépeden.": "Slot created on your machine.",
  "Tagi kölcsön visszafizetés": "Owner-loan repayment",
  "Tömeges törlés visszavonva": "Bulk delete undone",
  "Ugrás a Cashflow aloldalra": "Go to the Cashflow page",
  "pl. Nyaralás Görögországba": "e.g. Holiday in Greece",
  "pl. Nyaralás, Vésztartalék": "e.g. Holiday, emergency reserve",
  "pl. Személyes, Vállalkozás": "e.g. Personal, Business",
  "Átvezetés másik alhalmazba": "Transfer to another subset",
  "A két jelszó nem egyezik.": "The two passwords do not match.",
  "Céltartalék (most → lean)": "Reserve (now → lean)",
  "Nincs sablon kiválasztva.": "No template selected.",
  "Átvezetve megtakarításba.": "Transferred into saving.",
  "Húzd egy másik szekcióra": "Drag onto another section",
  "Leltár — tárgyi eszközök": "Inventory — tangible assets",
  "Tagi befizetés / kölcsön": "Owner payment / loan",
  "XML kivonat kiválasztása": "Choose XML extract",
  "Átvezetés megtakarításba": "Transfer into saving",
  "Aktív cél visszaállítva": "Active goal restored",
  "Alhalmaz törlése (üres)": "Delete subset (empty)",
  "Ennyi időd van dönteni.": "This is your time to decide.",
  "Gyorsmentés sikertelen.": "Quick save failed.",
  "Halmozott eredmény (Ft)": "Cumulative result (Ft)",
  "Kattints a részletekhez": "Click for details",
  "Megnyitás szerkesztésre": "Open to edit",
  "Persely átcsoportosítás": "Piggy reallocation",
  "pl. Sport, Előfizetések": "e.g. Sport, subscriptions",
  "Átcsoportosítás mentve.": "Reallocation saved.",
  "📐 FÜGGETLEN ELŐKÉSZÍTÉS": "📐 INDEPENDENT PREP",
  "Belső átvezetés (tagi)": "Internal transfer (owner)",
  "Első profil beállítása": "Set up the first profile",
  "FIX költség hozzáadása": "Add FIX cost",
  "ROI a 20%-os küszöbhöz": "ROI vs the 20% line",
  "Számított bruttó (HUF)": "Calculated gross (HUF)",
  "Továbbiak megtekintése": "See more",
  "Válassz egy projektet.": "Choose a project.",
  "Válassz projekt módot.": "Choose a project mode.",
  "Vállalkozások (összes)": "Businesses (all)",
  "pl. Internet + tárhely": "e.g. Internet + hosting",
  "pl. megtakarítás célja": "e.g. saving goal",
  "Általános megtakarítás": "General saving",
  "Áthelyezés visszavonva": "Move undone",
  "Összesített likviditás": "Consolidated liquidity",
  "Adósság-helyreállítás": "Debt recovery",
  "Céges tiszta eredmény": "Business net result",
  "Eseti terv hozzáadása": "Add a one-off plan",
  "Gyorsmentés letöltve.": "Quick save downloaded.",
  "Módosítás visszavonva": "Edit undone",
  "Pénzügyi Valóság-Sokk": "Financial reality shock",
  "Részletes progresszió": "Detailed progression",
  "Számított nettó (HUF)": "Calculated net (HUF)",
  "Átvezetés visszavonva": "Transfer undone",
  "Új profil létrehozása": "Create a new profile",
  "Adj meg megnevezést.": "Enter a name.",
  "Nem található tétel.": "Item not found.",
  "Pillanatmentés kész.": "Snapshot ready.",
  "Részletek megnyitása": "Open details",
  "Tétel nem található.": "Item not found.",
  "Új tétel visszavonva": "New item undone",
  "Bruttó összeg (HUF)": "Gross amount (HUF)",
  "Deviza bruttó (EUR)": "FX gross (EUR)",
  "FIX költség törlése": "Delete FIX cost",
  "Használat rögzítése": "Record usage",
  "Másolás visszavonva": "Copy undone",
  "Szabály létrehozva.": "Rule created.",
  "WANT budget zárolás": "WANT budget lock",
  "offline / csak demó": "offline / demo only",
  "Áthelyezés fogantyú": "Move handle",
  "Érvénytelen összeg.": "Invalid amount.",
  "Üzleti mozgósítható": "Business movable",
  "☯️ Lean nézet be/ki": "☯️ Lean view on/off",
  "Alhalmaz átnevezés": "Rename subset",
  "Deviza nettó (EUR)": "FX net (EUR)",
  "Döntési elágazások": "Decision forks",
  "Eseti terv törlése": "Delete one-off plan",
  "Javasolt áthidalás": "Suggested bridge",
  "Magán szinkron XML": "Personal sync XML",
  "Magán ↔ üzleti híd": "Personal ↔ business bridge",
  "Napi szűrő törlése": "Clear day filter",
  "Nettó összeg (HUF)": "Net amount (HUF)",
  "P-R-O forgatókönyv": "P-R-O scenario",
  "Profil létrehozva.": "Profile created.",
  "Profil létrehozása": "Create profile",
  "Projekt hozzáadása": "Add project",
  "Projekt készültség": "Project readiness",
  "Projekt átnevezése": "Rename project",
  "Tétel szerkesztése": "Edit item",
  "Törlesztési fókusz": "Repayment focus",
  "Törlés visszavonva": "Delete undone",
  "Válassz kategóriát": "Choose a category",
  "pl. Futárszolgálat": "e.g. Courier",
  "Új Slot hozzáadása": "Add a new Slot",
  "Új cél visszavonva": "New goal undone",
  "Új fejlesztési cél": "New improvement goal",
  "Új tétel rögzítése": "Record a new item",
  "Beszerzés (nettó)": "Purchase (net)",
  "CHECK — összegzés": "CHECK — summary",
  "Cél visszaállítva": "Goal restored",
  "Eredménylevezetés": "P&L bridge",
  "Eszköz hozzáadása": "Add asset",
  "Használat törlése": "Delete usage",
  "Hiányzó kategória": "Missing category",
  "Irodai gép (demo)": "Office machine (demo)",
  "Kijelölés törlése": "Clear selection",
  "Másolás projektbe": "Copy into project",
  "Nettó hatékonyság": "Net efficiency",
  "Pazarlás / selejt": "Waste / scrap",
  "Sablon hozzáadása": "Add template",
  "Vagyon — eszközök": "Wealth — assets",
  "Összes kijelölése": "Select all",
  "Összes ráfordítás": "All spend",
  "Aktív cél váltás": "Switch active goal",
  "Alhalmaz törlése": "Delete subset",
  "Dupla előfizetés": "Double subscription",
  "Eszköz összesítő": "Asset summary",
  "Kategória törlés": "Delete category",
  "Megtérülés (ROI)": "Return (ROI)",
  "pl. Kutatás 2026": "e.g. Research 2026",
  "pl. Vállalkozás3": "e.g. Business3",
  "pl. vésztartalék": "e.g. emergency reserve",
  "🧪 SZIMULÁCIÓ MÓD": "🧪 SIMULATION MODE",
  "Alhalmaz törlés": "Delete subset",
  "Bevétel (nettó)": "Income (net)",
  "Hely hozzáadása": "Add site",
  "Hely átnevezése": "Rename site",
  "Igen (leltárba)": "Yes (into inventory)",
  "Impulzus költés": "Impulse spend",
  "Következő oldal": "Next page",
  "Leltár — helyek": "Inventory — sites",
  "Lezárt ügyletek": "Closed deals",
  "Nézet: táblázat": "View: table",
  "Profil törölve.": "Profile deleted.",
  "Projekt törlése": "Delete project",
  "Tartozás mentés": "Save liability",
  "Tartozás törlés": "Delete liability",
  "Tétel módosítás": "Edit item",
  "Tömeges persely": "Bulk piggy",
  "Törölt alhalmaz": "Deleted subset",
  "pl. Ügyfél Kft.": "e.g. Client Ltd.",
  "Eszköz mentése": "Save asset",
  "Eszköz törlése": "Delete asset",
  "Magán szinkron": "Personal sync",
  "Sablon törlése": "Delete template",
  "Többéves tükör": "Multi-year mirror",
  "Tömeges törlés": "Bulk delete",
  "Törölt projekt": "Deleted project",
  "Évesített MUDA": "Annualised MUDA",
  "Évesített WANT": "Annualised WANT",
  "Tétel törlése": "Delete item",
  "Törölt eszköz": "Deleted asset",
  "EV+EFO arány": "EV+EFO ratio",
  "Ez az eszköz": "This asset",
  "Hely törlése": "Delete site",
  "Hibás dátum.": "Invalid date.",
  "Karbantartás": "Maintenance",
  "Megtakarítás": "Saving",
  "Tény vs. cél": "Actual vs goal",
  "Utolsó oldal": "Last page",
  "pl. Zsebpénz": "e.g. Pocket money",
  "Észlelt MUDA": "Detected MUDA",
  "Összes tétel": "All items",
  "Új kategória": "New category",
  "Cél törlése": "Delete goal",
  "Díj / kamat": "Fee / interest",
  "Előző oldal": "Previous page",
  "Létrehozás…": "Creating…",
  "Magán igény": "Personal need",
  "Szerkesztés": "Edit",
  "Törölt hely": "Deleted site",
  "Vállalkozás": "Business",
  "alvállalkoz": "subcontract",
  "vállalkozás": "business",
  "Új alhalmaz": "New subset",
  "+ Új tétel": "+ New item",
  "Befektetés": "Investment",
  "Beolvasás…": "Reading…",
  "Első oldal": "First page",
  "Megnyitás…": "Opening…",
  "Oldalméret": "Page size",
  "Szükséglet": "Need",
  "negyedéves": "quarterly",
  "számlaszám": "account number",
  "Áthelyezés": "Move",
  "Bevételek": "Income",
  "Fix arány": "Fixed ratio",
  "Használat": "Usage",
  "MUDA-ráta": "MUDA rate",
  "Megnyitás": "Open",
  "közlemény": "reference",
  "Belépés…": "Signing in…",
  "Eszközök": "Assets",
  "Kiadások": "Spend",
  "T-számla": "T-account",
  "Tartozás": "Liability",
  "székhely": "head office",
  "Új tétel": "New item",
  "értéknap": "value date",
  "Banki bruttó egyenleg": "Bank gross balance",
  "Összes továbbértékesített beszerzés (bruttó)": "All resold purchases (gross)",
  "Beszerzés (nettó/bruttó)": "Purchase (net/gross)",
  "HUF nettó / bruttó": "HUF net / gross",
  "EUR→HUF bruttó (ha bruttót adtál meg)": "EUR→HUF gross (if you entered gross)",
  "Mentéskor nettót tárolunk; a bruttó/napi FX csak megjelenítés és tervezés.":
    "We store net on save; gross / daily FX is display and planning only.",
  "HU bruttó": "HU gross",
  "Lean cél: csak a “gyanús” tételeket kelljen átnézni. A HU tételeket az import már bruttóból nettóra bontotta.":
    "Lean aim: only review the “suspect” items. Import already split HU items from gross to net.",
  "Nettót rögzítesz (HUF + EUR→HUF), a cashflow-ban a bruttó banki pénzmozgás":
    "You record net (HUF + EUR→HUF); cashflow shows the gross bank movement",
  "EV+EFO arány az összes költségen belül (bruttó).": "EV+EFO share of all costs (gross).",
};
