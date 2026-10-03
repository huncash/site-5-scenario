import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import { CAMPAIGN_FUNNELS } from "@/content/funnels/campaigns";
import { FaqSection } from "@/components/funnel/FaqSection";
import { FunnelShell } from "@/components/funnel/FunnelShell";
import { DemoSlotTeaser } from "@/components/funnel/DemoSlotTeaser";
import { TierCards } from "@/components/funnel/TierCards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRICING_HERO } from "@/content/pricing/tiers";
import { publicSegmentById } from "@/lib/demoCatalog";
import { CAMPAIGN_PATHS, CAMPAIGN_SEGMENT_IDS, type CampaignId } from "@/lib/campaignFunnels";
import { captureCampaignFromLocation, enterCampaignChooser } from "@/lib/campaignSession";
import { caseTitle, useI18n } from "@/i18n";

export function CampaignLanding(props: { campaignId: CampaignId }) {
  const { campaignId } = props;
  const { locale } = useI18n();
  const c = CAMPAIGN_FUNNELS[campaignId];
  const navigate = useNavigate();
  const cases = CAMPAIGN_SEGMENT_IDS[campaignId]
    .map((id) => publicSegmentById(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  if (typeof window !== "undefined") {
    captureCampaignFromLocation({ campaignId, doorStep: false });
  }

  useEffect(() => {
    captureCampaignFromLocation({ campaignId, doorStep: false });
  }, [campaignId]);

  const openChooser = () => {
    enterCampaignChooser(campaignId);
    void navigate({ to: "/" });
  };

  return (
    <FunnelShell eyebrow={c.hero.eyebrow} title={c.hero.title} subtitle={c.hero.subtitle}>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 bg-background/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-100">{c.caseHeading}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-[11px]">PDCA</Badge>
              <Badge variant="secondary" className="text-[11px]">offline</Badge>
              <Badge variant="secondary" className="text-[11px]">{CAMPAIGN_PATHS[campaignId]}</Badge>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-[13px] text-slate-200">
              {cases.map((s) => (
                <li key={s.id}>{caseTitle(s.id, locale) ?? s.title}</li>
              ))}
            </ul>
            <ul className="space-y-1 text-[12px] text-slate-300">
              {c.proofBullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button type="button" className="h-9" onClick={openChooser}>
                {c.hero.primaryCta}
              </Button>
              <Button asChild variant="outline" className="h-9">
                <a href="#csomagok">{c.hero.secondaryCta}</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <DemoSlotTeaser
          title={c.demoTeaser.title}
          body={c.demoTeaser.body}
          cta={c.demoTeaser.cta}
          pricingHref="#csomagok"
          onCta={openChooser}
        />
      </div>

      <div className="mt-6 space-y-6">
        <div id="csomagok">
          <div className="text-sm font-semibold text-slate-100">Csomagok</div>
          <p className="mt-1 max-w-3xl text-[13px] text-slate-300">{PRICING_HERO}</p>
          <div className="mt-3">
            <TierCards
              offers={c.tierOffers}
              selected={c.tiers.defaultSelected}
              checkoutHref={CAMPAIGN_PATHS[campaignId]}
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

export function campaignRouteHead(campaignId: CampaignId) {
  const c = CAMPAIGN_FUNNELS[campaignId];
  return {
    meta: [
      { title: c.seoTitle },
      { name: "description", content: c.seoDescription },
      { property: "og:title", content: c.seoTitle },
      { property: "og:description", content: c.seoDescription },
    ],
  };
}
