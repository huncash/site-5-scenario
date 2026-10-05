import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useI18n } from "@/i18n";
import { hasGdprAcknowledged, setGdprAcknowledged } from "@/lib/gdprConsent";
import { currentLocation, resolveSiteHost } from "@/lib/siteSurface";

/** Első betöltés: könnyű privacy tájékoztató — nincs cookie-mátrix. */
export function PrivacyBanner() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loc = currentLocation();
    const kind = resolveSiteHost(loc.hostname, loc.port, loc.pathname);
    if (kind === "app") return;
    if (loc.pathname.startsWith("/embed")) return;
    if (hasGdprAcknowledged()) return;
    setOpen(true);
  }, []);

  if (!open) return null;

  const accept = () => {
    setGdprAcknowledged();
    setOpen(false);
  };

  return (
    <aside
      role="dialog"
      aria-labelledby="privacy-banner-title"
      aria-describedby="privacy-banner-body"
      className="fixed bottom-4 right-4 z-50 max-w-md rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md"
    >
      <h2 id="privacy-banner-title" className="text-sm font-semibold text-slate-100">
        {t("legal.bannerTitle")}
      </h2>
      <p id="privacy-banner-body" className="mt-2 text-xs leading-relaxed text-slate-300">
        {t("legal.bannerBody")}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={accept}
          className="btn-cta rounded-lg px-4 py-1.5 text-xs"
        >
          {t("legal.bannerAccept")}
        </button>
        <Link
          to="/gdpr"
          className="text-xs text-slate-400 underline underline-offset-2 hover:text-slate-200"
          onClick={accept}
        >
          {t("legal.bannerDetails")}
        </Link>
      </div>
    </aside>
  );
}
