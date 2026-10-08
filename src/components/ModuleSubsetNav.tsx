import type { ReactNode } from "react";

import { subsetDomId, type ModuleSubsetId } from "@/lib/moduleSubsets";

/** Görgetési horgony a Dev Tree fókuszhoz — nincs fül, nincs aria régiónév. */
export function ModuleSubsetSection({
  id,
  children,
}: {
  id: ModuleSubsetId;
  children: ReactNode;
}) {
  return (
    <div id={subsetDomId(id)} className="flex min-w-0 flex-col gap-2">
      {children}
    </div>
  );
}
