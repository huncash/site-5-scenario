import { Check } from "lucide-react";

import { PRICING_ALIGN_GRID_FIXED } from "@/components/home/pricingLayout";
import { isCompareAbsent, TIER_COMPARE_ROWS, TIER_CORE } from "@/content/pricing/tiers";
import { cn } from "@/lib/utils";

function CompareValue({ value }: { value: string }) {
  if (isCompareAbsent(value)) {
    return (
      <span className="text-muted-foreground" title="Nem része ennek a csomagnak">
        –
      </span>
    );
  }
  if (value.startsWith("✓")) {
    const rest = value.slice(1).trim();
    return (
      <span className="inline-flex items-start gap-1.5 text-foreground">
        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
        {rest ? <span>{rest}</span> : <span className="sr-only">Tartalmazza</span>}
      </span>
    );
  }
  return <span className="text-foreground">{value}</span>;
}

export function PricingCompareTable() {
  return (
    <div className="overflow-x-auto">
      <div className={cn(PRICING_ALIGN_GRID_FIXED, "min-w-[720px] lg:min-w-0")}>
        <div className="px-1 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground lg:px-0">
          Funkció / Szolgáltatás
        </div>
        {TIER_CORE.map((t) => (
          <div
            key={t.id}
            className={cn(
              "px-3 py-2 text-[13px] font-semibold text-foreground lg:px-4",
              t.badge === "Ajánlott" && "rounded-t-xl bg-amber-500/[0.08]",
            )}
          >
            {t.label}
            {t.badge ? (
              <span className="ml-1.5 text-[10px] font-medium text-amber-200">{t.badge}</span>
            ) : null}
          </div>
        ))}

        {TIER_COMPARE_ROWS.map((row, rowIndex) => (
          <div key={row.feature} className="contents">
            <div
              className={cn(
                "border-t border-white/10 px-1 py-2.5 text-[12px] font-medium text-foreground lg:px-0",
                rowIndex === 0 && "font-semibold",
              )}
            >
              {row.feature}
            </div>
            {(["starter", "pro", "expert"] as const).map((id) => (
              <div
                key={`${row.feature}:${id}`}
                className={cn(
                  "border-t border-white/10 px-3 py-2.5 text-[12px] leading-snug lg:px-4",
                  id === "pro" && "bg-amber-500/[0.06]",
                  rowIndex === TIER_COMPARE_ROWS.length - 1 && id === "pro" && "rounded-b-xl",
                )}
              >
                <CompareValue value={row[id]} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
