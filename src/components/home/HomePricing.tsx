import { PricingCompareTable } from "@/components/home/PricingCompareTable";
import { PRICING_ALIGN_GRID } from "@/components/home/pricingLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BillingIntervalToggle, useBillingInterval } from "@/components/funnel/BillingIntervalToggle";
import { formatHuf, TIER_CORE, TIER_MONTHLY_HUF, yearlyPriceHuf, type TierId } from "@/content/pricing/tiers";
import { billCheckoutUrl } from "@/lib/billing";
import type { BillingInterval } from "@/lib/funnelOrder";
import { useI18n, type MessageKey } from "@/i18n";
import { SLOT_PACKS } from "@/lib/scenarioSlots";
import { cn } from "@/lib/utils";

const TIER_SLOGAN_KEY: Record<TierId, MessageKey> = {
  starter: "pricing.sloganStarter",
  pro: "pricing.sloganPro",
  expert: "pricing.sloganExpert",
};
const TIER_AUDIENCE_KEY: Record<TierId, MessageKey> = {
  starter: "pricing.audienceStarter",
  pro: "pricing.audiencePro",
  expert: "pricing.audienceExpert",
};
const TIER_LABEL_KEY: Record<TierId, MessageKey> = {
  starter: "pricing.starter",
  pro: "pricing.pro",
  expert: "pricing.expert",
};
const TIER_HIGHLIGHTS: Record<TierId, MessageKey[]> = {
  starter: ["pricing.hs1", "pricing.hs2", "pricing.hs3", "pricing.hs4", "pricing.hs5"],
  pro: ["pricing.hp1", "pricing.hp2", "pricing.hp3", "pricing.hp4", "pricing.hp5"],
  expert: ["pricing.he1", "pricing.he2", "pricing.he3", "pricing.he4", "pricing.he5"],
};

const CAMPUS_MONTHLY_HUF = 1_490;

function netAmount(monthly: number, interval: BillingInterval): number {
  return interval === "yearly" ? yearlyPriceHuf(monthly) : monthly;
}

export function HomePricing(props: { campus?: boolean }) {
  const { campus = false } = props;
  const [interval] = useBillingInterval();
  const { t } = useI18n();
  const per = interval === "yearly" ? t("pricing.perYear") : t("pricing.perMonth");
  const otherPer = interval === "yearly" ? t("pricing.perMonth") : t("pricing.perYear");

  return (
    <section id="csomagok" className="space-y-4 scroll-mt-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("pricing.packages")}</div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("pricing.hero")}</p>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-foreground/85">{t("pricing.ethos")}</p>
        </div>
        <BillingIntervalToggle />
      </div>

      <p className="max-w-2xl text-[13px] italic leading-relaxed text-muted-foreground">
        „{t("pricing.netNote")}”
      </p>
      <p className="max-w-2xl rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
        {t("pricing.seatDef")}
      </p>

      {campus ? <CampusStrip interval={interval} /> : null}

      <div className={PRICING_ALIGN_GRID}>
        <div className="hidden lg:block" aria-hidden />
        {TIER_CORE.map((p) => {
          const href = billCheckoutUrl({ tier: p.id, interval });
          const recommended = p.id === "pro";
          return (
            <article
              key={p.id}
              className={cn(
                "flex h-full min-w-0 flex-col rounded-2xl border p-4",
                recommended ? "border-amber-300/50 bg-card" : "border-white/12 bg-card",
              )}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm font-semibold text-foreground">{t(TIER_LABEL_KEY[p.id])}</h3>
                {p.badge ? <Badge variant={recommended ? "default" : "secondary"}>{t("pricing.recommended")}</Badge> : null}
              </div>
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{t(TIER_SLOGAN_KEY[p.id])}</p>
              <p className="mt-2 text-[12px] leading-snug text-muted-foreground">{t(TIER_AUDIENCE_KEY[p.id])}</p>
              <ul className="mt-3 space-y-1.5 text-[12px] leading-snug text-foreground">
                {TIER_HIGHLIGHTS[p.id].map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-foreground/70" aria-hidden />
                    <span>{t(line)}</span>
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
                  {t("pricing.order")}
                </a>
              </Button>
            </article>
          );
        })}
      </div>

      <p className="text-[12px] leading-relaxed text-muted-foreground">{t("pricing.cumulative")}</p>

      <PricingCompareTable />

      <p className="max-w-3xl text-[12px] leading-relaxed text-muted-foreground">{t("pricing.seatDef")}</p>

      <div className="space-y-2 rounded-2xl border border-border/60 bg-card px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Szcenárió-slot bővítés (+1 / +3 / +5)
        </div>
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Valamennyi nyilvános csomagban (Alap, Pro, Enterprise) elérhető. A Campus / oktatási keretből a
          mátrix ki van zárva — ott a keret fix. Ajánló kóddal +1 permanent slot jár mindkét félnek, sikeres
          fizetés után.
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {SLOT_PACKS.map((p) => (
            <a
              key={p.id}
              href={billCheckoutUrl({ tier: "pro", interval: "yearly", slotPack: p.id })}
              className="rounded-lg border border-border/50 px-3 py-2 text-[12px] text-foreground hover:border-cyan-400/40"
              onClick={(e) => {
                e.preventDefault();
                window.location.assign(billCheckoutUrl({ tier: "pro", interval: "yearly", slotPack: p.id }));
              }}
            >
              <div className="font-medium">{p.labelHu}</div>
              <div className="mt-0.5 text-muted-foreground">{formatHuf(p.priceHuf)} nettó</div>
            </a>
          ))}
        </div>
      </div>

      <aside className="rounded-2xl border border-border/60 bg-card px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("pricing.iotTitle")}</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{t("pricing.iotBody")}</p>
      </aside>

      <div className="rounded-2xl border border-white/12 bg-card px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("pricing.faq")}</div>
        {(
          [
            ["brand.faqWhyQ", "brand.faqWhyA"],
            ["brand.faqProQ", "brand.faqProA"],
            ["brand.faqVatQ", "brand.faqVatA"],
          ] as const
        ).map(([q, a]) => (
          <details key={q} className="mt-1">
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
  const per = interval === "yearly" ? t("pricing.perYear") : t("pricing.perMonth");
  const otherPer = interval === "yearly" ? t("pricing.perMonth") : t("pricing.perYear");
  return (
    <div className="rounded-2xl border border-dashed border-cyan-400/35 bg-cyan-500/[0.06] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-200">{t("pricing.campus")}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{t("pricing.campusTitle")}</div>
      <p className="mt-1 text-[13px] text-muted-foreground">{t("pricing.campusBody")}</p>
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
          {t("pricing.campusOrder")}
        </a>
      </Button>
    </div>
  );
}
