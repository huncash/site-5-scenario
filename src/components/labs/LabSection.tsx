import { useEffect, useState, type ReactNode } from "react";

import type { DashboardLabId } from "@/lib/dashboardLabs";
import { LAB_FOCUS_EVENT, LAB_FOCUS_MS, peekLabFocus } from "@/lib/labFocus";
import { cn } from "@/lib/utils";

export function LabSection({
  id,
  children,
  className,
}: {
  id: DashboardLabId;
  children: ReactNode;
  className?: string;
}) {
  const [on, setOn] = useState(() => peekLabFocus(id));

  useEffect(() => {
    let t: number | undefined;
    const arm = () => {
      setOn(true);
      window.clearTimeout(t);
      t = window.setTimeout(() => setOn(false), LAB_FOCUS_MS);
    };
    if (peekLabFocus(id)) arm();
    const onEvt = (e: Event) => {
      const nid = (e as CustomEvent<{ id?: string }>).detail?.id;
      if (nid === id) arm();
    };
    window.addEventListener(LAB_FOCUS_EVENT, onEvt as EventListener);
    return () => {
      window.removeEventListener(LAB_FOCUS_EVENT, onEvt as EventListener);
      window.clearTimeout(t);
    };
  }, [id]);

  return (
    <div data-lab-section={id} className={cn("rounded-xl", on && "lab-focus-ring", className)}>
      {children}
    </div>
  );
}
