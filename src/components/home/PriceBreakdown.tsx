import { YEARLY_DISCOUNT_PCT, yearlyPriceHuf } from "@/content/pricing/tiers";
import { splitVat, type VatDecision } from "@/content/pricing/vat";
import { useI18n } from "@/i18n";

export function PriceBreakdown(props: {
  netMonthly: number;
  interval: "yearly" | "monthly";
  vat: VatDecision;
  /** Pl. „Üzleti / Pro” — ha megadod, a fejléc: {label} · Éves/Havi előfizetés */
  planLabel?: string;
  compact?: boolean;
}) {
  const { netMonthly, interval, vat, planLabel, compact } = props;
  const { t, money } = useI18n();
  const yearlyNet = yearlyPriceHuf(netMonthly);
  const saveNet = netMonthly * 12 - yearlyNet;
  const dueNet = interval === "yearly" ? yearlyNet : netMonthly;
  const headline = splitVat(dueNet, vat.rate);
  const per = interval === "yearly" ? t("pricing.perYear") : t("pricing.perMonth");
  const intervalLabel = interval === "yearly" ? t("pricing.yearlySub") : t("pricing.monthlySub");
  const vatPct = Math.round(vat.rate);

  return (
    <div className={compact ? "space-y-2" : "space-y-2.5"}>
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
        <div className="inline-flex items-center rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
          {t("pricing.savePctYearly", { n: YEARLY_DISCOUNT_PCT })}
        </div>
      ) : null}
    </div>
  );
}
