import { useI18n } from "@/i18n";

/** Kahn → modern integrált Magán/Core/Projekt narratíva a főoldalon. */
export function KahnEvolvePanel() {
  const { t } = useI18n();
  return (
    <div className="my-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h3 className="mb-2 text-lg font-semibold text-slate-100">{t("door.kahnEvolveTitle")}</h3>
      <p className="mb-4 text-sm leading-relaxed text-slate-300">{t("door.kahnEvolveLead")}</p>
      <div
        className="mb-4 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-4"
        aria-hidden
      >
        <svg viewBox="0 0 360 120" className="mx-auto h-24 w-full max-w-md text-slate-500">
          <path
            d="M40 60 H120 M120 60 L180 28 M120 60 L180 92 M180 28 H260 M180 92 H260"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="40" cy="60" r="10" className="fill-slate-800 stroke-slate-500" strokeWidth="1.5" />
          <circle cx="120" cy="60" r="10" className="fill-slate-800 stroke-slate-500" strokeWidth="1.5" />
          <circle cx="180" cy="28" r="9" fill="none" stroke="var(--pro-opt)" strokeWidth="1.8" />
          <circle cx="180" cy="92" r="9" fill="none" stroke="var(--pro-pess)" strokeWidth="1.8" />
          <circle cx="260" cy="28" r="8" fill="var(--pro-opt)" fillOpacity="0.35" stroke="var(--pro-opt)" strokeWidth="1.4" />
          <circle cx="260" cy="92" r="8" fill="var(--pro-pess)" fillOpacity="0.35" stroke="var(--pro-pess)" strokeWidth="1.4" />
          <text x="180" y="28" textAnchor="middle" dominantBaseline="central" fill="var(--pro-opt)" fontSize="10" fontWeight="600">
            O
          </text>
          <text x="120" y="60" textAnchor="middle" dominantBaseline="central" fill="var(--pro-real)" fontSize="10" fontWeight="600">
            R
          </text>
          <text x="180" y="92" textAnchor="middle" dominantBaseline="central" fill="var(--pro-pess)" fontSize="10" fontWeight="600">
            P
          </text>
        </svg>
      </div>
      <div className="grid grid-cols-1 gap-4 text-xs text-slate-400 min-w-0 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
          <span className="mb-1 block font-medium text-red-400">{t("door.kahnEvolveLimitTitle")}</span>
          {t("door.kahnEvolveLimitBody")}
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
          <span className="mb-1 block font-medium text-emerald-400">{t("door.kahnEvolveSolveTitle")}</span>
          {t("door.kahnEvolveSolveBody")}
        </div>
      </div>
    </div>
  );
}
