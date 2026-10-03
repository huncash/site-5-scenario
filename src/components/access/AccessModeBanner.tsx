import { Eye } from "lucide-react";

import { isViewerReadonly } from "@/lib/accessRole";

/** Olvasói mód jelzése — nem zárja a böngésző kaput, csak a mutációt. */
export function AccessModeBanner() {
  if (!isViewerReadonly()) return null;
  return (
    <div
      role="status"
      className="flex items-start gap-2 border-b border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[12px] leading-snug text-amber-100"
    >
      <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p>
        <span className="font-semibold">Olvasói mód (VIEWER_READONLY):</span> szcenáriók és elemzések
        elérhetők; adatbevitel, törlés, nyers export és szerkezeti beállítás tiltva. A tulajdonos
        visszavonhatja a kulcsot.
      </p>
    </div>
  );
}
