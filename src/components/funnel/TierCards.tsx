import type { TierId, TierOffer } from "@/content/pricing/tiers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function TierBadge({ tier }: { tier: Pick<TierOffer, "badge"> }) {
  if (!tier.badge) return null;
  const variant = tier.badge === "Ajánlott" ? "default" : "secondary";
  return (
    <Badge variant={variant} className="ml-2 text-[10px]">
      {tier.badge}
    </Badge>
  );
}

export function TierCards(props: {
  offers: TierOffer[];
  selected?: TierId | null;
  ctaLabel?: string;
  /** Base href for checkout, tier will be appended as ?tier=... */
  checkoutHref: string;
}) {
  const { offers, selected, ctaLabel = "Kiválasztom", checkoutHref } = props;
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {offers.map((t) => {
        const isSelected = selected === t.id;
        const isRecommended = t.badge === "Ajánlott";
        const href = `${checkoutHref}?tier=${encodeURIComponent(t.id)}`;
        return (
          <Card
            key={t.id}
            className={cn(
              "relative overflow-hidden border-border/60 bg-background/30",
              isRecommended && "border-amber-400/40 bg-amber-500/[0.06]",
              isSelected && "ring-2 ring-amber-300/60 ring-offset-2 ring-offset-background",
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-base font-semibold text-slate-100">
                {t.label}
                <TierBadge tier={t} />
              </CardTitle>
              <div className="mt-0.5 text-[11px] text-slate-300">{t.tagline}</div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-[12px] text-slate-300">{t.description}</p>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Tartalmaz</div>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[12px] text-slate-200">
                  {t.includes.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Korlátok (copy)</div>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[12px] text-slate-300">
                  {t.limits.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-1">
                <Button asChild className="w-full" variant={isRecommended ? "default" : "secondary"}>
                  <a href={href}>{ctaLabel}</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

