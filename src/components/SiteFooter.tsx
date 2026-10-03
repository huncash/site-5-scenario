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
  SITE_VERSION,
  type HomeMode,
} from "@/lib/siteSurface";
import { supportPublicOrigin } from "@/lib/support";

const FOOTER_HOST = "[data-site-footer-host]";

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
    window.addEventListener("storage", sync);
    window.addEventListener(HOME_MODE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(HOME_MODE_EVENT, sync);
    };
  }, []);
  return mode;
}

export function useSiteFooterVisible(pathname?: string) {
  const homeMode = useHomeMode();
  const loc = currentLocation();
  const path = pathname ?? loc.pathname;
  const embed = path.startsWith("/embed");
  return shouldShowSiteFooter({
    hostname: loc.hostname,
    port: loc.port,
    pathname: path,
    homeMode,
    embed,
  });
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

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-name">{t("brand.name")}</span>
          <span className="site-footer-copy">
            © {new Date().getFullYear()} {t("footer.rights")}
          </span>
          <span className="site-footer-ver">v{SITE_VERSION}</span>
        </div>
        <nav className="site-footer-nav" aria-label={t("footer.nav")}>
          <a href={homeHref}>{t("footer.home")}</a>
          <a href={support}>{t("footer.support")}</a>
          <a href={bill}>{t("footer.bill")}</a>
          <a href={about}>{t("footer.imprint")}</a>
        </nav>
        <p className="site-footer-note">{t("chrome.noTelemetry")}</p>
      </div>
    </footer>
  );
});

export function SiteFooter(props: { pathname?: string; inline?: boolean }) {
  const locale = useLiveLocale();
  const visible = useSiteFooterVisible(props.pathname);
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!visible || props.inline) {
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
    return () => window.cancelAnimationFrame(id);
  }, [visible, props.inline, props.pathname]);

  if (!visible) return null;
  const node = <FooterMarkup locale={locale} />;
  if (props.inline) return node;
  if (host) return createPortal(node, host);
  return node;
}
