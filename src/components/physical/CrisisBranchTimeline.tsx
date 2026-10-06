import { DetailFold } from "@/components/lean-viz/CollapsibleCard";
import { ChartLegendSwatch } from "@/components/lean-viz/LeanCharts";
import type { CrisisChoice, CrisisFork, PhysicalTone } from "@/lib/physicalMetrics";

const TONE_LABEL: Record<PhysicalTone, string> = {
  opt: "Optimista",
  real: "Realista",
  pess: "Pesszimista",
};

export function CrisisBranchTimeline(props: {
  forks: CrisisFork[];
  selected: Record<string, string>;
  onChoose: (forkId: string, choice: CrisisChoice) => void;
}) {
  if (!props.forks.length) return null;
  return (
    <ol className="crisis-tl">
      {props.forks.map((fork) => {
        const picked = fork.choices.find((c) => c.id === props.selected[fork.id]);
        return (
          <li key={fork.id} className="crisis-tl-fork">
            <div className="crisis-tl-hour">
              <span className="surv-label-chip">{fork.hour} h</span>
            </div>
            <p className="crisis-tl-q">{fork.question}</p>
            <ul className="crisis-tl-choices">
              {fork.choices.map((c) => {
                const on = picked?.id === c.id;
                return (
                  <li key={c.id}>
                    <div className={`crisis-tl-btn crisis-tl-${c.tone}${on ? " is-on" : ""}`}>
                      <button
                        type="button"
                        className="kahn-pick"
                        aria-pressed={on}
                        onClick={() => props.onChoose(fork.id, c)}
                      >
                        <span className="crisis-tl-btn-head">
                          <ChartLegendSwatch tone={c.tone} label={TONE_LABEL[c.tone]} line />
                          <span className="surv-label-chip">{c.label}</span>
                        </span>
                      </button>
                      <DetailFold id={`crisis-${fork.id}-${c.id}`} text={c.effect} />
                    </div>
                  </li>
                );
              })}
            </ul>
            {picked ? (
              <p className="crisis-tl-picked text-[var(--text-main)]">Ág: {picked.label}</p>
            ) : (
              <p className="crisis-tl-picked muted">Válassz egy ágat. A mutatók a döntés után frissülnek.</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
