import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { PRICING_ALIGN_GRID_FIXED } from "@/components/home/pricingLayout";
import { cn } from "@/lib/utils";
import {
  EDGE_JIT_HUF,
  ENTERPRISE_CASE_JIT_HUF,
  PUBLIC_JIT_ROWS,
  buildAllPlanLego,
  formatNetHuf,
  formatPct,
  optionAPayFor,
  optionBUpdateFor,
  type LegoPlanId,
  type PlanLegoRow,
} from "@/lib/private/pricingLegoMatrix";

const COLS = buildAllPlanLego();

function Money({ n, className }: { n: number; className?: string }) {
  return <span className={cn("tabular-nums", className)}>{formatNetHuf(n)}</span>;
}

function PlanHead({ row }: { row: PlanLegoRow }) {
  return (
    <div
      className={cn(
        "px-3 py-2 text-[13px] font-semibold text-foreground lg:px-4",
        row.recommended && "rounded-t-xl bg-amber-500/[0.08]",
      )}
    >
      {row.label}
      {row.recommended ? (
        <span className="ml-1.5 text-[10px] font-medium text-amber-200">Ajánlott</span>
      ) : null}
      {row.id === "expert" ? (
        <span className="ml-1.5 inline-flex">
          <Badge variant="outline" className="text-[10px] font-medium">
            Egyedi egyeztetés
          </Badge>
        </span>
      ) : null}
    </div>
  );
}

function GridRow({
  label,
  cells,
  emphasize,
}: {
  label: string;
  cells: ReactNode[];
  emphasize?: boolean;
}) {
  return (
    <div className="contents">
      <div
        className={cn(
          "border-t border-white/10 px-1 py-2.5 text-[12px] font-medium text-foreground lg:px-0",
          emphasize && "font-semibold",
        )}
      >
        {label}
      </div>
      {COLS.map((row, i) => (
        <div
          key={`${label}:${row.id}`}
          className={cn(
            "border-t border-white/10 px-3 py-2.5 text-[12px] leading-snug text-foreground lg:px-4",
            row.recommended && "bg-amber-500/[0.06]",
            emphasize && "font-semibold tabular-nums",
          )}
        >
          {cells[i]}
        </div>
      ))}
    </div>
  );
}

function LegoCompareGrid() {
  return (
    <div className="overflow-x-auto">
      <div className={cn(PRICING_ALIGN_GRID_FIXED, "min-w-[720px] lg:min-w-0")}>
        <div className="px-1 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground lg:px-0">
          Keret / ár
        </div>
        {COLS.map((row) => (
          <PlanHead key={row.id} row={row} />
        ))}

        <GridRow
          emphasize
          label="1. Csomag szumma — örök licenc, 1. évi alapdíj"
          cells={COLS.map((r) => <Money key={r.id} n={r.y1} />)}
        />
        <GridRow
          label="2. év frissítés (−25%)"
          cells={COLS.map((r) => <Money key={r.id} n={r.y2} className="text-muted-foreground" />)}
        />
        <GridRow
          label="3. év frissítés (−40%)"
          cells={COLS.map((r) => <Money key={r.id} n={r.y3} className="text-muted-foreground" />)}
        />
        <GridRow
          emphasize
          label="3 év szumma (Y4-től 0)"
          cells={COLS.map((r) => <Money key={r.id} n={r.sum3y} />)}
        />

        {(["cases", "slots", "seats", "guests"] as const).map((key) => (
          <GridRow
            key={key}
            label={COLS[0]!.lines.find((l) => l.key === key)!.labelHu}
            cells={COLS.map((r) => {
              const line = r.lines.find((l) => l.key === key)!;
              return (
                <div key={r.id}>
                  <div>
                    {line.qty} × <Money n={line.unitHuf} className="text-muted-foreground" />
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    = <Money n={line.lineHuf} />
                  </div>
                </div>
              );
            })}
          />
        ))}

        <GridRow
          emphasize
          label="Legó listaáron (ha csak modulokból)"
          cells={COLS.map((r) => <Money key={r.id} n={r.legoListHuf} />)}
        />
        <GridRow
          label="Csomag előnye a legóhoz képest"
          cells={COLS.map((r) => (
            <div key={r.id}>
              <Money n={r.bundleGapListHuf} />
              <div className="mt-0.5 text-[11px] text-emerald-300/90">{formatPct(r.bundleGapListPct)}</div>
            </div>
          ))}
        />
        <GridRow
          label="Kapacitás duplázása modulokból"
          cells={COLS.map((r) => (
            <div key={r.id}>
              <Money n={r.doubleBillHuf} />
              {r.doubleBillHuf !== r.doubleListHuf ? (
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  lista <Money n={r.doubleListHuf} />
                </div>
              ) : null}
            </div>
          ))}
        />
        <GridRow
          label="2 teljes csomag · csak Y1"
          cells={COLS.map((r) => <Money key={r.id} n={r.twoPackY1} />)}
        />
        <GridRow
          label="1 csomag 3 év + duplázó modulok"
          cells={COLS.map((r) => <Money key={r.id} n={r.own3yPlusDoubleBill} />)}
        />
        <GridRow
          label="2 teljes csomag · 3 év"
          cells={COLS.map((r) => <Money key={r.id} n={r.twoPack3y} />)}
        />
        <GridRow
          label="Duplázás vs. 2× Y1"
          cells={COLS.map((r) => {
            const delta = r.doubleBillHuf - r.twoPackY1;
            const cheaper = delta < 0;
            return (
              <div key={r.id} className={cheaper ? "text-emerald-300" : "text-rose-300"}>
                {cheaper ? "modul olcsóbb" : "2 csomag olcsóbb"}{" "}
                <Money n={Math.abs(delta)} />
              </div>
            );
          })}
        />
      </div>
    </div>
  );
}

function AddonStrip() {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {PUBLIC_JIT_ROWS.map((a) => (
        <div key={a.id} className="rounded-lg border border-border/50 bg-card px-3 py-2 text-[12px]">
          <div className="font-medium text-foreground">{a.labelHu}</div>
          <div className="mt-0.5 tabular-nums text-muted-foreground">
            {formatNetHuf(a.priceHuf)} nettó, örökös
          </div>
          {a.id === "case_plus_1" ? (
            <div className="mt-1 text-[10px] text-muted-foreground">
              Enterprise Case JIT: {formatNetHuf(ENTERPRISE_CASE_JIT_HUF)}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function SwotGrid() {
  const cells: { title: string; body: string }[] = [
    {
      title: "Erősség",
      body: "A bővítő egyszeri és örökös: a vevő ugyanazt a tulajdonosi ígéretet kapja, mint a csomagra. Nincs „bérelt slot”, ami lejár. A csomag mindig olcsóbb, mint a benne lévő kapacitás listaáras legója — a belépő racionális.",
    },
    {
      title: "Gyengeség",
      body: "A modulbevétel egyszeri. Enterprise-nál a kapacitás duplázása modulokból drágább, mint két Y1 licenc. Ha a tokenek összefésülhetők lennének, a csomag kijátszható.",
    },
    {
      title: "Lehetőség",
      body: "A Basic/Pro vevő a saját instance-én olcsóbban skáláz modulból, mint második csomagból — bent marad egy licencben. Az Edge külön, nem keveredik a kvótába.",
    },
    {
      title: "Fenyegetés",
      body: "Két Enterprise token olcsóbb, mint egy duplázott. Ha a mesh összeér, a listaár erodál. Éves előfizetéses modul a márka ellen menne, és új churn-felületet nyitna.",
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cells.map((c) => (
        <article key={c.title} className="rounded-xl border border-white/12 bg-card p-4">
          <h3 className="text-[13px] font-semibold text-foreground">{c.title}</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{c.body}</p>
        </article>
      ))}
    </div>
  );
}

function PokaYoke() {
  const rules = [
    "JIT csak fizetett alapszinthez (demo/guest nem vásárol).",
    "Két licenc tokenje nem adódik össze egy Case-ben — nincs fúzió.",
    "A kvóta egyidejű éles asztal, nem archív tétel. Felülírás díj nélkül.",
    "Listaáras legó > csomagár minden nyilvános szinten (rekonstrukciós zár).",
    "Kosár-zár: Extra Case 49k + Extra Slot 49k + Seat 79k + Edge 99k halmozása soha ne legyen olcsóbb a következő csomag listaáránál (Basic → Pro → Enterprise). Küszöbnél a rendszer a kedvezőbb csomagot ajánlja.",
    "Vendégfiók olvas; szerkesztő ír. A vendég nem nyit checkoutot.",
    "Enterprise Case JIT 39k, a többi modul listaáron — a Case a skálázási szelep.",
  ];
  return (
    <ul className="mt-3 space-y-2 text-[12px] leading-snug text-foreground">
      {rules.map((line) => (
        <li key={line} className="flex gap-2">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/80" aria-hidden />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function ScenarioCards() {
  const ids: LegoPlanId[] = ["starter", "pro", "expert"];
  const a = ids.map(optionAPayFor);
  const b = ids.map(optionBUpdateFor);
  const label = (id: LegoPlanId) => COLS.find((r) => r.id === id)!.label;

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-stretch">
      <article className="flex h-full min-w-0 flex-col rounded-xl border border-amber-300/50 bg-card p-4">
        <h3 className="text-base font-semibold">Opció A · Örök használat + 1 év frissítés</h3>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          Egyszeri listaár, vagy 2 egyenlő részlet 60 napon belül. A szoftver hátraléknál nem zár.
        </p>
        <ul className="mt-4 flex-1 space-y-2 text-[12px]">
          {a.map((row) => (
            <li key={row.id}>
              <span className="font-medium">{label(row.id)}</span>
              <div className="tabular-nums text-muted-foreground">
                egyszeri {formatNetHuf(row.lump)}
              </div>
              <div className="tabular-nums">
                2× {formatNetHuf(row.parts[0])} / {row.dueDays} nap
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Nincs havi előfizetés. A 2. részlet a 60. napon esedékes.
        </p>
      </article>

      <article className="flex h-full min-w-0 flex-col rounded-xl border border-sky-400/40 bg-card p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Opció B · Y2+ éves frissítés</h3>
          <Badge>Opcionális</Badge>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          Nem kötelező kiegészítés a meglévő örök licenc mellé. Y4-től 0.
        </p>
        <ul className="mt-4 flex-1 space-y-2 text-[12px]">
          {b.map((row) => (
            <li key={row.id}>
              <span className="font-medium">{label(row.id)}</span>
              <div className="tabular-nums text-muted-foreground">
                2. év {formatNetHuf(row.y2)} · 3. év {formatNetHuf(row.y3)} · 4+ {formatNetHuf(row.y4)}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Aki nem veszi, az Y1 verzióval örökre használja a szoftvert.
        </p>
      </article>
    </div>
  );
}

export function PricingLegoPanel() {
  return (
    <section id="lego-matrix" className="scroll-mt-24 space-y-6 border-t border-border/60 pt-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Termék- és upsell mátrix
        </div>
        <h2 className="mt-1 text-lg font-semibold leading-snug">Csomag vs. modul-legó — ugyanaz a felület</h2>
        <p className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
          Három alapmotor (Gazdasági, Oktatási, BCP) ugyanabban a Case / Slot keretben. Nettó listaár,
          örökös modul. Az 1. sor a csomag Y1 szummája. Alatta a bent lévő case / slot / szerkesztő /
          vendégfiók darabszáma és az, mennyi lenne, ha ugyanezt csak bővítőkből raknád össze. Az Edge
          ({formatNetHuf(EDGE_JIT_HUF)}) nem kvóta: külön adatgyűjtő. Extra Case lista 49 000 Ft,
          Enterprise Case JIT 39 000 Ft.
        </p>
      </div>

      <LegoCompareGrid />
      <AddonStrip />

      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Basic és Pro: a kapacitás duplázása egy instance-en olcsóbb, mint két Y1 csomag. Enterprise: két
        Y1 olcsóbb, mint a modulos duplázás — ezért a tokenek nem fésülhetők össze.
      </p>

      <div>
        <h2 className="text-lg font-semibold">Poka-Yoke és SWOT</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Egyszeri bővítő vs. örök csomag — fejlesztő, üzemeltető, CEO.
        </p>
        <PokaYoke />
        <div className="mt-4">
          <SwotGrid />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Két pillér — mért modell</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Y1 100% (örök + 1 év frissítés) · opcionális Y2 75% · Y3 60% · Y4+ 0. Nincs havi előfizetés.
        </p>
        <ScenarioCards />
      </div>
    </section>
  );
}
