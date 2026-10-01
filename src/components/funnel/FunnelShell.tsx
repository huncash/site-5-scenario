import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FunnelShell(props: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  const { title, subtitle, eyebrow, rightSlot, children } = props;
  return (
    // NOTE: the app shell disables document scroll (html/body/#root overflow hidden),
    // so funnel pages must provide their own scroll container.
    <div className="h-dvh overflow-x-hidden overflow-y-auto bg-background">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <Link to="/" className="block min-w-0 truncate text-sm font-semibold text-slate-100">
              Szcenárió
            </Link>
            <div className="text-[11px] text-slate-400">Local‑first · offline‑first</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {rightSlot}
            <Button asChild size="sm" variant="outline" className="h-8">
              <Link to="/login">Belépés</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6">
          {eyebrow ? (
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{eyebrow}</div>
          ) : null}
          <h1 className={cn("mt-1 text-balance text-2xl font-semibold text-slate-100 sm:text-3xl")}>{title}</h1>
          {subtitle ? <p className="mt-2 max-w-3xl text-sm text-slate-300">{subtitle}</p> : null}
        </div>

        {children}
      </main>

      <footer className="border-t border-border/50 bg-slate-950/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-slate-400">
          Nincs regisztráció, nincs telemetria — a működés a te eszközödön fut.
        </div>
      </footer>
    </div>
  );
}

