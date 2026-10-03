/** Közös alapkontextus: új szcenárió ezt örökli, nem kell újra megadni. */

export const MASTER_BASELINE_LABEL = "Master Baseline";

export type OrgKind = "business" | "household" | "community" | "campus" | "macro" | "hospital";

export type MasterBaselineResources = {
  cashHuf?: number | null;
  energyKwh?: number | null;
  waterLiters?: number | null;
  stockDays?: number | null;
  autonomyHours?: number | null;
};

export type MasterBaselineContext = {
  orgKind: OrgKind;
  orgLabel: string;
  headcount: number;
  sizeHint: string;
  startingResources: MasterBaselineResources;
  monthlyRevenueNet?: number | null;
  inheritedFrom?: string | null;
};

export const MASTER_BASELINE = {
  businessAlias: "Core üzem",
  description:
    "Master Baseline — a szervezet működő törzse. Az új szcenárió ezt örökli; a projekt csak a döntés rétegét viszi.",
  headcount: 14,
  sizeHint: "14 fős üzem, 2 telephely",
  startingCashHuf: 4_200_000,
  stockDays: 12,
  monthlyRevenueNet: 8_400_000,
  plan: {
    setup: 480_000,
    lab: 210_000,
    permit: 160_000,
    recInternet: 28_000,
    recPhone: 18_000,
    recBankFees: 14_500,
    recAccounting: 62_000,
    recInsurance: 38_000,
  },
  loan: {
    original: 3_600_000,
    remaining: 1_620_000,
    installment: 148_000,
  },
} as const;

export function masterPartners(segmentId: string) {
  const p = (key: string) => `p:master:${segmentId}:${key}`;
  return [
    {
      id: p("cust"),
      kind: "customer",
      name: "Core vevők (baseline)",
      tax_id: null,
      payment_term_days: 14,
      note: "Öröklött törzs — havi értékesítés.",
    },
    {
      id: p("sup"),
      kind: "supplier",
      name: "Keretszerződéses nagyker",
      tax_id: "18181818-2-42",
      payment_term_days: 21,
      note: "Öröklött törzs — alapanyag.",
    },
    {
      id: p("log"),
      kind: "supplier",
      name: "Logisztika / raktár",
      tax_id: "19191919-2-13",
      payment_term_days: 14,
      note: "Öröklött törzs — ellátás.",
    },
    {
      id: p("auth"),
      kind: "authority",
      name: "Működési hatóság",
      tax_id: null,
      payment_term_days: null,
      note: "Öröklött törzs — engedélyek.",
    },
  ];
}

export function masterDuties(segmentId: string) {
  const d = (key: string) => `d:master:${segmentId}:${key}`;
  return [
    { id: d("haccp"), name: "HACCP — core üzem", cadence: "negyedéves", fixed_cost_huf: 52_000 },
    { id: d("audit"), name: "Belső audit (baseline)", cadence: "éves", fixed_cost_huf: 240_000 },
    { id: d("lab"), name: "Labor — alapanyag-minta", cadence: "féléves", fixed_cost_huf: 130_000 },
  ];
}

export function defaultMasterBaseline(): MasterBaselineContext {
  return {
    orgKind: "business",
    orgLabel: MASTER_BASELINE.businessAlias,
    headcount: MASTER_BASELINE.headcount,
    sizeHint: MASTER_BASELINE.sizeHint,
    startingResources: {
      cashHuf: MASTER_BASELINE.startingCashHuf,
      stockDays: MASTER_BASELINE.stockDays,
    },
    monthlyRevenueNet: MASTER_BASELINE.monthlyRevenueNet,
  };
}

export function isMasterBaselineContext(value: unknown): value is MasterBaselineContext {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.orgLabel === "string" && typeof v.headcount === "number" && typeof v.sizeHint === "string";
}

export function inheritMasterBaseline(
  parent: MasterBaselineContext,
  childLabel: string,
): MasterBaselineContext {
  return {
    ...parent,
    startingResources: { ...parent.startingResources },
    inheritedFrom: parent.orgLabel || childLabel,
  };
}

export function resolveWorkspaceBaseline(opts: {
  workspace?: { master_baseline?: MasterBaselineContext | null; inherits_baseline?: boolean | null } | null;
  parent?: { master_baseline?: MasterBaselineContext | null; alias?: string | null } | null;
  profile?: MasterBaselineContext | null;
  fallback: MasterBaselineContext;
}): MasterBaselineContext {
  const ws = opts.workspace;
  if (ws?.master_baseline && isMasterBaselineContext(ws.master_baseline) && !ws.inherits_baseline) {
    return ws.master_baseline;
  }
  if (opts.parent?.master_baseline && isMasterBaselineContext(opts.parent.master_baseline)) {
    return inheritMasterBaseline(opts.parent.master_baseline, opts.parent.alias ?? "core");
  }
  if (ws?.master_baseline && isMasterBaselineContext(ws.master_baseline)) {
    return inheritMasterBaseline(ws.master_baseline, ws.master_baseline.orgLabel);
  }
  if (opts.profile && isMasterBaselineContext(opts.profile)) {
    return inheritMasterBaseline(opts.profile, opts.profile.orgLabel);
  }
  return opts.fallback;
}
