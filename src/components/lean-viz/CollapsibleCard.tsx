import type { ReactNode } from "react";

import { useDashboardBlockOpen } from "@/hooks/useDashboardBlockOpen";
import { cn } from "@/lib/utils";

export function CollapseMark({ open }: { open: boolean }) {
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-[var(--dropdown-hover)] font-mono text-sm leading-none text-[var(--text-main)]"
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
      className="inline-flex shrink-0 items-center justify-center rounded-md text-[var(--text-main)] hover:text-[var(--accent-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
      title={label}
      aria-expanded={open}
      aria-label={label}
      data-exact={exact}
    >
      <CollapseMark open={open} />
    </button>
  );
}

function CollapsibleFrame({
  id,
  title,
  defaultOpen,
  children,
  className,
  titleClassName,
  headerRight,
  exact,
  as: Tag = "div",
}: {
  id: string;
  title: ReactNode;
  defaultOpen: boolean;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  headerRight?: ReactNode;
  exact?: string;
  as?: "div" | "section";
}) {
  const { isOpen, toggle } = useDashboardBlockOpen(id, defaultOpen);

  return (
    <Tag className={cn("min-w-0 w-full", className)}>
      <div className="mb-1.5 flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <RevealToggle open={isOpen} onClick={toggle} exact={exact} />
          <div className={cn("min-w-0 text-sm font-medium leading-snug text-[var(--text-main)]", titleClassName)}>
            {title}
          </div>
        </div>
        {headerRight}
      </div>
      {isOpen ? <div className="min-w-0">{children}</div> : null}
    </Tag>
  );
}

/** Belső kártya / kimutatás: a cím látszik, a tartalom alapból +. */
export function CollapsibleCard({
  id,
  title,
  defaultOpen = false,
  children,
  className,
  titleClassName,
  headerRight,
  exact,
}: {
  id: string;
  title: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  headerRight?: ReactNode;
  exact?: string;
}) {
  return (
    <CollapsibleFrame
      id={id}
      title={title}
      defaultOpen={defaultOpen}
      className={className}
      titleClassName={titleClassName}
      headerRight={headerRight}
      exact={exact}
    >
      {children}
    </CollapsibleFrame>
  );
}

/** Fő szekció (PLAN/DO/CHECK/ACT): keret nyitva, a belső blokkok külön csukódnak. */
export function CollapsibleSection({
  id,
  title,
  defaultOpen = true,
  children,
  className,
  titleClassName,
  headerRight,
  exact,
}: {
  id: string;
  title: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  headerRight?: ReactNode;
  exact?: string;
}) {
  return (
    <CollapsibleFrame
      as="section"
      id={id}
      title={title}
      defaultOpen={defaultOpen}
      className={className}
      titleClassName={titleClassName}
      headerRight={headerRight}
      exact={exact}
    >
      {children}
    </CollapsibleFrame>
  );
}

/** Magyarázat: a cím/adat látszik, a szöveg alapból +. */
export function DetailFold({ id, text }: { id: string; text: string }) {
  const { isOpen, toggle } = useDashboardBlockOpen(id, false);
  if (!text) return null;
  return (
    <div className="mt-1.5 flex items-start gap-1.5">
      <RevealToggle open={isOpen} onClick={toggle} />
      {isOpen ? <p className="min-w-0 text-[11px] leading-snug text-[var(--text-main)]">{text}</p> : null}
    </div>
  );
}
