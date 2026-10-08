import { useMemo } from "react";

import { LeanTerm } from "@/components/HelpIcon";
import { SimLegalDisclaimer } from "@/components/legal/SimLegalDisclaimer";
import { BulletGraph } from "@/components/lean-viz/LeanCharts";
import { formatMoney } from "@/lib/finance";
import { kpisNeverEmpty } from "@/lib/bisztroPreview";
import { KAHN_JARGON } from "@/lib/kahnCrossTab";
import { useKahnPlanPath } from "@/lib/kahnPlanPath";
import { useLeanView } from "@/lib/leanView";
import { penaltyLabel } from "@/lib/simpleLabels";
import { KAHN_FORK, kahnReserveTargetHuf, resolveKahnPlanPro } from "@/lib/strategyCases";

const ink = "text-[var(--text-main)]";
const inkMuted = "text-[var(--text-muted)]";

function dash(n: number | null, kind: "runway" | "money" | "monthly"): string {
  const v = kpisNeverEmpty(n);
  if (kind === "runway") return `${v} hó`;
  const money = formatMoney(v, "HUF");
  return kind === "monthly" ? `${money}/hó` : money;
}

export function KahnLiveKpis() {
  const { lean } = useLeanView();
  const { financing, contract } = useKahnPlanPath();
  const live = useMemo(() => resolveKahnPlanPro(financing, contract), [financing, contract]);
  const pess = live.find((c) => c.tone === "pess")!;
  const reserve = kahnReserveTargetHuf();

  return (
    <>
      <SimLegalDisclaimer className="mb-2" />
      <div className="grid grid-cols-1 gap-2 min-w-0 lg:grid-cols-3">
        <div className="tile-lift rounded-lg bg-background p-2.5">
          <LeanTerm
            className={`kpi-label text-[10px] uppercase tracking-wide ${inkMuted}`}
            title={KAHN_JARGON.runway.termHu}
            exact={KAHN_JARGON.runway.exactHu}
            summary={KAHN_JARGON.runway.exactHu}
          >
            Runway
          </LeanTerm>
          <div className={`kpi-value mt-1 font-mono text-sm ${ink}`}>{dash(pess.runwayMonths, "runway")}</div>
        </div>
        <div className="tile-lift rounded-lg bg-background p-2.5">
          <LeanTerm
            className={`kpi-label text-[10px] uppercase tracking-wide ${inkMuted}`}
            title={KAHN_JARGON.penalty.termHu}
            exact={KAHN_JARGON.penalty.exactHu}
            summary={KAHN_JARGON.penalty.exactHu}
          >
            {penaltyLabel(lean)}
          </LeanTerm>
          <div className={`kpi-value mt-1 font-mono text-sm ${ink}`}>{dash(pess.exitPenaltyHuf, "money")}</div>
        </div>
        <div className="tile-lift rounded-lg bg-background p-2.5">
          <LeanTerm
            className={`kpi-label text-[10px] uppercase tracking-wide ${inkMuted}`}
            title="Tartalék"
            exact="A pesszimista sáv havi terhe, vagy a célpuffer, ha még nincs választás."
            summary="A pesszimista sáv havi terhe. Üres ágon a célpuffer."
          >
            Tartalék / teher
          </LeanTerm>
          <div className={`kpi-value mt-1 font-mono text-sm ${ink}`}>
            {dash(pess.monthlyObligationHuf ?? reserve, "monthly")}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <BulletGraph
          item={{
            id: "kahn-runway",
            label: `Tartalékidő a ${KAHN_FORK.minRunwayMonths} hónapos küszöbhöz`,
            actual: pess.runwayMonths ?? 0,
            target: KAHN_FORK.minRunwayMonths,
            unit: "hó",
            hint: "Rosszabb kimenet runwaye a választott ágon.",
          }}
        />
        <BulletGraph
          item={{
            id: "kahn-exit",
            label: "Kilépési ár az opciódíjhoz képest",
            actual: Math.round((pess.exitPenaltyHuf ?? 0) / 1000),
            target: Math.round(KAHN_FORK.optionFeeHuf / 1000),
            unit: "eFt",
            hint: "A választott konstrukció kötbére vs. az opció díja — ezer forintban.",
          }}
        />
      </div>
    </>
  );
}
