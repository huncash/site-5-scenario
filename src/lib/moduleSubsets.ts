import type { MessageKey } from "@/i18n";
import type { DashboardLabId } from "@/lib/dashboardLabs";

type PdcaMode = "PD" | "DC" | "CA" | "AP";

export const MODULE_SUBSET_IDS = ["baseline", "sim", "shock", "advise"] as const;

export type ModuleSubsetId = (typeof MODULE_SUBSET_IDS)[number];

export type ModuleSubset = {
  id: ModuleSubsetId;
  pdca: PdcaMode;
  subTab?: "cashflow" | "ledger" | "deals" | "inventory";
  labelKey: MessageKey;
  itemKeys: readonly MessageKey[];
};

export const MODULE_SUBSETS: readonly ModuleSubset[] = [
  {
    id: "baseline",
    pdca: "PD",
    labelKey: "subset.baseline",
    itemKeys: [
      "subset.itemGoals",
      "subset.itemProgress",
      "subset.itemPiggies",
      "subset.itemMonthly",
    ],
  },
  {
    id: "sim",
    pdca: "PD",
    subTab: "cashflow",
    labelKey: "subset.sim",
    itemKeys: ["subset.itemPlanned", "subset.itemWhatIf", "subset.itemFlow"],
  },
  {
    id: "shock",
    pdca: "CA",
    subTab: "cashflow",
    labelKey: "subset.shock",
    itemKeys: ["subset.itemHeatmap", "subset.itemDebts", "subset.itemRecovery", "subset.itemPnl"],
  },
  {
    id: "advise",
    pdca: "AP",
    labelKey: "subset.advise",
    itemKeys: ["subset.itemBridge", "subset.itemForks", "subset.itemAdvisor"],
  },
];

export function isModuleSubsetId(v: string): v is ModuleSubsetId {
  return (MODULE_SUBSET_IDS as readonly string[]).includes(v);
}

export function moduleSubsetById(id: ModuleSubsetId): ModuleSubset {
  return MODULE_SUBSETS.find((s) => s.id === id)!;
}

export function subsetDomId(id: ModuleSubsetId): string {
  return `module-subset-${id}`;
}

export const SUBSET_LAB_BY_ID: Record<ModuleSubsetId, DashboardLabId> = {
  baseline: "labs-baseline",
  sim: "labs-sim",
  shock: "labs-shock",
  advise: "labs-advise",
};

export function subsetIdForLab(id: string): ModuleSubsetId | null {
  const hit = (Object.entries(SUBSET_LAB_BY_ID) as Array<[ModuleSubsetId, DashboardLabId]>).find(
    ([, lab]) => lab === id,
  );
  return hit ? hit[0] : null;
}
