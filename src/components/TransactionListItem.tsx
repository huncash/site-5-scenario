import { Edit3, GripVertical, PiggyBank, Trash2 } from "lucide-react";
import type { Transaction, TxnType } from "@/lib/finance";
import { displayTxnLabel, formatMoney } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HelpIcon } from "@/components/HelpIcon";
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

export function TransactionListItem({
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
  onGrip,
  onEdit,
  onPiggy,
  onDelete,
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
  onGrip?: (e: React.PointerEvent) => void;
  onEdit: () => void;
  onPiggy: () => void;
  onDelete: () => void;
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
  const canAssignPiggy = (t.type === "income" || t.type === "saving") && Number(t.amount) > 0;
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
    <li className="flex items-center gap-4 py-3 transition-all duration-200 hover:bg-muted/20">
      <button
        type="button"
        onPointerDown={onGrip}
        className={cn(
          "flex h-9 w-9 shrink-0 touch-none items-center justify-center rounded-md text-muted-foreground transition-all duration-200",
          onGrip ? "cursor-grab hover:bg-muted hover:text-foreground active:cursor-grabbing" : "cursor-default opacity-40",
        )}
        aria-label="Húzás"
        title={onGrip ? "Húzd a ládák között" : "Húzás nem elérhető itt"}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {categoryLabel(t.category)} · {dateStr}
          {showWorkspaceBadge && (
            <span
              className={cn(
                "ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium opacity-90",
                wsCls,
              )}
              title={`Slot: ${wsLabel}`}
            >
              {wsLabel}
            </span>
          )}
          {t.type === "saving" && bucketName?.(t.bucket_id) && (
            <span className="ml-2 inline-block rounded bg-[color:var(--color-chart-2)]/15 px-1.5 py-0.5 text-[10px] text-[color:var(--color-chart-2)]">
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
            <span
              className="ml-2 inline-block rounded bg-[color:var(--color-chart-6)]/15 px-1.5 py-0.5 text-[10px] text-[color:var(--color-chart-6)]"
              title="Belső átvezetés (tagi)"
            >
              belső átvezetés
            </span>
          )}
          {loanRepay && (
            <span
              className="ml-2 inline-block rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300"
              title="Hitel törlesztés / tőke-visszagörgetés"
            >
              törlesztés
            </span>
          )}
          {st !== "actual" && (
            <span
              className={cn(
                "ml-2 inline-block rounded px-1.5 py-0.5 text-[10px]",
                st === "planned"
                  ? "bg-amber-500/15 text-amber-300"
                  : "bg-amber-500/15 text-amber-200",
              )}
              title={st === "planned" ? "Tervezett tétel" : "Lekötött tétel"}
            >
              {st === "planned" ? "tervezett" : "lekötött"}
            </span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5 font-mono text-xs tabular-nums">
        <span className={cn("text-sm font-bold", amountClass)}>
          {t.type === "income" ? "+" : t.type === "expense" ? "−" : ""}
          {formatMoney(Math.round(gross), currency)}
        </span>
        <span className="text-[11px] text-slate-300">
          {businessMode ? `nettó: ${formatMoney(Math.round(net), currency)}` : "\u00A0"}
          {hasEur ? (
            <Badge variant="secondary" className="ml-2 text-[10px] font-normal">
              EUR {eur.toFixed(2)} @ {rate.toFixed(0)}
            </Badge>
          ) : null}
        </span>
      </div>

      <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Szerkesztés" title="Szerkesztés" className="h-8 w-8">
        <Edit3 className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={canAssignPiggy ? onPiggy : undefined}
        disabled={!canAssignPiggy}
        aria-label="Persely"
        title={
          canAssignPiggy
            ? "Félretétel / Persely"
            : "💡 Megtakarítási lehetőség: a perselyt pozitív tételeknél használhatod (bevétel/megtakarítás), így célokra és tartalékra tudsz félretenni."
        }
        className={cn(
          "text-sky-400",
          !canAssignPiggy && "opacity-30 cursor-not-allowed",
        )}
      >
        <PiggyBank className="h-4 w-4" />
      </Button>
      <HelpIcon kbId="piggy-expense-disabled" />
      <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Törlés" title="Törlés">
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}

