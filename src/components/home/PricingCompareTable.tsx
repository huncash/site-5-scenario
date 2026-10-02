import { TIER_COMPARE_ROWS, TIER_CORE } from "@/content/pricing/tiers";
import { cn } from "@/lib/utils";

export function PricingCompareTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/12 bg-card">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr>
            <th className="w-[28%] border-b border-white/10 px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Funkció / Szolgáltatás
            </th>
            {TIER_CORE.map((t) => (
              <th
                key={t.id}
                className={cn(
                  "border-b border-white/10 px-3 py-3 text-[13px] font-semibold text-foreground",
                  t.badge === "Ajánlott" && "bg-amber-500/[0.08]",
                )}
              >
                {t.label}
                {t.badge ? (
                  <span className="ml-1.5 text-[10px] font-medium text-amber-200">{t.badge}</span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIER_COMPARE_ROWS.map((row) => (
            <tr key={row.feature}>
              <th className="border-b border-white/8 px-3 py-2 text-[12px] font-medium text-foreground">
                {row.feature}
              </th>
              {(["starter", "pro", "expert"] as const).map((id) => (
                <td
                  key={`${row.feature}:${id}`}
                  className={cn(
                    "border-b border-white/8 px-3 py-2 text-[12px] leading-snug text-muted-foreground",
                    id === "pro" && "bg-amber-500/[0.06] text-foreground",
                  )}
                >
                  {row[id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
