import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ProfileHeader } from "@/components/ProfileHeader";
import { LoanDialog } from "@/components/LoanDialog";
import { WorkspaceSettings, parseReferencesTab } from "@/components/WorkspaceSettings";
import { Button } from "@/components/ui/button";
import { useReferencesNav } from "@/hooks/useReferencesNav";
import { decryptJSON, encryptJSON } from "@/lib/crypto";
import {
  EMPTY_SETTINGS,
  type CustomSettings,
  type Loan,
  type WorkspaceMeta,
} from "@/lib/finance";
import { localdb } from "@/lib/localdb";
import {
  consumeReferencesHighlightIds,
  isReferencesTab,
  type ReferencesTabId,
} from "@/lib/referencesNav";
import { useVault } from "@/lib/vault";
import {
  isDemoSegmentId,
  sanitizeVisitorWorkspaces,
  segmentIdFromDemoName,
} from "@/lib/demoSeed";
import { isDemoProfileName } from "@/lib/demoSession";
import { denyShowcaseWrite } from "@/lib/versionPolicy";

function truthyFlag(v: unknown): boolean {
  const s = String(v ?? "").toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

export const Route = createFileRoute("/references")({
  component: ReferencesPage,
  validateSearch: (s: Record<string, unknown>) => {
    const tabRaw = String(s.tab ?? "partners");
    const tab = isReferencesTab(tabRaw) ? tabRaw : ("partners" as ReferencesTabId);
    const wsRaw = String(s.workspace ?? "personal");
    const workspace =
      wsRaw === "__all" || wsRaw === "all" || wsRaw === "szumma" ? "__all" : wsRaw || "personal";
    return {
      profile: String(s.profile ?? ""),
      workspace,
      tab,
      highlight: s.highlight != null ? String(s.highlight) : undefined,
      isSzumma: truthyFlag(s.isSzumma) || workspace === "__all",
    };
  },
});

function ReferencesPage() {
  const { state } = useVault();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const qc = useQueryClient();
  const { backToPreviousView } = useReferencesNav();

  const unlocked = state.status === "unlocked" ? state : null;
  const profileId = unlocked?.profile.id ?? search.profile;
  const profileName = unlocked?.profile.name ?? "Profil";
  const vaultKey = unlocked?.key ?? null;

  const isSzumma = Boolean(search.isSzumma);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [loanOpen, setLoanOpen] = useState(false);
  const [loanEditing, setLoanEditing] = useState<Loan | null>(null);
  const [loanWorkspaceId, setLoanWorkspaceId] = useState<string>("personal");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fromSession = consumeReferencesHighlightIds();
    const ids = new Set<string>(fromSession);
    if (search.highlight) ids.add(search.highlight);
    setHighlightIds(Array.from(ids));
  }, [search.highlight, search.tab, search.workspace]);

  const settingsQ = useQuery({
    queryKey: ["settings"],
    enabled: Boolean(vaultKey),
    queryFn: async (): Promise<CustomSettings> => {
      const row = await localdb.getSettings();
      if (!row || !vaultKey) return EMPTY_SETTINGS;
      try {
        const s = await decryptJSON<Partial<CustomSettings>>(vaultKey, row.data_enc);
        return {
          ...EMPTY_SETTINGS,
          ...s,
          incomeCategories: s.incomeCategories ?? [],
          expenseCategories: s.expenseCategories ?? [],
          buckets: s.buckets ?? [],
          recurring: s.recurring ?? [],
          plannedOneOff: s.plannedOneOff ?? [],
          usageTemplates: s.usageTemplates ?? [],
          usageEvents: s.usageEvents ?? [],
          locations: s.locations ?? [],
          projects: s.projects ?? [],
          assets: s.assets ?? [],
          workspaces: s.workspaces ?? [],
        };
      } catch {
        return EMPTY_SETTINGS;
      }
    },
  });

  const loansQ = useQuery({
    queryKey: ["loans"],
    enabled: Boolean(vaultKey),
    queryFn: async (): Promise<Loan[]> => {
      if (!vaultKey) return [];
      const rows = await localdb.listLoans();
      const out: Loan[] = [];
      for (const r of rows) {
        try {
          const p = await decryptJSON<Omit<Loan, "id">>(vaultKey, r.data_enc);
          out.push({ id: r.id, ...p });
        } catch {
          /* skip */
        }
      }
      return out;
    },
  });

  const banksQ = useQuery({
    queryKey: ["bank_accounts"],
    enabled: Boolean(vaultKey),
    queryFn: async () => {
      const rows = await localdb.listBankAccounts();
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        iban: r.iban ?? null,
        currency: r.currency ?? "HUF",
      }));
    },
  });

  const settings = settingsQ.data ?? EMPTY_SETTINGS;
  const visitorSegmentId = useMemo(() => {
    const raw = (settings as any)?.__demo?.segmentId;
    const trimmed = typeof raw === "string" ? raw.trim() : "";
    if (trimmed && isDemoSegmentId(trimmed)) return trimmed;
    return segmentIdFromDemoName(profileName);
  }, [profileName, settings]);
  const visitorWorkspaces = useMemo(() => {
    const existing = settings.workspaces ?? [];
    if (!visitorSegmentId && !isDemoProfileName(profileName)) return existing;
    if (!visitorSegmentId) return existing;
    return sanitizeVisitorWorkspaces(existing, visitorSegmentId);
  }, [profileName, settings.workspaces, visitorSegmentId]);

  const workspaceOptions = useMemo(() => {
    const map = new Map<string, string>();
    map.set("personal", "Magán");
    for (const w of visitorWorkspaces) {
      if (!w?.id || w.id === "personal") continue;
      map.set(w.id, w.alias?.trim() || w.id);
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [visitorWorkspaces]);

  const stackedIds = useMemo(() => {
    if (!isSzumma) return [] as string[];
    return workspaceOptions.map((w) => w.id);
  }, [isSzumma, workspaceOptions]);

  const activeWorkspaceId = isSzumma
    ? "__all"
    : search.workspace === "__all"
      ? "personal"
      : search.workspace || "personal";

  const resolveMeta = useCallback(
    (workspaceId: string): WorkspaceMeta => {
      const found = visitorWorkspaces.find((w) => w.id === workspaceId);
      if (found) return found;
      return {
        id: workspaceId,
        type: workspaceId === "personal" ? "personal" : "business",
        alias: workspaceId === "personal" ? "Magán" : null,
      };
    },
    [visitorWorkspaces],
  );

  const labelOf = useCallback(
    (id: string) => workspaceOptions.find((w) => w.id === id)?.label ?? (id === "personal" ? "Magán" : id),
    [workspaceOptions],
  );

  const persistMetaFor = useCallback(
    async (workspaceId: string, patch: Partial<WorkspaceMeta>, label: string) => {
      if (denyShowcaseWrite(Boolean(visitorSegmentId) || isDemoProfileName(profileName))) return;
      if (!vaultKey) {
        toast.error("A profil zárva van.");
        return;
      }
      setBusy(true);
      try {
        const base = visitorWorkspaces;
        const prev = resolveMeta(workspaceId);
        const exists = base.some((w) => w.id === workspaceId);
        const merged: WorkspaceMeta = { ...prev, ...patch, id: workspaceId };
        const nextWs = exists
          ? base.map((w) => (w.id === workspaceId ? merged : w))
          : [...base, merged];
        const next: CustomSettings = { ...settings, workspaces: nextWs };
        const data_enc = await encryptJSON(vaultKey, next);
        await localdb.putSettings(data_enc);

        // Bank mapping sync (workspace isolation)
        if (Array.isArray(patch.bankAccountIds)) {
          const want = new Set(patch.bankAccountIds);
          const maps = await localdb.listBankAccountWorkspaces();
          for (const m of maps) {
            if (m.workspace_id !== workspaceId) continue;
            if (!want.has(m.bank_account_id)) {
              await localdb.setBankAccountWorkspaceMapping({
                bank_account_id: m.bank_account_id,
                workspace_id: workspaceId,
                enabled: false,
              });
            }
          }
          for (const baId of want) {
            await localdb.setBankAccountWorkspaceMapping({
              bank_account_id: baId,
              workspace_id: workspaceId,
              enabled: true,
            });
          }
          await qc.invalidateQueries({ queryKey: ["bank_account_workspaces"] });
        }

        await qc.invalidateQueries({ queryKey: ["settings"] });
        toast.success(`${label} · ${labelOf(workspaceId)}`);
      } catch (e: any) {
        toast.error(e?.message || "Mentés sikertelen.");
      } finally {
        setBusy(false);
      }
    },
    [vaultKey, settings, visitorWorkspaces, resolveMeta, qc, labelOf, visitorSegmentId, profileName],
  );

  const upsertLoan = useCallback(
    async (input: { id?: string; payload: Omit<Loan, "id">; workspaceId: string }) => {
      if (denyShowcaseWrite(Boolean(visitorSegmentId) || isDemoProfileName(profileName))) return;
      if (!vaultKey) return;
      setBusy(true);
      try {
        const id = input.id ?? crypto.randomUUID();
        const data_enc = await encryptJSON(vaultKey, {
          ...input.payload,
          workspace_id: input.workspaceId,
        });
        await localdb.putLoan({ id, profile_id: profileId, data_enc });
        await qc.invalidateQueries({ queryKey: ["loans"] });
        toast.success(input.id ? "Tartozás frissítve" : "Tartozás létrehozva");
        setLoanOpen(false);
        setLoanEditing(null);
      } catch (e: any) {
        toast.error(e?.message || "Tartozás mentése sikertelen.");
      } finally {
        setBusy(false);
      }
    },
    [vaultKey, profileId, qc, visitorSegmentId, profileName],
  );

  const deleteLoan = useCallback(
    async (loanId: string) => {
      if (denyShowcaseWrite(Boolean(visitorSegmentId) || isDemoProfileName(profileName))) return;
      setBusy(true);
      try {
        await localdb.deleteLoan(loanId);
        await qc.invalidateQueries({ queryKey: ["loans"] });
        toast.success("Tartozás törölve");
      } catch (e: any) {
        toast.error(e?.message || "Törlés sikertelen.");
      } finally {
        setBusy(false);
      }
    },
    [qc, visitorSegmentId, profileName],
  );

  const setTab = (tab: ReferencesTabId) => {
    navigate({ search: (prev) => ({ ...prev, tab }) });
  };

  const setWorkspace = (workspaceId: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        workspace: workspaceId,
        isSzumma: false,
      }),
    });
  };

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Betöltés…
      </div>
    );
  }
  if (!unlocked || !vaultKey) {
    return <Navigate to="/" />;
  }

  const activeTab = parseReferencesTab(search.tab);
  const loans = loansQ.data ?? [];
  const bankAccounts = banksQ.data ?? [];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <ProfileHeader profileId={profileId} profileName={profileName} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 px-6 py-6">
          {isSzumma ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">Szumma — Törzsadatok</h1>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Összes aktív munkatér törzsadata egymás alatt (stacked).
                  </p>
                </div>
                <Button type="button" variant="outline" className="gap-2" onClick={backToPreviousView}>
                  ◄ Vissza a PDCA nézethez
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-border/60 pb-2">
                {(
                  [
                    ["partners", "Partnerek"],
                    ["bank", "Bank"],
                    ["resources", "Erőforrások"],
                    ["buckets", "Perselyek"],
                    ["debts", "Tartozások"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={
                      activeTab === id
                        ? "rounded-md bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary"
                        : "rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/40"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="grid gap-6">
                {stackedIds.map((wsId) => (
                  <WorkspaceSettings
                    key={wsId}
                    embedded
                    showPageTitle
                    showTabs={false}
                    showBackButton={false}
                    showWorkspaceSwitcher={false}
                    workspaceId={wsId}
                    workspaceLabel={labelOf(wsId)}
                    meta={resolveMeta(wsId)}
                    loans={loans}
                    bankAccounts={bankAccounts}
                    activeTab={activeTab}
                    onTabChange={setTab}
                    highlightIds={highlightIds}
                    busy={busy}
                    onPersistMeta={(patch, label) => persistMetaFor(wsId, patch, label)}
                    onEditLoan={(loan) => {
                      setLoanWorkspaceId(wsId);
                      setLoanEditing(loan);
                      setLoanOpen(true);
                    }}
                    onDeleteLoan={deleteLoan}
                  />
                ))}
              </div>
            </>
          ) : (
            <WorkspaceSettings
              workspaceId={activeWorkspaceId}
              workspaceLabel={labelOf(activeWorkspaceId)}
              meta={resolveMeta(activeWorkspaceId)}
              loans={loans}
              bankAccounts={bankAccounts}
              activeTab={activeTab}
              onTabChange={setTab}
              highlightIds={highlightIds}
              onBack={backToPreviousView}
              busy={busy}
              workspaceOptions={workspaceOptions}
              onWorkspaceChange={setWorkspace}
              showWorkspaceSwitcher
              onPersistMeta={(patch, label) => persistMetaFor(activeWorkspaceId, patch, label)}
              onEditLoan={(loan) => {
                setLoanWorkspaceId(activeWorkspaceId);
                setLoanEditing(loan);
                setLoanOpen(true);
              }}
              onDeleteLoan={deleteLoan}
            />
          )}
        </div>
      </main>

      <LoanDialog
        open={loanOpen}
        onOpenChange={(o) => {
          setLoanOpen(o);
          if (!o) setLoanEditing(null);
        }}
        editing={loanEditing}
        workspaceId={loanWorkspaceId}
        workspaceName={labelOf(loanWorkspaceId)}
        onSave={(payload) => {
          void upsertLoan({
            id: loanEditing?.id,
            workspaceId: loanWorkspaceId,
            payload: { ...payload, workspace_id: loanWorkspaceId },
          });
        }}
      />
    </div>
  );
}
