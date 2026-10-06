import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { useFeatureComingSoon } from "@/components/FeatureComingSoon";

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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (typeof localStorage === "undefined") return;
      const v = localStorage.getItem("ui:kpiQuickBarCollapsed");
      if (v === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v;
      try {
        if (typeof localStorage !== "undefined") localStorage.setItem("ui:kpiQuickBarCollapsed", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const safe: KpiQuickBarTile[] = (
    tiles ?? Array.from({ length: 4 }, (_, i) => ({ id: i } satisfies KpiQuickBarTile))
  ).slice(0, 4);

  const cellCls =
    "flex h-10 max-h-[120px] items-center justify-center rounded-lg border border-slate-800/60 bg-slate-900/40 px-1 text-[11px] text-slate-500 transition-all duration-200";

  return (
    <div className="mx-auto mb-1 w-full max-w-[98%] shrink-0 px-2 sm:px-3 md:px-4">
      <div className="relative">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="absolute right-0 top-0 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-800/60 bg-slate-900/50 text-xs font-bold text-slate-200 hover:bg-slate-900/70"
          title={collapsed ? "KPI sáv megnyitása" : "KPI sáv összecsukása"}
          aria-label={collapsed ? "KPI sáv megnyitása" : "KPI sáv összecsukása"}
        >
          {collapsed ? "+" : "−"}
        </button>

        {!collapsed ? (
          <div className="grid grid-cols-1 gap-2 pr-9 min-w-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-3">
            {safe.map((tile, idx) => {
              const n = idx + 1;
              const title = kpiQuickTileLabel(n);
              const hasContent = Boolean(tile.content || tile.label || tile.value);
              const isPlaceholder = !hasContent || tile.comingSoon;
              const inner = tile.content ?? (
                tile.label || tile.value ? (
                  <div className="flex flex-col items-center leading-tight">
                    {tile.label ? (
                      <div className="text-[9px] uppercase tracking-wide text-slate-500">{tile.label}</div>
                    ) : null}
                    {tile.value ? <div className="font-mono text-xs text-slate-300">{tile.value}</div> : null}
                  </div>
                ) : (
                  <div className="flex flex-col items-center leading-tight">
                    <span className="text-[10px] font-medium text-slate-300">{title}</span>
                    <span className="text-[9px] text-slate-500">{KPI_QUICK_TILE_HINT}</span>
                  </div>
                )
              );

              if (isPlaceholder) {
                return (
                  <button
                    key={tile.id ?? idx}
                    type="button"
                    className={`${cellCls} hover:border-slate-600 hover:bg-slate-900/70 hover:text-slate-300`}
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
        ) : null}
      </div>
    </div>
  );
}
