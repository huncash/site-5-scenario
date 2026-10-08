import type { ReactNode } from "react";

import { useFeatureComingSoon } from "@/components/FeatureComingSoon";
import { RevealToggle } from "@/components/lean-viz/CollapsibleCard";
import { useDashboardBlockOpen } from "@/hooks/useDashboardBlockOpen";

/** A felső négy szám. Nem Slot — a Slot a Magán / Vállalkozás / Projekt fül. */
export const KPI_QUICK_TILE_HINT = "egyedi beállítás";

export function kpiQuickTileLabel(n: number): string {
  return `KPI mutató #${n}`;
}

export type KpiQuickBarTile = {
  id: number;
  content?: ReactNode;
  label?: string;
  value?: string;
  comingSoon?: boolean;
  comingSoonTitle?: string;
  comingSoonPurpose?: string;
};

export function KpiQuickBar({ tiles }: { tiles?: KpiQuickBarTile[] }) {
  const { openComingSoon } = useFeatureComingSoon();
  const { isOpen, toggle } = useDashboardBlockOpen("kpi-quick-bar", false);

  const safe: KpiQuickBarTile[] = (
    tiles ?? Array.from({ length: 4 }, (_, i) => ({ id: i } satisfies KpiQuickBarTile))
  ).slice(0, 4);

  const cellCls =
    "flex h-10 max-h-[120px] items-center justify-center rounded-lg border border-border bg-[var(--dropdown-hover)] px-1 text-[11px] text-[var(--text-muted)] transition-all duration-200";

  return (
    <div
      data-kpi-quick-bar=""
      className="kpi-quick-bar mx-auto mb-1 w-full max-w-[98%] shrink-0 px-2 sm:px-3 md:px-4"
    >
      <div className="flex items-start gap-2">
        <RevealToggle open={isOpen} onClick={toggle} />
        <div className="min-w-0 flex-1">
          {isOpen ? (
            <div className="grid grid-cols-1 gap-2 min-w-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-3">
              {safe.map((tile, idx) => {
                const n = idx + 1;
                const title = kpiQuickTileLabel(n);
                const hasContent = Boolean(tile.content || tile.label || tile.value);
                const isPlaceholder = !hasContent || tile.comingSoon;
                const inner = tile.content ?? (
                  tile.label || tile.value ? (
                    <div className="flex flex-col items-center leading-tight">
                      {tile.label ? (
                        <div className="text-[9px] uppercase tracking-wide text-[var(--text-muted)]">{tile.label}</div>
                      ) : null}
                      {tile.value ? <div className="font-mono text-xs text-[var(--text-main)]">{tile.value}</div> : null}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-[10px] font-medium text-[var(--text-main)]">{title}</span>
                      <span className="text-[9px] text-[var(--text-muted)]">{KPI_QUICK_TILE_HINT}</span>
                    </div>
                  )
                );

                if (isPlaceholder) {
                  return (
                    <button
                      key={tile.id ?? idx}
                      type="button"
                      className={`${cellCls} hover:border-[var(--accent-color)] hover:text-[var(--text-main)]`}
                      onClick={() =>
                        openComingSoon({
                          title: tile.comingSoonTitle ?? `${title} — ${KPI_QUICK_TILE_HINT}`,
                          purpose:
                            tile.comingSoonPurpose ??
                            `${title} — ${KPI_QUICK_TILE_HINT}. A mutató forrása a gépeden lesz. Nem Slot: a Slot a Magán / Vállalkozás / Projekt fül.`,
                          featureId: `kpi.tile_${n}`,
                        })
                      }
                    >
                      {inner}
                    </button>
                  );
                }

                return (
                  <div key={tile.id ?? idx} className={cellCls}>
                    {inner}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm font-medium leading-snug text-[var(--text-main)]">KPI sáv</div>
          )}
        </div>
      </div>
    </div>
  );
}
