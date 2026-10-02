import { formatHuf, YEARLY_DISCOUNT_PCT, yearlyPriceHuf } from "@/content/pricing/tiers";
import { countryLabel, splitVat, type VatDecision } from "@/content/pricing/vat";

export function PriceBreakdown(props: {
  netMonthly: number;
  interval: "yearly" | "monthly";
  vat: VatDecision;
  compact?: boolean;
}) {
  const { netMonthly, interval, vat, compact } = props;
  const yearlyNet = yearlyPriceHuf(netMonthly);
  const monthlyYearNet = netMonthly * 12;
  const saveNet = monthlyYearNet - yearlyNet;
  const y = splitVat(yearlyNet, vat.rate);
  const m = splitVat(netMonthly, vat.rate);
  const m12 = splitVat(monthlyYearNet, vat.rate);
  const headline = interval === "yearly" ? y : m;
  const per = interval === "yearly" ? "/ év" : "/ hó";

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <div className="text-lg font-semibold text-foreground">
        {formatHuf(headline.gross)} bruttó {per}
      </div>
      <div className="text-[12px] leading-snug text-muted-foreground">
        {formatHuf(headline.net)} nettó {per}
        {" · "}
        +{vat.labelHu}
        {headline.vat > 0 ? ` = ${formatHuf(headline.vat)}` : ""}
      </div>
      <div className="space-y-0.5 text-[11px] leading-snug text-muted-foreground">
        <div>
          Éves csomag: {formatHuf(y.net)} nettó / {formatHuf(y.gross)} bruttó
          {` · −${YEARLY_DISCOUNT_PCT}%`}
        </div>
        <div>
          12× havi: {formatHuf(m12.net)} nettó / {formatHuf(m12.gross)} bruttó
        </div>
        {saveNet > 0 ? (
          <div className="text-cyan-300">
            Éves fizetéssel {formatHuf(saveNet)} nettóval kevesebb, mint 12 havi díj.
          </div>
        ) : null}
        <div>
          ÁFA a megrendelő országa szerint: {countryLabel(vat.country)}.
        </div>
      </div>
    </div>
  );
}
