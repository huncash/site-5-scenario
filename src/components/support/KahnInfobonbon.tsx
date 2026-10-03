import { HelpIcon } from "@/components/HelpIcon";

export function KahnInfobonbon(props: { compact?: boolean }) {
  return (
    <article className="kahn-bonbon">
      <div className="flex items-start justify-between gap-2">
        <p className="kahn-bonbon-eyebrow">Tudástár · Történeti sablon</p>
        <HelpIcon
          kbId="kahn-rand"
          title="Herman Kahn és a RAND"
          size={props.compact ? "sm" : "md"}
        />
      </div>
      <h3 className="kahn-bonbon-title">Herman Kahn és a RAND Corporation</h3>
      <p className="kahn-bonbon-body">
        A szcenárió-alapú tervezés nem két találgatott év. Kahn a RAND-nál a hidegháborúban
        többágú jövőképet rajzolt: elágazás, mielőtt elkötelezed az erőforrást.
      </p>
      <p className="kahn-bonbon-body">
        Ugyanez a módszer viszi ma a Master Baseline törzset: optimista bővítés, realista tartás,
        pesszimista tartalék. A fa a te eszközödön fut — local-first, nulla telemetria.
      </p>
      <p className="kahn-bonbon-foot">Local-first · nincs felhő-adat · nincs használatküldés</p>
    </article>
  );
}
