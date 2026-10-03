import { createFileRoute, Link } from "@tanstack/react-router";

import { OKTATAS_SZIMULACIO_FUNNEL } from "@/content/funnels/oktatasSzimulacio";
import { FunnelShell } from "@/components/funnel/FunnelShell";
import { DemoSlotTeaser } from "@/components/funnel/DemoSlotTeaser";
import { TierCards } from "@/components/funnel/TierCards";
import { FaqSection } from "@/components/funnel/FaqSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRICING_HERO } from "@/content/pricing/tiers";
import { EDUCATION_SEGMENTS } from "@/lib/educationCases";
import { caseTitle, useI18n } from "@/i18n";

export const Route = createFileRoute("/f/oktatas-szimulacio/")({
  component: OktatasSzimulacioLandingPage,
});

function OktatasSzimulacioLandingPage() {
  const { locale } = useI18n();
  const c = OKTATAS_SZIMULACIO_FUNNEL;
  return (
    <FunnelShell eyebrow={c.hero.eyebrow} title={c.hero.title} subtitle={c.hero.subtitle}>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 bg-background/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-100">Négy tréning, kevert mutatók</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-[11px]">PDCA</Badge>
              <Badge variant="secondary" className="text-[11px]">Lean / Poka-Yoke</Badge>
              <Badge variant="secondary" className="text-[11px]">PRO sáv</Badge>
              <Badge variant="secondary" className="text-[11px]">offline</Badge>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-[13px] text-slate-200">
              {EDUCATION_SEGMENTS.filter((s) => s.id === "demo16_edu_startup_cashflow" || s.id === "demo17_edu_ops_process").map((s) => (
                <li key={s.id}>{caseTitle(s.id, locale) ?? s.title}</li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button asChild className="h-9">
                <Link to="/f/oktatas-szimulacio/demo">{c.hero.primaryCta}</Link>
              </Button>
              <Button asChild variant="outline" className="h-9">
                <Link to="/f/oktatas-szimulacio/pricing">{c.hero.secondaryCta}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <DemoSlotTeaser
          title={c.demoTeaser.title}
          body={c.demoTeaser.body}
          cta={c.demoTeaser.cta}
          to="/f/oktatas-szimulacio/demo"
          pricingHref="/f/oktatas-szimulacio/pricing"
        />
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <div className="text-sm font-semibold text-slate-100">Csomagok</div>
          <p className="mt-1 max-w-3xl text-[13px] text-slate-300">{PRICING_HERO}</p>
          <div className="mt-3">
            <TierCards
              offers={c.tierOffers}
              selected={c.tiers.defaultSelected}
              checkoutHref="/f/oktatas-szimulacio/checkout"
              ctaLabel="Kiválasztom"
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400">{c.tiers.note}</div>
        </div>
        <FaqSection items={c.faq} />
      </div>
    </FunnelShell>
  );
}
