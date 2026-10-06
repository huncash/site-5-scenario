import type { ReactNode } from "react";

import { useDashboardBlockOpen } from "@/hooks/useDashboardBlockOpen";
import { cn } from "@/lib/utils";

export function CollapseMark({ open }: { open: boolean }) {
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-[var(--dropdown-hover)] font-mono text-sm leading-none text-slate-200"
      aria-hidden="true"
    >
      {open ? "−" : "+"}
    </span>
  );
}

export function RevealToggle({
  open,
  onClick,
  exact,
  expandLabel = "Kinyitás",
  collapseLabel = "Összecsukás",
}: {
  open: boolean;
  onClick: () => void;
  exact?: string;
  expandLabel?: string;
  collapseLabel?: string;
}) {
  const label = open ? collapseLabel : expandLabel;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center justify-center rounded-md text-slate-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
      title={label}
      aria-expanded={open}
      aria-label={label}
      data-exact={exact}
    >
      <CollapseMark open={open} />
    </button>
  );
}

export function CollapsibleCard({
  id,
  title,
  defaultOpen = true,
  children,
  className,
  headerRight,
}: {
  id: string;
  title: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}) {
  const { isOpen, toggle } = useDashboardBlockOpen(id, defaultOpen);

  return (
    <div className={cn("min-w-0 w-full", className)}>
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <RevealToggle open={isOpen} onClick={toggle} />
          <div className="min-w-0 text-sm font-medium leading-snug text-slate-200">{title}</div>
        </div>
        {headerRight}
      </div>
      {isOpen ? <div className="min-w-0">{children}</div> : null}
    </div>
  );
}
