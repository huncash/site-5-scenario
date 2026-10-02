import { createFileRoute, Link } from "@tanstack/react-router";

import { FunnelShell } from "@/components/funnel/FunnelShell";
import { ProChartCallout, ProChartSketch } from "@/components/home/ProChartExplain";
import {
  ABOUT_LEAD,
  ABOUT_TAGLINE,
  DAILY_OPS_BODY,
  DAILY_OPS_TITLE,
  PRO_ARTICLE_BODY,
  PRO_ARTICLE_TITLE,
  WHY_BODY,
  WHY_LEAD,
  WHY_TITLE,
} from "@/content/branding";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <FunnelShell eyebrow="Rólunk" title={WHY_TITLE} subtitle={ABOUT_TAGLINE}>
      <div className="mx-auto max-w-3xl space-y-8 text-[14px] leading-relaxed text-muted-foreground">
        <p className="text-foreground">{ABOUT_LEAD}</p>
        <p>{WHY_LEAD}</p>
        <p>{WHY_BODY}</p>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">{DAILY_OPS_TITLE}</h2>
          <p>{DAILY_OPS_BODY}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">{PRO_ARTICLE_TITLE}</h2>
          <ProChartSketch />
          <ProChartCallout />
          <div className="whitespace-pre-wrap">{PRO_ARTICLE_BODY}</div>
        </section>

        <p>
          <Link to="/" className="text-[var(--accent)] underline-offset-4 hover:underline">
            Vissza a főoldalra
          </Link>
        </p>
      </div>
    </FunnelShell>
  );
}
