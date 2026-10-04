import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  generateEqualDebtSchedule,
  loanFromDebtFields,
  type DebtFrequency,
  type DebtScheduleItem,
  type Loan,
  type LoanStatus,
  type LoanType,
} from "@/lib/finance";
import { formatMoney } from "@/lib/finance";

function typeLabel(t: LoanType) {
  switch (t) {
    case "bank_loan":
      return "Banki tartozás";
    case "personal_loan":
      return "Személyi tartozás";
    case "leasing":
      return "Lízing";
    case "credit_line":
      return "Hitelszerű keret";
    case "shareholder_loan":
      return "Tagi kölcsön";
    case "nav_installment":
      return "NAV részletfizetés";
    case "supplier_debt":
      return "Beszállítói tartozás";
    case "grant_own_contribution":
      return "Pályázati önrész";
    default:
      return "Egyéb kötelezettség";
  }
}

function freqLabel(f: DebtFrequency) {
  switch (f) {
    case "monthly":
      return "Havi részletek";
    case "one_off":
      return "Egyszeri";
    default:
      return "Egyedi ütemezés";
  }
}

function parseNum(s: string) {
  const n = Number(String(s ?? "").replace(/\s+/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function LoanDialog({
  open,
  onOpenChange,
  editing,
  workspaceId,
  workspaceName,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Loan | null;
  workspaceId: string;
  workspaceName: string;
  onSave: (input: Omit<Loan, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [partner, setPartner] = useState("");
  const [type, setType] = useState<LoanType>("nav_installment");
  const [total, setTotal] = useState("");
  const [frequency, setFrequency] = useState<DebtFrequency>("monthly");
  const [startDate, setStartDate] = useState("");
  const [months, setMonths] = useState("6");
  const [schedule, setSchedule] = useState<DebtScheduleItem[]>([]);
  const [status, setStatus] = useState<LoanStatus>("active");
  const [rate, setRate] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name ?? "");
      setPartner(editing.partner_name ?? "");
      setType(editing.type ?? "other");
      setTotal(String(editing.original_amount ?? 0));
      setFrequency(editing.frequency ?? (editing.schedule?.length ? "custom" : "monthly"));
      setStartDate(editing.schedule?.[0]?.due_date ?? editing.due_date ?? new Date().toISOString().slice(0, 10));
      setMonths(String(Math.max(1, editing.schedule?.length || 6)));
      setSchedule(
        Array.isArray(editing.schedule) && editing.schedule.length > 0
          ? editing.schedule.map((r) => ({
              due_date: r.due_date,
              amount: Number(r.amount ?? 0),
              status: r.status === "paid" ? "paid" : "pending",
            }))
          : generateEqualDebtSchedule(
              Number(editing.original_amount ?? 0),
              editing.due_date || new Date().toISOString().slice(0, 10),
              1,
            ).map((r) => ({
              ...r,
              amount: Number(editing.monthly_installment || editing.remaining_principal || editing.original_amount || 0),
            })),
      );
      setStatus(editing.status ?? "active");
      setRate(editing.interest_rate_percent != null ? String(editing.interest_rate_percent) : "");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    setName("");
    setPartner("");
    setType("nav_installment");
    setTotal("");
    setFrequency("monthly");
    setStartDate(today);
    setMonths("6");
    setSchedule([]);
    setStatus("active");
    setRate("");
  }, [open, editing?.id]);

  const regenerate = () => {
    const tot = parseNum(total);
    const m = Math.max(1, Math.round(parseNum(months) || 1));
    const start = /^\d{4}-\d{2}-\d{2}$/.test(startDate) ? startDate : new Date().toISOString().slice(0, 10);
    if (frequency === "one_off") {
      setSchedule([{ due_date: start, amount: Math.round(tot), status: "pending" }]);
      return;
    }
    setSchedule(generateEqualDebtSchedule(tot, start, m));
  };

  useEffect(() => {
    if (!open || editing) return;
    if (!total.trim()) return;
    if (frequency === "custom") return; // manuális sorok védelme
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, total, months, startDate, frequency]);

  const scheduleSum = useMemo(
    () => schedule.reduce((acc, r) => acc + Math.max(0, Number(r.amount ?? 0)), 0),
    [schedule],
  );
  const pendingSum = useMemo(
    () => schedule.filter((r) => r.status !== "paid").reduce((acc, r) => acc + Math.max(0, Number(r.amount ?? 0)), 0),
    [schedule],
  );

  const canSave = name.trim().length > 0 && schedule.length > 0 && parseNum(total) > 0 && Boolean(workspaceId);

  const updateRow = (idx: number, patch: Partial<DebtScheduleItem>) => {
    setSchedule((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    if (frequency === "monthly") setFrequency("custom");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 custom-scrollbar">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Tartozás / kötelezettség szerkesztése" : "Új tartozás / kötelezettség"}
          </DialogTitle>
          <div className="text-[11px] text-muted-foreground">
            Slot: <span className="font-mono text-foreground">{workspaceName}</span> — a tartozás csak ide
            kötődik (workspace izoláció).
          </div>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2.5">
              <Label className="text-muted-foreground">Megnevezés</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                placeholder='pl. "NAV ÁFA Részletfizetés 2026"'
              />
            </div>
            <div className="grid gap-2.5">
              <Label>Partner</Label>
              <Input value={partner} onChange={(e) => setPartner(e.currentTarget.value)} placeholder='pl. "NAV"' />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="grid gap-2.5">
              <Label>Típus</Label>
              <Select value={type} onValueChange={(v) => setType(v as LoanType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "nav_installment",
                      "supplier_debt",
                      "grant_own_contribution",
                      "bank_loan",
                      "personal_loan",
                      "leasing",
                      "credit_line",
                      "shareholder_loan",
                      "other",
                    ] as LoanType[]
                  ).map((t) => (
                    <SelectItem key={t} value={t}>
                      {typeLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2.5">
              <Label>Teljes összeg (Ft)</Label>
              <Input inputMode="decimal" value={total} onChange={(e) => setTotal(e.currentTarget.value)} />
            </div>
            <div className="grid gap-2.5">
              <Label>Gyakoriság</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as DebtFrequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["monthly", "one_off", "custom"] as DebtFrequency[]).map((f) => (
                    <SelectItem key={f} value={f}>
                      {freqLabel(f)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="grid gap-2.5">
              <Label>Kezdő dátum</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.currentTarget.value)} />
            </div>
            <div className="grid gap-2.5">
              <Label>Futamidő (hónap)</Label>
              <Input
                inputMode="numeric"
                value={months}
                disabled={frequency === "one_off"}
                onChange={(e) => setMonths(e.currentTarget.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" className="w-full" onClick={regenerate}>
                Ütemező újragenerálása
              </Button>
            </div>
          </div>

          <div className="rounded-md border border-border/60 bg-background/40">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
              <div className="text-xs font-medium text-slate-200">Részletfizetési ütemezés (szerkeszthető)</div>
              <div className="text-[11px] text-slate-300">
                Összeg:{" "}
                <span className="font-mono text-slate-100">{formatMoney(Math.round(scheduleSum), "HUF")}</span>
                {" · "}
                Hátralévő:{" "}
                <span className="font-mono text-slate-100">{formatMoney(Math.round(pendingSum), "HUF")}</span>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[var(--card-bg)] text-[var(--text-main)] backdrop-blur-md">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">Esedékesség</th>
                    <th className="px-3 py-2 text-left font-medium">Összeg (Ft)</th>
                    <th className="px-3 py-2 text-left font-medium">Státusz</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {schedule.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                        Add meg az összeget és a futamidőt — az ütemező automatikusan kitölti a táblázatot.
                      </td>
                    </tr>
                  ) : (
                    schedule.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-1.5 text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-1.5">
                          <Input
                            type="date"
                            className="h-8"
                            value={row.due_date}
                            onChange={(e) => updateRow(idx, { due_date: e.currentTarget.value })}
                          />
                        </td>
                        <td className="px-3 py-1.5">
                          <Input
                            inputMode="decimal"
                            className="h-8 font-mono"
                            value={String(row.amount)}
                            onChange={(e) => updateRow(idx, { amount: Math.max(0, Math.round(parseNum(e.currentTarget.value))) })}
                          />
                        </td>
                        <td className="px-3 py-1.5">
                          <Select
                            value={row.status}
                            onValueChange={(v) => updateRow(idx, { status: v as "pending" | "paid" })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Függő</SelectItem>
                              <SelectItem value="paid">Fizetve</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border/60 px-3 py-2 text-[11px] text-muted-foreground">
              💡 NAV tipp: generáld a 6 egyenlő sort, majd az utolsó (kerekítő) összeget írd át kézzel.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2.5">
              <Label>Státusz</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as LoanStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktív</SelectItem>
                  <SelectItem value="paid_off">Kiegyenlítve</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2.5">
              <Label>Kamatláb % (opcionális)</Label>
              <Input
                inputMode="decimal"
                value={rate}
                onChange={(e) => setRate(e.currentTarget.value)}
                placeholder="pl. 0"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;
              const rateN = rate.trim() ? parseNum(rate) : null;
              onSave(
                loanFromDebtFields({
                  workspace_id: workspaceId,
                  name: name.trim(),
                  partner_name: partner.trim() || null,
                  type,
                  total_amount: parseNum(total),
                  frequency,
                  schedule,
                  interest_rate_percent: rateN,
                  status,
                }),
              );
              onOpenChange(false);
            }}
          >
            Mentés
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
