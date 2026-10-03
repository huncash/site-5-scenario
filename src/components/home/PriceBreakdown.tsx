import { YEARLY_DISCOUNT_PCT, yearlyPriceHuf } from "@/content/pricing/tiers";
import { countryLabel, splitVat, type VatDecision } from "@/content/pricing/vat";
import { useI18n } from "@/i18n";

export function PriceBreakdown(props: {
  netMonthly: number;
  interval: "yearly" | "monthly";
  vat: VatDecision;
  compact?: boolean;
}) {
  const { netMonthly, interval, vat, compact } = props;
  const { t, money, locale } = useI18n();
  const yearlyNet = yearlyPriceHuf(netMonthly);
  const monthlyYearNet = netMonthly * 12;
  const saveNet = monthlyYearNet - yearlyNet;
  const y = splitVat(yearlyNet, vat.rate);
  const m = splitVat(netMonthly, vat.rate);
  const m12 = splitVat(monthlyYearNet, vat.rate);
  const headline = interval === "yearly" ? y : m;
  const per = interval === "yearly" ? t("pricing.perYear") : t("pricing.perMonth");
  const vatLabel = locale === "en" ? vat.labelEn : vat.labelHu;

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <div className="text-lg font-semibold text-foreground">
        {money(headline.gross)} {t("pricing.gross")} {per}
      </div>
      <div className="text-[12px] leading-snug text-muted-foreground">
        {money(headline.net)} {t("pricing.net")} {per}
        {" · "}
        +{vatLabel}
        {headline.vat > 0 ? ` = ${money(headline.vat)}` : ""}
      </div>
      <div className="space-y-0.5 text-[11px] leading-snug text-muted-foreground">
        <div>
          {t("pricing.yearlyPack")}: {money(y.net)} {t("pricing.net")} / {money(y.gross)} {t("pricing.gross")}
          {` · −${YEARLY_DISCOUNT_PCT}%`}
        </div>
        <div>
          {t("pricing.monthly12")}: {money(m12.net)} {t("pricing.net")} / {money(m12.gross)} {t("pricing.gross")}
        </div>
        {saveNet > 0 ? (
          <div className="text-cyan-300">{t("pricing.yearlySave", { n: money(saveNet) })}</div>
        ) : null}
        <div>{t("pricing.vatByCountry", { country: countryLabel(vat.country, locale) })}</div>
      </div>
    </div>
  );
}
