export const LABS_DEFAULT_ON_DASHBOARD = false;

export const DASHBOARD_LABS = [
  {
    id: "labs-baseline",
    label: "Master Baseline & Alapműködés",
    chip: "Baseline",
    value:
      "Törzs számok, célok és perselyek — a PLAN kiinduló rétege. A fáról vagy a bővítményekből nyitható.",
    hint: "PDCA PLAN: Master Baseline, célok, megtakarítási alhalmazok.",
    labelKey: "subset.baseline",
    valueKey: "labs.baselineValue",
    chipKey: "labs.chipBaseline",
    hintKey: "labs.hintBaseline",
  },
  {
    id: "labs-sim",
    label: "Tervezés & szimuláció",
    chip: "Szimuláció",
    value:
      "Tervezett kiadások, What-if pályák és pénzáramlás — a döntés előtti futtatás.",
    hint: "PDCA PLAN: tervezett tételek, What-if, cashflow.",
    labelKey: "subset.sim",
    valueKey: "labs.simValue",
    chipKey: "labs.chipSim",
    hintKey: "labs.hintSim",
  },
  {
    id: "labs-shock",
    label: "Valóság-sokk & adósság",
    chip: "Sokk",
    value:
      "Hőtérkép, tartozások, helyreállítás és eredménylevezetés — ami a tervet üti.",
    hint: "PDCA CHECK/ACT: valóság-sokk, tartozás, P&L.",
    labelKey: "subset.shock",
    valueKey: "labs.shockValue",
    chipKey: "labs.chipShock",
    hintKey: "labs.hintShock",
  },
  {
    id: "labs-advise",
    label: "Döntéstámogatás",
    chip: "Tanács",
    value:
      "Magán–üzleti híd, elágazások és Lean tanács — a beavatkozás rétege.",
    hint: "PDCA ACT/PLAN: híd, elágazás, tanácsadó.",
    labelKey: "subset.advise",
    valueKey: "labs.adviseValue",
    chipKey: "labs.chipAdvise",
    hintKey: "labs.hintAdvise",
  },
  {
    id: "labs-kpi",
    label: "KPI sáv",
    chip: "KPI",
    value:
      "Négy gyors mutató a fejléc alatt — előkészítés. A fán és a bővítményekben él; a dashboardon még nem.",
    hint: "Előkészítés: a sáv a fán van, a fő nézeten rejtve.",
    labelKey: "labs.kpiLabel",
    valueKey: "labs.kpiValue",
    chipKey: "labs.chipKpi",
    hintKey: "labs.hintKpi",
  },
  {
    id: "labs-halmozott",
    label: "Halmozott konszolidáció",
    chip: "Halmozott",
    value:
      "A pálya halmozódását látod egyben: hol erősödik a tartalék, hol fogy a levegő — nem csak a havi szeletet.",
    hint: "Halmozott eredmény a fő nézeten. A három pálya a PDCA ciklusban marad.",
    labelKey: "labs.halmozottLabel",
    valueKey: "labs.halmozottValue",
    chipKey: "labs.chipHalmozott",
    hintKey: "labs.hintHalmozott",
  },
  {
    id: "labs-szumma",
    label: "Multi-case / Szumma",
    chip: "Szumma",
    value:
      "Az összes nyitott Case egy képen: a cég egésze, nem asztalonként. Egy döntés, teljes kép.",
    hint: "Összes Slot egyben. Kikapcsolva a fő nézet egyetlen munkatérre szűkül.",
    labelKey: "labs.szummaLabel",
    valueKey: "labs.szummaValue",
    chipKey: "labs.chipSzumma",
    hintKey: "labs.hintSzumma",
  },
  {
    id: "labs-edge",
    label: "Szenzoros / Edge",
    chip: "Edge",
    value:
      "A gép, a sor és a helyszín számát ugyanarra az asztalra hozza, ahol a kassza van.",
    hint: "Helyi adatgyűjtő, mesh-térkép és fizikai műveleti panel.",
    labelKey: "labs.edgeLabel",
    valueKey: "labs.edgeValue",
    chipKey: "labs.chipEdge",
    hintKey: "labs.hintEdge",
  },
  {
    id: "labs-anon",
    label: "Oktatási anonimizáló",
    chip: "Anonim",
    value:
      "Élő céges nevekből kategória-fedőnevek (A1 alapanyag, P1 partner). A napi nézeten rejtve; a fáról egy kattintásra előjön.",
    hint: "Oktatási motor: fedőnevek, lektoráló varázsló, helyi .szc másolat.",
    labelKey: "labs.anonLabel",
    valueKey: "labs.anonValue",
    chipKey: "labs.chipAnon",
    hintKey: "labs.hintAnon",
  },
] as const;

export type DashboardLabId = (typeof DASHBOARD_LABS)[number]["id"];

const SUBSET_LAB_IDS: ReadonlySet<string> = new Set([
  "labs-baseline",
  "labs-sim",
  "labs-shock",
  "labs-advise",
]);

export function isSubsetLabId(id: string): id is DashboardLabId {
  return SUBSET_LAB_IDS.has(id);
}

/** A négy PDCA-nézet alapból a dashboardon él; a többi lab pipáig rejtve. */
export function labDefaultOnDashboard(id: DashboardLabId): boolean {
  return isSubsetLabId(id);
}

const DASHBOARD_HIDDEN_LAB_IDS: ReadonlySet<string> = new Set(["labs-kpi"]);

/** Előkészítés: a fa és a bővítmények mutatják, a fő nézet nem. */
export function labShowsOnDashboard(id: DashboardLabId): boolean {
  return !DASHBOARD_HIDDEN_LAB_IDS.has(id);
}

export const LAB_STATUS_PREVIEW = "Megtekintés / Kipróbálás";
export const LAB_STATUS_ACTIVE = "Aktív";

export type LabSurfaceStatus = "preview" | "active";

export function isDashboardLabId(id: string): id is DashboardLabId {
  return DASHBOARD_LABS.some((lab) => lab.id === id);
}

export function dashboardLabById(id: DashboardLabId) {
  return DASHBOARD_LABS.find((lab) => lab.id === id)!;
}

/** A dashboardon csak akkor él, ha a licenc engedi és a kapcsoló be van pipálva. */
export function resolveLabSurface(input: { entitled: boolean; pipedToDashboard: boolean }): {
  onDashboard: boolean;
  status: LabSurfaceStatus;
} {
  const onDashboard = input.entitled && input.pipedToDashboard;
  return {
    onDashboard,
    status: onDashboard ? "active" : "preview",
  };
}

/** Chip csak a Dev Tree-n / ha a lab a dashboardra van kötve — nincs sárga sáv a Mag mellett. */
export function labChipVisible(
  id: DashboardLabId,
  input: { engineOn: boolean; onDashboard: boolean },
): boolean {
  if (isSubsetLabId(id) || !labShowsOnDashboard(id)) return false;
  if (!input.engineOn) return false;
  return input.onDashboard;
}
