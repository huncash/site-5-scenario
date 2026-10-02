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
    <div className="door-page h-dvh overflow-x-hidden overflow-y-auto bg-background">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <Link to="/" className="block min-w-0 truncate text-sm font-semibold text-foreground">
              Szcenárió
            </Link>
            <div className="text-[11px] text-muted-foreground">Local‑first · offline‑first</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {rightSlot}
            <Button asChild size="sm" variant="outline" className="h-8 border-white/35 bg-transparent text-foreground">
              <Link to="/login">Belépés</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="mb-6">
          {eyebrow ? (
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{eyebrow}</div>
          ) : null}
          <h1 className={cn("mt-1 text-balance text-2xl font-semibold text-foreground sm:text-3xl")}>{title}</h1>
          {subtitle ? <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>

        {children}
      </main>

      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 text-xs text-muted-foreground">
          Nincs regisztráció, nincs telemetria — a működés a te eszközödön fut.
        </div>
      </footer>
    </div>
  );
}

