import { formatCurrency, useI18n } from "@/i18n";
import { BCP_BEST_PRACTICE, compareEconomicToBcp } from "@/lib/bcpPracticeDelta";
import type { EconomicReadSnapshot } from "@/lib/bcpEconomicOverlay";

function fmt(value: number | null, unit: string | null): string {
  if (value == null || !unit) return "—";
  if (unit === "Ft" || unit === "Ft/hó") return `${formatCurrency(value)}`;
  const digits = value < 10 ? 1 : 0;
  return `${value.toLocaleString("hu-HU", { maximumFractionDigits: digits })} ${unit}`;
}

export function BcpPracticeDelta({ snapshot }: { snapshot: EconomicReadSnapshot }) {
  const { t } = useI18n();
  const { delta } = compareEconomicToBcp(snapshot);
  return (
    <section
      data-bcp-practice-delta="1"
      className="rounded-xl border border-rose-500/25 bg-card/70 px-3 py-2.5"
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-200/90">
        {t("frame.bcpPracticeTitle")}
      </div>
      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
        {t("frame.bcpPracticeLead", { name: BCP_BEST_PRACTICE.labelHu })}
      </p>
      <ul className="mt-2 space-y-1.5">
        {delta.map((row) => (
          <li
            key={row.id}
            className="grid grid-cols-[1fr_auto] gap-x-2 rounded-md border border-rose-500/15 bg-rose-950/15 px-2 py-1.5 text-[11px]"
          >
            <div>
              <div className="font-medium text-foreground">{row.labelHu}</div>
              <div className="text-[10px] text-muted-foreground">{t("frame.bcpDelta")}</div>
            </div>
            <div className="text-right font-mono tabular-nums">
              <div className="text-muted-foreground">{fmt(row.economicValue, row.economicUnit)}</div>
              <div className="text-foreground">{fmt(row.bcpValue, row.bcpUnit)}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
