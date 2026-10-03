import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { LangSwitch, useSiteLocale, type Locale } from "@/i18n/miniLocale";
import { lessonBySlug } from "./content";
import {
  localizeLesson,
  supportCopy,
  supportFaq,
  supportKahn,
  supportLessons,
  supportTheory,
  supportTips,
} from "./copy";
import { Markdown } from "./markdown";

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

function pathOf() {
  return window.location.pathname.replace(/\/+$/, "") || "/";
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

function Items({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <div className="list">
      {items.map((x) => (
        <div key={x.q} className="item">
          <b>{x.q}</b>
          <span>{x.a}</span>
        </div>
      ))}
    </div>
  );
}

export function App() {
  const { locale, toggleLocale } = useSiteLocale();
  const t = supportCopy(locale);
  const [path, setPath] = useState(pathOf);

  useEffect(() => {
    document.title = locale === "en" ? "Szcenárió — support" : "Szcenárió — támogatás";
  }, [locale]);

  useEffect(() => {
    const onPop = () => setPath(pathOf());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const embed = path.startsWith("/embed");
  const slug = useMemo(() => {
    if (path === "/embed" || path === "/embed/") return "tippek";
    if (path.startsWith("/embed/")) return path.slice("/embed/".length);
    if (path === "/") return "";
    return path.replace(/^\//, "");
  }, [path]);

  const rawLesson = lessonBySlug(slug.startsWith("kb/") ? slug.slice(3) : slug);
  const lesson = rawLesson ? localizeLesson(locale, rawLesson) : null;
  const wrap = embed ? "embed" : "full";

  let body: ReactNode = null;
  if (slug === "" || slug === "home") {
    body = (
      <>
        <h1>{t.homeTitle}</h1>
        <p>{t.homeLead}</p>
        <p className="sla">{t.sla}</p>
        <div className="nav">
          <a href={`/embed/tippek?lang=${locale}`}>{t.tips}</a>
          <a href={`/embed/gyik?lang=${locale}`}>{t.faq}</a>
          <a href={`/embed/ticket?lang=${locale}`}>{t.ticket}</a>
          {supportLessons(locale).map((l) => (
            <a key={l.slug} href={`/embed/${l.slug}?lang=${locale}`}>
              {l.title}
            </a>
          ))}
        </div>
        <KahnBonbon locale={locale} />
        <h2>{t.lessons}</h2>
        <p className="note">{t.lessonsNote}</p>
        <div className="nav">
          {supportTheory(locale).map((l) => (
            <a key={l.slug} href={`/${l.slug}?lang=${locale}`}>
              {l.title}
            </a>
          ))}
        </div>
        <h2>{t.ticketHome}</h2>
        <TicketForm locale={locale} />
      </>
    );
  } else if (slug === "tippek") {
    body = (
      <>
        <h1>{t.tips}</h1>
        <Items items={supportTips(locale)} />
      </>
    );
  } else if (slug === "gyik") {
    body = (
      <>
        <h1>{t.faqTitle}</h1>
        <KahnBonbon locale={locale} />
        <Items items={supportFaq(locale)} />
      </>
    );
  } else if (slug === "ticket") {
    body = (
      <>
        <h1>{t.ticketTitle}</h1>
        <TicketForm locale={locale} />
      </>
    );
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
          <a href={`/embed/tippek?lang=${locale}`}>{t.backTips}</a>
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
