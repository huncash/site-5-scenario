import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { applyPublicSeo, supportSeoPageFromPath } from "@/lib/seo";
import { SupportSurface } from "@/components/SupportSurface";
import { ViewSettingsMenu } from "@/components/ViewSettingsMenu";
import { useI18n } from "@/i18n";
import { billCheckoutUrl } from "@/lib/billing";
import { enterpriseInquiryHref } from "@/lib/enterpriseSchedule";
import { supportPageUrl, supportTierHref } from "@/lib/support";
import { PUBLIC_JIT_ADDONS, jitAddonLabel } from "@/content/pricing/addons";
import { publicGrossFromNet } from "@/content/pricing/vat";
import { OnePointLesson } from "@/components/support/OnePointLesson";
import { SupportLessonToc } from "@/components/support/SupportLessonToc";
import { SupportTicketForm } from "@/components/support/SupportTicketForm";
import { oplByPath } from "@/lib/opl";
import { resolveSupportSlug } from "@/lib/supportRoutes";
import { readSupportTicketSearch } from "@/lib/support";
import { lessonBySlug } from "./content";
import {
  localizeLesson,
  supportChecklist,
  supportCopy,
  supportFaqSections,
  supportKahn,
  supportLessons,
  supportPricingTiers,
  supportTips,
} from "./copy";
import { Markdown } from "./markdown";
import { navigateTo, parseSupportPath, pathOf, supportHref } from "./router";
import "./styles.css";
import type { Locale } from "@/i18n/locale";

/** Egyszerű **félkövér** a GYIK válaszokban. */
function RichAnswer({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
function KahnBonbon({ locale }: { locale: Locale }) {
  const k = supportKahn(locale);
  return (
    <article className="bonbon">
      <div className="eyebrow">{k.eyebrow}</div>
      <h2>{k.title}</h2>
      <p>{k.p1}</p>
      <p>{k.p2}</p>
      <span className="chip">{k.foot}</span>
    </article>
  );
}

function YouTube({ id, title, empty }: { id: string; title: string; empty: string }) {
  if (!id) {
    return (
      <div className="yt empty">
        <p className="note">{empty}</p>
      </div>
    );
  }
  return (
    <div className="yt">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

function TicketForm({ search = "" }: { search?: string }) {
  const subject = readSupportTicketSearch(
    search || (typeof window === "undefined" ? "" : window.location.search),
  ).subject;
  return <SupportTicketForm key={subject || "ticket"} defaultSubject={subject} />;
}

function RoadmapCard({
  id,
  title,
  when,
  body,
  status,
  ctaHref,
  ctaLabel,
}: {
  id: string;
  title: string;
  when: string;
  body: string;
  status?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <article id={id} className="roadmap-card item scroll-mt-24">
      <h3>{title}</h3>
      <p className="roadmap-meta">{when}</p>
      <p className="roadmap-body">{body}</p>
      {status ? (
        <div className="status-box">
          <p>{status}</p>
        </div>
      ) : null}
      {ctaHref && ctaLabel ? (
        <a className="ticket-cta" href={ctaHref}>
          {ctaLabel}
        </a>
      ) : null}
    </article>
  );
}

function Items({ items }: { items: Array<{ q: string; a: string; id?: string }> }) {
  return (
    <div className="list">
      {items.map((x) => (
        <div key={x.id ?? x.q} id={x.id} className="item scroll-mt-24">
          <b>{x.q}</b>
          <RichAnswer text={x.a} />
        </div>
      ))}
    </div>
  );
}

function Checklist({ locale, items }: { locale: Locale; items: Array<{ q: string; a: string; id?: string }> }) {
  const t = supportCopy(locale);
  if (!items.length) return null;
  return (
    <div className="check" id="ellenorzes">
      <h2>{t.checkTitle}</h2>
      <p className="note">{t.checkLead}</p>
      <ol>
        {items.map((x) => (
          <li key={x.id ?? x.q} id={x.id} className="scroll-mt-24">
            <b>{x.q}</b>
            <RichAnswer text={x.a} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function FaqSearch({ locale }: { locale: Locale }) {
  const t = supportCopy(locale);
  const sections = supportFaqSections(locale);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rest = sections.filter((section) => !/ellenőrző|checklist/i.test(section.category));
    if (!needle) return rest;
    return rest
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (x) => `${section.category} ${x.q} ${x.a}`.toLowerCase().includes(needle),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, q]);
  const checkHits = useMemo(() => {
    const items = supportChecklist(locale);
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((x) => `${x.q} ${x.a}`.toLowerCase().includes(needle));
  }, [locale, q]);

  return (
    <div className="section-block">
      <Checklist locale={locale} items={checkHits} />
      <h2>{t.faqTitle}</h2>
      <div className="search-wrap">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
        />
      </div>
      {filtered.length ? (
        filtered.map((section) => (
          <div key={section.category} className="faq-category">
            <h3>{section.category}</h3>
            <Items items={section.items} />
          </div>
        ))
      ) : checkHits.length ? null : (
        <p className="note">{t.searchEmpty}</p>
      )}
    </div>
  );
}
function TicketGuard({
  locale,
  embed,
  onUnlock,
}: {
  locale: Locale;
  embed: boolean;
  onUnlock: () => void;
}) {
  const t = supportCopy(locale);
  return (
    <div className="guard" role="dialog" aria-labelledby="ticket-guard-title">
      <h2 id="ticket-guard-title">{t.guardTitle}</h2>
      <p>{t.guardLead}</p>
      <div className="guard-tiles">
        <a className="guard-tile" href={supportHref("gyik", { embed, lang: locale })}>
          {t.guardFaq}
          <span>{t.guardFaqHint}</span>
        </a>
        <a className="guard-tile" href={embed ? supportHref("lecke-01", { embed, lang: locale }) : supportHref("home", { lang: locale }) + "#leckek"}>
          {t.guardLessons}
          <span>{t.guardLessonsHint}</span>
        </a>
        <a className="guard-tile" href={supportHref("lecke-01", { embed, lang: locale })}>
          {t.guardVideos}
          <span>{t.guardVideosHint}</span>
        </a>
        <a className="guard-tile" href={supportHref("tippek", { embed, lang: locale })}>
          {t.guardCommunity}
          <span>{t.guardCommunityHint}</span>
        </a>
      </div>
      <div className="guard-actions">
        <button type="button" className="ticket-cta secondary" onClick={() => navigateTo(supportHref("gyik", { embed, lang: locale }))}>
          {t.guardFound}
        </button>
        <button type="button" className="ticket-cta" onClick={onUnlock}>
          {t.guardProceed}
        </button>
      </div>
    </div>
  );
}

function PricingPage({ locale, pathname }: { locale: Locale; pathname?: string }) {
  const t = supportCopy(locale);
  const tiers = supportPricingTiers(locale);
  const loc = { pathname };

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    window.requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <>
      <h1>{t.pricingTitle}</h1>
      <p>{t.pricingLead}</p>

      <nav className="nav" aria-label={t.pricingTocKb}>
        <a href={supportPageUrl("home", loc)}>{t.pricingTocKb}</a>
      </nav>
      <nav className="nav" aria-label={t.pricingTocPlans}>
        <span>{t.pricingTocPlans}:</span>
        <a href="#basic">Basic</a>
        <a href="#pro">Pro</a>
        <a href="#enterprise">Enterprise</a>
        <a href="#tiered-loyalty">{t.pricingTocLoyalty}</a>
        <a href="#addons">{t.pricingTocAddons}</a>
      </nav>
      <nav className="nav" aria-label={t.pricingTocActive}>
        <a href="#active-workspaces">{t.pricingTocActive}</a>
        <a href="#license-frame">{t.pricingTocFrame}</a>
        <a href="#workflow">{t.pricingTocWorkflow}</a>
        <a href="#local-import">{t.pricingTocLocal}</a>
        <a href="#desktop">{t.pricingTocDesktop}</a>
        <a href="#own-line">{t.pricingTocOwnLine}</a>
        <a href="#economic-engine">{t.pricingTocEconomic}</a>
        <a href="#bcp">{t.pricingTocBcp}</a>
        <a href="#education-engine">{t.pricingTocEducation}</a>
      </nav>

      <div className="section-block">
        {tiers.map((tier) => (
          <article key={tier.id} id={tier.id} className="item scroll-mt-24" style={{ marginBottom: 20 }}>
            <h2>{tier.title}</h2>
            <p style={{ margin: "6px 0 0" }}>{tier.priceLine}</p>
            <p className="note" style={{ margin: "4px 0 8px" }}>
              {tier.ladder}
            </p>
            <p style={{ margin: "0 0 8px" }}>{tier.detail}</p>
            <p className="contents-title">{tier.contentsTitle}</p>
            <ul className="plan-bullets">
              {tier.bullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="modules-title">{tier.modulesHeading}</p>
            <ul className="plan-modules">
              {tier.modules.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {tier.id === "enterprise" ? (
              <a className="ticket-cta" href={enterpriseInquiryHref({ locale, pathname })}>
                {t.pricingEnterpriseCta}
              </a>
            ) : (
              <a
                className={tier.id === "pro" ? "ticket-cta" : "ticket-cta secondary"}
                href={billCheckoutUrl({
                  tier: tier.id === "basic" ? "starter" : "pro",
                  interval: "yearly",
                })}
              >
                {t.pricingOrder}
              </a>
            )}
            <p style={{ margin: "12px 0 0" }}>
              <a href={supportTierHref(tier.id, loc)}>
                {tier.id === "basic" ? t.toTierBasic : tier.id === "pro" ? t.toTierPro : t.toTierEnterprise}
              </a>
            </p>
          </article>
        ))}
      </div>

      <div className="section-block scroll-mt-24" id="tiered-loyalty">
        <h2>{t.pricingLoyaltyTitle}</h2>
        <ul>
          {t.pricingLoyaltyYears.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p>{t.pricingLoyaltyBody}</p>
      </div>
      <div className="section-block scroll-mt-24" id="addons">
        <h2>{t.pricingAddonsTitle}</h2>
        <p>{t.pricingAddonsBody}</p>
        <ul className="plan-bullets">
          {PUBLIC_JIT_ADDONS.map((addon) => (
            <li key={addon.id}>
              {jitAddonLabel(addon, locale)} — {locale === "en" ? "gross " : "bruttó "}
              {publicGrossFromNet(addon.priceHuf, 27).toLocaleString(locale === "en" ? "en-IE" : "hu-HU")}
              {locale === "en" ? " HUF" : " Ft"}
              {" "}
              ({locale === "en" ? "net " : "nettó "}
              {addon.priceHuf.toLocaleString(locale === "en" ? "en-IE" : "hu-HU")}
              {locale === "en" ? " + 27% VAT" : " + 27% ÁFA"})
              {" · "}
              {addon.comingSoon ? (
                <span>{t.pricingNotifySoon}</span>
              ) : (
                <a href={billCheckoutUrl({
                    tier: "pro",
                    interval: "yearly",
                    addon: addon.id,
                    slotPack: addon.id === "slot_plus_1" ? "slot_plus_1" : undefined,
                  })}>
                  {t.pricingOrder}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="section-block scroll-mt-24" id="active-workspaces">
        <h2>{t.pricingActiveTitle}</h2>
        <p>{t.pricingActiveBody}</p>
      </div>
      <div className="section-block scroll-mt-24" id="license-frame">
        <h2>{t.pricingFrameTitle}</h2>
        <p>{t.pricingFrameBody}</p>
      </div>
      <div className="section-block scroll-mt-24" id="workflow">
        <h2>{t.pricingWorkflowTitle}</h2>
        <p>{t.pricingWorkflowBody}</p>
        <p>{t.pricingWorkflowBody2}</p>
      </div>
      <div className="section-block scroll-mt-24" id="local-import">
        <h2>{t.pricingLocalTitle}</h2>
        <p>{t.pricingLocalBody}</p>
      </div>
      <div className="section-block scroll-mt-24" id="desktop-engines">
        <h2>{t.pricingRoadmapTitle}</h2>
        <p>{t.pricingRoadmapLead}</p>
        <RoadmapCard
          id="desktop"
          title={t.pricingRoadmapDesktopTitle}
          when={t.pricingRoadmapDesktopWhen}
          body={t.pricingRoadmapDesktopBody}
          ctaHref={billCheckoutUrl({ tier: "pro", interval: "yearly" })}
          ctaLabel={t.pricingAddonBuy}
        />
        <RoadmapCard
          id="economic-engine"
          title={t.pricingEconomicTitle}
          when={t.pricingEconomicWhen}
          body={t.pricingEconomicBody}
        />
        <RoadmapCard
          id="bcp"
          title={t.pricingRoadmapBcpTitle}
          when={t.pricingRoadmapBcpWhen}
          body={t.pricingRoadmapBcpBody}
        />
        <RoadmapCard
          id="education-engine"
          title={t.pricingRoadmapEducationTitle}
          when={t.pricingRoadmapEducationWhen}
          body={t.pricingRoadmapEducationBody}
        />
      </div>
      <div className="section-block scroll-mt-24" id="own-line">
        <h2>{t.pricingOwnLineTitle}</h2>
        <p className="note">{t.pricingOwnLineWhen}</p>
        <p>{t.pricingOwnLineLead}</p>
        <p>{t.pricingOwnLineBody}</p>
        <ul className="plan-bullets">
          {t.pricingOwnLinePoints.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p>{t.pricingOwnLineClose}</p>
      </div>
    </>
  );
}

function SelfServeHome({ locale, embed }: { locale: Locale; embed: boolean }) {
  const t = supportCopy(locale);
  const videoLessons = supportLessons(locale).filter((l) => Boolean(l.youtubeId));

  return (
    <>
      <h1>{t.homeTitle}</h1>
      <p>{t.homeLead}</p>
      <p className="sla">{t.sla}</p>

      <div className="nav">
        <a href={supportHref("pricing", { embed, lang: locale })}>{t.pricingNav}</a>
        <a href={supportHref("tippek", { embed, lang: locale })}>{t.tips}</a>
        <a href={supportHref("gyik", { embed, lang: locale })}>{t.faq}</a>
      </div>

      <KahnBonbon locale={locale} />
      <FaqSearch locale={locale} />
      <TipsPage locale={locale} />
      <SupportLessonToc
        compact
        hrefFor={(path) => supportHref(path, { embed, lang: locale })}
      />

      {videoLessons.length ? (
        <div className="section-block">
          <h2>{t.videos}</h2>
          <div className="nav">
            {videoLessons.map((l) => (
              <a key={l.slug} href={supportHref(l.slug, { embed, lang: locale })}>
                {l.title}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="ticket-cta"
        onClick={() => navigateTo(supportHref("ticket", { embed, lang: locale }))}
      >
        {t.noTicketCta}
      </button>
    </>
  );
}

function TipsPage({ locale }: { locale: Locale }) {
  const t = supportCopy(locale);
  return (
    <>
      <h1>{t.tips}</h1>
      <KahnBonbon locale={locale} />
      <Items items={supportTips(locale)} />
    </>
  );
}

export function App({ pathname, search }: { pathname?: string; search?: string } = {}) {
  const { locale, toggleLocale } = useI18n();
  const t = supportCopy(locale);
  const [path, setPath] = useState(() => pathname ?? pathOf());
  const ticketSearch =
    (search && search !== "?" ? search : "") ||
    (typeof window === "undefined" ? "" : window.location.search);
  const subjectPrefill = readSupportTicketSearch(ticketSearch).subject;
  const [ticketUnlocked, setTicketUnlocked] = useState(() => Boolean(subjectPrefill));
  const ticketOpen = ticketUnlocked || Boolean(subjectPrefill);

  const { embed, slug } = useMemo(() => parseSupportPath(path), [path]);
  const route = useMemo(() => resolveSupportSlug(slug), [slug]);

  useEffect(() => {
    applyPublicSeo(supportSeoPageFromPath(slug === "home" ? "/support" : `/support/${slug}`));
  }, [slug]);

  useEffect(() => {
    if (pathname) setPath(pathname);
  }, [pathname]);

  useEffect(() => {
    if (readSupportTicketSearch(window.location.search).subject) setTicketUnlocked(true);
  }, []);

  useEffect(() => {
    const onPop = () => {
      setPath(pathOf());
      setTicketUnlocked(Boolean(readSupportTicketSearch(window.location.search).subject));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (route.kind !== "lesson" || route.slug === route.canonical) return;
    const next = supportHref(route.canonical, { embed, lang: locale, pathname: path });
    if (`${window.location.pathname}${window.location.search}` === next) return;
    window.history.replaceState({}, "", next);
  }, [embed, locale, path, route]);

  if (!embed && route.kind === "home") {
    return <SupportSurface localNav />;
  }

  const opl = oplByPath(route.canonical);
  const rawLesson = lessonBySlug(route.canonical);
  const lesson = rawLesson ? localizeLesson(locale, rawLesson) : null;
  const wrap = embed ? "embed" : "full";

  let body: ReactNode = null;
  if (slug === "home") {
    body = <SelfServeHome locale={locale} embed={embed} />;
  } else if (slug === "gyik") {
    body = <FaqSearch locale={locale} />;
  } else if (slug === "pricing") {
    body = <PricingPage locale={locale} pathname={path} />;
  } else if (slug === "ticket") {
    body = ticketOpen ? (
      <>
        <h1>{t.ticketTitle}</h1>
        <TicketForm search={ticketSearch} />
      </>
    ) : (
      <TicketGuard locale={locale} embed={embed} onUnlock={() => setTicketUnlocked(true)} />
    );
  } else if (slug === "tippek") {
    body = <TipsPage locale={locale} />;
  } else if (opl) {
    body = <OnePointLesson lesson={opl} />;
  } else if (lesson) {
    body = (
      <article className="article">
        <h1>{lesson.title}</h1>
        {lesson.markdown ? <Markdown source={lesson.body} /> : <p>{lesson.body}</p>}
        <YouTube id={lesson.youtubeId ?? ""} title={lesson.title} empty={t.noVideo} />
      </article>
    );
  } else if (slug.startsWith("kb/")) {
    body = (
      <>
        <h1>{t.help}</h1>
        <p>{t.helpBody}</p>
        <YouTube id="" title={t.help} empty={t.noVideo} />
      </>
    );
  } else {
    body = (
      <>
        <h1>{t.noLesson}</h1>
        <p>
          <a href={supportHref("tippek", { embed, lang: locale, pathname: path })}>{t.backTips}</a>
          {" · "}
          <a href={supportHref("home", { embed, lang: locale, pathname: path })}>{t.backHome}</a>
        </p>
      </>
    );
  }

  return (
    <main className={wrap}>
      <div className="top">
        <a className="brand" href={supportHref("home", { embed, lang: locale, pathname: path })}>
          {t.brand}
        </a>
        <div className="flex items-center gap-2">
          {embed ? null : <ViewSettingsMenu />}
        </div>
      </div>
      {body}
      {embed ? null : <SiteFooter inline />}
    </main>
  );
}
