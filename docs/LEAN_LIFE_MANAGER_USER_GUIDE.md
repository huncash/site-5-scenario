# 📘 LEAN LIFE MANAGER — ÁTFOGÓ FELHASZNÁLÓI KÉZIKÖNYV ÉS RENDSZER-DOKUMENTÁCIÓ

> **Célközönség:** végfelhasználók, belső oktatás, későbbi PDF/nyomtatott kiadás.  
> **Kapcsolódó technikai szabályzat:** [`LEAN_SPEC.md`](./LEAN_SPEC.md)  
> **Alkalmazás:** Mesh Data Manager — offline-first Lean élet- és vállalkozáskezelő  
> **Verziójelzés:** felhasználói kézikönyv v1 (a termékfejlesztéssel együtt bővíthető)

---

## 1. Tartalomjegyzék

1. [Tartalomjegyzék](#1-tartalomjegyzék)
2. [Filozófia és alapkoncepció](#2-filozófia-és-alapkoncepció)
   - [2.1 A Lean szemlélet a mindennapi életben és vállalkozásban](#21-a-lean-szemlélet-a-mindennapi-életben-és-vállalkozásban)
   - [2.2 Offline-First & Mesh architektúra](#22-offline-first--mesh-architektúra)
   - [2.3 A PDCA ciklus (Plan – Do – Check – Act)](#23-a-pdca-ciklus-plan--do--check--act)
3. [PDCA ciklusszámláló és gamifikáció](#3-pdca-ciklusszámláló-és-gamifikáció)
   - [3.1 Workspace-szintű ciklusszámláló](#31-workspace-szintű-ciklusszámláló)
   - [3.2 Globális Sum Ciklus Badge](#32-globális-sum-ciklus-badge)
   - [3.3 Top 3 Workspace popover & `/stats`](#33-top-3-workspace-popover--stats)
4. [Munkatér (Workspace) architektúra és Szumma nézet](#4-munkatér-workspace-architektúra-és-szumma-nézet)
   - [4.1 Szigorú workspace izoláció](#41-szigorú-workspace-izoláció)
   - [4.2 Globális Szumma nézet](#42-globális-szumma-nézet)
5. [Törzsadatok & Beállítások (References Hub)](#5-törzsadatok--beállítások-references-hub-és-kontextusos-navigáció)
   - [5.1 A 5 fő törzsadat modul](#51-a-5-fő-törzsadat-modul)
   - [5.2 Kontextusos navigáció (⚙ és Vissza)](#52-kontextusos-navigáció--és-vissza)
   - [5.3 Stacked Multi-Workspace nézet](#53-stacked-multi-workspace-nézet)
6. [Adat-konzisztencia és adat-eredet családfa (Data Lineage)](#6-adat-konzisztencia-és-adat-eredet-családfa-data-lineage)
7. [Tartozások és kötelezettségek kezelése](#7-tartozások-és-kötelezettségek-kezelése-egyedi-ütemező)
8. [Részletes modul útmutató (PLAN – DO – CHECK – ACT)](#8-részletes-modul-útmutató-plan---do---check---act)
   - [8.1 PLAN — Tervezés](#81-plan--tervezés)
   - [8.2 DO — Működés](#82-do--működés)
   - [8.3 CHECK — Elemzés](#83-check--elemzés)
   - [8.4 ACT — Beavatkozás](#84-act--beavatkozás)
9. [Gyors kezdés (checklist)](#9-gyors-kezdés-checklist)
10. [Fogalomtár](#10-fogalomtár)
11. [Gyakori kérdések (GYIK)](#11-gyakori-kérdések-gyik)

---

## 2. Filozófia és alapkoncepció

### 2.1 A Lean szemlélet a mindennapi életben és vállalkozásban

A Lean Thinking eredetileg gyártási környezetre született, de a pénzügyi és magánéleti döntésekben ugyanaz a három veszteségtípus jelenik meg:

| Japán fogalom | Magyar jelentés | Tipikus jelek a rendszerben |
| :--- | :--- | :--- |
| **Muda** | Pazarlás / veszteség | Beragadt kintlévőség, holt készlet, felesleges előfizetés, árrés-erózió |
| **Muri** | Túlterhelés | Túl sok párhuzamos projekt (WIP), erőforrás-túlfeszítés |
| **Mura** | Ingadozás | Cashflow „hullámvasút”, egyenetlen bevételek/kiadások |

**Hogyan segít a szoftver?**

1. **Láthatóvá teszi** a veszteséget (CHECK: Muda score, diagramok, konzisztencia-lámpa).
2. **Korlátozza / jelzi** a túlterhelést (projekt WIP, ajánlások az ACT-ban).
3. **Simaítja** a döntéseket adatalapú PDCA ciklusokkal: terv → tény → elemzés → korrekció.

> **Alapelv (Józan Paraszti Ész):** *Ami nincs lezárva, az köti a tőkét.* A tény (bank, tételek) mindig felülírja a vágyott tervet.

### 2.2 Offline-First & Mesh architektúra

| Tulajdonság | Mit jelent a felhasználónak? |
| :--- | :--- |
| **Offline-first** | A napi munka hálózat nélkül is megy: adatok a helyi trezorban (titkosított tároló). |
| **Adatszuverenitás** | Nincs kötelező felhő-backend a pénzügyi adatokhoz; Te kezeled a mentést/exportot. |
| **Mesh / P2P készültség** | Az eszközök (node-ok) később peer-to-peer módon is szinkronizálhatók; a UI nem függ külső SaaS API-tól. |
| **Profil + trezor** | Belépés után a profilhoz kötött titkosított adatbázis nyílik meg. |

**Gyakorlati következmények:**

- Mentés: gyors export / beállítások mentés-visszaállítás (JSON).
- Bank: fájl-import (CSV) és mappa-hint — nem kötelező banki felhő API.
- Minden szerkezeti döntés (törzsadat, workspace) lokálisan perzisztálódik.

### 2.3 A PDCA ciklus (Plan – Do – Check – Act)

A főképernyő **kéthasábos mester-rácsot** használ. A felső **PDCA forgótárcsa** (knob) négy párosítást kapcsol:

```
        PD nézet                          CA nézet
┌─────────────────────┐            ┌─────────────────────┐
│ PLAN │ DO           │            │ CHECK │ ACT         │
└─────────────────────┘            └─────────────────────┘
```

Teljes adatfolyam (zárt tanulási hurok):

```
[ PLAN: Tervezés & Célok ] ──────────► [ DO: Végrehajtás & Működés ]
         ▲                                          │
         │                                          ▼
[ ACT: Korrekció ] ◄──────────────── [ CHECK: Elemzés & Muda ]
```

| Fázis | Cél | Tipikus kimenet |
| :--- | :--- | :--- |
| **PLAN** | Célok, perselyek, szimuláció, költségkeret | Jóváhagyható terv |
| **DO** | Élő tételek, cashflow, üzletek, vagyon/leltár | Tényadatok |
| **CHECK** | Diagramok, muda, hatékonyság | Eltérések, riasztások |
| **ACT** | Ajánlások, korrekció, új ciklus | Döntés + következő PLAN |

Az alsó navigáció (Cashflow / Tételek / Üzletek / Vagyon–Leltár) a **DO** operatív nézeteit váltja anélkül, hogy a PDCA filozófiát felülírná.

---

## 3. PDCA ciklusszámláló és gamifikáció

### 3.1 Workspace-szintű ciklusszámláló

Minden munkatér (`WorkspaceMeta`) saját számlálót tart:

| Mező | Jelentés |
| :--- | :--- |
| `pdca_cycle_count` | Lezárt teljes ciklusok száma (alap: 0) |
| `last_cycle_completed_at` | Utolsó lezárás időbélyege |
| `pdca_milestones` | PLAN / DO / CHECK / ACT mérföldkövek időpontjai |

**Mikor teljesül egy ciklus?**

Egy ciklus akkor számít lezártnak, ha az adott workspace végigment a láncon:

1. **PLAN** — létrejött / elindult egy terv (pl. projekt / tervezési munkaterület).
2. **DO** — legalább egy releváns tény (tranzakció, élesítés PLAN→DO, stb.).
3. **CHECK** — elemzés megnyitása / check jegyzetek mentése (muda–cashflow ellenőrzés).
4. **ACT** — korrekciós lépés (ajánlás végrehajtása vagy új tervezési ciklus indítása).

Ha az **ACT-ból új PLAN** indul, és a lánc teljes volt → `pdca_cycle_count` **+1**, a mérföldkövek resetelődnek (új PLAN-nel indul a következő kör).

> **Példa:** A „TesztCég” workspace-ben tervezel egy kampányt (PLAN), rögzítesz költségeket (DO), megnézed a muda/cashflow diagramot (CHECK), majd elfogadsz egy árazási ajánlást és új tervet nyitsz (ACT→PLAN) → a ciklus **#N → #N+1**.

### 3.2 Globális Sum Ciklus Badge

A fejlécben, a **felhasználónév mellett** megjelenő körkörös badge:

| Elem | Viselkedés |
| :--- | :--- |
| **Ikon** | Óramutató járásával megegyező körkörös nyíl (`RotateCw`) |
| **Szám** | `sum_count` = összes workspace `pdca_cycle_count` összege |
| **Fényerő / telítettség** | Alacsony értéknél halványabb; a szám növekedésével fokozatosan erősebb opacity / brightness |

**Fejléc elrendezés (bal oldal):**

| Elem | Viselkedés |
| :--- | :--- |
| Pénztárca ikon | Egyedül ez ugrik a főoldalra (`/`) |
| „Mesh Data Manager” | Statikus címke |
| Felhasználónév | User Info Cloud popover (profil-statisztika helyőrző) |
| Sum badge | Top 3 + ugrás a `/stats` oldalra |

### 3.3 Top 3 Workspace popover & `/stats`

A badge-re kattintva:

1. Megjelenik a **globális szumma**.
2. Listázódik a **Top 3** legtöbb ciklust lezárt munkatér (pl. `Magán: #5`, `TesztCég: #3`).
3. A „Aktivitás & Ciklus Statisztikák →” gomb a **`/stats`** útvonalra visz.

A `/stats` oldal vázlata a következők nyomon követésére szolgál:

- globális ciklus szumma,
- workspace rangsor,
- (később) aktivitás és futási idő metrikák.

**Gamifikációs cél:** a rendszeres felülvizsgálat (CHECK) és a lezárt tanulási körök (ACT→új PLAN) jutalmazása — nem a „több adat rögzítése önmagáért”.

---

## 4. Munkatér (Workspace) architektúra és Szumma nézet

### 4.1 Szigorú workspace izoláció

A rendszer **három fő világot** kezel (és projekteket ezek alatt):

| Típus | Tipikus tartalom | Miért elkülönül? |
| :--- | :--- | :--- |
| **Magán (`personal`)** | Háztartás, megtakarítás, ingatlan | Adó/ÁFA logika más; privát költséghelyek |
| **Üzleti (`business`)** | Cég, ÁFA, partnerek, erőforrások | Könyvelési és ÁFA szabályok |
| **Projekt (`project`)** | Szimuláció / pilot / előkészítés | Tervezett vs. tényleges státusz; ernyőhöz csatolható |

**Szabály:** egy tétel, tartozás vagy erőforrás mindig **egy** `workspace_id`-hoz kötődik. A belső átvezetések (pl. tagi kölcsön) *párosított* tételeket hoznak létre, de a Szumma/P&L számításból kizárhatók, hogy ne torzítsanak.

> **Miért fontos?** Ha a magán bevásárlás „belefolyik” a céges eredménybe, a CHECK muda- és árrés-számok megbízhatatlanok lesznek — és rossz ACT döntést szülnének.

### 4.2 Globális Szumma nézet

A **Szumma** (`__all` / szumma fül) **nem keveri össze** az adatokat egy közös „zsákba”, hanem:

1. Munkaterületenként olvassa a tételeket / tartozásokat.
2. Aggregált KPI-kat számol (likviditás, céges eredmény, magán kassza, zárolt ÁFA, perselyek).
3. Megjeleníti az **Adat-konzisztencia** lámpát és az **Adat-eredet diagramot**.

| Szumma KPI (példa) | Tartalom |
| :--- | :--- |
| Összesített likviditás | Magán + cég bruttó − zárolt ÁFA − perselyek |
| Céges tiszta eredmény | Nettó üzleti eredmény (tagi átvezetések kizárva) |
| Magán kassza | Magán bruttó egyenleg |
| Adat-Konzisztencia | 3 állású lámpa → lineage |

A felső fülekkel (Magán / középső cég–projekt / Szumma) és a PDCA knobal együtt a Szumma a **„repülőtéri torony”**: látod az egészet, de a szerkesztés továbbra is izolált munkatereken történik.

---

## 5. Törzsadatok & Beállítások (References Hub) és kontextusos navigáció

Útvonal: **`/references`**  
Belépés: profil menü → **Törzsadatok**, vagy bármely szekció bal felső **`⚙`** ikonja.

### 5.1 A 5 fő törzsadat modul

| # | Fül | Tartalom | Mentés hatóköre |
| :---: | :--- | :--- | :--- |
| 1 | **Partnerek** | Vevők, beszállítók, hatóságok; adószám; fizetési határidő (nap) | Aktív `workspace_id` |
| 2 | **Bankszámlák & Szinkron** | Számla csatolás/leválasztás; banki szinkron mappa hint | Workspace + bank–workspace mapping |
| 3 | **Munkavállalók & Erőforrások** | Név, szerep, díjszabás, fix költség | Workspace `humanResources` |
| 4 | **Perselyek & Ügyeletek** | Célösszeg, prioritás; ügyeleti fix költségek | Workspace buckets / duties |
| 5 | **Tartozások & Önrészek** | NAV részlet, beszállítói tartozás, pályázati önrész; ütemező | `loans` store + `workspace_id` |

**CRUD működés:**

- **Hozzáadás / szerkesztés** a listában (piszkozat).
- **Mentés** gomb → rákérdező modal: *„Biztosan frissíted a törzsadat-kapcsolatot?”*
- **Törlés** megerősítéssel.
- Tartozásoknál a részletes űrlap a **LoanDialog** Mentés gombjával kerül a store-ba.

A fejlécben lévő **Munkatér váltó** lehetővé teszi, hogy navigáció nélkül válts másik workspace törzsadataira.

### 5.2 Kontextusos navigáció (⚙ és Vissza)

| Elem | Viselkedés |
| :--- | :--- |
| **`⚙`** (szekció bal felső) | Megjegyzi: aktív workspace, alsó fül, PDCA mód, görgetési pozíció → megnyitja a megfelelő References fület |
| **Highlight** | Ha sárga/piros konfliktusból jössz, a problémás azonosítók kiemelve jelennek meg |
| **`◄ Vissza a PDCA nézethez`** | Visszaállítja a korábbi nézetet és a scroll pozíciót |

**Példa:** A „TesztCég” DO → Tartozások kártyáján ⚙ → References megnyílik `workspace=TesztCég`, fül=`debts`. Vissza gomb → újra a Tartozások szekciónál vagyunk, nem a Magán kezdőképernyőn.

### 5.3 Stacked Multi-Workspace nézet

Ha a ⚙ a **Szummából** indul (`workspace=__all` / `isSzumma=true`):

- A References Hub **egymás alá** rendezi az összes aktív munkatér szerkesztőmodulját.
- Minden kártya címkézve van (pl. *„Magán munkatér törzsadatai”*, *„TesztCég munkatér törzsadatai”*).
- A közös fülválasztó (Partnerek / Bank / …) az összes stacked kártyára érvényes.

Ez megfelel az „import mappa / erőforrás” típusú beállító oldalak mintájának: egy helyen látod és javítod az összes izolált világot.

---

## 6. Adat-konzisztencia és adat-eredet családfa (Data Lineage)

A Szumma nézet alsó része és a cashflow KPI sáv **Adat-Konzisztencia** kártyája együtt alkotja a lineage rendszert.

### 6.1 3-állású közlekedési lámpa

| Állapot | Jelentés | Tipikus ok |
| :---: | :--- | :--- |
| 🟢 **Zöld** | Tiszta adatkapcsolatok | Nincs árva / kritikus / duplikációs jelzés |
| 🟡 **Sárga** | Kisebb konfliktus / duplikációs kockázat | Ugyanaz a `bank_raw_id` több workspace-ben; érvénytelen projekt-hivatkozás |
| 🔴 **Piros** | Kritikus hiba | Árva tétel/tartozás (ismeretlen `workspace`), hiányzó hivatkozás |

### 6.2 Smooth scroll

A lámpa KPI-ra kattintva a nézet **simán gördül** az `#data-lineage` szekcióhoz (*Adat-eredet Diagram & Struktúra*).

### 6.3 Interaktív hibaelhárítás

A diagram három szintje:

```
[ Munkaterek: Magán / Cég / … ]
        ↓
[ Adatforrások: Tételek / Tartozások / Bank ]
        ↓
[ Globális Szumma ]
```

| Művelet | Hatás |
| :--- | :--- |
| **Vonatkoztatás törlése** | Dupla beleszámítás / hibás projekt- vagy bank-kötés oldása (megerősítéssel) |
| **Áthelyezés → Magán** | Árva tétel visszahelyezése érvényes workspace-re |
| **⚙ a lineage keretben** | Ugrás a Törzsadat / szerkezeti beállításokhoz, kiemelt problémás ID-kkal |

Minden szerkezeti módosítás előtt **rákérdezős mentés** jelenik meg.

---

## 7. Tartozások és kötelezettségek kezelése (egyedi ütemező)

### 7.1 Miért nem csak „Hitel”?

A klasszikus „bankhitel” modell nem fedi le a magyar KKV és magánéleti valóságot. A rendszer **Tartozás / Kötelezettség** fogalmat használ, többek között:

| Típus (példa) | Használati eset |
| :--- | :--- |
| NAV részletfizetés | pl. 6 havi kamatmentes ÁFA részlet |
| Beszállítói tartozás | Halasztott fizetés, egyedi esedékességek |
| Pályázati önrész | Ütemezett saját erő |
| Tagi / személyi / lízing | Klasszikus hitel-szerű kötelezettségek |

Minden tartozás **workspace-izolált** (`workspace_id`).

### 7.2 Rugalmas ütemező & felülbírálás

1. Megadod a teljes összeget, gyakoriságot (havi / egyszeri / egyedi) és az induló dátumot.
2. A rendszer **egyenlő részleteket** generál; az utolsó sor kerekíti a maradékot (NAV-stílus).
3. Bármelyik sort **kézzel felülírhatod** (összeg, dátum, státusz: pending/paid) — pl. a 6. havi kerekítési eltéréshez.

### 7.3 Beépülés a cashflow előrejelzésbe

- A DO / Vagyon–Leltár kártyán: fennálló tartozás, közeli részletteher, következő esedékesség.
- A cashflow nézetben: **közelgő részletek** (pl. 60 napos ablak) — a PLAN likviditási gondolkodását támogatják.
- A References Hub **Tartozások** fülén ugyanazok a rekordok szerkeszthetők workspace-kontextusban.

---

## 8. Részletes modul útmutató (PLAN – DO – CHECK – ACT)

### 8.1 PLAN — Tervezés

**Cél:** eldönteni, *hová megy a pénz és az energia*, mielőtt a valóság „megírja” helyetted.

| Eszköz | Mit csinálj vele? |
| :--- | :--- |
| **Célok (Goals)** | Célösszeg + határidő; aktív cél a perselyekhez rendelhető |
| **Perselyek (megtakarítási alhalmazok)** | Alhalmazok létrehozása / átnevezése; célhoz rendelés |
| **Többes kijelölés** | 2+ persely → összevont egyenleg + közös cél-teljesülés sáv |
| **⇄ Átcsoportosítás** | Két kijelölt persely között belső átvezetés (saving páros) |
| **What-if / szimuláció** | Projekt mód: tervezett tételek, forgatókönyv (konzervatív / reális / optimista) |
| **Tervezett kiadások** | Projekt szimuláció panel |

**Tipikus PLAN napirend (15 perc):**

1. Nézd meg az aktív célt és a perselyek egyenlegét.  
2. Ha kell, jelölj ki 2 perselyt és csoportosíts át.  
3. Frissítsd a projekt készültségét / forgatókönyvét.  
4. Forgasd a knobot DO felé, amikor a terv „elég jó a cselekvéshez”.

### 8.2 DO — Működés

Az alsó fülek a napi operációt szolgálják:

| Fül | Fő funkciók |
| :--- | :--- |
| **Cashflow** | Egyenlegek, ÁFA tartalék / magán szabad egyenleg, banki CSV szinkron, Új tétel; Szummában konzisztencia-lámpa |
| **Tételek** | Szűrők (bevétel/kiadás/megtakarítás/tartozás–tervezett), **+ Új tétel**, sor szerkesztése (ceruza), számla státusz |
| **Üzletek** | Továbbértékesítési pipeline, árrés KPI-k |
| **Vagyon / Leltár** | Tartozások KPI + lista; magánnál vagyon, cégnél leltár hangsúly |

**Új tétel / szerkesztés:**

1. **+ Új tétel** → dialógus az aktuális `workspace_id`-val.  
2. Kitöltés: típus, összeg, kategória, partner/jogcím (üzleti), ÁFA, számla státusz, stb.  
3. **Mentés** → titkosított tranzakció a helyi store-ban.  
4. Szerkesztésnél a dialógus betölti a meglévő mezőket; Mentés `update` mutációt futtat.

A szekciók **`⚙`** ikonjai a References megfelelő fülére ugranak (Bank / Partnerek / Tartozások / Perselyek).

### 8.3 CHECK — Elemzés

**Cél:** *látni a muda-t*, mielőtt újabb költséget vállalsz.

| Eszköz | Tartalom |
| :--- | :--- |
| **Muda Score** | 0–100 veszteség-index a Lean szabályok alapján |
| **Bevétel vs. kiadás** | Oszlopdiagram (idősor) |
| **Megoszlás** | Kördiagram („mire ment el?”) |
| **Check jegyzetek** | Szabad szöveges észrevételek a workspace-en |
| **Erőforrás-hatékonyság** | HR / jármű / költség arányok (ha van adat) |

A muda-mátrix részletes trigger-szabályait a [`LEAN_SPEC.md`](./LEAN_SPEC.md) tartalmazza (várakozás, túltermelés, készlet, hibák, logisztika, passzív költség, kapacitás, árrés).

### 8.4 ACT — Beavatkozás

**Cél:** egy konkrét döntés, nem „majd holnap”.

| Eszköz | Példa |
| :--- | :--- |
| **Lean ajánló** | Kintlévőség, árrés, WIP, passzív költség alapján javaslat |
| **Végrehajtás** | Navigál a megfelelő DO fülre; ACT mérföldkövet jelöl |
| **Új tervezési ciklus** | ACT→PLAN; teljes lánc esetén növeli a ciklusszámlálót |
| **PLAN→DO élesítés** | Projekt „élő” üzleti módban folytatható |

> **Szabály:** Ha a CHECK piros, az ACT nem „újabb táblázat” — hanem *egy* konkrét lépés (felszólítás, scope zárolás, árazás, előfizetés lemondás, WIP csökkentés).

---

## 9. Gyors kezdés (checklist)

### Első nap

- [ ] Profil létrehozása / trezor megnyitása  
- [ ] Magán és legalább egy üzleti workspace beállítása (alias, szín)  
- [ ] Bankszámla rögzítése és workspace-hez csatolása (References → Bank)  
- [ ] 1–2 partner felvétele  
- [ ] Egy cél + egy persely létrehozása (PLAN)  
- [ ] Néhány tétel rögzítése (DO → Tételek)  
- [ ] CHECK diagramok megnyitása  
- [ ] Egy ACT ajánlás kipróbálása  

### Heti rutin (PDCA)

| Nap | Fázis | 10 perces rutin |
| :--- | :---: | :--- |
| Hétfő | PLAN | Célok / perselyek / heti keret |
| Szerda | DO | Tételek + bank import |
| Péntek | CHECK | Muda + cashflow |
| Vasárnap | ACT | 1 döntés + ha kell új ciklus |

---

## 10. Fogalomtár

| Fogalom | Rövid definíció |
| :--- | :--- |
| **Workspace** | Izolált adatvilág (Magán / Cég / Projekt) |
| **Szumma** | Aggregált nézet, adatkeverés nélkül |
| **Tétel** | Bevétel / kiadás / megtakarítás tranzakció |
| **Persely** | Megtakarítási alhalmaz (`bucket`) |
| **Törzsadat** | Partnerek, bank, HR, perselyek, tartozások master adatai |
| **Lineage** | Adat-eredet / hivatkozási családfa |
| **Muda** | Pazarlás / veszteség |
| **WIP** | Folyamatban lévő, le nem zárt munka |
| **PDCA ciklus** | Teljes PLAN→DO→CHECK→ACT tanulási kör |
| **Sum badge** | Globális ciklusszám a fejlécben |
| **Trezor** | Titkosított helyi adattár |

---

## 11. Gyakori kérdések (GYIK)

**Miért nem látom az „Új tétel” ablakot?**  
Győződj meg róla, hogy a trezor nyitva van, és a DO → Tételek fülön vagy. A dialógus az aktív workspace-hez kötődik.

**A Szumma „összeadja” a magánt a céggel?**  
Aggregált KPI-kat mutat, de az adatok workspace szerint maradnak elkülönítve. A konzisztencia-lámpa jelzi, ha valami „átfolyik” hibásan.

**Hol állítom a NAV részletet?**  
DO → Vagyon/Leltár → Tartozások, vagy References → Tartozások fül; típus: NAV részletfizetés + ütemező.

**Mit jelent a sárga lámpa?**  
Általában duplikációs kockázat (pl. ugyanaz a banki nyers tétel több workspace-ben). Nyisd meg a lineage-t, és oldd a vonatkoztatást.

**Hogyan nő a fejléc badge fényereje?**  
Minden lezárt PDCA ciklus növeli a globális `sum_count` értéket; a badge opacity/brightness ehhez skálázódik.

**Elvesznek az adatok offline?**  
Nem — lokálisan tárolódnak. Készíts rendszeres titkosított mentést (profil menü / Beállítások).

**Hol van a teljes Lean szabályzat?**  
A döntéstámogató algoritmusok hivatalos forrása: [`docs/LEAN_SPEC.md`](./LEAN_SPEC.md).

---

## Függelék A — Ajánlott billentyűparancsok (összefoglaló)

| Parancs | Hatás (tipikus) |
| :--- | :--- |
| Ctrl+S | Gyors mentés / export |
| Alt+Shift + nyilak | Alsó fülek váltása |
| PageUp / PageDown | Felső workspace fülek |
| Alt+Shift+End | Szumma kapcsoló |
| Nyíl le | PDCA knob léptetés |

*(A pontos kötések a telepített verzió `useKeyboardShortcuts` beállításaitól függnek.)*

---

## Függelék B — Dokumentumhasználat PDF / nyomtatáshoz

1. Nyisd meg ezt a fájlt Markdown nézegetőben (Cursor, VS Code, Obsidian, stb.).  
2. Exportáld PDF-be (pl. „Markdown PDF” bővítmény vagy pandoc).  
3. Nyomtatási tipp: A4, margó ≥ 15 mm; a tartalomjegyzék horgonyai képernyőn kattinthatók, nyomtatásban oldalszám helyett fejezetcímekkel navigálj.

---

*Készült a Mesh Data Manager / Lean Life Manager felhasználói oktatásához.  
A kézikönyv a termék UI-jával együtt változik — eltérés esetén a futó alkalmazás és a `LEAN_SPEC.md` a mérvadó.*
