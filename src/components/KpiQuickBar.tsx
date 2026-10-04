import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { useFeatureComingSoon } from "@/components/FeatureComingSoon";

export type KpiQuickBarSlot = {
  id: number;
  content?: ReactNode;
  label?: string;
  value?: string;
  comingSoon?: boolean;
  comingSoonTitle?: string;
  comingSoonPurpose?: string;
};

export function KpiQuickBar({ slots }: { slots?: KpiQuickBarSlot[] }) {
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

  const safe: KpiQuickBarSlot[] = (
    // Default: 4 slots (compact by default)
    slots ?? Array.from({ length: 4 }, (_, i) => ({ id: i } satisfies KpiQuickBarSlot))
  ).slice(0, 4);

  const cellCls =
    "flex h-10 max-h-[120px] items-center justify-center rounded-lg border border-slate-800/60 bg-slate-900/40 px-1 text-[11px] text-slate-500 transition-all duration-200";

  return (
    <div className="mx-auto mb-1 w-full max-w-[98%] shrink-0 px-2 sm:px-3 md:px-4">
      <div className="relative">
        {/* Always-visible collapse toggle (top-right of the bar) */}
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
            {safe.map((s, idx) => {
              const hasContent = Boolean(s.content || s.label || s.value);
              const isPlaceholder = !hasContent || s.comingSoon;
              const inner = s.content ?? (
                s.label || s.value ? (
                  <div className="flex flex-col items-center leading-tight">
                    {s.label ? (
                      <div className="text-[9px] uppercase tracking-wide text-slate-500">{s.label}</div>
                    ) : null}
                    {s.value ? <div className="font-mono text-xs text-slate-300">{s.value}</div> : null}
                  </div>
                ) : (
                  <span className="opacity-70">slot {idx + 1}</span>
                )
              );

              if (isPlaceholder) {
                return (
                  <button
                    key={s.id ?? idx}
                    type="button"
                    className={`${cellCls} hover:border-slate-600 hover:bg-slate-900/70 hover:text-slate-300`}
                    onClick={() =>
                      openComingSoon({
                        title: s.comingSoonTitle ?? `KPI gyorssáv · slot ${idx + 1}`,
                        purpose:
                          s.comingSoonPurpose ??
                          "Testreszabható KPI csempe a felső gyorssávban. Az adatforrás és a widget konfigurátor előkészítés alatt áll.",
                        featureId: `kpi.slot_${idx + 1}`,
                      })
                    }
                  >
                    {inner}
                  </button>
                );
              }

              return (
                <div key={s.id ?? idx} className={cellCls}>
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
