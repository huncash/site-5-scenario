import { yearlyPriceHuf } from "@/content/pricing/tiers";
import { splitVat } from "@/content/pricing/vat";
import { useI18n } from "@/i18n";
import type { BillingInterval } from "@/lib/funnelOrder";

/** Add-on (slot/seat) ár: bruttó {összeg} / hó|év + (nettó + ÁFA%) — a fő billing cycle-lel szinkronban. */
export function AddonPriceLine(props: {
  monthlyNetHuf: number;
  interval: BillingInterval;
  vatRate: number;
  className?: string;
}) {
  const { t, money } = useI18n();
  const dueNet =
    props.interval === "yearly" ? yearlyPriceHuf(props.monthlyNetHuf) : props.monthlyNetHuf;
  const { net, gross } = splitVat(dueNet, props.vatRate);
  const per = props.interval === "yearly" ? t("pricing.perYear") : t("pricing.perMonth");
  const vatPct = Math.round(props.vatRate);

  return (
    <div className={props.className}>
      <div className="font-medium tabular-nums text-foreground">
        {t("pricing.gross")} {money(gross)} {per}
      </div>
      <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
        ({t("pricing.net")} {money(net)} + {vatPct}% {t("pricing.vatShort")})
      </div>
    </div>
  );
}
