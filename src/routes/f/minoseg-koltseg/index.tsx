import { createFileRoute, Link } from "@tanstack/react-router";

import { MINOSEG_KOLTSEG_FUNNEL } from "@/content/funnels/minosegKoltseg";
import { FunnelShell } from "@/components/funnel/FunnelShell";
import { DemoSlotTeaser } from "@/components/funnel/DemoSlotTeaser";
import { TierCards } from "@/components/funnel/TierCards";
import { FaqSection } from "@/components/funnel/FaqSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/f/minoseg-koltseg/")({
  component: MinosegKoltsegLandingPage,
});

function MinosegKoltsegLandingPage() {
  const c = MINOSEG_KOLTSEG_FUNNEL;
  return (
    <FunnelShell eyebrow={c.hero.eyebrow} title={c.hero.title} subtitle={c.hero.subtitle}>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 bg-background/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-100">Üzemvezetői fókusz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-[11px]">fedezeti pont</Badge>
              <Badge variant="secondary" className="text-[11px]">veszteséghőtérkép</Badge>
              <Badge variant="secondary" className="text-[11px]">lokális számítás</Badge>
              <Badge variant="secondary" className="text-[11px]">nincs telemetria</Badge>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-[13px] text-slate-200">
              {c.proofBullets.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button asChild className="h-9">
                <Link to="/f/minoseg-koltseg/demo">{c.hero.primaryCta}</Link>
              </Button>
              <Button asChild variant="outline" className="h-9">
                <Link to="/f/minoseg-koltseg/pricing">{c.hero.secondaryCta}</Link>
              </Button>
            </div>
            <div className="text-[11px] text-slate-400">A demó előre betöltött helyzetből indul (wrapper-only).</div>
          </CardContent>
        </Card>

        <DemoSlotTeaser
          title={c.demoTeaser.title}
          body={c.demoTeaser.body}
          cta={c.demoTeaser.cta}
          to="/f/minoseg-koltseg/demo"
        />
      </div>

      <div className="mt-6 grid gap-4">
        <div className="rounded-xl border border-border/60 bg-background/30 p-4">
          <div className="text-sm font-semibold text-slate-100">Csomagok (áttekintés)</div>
          <div className="mt-1 text-[12px] text-slate-300">
            A tier identitások fixek, a csomag leírása funnel‑specifikus — így mindenhol egyszerre finomítható.
          </div>
          <div className="mt-3">
            <TierCards offers={c.tierOffers} selected={c.tiers.defaultSelected} checkoutHref="/f/minoseg-koltseg/checkout" ctaLabel="Ingyenes kipróbálás" />
          </div>
        </div>

        <FaqSection items={c.faq} />

        <div className="flex justify-center pt-2">
          <Button asChild size="lg" className="h-11 px-6">
            <Link to="/f/minoseg-koltseg/demo">Segédeszköz ingyenes kipróbálása</Link>
          </Button>
        </div>
      </div>
    </FunnelShell>
  );
}

