import { PricingCompareTable } from "@/components/home/PricingCompareTable";
import { PRICING_ALIGN_GRID } from "@/components/home/pricingLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BillingIntervalToggle, useBillingInterval } from "@/components/funnel/BillingIntervalToggle";
import { PRO_CHART_FAQ, WHY_FAQ } from "@/content/branding";
import {
  formatHuf,
  PRICING_CUMULATIVE_NOTE,
  PRICING_HERO,
  PRICING_NET_NOTE,
  PRICING_VAT_FAQ,
  TIER_AUDIENCE,
  TIER_CARD_HIGHLIGHTS,
  TIER_CORE,
  TIER_MONTHLY_HUF,
  TIER_SLOGAN,
  yearlyPriceHuf,
} from "@/content/pricing/tiers";
import { billCheckoutUrl } from "@/lib/billing";
import type { BillingInterval } from "@/lib/funnelOrder";
import { cn } from "@/lib/utils";

const CAMPUS_MONTHLY_HUF = 1_490;

function netAmount(monthly: number, interval: BillingInterval): number {
  return interval === "yearly" ? yearlyPriceHuf(monthly) : monthly;
}

export function HomePricing(props: { campus?: boolean }) {
  const { campus = false } = props;
  const [interval] = useBillingInterval();
  const per = interval === "yearly" ? "/ év" : "/ hó";
  const otherPer = interval === "yearly" ? "/ hó" : "/ év";

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Csomagok</div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{PRICING_HERO}</p>
        </div>
        <BillingIntervalToggle />
      </div>

      <p className="max-w-2xl text-[13px] italic leading-relaxed text-muted-foreground">
        „{PRICING_NET_NOTE}”
      </p>

      {campus ? <CampusStrip interval={interval} /> : null}

      <div className={PRICING_ALIGN_GRID}>
        <div className="hidden lg:block" aria-hidden />
        {TIER_CORE.map((p) => {
          const href = billCheckoutUrl({ tier: p.id, interval });
          const recommended = p.badge === "Ajánlott";
          return (
            <article
              key={p.id}
              className={cn(
                "flex h-full min-w-0 flex-col rounded-2xl border p-4",
                recommended ? "border-amber-300/50 bg-card" : "border-white/12 bg-card",
              )}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm font-semibold text-foreground">{p.label}</h3>
                {p.badge ? <Badge variant={recommended ? "default" : "secondary"}>{p.badge}</Badge> : null}
              </div>
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{TIER_SLOGAN[p.id]}</p>
              <p className="mt-2 text-[12px] leading-snug text-muted-foreground">{TIER_AUDIENCE[p.id]}</p>
              <ul className="mt-3 space-y-1.5 text-[12px] leading-snug text-foreground">
                {TIER_CARD_HIGHLIGHTS[p.id].map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-foreground/70" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4">
                <div className="text-lg font-semibold text-foreground">
                  {formatHuf(netAmount(TIER_MONTHLY_HUF[p.id], interval))} {per}
                </div>
                <div className="mt-1 inline-flex rounded-md border border-border/50 bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  {formatHuf(netAmount(TIER_MONTHLY_HUF[p.id], interval === "yearly" ? "monthly" : "yearly"))} {otherPer}
                </div>
              </div>
              <Button
                asChild
                className={cn(
                  "mt-3 h-9",
                  recommended ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400" : "border-white/35 bg-transparent text-foreground",
                )}
                variant={recommended ? "default" : "outline"}
              >
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.assign(billCheckoutUrl({ tier: p.id, interval }));
                  }}
                >
                  Megrendelem
                </a>
              </Button>
            </article>
          );
        })}
      </div>

      <p className="text-[12px] leading-relaxed text-muted-foreground">{PRICING_CUMULATIVE_NOTE}</p>

      <PricingCompareTable />

      <div className="rounded-2xl border border-white/12 bg-card px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">GYIK</div>
        {[WHY_FAQ, PRO_CHART_FAQ, PRICING_VAT_FAQ].map((item) => (
          <details key={item.q} className="mt-1">
            <summary className="cursor-pointer py-2 text-left text-sm font-medium text-foreground">{item.q}</summary>
            <p className="pb-2 text-[13px] text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function CampusStrip({ interval }: { interval: BillingInterval }) {
  const href = billCheckoutUrl({ tier: "campus", interval, ref: "campus" });
  const per = interval === "yearly" ? "/ év" : "/ hó";
  const otherPer = interval === "yearly" ? "/ hó" : "/ év";
  return (
    <div className="rounded-2xl border border-dashed border-cyan-400/35 bg-cyan-500/[0.06] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-200">Campus</div>
      <div className="mt-1 text-sm font-semibold text-foreground">Hallgatói / szimbolikus díj</div>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Oktatási keret. Nem része a nyilvános táblázatnak. A motor ugyanaz; a díj szimbolikus.
      </p>
      <div className="mt-2">
        <div className="text-lg font-semibold text-foreground">
          {formatHuf(netAmount(CAMPUS_MONTHLY_HUF, interval))} {per}
        </div>
        <div className="mt-1 inline-flex rounded-md border border-border/50 bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground">
          {formatHuf(netAmount(CAMPUS_MONTHLY_HUF, interval === "yearly" ? "monthly" : "yearly"))} {otherPer}
        </div>
      </div>
      <Button asChild className="mt-3 h-9" variant="outline">
        <a
          href={href}
          onClick={(e) => {
            e.preventDefault();
            window.location.assign(billCheckoutUrl({ tier: "campus", interval, ref: "campus" }));
          }}
        >
          Hallgatói megrendelés
        </a>
      </Button>
    </div>
  );
}
