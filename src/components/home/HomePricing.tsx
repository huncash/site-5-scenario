import { useState } from "react";

import { AddonPriceLine } from "@/components/home/AddonPriceLine";
import { PricingCompareTable } from "@/components/home/PricingCompareTable";
import { PricingFootnotes } from "@/components/home/PricingFootnotes";
import { PRICING_CARDS_GRID } from "@/components/home/pricingLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BillingIntervalToggle, useBillingInterval } from "@/components/funnel/BillingIntervalToggle";
import { FooterRopeMark } from "@/components/rope/FooterRopeMark";
import { RopeSlogan } from "@/components/rope/RopeSlogan";
import { planAudience, planHighlights, planSlogan } from "@/config/planCopy";
import { PLANS_CONFIG } from "@/config/plans";
import { JIT_ADDONS, jitAddonLabel } from "@/content/pricing/addons";
import { CAMPUS_MONTHLY_HUF, formatHuf, TIER_CORE, yearlyPriceHuf, type TierId } from "@/content/pricing/tiers";
import { resolveVat, SELLER_COUNTRY } from "@/content/pricing/vat";
import { billCheckoutUrl } from "@/lib/billing";
import type { BillingInterval } from "@/lib/funnelOrder";
import { useI18n, type MessageKey } from "@/i18n";
import { cn } from "@/lib/utils";

function PricingRopeHero() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="pricing-rope-hero"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <FooterRopeMark hovered={hovered} />
      <RopeSlogan variant="pricing" />
    </div>
  );
}

const TIER_LABEL_KEY: Record<TierId, MessageKey> = {
  starter: "pricing.starter",
  pro: "pricing.pro",
  expert: "pricing.expert",
};

/** Havi nézet: csak havi díj. Éves: kedvezményes havi átlag + éves egyösszegű. */
function TierPriceBlock(props: { monthlyHuf: number; interval: BillingInterval; size?: "md" | "lg" }) {
  const { t } = useI18n();
  const { monthlyHuf, interval } = props;
  const primaryCls = props.size === "lg" ? "text-lg font-semibold text-foreground" : "text-base font-semibold text-foreground";
  if (interval === "monthly") {
    return (
      <div className={primaryCls}>
        {formatHuf(monthlyHuf)} {t("pricing.perMonth")}
      </div>
    );
  }
  const yearlyTotal = yearlyPriceHuf(monthlyHuf);
  const monthlyAvg = Math.round(yearlyTotal / 12);
  return (
    <div>
      <div className={primaryCls}>
        {formatHuf(monthlyAvg)} {t("pricing.perMonth")}
      </div>
      <div className="mt-1 text-[10px] leading-snug text-slate-400">
        {formatHuf(yearlyTotal)} {t("pricing.yearlyBilledOnce")}
      </div>
    </div>
  );
}

export function HomePricing(props: { campus?: boolean }) {
  const { campus = false } = props;
  const [interval] = useBillingInterval();
  const { t, locale } = useI18n();
  const marketingVat = resolveVat({ country: SELLER_COUNTRY });

  return (
    <section id="csomagok" className="scroll-mt-24">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("pricing.packages")}</div>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("pricing.hero")}</p>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-foreground/85">{t("pricing.ethos")}</p>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{t("pricing.netNote")}</p>
      </div>

      <PricingRopeHero />

      <div className="flex justify-center">
        <BillingIntervalToggle />
      </div>

      {campus ? (
        <div className="mt-2">
          <CampusStrip interval={interval} />
        </div>
      ) : null}

      <div className={cn(PRICING_CARDS_GRID, "mt-2")}>
        {TIER_CORE.map((p) => {
          const href = billCheckoutUrl({ tier: p.id, interval });
          const plan = PLANS_CONFIG[p.id];
          const recommended = plan.badge === "recommended";
          return (
            <article
              key={p.id}
              className={cn(
                "flex h-full min-w-0 flex-col rounded-xl border p-3",
                recommended ? "border-amber-300/50 bg-card" : "border-white/12 bg-card",
              )}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm font-semibold text-foreground">{t(TIER_LABEL_KEY[p.id])}</h3>
                {recommended ? <Badge variant="default">{t("pricing.recommended")}</Badge> : null}
              </div>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{planSlogan(plan, locale)}</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{planAudience(plan, locale)}</p>
              <ul className="mt-2 space-y-1 text-[11px] leading-snug text-foreground">
                {planHighlights(plan, locale).map((line) => (
                  <li key={line} className="flex gap-1.5">
                    <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-foreground/70" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-3">
                <TierPriceBlock monthlyHuf={plan.monthlyPriceHuf} interval={interval} />
              </div>
              <Button
                asChild
                className={cn(
                  "mt-2 h-8 text-[13px]",
                  recommended
                    ? "btn-cta"
                    : "border-white/35 bg-transparent text-foreground",
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
                  {t("pricing.order")}
                </a>
              </Button>
            </article>
          );
        })}
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{t("pricing.cumulative")}</p>

      <div className="mt-3">
        <PricingCompareTable />
      </div>

      <PricingFootnotes />

      <div className="mt-3 space-y-2 rounded-2xl border border-border/60 bg-card px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("pricing.jitTitle")}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {JIT_ADDONS.map((a) => (
            <a
              key={a.id}
              href={billCheckoutUrl({
                tier: "pro",
                interval,
                addon: a.id,
                slotPack: a.id === "slot_plus_1" ? "slot_plus_1" : undefined,
              })}
              className="rounded-lg border border-border/50 px-3 py-2 text-[12px] text-foreground hover:border-cyan-400/40"
              onClick={(e) => {
                e.preventDefault();
                window.location.assign(
                  billCheckoutUrl({
                    tier: "pro",
                    interval,
                    addon: a.id,
                    slotPack: a.id === "slot_plus_1" ? "slot_plus_1" : undefined,
                  }),
                );
              }}
            >
              <div className="font-medium">{jitAddonLabel(a, locale)}</div>
              <AddonPriceLine
                className="mt-1"
                monthlyNetHuf={a.priceHuf}
                interval={interval}
                vatRate={marketingVat.rate}
              />
            </a>
          ))}
        </div>
      </div>

      <aside className="mt-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("pricing.iotTitle")}</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{t("pricing.iotBody")}</p>
      </aside>

      <div className="mt-3 rounded-2xl border border-white/12 bg-card px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("pricing.faq")}</div>
        {(
          [
            ["faq-case", "brand.faqCaseQ", "brand.faqCaseA"],
            ["faq-slot", "brand.faqSlotQ", "brand.faqSlotA"],
            ["faq-pro", "brand.faqProConceptQ", "brand.faqProConceptA"],
            ["faq-seat", "brand.faqSeatQ", "brand.faqSeatA"],
            ["faq-guest", "brand.faqGuestQ", "brand.faqGuestA"],
            ["faq-case-reset", "brand.faqCaseResetQ", "brand.faqCaseResetA"],
            [undefined, "brand.faqWhyQ", "brand.faqWhyA"],
            [undefined, "brand.faqProQ", "brand.faqProA"],
          ] as const
        ).map(([id, q, a]) => (
          <details key={q} id={id} className="mt-1 scroll-mt-24">
            <summary className="cursor-pointer py-2 text-left text-sm font-medium text-foreground">{t(q)}</summary>
            <p className="pb-2 text-[13px] text-muted-foreground">{t(a)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function CampusStrip({ interval }: { interval: BillingInterval }) {
  const href = billCheckoutUrl({ tier: "campus", interval, ref: "campus" });
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t("pricing.campus")}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{t("pricing.campusTitle")}</div>
      <p className="mt-1 text-[13px] text-muted-foreground">{t("pricing.campusBody")}</p>
      <div className="mt-2">
        <TierPriceBlock monthlyHuf={CAMPUS_MONTHLY_HUF} interval={interval} size="lg" />
      </div>
      <Button asChild className="mt-3 h-9" variant="outline">
        <a
          href={href}
          onClick={(e) => {
            e.preventDefault();
            window.location.assign(billCheckoutUrl({ tier: "campus", interval, ref: "campus" }));
          }}
        >
          {t("pricing.campusOrder")}
        </a>
      </Button>
    </div>
  );
}
