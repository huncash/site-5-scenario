import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";
import {
  CONSTRUCTION_EVENT,
  isAdminEntryPath,
  isConstructionUnlocked,
  maintenanceModeOn,
  tryConstructionUnlock,
} from "@/lib/constructionGate";

export function useMaintenanceLocked(): boolean {
  const [locked, setLocked] = useState(() => maintenanceModeOn());

  useEffect(() => {
    const sync = () => setLocked(maintenanceModeOn() && !isConstructionUnlocked());
    sync();
    window.addEventListener(CONSTRUCTION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CONSTRUCTION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return locked;
}

export function ConstructionGate({
  children,
  pathname,
}: {
  children: ReactNode;
  pathname?: string;
}) {
  const gated = maintenanceModeOn();
  const [allowed, setAllowed] = useState(() => !gated);
  const [admin, setAdmin] = useState(() => isAdminEntryPath(pathname));

  useEffect(() => {
    if (!maintenanceModeOn()) {
      setAllowed(true);
      return;
    }
    const sync = () => setAllowed(isConstructionUnlocked());
    sync();
    window.addEventListener(CONSTRUCTION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CONSTRUCTION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    setAdmin(isAdminEntryPath(pathname));
    const sync = () => setAdmin(isAdminEntryPath(pathname));
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [pathname]);

  if (!gated) return children;
  if (!allowed) return <ConstructionPage showAdmin={admin} />;
  return children;
}

export function ConstructionPage({ showAdmin = false }: { showAdmin?: boolean }) {
  const { t } = useI18n();
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [adminOpen, setAdminOpen] = useState(showAdmin);

  useEffect(() => {
    if (showAdmin) setAdminOpen(true);
  }, [showAdmin]);

  useEffect(() => {
    document.title = t("gate.title");
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
  }, [t]);

  const onEnter = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const ok = await tryConstructionUnlock(pass);
      if (!ok) {
        setError(true);
        return;
      }
      if (typeof window !== "undefined") window.location.assign("/");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-16 text-foreground">
      <main className="w-full max-w-lg space-y-10">
        <header className="space-y-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            szcenario.hu
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("gate.headlineHu")}
          </h1>
          <p className="text-balance text-xl font-medium text-foreground/80 sm:text-2xl">
            {t("gate.headlineEn")}
          </p>
          <p className="text-pretty text-[15px] leading-relaxed text-muted-foreground">
            {t("gate.bodyHu")}
          </p>
          <p className="text-pretty text-[15px] leading-relaxed text-muted-foreground">
            {t("gate.bodyEn")}
          </p>
        </header>

        {adminOpen ? (
          <section
            className="rounded-2xl border border-border/70 bg-card/70 px-5 py-5"
            aria-labelledby="gate-admin-heading"
          >
            <h2 id="gate-admin-heading" className="text-sm font-semibold tracking-tight">
              {t("gate.adminTitle")}
            </h2>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{t("gate.adminLead")}</p>
            <form className="mt-4 space-y-3" onSubmit={(e) => void onEnter(e)}>
              <label className="block space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">{t("gate.keyLabel")}</span>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={pass}
                  onChange={(ev) => {
                    setPass(ev.target.value);
                    setError(false);
                  }}
                  className="h-10"
                />
              </label>
              {error ? <p className="text-[12px] text-destructive">{t("gate.denied")}</p> : null}
              <Button type="submit" className="btn-cta h-10 w-full font-semibold" disabled={busy}>
                {busy ? t("chrome.unlocking") : t("gate.enter")}
              </Button>
            </form>
          </section>
        ) : (
          <p className="pt-8 text-center">
            <button
              type="button"
              className="text-[11px] text-muted-foreground/40 underline-offset-4 transition-colors hover:text-muted-foreground hover:underline"
              onClick={() => setAdminOpen(true)}
            >
              {t("gate.adminLink")}
            </button>
          </p>
        )}
      </main>
    </div>
  );
}
