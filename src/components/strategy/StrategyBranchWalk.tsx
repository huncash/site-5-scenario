import { useMemo, useState } from "react";

import { ChartLegendSwatch } from "@/components/lean-viz/LeanCharts";
import {
  chooseAt,
  formatNarrativeCash,
  resolveNarrative,
  storyById,
  walkedSteps,
  type NarrativeTone,
} from "@/lib/strategyNarrative";

const TONE_LABEL: Record<NarrativeTone, string> = {
  opt: "Optimista",
  real: "Realista",
  pess: "Pesszimista",
};

export function StrategyBranchWalk(props: { storyId: "new-line" | "loan-whatif" }) {
  const story = useMemo(() => storyById(props.storyId), [props.storyId]);
  const [path, setPath] = useState<string[]>([]);
  const steps = walkedSteps(story, path);
  const climax = resolveNarrative(props.storyId, path);
  const terminal = steps.length > 0 && steps.every((s) => s.picked) && !steps[steps.length - 1]!.picked?.next;

  return (
    <div className="narr-walk">
      <div className="narr-walk-head">
        <span className="surv-label-chip">{story.title}</span>
        <button type="button" className="narr-reset" onClick={() => setPath([])} disabled={path.length === 0}>
          Új szál
        </button>
      </div>
      <ol className="crisis-tl">
        {steps.map(({ step, picked }, idx) => (
          <li key={step.id} className="crisis-tl-fork">
            <div className="crisis-tl-hour">
              <span className="surv-label-chip">{step.month}. hó</span>
            </div>
            <p className="crisis-tl-q">{step.question}</p>
            <ul className="crisis-tl-choices">
              {step.choices.map((c) => {
                const on = picked?.id === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={`crisis-tl-btn crisis-tl-${c.tone}${on ? " is-on" : ""}`}
                      aria-pressed={on}
                      onClick={() => setPath(chooseAt(path, idx, c.id))}
                    >
                      <span className="crisis-tl-btn-head">
                        <ChartLegendSwatch tone={c.tone} label={TONE_LABEL[c.tone]} line />
                        <span className="surv-label-chip">{c.label}</span>
                      </span>
                      <span className="crisis-tl-effect">{c.lead}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
      <aside className={`narr-climax narr-climax-${climax.tone}`}>
        <div className="narr-climax-head">
          <span className="surv-label-chip">{terminal ? "Végkifejlet" : "Élő számítás"}</span>
          <span className={`surv-value-chip narr-tone-${climax.tone}`}>{climax.title}</span>
        </div>
        <dl className="narr-climax-metrics">
          <div>
            <dt>Készpénz</dt>
            <dd>{formatNarrativeCash(climax.cashHuf)}</dd>
          </div>
          <div>
            <dt>Runway</dt>
            <dd>{climax.runwayMonths} hó</dd>
          </div>
          <div>
            <dt>Megtérülés</dt>
            <dd>{climax.beMonth == null ? "horizonton túl" : `${climax.beMonth}. hó`}</dd>
          </div>
        </dl>
        <p className="narr-climax-lock">{climax.lockIn}</p>
        <p className="narr-climax-wow">{climax.wow}</p>
      </aside>
    </div>
  );
}
