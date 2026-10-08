import { useEffect } from "react";

import { FunnelShell } from "@/components/funnel/FunnelShell";
import type { TierCopy, TierCore } from "@/content/pricing/tiers";
import { useSalesCart } from "@/hooks/useSalesCart";
import { useI18n } from "@/i18n";
import { billCheckoutUrl } from "@/lib/billing";
import { readBillingInterval } from "@/lib/funnelOrder";

export function FunnelCheckout(props: {
  eyebrow: string;
  funnelName: string;
  tier: TierCore | null;
  copy: TierCopy | null;
}) {
  const { eyebrow, funnelName, tier } = props;
  const { t } = useI18n();
  const { cart, checkoutHref, ready } = useSalesCart();

  useEffect(() => {
    if (!ready) return;
    const href = cart.lines.length
      ? checkoutHref
      : billCheckoutUrl({
          tier: tier?.id ?? "pro",
          interval: readBillingInterval(),
          ref: funnelName,
        });
    if (!href) return;
    window.location.replace(href);
  }, [ready, cart.lines.length, checkoutHref, funnelName, tier?.id]);

  return (
    <FunnelShell eyebrow={eyebrow} title={t("pricing.checkoutTitle")} subtitle={t("pricing.checkoutSub")}>
      <p className="mx-auto max-w-xl text-center text-sm text-muted-foreground">Átirányítás a számlázáshoz…</p>
    </FunnelShell>
  );
}
