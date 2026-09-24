# CODE HEALTH & BUG AUDIT — Mesh Data Manager (`src/`)

> **Audit típus:** statikus kód- és architektúra-vizsgálat (olvasás, mintaillesztés, manuális review)  
> **Hatáskör:** teljes `src/` mappa, beleértve `src/types/leanTools.ts`  
> **Dátum:** 2026-07-23  
> **Módszer:** célzott fájl-átnézés + ripgrep minták; nem futott teljes runtime profilozás / E2E

---

## 1. Tartalomjegyzék

1. [Vezetői összefoglaló](#2-vezetői-összefoglaló)
2. [Architekturális helyzetkép](#3-architekturális-helyzetkép)
3. [Kritikus prioritás](#4-kritikus-prioritás)
4. [Közepes prioritás](#5-közepes-prioritás)
5. [Alacsony prioritás](#6-alacsony-prioritás)
6. [Vizsgálati tengelyek részletezése](#7-vizsgálati-tengelyek-részletezése)
7. [Lean Tools (`leanTools.ts`) állapot](#8-lean-tools-leantoolsts-állapot)
8. [Javasolt javítási sorrend](#9-javasolt-javítási-sorrend)
9. [Mérőszámok](#10-mérőszámok)

---

## 2. Vezetői összefoglaló

A kódbázis **funkcionálisan gazdag** (PDCA, References Hub, lineage, tartozás-ütemező, offline trezor), de a **`src/routes/index.tsx` monolit** (~12k sor, ~80+ `useState`) és a laza típus-határok (`as any` ≈ 230+) kockázatot jelentenek a teljesítményre, karbantarthatóságra és offline adatbiztonságra.

| Prioritás | Darab (kb.) | Fő téma |
| :--- | :---: | :--- |
| **Kritikus** | 8 | Listener leak kockázat, vault context churn, export/decrypt, backup lyuk, scroll-lock |
| **Közepes** | 14 | PDCA side-effect, z-index, vault guard hiány, `any` hotspotok |
| **Alacsony** | 12 | Dead code, sticky/z-10, Toaster mount, magic `pb-20` |

**Legnagyobb ROI:** (1) billentyűzet listener stabilizálás, (2) VaultProvider memo, (3) decrypt normalizer + export try/catch, (4) z-index skála + dialog scroll-lock, (5) `FinanceDashboard` szétbontása.

---

## 3. Architekturális helyzetkép

```
VaultProvider ──► Route pages
                      │
                      ├─ /  → FinanceDashboard (monolit) + BottomNav
                      ├─ /references → WorkspaceSettings
                      ├─ /settings, /stats, /report, /devices, /logs
                      └─ localdb / mesh / crypto (offline)
```

| Réteg | Állapot | Megjegyzés |
| :--- | :--- | :--- |
| UI routes | Vegyes | `index.tsx` túl nagy; más route-ok tisztábbak |
| Hooks | Jó / közepes | `useReferencesNav` stabil; `useKeyboardShortcuts` kockázatos |
| Adattár | Jó alap | IndexedDB + titkosítás; backup/export szélein lyukak |
| Típusok | Gyenge határ | Domain típusok léteznek, ingest gyakran `any` |
| Lean Tools | Csak modell | `leanTools.ts` registry kész, UI/persist nincs |

---

## 4. Kritikus prioritás

### C-01 — `useKeyboardShortcuts`: listener újracsatolás + remove mismatch

**Tengely:** memóriaszivárgás / event listener  
**Fájlok:** `src/hooks/useKeyboardShortcuts.ts`, `src/routes/index.tsx`

```ts
// useKeyboardShortcuts.ts — jelenlegi
window.addEventListener("keydown", onKeyDown, { passive: false });
return () => window.removeEventListener("keydown", onKeyDown as any);
```

```tsx
// index.tsx — inline handlerek → minden render új függvényidentitás
useKeyboardShortcuts({
  onPrevBottomTab: () => stepBottomTab(-1),
  onNextBottomTab: () => stepBottomTab(1),
  // ...
});
```

**Kockázat:** a hook deps tömbje a callback-eket is figyeli → gyakori unsubscribe/subscribe. Emellett az `addEventListener` options és a `removeEventListener` (options nélkül) bizonyos böngészőkben **nem párosul**, így a listenerek felhalmozódhatnak.

**Javítás:**

```ts
// hooks/useKeyboardShortcuts.ts
const opts: AddEventListenerOptions = { passive: false };
window.addEventListener("keydown", onKeyDown, opts);
return () => window.removeEventListener("keydown", onKeyDown, opts);

// index.tsx — stabil handlerek
const onPrevBottomTab = useCallback(() => stepBottomTab(-1), [stepBottomTab]);
const onNextBottomTab = useCallback(() => stepBottomTab(1), [stepBottomTab]);
// ...
useKeyboardShortcuts({
  enabled: true,
  onPrevBottomTab,
  onNextBottomTab,
  onPrevTopTab,
  onNextTopTab,
  onSave: quickSave,
  onToggleSzumma: toggleSzumma,
  onRotatePdca,
});
```

Alternatíva a hookban: `useEffectEvent` / ref a legfrissebb callbackökhöz, deps csak `[enabled]`.

---

### C-02 — `VaultProvider` context value minden renderben új objektum

**Tengely:** React re-render  
**Fájl:** `src/lib/vault.tsx`

```tsx
<VaultContext.Provider
  value={{
    state,
    createProfile,
    selectProfile,
    // ... minden metódus új referencia
  }}
>
```

**Kockázat:** minden `useVault()` fogyasztó (ProfileHeader, FinanceDashboard, settings, …) újrarenderel, ha a Provider bármi miatt újrarenderel.

**Javítás:**

```tsx
const createProfile = useCallback(async (...) => { /* ... */ }, [deps]);
// ... többi metódus useCallback-kel

const value = useMemo(
  () => ({
    state,
    createProfile,
    selectProfile,
    beginCreate,
    cancelCreate,
    unlock,
    unlockById,
    lock,
    backToPicker,
    deleteProfile,
    renameProfile,
  }),
  [state, createProfile, selectProfile, /* ... */],
);

return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
```

---

### C-03 — `FinanceDashboard` monolit (~12k sor, ~80+ state)

**Tengely:** re-render / karbantarthatóság  
**Fájl:** `src/routes/index.tsx`

Egyetlen komponens tartja a PDCA, tételek, célok, bank, lineage, persely, tartozás, dialógusok állapotát. Bármely `setState` a teljes fa újraszámolását indítja. `React.memo` használat: **0** a `src/`-ben.

**Javítás (fokozatos):**

1. Különítsd el: `PlanPanel`, `DoCashflowPanel`, `DoLedgerPanel`, `CheckPanel`, `ActPanel`.
2. Kontextus vagy kis store a megosztott `activeWorkspace` / `pdcaMode` számára.
3. Dialógusokat (Txn/Loan) tartsd a gyökér közelében (már kint vannak a `lockPdcaView` ágból — jó irány).

---

### C-04 — Export decrypt: egy hibás sor bedöntheti a mentést

**Tengely:** offline edge-case  
**Fájl:** `src/lib/localdb.ts` (`exportEncryptedData`)

A UI lekérdezések `try/catch`-csel ugorják a korrupt sorokat; az export ciklus **nincs** így védve → egy rossz `data_enc` az egész mentést elronthatja.

**Javítás:**

```ts
for (const r of txnsEnc) {
  try {
    const p = await decryptJSON(vaultKey, r.data_enc);
    if (!isWs(wsOf(p))) continue;
    txns.push({ id: r.id, type: r.type, occurred_at: r.occurred_at, payload: p });
  } catch {
    skipped.push(r.id);
  }
}
// toast.warn(`${skipped.length} sor kihagyva`)
```

---

### C-05 — `category_rules` hiányzik a dump/backup körből

**Tengely:** offline adatvesztés  
**Fájl:** `src/lib/localdb.ts`

A `STORE_CATEGORY_RULES` létezik és a UI használja, de az `exportDump` / `importDump` **nem** tartalmazza → teljes rendszermentésnél a besorolási szabályok elveszhetnek.

**Javítás:** dump schema + import ciklus bővítése `category_rules` tömbbel (ugyanúgy, mint `loans` / `bank_accounts`).

---

### C-06 — Szigorú `DB_VERSION` kapu a restore-nál

**Tengely:** offline edge-case  
**Fájl:** `src/lib/localdb.ts`

```ts
if (typeof env.version !== "number" || env.version !== DB_VERSION)
  throw new Error("Mentés verzió eltérés.");
```

Régebbi (még érvényes) mentés **mindig** elbukik.

**Javítás:**

```ts
if (typeof env.version !== "number" || env.version > DB_VERSION) {
  throw new Error("Mentés újabb, mint az app.");
}
// env.version < DB_VERSION → migráció vagy best-effort import
```

---

### C-07 — Decrypt ingest: `amount` típuskényszerítés nélkül

**Tengely:** null/undefined / típusbiztonság  
**Fájlok:** `src/routes/index.tsx`, `src/routes/report.tsx`

```ts
amount: p.amount, // lehet string / undefined a vaultból
```

Későbbi `Number(t.amount)` gyakran megmenti, de NaN / összeomló KPI-k lehetségesek.

**Javítás:**

```ts
function coerceAmount(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
// hydrate:
amount: coerceAmount(p.amount),
```

Ideális: egy közös `normalizeTxnPayload(unknown): Transaction` (Zod vagy kézi mapper) — `index` / `report` / export közös.

---

### C-08 — Dialog scroll-lock vs. belső `<main>` scroller

**Tengely:** UI / layout  
**Fájlok:** route shell-ek (`index`, `settings`, `references`, …), `src/styles.css`

A görgetés a `<main className="overflow-y-auto">` elemen van, miközben a Radix Dialog a **`body`**-t zárja. Következmény: modal mögött a tartalom tovább görgethető.

**Javítás (válassz egyet):**

A) Görgetés vissza a `document`/`body`-ra;  
B) Dialog open esetén `main` kapjon `overflow-hidden` / `inert` (közös `useLockMainScroll` hook).

---

## 5. Közepes prioritás

### M-01 — `markWsPdca("check")` effect függvény-identitáson is fut

**Fájl:** `src/routes/index.tsx`

```tsx
useEffect(() => {
  if (pdcaMode === "DC" || pdcaMode === "CA") markWsPdca("check");
}, [pdcaMode, markWsPdca]);
```

Ha `markWsPdca` / settings változik, felesleges settings-írás történhet.

**Javítás:** csak `pdcaMode`-ra figyelve; `markWsPdca` ref-ből; vagy „már beírtam-e ehhez a módhoz” flag.

---

### M-02 — `updateWorkspaceMeta` deps hiányos (`commitSettings`)

**Fájl:** `src/routes/index.tsx`  
A callback a később definiált `commitSettings`-et zárja be, de a deps listából hiányzik → elavult undo/settings mentés.

**Javítás:** helyezd a definíciót `commitSettings` alá, és tedd be a deps tömbbe.

---

### M-03 — Flat `z-50` overlay sík

**Fájlok:** `ui/dialog`, `ui/select`, `ui/popover`, `BottomNav`, bulk action bar

Dialog overlay, Select portál, BottomNav és tömeges műveletsáv mind `z-50` → Select a dialog mögé kerülhet; bulk bar ütközik a BottomNav-val.

**Javítás — z-skála:**

| Réteg | z-index |
| :--- | ---: |
| Sticky lokális | 10 |
| BottomNav | 40 |
| Dialog overlay/content | 50 |
| Popover / Select in dialog | 60 |
| Toast | 70 |

Bulk bar: `bottom-[calc(4.5rem+env(safe-area-inset-bottom))]` vagy BottomNav elrejtése kijelöléskor.

---

### M-04 — WorkspaceTabs master grid: dupla `px-6` + jobb oszlop spacer

**Fájlok:** `WorkspaceTabs.tsx`, `index.tsx`  
Háromszoros vízszintes padding; jobb oldalon üres `<div />` → fáziscímek függőlegesen elcsúsznak.

**Javítás:** master grid path-on ne legyen nested `px-6`; távolítsd el a spacer divet, igazítsd a két oszlop headerjét.

---

### M-05 — `grid-cols-2` mobilon nem törik

**Fájlok:** `WorkspaceTabs.tsx`, több index szekció  
Keskeny viewporton összenyomott kétoszlopos PDCA.

**Javítás:** `grid-cols-1 lg:grid-cols-2`.

---

### M-06 — Vault guard hiányos route-okon

| Route | Guard |
| :--- | :--- |
| `/`, `/settings`, `/references`, `/stats` | Teljes |
| `/report` | Csak `enabled: unlocked` — UI üresen látszik |
| `/devices`, `/logs` | URL `profile` fallback — zárt trezornál is olvasható mesh adat |

**Javítás:** közös `VaultRouteGuard` komponens (lásd `stats.tsx` mintát).

---

### M-07 — Mutációk decrypt try/catch nélkül

**Fájl:** `index.tsx` (`updateTxn`, `patchTxnWorkspace`, …)  
Egy korrupt sor → el nem kapott rejection.

**Javítás:** `try/catch` + `toast.error("Sérült tétel")`.

---

### M-08 — `as any` hotspotok

| Fájl | `as any` (kb.) |
| :--- | ---: |
| `routes/index.tsx` | 105 |
| `routes/settings.tsx` | 75 |
| `lib/localdb.ts` | 41 |

**Javítás:** ingest normalizer + Zod a dump/import határon; WorkspaceMeta mezők tipizált patch helperrel.

---

### M-09 — Inline callback props (WorkspaceTabs / DataLineage)

Új függvény minden renderben → gyerekek nem memoizálhatók.

**Javítás:** `useCallback` a szülőben; hosszú távon panel komponensek `React.memo`-val.

---

### M-10 — `PdcaSemiRotaryKnob` effect: `cumulativeAngle` a deps-ben

Felesleges sync körök forgatáskor.

**Javítás:** csak `mode` prop változásra szinkronizálj (angle ref-ből).

---

### M-11 — `html` scrollbar-gutter vs. `main` scroller

**Fájl:** `src/styles.css`  
A gutter a dokumentumon van, a valódi görgetés a `main`-en → felesleges jobb margó / modal shift.

**Javítás:** gutter a tényleges scrolleren, vagy egységes body-scroll modell (lásd C-08).

---

### M-12 — ProfileHeader: két Popover + Dropdown egyszerre nyitható

Nincs kölcsönös kizárás; mind `z-50`.

**Javítás:** egy „openOverlay” state, vagy `onOpenChange`-ben a többi bezárása.

---

### M-13 — Loan `schedule` / Goal `target_amount` laza ingest

`as any` cast schedule-re; célösszeg kényszerítés nélkül.

**Javítás:** `normalizeLoan` / `normalizeGoal` helper.

---

### M-14 — `FileReader.onload` unmount után is setState-elhet

**Fájl:** bank CSV import az `index.tsx`-ben.

**Javítás:** `let cancelled = false` + cleanup, vagy AbortController minta.

---

## 6. Alacsony prioritás

| ID | Téma | Megjegyzés |
| :--- | :--- | :--- |
| L-01 | `DataLineage` `issueByEntity` dead memo | Töröld, vagy használd a listában |
| L-02 | `setTimeout(revokeObjectURL)` cleanup nélkül | Alacsony kockázat |
| L-03 | Magic `pb-20` BottomNav alatt | CSS változó / `safe-area-inset` |
| L-04 | Sticky `z-10` táblázatfejek | OK, amíg nincs globális sticky header |
| L-05 | SectionSettingsGear `absolute` + `overflow-hidden` Card | Figyelni a Card overflow-t |
| L-06 | `React.memo` hiánya | Teljesítmény-tartalék |
| L-07 | Hooks sorrend szétaprózva az `index.tsx`-ben | Karbantarthatóság |
| L-08 | Non-null `!` felesleges helyeken | Lokális const a guard után |
| L-09 | `color-scheme: dark` mindig | Nincs light path — dokumentáld, vagy készülj dual tokenre |
| L-10 | Toaster nem mountolt a `__root.tsx`-ben? | Ellenőrizd: `toast()` hívások lehet, hogy nem jelennek meg; ha hiányzik, add hozzá `<Toaster />`-t |
| L-11 | BottomNav túlzsúfolt mobilon | `overflow-x-auto` vagy overflow menü |
| L-12 | `leanTools` registry 0% UI kötés | Várható; ne legyen félkész route |

---

## 7. Vizsgálati tengelyek részletezése

### 7.1 React State & Re-render

| Komponens / hook | Értékelés |
| :--- | :--- |
| `useReferencesNav` | **Jó** — `useCallback` + `navigate` deps |
| `useLeanRecommendations` | **Jó** — tiszta `useMemo` |
| `useKeyboardShortcuts` | **Kritikus** — lásd C-01 |
| `VaultProvider` | **Kritikus** — lásd C-02 |
| `FinanceDashboard` | **Kritikus** — lásd C-03 |
| `WorkspaceTabs` | Közepes — `tabBtn` gyár minden renderben |
| `ProfileHeader` | Közepes — inline `style`, settings query |

### 7.2 Memóriaszivárgások & Event Listenerek

| Hely | Cleanup | Megjegyzés |
| :--- | :---: | :--- |
| `useKeyboardShortcuts` keydown | Igen* | *options mismatch |
| Pointer drag (`index.tsx`) | Igen | ref-alapú, jó minta |
| `VaultProvider` bootstrap | N/A | async cancel nincs — alacsony |
| Bank `FileReader` | Nem | M-14 |
| Dialógusok / Popover | Radix kezeli | OK |

### 7.3 Offline & Edge-case

| Forgatókönyv | Viselkedés | Értékelés |
| :--- | :--- | :--- |
| Üres profiles | Vault → `no-profiles` | Jó |
| Üres settings | `EMPTY_SETTINGS` | Jó |
| Korrupt txn decrypt (UI lista) | skip | Jó |
| Korrupt txn decrypt (export) | throw | **Rossz** (C-04) |
| Korrupt txn decrypt (update) | throw | Közepes (M-07) |
| Régi backup verzió | reject | **Rossz** (C-06) |
| Category rules backup | kimarad | **Rossz** (C-05) |
| Locked vault + `/devices` | adat olvasható | Közepes (M-06) |

### 7.4 TypeScript típusbiztonság

- Domain típusok (`finance.ts`, `workspace.ts`, `leanTools.ts`) **rendben**.
- Határ (`decryptJSON` → UI) **gyenge** (`as any` dominancia).
- `leanTools.ts`: típusok + registry **komplett**; implementáció **nincs** — ez nem bug, de technikai adósság, ha félkész UI kerül be route nélkül.

### 7.5 UI & Layout Shift

| Kockázat | Súlyosság |
| :--- | :--- |
| Modal mögötti scroll (C-08) | Magas |
| z-50 ütközések (M-03) | Magas |
| scrollbar-gutter / main mismatch (M-11) | Közepes |
| WorkspaceTabs padding/alignment (M-04) | Közepes |
| Bulk bar vs BottomNav | Magas (M-03) |
| PDCA 2-oszlop mobilon (M-05) | Közepes |

---

## 8. Lean Tools (`leanTools.ts`) állapot

| Elem | Státusz |
| :--- | :--- |
| `FiveWhyAnalysis`, `A3Report`, `ValueStreamMap`, `IshikawaDiagram`, `PokaYokeSet`, `GembaWalk` | Típus OK |
| `LEAN_TOOL_REGISTRY` + descriptorok | OK |
| `computeVsmRatios`, empty factory-k, ACT push helper | OK |
| Route / Panel komponens / localdb store | **Hiányzik** |
| PDCA ACT bekötés | Csak típus szinten (`LeanPdcaLink`) |

**Ajánlás:** amíg nincs persist + UI, ne exportálj félkész menüpontot a felhasználónak. Következő lépés: mesh/local store + lazy panel map a `component_key` alapján.

---

## 9. Javasolt javítási sorrend

### Sprint A — Stabilizálás (1–2 nap)

1. C-01 keyboard listener  
2. C-02 VaultProvider memo  
3. C-04 export try/catch  
4. C-07 amount coerce + közös normalizer váz  
5. M-03 z-index skála + bulk bar pozíció  

### Sprint B — Offline integritás

1. C-05 category_rules a dumpban  
2. C-06 verziókapu enyhítés / migráció  
3. M-06 VaultRouteGuard  
4. M-07 mutation decrypt try/catch  

### Sprint C — Architektúra

1. C-03 FinanceDashboard szétbontás (fázisonként)  
2. M-01 / M-02 PDCA meta write tisztítás  
3. M-08 `any` csökkentés normalizerrel  
4. C-08 scroll modell egységesítés  

### Sprint D — Lean Tools termék

1. Persist réteg a `LeanToolDocument`-hez  
2. CHECK/ACT panelek lazy load a registry-ből  

---

## 10. Mérőszámok

| Metrika | Érték (audit idején) |
| :--- | :--- |
| `src/routes/index.tsx` sorok | ~12 400 |
| `useState` az index fájlban | ~84 |
| `useEffect` az index fájlban | ~23 |
| `React.memo` a `src/`-ben | 0 |
| `as any` (prod, kb.) | ~230+ |
| Legnagyobb `as any` fájlok | index 105, settings 75, localdb 41 |
| Lean tool kind-ok registryben | 6 |
| Lean tool UI route-ok | 0 |

---

## Függelék — Gyors „smoke” ellenőrzőlista a javítások után

- [ ] Alt+Shift billentyűk 50× váltás után is egyszer futnak (nincs dupla lépés)  
- [ ] Modal nyitva → háttér `main` nem görget  
- [ ] Select a LoanDialogban a dialog *fölött* jelenik meg  
- [ ] Korrupt txn sorral az export figyelmeztet, nem omlik el  
- [ ] Mentés/visszaállítás megőrzi a `category_rules` táblát  
- [ ] Zárt trezornál `/devices` és `/report` locked UI-t mutat  
- [ ] `npm run typecheck` zöld  

---

*Ez a jelentés statikus audit. Runtime profilozás (React Profiler, memory heap) és E2E tesztek további regressziókat tárhatnak fel — különösen a monolit `FinanceDashboard` alatt.*
