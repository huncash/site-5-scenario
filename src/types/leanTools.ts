/**
 * Lean Tools — jövőbeli speciális modulok adatmodellje.
 * Offline-first, workspace-izolált; UI komponensek a LeanToolRegistry-n keresztül köthetők be.
 */

// ─── Közös alapok ────────────────────────────────────────────────────────────

export type LeanToolKind = "five_why" | "a3_report" | "vsm" | "ishikawa" | "poka_yoke" | "gemba_walk";

export type LeanToolStatus = "draft" | "in_progress" | "completed" | "archived";

export type LeanPdcaLink = {
  /** Cél PDCA fázis, ahová az eredmény bedobható (tipikusan ACT) */
  target_phase: "plan" | "do" | "check" | "act";
  /** Opcionális ACT ajánlás / akció azonosító a főappban */
  act_action_id?: string | null;
  /** Opcionális hivatkozott tétel / projekt / tartozás */
  entity_ref?: {
    entityType: "transaction" | "loan" | "project" | "workspace" | "goal" | "other";
    entityId: string;
  } | null;
};

/** Minden Lean tool rekord közös mezői (workspace izoláció + audit) */
export type LeanToolBase = {
  id: string;
  workspace_id: string;
  kind: LeanToolKind;
  title: string;
  status: LeanToolStatus;
  created_at: string; // ISO
  updated_at: string; // ISO
  created_by_profile_id?: string | null;
  pdca_link?: LeanPdcaLink | null;
  tags?: string[];
  notes?: string | null;
};

// ─── 1. 5-Why (Gyökérok elemzés) ──────────────────────────────────────────────

export type FiveWhyStep = {
  /** 1..5 (vagy több, ha a UI engedi a bővítést) */
  index: number;
  question: string; // pl. "Miért?"
  answer: string;
};

export type FiveWhyPreventiveAction = {
  id: string;
  description: string;
  /** ACT modulba dobható-e automatikusan */
  push_to_act: boolean;
  owner?: string | null;
  due_date?: string | null; // YYYY-MM-DD
  done?: boolean;
};

export type FiveWhyAnalysis = LeanToolBase & {
  kind: "five_why";
  problem_statement: string;
  steps: FiveWhyStep[]; // tipikusan 5 egymásra épülő lépés
  root_cause: string;
  preventive_actions: FiveWhyPreventiveAction[];
};

export const FIVE_WHY_DEFAULT_DEPTH = 5 as const;

export function emptyFiveWhySteps(depth = FIVE_WHY_DEFAULT_DEPTH): FiveWhyStep[] {
  return Array.from({ length: Math.max(1, depth) }, (_, i) => ({
    index: i + 1,
    question: "Miért?",
    answer: "",
  }));
}

// ─── 2. A3 Problem Solving Report ────────────────────────────────────────────

export type A3SectionKey =
  | "background"
  | "current_state"
  | "target_state"
  | "root_cause"
  | "countermeasures"
  | "impact"
  | "standardization";

export type A3Section = {
  key: A3SectionKey;
  label_hu: string;
  body: string;
  /** Opcionális hivatkozás 5-Why / Ishikawa dokumentumra */
  linked_tool_id?: string | null;
};

export type A3Countermeasure = {
  id: string;
  description: string;
  owner?: string | null;
  due_date?: string | null;
  status: "planned" | "doing" | "done" | "blocked";
  push_to_act?: boolean;
};

export type A3Report = LeanToolBase & {
  kind: "a3_report";
  sections: A3Section[];
  countermeasures: A3Countermeasure[];
  /** Hatásvizsgálat rövid KPI-k (szabadon bővíthető) */
  impact_kpis?: Array<{
    id: string;
    name: string;
    before: number | null;
    after: number | null;
    unit?: string | null;
  }>;
};

export const A3_SECTION_DEFS: ReadonlyArray<{ key: A3SectionKey; label_hu: string }> = [
  { key: "background", label_hu: "Háttér" },
  { key: "current_state", label_hu: "Jelenlegi állapot" },
  { key: "target_state", label_hu: "Célállapot" },
  { key: "root_cause", label_hu: "Gyökérok elemzés" },
  { key: "countermeasures", label_hu: "Ellenintézkedések" },
  { key: "impact", label_hu: "Hatásvizsgálat" },
  { key: "standardization", label_hu: "Standardizálás" },
];

export function emptyA3Sections(): A3Section[] {
  return A3_SECTION_DEFS.map((d) => ({
    key: d.key,
    label_hu: d.label_hu,
    body: "",
    linked_tool_id: null,
  }));
}

// ─── 3. VSM (Value Stream Map) ───────────────────────────────────────────────

export type VsmStepKind = "value_adding" | "non_value_adding" | "necessary_non_value_adding";

export type VsmProcessStep = {
  id: string;
  name: string;
  kind: VsmStepKind;
  /** Percben (vagy más egység a map.time_unit szerint) */
  duration: number;
  /** Költség HUF (opcionális) */
  cost_huf?: number | null;
  /** Kapcsolódó tétel / kategória azonosítók (proxy a pénzügyi tételekhez) */
  linked_txn_ids?: string[];
  linked_category?: string | null;
  sequence: number;
};

export type VsmRatios = {
  /** Értékteremtő idő aránya 0..1 */
  va_time_ratio: number;
  /** Nem értékteremtő idő aránya 0..1 */
  nva_time_ratio: number;
  /** Értékteremtő költség aránya 0..1 */
  va_cost_ratio: number;
  /** Nem értékteremtő költség aránya 0..1 */
  nva_cost_ratio: number;
  total_time: number;
  total_cost_huf: number;
  va_time: number;
  nva_time: number;
  va_cost_huf: number;
  nva_cost_huf: number;
};

export type ValueStreamMap = LeanToolBase & {
  kind: "vsm";
  process_name: string;
  time_unit: "minutes" | "hours" | "days";
  steps: VsmProcessStep[];
  /** Számított arányok (UI / helper tölti) */
  ratios?: VsmRatios | null;
};

/** VA / NVA arányok számítása a lépésekből (tiszta függvény, UI-független) */
export function computeVsmRatios(steps: VsmProcessStep[]): VsmRatios {
  let va_time = 0;
  let nva_time = 0;
  let va_cost = 0;
  let nva_cost = 0;
  for (const s of steps) {
    const t = Math.max(0, Number(s.duration) || 0);
    const c = Math.max(0, Number(s.cost_huf) || 0);
    if (s.kind === "value_adding") {
      va_time += t;
      va_cost += c;
    } else {
      // NVA + szükséges NVA egyaránt a „nem értékteremtő” oldalon a pazarlás-arányhoz
      nva_time += t;
      nva_cost += c;
    }
  }
  const total_time = va_time + nva_time;
  const total_cost_huf = va_cost + nva_cost;
  return {
    va_time,
    nva_time,
    total_time,
    va_cost_huf: va_cost,
    nva_cost_huf: nva_cost,
    total_cost_huf,
    va_time_ratio: total_time > 0 ? va_time / total_time : 0,
    nva_time_ratio: total_time > 0 ? nva_time / total_time : 0,
    va_cost_ratio: total_cost_huf > 0 ? va_cost / total_cost_huf : 0,
    nva_cost_ratio: total_cost_huf > 0 ? nva_cost / total_cost_huf : 0,
  };
}

// ─── 4a. Ishikawa (Halszálka) ────────────────────────────────────────────────

export type IshikawaCategoryKey =
  | "man" // Ember
  | "machine" // Gép / Eszköz
  | "method" // Módszer
  | "material" // Anyag
  | "measurement" // Mérés
  | "environment"; // Környezet (Mother Nature)

export type IshikawaCause = {
  id: string;
  text: string;
  /** Másodlagos / mélyebb ok (opcionális fa) */
  children?: IshikawaCause[];
  severity?: 1 | 2 | 3 | 4 | 5 | null;
};

export type IshikawaBranch = {
  category: IshikawaCategoryKey;
  label_hu: string;
  causes: IshikawaCause[];
};

export type IshikawaDiagram = LeanToolBase & {
  kind: "ishikawa";
  effect: string; // a „fej” — a vizsgált probléma / hatás
  branches: IshikawaBranch[];
  /** Opcionális kapcsolat 5-Why gyökérokhoz */
  linked_five_why_id?: string | null;
};

export const ISHIKAWA_CATEGORY_DEFS: ReadonlyArray<{
  category: IshikawaCategoryKey;
  label_hu: string;
}> = [
  { category: "man", label_hu: "Ember" },
  { category: "machine", label_hu: "Gép / Eszköz" },
  { category: "method", label_hu: "Módszer" },
  { category: "material", label_hu: "Anyag" },
  { category: "measurement", label_hu: "Mérés" },
  { category: "environment", label_hu: "Környezet" },
];

export function emptyIshikawaBranches(): IshikawaBranch[] {
  return ISHIKAWA_CATEGORY_DEFS.map((d) => ({
    category: d.category,
    label_hu: d.label_hu,
    causes: [],
  }));
}

// ─── 4b. Poka-Yoke (hibavédelem) ─────────────────────────────────────────────

export type PokaYokeControlType = "prevention" | "detection" | "warning";

export type PokaYokeRule = {
  id: string;
  name: string;
  description: string;
  control_type: PokaYokeControlType;
  /** Hol érvényesül (UI / folyamat lépés) */
  applies_to?: string | null;
  active: boolean;
  /** Automatikus ellenőrzés kulcsa (későbbi engine) */
  rule_key?: string | null;
  workspace_id: string;
  created_at: string;
  updated_at: string;
};

export type PokaYokeSet = LeanToolBase & {
  kind: "poka_yoke";
  rules: PokaYokeRule[];
};

// ─── 4c. Gemba Walk (helyszíni ellenőrzés) ───────────────────────────────────

export type GembaCheckItem = {
  id: string;
  prompt: string;
  required: boolean;
  checked: boolean;
  observation?: string | null;
  photo_ref?: string | null; // helyi fájl / blob id (offline)
};

export type GembaWalk = LeanToolBase & {
  kind: "gemba_walk";
  location_label: string;
  walked_at: string; // ISO
  checklist: GembaCheckItem[];
  findings?: string | null;
  follow_up_action_ids?: string[];
};

// ─── Unió + registry ─────────────────────────────────────────────────────────

export type LeanToolDocument =
  | FiveWhyAnalysis
  | A3Report
  | ValueStreamMap
  | IshikawaDiagram
  | PokaYokeSet
  | GembaWalk;

export type LeanToolDocumentOf<K extends LeanToolKind> = Extract<LeanToolDocument, { kind: K }>;

/** UI / router kötéshez: egy tool meta leírója */
export type LeanToolDescriptor<K extends LeanToolKind = LeanToolKind> = {
  kind: K;
  label_hu: string;
  short_hu: string;
  /** Ajánlott PDCA fázis a megnyitáshoz */
  preferred_pdca_phase: "plan" | "do" | "check" | "act";
  /** Jövőbeli route / panel azonosító */
  route_key: string;
  /** Komponens kulcs (lazy import névhez) */
  component_key: string;
  /** Ikon hint (lucide név vagy emoji) */
  icon_hint: string;
  version: number;
};

export type LeanToolRegistry = {
  [K in LeanToolKind]: LeanToolDescriptor<K>;
};

export const LEAN_TOOL_REGISTRY: LeanToolRegistry = {
  five_why: {
    kind: "five_why",
    label_hu: "5-Why gyökérok elemzés",
    short_hu: "5-Why",
    preferred_pdca_phase: "check",
    route_key: "lean/five-why",
    component_key: "FiveWhyPanel",
    icon_hint: "HelpCircle",
    version: 1,
  },
  a3_report: {
    kind: "a3_report",
    label_hu: "A3 Problem Solving Report",
    short_hu: "A3",
    preferred_pdca_phase: "act",
    route_key: "lean/a3",
    component_key: "A3ReportPanel",
    icon_hint: "FileText",
    version: 1,
  },
  vsm: {
    kind: "vsm",
    label_hu: "Értékáram térkép (VSM)",
    short_hu: "VSM",
    preferred_pdca_phase: "check",
    route_key: "lean/vsm",
    component_key: "VsmPanel",
    icon_hint: "GitBranch",
    version: 1,
  },
  ishikawa: {
    kind: "ishikawa",
    label_hu: "Ishikawa (Halszálka) diagram",
    short_hu: "Ishikawa",
    preferred_pdca_phase: "check",
    route_key: "lean/ishikawa",
    component_key: "IshikawaPanel",
    icon_hint: "GitMerge",
    version: 1,
  },
  poka_yoke: {
    kind: "poka_yoke",
    label_hu: "Poka-Yoke hibavédelem",
    short_hu: "Poka-Yoke",
    preferred_pdca_phase: "act",
    route_key: "lean/poka-yoke",
    component_key: "PokaYokePanel",
    icon_hint: "ShieldCheck",
    version: 1,
  },
  gemba_walk: {
    kind: "gemba_walk",
    label_hu: "Gemba Walk ellenőrzőlista",
    short_hu: "Gemba",
    preferred_pdca_phase: "do",
    route_key: "lean/gemba",
    component_key: "GembaWalkPanel",
    icon_hint: "MapPin",
    version: 1,
  },
};

export function listLeanToolDescriptors(): LeanToolDescriptor[] {
  return Object.values(LEAN_TOOL_REGISTRY);
}

export function getLeanToolDescriptor(kind: LeanToolKind): LeanToolDescriptor {
  return LEAN_TOOL_REGISTRY[kind];
}

/** ACT-ba dobható megelőző / ellenintézkedés közös alakja */
export type LeanActPushPayload = {
  source_tool_kind: LeanToolKind;
  source_tool_id: string;
  workspace_id: string;
  title: string;
  description: string;
  due_date?: string | null;
  navigate_to?: "ledger" | "deals" | "cashflow" | "inventory" | "plan" | null;
};

export function fiveWhyActionToActPush(
  analysis: FiveWhyAnalysis,
  action: FiveWhyPreventiveAction,
): LeanActPushPayload {
  return {
    source_tool_kind: "five_why",
    source_tool_id: analysis.id,
    workspace_id: analysis.workspace_id,
    title: action.description.slice(0, 80) || "5-Why megelőző akció",
    description: `Gyökérok: ${analysis.root_cause}\nAkció: ${action.description}`,
    due_date: action.due_date ?? null,
    navigate_to: "ledger",
  };
}
