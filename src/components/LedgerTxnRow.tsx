import { useMemo } from "react";
import { Edit3, PiggyBank } from "lucide-react";
import type { Transaction, TxnType } from "@/lib/finance";
import { displayTxnLabel, formatMoney } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { channelBadgeClass, channelLabel, detectTransactionChannel } from "@/lib/transactionChannel";

function isLoanRepaymentCategory(c: string) {
  return c === "loan_repayment" || c === "PÉNZÜGYI KIADÁSOK: Hitel törlesztés";
}

function amountColor(input: { type: TxnType; internal: boolean; isLoanRepayment: boolean; status: string | null }) {
  if (input.status && input.status !== "actual") return "text-amber-400";
  if (input.isLoanRepayment) return "text-amber-400";
  if (input.internal) return "text-sky-400";
  return input.type === "income" ? "text-emerald-400" : input.type === "saving" ? "text-sky-400" : "text-rose-400";
}

export function LedgerTxnRow({
  t,
  currency,
  businessMode,
  txnNetHuf,
  txnGrossHuf,
  categoryLabel,
  bucketName,
  showWorkspaceBadge,
  workspaceLabel,
  workspaceBadgeClass,
  checked,
  onCheckedChange,
  onEdit,
  onPiggy,
}: {
  t: Transaction;
  currency: string;
  businessMode: boolean;
  txnNetHuf: (t: Transaction) => number;
  txnGrossHuf: (t: Transaction) => number;
  categoryLabel: (c: string) => string;
  bucketName?: (id?: string | null) => string | null;
  showWorkspaceBadge?: boolean;
  workspaceLabel?: (workspaceId: string) => string;
  workspaceBadgeClass?: (workspaceId: string) => string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  onEdit: () => void;
  onPiggy: () => void;
}) {
  const dateStr = new Date(t.occurred_at).toLocaleDateString("hu-HU");
  const title = displayTxnLabel(t);
  const net = businessMode ? txnNetHuf(t) : Number(t.amount);
  const gross = businessMode ? txnGrossHuf(t) : Number(t.amount);
  const eur = Number(t.eur_amount ?? 0);
  const rate = Number(t.eur_rate ?? 0);
  const hasEur = eur > 0 && rate > 0;
  const internal =
    (t.internal_transfer_kind ?? null) === "member_loan_out" ||
    (t.internal_transfer_kind ?? null) === "member_loan_repay";
  const st = (t.status ?? "actual") as "planned" | "committed" | "actual";
  const loanRepay = Boolean(t.loan_id) || isLoanRepaymentCategory(String(t.category ?? ""));
  const ws = (t.workspace ?? "personal") as string;
  const wsLabel = (workspaceLabel ? workspaceLabel(ws) : ws === "personal" ? "Magán" : ws) ?? ws;
  const wsCls = workspaceBadgeClass ? workspaceBadgeClass(ws) : "bg-slate-500/15 text-slate-200 border-slate-500/30";

  const canPiggy = useMemo(() => (t.type === "income" || t.type === "saving") && Number(t.amount) > 0, [t.amount, t.type]);
  const piggyActive = t.type === "saving" && Boolean(t.bucket_id);
  const showPiggy = t.type !== "expense" && Number(t.amount) > 0;
  const amountClass = amountColor({ type: t.type, internal, isLoanRepayment: loanRepay, status: st });
  const showSrc =
    typeof window !== "undefined" && (() => {
      try {
        return localStorage.getItem("ui:showTxnSourceBadges") === "1";
      } catch {
        return false;
      }
    })();

  return (
    <li className="grid grid-cols-[auto_1fr_9rem_3.5rem_3.5rem] items-center gap-4 py-3 transition-all duration-200 hover:bg-muted/20 sm:grid-cols-[auto_1fr_11rem_3.5rem_3.5rem]">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(Boolean(v))}
        aria-label="Kijelölés"
        className="border-slate-500 data-[state=checked]:bg-slate-200 data-[state=checked]:text-slate-900"
      />

      <div className="min-w-0 pr-2">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {categoryLabel(t.category)} · {dateStr}
          {showWorkspaceBadge && (
            <span
              className={cn(
                "ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium opacity-90",
                wsCls,
              )}
              title={`Munkaterület: ${wsLabel}`}
            >
              {wsLabel}
            </span>
          )}
          {t.type === "saving" && bucketName?.(t.bucket_id) && (
            <span className="ml-2 inline-block rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] text-sky-300">
              {bucketName(t.bucket_id)}
            </span>
          )}
          {t.bank_raw_id && (
            <span
              className={cn(
                "ml-2 inline-block rounded border px-1.5 py-0.5 text-[10px]",
                channelBadgeClass(detectTransactionChannel(String([t.note ?? "", t.title ?? "", t.party ?? ""].filter(Boolean).join(" ")).trim())),
              )}
              title="Nyers banki import"
            >
              {channelLabel(
                detectTransactionChannel(String([t.note ?? "", t.title ?? "", t.party ?? ""].filter(Boolean).join(" ")).trim()),
                t.type,
              )}
            </span>
          )}
          {showSrc && !t.bank_raw_id ? (
            <span
              className="ml-2 inline-block rounded border border-slate-500/30 bg-slate-500/10 px-1.5 py-0.5 text-[10px] text-slate-200"
              title="Kézi rögzítés (nincs banki forrás)"
            >
              ✍️ Kézi
            </span>
          ) : null}
          {internal && (
            <span className="ml-2 inline-block rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] text-sky-300" title="Belső átvezetés">
              átvezetés
            </span>
          )}
          {loanRepay && (
            <span className="ml-2 inline-block rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300" title="Hitel törlesztés">
              törlesztés
            </span>
          )}
          {st !== "actual" && (
            <span
              className={cn("ml-2 inline-block rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300")}
              title={st === "planned" ? "Tervezett" : "Lekötött"}
            >
              {st === "planned" ? "tervezett" : "lekötött"}
            </span>
          )}
        </p>
      </div>

      <div className="w-[9rem] justify-self-end text-right font-mono text-xs tabular-nums whitespace-nowrap sm:w-[11rem]">
        <span className={cn("block text-sm font-bold leading-5", amountClass)}>
          {t.type === "income" ? "+" : t.type === "expense" ? "−" : ""}
          {formatMoney(Math.round(gross), currency)}
        </span>
        <span className="block text-[11px] leading-4 text-slate-300">
          {businessMode ? `nettó: ${formatMoney(Math.round(net), currency)}` : "\u00A0"}
          {hasEur ? (
            <Badge variant="secondary" className="ml-2 text-[10px] font-normal">
              EUR {eur.toFixed(2)} @ {rate.toFixed(0)}
            </Badge>
          ) : null}
        </span>
      </div>

      <div className="justify-self-end whitespace-nowrap">
        <Button
          size="icon"
          variant="ghost"
          onClick={onEdit}
          aria-label="Szerkesztés"
          title="Szerkesztés"
          className="shrink-0"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="justify-self-end whitespace-nowrap">
        {showPiggy ? (
          <Button
            size="icon"
            variant="ghost"
            onClick={canPiggy ? onPiggy : undefined}
            disabled={!canPiggy}
            aria-label="Persely"
            title={piggyActive ? "Perselyhez rendelve" : "Félretétel / Persely"}
            className={cn(
              "shrink-0",
              piggyActive ? "text-sky-400" : "text-slate-400 hover:text-sky-300",
              !canPiggy && "opacity-40",
            )}
          >
            <PiggyBank className="h-4 w-4" fill={piggyActive ? "currentColor" : "none"} />
          </Button>
        ) : null}
      </div>
    </li>
  );
}

