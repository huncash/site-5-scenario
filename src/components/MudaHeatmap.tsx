import { useMemo, useState } from "react";

import { LeanTerm } from "@/components/HelpIcon";
import { cn } from "@/lib/utils";
import { categoryLabel, formatMoney, txnDayIso, type Transaction } from "@/lib/finance";

type HeatCell = {
  dateIso: string; // YYYY-MM-DD
  day: number; // 1..31
  inMonth: boolean;
  totalExpense: number;
  wantsExpense: number;
  mudaExpense: number;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// Monday=0 .. Sunday=6
function dowMon0(d: Date) {
  const js = d.getDay(); // Sun=0..Sat=6
  return (js + 6) % 7;
}

function deriveExpenseType(t: Transaction): "FIX_NEED" | "VARIABLE_NEED" | "WANT" | "INVESTMENT" | null {
  const et = (t as any).expense_type as any;
  if (et === "FIX_NEED" || et === "VARIABLE_NEED" || et === "WANT" || et === "INVESTMENT") return et;
  const c = String(t.category ?? "");
  if (t.type === "saving" || c === "savings") return "INVESTMENT";
  if (t.type !== "expense") return null;
  if (c === "utilities" || c === "housing" || c === "loan_repayment") return "FIX_NEED";
  if (c === "food" || c === "health" || c === "transport") return "VARIABLE_NEED";
  if (c === "entertainment" || c === "shopping" || c === "education") return "WANT";
  if (c === "uncategorized" || c === "other") return "WANT";
  return "VARIABLE_NEED";
}

function mudaType(t: Transaction): string {
  return String((t as any).muda_type ?? "NONE");
}

export function MudaHeatmap({
  txns,
  className,
  title = "Muda & mikro-szivárgás hőtérkép",
  selectedDayIso,
  onSelectDay,
  amountOf,
}: {
  txns: Transaction[];
  className?: string;
  title?: string;
  selectedDayIso?: string | null;
  onSelectDay?: (dayIso: string | null) => void;
  amountOf?: (t: Transaction) => number;
}) {
  const [cursorMonth, setCursorMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { cells, maxExpense, monthLabel } = useMemo(() => {
    const monthStart = startOfMonth(cursorMonth);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    // grid: 6 weeks * 7 days
    const firstDow = dowMon0(monthStart);
    const gridStart = addDays(monthStart, -firstDow);
    const gridDays = 6 * 7;

    const byDay = new Map<string, { total: number; wants: number; muda: number }>();
    for (const t of txns) {
      if (t.type !== "expense") continue;
      const iso = txnDayIso(t.occurred_at);
      if (!iso) continue;
      const dt = new Date(`${iso}T00:00:00`);
      if (dt < monthStart || dt > monthEnd) continue;

      const a = Math.max(0, amountOf ? amountOf(t) : Number(t.amount ?? 0));
      const et = deriveExpenseType(t);
      const mt = mudaType(t);
      const wants = et === "WANT" ? a : 0;
      const muda = mt !== "NONE" ? a : 0;
      const cur = byDay.get(iso) ?? { total: 0, wants: 0, muda: 0 };
      cur.total += a;
      cur.wants += wants;
      cur.muda += muda;
      byDay.set(iso, cur);
    }

    let maxExpense = 0;
    const out: HeatCell[] = [];
    for (let i = 0; i < gridDays; i++) {
      const d = addDays(gridStart, i);
      const iso = ymd(d);
      const inMonth = d.getMonth() === monthStart.getMonth() && d.getFullYear() === monthStart.getFullYear();
      const day = d.getDate();
      const agg = byDay.get(iso) ?? { total: 0, wants: 0, muda: 0 };
      maxExpense = Math.max(maxExpense, agg.total);
      out.push({
        dateIso: iso,
        day,
        inMonth,
        totalExpense: agg.total,
        wantsExpense: agg.wants,
        mudaExpense: agg.muda,
      });
    }

    const monthLabel = monthStart.toLocaleString("hu-HU", { year: "numeric", month: "long" });
    return { cells: out, maxExpense, monthLabel };
  }, [amountOf, cursorMonth, txns]);

  const weekdays = [
    { short: "H", full: "Hétfő" },
    { short: "K", full: "Kedd" },
    { short: "Sze", full: "Szerda" },
    { short: "Cs", full: "Csütörtök" },
    { short: "P", full: "Péntek" },
    { short: "Szo", full: "Szombat" },
    { short: "V", full: "Vasárnap" },
  ];
  const selected = cells.find((c) => c.dateIso === selectedDayIso) ?? null;
  const dayTxns = useMemo(() => {
    if (!selectedDayIso) return [];
    return txns
      .filter((t) => t.type === "expense" && txnDayIso(t.occurred_at) === selectedDayIso)
      .sort((a, b) => Math.abs(Number(b.amount ?? 0)) - Math.abs(Number(a.amount ?? 0)));
  }, [selectedDayIso, txns]);

  return (
    <div
      className={cn(
        "card-module rounded-xl border border-emerald-400/20 bg-emerald-950/10 p-2.5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <LeanTerm
          className="text-xs uppercase tracking-wide text-emerald-200/90"
          title={title}
          exact="A nap színe a napi kiadás. Rózsaszín pont = vágy, piros pont = veszteség."
        >
          {title}
        </LeanTerm>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-border bg-[var(--dropdown-hover)] px-2 py-1 text-[11px] text-[var(--text-main)] hover:bg-[var(--accent-color)] hover:text-white"
            onClick={() => {
              onSelectDay?.(null);
              setCursorMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
            }}
            title="Előző hónap"
          >
            ←
          </button>
          <div className="min-w-[140px] text-center text-[11px] text-slate-200">{monthLabel}</div>
          <button
            type="button"
            className="rounded-md border border-border bg-[var(--dropdown-hover)] px-2 py-1 text-[11px] text-[var(--text-main)] hover:bg-[var(--accent-color)] hover:text-white"
            onClick={() => {
              onSelectDay?.(null);
              setCursorMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
            }}
            title="Következő hónap"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-slate-300">
        <div className="flex items-center gap-1" data-exact="A cella zöldje a napi összes kiadás nagysága a hónap maximumához képest.">
          <span className="inline-block h-2 w-2 rounded-sm bg-emerald-400/40" /> költési intenzitás
        </div>
        <div className="flex items-center gap-1" data-exact="vágy — nem kötelező kiadás ezen a napon.">
          <span className="inline-block h-2 w-2 rounded-full bg-pink-400/70" /> WANT nap
        </div>
        <div className="flex items-center gap-1" data-exact="veszteség — pazarlás, impulzus vagy felesleges tétel ezen a napon.">
          <span className="inline-block h-2 w-2 rounded-full bg-rose-400/90" /> MUDA nap
        </div>
      </div>

      <div className="mt-2 w-fit max-w-[280px] mx-auto">
        <div className="grid grid-cols-7 gap-1 text-[10px] text-slate-400">
          {weekdays.map((w) => (
            <div key={w.short} className="w-5 text-center sm:w-6" data-exact={w.full} title={w.full}>
              {w.short}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((c) => {
            const intensity = maxExpense > 0 ? c.totalExpense / maxExpense : 0;
            const alpha = c.inMonth ? 0.1 + intensity * 0.5 : 0.06;
            const hasLeak = c.wantsExpense > 0 || c.mudaExpense > 0;
            const leakStrength = c.mudaExpense > 0 ? "ring-2 ring-rose-400/60" : "";
            const wantStrength = c.wantsExpense > 0 ? "ring-1 ring-pink-400/35" : "";
            const isSelected = Boolean(selectedDayIso) && selectedDayIso === c.dateIso;
            const dayLabel = new Date(`${c.dateIso}T00:00:00`).toLocaleDateString("hu-HU", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            });
            const exact = [
              dayLabel,
              `Összes kiadás: ${formatMoney(Math.round(c.totalExpense))}`,
              `Vágy: ${formatMoney(Math.round(c.wantsExpense))}`,
              `Veszteség: ${formatMoney(Math.round(c.mudaExpense))}`,
            ].join("\n");

            return (
              <button
                key={c.dateIso}
                className={cn(
                  "relative flex h-5 w-5 items-center justify-center rounded-md border border-slate-800/60 text-[10px] tabular-nums",
                  "sm:h-6 sm:w-6",
                  c.inMonth ? "text-slate-200" : "text-slate-500/60",
                  hasLeak ? cn(wantStrength, leakStrength) : "",
                  isSelected ? "ring-2 ring-cyan-400/70" : "",
                  c.inMonth ? "cursor-pointer hover:border-slate-600/80" : "cursor-default opacity-60",
                )}
                style={{
                  backgroundColor: `rgba(16, 185, 129, ${alpha})`,
                }}
                data-exact={exact}
                title={exact}
                aria-label={exact.replace(/\n/g, " · ")}
                disabled={!c.inMonth}
                onClick={() => {
                  const next = selectedDayIso === c.dateIso ? null : c.dateIso;
                  onSelectDay?.(next);
                }}
              >
                {c.day}
                {c.mudaExpense > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-rose-400/90" />
                ) : c.wantsExpense > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-pink-400/70" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {selected ? (
        <div
          className="mt-2 rounded-md border border-cyan-400/30 bg-slate-950/50 px-2 py-1.5 text-[11px] text-slate-100"
          data-exact={`${new Date(`${selected.dateIso}T00:00:00`).toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}\nÖsszes kiadás: ${formatMoney(Math.round(selected.totalExpense))}\nVágy: ${formatMoney(Math.round(selected.wantsExpense))}\nVeszteség: ${formatMoney(Math.round(selected.mudaExpense))}`}
        >
          <div className="font-medium text-cyan-100">
            {new Date(`${selected.dateIso}T00:00:00`).toLocaleDateString("hu-HU", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
          <div className="mt-0.5 grid grid-cols-3 gap-1 font-mono text-[10px]">
            <span>Kiadás {formatMoney(Math.round(selected.totalExpense))}</span>
            <span>Want {formatMoney(Math.round(selected.wantsExpense))}</span>
            <span>Muda {formatMoney(Math.round(selected.mudaExpense))}</span>
          </div>
          {dayTxns.length ? (
            <ul className="mt-1.5 grid gap-1">
              {dayTxns.map((t) => {
                const a = Math.max(0, amountOf ? amountOf(t) : Number(t.amount ?? 0));
                const muda = String((t as { muda_type?: string }).muda_type ?? "NONE") !== "NONE";
                return (
                  <li key={t.id} className="flex items-start justify-between gap-2 font-mono text-[10px]">
                    <span className="min-w-0 whitespace-normal break-words text-slate-200">
                      {t.title?.trim() || t.note?.trim() || categoryLabel(t.category)}
                      <span className="block text-slate-400">{categoryLabel(t.category)}</span>
                    </span>
                    <span className={cn("shrink-0 tabular-nums", muda ? "text-rose-300" : "text-slate-200")}>
                      {formatMoney(Math.round(a))}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-[10px] text-slate-500">Vidd fölé vagy kattints egy napra: kiírja a dátumot és az összegeket.</p>
      )}
    </div>
  );
}

