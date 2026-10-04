import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatMoney, type Loan, type WorkspaceMeta } from "@/lib/finance";
import {
  REFERENCES_TABS,
  isReferencesTab,
  type ReferencesTabId,
} from "@/lib/referencesNav";
import type {
  HumanResource,
  WorkspaceDuty,
  WorkspacePartner,
  WorkspacePartnerKind,
  WorkspaceSavingBucket,
} from "@/types/workspace";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

type BankAccountLite = { id: string; name: string; iban?: string | null; currency?: string | null };

export type WorkspaceOption = { id: string; label: string };

function cloneMeta(m: WorkspaceMeta): WorkspaceMeta {
  return {
    ...m,
    partners: [...(m.partners ?? [])],
    humanResources: [...(m.humanResources ?? [])],
    workspace_buckets: [...(m.workspace_buckets ?? [])],
    duties: [...(m.duties ?? [])],
    bankAccountIds: [...(m.bankAccountIds ?? [])],
  };
}

export function WorkspaceSettings({
  workspaceId,
  workspaceLabel,
  meta,
  loans,
  bankAccounts,
  activeTab,
  onTabChange,
  highlightIds,
  onBack,
  onPersistMeta,
  onEditLoan,
  onDeleteLoan,
  workspaceOptions,
  onWorkspaceChange,
  showWorkspaceSwitcher = true,
  showBackButton = true,
  showPageTitle = true,
  showTabs = true,
  embedded = false,
  busy = false,
}: {
  workspaceId: string;
  workspaceLabel: string;
  meta: WorkspaceMeta;
  loans: Loan[];
  bankAccounts: BankAccountLite[];
  activeTab: ReferencesTabId;
  onTabChange: (tab: ReferencesTabId) => void;
  highlightIds: string[];
  onBack?: () => void;
  onPersistMeta: (patch: Partial<WorkspaceMeta>, label: string) => void | Promise<void>;
  onEditLoan?: (loan: Loan | null) => void;
  onDeleteLoan?: (loanId: string) => void | Promise<void>;
  workspaceOptions?: WorkspaceOption[];
  onWorkspaceChange?: (workspaceId: string) => void;
  showWorkspaceSwitcher?: boolean;
  showBackButton?: boolean;
  showPageTitle?: boolean;
  showTabs?: boolean;
  embedded?: boolean;
  busy?: boolean;
}) {
  const [draft, setDraft] = useState<WorkspaceMeta>(() => cloneMeta(meta));
  const [dirty, setDirty] = useState(false);
  const [confirm, setConfirm] = useState<null | { title: string; detail: string; run: () => void }>(null);

  useEffect(() => {
    setDraft(cloneMeta(meta));
    setDirty(false);
  }, [meta, workspaceId]);

  const highlightSet = useMemo(() => new Set(highlightIds), [highlightIds]);
  const partners = (draft.partners ?? []) as WorkspacePartner[];
  const hrs = (draft.humanResources ?? []) as HumanResource[];
  const buckets = (draft.workspace_buckets ?? []) as WorkspaceSavingBucket[];
  const duties = (draft.duties ?? []) as WorkspaceDuty[];
  const bankIds = new Set(draft.bankAccountIds ?? []);
  const wsLoans = loans.filter((l) => (l.workspace_id ?? "personal") === workspaceId);

  const mark = (next: WorkspaceMeta) => {
    setDraft(next);
    setDirty(true);
  };

  const ask = (title: string, detail: string, run: () => void) => {
    setConfirm({ title, detail, run });
  };

  const saveAll = () => {
    ask(
      "Biztosan frissíted a törzsadat-kapcsolatot?",
      `Mentés a(z) „${workspaceLabel}” munkatérre (workspace_id: ${workspaceId}).`,
      () => {
        void Promise.resolve(
          onPersistMeta(
            {
              partners: draft.partners ?? [],
              humanResources: draft.humanResources ?? [],
              workspace_buckets: draft.workspace_buckets ?? [],
              duties: draft.duties ?? [],
              bankAccountIds: draft.bankAccountIds ?? [],
              bank_sync_folder: draft.bank_sync_folder ?? null,
            },
            "Törzsadatok mentve",
          ),
        ).then(() => setDirty(false));
      },
    );
  };

  const discard = () => {
    setDraft(cloneMeta(meta));
    setDirty(false);
  };

  const hot = (id: string) =>
    highlightSet.has(id)
      ? "border-amber-500/60 bg-amber-950/30 ring-1 ring-amber-400/40"
      : "border-border/60 bg-background/40";

  const titleText = embedded
    ? `${workspaceLabel} munkatér törzsadatai`
    : "Törzsadatok & Beállítások";

  return (
    <div className={cn("grid gap-6", embedded && "rounded-xl border border-border/60 bg-background/30 p-5")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          {showPageTitle || embedded ? (
            <div>
              <h1 className={cn("font-semibold tracking-tight", embedded ? "text-base" : "text-lg")}>
                {titleText}
              </h1>
              {!embedded ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  References Hub · workspace_id:{" "}
                  <span className="font-mono text-slate-400">{workspaceId}</span>
                </p>
              ) : (
                <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">{workspaceId}</p>
              )}
            </div>
          ) : null}

          {showWorkspaceSwitcher && workspaceOptions && onWorkspaceChange ? (
            <div className="flex flex-col gap-2 sm:max-w-xs">
              <Label className="text-[11px] text-muted-foreground">Slot</Label>
              <Select value={workspaceId} onValueChange={onWorkspaceChange}>
                <SelectTrigger className="h-10 w-full sm:w-[240px]" title="Workspace váltó">
                  <SelectValue placeholder="Válassz Slot / Munkateret" />
                </SelectTrigger>
                <SelectContent>
                  {workspaceOptions.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dirty ? (
                <Badge variant="outline" className="w-fit border-amber-500/40 text-[10px] text-amber-300">
                  Mentetlen
                </Badge>
              ) : null}
            </div>
          ) : dirty ? (
            <Badge variant="outline" className="w-fit border-amber-500/40 text-[10px] text-amber-300">
              Mentetlen
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {dirty ? (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={discard} disabled={busy}>
                Elvetés
              </Button>
              <Button type="button" size="sm" className="gap-2" onClick={saveAll} disabled={busy}>
                <Save className="h-3.5 w-3.5" />
                Mentés
              </Button>
            </>
          ) : null}
          {showBackButton && onBack ? (
            <Button type="button" variant="outline" className="gap-2" onClick={onBack}>
              ◄ Vissza a PDCA nézethez
            </Button>
          ) : null}
        </div>
      </div>

      {showTabs ? (
        <div className="flex flex-col gap-2.5 border-b border-border/60 pb-3 sm:flex-row sm:flex-wrap sm:gap-3">
          {REFERENCES_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={cn(
                "rounded-md px-4 py-2.5 text-left text-xs font-medium transition-all duration-200",
                activeTab === t.id
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}

      {activeTab === "partners" ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm">Partnerek</CardTitle>
                <p className="text-xs text-muted-foreground">Vevők, beszállítók, hatóságok.</p>
              </div>
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1"
                onClick={() => {
                  const row: WorkspacePartner = {
                    id: newId(),
                    kind: "customer",
                    name: "Új partner",
                    tax_id: null,
                    payment_term_days: 30,
                    note: null,
                  };
                  mark({ ...draft, partners: [...partners, row] });
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Hozzáadás
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            {partners.length === 0 ? (
              <div className="text-sm text-muted-foreground">Még nincs partner.</div>
            ) : (
              <ul className="grid gap-3">
                {partners.map((p) => (
                  <li key={p.id} className={cn("rounded-lg border p-4 transition-all duration-200 hover:bg-muted/10", hot(p.id))}>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-[11px]">Név</Label>
                        <Input
                          value={p.name}
                          onChange={(e) =>
                            mark({
                              ...draft,
                              partners: partners.map((x) =>
                                x.id === p.id ? { ...x, name: e.target.value } : x,
                              ),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px]">Típus</Label>
                        <Select
                          value={p.kind}
                          onValueChange={(v) =>
                            mark({
                              ...draft,
                              partners: partners.map((x) =>
                                x.id === p.id ? { ...x, kind: v as WorkspacePartnerKind } : x,
                              ),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Vevő</SelectItem>
                            <SelectItem value="supplier">Beszállító</SelectItem>
                            <SelectItem value="authority">Hatóság (NAV…)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px]">Adószám</Label>
                        <Input
                          value={p.tax_id ?? ""}
                          onChange={(e) =>
                            mark({
                              ...draft,
                              partners: partners.map((x) =>
                                x.id === p.id ? { ...x, tax_id: e.target.value || null } : x,
                              ),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px]">Fizetési határidő (nap)</Label>
                        <Input
                          type="number"
                          value={p.payment_term_days ?? ""}
                          onChange={(e) =>
                            mark({
                              ...draft,
                              partners: partners.map((x) =>
                                x.id === p.id
                                  ? {
                                      ...x,
                                      payment_term_days:
                                        e.target.value === "" ? null : Number(e.target.value),
                                    }
                                  : x,
                              ),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 text-rose-300"
                        onClick={() =>
                          ask("Partner törlése?", `„${p.name}” eltávolítása a törzsadatból.`, () =>
                            mark({ ...draft, partners: partners.filter((x) => x.id !== p.id) }),
                          )
                        }
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Törlés
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {dirty ? (
              <div className="flex justify-end">
                <Button type="button" className="gap-1.5" onClick={saveAll} disabled={busy}>
                  <Save className="h-4 w-4" /> Mentés
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "bank" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bankszámlák & Szinkron</CardTitle>
            <p className="text-xs text-muted-foreground">Csatolt számlák és fájl-import mappa.</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-[11px]">Banki szinkron mappa</Label>
              <Input
                value={draft.bank_sync_folder ?? ""}
                placeholder="pl. C:\\Bank\\Kivonatok"
                onChange={(e) => mark({ ...draft, bank_sync_folder: e.target.value || null })}
              />
            </div>
            <ul className="grid gap-3">
              {bankAccounts.length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  Nincs bankszámla a profilban — add hozzá a Beállítások → Bankszámlák fülön.
                </li>
              ) : (
                bankAccounts.map((ba) => {
                  const on = bankIds.has(ba.id);
                  return (
                    <li
                      key={ba.id}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-2 rounded-lg border p-4 transition-all duration-200 hover:bg-muted/10",
                        hot(ba.id),
                      )}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{ba.name}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {ba.iban || ba.id}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={on ? "default" : "outline"}
                        className="h-8"
                        onClick={() => {
                          const next = on
                            ? (draft.bankAccountIds ?? []).filter((id) => id !== ba.id)
                            : [...(draft.bankAccountIds ?? []), ba.id];
                          mark({ ...draft, bankAccountIds: next });
                        }}
                      >
                        {on ? "Csatolva" : "Csatolás"}
                      </Button>
                    </li>
                  );
                })
              )}
            </ul>
            {dirty ? (
              <div className="flex justify-end">
                <Button type="button" className="gap-1.5" onClick={saveAll} disabled={busy}>
                  <Save className="h-4 w-4" /> Mentés
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "resources" ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm">Munkavállalók & Erőforrások</CardTitle>
                <p className="text-xs text-muted-foreground">Díjszabás és fix költségek.</p>
              </div>
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1"
                onClick={() => {
                  const row: HumanResource = {
                    id: newId(),
                    name: "Új erőforrás",
                    role: "alvállalkozó",
                    type: "subcontractor_ev",
                    defaultRate: 0,
                    fixedCost: 0,
                  };
                  mark({ ...draft, humanResources: [...hrs, row] });
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Hozzáadás
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            {hrs.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nincs humán erőforrás.</div>
            ) : (
              <ul className="grid gap-3">
                {hrs.map((h) => (
                  <li key={h.id} className={cn("rounded-lg border p-4 transition-all duration-200 hover:bg-muted/10", hot(h.id))}>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        value={h.name}
                        onChange={(e) =>
                          mark({
                            ...draft,
                            humanResources: hrs.map((x) =>
                              x.id === h.id ? { ...x, name: e.target.value } : x,
                            ),
                          })
                        }
                      />
                      <Input
                        value={h.role}
                        onChange={(e) =>
                          mark({
                            ...draft,
                            humanResources: hrs.map((x) =>
                              x.id === h.id ? { ...x, role: e.target.value } : x,
                            ),
                          })
                        }
                      />
                      <div className="space-y-2">
                        <Label className="text-[11px]">Díjszabás (HUF)</Label>
                        <Input
                          type="number"
                          value={h.defaultRate}
                          onChange={(e) =>
                            mark({
                              ...draft,
                              humanResources: hrs.map((x) =>
                                x.id === h.id ? { ...x, defaultRate: Number(e.target.value) || 0 } : x,
                              ),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px]">Fix költség (HUF)</Label>
                        <Input
                          type="number"
                          value={h.fixedCost ?? 0}
                          onChange={(e) =>
                            mark({
                              ...draft,
                              humanResources: hrs.map((x) =>
                                x.id === h.id ? { ...x, fixedCost: Number(e.target.value) || 0 } : x,
                              ),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 text-rose-300"
                        onClick={() =>
                          ask("Erőforrás törlése?", `„${h.name}” eltávolítása.`, () =>
                            mark({
                              ...draft,
                              humanResources: hrs.filter((x) => x.id !== h.id),
                            }),
                          )
                        }
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Törlés
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {dirty ? (
              <div className="flex justify-end">
                <Button type="button" className="gap-1.5" onClick={saveAll} disabled={busy}>
                  <Save className="h-4 w-4" /> Mentés
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "buckets" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Megtakarítási Alhalmazok & Ügyeletek</CardTitle>
            <p className="text-xs text-muted-foreground">Célösszegek, prioritások, ügyeleti költségek.</p>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-slate-300">Perselyek</div>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => {
                    const row: WorkspaceSavingBucket = {
                      id: newId(),
                      name: "Új persely",
                      target_amount: 0,
                      priority: buckets.length + 1,
                    };
                    mark({ ...draft, workspace_buckets: [...buckets, row] });
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Hozzáadás
                </Button>
              </div>
              {buckets.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nincs workspace-persely.</div>
              ) : (
                <ul className="grid gap-3">
                  {buckets.map((b) => (
                    <li key={b.id} className={cn("rounded-lg border p-4 transition-all duration-200 hover:bg-muted/10", hot(b.id))}>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                          value={b.name}
                          onChange={(e) =>
                            mark({
                              ...draft,
                              workspace_buckets: buckets.map((x) =>
                                x.id === b.id ? { ...x, name: e.target.value } : x,
                              ),
                            })
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Célösszeg"
                          value={b.target_amount ?? ""}
                          onChange={(e) =>
                            mark({
                              ...draft,
                              workspace_buckets: buckets.map((x) =>
                                x.id === b.id
                                  ? {
                                      ...x,
                                      target_amount:
                                        e.target.value === "" ? null : Number(e.target.value),
                                    }
                                  : x,
                              ),
                            })
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Prioritás"
                          value={b.priority ?? ""}
                          onChange={(e) =>
                            mark({
                              ...draft,
                              workspace_buckets: buckets.map((x) =>
                                x.id === b.id
                                  ? {
                                      ...x,
                                      priority: e.target.value === "" ? null : Number(e.target.value),
                                    }
                                  : x,
                              ),
                            })
                          }
                        />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 text-rose-300"
                          onClick={() =>
                            ask("Persely törlése?", `„${b.name}” eltávolítása.`, () =>
                              mark({
                                ...draft,
                                workspace_buckets: buckets.filter((x) => x.id !== b.id),
                              }),
                            )
                          }
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Törlés
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-slate-300">Ügyeletek</div>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => {
                    const row: WorkspaceDuty = {
                      id: newId(),
                      name: "Új ügyelet",
                      cadence: "havi",
                      fixed_cost_huf: 0,
                    };
                    mark({ ...draft, duties: [...duties, row] });
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Hozzáadás
                </Button>
              </div>
              {duties.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nincs ügyelet.</div>
              ) : (
                <ul className="grid gap-3">
                  {duties.map((d) => (
                    <li key={d.id} className={cn("rounded-lg border p-4 transition-all duration-200 hover:bg-muted/10", hot(d.id))}>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                          value={d.name}
                          onChange={(e) =>
                            mark({
                              ...draft,
                              duties: duties.map((x) =>
                                x.id === d.id ? { ...x, name: e.target.value } : x,
                              ),
                            })
                          }
                        />
                        <Input
                          value={d.cadence ?? ""}
                          placeholder="ütem"
                          onChange={(e) =>
                            mark({
                              ...draft,
                              duties: duties.map((x) =>
                                x.id === d.id ? { ...x, cadence: e.target.value || null } : x,
                              ),
                            })
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Fix költség"
                          value={d.fixed_cost_huf ?? ""}
                          onChange={(e) =>
                            mark({
                              ...draft,
                              duties: duties.map((x) =>
                                x.id === d.id
                                  ? {
                                      ...x,
                                      fixed_cost_huf:
                                        e.target.value === "" ? null : Number(e.target.value),
                                    }
                                  : x,
                              ),
                            })
                          }
                        />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 text-rose-300"
                          onClick={() =>
                            ask("Ügyelet törlése?", `„${d.name}” eltávolítása.`, () =>
                              mark({ ...draft, duties: duties.filter((x) => x.id !== d.id) }),
                            )
                          }
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Törlés
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {dirty ? (
              <div className="flex justify-end">
                <Button type="button" className="gap-1.5" onClick={saveAll} disabled={busy}>
                  <Save className="h-4 w-4" /> Mentés
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "debts" ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle className="text-sm">Tartozások & Pályázati Önrészek</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Mentés a LoanDialog „Mentés” gombjával — workspace: {workspaceId}
              </p>
            </div>
            {onEditLoan ? (
              <Button type="button" size="sm" className="h-8" onClick={() => onEditLoan(null)}>
                + Új tartozás
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            {wsLoans.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nincs tartozás ezen a munkatéren.</div>
            ) : (
              <ul className="grid gap-3">
                {wsLoans.map((l) => (
                  <li
                    key={l.id}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-2 rounded-lg border p-4 transition-all duration-200 hover:bg-muted/10",
                      hot(l.id),
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium">{l.name}</span>
                        {l.partner_name ? (
                          <Badge variant="secondary" className="text-[10px]">
                            {l.partner_name}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Fennálló:{" "}
                        <span className="font-mono text-slate-200">
                          {formatMoney(Math.round(Number(l.remaining_principal ?? 0)))}
                        </span>
                        {l.frequency ? ` · ${l.frequency}` : ""}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {onEditLoan ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => onEditLoan(l)}
                        >
                          Szerkesztés
                        </Button>
                      ) : null}
                      {onDeleteLoan ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 text-rose-300"
                          onClick={() =>
                            ask(
                              "Tartozás törlése?",
                              `„${l.name}” végleg törlődik a(z) ${workspaceId} munkatérről.`,
                              () => void onDeleteLoan(l.id),
                            )
                          }
                        >
                          Törlés
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={Boolean(confirm)} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirm?.title ?? "Megerősítés"}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-slate-300">{confirm?.detail}</div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirm(null)}>
              Mégse
            </Button>
            <Button
              type="button"
              onClick={() => {
                const fn = confirm?.run;
                setConfirm(null);
                if (fn) fn();
              }}
            >
              Igen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function parseReferencesTab(raw: unknown): ReferencesTabId {
  const s = String(raw ?? "");
  return isReferencesTab(s) ? s : "partners";
}
