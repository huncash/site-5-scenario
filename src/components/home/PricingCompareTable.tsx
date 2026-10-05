import { Check } from "lucide-react";
import { useMemo } from "react";

import { PRICING_ALIGN_GRID_FIXED } from "@/components/home/pricingLayout";
import { buildPricingCompareRows, loyaltyBaseRuleSentence } from "@/config/planCopy";
import { PLANS_CONFIG } from "@/config/plans";
import { isCompareAbsent, TIER_CORE, type TierId } from "@/content/pricing/tiers";
import { Badge } from "@/components/ui/badge";
import { COMPARE_ADDON_MARK } from "@/lib/desktopApp";
import { isEnterprisePlanId } from "@/lib/enterpriseSchedule";
import { useI18n, type MessageKey } from "@/i18n";
import { supportPricingHref } from "@/lib/support";
import { cn } from "@/lib/utils";

const TIER_LABEL_KEY: Record<TierId, MessageKey> = {
  starter: "pricing.starter",
  pro: "pricing.pro",
  expert: "pricing.expert",
};

function CompareValue({ value }: { value: string }) {
  const { t } = useI18n();
  if (value.startsWith(COMPARE_ADDON_MARK)) {
    return (
      <Badge variant="outline" className="text-[10px] font-medium">
        {value.slice(COMPARE_ADDON_MARK.length)}
      </Badge>
    );
  }
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
  const { t, locale } = useI18n();
  const rows = useMemo(() => buildPricingCompareRows(locale), [locale]);
  const loyaltyNote = loyaltyBaseRuleSentence(locale);

  return (
    <div className="space-y-3">
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
                PLANS_CONFIG[tier.id].badge === "recommended" && "rounded-t-xl bg-amber-500/[0.08]",
              )}
            >
              {t(TIER_LABEL_KEY[tier.id])}
              {PLANS_CONFIG[tier.id].badge === "recommended" ? (
                <span className="ml-1.5 text-[10px] font-medium text-amber-200">{t("pricing.recommended")}</span>
              ) : null}
              {isEnterprisePlanId(tier.id) ? (
                <span className="ml-1.5 inline-flex">
                  <Badge variant="outline" className="text-[10px] font-medium">
                    {t("pricing.enterpriseBadge")}
                  </Badge>
                </span>
              ) : null}
            </div>
          ))}

          {rows.map((row, rowIndex) => (
            <div key={row.id} className="contents">
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
                  key={`${row.id}:${id}`}
                  className={cn(
                    "border-t border-white/10 px-3 py-2.5 text-[12px] leading-snug lg:px-4",
                    PLANS_CONFIG[id].badge === "recommended" && "bg-amber-500/[0.06]",
                    rowIndex === rows.length - 1 &&
                      PLANS_CONFIG[id].badge === "recommended" &&
                      "rounded-b-xl",
                  )}
                >
                  <CompareValue value={row.cells[id]} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        {loyaltyNote}{" "}
        <a href={supportPricingHref("tiered-loyalty")} className="underline hover:text-emerald-300">
          {t("pricing.fnLoyaltyLink")}
        </a>
      </p>
    </div>
  );
}
