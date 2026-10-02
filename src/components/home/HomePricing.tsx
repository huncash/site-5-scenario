import { useState } from "react";

import { PricingCompareTable } from "@/components/home/PricingCompareTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatHuf,
  PRICING_HERO,
  TIER_AUDIENCE,
  TIER_CORE,
  TIER_MONTHLY_HUF,
  TIER_SLOGAN,
  YEARLY_DISCOUNT_PCT,
  yearlyPriceHuf,
} from "@/content/pricing/tiers";
import { billCheckoutUrl } from "@/lib/billing";
import type { BillingInterval } from "@/lib/funnelOrder";
import { cn } from "@/lib/utils";

const CAMPUS_MONTHLY_HUF = 1_490;

export function HomePricing(props: { campus?: boolean }) {
  const { campus = false } = props;
  const [interval, setInterval] = useState<BillingInterval>("yearly");

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Csomagok</div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{PRICING_HERO}</p>
          <p className="mt-2 max-w-2xl text-[12px] text-muted-foreground">
            Éves az alapértelmezett. A havi {YEARLY_DISCOUNT_PCT}%-kal drágább, mint az éves előfizetés.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-white/15 bg-card p-1">
          <button
            type="button"
            className={cn(
              "rounded-md px-3 py-1.5 text-[12px] font-medium",
              interval === "yearly" ? "bg-cyan-500 text-slate-950" : "text-muted-foreground",
            )}
            onClick={() => setInterval("yearly")}
          >
            Évente
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md px-3 py-1.5 text-[12px] font-medium",
              interval === "monthly" ? "bg-cyan-500 text-slate-950" : "text-muted-foreground",
            )}
            onClick={() => setInterval("monthly")}
          >
            Havonta
          </button>
        </div>
      </div>

      {campus ? <CampusStrip interval={interval} /> : null}

      <div className="grid gap-3 lg:grid-cols-3">
        {TIER_CORE.map((p) => {
          const monthly = TIER_MONTHLY_HUF[p.id];
          const yearly = yearlyPriceHuf(monthly);
          const href = billCheckoutUrl({ tier: p.id, interval });
          const recommended = p.badge === "Ajánlott";
          return (
            <article
              key={p.id}
              className={cn(
                "flex flex-col rounded-2xl border p-4",
                recommended ? "border-amber-300/50 bg-card" : "border-white/12 bg-card",
              )}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm font-semibold text-foreground">{p.label}</h3>
                {p.badge ? <Badge variant={recommended ? "default" : "secondary"}>{p.badge}</Badge> : null}
              </div>
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{TIER_SLOGAN[p.id]}</p>
              <p className="mt-2 text-[12px] leading-snug text-muted-foreground">{TIER_AUDIENCE[p.id]}</p>
              <div className="mt-3">
                {interval === "yearly" ? (
                  <>
                    <div className="text-lg font-semibold text-foreground">{formatHuf(yearly)} / év</div>
                    <div className="text-[11px] text-cyan-300">
                      −{YEARLY_DISCOUNT_PCT}% · {formatHuf(monthly)} / hó helyett
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-semibold text-foreground">{formatHuf(monthly)} / hó</div>
                    <div className="text-[11px] text-muted-foreground">
                      +{YEARLY_DISCOUNT_PCT}% az éveshez képest ({formatHuf(yearly)} / év)
                    </div>
                  </>
                )}
              </div>
              <Button
                asChild
                className={cn("mt-4 h-9", recommended ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400" : "border-white/35 bg-transparent text-foreground")}
                variant={recommended ? "default" : "outline"}
              >
                <a href={href}>Megrendelem</a>
              </Button>
            </article>
          );
        })}
      </div>

      <PricingCompareTable />
    </section>
  );
}

function CampusStrip({ interval }: { interval: BillingInterval }) {
  const yearly = yearlyPriceHuf(CAMPUS_MONTHLY_HUF);
  const href = billCheckoutUrl({ tier: "campus", interval, ref: "campus" });
  return (
    <div className="rounded-2xl border border-dashed border-cyan-400/35 bg-cyan-500/[0.06] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-200">Campus</div>
      <div className="mt-1 text-sm font-semibold text-foreground">Hallgatói / szimbolikus díj</div>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Oktatási keret. Nem része a nyilvános táblázatnak. A motor ugyanaz; a díj szimbolikus.
      </p>
      <div className="mt-2 text-sm text-foreground">
        {interval === "yearly"
          ? `${formatHuf(yearly)} / év · −${YEARLY_DISCOUNT_PCT}%`
          : `${formatHuf(CAMPUS_MONTHLY_HUF)} / hó`}
      </div>
      <Button asChild className="mt-3 h-9" variant="outline">
        <a href={href}>Hallgatói megrendelés</a>
      </Button>
    </div>
  );
}
