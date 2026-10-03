import { createFileRoute, Link } from "@tanstack/react-router";

import { VALSAG_REZILIENCIA_FUNNEL } from "@/content/funnels/valsagReziliencia";
import { FunnelShell } from "@/components/funnel/FunnelShell";
import { DemoSlotTeaser } from "@/components/funnel/DemoSlotTeaser";
import { TierCards } from "@/components/funnel/TierCards";
import { FaqSection } from "@/components/funnel/FaqSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRICING_HERO } from "@/content/pricing/tiers";
import { RESILIENCE_SEGMENTS } from "@/lib/resilienceCases";

export const Route = createFileRoute("/f/valsag-reziliencia/")({
  component: ValsagRezilienciaLandingPage,
});

function ValsagRezilienciaLandingPage() {
  const c = VALSAG_REZILIENCIA_FUNNEL;
  return (
    <FunnelShell eyebrow={c.hero.eyebrow} title={c.hero.title} subtitle={c.hero.subtitle}>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 bg-background/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-100">BCP, előrejelzés, helyi tartalék</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-[11px]">ResourceRunway</Badge>
              <Badge variant="secondary" className="text-[11px]">EnergyAutonomy</Badge>
              <Badge variant="secondary" className="text-[11px]">TTR</Badge>
              <Badge variant="secondary" className="text-[11px]">offline</Badge>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-[13px] text-slate-200">
              {RESILIENCE_SEGMENTS.map((s) => (
                <li key={s.id}>{s.title}</li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button asChild className="h-9">
                <Link to="/f/valsag-reziliencia/demo">{c.hero.primaryCta}</Link>
              </Button>
              <Button asChild variant="outline" className="h-9">
                <Link to="/f/valsag-reziliencia/pricing">{c.hero.secondaryCta}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <DemoSlotTeaser
          title={c.demoTeaser.title}
          body={c.demoTeaser.body}
          cta={c.demoTeaser.cta}
          to="/f/valsag-reziliencia/demo"
          pricingHref="/f/valsag-reziliencia/pricing"
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
              checkoutHref="/f/valsag-reziliencia/checkout"
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
