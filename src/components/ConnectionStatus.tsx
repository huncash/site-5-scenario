import { useMemo } from "react";

import { useMeshConnection } from "@/lib/mesh/meshRepository";

export function ConnectionStatus() {
  const c = useMeshConnection();

  const v = useMemo(() => {
    if (c.syncingFull) return { label: "Szinkronizálás…", cls: "bg-yellow-500" };
    if (c.open) return { label: "Kapcsolódva", cls: "bg-green-500" };
    return { label: "Offline", cls: "bg-red-500" };
  }, [c.open, c.syncingFull]);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs">
      <span className={`h-2 w-2 rounded-full ${v.cls}`} />
      <span className="text-muted-foreground">{v.label}</span>
    </div>
  );
}

