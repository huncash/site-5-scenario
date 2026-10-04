import { AddonPriceLine } from "@/components/home/AddonPriceLine";
import { PricingCompareTable } from "@/components/home/PricingCompareTable";
import { PricingFootnotes } from "@/components/home/PricingFootnotes";
import { PRICING_CARDS_GRID } from "@/components/home/pricingLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBillingInterval } from "@/components/funnel/BillingIntervalToggle";
import { FooterRopeMark } from "@/components/rope/FooterRopeMark";
import { RopeSlogan } from "@/components/rope/RopeSlogan";
import { planCardBullets } from "@/config/planCopy";
import { PLANS_CONFIG, type PlanConfig, type PublicPlanId } from "@/config/plans";
import { PUBLIC_JIT_ADDONS, jitAddonLabel } from "@/content/pricing/addons";
import { CAMPUS_MONTHLY_HUF, formatHuf, TIER_CORE, type TierId } from "@/content/pricing/tiers";
import { resolveVat, SELLER_COUNTRY } from "@/content/pricing/vat";
import { billCheckoutUrl } from "@/lib/billing";
import type { BillingInterval } from "@/lib/funnelOrder";
import { supportPricingHref, type SupportPricingAnchor } from "@/lib/support";
import { useI18n, type MessageKey } from "@/i18n";
import { cn } from "@/lib/utils";

function PricingRopeHero() {
  return (
    <div className="pricing-rope-hero">
      <FooterRopeMark />
      <RopeSlogan variant="pricing" />
    </div>
  );
}

const TIER_LABEL_KEY: Record<TierId, MessageKey> = {
  starter: "pricing.starter",
  pro: "pricing.pro",
  expert: "pricing.expert",
};

/** Support SSOT horgony: starter → basic, pro → pro, expert → enterprise. */
const SUPPORT_PRICING_ANCHOR: Record<PublicPlanId, SupportPricingAnchor> = {
  starter: "basic",
  pro: "pro",
  expert: "enterprise",
};

/** Csak az 1. évi belépőár — Egyszeri díj. */
function EntryPrice(props: { plan: PlanConfig }) {
  const { t, locale } = useI18n();
  const { plan } = props;
  if (plan.customPricing || plan.priceHuf <= 0) {
    return <div className="text-lg font-semibold text-foreground">{t("pricing.customPrice")}</div>;
  }
  const line =
    locale === "en" && plan.priceEur > 0
      ? `€${plan.priceEur.toLocaleString("en-IE")}`
      : `${plan.priceHuf.toLocaleString("hu-HU")} Ft`;
  return (
    <div>
      <div className="text-lg font-semibold tracking-tight text-foreground">{line}</div>
      <div className="mt-0.5 text-[12px] text-muted-foreground">{t("pricing.once")}</div>
    </div>
  );
}

export function HomePricing(props: { campus?: boolean }) {
  const { campus = false } = props;
  const [interval] = useBillingInterval();
  const { t, locale } = useI18n();
  const marketingVat = resolveVat({ country: SELLER_COUNTRY });
  const checkoutInterval: BillingInterval = "yearly";

  return (
    <section id="pricing" className="scroll-mt-24">
      {/* Legacy horgony — footer / kampány linkek */}
      <div id="csomagok" className="scroll-mt-24" aria-hidden />
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("pricing.packages")}
        </div>
        <h2 className="mt-1 max-w-2xl text-pretty text-lg font-semibold leading-snug text-foreground sm:text-xl">
          {t("pricing.packagesHeading")}
        </h2>
        <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground">{t("pricing.netNote")}</p>
      </div>

      <PricingRopeHero />

      {campus ? (
        <div className="mt-2">
          <CampusStrip interval={interval} />
        </div>
      ) : null}

      <div className={cn(PRICING_CARDS_GRID, "mt-3")}>
        {TIER_CORE.map((p) => {
          const plan = PLANS_CONFIG[p.id];
          const recommended = plan.badge === "recommended";
          const bullets = planCardBullets(plan, locale);
          return (
            <article
              key={p.id}
              className={cn(
                "flex h-full min-w-0 flex-col rounded-xl border p-4",
                recommended
                  ? "border-amber-300/50 bg-card shadow-[0_0_0_1px_rgba(252,211,77,0.12)]"
                  : "border-white/12 bg-card",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">{t(TIER_LABEL_KEY[p.id])}</h3>
                {recommended ? <Badge variant="default">{t("pricing.recommended")}</Badge> : null}
              </div>

              <div className="mt-3">
                <EntryPrice plan={plan} />
              </div>

              <ul className="mt-4 flex-1 space-y-2.5 text-[13px] leading-snug text-foreground">
                {bullets.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/80" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "mt-5 h-9 text-[13px]",
                  recommended ? "btn-cta" : "border-white/35 bg-transparent text-foreground",
                )}
                variant={recommended ? "default" : "outline"}
              >
                <a
                  href={billCheckoutUrl({ tier: p.id, interval: checkoutInterval })}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.assign(billCheckoutUrl({ tier: p.id, interval: checkoutInterval }));
                  }}
                >
                  {t("pricing.order")}
                </a>
              </Button>

              <a
                href={supportPricingHref(SUPPORT_PRICING_ANCHOR[p.id])}
                className="mt-2 block text-center text-[12px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                {t("pricing.moreInfo")}
              </a>
            </article>
          );
        })}
      </div>

      <details className="mt-4 rounded-xl border border-border/50 bg-card/40 px-4 py-3">
        <summary className="cursor-pointer text-[13px] font-medium text-foreground">
          {t("pricing.compareToggle")}
        </summary>
        <div className="mt-3">
          <PricingCompareTable />
        </div>
        <PricingFootnotes className="mt-4 space-y-1 border-t border-slate-800 pt-3 text-xs text-slate-400" />
      </details>

      <details className="mt-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3">
        <summary className="cursor-pointer text-[13px] font-medium text-foreground">
          {t("pricing.jitTitle")}
        </summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {PUBLIC_JIT_ADDONS.map((a) => (
            <a
              key={a.id}
              href={billCheckoutUrl({
                tier: "pro",
                interval: checkoutInterval,
                addon: a.id,
                slotPack: a.id === "slot_plus_1" ? "slot_plus_1" : undefined,
              })}
              className="rounded-lg border border-border/50 px-3 py-2 text-[12px] text-foreground hover:border-cyan-400/40"
              onClick={(e) => {
                e.preventDefault();
                window.location.assign(
                  billCheckoutUrl({
                    tier: "pro",
                    interval: checkoutInterval,
                    addon: a.id,
                    slotPack: a.id === "slot_plus_1" ? "slot_plus_1" : undefined,
                  }),
                );
              }}
            >
              <div className="font-medium">{jitAddonLabel(a, locale)}</div>
              <AddonPriceLine
                monthlyNetHuf={a.priceHuf}
                interval="once"
                vatRate={marketingVat.rate}
                className="mt-0.5"
              />
            </a>
          ))}
        </div>
      </details>
    </section>
  );
}

function CampusStrip(props: { interval: BillingInterval }) {
  const { t } = useI18n();
  void props.interval;
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-card/40 px-4 py-3">
      <div className="text-sm font-semibold text-foreground">{t("pricing.campusTitle")}</div>
      <p className="mt-1 text-[13px] text-muted-foreground">{t("pricing.campusBody")}</p>
      <div className="mt-2 text-[13px] font-medium text-foreground">
        {formatHuf(CAMPUS_MONTHLY_HUF)} {t("pricing.perMonth")}
      </div>
    </div>
  );
}
