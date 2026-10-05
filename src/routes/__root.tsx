import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { FeatureComingSoonProvider } from "@/components/FeatureComingSoon";
import { HoverCoachTooltip } from "@/components/HoverCoachTooltip";
import { BillTestSurface } from "@/components/BillTestSurface";
import { SiteKindTestPage } from "@/components/SiteKindTestPage";
import { Toaster } from "@/components/ui/sonner";
import { VaultProvider } from "@/lib/vault";
import { OnboardingTourProvider } from "@/components/onboarding/OnboardingTourProvider";
import { SupportEmbedProvider } from "@/components/support/SupportEmbedProvider";
import { LeanCommandPalette } from "@/components/LeanCommandPalette";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PrivacyBanner } from "@/components/legal/PrivacyBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { LocaleProvider, useI18n } from "@/i18n";
import { LOCALE_BOOT_SCRIPT } from "@/i18n/locale";
import {
  currentSiteHost,
  readBootSiteKind,
  resolveSiteHost,
  SITE_KIND_BOOT_SCRIPT,
  type SiteHostKind,
} from "@/lib/siteSurface";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";

function NotFoundComponent() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("error.notFoundTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("error.notFoundBody")}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("error.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useI18n();
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t("error.loadFail")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("error.loadFailBody")}</p>
        {import.meta.env.DEV && (
          <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-3 text-left">
            <div className="text-xs font-semibold text-foreground">
              {error.name}: {error.message}
            </div>
            {!!error.stack && (
              <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-md bg-background/40 p-2 text-[10px] text-muted-foreground">
                {error.stack}
              </pre>
            )}
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
                return;
              }
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("error.tryAgain")}
          </button>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== "undefined") window.location.assign("/");
            }}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("error.goHome")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "Szcenárió" },
      {
        name: "description",
        content:
          "Szcenárió — „mi lenne, ha” esetek a te eszközödön. Cél: egy helyzetet előre vizsgálni. Nincs regisztráció, nem tárolunk személyes vagy használati adatot.",
      },
      { property: "og:title", content: "Szcenárió" },
      {
        property: "og:description",
        content:
          "„Mi lenne, ha” esetek a te eszközödön. Nincs regisztráció, nincs adattárolás nálunk.",
      },
      { property: "og:image", content: "/logo.svg" },
      { property: "og:image:type", content: "image/svg+xml" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/logo.svg" },
      { name: "theme-color", content: "#071511" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Szcenárió" },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32'%3E%3Crect width='32' height='32' rx='6' fill='%23071511'/%3E%3Cpath d='M16 6L8 22H24L16 6Z' fill='%232d6a4f' fill-opacity='0.35'/%3E%3Cpath d='M16 10L10 22H22L16 10Z' fill='%232d6a4f'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%23f1f5f9'/%3E%3C/svg%3E" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "mask-icon", href: "/logo.svg", color: "#2d6a4f" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],

  }),

  shellComponent: RootShell,
  pendingComponent: function ShellPending() {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-muted-foreground">
        <span className="text-sm tracking-wide">Szcenárió</span>
      </div>
    );
  },
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="hu" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LOCALE_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SITE_KIND_BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootFooter() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return <SiteFooter pathname={pathname} />;
}

function SurfacePending() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#111827] px-4 font-mono text-[#facc15]">
      <span className="text-sm tracking-wide">Aldomain teszt…</span>
    </div>
  );
}

function useSiteKind(): { kind: SiteHostKind; ready: boolean } {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [kind, setKind] = useState<SiteHostKind | null>(() => {
    const boot = readBootSiteKind();
    if (boot) return boot;
    if (typeof window !== "undefined") return currentSiteHost();
    const fromPath = resolveSiteHost("", "", pathname);
    return fromPath === "main" ? null : fromPath;
  });

  useEffect(() => {
    setKind(currentSiteHost());
  }, [pathname]);

  return { kind: kind ?? "main", ready: kind !== null };
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { kind: siteKind, ready: siteReady } = useSiteKind();
  const isBill = siteKind === "bill";
  const isSupport = siteKind === "support";
  const dedicated = isBill || isSupport;

  useEffect(() => {
    void import("@/lib/campaignSession").then((m) => m.captureCampaignFromLocation({ doorStep: false }));
    if (!("serviceWorker" in navigator)) return;
    if (import.meta.env.DEV) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => {});
      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => Promise.all(keys.filter((k) => k.startsWith("szcenario-")).map((k) => caches.delete(k))))
          .catch(() => {});
      }
      return;
    }
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
      <ThemeProvider>
        <VaultProvider>
          <FeatureComingSoonProvider>
            <SupportEmbedProvider>
              <OnboardingTourProvider>
                {!siteReady ? (
                  <SurfacePending />
                ) : isBill ? (
                  <BillTestSurface />
                ) : isSupport ? (
                  <SiteKindTestPage kind="support" />
                ) : (
                  <Outlet />
                )}
                {dedicated ? null : <RootFooter />}
                {dedicated ? null : <PrivacyBanner />}
                {dedicated ? null : <LeanCommandPalette />}
                {dedicated ? null : <HoverCoachTooltip />}
                {dedicated ? null : <Toaster richColors closeButton position="top-center" />}
              </OnboardingTourProvider>
            </SupportEmbedProvider>
          </FeatureComingSoonProvider>
        </VaultProvider>
      </ThemeProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
