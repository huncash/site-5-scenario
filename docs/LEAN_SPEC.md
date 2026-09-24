Markdown

```
# LEAN_SPEC.md — Józan Paraszti Ész Lean & PDCA Rendszerszabályzat

Ez a dokumentum az alkalmazás alatti Lean döntéstámogató algoritmusok, szűrők és a PDCA (Plan-Do-Check-Act) működés egyetlen hivatalos szabályzata (Single Source of Truth).

---

## 1. Alapelvek & A "Józan Paraszti Ész" Kódexe

1. **Ami nincs elfedve, az nem hoz pénzt:** A folyamatban lévő, de le nem zárt munkák (WIP) kötik a tőkét és az energiát. A cél a ciklusidő lecsökkentése a megbízástól a kifizetésig.
2. **A tény mindig felülírja a tervet:** A `DO` fázis élő tranzakciói és a banki valóság határozza meg a helyzetet, nem a vágyálmok.
3. **Minden eltérés egy pofon a profitszélen:** Ha a `CHECK` fázisban a tényleges költség eltér a tervezettől, ott azonnali korrekciós akcióra (`ACT`) van szükség, nem hezitálásra.
4. **Nincs öncélú adatgyűjtés:** Olyan adatot rögzítünk, amiből döntés vagy automatikus riasztás származik.

---

## 2. A 7+1 Pénzügyi & Operatív Muda (Pazarlás-Mátrix)

Az alábbi szabályok alapján a `CHECK` modul automatikusan átfésüli a tranzakciókat, hiteleket, projekteket és leltárt:

| Muda Típus (Pazarlás) | Gyakorlati Kritérium / Trigger | Rendszer-reakció (CHECK) | Ajánlott Akció (ACT) |
| :--- | :--- | :--- | :--- |
| **1. Várakozás (Waiting)** | Kintlévőség / Kint lévő számla kifizetési határideje > 15 napja lejárt. | Piros "Kintlévőség Beragadás" riasztás + Cashflow blokkolási szimuláció. | Generáljon fizetési felszólító sablont / Kamatterhelési javaslatot. |
| **2. Túltermelés / Túlfinomítás (Overprocessing)** | A projekt tényleges ráfordított ideje vagy költsége > 10%-kal meghaladja a `PLAN` büdzsét. | Sárga/Piros "Árrés-Ezió" figyelmeztetés az adott projektnél. | Munkaterjedelem (Scope) azonnali zárolása vagy pótárazás indítása. |
| **3. Felesleges Készlet (Inventory)** | Leltári tétel értéke > 50 000 Ft ÉS nincs aktív projekthez rendelve > 60 napja. | "Holt Tőke" jelölés a Leltár modulban. | Javasoljon kiárusítást / alkatrész újrahasznosítást más projektnél. |
| **4. Hibák & Újramunka (Defects)** | Hibás/Stornózott számla, nem kiterhelt alapanyag-költség vagy váratlan késedelmi díj. | "Közvetlen Profitlefedés" kategóriájú Muda bejegyzés. | Szállítói/alvállalkozói értékelés rontása + Árképzési korrekció. |
| **5. Felesleges Mozgás / Logisztika (Transportation)** | A szállítási / fuvarozási költség aránya > 8% az adott projekt teljes anyagdíjához képest. | Logisztikai Misfit piros jelzés. | Szállítási tételek összevonási javaslata vagy helyi beszerzés előírása. |
| **6. Keresetlen Tőke / Túlköltekezés (Motion/Over-spending)** | Rendszeres (recurring) előfizetés vagy fix költség használat/kihasználtság nélkül. | "Inaktív Passzív Költség" jelzés. | Előfizetés lemondása / Szerződés felülvizsgálati akció. |
| **7. Kihasználatlan Kapacitás (Over-capacity)** | Saját/vállalkozási munkaóra vagy eszköz kihasználtság < 40% a hónapban. | Kapacitás-pazarlási mutató. | Új akvizíció / pipeline feltöltési sürgetés a PLAN fázisban. |
| **+1. Elveszett Árrés (Unrealized Margin)** | Az élesített projekt tényleges árrése alacsonyabb, mint a minimálisan elvárt 25%. | Árrés-Veszélyzóna kártya. | Kötelező felülárazási javaslat a következő ajánlathoz. |

---

## 3. WIP (Work In Progress) & Kapacitáskorlátok

A párhuzamosan futó munkák széttósolják az erőforrásokat és felemésztik a likviditást.

- **Maximális Szimultán Projektek Korlátja (WIP Limit):**
  - Működési területenként (`Magán`, `Vállalkozás1`, `Vállalkozás2`) maximum **3 aktív projekt** futhat egyidejűleg a `DO` fázisban.
- **WIP Átlépési Szabály:**
  - `IF (Aktív_Projektek_Száma > 3)` ➔ A rendszer a `PLAN` oldalon letiltja az új projektek élesítését (`PLAN -> DO` átmenet blokkolva).
  - A rendszer az `ACT` oldalon kijelzi: *"Túlterhelt működés! Zárj le vagy fagyassz be egy futó projektet az új indításához!"*

---

## 4. PDCA Ciklus Adatáramlása & Fázisarchitektúra

A rendszer 2-oszlopos Mester-Gridje az alábbi szigorú adatfolyamot követi:


```

[ PLAN: Tervezés & Célok ] ──────────► [ DO: Végrehajtás & Működés ]

▲ │

│ ▼

[ ACT: Korrekció & Beavatkozás ] ◄───── [ CHECK: Elemzés & Muda ]

```

1. **PLAN (Bal oldal PD nézetben):**
   - **Komponensek:** Projekt szimulációk, Célkitűzések (mérföldkövek), Megtakarítási alhalmazok / Perselyek (alsóház fal, célösszegek).
   - **Kimenet:** Jóváhagyott költségvetés és ütemterv.

2. **DO (Jobb oldal PD nézetben):**
   - **Komponensek:** Napi operáció, Tranzakciók/Tételek táblázata, Élő Üzletek/Pipeline, Leltár és Banki egyenlegek.
   - **Kimenet:** Tényadatok, valós pénzmozgások és erőforrás-felhasználás.

3. **CHECK (Bal oldal CA nézetben):**
   - **Komponensek:** Cashflow trendek, Havi bevételek vs. kiadások oszlopdiagram, "Mire ment el?" megoszlás, Muda-analízis.
   - **Kimenet:** Terv vs. Tény eltérések, veszteség-pontok (Muda Score).

4. **ACT (Jobb oldal CA nézetben):**
   - **Komponensek:** Döntési elágazások, Beavatkozási opciók, Automatikus Ajánló Algoritmus.
   - **Kimenet:** Árazási módosítás, keret-zárolás, új tervezési ciklus indítása.

---

## 5. Algoritmus Triggerek & Szabályalapú Döntéstámogatás (IF-THEN)

Az alkalmazás háttérlogikája az alábbi feltételek alapján generál automatikus ajánlásokat az `ACT` modulban:

```typescript
// 1. Kintlévőség és Cashflow Védelmi Trigger
IF (CHECK.unpaid_invoices_overdue_days > 15) {
  ACT.addRecommendation({
    type: 'CRITICAL',
    title: 'Likviditási Riasztás',
    action: 'Fizetési felszólítás küldése és új kiadások befagyasztása',
    impact: 'Cashflow egyenleg megvédése'
  });
}

// 2. Költségtúllépési Trigger
IF (CHECK.project_actual_cost > PLAN.project_budget * 1.10) {
  ACT.addRecommendation({
    type: 'WARNING',
    title: 'Büdzsé Túllépés DETEKTÁLVA',
    action: 'Pótbevonás igénylése vagy a hátralévő mérföldkövek csökkentése',
    impact: 'Árrés megőrzése'
  });
}

// 3. Holt Tőke Leltár Trigger
IF (CHECK.idle_inventory_value > 100000 && CHECK.idle_days > 60) {
  ACT.addRecommendation({
    type: 'OPTIMIZATION',
    title: 'Holt Tőke a Leltárban',
    action: 'Nem használt eszközök/anyagok értékesítése vagy átrendezése',
    impact: 'Forgótőke felszabadítása'
  });
}

// 4. Pozitív Megtakarítási Trigger
IF (CHECK.monthly_surplus > PLAN.target_savings_monthly) {
  ACT.addRecommendation({
    type: 'SUCCESS',
    title: 'Terven felüli Megtakarítás',
    action: 'Többlet átirányítása a kijelölt Perselybe (pl. alsóház fal)',
    impact: 'Cél elérésének gyorsítása'
  });
}

```

## 6. Mutatók & Képletek

A rendszer a következő alapvető képleteket használja a kimutatásokban:

- **Muda Index (Pazarlási Arány):**
  $$\text{Muda Index (\%)} = \left( \frac{\text{Azonosított Veszteségek Összege}}{\text{Összes Havi Kiadás}} \right) \times 100$$
- **Net Cashflow:**
  $$\text{Net Cashflow} = \text{Tényleges Bevételek} - \text{Tényleges Kiadások}$$
- **Projekt Árrés (Actual Margin):**
  $$\text{Árrés (\%)} = \left( \frac{\text{Projekt Bevétel} - \text{Tényleges Projekt Költség}}{\text{Projekt Bevétel}} \right) \times 100$$
- **Persely Haladás (Goal Progress):**
  $$\text{Progres (\%)} = \left( \frac{\text{Jelenlegi Alhalmaz Egyenleg}}{\text{Célösszeg}} \right) \times 100$$
- 

