import { publicGrossFromNet } from "@/content/pricing/vat";
import { useI18n } from "@/i18n";
import type { BillingInterval } from "@/lib/funnelOrder";

/** Add-on ár: kerekített bruttó + nettó alcím. Perpetual: egyszeri (once). */
export function AddonPriceLine(props: {
  monthlyNetHuf: number;
  interval: BillingInterval | "once";
  vatRate: number;
  className?: string;
}) {
  const { t, money } = useI18n();
  const dueNet = props.monthlyNetHuf;
  const gross = publicGrossFromNet(dueNet, props.vatRate);
  const per =
    props.interval === "once"
      ? t("pricing.once")
      : props.interval === "yearly"
        ? t("pricing.perYear")
        : t("pricing.perMonth");

  return (
    <div className={props.className}>
      <div className="font-medium tabular-nums text-foreground">
        {t("pricing.gross")} {money(gross)} {per}
      </div>
      <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
        {t("pricing.net")} {money(dueNet)} + {t("pricing.vatShort")}
      </div>
    </div>
  );
}
