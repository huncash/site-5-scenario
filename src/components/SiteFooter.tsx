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
const DASH_SURFACE = '[data-site-surface="dashboard"]';

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
    // inline marketing surfaces (door/bill/support): homeMode ne nyomja el
    homeMode: opts?.ignoreHomeMode ? "door" : homeMode,
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
    // inline: bill / support / door saját markup — nincs portal-host kellék
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

  // inline (bill/support/door): csak a marketing-láthatóság számít — ne nyomja el a homeMode
  const hide =
    !visible || (!props.inline && (dashMounted || homeMode === "dashboard"));
  if (hide) return null;
  const node = <FooterMarkup locale={locale} />;
  if (props.inline) return node;
  // Host nélkül ne kerüljön a dashboard fölé — csak marketing hostba portalozunk.
  if (!host) return null;
  return createPortal(node, host);
}
