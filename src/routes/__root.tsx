import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { FeatureComingSoonProvider } from "@/components/FeatureComingSoon";
import { HoverCoachTooltip } from "@/components/HoverCoachTooltip";
import { Toaster } from "@/components/ui/sonner";
import { VaultProvider } from "@/lib/vault";
import { OnboardingTourProvider } from "@/components/onboarding/OnboardingTourProvider";
import { SupportEmbedProvider } from "@/components/support/SupportEmbedProvider";
import { LeanCommandPalette } from "@/components/LeanCommandPalette";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
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
            Try again
          </button>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== "undefined") window.location.assign("/");
            }}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
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
      { name: "theme-color", content: "#0b1220" },
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
      { rel: "icon", href: "/logo.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "mask-icon", href: "/logo.svg", color: "#00f0ff" },
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
    <html lang="hu" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
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
      <VaultProvider>
        <FeatureComingSoonProvider>
          <SupportEmbedProvider>
            <OnboardingTourProvider>
              {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
              <Outlet />
              <LeanCommandPalette />
              <HoverCoachTooltip />
              <Toaster richColors closeButton position="top-center" />
            </OnboardingTourProvider>
          </SupportEmbedProvider>
        </FeatureComingSoonProvider>
      </VaultProvider>
    </QueryClientProvider>
  );
}
