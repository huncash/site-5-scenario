import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Upload, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { ProfileHeader } from "@/components/ProfileHeader";
import { HelpIcon } from "@/components/HelpIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { decryptJSON, encryptJSON } from "@/lib/crypto";
import { useVault } from "@/lib/vault";
import { purgeDemoGeneratedDataForActiveProfile } from "@/lib/demoSeed";
import { denyShowcaseWrite, SETTINGS_FOCUS_DEMO_RESET } from "@/lib/versionPolicy";
import { localdb, type BankAccountRow, type BankAccountWorkspaceRow, type BankRawRow, type SnapshotRow } from "@/lib/localdb";
import type { CategoryRuleRow } from "@/lib/localdb";
import { useMeshRepository } from "@/lib/mesh/meshRepository";
import { suggestFromRules, applySuggestion } from "@/lib/categoryRules";
import { analyzePersonalBankQuality } from "@/lib/personalBankDataQuality";
import type { RealEstateProperty, RealEstatePropertyType } from "@/types/workspace";
import {
  computeVatSplit,
  EMPTY_SETTINGS,
  type CustomSettings,
  type TxnType,
  type WorkspaceMeta,
  type WorkspaceScenario,
  type WorkspaceType,
} from "@/lib/finance";
import { sha256Hex } from "@/lib/hash";
import { bankCapacityToast, checkBankAccountsForSlot } from "@/lib/bankCapacity";

type SettingsTabId = "accounts" | "workspaces" | "categories" | "rules" | "backup" | "danger" | "all";
const SETTINGS_TABS: Array<{ id: SettingsTabId; label: string }> = [
  { id: "accounts", label: "💳 Bankszámlák & Profilok" },
  { id: "workspaces", label: "📁 Slotok & Projektek" },
  { id: "categories", label: "🏷️ Kategóriák" },
  { id: "rules", label: "⚡ Besorolási Szabályok" },
  { id: "backup", label: "💾 Mentés & Helyreállítás" },
  { id: "danger", label: "⚠️ Veszélyes Zóna" },
  { id: "all", label: "🌐 Összes beállítás" },
];

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  validateSearch: (s: Record<string, unknown>) => {
    const raw = String(s.tab ?? "");
    const tab = SETTINGS_TABS.some((t) => t.id === raw) ? (raw as SettingsTabId) : undefined;
    return {
      profile: String(s.profile ?? ""),
      tab,
      focus: s.focus != null ? String(s.focus) : undefined,
    };
  },
});

type BankCsvRow = {
  accountRef: string;
  bookingDateIso: string;
  valueDateIso: string;
  amountSigned: number;
  currency: string;
  direction: "T" | "J" | string;
  bookingText: string;
  message: string;
  partner: string;
  partnerAccount: string;
};

const FinanceVaultDumpSchema = z.object({
  dump_version: z.literal(1),
  exported_at: z.string().optional(),
  db_name: z.string().optional(),
  db_version: z.number().optional(),
  stores: z.object({
    profiles: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        salt: z.string(),
        verifier: z.string(),
        created_at: z.string(),
      }),
    ),
    transactions: z.array(
      z.object({
        id: z.string(),
        profile_id: z.string(),
        type: z.union([z.literal("income"), z.literal("expense"), z.literal("saving")]),
        occurred_at: z.string(),
        data_enc: z.string(),
      }),
    ),
    goals: z.array(
      z.object({
        id: z.string(),
        profile_id: z.string(),
        deadline: z.string(),
        is_active: z.boolean(),
        created_at: z.string(),
        data_enc: z.string(),
      }),
    ),
    settings: z.array(
      z.object({
        profile_id: z.string(),
        data_enc: z.string(),
      }),
    ),
    loans: z
      .array(
      z.object({
        id: z.string(),
        profile_id: z.string(),
        data_enc: z.string(),
      }),
    )
      .optional(),
    bank_raw: z.array(
      z.object({
        id: z.string(),
        profile_id: z.string(),
        workspace: z.string(),
        bank_account_id: z.string().nullable().optional(),
        account_ref: z.string().nullable().optional(),
        ingested_at: z.string(),
        booking_date_iso: z.string(),
        value_date_iso: z.string(),
        amount_signed: z.number(),
        currency: z.string(),
        booking_text: z.string(),
        message: z.string(),
        partner: z.string(),
        partner_account: z.string(),
        source_file: z.string().nullable().optional(),
      }),
    ),
    bank_accounts: z.array(
      z.object({
        id: z.string(),
        profile_id: z.string(),
        name: z.string(),
        iban: z.string(),
        currency: z.string(),
        bank_type: z.string(),
        created_at: z.string(),
        updated_at: z.string(),
      }),
    ),
    bank_account_workspaces: z.array(
      z.object({
        id: z.string(),
        profile_id: z.string(),
        bank_account_id: z.string(),
        workspace_id: z.string(),
        created_at: z.string(),
      }),
    ),
    snapshots: z
      .array(
        z.object({
          id: z.string(),
          profile_id: z.string(),
          created_at: z.string(),
          label: z.string(),
          data_enc: z.string(),
        }),
      )
      .optional(),
  }),
});

function fnv1a32Hex(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function parseHuDateToIso(raw: string): string | null {
  const s = raw.trim();
  const m = /^(\d{4})\.(\d{2})\.(\d{2})\.$/.exec(s) ?? /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(s);
  if (!m) return null;
  const [, y, mo, d] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d)).toISOString();
}

function parseHuCorporateStatementCsv(content: string): BankCsvRow[] {
  const lines = content.split(/\r?\n/).map((l) => l.trimEnd()).filter(Boolean);
  const headerIdx = lines.findIndex((l) => l.startsWith("Számlaazonosító;"));
  if (headerIdx < 0) return [];

  const out: BankCsvRow[] = [];
  for (const line of lines.slice(headerIdx + 1)) {
    const cols = line.split(";");
    if (cols.length < 12) continue;
    const accountRef = (cols[0] ?? "").trim();
    const bookingDateIso = parseHuDateToIso(cols[3] ?? "") ?? new Date().toISOString();
    const valueDateIso = parseHuDateToIso(cols[4] ?? "") ?? bookingDateIso;
    const amountSigned = Number(String(cols[5] ?? "").replace(/\s+/g, "").replace(",", "."));
    if (!Number.isFinite(amountSigned) || amountSigned === 0) continue;
    out.push({
      accountRef,
      bookingDateIso,
      valueDateIso,
      amountSigned,
      currency: (cols[6] ?? "").trim() || "HUF",
      direction: ((cols[7] ?? "").trim() as any) || "",
      bookingText: (cols[8] ?? "").trim(),
      message: (cols[9] ?? "").trim(),
      partner: (cols[10] ?? "").trim(),
      partnerAccount: (cols[11] ?? "").trim(),
    });
  }
  return out;
}

function normAccount(s: string) {
  return (s ?? "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

function guessVatTreatmentFromBankRow(
  r: BankCsvRow,
): { treatment: "hu_gross" | "no_vat" | "reverse_charge" | "foreign"; review: boolean } {
  const hay = `${r.bookingText} ${r.message} ${r.partner} ${r.partnerAccount}`.toLowerCase();
  if (hay.includes("nav") || hay.includes("adó") || hay.includes("afa") || hay.includes("áfa"))
    return { treatment: "no_vat", review: false };
  if (hay.includes("jutal") || hay.includes("jut:") || hay.includes("sms szolg") || hay.includes("díj"))
    return { treatment: "no_vat", review: false };
  if (hay.includes("kamat")) return { treatment: "no_vat", review: false };
  if (hay.includes("transferwise") || hay.includes("wise") || hay.includes("paypal"))
    return { treatment: "foreign", review: true };
  if (hay.includes("kártya")) return { treatment: "foreign", review: true };
  const ibanPrefix = (r.partnerAccount || "").trim().toUpperCase().slice(0, 2);
  if (ibanPrefix === "HU") return { treatment: "hu_gross", review: false };
  if (/^[A-Z]{2}$/.test(ibanPrefix)) return { treatment: "reverse_charge", review: true };
  return { treatment: "hu_gross", review: true };
}

function guessBusinessCategoryFromBankRow(r: BankCsvRow): string {
  const hay = `${r.bookingText} ${r.message} ${r.partner}`.toLowerCase();
  if (hay.includes("nav") || hay.includes("adó") || hay.includes("afa") || hay.includes("áfa"))
    return "REZSI: Adók";
  if (hay.includes("jutal") || hay.includes("jut:") || hay.includes("sms szolg") || hay.includes("díj"))
    return "REZSI: Bank szla.díjak";
  if (hay.includes("kártya")) return "EGYEBEK: Egyéb ktg.";
  if (hay.includes("mvm")) return "REZSI: Egyéb rezsi ktg.";
  if (r.amountSigned > 0) return "ÉRTÉKESÍTÉS";
  return "EGYEBEK: Egyéb ktg.";
}

type TxnPayload = {
  amount: number;
  category: string;
  expense_type?: "FIX_NEED" | "VARIABLE_NEED" | "WANT" | "INVESTMENT";
  muda_type?: "NONE" | "DUPLICATE_SUBSCRIPTION" | "FEES" | "IMPULSE_SPEND" | "WASTE";
  is_recurring?: boolean;
  title?: string | null;
  party?: string | null;
  payment_method?: "transfer" | "cash" | null;
  note: string | null;
  source?: "manual" | "bank";
  bank_raw_id?: string | null;
  bank_account_id?: string | null;
  vat_rate?: number | null;
  vat_treatment?: "hu_gross" | "no_vat" | "reverse_charge" | "foreign";
  vat_review?: boolean;
  vat_deductibility?: 1 | 0.5 | 0 | null;
  workspace?: string;
  tags?: string[];
  location_id?: string | null;
  project_id?: string | null;
  asset_id?: string | null;
  cost_kind?: "opex" | "capex" | "maintenance" | null;
  is_asset?: boolean;
  eur_amount?: number | null;
  eur_rate?: number | null;
  status?: "planned" | "committed" | "actual" | null;
};

function SettingsPage() {
  const { state } = useVault();
  const qc = useQueryClient();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const profileId = String(search.profile ?? "");
  const meshRepo = useMeshRepository();
  const activeTab = (search.tab ?? "accounts") as SettingsTabId;
  const showAll = activeTab === "all";
  const show = useCallback((id: SettingsTabId) => showAll || activeTab === id, [activeTab, showAll]);
  const [consistencyHighlightIds, setConsistencyHighlightIds] = useState<string[]>([]);
  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    if (activeTab !== "workspaces" && !showAll) return;
    try {
      const raw = sessionStorage.getItem("ui:consistencyHighlightIds");
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      if (Array.isArray(ids) && ids.length) {
        setConsistencyHighlightIds(ids.map(String));
        sessionStorage.removeItem("ui:consistencyFocus");
      }
    } catch {
      /* ignore */
    }
  }, [activeTab, showAll]);
  useEffect(() => {
    if (search.focus !== SETTINGS_FOCUS_DEMO_RESET) return;
    const t = window.setTimeout(() => {
      document.getElementById("demo-reset")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => window.clearTimeout(t);
  }, [search.focus, activeTab]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const backupRef = useRef<HTMLInputElement | null>(null);
  const encImportRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState("");
  const [restoreMode, setRestoreMode] = useState<"merge" | "replace">("merge");
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promoteProjectId, setPromoteProjectId] = useState<string>("");
  const [promoteMode, setPromoteMode] = useState<"new_business" | "attach">("new_business");
  const [promoteTargetBusinessId, setPromoteTargetBusinessId] = useState<string>("");
  const [promoteSunkMode, setPromoteSunkMode] = useState<"none" | "prep_cost" | "member_loan">("none");

  const [targetWs, setTargetWs] = useState("Vállalkozás1");
  const [bankAccountId, setBankAccountId] = useState<string>("");
  const [forceReimport, setForceReimport] = useState(false);
  const [baName, setBaName] = useState("");
  const [baIban, setBaIban] = useState("");
  const [baCurrency, setBaCurrency] = useState("HUF");
  const [baBankType, setBaBankType] = useState("MBH");
  const [dangerWsId, setDangerWsId] = useState<string>("");
  const [hashesOpen, setHashesOpen] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [dangerConfirm, setDangerConfirm] = useState("");
  const [dangerBusy, setDangerBusy] = useState(false);
  const [demoResetConfirm, setDemoResetConfirm] = useState("");

  const isDemoProfile = useMemo(() => {
    if (state.status !== "unlocked") return false;
    return String(state.profile.name ?? "").startsWith("DEMO ");
  }, [state]);

  const [encScope, setEncScope] = useState<string>("ALL");
  const [encPass, setEncPass] = useState<string>("");
  const [importFile2, setImportFile2] = useState<File | null>(null);
  const [importPass2, setImportPass2] = useState<string>("");
  const [importMode2, setImportMode2] = useState<"OVERWRITE" | "MERGE">("MERGE");
  const [overwriteConfirmOpen, setOverwriteConfirmOpen] = useState(false);
  const [encBusy, setEncBusy] = useState(false);

  const [ruleWs, setRuleWs] = useState<string>("personal");
  const [ruleKeyword, setRuleKeyword] = useState("");
  const [ruleMatchField, setRuleMatchField] = useState<"partner" | "description" | "accountRef" | "any">("any");
  const [ruleOperator, setRuleOperator] = useState<"contains" | "equals" | "startsWith">("contains");
  const [ruleExpenseType, setRuleExpenseType] = useState<"" | "FIX_NEED" | "VARIABLE_NEED" | "WANT" | "INVESTMENT">("");
  const [ruleMudaType, setRuleMudaType] = useState<
    "" | "NONE" | "DUPLICATE_SUBSCRIPTION" | "FEES" | "IMPULSE_SPEND" | "WASTE"
  >("");
  const [ruleIsRecurring, setRuleIsRecurring] = useState<boolean>(false);
  const [ruleCategory, setRuleCategory] = useState("");
  const [rulePartner, setRulePartner] = useState("");
  const [ruleTags, setRuleTags] = useState("");
  const [ruleNewCatOpen, setRuleNewCatOpen] = useState(false);
  const [ruleNewCatName, setRuleNewCatName] = useState("");
  const [ruleNewCatKind, setRuleNewCatKind] = useState<"income" | "expense" | "saving">("expense");
  const [rulesBusy, setRulesBusy] = useState(false);
  const [retroOpen, setRetroOpen] = useState(false);
  const [dqOpen, setDqOpen] = useState(false);
  const [dqResult, setDqResult] = useState<null | {
    total: number;
    bank: number;
    uncategorized: number;
    missingParty: number;
    missingDescription: number;
    duplicateBankRawIds: number;
    sampleDuplicateBankRawIds: string[];
  }>(null);
  const [catNewName, setCatNewName] = useState("");
  const [catNewKind, setCatNewKind] = useState<"income" | "expense" | "saving">("expense");

  const settingsQ = useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<CustomSettings> => {
      const row = await localdb.getSettings();
      if (!row) return EMPTY_SETTINGS;
      const vaultKey = state.status === "unlocked" ? state.key : null;
      if (!vaultKey) return EMPTY_SETTINGS;
      const s = await decryptJSON<Partial<CustomSettings>>(vaultKey, row.data_enc);
      return {
        incomeCategories: s.incomeCategories ?? [],
        expenseCategories: s.expenseCategories ?? [],
        savingCategories: (s as any).savingCategories ?? [],
        showKpiQuickBar: (s as any).showKpiQuickBar ?? true,
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
    },
    enabled: state.status === "unlocked",
  });

  const vaultKey = state.status === "unlocked" ? state.key : null;
  const settings = settingsQ.data ?? EMPTY_SETTINGS;

  const fallbackWorkspaces = useMemo<WorkspaceMeta[]>(
    () => [
      { id: "personal", type: "personal", alias: "Magán", description: null, color_tag: null, bank_sync_folder: null, imported_file_hashes: [] },
      { id: "Vállalkozás1", type: "business", alias: null, description: null, color_tag: null, bank_sync_folder: null, imported_file_hashes: [] },
      { id: "Projekt1", type: "project", project_mode: "prep", alias: null, description: null, color_tag: null, bank_sync_folder: null, imported_file_hashes: [], completion_pct: 25, scenario: "realistic" },
    ],
    [],
  );
  const workspaces = useMemo(() => {
    const ws = (settings.workspaces ?? []).filter((w) => w && typeof w.id === "string" && Boolean(w.id));
    const base = ws.length > 0 ? ws : fallbackWorkspaces;
    return base.some((w) => w.id === "personal")
      ? base
      : ([
          { id: "personal", type: "personal", alias: "Magán", description: null, color_tag: null, bank_sync_folder: null, imported_file_hashes: [] },
          ...base,
        ] as WorkspaceMeta[]);
  }, [fallbackWorkspaces, settings.workspaces]);

  const businessOptions = useMemo(() => workspaces.filter((w) => w.type === "business"), [workspaces]);

  const persistWorkspaces = useCallback(
    async (next: WorkspaceMeta[], label: string) => {
      if (denyShowcaseWrite(isDemoProfile)) return;
      if (!vaultKey) return;
      const data_enc = await encryptJSON(vaultKey, { ...settings, workspaces: next } satisfies CustomSettings);
      await localdb.putSettings(data_enc);
      await qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success(label);
    },
    [isDemoProfile, qc, settings, vaultKey],
  );
  const importedHashesOf = useCallback((w: WorkspaceMeta | null | undefined) => {
    const v = (w?.imported_file_hashes ?? w?.bank_seen_hashes ?? []) as any;
    return Array.isArray(v) ? (v as string[]) : [];
  }, []);
  const applyWorkspacePatchNow = useCallback(
    async (id: string, patch: Partial<WorkspaceMeta>, label: string) => {
      const next = workspaces.map((w) => {
        if (w.id !== id) return w;
        const merged: WorkspaceMeta = { ...w, ...patch } as any;
        // keep legacy field in sync (best-effort)
        if (patch.imported_file_hashes !== undefined) {
          (merged as any).bank_seen_hashes = patch.imported_file_hashes as any;
        }
        return merged;
      });
      await persistWorkspaces(next, label);
    },
    [persistWorkspaces, workspaces],
  );

  // Workspace form drafts (explicit save per card; no autosave on blur/change)
  const [wsDrafts, setWsDrafts] = useState<Record<string, WorkspaceMeta>>({});
  const [wsDirty, setWsDirty] = useState<Record<string, boolean>>({});
  type WorkspaceResourceTab = "bank" | "locations" | "vehicles" | "hr" | "realestate";
  const [wsResOpen, setWsResOpen] = useState(false);
  const [wsResId, setWsResId] = useState<string>("");
  const [wsResTab, setWsResTab] = useState<WorkspaceResourceTab>("bank");
  const [newResLocName, setNewResLocName] = useState("");
  const [newResLocKind, setNewResLocKind] = useState<"szekhely" | "telephely" | "raktar" | "egyeb">("telephely");
  const [newVehicleName, setNewVehicleName] = useState("");
  const [newVehiclePlate, setNewVehiclePlate] = useState("");
  const [newVehicleType, setNewVehicleType] = useState<"company_fleet" | "private_business">("company_fleet");
  const [newVehicleRate, setNewVehicleRate] = useState<number>(100);
  const [newHrName, setNewHrName] = useState("");
  const [newHrRole, setNewHrRole] = useState("");
  const [newHrType, setNewHrType] = useState<"subcontractor_ev" | "efo_casual">("subcontractor_ev");
  const [newHrRate, setNewHrRate] = useState<number>(0);
  const [newPropName, setNewPropName] = useState("");
  const [newPropType, setNewPropType] = useState<RealEstatePropertyType>("primary_residence");
  const [newPropAddress, setNewPropAddress] = useState("");
  const [newPropValue, setNewPropValue] = useState<number>(0);
  const [newPropIncome, setNewPropIncome] = useState<"yes" | "no">("no");
  useEffect(() => {
    setWsDrafts((prev) => {
      const next: Record<string, WorkspaceMeta> = { ...prev };
      for (const w of workspaces) {
        if (!wsDirty[w.id]) next[w.id] = w;
        if (!next[w.id]) next[w.id] = w;
      }
      return next;
    });
  }, [workspaces, wsDirty]);
  const patchWsDraft = useCallback(
    (id: string, patch: Partial<WorkspaceMeta>) => {
      setWsDrafts((prev) => {
        const base = prev[id] ?? workspaces.find((w) => w.id === id) ?? ({} as any);
        const merged: WorkspaceMeta = { ...base, ...patch } as any;
        return { ...prev, [id]: merged };
      });
      setWsDirty((prev) => ({ ...prev, [id]: true }));
    },
    [workspaces],
  );
  const saveWsDraft = useCallback(
    async (id: string) => {
      const draft = wsDrafts[id] ?? workspaces.find((w) => w.id === id);
      if (!draft) return;
      const alias = (draft.alias ?? "").toString().trim();
      const description = (draft.description ?? "").toString().trim();
      const bankSyncFolder = (draft.bank_sync_folder ?? "").toString().trim();
      const merged: WorkspaceMeta = {
        ...draft,
        alias: alias ? alias : null,
        description: description ? description : null,
        bank_sync_folder: bankSyncFolder ? bankSyncFolder : null,
        completion_pct:
          typeof draft.completion_pct === "number" && Number.isFinite(draft.completion_pct)
            ? Math.max(0, Math.min(100, Math.round(draft.completion_pct)))
            : (draft.completion_pct ?? null),
        imported_file_hashes: importedHashesOf(draft),
      } as any;
      await persistWorkspaces(
        workspaces.map((w) => (w.id === id ? merged : w)),
        "Módosítások sikeresen mentve!",
      );
      setWsDirty((prev) => ({ ...prev, [id]: false }));
    },
    [importedHashesOf, persistWorkspaces, workspaces, wsDrafts],
  );

  const openWorkspaceResources = useCallback(
    (id: string) => {
      setWsResId(id);
      setWsResTab("bank");
      setWsResOpen(true);
    },
    [],
  );

  const allWorkspaceIds = useMemo(() => {
    const ids = ["personal", ...workspaces.map((w) => w.id)];
    return Array.from(new Set(ids));
  }, [workspaces]);
  const workspaceName = useCallback(
    (id: string) => workspaces.find((w) => w.id === id)?.alias?.trim() || (id === "personal" ? "Magán" : id),
    [workspaces],
  );

  const dangerToken = useMemo(() => {
    if (!dangerWsId) return "";
    const nm = String(workspaceName(dangerWsId)).trim().replaceAll(" ", "_");
    return `${nm}_${ymdDash(new Date())}`;
  }, [dangerWsId, workspaceName]);

  const saveSettings = useCallback(
    async (next: CustomSettings, successMsg = "Beállítások mentve.") => {
      if (!vaultKey) return toast.error("Nincs feloldott profil.");
      const enc = await encryptJSON(vaultKey, next);
      await localdb.putSettings(enc);
      await qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success(successMsg);
    },
    [qc, vaultKey],
  );

  const bankAccountsQ = useQuery({
    queryKey: ["bank_accounts"],
    queryFn: async () => localdb.listBankAccounts(),
    enabled: state.status === "unlocked",
    initialData: [],
  });

  const rulesQ = useQuery({
    queryKey: ["category_rules"],
    queryFn: async () => localdb.listCategoryRules(),
    enabled: state.status === "unlocked",
    initialData: [] as CategoryRuleRow[],
  });
  const mappingsQ = useQuery({
    queryKey: ["bank_account_workspaces"],
    queryFn: async () => localdb.listBankAccountWorkspaces(),
    enabled: state.status === "unlocked",
    initialData: [],
  });

  const snapshotsQ = useQuery({
    queryKey: ["snapshots"],
    queryFn: async () => localdb.listSnapshots(),
    enabled: state.status === "unlocked",
    initialData: [] as SnapshotRow[],
  });

  function downloadText(filename: string, content: string) {
    const blob = new Blob([content], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function ymd(d = new Date()) {
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}_${mm}_${dd}`;
  }

  function ymdDash(d = new Date()) {
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const exportBackup = async (encrypted: boolean) => {
    if (encrypted && !vaultKey) return toast.error("Nincs feloldott profil.");
    const dump = await localdb.exportDump();
    if (encrypted) {
      const enc = await encryptJSON(vaultKey!, dump);
      downloadText(`mesh_backup_${ymd()}_enc.json`, enc);
      toast.success("Encrypted mentés letöltve.");
      return;
    }
    downloadText(`mesh_backup_${ymd()}.json`, JSON.stringify(dump, null, 2));
    toast.success("Mentés letöltve.");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#backup-restore") {
      const el = document.getElementById("backup-restore");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const doEncryptedExport = async () => {
    if (state.status !== "unlocked") return toast.error("Nincs feloldott profil.");
    setEncBusy(true);
    try {
      const scope = encScope === "ALL" ? "ALL" : encScope;
      const txt = await localdb.exportEncryptedData({ scope: scope as any, passphrase: encPass || undefined });
      const yyyy = String(new Date().getFullYear());
      const mm = String(new Date().getMonth() + 1).padStart(2, "0");
      const dd = String(new Date().getDate()).padStart(2, "0");
      const date = `${yyyy}-${mm}-${dd}`;
      const label = scope === "ALL" ? "full" : String(workspaceName(scope)).replaceAll(" ", "_");
      const fn = scope === "ALL" ? `mesh_backup_full_${date}.json` : `mesh_backup_${label}_${date}.json`;
      downloadText(fn, txt);
      toast.success("Titkosított mentés letöltve.");
    } catch (e: any) {
      toast.error(e?.message || "Titkosított mentés sikertelen.");
    } finally {
      setEncBusy(false);
    }
  };

  const doEncryptedImport = async (mode: "OVERWRITE" | "MERGE") => {
    if (!importFile2) return toast.error("Válassz mentés fájlt.");
    if (state.status !== "unlocked") return toast.error("Nincs feloldott profil.");
    setEncBusy(true);
    try {
      const txt = await importFile2.text();
      await localdb.importEncryptedData(txt, importPass2, mode);
      await qc.invalidateQueries();
      toast.success("Adatok sikeresen helyreállítva!");
      setTimeout(() => window.location.reload(), 350);
    } catch (e: any) {
      toast.error(e?.message || "Helyreállítás sikertelen.");
    } finally {
      setEncBusy(false);
    }
  };

  const onRestoreFile = async (file: File | null) => {
    if (!file) return;
    if (!vaultKey) return toast.error("Nincs feloldott profil.");
    const txt = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(txt);
    } catch {
      toast.error("Nem érvényes JSON fájl.");
      return;
    }
    let dump: unknown = parsed;
    if (parsed && typeof parsed === "object" && "ct" in (parsed as any) && "iv" in (parsed as any)) {
      try {
        dump = await decryptJSON(vaultKey, txt);
      } catch {
        toast.error("Encrypted mentés dekódolása sikertelen (rossz profil / kulcs).");
        return;
      }
    }
    const res = FinanceVaultDumpSchema.safeParse(dump);
    if (!res.success) {
      toast.error("Mentés sémája nem megfelelő.");
      return;
    }
    await localdb.importDump(res.data as any, restoreMode);
    await qc.invalidateQueries();
    toast.success(restoreMode === "replace" ? "Visszaállítás kész." : "Összefűzés kész.");
  };

  const restoreSnapshot = async (snap: SnapshotRow) => {
    if (!vaultKey) return toast.error("Nincs feloldott profil.");
    let dump: unknown;
    try {
      dump = await decryptJSON(vaultKey, snap.data_enc);
    } catch {
      toast.error("Snapshot dekódolása sikertelen.");
      return;
    }
    const res = FinanceVaultDumpSchema.safeParse(dump);
    if (!res.success) return toast.error("Snapshot sémája nem megfelelő.");
    await localdb.importDump(res.data as any, "replace");
    await qc.invalidateQueries();
    toast.success("Snapshot visszaállítva.");
  };

  const mappingsByAccount = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const row of mappingsQ.data ?? []) {
      const set = m.get(row.bank_account_id) ?? new Set<string>();
      set.add(row.workspace_id);
      m.set(row.bank_account_id, set);
    }
    return m;
  }, [mappingsQ.data]);

  const allowedTargetsForSelectedAccount = useMemo(() => {
    const set = bankAccountId ? mappingsByAccount.get(bankAccountId) : null;
    if (!set || set.size === 0) return allWorkspaceIds;
    return Array.from(set.values());
  }, [allWorkspaceIds, bankAccountId, mappingsByAccount]);

  const onFile = async (file: File | null) => {
    if (!file) return;
    if (!vaultKey) return toast.error("Nincs feloldott profil.");
    if (!file.name.toLowerCase().endsWith(".csv")) return toast.error("Csak .csv támogatott.");
    if (!bankAccountId) return toast.error("Válassz bankszámlát az importhoz.");

    setStatus("Beolvasás…");
    try {
      const dump = await localdb.exportDump();
      const enc = await encryptJSON(vaultKey, dump);
      await localdb.putSnapshot({ label: `Auto backup (CSV import): ${file.name}`, data_enc: enc });
      await qc.invalidateQueries({ queryKey: ["snapshots"] });
    } catch {
      // best-effort
    }
    const text = await file.text();
    // Dedup by SHA-256 of file contents (best-effort)
    try {
      const hash = await sha256Hex(text);
      const wsMeta = workspaces.find((w) => w.id === targetWs) ?? null;
      const seen = importedHashesOf(wsMeta);
      if (!forceReimport && seen.includes(hash)) {
        setStatus("Ez a banki fájl már be lett olvasva (SHA-256 dedup).");
        return;
      }
      const nextHashes = Array.from(new Set([...seen, hash])).slice(-60);
      const next = workspaces.map((w) =>
        w.id === targetWs
          ? ({
              ...w,
              imported_file_hashes: nextHashes,
              bank_seen_hashes: nextHashes, // legacy sync
            } as any)
          : w,
      );
      await persistWorkspaces(next as any, "Mentve: banki dedup hash");
    } catch {
      // best-effort
    }
    const rows = parseHuCorporateStatementCsv(text);
    if (rows.length === 0) {
      setStatus("Nem ismert CSV formátum. (Fejléc: Számlaazonosító;...)");
      return;
    }

    const defaultVat = 27;
    let saved = 0;
    let needsReview = 0;
    let skippedNonHuf = 0;
    for (const r of rows) {
      if (r.currency && r.currency.toUpperCase() !== "HUF") {
        skippedNonHuf++;
        continue;
      }
      const rawId = `bankraw:${bankAccountId}:${fnv1a32Hex(
        [
          r.accountRef,
          r.bookingDateIso.slice(0, 10),
          r.valueDateIso.slice(0, 10),
          String(r.amountSigned),
          r.bookingText,
          r.message,
          r.partner,
          r.partnerAccount,
        ].join("|"),
      )}`;

      await localdb.putBankRaw({
        id: rawId,
        workspace: targetWs,
        bank_account_id: bankAccountId,
        account_ref: r.accountRef || null,
        ingested_at: new Date().toISOString(),
        booking_date_iso: r.bookingDateIso,
        value_date_iso: r.valueDateIso,
        amount_signed: r.amountSigned,
        currency: r.currency,
        booking_text: r.bookingText,
        message: r.message,
        partner: r.partner,
        partner_account: r.partnerAccount,
        source_file: file.name,
      } satisfies Omit<BankRawRow, "profile_id">);

      const type: TxnType = r.amountSigned < 0 ? "expense" : "income";
      const gross = Math.abs(r.amountSigned);
      const vatGuess = guessVatTreatmentFromBankRow(r);
      const appliedRate =
        vatGuess.treatment === "hu_gross" || vatGuess.treatment === "reverse_charge"
          ? defaultVat
          : 0;
      const storedNet =
        vatGuess.treatment === "hu_gross"
          ? computeVatSplit(gross, appliedRate, "gross").net
          : gross;
      if (vatGuess.review) needsReview++;

      const payload: TxnPayload = {
        amount: storedNet,
        category: guessBusinessCategoryFromBankRow(r),
        title: r.bookingText || null,
        party: r.partner || null,
        payment_method: r.bookingText.toLowerCase().includes("átutal") ? "transfer" : null,
        note: r.message || null,
        source: "bank",
        bank_raw_id: rawId,
        bank_account_id: bankAccountId,
        status: "actual",
        vat_rate: appliedRate,
        vat_treatment: vatGuess.treatment,
        vat_review: vatGuess.review,
        vat_deductibility: 1,
        workspace: targetWs,
      };
      try {
        const s = suggestFromRules(rulesQ.data ?? [], {
          workspaceId: targetWs,
          text: [payload.title ?? "", payload.party ?? "", payload.note ?? "", r.message ?? "", r.bookingText ?? ""]
            .filter(Boolean)
            .join(" "),
        });
        Object.assign(payload, applySuggestion(payload, s));
      } catch {
        /* best-effort */
      }

      const txnId = `banktxn:${targetWs}:${rawId}`;
      const exists = await localdb.getTxn(txnId);
      if (exists) continue;
      const data_enc = await encryptJSON(vaultKey, payload);
      await localdb.putTxn({
        id: txnId,
        type,
        occurred_at: r.bookingDateIso,
        data_enc,
      });
      saved++;
    }

    await qc.invalidateQueries({ queryKey: ["transactions"] });
    setStatus(
      `Import kész: ${saved} tétel. Jelölt: ${needsReview}.${skippedNonHuf ? ` Kihagyva (nem HUF): ${skippedNonHuf}.` : ""}`,
    );
  };

  type GoalPayload = { name: string; target_amount: number; workspace?: string };
  const clearImportHashes = useCallback(
    async (workspaceId: string) => {
      const wsMeta = workspaces.find((w) => w.id === workspaceId) ?? null;
      if (!wsMeta) return;
      await applyWorkspacePatchNow(
        workspaceId,
        { imported_file_hashes: [], bank_seen_hashes: [] } as any,
        "Import előzmények törölve! A fájlok újra beolvashatók.",
      );
    },
    [applyWorkspacePatchNow, workspaces],
  );
  const purgeWorkspaceData = useCallback(
    async (workspaceId: string) => {
      if (!vaultKey) return toast.error("Nincs feloldott profil.");
      setDangerBusy(true);
      try {
        // Auto-backup before destructive operations (best-effort)
        try {
          const dump = await localdb.exportDump();
          const enc = await encryptJSON(vaultKey, dump);
          await localdb.putSnapshot({
            label: `Auto backup (purge): ${workspaceId} @ ${new Date().toISOString()}`,
            data_enc: enc,
          });
          await qc.invalidateQueries({ queryKey: ["snapshots"] });
        } catch {
          /* best-effort */
        }

        const [txns, goals, raws, loans] = await Promise.all([
          localdb.listTxns(),
          localdb.listGoals(),
          localdb.listBankRaw(),
          localdb.listLoans(),
        ]);

        for (const r of txns) {
          try {
            const p = await decryptJSON<TxnPayload>(vaultKey, r.data_enc);
            const ws = (p.workspace ?? "personal") as string;
            if (ws === workspaceId) await localdb.deleteTxn(r.id);
          } catch {
            /* ignore */
          }
        }

        for (const g of goals) {
          try {
            const p = await decryptJSON<GoalPayload>(vaultKey, g.data_enc);
            const ws = (p.workspace ?? "personal") as string;
            if (ws === workspaceId) await localdb.deleteGoal(g.id);
          } catch {
            /* ignore */
          }
        }

        for (const row of raws) {
          if ((row.workspace ?? "personal") === workspaceId) {
            await localdb.deleteBankRaw(row.id);
          }
        }

        for (const r of loans) {
          try {
            const p = await decryptJSON<{ workspace_id?: string }>(vaultKey, r.data_enc);
            const ws = (p.workspace_id ?? "personal") as string;
            if (ws === workspaceId) await localdb.deleteLoan(r.id);
          } catch {
            /* ignore */
          }
        }

        await clearImportHashes(workspaceId);
        await qc.invalidateQueries();
        toast.success(`Munkatér nullázva: ${workspaceName(workspaceId)}`);
      } finally {
        setDangerBusy(false);
      }
    },
    [clearImportHashes, qc, vaultKey, workspaceName],
  );
  const removeWorkspacePermanently = useCallback(
    async (workspaceId: string) => {
      if (workspaceId === "personal") return toast.error("A Magán munkatér nem törölhető.");
      if (!vaultKey) return toast.error("Nincs feloldott profil.");
      setDangerBusy(true);
      try {
        await purgeWorkspaceData(workspaceId);
        // remove bank account mapping rows pointing to workspace
        try {
          const maps = await localdb.listBankAccountWorkspaces();
          for (const m of maps) {
            if (m.workspace_id === workspaceId) {
              await localdb.setBankAccountWorkspaceMapping({
                bank_account_id: m.bank_account_id,
                workspace_id: workspaceId,
                enabled: false,
              });
            }
          }
        } catch {
          /* best-effort */
        }
        await persistWorkspaces(workspaces.filter((w) => w.id !== workspaceId), "Munkatér végleg törölve.");
        setDangerConfirm("");
        setRemoveOpen(false);
        await qc.invalidateQueries();
        toast.success("Munkatér eltávolítva.");        navigate({ to: "/" });
      } finally {
        setDangerBusy(false);
      }
    },
    [navigate, persistWorkspaces, purgeWorkspaceData, qc, vaultKey, workspaces],
  );

  if (state.status !== "unlocked") {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
        <ProfileHeader
          profileId={profileId}
          profileName=""
          showBack
          rightControls={
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9"
              onClick={() => navigate({ to: "/" })}
              title="Vissza a műszerfalra"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Vissza
            </Button>
          }
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-6">
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Beállítások</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Slot / Munkaterek, bankszámlák, automatizációs szabályok és biztonsági mentések kezelése.
              </div>
              <div className="text-sm text-muted-foreground">Előbb lépj be egy profilba.</div>
            </CardContent>
          </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <ProfileHeader
        profileId={profileId}
        profileName={state.profile.name ?? "Profil"}
        showBack
        rightControls={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9"
            onClick={() => navigate({ to: "/" })}
            title="Vissza a műszerfalra"
            aria-label="Vissza a műszerfalra"
          >
            <X className="mr-2 h-4 w-4" />
            Bezárás
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[98%] space-y-4 px-2 py-6 sm:px-4">
          <div className="space-y-1">
            <div className="text-2xl font-semibold text-white">⚙️ Beállítások</div>
            <div className="text-sm text-muted-foreground">
              Slot / Munkaterek, bankszámlák, automatizációs szabályok és biztonsági mentések kezelése.
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {SETTINGS_TABS.map((t) => {
              const isActive = activeTab === t.id;
              const isDanger = t.id === "danger";
              const base = "h-9 px-3 whitespace-nowrap";
              const activeCls = "bg-slate-800/80 border border-indigo-500/30 text-white";
              const inactiveCls = "border border-border/60 bg-background/40";
              const dangerCls = isDanger ? "text-rose-200 border-rose-500/25" : "";
              return (
                <Button
                  key={t.id}
                  type="button"
                  variant="outline"
                  className={`${base} ${isActive ? activeCls : inactiveCls} ${!isActive ? dangerCls : ""}`}
                  onClick={() => {
                    void navigate({
                      search: (prev: any) => ({
                        ...prev,
                        tab: t.id === "accounts" ? undefined : t.id,
                      }),
                    });
                  }}
                  title={t.label}
                >
                  {t.label}
                </Button>
              );
            })}
          </div>

          {show("accounts") && (
            <Card>
              <CardHeader>
                <CardTitle>💳 Bankszámlák & Profilok</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="grid gap-2 md:col-span-2">
                  <Label>Név</Label>
                  <Input value={baName} onChange={(e) => setBaName(e.target.value)} placeholder="pl. MBH Céges" />
                </div>
                <div className="grid gap-2">
                  <Label>Devizanem</Label>
                  <Select value={baCurrency} onValueChange={setBaCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HUF">HUF</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Bank</Label>
                  <Select value={baBankType} onValueChange={setBaBankType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MBH">MBH</SelectItem>
                      <SelectItem value="OTP">OTP</SelectItem>
                      <SelectItem value="Erste">Erste</SelectItem>
                      <SelectItem value="K&H">K&H</SelectItem>
                      <SelectItem value="Raiffeisen">Raiffeisen</SelectItem>
                      <SelectItem value="CIB">CIB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 md:col-span-3">
                  <Label>Számlaszám / IBAN</Label>
                  <Input value={baIban} onChange={(e) => setBaIban(e.target.value)} placeholder="pl. HU12..." />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!vaultKey) return;
                      if (!baIban.trim()) return toast.error("IBAN/Számlaszám kötelező.");
                      await localdb.putBankAccount({
                        name: baName,
                        iban: baIban,
                        currency: baCurrency,
                        bank_type: baBankType,
                      });
                      setBaName("");
                      setBaIban("");
                      await qc.invalidateQueries({ queryKey: ["bank_accounts"] });
                      await qc.invalidateQueries({ queryKey: ["bank_account_workspaces"] });
                      toast.success("Bankszámla mentve.");
                    }}
                  >
                    Hozzáad
                  </Button>
                </div>
              </div>

              {(bankAccountsQ.data ?? []).length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Még nincs bankszámla. Adj hozzá legalább egyet, hogy az import és az adatizoláció működjön.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-xs">
                    <thead className="border-b text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Bankszámla</th>
                        {allWorkspaceIds.map((w) => (
                          <th key={w} className="px-3 py-2 text-left font-medium">
                            {w === "personal" ? "Magán" : w}
                          </th>
                        ))}
                        <th className="px-3 py-2 text-right font-medium">Művelet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(bankAccountsQ.data ?? []).map((a) => {
                        const set = mappingsByAccount.get(a.id) ?? new Set<string>();
                        return (
                          <tr key={a.id} className="border-b last:border-b-0">
                            <td className="px-3 py-2">
                              <div className="font-medium">{a.name}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {a.bank_type} · {a.currency} · <span className="font-mono">{a.iban}</span>
                              </div>
                            </td>
                            {allWorkspaceIds.map((w) => {
                              const checked = set.has(w);
                              return (
                                <td key={w} className="px-3 py-2">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={async (e) => {
                                      const enable = e.currentTarget.checked;
                                      if (enable) {
                                        const used = (mappingsQ.data ?? []).filter((m) => m.workspace_id === w).length;
                                        const cap = checkBankAccountsForSlot(used);
                                        if (!cap.ok) {
                                          toast.warning(bankCapacityToast());
                                          e.currentTarget.checked = false;
                                          return;
                                        }
                                      }
                                      await localdb.setBankAccountWorkspaceMapping({
                                        bank_account_id: a.id,
                                        workspace_id: w,
                                        enabled: enable,
                                      });
                                      await qc.invalidateQueries({ queryKey: ["bank_account_workspaces"] });
                                    }}
                                    aria-label={`Hozzárendelés: ${a.name} → ${w}`}
                                  />
                                </td>
                              );
                            })}
                            <td className="px-3 py-2 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  await localdb.deleteBankAccount(a.id);
                                  if (bankAccountId === a.id) setBankAccountId("");
                                  await qc.invalidateQueries({ queryKey: ["bank_accounts"] });
                                  await qc.invalidateQueries({ queryKey: ["bank_account_workspaces"] });
                                  toast.success("Bankszámla törölve.");
                                }}
                                title="Bankszámla törlése"
                              >
                                Törlés
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            </Card>
          )}

          {show("workspaces") && (
            <Card>
              <CardHeader>
                <CardTitle>📁 Slot / Munkaterek & Projektek kezelése</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">KPI Quick Bar / Gyors mutatók sáv megjelenítése</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      A fejléc alatti 4 gyorscsempe: KPI mutató #1–#4 — egyedi beállítás.
                    </div>
                  </div>
                  <Switch
                    checked={Boolean((settings as any).showKpiQuickBar ?? true)}
                    onCheckedChange={(v) => {
                      const cur = settingsQ.data ?? EMPTY_SETTINGS;
                      const next: CustomSettings = { ...cur, showKpiQuickBar: Boolean(v) };
                      void saveSettings(next, "KPI Quick Bar beállítás mentve.");
                    }}
                    aria-label="KPI Quick Bar megjelenítése"
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Itt tudsz munkatér-meta adatokat megadni (becenév, leírás, banki kivonatok mappája), valamint projekteknél
                tervezői beállításokat (készültség, forgatókönyv) és élesítést.
              </div>

              <div className="grid gap-3">
                {workspaces.map((w) => {
                  const isAttached = w.type === "project" && Boolean(w.parent_business_id) && Boolean(w.counts_in_business);
                  const parentLabel = isAttached
                    ? (businessOptions.find((b) => b.id === w.parent_business_id)?.alias ?? w.parent_business_id ?? "—")
                    : null;
                  const d = wsDrafts[w.id] ?? w;
                  const dirty = Boolean(wsDirty[w.id]);
                  const highlighted = consistencyHighlightIds.includes(w.id);
                  return (
                    <div
                      key={w.id}
                      className={
                        highlighted
                          ? "rounded-lg border border-amber-500/60 bg-amber-950/25 p-3 ring-1 ring-amber-400/40"
                          : "rounded-lg border border-border/60 bg-background/40 p-3"
                      }
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{d.alias?.trim() || w.id}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            típus: <span className="font-mono">{w.type}</span> · id: <span className="font-mono">{w.id}</span>
                          </div>
                          {isAttached && (
                            <div className="mt-1 text-[11px] text-muted-foreground">
                              Csatolva ehhez: <span className="font-medium">{parentLabel}</span> (beleszámít a könyvelésbe/ÁFA-ba)
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={dirty ? "default" : "outline"}
                            className="h-8"
                            disabled={!dirty}
                            onClick={() => void saveWsDraft(w.id)}
                            title="Módosítások mentése"
                          >
                            💾 Módosítások mentése
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => openWorkspaceResources(w.id)}
                            title="Erőforrások hozzárendelése"
                          >
                            🧩 Erőforrások
                          </Button>
                          <HelpIcon kbId="settings-explicit-save" />
                          {w.type === "project" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => {
                                setPromoteProjectId(w.id);
                                setPromoteMode("new_business");
                                setPromoteTargetBusinessId(businessOptions[0]?.id ?? "");
                                setPromoteOpen(true);
                              }}
                              title="Átalakítás / Élesítés"
                            >
                              Átalakítás / Élesítés
                            </Button>
                          )}
                          {w.type === "project" && <HelpIcon kbId="promote-member-loan" />}
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div className="grid gap-1.5">
                          <Label>Alias / becenév</Label>
                          <Input
                            value={d.alias ?? ""}
                            placeholder="pl. ACME Kft."
                            onChange={(e) => patchWsDraft(w.id, { alias: e.currentTarget.value })}
                          />
                        </div>
                        <div className="grid gap-1.5 md:col-span-2">
                          <Label>Leírás</Label>
                          <Input
                            value={d.description ?? ""}
                            placeholder="rövid leírás / megjegyzés"
                            onChange={(e) => patchWsDraft(w.id, { description: e.currentTarget.value })}
                          />
                        </div>
                        <div className="grid gap-1.5 md:col-span-3">
                          <Label>Banki kivonatok mappája (beállítási kulcs)</Label>
                          <Input
                            value={d.bank_sync_folder ?? ""}
                            placeholder='pl. C:\\\\Users\\\\...\\\\Downloads\\\\bank vagy "/sdcard/Download/bank"'
                            onChange={(e) => patchWsDraft(w.id, { bank_sync_folder: e.currentTarget.value })}
                          />
                          <div className="text-[11px] text-muted-foreground">
                            Megjegyzés: böngésző módban a mappaútvonal csak “hint” (auto-olvasás nem minden platformon lehetséges).
                          </div>
                        </div>
                      </div>

                      {w.type === "project" && (
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <div className="grid gap-1.5 md:col-span-3">
                            <Label>Projekt mód</Label>
                            <Select
                              value={String((d as any).project_mode ?? "prep")}
                              onValueChange={(v) => {
                                const mode = v as any;
                                const patch: Partial<WorkspaceMeta> = { project_mode: mode };
                                // pilot requires umbrella; keep existing parent if present
                                if (mode !== "pilot") {
                                  patch.parent_business_id = null;
                                  patch.counts_in_business = null;
                                } else {
                                  patch.counts_in_business = true;
                                }
                                patchWsDraft(w.id, patch as any);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="simulation">🧪 Szimuláció / Ötlet</SelectItem>
                                <SelectItem value="pilot">🚀 Pilot Projekt</SelectItem>
                                <SelectItem value="prep">📐 Független Előkészítés</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {(d as any).project_mode === "pilot" && (
                            <div className="grid gap-1.5 md:col-span-3">
                              <Label>Ernyő Vállalkozás</Label>
                              <Select
                                value={String(d.parent_business_id ?? "__none")}
                                onValueChange={(v) =>
                                  patchWsDraft(w.id, {
                                    parent_business_id: v === "__none" ? null : v,
                                    counts_in_business: v === "__none" ? null : true,
                                  } as any)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none">—</SelectItem>
                                  {businessOptions.map((b) => (
                                    <SelectItem key={b.id} value={b.id}>
                                      {b.alias?.trim() || b.id}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="text-[11px] text-muted-foreground">
                                Pilot módban a projekt tételei a vállalkozás P&L/ÁFA számításaiba is beszámíthatnak.
                              </div>
                            </div>
                          )}

                          <div className="grid gap-1.5">
                            <Label>Készültségi állapot (%)</Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={Number(d.completion_pct ?? 25)}
                                onChange={(e) => patchWsDraft(w.id, { completion_pct: Number(e.currentTarget.value) } as any)}
                                className="w-full"
                              />
                              <span className="w-12 text-right font-mono text-xs text-muted-foreground">
                                {Number(d.completion_pct ?? 25)}%
                              </span>
                            </div>
                          </div>
                          <div className="grid gap-1.5">
                            <Label>P-R-O forgatókönyv</Label>
                              <Select
                              value={(d.scenario ?? "realistic") as WorkspaceScenario}
                              onValueChange={(v) => patchWsDraft(w.id, { scenario: v as any } as any)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="conservative">Pesszimista</SelectItem>
                                <SelectItem value="realistic">Realista</SelectItem>
                                <SelectItem value="optimistic">Optimista</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Projekt státusz</Label>
                            <div className="rounded-md border border-border/60 bg-muted/20 p-2 text-xs text-muted-foreground">
                              Tervező / szimulációs munkatér (élesítés után üzletmenetbe kerülhet).
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Dialog open={wsResOpen} onOpenChange={setWsResOpen}>
                <DialogContent className="w-full max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>
                      🧩 Erőforrások —{" "}
                      {workspaces.find((x) => x.id === wsResId)?.alias?.trim() ||
                        workspaces.find((x) => x.id === wsResId)?.id ||
                        "Munkatér"}
                    </DialogTitle>
                  </DialogHeader>

                  {(() => {
                    const base = workspaces.find((x) => x.id === wsResId) ?? null;
                    const d = (wsDrafts as any)[wsResId] ?? base;
                    if (!base || !d) return <div className="text-sm text-muted-foreground">Válassz munkateret.</div>;

                    const accounts = bankAccountsQ.data ?? [];
                    const maps = mappingsQ.data ?? [];
                    const enabledIds = new Set(maps.filter((m) => m.workspace_id === wsResId).map((m) => m.bank_account_id));
                    const bankIdsDraft = Array.isArray((d as any).bankAccountIds) ? ((d as any).bankAccountIds as string[]) : [];
                    const locationIdsDraft = Array.isArray((d as any).locationIds) ? ((d as any).locationIds as string[]) : [];
                    const vehiclesDraft = Array.isArray((d as any).vehicles) ? ((d as any).vehicles as any[]) : [];
                    const hrDraft = Array.isArray((d as any).humanResources) ? ((d as any).humanResources as any[]) : [];
                    const propsDraft = Array.isArray((d as any).realEstateProperties)
                      ? ((d as any).realEstateProperties as RealEstateProperty[])
                      : [];

                    const tabBtnBase =
                      "inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors";
                    const tabActive = "border-border/60 bg-background text-foreground";
                    const tabIdle = "border-transparent bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground";

                    return (
                      <div className="grid gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className={`${tabBtnBase} ${wsResTab === "bank" ? tabActive : tabIdle}`}
                            onClick={() => setWsResTab("bank")}
                          >
                            💳 Bankszámlák
                          </button>
                          <button
                            type="button"
                            className={`${tabBtnBase} ${wsResTab === "locations" ? tabActive : tabIdle}`}
                            onClick={() => setWsResTab("locations")}
                          >
                            🏭 Költséghelyek & Raktárak
                          </button>
                          <button
                            type="button"
                            className={`${tabBtnBase} ${wsResTab === "vehicles" ? tabActive : tabIdle}`}
                            onClick={() => setWsResTab("vehicles")}
                          >
                            🚗 Járművek
                          </button>
                          <button
                            type="button"
                            className={`${tabBtnBase} ${wsResTab === "hr" ? tabActive : tabIdle}`}
                            onClick={() => setWsResTab("hr")}
                          >
                            👥 Humán erőforrások
                          </button>
                          {wsResId === "personal" ? (
                            <button
                              type="button"
                              className={`${tabBtnBase} ${wsResTab === "realestate" ? tabActive : tabIdle}`}
                              onClick={() => setWsResTab("realestate")}
                            >
                              🏠 Ingatlanok & Költséghelyek
                            </button>
                          ) : null}
                        </div>

                        {wsResTab === "bank" ? (
                          <Card className="border border-border/60 bg-background/40">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">💳 Bankszámlák</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-2">
                              {accounts.length === 0 ? (
                                <div className="text-sm text-muted-foreground">Nincs rögzített bankszámla.</div>
                              ) : (
                                accounts.map((a) => {
                                  const on = enabledIds.has(a.id);
                                  return (
                                    <div
                                      key={a.id}
                                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-background/50 px-3 py-2"
                                    >
                                      <div className="min-w-0">
                                        <div className="truncate text-sm font-medium">{a.name}</div>
                                        <div className="text-[11px] text-muted-foreground font-mono truncate">{a.iban}</div>
                                      </div>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant={on ? "secondary" : "outline"}
                                        className={on ? "h-8 bg-emerald-950/40 border-emerald-500/30 text-emerald-200" : "h-8"}
                                        onClick={() => {
                                          void (async () => {
                                            const enable = !on;
                                            if (enable) {
                                              const used = enabledIds.size;
                                              const cap = checkBankAccountsForSlot(used);
                                              if (!cap.ok) {
                                                toast.warning(bankCapacityToast());
                                                return;
                                              }
                                            }
                                            await localdb.setBankAccountWorkspaceMapping({
                                              bank_account_id: a.id,
                                              workspace_id: wsResId,
                                              enabled: enable,
                                            });
                                            await qc.invalidateQueries({ queryKey: ["bank_account_workspaces"] });
                                            const next = enable
                                              ? Array.from(new Set([...bankIdsDraft, a.id]))
                                              : bankIdsDraft.filter((x) => x !== a.id);
                                            patchWsDraft(wsResId, { bankAccountIds: next } as any);
                                          })();
                                        }}
                                        title={on ? "Leválasztás" : "Csatolás"}
                                      >
                                        {on ? "Csatolva" : "Csatolás"}
                                      </Button>
                                    </div>
                                  );
                                })
                              )}
                              <div className="text-[11px] text-muted-foreground">
                                Megjegyzés: a csatolás a bank-importnál is ezt a mappinget használja.
                              </div>
                            </CardContent>
                          </Card>
                        ) : null}

                        {wsResTab === "locations" ? (
                          <Card className="border border-border/60 bg-background/40">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">🏭 Költséghelyek & Raktárak</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                              <div className="grid gap-2 md:grid-cols-3">
                                <div className="grid gap-1.5 md:col-span-2">
                                  <Label>Új helyszín neve</Label>
                                  <Input
                                    value={newResLocName}
                                    onChange={(e) => setNewResLocName(e.currentTarget.value)}
                                    placeholder="pl. Raktár — Gyál"
                                    maxLength={64}
                                  />
                                </div>
                                <div className="grid gap-1.5">
                                  <Label>Típus</Label>
                                  <Select value={newResLocKind} onValueChange={(v) => setNewResLocKind(v as any)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="szekhely">Székhely</SelectItem>
                                      <SelectItem value="telephely">Telephely</SelectItem>
                                      <SelectItem value="raktar">Raktár</SelectItem>
                                      <SelectItem value="egyeb">Egyéb</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex items-center justify-end">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => {
                                    const name = newResLocName.trim();
                                    if (!name) return toast.error("Adj meg helyszín nevet.");
                                    const id =
                                      typeof crypto !== "undefined" && "randomUUID" in crypto
                                        ? (crypto as any).randomUUID()
                                        : `${Date.now()}`;
                                    void (async () => {
                                      await saveSettings(
                                        {
                                          ...settings,
                                          locations: [...(settings.locations ?? []), { id, name, kind: newResLocKind }],
                                        } as any,
                                        "Helyszín hozzáadva.",
                                      );
                                      patchWsDraft(wsResId, {
                                        locationIds: Array.from(new Set([...locationIdsDraft, id])),
                                      } as any);
                                      setNewResLocName("");
                                    })();
                                  }}
                                  title="Új helyszín felvitele"
                                >
                                  + Új helyszín
                                </Button>
                              </div>

                              <div className="grid gap-2">
                                {(settings.locations ?? []).length === 0 ? (
                                  <div className="text-sm text-muted-foreground">Nincs még helyszín.</div>
                                ) : (
                                  (settings.locations ?? []).map((l) => {
                                    const on = locationIdsDraft.includes(l.id);
                                    return (
                                      <div
                                        key={l.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-background/50 px-3 py-2"
                                      >
                                        <div className="min-w-0">
                                          <div className="truncate text-sm font-medium">{l.name}</div>
                                          <div className="text-[11px] text-muted-foreground font-mono">
                                            {l.kind === "szekhely"
                                              ? "székhely"
                                              : l.kind === "telephely"
                                                ? "telephely"
                                                : l.kind === "raktar"
                                                  ? "raktár"
                                                  : "egyéb"}
                                          </div>
                                        </div>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant={on ? "secondary" : "outline"}
                                          className={on ? "h-8 bg-amber-950/40 border-amber-500/30 text-amber-200" : "h-8"}
                                          onClick={() => {
                                            const next = on
                                              ? locationIdsDraft.filter((x) => x !== l.id)
                                              : Array.from(new Set([...locationIdsDraft, l.id]));
                                            patchWsDraft(wsResId, { locationIds: next } as any);
                                          }}
                                          title={on ? "Leválasztás" : "Hozzárendelés"}
                                        >
                                          {on ? "Hozzárendelve" : "Hozzárendelés"}
                                        </Button>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ) : null}

                        {wsResTab === "vehicles" ? (
                          <Card className="border border-border/60 bg-background/40">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">🚗 Járművek</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                              <div className="grid gap-2 md:grid-cols-4">
                                <div className="grid gap-1.5 md:col-span-2">
                                  <Label>Megnevezés</Label>
                                  <Input value={newVehicleName} onChange={(e) => setNewVehicleName(e.currentTarget.value)} placeholder="pl. Transit" />
                                </div>
                                <div className="grid gap-1.5">
                                  <Label>Rendszám</Label>
                                  <Input value={newVehiclePlate} onChange={(e) => setNewVehiclePlate(e.currentTarget.value)} placeholder="ABC-123" />
                                </div>
                                <div className="grid gap-1.5">
                                  <Label>Típus</Label>
                                  <Select value={newVehicleType} onValueChange={(v) => setNewVehicleType(v as any)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="company_fleet">Céges flotta</SelectItem>
                                      <SelectItem value="private_business">Magánautó (kiküldetés)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-1.5">
                                  <Label>Ft/km</Label>
                                  <Input
                                    type="number"
                                    value={String(newVehicleRate)}
                                    onChange={(e) => setNewVehicleRate(Number(e.currentTarget.value))}
                                    placeholder="100"
                                  />
                                </div>
                                <div className="flex items-end md:col-span-3 justify-end">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      const nm = newVehicleName.trim();
                                      const plate = newVehiclePlate.trim().toUpperCase();
                                      if (!nm || !plate) return toast.error("Add meg a megnevezést és rendszámot.");
                                      const id =
                                        typeof crypto !== "undefined" && "randomUUID" in crypto
                                          ? (crypto as any).randomUUID()
                                          : `${Date.now()}`;
                                      patchWsDraft(wsResId, {
                                        vehicles: [
                                          ...vehiclesDraft,
                                          {
                                            id,
                                            name: nm,
                                            plateNumber: plate,
                                            type: newVehicleType,
                                            reimbursementRate: Number.isFinite(newVehicleRate) ? newVehicleRate : 100,
                                          },
                                        ],
                                      } as any);
                                      setNewVehicleName("");
                                      setNewVehiclePlate("");
                                      setNewVehicleRate(100);
                                      setNewVehicleType("company_fleet");
                                    }}
                                    title="Jármű hozzáadása"
                                  >
                                    + Hozzáadás
                                  </Button>
                                </div>
                              </div>

                              {vehiclesDraft.length === 0 ? (
                                <div className="text-sm text-muted-foreground">Még nincs jármű felvéve.</div>
                              ) : (
                                <div className="grid gap-2">
                                  {vehiclesDraft.map((v) => (
                                    <div
                                      key={v.id}
                                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-background/50 px-3 py-2"
                                    >
                                      <div className="min-w-0">
                                        <div className="truncate text-sm font-medium">
                                          {v.name} <span className="font-mono text-muted-foreground">({v.plateNumber})</span>
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                          {v.type === "private_business" ? `magánautó · ${v.reimbursementRate} Ft/km` : "céges flotta"}
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          patchWsDraft(wsResId, {
                                            vehicles: vehiclesDraft.filter((x: any) => x.id !== v.id),
                                          } as any)
                                        }
                                        title="Törlés"
                                      >
                                        Törlés
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ) : null}

                        {wsResTab === "hr" ? (
                          <Card className="border border-border/60 bg-background/40">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">👥 Humán erőforrások</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                              <div className="grid gap-2 md:grid-cols-4">
                                <div className="grid gap-1.5 md:col-span-2">
                                  <Label>Név / megnevezés</Label>
                                  <Input value={newHrName} onChange={(e) => setNewHrName(e.currentTarget.value)} placeholder="pl. Kovács Béla" />
                                </div>
                                <div className="grid gap-1.5">
                                  <Label>Szerep</Label>
                                  <Input value={newHrRole} onChange={(e) => setNewHrRole(e.currentTarget.value)} placeholder="pl. Burkoló" />
                                </div>
                                <div className="grid gap-1.5">
                                  <Label>Típus</Label>
                                  <Select value={newHrType} onValueChange={(v) => setNewHrType(v as any)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="subcontractor_ev">EV alvállalkozó</SelectItem>
                                      <SelectItem value="efo_casual">EFO (eseti)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-1.5">
                                  <Label>Alap díj (Ft)</Label>
                                  <Input
                                    type="number"
                                    value={String(newHrRate)}
                                    onChange={(e) => setNewHrRate(Number(e.currentTarget.value))}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="flex items-end md:col-span-3 justify-end">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      const nm = newHrName.trim();
                                      if (!nm) return toast.error("Adj meg nevet.");
                                      const id =
                                        typeof crypto !== "undefined" && "randomUUID" in crypto
                                          ? (crypto as any).randomUUID()
                                          : `${Date.now()}`;
                                      patchWsDraft(wsResId, {
                                        humanResources: [
                                          ...hrDraft,
                                          {
                                            id,
                                            name: nm,
                                            role: newHrRole.trim(),
                                            type: newHrType,
                                            defaultRate: Number.isFinite(newHrRate) ? newHrRate : 0,
                                          },
                                        ],
                                      } as any);
                                      setNewHrName("");
                                      setNewHrRole("");
                                      setNewHrType("subcontractor_ev");
                                      setNewHrRate(0);
                                    }}
                                    title="HR hozzáadása"
                                  >
                                    + Hozzáadás
                                  </Button>
                                </div>
                              </div>

                              {hrDraft.length === 0 ? (
                                <div className="text-sm text-muted-foreground">Még nincs HR felvéve.</div>
                              ) : (
                                <div className="grid gap-2">
                                  {hrDraft.map((h) => (
                                    <div
                                      key={h.id}
                                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-background/50 px-3 py-2"
                                    >
                                      <div className="min-w-0">
                                        <div className="truncate text-sm font-medium">{h.name}</div>
                                        <div className="text-[11px] text-muted-foreground">
                                          {h.type === "subcontractor_ev" ? "EV alvállalkozó" : "EFO"} · {h.role || "—"} ·{" "}
                                          <span className="font-mono">{Math.round(Number(h.defaultRate ?? 0))} Ft</span>
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          patchWsDraft(wsResId, {
                                            humanResources: hrDraft.filter((x: any) => x.id !== h.id),
                                          } as any)
                                        }
                                        title="Törlés"
                                      >
                                        Törlés
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ) : null}

                        {wsResTab === "realestate" && wsResId === "personal" ? (
                          <Card className="border border-border/60 bg-background/40">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                🏠 Ingatlanok & Költséghelyek
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                              <div className="grid gap-2 md:grid-cols-4">
                                <div className="grid gap-1.5 md:col-span-2">
                                  <Label>Megnevezés</Label>
                                  <Input
                                    value={newPropName}
                                    onChange={(e) => setNewPropName(e.currentTarget.value)}
                                    placeholder='pl. "Elsődleges lakóingatlan"'
                                    maxLength={80}
                                  />
                                </div>
                                <div className="grid gap-1.5">
                                  <Label>Típus</Label>
                                  <Select value={newPropType} onValueChange={(v) => setNewPropType(v as any)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="primary_residence">Elsődleges lakóingatlan</SelectItem>
                                      <SelectItem value="secondary_property">Másodlagos ingatlan</SelectItem>
                                      <SelectItem value="land_plot">Telek / föld</SelectItem>
                                      <SelectItem value="rental">Kiadó ingatlan</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-1.5">
                                  <Label>Becsült érték (Ft)</Label>
                                  <Input
                                    type="number"
                                    value={String(newPropValue)}
                                    onChange={(e) => setNewPropValue(Number(e.currentTarget.value))}
                                  />
                                </div>
                                <div className="grid gap-1.5 md:col-span-3">
                                  <Label>Cím</Label>
                                  <Input
                                    value={newPropAddress}
                                    onChange={(e) => setNewPropAddress(e.currentTarget.value)}
                                    placeholder="pl. Kismaros, ..."
                                    maxLength={140}
                                  />
                                </div>
                                <div className="grid gap-1.5">
                                  <Label>Bevételt termel?</Label>
                                  <Select value={newPropIncome} onValueChange={(v) => setNewPropIncome(v as any)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="no">Nem</SelectItem>
                                      <SelectItem value="yes">Igen</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-end md:col-span-4 justify-end">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      const nm = newPropName.trim();
                                      if (!nm) return toast.error("Adj meg ingatlan nevet.");
                                      const id =
                                        typeof crypto !== "undefined" && "randomUUID" in crypto
                                          ? (crypto as any).randomUUID()
                                          : `${Date.now()}`;
                                      const p: RealEstateProperty = {
                                        id,
                                        name: nm,
                                        type: newPropType,
                                        address: newPropAddress.trim(),
                                        estimatedValue: Number.isFinite(newPropValue) ? Math.max(0, newPropValue) : 0,
                                        isIncomeGenerating: newPropIncome === "yes",
                                      };
                                      patchWsDraft(wsResId, { realEstateProperties: [...propsDraft, p] } as any);
                                      setNewPropName("");
                                      setNewPropAddress("");
                                      setNewPropType("primary_residence");
                                      setNewPropValue(0);
                                      setNewPropIncome("no");
                                    }}
                                    title="Ingatlan hozzáadása"
                                  >
                                    + Hozzáadás
                                  </Button>
                                </div>
                              </div>

                              {propsDraft.length === 0 ? (
                                <div className="text-sm text-muted-foreground">Még nincs ingatlan felvéve.</div>
                              ) : (
                                <div className="grid gap-2">
                                  {propsDraft.map((p) => (
                                    <div key={p.id} className="rounded-md border border-border/60 bg-background/50 p-3">
                                      <div className="grid gap-2 md:grid-cols-4">
                                        <div className="grid gap-1.5 md:col-span-2">
                                          <Label>Név</Label>
                                          <Input
                                            value={p.name}
                                            onChange={(e) => {
                                              const next = propsDraft.map((x) =>
                                                x.id === p.id ? { ...x, name: e.currentTarget.value } : x,
                                              );
                                              patchWsDraft(wsResId, { realEstateProperties: next } as any);
                                            }}
                                          />
                                        </div>
                                        <div className="grid gap-1.5">
                                          <Label>Típus</Label>
                                          <Select
                                            value={p.type}
                                            onValueChange={(v) => {
                                              const next = propsDraft.map((x) => (x.id === p.id ? { ...x, type: v as any } : x));
                                              patchWsDraft(wsResId, { realEstateProperties: next } as any);
                                            }}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="primary_residence">Elsődleges</SelectItem>
                                              <SelectItem value="secondary_property">Másodlagos</SelectItem>
                                              <SelectItem value="land_plot">Telek</SelectItem>
                                              <SelectItem value="rental">Kiadó</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="grid gap-1.5">
                                          <Label>Érték (Ft)</Label>
                                          <Input
                                            type="number"
                                            value={String(p.estimatedValue ?? 0)}
                                            onChange={(e) => {
                                              const v = Number(e.currentTarget.value);
                                              const next = propsDraft.map((x) =>
                                                x.id === p.id ? { ...x, estimatedValue: Number.isFinite(v) ? Math.max(0, v) : 0 } : x,
                                              );
                                              patchWsDraft(wsResId, { realEstateProperties: next } as any);
                                            }}
                                          />
                                        </div>
                                        <div className="grid gap-1.5 md:col-span-3">
                                          <Label>Cím</Label>
                                          <Input
                                            value={p.address ?? ""}
                                            onChange={(e) => {
                                              const next = propsDraft.map((x) =>
                                                x.id === p.id ? { ...x, address: e.currentTarget.value } : x,
                                              );
                                              patchWsDraft(wsResId, { realEstateProperties: next } as any);
                                            }}
                                          />
                                        </div>
                                        <div className="grid gap-1.5">
                                          <Label>Bevételt termel</Label>
                                          <Select
                                            value={p.isIncomeGenerating ? "yes" : "no"}
                                            onValueChange={(v) => {
                                              const next = propsDraft.map((x) =>
                                                x.id === p.id ? { ...x, isIncomeGenerating: v === "yes" } : x,
                                              );
                                              patchWsDraft(wsResId, { realEstateProperties: next } as any);
                                            }}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="no">Nem</SelectItem>
                                              <SelectItem value="yes">Igen</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="mt-2 flex items-center justify-end">
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            patchWsDraft(wsResId, {
                                              realEstateProperties: propsDraft.filter((x) => x.id !== p.id),
                                            } as any);
                                          }}
                                        >
                                          Törlés
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ) : null}
                      </div>
                    );
                  })()}

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setWsResOpen(false)}>
                      Bezárás
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        if (!wsResId) return;
                        void saveWsDraft(wsResId);
                      }}
                      title="Mentés"
                    >
                      Mentés
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
            </Card>
          )}

          {show("categories") && (
            <Card>
              <CardHeader>
                <CardTitle>🏷️ Kategóriák</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  🎯 Mire jó? Itt tudod bővíteni a saját kategória-listáidat (Bevétel / Kiadás / Megtakarítás), hogy a
                  rögzítés és az automatikus szabályok gyorsabbak legyenek.
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="grid gap-2 md:col-span-2">
                    <Label>Új kategória neve</Label>
                    <Input
                      value={catNewName}
                      onChange={(e) => setCatNewName(e.currentTarget.value)}
                      placeholder="pl. Üzemanyag, Előfizetések, Bankköltség"
                      maxLength={64}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Típus</Label>
                    <Select value={catNewKind} onValueChange={(v) => setCatNewKind(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Bevétel</SelectItem>
                        <SelectItem value="expense">Kiadás</SelectItem>
                        <SelectItem value="saving">Megtakarítás</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    disabled={!catNewName.trim() || !vaultKey}
                    onClick={async () => {
                      const name = catNewName.trim();
                      const cur = settingsQ.data ?? EMPTY_SETTINGS;
                      const uniqAdd = (arr: string[], v: string) => Array.from(new Set([...arr, v]));
                      const next: any = { ...cur };
                      if (catNewKind === "income") next.incomeCategories = uniqAdd(cur.incomeCategories ?? [], name);
                      else if (catNewKind === "expense") next.expenseCategories = uniqAdd(cur.expenseCategories ?? [], name);
                      else next.savingCategories = uniqAdd(((cur as any).savingCategories ?? []) as string[], name);
                      await saveSettings(next, "Kategória hozzáadva.");
                      setCatNewName("");
                    }}
                    title="Kategória hozzáadása"
                  >
                    Hozzáadás
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { id: "income", title: "Bevétel", items: settings.incomeCategories ?? [] },
                    { id: "expense", title: "Kiadás", items: settings.expenseCategories ?? [] },
                    { id: "saving", title: "Megtakarítás", items: (((settings as any).savingCategories ?? []) as string[]) ?? [] },
                  ].map((g) => (
                    <div key={g.id} className="rounded-lg border border-border/60 bg-background/40 p-3">
                      <div className="text-xs font-medium text-slate-200">{g.title}</div>
                      {g.items.length === 0 ? (
                        <div className="mt-2 text-xs text-muted-foreground">Még nincs egyedi kategória.</div>
                      ) : (
                        <div className="mt-2 flex flex-col gap-1.5">
                          {g.items.slice(0, 50).map((c) => (
                            <div key={c} className="flex items-center justify-between gap-2">
                              <div className="min-w-0 truncate text-xs text-slate-200">{c}</div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-[11px]"
                                onClick={async () => {
                                  const cur = settingsQ.data ?? EMPTY_SETTINGS;
                                  const next: any = { ...cur };
                                  const rm = (arr: string[], v: string) => arr.filter((x) => x !== v);
                                  if (g.id === "income") next.incomeCategories = rm(cur.incomeCategories ?? [], c);
                                  else if (g.id === "expense") next.expenseCategories = rm(cur.expenseCategories ?? [], c);
                                  else next.savingCategories = rm(((cur as any).savingCategories ?? []) as string[], c);
                                  await saveSettings(next, "Kategória törölve.");
                                }}
                                title="Kategória törlése"
                              >
                                Törlés
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {show("backup") && (
            <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>💾 Mentés & Helyreállítás</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={restoreMode} onValueChange={(v) => setRestoreMode(v as any)}>
                    <SelectTrigger className="h-9 w-[140px]" title="Visszaállítás mód">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="merge">Összefűzés</SelectItem>
                      <SelectItem value="replace">Felülírás</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => void exportBackup(false)} title="Teljes mentés (JSON)">
                    Export JSON
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void exportBackup(true)}
                    title="Teljes mentés (Encrypted Backup)"
                  >
                    Export Encrypted
                  </Button>
                  <Button type="button" onClick={() => backupRef.current?.click()} title="Mentés import (restore/merge)">
                    Import…
                  </Button>
                  <input
                    ref={backupRef}
                    type="file"
                    accept=".json,application/json,text/plain"
                    className="hidden"
                    onChange={(e) => void onRestoreFile(e.currentTarget.files?.[0] ?? null)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Export: teljes IndexedDB tartalom (tranzakciók, bankszámlák, beállítások, bank-raw, profilok). Importnál
                válaszd az összefűzést vagy felülírást.
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">Automatikus snapshotok (CSV import előtt)</div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    if (!vaultKey) return toast.error("Nincs feloldott profil.");
                    const dump = await localdb.exportDump();
                    const enc = await encryptJSON(vaultKey, dump);
                    await localdb.putSnapshot({ label: `Manual snapshot: ${new Date().toISOString()}`, data_enc: enc });
                    await qc.invalidateQueries({ queryKey: ["snapshots"] });
                    toast.success("Snapshot elmentve.");
                  }}
                  title="Kézi snapshot mentése"
                >
                  Snapshot mentése
                </Button>
              </div>

              {(snapshotsQ.data ?? []).length === 0 ? (
                <div className="text-sm text-muted-foreground">Még nincs snapshot.</div>
              ) : (
                <div className="rounded-md border border-border/60 bg-background/40">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border/60 text-xs text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">Idő</th>
                        <th className="px-3 py-2 text-left">Címke</th>
                        <th className="px-3 py-2 text-right">Művelet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(snapshotsQ.data ?? []).slice(0, 10).map((s) => (
                        <tr key={s.id} className="border-b border-border/40">
                          <td className="px-3 py-2 font-mono text-xs">{s.created_at}</td>
                          <td className="px-3 py-2">{s.label}</td>
                          <td className="px-3 py-2 text-right">
                            <div className="inline-flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => void restoreSnapshot(s)}
                                title="Snapshot visszaállítása (felülírás)"
                              >
                                Visszaállítás
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={async () => {
                                  await localdb.deleteSnapshot(s.id);
                                  await qc.invalidateQueries({ queryKey: ["snapshots"] });
                                  toast.success("Snapshot törölve.");
                                }}
                                title="Snapshot törlése"
                              >
                                Törlés
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </CardContent>
            </Card>

            <Card id="backup-restore">
              <CardHeader>
                <CardTitle>Titkosított adatmentés és helyreállítás</CardTitle>
                <div className="text-xs text-muted-foreground">
                  Jelszavas (PBKDF2/AES-GCM) vagy belső kulcsos mentés. Workspace szinten is.
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
              <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                <div className="text-xs font-medium text-slate-200">⬇️ Titkosított mentés készítése</div>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Scope</Label>
                    <Select value={encScope} onValueChange={setEncScope}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">🌐 Teljes rendszer (minden munkatér)</SelectItem>
                        {allWorkspaceIds.map((id) => (
                          <SelectItem key={id} value={id}>
                            📁 {workspaceName(id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-[11px] text-muted-foreground">
                      Teljes export: a profil összes adatát viszi. Workspace export: csak az adott munkatér rekordjait.
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Egyedi jelszó a mentéshez (opcionális)</Label>
                    <Input
                      type="password"
                      placeholder="(opcionális) pl. erős-jelszó-123"
                      value={encPass}
                      onChange={(e) => setEncPass(e.currentTarget.value)}
                    />
                    <div className="text-[11px] text-muted-foreground">
                      Ha üresen hagyod, a mentés a feloldott profil belső kulcsával készül (csak itt visszafejthető).
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    onClick={() => void doEncryptedExport()}
                    disabled={encBusy}
                    title="Titkosított mentés letöltése"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Titkosított mentés letöltése
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                <div className="text-xs font-medium text-slate-200">⬆️ Helyreállítás / mentés betöltése</div>
                <div
                  className="mt-3 rounded-md border border-dashed border-border/70 bg-muted/15 p-4"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const f = e.dataTransfer.files?.[0] ?? null;
                    if (f) setImportFile2(f);
                  }}
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">Húzd ide a fájlt, vagy tallózd be</div>
                      <div className="text-xs text-muted-foreground">
                        Támogatott: <span className="font-mono">.json</span>, <span className="font-mono">.meshbak</span>
                      </div>
                      {importFile2 ? (
                        <div className="mt-2 text-xs text-slate-200">
                          Kiválasztva: <span className="font-mono">{importFile2.name}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={() => encImportRef.current?.click()}>
                        Tallózás…
                      </Button>
                      <input
                        ref={encImportRef}
                        type="file"
                        accept=".json,.meshbak,application/json,text/plain"
                        className="hidden"
                        onChange={(e) => setImportFile2(e.currentTarget.files?.[0] ?? null)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Jelszó (ha jelszavas mentés)</Label>
                    <Input
                      type="password"
                      placeholder="Add meg a mentés jelszavát"
                      value={importPass2}
                      onChange={(e) => setImportPass2(e.currentTarget.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Mód</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={importMode2 === "OVERWRITE" ? "destructive" : "outline"}
                        onClick={() => setImportMode2("OVERWRITE")}
                        title="Felülírás (tiszta helyreállítás)"
                      >
                        ⚠️ Felülírás
                      </Button>
                      <Button
                        type="button"
                        variant={importMode2 === "MERGE" ? "default" : "outline"}
                        onClick={() => setImportMode2("MERGE")}
                        title="Hozzáfűzés / merge"
                      >
                        🔄 Hozzáfűzés (Merge)
                      </Button>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Merge: ID alapján deduplikál (azonos ID felülír). Felülírás: érintett scope adatai törlődnek.
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    disabled={encBusy || !importFile2}
                    onClick={() => {
                      if (importMode2 === "OVERWRITE") setOverwriteConfirmOpen(true);
                      else void doEncryptedImport("MERGE");
                    }}
                    title="Mentés beolvasása"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Mentés beolvasása
                  </Button>
                </div>

                <Dialog open={overwriteConfirmOpen} onOpenChange={setOverwriteConfirmOpen}>
                  <DialogContent className="w-full max-w-3xl max-h-[85vh] overflow-y-auto p-8 custom-scrollbar">
                    <DialogHeader>
                      <DialogTitle>Felülírás megerősítése</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 text-sm">
                      <div className="text-muted-foreground">
                        Biztosan felülírod a meglévő adatokat az importált mentéssel? Ez a művelet a scope szerint töröl,
                        majd visszatölt.
                      </div>
                      <div className="rounded-md border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-200">
                        Tipp: ha nem vagy biztos benne, válaszd a Merge módot.
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setOverwriteConfirmOpen(false)}>
                        Mégse
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={encBusy}
                        onClick={() => {
                          setOverwriteConfirmOpen(false);
                          void doEncryptedImport("OVERWRITE");
                        }}
                      >
                        Felülírás indítása
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              </CardContent>
            </Card>
            </>
          )}

          {show("rules") && (
          <Card>
            <CardHeader>
              <CardTitle>⚡ Automatikus besorolási szabályok</CardTitle>
              <div className="text-xs text-muted-foreground">
                🎯 Mire jó? Gyorsítja az importot és a rögzítést: ismétlődő mintákból (pl. „Lidl”, „MÁV”) automatikusan
                kitölti a kategóriát és a partnert.
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>Munkatér</Label>
                    <Select value={ruleWs} onValueChange={setRuleWs}>
                      <SelectTrigger>
                        <span className="truncate">{workspaceName(ruleWs)}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {allWorkspaceIds.map((id) => {
                          const label = workspaceName(id);
                          return (
                            <SelectItem key={id} value={id}>
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label>Kulcsszó / minta</Label>
                    <Input
                      placeholder='pl. "Lidl" vagy regex: re:(MOL|SHELL)'
                      value={ruleKeyword}
                      onChange={(e) => setRuleKeyword(e.currentTarget.value)}
                    />
                    <div className="text-[11px] text-muted-foreground">
                      ⚙️ Regexhez használd a <span className="font-mono">re:</span> előtagot.
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>Mező</Label>
                    <Select value={ruleMatchField} onValueChange={(v) => setRuleMatchField(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Bármely mező (any)</SelectItem>
                        <SelectItem value="description">Leírás / megjegyzés (description)</SelectItem>
                        <SelectItem value="partner">Partner (partner)</SelectItem>
                        <SelectItem value="accountRef">Számla ref (accountRef)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Operátor</Label>
                    <Select value={ruleOperator} onValueChange={(v) => setRuleOperator(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Tartalmazza (contains)</SelectItem>
                        <SelectItem value="startsWith">Ezzel kezdődik (startsWith)</SelectItem>
                        <SelectItem value="equals">Pontosan egyezik (equals)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Címkék (opcionális)</Label>
                    <Input
                      placeholder='pl. "grocery, card"'
                      value={ruleTags}
                      onChange={(e) => setRuleTags(e.currentTarget.value)}
                    />
                    <div className="text-[11px] text-muted-foreground">Vesszővel elválasztva.</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>Kiadás típusa</Label>
                    <Select value={ruleExpenseType} onValueChange={(v) => setRuleExpenseType(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="(üres)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">(üres)</SelectItem>
                        <SelectItem value="FIX_NEED">FIX_NEED</SelectItem>
                        <SelectItem value="VARIABLE_NEED">VARIABLE_NEED</SelectItem>
                        <SelectItem value="WANT">WANT</SelectItem>
                        <SelectItem value="INVESTMENT">INVESTMENT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>MUDA típus</Label>
                    <Select value={ruleMudaType} onValueChange={(v) => setRuleMudaType(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="(üres)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">(üres)</SelectItem>
                        <SelectItem value="NONE">NONE</SelectItem>
                        <SelectItem value="FEES">FEES</SelectItem>
                        <SelectItem value="DUPLICATE_SUBSCRIPTION">DUPLICATE_SUBSCRIPTION</SelectItem>
                        <SelectItem value="IMPULSE_SPEND">IMPULSE_SPEND</SelectItem>
                        <SelectItem value="WASTE">WASTE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Visszatérő?</Label>
                    <div className="flex items-center gap-3 rounded-md border border-border/60 bg-background/40 px-3 py-2">
                      <Checkbox
                        checked={ruleIsRecurring}
                        onCheckedChange={(v: boolean | "indeterminate") => setRuleIsRecurring(v === true)}
                      />
                      <div className="text-sm text-slate-200">ismétlődő</div>
                    </div>
                    <div className="text-[11px] text-muted-foreground">Ha bekapcsolod, importnál jelöli a tételt.</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label>Cél kategória</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px] text-muted-foreground"
                        onClick={() => setRuleNewCatOpen((o) => !o)}
                        title="Új kategória hozzáadása"
                      >
                        + Új kategória
                      </Button>
                    </div>
                    <Select value={ruleCategory} onValueChange={setRuleCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Válassz kategóriát" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          ...(settingsQ.data?.incomeCategories ?? []),
                          ...(settingsQ.data?.expenseCategories ?? []),
                          ...((settingsQ.data as any)?.savingCategories ?? []),
                        ]
                          .filter(Boolean)
                          .slice(0, 200)
                          .map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {ruleNewCatOpen && (
                      <div className="rounded-md border border-border/60 bg-muted/15 p-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          <div className="grid gap-1.5 md:col-span-2">
                            <Label className="text-xs text-slate-300">Kategória neve</Label>
                            <Input
                              placeholder="pl. Üzemanyag, Előfizetések, Bankköltség"
                              value={ruleNewCatName}
                              onChange={(e) => setRuleNewCatName(e.currentTarget.value)}
                              maxLength={64}
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <Label className="text-xs text-slate-300">Típus</Label>
                            <Select value={ruleNewCatKind} onValueChange={(v) => setRuleNewCatKind(v as any)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="income">Bevétel</SelectItem>
                                <SelectItem value="expense">Kiadás</SelectItem>
                                <SelectItem value="saving">Megtakarítás</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRuleNewCatName("");
                              setRuleNewCatOpen(false);
                            }}
                          >
                            Mégse
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={!ruleNewCatName.trim() || !vaultKey}
                            onClick={async () => {
                              if (!vaultKey) return toast.error("Nincs feloldott profil.");
                              const name = ruleNewCatName.trim();
                              const cur = settingsQ.data ?? EMPTY_SETTINGS;
                              const uniq = (arr: string[], v: string) => {
                                const set = new Set(arr.map((x) => x.trim()));
                                set.add(v);
                                return Array.from(set.values());
                              };
                              const next: any = { ...cur };
                              if (ruleNewCatKind === "income") next.incomeCategories = uniq(cur.incomeCategories ?? [], name);
                              else if (ruleNewCatKind === "expense") next.expenseCategories = uniq(cur.expenseCategories ?? [], name);
                              else next.savingCategories = uniq(((cur as any).savingCategories ?? []) as string[], name);
                              await localdb.putSettings(await encryptJSON(vaultKey, next));
                              await qc.invalidateQueries({ queryKey: ["settings"] });
                              setRuleCategory(name);
                              setRuleNewCatName("");
                              setRuleNewCatOpen(false);
                              toast.success("Kategória hozzáadva.");
                            }}
                          >
                            Mentés
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="text-[11px] text-muted-foreground">
                      💡 Pro Tip: kezdd 5–10 gyakori partnerrel (élelmiszer, üzemanyag, bank, bérleti díj), és fokozatosan
                      bővíts.
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Cél partner (opcionális)</Label>
                    <Input
                      placeholder="pl. Lidl, MOL, MÁV"
                      value={rulePartner}
                      onChange={(e) => setRulePartner(e.currentTarget.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    disabled={rulesBusy || !ruleKeyword.trim() || !ruleCategory.trim()}
                    onClick={async () => {
                      if (state.status !== "unlocked") return toast.error("Nincs feloldott profil.");
                      setRulesBusy(true);
                      try {
                        const tags = ruleTags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                          .slice(0, 24);
                        await localdb.putCategoryRule({
                          workspace_id: ruleWs,
                          keyword: ruleKeyword.trim(),
                          pattern: ruleKeyword.trim(),
                          match_field: ruleMatchField,
                          operator: ruleOperator,
                          target_category: ruleCategory.trim(),
                          target_partner: rulePartner.trim() || null,
                          target_type: null,
                          target_tags: tags.length ? tags : null,
                          target_expense_type: ruleExpenseType || null,
                          target_muda_type: ruleMudaType || null,
                          target_is_recurring: ruleIsRecurring,
                          is_active: true,
                        });
                        await qc.invalidateQueries({ queryKey: ["category_rules"] });
                        setRuleKeyword("");
                        setRulePartner("");
                        setRuleTags("");
                        setRuleExpenseType("");
                        setRuleMudaType("");
                        setRuleIsRecurring(false);
                        toast.success("Szabály elmentve.");
                      } catch (e: any) {
                        toast.error(e?.message || "Szabály mentése sikertelen.");
                      } finally {
                        setRulesBusy(false);
                      }
                    }}
                  >
                    Új szabály hozzáadása
                  </Button>
                </div>
              </div>

              {(rulesQ.data ?? []).length === 0 ? (
                <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
                  🎓 Használati tipp: ha a banki import után sok tételt ugyanúgy címkézel, készíts rá egy szabályt – a
                  következő import már „magától rendeződik”.
                </div>
              ) : (
                <div className="rounded-md border border-border/60 bg-background/40">
                  <div className="border-b border-border/60 px-3 py-2 text-xs text-muted-foreground">
                    Aktív szabályok ({(rulesQ.data ?? []).length})
                  </div>
                  <ul className="divide-y divide-border/40">
                    {(rulesQ.data ?? []).map((r) => (
                      <li key={r.id} className="flex flex-col gap-2 px-3 py-2 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {workspaceName(r.workspace_id)} ·{" "}
                            <span className="font-mono text-xs">{r.keyword}</span>{" "}
                            → <span className="text-slate-200">{r.target_category}</span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            Mező: <span className="font-mono text-slate-200">{(r as any).match_field ?? "any"}</span>{" "}
                            · Operátor: <span className="font-mono text-slate-200">{(r as any).operator ?? "contains"}</span>
                            {Array.isArray((r as any).target_tags) && (r as any).target_tags.length ? (
                              <>
                                {" "}
                                · Címkék:{" "}
                                <span className="font-mono text-slate-200">
                                  {((r as any).target_tags as string[]).join(", ")}
                                </span>
                              </>
                            ) : null}
                            {(r as any).target_expense_type ? (
                              <>
                                {" "}
                                · Expense: <span className="font-mono text-slate-200">{String((r as any).target_expense_type)}</span>
                              </>
                            ) : null}
                            {(r as any).target_muda_type ? (
                              <>
                                {" "}
                                · Muda: <span className="font-mono text-slate-200">{String((r as any).target_muda_type)}</span>
                              </>
                            ) : null}
                            {typeof (r as any).target_is_recurring === "boolean" ? (
                              <>
                                {" "}
                                · Ismétlődő:{" "}
                                <span className="font-mono text-slate-200">{(r as any).target_is_recurring ? "igen" : "nem"}</span>
                              </>
                            ) : null}
                          </div>
                          {r.target_partner ? (
                            <div className="text-xs text-muted-foreground truncate">
                              Partner: <span className="text-slate-200">{r.target_partner}</span>
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={r.is_active ? "secondary" : "outline"}
                            onClick={async () => {
                              setRulesBusy(true);
                              try {
                                await localdb.putCategoryRule({ ...(r as any), is_active: !r.is_active });
                                await qc.invalidateQueries({ queryKey: ["category_rules"] });
                              } finally {
                                setRulesBusy(false);
                              }
                            }}
                            title="Ki-/bekapcsolás"
                          >
                            {r.is_active ? "Bekapcsolva" : "Kikapcsolva"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              setRulesBusy(true);
                              try {
                                await localdb.deleteCategoryRule(r.id);
                                await qc.invalidateQueries({ queryKey: ["category_rules"] });
                                toast.success("Szabály törölve.");
                              } finally {
                                setRulesBusy(false);
                              }
                            }}
                            title="Törlés"
                          >
                            Törlés
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setRetroOpen(true)} title="Szabályok futtatása a meglévő tételekre">
                  🔄 Szabályok visszamenőleges futtatása
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDqOpen(true)}
                  title="Adatminőség ellenőrzés a Magán banki tételekre"
                >
                  🧪 Adatminőség (Magán bank)
                </Button>
              </div>

              <Dialog open={retroOpen} onOpenChange={setRetroOpen}>
                <DialogContent className="w-full max-w-3xl max-h-[85vh] overflow-y-auto p-8 custom-scrollbar">
                  <DialogHeader>
                    <DialogTitle>Szabályok futtatása a meglévő tételekre</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    🎯 Mire jó? Ha utólag hozol létre szabályokat, ezzel gyorsan „rendbe tudod húzni” a régi tételeket is.
                    <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-xs">
                      ⚙️ Hogyan működik? Csak az <span className="font-mono">uncategorized</span> tételeket próbálja
                      besorolni, a többit békén hagyja.
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setRetroOpen(false)}>
                      Mégse
                    </Button>
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!vaultKey) return toast.error("Nincs feloldott profil.");
                        setRetroOpen(false);
                        setRulesBusy(true);
                        try {
                          const rows = await localdb.listTxns();
                          let changed = 0;
                          for (const row of rows) {
                            let p: any;
                            try {
                              p = await decryptJSON<any>(vaultKey, row.data_enc);
                            } catch {
                              continue;
                            }
                            const ws = String(p?.workspace ?? p?.workspace_id ?? "personal");
                            const curCat = String(p?.category ?? "");
                            if (curCat !== "uncategorized") continue;
                            const any = [p?.title ?? "", p?.party ?? "", p?.note ?? ""].filter(Boolean).join(" ");
                            const s = suggestFromRules(rulesQ.data ?? [], {
                              workspaceId: ws,
                              any,
                              partner: p?.party ?? "",
                              description: [p?.title ?? "", p?.note ?? ""].filter(Boolean).join(" "),
                              accountRef: p?.account_ref ?? "",
                            });
                            if (!s) continue;
                            const next: any = { ...p };
                            if (s.category) next.category = s.category;
                            if (!next.party && s.partner) next.party = s.partner;
                            if (Array.isArray(s.tags) && s.tags.length) {
                              const cur = Array.isArray(next.tags) ? next.tags : [];
                              next.tags = Array.from(new Set<string>([...cur, ...s.tags].filter(Boolean))).slice(0, 48);
                            }
                            if ((next.category ?? null) === (p.category ?? null) && (next.party ?? null) === (p.party ?? null)) continue;
                            const data_enc = await encryptJSON(vaultKey, next);
                            await localdb.putTxn({ ...row, data_enc });
                            changed++;
                          }
                          await qc.invalidateQueries({ queryKey: ["transactions"] });
                          toast.success(`Kész. Frissített tételek: ${changed}`);
                        } catch (e: any) {
                          toast.error(e?.message || "Futtatás sikertelen.");
                        } finally {
                          setRulesBusy(false);
                        }
                      }}
                    >
                      Futtatás indítása
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={dqOpen} onOpenChange={setDqOpen}>
                <DialogContent className="w-full max-w-3xl max-h-[85vh] overflow-y-auto p-8 custom-scrollbar">
                  <DialogHeader>
                    <DialogTitle>Adatminőség — Magán banki tételek</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div>
                      Ez egy gyors ellenőrzés: hiányzó mezők, <span className="font-mono">uncategorized</span> tételek és
                      duplikált <span className="font-mono">bank_raw_id</span>.
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={rulesBusy || !vaultKey}
                        onClick={async () => {
                          if (!vaultKey) return toast.error("Nincs feloldott profil.");
                          setRulesBusy(true);
                          try {
                            const rows = await localdb.listTxns();
                            const payloads: any[] = [];
                            for (const r of rows) {
                              let p: any;
                              try {
                                p = await decryptJSON<any>(vaultKey, r.data_enc);
                              } catch {
                                continue;
                              }
                              payloads.push(p);
                            }
                            const s = analyzePersonalBankQuality({ payloads });
                            const res = {
                              total: s.totalPersonal,
                              bank: s.totalPersonalBank,
                              uncategorized: s.uncategorized,
                              missingParty: s.missingParty,
                              missingDescription: s.missingDescription,
                              duplicateBankRawIds: s.duplicateBankRawIdsExtraRows,
                              sampleDuplicateBankRawIds: s.sampleDuplicateBankRawIds,
                            };
                            setDqResult(res);
                            toast.success(
                              `Adatminőség ellenőrzés kész. Banki tételek: ${res.bank}, uncategorized: ${res.uncategorized}.`,
                            );
                          } catch (e: any) {
                            toast.error(e?.message || "Ellenőrzés sikertelen.");
                          } finally {
                            setRulesBusy(false);
                          }
                        }}
                      >
                        Ellenőrzés futtatása
                      </Button>
                    </div>

                    {dqResult ? (
                      <div className="rounded-md border border-border/60 bg-background/40 p-3">
                        <div className="text-xs text-muted-foreground">Összegzés</div>
                        <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                          <div>Magán tételek összesen: <span className="font-mono text-slate-200">{dqResult.total}</span></div>
                          <div>Magán banki tételek: <span className="font-mono text-slate-200">{dqResult.bank}</span></div>
                          <div>Uncategorized: <span className="font-mono text-amber-200">{dqResult.uncategorized}</span></div>
                          <div>Hiányzó partner: <span className="font-mono text-slate-200">{dqResult.missingParty}</span></div>
                          <div>Hiányzó leírás: <span className="font-mono text-slate-200">{dqResult.missingDescription}</span></div>
                          <div>Duplikált bank_raw_id extra sorok: <span className="font-mono text-rose-200">{dqResult.duplicateBankRawIds}</span></div>
                        </div>
                        {dqResult.sampleDuplicateBankRawIds.length ? (
                          <div className="mt-3 text-xs text-muted-foreground">
                            Példa duplikált rawId-k:
                            <div className="mt-1 font-mono break-all text-slate-200">
                              {dqResult.sampleDuplicateBankRawIds.join("\n")}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Még nincs futtatva.</div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setDqOpen(false)}>
                      Bezárás
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          )}

          <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
            <DialogContent className="w-full max-w-5xl max-h-[90vh] overflow-y-auto p-8 custom-scrollbar">
              <DialogHeader>
                <DialogTitle>Projekt átalakítása / élesítés</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div className="rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="text-xs text-muted-foreground">Projekt</div>
                  <div className="mt-0.5 text-sm font-medium">{promoteProjectId || "—"}</div>
                </div>

                <div className="grid gap-2">
                  <button
                    type="button"
                    className={`rounded-lg border p-3 text-left ${
                      promoteMode === "new_business"
                        ? "border-[color:var(--color-chart-1)]/40 bg-[color:var(--color-chart-1)]/5"
                        : "border-border/60 bg-background/40"
                    }`}
                    onClick={() => setPromoteMode("new_business")}
                  >
                    <div className="text-sm font-medium">🏢 Új önálló Vállalkozássá alakítás</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      A projekt átkerül a Vállalkozások közé (ugyanaz a tételek/előzmények, csak típus vált).
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`rounded-lg border p-3 text-left ${
                      promoteMode === "attach"
                        ? "border-[color:var(--color-chart-6)]/40 bg-[color:var(--color-chart-6)]/5"
                        : "border-border/60 bg-background/40"
                    }`}
                    onClick={() => setPromoteMode("attach")}
                  >
                    <div className="text-sm font-medium">🌿 Csatolás meglévő Vállalkozás üzletágává</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      A projekt tételei ezentúl beleszámítanak a kiválasztott Vállalkozás P&L-jébe és ÁFA-mérlegébe.
                    </div>
                  </button>
                </div>

                {promoteMode === "attach" && (
                  <div className="grid gap-2">
                    <Label>Vállalkozás kiválasztása</Label>
                    <Select value={promoteTargetBusinessId || "__none"} onValueChange={(v) => setPromoteTargetBusinessId(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">—</SelectItem>
                        {businessOptions.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.alias?.trim() || b.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label>Korábbi kiadások átminősítése (sunk costs)</Label>
                  <Select value={promoteSunkMode} onValueChange={(v) => setPromoteSunkMode(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ne minősítsen át semmit</SelectItem>
                      <SelectItem value="prep_cost">Céges Előkészítési Költség</SelectItem>
                      <SelectItem value="member_loan">Tagi Kölcsön (jelölés)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-[11px] text-muted-foreground">
                    Az átminősítés csak a kézzel rögzített (nem-bank) kiadások címkézését módosítja.
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setPromoteOpen(false)}>
                  Mégse
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    const id = promoteProjectId;
                    if (!id) return;
                    // Auto-snapshot before promotion (best-effort)
                    try {
                      if (vaultKey) {
                        const dump = await localdb.exportDump();
                        const enc = await encryptJSON(vaultKey, dump);
                        await localdb.putSnapshot({ label: `Auto backup (promote): ${id}`, data_enc: enc });
                        await qc.invalidateQueries({ queryKey: ["snapshots"] });
                      }
                    } catch {
                      /* best-effort */
                    }

                    // Optional sunk-cost relabeling (best-effort)
                    if (vaultKey && promoteSunkMode !== "none") {
                      try {
                        const rows = await localdb.listTxns();
                        for (const r of rows) {
                          const p = await decryptJSON<TxnPayload>(vaultKey, r.data_enc);
                          if ((p.workspace ?? "personal") !== id) continue;
                          if (r.type !== "expense") continue;
                          if (p.bank_raw_id) continue; // immutable import
                          const tags = Array.isArray(p.tags) ? p.tags : [];
                          const next: TxnPayload = {
                            ...p,
                            tags: Array.from(new Set([...tags, "sunk_cost"])).slice(0, 12),
                          };
                          if (promoteSunkMode === "prep_cost") {
                            next.title = "Céges előkészítési költség";
                          } else if (promoteSunkMode === "member_loan") {
                            next.title = "Tagi kölcsön (jelölés)";
                          }
                          const data_enc = await encryptJSON(vaultKey, next);
                          await localdb.putTxn({ id: r.id, type: r.type, occurred_at: r.occurred_at, data_enc });
                        }
                        await qc.invalidateQueries({ queryKey: ["transactions"] });
                      } catch {
                        /* best-effort */
                      }
                    }
                    if (promoteMode === "new_business") {
                      await applyWorkspacePatchNow(
                        id,
                        {
                          type: "business" as WorkspaceType,
                          parent_business_id: null,
                          counts_in_business: null,
                          project_mode: null as any,
                        },
                        "Projekt átalakítva Vállalkozássá.",
                      );
                      setPromoteOpen(false);
                      return;
                    }
                    if (!promoteTargetBusinessId || promoteTargetBusinessId === "__none") {
                      toast.error("Válassz Vállalkozást a csatoláshoz.");
                      return;
                    }
                    await applyWorkspacePatchNow(
                      id,
                      {
                        parent_business_id: promoteTargetBusinessId,
                        counts_in_business: true,
                        project_mode: "pilot" as any,
                      },
                      "Projekt csatolva a Vállalkozáshoz.",
                    );
                    setPromoteOpen(false);
                  }}
                >
                  Mentés
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {show("accounts") && (
            <>
          <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Banki CSV import (haladó)</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Fájl kiválasztása
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileRef}
              type="file"
              accept=".xml,text/xml,application/xml,.csv,text/csv"
              className="hidden"
              onChange={(e) => void onFile(e.currentTarget.files?.[0] ?? null)}
            />
            <div className="grid gap-2">
              <Label>Bankszámla</Label>
              <Select value={bankAccountId || "__none"} onValueChange={(v) => setBankAccountId(v === "__none" ? "" : v)}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">—</SelectItem>
                  {(bankAccountsQ.data ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({a.bank_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Cél munkatér</Label>
              <Select value={targetWs} onValueChange={setTargetWs}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowedTargetsForSelectedAccount
                    .filter((w) => w !== "personal")
                    .map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                Importált banki sorok immutable-ként mentődnek, a szerkesztések rávezetett rétegként.
              </div>
              <label className="mt-1 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={forceReimport}
                  onChange={(e) => setForceReimport(e.currentTarget.checked)}
                />
                <span className="text-muted-foreground">
                  Már beolvasott fájl felülírása / deduplikáció figyelmen kívül hagyása
                </span>
              </label>
            </div>
            {status && (
              <div className="rounded-md border bg-background/40 p-3 text-xs text-muted-foreground">
                {status}
              </div>
            )}
            <div className="rounded-md border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
              Drag-and-drop: dobd ide a CSV fájlt.
              <div
                className="mt-3 h-20 rounded-md border border-dashed bg-background/40"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const f = e.dataTransfer.files?.[0] ?? null;
                  void onFile(f);
                }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Megjegyzés</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            A beállítások oldalon tartjuk a “hosszabb” import felületet, a Cashflow oldalon csak egy kompakt gomb marad.
          </CardContent>
        </Card>
            </>
          )}

        {show("danger") && (
        <Card className="border border-red-500/30 bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Veszélyes zóna / Danger Zone <HelpIcon kbId="settings-danger-zone" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Ezek a műveletek adatvesztéssel járnak. Import előzmények törlése biztonságosabb; a munkatér nullázás visszavonhatatlan.
            </div>

            {isDemoProfile && (
              <div
                id="demo-reset"
                className={
                  search.focus === SETTINGS_FOCUS_DEMO_RESET
                    ? "rounded-md border-2 border-amber-400/70 bg-amber-950/20 p-4 ring-2 ring-amber-400/30"
                    : "rounded-md border border-red-500/20 bg-background/40 p-4"
                }
              >
                {search.focus === SETTINGS_FOCUS_DEMO_RESET ? (
                  <p className="mb-2 text-[11px] text-amber-100/90">
                    Itt van az újraindítás. A többi beállítás megtekinthető; írni a jelenlegi verzióban még nem.
                  </p>
                ) : null}
                <div className="text-sm font-medium text-rose-200">DEMO profil eszközök</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  DEMO profiloknál a saját adat feltöltését nem javasoljuk. Itt 1 kattintással törölhetők a generált (teszt) adatok.
                </div>
                <div className="mt-3 grid gap-2 max-w-xl">
                  <Label>Biztonsági kód</Label>
                  <div className="text-sm">
                    Pontosan ezt írd be a megerősítéshez:{" "}
                    <span className="select-all font-mono bg-slate-800 text-rose-300 px-2 py-1 rounded">
                      DEMO_RESET
                    </span>
                  </div>
                  <Input
                    value={demoResetConfirm}
                    onChange={(e) => setDemoResetConfirm(e.currentTarget.value)}
                    placeholder="DEMO_RESET"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={dangerBusy || demoResetConfirm !== "DEMO_RESET"}
                    onClick={async () => {
                      setDangerBusy(true);
                      try {
                        await purgeDemoGeneratedDataForActiveProfile();
                        try {
                          // Also wipe demo-only mesh artifacts (devices/logs) so demos are fully reset.
                          const [logs, devs] = await Promise.all([
                            meshRepo.getAll("logs" as any).catch(() => [] as any[]),
                            meshRepo.getAll("devices" as any).catch(() => [] as any[]),
                          ]);
                          for (const l of logs) {
                            if (String(l?.profileId ?? "") !== profileId) continue;
                            if (String(l?.message ?? "").startsWith("[DEMO]")) {
                              await meshRepo.delete("logs" as any, l.id as any);
                            }
                          }
                          for (const d of devs) {
                            if (String(d?.profileId ?? "") !== profileId) continue;
                            if (String(d?.deviceId ?? "").startsWith("demo-") || String(d?.alias ?? "").includes("demó")) {
                              await meshRepo.delete("devices" as any, d.id as any);
                            }
                          }
                          try {
                            localStorage.removeItem(`ui:demoMeshSeeded:${profileId}`);
                          } catch {
                            /* ignore */
                          }
                        } catch {
                          // ignore
                        }
                        toast.success("DEMO generált adatok törölve.");
                      } catch (e: any) {
                        toast.error(e?.message || "DEMO reset hiba.");
                      } finally {
                        setDangerBusy(false);
                        setDemoResetConfirm("");
                      }
                    }}
                    title="Törli a demo: prefixű tranzakciókat és hiteleket, és lenullázza a demo tervező adatokat."
                  >
                    ♻️ DEMO reset (generált adatok törlése)
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={dangerBusy || demoResetConfirm !== "DEMO_RESET"}
                    onClick={async () => {
                      setDangerBusy(true);
                      try {
                        const ps = await localdb.listProfiles();
                        const demos = ps.filter((p) => String(p.name ?? "").startsWith("DEMO "));
                        for (const p of demos) {
                          await localdb.deleteProfile(p.id);
                        }
                        toast.success(`DEMO profilok törölve: ${demos.length} db`);
                      } catch (e: any) {
                        toast.error(e?.message || "DEMO profil törlés hiba.");
                      } finally {
                        setDangerBusy(false);
                        setDemoResetConfirm("");
                      }
                    }}
                    title="Törli az összes DEMO profilt (DEMO név prefix alapján) erről az eszközről."
                  >
                    🧨 Összes DEMO profil törlése erről az eszközről
                  </Button>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Érintett munkatér</Label>
              <Select value={dangerWsId} onValueChange={setDangerWsId}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="-- Válassz munkateret a művelethez --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Válassz munkateret a művelethez --</SelectItem>
                  {allWorkspaceIds
                    .filter((id) => id !== "__all")
                    .map((id) => (
                      <SelectItem key={id} value={id}>
                        {workspaceName(id)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={dangerBusy || !dangerWsId}
                className={!dangerWsId ? "opacity-40 cursor-not-allowed" : undefined}
                onClick={() => {
                  setDangerConfirm("");
                  setHashesOpen(true);
                }}
                title="Import hashek / fájl memória törlése"
              >
                🔄 Import hashek / fájl memória törlése
              </Button>

              <Button
                type="button"
                variant="destructive"
                disabled={dangerBusy || !dangerWsId}
                className={!dangerWsId ? "opacity-40 cursor-not-allowed" : undefined}
                onClick={() => {
                  setDangerConfirm("");
                  setPurgeOpen(true);
                }}
                title="Munkatér adatainak és import előzményeinek nullázása"
              >
                🗑️ Munkatér adatainak és import előzményeinek nullázása
              </Button>

              <Button
                type="button"
                variant="destructive"
                disabled={dangerBusy || !dangerWsId || dangerWsId === "personal"}
                className={!dangerWsId || dangerWsId === "personal" ? "opacity-40 cursor-not-allowed" : undefined}
                onClick={() => {
                  setDangerConfirm("");
                  setRemoveOpen(true);
                }}
                title="Munkatér végleges eltávolítása (visszavonhatatlan)"
              >
                💥 Munkatér végleges törlése a magból
              </Button>
            </div>

            <Dialog open={hashesOpen} onOpenChange={setHashesOpen}>
              <DialogContent className="w-full max-w-4xl max-h-[85vh] overflow-y-auto p-8 custom-scrollbar">
                <DialogHeader>
                  <DialogTitle>Import hashek / fájl memória törlése</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    🎯 Mire jó? Ha tesztelsz importot vagy újra szeretnél beolvasni korábban látott fájlokat, itt tudod
                    „kinullázni” a deduplikációs memóriát a kiválasztott munkatérhez.
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Biztonsági kód (másolható)</Label>
                    <div className="text-sm">
                      Pontosan ezt kell bemásolnod a megerősítéshez:{" "}
                      <span
                        className="select-all font-mono bg-slate-800 text-rose-300 px-2 py-1 rounded cursor-pointer"
                        title="Kijelöléshez kattints, majd Ctrl+C"
                      >
                        {dangerToken || "—"}
                      </span>
                    </div>
                    <Input
                      value={dangerConfirm}
                      onChange={(e) => setDangerConfirm(e.currentTarget.value)}
                      placeholder={dangerToken || ""}
                      disabled={!dangerWsId}
                    />
                    <div className="text-[11px] text-muted-foreground">
                      3 lépés: munkatér választás → kód kijelölés/másolás → beillesztés és megerősítés.
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setHashesOpen(false)}>
                    Mégse
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={dangerBusy || !dangerWsId || dangerConfirm !== dangerToken}
                    onClick={() => {
                      setHashesOpen(false);
                      void clearImportHashes(dangerWsId);
                    }}
                  >
                    Törlés megerősítése
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={purgeOpen} onOpenChange={setPurgeOpen}>
              <DialogContent className="w-full max-w-4xl max-h-[85vh] overflow-y-auto p-8 custom-scrollbar">
                <DialogHeader>
                  <DialogTitle>Adatok és import memória törlése</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Biztosan törölni szeretnéd a(z){" "}
                    <span className="font-medium">{dangerWsId ? workspaceName(dangerWsId) : "—"}</span> összes rögzített
                    tételét és import előzményét (SHA-256 cache)?
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Biztonsági kód (másolható)</Label>
                    <div className="text-sm">
                      Pontosan ezt kell bemásolnod a megerősítéshez:{" "}
                      <span
                        className="select-all font-mono bg-slate-800 text-rose-300 px-2 py-1 rounded cursor-pointer"
                        title="Kijelöléshez kattints, majd Ctrl+C"
                      >
                        {dangerToken || "—"}
                      </span>
                    </div>
                    <Input
                      value={dangerConfirm}
                      onChange={(e) => setDangerConfirm(e.currentTarget.value)}
                      placeholder={dangerToken || ""}
                      disabled={!dangerWsId}
                    />
                    <div className="text-[11px] text-muted-foreground">
                      A művelet csak akkor indul, ha a kód 100%-ban egyezik.
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setPurgeOpen(false)}>
                    Mégse
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={dangerBusy || !dangerWsId || dangerConfirm !== dangerToken}
                    onClick={() => {
                      setPurgeOpen(false);
                      void purgeWorkspaceData(dangerWsId);
                    }}
                  >
                    Törlés megerősítése
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
              <DialogContent className="w-full max-w-4xl max-h-[85vh] overflow-y-auto p-8 custom-scrollbar">
                <DialogHeader>
                  <DialogTitle>Munkatér végleges eltávolítása</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Ez a művelet visszavonhatatlan! A(z){" "}
                    <span className="font-medium">{dangerWsId ? workspaceName(dangerWsId) : "—"}</span> munkatér és
                    annak minden adata végleg törlődik a rendszerből.
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Biztonsági kód (másolható)</Label>
                    <div className="text-sm">
                      Pontosan ezt kell bemásolnod a megerősítéshez:{" "}
                      <span
                        className="select-all font-mono bg-slate-800 text-rose-300 px-2 py-1 rounded cursor-pointer"
                        title="Kijelöléshez kattints, majd Ctrl+C"
                      >
                        {dangerToken || "—"}
                      </span>
                    </div>
                    <Input
                      value={dangerConfirm}
                      onChange={(e) => setDangerConfirm(e.currentTarget.value)}
                      placeholder={dangerToken || ""}
                      disabled={!dangerWsId}
                    />
                    <div className="text-[11px] text-muted-foreground">
                      A művelet csak akkor indul, ha a kód 100%-ban egyezik.
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setRemoveOpen(false)}>
                    Mégse
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={dangerBusy || !dangerWsId || dangerWsId === "personal" || dangerConfirm !== dangerToken}
                    onClick={() => void removeWorkspacePermanently(dangerWsId)}
                  >
                    OK / Munkatér végleges törlése
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        )}
        </div>
      </main>
    </div>
  );
}

