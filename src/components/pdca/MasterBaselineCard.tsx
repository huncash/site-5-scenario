import { CollapsibleCard, DetailFold } from "@/components/lean-viz/CollapsibleCard";
import { MASTER_BASELINE_LABEL, type MasterBaselineContext } from "@/lib/masterBaseline";
import { formatHuf } from "@/content/pricing/tiers";

function resourceLines(ctx: MasterBaselineContext) {
  const r = ctx.startingResources;
  const out: string[] = [];
  if (ctx.headcount > 0) out.push(`${ctx.headcount} fő`);
  if (r.stockDays != null) out.push(`${r.stockDays} nap készlet`);
  if (r.energyKwh != null) out.push(`${r.energyKwh.toLocaleString("hu-HU")} kWh`);
  if (r.waterLiters != null) out.push(`${r.waterLiters.toLocaleString("hu-HU")} l víz`);
  if (r.autonomyHours != null) out.push(`${r.autonomyHours} óra autonómia`);
  if (r.cashHuf != null && r.cashHuf > 0) out.push(formatHuf(r.cashHuf));
  return out;
}

export function MasterBaselineCard(props: { context: MasterBaselineContext; specificHint?: string }) {
  const { context: ctx, specificHint } = props;
  const chips = resourceLines(ctx);
  return (
    <CollapsibleCard
      id="master-baseline"
      className="rounded-xl border border-border/60 bg-card/80 p-3"
      title={
        <span>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {MASTER_BASELINE_LABEL}
          </span>
          <span className="mt-0.5 block text-sm font-semibold text-[var(--text-main)]">{ctx.orgLabel}</span>
        </span>
      }
      headerRight={
        ctx.inheritedFrom ? (
          <span className="inline-flex items-center rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-[var(--text-main)]">
            örökölt ← {ctx.inheritedFrom}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-[var(--text-main)]">
            törzs
          </span>
        )
      }
    >
      {chips.length ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <li
              key={c}
              className="inline-flex rounded-md border border-border/50 bg-background px-1.5 py-0.5 text-[11px] text-[var(--text-main)]"
            >
              {c}
            </li>
          ))}
        </ul>
      ) : null}
      <DetailFold id="master-baseline-size" text={ctx.sizeHint} />
      <DetailFold
        id="master-baseline-hint"
        text={
          specificHint ??
          "A törzs adott. Itt csak a szcenárió-specifikus változót mozgatod — méretet és kiinduló készletet nem kell újra megadni."
        }
      />
    </CollapsibleCard>
  );
}
