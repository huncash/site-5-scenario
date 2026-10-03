import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";

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

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <nav className="site-footer-col" aria-label={title}>
      <div className="site-footer-heading">{title}</div>
      <ul className="site-footer-list">
        {links.map((l) => (
          <li key={`${l.href}:${l.label}`}>
            <a href={l.href}>{l.label}</a>
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
  const bill = billPublicOrigin();
  const about = kind === "main" ? "/about" : `${home}/about`;
  const homeHref = kind === "main" ? "/" : home;
  const pricingHref = kind === "main" ? "/#csomagok" : `${home}/#csomagok`;
  // Support hoston lokális /gyik; máshol a support aldomain GYIK-je
  const faqHref = kind === "support" ? "/gyik" : `${support}/gyik`;
  const logoSrc = "/logo.svg";
  const year = new Date().getFullYear();

  const productLinks = [
    { href: homeHref, label: t("footer.catalog") },
    { href: homeHref, label: t("footer.scenarios") },
    { href: homeHref, label: t("footer.types") },
    { href: pricingHref, label: t("footer.pricing") },
    { href: bill, label: t("footer.bill") },
  ];
  const aboutLinks = [
    { href: about, label: t("footer.aboutUs") },
    { href: faqHref, label: t("footer.faq") },
  ];

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-shell">
        <div className="site-footer-inner">
          <div className="site-footer-col site-footer-brand-col">
            <a href={homeHref} className="site-footer-logo">
              <img src={logoSrc} alt="" width={28} height={28} className="site-footer-logo-img" />
              <span className="site-footer-name">{t("brand.name")}</span>
            </a>
            <p className="site-footer-tagline">{t("footer.brandBlurb")}</p>
          </div>
          <FooterCol title={t("footer.product")} links={productLinks} />
          <FooterCol title={t("footer.aboutCol")} links={aboutLinks} />
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
              <a href={faqHref} className="site-footer-write">
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
