import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { applyHtmlLang } from "@/i18n/locale";
import { lockLocaleUrl, restoreLangFromPersistence } from "@/lib/langSearch";
import { routeTree } from "./routeTree.gen";

function DefaultPending() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background text-muted-foreground">
      <span className="text-sm tracking-wide">Szcenárió</span>
    </div>
  );
}

function pokaYokeLang(router: { history?: { replace?: (href: string) => void } }) {
  if (typeof window === "undefined") return;
  const locale = restoreLangFromPersistence();
  applyHtmlLang(locale);
  lockLocaleUrl(locale, (href) => {
    try {
      router.history?.replace?.(href);
    } catch {
      window.history.replaceState(window.history.state, "", href);
    }
  });
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: DefaultPending,
  });

  if (typeof window !== "undefined") {
    pokaYokeLang(router);
    try {
      router.history.subscribe(() => pokaYokeLang(router));
    } catch {
      /* history API */
    }
    try {
      router.subscribe("onResolved", () => pokaYokeLang(router));
    } catch {
      /* 1.170 esemény */
    }
  }

  return router;
};
