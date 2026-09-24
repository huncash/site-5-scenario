import { useEffect, useState, type ReactNode } from "react";

import { HelpIcon } from "@/components/HelpIcon";
import { rememberVizUse, type LeanVizKind } from "@/lib/leanViz";

export function RevealToggle({
  open,
  onClick,
  exact,
}: {
  open: boolean;
  onClick: () => void;
  exact?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] font-mono text-xs leading-none text-slate-200 hover:bg-white/[0.07]"
      title={open ? "Elrejtés — az áttekintés marad" : "Felfedés — a szimulációs részlet"}
      aria-expanded={open}
      aria-label={open ? "Elrejtés — az áttekintés marad" : "Felfedés — a szimulációs részlet"}
      data-exact={exact}
    >
      {open ? "−" : "+"}
    </button>
  );
}

export function RevealPanel({
  id,
  title,
  kind,
  exact,
  children,
  defaultOpen = false,
}: {
  id: string;
  title: string;
  kind?: LeanVizKind;
  exact?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    try {
      const v = localStorage.getItem(`ui:reveal:${id}`);
      if (v === "1") setOpen(true);
      if (v === "0") setOpen(false);
    } catch {
      /* ignore */
    }
  }, [id]);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`ui:reveal:${id}`, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      if (next && kind) rememberVizUse(kind);
      return next;
    });
  };

  return (
    <div className="min-w-0 w-full max-w-full">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 text-sm font-medium leading-snug text-muted-foreground">
          <span className="inline-flex items-center">
            {title}
            {exact ? <HelpIcon title={title} summary={exact} /> : null}
          </span>
        </div>
        <RevealToggle open={open} onClick={toggle} exact={exact} />
      </div>
      {open ? <div className="mt-2 min-w-0">{children}</div> : null}
    </div>
  );
}
