import { GlossaryLabel } from "@/components/HelpIcon";
import { type MasterBaselineContext } from "@/lib/masterBaseline";
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
    <section className="rounded-xl border border-border/60 bg-card/80 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {MASTER_BASELINE_LABEL}
          </p>
          <h3 className="mt-0.5 text-sm font-semibold text-foreground">{ctx.orgLabel}</h3>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{ctx.sizeHint}</p>
        </div>
        {ctx.inheritedFrom ? (
          <span className="inline-flex items-center rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-muted-foreground">
            örökölt ← {ctx.inheritedFrom}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-muted-foreground">
            törzs
          </span>
        )}
      </div>
      {chips.length ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <li
              key={c}
              className="inline-flex rounded-md border border-border/50 bg-background px-1.5 py-0.5 text-[11px] text-foreground"
            >
              {c}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        {specificHint ??
          "A törzs adott. Itt csak a szcenárió-specifikus változót mozgatod — méretet és kiinduló készletet nem kell újra megadni."}
      </p>
    </section>
  );
}
