/**
 * Poka-Yoke: a négy PDCA-alhalmaz és a KPI sáv csak a Dev Tree-n /
 * bővítményeken él. A dashboardon nem maradhat fül, sáv, elárvult DOM.
 */
import { DASHBOARD_LABS, labChipVisible, labShowsOnDashboard } from "@/lib/dashboardLabs";
import { ENTITLEMENT_GATES } from "@/lib/entitlement";
import { LABS_TREE_MODULES } from "@/lib/labsTechTree";
import { MODULE_SUBSET_IDS, SUBSET_LAB_BY_ID } from "@/lib/moduleSubsets";

export const DASHBOARD_SURFACE_GUARD_V = 1 as const;

export const DASHBOARD_FORBIDDEN_SELECTORS: readonly string[] = [
  "[data-kpi-quick-bar]",
  "[data-subset-nav]",
  "[data-labs-dashboard-strip]",
  "[data-module-subset]",
  "nav[aria-label='Moduláris alhalmazok']",
  "nav[aria-label='Modular subsets']",
];

export const DASHBOARD_ORPHAN_ARIA_LABELS: readonly string[] = [
  "Moduláris alhalmazok",
  "Modular subsets",
  "Master Baseline & Alapműködés",
  "Master Baseline & base operation",
  "Tervezés & szimuláció",
  "Planning & simulation",
  "Valóság-sokk & adósság",
  "Reality-shock & debt",
  "Döntéstámogatás",
  "Decision support",
];

export const DASHBOARD_HIDDEN_ERROR_SELECTORS: readonly string[] = [
  "[data-poka-yoke-fail]",
  "[data-surface-error][hidden]",
  "[data-surface-error][aria-hidden='true']",
];

export type DashboardSurfaceViolation = {
  kind: "catalog" | "orphan-dom" | "hidden-error";
  detail: string;
};

export type DashboardSurfaceReport = {
  ok: boolean;
  violations: DashboardSurfaceViolation[];
};

export function labCatalogViolations(): DashboardSurfaceViolation[] {
  const out: DashboardSurfaceViolation[] = [];
  const labIds = DASHBOARD_LABS.map((l) => l.id);
  const treeIds = LABS_TREE_MODULES.map((m) => m.id);
  const labSet = new Set(labIds);
  const treeSet = new Set(treeIds);

  for (const id of labIds) {
    if (!treeSet.has(id)) {
      out.push({ kind: "catalog", detail: `lab-not-on-tree:${id}` });
    }
    if (!(id in ENTITLEMENT_GATES)) {
      out.push({ kind: "catalog", detail: `lab-ungated:${id}` });
    }
  }
  for (const id of treeIds) {
    if (!labSet.has(id)) {
      out.push({ kind: "catalog", detail: `tree-orphan:${id}` });
    }
  }
  if (labShowsOnDashboard("labs-kpi")) {
    out.push({ kind: "catalog", detail: "kpi-on-dashboard" });
  }
  if (labChipVisible("labs-kpi", { engineOn: true, onDashboard: true })) {
    out.push({ kind: "catalog", detail: "kpi-chip-visible" });
  }
  for (const subset of MODULE_SUBSET_IDS) {
    const lab = SUBSET_LAB_BY_ID[subset];
    if (!labSet.has(lab)) {
      out.push({ kind: "catalog", detail: `subset-unmapped:${subset}` });
    }
    if (labChipVisible(lab, { engineOn: true, onDashboard: true })) {
      out.push({ kind: "catalog", detail: `subset-chip:${lab}` });
    }
  }
  return out;
}

function cssEscapeAttr(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function describeEl(el: Element): string {
  const id = el.id ? `#${el.id}` : "";
  const attr =
    el.getAttribute("data-module-subset") ??
    el.getAttribute("data-kpi-quick-bar") ??
    el.getAttribute("aria-label") ??
    "";
  return `${el.tagName.toLowerCase()}${id}${attr ? `[${attr}]` : ""}`;
}

function isComputedHidden(el: Element): boolean {
  if (typeof getComputedStyle !== "function") return false;
  const s = getComputedStyle(el);
  return s.display === "none" || s.visibility === "hidden";
}

export function scanDashboardSurface(root: ParentNode | null | undefined): DashboardSurfaceViolation[] {
  const out: DashboardSurfaceViolation[] = [];
  if (!root || typeof (root as ParentNode).querySelectorAll !== "function") return out;

  for (const sel of DASHBOARD_FORBIDDEN_SELECTORS) {
    root.querySelectorAll(sel).forEach((el) => {
      out.push({ kind: "orphan-dom", detail: `${sel} :: ${describeEl(el)}` });
    });
  }

  for (const label of DASHBOARD_ORPHAN_ARIA_LABELS) {
    const sel = `[aria-label="${cssEscapeAttr(label)}"]`;
    try {
      root.querySelectorAll(sel).forEach((el) => {
        out.push({ kind: "orphan-dom", detail: `aria-label :: ${describeEl(el)}` });
      });
    } catch {
      /* invalid selector in older engines */
    }
  }

  for (const sel of DASHBOARD_HIDDEN_ERROR_SELECTORS) {
    root.querySelectorAll(sel).forEach((el) => {
      out.push({ kind: "hidden-error", detail: `${sel} :: ${describeEl(el)}` });
    });
  }

  root.querySelectorAll("[data-surface-error]").forEach((el) => {
    if (isComputedHidden(el)) {
      out.push({ kind: "hidden-error", detail: `computed-hidden :: ${describeEl(el)}` });
    }
  });

  return out;
}

export function assertDashboardSurface(
  root: ParentNode | null | undefined,
): DashboardSurfaceReport {
  const violations = [...labCatalogViolations(), ...scanDashboardSurface(root)];
  return { ok: violations.length === 0, violations };
}

export function formatDashboardSurfaceReport(report: DashboardSurfaceReport): string {
  if (report.ok) return "ok";
  return report.violations.map((v) => `${v.kind}:${v.detail}`).join(" | ");
}
