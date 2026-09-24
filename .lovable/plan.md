# Mesh Data Manager — terv / átalakítás

Nagy méretű változás, ezért két lépcsőre bontom. Az 1. lépcső mindent lefed, ami a promptban szerepel; a 2. lépcső a projektek/szumma nézet átvezetése (ugyanaz a motor).

## 1) Adatmodell — ÁFA per tétel

- `TxnPayload`-ba új opcionális mező: `vat_rate: number` (százalék). Alapérték üres → az aktuális workspace default ÁFA (27%). Régi tételek visszamenőleg olvashatók (undefined → default).
- Új segéd: `computeVatSplit(amount, rate, mode: "gross"|"net")` → `{ net, vat, gross }`. Vállalkozás nézetben default `mode = "net"` (a beírt szám a nettó, ÁFA felül), Magán nézetben `mode = "gross"` (mai viselkedés). Kapcsoló a szerkesztő modálban.
- Kompozit összegzés: totals kap egy `sumNet`, `sumVat`, `sumGross` bontást; vállalkozásnál a kártya „szumma” nagy száma a nettó, alatta halvány `+ ÁFA X` sor.
- Perzisztencia: változatlan (`data_enc` payload csak bővül). Migráció nem szükséges.

## 2) Munkaterületek

- `workspace` state már van (`middleWs`, „Magán” fix + kiválasztott középső). Bővítés:
  - Új `workspaceKind: "personal" | "business" | "project" | "sum"` — a fül alapján számolt.
  - A `txns/goals/settings` továbbra is a **profil** szinten él (nem választom szét most a workspace-eket saját tárolóra — külön kérésre külön lépés lesz). Az egyes tételekhez opcionálisan hozzárendelhető `workspace: string` tag payloadban; alapból `"personal"`.  Szűrés a nézetnél a workspace szerint. Így a mai adat marad Magán alatt, a Vállalkozás1 üres startról indul.

## 3) Vizuális irány

- **Magán (marad)**: jelenlegi lekerekített kártyás UI, minor: tételek listája beköltözik a szekciókártyába (lásd 4).
- **Vállalkozás**: „retro ceruzás T-számla” esztétika, de továbbra is a semantikus tokenekre építve.
  - Háttér: enyhe „papír” textúra + finom rácsvonalak (CSS radial/linear-gradient, nem kép).
  - Tipó: display-hez egy „kézírás/rajzolt” érzés — `font-family: ui-serif` alap, kártya-fejlécekhez `italic tracking-wide`, aláhúzás egy 2px-es szaggatott vonallal (border-b border-dashed border-foreground/40).
  - „T-kereszt”: a bevétel és kiadás kártya közé egy vízszintes vonal + középen egy függőleges osztóvonal (grid overlay), ami klasszikus főkönyvi T-t idéz. Reszponzívan md-től felfelé jelenik meg, mobilon a szekciók egymás alá kerülnek.
  - Színkódolás megmarad (piros/zöld/sárga státusz-csík), de a kártya-kitöltés monokróm papír-alap, a hangsúly a tipográfián és a vonalakon.

## 4) Szekció-belső tétellista (MINDEN nézetre)

Ez a legnagyobb szerkezeti változás.

- A mai `expandedView` teljes szekció-mód eltűnik olyan formában, hogy „elrejti a többi kártyát”. Helyette:
  - Minden `StatCard` (bevétel/kiadás/megtakarítás/tervezett) alul kap egy **beépített, kollabálható tétellistát**. Alapból csukva (a mai szumma-számok maradnak fent), egy „Tételek megtekintése ▾” gombbal a kártyán belül nyílik le.
  - Nyitáskor a kártya csak függőlegesen nyúlik, a többi kártya a helyén marad, a grid újratördel. Több kártya is nyitva lehet egyszerre.
  - Az irányítópulti bal/jobb léptető nyilak eltűnnek (nincs többé „csak ez a szekció” fullscreen).
- Vállalkozás nézetben a lista **min. 2 oszlopos táblázat**: `Nettó | ÁFA (%) | Bruttó | Dátum | Kategória | Műveletek`. ÁFA % inline szerkeszthető (kattintás → kis input, Enter/blur ment, undo-hoz kötve).
- Magán nézetben a lista a mai kompakt listaelem-forma marad (bruttó fókusz), az ÁFA oszlop rejtve.

## 5) Reszponzív grid

- Egy egységes `grid` (`grid-cols-1 md:grid-cols-2 xl:grid-cols-2`) tartja a 4 fő kártyát, a mai fix 2×2 rács helyett tiszta autó-reflow-val, hogy mobilon egymás alá kerüljenek olvasási sorrendben.
- Az „Egyenleg” sáv és az „Irányítópult” a rács fölött marad, a T-kereszt overlay csak `md+` szélességen látszik.

## 6) Módosított/új fájlok

```text
src/lib/finance.ts             + computeVatSplit, TxnPayload bővítés (vat_rate, workspace)
src/routes/index.tsx           StatCard-ba beépített lista, grid reflow, workspaceKind kapcsoló,
                               ExpandedView eltávolítása, PlannedExpensesCard hasonlóan
src/components/BusinessLayout.tsx   (új) T-számla háttér + tipó tokenek, wrapper
src/components/TxnRowBusiness.tsx   (új) nettó/áfa/bruttó soros, inline áfa % szerkesztés
src/components/TxnRowPersonal.tsx   (új) mai kompakt sor, kiszervezve
```

Az `index.tsx` monstre fájl marad, de a két sor-komponenst kiemelem, hogy a különbség olvasható legyen.

## 7) Scope amit MOST NEM csinálok

- Külön workspace-enkénti adat-izoláció saját IndexedDB-store-ban (ma tag alapú szűrés).
- Vállalkozás-specifikus új mezők (számla sorszám, partner, ÁFA-kód lebontás) — mostani ÁFA egyszerű százalék.
- „Projekt1/2” és „Szumma” egyedi renderelés — a 4. pont grid-átépítése rájuk is érvényes, de vizuálisan a Magán stílust öröklik, amíg külön kérés nem jön.

## 8) Nyitott döntés — jóváhagyás előtt

1. **Vállalkozás alapértelmezett ÁFA**: 27% HUF EU rögzített, vagy workspace-szintű beállítás (Vállalkozás1 külön %-tal, Vállalkozás2 mással)? Én workspace-szintűt javaslok, alap 27, `settings.workspaces[wsName].defaultVat`.
2. **Vállalkozás alapadat**: üres startról induljon a Vállalkozás1 (ma nincs benne semmi), vagy a jelenlegi tételek automatikusan Magánhoz taggolódjanak és Vállalkozás1 tényleg üres? Én az utóbbit javaslom (nem-destruktív, jelenlegi tételek `workspace = "personal"` default tag alá kerülnek).
