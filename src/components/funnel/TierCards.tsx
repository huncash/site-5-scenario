import type { TierId, TierOffer } from "@/content/pricing/tiers";
import {
  formatHuf,
  PRICING_IOT_NOTE,
  PRICING_NET_NOTE,
  TIER_COMPARE_ROWS,
  TIER_MONTHLY_HUF,
  yearlyPriceHuf,
} from "@/content/pricing/tiers";
import { PricingFootnotes } from "@/components/home/PricingFootnotes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BillingIntervalToggle, useBillingInterval } from "@/components/funnel/BillingIntervalToggle";
import { billCheckoutUrl } from "@/lib/billing";
import type { BillingInterval } from "@/lib/funnelOrder";
import { cn } from "@/lib/utils";

function PriceLines(props: { monthly: number; interval: BillingInterval }) {
  const { monthly } = props;
  void props.interval;
  void yearlyPriceHuf;
  if (!monthly) {
    return (
      <div className="mt-2">
        <div className="text-[15px] font-semibold text-slate-100">Egyedi árazás</div>
      </div>
    );
  }
  return (
    <div className="mt-2">
      <div className="text-[15px] font-semibold text-slate-100">{formatHuf(monthly)} (Éves hűség-licenc)</div>
      <div className="mt-0.5 text-[11px] text-slate-300">2. év: −25% · 3. év: −40% · 4. évtől: örökélet</div>
    </div>
  );
}

export function TierCards(props: {
  offers: TierOffer[];
  selected?: TierId | null;
  ctaLabel?: string;
  checkoutHref: string;
}) {
  const { offers, selected, ctaLabel = "Kiválasztom" } = props;
  void props.checkoutHref;
  const [interval] = useBillingInterval();

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-relaxed text-slate-300">{PRICING_NET_NOTE}</p>
        <BillingIntervalToggle />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr>
              <th className="w-[28%] border-b border-border/50 px-3 py-2 align-bottom text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Összehasonlítás
              </th>
              {offers.map((t) => {
                const isSelected = selected === t.id;
                const isRecommended = t.badge === "Ajánlott";
                const href = billCheckoutUrl({ tier: t.id, interval });
                return (
                  <th
                    key={t.id}
                    className={cn(
                      "w-[24%] border-b border-border/50 px-3 py-3 align-bottom",
                      isRecommended && "bg-amber-500/[0.06]",
                      isSelected && "ring-1 ring-inset ring-amber-300/50",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 text-[15px] font-semibold text-slate-100">
                      {t.label}
                      {t.badge ? (
                        <Badge variant={isRecommended ? "default" : "secondary"} className="text-[10px]">
                          {t.badge}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-1 text-[11px] font-normal leading-snug text-slate-300">{t.tagline}</div>
                    <PriceLines monthly={TIER_MONTHLY_HUF[t.id]} interval={interval} />
                    <Button
                      asChild
                      size="sm"
                      className={cn(
                        "mt-3 h-8 w-full",
                        isRecommended
                          ? "btn-cta"
                          : "border-white/35 bg-transparent text-foreground",
                      )}
                      variant={isRecommended ? "default" : "outline"}
                    >
                      <a
                        href={href}
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.assign(billCheckoutUrl({ tier: t.id, interval }));
                        }}
                      >
                        {ctaLabel}
                      </a>
                    </Button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="border-b border-border/30 px-3 py-2 text-[12px] font-medium text-slate-300">Mit ad</th>
              {offers.map((t) => (
                <td
                  key={`${t.id}-desc`}
                  className={cn(
                    "border-b border-border/30 px-3 py-2 text-[12px] leading-snug text-slate-200",
                    t.badge === "Ajánlott" && "bg-amber-500/[0.04]",
                  )}
                >
                  {t.description}
                </td>
              ))}
            </tr>
            {TIER_COMPARE_ROWS.map((row) => (
              <tr key={row.feature}>
                <th className="border-b border-border/30 px-3 py-1.5 text-[12px] font-medium text-slate-300">
                  {row.feature}
                </th>
                {offers.map((t) => (
                  <td
                    key={`${t.id}-inc-${row.feature}`}
                    className={cn(
                      "border-b border-border/30 px-3 py-1.5 text-[12px] leading-snug text-slate-200",
                      t.badge === "Ajánlott" && "bg-amber-500/[0.04]",
                    )}
                  >
                    {row[t.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PricingFootnotes />
      <aside className="rounded-xl border border-border/50 bg-card/60 px-3 py-2.5">
        <p className="text-[13px] leading-relaxed text-slate-300">{PRICING_IOT_NOTE}</p>
      </aside>
    </div>
  );
}
