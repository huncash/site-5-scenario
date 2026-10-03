import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { FAQ, KAHN_BONBON, LESSONS, SUPPORT_MAIL, SUPPORT_SLA, THEORY_LESSONS, TIPS, lessonBySlug } from "./content";
import { Markdown } from "./markdown";

function KahnBonbon() {
  return (
    <article className="bonbon">
      <div className="eyebrow">{KAHN_BONBON.eyebrow}</div>
      <h2>{KAHN_BONBON.title}</h2>
      <p>{KAHN_BONBON.p1}</p>
      <p>{KAHN_BONBON.p2}</p>
      <span className="chip">{KAHN_BONBON.foot}</span>
    </article>
  );
}

function pathOf() {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

function YouTube({ id, title }: { id: string; title: string }) {
  if (!id) {
    return (
      <div className="yt empty">
        <p className="note">A lecke videója YouTube-on jelenik meg. A saját szerver nem tárol és nem szolgál ki videófájlt.</p>
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

function TicketForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const href = `mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent(subject.trim() || "Szcenárió jegy")}&body=${encodeURIComponent(
      `Név: ${name.trim()}\nE-mail: ${email.trim()}\n\n${body.trim()}`,
    )}`;
    window.location.href = href;
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="sla">{SUPPORT_SLA}</p>
      <label>
        Név
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
      </label>
      <label>
        E-mail
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </label>
      <label>
        Tárgy
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </label>
      <label>
        Üzenet
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} required />
      </label>
      <button type="submit">Jegy küldése e-mailben</button>
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
  const [path, setPath] = useState(pathOf);

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

  const lesson = lessonBySlug(slug.startsWith("kb/") ? slug.slice(3) : slug);
  const wrap = embed ? "embed" : "full";

  let body: ReactNode = null;
  if (slug === "" || slug === "home") {
    body = (
      <>
        <h1>Szcenárió support</h1>
        <p>Három réteg: tippek, GYIK, írásos jegy. Nincs telefonos ügyintézés.</p>
        <p className="sla">{SUPPORT_SLA}</p>
        <div className="nav">
          <a href="/embed/tippek">Tippek</a>
          <a href="/embed/gyik">GYIK</a>
          <a href="/embed/ticket">Jegy</a>
          {LESSONS.map((l) => (
            <a key={l.slug} href={`/embed/${l.slug}`}>
              {l.title}
            </a>
          ))}
        </div>
        <KahnBonbon />
        <h2>Tudástár — szcenárió-leckék</h2>
        <p className="note">Részletes elmélet és know-how. A számítás a saját gépeden fut — nincs felhő-adat.</p>
        <div className="nav">
          {THEORY_LESSONS.map((l) => (
            <a key={l.slug} href={`/${l.slug}`}>
              {l.title}
            </a>
          ))}
        </div>
        <h2>Írásos jegy</h2>
        <TicketForm />
      </>
    );
  } else if (slug === "tippek") {
    body = (
      <>
        <h1>Tippek</h1>
        <Items items={TIPS} />
      </>
    );
  } else if (slug === "gyik") {
    body = (
      <>
        <h1>GYIK</h1>
        <KahnBonbon />
        <Items items={FAQ} />
      </>
    );
  } else if (slug === "ticket") {
    body = (
      <>
        <h1>Írásos ügyintézés</h1>
        <TicketForm />
      </>
    );
  } else if (lesson) {
    body = (
      <>
        {lesson.markdown ? null : <h1>{lesson.title}</h1>}
        {lesson.youtubeId ? <YouTube id={lesson.youtubeId} title={lesson.title} /> : null}
        {lesson.markdown ? <Markdown source={lesson.body} /> : <p>{lesson.body}</p>}
      </>
    );
  } else if (slug === "kb/kahn-rand") {
    body = (
      <>
        <h1>{KAHN_BONBON.title}</h1>
        <KahnBonbon />
      </>
    );
  } else if (slug.startsWith("kb/")) {
    body = (
      <>
        <h1>Súgó</h1>
        <p>A fogalom a helyi appban is ott van. Részletes lecke a YouTube-on, nem a VPS-en.</p>
        <YouTube id="" title="Súgó" />
      </>
    );
  } else {
    body = (
      <>
        <h1>Nincs ilyen lecke</h1>
        <p>
          <a href="/embed/tippek">Vissza a tippekhez</a>
        </p>
      </>
    );
  }

  return <main className={wrap}>{body}</main>;
}
