import { lazy, Suspense, useEffect, useMemo, useState, type MouseEvent } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BookOpen, KeyRound, LifeBuoy, Plug } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { ViewSettingsMenu } from "@/components/ViewSettingsMenu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRICING_CARDS_GRID } from "@/components/home/pricingLayout";
import { useI18n, type MessageKey } from "@/i18n";
import { OnePointLesson } from "@/components/support/OnePointLesson";
import { SupportLessonToc } from "@/components/support/SupportLessonToc";
import { oplByPath } from "@/lib/opl";
import { isSupportHost, supportPageUrl, supportPathSlug, supportPricingHref, supportTierDomId } from "@/lib/support";
import { resolveSupportSlug, type SupportLessonIndex } from "@/lib/supportRoutes";
import { cn } from "@/lib/utils";
import { withViewPrefs } from "@/lib/viewPrefs";
import { supportFaqSections, supportTips } from "../../support/src/copy";

const SupportSpaApp = lazy(() => import("../../support/src/App").then((m) => ({ default: m.App })));

function assignSupportHref(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  window.location.assign(e.currentTarget.href);
}

function branchHref(slug: string, localNav: boolean): string {
  if (slug.startsWith("#")) return slug;
  const clean = slug.replace(/^\/+/, "");
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  if (path === "/support" || path.startsWith("/support/")) {
    return withViewPrefs(`/support/${clean}`);
  }
  if (localNav || (typeof window !== "undefined" && isSupportHost())) {
    return withViewPrefs(`/${clean}`);
  }
  return supportPageUrl(slug);
}

type Topic = {
  href: string;
  title: MessageKey;
  lead: MessageKey;
  icon: typeof BookOpen;
};

type SupportTier = {
  id: "basic" | "pro" | "enterprise";
  title: MessageKey;
  bullets: MessageKey[];
  cta: MessageKey;
  href: string;
  planHrefLabel: MessageKey;
  recommended?: boolean;
};

/** support.szcenario.hu — landing, főoldali nézetgombbal és pricing#pro kártyalogikával. */
export function SupportSurface({ localNav = false }: { localNav?: boolean } = {}) {
  const { t, locale } = useI18n();
  const [kbQuery, setKbQuery] = useState("");
  const needle = kbQuery.trim().toLowerCase();
  const faqSections = useMemo(() => {
    const sections = supportFaqSections(locale);
    if (!needle) return sections;
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((x) => `${section.category} ${x.q} ${x.a}`.toLowerCase().includes(needle)),
      }))
      .filter((section) => section.items.length > 0);
  }, [locale, needle]);
  const tipHits = useMemo(() => {
    const tips = supportTips(locale);
    if (!needle) return tips;
    return tips.filter((x) => `${x.q} ${x.a}`.toLowerCase().includes(needle));
  }, [locale, needle]);
  const gyik = branchHref("gyik", localNav);
  const ticket = branchHref("ticket", localNav);
  const topics: Topic[] = [
    { href: gyik, title: "supportDoor.navDocs", lead: "supportDoor.navDocsLead", icon: BookOpen },
    {
      href: supportPricingHref("local-import"),
      title: "supportDoor.navIntegrations",
      lead: "supportDoor.navIntegrationsLead",
      icon: Plug,
    },
    {
      href: supportPricingHref("basic"),
      title: "supportDoor.navLicense",
      lead: "supportDoor.navLicenseLead",
      icon: KeyRound,
    },
    { href: ticket, title: "supportDoor.navTicket", lead: "supportDoor.navTicketLead", icon: LifeBuoy },
  ];
  const tiers: SupportTier[] = [
    {
      id: "basic",
      title: "supportDoor.basicTitle",
      bullets: ["supportDoor.basicB1", "supportDoor.basicB2", "supportDoor.basicB3"],
      cta: "supportDoor.basicCta",
      href: gyik,
      planHrefLabel: "supportDoor.toPlanBasic",
    },
    {
      id: "pro",
      title: "supportDoor.proTitle",
      bullets: ["supportDoor.proB1", "supportDoor.proB2", "supportDoor.proB3"],
      cta: "supportDoor.proCta",
      href: ticket,
      planHrefLabel: "supportDoor.toPlanPro",
      recommended: true,
    },
    {
      id: "enterprise",
      title: "supportDoor.enterpriseTitle",
      bullets: ["supportDoor.enterpriseB1", "supportDoor.enterpriseB2", "supportDoor.enterpriseB3"],
      cta: "supportDoor.enterpriseCta",
      href: ticket,
      planHrefLabel: "supportDoor.toPlanEnterprise",
    },
  ];

  useEffect(() => {
    const id = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (!id) return;
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <div
      className="door-page h-dvh overflow-x-hidden overflow-y-auto overscroll-contain bg-background text-foreground outline-none"
      data-support-surface=""
    >
      <header className="sticky top-0 z-30 overflow-visible border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">{t("brand.name")}</div>
            <div className="truncate text-[10px] font-normal tracking-wide text-muted-foreground">
              {t("supportDoor.badge")}
            </div>
          </div>
          <ViewSettingsMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-8 pb-16">
        <div className="mx-auto w-full max-w-3xl space-y-4 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("supportDoor.badge")}
          </p>
          <h1 className="text-balance text-[2rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {t("supportDoor.title")}
          </h1>
          <p
            className="inline-flex max-w-full text-pretty rounded-md border border-[#2D6A4F]/45 bg-[#1B4332]/55 px-3 py-2 text-[13px] font-medium leading-snug text-[#F1F5F9] sm:text-[15px]"
            role="doc-subtitle"
          >
            {t("supportDoor.lead")}
          </p>
        </div>

        <label className="mx-auto block w-full max-w-3xl">
          <span className="sr-only">{t("supportDoor.kbSearch")}</span>
          <input
            type="search"
            value={kbQuery}
            onChange={(e) => setKbQuery(e.target.value)}
            placeholder={t("supportDoor.kbSearch")}
            aria-label={t("supportDoor.kbSearch")}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[15px] text-foreground outline-none placeholder:text-muted-foreground focus:border-cyan-400/50"
          />
        </label>

        <section id="faq" className="scroll-mt-24 rounded-xl border border-border/60 bg-card/40 px-4 py-4">
          <h2 className="text-sm font-semibold text-foreground">{t("supportDoor.faqTitle")}</h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{t("supportDoor.faqLead")}</p>
          {faqSections.length ? (
            faqSections.map((section) => (
              <div key={section.category} className="mt-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.category}
                </h3>
                <Accordion type="single" collapsible className="mt-1">
                  {section.items.map((item) => (
                    <AccordionItem key={item.q} value={item.q} className="border-border/50">
                      <AccordionTrigger className="text-foreground hover:no-underline">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          ) : (
            <p className="mt-3 text-[13px] text-muted-foreground">{t("supportDoor.tocEmpty")}</p>
          )}
        </section>

        <section id="tippek" className="scroll-mt-24 rounded-xl border border-border/60 bg-card/40 px-4 py-4">
          <h2 className="text-sm font-semibold text-foreground">{t("supportDoor.tipsTitle")}</h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{t("supportDoor.tipsLead")}</p>
          {tipHits.length ? (
            <Accordion type="single" collapsible className="mt-3">
              {tipHits.map((item) => (
                <AccordionItem key={item.q} value={item.q} className="border-border/50">
                  <AccordionTrigger className="text-foreground hover:no-underline">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="mt-3 text-[13px] text-muted-foreground">{t("supportDoor.tocEmpty")}</p>
          )}
        </section>

        <SupportLessonToc
          hrefFor={(path) => branchHref(path, localNav)}
          query={kbQuery}
          hideSearch
        />

        <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label={t("supportDoor.navAria")}>
          {topics.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.href}
                className="flex min-h-[9.5rem] flex-col rounded-xl border border-white/12 bg-card p-4 text-foreground transition-colors hover:border-cyan-400/40"
              >
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                <h2 className="mt-3 text-base font-semibold">{t(item.title)}</h2>
                <p className="mt-2 flex-1 text-[13px] leading-snug text-muted-foreground">{t(item.lead)}</p>
              </a>
            );
          })}
        </nav>

        <section id="support-tiers" className="scroll-mt-24 space-y-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("supportDoor.tiersEyebrow")}
            </div>
            <h2 className="mt-1 max-w-2xl text-pretty text-lg font-semibold leading-snug text-foreground sm:text-xl">
              {t("supportDoor.tiersTitle")}
            </h2>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
              {t("supportDoor.tiersLead")}
            </p>
          </div>

          <div className={cn(PRICING_CARDS_GRID, "mt-3")}>
            {tiers.map((tier) => (
              <article
                key={tier.id}
                id={supportTierDomId(tier.id)}
                className={cn(
                  "flex h-full min-w-0 scroll-mt-24 flex-col rounded-xl border p-4",
                  tier.recommended
                    ? "border-amber-300/50 bg-card shadow-[0_0_0_1px_rgba(252,211,77,0.12)]"
                    : "border-white/12 bg-card",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{t(tier.title)}</h3>
                  {tier.recommended ? <Badge variant="default">{t("pricing.recommended")}</Badge> : null}
                </div>
                <ul className="mt-4 flex-1 space-y-2.5 text-[13px] leading-snug text-foreground">
                  {tier.bullets.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/80" aria-hidden />
                      <span>{t(line)}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={cn(
                    "mt-5 h-9 text-[13px]",
                    tier.recommended ? "btn-cta" : "border-white/35 bg-transparent text-foreground",
                  )}
                  variant={tier.recommended ? "default" : "outline"}
                >
                  <a href={tier.href}>{t(tier.cta)}</a>
                </Button>
                <a
                  href={supportPricingHref(tier.id)}
                  onClick={assignSupportHref}
                  className="mt-2 block text-center text-[12px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  {t(tier.planHrefLabel)}
                </a>
              </article>
            ))}
          </div>
        </section>

        <Button asChild className="btn-cta h-10 w-full text-[13px] sm:w-auto">
          <a href={ticket}>{t("supportDoor.ticketCta")}</a>
        </Button>
      </main>

      <div data-site-footer-host />
      <SiteFooter />
    </div>
  );
}

function SupportLessonPage({ lesson }: { lesson: SupportLessonIndex }) {
  const { t, locale } = useI18n();
  const opl = oplByPath(lesson.path);
  const title = locale === "en" ? lesson.titleEn : lesson.titleHu;
  const summary = locale === "en" ? lesson.summaryEn : lesson.summaryHu;
  return (
    <div className="door-page h-dvh overflow-x-hidden overflow-y-auto overscroll-contain bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <a href={withViewPrefs("/")} className="text-sm font-semibold text-foreground">
            {t("brand.name")}
          </a>
          <ViewSettingsMenu />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 pb-16">
        {opl ? (
          <OnePointLesson lesson={opl} />
        ) : (
          <>
            <p className="font-mono text-[11px] text-muted-foreground">/{lesson.path}</p>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-[15px] leading-relaxed text-muted-foreground">{summary}</p>
          </>
        )}
        <SupportLessonToc hrefFor={(path) => branchHref(path, true)} compact />
      </main>
      <SiteFooter />
    </div>
  );
}

/** support.szcenario.hu és /support/* — landing vagy kanonikus lecke-aloldal. */
export function SupportHost() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const route = useMemo(() => resolveSupportSlug(supportPathSlug(pathname)), [pathname]);
  if (route.kind === "lesson" && route.lesson) {
    return <SupportLessonPage lesson={route.lesson} />;
  }
  if (route.kind === "static") {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center bg-background text-muted-foreground">
            <span className="text-sm tracking-wide">Szcenárió</span>
          </div>
        }
      >
        <SupportSpaApp pathname={pathname} search={search} />
      </Suspense>
    );
  }
  return <SupportSurface />;
}