import { YEARLY_DISCOUNT_PCT, yearlyPriceHuf } from "@/content/pricing/tiers";
import { splitVat, type VatDecision } from "@/content/pricing/vat";
import { useI18n } from "@/i18n";
import { formatRenewalDate, nextRenewalDate } from "@/lib/billingRenewal";
import type { BillingInterval } from "@/lib/funnelOrder";
import { cn } from "@/lib/utils";

export function PriceBreakdown(props: {
  netMonthly: number;
  interval: BillingInterval;
  vat: VatDecision;
  /** Pl. „Üzleti / Pro” — ha megadod, a fejléc: {label} · Éves/Havi előfizetés */
  planLabel?: string;
  compact?: boolean;
  /** Ha megadod, megjelenik az Éves/Havi segmented control a kártya tetején. */
  onIntervalChange?: (interval: BillingInterval) => void;
}) {
  const { netMonthly, interval, vat, planLabel, compact, onIntervalChange } = props;
  const { t, money, locale } = useI18n();
  const yearlyNet = yearlyPriceHuf(netMonthly);
  const saveNet = netMonthly * 12 - yearlyNet;
  const dueNet = interval === "yearly" ? yearlyNet : netMonthly;
  const headline = splitVat(dueNet, vat.rate);
  const per = interval === "yearly" ? t("pricing.perYear") : t("pricing.perMonth");
  const intervalLabel = interval === "yearly" ? t("pricing.yearlySub") : t("pricing.monthlySub");
  const vatPct = Math.round(vat.rate);
  const renewal = formatRenewalDate(nextRenewalDate(interval), locale);

  return (
    <div className={compact ? "space-y-2" : "space-y-2.5"}>
      {onIntervalChange ? (
        <div
          className="grid grid-cols-2 gap-1 rounded-lg border border-border/60 bg-background/40 p-1"
          role="group"
          aria-label={t("pricing.intervalLegend")}
        >
          <button
            type="button"
            className={cn(
              "rounded-md px-2 py-2 text-center text-[12px] font-semibold leading-snug transition-colors",
              interval === "yearly"
                ? "btn-cta shadow-none"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={interval === "yearly"}
            onClick={() => onIntervalChange("yearly")}
          >
            {t("pricing.cycleYearly", { n: YEARLY_DISCOUNT_PCT })}
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md px-2 py-2 text-center text-[12px] font-semibold leading-snug transition-colors",
              interval === "monthly"
                ? "btn-cta shadow-none"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={interval === "monthly"}
            onClick={() => onIntervalChange("monthly")}
          >
            {t("pricing.cycleMonthly")}
          </button>
        </div>
      ) : null}

      {planLabel ? (
        <div className="text-sm font-semibold text-foreground">
          {planLabel}
          <span className="text-muted-foreground"> · {intervalLabel}</span>
        </div>
      ) : null}
      <div>
        <div className={`font-semibold tabular-nums text-foreground ${compact ? "text-lg" : "text-2xl"}`}>
          {t("pricing.gross")} {money(headline.gross)} {per}
        </div>
        <div className="mt-1 text-[12px] leading-snug text-muted-foreground">
          ({t("pricing.net")} {money(headline.net)} + {vatPct}% {t("pricing.vatShort")})
        </div>
      </div>
      {interval === "yearly" && saveNet > 0 ? (
        <div className="inline-flex items-center rounded-full border border-emerald-700/40 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-100/90">
          {t("pricing.savePctYearly", { n: YEARLY_DISCOUNT_PCT })}
        </div>
      ) : null}
      <div className="text-sm text-slate-400">
        {t("pricing.nextRenewal", { date: renewal })}
      </div>
    </div>
  );
}
