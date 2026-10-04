import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { LangSwitch, useSiteLocale, type Locale } from "@/i18n/miniLocale";
import { lessonBySlug } from "./content";
import {
  localizeLesson,
  supportCopy,
  supportFaqSections,
  supportKahn,
  supportLessons,
  supportPricingTiers,
  supportTheory,
  supportTips,
} from "./copy";
import { Markdown } from "./markdown";
import { navigateTo, parseSupportPath, pathOf, supportHref } from "./router";

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

function TicketForm({ locale }: { locale: Locale }) {
  const t = supportCopy(locale);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const href = `mailto:support@szcenario.hu?subject=${encodeURIComponent(subject.trim() || t.mailSubject)}&body=${encodeURIComponent(
      `${t.mailName}: ${name.trim()}\nE-mail: ${email.trim()}\n\n${body.trim()}`,
    )}`;
    window.location.href = href;
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="sla">{t.sla}</p>
      <label>
        {t.name}
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
      </label>
      <label>
        {t.email}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </label>
      <label>
        {t.subject}
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </label>
      <label>
        {t.message}
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} required />
      </label>
      <button type="submit">{t.send}</button>
    </form>
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

function FaqSearch({ locale }: { locale: Locale }) {
  const t = supportCopy(locale);
  const sections = supportFaqSections(locale);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return sections;
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (x) => `${section.category} ${x.q} ${x.a}`.toLowerCase().includes(needle),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, q]);

  return (
    <div className="section-block">
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
      ) : (
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

function PricingPage({ locale }: { locale: Locale }) {
  const t = supportCopy(locale);
  const tiers = supportPricingTiers(locale);

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      <h1>{t.pricingTitle}</h1>
      <p>{t.pricingLead}</p>

      <div className="section-block">
        {tiers.map((tier) => (
          <article key={tier.id} id={tier.id} className="item scroll-mt-24" style={{ marginBottom: 16 }}>
            <b>{tier.title}</b>
            <p style={{ margin: "6px 0 0" }}>{tier.priceLine}</p>
            <p className="note" style={{ margin: "4px 0 8px" }}>
              {tier.ladder}
            </p>
            <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
              {tier.bullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="section-block">
        <h2>{t.pricingLoyaltyTitle}</h2>
        <p>{t.pricingLoyaltyBody}</p>
      </div>
      <div className="section-block">
        <h2>{t.pricingActiveTitle}</h2>
        <p>{t.pricingActiveBody}</p>
      </div>
      <div className="section-block">
        <h2>{t.pricingDeviceTitle}</h2>
        <p>{t.pricingDeviceBody}</p>
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
        {supportLessons(locale).map((l) => (
          <a key={l.slug} href={supportHref(l.slug, { embed, lang: locale })}>
            {l.title}
          </a>
        ))}
      </div>

      <KahnBonbon locale={locale} />
      <FaqSearch locale={locale} />

      <div className="section-block" id="leckek">
        <h2>{t.lessons}</h2>
        <p className="note">{t.lessonsNote}</p>
        <div className="nav">
          {supportTheory(locale).map((l) => (
            <a key={l.slug} href={supportHref(l.slug, { lang: locale })}>
              {l.title}
            </a>
          ))}
        </div>
      </div>

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

export function App() {
  const { locale, toggleLocale } = useSiteLocale();
  const t = supportCopy(locale);
  const [path, setPath] = useState(pathOf);
  const [ticketUnlocked, setTicketUnlocked] = useState(false);

  useEffect(() => {
    document.title = locale === "en" ? "Szcenárió — support" : "Szcenárió — támogatás";
  }, [locale]);

  useEffect(() => {
    const onPop = () => {
      setPath(pathOf());
      setTicketUnlocked(false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const { embed, slug } = useMemo(() => parseSupportPath(path), [path]);

  const rawLesson = lessonBySlug(slug.startsWith("kb/") ? slug.slice(3) : slug);
  const lesson = rawLesson ? localizeLesson(locale, rawLesson) : null;
  const wrap = embed ? "embed" : "full";

  let body: ReactNode = null;
  if (slug === "home") {
    body = <SelfServeHome locale={locale} embed={embed} />;
  } else if (slug === "tippek") {
    body = (
      <>
        <h1>{t.tips}</h1>
        <Items items={supportTips(locale)} />
        {!embed ? (
          <p className="note" style={{ marginTop: 16 }}>
            <a href={supportHref("home", { lang: locale })}>{t.backHome}</a>
          </p>
        ) : null}
      </>
    );
  } else if (slug === "gyik") {
    body = (
      <>
        <h1>{t.faqTitle}</h1>
        <KahnBonbon locale={locale} />
        <FaqSearch locale={locale} />
        <button
          type="button"
          className="ticket-cta"
          onClick={() => navigateTo(supportHref("ticket", { embed, lang: locale }))}
        >
          {t.noTicketCta}
        </button>
      </>
    );
  } else if (slug === "ticket") {
    body = (
      <>
        <h1>{t.ticketTitle}</h1>
        {ticketUnlocked ? (
          <TicketForm locale={locale} />
        ) : (
          <TicketGuard locale={locale} embed={embed} onUnlock={() => setTicketUnlocked(true)} />
        )}
      </>
    );
  } else if (slug === "pricing") {
    body = <PricingPage locale={locale} />;
  } else if (lesson) {
    body = (
      <>
        {lesson.markdown ? null : <h1>{lesson.title}</h1>}
        {lesson.youtubeId ? <YouTube id={lesson.youtubeId} title={lesson.title} empty={t.noVideo} /> : null}
        {lesson.markdown ? <Markdown source={lesson.body} /> : <p>{lesson.body}</p>}
      </>
    );
  } else if (slug === "kb/kahn-rand") {
    const k = supportKahn(locale);
    body = (
      <>
        <h1>{k.title}</h1>
        <KahnBonbon locale={locale} />
      </>
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
          <a href={supportHref("tippek", { embed, lang: locale })}>{t.backTips}</a>
          {" · "}
          <a href={supportHref("home", { embed, lang: locale })}>{t.backHome}</a>
        </p>
      </>
    );
  }

  return (
    <main className={wrap}>
      <div className="top">
        <div className="brand">{t.brand}</div>
        <LangSwitch locale={locale} onToggle={toggleLocale} />
      </div>
      {body}
      {embed ? null : <SiteFooter inline />}
    </main>
  );
}
