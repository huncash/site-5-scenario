import type { TierId, TierOffer } from "@/content/pricing/tiers";
import { formatHuf, TIER_COMPARE_ROWS, TIER_MONTHLY_HUF, YEARLY_DISCOUNT_PCT, yearlyPriceHuf } from "@/content/pricing/tiers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { billCheckoutUrl } from "@/lib/billing";
import { cn } from "@/lib/utils";

export function TierCards(props: {
  offers: TierOffer[];
  selected?: TierId | null;
  ctaLabel?: string;
  checkoutHref: string;
}) {
  const { offers, selected, ctaLabel = "Kiválasztom" } = props;

  return (
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
              const href = billCheckoutUrl({ tier: t.id, interval: "yearly" });
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
                  <div className="mt-2 text-[13px] font-semibold text-slate-100">
                    {formatHuf(yearlyPriceHuf(TIER_MONTHLY_HUF[t.id]))} / év
                  </div>
                  <div className="text-[11px] font-normal text-cyan-300">
                    −{YEARLY_DISCOUNT_PCT}% · {formatHuf(TIER_MONTHLY_HUF[t.id])} / hó
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className={cn(
                      "mt-3 h-8 w-full",
                      isRecommended
                        ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                        : "border-white/35 bg-transparent text-foreground",
                    )}
                    variant={isRecommended ? "default" : "outline"}
                  >
                    <a href={href}>{ctaLabel}</a>
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
  );
}
