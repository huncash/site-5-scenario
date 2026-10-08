import { describe, expect, it } from "vitest";

import {
  assertDashboardSurface,
  DASHBOARD_FORBIDDEN_SELECTORS,
  formatDashboardSurfaceReport,
  labCatalogViolations,
  scanDashboardSurface,
} from "@/lib/dashboardSurfaceGuard";

type Mini = { tag: string; attrs: Record<string, string> };

function matches(n: Mini, sel: string): boolean {
  let rest = sel;
  const tag = /^[a-z]+/i.exec(sel);
  if (tag && !sel.startsWith("[")) {
    if (n.tag.toLowerCase() !== tag[0].toLowerCase()) return false;
    rest = sel.slice(tag[0].length);
  }
  const parts = [...rest.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
  if (parts.length === 0 && !tag) return false;
  for (const part of parts) {
    const eq = /^([^=]+)=['"](.*)['"]$/.exec(part);
    if (eq) {
      if ((n.attrs[eq[1]] ?? "") !== eq[2]) return false;
    } else if (!(part in n.attrs)) {
      return false;
    }
  }
  return true;
}

function fakeRoot(nodes: Mini[]): ParentNode {
  const els = nodes.map((n) => ({
    tagName: n.tag.toUpperCase(),
    id: n.attrs.id ?? "",
    getAttribute: (k: string) => (k in n.attrs ? n.attrs[k] : null),
    hasAttribute: (k: string) => k in n.attrs,
  }));
  return {
    querySelectorAll(sel: string) {
      return els.filter((_, i) => matches(nodes[i]!, sel)) as unknown as NodeListOf<Element>;
    },
  } as unknown as ParentNode;
}

describe("dashboardSurfaceGuard", () => {
  it("keeps the catalog aligned: every lab on the tree, KPI off the dashboard", () => {
    expect(labCatalogViolations()).toEqual([]);
    expect(DASHBOARD_FORBIDDEN_SELECTORS).toContain("[data-kpi-quick-bar]");
    expect(DASHBOARD_FORBIDDEN_SELECTORS).toContain("[data-module-subset]");
    expect(DASHBOARD_FORBIDDEN_SELECTORS).toContain("[data-subset-nav]");
  });

  it("passes a clean dashboard root", () => {
    const root = fakeRoot([
      { tag: "div", attrs: { "data-site-surface": "dashboard" } },
      { tag: "div", attrs: { "data-lab-section": "labs-baseline", id: "module-subset-baseline" } },
    ]);
    const report = assertDashboardSurface(root);
    expect(report.ok).toBe(true);
    expect(formatDashboardSurfaceReport(report)).toBe("ok");
  });

  it("flags leftover subset chrome, KPI bar and hidden alerts", () => {
    const root = fakeRoot([
      { tag: "nav", attrs: { "aria-label": "Moduláris alhalmazok" } },
      { tag: "div", attrs: { "data-kpi-quick-bar": "1" } },
      { tag: "div", attrs: { "data-module-subset": "shock" } },
      { tag: "section", attrs: { "aria-label": "Master Baseline & Alapműködés" } },
      { tag: "div", attrs: { "data-poka-yoke-fail": "" } },
    ]);
    const hits = scanDashboardSurface(root);
    expect(hits.some((v) => v.kind === "orphan-dom" && v.detail.includes("data-kpi-quick-bar"))).toBe(true);
    expect(hits.some((v) => v.kind === "orphan-dom" && v.detail.includes("data-module-subset"))).toBe(true);
    expect(hits.some((v) => v.kind === "orphan-dom" && v.detail.includes("Moduláris"))).toBe(true);
    expect(hits.some((v) => v.kind === "hidden-error")).toBe(true);
    expect(assertDashboardSurface(root).ok).toBe(false);
  });
});
