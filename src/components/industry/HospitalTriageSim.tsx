import { useMemo, useState } from "react";

import {
  HOSPITAL_DIESEL_L,
  HOSPITAL_GENERATOR_KW,
  HOSPITAL_UPS_KWH,
  defaultHospitalAlloc,
  simulateHospital,
  type HospitalAlloc,
} from "@/lib/industryCases";

function KwSlider(props: { id: string; label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="alloc-slider" htmlFor={props.id}>
      <span className="alloc-slider-head">
        <span className="surv-label-chip">{props.label}</span>
        <span className="surv-value-chip">{props.value} kW</span>
      </span>
      <input
        id={props.id}
        type="range"
        min={0}
        max={120}
        step={1}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function HospitalTriageSim() {
  const [alloc, setAlloc] = useState<HospitalAlloc>(defaultHospitalAlloc);
  const sim = useMemo(() => simulateHospital(alloc), [alloc]);
  const setField = (key: keyof HospitalAlloc, value: number) => setAlloc({ ...alloc, [key]: value });

  return (
    <div className="alloc-sim">
      <div className="alloc-sim-head">
        <span className="surv-label-chip">Aggregátor + UPS</span>
        <span className="surv-value-chip">
          {HOSPITAL_GENERATOR_KW} kW · {HOSPITAL_DIESEL_L} L · {HOSPITAL_UPS_KWH} kWh
        </span>
      </div>
      <p className="alloc-sim-lead">
        Lean triázs: ICU és NICU először. Ha a kért terhelés nagyobb, mint a generátor, a vágás a műtő / osztály felől jön.
      </p>
      <div className="alloc-sliders">
        <KwSlider id="h-icu" label="Intenzív" value={alloc.icu} onChange={(n) => setField("icu", n)} />
        <KwSlider id="h-nicu" label="Újszülött / inkubátor" value={alloc.nicu} onChange={(n) => setField("nicu", n)} />
        <KwSlider id="h-or" label="Műtők" value={alloc.or} onChange={(n) => setField("or", n)} />
        <KwSlider id="h-ward" label="Általános osztály" value={alloc.ward} onChange={(n) => setField("ward", n)} />
      </div>
      <dl className="alloc-metrics">
        <div>
          <dt>Terhelés</dt>
          <dd>
            {sim.loadKw} / {HOSPITAL_GENERATOR_KW} kW
          </dd>
        </div>
        <div>
          <dt>Dízel-runway</dt>
          <dd>{sim.dieselHours} óra</dd>
        </div>
        <div>
          <dt>UPS híd</dt>
          <dd>{sim.upsHours} óra</dd>
        </div>
      </dl>
      <ul className="hosp-wards">
        {sim.wards.map((w) => (
          <li key={w.id} className={w.kept ? "is-ok" : "is-shed"}>
            <span className="surv-label-chip">{w.label}</span>
            <span className="surv-value-chip">
              {w.servedKw}/{w.askedKw} kW · {w.kept ? `${w.hours} óra` : "leosztva"}
            </span>
          </li>
        ))}
      </ul>
      <p className={`alloc-poka ${sim.triageOk ? "is-ok" : "is-warn"}`}>{sim.note}</p>
      {sim.shedKw > 0 ? <p className="alloc-delay">Leosztott terhelés: {sim.shedKw} kW.</p> : null}
    </div>
  );
}
