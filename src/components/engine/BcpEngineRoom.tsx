import { formatCurrency, useI18n } from "@/i18n";
import type { EconomicReadSnapshot } from "@/lib/bcpEconomicOverlay";

export function BcpEngineRoom({
  snapshot,
  compact,
}: {
  snapshot: EconomicReadSnapshot;
  compact?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div
      data-bcp-engine-room="1"
      role="group"
      aria-readonly="true"
      className={
        compact
          ? "rounded-lg border border-rose-500/30 bg-rose-950/20 px-3 py-2"
          : "rounded-xl border border-rose-500/35 bg-rose-950/25 p-3"
      }
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-200/90">
        {t("frame.engineRoomTitle")}
      </div>
      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{t("frame.engineRoomLead")}</p>
      <p className="text-[10px] text-rose-200/70">{t("frame.engineRoomReadOnly")}</p>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">{t("frame.reserveDepth")}</dt>
          <dd className="font-mono tabular-nums text-foreground">{formatCurrency(snapshot.reserveDepthHuf)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("frame.locked")}</dt>
          <dd className="font-mono tabular-nums text-foreground">{formatCurrency(snapshot.lockedHuf)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("frame.opex")}</dt>
          <dd className="font-mono tabular-nums text-foreground">{formatCurrency(snapshot.monthlyOpexHuf)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("frame.runway")}</dt>
          <dd className="font-mono tabular-nums text-foreground">
            {snapshot.runwayMonths == null ? "—" : `${snapshot.runwayMonths.toFixed(1)} ${t("frame.monthUnit")}`}
          </dd>
        </div>
      </dl>
      <ul className="mt-2 space-y-1 text-[11px]">
        {snapshot.costMix.map((row) => (
          <li key={row.id} className="flex items-baseline justify-between gap-2">
            <span className="text-muted-foreground">{row.family}</span>
            <span className="font-mono tabular-nums text-foreground">
              {Math.round(row.share * 100)}% · {formatCurrency(row.huf)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
