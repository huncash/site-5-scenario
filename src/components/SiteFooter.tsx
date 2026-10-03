import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { FooterRopeMark } from "@/components/rope/FooterRopeMark";
import { translate } from "@/i18n";
import { LOCALE_EVENT, readClientLocale, type Locale } from "@/i18n/locale";
import { billPublicOrigin } from "@/lib/billing";
import {
  currentLocation,
  HOME_MODE_EVENT,
  mainPublicOrigin,
  readHomeMode,
  resolveSiteHost,
  shouldShowSiteFooter,
  type HomeMode,
} from "@/lib/siteSurface";
import { supportPublicOrigin } from "@/lib/support";

const FOOTER_HOST = "[data-site-footer-host]";
const DASH_SURFACE = '[data-site-surface="dashboard"]';
const COPYRIGHT_FROM = 2006;

function useLiveLocale(): Locale {
  const [locale, setLocale] = useState<Locale>(readClientLocale);
  useEffect(() => {
    const sync = () => setLocale(readClientLocale());
    window.addEventListener(LOCALE_EVENT, sync);
    return () => window.removeEventListener(LOCALE_EVENT, sync);
  }, []);
  return locale;
}

function useHomeMode(): HomeMode {
  const [mode, setMode] = useState<HomeMode>(() =>
    typeof window === "undefined" ? "door" : readHomeMode(window.localStorage),
  );
  useEffect(() => {
    const sync = () => setMode(readHomeMode(window.localStorage));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(HOME_MODE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(HOME_MODE_EVENT, sync);
    };
  }, []);
  return mode;
}

function isDashboardSurfaceMounted(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(document.querySelector(DASH_SURFACE));
}

export function useSiteFooterVisible(pathname?: string, opts?: { ignoreHomeMode?: boolean }) {
  const homeMode = useHomeMode();
  const loc = currentLocation();
  const path = pathname ?? loc.pathname;
  const embed = path.startsWith("/embed");
  return shouldShowSiteFooter({
    hostname: loc.hostname,
    port: loc.port,
    pathname: path,
    homeMode: opts?.ignoreHomeMode ? "door" : homeMode,
    embed,
  });
}

type FooterLink = {
  href?: string;
  label: string;
  soon?: boolean;
  /** Support → tippek/GYIK: egy sor, kattintásra nyílik. */
  nest?: Array<{ href: string; label: string }>;
};

function FooterNest({
  label,
  nest,
}: {
  label: string;
  nest: Array<{ href: string; label: string }>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="site-footer-nest">
      <button
        type="button"
        className="site-footer-nest-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        <span className="site-footer-nest-chev" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open ? (
        <ul className="site-footer-nest-list">
          {nest.map((n) => (
            <li key={n.href}>
              <a href={n.href}>{n.label}</a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FooterCol({
  title,
  links,
  soonTitle,
}: {
  title: string;
  links: FooterLink[];
  soonTitle?: string;
}) {
  return (
    <nav className="site-footer-col" aria-label={title}>
      <div className="site-footer-heading">{title}</div>
      <ul className="site-footer-list">
        {links.map((l) => (
          <li key={`${l.href ?? "soon"}:${l.label}`}>
            {l.nest?.length ? (
              <FooterNest label={l.label} nest={l.nest} />
            ) : l.soon || !l.href ? (
              <span className="site-footer-soon" title={soonTitle}>
                {l.label}
                <span className="site-footer-soon-mark"> · {soonTitle}</span>
              </span>
            ) : (
              <a href={l.href}>{l.label}</a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

const FooterMarkup = memo(function FooterMarkup({ locale }: { locale: Locale }) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const loc = currentLocation();
  const kind = resolveSiteHost(loc.hostname, loc.port);
  const home = mainPublicOrigin(loc.hostname, loc.port);
  const support = supportPublicOrigin();
  const billHome = kind === "bill" ? "/" : `${billPublicOrigin()}/`;
  const mainPath = (path: string) => (kind === "main" ? path : `${home}${path}`);
  const supportPath = (path: string) => (kind === "support" ? path : `${support}${path}`);
  const scenariosHref = mainPath("/#szcenariok");
  const typesHref = mainPath("/#tipusok");
  const pricingHref = mainPath("/#csomagok");
  const aboutHref = mainPath("/about");
  const lessonsHref = supportPath("/tippek");
  const faqHref = supportPath("/gyik");
  const ticketHref = supportPath("/ticket");
  const year = new Date().getFullYear();
  const [footerHovered, setFooterHovered] = useState(false);

  const productLinks = [
    { href: scenariosHref, label: t("footer.scenarios") },
    { href: typesHref, label: t("footer.types") },
    { href: pricingHref, label: t("footer.pricing") },
    { href: billHome, label: t("footer.bill") },
  ];
  const aboutLinks: FooterLink[] = [
    {
      label: t("footer.supportHome"),
      nest: [
        { href: lessonsHref, label: t("footer.lessons") },
        { href: faqHref, label: t("footer.faq") },
      ],
    },
    { href: aboutHref, label: t("footer.aboutUs") },
    { soon: true, label: t("footer.terms") },
    { soon: true, label: t("footer.gdpr") },
  ];

  return (
    <footer
      className="site-footer"
      role="contentinfo"
      onMouseEnter={() => setFooterHovered(true)}
      onMouseLeave={() => setFooterHovered(false)}
    >
      <div className="site-footer-shell">
        <div className="site-footer-inner">
          <div className="site-footer-col site-footer-brand-col">
            <button type="button" className="site-footer-logo" aria-label={t("brand.name")}>
              <FooterRopeMark hovered={footerHovered} />
            </button>
            <p className="site-footer-tagline">{t("footer.brandBlurb")}</p>
          </div>
          <FooterCol title={t("footer.product")} links={productLinks} />
          <FooterCol title={t("footer.aboutCol")} links={aboutLinks} soonTitle={t("footer.comingSoon")} />
        </div>
        <div className="site-footer-bottom">
          <p className="site-footer-copyline">
            <span>
              © Copyright {COPYRIGHT_FROM} – {year}
            </span>
            <span className="site-footer-sep" aria-hidden>
              |
            </span>
            <span>{t("footer.rightsShort")}</span>
            <span className="site-footer-sep" aria-hidden>
              |
            </span>
            <span>
              {t("footer.question")}{" "}
              <a href={ticketHref} className="site-footer-write">
                {t("footer.writeUs")}
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
});

export function SiteFooter(props: { pathname?: string; inline?: boolean }) {
  const locale = useLiveLocale();
  const homeMode = useHomeMode();
  const visible = useSiteFooterVisible(props.pathname, { ignoreHomeMode: Boolean(props.inline) });
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [dashMounted, setDashMounted] = useState(false);

  useEffect(() => {
    const syncDash = () => setDashMounted(isDashboardSurfaceMounted());
    syncDash();
    const id = window.requestAnimationFrame(syncDash);
    window.addEventListener(HOME_MODE_EVENT, syncDash);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener(HOME_MODE_EVENT, syncDash);
    };
  }, [props.pathname, visible, homeMode]);

  useEffect(() => {
    if (!visible || props.inline || dashMounted || homeMode === "dashboard") {
      setHost((prev) => (prev === null ? prev : null));
      return;
    }
    const find = () => document.querySelector(FOOTER_HOST) as HTMLElement | null;
    const apply = () => {
      const el = find();
      setHost((prev) => (prev === el ? prev : el));
    };
    apply();
    const id = window.requestAnimationFrame(apply);
    const mo =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(() => apply())
        : null;
    mo?.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.cancelAnimationFrame(id);
      mo?.disconnect();
    };
  }, [visible, props.inline, props.pathname, dashMounted, homeMode]);

  const hide =
    !visible || (!props.inline && (dashMounted || homeMode === "dashboard"));
  if (hide) return null;
  const node = <FooterMarkup locale={locale} />;
  if (props.inline) return node;
  if (!host) return null;
  return createPortal(node, host);
}
