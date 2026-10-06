import type { ReactNode } from "react";

import { HelpIcon } from "@/components/HelpIcon";
import { RevealToggle } from "@/components/lean-viz/CollapsibleCard";
import { useDashboardBlockOpen } from "@/hooks/useDashboardBlockOpen";
import { rememberVizUse, type LeanVizKind } from "@/lib/leanViz";

export { RevealToggle } from "@/components/lean-viz/CollapsibleCard";

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
  const { isOpen, setOpen } = useDashboardBlockOpen(id, defaultOpen);

  const onToggle = () => {
    const next = !isOpen;
    setOpen(next);
    if (next && kind) rememberVizUse(kind);
  };

  return (
    <div className="min-w-0 w-full max-w-full">
      <div className="flex items-start gap-2">
        <RevealToggle open={isOpen} onClick={onToggle} exact={exact} />
        <div className="min-w-0 text-sm font-medium leading-snug text-muted-foreground">
          <span className="inline-flex items-center">
            {title}
            {exact ? <HelpIcon title={title} summary={exact} /> : null}
          </span>
        </div>
      </div>
      {isOpen ? <div className="mt-2 min-w-0">{children}</div> : null}
    </div>
  );
}
