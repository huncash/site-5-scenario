import { Check } from "lucide-react";

import { PRICING_ALIGN_GRID_FIXED } from "@/components/home/pricingLayout";
import { isCompareAbsent, TIER_CORE, type TierId } from "@/content/pricing/tiers";
import { useI18n, type MessageKey } from "@/i18n";
import { cn } from "@/lib/utils";

const TIER_LABEL_KEY: Record<TierId, MessageKey> = {
  starter: "pricing.starter",
  pro: "pricing.pro",
  expert: "pricing.expert",
};

const COMPARE_ROWS: Array<{ feature: MessageKey; starter: MessageKey; pro: MessageKey; expert: MessageKey }> = [
  { feature: "pricing.cf1", starter: "pricing.cs1", pro: "pricing.cp1", expert: "pricing.ce1" },
  { feature: "pricing.cf2", starter: "pricing.cs2", pro: "pricing.cp2", expert: "pricing.ce2" },
  { feature: "pricing.cf3", starter: "pricing.cs3", pro: "pricing.cp3", expert: "pricing.ce3" },
  { feature: "pricing.cf4", starter: "pricing.cs4", pro: "pricing.cp4", expert: "pricing.ce4" },
  { feature: "pricing.cf5", starter: "pricing.cs5", pro: "pricing.cp5", expert: "pricing.ce5" },
  { feature: "pricing.cf6", starter: "pricing.cs6", pro: "pricing.cp6", expert: "pricing.ce6" },
  { feature: "pricing.cf7", starter: "pricing.cs7", pro: "pricing.cp7", expert: "pricing.ce7" },
  { feature: "pricing.cf8", starter: "pricing.cs8", pro: "pricing.cp8", expert: "pricing.ce8" },
];

function CompareValue({ value }: { value: string }) {
  const { t } = useI18n();
  if (isCompareAbsent(value)) {
    return (
      <span className="text-muted-foreground" title={t("pricing.notInTier")}>
        –
      </span>
    );
  }
  if (value.startsWith("✓")) {
    const rest = value.slice(1).trim();
    return (
      <span className="inline-flex items-start gap-1.5 text-foreground">
        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
        {rest ? <span>{rest}</span> : <span className="sr-only">{t("pricing.includes")}</span>}
      </span>
    );
  }
  return <span className="text-foreground">{value}</span>;
}

export function PricingCompareTable() {
  const { t } = useI18n();
  return (
    <div className="overflow-x-auto">
      <div className={cn(PRICING_ALIGN_GRID_FIXED, "min-w-[720px] lg:min-w-0")}>
        <div className="px-1 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground lg:px-0">
          {t("pricing.featureCol")}
        </div>
        {TIER_CORE.map((tier) => (
          <div
            key={tier.id}
            className={cn(
              "px-3 py-2 text-[13px] font-semibold text-foreground lg:px-4",
              tier.id === "pro" && "rounded-t-xl bg-amber-500/[0.08]",
            )}
          >
            {t(TIER_LABEL_KEY[tier.id])}
            {tier.badge ? (
              <span className="ml-1.5 text-[10px] font-medium text-amber-200">{t("pricing.recommended")}</span>
            ) : null}
          </div>
        ))}

        {COMPARE_ROWS.map((row, rowIndex) => (
          <div key={row.feature} className="contents">
            <div
              className={cn(
                "border-t border-white/10 px-1 py-2.5 text-[12px] font-medium text-foreground lg:px-0",
                rowIndex === 0 && "font-semibold",
              )}
              title={row.feature === "pricing.cf8" ? t("pricing.seatDef") : undefined}
            >
              {t(row.feature)}
              {row.feature === "pricing.cf8" ? (
                <span className="mt-1 block text-[10px] font-normal leading-snug text-muted-foreground">
                  {t("pricing.seatDef")}
                </span>
              ) : null}
            </div>
            {(["starter", "pro", "expert"] as const).map((id) => (
              <div
                key={`${row.feature}:${id}`}
                className={cn(
                  "border-t border-white/10 px-3 py-2.5 text-[12px] leading-snug lg:px-4",
                  id === "pro" && "bg-amber-500/[0.06]",
                  rowIndex === COMPARE_ROWS.length - 1 && id === "pro" && "rounded-b-xl",
                )}
              >
                <CompareValue value={t(row[id])} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
