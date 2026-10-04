import { HelpIcon } from "@/components/HelpIcon";

export function KahnInfobonbon(props: { compact?: boolean }) {
  return (
    <article className="kahn-bonbon">
      <div className="flex items-start justify-between gap-2">
        <p className="kahn-bonbon-eyebrow">Tudástár · P-R-O · Bisztró eset</p>
        <HelpIcon
          kbId="kahn-rand"
          title="Herman Kahn és a P-R-O szórásmodell"
          size={props.compact ? "sm" : "md"}
        />
      </div>
      <h3 className="kahn-bonbon-title">Kahn-módszer → integrált Magán / Core / Projekt</h3>
      <p className="kahn-bonbon-body">
        Kahn a RAND-nál megtörte az egyetlen „pontos” jövő illúzióját: elágazások és Stop-Loss a
        legrosszabb ágon. A klasszikus fa korlátja: a magánvagyon és a cég cash-flow-ja külön élt.
      </p>
      <p className="kahn-bonbon-body">
        A bisztró demó egy térben köti össze a Core üzemet, a magán ingatlanfedezetet és a
        terasz/konyha elágazást — 🟢 O / 🔵 R / 🔴 P, local-first.
      </p>
      <p className="kahn-bonbon-foot">Local-first · nincs felhő-adat · nincs használatküldés</p>
    </article>
  );
}
