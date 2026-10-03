import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ExternalLink,
  Folder,
  GripVertical,
  KeyRound,
  Lock,
  Minus,
  PiggyBank,
  Plus,
  QrCode,
  ShieldCheck,
  Sigma,
  Target,
  Trash2,
  TrendingUp,
  Undo2,
  Upload,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";


import { toast } from "sonner";
import { z } from "zod";

import { useFeatureComingSoon } from "@/components/FeatureComingSoon";
import { LeanConsultantPanel } from "@/components/LeanConsultantPanel";
import { ProfileHeader } from "@/components/ProfileHeader";
// (PDCA rotary knob is rendered inside ProfileHeader)
import { AssetTree } from "@/components/AssetTree";
import { RealEstateModule } from "@/components/RealEstateModule";
import { BottomNav } from "@/components/BottomNav";
import { ActRecommendations } from "@/components/ActRecommendations";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useLeanRecommendations } from "@/hooks/useLeanRecommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { detectTransactionChannel } from "@/lib/transactionChannel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  EMPTY_SETTINGS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  BUSINESS_EXPENSE_CATEGORIES,
  BUSINESS_INCOME_CATEGORIES,
  categoryLabel,
  collapseNearDuplicateTxns,
  displayBucketName,
  displayGoalLabel,
  displayTxnLabel,
  computeTotals,
  computeVatSplit,
  expensesByCategory,
  formatMoney,
  monthlySeries,
  txnDayIso,
  monthsUntil,
  type CustomSettings,
  type BusinessLocation,
  type BusinessAsset,
  type BusinessProject,
  type CostKind,
  type VatDeductibility,
  debtNearTermBurden,
  debtNextPendingDue,
  debtPendingTotal,
  type Goal,
  type Loan,
  type PlannedOneOff,
  type RecurringInterval,
  type RecurringItem,
  type SavingBucket,
  type Transaction,
  type TxnHistoryEntry,
  type TxnType,
  type UsageEvent,
  type UsageTemplate,
  type VatMode,
} from "@/lib/finance";
import { decryptJSON, encryptJSON } from "@/lib/crypto";
import { useVault } from "@/lib/vault";
import { localdb, type BankRawRow, type EncGoalRow, type EncTxnRow, type Profile } from "@/lib/localdb";
import { currencyUnit } from "@/i18n/currency";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { getWorkspaceTransactionsGuard } from "@/lib/workspaceGuard";
import { sha256Hex } from "@/lib/hash";
import { fsHandleKey, getDirectoryHandle, setDirectoryHandle } from "@/lib/fsHandleStore";
import { applySuggestion, suggestFromRules } from "@/lib/categoryRules";
import { categorizePersonalBankRow } from "@/lib/personalBankCategorizer";
import { ExportQrDialog, ImportQrDialog } from "@/components/ProfileTransfer";
import { getMeshDeviceId, setMeshActiveProfile, useMeshRepository } from "@/lib/mesh/meshRepository";
import { TransactionListItem } from "@/components/TransactionListItem";
import { LoanDialog } from "@/components/LoanDialog";
import { HelpIcon, LeanTerm } from "@/components/HelpIcon";
import { ProChartCallout } from "@/components/home/ProChartExplain";
import { LedgerTxnRow } from "@/components/LedgerTxnRow";
import { KpiQuickBar } from "@/components/KpiQuickBar";
import { WorkspacePanels, WorkspaceTabs, type PdcaMode } from "@/components/WorkspaceTabs";
import { ConsistencyLampCard, DataLineage } from "@/components/DataLineage";
import { SectionSettingsGear } from "@/components/SectionSettingsGear";
import { MudaHeatmap } from "@/components/MudaHeatmap";
import { RevealPanel } from "@/components/lean-viz/RevealPanel";
import {
  BulletGraph,
  ChartChrome,
  ChartLegendSwatch,
  ExceptionHeatmap,
  FlowSankey,
  SmallMultiples,
  WaterfallChart,
  type VizSpan,
} from "@/components/lean-viz/LeanCharts";
import { groupExpenseWaterfall, type HeatCell, type SankeyLink } from "@/lib/leanViz";
import { PRO_LINE_CLASS, PRO_OPT, PRO_PESS, PRO_REAL } from "@/lib/proChart";
import { RawTransactionAuditTable } from "@/components/RawTransactionAuditTable";
import { computeKaizenAudit } from "@/lib/kaizenEngine";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { analyzeDataConsistency } from "@/lib/dataConsistency";
import { applyPdcaMilestone } from "@/lib/pdcaCycle";
import { analyzeMultiYear } from "@/lib/multiYearAnalytics";
import { suggestedDebtFocus } from "@/lib/debtRecovery";
import { computeCrossWorkspaceBridge } from "@/lib/crossWorkspaceBridge";
import { useReferencesNav } from "@/hooks/useReferencesNav";
import {
  consumeReferencesRestore,
  restoreScrollPosition,
  type ReferencesTabId,
} from "@/lib/referencesNav";
import { computeWorkspaceTint } from "@/lib/workspaceTint";
import { applyWorkspaceSwitch, publishWorkspaceCatalog, WORKSPACE_SWITCH_EVENT } from "@/lib/workspaceSwitch";
import {
  CASE_ENTRY_DEFAULT_WS,
  CASE_ENTRY_TAB_KEY,
  isDemoProfileName,
  visitorLeadForSegment,
  visitorTitleForSegment,
} from "@/lib/demoSession";
import {
  DEMO_GHOST_WORKSPACES,
  isDemoSegmentId,
  purgeDemoGeneratedDataForActiveProfile,
  sanitizeVisitorWorkspaces,
  seedDemoDataForSegment,
  segmentIdFromDemoName,
} from "@/lib/demoSeed";
import { denyShowcaseWrite } from "@/lib/versionPolicy";
import { EducationCasePanel } from "@/components/education/EducationCasePanel";
import { IndustryCasePanel } from "@/components/industry/IndustryCasePanel";
import { ResilienceCasePanel } from "@/components/resilience/ResilienceCasePanel";
import { StrategyCasePanel } from "@/components/strategy/StrategyCasePanel";
import { MasterBaselineCard } from "@/components/pdca/MasterBaselineCard";
import { MASTER_BASELINE, resolveWorkspaceBaseline } from "@/lib/masterBaseline";
import { buildEducationWhatIf, isEducationSegment } from "@/lib/educationCases";
import { buildIndustryWhatIf, isIndustrySegment } from "@/lib/industryCases";
import { isResilienceSegment } from "@/lib/resilienceCases";
import { scenarioLens } from "@/lib/scenarioLens";
import { baselineForSegment, pdcaPhaseExact, scenarioSurface } from "@/lib/scenarioSurface";
import { buildStrategyWhatIf, isStrategySegment } from "@/lib/strategyCases";
const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
];

type TxnPayload = {
  amount: number; // net HUF
  category: string;
  expense_type?: "FIX_NEED" | "VARIABLE_NEED" | "WANT" | "INVESTMENT";
  muda_type?: "NONE" | "DUPLICATE_SUBSCRIPTION" | "FEES" | "IMPULSE_SPEND" | "WASTE";
  is_recurring?: boolean;
  title?: string | null; // jogcím
  party?: string | null; // ügyfél / megnevezés
  frsz?: string | null;
  payment_method?: "transfer" | "cash" | null;
  note: string | null;
  source?: "manual" | "bank";
  bank_raw_id?: string | null;
  bank_account_id?: string | null;
  history?: TxnHistoryEntry[];
  bucket_id?: string | null;
  vat_rate?: number | null;
  vat_treatment?: "hu_gross" | "no_vat" | "reverse_charge" | "foreign";
  vat_review?: boolean;
  tags?: string[];
  location_id?: string | null;
  property_id?: string | null;
  project_id?: string | null;
  asset_id?: string | null;
  cost_kind?: CostKind | null;
  is_asset?: boolean;
  vat_deductibility?: VatDeductibility | null;
  is_resale?: boolean;
  customer_name?: string | null;
  linked_revenue_id?: string | null;
  calculated_margin?: { huf: number; pct: number } | null;
  internal_transfer_kind?: "member_loan_out" | "member_loan_repay" | null;
  internal_transfer_group_id?: string | null;
  internal_transfer_peer_id?: string | null;
  internal_transfer_from?: string | null;
  internal_transfer_to?: string | null;
  workspace?: string;
  eur_amount?: number | null; // net EUR
  eur_rate?: number | null; // HUF / EUR
  status?: "planned" | "committed" | "actual" | null;
  invoice_status?: "unpaid" | "pending" | "paid" | null;
  loan_id?: string | null;
  loan_principal_paid?: number | null;
};
type GoalPayload = { name: string; target_amount: number; workspace?: string; property_id?: string | null };

const CURRENCY = "HUF";

const TYPE_LABEL: Record<TxnType, string> = {
  income: "Bevétel",
  expense: "Kiadás",
  saving: "Megtakarítás",
};

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function fnv1a32Hex(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // unsigned
  return (h >>> 0).toString(16).padStart(8, "0");
}

function parseHuDateToIso(raw: string): string | null {
  const s = raw.trim();
  const m = /^(\d{4})\.(\d{2})\.(\d{2})\.$/.exec(s) ?? /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(s);
  if (!m) return null;
  const [, y, mo, d] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d)).toISOString();
}

type BankCsvRow = {
  accountRef?: string | null;
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

function parseHuPersonalHistorySpreadsheetXml(xmlText: string): BankCsvRow[] {
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) return [];

  const rowEls = Array.from(doc.getElementsByTagName("Row"));
  if (rowEls.length === 0) return [];

  const norm = (s: string) => (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();

  const getIndexAttr = (cell: Element): number | null => {
    // SpreadsheetML: ss:Index (1-based). Handle both namespaced + non-namespaced attributes.
    const direct = cell.getAttribute("ss:Index") ?? cell.getAttribute("Index");
    if (direct) {
      const n = Number(direct);
      return Number.isFinite(n) ? n : null;
    }
    for (const a of Array.from(cell.attributes)) {
      if (a.localName === "Index") {
        const n = Number(a.value);
        return Number.isFinite(n) ? n : null;
      }
    }
    return null;
  };

  const getCellDataText = (cell: Element): string => {
    const data = (cell.getElementsByTagNameNS("*", "Data")[0] ??
      cell.getElementsByTagName("Data")[0]) as Element | undefined;
    return (data?.textContent ?? "").trim();
  };

  const rowValues = (rowEl: Element): string[] => {
    const out: string[] = [];
    let col = 0;
    const cells = Array.from(rowEl.getElementsByTagName("Cell"));
    for (const cell of cells) {
      const idx = getIndexAttr(cell);
      if (idx && idx > 0) col = idx - 1;
      out[col] = getCellDataText(cell);
      col++;
    }
    return out;
  };

  const findHeader = () => {
    for (let i = 0; i < rowEls.length; i++) {
      const vals = rowValues(rowEls[i]!);
      const cols = vals.map(norm);
      const hasAccount = cols.some((c) => c.includes("számla") || c.includes("szamla"));
      const hasAmount = cols.some((c) => c.includes("összeg") || c.includes("osszeg") || c.includes("amount"));
      if (!hasAccount || !hasAmount) continue;
      const idx = {
        accountRef: cols.findIndex((c) => c.includes("számla") || c.includes("szamla")),
        amount: cols.findIndex((c) => c.includes("összeg") || c.includes("osszeg") || c.includes("amount")),
        currency: cols.findIndex((c) => c.includes("deviza") || c.includes("pénznem") || c.includes("penznem") || c.includes("currency")),
        direction: cols.findIndex((c) => c.includes("irány") || c.includes("irany") || c === "t" || c === "j"),
        date: cols.findIndex((c) => c.includes("értéknap") || c.includes("erteknap") || c.includes("dátum") || c.includes("datum")),
        type: cols.findIndex((c) => c.includes("típus") || c.includes("tipus")),
        partner: cols.findIndex((c) => c.includes("partner") || c.includes("név") || c.includes("nev")),
        partnerAccount: cols.findIndex((c) => c.includes("számlaszám") || c.includes("szamlaszam") || c.includes("iban")),
        message: cols.findIndex((c) => c.includes("közlemény") || c.includes("kozlemeny") || c.includes("megjegyz") || c.includes("message")),
      };
      // Minimal: account + amount required.
      if (idx.accountRef < 0 || idx.amount < 0) continue;
      return { headerIdx: i, idx };
    }
    return null;
  };

  const header = findHeader();
  if (!header) return [];

  const parseAmountSigned = (raw: string, directionRaw: string): number | null => {
    const s0 = String(raw ?? "").trim();
    if (!s0) return null;
    const negByParens = s0.includes("(") && s0.includes(")");
    // keep digits + separators + sign
    const cleaned = s0
      .replace(/[^\d,\.\-\+]/g, " ")
      .replace(/\s+/g, "")
      .replace(/\.(?=\d{3}(\D|$))/g, "") // drop thousand dots
      .replace(/,(?=\d{3}(\D|$))/g, "") // drop thousand commas
      .replace(",", "."); // decimal comma -> dot
    const n = parseFloat(cleaned);
    if (!Number.isFinite(n) || n === 0) return null;

    // Determine sign: prefer explicit sign; else use direction if available.
    let signed = n;
    const hasSign = /^[\-\+]/.test(cleaned);
    if (!hasSign) {
      const dir = norm(directionRaw);
      if (dir === "t" || dir.includes("terhel")) signed = -Math.abs(n);
      else if (dir === "j" || dir.includes("jóvá") || dir.includes("jova")) signed = Math.abs(n);
      else signed = n;
    }
    if (negByParens) signed = -Math.abs(signed);
    return signed;
  };

  const parseAnyDateIso = (raw: string): string | null => {
    const s = String(raw ?? "").trim();
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s).toISOString();
    const hu = parseHuDateToIso(s);
    if (hu) return hu;
    const t = Date.parse(s);
    if (Number.isFinite(t)) return new Date(t).toISOString();
    return null;
  };

  const out: BankCsvRow[] = [];
  for (const r of rowEls.slice(header.headerIdx + 1)) {
    const vals = rowValues(r);
    const accountRef = String(vals[header.idx.accountRef] ?? "").trim();
    const amountRaw = String(vals[header.idx.amount] ?? "").trim();
    const currency = String(vals[header.idx.currency] ?? "HUF").trim() || "HUF";
    const direction = String(vals[header.idx.direction] ?? "").trim();
    const valueDateRaw = String(vals[header.idx.date] ?? "").trim();
    const txnType = String(vals[header.idx.type] ?? "").trim();
    const partner = String(vals[header.idx.partner] ?? "").trim();
    const partnerAccount = String(vals[header.idx.partnerAccount] ?? "").trim();
    const message = String(vals[header.idx.message] ?? "").trim();

    const amountSigned = parseAmountSigned(amountRaw, direction);
    if (amountSigned == null) continue;

    const valueDateIso = parseAnyDateIso(valueDateRaw) ?? new Date().toISOString();

    out.push({
      accountRef,
      bookingDateIso: valueDateIso,
      valueDateIso,
      amountSigned,
      currency: currency || "HUF",
      direction: direction || "",
      bookingText: txnType || "",
      message: message || "",
      partner: partner || "",
      partnerAccount: partnerAccount || "",
    });
  }
  return out;
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

function guessTagsFromBankRow(r: BankCsvRow): string[] {
  const hay = `${r.bookingText} ${r.message} ${r.partner}`.toLowerCase();
  const out = new Set<string>();
  if (hay.includes("nav") || hay.includes("adó") || hay.includes("afa") || hay.includes("áfa"))
    out.add("ado");
  if (hay.includes("kártya")) out.add("kartya");
  if (hay.includes("jutal") || hay.includes("jut:") || hay.includes("sms szolg") || hay.includes("díj"))
    out.add("banki_dij");
  if (hay.includes("transferwise") || hay.includes("wise") || hay.includes("paypal")) out.add("deviza");
  if (hay.includes("mvm")) out.add("rezsi");
  return Array.from(out);
}

function guessCostKindFromBankRow(r: BankCsvRow): CostKind {
  const hay = `${r.bookingText} ${r.message} ${r.partner}`.toLowerCase();
  if (hay.includes("szerviz") || hay.includes("jav") || hay.includes("karbant"))
    return "maintenance";
  if (hay.includes("autó") || hay.includes("gumi") || hay.includes("tankol") || hay.includes("biztos"))
    return "opex";
  return "opex";
}

function guessVatTreatmentFromBankRow(
  r: BankCsvRow,
): { treatment: "hu_gross" | "no_vat" | "reverse_charge" | "foreign"; review: boolean } {
  const hay = `${r.bookingText} ${r.message} ${r.partner} ${r.partnerAccount}`.toLowerCase();
  // explicit no-vat/taxes/fees
  if (hay.includes("nav") || hay.includes("adó") || hay.includes("afa") || hay.includes("áfa"))
    return { treatment: "no_vat", review: false };
  if (hay.includes("jutal") || hay.includes("jut:") || hay.includes("sms szolg") || hay.includes("díj"))
    return { treatment: "no_vat", review: false };
  if (hay.includes("kamat")) return { treatment: "no_vat", review: false };

  // likely foreign / special handling
  if (hay.includes("transferwise") || hay.includes("wise") || hay.includes("paypal"))
    return { treatment: "foreign", review: true };

  // card usage often mixed; mark for quick review
  if (hay.includes("kártya")) return { treatment: "foreign", review: true };

  // If partner account is clearly HU IBAN, assume HU gross invoice (lean default).
  const ibanPrefix = (r.partnerAccount || "").trim().toUpperCase().slice(0, 2);
  if (ibanPrefix === "HU")
    return { treatment: "hu_gross", review: false };

  // Non-HU IBAN often implies EU/foreign B2B handling (reverse charge or non-HU VAT) → flag.
  if (/^[A-Z]{2}$/.test(ibanPrefix)) return { treatment: "reverse_charge", review: true };

  // Fallback: assume HU gross but ask review.
  return { treatment: "hu_gross", review: true };
}

export function FinanceDashboard({
  vaultKey,
  profileId,
  profileName,
}: {
  vaultKey: CryptoKey;
  profileId: string;
  profileName: string;
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { lock, state } = useVault();
  const meshRepo = useMeshRepository();
  const { openReferences } = useReferencesNav();
  const { t, locale } = useI18n();

  useEffect(() => {
    setMeshActiveProfile(profileId, profileName);
  }, [profileId, profileName]);

  const appendAudit = useCallback(
    (e: { op: "save" | "delete"; store: string; key?: string; message?: string }) => {
      try {
        void meshRepo.save(
          "logs",
          {
            id: newId(),
            at: new Date().toISOString(),
            profileId,
            deviceId: getMeshDeviceId(),
            op: e.op,
            store: e.store,
            key: e.key,
            message: e.message,
          } as any,
        );
      } catch {
        /* ignore */
      }
    },
    [meshRepo, profileId],
  );

  // Munkaterület fülek (vizuális; adat-szeparáció még nem implementált).
  const DEFAULT_WS_OPTIONS = ["Vállalkozás1", "Projekt1"];
  const [wsOptions, setWsOptions] = useState<string[]>(DEFAULT_WS_OPTIONS);
  const [middleWs, setMiddleWs] = useState<string>("Vállalkozás1");
  const [activeWs, setActiveWs] = useState<"magan" | "middle" | "szumma">("middle");
  const rotatePdcaQuarter = useCallback(() => {
    setPdcaMode((m) => (m === "PD" ? "DC" : m === "DC" ? "CA" : m === "CA" ? "AP" : "PD"));
  }, []);
  const lastNonSzummaRef = useRef<{ activeWs: "magan" | "middle"; middleWs: string }>({
    activeWs: "middle",
    middleWs: "Vállalkozás1",
  });
  const caseEntryAppliedRef = useRef(false);
  const [createWsOpen, setCreateWsOpen] = useState(false);
  const [createWsType, setCreateWsType] = useState<"business" | "project" | "personal" | null>(null);
  const [createWsName, setCreateWsName] = useState("");
  const [createProjectMode, setCreateProjectMode] = useState<"simulation" | "pilot" | "prep" | null>(null);
  const [createPilotBusinessId, setCreatePilotBusinessId] = useState<string>("");
  const [pdcaMode, setPdcaMode] = useState<PdcaMode>("PD");
  const [pdcaNewOpen, setPdcaNewOpen] = useState(false);
  const [wsCreateDenied, setWsCreateDenied] = useState(false);
  const denyWorkspaceCreate = () => {
    setWsCreateDenied(true);
    toast.warning("Ez a funkció a jelenlegi verzióban nem engedélyezett.");
  };
  type SubTab = "cashflow" | "ledger" | "deals" | "inventory";
  // Globális alsó fül: master perspektíva (felső fül váltás nem írja felül).
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("cashflow");
  const [auditDayIso, setAuditDayIso] = useState<string | null>(null);
  type LedgerFilter = "all" | "income" | "expense" | "saving_transfer" | "liability_planned";
  const [ledgerFilter, setLedgerFilter] = useState<LedgerFilter>("all");
  const [ledgerCollapsed, setLedgerCollapsed] = useState(false);
  type CashflowChannelFilter = "all" | "card" | "transfer" | "bank" | "other";
  const [cashflowChannelFilter, setCashflowChannelFilter] = useState<CashflowChannelFilter>("all");
  const [cashflowQuickPage, setCashflowQuickPage] = useState(1);
  const [cashflowQuickPageSize, setCashflowQuickPageSize] = useState<15 | 25 | 50>(25);
  const [ledgerPropertyId, setLedgerPropertyId] = useState<string>("__all");
  type WhatIfScenario = "optimistic" | "realistic" | "pessimistic";
  const [whatIfScenario, setWhatIfScenario] = useState<WhatIfScenario>("realistic");
  const [vizSpan, setVizSpan] = useState<VizSpan>(6);
  const [vizShift, setVizShift] = useState(0);
  const [leanView, setLeanView] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"split" | "full">("split");
  const [preferBankImport, setPreferBankImport] = useState(false);
  const [bankImportNudge, setBankImportNudge] = useState(false);
  const [selectedTxnIds, setSelectedTxnIds] = useState<Set<string>>(new Set());
  const [mudaOpen, setMudaOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkPiggyOpen, setBulkPiggyOpen] = useState(false);
  const [bulkCopyOpen, setBulkCopyOpen] = useState(false);
  const [bulkBucketId, setBulkBucketId] = useState<string>(""); // "" -> general savings
  const [bulkProjectId, setBulkProjectId] = useState<string>("");

  const activeWorkspace =
    activeWs === "magan" ? "personal" : activeWs === "szumma" ? "__all" : middleWs;

  const jumpToReferences = useCallback(
    (tab: ReferencesTabId, highlightIds?: string[], workspaceId?: string) => {
      const ws = workspaceId ?? activeWorkspace;
      openReferences({
        profile: profileId,
        workspace: ws,
        isSzumma: ws === "__all",
        tab,
        highlightIds,
        returnState: {
          activeTab: activeSubTab,
          activeWs,
          middleWs,
          pdcaMode,
        },
      });
    },
    [activeWorkspace, openReferences, profileId, activeSubTab, activeWs, middleWs, pdcaMode],
  );

  useEffect(() => {
    const st = consumeReferencesRestore();
    if (!st) return;
    if (
      st.activeTab === "cashflow" ||
      st.activeTab === "ledger" ||
      st.activeTab === "deals" ||
      st.activeTab === "inventory"
    ) {
      setActiveSubTab(st.activeTab);
    }
    if (st.activeWs === "magan" || st.activeWs === "middle" || st.activeWs === "szumma") {
      setActiveWs(st.activeWs);
    }
    if (st.middleWs) setMiddleWs(st.middleWs);
    if (st.pdcaMode === "PD" || st.pdcaMode === "DC" || st.pdcaMode === "CA" || st.pdcaMode === "AP") {
      setPdcaMode(st.pdcaMode);
    }
    restoreScrollPosition(Number(st.scrollPosition) || 0);
  }, []);

  useEffect(() => {
    if (caseEntryAppliedRef.current) return;
    if (typeof window === "undefined") return;
    let wanted: string | null = null;
    try {
      wanted = sessionStorage.getItem(CASE_ENTRY_TAB_KEY);
    } catch {
      wanted = null;
    }
    if (!wanted) return;
    if (wanted === "personal") {
      caseEntryAppliedRef.current = true;
      try {
        sessionStorage.removeItem(CASE_ENTRY_TAB_KEY);
      } catch {
        /* ignore */
      }
      setActiveWs("magan");
      return;
    }
    const options = wsOptions.filter(Boolean);
    if (!options.length) return;
    if (!options.includes(wanted)) return;
    caseEntryAppliedRef.current = true;
    try {
      sessionStorage.removeItem(CASE_ENTRY_TAB_KEY);
    } catch {
      /* ignore */
    }
    setMiddleWs(wanted);
    setActiveWs("middle");
  }, [wsOptions]);

  useEffect(() => {
    if (activeWs !== "szumma") {
      lastNonSzummaRef.current = { activeWs, middleWs };
    }
  }, [activeWs, middleWs]);

  const toggleSzumma = useCallback(() => {
    if (activeWs === "szumma") {
      setMiddleWs(lastNonSzummaRef.current.middleWs);
      setActiveWs(lastNonSzummaRef.current.activeWs);
    } else {
      setActiveWs("szumma");
    }
  }, [activeWs]);

  useEffect(() => {
    const onSwitch = (e: Event) => {
      const id = (e as CustomEvent<{ id?: string }>).detail?.id;
      if (!id) return;
      applyWorkspaceSwitch(id, { setActiveWs, setMiddleWs });
    };
    window.addEventListener(WORKSPACE_SWITCH_EVENT, onSwitch as EventListener);
    return () => window.removeEventListener(WORKSPACE_SWITCH_EVENT, onSwitch as EventListener);
  }, []);

  const stepBottomTab = useCallback(
    (delta: -1 | 1) => {
      const order: SubTab[] = ["cashflow", "ledger", "deals", "inventory"];
      const i = Math.max(0, order.indexOf(activeSubTab));
      const next = order[(i + delta + order.length) % order.length] ?? "cashflow";
      setActiveSubTab(next);
    },
    [activeSubTab],
  );

  const stepWorkspaceTab = useCallback(
    (delta: -1 | 1) => {
      const order = ["personal", ...wsOptions].filter(Boolean);
      const cur = activeWs === "magan" ? "personal" : activeWs === "middle" ? middleWs : "__all";
      const baseCur = cur === "__all" ? (lastNonSzummaRef.current.activeWs === "magan" ? "personal" : lastNonSzummaRef.current.middleWs) : cur;
      const i = Math.max(0, order.indexOf(baseCur));
      const next = order[(i + delta + order.length) % order.length] ?? "personal";
      if (next === "personal") {
        setActiveWs("magan");
      } else {
        setMiddleWs(String(next));
        setActiveWs("middle");
      }
    },
    [activeWs, middleWs, wsOptions],
  );

  const quickSave = useCallback(() => {
    void (async () => {
      try {
        const d = new Date();
        const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const scope = activeWorkspace === "__all" ? "ALL" : activeWorkspace;
        const txt = await localdb.exportEncryptedData({ scope: scope as any });
        const blob = new Blob([txt], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const scopeName =
          scope === "ALL"
            ? "Teljes_rendszer"
            : scope === "personal"
              ? "Magan"
              : String(scope).trim().replaceAll(" ", "_");
        a.download =
          scope === "ALL"
            ? `mesh_quicksave_full_${ymd}.json`
            : `mesh_quicksave_${scopeName}_${ymd}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success("Gyorsmentés letöltve.");
      } catch (e: any) {
        toast.error(e?.message || "Gyorsmentés sikertelen.");
      }
    })();
  }, [activeWorkspace]);

  useKeyboardShortcuts({
    enabled: true,
    onPrevBottomTab: () => stepBottomTab(-1),
    onNextBottomTab: () => stepBottomTab(1),
    onPrevTopTab: () => stepWorkspaceTab(-1),
    onNextTopTab: () => stepWorkspaceTab(1),
    onSave: quickSave,
    onToggleSzumma: toggleSzumma,
    onRotatePdca: rotatePdcaQuarter,
  });

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    const wsId = activeWorkspace === "__all" ? "ALL" : activeWorkspace;
    const wsName = wsId === "personal" ? "Magán" : wsId === "ALL" ? "Teljes rendszer" : wsId;
    sessionStorage.setItem("ui:activeWorkspaceId", wsId);
    sessionStorage.setItem("ui:activeWorkspaceName", wsName);
  }, [activeWorkspace]);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    const v = localStorage.getItem("pdca_mode");
    if (v === "PD" || v === "DC" || v === "CA" || v === "AP") {
      setPdcaMode(v as PdcaMode);
      return;
    }
    // backward-compat from older 2-state view key
    const legacy = localStorage.getItem("pdca_active_view");
    if (legacy === "PD" || legacy === "CA") setPdcaMode(legacy as PdcaMode);
  }, []);
  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem("pdca_mode", pdcaMode);
  }, [pdcaMode]);

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    const v = sessionStorage.getItem("ui:leanView");
    if (v == null) setLeanView(true);
    else setLeanView(v === "1");
  }, []);
  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem("ui:leanView", leanView ? "1" : "0");
  }, [leanView]);

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    const v = sessionStorage.getItem("ui:viewMode");
    if (v === "full" || v === "split") setViewMode(v);
    const onMode = (event: Event) => {
      const mode = (event as CustomEvent<string>).detail;
      if (mode === "full" || mode === "split") setViewMode(mode);
    };
    window.addEventListener("szcenario:view_mode", onMode as EventListener);
    return () => window.removeEventListener("szcenario:view_mode", onMode as EventListener);
  }, []);
  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem("ui:viewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      setPreferBankImport(localStorage.getItem("ui:preferBankImport") === "1");
      const ts = Number(localStorage.getItem("ui:nudge:bankImport") ?? "0");
      const now = Date.now();
      // Nudge window: 12 seconds
      if (Number.isFinite(ts) && ts > 0 && now - ts < 12_000) {
        setBankImportNudge(true);
        const t = window.setTimeout(() => setBankImportNudge(false), 12_000);
        return () => window.clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, []);



  const txnsQ = useQuery({
    queryKey: ["transactions"],
    queryFn: async (): Promise<Transaction[]> => {
      const rows = await localdb.listTxns();
      rows.sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : -1));
      const out: Transaction[] = [];
      for (const r of rows) {
        try {
          const p = await decryptJSON<TxnPayload>(vaultKey, r.data_enc);
          out.push({
            id: r.id,
            user_id: "local",
            type: r.type,
            occurred_at: r.occurred_at,
            amount: p.amount,
            category: p.category,
            expense_type: (p.expense_type as any) ?? undefined,
            muda_type: (p.muda_type as any) ?? undefined,
            is_recurring: Boolean(p.is_recurring),
            title: p.title ?? null,
            party: p.party ?? null,
            frsz: p.frsz ?? null,
            payment_method: (p.payment_method as "transfer" | "cash" | null) ?? null,
            note: p.note,
            // bank immutability marker (used by editor/UX)
            bank_raw_id: (p.bank_raw_id as any) ?? null,
            bank_account_id: (p.bank_account_id as any) ?? null,
            bucket_id: p.bucket_id ?? null,
            history: p.history ?? [],
            vat_rate: p.vat_rate ?? null,
            vat_treatment: (p.vat_treatment as any) ?? null,
            vat_review: Boolean(p.vat_review),
            tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
            location_id: (p.location_id as any) ?? null,
            property_id: (p.property_id as any) ?? null,
            project_id: (p.project_id as any) ?? null,
            asset_id: (p.asset_id as any) ?? null,
            cost_kind: (p.cost_kind as any) ?? null,
            is_asset: Boolean(p.is_asset),
            vat_deductibility:
              p.vat_deductibility === 1 || p.vat_deductibility === 0.5 || p.vat_deductibility === 0
                ? (p.vat_deductibility as VatDeductibility)
                : null,
            is_resale: Boolean(p.is_resale),
            customer_name: (p.customer_name as any) ?? null,
            linked_revenue_id: (p.linked_revenue_id as any) ?? null,
            calculated_margin: (p.calculated_margin as any) ?? null,
            internal_transfer_kind: (p.internal_transfer_kind as any) ?? null,
            internal_transfer_group_id: (p.internal_transfer_group_id as any) ?? null,
            internal_transfer_peer_id: (p.internal_transfer_peer_id as any) ?? null,
            internal_transfer_from: (p.internal_transfer_from as any) ?? null,
            internal_transfer_to: (p.internal_transfer_to as any) ?? null,
            workspace: p.workspace ?? "personal",
            eur_amount: p.eur_amount ?? null,
            eur_rate: p.eur_rate ?? null,
            status: (p.status as any) ?? "actual",
            invoice_status: (p.invoice_status as any) ?? null,
            loan_id: (p.loan_id as any) ?? null,
            loan_principal_paid: (p.loan_principal_paid as any) ?? null,
          });
        } catch {
          /* skip corrupt / wrong-key row */
        }
      }
      return out;
    },
  });

  const categoryRulesQ = useQuery({
    queryKey: ["category_rules"],
    queryFn: async () => localdb.listCategoryRules(),
    enabled: state.status === "unlocked",
    initialData: [],
  });

  const goalsQ = useQuery({
    queryKey: ["goals"],
    queryFn: async (): Promise<Goal[]> => {
      const rows = await localdb.listGoals();
      rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      const out: Goal[] = [];
      for (const r of rows) {
        try {
          const p = await decryptJSON<GoalPayload>(vaultKey, r.data_enc);
          out.push({
            id: r.id,
            user_id: "local",
            deadline: r.deadline,
            is_active: r.is_active,
            name: p.name,
            target_amount: p.target_amount,
            workspace: p.workspace ?? "personal",
            property_id: (p.property_id as any) ?? null,
          });
        } catch {
          /* skip */
        }
      }
      return out;
    },
  });

  const loansQ = useQuery({
    queryKey: ["loans"],
    queryFn: async (): Promise<Loan[]> => {
      const rows = await localdb.listLoans();
      const out: Loan[] = [];
      for (const r of rows) {
        try {
          const p = await decryptJSON<Omit<Loan, "id">>(vaultKey, r.data_enc);
          out.push({
            id: r.id,
            workspace_id: (p.workspace_id as any) ?? "personal",
            name: (p.name as any) ?? "Tartozás",
            type: (p.type as any) ?? "other",
            original_amount: Number(p.original_amount ?? 0),
            remaining_principal: Number(p.remaining_principal ?? 0),
            monthly_installment: Number(p.monthly_installment ?? 0),
            due_date: (p.due_date as any) ?? new Date().toISOString().slice(0, 10),
            payment_day_of_month: Number(p.payment_day_of_month ?? 10),
            interest_rate_percent: (p.interest_rate_percent as any) ?? null,
            status: (p.status as any) ?? "active",
            partner_name: (p as any).partner_name ?? null,
            frequency: (p as any).frequency ?? null,
            schedule: Array.isArray((p as any).schedule) ? ((p as any).schedule as any) : null,
          });
        } catch {
          /* skip */
        }
      }
      out.sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === "active" ? -1 : 1));
      return out;
    },
  });

  const settingsQ = useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<CustomSettings> => {
      const row = await localdb.getSettings();
      if (!row) return EMPTY_SETTINGS;
      try {
        const s = await decryptJSON<Partial<CustomSettings>>(vaultKey, row.data_enc);
        return {
          __demo: (s as any).__demo ?? null,
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
      } catch {
        return EMPTY_SETTINGS;
      }
    },
  });

  const settings = settingsQ.data ?? EMPTY_SETTINGS;
  const loans = loansQ.data ?? [];

  // DEMO: seed a couple of mesh devices + logs so "Eszközök" / "Napló" screens are not empty.
  const demoSegmentId = useMemo(() => {
    const v = (settings as any)?.__demo?.segmentId;
    const trimmed = typeof v === "string" ? v.trim() : "";
    if (trimmed && isDemoSegmentId(trimmed)) return trimmed;
    return segmentIdFromDemoName(profileName);
  }, [profileName, settings]);
  const surface = useMemo(() => scenarioSurface(demoSegmentId), [demoSegmentId]);
  const lens = useMemo(() => scenarioLens(demoSegmentId, locale), [demoSegmentId, locale]);
  const isVisitorDemo = Boolean(demoSegmentId) || isDemoProfileName(profileName);
  const visitorCaseTitle = visitorTitleForSegment(demoSegmentId, locale);
  const visitorCaseLead = visitorLeadForSegment(demoSegmentId, locale);
  const demoPackHealRef = useRef(false);
  useEffect(() => {
    if (!demoSegmentId || !vaultKey) return;
    if (demoPackHealRef.current) return;
    void (async () => {
      try {
        const rows = await localdb.listTxns();
        let readable = 0;
        for (const r of rows) {
          if (!String(r.id).startsWith("demo:")) continue;
          try {
            await decryptJSON(vaultKey, r.data_enc);
            readable += 1;
            if (readable > 0) break;
          } catch {
            /* wrong-key or corrupt row */
          }
        }
        if (readable > 0) return;
        demoPackHealRef.current = true;
        await purgeDemoGeneratedDataForActiveProfile();
        await seedDemoDataForSegment(demoSegmentId);
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["transactions"] }),
          qc.invalidateQueries({ queryKey: ["loans"] }),
          qc.invalidateQueries({ queryKey: ["goals"] }),
          qc.invalidateQueries({ queryKey: ["settings"] }),
        ]);
      } catch {
        demoPackHealRef.current = false;
      }
    })();
  }, [demoSegmentId, vaultKey, qc]);
  useEffect(() => {
    if (!demoSegmentId) return;
    if (typeof window === "undefined") return;
    const key = `ui:demoMeshSeeded:${profileId}`;
    try {
      if (localStorage.getItem(key) === "1") return;
    } catch {
      /* ignore */
    }
    void (async () => {
      try {
        const thisDeviceId = getMeshDeviceId();
        const otherDeviceId = `demo-${demoSegmentId}-${newId()}`;
        await meshRepo.save(
          "devices",
          {
            id: `${profileId}:${thisDeviceId}`,
            profileId,
            deviceId: thisDeviceId,
            name: "Ez az eszköz",
            alias: null,
            lastSeenAt: new Date().toISOString(),
          } as any,
        );
        await meshRepo.save(
          "devices",
          {
            id: `${profileId}:${otherDeviceId}`,
            profileId,
            deviceId: otherDeviceId,
            name: "Irodai gép (demo)",
            alias: "offline / csak demó",
            lastSeenAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          } as any,
        );
        await meshRepo.save(
          "logs",
          {
            id: newId(),
            at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            profileId,
            deviceId: otherDeviceId,
            op: "hello",
            store: "devices",
            key: otherDeviceId,
            message: "[DEMO] Eszköz csatlakozás (szimulált)",
          } as any,
        );
        await meshRepo.save(
          "logs",
          {
            id: newId(),
            at: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
            profileId,
            deviceId: thisDeviceId,
            op: "save",
            store: "transactions",
            key: `demo:${demoSegmentId}:banklink:fuel`,
            message: "[DEMO] Banki tétel összerendelés (szimulált)",
          } as any,
        );
        await meshRepo.save(
          "logs",
          {
            id: newId(),
            at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
            profileId,
            deviceId: thisDeviceId,
            op: "sync:full",
            store: "mesh",
            message: "[DEMO] Teljes szinkron (szimulált)",
          } as any,
        );
        try {
          localStorage.setItem(key, "1");
        } catch {
          /* ignore */
        }
      } catch {
        // best-effort demo only
      }
    })();
  }, [demoSegmentId, meshRepo, profileId]);

  const workspaceMetas = useMemo(() => {
    const existing = (settings.workspaces ?? []).filter((w) => w && typeof w.id === "string" && Boolean(w.id));
    if (isVisitorDemo && demoSegmentId) {
      return sanitizeVisitorWorkspaces(existing, demoSegmentId);
    }
    if (existing.length > 0) return existing;
    return DEFAULT_WS_OPTIONS.map((id) => ({
      id,
      type: id.toLowerCase().startsWith("projekt") ? ("project" as const) : ("business" as const),
      alias: null,
      description: null,
      color_tag: null,
      bank_sync_folder: null,
      imported_file_hashes: [],
      bank_seen_hashes: [],
      project_mode: id.toLowerCase().startsWith("projekt") ? ("prep" as const) : null,
      completion_pct: id.toLowerCase().startsWith("projekt") ? 25 : null,
      scenario: id.toLowerCase().startsWith("projekt") ? ("realistic" as const) : null,
      parent_business_id: null,
      counts_in_business: null,
    }));
  }, [demoSegmentId, isVisitorDemo, settings.workspaces]);

  const workspaceMetaById = useMemo(() => {
    const m = new Map<string, (typeof workspaceMetas)[number]>();
    for (const w of workspaceMetas) m.set(w.id, w);
    const existingPersonal = m.get("personal") as any;
    if (!existingPersonal) {
      m.set("personal", { id: "personal", type: "personal", alias: "Magán", description: null } as any);
    } else if (existingPersonal.type !== "personal") {
      m.set("personal", { ...existingPersonal, type: "personal" } as any);
    }
    return m;
  }, [workspaceMetas]);

  const workspaceDisplayName = useCallback(
    (wsId: string) => {
      const meta = workspaceMetaById.get(wsId);
      if (wsId === "personal") return t("chrome.personal");
      if (wsId === "__all") return t("dash.szumma");
      return (meta?.alias ?? wsId) as string;
    },
    [t, workspaceMetaById],
  );

  useEffect(() => {
    publishWorkspaceCatalog(
      workspaceMetas.map((w) => ({
        id: w.id,
        label: workspaceDisplayName(w.id),
        hint: w.type === "project" ? t("chrome.project") : w.type === "business" ? t("chrome.business") : t("dash.space"),
        keywords: [w.id, w.alias, w.type, w.description].filter(Boolean).join(" "),
      })),
    );
  }, [t, workspaceDisplayName, workspaceMetas]);

  const workspaceTabLabel = useCallback(
    (wsId: string) => {
      const name = workspaceDisplayName(wsId);
      if (wsId === "personal" || wsId === "__all") return name;
      const meta = workspaceMetaById.get(wsId);
      const isProject = meta?.type === "project" || /^Projekt\d+$/i.test(wsId);
      const suffix = isProject ? "projekt" : "vállalkozás";
      const low = name.trim().toLowerCase();
      if (low.endsWith(` ${suffix}`) || low === suffix) return name;
      return `${name} ${suffix}`;
    },
    [workspaceDisplayName, workspaceMetaById],
  );

  const visibleWsOptions = useMemo(() => {
    return workspaceMetas
      .filter((w) => w.id !== "personal")
      .filter((w) => !(isVisitorDemo && DEMO_GHOST_WORKSPACES.has(w.id)))
      .map((w) => w.id);
  }, [isVisitorDemo, workspaceMetas]);

  const activeLoans = useMemo(() => {
    if (activeWorkspace === "__all") return loans.filter((l) => l.status === "active");
    return loans.filter((l) => l.status === "active" && (l.workspace_id ?? "personal") === activeWorkspace);
  }, [activeWorkspace, loans]);

  const personalLoans = useMemo(() => {
    return loans.filter((l) => l.status === "active" && (l.workspace_id ?? "personal") === "personal");
  }, [loans]);

  const debtFocus = useMemo(() => suggestedDebtFocus(activeLoans), [activeLoans]);

  const loanKpis = useMemo(() => {
    const totalOutstanding = activeLoans.reduce((acc, l) => {
      const fromSchedule = debtPendingTotal(l.schedule);
      if ((l.schedule?.length ?? 0) > 0) return acc + fromSchedule;
      return acc + Math.max(0, Number(l.remaining_principal ?? 0));
    }, 0);
    const monthlyBurden = activeLoans.reduce(
      (acc, l) => acc + debtNearTermBurden(l, 31),
      0,
    );
    const nextMaturity =
      activeLoans
        .map((l) => debtNextPendingDue(l.schedule) ?? l.due_date)
        .filter(Boolean)
        .sort((a, b) => (a! < b! ? -1 : 1))[0] ?? null;
    return { totalOutstanding, monthlyBurden, nextMaturity };
  }, [activeLoans]);

  const upcomingDebtInstallments = useMemo(() => {
    const now = new Date();
    const horizon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 60);
    const rows: Array<{ loanId: string; name: string; partner: string; due_date: string; amount: number }> = [];
    for (const l of activeLoans) {
      const schedule = l.schedule ?? [];
      if (schedule.length === 0) {
        if (l.monthly_installment > 0 && l.due_date) {
          const d = new Date(l.due_date);
          if (!Number.isNaN(d.getTime()) && d >= now && d <= horizon) {
            rows.push({
              loanId: l.id,
              name: l.name,
              partner: l.partner_name ?? "",
              due_date: l.due_date,
              amount: Number(l.monthly_installment),
            });
          }
        }
        continue;
      }
      for (const r of schedule) {
        if (r.status === "paid") continue;
        const d = new Date(r.due_date);
        if (Number.isNaN(d.getTime()) || d < now || d > horizon) continue;
        rows.push({
          loanId: l.id,
          name: l.name,
          partner: l.partner_name ?? "",
          due_date: r.due_date,
          amount: Number(r.amount ?? 0),
        });
      }
    }
    rows.sort((a, b) => (a.due_date < b.due_date ? -1 : 1));
    return rows;
  }, [activeLoans]);

  useEffect(() => {
    // keep wsOptions in sync with settings-backed workspaces
    setWsOptions(visibleWsOptions);
    setMiddleWs((cur) => (visibleWsOptions.includes(cur) ? cur : (visibleWsOptions[0] ?? "Vállalkozás1")));
  }, [visibleWsOptions]);

  // Workspace derivation: personal, business, project, sum.
  const workspaceKind: "personal" | "business" | "project" | "sum" = useMemo(() => {
    if (activeWorkspace === "__all") return "sum";
    if (activeWorkspace === "personal") return "personal";
    const meta = workspaceMetaById.get(activeWorkspace);
    if (meta?.type === "project") return "project";
    if (meta?.type === "personal") return "personal";
    if (meta?.type === "business") return "business";
    // legacy fallback
    return activeWorkspace.toLowerCase().startsWith("projekt") ? "project" : "business";
  }, [activeWorkspace, workspaceMetaById]);
  const businessMode = workspaceKind === "business" || workspaceKind === "project";
  const defaultVat = businessMode ? 27 : 0;
  const vatMode: VatMode = businessMode ? "net" : "gross";
  const activeWorkspaceMeta = useMemo(() => workspaceMetaById.get(activeWorkspace) ?? null, [activeWorkspace, workspaceMetaById]);
  const inheritedBaseline = useMemo(() => {
    const parentId = activeWorkspaceMeta?.parent_business_id ?? null;
    const parent =
      (parentId ? workspaceMetas.find((w) => w.id === parentId) : null) ??
      workspaceMetas.find((w) => w.type === "business") ??
      null;
    return resolveWorkspaceBaseline({
      workspace: activeWorkspaceMeta,
      parent,
      profile: (settings as { master_baseline?: unknown }).master_baseline as never,
      fallback: baselineForSegment(demoSegmentId),
    });
  }, [activeWorkspaceMeta, demoSegmentId, settings, workspaceMetas]);

  const activeFolderTint = useMemo(() => {
    const byId = new Map(workspaceMetas.map((w) => [w.id, w] as const));
    const left: string[] = ["personal"];
    const right: string[] = [];
    for (const id of wsOptions) {
      if (id === "personal") continue;
      const w = byId.get(id);
      if (!w) continue;
      if (w.type === "project") right.push(id);
      else left.push(id);
    }
    const allIds = [...left, ...right];
    const { map } = computeWorkspaceTint(allIds, (id) => {
      if (id === "personal") return "personal";
      const t = byId.get(id)?.type ?? null;
      if (t === "project") return "project";
      if (t === "business") return "business";
      if (t === "personal") return "personal";
      return "business";
    });
    const activeWsId = activeWs === "magan" ? "personal" : activeWs === "middle" ? middleWs : "__all";
    const tint = activeWsId === "__all" ? null : map.get(activeWsId) ?? map.get("personal") ?? null;
    return tint ?? null;
  }, [activeWs, middleWs, workspaceMetas, wsOptions]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (activeFolderTint) {
      root.style.setProperty("--ws-folder-accent", activeFolderTint.accent);
      root.style.setProperty("--ws-folder-accent-bg", activeFolderTint.accentBg);
      root.style.setProperty("--ws-folder-accent-border", activeFolderTint.accentBorder);
      root.style.setProperty("--ws-folder-accent-text", activeFolderTint.accentText);
      root.style.setProperty("--ws-canvas-bg", activeFolderTint.canvasBg);
    } else {
      root.style.removeProperty("--ws-folder-accent");
      root.style.removeProperty("--ws-folder-accent-bg");
      root.style.removeProperty("--ws-folder-accent-border");
      root.style.removeProperty("--ws-folder-accent-text");
      root.style.removeProperty("--ws-canvas-bg");
    }
    return () => {
      root.style.removeProperty("--ws-folder-accent");
      root.style.removeProperty("--ws-folder-accent-bg");
      root.style.removeProperty("--ws-folder-accent-border");
      root.style.removeProperty("--ws-folder-accent-text");
      root.style.removeProperty("--ws-canvas-bg");
    };
  }, [activeFolderTint]);
  const personalWorkspaceMeta = useMemo(() => workspaceMetaById.get("personal") ?? null, [workspaceMetaById]);
  const personalProperties = useMemo(() => {
    const list = (personalWorkspaceMeta as any)?.realEstateProperties;
    return Array.isArray(list) ? (list as any[]) : [];
  }, [personalWorkspaceMeta]);
  const activeVehicles = useMemo(() => {
    const list = (activeWorkspaceMeta as any)?.vehicles;
    return Array.isArray(list) ? (list as any[]) : [];
  }, [activeWorkspaceMeta]);

  const realEstateMonthKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const updateWorkspaceMeta = useCallback(
    (id: string, patch: Record<string, any>, label: string) => {
      const base = (settings.workspaces ?? []).length > 0 ? (settings.workspaces ?? []) : workspaceMetas;
      const next = base.map((w: any) => (w.id === id ? { ...w, ...patch } : w));
      commitSettings({ ...settings, workspaces: next }, label);
    },
    [settings, workspaceMetas, profileId],
  );

  const markWsPdca = useCallback(
    (phase: "plan" | "do" | "check" | "act", opts?: { completeCycle?: boolean; workspaceId?: string }) => {
      const id = opts?.workspaceId ?? (activeWorkspace === "__all" ? "" : activeWorkspace);
      if (!id) return;
      const meta = (workspaceMetaById.get(id) as any) ?? { id, type: "business" };
      const patch = applyPdcaMilestone(meta, phase, opts);
      if (!patch) return;
      updateWorkspaceMeta(id, patch, `PDCA ${phase}`);
    },
    [activeWorkspace, updateWorkspaceMeta, workspaceMetaById],
  );

  // CHECK milestone: muda/cashflow elemzés megnyitása
  useEffect(() => {
    if (pdcaMode === "DC" || pdcaMode === "CA") markWsPdca("check");
  }, [pdcaMode, markWsPdca]);

  const [bankImportStatus, setBankImportStatus] = useState<string>("");
  const bankFileRef = useRef<HTMLInputElement | null>(null);
  const bankXmlFileRef = useRef<HTMLInputElement | null>(null);
  const bankDirHandleRef = useRef<any>(null);
  const onBankCsvFile = useCallback(
    (file: File | null) => {
      if (denyShowcaseWrite(isVisitorDemo)) return;
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setBankImportStatus("Támogatott formátum: Banki XML / SpreadsheetML (.xml)");
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => setBankImportStatus("Nem sikerült beolvasni a fájlt.");
      reader.onload = async () => {
        try {
          const [accounts, maps] = await Promise.all([
            localdb.listBankAccounts(),
            localdb.listBankAccountWorkspaces(),
          ]);
          const normalize = (s: string) =>
            (s ?? "")
              .toUpperCase()
              .replace(/\s+/g, "")
              .replace(/[^A-Z0-9]/g, "");

          const text = String(reader.result ?? "");

          // Dedup by SHA-256 of file contents (best-effort)
          try {
            const hash = await sha256Hex(text);
            const meta = workspaceMetaById.get(activeWorkspace) as any;
            const seen = ((meta?.imported_file_hashes ?? meta?.bank_seen_hashes ?? []) || []) as string[];
            if (seen.includes(hash)) {
              setBankImportStatus("Ez a banki fájl már be lett olvasva (SHA-256 dedup).");
              return;
            }
            const base = (settings.workspaces ?? []).length > 0 ? (settings.workspaces ?? []) : workspaceMetas;
            const next = base.map((w: any) =>
              w.id === activeWorkspace
                ? {
                    ...w,
                    imported_file_hashes: [...seen, hash].slice(-60),
                    bank_seen_hashes: [...seen, hash].slice(-60), // legacy
                  }
                : w,
            );
            commitSettings({ ...settings, workspaces: next }, "Banki dedup hash");
          } catch {
            /* best-effort */
          }

          const rows = parseHuCorporateStatementCsv(text);
          if (rows.length === 0) {
            setBankImportStatus("Nem ismert CSV formátum. (Fejlécet keresek: Számlaazonosító;...)");
            return;
          }

          if (activeWorkspace === "__all") {
            setBankImportStatus("Szumma nézetben import nem indítható. Válts Magán/Vállalkozás munkaterületre.");
            return;
          }

          const ref = normalize((rows[0] as any).accountRef ?? "");
          const detected =
            accounts.find((a) => normalize(a.iban) === ref) ??
            accounts.find((a) => ref && normalize(a.iban).includes(ref)) ??
            null;
          if (!detected) {
            setBankImportStatus("Nincs bankszámla azonosítás ehhez a CSV-hez. Beállítások → Bankszámlák & Profilok.");
            toast.error("Nincs bankszámla azonosítás (Beállítások → Bankszámlák).");
            return;
          }
          const mapped = maps.some((m) => m.bank_account_id === detected.id && m.workspace_id === activeWorkspace);
          if (!mapped) {
            setBankImportStatus("A bankszámla nincs ehhez a munkaterülethez rendelve. Állítsd be a Beállításokban.");
            toast.error("Bankszámla nincs ehhez a munkaterülethez rendelve.");
            return;
          }

          // Auto-backup snapshot before import (best-effort)
          try {
            const dump = await localdb.exportDump();
            const enc = await encryptJSON(vaultKey, dump);
            await localdb.putSnapshot({ label: `Auto backup (CSV import): ${file.name}`, data_enc: enc });
            await qc.invalidateQueries({ queryKey: ["snapshots"] });
          } catch {
            /* best-effort */
          }

          let saved = 0;
          let needsReview = 0;
          let skippedNonHuf = 0;
          for (const r of rows) {
            if (r.currency && r.currency.toUpperCase() !== "HUF") {
              skippedNonHuf++;
              continue; // first pass: HUF only
            }
            const type: TxnType = r.amountSigned < 0 ? "expense" : "income";
            const gross = Math.abs(r.amountSigned);
            const rawId = `bankraw:${detected.id}:${fnv1a32Hex(
              [
                (r as any).accountRef ?? "",
                r.bookingDateIso.slice(0, 10),
                r.valueDateIso.slice(0, 10),
                String(r.amountSigned),
                r.bookingText,
                r.message,
                r.partner,
                r.partnerAccount,
              ].join("|"),
            )}`;

            // Immutable raw record (only inserted once, deduped by id).
            await localdb.putBankRaw({
              id: rawId,
              workspace: activeWorkspace,
              bank_account_id: detected.id,
              account_ref: (r as any).accountRef ?? null,
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
              amount: storedNet, // always store NET; imported amount is bank gross, converted when HU gross
              category: guessBusinessCategoryFromBankRow(r),
              title: r.bookingText || null,
              party: r.partner || null,
              payment_method: r.bookingText.toLowerCase().includes("átutal") ? "transfer" : null,
              note: r.message || null,
              source: "bank",
              bank_raw_id: rawId,
              bank_account_id: detected.id,
              status: "actual",
              tags: guessTagsFromBankRow(r),
              location_id: null,
              project_id: null,
              asset_id: null,
              cost_kind: guessCostKindFromBankRow(r),
              is_asset: false,
              bucket_id: null,
              vat_rate: appliedRate,
              vat_treatment: vatGuess.treatment,
              vat_review: vatGuess.review,
              vat_deductibility: 1,
              workspace: activeWorkspace,
              eur_amount: null,
              eur_rate: null,
            };
            // Auto-rule apply (best-effort): can refine category/partner based on prior patterns.
            try {
              const s = suggestFromRules(categoryRulesQ.data ?? [], {
                workspaceId: activeWorkspace,
                text: [payload.title ?? "", payload.party ?? "", payload.note ?? "", r.message ?? "", r.bookingText ?? ""]
                  .filter(Boolean)
                  .join(" "),
              });
              Object.assign(payload, applySuggestion(payload, s));
            } catch {
              /* best-effort */
            }
            const txnId = `banktxn:${activeWorkspace}:${rawId}`;
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
          setBankImportStatus(
            `Import kész: ${saved} tétel. ÁFA: HU tételeknél bruttóból nettó (alap ${defaultVat}%), gyanús tételek jelölve (${needsReview}).${skippedNonHuf ? ` Kihagyva (nem HUF): ${skippedNonHuf}.` : ""}`,
          );
          appendAudit({
            op: "save",
            store: "bank_import",
            key: activeWorkspace === "__all" ? "personal" : activeWorkspace,
            message: `Banki CSV import: ${saved} tétel (jelölt: ${needsReview})`,
          });
        } catch (e) {
          setBankImportStatus(e instanceof Error ? e.message : "Import hiba.");
        }
      };
      reader.readAsText(file);
      setBankImportStatus("Beolvasás…");
    },
    [activeWorkspace, defaultVat, qc, vaultKey, appendAudit, isVisitorDemo],
  );

  const onBankPersonalXmlText = useCallback(
    async (input: { fileName: string; text: string; fileSize?: number | null; bypassWantsLock?: boolean }) => {
      if (denyShowcaseWrite(isVisitorDemo)) return;
      try {
        const activeWorkspaceId = (activeWorkspace && activeWorkspace !== "__all" ? activeWorkspace : "") || "magan";
        console.log("[BANK IMPORT DEBUG] Current active workspace:", activeWorkspaceId);
        console.log("[bank:personal] import:start", {
          fileName: input.fileName,
          fileSize: input.fileSize ?? null,
          textBytes: input.text?.length ?? 0,
          activeWorkspace,
        });
        toast.message(`XML feldolgozás: ${input.fileName}`, {
          description: `Munkaterület: ${activeWorkspace} · méret: ${input.fileSize ?? input.text.length} byte`,
        });

        const [accounts, maps] = await Promise.all([localdb.listBankAccounts(), localdb.listBankAccountWorkspaces()]);
        const normalize = (s: string) =>
          (s ?? "")
            .toUpperCase()
            .replace(/\s+/g, "")
            .replace(/[^A-Z0-9]/g, "");

        // Dedup by SHA-256 of file contents (best-effort)
        try {
          const hash = await sha256Hex(input.text);
          const meta = workspaceMetaById.get(activeWorkspaceId) as any;
          const seen = ((meta?.imported_file_hashes ?? meta?.bank_seen_hashes ?? []) || []) as string[];
          if (seen.includes(hash)) {
            // Don't hard-stop: txns are still deduped by rawId, so we can safely rescan.
            setBankImportStatus("Ez a banki fájl már be lett olvasva (SHA-256). Újraellenőrzés (rawId dedup)...");
          } else {
            updateWorkspaceMeta(
              activeWorkspaceId,
              {
                imported_file_hashes: [...seen, hash].slice(-60),
                bank_seen_hashes: [...seen, hash].slice(-60), // legacy
              },
              "Banki dedup hash",
            );
          }
        } catch {
          /* best-effort */
        }

        const rows = parseHuPersonalHistorySpreadsheetXml(input.text);
        console.log("[bank:personal] parsedRows", { parsedRows: rows.length, activeWorkspace, fileName: input.fileName });
        if (rows.length === 0) {
          console.log("[XML SAMPLE]", String(input.text ?? "").slice(0, 500));
          setBankImportStatus("Nem ismert XML formátum. (HISTORY_… SpreadsheetML kivonatot várok.)");
          toast.error("HIBA: Az XML struktúrából nem sikerült tranzakciókat kinyerni. Ellenőrizd a fájl formátumát!");
          return;
        }

        if (activeWorkspace === "__all") {
          setBankImportStatus("Szumma nézetben import nem indítható. Válts Magán/Vállalkozás munkaterületre.");
          return;
        }

        const ref = normalize((rows[0].accountRef ?? "") as string);
        const detected =
          accounts.find((a) => normalize(a.iban) === ref) ?? accounts.find((a) => ref && normalize(a.iban).includes(ref)) ?? null;
        if (!detected) {
          setBankImportStatus("Nincs bankszámla azonosítás ehhez az XML-hez. Beállítások → Bankszámlák & Profilok.");
          toast.error("Nincs bankszámla azonosítás (Beállítások → Bankszámlák).");
          return;
        }
        const mapped = maps.some((m) => m.bank_account_id === detected.id && m.workspace_id === activeWorkspaceId);
        if (!mapped) {
          setBankImportStatus("A bankszámla nincs ehhez a munkaterülethez rendelve. Állítsd be a Beállításokban.");
          toast.error("Bankszámla nincs ehhez a munkaterülethez rendelve.");
          return;
        }

        // Auto-backup snapshot before import (best-effort)
        try {
          const dump = await localdb.exportDump();
          const enc = await encryptJSON(vaultKey, dump);
          await localdb.putSnapshot({ label: `Auto backup (XML import): ${input.fileName}`, data_enc: enc });
          await qc.invalidateQueries({ queryKey: ["snapshots"] });
        } catch {
          /* best-effort */
        }

        // Dedupe by rawId in the *workspace transactions list* (not by immutable raw table).
        const existingRawIds = new Set<string>();
        const recurringCountByKey = new Map<string, number>();
        const recurringMonthsByKey = new Map<string, Set<string>>();
        const normKey = (s: string) => (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
        const monthKey = (iso: string) => String(iso ?? "").slice(0, 7); // YYYY-MM
        const recurringKeyOf = (p: { party?: any; title?: any; category?: any }) => {
          const party = normKey(String(p.party ?? ""));
          const title = normKey(String(p.title ?? ""));
          const cat = normKey(String(p.category ?? ""));
          const base = party || title || "unknown";
          return `${base}|${cat}`.slice(0, 180);
        };
        let existingTxns: EncTxnRow[] = [];
        try {
          const existing = await localdb.listTxns();
          existingTxns = existing;
          console.log("[BANK IMPORT DEBUG] Total items in DB before sync:", existingTxns.length);
          for (const r of existingTxns) {
            try {
              const p = await decryptJSON<TxnPayload>(vaultKey, r.data_enc);
              const ws = String(p.workspace ?? "personal");
              const rid = String((p.bank_raw_id as any) ?? "");
              if (ws === activeWorkspaceId && rid) existingRawIds.add(rid);

              // Recurring stats (best-effort): last ~180 days, bank expenses only
              if (ws === activeWorkspaceId && r.type === "expense" && (p.source === "bank" || p.bank_raw_id)) {
                const t = Date.parse(r.occurred_at);
                if (Number.isFinite(t) && t >= Date.now() - 180 * 24 * 60 * 60 * 1000) {
                  const k = recurringKeyOf(p as any);
                  recurringCountByKey.set(k, (recurringCountByKey.get(k) ?? 0) + 1);
                  const mk = monthKey(r.occurred_at);
                  const set = recurringMonthsByKey.get(k) ?? new Set<string>();
                  set.add(mk);
                  recurringMonthsByKey.set(k, set);
                }
              }
            } catch {
              /* skip corrupt / wrong-key row */
            }
          }
        } catch {
          /* best-effort */
        }

        const deriveExpenseType = (category: string, txnType: TxnType): TxnPayload["expense_type"] => {
          const c = String(category ?? "");
          if (txnType === "saving" || c === "savings") return "INVESTMENT";
          if (txnType !== "expense") return undefined;
          if (c === "utilities" || c === "housing" || c === "loan_repayment") return "FIX_NEED";
          if (c === "food" || c === "health" || c === "transport") return "VARIABLE_NEED";
          if (c === "entertainment" || c === "shopping" || c === "education") return "WANT";
          if (c === "uncategorized" || c === "other") return "WANT";
          return "VARIABLE_NEED";
        };

        const meta = workspaceMetaById.get(activeWorkspaceId) as any;
        const limitRaw = meta?.wants_budget_monthly_huf;
        const wantsLimit =
          typeof limitRaw === "number" ? limitRaw : limitRaw == null ? null : Number(limitRaw);
        const wantsLimitHuf = Number.isFinite(wantsLimit) && (wantsLimit as number) > 0 ? (wantsLimit as number) : null;

        const now = new Date();
        let currentWantsThisMonth = 0;

        let saved = 0;
        let duplicates = 0;
        let skippedNonHuf = 0;
        type Candidate = { txnId: string; type: TxnType; occurred_at: string; payload: TxnPayload; rawId: string; isWantThisMonth: boolean; addWantHuf: number };
        const candidates: Candidate[] = [];

        // Pre-calc current month WANT spend from existing data (for soft lock confirmation).
        try {
          const existing = existingTxns.length ? existingTxns : await localdb.listTxns();
          for (const r of existing) {
            if (r.type !== "expense") continue;
            try {
              const p = await decryptJSON<TxnPayload>(vaultKey, r.data_enc);
              const ws = String(p.workspace ?? "personal");
              if (ws !== activeWorkspaceId) continue;
              if ((p.expense_type as any) !== "WANT") continue;
              const d = new Date(String(r.occurred_at ?? ""));
              if (!Number.isFinite(d.getTime())) continue;
              if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) continue;
              currentWantsThisMonth += Math.max(0, Number(p.amount ?? 0));
            } catch {
              /* skip corrupt */
            }
          }
        } catch {
          /* best-effort */
        }

        for (const r of rows) {
          if (r.currency && r.currency.toUpperCase() !== "HUF") {
            skippedNonHuf++;
            continue;
          }
          const type: TxnType = r.amountSigned < 0 ? "expense" : "income";
          const gross = Math.abs(r.amountSigned);
          const rawId = `bankraw:${detected.id}:${fnv1a32Hex(
            [
              r.accountRef ?? "",
              r.bookingDateIso.slice(0, 10),
              r.valueDateIso.slice(0, 10),
              String(r.amountSigned),
              r.bookingText,
              r.message,
              r.partner,
              r.partnerAccount,
            ].join("|"),
          )}`;

          if (existingRawIds.has(rawId)) {
            duplicates++;
            continue;
          }

          try {
            await localdb.putBankRaw({
              id: rawId,
              workspace: activeWorkspaceId,
              bank_account_id: detected.id,
              account_ref: (r.accountRef ?? null) as any,
              ingested_at: new Date().toISOString(),
              booking_date_iso: r.bookingDateIso,
              value_date_iso: r.valueDateIso,
              amount_signed: r.amountSigned,
              currency: r.currency,
              booking_text: r.bookingText,
              message: r.message,
              partner: r.partner,
              partner_account: r.partnerAccount,
              source_file: input.fileName,
            } satisfies Omit<BankRawRow, "profile_id">);
          } catch {
            /* best-effort */
          }

          const bookingHay = `${r.bookingText} ${r.message} ${r.partner} ${r.partnerAccount} ${r.accountRef ?? ""}`.toLowerCase();
          const auto = categorizePersonalBankRow({
            row: {
              accountRef: r.accountRef ?? null,
              amountSigned: r.amountSigned,
              bookingText: r.bookingText,
              message: r.message,
              partner: r.partner,
              partnerAccount: r.partnerAccount,
            },
            workspaceId: activeWorkspaceId,
            rules: categoryRulesQ.data ?? [],
          });
          const baseExpenseType = auto.expense_type ?? deriveExpenseType(auto.category, type);

          const recKey = `${normKey(r.partner || r.bookingText)}|${normKey(auto.category)}`.slice(0, 180);
          const prevCount = recurringCountByKey.get(recKey) ?? 0;
          const prevMonths = recurringMonthsByKey.get(recKey) ?? new Set<string>();
          const isRecurring =
            auto.is_recurring ??
            (prevCount >= 2 && (prevMonths.size >= 2 || prevMonths.has(monthKey(r.bookingDateIso))));
          const isImpulse =
            baseExpenseType === "WANT" &&
            type === "expense" &&
            gross > 0 &&
            gross <= 8000 &&
            prevCount >= 3;
          const mudaType: TxnPayload["muda_type"] = auto.muda_type ?? (isImpulse ? "IMPULSE_SPEND" : "NONE");

          const payload: TxnPayload = {
            amount: gross,
            category: auto.category,
            expense_type: baseExpenseType,
            muda_type: mudaType,
            is_recurring: Boolean(isRecurring),
            title: r.bookingText || null,
            party: r.partner || null,
            payment_method: auto.payment_method,
            note: r.message || null,
            source: "bank",
            bank_raw_id: rawId,
            bank_account_id: detected.id,
            status: "actual",
            tags: auto.tags.length ? auto.tags : undefined,
            bucket_id: null,
            workspace: activeWorkspaceId,
            eur_amount: null,
            eur_rate: null,
            vat_rate: null,
            vat_treatment: "no_vat",
            vat_review: false,
            vat_deductibility: null,
          };

          // User category_rules can optionally refine partner/category if payload field is empty.
          // (Auto-categorizer already gives a category, so this mostly helps party when missing.)
          try {
            const s = suggestFromRules(categoryRulesQ.data ?? [], {
              workspaceId: activeWorkspaceId,
              any: bookingHay,
              partner: payload.party ?? "",
              description: [payload.title ?? "", payload.note ?? ""].filter(Boolean).join(" "),
              accountRef: r.accountRef ?? "",
            });
            Object.assign(payload, applySuggestion(payload, s));
          } catch {
            /* best-effort */
          }

          const txnId = `banktxn:${activeWorkspaceId}:${rawId}`;
          const exists = await localdb.getTxn(txnId);
          if (exists) {
            duplicates++;
            continue;
          }
          const isWantThisMonth =
            type === "expense" &&
            (payload.expense_type ?? null) === "WANT" &&
            (() => {
              const d = new Date(String(r.bookingDateIso ?? ""));
              return Number.isFinite(d.getTime()) && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            })();
          candidates.push({
            txnId,
            type,
            occurred_at: r.bookingDateIso,
            payload,
            rawId,
            isWantThisMonth,
            addWantHuf: isWantThisMonth ? Math.max(0, Number(payload.amount ?? 0)) : 0,
          });
          recurringCountByKey.set(recKey, prevCount + 1);
          const mk = monthKey(r.bookingDateIso);
          const set = recurringMonthsByKey.get(recKey) ?? new Set<string>();
          set.add(mk);
          recurringMonthsByKey.set(recKey, set);
        }

        const addedWantThisMonth = candidates.reduce((a, c) => a + (c.addWantHuf ?? 0), 0);
        if (
          wantsLimitHuf != null &&
          !input.bypassWantsLock &&
          addedWantThisMonth > 0 &&
          currentWantsThisMonth + addedWantThisMonth > wantsLimitHuf
        ) {
          const overBy = Math.max(0, currentWantsThisMonth + addedWantThisMonth - wantsLimitHuf);
          setWantsLockPending({
            kind: "bankImport",
            overBy,
            limit: wantsLimitHuf,
            input: { fileName: input.fileName, text: input.text, fileSize: input.fileSize ?? null, bypassWantsLock: true },
          });
          setWantsLockOpen(true);
          setBankImportStatus("WANT keret túllépés — megerősítés szükséges.");
          return;
        }

        for (const c of candidates) {
          const data_enc = await encryptJSON(vaultKey, c.payload);
          await localdb.putTxn({ id: c.txnId, type: c.type, occurred_at: c.occurred_at, data_enc });
          saved++;
          existingRawIds.add(c.rawId);
        }
        console.log("[BANK IMPORT DEBUG] Items inserted:", saved);

        await qc.invalidateQueries({ queryKey: ["transactions"] });
        await qc.refetchQueries({ queryKey: ["transactions"] });
        const msg = `Sikeres banki szinkron: ${saved} új tétel hozzáadva (${duplicates} duplikátum kihagyva)${
          skippedNonHuf ? `, nem HUF: ${skippedNonHuf}` : ""
        }.`;
        setBankImportStatus(msg);
        toast.success(msg);
        console.log("[bank:personal] import:done", { saved, duplicates, skippedNonHuf, activeWorkspace, fileName: input.fileName });
        appendAudit({
          op: "save",
          store: "bank_import",
          key: activeWorkspace,
          message: `Magán banki XML import: ${saved} tétel`,
        });
      } catch (e) {
        setBankImportStatus(e instanceof Error ? e.message : "XML import hiba.");
        console.log("[bank:personal] import:error", e);
      }
    },
    [activeWorkspace, appendAudit, qc, vaultKey, workspaceMetaById, updateWorkspaceMeta, categoryRulesQ.data, isVisitorDemo],
  );

  const syncPersonalBankFromLatestFileInFolder = useCallback(async () => {
    if (denyShowcaseWrite(isVisitorDemo)) return;
    if (activeWorkspace === "__all") {
      setBankImportStatus("Szumma nézetben import nem indítható. Válts Magán/Vállalkozás munkaterületre.");
      return;
    }
    try {
      const key = fsHandleKey({ profileId, workspaceId: activeWorkspace, kind: "bank-personal" });
      let dir = bankDirHandleRef.current;
      if (!dir) dir = await getDirectoryHandle(key);
      if (!dir) {
        const picker = (window as any).showDirectoryPicker;
        if (typeof picker !== "function") {
          setBankImportStatus("A böngésző nem támogatja a mappa-szinkront. Használd a fájl kiválasztást.");
          bankXmlFileRef.current?.click();
          return;
        }
        dir = await picker();
        bankDirHandleRef.current = dir;
        try {
          await setDirectoryHandle(key, dir);
        } catch {
          /* best-effort */
        }
      }

      let best: { name: string; file: File } | null = null;
      for await (const [name, handle] of (dir as any).entries()) {
        if (!handle || handle.kind !== "file") continue;
        const lower = String(name).toLowerCase();
        if (!(lower.endsWith(".xml") || lower.endsWith(".csv"))) continue;
        const file: File = await handle.getFile();
        if (!best || file.lastModified > best.file.lastModified) best = { name, file };
      }

      if (!best) {
        setBankImportStatus("Nem találok .xml (vagy .csv) kivonat fájlt a kiválasztott mappában.");
        return;
      }

      console.log("[bank:personal] sync:latestFile", {
        fileName: best.name,
        size: best.file.size,
        lastModified: best.file.lastModified,
        activeWorkspace,
      });
      toast.message("Magán banki szinkron indult", {
        description: `${best.name} · ${best.file.size} byte · ws=${activeWorkspace}`,
      });

      setBankImportStatus(`Szinkron… (${best.name})`);
      const text = await best.file.text();
      if (String(best.name).toLowerCase().endsWith(".csv")) {
        setBankImportStatus("Ez a Magán szinkron XML (SpreadsheetML) kivonatot vár. CSV-t a Vállalkozás import kezeli.");
        toast.warning("Nem megfelelő formátum (Magán)", {
          description: "Magán szinkron: Banki XML / SpreadsheetML (.xml)",
        });
        return;
      }
      await onBankPersonalXmlText({ fileName: best.name, text, fileSize: best.file.size });
    } catch (e) {
      setBankImportStatus(e instanceof Error ? e.message : "Mappa-szinkron hiba.");
    }
  }, [activeWorkspace, onBankPersonalXmlText, profileId, isVisitorDemo]);

  const saveSettings = useMutation({
    mutationFn: async (next: CustomSettings) => {
      const data_enc = await encryptJSON(vaultKey, next);
      await localdb.putSettings(data_enc);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const visitorWsSigRef = useRef<string>("");
  useEffect(() => {
    if (!isVisitorDemo || !demoSegmentId || !settingsQ.isSuccess || saveSettings.isPending) return;
    const next = sanitizeVisitorWorkspaces(settings.workspaces ?? [], demoSegmentId);
    const fingerprint = (list: typeof next) =>
      JSON.stringify(
        list.map((w) => ({
          id: w.id,
          alias: w.alias ?? null,
          partners: ((w as any).partners ?? []).map((p: any) => p?.id ?? p?.name),
          duties: ((w as any).duties ?? []).map((d: any) => d?.id ?? d?.name),
        })),
      );
    const sig = fingerprint(next);
    if (sig === fingerprint(settings.workspaces ?? [])) return;
    if (visitorWsSigRef.current === sig) return;
    visitorWsSigRef.current = sig;
    saveSettings.mutate({ ...settings, workspaces: next });
  }, [demoSegmentId, isVisitorDemo, saveSettings, settings, settingsQ.isSuccess]);

  const patchTxn = useCallback(
    async (
      id: string,
      patch: Partial<TxnPayload> | ((prev: TxnPayload) => TxnPayload),
    ) => {
      const rows = await localdb.listTxns();
      const row = rows.find((r) => r.id === id);
      if (!row) throw new Error("Nem található tétel.");
      const prev = await decryptJSON<TxnPayload>(vaultKey, row.data_enc);
      const next =
        typeof patch === "function"
          ? patch(prev)
          : ({ ...prev, ...patch } as TxnPayload);
      const data_enc = await encryptJSON(vaultKey, next);
      await localdb.putTxn({ ...row, data_enc });
    },
    [vaultKey],
  );

  const [vatReviewOpen, setVatReviewOpen] = useState(false);

  const allTxns = txnsQ.data ?? [];
  const allGoals = goalsQ.data ?? [];
  const bridge = useMemo(() => {
    return computeCrossWorkspaceBridge({
      txns: allTxns,
      workspaceMetas: workspaceMetas as any,
      loans,
      personalWorkspaceId: "personal",
      businessBufferMonths: 1,
      now: new Date(),
    });
  }, [allTxns, loans, workspaceMetas]);

  const sumMetrics = useMemo(() => {
    if (activeWorkspace !== "__all") return null;
    const netHuf = (t: Transaction) => {
      const huf = Number(t.amount ?? 0);
      const eur = Number(t.eur_amount ?? 0);
      const rate = Number(t.eur_rate ?? 0);
      const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
      return huf + eurHuf;
    };
    const isBizWs = (w: string) =>
      w.toLowerCase().startsWith("vállalkozás") || w.toLowerCase().startsWith("vallalkozas");
    const bizWs = (wsOptions ?? []).filter(isBizWs);
    const personal = allTxns.filter((t) => (t.workspace ?? "personal") === "personal");
    const biz = allTxns.filter((t) => bizWs.includes(t.workspace ?? ""));

    const grossPersonal = (t: Transaction) => netHuf(t); // personal stored as gross
    const grossBusiness = (t: Transaction) => {
      const net = netHuf(t);
      if (t.type === "saving") return net;
      const treatment = t.vat_treatment ?? "hu_gross";
      if (treatment === "no_vat" || treatment === "foreign" || treatment === "reverse_charge") return net;
      const rate = t.vat_rate ?? 27;
      return computeVatSplit(net, rate, "net").gross;
    };

    const personalBankGross = personal.reduce((acc, t) => {
      if (t.type === "saving") return acc;
      const g = grossPersonal(t);
      return acc + (t.type === "income" ? g : -g);
    }, 0);

    const businessBankGross = biz.reduce((acc, t) => {
      if (t.type === "saving") return acc;
      const g = grossBusiness(t);
      return acc + (t.type === "income" ? g : -g);
    }, 0);

    const piggies = allTxns.reduce((acc, t) => {
      if (t.type !== "saving") return acc;
      const ws = t.workspace ?? "personal";
      const g = ws === "personal" ? grossPersonal(t) : grossBusiness(t);
      return acc + g;
    }, 0);

    const now = new Date();
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), q * 3, 1);
    const end = new Date(now.getFullYear(), q * 3 + 3, 1);
    let outVat = 0;
    let inVat = 0;
    for (const t of biz) {
      if (t.type === "saving") continue;
      const d = new Date(t.occurred_at);
      if (d < start || d >= end) continue;
      const treatment = t.vat_treatment ?? "hu_gross";
      if (treatment === "no_vat" || treatment === "foreign") continue;
      const net = netHuf(t);
      const rate = t.vat_rate ?? 27;
      const vat = computeVatSplit(net, rate, "net").vat;
      if (treatment === "reverse_charge") {
        // reverse charge is payable, but offset/deduct is handled elsewhere; in liquidity we treat it as locked
        outVat += vat;
        continue;
      }
      if (t.type === "income") outVat += vat;
      else inVat += vat;
    }
    const lockedVat = Math.max(0, outVat - inVat);

    const businessResultNet = biz.reduce((acc, t) => {
      if (t.type === "saving") return acc;
      if (t.internal_transfer_kind === "member_loan_out" || t.internal_transfer_kind === "member_loan_repay") return acc;
      const net = netHuf(t);
      return acc + (t.type === "income" ? net : -net);
    }, 0);

    const liquidity = personalBankGross + businessBankGross - lockedVat - piggies;

    return {
      personalBankGross,
      businessBankGross,
      piggies,
      lockedVat,
      liquidity,
      businessResultNet,
      period: { start, end },
    };
  }, [activeWorkspace, allTxns, wsOptions]);

  const consistencyReport = useMemo(
    () =>
      analyzeDataConsistency({
        transactions: allTxns,
        loans,
        workspaces: workspaceMetas as any,
      }),
    [allTxns, loans, workspaceMetas],
  );

  // Do not auto-reset: each main tab keeps its own last sub-tab.

  const getWorkspaceTransactions = useCallback(
    (workspaceId: string) => {
      if (workspaceId === "__all") return allTxns;
      const allowed = new Set<string>([workspaceId]);
      const meta = workspaceMetaById.get(workspaceId);
      if (meta?.type === "business") {
        for (const w of workspaceMetas) {
          if (w.type !== "project") continue;
          if (!w.parent_business_id || !w.counts_in_business) continue;
          if (w.parent_business_id === workspaceId) allowed.add(w.id);
        }
      }
      return allTxns.filter((t) => {
        const isInternal =
          t.internal_transfer_kind === "member_loan_out" ||
          t.internal_transfer_kind === "member_loan_repay";
        if (isInternal) {
          return (
            allowed.has((t.internal_transfer_from ?? t.workspace ?? "personal") as string) ||
            (t.internal_transfer_to ? allowed.has(t.internal_transfer_to) : false)
          );
        }
        return allowed.has((t.workspace ?? "personal") as string);
      });
    },
    [allTxns, workspaceMetaById, workspaceMetas],
  );

  const txns = useMemo(() => getWorkspaceTransactions(activeWorkspace), [activeWorkspace, getWorkspaceTransactions]);
  const realEstatePanel = useMemo(() => {
    if ((activeWorkspace !== "personal" && activeWorkspace !== "__all") || personalProperties.length === 0) return null;
    return (
      <RealEstateModule
        properties={personalProperties as any}
        txns={txns}
        monthKey={realEstateMonthKey}
        currency={CURRENCY}
      />
    );
  }, [activeWorkspace, personalProperties, realEstateMonthKey, txns]);
  const showWsBadge = activeWorkspace === "__all";
  const workspaceLabel = useCallback((ws: string) => workspaceDisplayName(ws), [workspaceDisplayName]);
  const wsBadgeClass = useCallback((ws: string) => workspaceColorCls(ws), []);

  const isLoanRepaymentTxn = useCallback((t: Transaction) => {
    const c = String(t.category ?? "");
    return Boolean(t.loan_id) || c === "loan_repayment" || c === "PÉNZÜGYI KIADÁSOK: Hitel törlesztés";
  }, []);
  const isInternalTransferTxn = useCallback(
    (t: Transaction) =>
      t.internal_transfer_kind === "member_loan_out" || t.internal_transfer_kind === "member_loan_repay",
    [],
  );

  const ledgerTxns = useMemo(() => {
    const base = ledgerPropertyId !== "__all" ? txns.filter((t) => (t.property_id ?? null) === ledgerPropertyId) : txns;
    if (ledgerFilter === "all") return base;
    if (ledgerFilter === "income") return base.filter((t) => t.type === "income");
    if (ledgerFilter === "expense")
      return base.filter((t) => t.type === "expense" && !isLoanRepaymentTxn(t) && (t.status ?? "actual") === "actual");
    if (ledgerFilter === "saving_transfer")
      return base.filter((t) => t.type === "saving" || isInternalTransferTxn(t));
    return base.filter((t) => isLoanRepaymentTxn(t) || (t.status ?? "actual") !== "actual");
  }, [isInternalTransferTxn, isLoanRepaymentTxn, ledgerFilter, ledgerPropertyId, txns]);

  const mirrorSummary = useMemo(() => {
    const derive = (t: Transaction): TxnPayload["expense_type"] => {
      const c = String(t.category ?? "");
      if (t.type === "saving" || c === "savings") return "INVESTMENT";
      if (t.type !== "expense") return undefined;
      if (c === "utilities" || c === "housing" || c === "loan_repayment") return "FIX_NEED";
      if (c === "food" || c === "health" || c === "transport") return "VARIABLE_NEED";
      if (c === "entertainment" || c === "shopping" || c === "education") return "WANT";
      if (c === "uncategorized" || c === "other") return "WANT";
      return "VARIABLE_NEED";
    };
    const mudaHu: Record<string, string> = {
      IMPULSE_SPEND: "Impulzus költés",
      FEES: "Díj / kamat",
      WASTE: "Pazarlás / selejt",
      DUPLICATE_SUBSCRIPTION: "Dupla előfizetés",
    };
    let needs = 0;
    let wants = 0;
    let invest = 0;
    let muda = 0;
    const mudaHits: Array<{
      id: string;
      kind: string;
      kindLabel: string;
      amount: number;
      date: string;
      where: string;
      workspace: string;
    }> = [];
    for (const t of txns) {
      const et = (t as any).expense_type ?? derive(t);
      const mt = String((t as any).muda_type ?? "NONE");
      if (t.type === "expense") {
        const a = Math.max(0, Number(t.amount ?? 0));
        if (et === "FIX_NEED" || et === "VARIABLE_NEED") needs += a;
        else if (et === "WANT") wants += a;
        else if (et === "INVESTMENT") invest += a;
        if (mt && mt !== "NONE") {
          muda += a;
          mudaHits.push({
            id: t.id,
            kind: mt,
            kindLabel: mudaHu[mt] ?? mt,
            amount: a,
            date: String(t.occurred_at ?? "").slice(0, 10),
            where: displayTxnLabel(t),
            workspace: String(t.workspace ?? "personal"),
          });
        }
      } else if (t.type === "saving") {
        invest += Math.max(0, Number(t.amount ?? 0));
      }
    }
    mudaHits.sort((a, b) => b.amount - a.amount);
    const kindMap = new Map<string, { kindLabel: string; amount: number; count: number }>();
    for (const h of mudaHits) {
      const prev = kindMap.get(h.kind) ?? { kindLabel: h.kindLabel, amount: 0, count: 0 };
      prev.amount += h.amount;
      prev.count += 1;
      kindMap.set(h.kind, prev);
    }
    const totalOut = needs + wants + invest;
    const pct = (x: number) => (totalOut > 0 ? (x / totalOut) * 100 : 0);
    return {
      needs,
      wants,
      invest,
      muda,
      mudaHits,
      mudaByKind: [...kindMap.values()].sort((a, b) => b.amount - a.amount),
      totalOut,
      needsPct: pct(needs),
      wantsPct: pct(wants),
      investPct: pct(invest),
    };
  }, [txns]);

  const ledgerShown = useMemo(() => {
    const rows = [...ledgerTxns].sort((a, b) =>
      a.occurred_at < b.occurred_at ? 1 : a.occurred_at > b.occurred_at ? -1 : 0,
    );
    return (isVisitorDemo ? collapseNearDuplicateTxns(rows) : rows).slice(0, 400);
  }, [isVisitorDemo, ledgerTxns]);

  const cashflowQuickTxns = useMemo(() => {
    const day = (auditDayIso ?? "").trim();
    const base = [...(txns ?? [])]
      .filter((t) => t.type === "income" || t.type === "expense" || t.type === "saving")
      .filter((t) => !day || txnDayIso(t.occurred_at) === day)
      .sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : a.occurred_at > b.occurred_at ? -1 : 0));

    const pick = (t: any) => {
      if (cashflowChannelFilter === "all") return true;
      const isBank = Boolean(t.bank_raw_id);
      const text = String([t.note ?? "", t.title ?? "", t.party ?? ""].filter(Boolean).join(" ")).trim();
      const ch = isBank ? detectTransactionChannel(text) : null;
      if (cashflowChannelFilter === "other") return !isBank || ch === "cash";
      if (!isBank || !ch) return false;
      if (cashflowChannelFilter === "card") return ch === "card";
      if (cashflowChannelFilter === "transfer") return ch === "transfer";
      return ch === "bank";
    };

    const picked = base.filter(pick);
    return (isVisitorDemo ? collapseNearDuplicateTxns(picked) : picked).slice(0, 80);
  }, [auditDayIso, cashflowChannelFilter, isVisitorDemo, txns]);

  const cashflowQuickPageCount = useMemo(
    () => Math.max(1, Math.ceil(cashflowQuickTxns.length / cashflowQuickPageSize)),
    [cashflowQuickTxns.length, cashflowQuickPageSize],
  );

  useEffect(() => {
    setCashflowQuickPage(1);
  }, [auditDayIso, cashflowChannelFilter, activeWorkspace]);

  useEffect(() => {
    setCashflowQuickPage((p) => Math.min(Math.max(1, p), cashflowQuickPageCount));
  }, [cashflowQuickPageCount]);

  const cashflowQuickShown = useMemo(() => {
    const start = (cashflowQuickPage - 1) * cashflowQuickPageSize;
    return cashflowQuickTxns.slice(start, start + cashflowQuickPageSize);
  }, [cashflowQuickTxns, cashflowQuickPage, cashflowQuickPageSize]);

  const missingCategoryCount = useMemo(() => {
    let n = 0;
    for (const t of txns) {
      const c = String((t as any).category ?? "").trim().toLowerCase();
      if (!c || c === "uncategorized") n += 1;
    }
    return n;
  }, [txns]);

  useEffect(() => {
    // Clear selection when changing scope.
    setSelectedTxnIds(new Set());
  }, [activeWorkspace, ledgerFilter, ledgerPropertyId]);

  const allShownSelected = useMemo(() => {
    if (ledgerShown.length === 0) return false;
    for (const t of ledgerShown) if (!selectedTxnIds.has(t.id)) return false;
    return true;
  }, [ledgerShown, selectedTxnIds]);

  const toggleSelectAllShown = useCallback(() => {
    setSelectedTxnIds((cur) => {
      const next = new Set(cur);
      const shouldSelect = !allShownSelected;
      for (const t of ledgerShown) {
        if (shouldSelect) next.add(t.id);
        else next.delete(t.id);
      }
      return next;
    });
  }, [allShownSelected, ledgerShown]);

  const selectedCount = selectedTxnIds.size;
  const selectedTxns = useMemo(() => {
    const byId = new Map<string, Transaction>();
    for (const t of txns) byId.set(t.id, t);
    return Array.from(selectedTxnIds)
      .map((id) => byId.get(id))
      .filter((x): x is Transaction => Boolean(x));
  }, [selectedTxnIds, txns]);

  const netHufAny = useCallback((t: Transaction) => {
    const huf = Number(t.amount ?? 0);
    const eur = Number(t.eur_amount ?? 0);
    const rate = Number(t.eur_rate ?? 0);
    const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
    return huf + eurHuf;
  }, []);
  const grossHufAny = useCallback((t: Transaction) => {
    const ws = t.workspace ?? "personal";
    const net = netHufAny(t);
    if (ws === "personal") return net; // personal stored gross
    if (t.type === "saving") return net;
    const treatment = t.vat_treatment ?? "hu_gross";
    if (treatment === "no_vat" || treatment === "foreign" || treatment === "reverse_charge") return net;
    const rate = t.vat_rate ?? 27;
    return computeVatSplit(net, rate, "net").gross;
  }, [netHufAny]);

  const resaleDeals = useMemo(() => {
    const rows = txns
      .filter((t) => t.type === "expense" && t.is_resale)
      .sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : -1));
    const byId = new Map<string, Transaction>();
    for (const t of txns) byId.set(t.id, t);
    const deals = rows.map((p) => {
      const rev = p.linked_revenue_id ? byId.get(p.linked_revenue_id) ?? null : null;
      const purchaseNet = netHufAny(p);
      const purchaseGross = grossHufAny(p);
      const revenueNet = rev ? netHufAny(rev) : 0;
      const margin = rev ? revenueNet - purchaseNet : 0;
      const pct = rev && revenueNet > 0 ? (margin / revenueNet) * 100 : 0;
      const status: "closed" | "open" = rev ? "closed" : "open";
      const customer = (p.customer_name ?? "").trim() || "—";
      return { purchase: p, revenue: rev, purchaseNet, purchaseGross, revenueNet, margin, pct, status, customer };
    });
    const kpi = (() => {
      const purchaseNetSum = deals.reduce((a, d) => a + d.purchaseNet, 0);
      const purchaseGrossSum = deals.reduce((a, d) => a + d.purchaseGross, 0);
      const closed = deals.filter((d) => d.status === "closed");
      const revenueSum = closed.reduce((a, d) => a + d.revenueNet, 0);
      const marginSum = closed.reduce((a, d) => a + d.margin, 0);
      const avgPct = revenueSum > 0 ? (marginSum / revenueSum) * 100 : 0;
      return { purchaseNetSum, purchaseGrossSum, revenueSum, marginSum, avgPct, closedCount: closed.length, totalCount: deals.length };
    })();
    const byCustomer = (() => {
      const m = new Map<string, { customer: string; revenue: number; margin: number; count: number }>();
      for (const d of deals) {
        if (d.status !== "closed") continue;
        const cur = m.get(d.customer) ?? { customer: d.customer, revenue: 0, margin: 0, count: 0 };
        cur.revenue += d.revenueNet;
        cur.margin += d.margin;
        cur.count += 1;
        m.set(d.customer, cur);
      }
      return Array.from(m.values())
        .map((x) => ({ ...x, pct: x.revenue > 0 ? (x.margin / x.revenue) * 100 : 0 }))
        .sort((a, b) => b.margin - a.margin);
    })();
    return { deals, kpi, byCustomer };
  }, [grossHufAny, netHufAny, txns]);

  const goals = useMemo(() => {
    const scoped =
      activeWorkspace === "__all"
        ? allGoals
        : allGoals.filter((g) => (g.workspace ?? "personal") === activeWorkspace);
    const hide = [activeWorkspace, workspaceDisplayName(activeWorkspace)];
    const seen = new Set<string>();
    const out: typeof scoped = [];
    for (const g of scoped) {
      const key = displayGoalLabel(g.name, hide).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(g);
    }
    return out;
  }, [allGoals, activeWorkspace, workspaceDisplayName]);

  const reviewTxns = useMemo(() => {
    if (!businessMode || activeWorkspace === "__all") return [];
    return txns
      .filter((t) => t.type !== "saving" && t.vat_review)
      .sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : -1));
  }, [activeWorkspace, businessMode, txns]);

  const txnNetHuf = useCallback(
    (t: Transaction) => {
      const huf = Number(t.amount ?? 0);
      const eur = Number(t.eur_amount ?? 0);
      const rate = Number(t.eur_rate ?? 0);
      const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
      return huf + eurHuf;
    },
    [],
  );

  const txnGrossHuf = useCallback(
    (t: Transaction) => {
      const net = txnNetHuf(t);
      if (t.type === "saving") return net;
      const treatment = t.vat_treatment ?? "hu_gross";
      if (treatment === "no_vat" || treatment === "foreign" || treatment === "reverse_charge")
        return net;
      const rate = t.vat_rate ?? defaultVat;
      return computeVatSplit(net, rate, "net").gross;
    },
    [defaultVat, txnNetHuf],
  );

  const isInternalTransfer = useCallback(
    (t: Transaction) =>
      t.internal_transfer_kind === "member_loan_out" ||
      t.internal_transfer_kind === "member_loan_repay",
    [],
  );
  const elimTxns = useMemo(() => {
    // Elimination in Szumma view: drop internal transfers from charts/stats so movements aren't inflated.
    if (activeWorkspace !== "__all") return txns;
    return txns.filter((t) => !isInternalTransfer(t));
  }, [activeWorkspace, isInternalTransfer, txns]);

  const totals = useMemo(() => computeTotals(elimTxns), [elimTxns]);
  const byCat = useMemo(() => expensesByCategory(elimTxns), [elimTxns]);
  const byCatPie = useMemo(() => {
    // Pie charts (legend/labels) fall apart with many categories.
    // Keep top N and aggregate the rest into "Egyéb".
    const MAX = 8;
    const sorted = [...byCat].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));
    const top = sorted.slice(0, MAX);
    const rest = sorted.slice(MAX);
    const other = rest.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
    if (other > 0) {
      top.push({ category: "other", label: `Egyéb (${rest.length})`, value: other } as any);
    }
    return top;
  }, [byCat]);
  const series = useMemo(() => monthlySeries(elimTxns, vizSpan, vizShift), [elimTxns, vizSpan, vizShift]);
  const vizWindowLabel =
    series.length > 0 ? `${series[0]!.label} – ${series[series.length - 1]!.label}` : "";
  const onVizPrev = () => setVizShift((s) => s + 1);
  const onVizNext = () => setVizShift((s) => Math.max(0, s - 1));
  const onVizSpan = (n: VizSpan) => {
    setVizSpan(n);
    setVizShift(0);
  };
  const leanBuilt = useMemo(() => {
    const keys = new Set(series.map((s) => s.key));
    const inWin = (iso: string) => {
      const d = new Date(iso);
      if (!Number.isFinite(d.getTime())) return false;
      return keys.has(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    };
    const winTxns = elimTxns.filter((t) => inWin(t.occurred_at));
    const winIncome = winTxns.filter((t) => t.type === "income").reduce((a, t) => a + (Number(t.amount) || 0), 0);
    const winSaving = winTxns.filter((t) => t.type === "saving").reduce((a, t) => a + (Number(t.amount) || 0), 0);
    const waterfall = groupExpenseWaterfall(
      winIncome,
      winTxns
        .filter((t) => t.type === "expense")
        .map((t) => ({ category: t.category, amount: Number(t.amount) || 0 })),
      winSaving > 0
        ? [{ key: "sav", label: "Megtakarítás", value: -Math.abs(winSaving) }]
        : undefined,
    );
    const incomeBy = new Map<string, number>();
    for (const t of winTxns) {
      if (t.type !== "income") continue;
      const lab = categoryLabel(t.category);
      incomeBy.set(lab, (incomeBy.get(lab) ?? 0) + Math.abs(Number(t.amount) || 0));
    }
    const sources = [...incomeBy.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);
    const srcUse = sources.length ? sources : ["Bevétel"];
    const winByCat = new Map<string, number>();
    for (const t of winTxns) {
      if (t.type !== "expense") continue;
      const lab = categoryLabel(t.category);
      winByCat.set(lab, (winByCat.get(lab) ?? 0) + Math.abs(Number(t.amount) || 0));
    }
    const catRows = [...winByCat.entries()]
      .map(([label, value]) => ({ category: label, label, value }))
      .sort((a, b) => b.value - a.value);
    const sinkCap = 24;
    const sinkHead = catRows.slice(0, sinkCap);
    const sinkTail = catRows.slice(sinkCap);
    const sinkRows =
      sinkTail.length > 0
        ? [
            ...sinkHead,
            {
              category: "other",
              label: `Egyéb (${sinkTail.length})`,
              value: sinkTail.reduce((a, c) => a + (Number(c.value) || 0), 0),
            },
          ]
        : sinkHead;
    const sinks = sinkRows.map((c) => c.label);
    const fromLabel = srcUse.length === 1 ? srcUse[0] : "Bevétel";
    const links: SankeyLink[] = sinkRows.map((s) => ({
      from: fromLabel,
      to: s.label,
      value: Number(s.value) || 0,
    }));
    const srcUseChart = [fromLabel];
    const cols = series.map((s) => s.label);
    const heatRows = sinks;
    const otherHeat = sinkTail.length > 0 ? `Egyéb (${sinkTail.length})` : null;
    const tailLabs = new Set(sinkTail.map((c) => c.label));
    const cells: HeatCell[] = [];
    for (const t of winTxns) {
      if (t.type !== "expense" && t.type !== "income") continue;
      const lab = categoryLabel(t.category);
      const row = heatRows.includes(lab) ? lab : otherHeat && tailLabs.has(lab) ? otherHeat : null;
      if (!row) continue;
      const d = new Date(t.occurred_at);
      const col = d.toLocaleDateString("hu-HU", { year: "numeric", month: "short" });
      if (!cols.includes(col)) continue;
      const signed = t.type === "income" ? Math.abs(Number(t.amount) || 0) : -Math.abs(Number(t.amount) || 0);
      const hit = cells.find((c) => c.row === row && c.col === col);
      if (hit) hit.value += signed;
      else cells.push({ row, col, value: signed });
    }
    return { waterfall, sources: srcUseChart, sinks, links, heatRows, heatCols: cols, heatCells: cells };
  }, [elimTxns, series]);
  const activeGoal = goals.find((g) => g.is_active) ?? goals[0] ?? null;

  const cashflowRows = useMemo(() => {
    const map = new Map<string, { month: string; income: number; expense: number; saving: number }>();
    for (const t of elimTxns) {
      const d = new Date(t.occurred_at);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const row = map.get(month) ?? { month, income: 0, expense: 0, saving: 0 };
      const a = businessMode ? txnGrossHuf(t) : Number(t.amount);
      if (t.type === "income") row.income += a;
      else if (t.type === "expense") row.expense += a;
      else row.saving += a;
      map.set(month, row);
    }
    return Array.from(map.values()).sort((a, b) => (a.month < b.month ? 1 : -1));
  }, [elimTxns, businessMode, txnGrossHuf]);

  const timeline6MonthKeys = useMemo(() => {
    const base = cashflowRows[0]?.month ?? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    const [y, m] = base.split("-").map((x) => Number(x));
    const d = new Date(y, (m || 1) - 1, 1);
    const keys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const dd = new Date(d);
      dd.setMonth(dd.getMonth() - i);
      keys.push(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}`);
    }
    return keys;
  }, [cashflowRows]);

  const timeline6Rows = useMemo(() => {
    const by = new Map(cashflowRows.map((r) => [r.month, r] as const));
    return timeline6MonthKeys.map((k) => by.get(k) ?? { month: k, income: 0, expense: 0, saving: 0 });
  }, [cashflowRows, timeline6MonthKeys]);

  const txnsByMonthKey = useMemo(() => {
    const out = new Map<string, Transaction[]>();
    for (const t of elimTxns) {
      const k = String(t.occurred_at ?? "").slice(0, 7);
      if (!k) continue;
      const arr = out.get(k) ?? [];
      arr.push(t);
      out.set(k, arr);
    }
    for (const [k, arr] of out) {
      arr.sort((a, b) => String(b.occurred_at).localeCompare(String(a.occurred_at)));
      out.set(k, arr);
    }
    return out;
  }, [elimTxns]);

  const ledgerSummary = useMemo(() => {
    const count = ledgerTxns.length;
    let incomeNet = 0;
    let incomeGross = 0;
    let expenseNet = 0;
    let expenseGross = 0;
    let savingNet = 0;
    let savingGross = 0;
    let loanPrincipalNet = 0;
    let plannedCount = 0;

    for (const t of ledgerTxns) {
      const st = (t.status ?? "actual") as any;
      if (st !== "actual") plannedCount++;

      const net = txnNetHuf(t);
      const gross = businessMode ? txnGrossHuf(t) : net;

      if (t.type === "income") {
        incomeNet += net;
        incomeGross += gross;
        continue;
      }
      if (t.type === "saving") {
        savingNet += net;
        savingGross += gross;
        continue;
      }

      // expense
      expenseNet += net;
      expenseGross += gross;
      if (isLoanRepaymentTxn(t)) {
        const p = Math.max(0, Number((t.loan_principal_paid ?? net) as any));
        loanPrincipalNet += Math.min(Math.max(0, net), p);
      }
    }

    const balanceNet = incomeNet - expenseNet;
    const balanceGross = incomeGross - expenseGross;
    return {
      count,
      incomeNet,
      incomeGross,
      expenseNet,
      expenseGross,
      savingNet,
      savingGross,
      loanPrincipalNet,
      plannedCount,
      balanceNet,
      balanceGross,
    };
  }, [businessMode, isLoanRepaymentTxn, ledgerTxns, txnGrossHuf, txnNetHuf]);

  const personalCashflowKpis = useMemo(() => {
    if (activeWorkspace !== "personal") return null;
    const bankGross = txns.reduce((acc, t) => {
      if (t.type === "saving") return acc;
      const g = txnNetHuf(t); // personal stored as gross; txnNetHuf already includes EUR→HUF
      return acc + (t.type === "income" ? g : -g);
    }, 0);
    const piggies = txns.reduce((acc, t) => {
      if (t.type !== "saving") return acc;
      return acc + Math.max(0, txnNetHuf(t));
    }, 0);
    const free = bankGross - piggies;

    const recurring = (settings.recurring ?? []).filter(
      (it) => (it.workspace ?? "personal") === "personal" && it.type === "expense",
    );
    const monthlyFromRecurring = recurring.reduce((acc, it) => {
      const huf = Number(it.amount ?? 0);
      const eur = Number(it.eur_amount ?? 0);
      const rate = Number(it.eur_rate ?? 0);
      const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
      const base = Math.max(0, huf + eurHuf);
      const factor = it.interval === "weekly" ? 4.345 : it.interval === "quarterly" ? 1 / 3 : 1;
      return acc + base * factor;
    }, 0);

    const now = Date.now();
    const ms90 = 90 * 24 * 60 * 60 * 1000;
    const spent90 = txns.reduce((acc, t) => {
      if (t.type !== "expense") return acc;
      const d = new Date(t.occurred_at).getTime();
      if (!Number.isFinite(d) || now - d > ms90) return acc;
      return acc + txnNetHuf(t);
    }, 0);
    const monthlyFallback = spent90 > 0 ? (spent90 / 90) * 30 : 0;
    const loanMonthly = activeLoans.reduce((acc, l) => acc + debtNearTermBurden(l, 31), 0);
    const baseFixed = monthlyFromRecurring > 0 ? monthlyFromRecurring : monthlyFallback;
    const fixedMonthly = baseFixed + loanMonthly;
    const runwayMonths = fixedMonthly > 0 ? free / fixedMonthly : null;

    return { bankGross, piggies, free, fixedMonthly, runwayMonths };
  }, [activeWorkspace, activeLoans, settings.recurring, txns, txnNetHuf]);

  const multiYear = useMemo(() => {
    if (activeWorkspace !== "personal") return null;
    const liq = personalCashflowKpis?.free ?? null;
    return analyzeMultiYear({
      txns,
      workspaceId: "personal",
      yearsBack: 3,
      liquidityHuf: liq,
      now: new Date(),
    });
  }, [activeWorkspace, personalCashflowKpis?.free, txns]);

  const wantsBudgetMonthlyHuf = useMemo(() => {
    const ws = activeWorkspace === "__all" ? null : activeWorkspace;
    if (!ws) return null;
    const meta = workspaceMetaById.get(ws) as any;
    const v = meta?.wants_budget_monthly_huf;
    const n = typeof v === "number" ? v : v == null ? null : Number(v);
    return Number.isFinite(n) && (n as number) > 0 ? (n as number) : null;
  }, [activeWorkspace, workspaceMetaById]);

  const wantsSpendThisMonth = useMemo(() => {
    if (activeWorkspace === "__all") return 0;
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    let sum = 0;
    for (const t of txns) {
      if (t.type !== "expense") continue;
      if (t.expense_type !== "WANT") continue;
      const d = new Date(t.occurred_at);
      if (!Number.isFinite(d.getTime())) continue;
      if (d.getFullYear() !== y || d.getMonth() !== m) continue;
      sum += Math.max(0, txnNetHuf(t));
    }
    return sum;
  }, [activeWorkspace, txns, txnNetHuf]);

  const wantsMonthlyAvg90 = useMemo(() => {
    if (activeWorkspace === "__all") return 0;
    const now = Date.now();
    const ms90 = 90 * 24 * 60 * 60 * 1000;
    let sum = 0;
    for (const t of txns) {
      if (t.type !== "expense") continue;
      if (t.expense_type !== "WANT") continue;
      const d = new Date(t.occurred_at).getTime();
      if (!Number.isFinite(d) || now - d > ms90) continue;
      sum += Math.max(0, txnNetHuf(t));
    }
    return sum > 0 ? (sum / 90) * 30 : 0;
  }, [activeWorkspace, txns, txnNetHuf]);

  type WantsLockPending =
    | { kind: "add"; overBy: number; limit: number; input: { type: TxnType; occurred_at: string; payload: TxnPayload; bypassWantsLock: true } }
    | { kind: "update"; overBy: number; limit: number; id: string; input: { type: TxnType; occurred_at: string; payload: TxnPayload; bypassWantsLock: true } }
    | { kind: "bankImport"; overBy: number; limit: number; input: { fileName: string; text: string; fileSize?: number | null; bypassWantsLock: true } };

  const [wantsLockPending, setWantsLockPending] = useState<WantsLockPending | null>(null);
  const [wantsLockOpen, setWantsLockOpen] = useState(false);

  const wantsExpenseTypeOf = useCallback((type: TxnType, category: string, existing?: TxnPayload["expense_type"]) => {
    if (existing) return existing;
    const c = String(category ?? "");
    if (type !== "expense") return undefined;
    if (c === "utilities" || c === "housing" || c === "loan_repayment") return "FIX_NEED";
    if (c === "food" || c === "health" || c === "transport") return "VARIABLE_NEED";
    if (c === "entertainment" || c === "shopping") return "WANT";
    if (c === "education") return "INVESTMENT";
    if (c === "uncategorized" || c === "other") return "WANT";
    return "VARIABLE_NEED";
  }, []);

  const vatReserve = useMemo(() => {
    if (!businessMode || activeWorkspace === "__all") return null;
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3); // 0..3
    const start = new Date(now.getFullYear(), q * 3, 1);
    const end = new Date(now.getFullYear(), q * 3 + 3, 1);
    let outVat = 0;
    let inVat = 0;
    let reverseVat = 0;
    let reviewCount = 0;
    for (const t of txns) {
      if (t.type === "saving") continue;
      const d = new Date(t.occurred_at);
      if (d < start || d >= end) continue;
      if (t.vat_review) reviewCount++;
      const treatment = t.vat_treatment ?? "hu_gross";
      const net = txnNetHuf(t);
      const rate = t.vat_rate ?? defaultVat;
      if (treatment === "reverse_charge") {
        reverseVat += computeVatSplit(net, rate, "net").vat;
        continue;
      }
      if (treatment === "no_vat" || treatment === "foreign") continue;
      const s = computeVatSplit(net, rate, "net");
      if (t.type === "income") outVat += s.vat;
      else inVat += s.vat;
    }
    const payable = Math.max(0, outVat - inVat);
    // "balance" represents real bank movement (exclude reserve allocations)
    const balance = txns.reduce((acc, t) => {
      if (t.type === "saving") return acc;
      const g = businessMode ? txnGrossHuf(t) : Number(t.amount);
      return acc + (t.type === "income" ? g : -g);
    }, 0);
    const reserved = txns.reduce((acc, t) => {
      if (t.type !== "saving") return acc;
      const g = businessMode ? txnGrossHuf(t) : Number(t.amount);
      return acc + g;
    }, 0);
    const free = Math.max(0, balance - payable - reserved);
    return { start, end, outVat, inVat, reverseVat, reviewCount, payable, balance, reserved, free };
  }, [activeWorkspace, businessMode, defaultVat, txnGrossHuf, txnNetHuf, txns]);

  const debtBuffer = useMemo(() => {
    const outstanding = Math.max(0, Number(loanKpis.totalOutstanding ?? 0));
    const hasDebt = outstanding > 0 && activeLoans.length > 0;

    const free =
      activeWorkspace === "__all"
        ? Math.max(0, Number(sumMetrics?.liquidity ?? 0))
        : activeWorkspace === "personal"
          ? Math.max(0, Number(personalCashflowKpis?.free ?? 0))
          : Math.max(0, Number(vatReserve?.free ?? 0));

    const now = Date.now();
    const ms90 = 90 * 24 * 60 * 60 * 1000;
    let net90 = 0;
    for (const t of txns) {
      const d = new Date(t.occurred_at).getTime();
      if (!Number.isFinite(d) || now - d > ms90) continue;
      const g = businessMode ? txnGrossHuf(t) : txnNetHuf(t);
      if (t.type === "income") net90 += g;
      else net90 -= g; // expense + saving reduce buffer
    }

    if (!hasDebt) {
      return {
        level: "green" as const,
        icon: "🟢",
        cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
        label: "Nincs tartozás / puffer OK",
        free,
        outstanding,
        net90,
      };
    }

    const ratio = outstanding > 0 ? free / outstanding : 999;
    const covers = ratio >= 1;
    const isTight = ratio < 1.25;
    const negativeTrend = net90 < 0;

    if (!covers) {
      return {
        level: "red" as const,
        icon: "🔴",
        cls: "border-rose-500/30 bg-rose-500/10 text-rose-200",
        label: "Piros: nincs elég puffer a tartozásokra",
        free,
        outstanding,
        net90,
      };
    }

    if (isTight || negativeTrend) {
      return {
        level: "yellow" as const,
        icon: "🟡",
        cls: "border-amber-500/30 bg-amber-500/10 text-amber-200",
        label: "Sárga: fedezi, de szűk a puffer / negatív trend",
        free,
        outstanding,
        net90,
      };
    }

    return {
      level: "green" as const,
      icon: "🟢",
      cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
      label: "Zöld: fedezi és van puffer",
      free,
      outstanding,
      net90,
    };
  }, [
    activeLoans.length,
    activeWorkspace,
    businessMode,
    loanKpis.totalOutstanding,
    personalCashflowKpis?.free,
    sumMetrics?.liquidity,
    txnGrossHuf,
    txnNetHuf,
    txns,
    vatReserve?.free,
  ]);

  const vatLedger = useMemo(() => {
    if (!businessMode || activeWorkspace === "__all") return null;
    if (!vatReserve) return null;
    const start = vatReserve.start;
    const end = vatReserve.end;
    let outputVat = 0;
    let deductibleVat = 0;
    let reviewCount = 0;
    for (const t of txns) {
      if (t.type === "saving") continue;
      const d = new Date(t.occurred_at);
      if (d < start || d >= end) continue;
      if (t.vat_review) reviewCount++;
      const treatment = t.vat_treatment ?? "hu_gross";
      if (treatment === "no_vat" || treatment === "foreign") continue;
      const net = txnNetHuf(t);
      const rate = t.vat_rate ?? defaultVat;
      const vat = computeVatSplit(net, rate, "net").vat;
      const deduct = t.vat_deductibility ?? 1;

      if (treatment === "reverse_charge") {
        outputVat += vat;
        deductibleVat += vat * deduct;
        continue;
      }

      if (t.type === "income") outputVat += vat;
      else deductibleVat += vat * deduct;
    }
    const netPosition = outputVat - deductibleVat;
    return { start, end, outputVat, deductibleVat, netPosition, reviewCount };
  }, [activeWorkspace, businessMode, defaultVat, txnNetHuf, txns, vatReserve]);

  const [plannedTab, setPlannedTab] = useState<"fixed" | "oneoff" | "usage">("fixed");

  const [recOpen, setRecOpen] = useState(false);
  const [recName, setRecName] = useState("");
  const [recType, setRecType] = useState<"expense" | "income">("expense");
  const [recInterval, setRecInterval] = useState<RecurringInterval>("monthly");
  const [recNextDate, setRecNextDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [recCategory, setRecCategory] = useState("office");
  const [recAmountHuf, setRecAmountHuf] = useState("");
  const [recAmountEur, setRecAmountEur] = useState("");
  const [recEurRate, setRecEurRate] = useState("");
  const [recVatRate, setRecVatRate] = useState(String(defaultVat));

  const [oneOffOpen, setOneOffOpen] = useState(false);
  const [oneOffName, setOneOffName] = useState("");
  const [oneOffType, setOneOffType] = useState<"expense" | "income">("expense");
  const [oneOffAt, setOneOffAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [oneOffCategory, setOneOffCategory] = useState("office");
  const [oneOffAmountHuf, setOneOffAmountHuf] = useState("");
  const [oneOffAmountEur, setOneOffAmountEur] = useState("");
  const [oneOffEurRate, setOneOffEurRate] = useState("");
  const [oneOffVatRate, setOneOffVatRate] = useState(String(defaultVat));

  const [usageTplOpen, setUsageTplOpen] = useState(false);
  const [usageTplName, setUsageTplName] = useState("");
  const [usageTplCategory, setUsageTplCategory] = useState("office");
  const [usageTplAmountHuf, setUsageTplAmountHuf] = useState("");
  const [usageTplAmountEur, setUsageTplAmountEur] = useState("");
  const [usageTplEurRate, setUsageTplEurRate] = useState("");
  const [usageTplVatRate, setUsageTplVatRate] = useState(String(defaultVat));

  const [usageLogOpen, setUsageLogOpen] = useState(false);
  const [usageLogTemplateId, setUsageLogTemplateId] = useState<string>("");
  const [usageLogAt, setUsageLogAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [usageLogCount, setUsageLogCount] = useState("1");

  useEffect(() => {
    if (!recOpen) return;
    setRecName("");
    setRecType("expense");
    setRecInterval("monthly");
    setRecNextDate(new Date().toISOString().slice(0, 10));
    setRecCategory("office");
    setRecAmountHuf("");
    setRecAmountEur("");
    setRecEurRate("");
    setRecVatRate(String(defaultVat));
  }, [recOpen, defaultVat]);

  useEffect(() => {
    if (!oneOffOpen) return;
    setOneOffName("");
    setOneOffType("expense");
    setOneOffAt(new Date().toISOString().slice(0, 10));
    setOneOffCategory("office");
    setOneOffAmountHuf("");
    setOneOffAmountEur("");
    setOneOffEurRate("");
    setOneOffVatRate(String(defaultVat));
  }, [oneOffOpen, defaultVat]);

  useEffect(() => {
    if (!usageTplOpen) return;
    setUsageTplName("");
    setUsageTplCategory("office");
    setUsageTplAmountHuf("");
    setUsageTplAmountEur("");
    setUsageTplEurRate("");
    setUsageTplVatRate(String(defaultVat));
  }, [usageTplOpen, defaultVat]);

  useEffect(() => {
    if (!usageLogOpen) return;
    setUsageLogAt(new Date().toISOString().slice(0, 10));
    setUsageLogCount("1");
  }, [usageLogOpen]);

  const upcomingRecurring = useMemo(() => {
    if (!businessMode || activeWorkspace === "__all") return [];
    const items: RecurringItem[] = (settings.recurring ?? []).filter(
      (r) => (r.workspace ?? activeWorkspace) === activeWorkspace,
    );
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 60);

    const addInterval = (d: Date, i: RecurringInterval) => {
      const nd = new Date(d);
      if (i === "weekly") nd.setDate(nd.getDate() + 7);
      else if (i === "monthly") nd.setMonth(nd.getMonth() + 1);
      else nd.setMonth(nd.getMonth() + 3);
      return nd;
    };

    const out: Array<{ at: string; item: RecurringItem; gross: number }> = [];
    for (const it of items) {
      const start = new Date(it.next_date);
      if (!Number.isFinite(start.getTime())) continue;
      let d = start;
      for (let guard = 0; guard < 24 && d <= end; guard++) {
        const eur = Number(it.eur_amount ?? 0);
        const rate = Number(it.eur_rate ?? 0);
        const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
        const net = Math.max(0, Number(it.amount ?? 0) + eurHuf);
        const s =
          it.type === "income" || it.type === "expense"
            ? computeVatSplit(net, it.vat_rate ?? defaultVat, "net")
            : { net, vat: 0, gross: net };
        out.push({ at: d.toISOString().slice(0, 10), item: it, gross: s.gross });
        d = addInterval(d, it.interval);
      }
    }
    return out
      .filter((x) => new Date(x.at) >= new Date(today.toISOString().slice(0, 10)))
      .sort((a, b) => (a.at < b.at ? -1 : 1));
  }, [activeWorkspace, businessMode, defaultVat, settings.recurring]);

  const upcomingOneOff = useMemo(() => {
    if (!businessMode || activeWorkspace === "__all") return [];
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 60);
    const items: PlannedOneOff[] = (settings.plannedOneOff ?? []).filter(
      (r) => (r.workspace ?? activeWorkspace) === activeWorkspace,
    );
    return items
      .filter((it) => {
        const d = new Date(it.at);
        return Number.isFinite(d.getTime()) && d >= today && d <= end;
      })
      .sort((a, b) => (a.at < b.at ? -1 : 1));
  }, [activeWorkspace, businessMode, settings.plannedOneOff]);

  const upcomingUsage = useMemo(() => {
    if (!businessMode || activeWorkspace === "__all") return [];
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 60);
    const tpls: UsageTemplate[] = (settings.usageTemplates ?? []).filter(
      (t) => (t.workspace ?? activeWorkspace) === activeWorkspace,
    );
    const events: UsageEvent[] = (settings.usageEvents ?? []).filter(
      (e) => (e.workspace ?? activeWorkspace) === activeWorkspace,
    );
    const byId = new Map(tpls.map((t) => [t.id, t]));
    return events
      .map((e) => ({ e, tpl: byId.get(e.template_id) }))
      .filter((x): x is { e: UsageEvent; tpl: UsageTemplate } => !!x.tpl)
      .filter((x) => {
        const d = new Date(x.e.at);
        return Number.isFinite(d.getTime()) && d >= today && d <= end && x.e.count > 0;
      })
      .sort((a, b) => (a.e.at < b.e.at ? -1 : 1));
  }, [activeWorkspace, businessMode, settings.usageEvents, settings.usageTemplates]);

  const planned60Sums = useMemo(() => {
    const oneOffGross = (it: PlannedOneOff) => {
      const eur = Number(it.eur_amount ?? 0);
      const rate = Number(it.eur_rate ?? 0);
      const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
      const net = Math.max(0, Number(it.amount ?? 0) + eurHuf);
      return computeVatSplit(net, it.vat_rate ?? defaultVat, "net").gross;
    };
    const usageGross = (tpl: UsageTemplate, ev: UsageEvent) => {
      const eur = Number(tpl.eur_unit_amount ?? 0);
      const rate = Number(tpl.eur_rate ?? 0);
      const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
      const netUnit = Math.max(0, Number(tpl.unit_amount ?? 0) + eurHuf);
      const net = netUnit * Math.max(0, Number(ev.count ?? 0));
      return computeVatSplit(net, tpl.vat_rate ?? defaultVat, "net").gross;
    };
    const recurring = upcomingRecurring
      .filter((x) => x.item.type !== "income")
      .reduce((a, x) => a + x.gross, 0);
    const oneOff = upcomingOneOff
      .filter((it) => it.type !== "income")
      .reduce((a, it) => a + oneOffGross(it), 0);
    const usage = upcomingUsage
      .filter((x) => x.tpl.type !== "income")
      .reduce((a, x) => a + usageGross(x.tpl, x.e), 0);
    const debt = upcomingDebtInstallments.reduce((a, x) => a + Number(x.amount ?? 0), 0);
    return { recurring, oneOff, usage, debt, total: recurring + oneOff + usage + debt };
  }, [defaultVat, upcomingDebtInstallments, upcomingOneOff, upcomingRecurring, upcomingUsage]);

  const recurring60Rows = useMemo(() => {
    const m = new Map<string, { id: string; name: string; gross: number }>();
    for (const x of upcomingRecurring) {
      if (x.item.type === "income") continue;
      const id = String(x.item.id);
      const cur = m.get(id) ?? {
        id,
        name: x.item.name ?? categoryLabel(String(x.item.category ?? "")),
        gross: 0,
      };
      cur.gross += x.gross;
      m.set(id, cur);
    }
    return [...m.values()].sort((a, b) => b.gross - a.gross);
  }, [upcomingRecurring]);

  const runway = useMemo(() => {
    if (!businessMode || activeWorkspace === "__all") return null;
    const today = new Date();
    const d30 = new Date(today);
    d30.setDate(d30.getDate() + 30);
    const d60 = new Date(today);
    d60.setDate(d60.getDate() + 60);

    const grossFromOneOff = (it: PlannedOneOff) => {
      const eur = Number(it.eur_amount ?? 0);
      const rate = Number(it.eur_rate ?? 0);
      const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
      const net = Math.max(0, Number(it.amount ?? 0) + eurHuf);
      const s = computeVatSplit(net, it.vat_rate ?? defaultVat, "net");
      return s.gross;
    };
    const grossFromUsage = (tpl: UsageTemplate, ev: UsageEvent) => {
      const eur = Number(tpl.eur_unit_amount ?? 0);
      const rate = Number(tpl.eur_rate ?? 0);
      const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
      const netUnit = Math.max(0, Number(tpl.unit_amount ?? 0) + eurHuf);
      const net = netUnit * Math.max(0, Number(ev.count ?? 0));
      const s = computeVatSplit(net, tpl.vat_rate ?? defaultVat, "net");
      return s.gross;
    };

    let fixed30 = 0;
    let fixed60 = 0;
    for (const x of upcomingRecurring) {
      if (x.item.type !== "expense") continue;
      const at = new Date(x.at);
      if (at <= d30) fixed30 += x.gross;
      if (at <= d60) fixed60 += x.gross;
    }
    for (const it of upcomingOneOff) {
      if (it.type !== "expense") continue;
      const at = new Date(it.at);
      const g = grossFromOneOff(it);
      if (at <= d30) fixed30 += g;
      if (at <= d60) fixed60 += g;
    }
    for (const x of upcomingUsage) {
      if (x.tpl.type !== "expense") continue;
      const at = new Date(x.e.at);
      const g = grossFromUsage(x.tpl, x.e);
      if (at <= d30) fixed30 += g;
      if (at <= d60) fixed60 += g;
    }

    // Active loans: add monthly installments to fixed costs (approx. 1x for 30d, 2x for 60d)
    const loanMonthly = activeLoans.reduce((acc, l) => acc + debtNearTermBurden(l, 31), 0);
    fixed30 += loanMonthly;
    fixed60 += loanMonthly * 2;

    const available =
      (vatReserve?.free ?? 0) + (vatReserve?.reserved ?? 0);
    const cov = (need: number) => {
      if (need <= 0) return { pct: 1, missing: 0 };
      const pct = Math.max(0, Math.min(1, available / need));
      return { pct, missing: Math.max(0, need - available) };
    };
    return {
      available,
      fixed30,
      fixed60,
      cov30: cov(fixed30),
      cov60: cov(fixed60),
    };
  }, [
    activeWorkspace,
    activeLoans,
    businessMode,
    defaultVat,
    upcomingOneOff,
    upcomingRecurring,
    upcomingUsage,
    vatReserve?.free,
    vatReserve?.reserved,
  ]);

  const whatIf = useMemo(() => {
    if (!businessMode || activeWorkspace === "__all") return null;

    const ws = activeWorkspace;
    const horizonMonths = vizSpan;

    // Estimate fixed monthly expenses from recurring items + active loans.
    const recurringItems: RecurringItem[] = (settings.recurring ?? []).filter((r) => (r.workspace ?? ws) === ws);
    let fixedMonthlyGross = 0;
    for (const it of recurringItems) {
      if (it.type !== "expense") continue;
      const eur = Number(it.eur_amount ?? 0);
      const rate = Number(it.eur_rate ?? 0);
      const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
      const net = Math.max(0, Number(it.amount ?? 0) + eurHuf);
      const s = computeVatSplit(net, it.vat_rate ?? defaultVat, "net");
      const gross = s.gross;
      const monthlyEq =
        it.interval === "weekly" ? gross * 4.345 : it.interval === "quarterly" ? gross / 3 : gross;
      fixedMonthlyGross += monthlyEq;
    }
    const loanMonthly = activeLoans
      .filter((l) => (l.status ?? "active") === "active")
      .filter((l) => (l.workspace_id ?? "personal") === ws)
      .reduce((a, l) => a + debtNearTermBurden(l, 31), 0);
    fixedMonthlyGross += loanMonthly;

    // Baseline from last 90 days (gross cash movement approximation).
    const now = new Date();
    const since = new Date(now);
    since.setDate(since.getDate() - 90);
    let income90 = 0;
    let expense90 = 0;
    for (const t of txns) {
      if ((t.workspace ?? "personal") !== ws) continue;
      if ((t.status ?? "actual") !== "actual") continue;
      const d = new Date(t.occurred_at);
      if (!(Number.isFinite(d.getTime()) && d >= since && d <= now)) continue;
      if (
        (t.internal_transfer_kind ?? null) === "member_loan_out" ||
        (t.internal_transfer_kind ?? null) === "member_loan_repay"
      )
        continue;
      const g = txnGrossHuf(t);
      if (t.type === "income") income90 += Math.max(0, g);
      else if (t.type === "expense") expense90 += Math.max(0, g);
    }
    const avgIncome = income90 / 3;
    const avgExpense = expense90 / 3;
    // If baseline has no actuals yet (e.g. fresh DEMO), fall back to a sane minimal baseline
    // so the chart doesn't look "broken". This keeps the demo experience usable.
    const baseIncome = avgIncome > 0 ? avgIncome : 450_000;
    const baseExpense = avgExpense > 0 ? avgExpense : 320_000;
    const variableMonthly = Math.max(0, avgExpense - fixedMonthlyGross);

    const build = (scenario: "optimistic" | "realistic" | "pessimistic") => {
      const rows: Array<{ month: string; cum: number; net: number; inc: number; exp: number }> = [];
      let cum = 0;
      for (let i = 0; i < horizonMonths; i++) {
        const m = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const label = m.toLocaleDateString("hu-HU", { year: "numeric", month: "short" });

        let inc = baseIncome;
        let exp = fixedMonthlyGross + Math.max(0, baseExpense - fixedMonthlyGross);
        if (scenario === "optimistic") {
          inc = inc * 1.2;
          exp = exp * 0.9;
        } else if (scenario === "pessimistic") {
          inc = i < 2 ? 0 : inc * 0.7; // +60 nap csúszás
          exp = exp * 1.15;
        }
        const net = inc - exp;
        cum += net;
        rows.push({ month: label, cum, net, inc, exp });
      }
      const totalInc = rows.reduce((a, r) => a + r.inc, 0);
      const totalExp = rows.reduce((a, r) => a + r.exp, 0);
      const roi = totalExp > 0 ? (((totalInc - totalExp) / totalExp) * 100) : null;
      const be = rows.findIndex((r) => r.cum >= 0);
      return { rows, roi, breakEvenIdx: be >= 0 ? be : null };
    };

    const optimistic = build("optimistic");
    const realistic = build("realistic");
    const pessimistic = build("pessimistic");

    const pick = whatIfScenario === "optimistic" ? optimistic : whatIfScenario === "pessimistic" ? pessimistic : realistic;
    const breakEvenLabel = pick.breakEvenIdx == null ? null : pick.rows[pick.breakEvenIdx]?.month ?? null;

    const fixedRatio = avgExpense > 0 ? fixedMonthlyGross / avgExpense : null;

    const strategyWhatIf =
      demoSegmentId && isStrategySegment(demoSegmentId)
        ? buildStrategyWhatIf({
            caseId: demoSegmentId,
            baseIncome: MASTER_BASELINE.monthlyRevenueNet,
            baseExpense: Math.round(MASTER_BASELINE.monthlyRevenueNet * 0.78),
            horizonMonths,
          })
        : null;

    const educationWhatIf =
      demoSegmentId && isEducationSegment(demoSegmentId)
        ? buildEducationWhatIf({ caseId: demoSegmentId, horizonMonths })
        : null;

    const industryWhatIf =
      demoSegmentId && isIndustrySegment(demoSegmentId)
        ? buildIndustryWhatIf({ caseId: demoSegmentId, horizonMonths })
        : null;

    const chart =
      strategyWhatIf?.chart ??
      educationWhatIf?.chart ??
      industryWhatIf?.chart ??
      realistic.rows.map((r, i) => ({
        month: r.month,
        optimistic: optimistic.rows[i]?.cum ?? 0,
        realistic: realistic.rows[i]?.cum ?? 0,
        pessimistic: pessimistic.rows[i]?.cum ?? 0,
      }));

    const pickMonth = pick.rows[0] ?? { inc: baseIncome, exp: baseExpense, net: 0 };
    const inRecent = (iso: string) => {
      const d = new Date(iso);
      if (!Number.isFinite(d.getTime())) return false;
      const months =
        (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      return months >= 0 && months < 3;
    };
    const recentExp = txns
      .filter((t) => (t.workspace ?? "personal") === activeWorkspace)
      .filter((t) => (t.status ?? "actual") === "actual")
      .filter((t) => t.type === "expense" && inRecent(t.occurred_at));
    const rawSum = recentExp.reduce((a, t) => a + Math.abs(Number(t.amount) || 0), 0);
    const scale = rawSum > 0 ? Math.max(0, pickMonth.exp) / rawSum : 1;
    const waterfall = groupExpenseWaterfall(
      pickMonth.inc,
      recentExp.map((t) => ({ category: t.category, amount: Math.abs(Number(t.amount) || 0) * scale })),
    );

    return {
      fixedMonthlyGross,
      avgIncome,
      avgExpense,
      fixedRatio,
      breakEvenLabel,
      roi: pick.roi,
      chart,
      waterfall,
      multiples: [
        { id: "opt", label: t("dash.optimistic"), points: chart.map((c) => ({ x: c.month, y: c.optimistic })), active: whatIfScenario === "optimistic" },
        { id: "real", label: t("dash.realistic"), points: chart.map((c) => ({ x: c.month, y: c.realistic })), active: whatIfScenario === "realistic" },
        { id: "pess", label: t("dash.pessimistic"), points: chart.map((c) => ({ x: c.month, y: c.pessimistic })), active: whatIfScenario === "pessimistic" },
      ],
      strategySignals: strategyWhatIf?.signals ?? [],
      strategyInheritedFrom: strategyWhatIf?.inheritedFrom ?? "",
    };
  }, [activeLoans, activeWorkspace, businessMode, defaultVat, demoSegmentId, settings.recurring, t, txns, txnGrossHuf, vizSpan, whatIfScenario]);

  const leanInsights = useMemo(() => {
    if (!businessMode || activeWorkspace === "__all") return null;
    const ws = activeWorkspace;
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const inMonth = (iso: string) => {
      const d = new Date(iso);
      if (!Number.isFinite(d.getTime())) return false;
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return k === monthKey;
    };
    const isInternal = (t: Transaction) =>
      (t.internal_transfer_kind ?? null) === "member_loan_out" ||
      (t.internal_transfer_kind ?? null) === "member_loan_repay";

    const all = txns
      .filter((t) => (t.workspace ?? "personal") === ws)
      .filter((t) => (t.status ?? "actual") === "actual")
      .filter((t) => !isInternal(t));
    const monthTxns = all.filter((t) => inMonth(t.occurred_at));

    const vatQuarterPayable = Math.max(0, vatReserve?.payable ?? 0);
    const vatMonthly = vatQuarterPayable / 3;
    const fixedMonthlyGross = Math.max(0, Number(whatIf?.fixedMonthlyGross ?? 0));

    let inflowGross = 0;
    let expenseGross = 0;
    let reinvestGross = 0;
    let loanPrincipalNet = 0;
    let frictionGross = 0;
    let missingCategory = 0;
    let missingPartner = 0;
    const incomeDates: number[] = [];
    const expenseDates: number[] = [];

    for (const t of monthTxns) {
      const net = txnNetHuf(t);
      const gross = txnGrossHuf(t);
      if (!String(t.category ?? "").trim()) missingCategory++;
      if (!String(t.party ?? "").trim()) missingPartner++;

      const txt = `${t.title ?? ""} ${t.note ?? ""} ${t.party ?? ""} ${t.category ?? ""}`.toLowerCase();
      if (
        txt.includes("díj") ||
        txt.includes("jutal") ||
        txt.includes("kamat") ||
        txt.includes("késedel") ||
        txt.includes("bank")
      )
        frictionGross += Math.max(0, gross);

      if (t.type === "income") {
        inflowGross += Math.max(0, gross);
        const ms = new Date(t.occurred_at).getTime();
        if (Number.isFinite(ms)) incomeDates.push(ms);
      } else if (t.type === "expense") {
        expenseGross += Math.max(0, gross);
        const ms = new Date(t.occurred_at).getTime();
        if (Number.isFinite(ms)) expenseDates.push(ms);
        if (isLoanRepaymentTxn(t)) {
          const p = Math.max(0, Number((t.loan_principal_paid ?? net) as any));
          loanPrincipalNet += Math.min(Math.max(0, net), p);
        }
      } else {
        reinvestGross += Math.max(0, gross);
      }
    }

    incomeDates.sort((a, b) => a - b);
    expenseDates.sort((a, b) => a - b);
    const cycleDays = (() => {
      if (incomeDates.length === 0 || expenseDates.length === 0) return null;
      let i = 0;
      const deltas: number[] = [];
      for (const e of expenseDates) {
        while (i + 1 < incomeDates.length && incomeDates[i + 1] <= e) i++;
        const inc = incomeDates[i];
        if (inc != null && inc <= e) deltas.push((e - inc) / (24 * 60 * 60 * 1000));
      }
      if (deltas.length === 0) return null;
      const avg = deltas.reduce((a, d) => a + d, 0) / deltas.length;
      return Math.max(0, avg);
    })();

    const netValueGross = inflowGross - expenseGross - vatMonthly;
    const eff = inflowGross > 0 ? Math.max(0, netValueGross) / inflowGross : 0;

    // Idle cash (heuristic): if there is free cash but no reinvest in last 60d.
    const ms60 = 60 * 24 * 60 * 60 * 1000;
    const since60 = Date.now() - ms60;
    const reinvest60 = all.reduce((acc, t) => {
      if (t.type !== "saving") return acc;
      const ms = new Date(t.occurred_at).getTime();
      if (!Number.isFinite(ms) || ms < since60) return acc;
      return acc + Math.max(0, txnGrossHuf(t));
    }, 0);
    const idleCash = reinvest60 <= 0.01 ? Math.max(0, Number(vatReserve?.free ?? 0)) : 0;

    const totalCount = monthTxns.length;
    const dataWastePct = totalCount > 0 ? (missingCategory + missingPartner) / (2 * totalCount) : 0;
    const idlePct =
      (vatReserve?.balance ?? 0) > 0
        ? idleCash / Math.max(1, Number(vatReserve?.balance ?? 0))
        : 0;
    const frictionPct = expenseGross > 0 ? frictionGross / Math.max(1, expenseGross) : 0;
    const score = Math.round(
      Math.max(
        0,
        Math.min(
          100,
          100 -
            Math.min(40, dataWastePct * 100 * 0.4) -
            Math.min(30, idlePct * 100 * 0.3) -
            Math.min(30, frictionPct * 100 * 0.3),
        ),
      ),
    );

    const jitOk = (runway?.cov60?.pct ?? 0) >= 1;

    return {
      monthKey,
      inflowGross,
      expenseGross,
      bufferVatMonthly: vatMonthly,
      bufferFixedMonthlyGross: fixedMonthlyGross,
      bufferLoanPrincipalNet: loanPrincipalNet,
      netValueGross,
      reinvestGross,
      eff,
      cycleDays,
      idleCash,
      frictionGross,
      dataWastePct,
      score,
      jitOk,
    };
  }, [
    activeWorkspace,
    businessMode,
    defaultVat,
    isLoanRepaymentTxn,
    runway?.cov60?.pct,
    txnGrossHuf,
    txnNetHuf,
    txns,
    vatReserve?.balance,
    vatReserve?.free,
    vatReserve?.payable,
    whatIf?.fixedMonthlyGross,
  ]);

  const checkSummary = useMemo(() => {
    if (!leanInsights) return null;
    const runway60Pct = runway ? Math.round((runway.cov60?.pct ?? 0) * 100) : null;
    return {
      mudaScore: leanInsights.score,
      effPct: Math.round(leanInsights.eff * 100),
      runway60Pct,
      frictionGross: leanInsights.frictionGross,
      idleCash: leanInsights.idleCash,
      dataWastePct: Math.round(leanInsights.dataWastePct * 100),
    };
  }, [leanInsights, runway]);

  const resourceEfficiency = useMemo(() => {
    if (!activeWorkspaceMeta) return null;
    const hrs = (activeWorkspaceMeta as any).humanResources ?? [];
    const vehicles = (activeWorkspaceMeta as any).vehicles ?? [];
    const hrByName = new Map<string, "subcontractor_ev" | "efo_casual">(
      (Array.isArray(hrs) ? hrs : []).map((h: any) => [String(h?.name ?? "").trim().toLowerCase(), h?.type]),
    );
    const plates = new Set<string>(
      (Array.isArray(vehicles) ? vehicles : [])
        .map((v: any) => String(v?.plateNumber ?? "").trim().toUpperCase())
        .filter(Boolean),
    );

    let evGross = 0;
    let efoGross = 0;
    let hrPlannedGross = 0;
    let hrActualGross = 0;
    let vehicleGross = 0;
    let totalExpenseGross = 0;

    for (const t of txns) {
      const ws = (t.workspace ?? "personal") as string;
      if (activeWorkspace !== "__all" && ws !== activeWorkspace) continue;
      if (t.type !== "expense") continue;
      const gross = txnGrossHuf(t);
      totalExpenseGross += gross;

      const st = (t.status ?? "actual") as any;
      const isPlanned = st !== "actual";

      const partyKey = String(t.party ?? "").trim().toLowerCase();
      const cat = String(t.category ?? "");

      let hrType: "subcontractor_ev" | "efo_casual" | null =
        (partyKey && hrByName.get(partyKey)) || null;
      if (!hrType) {
        if (cat.toLowerCase().includes("alvállalkoz")) hrType = "subcontractor_ev";
        else if (cat.toLowerCase().includes("efo")) hrType = "efo_casual";
      }

      if (hrType) {
        if (hrType === "subcontractor_ev") evGross += gross;
        else efoGross += gross;
        if (isPlanned) hrPlannedGross += gross;
        else hrActualGross += gross;
      }

      const hay = `${t.title ?? ""} ${t.note ?? ""} ${t.party ?? ""} ${t.category ?? ""}`.toUpperCase();
      const isFleet = cat.startsWith("FLOTTA:");
      let isVehicle = isFleet;
      if (!isVehicle && plates.size > 0) {
        for (const p of plates) {
          if (p && hay.includes(p)) {
            isVehicle = true;
            break;
          }
        }
      }
      if (isVehicle) vehicleGross += gross;
    }

    return {
      evGross,
      efoGross,
      hrPlannedGross,
      hrActualGross,
      vehicleGross,
      totalExpenseGross,
    };
  }, [activeWorkspace, activeWorkspaceMeta, txnGrossHuf, txns]);

  // VAT breakdown per section (business/project only).
  const vatBreakdown = useMemo(() => {
    const acc = {
      income: { net: 0, vat: 0, gross: 0 },
      expense: { net: 0, vat: 0, gross: 0 },
      saving: { net: 0, vat: 0, gross: 0 },
    };
    if (!businessMode) return acc;
    for (const t of txns) {
      const net = txnNetHuf(t);
      const treatment = t.vat_treatment ?? "hu_gross";
      const rate = t.vat_rate ?? defaultVat;
      const s =
        t.type === "saving" || treatment === "no_vat" || treatment === "foreign" || treatment === "reverse_charge"
          ? { net, vat: 0, gross: net }
          : computeVatSplit(net, rate, "net");
      acc[t.type].net += s.net;
      acc[t.type].vat += s.vat;
      acc[t.type].gross += s.gross;
    }
    return acc;
  }, [txns, businessMode, defaultVat, txnNetHuf]);

  const goalLinkedBucketIds = useMemo(() => {
    if (!activeGoal) return new Set<string>();
    const nm = activeGoal.name.trim().toLowerCase();
    return new Set(
      settings.buckets.filter((b) => b.name.trim().toLowerCase() === nm).map((b) => b.id),
    );
  }, [activeGoal?.name, settings.buckets]);

  const goalSavings = useMemo(() => {
    let sum = 0;
    for (const t of txns) {
      if (t.type !== "saving") continue;
      // General savings (no bucket) always count; named buckets only when linked by name.
      if (!t.bucket_id || goalLinkedBucketIds.has(t.bucket_id)) sum += Number(t.amount);
    }
    return sum;
  }, [txns, goalLinkedBucketIds]);

  const plannedExpenses = useMemo(() => {
    const now = Date.now();
    const horizon = now + 21 * 24 * 60 * 60 * 1000;
    let sum = 0;
    for (const g of goals) {
      if (!g.is_active) continue;
      const d = new Date(g.deadline).getTime();
      if (isNaN(d) || d > horizon) continue;
      const linked = new Set(
        settings.buckets
          .filter((b) => b.name.trim().toLowerCase() === g.name.trim().toLowerCase())
          .map((b) => b.id),
      );
      let saved = 0;
      for (const t of txns) {
        if (t.type !== "saving") continue;
        if (!t.bucket_id || linked.has(t.bucket_id)) saved += Number(t.amount);
      }
      sum += Math.max(0, Number(g.target_amount) - saved);
    }
    return sum;
  }, [goals, txns, settings.buckets]);

  const bucketName = useCallback(
    (id: string | null | undefined) => {
      if (!id || id === "__none") return "Általános megtakarítás";
      return displayBucketName(settings.buckets.find((b) => b.id === id)?.name) || "Törölt alhalmaz";
    },
    [settings.buckets],
  );

  const savingsByBucket = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of txns) {
      if (t.type !== "saving") continue;
      const key = t.bucket_id ?? "__none";
      map.set(key, (map.get(key) ?? 0) + Number(t.amount ?? 0));
    }
    return map;
  }, [txns]);

  const [selectedBucketKeys, setSelectedBucketKeys] = useState<Set<string>>(() => new Set());
  const [reallocateOpen, setReallocateOpen] = useState(false);
  const [reallocateFrom, setReallocateFrom] = useState<string>("");
  const [reallocateTo, setReallocateTo] = useState<string>("");
  const [reallocateAmount, setReallocateAmount] = useState("");

  type UndoEntry = { label: string; run: () => Promise<void> };
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
  const pushUndo = useCallback((e: UndoEntry) => {
    setUndoStack((s) => [...s.slice(-9), e]);
  }, []);
  const undo = useCallback(() => {
    setUndoStack((s) => {
      const last = s[s.length - 1];
      if (last) {
        last.run().catch((err: Error) => toast.error(err.message));
      }
      return s.slice(0, -1);
    });
  }, []);

  const commitSettings = useCallback(
    (next: CustomSettings, label: string) => {
      const prev = settings;
      saveSettings.mutate(next, {
        onSuccess: () => {
          appendAudit({ op: "save", store: "settings", key: profileId, message: label });
          pushUndo({
            label,
            run: async () => {
              const data_enc = await encryptJSON(vaultKey, prev);
              await localdb.putSettings(data_enc);
              await qc.invalidateQueries({ queryKey: ["settings"] });
              toast.success(`${label} visszavonva`);
            },
          });
        },
      });
    },
    [settings, saveSettings, pushUndo, vaultKey, qc, appendAudit, profileId],
  );

  const addCategory = useCallback(
    (kind: "income" | "expense", label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      const key = kind === "income" ? "incomeCategories" : "expenseCategories";
      const list = settings[key];
      const predefined =
        kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      if (
        list.includes(trimmed) ||
        (predefined as readonly string[]).includes(trimmed)
      )
        return;
      commitSettings(
        { ...settings, [key]: [...list, trimmed] },
        "Új kategória",
      );
    },
    [settings, commitSettings],
  );

  const addBucket = useCallback(
    (name: string): SavingBucket | null => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const existing = settings.buckets.find((b) => b.name === trimmed);
      if (existing) return existing;
      const bucket: SavingBucket = { id: newId(), name: trimmed };
      commitSettings(
        { ...settings, buckets: [...settings.buckets, bucket] },
        "Új alhalmaz",
      );
      return bucket;
    },
    [settings, commitSettings],
  );

  const renameBucket = useCallback(
    (id: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      commitSettings(
        {
          ...settings,
          buckets: settings.buckets.map((b) =>
            b.id === id ? { ...b, name: trimmed } : b,
          ),
        },
        "Alhalmaz átnevezés",
      );
    },
    [settings, commitSettings],
  );

  const removeBucket = useCallback(
    (id: string) => {
      commitSettings(
        {
          ...settings,
          buckets: settings.buckets.filter((b) => b.id !== id),
        },
        "Alhalmaz törlés",
      );
    },
    [settings, commitSettings],
  );

  const reallocateBuckets = useMutation({
    mutationFn: async (input: { fromKey: string; toKey: string; amount: number }) => {
      const amt = Math.round(Math.abs(input.amount));
      if (!(amt > 0)) throw new Error("Érvénytelen összeg.");
      if (input.fromKey === input.toKey) throw new Error("Válassz két különböző perselyt.");
      const fromBal = savingsByBucket.get(input.fromKey) ?? 0;
      if (amt > fromBal + 1e-6) throw new Error("Nincs elég egyenleg a forrás-perselyben.");
      const ws = activeWorkspace === "__all" ? "personal" : activeWorkspace;
      const at = new Date().toISOString();
      const outId = newId();
      const inId = newId();
      const fromBucket = input.fromKey === "__none" ? null : input.fromKey;
      const toBucket = input.toKey === "__none" ? null : input.toKey;
      const outPayload: TxnPayload = {
        amount: -amt,
        category: "savings",
        note: `Átcsoportosítás → ${bucketName(input.toKey)}`,
        bucket_id: fromBucket,
        workspace: ws,
        status: "actual",
        title: null,
        party: null,
      };
      const inPayload: TxnPayload = {
        amount: amt,
        category: "savings",
        note: `Átcsoportosítás ← ${bucketName(input.fromKey)}`,
        bucket_id: toBucket,
        workspace: ws,
        status: "actual",
        title: null,
        party: null,
      };
      await localdb.putTxn({
        id: outId,
        type: "saving",
        occurred_at: at,
        data_enc: await encryptJSON(vaultKey, outPayload),
      });
      await localdb.putTxn({
        id: inId,
        type: "saving",
        occurred_at: at,
        data_enc: await encryptJSON(vaultKey, inPayload),
      });
      return { outId, inId };
    },
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ["transactions"] });
      appendAudit({
        op: "save",
        store: "transactions",
        key: res.outId,
        message: "Persely átcsoportosítás",
      });
      pushUndo({
        label: "Persely átcsoportosítás",
        run: async () => {
          await localdb.deleteTxn(res.outId);
          await localdb.deleteTxn(res.inId);
          await qc.invalidateQueries({ queryKey: ["transactions"] });
          toast.success("Átcsoportosítás visszavonva");
        },
      });
      toast.success("Átcsoportosítás mentve.");
      setReallocateOpen(false);
      setReallocateAmount("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeCategory = useCallback(
    (kind: "income" | "expense", label: string) => {
      const key = kind === "income" ? "incomeCategories" : "expenseCategories";
      commitSettings(
        {
          ...settings,
          [key]: settings[key].filter((c) => c !== label),
        },
        "Kategória törlés",
      );
    },
    [settings, commitSettings],
  );



  const addTxn = useMutation({
    mutationFn: async (input: {
      type: TxnType;
      occurred_at: string;
      payload: TxnPayload;
      bypassWantsLock?: boolean;
    }) => {
      if (denyShowcaseWrite(isVisitorDemo)) throw new Error("denied");
      const ws =
        input.payload.workspace ??
        (activeWorkspace === "__all" ? "personal" : activeWorkspace);
      const payload: TxnPayload = {
        ...input.payload,
        workspace: ws,
        vat_rate:
          input.payload.vat_rate ?? (ws === "personal" ? null : defaultVat),
      };

      // Auto-rule apply (best-effort): fill missing category/partner from keyword rules.
      try {
        const s = suggestFromRules(categoryRulesQ.data ?? [], {
          workspaceId: ws,
          text: [payload.title ?? "", payload.party ?? "", payload.note ?? ""].filter(Boolean).join(" "),
        });
        Object.assign(payload, applySuggestion(payload, s));
      } catch {
        /* best-effort */
      }

      // Ensure immediate Lean tags for manual entries as well (personal workspace).
      if (ws === "personal" && input.type === "expense") {
        const cat = String(payload.category ?? "");
        const et =
          payload.expense_type ??
          (cat === "housing" || cat === "utilities" || cat === "loan_repayment"
            ? "FIX_NEED"
            : cat === "food" || cat === "transport" || cat === "health"
              ? "VARIABLE_NEED"
              : cat === "entertainment" || cat === "shopping"
                ? "WANT"
                : cat === "education"
                  ? "INVESTMENT"
                  : undefined);
        payload.expense_type = et ?? payload.expense_type ?? undefined;
        payload.muda_type = payload.muda_type ?? "NONE";
        payload.is_recurring = payload.is_recurring ?? false;
      }

      // WANT budget guard (best-effort) for the active workspace.
      if (
        ws === "personal" &&
        activeWorkspace !== "__all" &&
        ws === activeWorkspace &&
        input.type === "expense" &&
        wantsBudgetMonthlyHuf != null &&
        (payload.expense_type ?? null) === "WANT" &&
        !input.bypassWantsLock
      ) {
        const amt = Math.max(0, Number(payload.amount ?? 0));
        if (wantsSpendThisMonth + amt > wantsBudgetMonthlyHuf) {
          throw new Error(
            `WANT költségkeret zárolva: ${formatMoney(Math.round(wantsBudgetMonthlyHuf), CURRENCY)}/hó (aktuális: ${formatMoney(
              Math.round(wantsSpendThisMonth),
              CURRENCY,
            )}).`,
          );
        }
      }

      if (input.type === "expense" || Number(payload.amount) <= 0) {
        payload.bucket_id = null;
      }

      const INTERNAL_INCOME = "PÉNZÜGYI BEVÉTELEK: Tagi kölcsön befizetés";
      const INTERNAL_EXPENSE = "PÉNZÜGYI KIADÁSOK: Tagi kölcsön kifizetés";

      const isInternal =
        payload.internal_transfer_kind === "member_loan_out" ||
        payload.internal_transfer_kind === "member_loan_repay";

      if (isInternal) {
        const fromWs = ws;
        const toWs =
          payload.internal_transfer_to ??
          (payload.internal_transfer_kind === "member_loan_out"
            ? wsOptions.find((w) =>
                w.toLowerCase().startsWith("vállalkozás") || w.toLowerCase().startsWith("vallalkozas"),
              ) ?? ""
            : "personal");
        if (!toWs || toWs === fromWs) throw new Error("Belső átvezetéshez kötelező a cél számla.");

        const groupId = newId();
        const senderId = newId();
        const receiverId = newId();

        const base: TxnPayload = {
          ...payload,
          internal_transfer_group_id: groupId,
          internal_transfer_from: fromWs,
          internal_transfer_to: toWs,
          vat_rate: 0,
          vat_treatment: "no_vat",
          vat_review: false,
          vat_deductibility: 0,
        };

        const senderPayload: TxnPayload = {
          ...base,
          internal_transfer_peer_id: receiverId,
          category: INTERNAL_EXPENSE,
          // force "expense" on sender side
          note:
            base.note ??
            (base.internal_transfer_kind === "member_loan_out"
              ? "Tagi befizetés / kölcsön"
              : "Tagi kölcsön visszafizetés"),
        };
        const receiverPayload: TxnPayload = {
          ...base,
          internal_transfer_peer_id: senderId,
          category: INTERNAL_INCOME,
          note:
            base.note ??
            (base.internal_transfer_kind === "member_loan_out"
              ? "Tagi befizetés / kölcsön"
              : "Tagi kölcsön visszafizetés"),
        };

        await localdb.putTxn({
          id: senderId,
          type: "expense",
          occurred_at: input.occurred_at,
          data_enc: await encryptJSON(vaultKey, { ...senderPayload, workspace: fromWs }),
        });
        await localdb.putTxn({
          id: receiverId,
          type: "income",
          occurred_at: input.occurred_at,
          data_enc: await encryptJSON(vaultKey, { ...receiverPayload, workspace: toWs }),
        });
        return { primaryId: senderId, ids: [senderId, receiverId] };
      }

      const id = newId();
      const data_enc = await encryptJSON(vaultKey, payload);
      await localdb.putTxn({
        id,
        type: input.type,
        occurred_at: input.occurred_at,
        data_enc,
      });
      if (input.type === "expense" && payload.loan_id && isLoanRepaymentCategory(payload.category)) {
        await applyLoanPrincipalDelta(payload.loan_id, -principalFromPayload(payload));
      }
      return { primaryId: id, ids: [id] };
    },
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      markWsPdca("do");
      appendAudit({
        op: "save",
        store: "transactions",
        key: res.primaryId,
        message: vars.payload.internal_transfer_kind ? "Belső átvezetés (tagi)" : `Új tétel (${vars.type})`,
      });
      pushUndo({
        label: "Új tétel",
        run: async () => {
          for (const id of res.ids) await localdb.deleteTxn(id);
          await qc.invalidateQueries({ queryKey: ["transactions"] });
          toast.success("Új tétel visszavonva");
        },
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delTxn = useMutation({
    mutationFn: async (id: string) => {
      const rows = await localdb.listTxns();
      const row = rows.find((r) => r.id === id);
      if (!row) {
        await localdb.deleteTxn(id);
        return { rows: [], ids: [id], loanEffects: [] as Array<{ loanId: string; delta: number }> };
      }
      let peerId: string | null = null;
      const loanEffects: Array<{ loanId: string; delta: number }> = [];
      try {
        const p = await decryptJSON<TxnPayload>(vaultKey, row.data_enc);
        peerId = (p.internal_transfer_peer_id as any) ?? null;
        if (row.type === "expense" && p.loan_id && isLoanRepaymentCategory(String(p.category ?? ""))) {
          const principal = principalFromPayload(p);
          if (principal > 0) {
            await applyLoanPrincipalDelta(String(p.loan_id), principal);
            loanEffects.push({ loanId: String(p.loan_id), delta: principal });
          }
        }
      } catch {
        peerId = null;
      }
      const peer = peerId ? rows.find((r) => r.id === peerId) ?? null : null;
      if (peer) {
        try {
          const pp = await decryptJSON<TxnPayload>(vaultKey, peer.data_enc);
          if (peer.type === "expense" && pp.loan_id && isLoanRepaymentCategory(String(pp.category ?? ""))) {
            const principal = principalFromPayload(pp);
            if (principal > 0) {
              await applyLoanPrincipalDelta(String(pp.loan_id), principal);
              loanEffects.push({ loanId: String(pp.loan_id), delta: principal });
            }
          }
        } catch {
          /* ignore */
        }
      }
      await localdb.deleteTxn(id);
      if (peer) await localdb.deleteTxn(peer.id);
      return {
        rows: [row, ...(peer ? [peer] : [])],
        ids: [id, ...(peer ? [peer.id] : [])],
        loanEffects,
      };
    },
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      if (res.loanEffects?.length) qc.invalidateQueries({ queryKey: ["loans"] });
      appendAudit({ op: "delete", store: "transactions", key: res.rows[0]?.id ?? id, message: "Tétel törlése" });
      if (res.rows.length > 0) {
        pushUndo({
          label: "Tétel törlése",
          run: async () => {
            for (const r of res.rows) await localdb.putTxn(r);
            for (const e of res.loanEffects ?? []) {
              await applyLoanPrincipalDelta(e.loanId, -e.delta);
            }
            await qc.invalidateQueries({ queryKey: ["transactions"] });
            if (res.loanEffects?.length) await qc.invalidateQueries({ queryKey: ["loans"] });
            toast.success("Törlés visszavonva");
          },
        });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkDeleteTxns = useMutation({
    mutationFn: async (ids: string[]) => {
      const rows = await localdb.listTxns();
      const byId = new Map(rows.map((r) => [r.id, r]));
      const toDelete = new Set<string>();
      const deletedRows: EncTxnRow[] = [];
      const loanEffects: Array<{ loanId: string; delta: number }> = [];

      for (const id of ids) {
        toDelete.add(id);
        const row = byId.get(id);
        if (!row) continue;
        try {
          const p = await decryptJSON<TxnPayload>(vaultKey, row.data_enc);
          const peerId = (p.internal_transfer_peer_id as any) ?? null;
          if (peerId) toDelete.add(String(peerId));
        } catch {
          /* ignore */
        }
      }

      for (const id of Array.from(toDelete)) {
        const row = byId.get(id);
        if (!row) {
          await localdb.deleteTxn(id);
          continue;
        }
        try {
          const p = await decryptJSON<TxnPayload>(vaultKey, row.data_enc);
          if (row.type === "expense" && p.loan_id && isLoanRepaymentCategory(String(p.category ?? ""))) {
            const principal = principalFromPayload(p);
            if (principal > 0) {
              await applyLoanPrincipalDelta(String(p.loan_id), principal);
              loanEffects.push({ loanId: String(p.loan_id), delta: principal });
            }
          }
        } catch {
          /* ignore */
        }
        deletedRows.push(row);
        await localdb.deleteTxn(id);
      }
      return { deletedRows, loanEffects };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      if (res.loanEffects.length) qc.invalidateQueries({ queryKey: ["loans"] });
      appendAudit({ op: "delete", store: "transactions", key: "bulk", message: `Tömeges törlés (${res.deletedRows.length} db)` });
      pushUndo({
        label: "Tömeges törlés",
        run: async () => {
          for (const r of res.deletedRows) await localdb.putTxn(r);
          for (const e of res.loanEffects) await applyLoanPrincipalDelta(e.loanId, -e.delta);
          await qc.invalidateQueries({ queryKey: ["transactions"] });
          if (res.loanEffects.length) await qc.invalidateQueries({ queryKey: ["loans"] });
          toast.success("Tömeges törlés visszavonva");
        },
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkPiggy = useMutation({
    mutationFn: async (input: { ids: string[]; bucketId: string | null }) => {
      const rows = await localdb.listTxns();
      const byId = new Map(rows.map((r) => [r.id, r]));
      const prevRows: EncTxnRow[] = [];
      const now = new Date().toISOString();
      let applied = 0;
      let skipped = 0;

      for (const id of input.ids) {
        const row = byId.get(id);
        if (!row) continue;
        let payload: TxnPayload | null = null;
        try {
          payload = await decryptJSON<TxnPayload>(vaultKey, row.data_enc);
        } catch {
          payload = null;
        }
        if (!payload) continue;
        const amt = Number(payload.amount ?? 0);
        const eligible = (row.type === "income" || row.type === "saving") && amt > 0;
        if (!eligible) {
          skipped++;
          continue;
        }
        prevRows.push(row);
        const next: TxnPayload = {
          ...payload,
          bucket_id: input.bucketId ?? null,
          history: [
            ...(payload.history ?? []),
            { at: now, from: row.type, to: "saving" as TxnType },
          ],
        };
        await localdb.putTxn({
          ...row,
          type: "saving",
          data_enc: await encryptJSON(vaultKey, next),
        });
        applied++;
      }
      return { prevRows, applied, skipped };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success(`Persely művelet kész: ${res.applied} tétel. Kihagyva: ${res.skipped}.`);
      appendAudit({ op: "save", store: "transactions", key: "bulk", message: `Tömeges persely (${res.applied} db)` });
      pushUndo({
        label: "Tömeges persely",
        run: async () => {
          for (const r of res.prevRows) await localdb.putTxn(r);
          await qc.invalidateQueries({ queryKey: ["transactions"] });
          toast.success("Tömeges persely visszavonva");
        },
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkCopyToProject = useMutation({
    mutationFn: async (input: { ids: string[]; projectWs: string }) => {
      const rows = await localdb.listTxns();
      const byId = new Map(rows.map((r) => [r.id, r]));
      const createdIds: string[] = [];
      const now = new Date().toISOString();
      const targetMeta = workspaceMetaById.get(input.projectWs) as any;
      const mode = (targetMeta?.project_mode as any) ?? null;

      for (const id of input.ids) {
        const row = byId.get(id);
        if (!row) continue;
        const p = await decryptJSON<TxnPayload>(vaultKey, row.data_enc);
        const copiedStatus =
          (p.status as any) && (p.status as any) !== "actual"
            ? (p.status as any)
            : mode === "simulation"
              ? "planned"
              : "committed";
        const next: TxnPayload = {
          ...p,
          workspace: input.projectWs,
          status: copiedStatus as any,
          bank_raw_id: null,
          source: "manual",
          loan_id: null,
          loan_principal_paid: null,
          internal_transfer_kind: null,
          internal_transfer_group_id: null,
          internal_transfer_peer_id: null,
          internal_transfer_from: null,
          internal_transfer_to: null,
          history: [
            ...(p.history ?? []),
            { at: now, from: row.type, to: row.type },
          ],
        };
        const newTxnId = newId();
        await localdb.putTxn({
          id: newTxnId,
          type: row.type,
          occurred_at: row.occurred_at,
          data_enc: await encryptJSON(vaultKey, next),
        });
        createdIds.push(newTxnId);
      }
      return { createdIds };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success(`Másolás kész: ${res.createdIds.length} tétel létrehozva a projektben.`);
      appendAudit({ op: "save", store: "transactions", key: "bulk", message: `Másolás projektbe (${res.createdIds.length} db)` });
      pushUndo({
        label: "Másolás projektbe",
        run: async () => {
          for (const id of res.createdIds) await localdb.deleteTxn(id);
          await qc.invalidateQueries({ queryKey: ["transactions"] });
          toast.success("Másolás visszavonva");
        },
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const moveTxn = useMutation({
    mutationFn: async (input: { id: string; to: TxnType }) => {
      const rows = await localdb.listTxns();
      const row = rows.find((r) => r.id === input.id);
      if (!row) throw new Error("Nem található tétel.");
      if (row.type === input.to) return { id: input.id, from: row.type };
      const payload = await decryptJSON<TxnPayload>(vaultKey, row.data_enc);
      const history = [
        ...(payload.history ?? []),
        { at: new Date().toISOString(), from: row.type, to: input.to },
      ];
      const next: TxnPayload = { ...payload, history };
      const data_enc = await encryptJSON(vaultKey, next);
      await localdb.putTxn({ ...row, type: input.to, data_enc });
      return { id: input.id, from: row.type };
    },
    onSuccess: (res, input) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      if (!res || res.from === undefined) return;
      const { id, from } = res;
      appendAudit({
        op: "save",
        store: "transactions",
        key: id,
        message: `Áthelyezés: ${from} → ${input.to}`,
      });
      pushUndo({
        label: "Áthelyezés",
        run: async () => {
          const rows = await localdb.listTxns();
          const row = rows.find((r) => r.id === id);
          if (!row) return;
          await localdb.putTxn({ ...row, type: from });
          await qc.invalidateQueries({ queryKey: ["transactions"] });
          toast.success("Áthelyezés visszavonva");
        },
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  type ManualLabelEvent = {
    at: number;
    txnId: string;
    workspaceId: string;
    sig: string;
    display: string;
    keyword: string;
    category: string;
    partner: string;
  };

  function normKey(s: string) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^\p{L}\p{N}\s]+/gu, "");
  }

  const updateTxn = useMutation({
    mutationFn: async (input: {
      id: string;
      type: TxnType;
      occurred_at: string;
      payload: TxnPayload;
      bypassWantsLock?: boolean;
    }) => {
      if (denyShowcaseWrite(isVisitorDemo)) throw new Error("denied");
      const rows = await localdb.listTxns();
      const row = rows.find((r) => r.id === input.id);
      if (!row) throw new Error("Nem található tétel.");
      const prev = await decryptJSON<TxnPayload>(vaultKey, row.data_enc);

      const wsId = String(input.payload.workspace ?? prev.workspace ?? "personal");
      const prevCat = String(prev.category ?? "");
      const nextCat = String(input.payload.category ?? "");
      const prevPartner = String((prev as any).party ?? "");
      const nextPartner = String((input.payload as any).party ?? "");
      const categoryChanged = prevCat.trim() !== nextCat.trim();
      const partnerChanged = prevPartner.trim() !== nextPartner.trim();
      const changed = categoryChanged || partnerChanged;
      const fallbackText = String(input.payload.title ?? prev.title ?? input.payload.note ?? prev.note ?? "").trim();
      const display = (nextPartner.trim() || fallbackText || "Ismeretlen").trim();
      const keyword = (nextPartner.trim() || fallbackText).trim().slice(0, 48);
      const sig = normKey(display).slice(0, 80);
      const manualLabel: ManualLabelEvent | null =
        changed && keyword && nextCat.trim()
          ? {
              at: Date.now(),
              txnId: input.id,
              workspaceId: wsId,
              sig,
              display,
              keyword,
              category: nextCat.trim(),
              partner: nextPartner.trim(),
            }
          : null;

      const INTERNAL_INCOME = "PÉNZÜGYI BEVÉTELEK: Tagi kölcsön befizetés";
      const INTERNAL_EXPENSE = "PÉNZÜGYI KIADÁSOK: Tagi kölcsön kifizetés";
      const isInternal =
        prev.internal_transfer_kind === "member_loan_out" ||
        prev.internal_transfer_kind === "member_loan_repay";
      const peerId = (prev.internal_transfer_peer_id as any) ?? null;
      const peerRow = peerId ? rows.find((r) => r.id === peerId) ?? null : null;

      const history = [...(prev.history ?? []), ...(input.payload.history ?? [])];
      const nextHistory =
        row.type !== input.type
          ? [
              ...history,
              { at: new Date().toISOString(), from: row.type, to: input.type },
            ]
          : history;

      if (isInternal && peerRow) {
        const fromWs = prev.internal_transfer_from ?? (prev.workspace ?? "personal");
        const toWs = prev.internal_transfer_to ?? (fromWs === "personal" ? (wsOptions[0] ?? "") : "personal");
        const common: TxnPayload = {
          ...input.payload,
          internal_transfer_kind: prev.internal_transfer_kind,
          internal_transfer_group_id: prev.internal_transfer_group_id ?? null,
          internal_transfer_from: fromWs,
          internal_transfer_to: toWs,
          vat_rate: 0,
          vat_treatment: "no_vat",
          vat_review: false,
          vat_deductibility: 0,
          history: nextHistory,
        };

        const senderEnc = await encryptJSON(vaultKey, {
          ...common,
          workspace: fromWs,
          internal_transfer_peer_id: peerRow.id,
          category: INTERNAL_EXPENSE,
        });
        const receiverEnc = await encryptJSON(vaultKey, {
          ...common,
          workspace: toWs,
          internal_transfer_peer_id: row.id,
          category: INTERNAL_INCOME,
        });

        await localdb.putTxn({
          id: row.id,
          type: "expense",
          occurred_at: input.occurred_at,
          data_enc: senderEnc,
        });
        await localdb.putTxn({
          id: peerRow.id,
          type: "income",
          occurred_at: input.occurred_at,
          data_enc: receiverEnc,
        });
        return { prevRow: row, prevPeerRow: peerRow, manualLabel: null as ManualLabelEvent | null };
      }

      const prevLoanId = (prev.loan_id as any) ?? null;
      const prevWasLoanRepay =
        row.type === "expense" && prevLoanId && isLoanRepaymentCategory(String(prev.category ?? ""));
      const prevPrincipal = prevWasLoanRepay ? principalFromPayload(prev as any) : 0;
      const nextLoanId = (input.payload.loan_id as any) ?? null;
      const nextWasLoanRepay =
        input.type === "expense" && nextLoanId && isLoanRepaymentCategory(String(input.payload.category ?? ""));
      const nextPrincipal = nextWasLoanRepay ? principalFromPayload(input.payload as any) : 0;

      const nextPayload: TxnPayload = {
        ...input.payload,
        bucket_id:
          input.type === "expense" || Number(input.payload.amount) <= 0 ? null : (input.payload.bucket_id ?? null),
        workspace: input.payload.workspace ?? prev.workspace ?? "personal",
        vat_rate: input.payload.vat_rate ?? prev.vat_rate ?? null,
        history: nextHistory,
      };

      // Ensure immediate Lean tags for manual edits as well (personal workspace).
      if (nextPayload.workspace === "personal" && input.type === "expense") {
        const cat = String(nextPayload.category ?? "");
        const et =
          nextPayload.expense_type ??
          (cat === "housing" || cat === "utilities" || cat === "loan_repayment"
            ? "FIX_NEED"
            : cat === "food" || cat === "transport" || cat === "health"
              ? "VARIABLE_NEED"
              : cat === "entertainment" || cat === "shopping"
                ? "WANT"
                : cat === "education"
                  ? "INVESTMENT"
                  : undefined);
        nextPayload.expense_type = et ?? nextPayload.expense_type ?? undefined;
        nextPayload.muda_type = nextPayload.muda_type ?? "NONE";
        nextPayload.is_recurring = nextPayload.is_recurring ?? false;
      }

      if (
        nextPayload.workspace === "personal" &&
        activeWorkspace !== "__all" &&
        nextPayload.workspace === activeWorkspace &&
        input.type === "expense" &&
        wantsBudgetMonthlyHuf != null &&
        (nextPayload.expense_type ?? null) === "WANT" &&
        !input.bypassWantsLock
      ) {
        const prevWasWant =
          row.type === "expense" &&
          prev.workspace === "personal" &&
          (prev.expense_type ?? null) === "WANT" &&
          (() => {
            const d = new Date(row.occurred_at);
            const n = new Date();
            return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
          })();
        const prevAmt = prevWasWant ? Math.max(0, Number(prev.amount ?? 0)) : 0;
        const nextAmt = Math.max(0, Number(nextPayload.amount ?? 0));
        const projected = Math.max(0, wantsSpendThisMonth - prevAmt) + nextAmt;
        if (projected > wantsBudgetMonthlyHuf) {
          throw new Error(
            `WANT költségkeret zárolva: ${formatMoney(Math.round(wantsBudgetMonthlyHuf), CURRENCY)}/hó (aktuális: ${formatMoney(
              Math.round(wantsSpendThisMonth),
              CURRENCY,
            )}).`,
          );
        }
      }

      const data_enc = await encryptJSON(vaultKey, nextPayload);
      await localdb.putTxn({
        id: input.id,
        type: input.type,
        occurred_at: input.occurred_at,
        data_enc,
      });
      if (prevWasLoanRepay && prevLoanId) {
        await applyLoanPrincipalDelta(prevLoanId, prevPrincipal);
      }
      if (nextWasLoanRepay && nextLoanId) {
        await applyLoanPrincipalDelta(nextLoanId, -nextPrincipal);
      }
      return { prevRow: row, prevPeerRow: null as any, manualLabel };
    },
    onSuccess: (res, input) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      if (!res) return;
      const { prevRow, prevPeerRow } = res as any;
      appendAudit({ op: "save", store: "transactions", key: input.id, message: "Tétel módosítás" });
      pushUndo({
        label: "Tétel módosítás",
        run: async () => {
          await localdb.putTxn(prevRow);
          if (prevPeerRow) await localdb.putTxn(prevPeerRow);
          await qc.invalidateQueries({ queryKey: ["transactions"] });
          toast.success("Módosítás visszavonva");
        },
      });

      const evt = (res as any).manualLabel as ManualLabelEvent | null;
      if (evt && activeSubTab === "ledger") {
        let suggestion: any = null;
        setManualLabelEvents((prev) => {
          const cutoff = Date.now() - 5 * 60 * 1000;
          const kept = prev.filter((e) => e.at >= cutoff && e.workspaceId === evt.workspaceId).slice(-30);
          const next = [...kept, evt].slice(-30);
          const same = next.filter((e) => e.workspaceId === evt.workspaceId && e.sig === evt.sig);
          const uniq = new Set(same.map((e) => e.txnId));
          if (uniq.size >= 2) {
            suggestion = {
              key: `${evt.workspaceId}:${evt.sig}:${evt.category}:${evt.partner}`,
              workspaceId: evt.workspaceId,
              display: evt.display,
              keyword: evt.keyword,
              category: evt.category,
              partner: evt.partner,
            };
          }
          return next;
        });
        if (suggestion && suggestion.key !== autoRuleDismissedKey) {
          setAutoRuleSuggestion(suggestion);
        }
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const splitToSaving = useMutation({
    mutationFn: async (input: {
      id: string;
      amount: number;
      note?: string;
      bucket_id?: string | null;
    }) => {
      const rows = await localdb.listTxns();
      const row = rows.find((r) => r.id === input.id);
      if (!row) throw new Error("Nem található tétel.");
      const payload = await decryptJSON<TxnPayload>(vaultKey, row.data_enc);
      const orig = Number(payload.amount);
      const move = Math.min(Math.max(0, input.amount), orig);
      if (move <= 0) return null;
      const now = new Date().toISOString();
      const targetBucket = input.bucket_id ?? null;

      if (move >= orig) {
        const next: TxnPayload = {
          ...payload,
          bucket_id: targetBucket,
          history: [
            ...(payload.history ?? []),
            { at: now, from: row.type, to: "saving" as TxnType },
          ],
        };
        await localdb.putTxn({
          ...row,
          type: "saving",
          data_enc: await encryptJSON(vaultKey, next),
        });
        return { prevRow: row, createdId: null as string | null };
      }
      const reduced: TxnPayload = {
        ...payload,
        amount: orig - move,
        history: [
          ...(payload.history ?? []),
          { at: now, from: row.type, to: row.type },
        ],
      };
      await localdb.putTxn({
        ...row,
        data_enc: await encryptJSON(vaultKey, reduced),
      });
      const createdId = newId();
      const savingPayload: TxnPayload = {
        amount: move,
        category: "savings",
        note: input.note?.trim() || payload.note || null,
        title: payload.title ?? null,
        party: payload.party ?? null,
        payment_method: payload.payment_method ?? null,
        tags: payload.tags ?? [],
        location_id: payload.location_id ?? null,
        project_id: payload.project_id ?? null,
        asset_id: payload.asset_id ?? null,
        cost_kind: payload.cost_kind ?? "opex",
        is_asset: false,
        bucket_id: targetBucket,
        history: [{ at: now, from: row.type, to: "saving" as TxnType }],
        workspace: payload.workspace,
        vat_rate: payload.vat_rate ?? null,
        vat_treatment: payload.vat_treatment ?? "hu_gross",
        vat_review: payload.vat_review ?? false,
        vat_deductibility: payload.vat_deductibility ?? 1,
        eur_amount: payload.eur_amount ?? null,
        eur_rate: payload.eur_rate ?? null,
      };
      await localdb.putTxn({
        id: createdId,
        type: "saving",
        occurred_at: row.occurred_at,
        data_enc: await encryptJSON(vaultKey, savingPayload),
      });
      return { prevRow: row, createdId };
    },
    onSuccess: (res, input) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      if (!res) return;
      const { prevRow, createdId } = res;
      appendAudit({ op: "save", store: "transactions", key: input.id, message: "Átvezetés megtakarításba" });
      if (createdId) {
        appendAudit({ op: "save", store: "transactions", key: createdId, message: "Megtakarítás tétel létrehozva" });
      }
      pushUndo({
        label: "Átvezetés megtakarításba",
        run: async () => {
          if (createdId) await localdb.deleteTxn(createdId);
          await localdb.putTxn(prevRow);
          await qc.invalidateQueries({ queryKey: ["transactions"] });
          toast.success("Átvezetés visszavonva");
        },
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });



  const addGoal = useMutation({
    mutationFn: async (input: { deadline: string; payload: GoalPayload }) => {
      if (denyShowcaseWrite(isVisitorDemo)) throw new Error("denied");
      const hasActive = goals.some((g) => g.is_active);
      const id = newId();
      const ws = activeWorkspace === "__all" ? "personal" : activeWorkspace;
      const data_enc = await encryptJSON(vaultKey, { ...input.payload, workspace: ws });
      await localdb.putGoal({
        id,
        deadline: input.deadline,
        is_active: !hasActive,
        created_at: new Date().toISOString(),
        data_enc,
      });
      return id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      appendAudit({ op: "save", store: "goals", key: id, message: "Új cél" });
      pushUndo({
        label: "Új cél",
        run: async () => {
          await localdb.deleteGoal(id);
          await qc.invalidateQueries({ queryKey: ["goals"] });
          toast.success("Új cél visszavonva");
        },
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delGoal = useMutation({
    mutationFn: async (id: string) => {
      if (denyShowcaseWrite(isVisitorDemo)) throw new Error("denied");
      const rows = await localdb.listGoals();
      const row = rows.find((r) => r.id === id);
      await localdb.deleteGoal(id);
      return row ?? null;
    },
    onSuccess: (row, id) => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      appendAudit({ op: "delete", store: "goals", key: row?.id ?? id, message: "Cél törlése" });
      if (row) {
        pushUndo({
          label: "Cél törlése",
          run: async () => {
            await localdb.putGoal(row);
            await qc.invalidateQueries({ queryKey: ["goals"] });
            toast.success("Cél visszaállítva");
          },
        });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setActive = useMutation({
    mutationFn: async (id: string) => {
      const rows = await localdb.listGoals();
      const prev = rows.map((g) => ({ id: g.id, is_active: g.is_active }));
      const scopeWs = activeWorkspace === "__all" ? null : activeWorkspace;

      for (const row of rows) {
        let ws = "personal";
        try {
          const p = await decryptJSON<GoalPayload>(vaultKey, row.data_enc);
          ws = p.workspace ?? "personal";
        } catch {
          /* ignore */
        }
        if (scopeWs && ws !== scopeWs) continue;
        const nextActive = row.id === id;
        if (row.is_active === nextActive) continue;
        await localdb.putGoal({ ...row, is_active: nextActive });
      }
      return prev;
    },
    onSuccess: (prev, id) => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      appendAudit({ op: "save", store: "goals", key: id, message: "Aktív cél váltás" });
      pushUndo({
        label: "Aktív cél váltás",
        run: async () => {
          const rows = await localdb.listGoals();
          for (const p of prev) {
            const row = rows.find((r) => r.id === p.id);
            if (row) await localdb.putGoal({ ...row, is_active: p.is_active });
          }
          await qc.invalidateQueries({ queryKey: ["goals"] });
          toast.success("Aktív cél visszaállítva");
        },
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isLoanRepaymentCategory = useCallback(
    (c: string) => c === "loan_repayment" || c === "PÉNZÜGYI KIADÁSOK: Hitel törlesztés",
    [],
  );
  const principalFromPayload = useCallback((p: TxnPayload) => {
    const a = Math.max(0, Number(p.amount ?? 0));
    const pr = p.loan_principal_paid == null ? a : Math.max(0, Number(p.loan_principal_paid));
    return Math.min(a, pr);
  }, []);
  const applyLoanPrincipalDelta = useCallback(
    async (loanId: string, delta: number) => {
      const row = await localdb.getLoan(loanId);
      if (!row) return;
      try {
        const p = await decryptJSON<Omit<Loan, "id">>(vaultKey, row.data_enc);
        const cur = Math.max(0, Number(p.remaining_principal ?? 0));
        const next = Math.max(0, cur + delta);
        const data_enc = await encryptJSON(vaultKey, {
          ...p,
          remaining_principal: next,
          status: next <= 0 ? "paid_off" : (p.status ?? "active"),
        });
        await localdb.putLoan({ id: row.id, data_enc });
      } catch {
        /* ignore */
      }
    },
    [vaultKey],
  );

  const upsertLoan = useMutation({
    mutationFn: async (input: { id?: string; payload: Omit<Loan, "id"> }) => {
      const id = input.id ?? newId();
      const data_enc = await encryptJSON(vaultKey, input.payload);
      await localdb.putLoan({ id, data_enc });
      return id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["loans"] });
      appendAudit({ op: "save", store: "loans", key: id, message: "Tartozás mentés" });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteLoan = useMutation({
    mutationFn: async (id: string) => {
      const prev = await localdb.getLoan(id);
      await localdb.deleteLoan(id);
      return prev ?? null;
    },
    onSuccess: (_prev, id) => {
      qc.invalidateQueries({ queryKey: ["loans"] });
      appendAudit({ op: "delete", store: "loans", key: id, message: "Tartozás törlés" });
    },
    onError: (e: Error) => toast.error(e.message),
  });


  const [quickAddType, setQuickAddType] = useState<TxnType | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const beginEditTxn = (t: Transaction) => {
    if (denyShowcaseWrite(isVisitorDemo)) return;
                                  beginEditTxn(t);
  };
  const [timelineMonthKey, setTimelineMonthKey] = useState<string | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineSelectedTxnId, setTimelineSelectedTxnId] = useState<string | null>(null);
  const [transferSource, setTransferSource] = useState<Transaction | null>(null);
  const [transferPickerOpen, setTransferPickerOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [loanEditing, setLoanEditing] = useState<Loan | null>(null);
  const [manualLabelEvents, setManualLabelEvents] = useState<ManualLabelEvent[]>([]);
  const [autoRuleSuggestion, setAutoRuleSuggestion] = useState<{
    key: string;
    workspaceId: string;
    display: string;
    keyword: string;
    category: string;
    partner: string;
  } | null>(null);
  const [autoRuleDismissedKey, setAutoRuleDismissedKey] = useState<string>("");
  const [autoRuleOpen, setAutoRuleOpen] = useState(false);
  const [autoRuleWsId, setAutoRuleWsId] = useState("personal");
  const [autoRuleKeyword, setAutoRuleKeyword] = useState("");
  const [autoRuleCategory, setAutoRuleCategory] = useState("");
  const [autoRulePartner, setAutoRulePartner] = useState("");
  const [autoRuleBusy, setAutoRuleBusy] = useState(false);
  type ExpandedView = "income" | "expense" | "saving" | "planned";
  const [expandedSet, setExpandedSet] = useState<Set<ExpandedView>>(new Set());
  const toggleExpanded = useCallback((v: ExpandedView) => {
    setExpandedSet((s) => {
      const n = new Set(s);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      return n;
    });
  }, []);
  const isExpanded = (v: ExpandedView) => expandedSet.has(v);
  const [dragging, setDragging] = useState<{
    id: string;
    type: TxnType;
    label: string;
    x: number;
    y: number;
  } | null>(null);
  const [dragOverType, setDragOverType] = useState<TxnType | null>(null);

  const startDrag = useCallback(
    (t: Transaction, e: React.PointerEvent) => {
      e.preventDefault();
      setDragging({
        id: t.id,
        type: t.type,
        label: displayTxnLabel(t),
        x: e.clientX,
        y: e.clientY,
      });
    },
    [],
  );

  const draggingIdRef = useRef<{ id: string; type: TxnType } | null>(null);
  draggingIdRef.current = dragging ? { id: dragging.id, type: dragging.type } : null;

  useEffect(() => {
    if (!dragging) return;
    const findTarget = (x: number, y: number): TxnType | null => {
      const cur = draggingIdRef.current;
      if (!cur) return null;
      const el = document.elementFromPoint(x, y);
      const drop = el?.closest<HTMLElement>("[data-drop-type]");
      const t = drop?.dataset.dropType as TxnType | undefined;
      return t && t !== cur.type ? t : null;
    };
    const onMove = (e: PointerEvent) => {
      setDragging((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
      setDragOverType(findTarget(e.clientX, e.clientY));
    };
    const onUp = (e: PointerEvent) => {
      const cur = draggingIdRef.current;
      const target = findTarget(e.clientX, e.clientY);
      if (cur && target) {
        moveTxn.mutate({ id: cur.id, to: target });
        toast.success(
          `Áthelyezve: ${TYPE_LABEL[cur.type]} → ${TYPE_LABEL[target]}`,
        );
      }
      setDragging(null);
      setDragOverType(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging?.id]);




  const loading = txnsQ.isLoading || goalsQ.isLoading;
  const [exportOpen, setExportOpen] = useState(false);
  const financeVisible = activeSubTab !== "inventory";
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [locationTcoOpen, setLocationTcoOpen] = useState(false);
  const [assetTcoOpen, setAssetTcoOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [newLocName, setNewLocName] = useState("");
  const [newLocKind, setNewLocKind] = useState<BusinessLocation["kind"]>("telephely");
  const [locEditingId, setLocEditingId] = useState<string | null>(null);
  const [locEditingName, setLocEditingName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [projEditingId, setProjEditingId] = useState<string | null>(null);
  const [projEditingName, setProjEditingName] = useState("");
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetLocationId, setNewAssetLocationId] = useState<string>("");
  const [newAssetProjectId, setNewAssetProjectId] = useState<string>("");
  const [assetEditingId, setAssetEditingId] = useState<string | null>(null);
  const [assetEditingName, setAssetEditingName] = useState("");
  const [assetEditingLocationId, setAssetEditingLocationId] = useState<string>("");
  const [assetEditingProjectId, setAssetEditingProjectId] = useState<string>("");

  useEffect(() => {
    if (!locationsOpen) {
      setLocEditingId(null);
      setLocEditingName("");
      return;
    }
    setNewLocName("");
    setNewLocKind("telephely");
  }, [locationsOpen]);

  useEffect(() => {
    if (!projectsOpen) {
      setProjEditingId(null);
      setProjEditingName("");
      return;
    }
    setNewProjectName("");
  }, [projectsOpen]);

  useEffect(() => {
    if (!assetsOpen) {
      setAssetEditingId(null);
      setAssetEditingName("");
      setAssetEditingLocationId("");
      setAssetEditingProjectId("");
      return;
    }
    setNewAssetName("");
    setNewAssetLocationId("");
    setNewAssetProjectId("");
  }, [assetsOpen]);

  const locations = settings.locations ?? [];
  const projects = settings.projects ?? [];
  const assets = settings.assets ?? [];
  const locationName = useCallback(
    (id?: string | null) => {
      if (!id) return null;
      return locations.find((l) => l.id === id)?.name ?? "Törölt hely";
    },
    [locations],
  );
  const projectName = useCallback(
    (id?: string | null) => {
      if (!id) return null;
      return projects.find((p) => p.id === id)?.name ?? "Törölt projekt";
    },
    [projects],
  );
  const assetName = useCallback(
    (id?: string | null) => {
      if (!id) return null;
      return assets.find((a) => a.id === id)?.name ?? "Törölt eszköz";
    },
    [assets],
  );

  const selectedLocation = useMemo(
    () => (selectedLocationId ? locations.find((l) => l.id === selectedLocationId) ?? null : null),
    [locations, selectedLocationId],
  );
  const selectedAsset = useMemo(
    () => (selectedAssetId ? assets.find((a) => a.id === selectedAssetId) ?? null : null),
    [assets, selectedAssetId],
  );

  const locationTxns = useMemo(() => {
    if (!selectedLocationId) return [];
    return txns
      .filter((t) => t.type !== "saving" && (t.location_id ?? null) === selectedLocationId)
      .sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : -1));
  }, [selectedLocationId, txns]);

  const assetTxns = useMemo(() => {
    if (!selectedAssetId) return [];
    return txns
      .filter((t) => t.type !== "saving" && (t.asset_id ?? null) === selectedAssetId)
      .sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : -1));
  }, [selectedAssetId, txns]);

  const locationTotals = useMemo(() => {
    let capexGross = 0;
    let maintGross = 0;
    let opexGross = 0;
    for (const t of locationTxns) {
      if (t.type !== "expense") continue;
      const g = txnGrossHuf(t);
      const k = t.cost_kind ?? "opex";
      if (k === "capex") capexGross += g;
      else if (k === "maintenance") maintGross += g;
      else opexGross += g;
    }
    return { capexGross, maintGross, opexGross, totalGross: capexGross + maintGross + opexGross };
  }, [locationTxns, txnGrossHuf]);

  const assetTotals = useMemo(() => {
    let capexGross = 0;
    let maintGross = 0;
    let opexGross = 0;
    for (const t of assetTxns) {
      if (t.type !== "expense") continue;
      const g = txnGrossHuf(t);
      const k = t.cost_kind ?? "opex";
      if (k === "capex") capexGross += g;
      else if (k === "maintenance") maintGross += g;
      else opexGross += g;
    }
    return { capexGross, maintGross, opexGross, totalGross: capexGross + maintGross + opexGross };
  }, [assetTxns, txnGrossHuf]);

  const savingsBucketItems = useMemo(() => {
    const items: {
      key: string;
      name: string;
      amount: number;
      removable: boolean;
      id: string | null;
      target: number | null;
    }[] = [];
    const wsTargets = new Map<string, number>();
    for (const b of (activeWorkspaceMeta as any)?.workspace_buckets ?? []) {
      if (b?.id && b.target_amount != null) wsTargets.set(String(b.id), Number(b.target_amount) || 0);
    }
    const generalAmt = savingsByBucket.get("__none") ?? 0;
    if (generalAmt !== 0 || settings.buckets.length === 0)
      items.push({
        key: "__none",
        name: "Általános megtakarítás",
        amount: generalAmt,
        removable: false,
        id: null,
        target: null,
      });
    for (const b of settings.buckets) {
      items.push({
        key: b.id,
        name: b.name,
        amount: savingsByBucket.get(b.id) ?? 0,
        removable: (savingsByBucket.get(b.id) ?? 0) === 0,
        id: b.id,
        target: wsTargets.get(b.id) ?? null,
      });
    }
    for (const [k, v] of savingsByBucket) {
      if (k === "__none") continue;
      if (!settings.buckets.find((b) => b.id === k))
        items.push({
          key: k,
          name: bucketName(k),
          amount: v,
          removable: false,
          id: k,
          target: wsTargets.get(k) ?? null,
        });
    }
    return items.filter((it) => !(it.key === "__none" && it.amount === 0 && settings.buckets.length > 0));
  }, [savingsByBucket, settings.buckets, activeWorkspaceMeta, bucketName]);

  const selectedBucketMulti = selectedBucketKeys.size >= 2;
  const selectedBucketStats = useMemo(() => {
    const selected = savingsBucketItems.filter((it) => selectedBucketKeys.has(it.key));
    const balance = selected.reduce((a, it) => a + it.amount, 0);
    const target = selected.reduce((a, it) => a + (it.target != null && it.target > 0 ? it.target : 0), 0);
    const hasTarget = selected.some((it) => it.target != null && it.target > 0);
    const progressPct = hasTarget && target > 0 ? Math.min(100, (balance / target) * 100) : null;
    return { balance, target, hasTarget, progressPct, count: selected.length };
  }, [savingsBucketItems, selectedBucketKeys]);

  const savingsBucketsPanel =
    savingsByBucket.size > 0 || settings.buckets.length > 0 ? (
      <Card className="relative w-full min-w-0 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle
            className="flex min-w-0 items-center text-sm font-medium"
            data-exact="Megtakarítási alhalmazok — perselyek célra, pufferre vagy ÁFA-ra. Ikonnal célhoz rendelhető."
          >
            <span className="truncate">Megtakarítási alhalmazok</span>
            <HelpIcon kbId="buckets-overview" />
          </CardTitle>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="kpi-value text-xs text-muted-foreground">{formatMoney(totals.savings, CURRENCY)}</span>
            <SectionSettingsGear onClick={() => jumpToReferences("buckets", undefined, activeWorkspace)} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          {selectedBucketMulti ? (
            <div className="rounded-lg border border-sky-500/40 bg-sky-950/20 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-sky-200">
                    Kijelölt perselyek ({selectedBucketStats.count})
                  </div>
                  <div className="mt-1 text-lg font-bold tabular-nums text-white">
                    {formatMoney(Math.round(selectedBucketStats.balance), CURRENCY)}
                  </div>
                  {selectedBucketStats.hasTarget ? (
                    <div className="mt-0.5 text-xs text-slate-300">
                      Cél: {formatMoney(Math.round(selectedBucketStats.target), CURRENCY)} · teljesülés:{" "}
                      <span className="font-mono text-sky-300">
                        {(selectedBucketStats.progressPct ?? 0).toFixed(0)}%
                      </span>
                    </div>
                  ) : (
                    <div className="mt-0.5 text-xs text-muted-foreground">Nincs közös célösszeg a kijelöltekhez.</div>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="h-9 gap-1.5"
                  disabled={selectedBucketKeys.size < 2}
                  onClick={() => {
                    const keys = Array.from(selectedBucketKeys);
                    setReallocateFrom(keys[0] ?? "");
                    setReallocateTo(keys[1] ?? "");
                    setReallocateAmount("");
                    setReallocateOpen(true);
                  }}
                >
                  ⇄ Átcsoportosítás
                </Button>
              </div>
              {selectedBucketStats.hasTarget ? (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-sky-500 a11y-pat-dots"
                    style={{ width: `${selectedBucketStats.progressPct ?? 0}%` }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <ul className="pdca-mini-grid">
            {savingsBucketItems.length === 0 ? (
              <li className="col-span-full text-xs text-muted-foreground">
                Még nincs alhalmaz. Új alhalmazt a megtakarítás átvezető ablakban tudsz létrehozni.
              </li>
            ) : (
              savingsBucketItems.map((it) => {
                const linked = it.id !== null && goalLinkedBucketIds.has(it.id);
                const selected = selectedBucketKeys.has(it.key);
                return (
                  <li
                    key={it.key}
                    className={cn(
                      "flex min-w-0 items-center justify-between gap-1 rounded-md border px-1.5 py-1",
                      selected
                        ? "border-sky-500/60 bg-sky-950/25 ring-1 ring-sky-400/30"
                        : linked
                          ? "border-[color:var(--color-primary)]/60 bg-[color:var(--color-primary)]/5"
                          : "border-border/60 bg-muted/30",
                    )}
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selected}
                        onChange={(e) => {
                          setSelectedBucketKeys((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(it.key);
                            else next.delete(it.key);
                            return next;
                          });
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1 truncate text-xs font-medium">
                          <span className="truncate">{it.name}</span>
                          {linked && activeGoal && (
                            <span className="shrink-0 rounded bg-[color:var(--color-primary)]/15 px-1.5 py-0.5 text-[10px] font-normal text-[color:var(--color-primary)]">
                              cél: {activeGoal.name}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[color:var(--color-chart-2)]">
                          {formatMoney(it.amount, CURRENCY)}
                          {it.target != null && it.target > 0
                            ? ` · cél ${formatMoney(it.target, CURRENCY)}`
                            : ""}
                        </p>
                      </div>
                    </label>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {it.id && settings.buckets.some((b) => b.id === it.id) && activeGoal && !linked && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 border-[color:var(--color-primary)]/60 bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/20"
                          onClick={() => renameBucket(it.id!, activeGoal.name)}
                          title={`Célhoz rendel: ${activeGoal.name}`}
                          aria-label={`Célhoz rendel: ${activeGoal.name}`}
                        >
                          <Target className="h-3 w-3" />
                        </Button>
                      )}
                      {it.removable && it.id && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => removeBucket(it.id!)}
                          aria-label="Alhalmaz törlése"
                          title="Alhalmaz törlése (üres)"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          <Dialog open={reallocateOpen} onOpenChange={setReallocateOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Persely átcsoportosítás</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px]">Forrás</Label>
                  <Select value={reallocateFrom} onValueChange={setReallocateFrom}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(selectedBucketKeys).map((k) => (
                        <SelectItem key={k} value={k}>
                          {bucketName(k)} ({formatMoney(Math.round(savingsByBucket.get(k) ?? 0), CURRENCY)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Cél</Label>
                  <Select value={reallocateTo} onValueChange={setReallocateTo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(selectedBucketKeys).map((k) => (
                        <SelectItem key={k} value={k}>
                          {bucketName(k)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Összeg (HUF)</Label>
                  <Input
                    type="number"
                    value={reallocateAmount}
                    onChange={(e) => setReallocateAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setReallocateOpen(false)}>
                  Mégse
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const amt = Number(String(reallocateAmount).replace(/\s+/g, "").replace(",", "."));
                    reallocateBuckets.mutate({
                      fromKey: reallocateFrom,
                      toKey: reallocateTo,
                      amount: amt,
                    });
                  }}
                  disabled={reallocateBuckets.isPending}
                >
                  ⇄ Átvezetés
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    ) : null;

  const plannedSimPanel = (
    <Card className="w-full min-w-0 overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <CardTitle
          className="text-sm font-medium text-muted-foreground"
          data-exact="Tervezett kiadások — ismétlődő, egyszeri és használati tételek a következő 60 napban."
        >
          Tervezett kiadások / Projekt szimuláció
        </CardTitle>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant="secondary" className="text-[10px]">
            PLAN
          </Badge>
          <div className="text-right leading-tight">
            <div className="text-[10px] text-slate-400">Ismétlődő 60 nap</div>
            <div className="font-mono text-[12px] text-slate-200">
              {formatMoney(Math.round(planned60Sums.recurring), CURRENCY)}
            </div>
            <div className="mt-1 text-[10px] text-slate-400">Összesen 60 nap</div>
            <div className="font-mono text-[12px] text-slate-200">
              {formatMoney(Math.round(planned60Sums.total), CURRENCY)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {(!businessMode || activeWorkspace === "__all") && (
          <div className="text-muted-foreground">Tervezett tételek a vállalkozás/projekt munkaterületen aktívak.</div>
        )}

        {businessMode && activeWorkspace !== "__all" && (
          <>
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-slate-200 font-medium">Ismétlődő (következő 60 nap)</div>
                <span className="font-mono text-slate-200 whitespace-nowrap">
                  {formatMoney(Math.round(planned60Sums.recurring), CURRENCY)}
                </span>
              </div>
              {recurring60Rows.length === 0 ? (
                <div className="text-muted-foreground">Nincs.</div>
              ) : (
                <ul className="mt-1 space-y-1">
                  {recurring60Rows.map((x) => (
                    <li key={x.id} className="flex items-center justify-between gap-2">
                      <span className="truncate text-slate-300">{x.name}</span>
                      <span className="font-mono text-slate-200 whitespace-nowrap">{formatMoney(Math.round(x.gross), CURRENCY)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-slate-200 font-medium">Egyszeri tervek (következő 60 nap)</div>
                <span className="font-mono text-slate-200 whitespace-nowrap">
                  {formatMoney(Math.round(planned60Sums.oneOff), CURRENCY)}
                </span>
              </div>
              {upcomingOneOff.length === 0 ? (
                <div className="text-muted-foreground">Nincs.</div>
              ) : (
                <ul className="mt-1 space-y-1">
                  {upcomingOneOff.slice(0, 6).map((x) => (
                    <li key={String(x.id)} className="flex items-center justify-between gap-2">
                      <span className="truncate text-slate-300">{x.name ?? categoryLabel(String(x.category ?? ""))}</span>
                      <span className="font-mono text-slate-200 whitespace-nowrap">
                        {formatMoney(
                          Math.round(
                            computeVatSplit(
                              Math.max(0, Number(x.amount ?? 0)),
                              x.vat_rate ?? defaultVat,
                              "net",
                            ).gross,
                          ),
                          CURRENCY,
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-slate-200 font-medium">Használati tervek (következő 60 nap)</div>
                <span className="font-mono text-slate-200 whitespace-nowrap">
                  {formatMoney(Math.round(planned60Sums.usage), CURRENCY)}
                </span>
              </div>
              {upcomingUsage.length === 0 ? (
                <div className="text-muted-foreground">Nincs.</div>
              ) : (
                <ul className="mt-1 space-y-1">
                  {upcomingUsage.slice(0, 6).map(({ e, tpl }) => (
                    <li key={String(e.id)} className="flex items-center justify-between gap-2">
                      <span className="truncate text-slate-300">{tpl.name ?? "Használat"}</span>
                      <span className="font-mono text-slate-200 whitespace-nowrap">{String(e.at).slice(0, 10)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-slate-200 font-medium">Tartozás részletek (következő 60 nap)</div>
            <span className="font-mono text-slate-200 whitespace-nowrap">
              {formatMoney(Math.round(planned60Sums.debt), CURRENCY)}
            </span>
          </div>
          {upcomingDebtInstallments.length === 0 ? (
            <div className="text-muted-foreground">Nincs esedékes részlet.</div>
          ) : (
            <ul className="mt-1 space-y-1">
              {upcomingDebtInstallments.slice(0, 8).map((x, i) => (
                <li key={`${x.loanId}-${x.due_date}-${i}`} className="flex items-center justify-between gap-2">
                  <span className="truncate text-slate-300">
                    {x.name}
                    {x.partner ? ` · ${x.partner}` : ""} · {x.due_date}
                  </span>
                  <span className="font-mono text-slate-200 whitespace-nowrap">
                    {formatMoney(Math.round(x.amount), CURRENCY)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const whatIfPanel = whatIf ? (
    <Card className="pdca-tile--wide w-full min-w-0 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 min-[560px]:flex-row min-[560px]:items-start min-[560px]:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-sm font-medium text-slate-200">
              {t("dash.workSim")}
            </CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-1 min-[560px]:justify-end">
            <Button
              type="button"
              size="sm"
              variant={whatIfScenario === "optimistic" ? "secondary" : "outline"}
              className="h-7 whitespace-nowrap px-2 text-[11px]"
              onClick={() => setWhatIfScenario("optimistic")}
              title="Ha a forgalom jobb, a költség szorosabb."
            >
              {t("dash.optimistic")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={whatIfScenario === "realistic" ? "secondary" : "outline"}
              className="h-7 whitespace-nowrap px-2 text-[11px]"
              onClick={() => setWhatIfScenario("realistic")}
              title="A jelenlegi ritmus folytatása."
            >
              {t("dash.realistic")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={whatIfScenario === "pessimistic" ? "secondary" : "outline"}
              className="h-7 whitespace-nowrap px-2 text-[11px]"
              onClick={() => setWhatIfScenario("pessimistic")}
              title="Ha a bevétel csúszik vagy esik, a költség nő."
            >
              {t("dash.pessimistic")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid items-start gap-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="tile-lift rounded-lg p-2.5">
            <LeanTerm
              className="kpi-label text-[10px] uppercase tracking-wide text-slate-300"
              title="Fedezeti pont"
              exact="Fedezeti pont — az első hónap, amikor a választott pálya halmozott eredménye eléri a nullát."
              summary="Az első hónap, amikor a választott pálya halmozott eredménye eléri a nullát. Halmozott eredmény = a havi (bevétel − kiadás) összege a horizont elejétől."
            >
              Fedezeti pont
            </LeanTerm>
            <div className="kpi-value mt-1 font-mono text-sm text-slate-50">
              {whatIf.breakEvenLabel ?? "—"}
            </div>
          </div>
          <div className="tile-lift rounded-lg p-2.5">
            <LeanTerm
              className="kpi-label text-[10px] uppercase tracking-wide text-slate-300"
              title="Megtérülés (ROI)"
              exact="Megtérülés — (bevétel − költség) / költség a 12 hónapon. Százalék, nem kamat."
              summary="(A horizont teljes bevétele mínusz a teljes költség) osztva a költséggel. Százalék. Nem diszkontált, nem kamat."
            >
              Megtérülés
            </LeanTerm>
            <div className="kpi-value mt-1 font-mono text-sm text-slate-50">
              {whatIf.roi == null ? "—" : `${whatIf.roi.toFixed(0)}%`}
            </div>
          </div>
          <div className="tile-lift rounded-lg p-2.5">
            <LeanTerm
              className="kpi-label text-[10px] uppercase tracking-wide text-slate-300"
              title="Fix arány"
              exact="Fix arány — a havi kiadásból mennyi a kötött tétel (bérlet, előfizetés). Magas arány: kevesebb mozgástér."
              summary="A havi kiadásból mennyi a kötött tétel (bérleti díj, előfizetés). A maradék a forgalommal mozog. Magas arány: kevesebb mozgástér, ha esik a bevétel."
            >
              Fix arány
            </LeanTerm>
            <div className="kpi-value mt-1 font-mono text-sm text-slate-50">
              {whatIf.fixedRatio == null ? "—" : `${Math.round(whatIf.fixedRatio * 100)}%`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
          <BulletGraph
            item={{
              id: "roi",
              label: "ROI a 20%-os küszöbhöz",
              actual: whatIf.roi ?? 0,
              target: 20,
              unit: "%",
              hint: "ROI = (bevétel − költség) / költség a 12 hónapon. A 20% összehasonlító küszöb, nem előírás.",
            }}
          />
          <BulletGraph
            item={{
              id: "fix",
              label: "Fix arány az 50%-os küszöbhöz",
              actual: Math.round((whatIf.fixedRatio ?? 0) * 100),
              target: 50,
              unit: "%",
              hint: "Fix arány = kötött havi kiadás / átlagos havi kiadás. Az 50% fölött a működés kevésbé enged, ha esik a forgalom.",
            }}
          />
        </div>

        <div className="viz-split">
          <ChartChrome
            title={
              <span className="inline-flex items-center gap-1">
                Halmozott eredmény
                <HelpIcon kbId="pro-chart" title="Hogyan értelmezzük a PRO-grafikont?" />
              </span>
            }
            span={vizSpan}
            onSpan={onVizSpan}
            onPrev={onVizPrev}
            onNext={onVizNext}
            windowLabel={`${whatIf.chart[0]?.month ?? ""} – ${whatIf.chart[whatIf.chart.length - 1]?.month ?? ""}`}
            legend={
              <>
                <ChartLegendSwatch tone="opt" label={t("dash.optimistic")} line />
                <ChartLegendSwatch tone="real" label={t("dash.realistic")} line />
                <ChartLegendSwatch tone="pess" label={t("dash.pessimistic")} line />
              </>
            }
          >
            <SmallMultiples series={whatIf.multiples} xLabel={t("dash.month")} yLabel={currencyUnit()} />
          </ChartChrome>
          <ProChartCallout className="mt-2 rounded-xl border border-border/60 bg-card px-4 py-3" />
        </div>

        <div className="viz-split">
          <ChartChrome
            title="Eredménylevezetés"
            span={vizSpan}
            onSpan={onVizSpan}
            onPrev={onVizPrev}
            onNext={onVizNext}
            windowLabel={vizWindowLabel}
            legend={
              <>
                <ChartLegendSwatch color="#34d399" label="Plusz" />
                <ChartLegendSwatch color="#fb7185" label="Levonás" />
              </>
            }
          >
            <WaterfallChart steps={whatIf.waterfall} />
          </ChartChrome>
        </div>
      </CardContent>
    </Card>
  ) : null;

  const strategyPanel = (phase: "PLAN" | "DO" | "CHECK" | "ACT") =>
    whatIf?.strategySignals?.length ? (
      <StrategyCasePanel
        segmentId={demoSegmentId}
        signals={whatIf.strategySignals}
        inheritedFrom={whatIf.strategyInheritedFrom}
        phase={phase}
      />
    ) : null;

  const resiliencePanel = (phase: "PLAN" | "DO" | "CHECK" | "ACT") =>
    isResilienceSegment(demoSegmentId) ? (
      <ResilienceCasePanel segmentId={demoSegmentId} phase={phase} baseline={inheritedBaseline} />
    ) : null;

  const educationPanel = (phase: "PLAN" | "DO" | "CHECK" | "ACT") =>
    isEducationSegment(demoSegmentId) ? (
      <EducationCasePanel segmentId={demoSegmentId} phase={phase} baseline={inheritedBaseline} />
    ) : null;

  const industryPanel = (phase: "PLAN" | "DO" | "CHECK" | "ACT") =>
    isIndustrySegment(demoSegmentId) ? (
      <IndustryCasePanel segmentId={demoSegmentId} phase={phase} baseline={inheritedBaseline} />
    ) : null;

  const planStack = (
    <div className="pdca-tile-grid">
      {surface.inheritMasterBaseline ? <MasterBaselineCard context={inheritedBaseline} /> : null}
      {resiliencePanel("PLAN")}
      {educationPanel("PLAN")}
      {industryPanel("PLAN")}
      {strategyPanel("PLAN")}
      {whatIfPanel}
      <>
      <GoalCard
        goal={activeGoal}
        goals={goals}
        savings={goalSavings}
        leanMonthlySupport={
          activeWorkspace === "personal" ? Math.max(0, Math.round(((multiYear?.annualizedLeak ?? 0) / 12) * 1)) : 0
        }
        currency={CURRENCY}
        properties={personalProperties as any}
        onSelect={(id) => setActive.mutate(id)}
        onRemove={(id) => delGoal.mutate(id)}
        onAdd={(g) => addGoal.mutate(g)}
        workspaceId={activeWorkspace}
        workspaceLabel={workspaceDisplayName(activeWorkspace)}
      />
      {savingsBucketsPanel}
      {plannedSimPanel}
      </>
    </div>
  );

  const lockPdcaView = true;

  const promotePlanToDo = () => {
    if (!activeWorkspaceMeta || activeWorkspace === "__all") return toast.error("Válassz egy projektet.");
    if (activeWorkspaceMeta.type !== "project") return toast.error("Csak projekt élesíthető PLAN → DO.");
    const ms = applyPdcaMilestone(activeWorkspaceMeta as any, "do") ?? {};
    updateWorkspaceMeta(
      activeWorkspace,
      {
        type: "business",
        project_mode: null,
        completion_pct: null,
        scenario: null,
        parent_business_id: null,
        counts_in_business: null,
        ...ms,
      },
      "Projekt élesítése (PLAN → DO)",
    );
  };

  const startNewPlanningCycle = () => {
    if (activeWorkspace !== "__all" && activeWorkspaceMeta) {
      const withAct = applyPdcaMilestone(activeWorkspaceMeta as any, "act") ?? {};
      const merged = { ...(activeWorkspaceMeta as any), ...withAct };
      const completed = applyPdcaMilestone(merged, "plan", { completeCycle: true });
      if (completed) updateWorkspaceMeta(activeWorkspace, completed, "PDCA ciklus lezárás + új PLAN");
    }
    setPdcaNewOpen(true);
    denyWorkspaceCreate();
  };

  const newImprovementGoal = () => {
    setActiveSubTab("ledger");
    toast.success("Célok: a Tételek nézet jobb oldalán.");
  };

  const leanRecommendations = useLeanRecommendations({
    transactions: allTxns,
    workspaces: workspaceMetas as any,
    workspaceName: workspaceDisplayName,
    currency: CURRENCY,
    limit: 6,
  });

  const executeLeanRecommendation = useCallback(
    (rec: { navigateTo?: "ledger" | "deals" | "cashflow" | "inventory"; title: string }) => {
      markWsPdca("act");
      if (rec.navigateTo) setActiveSubTab(rec.navigateTo);
      toast.success(`ACT: ${rec.title}`);
    },
    [markWsPdca, setActiveSubTab],
  );

  const scrollToDataLineage = useCallback(() => {
    const el = document.getElementById("data-lineage");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const patchTxnWorkspace = useCallback(
    async (txnId: string, patch: Record<string, any>, label: string) => {
      const rows = await localdb.listTxns();
      const row = rows.find((r) => r.id === txnId);
      if (!row) throw new Error("Tétel nem található.");
      const prev = await decryptJSON<any>(vaultKey, row.data_enc);
      const next = { ...prev, ...patch };
      const data_enc = await encryptJSON(vaultKey, next);
      await localdb.putTxn({ ...row, data_enc });
      await qc.invalidateQueries({ queryKey: ["txns"] });
      toast.success(label);
      const ws = String(next.workspace ?? "personal");
      if (ws && ws !== "__all") markWsPdca("do", { workspaceId: ws });
    },
    [vaultKey, qc, markWsPdca],
  );

  const lockedPlanModule = (
    <div
      className={cn(
        "pdca-frame relative isolate w-full min-w-0 overflow-hidden rounded-xl border border-amber-300/45",
        "bg-amber-500/[0.06]",
      )}
    >
      <div className="relative z-10 min-w-0 p-1.5">{planStack}</div>
    </div>
  );

  const doDebtsCard = (
    <Card className="card-table relative w-full">
      <CardHeader className="flex flex-row items-start justify-between pb-1.5">
        <div className="min-w-0">
          <CardTitle
            className="flex items-center text-sm font-medium text-muted-foreground"
            data-exact="Tartozások — fennálló hitelek és kötelezettségek, következő részlettel."
          >
            Tartozások / Kötelezettségek
            <HelpIcon kbId="loans-liabilities" />
          </CardTitle>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 font-medium", debtBuffer.cls)} title={debtBuffer.label}>
              {debtBuffer.icon} puffer
            </span>
            <span className="font-mono">
              szabad: {formatMoney(Math.round(debtBuffer.free), CURRENCY)} · tartozás:{" "}
              {formatMoney(Math.round(debtBuffer.outstanding), CURRENCY)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <SectionSettingsGear onClick={() => jumpToReferences("debts", undefined, activeWorkspace)} />
          <Button
            type="button"
            size="sm"
            className="h-8"
            onClick={() => {
              setLoanEditing(null);
              setLoanOpen(true);
            }}
          >
            + Új tartozás
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-md border border-slate-700/60 bg-slate-800/80 p-3">
            <div className="text-[11px] text-slate-300">Fennálló tartozás</div>
            <div className="mt-1 text-sm font-semibold text-white tabular-nums">
              {formatMoney(Math.round(loanKpis.totalOutstanding), CURRENCY)}
            </div>
          </div>
          <div className="rounded-md border border-slate-700/60 bg-slate-800/80 p-3">
            <div className="text-[11px] text-slate-300">Közeli részletteher (~30 nap)</div>
            <div className="mt-1 text-sm font-semibold text-white tabular-nums">
              {formatMoney(Math.round(loanKpis.monthlyBurden), CURRENCY)}
            </div>
          </div>
          <div className="rounded-md border border-slate-700/60 bg-slate-800/80 p-3">
            <div className="text-[11px] text-slate-300">Következő esedékesség</div>
            <div className="mt-1 text-sm font-semibold text-white tabular-nums">
              {loanKpis.nextMaturity ?? "—"}
            </div>
          </div>
        </div>
        {activeLoans.length === 0 ? (
          <div className="text-xs text-muted-foreground">Nincs aktív tartozás ezen a munkaterületen.</div>
        ) : (
          <ul className="grid gap-2">
            {activeLoans.slice(0, 8).map((l) => {
              const remaining =
                (l.schedule?.length ?? 0) > 0 ? debtPendingTotal(l.schedule) : Math.max(0, Number(l.remaining_principal ?? 0));
              return (
                <li key={l.id} className="rounded-md border bg-background/50 p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-slate-100">
                      {l.name}
                      {l.partner_name ? <span className="ml-1 text-slate-400">· {l.partner_name}</span> : null}
                    </span>
                    <span className="font-mono text-slate-200 whitespace-nowrap">
                      {formatMoney(Math.round(remaining), CURRENCY)}
                    </span>
                  </div>
                  {(l.schedule?.length ?? 0) > 0 ? (
                    <div className="mt-1 text-[10px] text-slate-400">
                      {l.schedule!.filter((s) => s.status !== "paid").length} függő részlet · következő:{" "}
                      {debtNextPendingDue(l.schedule) ?? "—"}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );

  const lockedDoCashflow = (
    <div className="pdca-module-stack w-full min-w-0">
      <Card className="pdca-tile--wide relative overflow-hidden">
        <CardHeader className="pb-1.5 pr-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle
              className="text-sm font-medium text-slate-200"
              title={`Cashflow — ${workspaceDisplayName(activeWorkspace)}`}
              data-exact="pénzáramlás — havi bevétel, kiadás, kassza."
            >
              Cashflow — {workspaceDisplayName(activeWorkspace)}
            </CardTitle>
            <SectionSettingsGear onClick={() => jumpToReferences("bank", undefined, activeWorkspace)} />
          </div>
        </CardHeader>
        <CardContent className="pdca-mini-grid">
          {activeWorkspace === "__all" && sumMetrics ? (
            <>
              <div
                className="card-kpi min-w-[130px] flex-1 rounded-md border border-l-4 border-l-emerald-500/60 bg-muted/25 p-2.5"
                data-exact="Likviditás — azonnal elérhető pénz az összesített munkaterületeken."
              >
                <div className="kpi-label text-[10px] uppercase tracking-wide text-slate-300" title="Összesített likviditás">Likviditás</div>
                <div
                  className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-white sm:text-sm"
                  title={formatMoney(Math.round(sumMetrics.liquidity), CURRENCY)}
                >
                  {formatMoney(Math.round(sumMetrics.liquidity), CURRENCY)}
                </div>
              </div>
              <div
                className="card-kpi min-w-[130px] flex-1 rounded-md border border-l-4 border-l-[color:var(--color-chart-1)] bg-muted/25 p-2.5"
                data-exact="Tiszta eredmény — céges bevétel mínusz kiadás (nettó)."
              >
                <div className="kpi-label text-[10px] uppercase tracking-wide text-slate-300" title="Céges tiszta eredmény">Tiszta eredmény</div>
                <div
                  className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-white sm:text-sm"
                  title={formatMoney(Math.round(sumMetrics.businessResultNet), CURRENCY)}
                >
                  {formatMoney(Math.round(sumMetrics.businessResultNet), CURRENCY)}
                </div>
              </div>
              <div
                className="card-kpi min-w-[130px] flex-1 rounded-md border border-l-4 border-l-[color:var(--color-chart-6)] bg-muted/25 p-2.5"
                data-exact="Magán kassza — a személyes banki egyenleg, nem a cégé."
              >
                <div className="kpi-label text-[10px] uppercase tracking-wide text-slate-300">Magán kassza</div>
                <div
                  className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-[color:var(--color-chart-6)] sm:text-sm"
                  title={formatMoney(Math.round(sumMetrics.personalBankGross), CURRENCY)}
                >
                  {formatMoney(Math.round(sumMetrics.personalBankGross), CURRENCY)}
                </div>
              </div>
              <div className="min-w-[130px] flex-1">
                <ConsistencyLampCard report={consistencyReport} onClick={scrollToDataLineage} />
              </div>
            </>
          ) : activeWorkspace === "personal" && personalCashflowKpis ? (
            <>
              <div
                className="card-kpi min-w-[130px] flex-1 rounded-md border border-l-4 border-l-emerald-500/60 bg-muted/25 p-2.5"
                data-exact="Szabad egyenleg — ami a kötelezettségek után még elkölthető."
              >
                <div className="kpi-label text-[10px] uppercase tracking-wide text-slate-300">Szabad egyenleg</div>
                <div
                  className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-white sm:text-sm"
                  title={formatMoney(Math.round(personalCashflowKpis.free), CURRENCY)}
                >
                  {formatMoney(Math.round(personalCashflowKpis.free), CURRENCY)}
                </div>
              </div>
              <div
                className="card-kpi min-w-[130px] flex-1 rounded-md border border-l-4 border-l-sky-500/60 bg-muted/25 p-2.5"
                data-exact="Perselyek — félretett alhalmazok (célok, puffer, ÁFA)."
              >
                <div className="kpi-label text-[10px] uppercase tracking-wide text-slate-300" title="Megtakarítások / perselyek">Perselyek</div>
                <div
                  className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-sky-400 sm:text-sm"
                  title={formatMoney(Math.round(personalCashflowKpis.piggies), CURRENCY)}
                >
                  {formatMoney(Math.round(personalCashflowKpis.piggies), CURRENCY)}
                </div>
              </div>
              <div
                className="card-kpi min-w-[130px] flex-1 rounded-md border border-l-4 border-l-border bg-muted/25 p-2.5"
                data-exact="Banki egyenleg — a számlán lévő bruttó összeg."
              >
                <div className="kpi-label text-[10px] uppercase tracking-wide text-slate-300" title="Banki egyenleg / kassa">Banki egyenleg</div>
                <div
                  className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-white sm:text-sm"
                  title={formatMoney(Math.round(personalCashflowKpis.bankGross), CURRENCY)}
                >
                  {formatMoney(Math.round(personalCashflowKpis.bankGross), CURRENCY)}
                </div>
              </div>
              <div
                className="card-kpi min-w-[130px] flex-1 rounded-md border border-l-4 border-l-amber-500/60 bg-muted/25 p-2.5"
                data-exact="Hány hónapig tart a kassza a mostani költési ütemmel."
              >
                <div className="kpi-label text-[10px] uppercase tracking-wide text-slate-300">Runway</div>
                <div className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-white sm:text-sm">
                  {multiYear?.runwayMonthsCurrent != null
                    ? multiYear.runwayMonthsLean == null
                      ? `${multiYear.runwayMonthsCurrent.toFixed(1)} hó`
                      : `${multiYear.runwayMonthsCurrent.toFixed(1)} → ${multiYear.runwayMonthsLean.toFixed(1)} hó`
                    : personalCashflowKpis.runwayMonths == null
                      ? "—"
                      : `${personalCashflowKpis.runwayMonths.toFixed(1)} hó`}
                </div>
              </div>
            </>
          ) : vatReserve ? (
            <>
              <div
                className="card-kpi min-w-[130px] flex-1 rounded-md border border-l-4 border-l-emerald-500/60 bg-muted/25 p-2.5"
                data-exact="Szabad nettó — ÁFA és zárolás után elkölthető összeg."
              >
                <div className="kpi-label text-[10px] uppercase tracking-wide text-slate-300" title="Szabad nettó egyenleg">Szabad nettó</div>
                <div
                  className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-white sm:text-sm"
                  title={formatMoney(Math.round(vatReserve.free), CURRENCY)}
                >
                  {formatMoney(Math.round(vatReserve.free), CURRENCY)}
                </div>
              </div>
              <div
                className="card-kpi min-w-[130px] flex-1 rounded-md border border-l-4 border-l-amber-500/60 bg-muted/25 p-2.5"
                data-exact="ÁFA tartalék — a fizetendő ÁFA, amit ne költs el."
              >
                <div className="kpi-label text-[10px] uppercase tracking-wide text-slate-300" title="ÁFA tartalék / fizetendő">ÁFA tartalék</div>
                <div
                  className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-amber-400 sm:text-sm"
                  title={formatMoney(Math.round(vatReserve.payable), CURRENCY)}
                >
                  {formatMoney(Math.round(vatReserve.payable), CURRENCY)}
                </div>
              </div>
              <div
                className="card-kpi min-w-[130px] flex-1 rounded-md border border-l-4 border-l-border bg-muted/25 p-2.5"
                data-exact="Banki egyenleg — a céges számla bruttó egyenlege."
              >
                <div className="kpi-label text-[10px] uppercase tracking-wide text-slate-300" title="Banki egyenleg (bruttó)">Banki egyenleg</div>
                <div
                  className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-white sm:text-sm"
                  title={formatMoney(Math.round(vatReserve.balance), CURRENCY)}
                >
                  {formatMoney(Math.round(vatReserve.balance), CURRENCY)}
                </div>
              </div>
              <div
                className="card-kpi min-w-[130px] flex-1 rounded-md border border-l-4 border-l-sky-500/60 bg-muted/25 p-2.5"
                data-exact="Zárolt — fenntartott összeg (tartalék, nem szabad)."
              >
                <div className="kpi-label text-[10px] uppercase tracking-wide text-slate-300" title="Zárolt / fenntartott">Zárolt</div>
                <div
                  className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-sky-400 sm:text-sm"
                  title={formatMoney(Math.round(vatReserve.reserved ?? 0), CURRENCY)}
                >
                  {formatMoney(Math.round(vatReserve.reserved ?? 0), CURRENCY)}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full text-sm text-slate-300">Nincs elég adat a cashflow KPI-khoz.</div>
          )}

          <div className="col-span-full w-full pt-2">
            {leanBuilt.links.length ? (
              <ChartChrome
                title="Pénzáramlás"
                span={vizSpan}
                onSpan={onVizSpan}
                onPrev={onVizPrev}
                onNext={onVizNext}
                windowLabel={vizWindowLabel}
                legend={
                  <>
                    <ChartLegendSwatch color="var(--accent-color)" label="Honnan" />
                    <ChartLegendSwatch color="#94a3b8" label="Költséghely" />
                  </>
                }
              >
                <FlowSankey sources={leanBuilt.sources} sinks={leanBuilt.sinks} links={leanBuilt.links} />
              </ChartChrome>
            ) : null}
            <div className="viz-split">
              <ChartChrome
                title="Kivétel-hőtérkép"
                span={vizSpan}
                onSpan={onVizSpan}
                onPrev={onVizPrev}
                onNext={onVizNext}
                windowLabel={vizWindowLabel}
                legend={
                  <>
                    <ChartLegendSwatch color="#34d399" label="Plusz" />
                    <ChartLegendSwatch color="#94a3b8" label="Semleges" />
                    <ChartLegendSwatch color="#fb7185" label="Levonás" />
                  </>
                }
              >
                <ExceptionHeatmap
                  rows={leanBuilt.heatRows}
                  cols={leanBuilt.heatCols}
                  cells={leanBuilt.heatCells}
                />
              </ChartChrome>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === "full" ? (
        <Card className="card-kpi w-full border border-border/60 bg-background/30">
          <CardHeader className="pb-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">6 hónapos idővonal</CardTitle>
              <Badge variant="secondary" className="text-[10px]" title="Kattints egy hónapra a részletekhez">
                {timeline6Rows.length} hónap
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3 w-full md:grid-cols-3 xl:grid-cols-6">
              {timeline6Rows.map((r) => {
                const [yy, mm] = String(r.month).split("-").map((x) => Number(x));
                const label = Number.isFinite(yy) && Number.isFinite(mm)
                  ? new Date(yy, (mm || 1) - 1, 1).toLocaleString("hu-HU", { year: "numeric", month: "short" })
                  : r.month;
                const net = r.income - r.expense;
                return (
                  <button
                    key={r.month}
                    type="button"
                    className="group w-full rounded-md border border-border/60 bg-background/40 p-2.5 text-left transition-colors hover:bg-muted/15"
                    onClick={() => {
                      setTimelineMonthKey(r.month);
                      setTimelineSelectedTxnId(null);
                      setTimelineOpen(true);
                    }}
                    title="Részletek megnyitása"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] font-semibold text-slate-200">{label}</div>
                      <div className={cn("text-[11px] font-mono tabular-nums", net >= 0 ? "text-emerald-300" : "text-rose-300")}>
                        {net >= 0 ? "+" : "−"}
                        {formatMoney(Math.round(Math.abs(net)), CURRENCY)}
                      </div>
                    </div>
                    <div className="mt-2 grid gap-1 text-[11px] text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Bevétel</span>
                        <span className="font-mono tabular-nums text-emerald-300">
                          {formatMoney(Math.round(r.income), CURRENCY)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Kiadás</span>
                        <span className="font-mono tabular-nums text-rose-300">
                          {formatMoney(Math.round(r.expense), CURRENCY)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Mentés</span>
                        <span className="font-mono tabular-nums text-sky-300">
                          {formatMoney(Math.round(r.saving), CURRENCY)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-muted-foreground">
                      {txnsByMonthKey.get(r.month)?.length ?? 0} tétel
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {doDebtsCard}

      <Card className="card-table pdca-tile--wide w-full">
        <CardHeader className="pb-1.5">
          <RevealPanel
            id="do.quickTxns"
            title="Tételek (gyors szerkesztés)"
            exact="Tételek — a napló: bevétel, kiadás, átvezetés. Kattints egy sorra a részlethez."
          >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {auditDayIso ? (
              <>
                <Badge variant="secondary" className="text-[10px]">
                  Nap: <span className="ml-1 font-mono">{auditDayIso}</span>
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setAuditDayIso(null)}
                  title="Napi szűrő törlése"
                >
                  Szűrő törlése
                </Button>
              </>
            ) : null}
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Kategória</span>
            <Button
              type="button"
              size="sm"
              className="h-7 px-2 text-[11px]"
              variant={cashflowChannelFilter === "all" ? "secondary" : "outline"}
              onClick={() => setCashflowChannelFilter("all")}
            >
              Összes
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 px-2 text-[11px]"
              variant={cashflowChannelFilter === "card" ? "secondary" : "outline"}
              onClick={() => setCashflowChannelFilter("card")}
            >
              Kártya
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 px-2 text-[11px]"
              variant={cashflowChannelFilter === "transfer" ? "secondary" : "outline"}
              onClick={() => setCashflowChannelFilter("transfer")}
            >
              Utalás
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 px-2 text-[11px]"
              variant={cashflowChannelFilter === "bank" ? "secondary" : "outline"}
              onClick={() => setCashflowChannelFilter("bank")}
            >
              Bank
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 px-2 text-[11px]"
              variant={cashflowChannelFilter === "other" ? "secondary" : "outline"}
              onClick={() => setCashflowChannelFilter("other")}
              title="Kézi tételek + KP jellegű banki mozgások"
            >
              Egyéb
            </Button>
            <Badge variant="secondary" className="ml-auto text-[10px]" title="Szűrés utáni lista (max 80 sor)">
              {cashflowQuickTxns.length} tétel
            </Badge>
          </div>
          {cashflowQuickTxns.length === 0 ? (
            <div className="rounded-md border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
              Nincs tétel ebben a szűrésben.
            </div>
          ) : (
            <div className="rounded-md border border-border/60 bg-background/40">
              <table className="w-full text-xs">
                <thead className="bg-slate-900/60">
                  <tr className="border-b border-border/60 text-[11px] text-slate-300">
                    <th className="px-2 py-1.5 text-left font-medium">Dátum</th>
                    <th className="px-2 py-1.5 text-left font-medium">Megnevezés</th>
                    <th className="px-2 py-1.5 text-left font-medium">Partner</th>
                    <th className="px-2 py-1.5 text-right font-medium">Összeg</th>
                    <th className="px-2 py-1.5 text-right font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {cashflowQuickShown.map((t) => (
                    <tr key={t.id} className="border-b border-border/40 last:border-b-0 align-top">
                      <td className="px-2 py-1.5 font-mono text-muted-foreground">
                        {txnDayIso(t.occurred_at) ?? String(t.occurred_at).slice(0, 10)}
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="truncate font-medium" title={displayTxnLabel(t)}>
                          {displayTxnLabel(t)}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">{categoryLabel(t.category)}</div>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="truncate text-muted-foreground" title={t.party?.trim() || undefined}>{t.party?.trim() || "—"}</div>
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className={t.type === "income" ? "text-emerald-300" : t.type === "expense" ? "text-rose-300" : "text-sky-300"}>
                          {t.type === "income" ? "+" : t.type === "expense" ? "−" : ""}
                          {formatMoney(Math.round(txnGrossHuf(t)), CURRENCY)}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                              if (denyShowcaseWrite(isVisitorDemo)) return;
                              beginEditTxn(t);
                            }} aria-label="Szerkesztés">
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-col gap-2 border-t border-border/60 px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Összesen: <span className="font-mono text-slate-200">{cashflowQuickTxns.length}</span> tétel
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[11px]"
                    disabled={cashflowQuickPage <= 1}
                    onClick={() => setCashflowQuickPage(1)}
                    title="Első oldal"
                  >
                    ⏮ Első
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[11px]"
                    disabled={cashflowQuickPage <= 1}
                    onClick={() => setCashflowQuickPage((p) => Math.max(1, p - 1))}
                    title="Előző oldal"
                  >
                    ◀ Előző
                  </Button>
                  <span className="font-mono text-[11px] text-slate-200">
                    {cashflowQuickPage} / {cashflowQuickPageCount} oldal
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[11px]"
                    disabled={cashflowQuickPage >= cashflowQuickPageCount}
                    onClick={() => setCashflowQuickPage((p) => Math.min(cashflowQuickPageCount, p + 1))}
                    title="Következő oldal"
                  >
                    Következő ▶
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[11px]"
                    disabled={cashflowQuickPage >= cashflowQuickPageCount}
                    onClick={() => setCashflowQuickPage(cashflowQuickPageCount)}
                    title="Utolsó oldal"
                  >
                    Végére ⏭
                  </Button>

                  <div className="ml-1 flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">/ oldal</span>
                    <select
                      value={cashflowQuickPageSize}
                      onChange={(e) => {
                        const v = Number(e.currentTarget.value);
                        setCashflowQuickPageSize(v === 15 || v === 25 || v === 50 ? (v as any) : 25);
                      }}
                      className="h-7 rounded-md border border-border/60 bg-background/40 px-2 text-[11px] text-slate-200"
                      aria-label="Oldalméret"
                      title="Oldalméret"
                    >
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
          </RevealPanel>
        </CardHeader>
      </Card>

      <Dialog
        open={timelineOpen}
        onOpenChange={(o) => {
          setTimelineOpen(o);
          if (!o) {
            setTimelineMonthKey(null);
            setTimelineSelectedTxnId(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto border border-border bg-card text-foreground">
          {(() => {
            const key = timelineMonthKey ?? timeline6MonthKeys[timeline6MonthKeys.length - 1] ?? null;
            const monthTxns = key ? (txnsByMonthKey.get(key) ?? []) : [];
            const summary = key ? (timeline6Rows.find((x) => x.month === key) ?? null) : null;
            const selected =
              timelineSelectedTxnId && monthTxns.length > 0
                ? monthTxns.find((t) => t.id === timelineSelectedTxnId) ?? null
                : null;
            const net = summary ? summary.income - summary.expense : 0;
            const label = key
              ? (() => {
                  const [yy, mm] = String(key).split("-").map((x) => Number(x));
                  return Number.isFinite(yy) && Number.isFinite(mm)
                    ? new Date(yy, (mm || 1) - 1, 1).toLocaleString("hu-HU", { year: "numeric", month: "long" })
                    : key;
                })()
              : "—";

            const leanWhy = (t: Transaction | null) => {
              if (!t) return "—";
              const parts: string[] = [];
              const muda = String((t as any).muda_type ?? "").trim();
              const exp = String((t as any).expense_type ?? "").trim();
              if (muda) parts.push(`MUDA: ${muda}`);
              if (exp) parts.push(`Lean: ${exp}`);
              const cat = String(t.category ?? "").trim();
              if (!cat) parts.push("Hiányzó kategória");
              if (!t.bank_raw_id) parts.push("Kézi tétel (nincs bank link)");
              return parts.length ? parts.join(" · ") : "—";
            };

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex flex-wrap items-center justify-between gap-2">
                    <span>Havi részletek — {label}</span>
                    {summary ? (
                      <span className={cn("text-sm font-mono tabular-nums", net >= 0 ? "text-emerald-300" : "text-rose-300")}>
                        {net >= 0 ? "+" : "−"}
                        {formatMoney(Math.round(Math.abs(net)), CURRENCY)}
                      </span>
                    ) : null}
                  </DialogTitle>
                  <DialogDescription>
                    Kattints egy tételre: név, összeg, kategória, dátum és Lean/MUDA ok azonnal látható.
                  </DialogDescription>
                </DialogHeader>

                {selected ? (
                  <div className="rounded-md border border-border/60 bg-background/30 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-100">
                          {displayTxnLabel(selected)}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {String(selected.occurred_at).slice(0, 10)} · {categoryLabel(selected.category)}
                        </div>
                        <div className="mt-1 text-xs text-slate-300">{leanWhy(selected)}</div>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "text-sm font-mono tabular-nums",
                            selected.type === "income" ? "text-emerald-300" : selected.type === "expense" ? "text-rose-300" : "text-sky-300",
                          )}
                        >
                          {selected.type === "income" ? "+" : selected.type === "expense" ? "−" : ""}
                          {formatMoney(Math.round(txnGrossHuf(selected)), CURRENCY)}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="mt-2"
                          onClick={() => beginEditTxn(selected)}
                          title="Megnyitás szerkesztésre"
                        >
                          Szerkesztés
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-md border border-border/60 bg-background/40">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 z-10 bg-card/90 backdrop-blur">
                      <tr className="border-b border-border/60 text-[11px] text-slate-300">
                        <th className="px-2 py-1.5 text-left font-medium">Dátum</th>
                        <th className="px-2 py-1.5 text-left font-medium">Megnevezés</th>
                        <th className="px-2 py-1.5 text-left font-medium">Kategória</th>
                        <th className="px-2 py-1.5 text-right font-medium">Összeg</th>
                        <th className="px-2 py-1.5 text-right font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {monthTxns.length === 0 ? (
                        <tr>
                          <td className="px-2 py-2 text-sm text-muted-foreground" colSpan={5}>
                            Nincs tétel ebben a hónapban.
                          </td>
                        </tr>
                      ) : (
                        monthTxns.slice(0, 240).map((t) => (
                          <tr
                            key={t.id}
                            className={cn(
                              "cursor-pointer border-b border-border/40 align-top last:border-b-0 hover:bg-muted/10",
                              timelineSelectedTxnId === t.id ? "bg-muted/15" : "",
                            )}
                            onClick={() => setTimelineSelectedTxnId(t.id)}
                            title="Kattints a részletekhez"
                          >
                            <td className="px-2 py-1.5 font-mono text-muted-foreground">
                              {String(t.occurred_at).slice(0, 10)}
                            </td>
                            <td className="px-2 py-1.5">
                              <div className="whitespace-normal break-words font-medium text-slate-100">
                                {displayTxnLabel(t)}
                              </div>
                              {t.party ? (
                                <div className="mt-0.5 whitespace-normal break-words text-[11px] text-muted-foreground">
                                  {t.party}
                                </div>
                              ) : null}
                            </td>
                            <td className="px-2 py-1.5 whitespace-normal break-words text-muted-foreground">
                              {categoryLabel(t.category)}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono tabular-nums whitespace-nowrap">
                              <span
                                className={cn(
                                  t.type === "income"
                                    ? "text-emerald-300"
                                    : t.type === "expense"
                                      ? "text-rose-300"
                                      : "text-sky-300",
                                )}
                              >
                                {t.type === "income" ? "+" : t.type === "expense" ? "−" : ""}
                                {formatMoney(Math.round(txnGrossHuf(t)), CURRENCY)}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-right">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  beginEditTxn(t);
                                }}
                                aria-label="Szerkesztés"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setTimelineOpen(false)}>
                    Bezárás
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );

  const lockedDoLedger = (
    <div className="pdca-module-stack w-full min-w-0">
      <Card className="pdca-tile--wide relative w-full overflow-hidden">
        <button
          type="button"
          className={cn(
            "absolute right-0 top-0 z-20 h-8 w-8 text-slate-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70",
            ledgerCollapsed ? "text-amber-200" : "",
          )}
          style={{ clipPath: "polygon(100% 0%, 0% 0%, 100% 100%)" }}
          onClick={() => setLedgerCollapsed((v) => !v)}
          aria-label={ledgerCollapsed ? "Tételek felfedése" : "Tételek elrejtése"}
          title={ledgerCollapsed ? "Tételek felfedése" : "Tételek elrejtése"}
        >
          <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="100,0 0,0 100,100" fill="var(--card-bg)" fillOpacity="0.78" />
            <polyline points="0,0 100,100" stroke="var(--card-border)" strokeWidth="4" fill="none" />
          </svg>
          <span className="relative z-10 block">
            {ledgerCollapsed ? (
              <Plus className="absolute right-1 top-1 h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Minus className="absolute right-1 top-1 h-3.5 w-3.5" aria-hidden="true" />
            )}
          </span>
        </button>
        <CardHeader className="pb-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle
              className="flex items-center text-sm font-medium text-muted-foreground"
              data-exact="Tételek — a napló: bevétel, kiadás, átvezetés. Kattints egy sorra a részlethez."
            >
              {businessMode && activeWorkspace !== "__all"
                ? `Tételek — ${workspaceDisplayName(activeWorkspace)}`
                : "Tételek"}
              <HelpIcon kbId="ledger-overview" />
            </CardTitle>
            <div className="flex w-full max-w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
              {isVisitorDemo ? null : activeWorkspace === "personal" ? (
                <>
                  <input
                    ref={bankXmlFileRef}
                    type="file"
                    accept=".xml,text/xml,application/xml"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.currentTarget.files?.[0] ?? null;
                      if (!f) return;
                      void (async () => {
                        if (!f.name.toLowerCase().endsWith(".xml")) {
                          toast.error("HIBA: Nem megfelelő formátum (Magán). Csak XML (SpreadsheetML).");
                          return;
                        }
                        const text = await f.text();
                        await onBankPersonalXmlText({ fileName: f.name, text, fileSize: f.size });
                      })();
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 gap-2 px-2 sm:px-3"
                    onClick={() => void syncPersonalBankFromLatestFileInFolder()}
                    title="Magán: szinkron a kiválasztott mappa legfrissebb XML kivonatából"
                    aria-label="Magán szinkron XML"
                  >
                    <Folder className="h-4 w-4" />
                    <span className="hidden sm:inline">Magán szinkron</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 px-2 sm:px-3"
                    onClick={() => bankXmlFileRef.current?.click()}
                    title="Magán: XML kivonat kiválasztása"
                    aria-label="XML kivonat kiválasztása"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">XML</span>
                  </Button>
                </>
              ) : (
                <>
                  <input
                    ref={bankFileRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => onBankCsvFile(e.currentTarget.files?.[0] ?? null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-2",
                      bankImportNudge && "ring-2 ring-amber-400/70 ring-offset-2 ring-offset-background animate-pulse",
                    )}
                    onClick={() => {
                      if (denyShowcaseWrite(isVisitorDemo)) return;
                      bankFileRef.current?.click();
                    }}
                    title="Banki szinkron"
                  >
                    <Upload className="h-4 w-4" />
                    Banki szinkron
                  </Button>
                </>
              )}
              <SectionSettingsGear onClick={() => jumpToReferences("partners", undefined, activeWorkspace)} />
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => {
                  if (denyShowcaseWrite(isVisitorDemo)) return;
                  setQuickAddType("expense");
                }}
                title="+ Új tétel"
              >
                <Plus className="h-4 w-4" />
                Új tétel
              </Button>
            </div>
          </div>
          {preferBankImport && !isVisitorDemo ? (
            <div className="mt-1 text-[11px] text-amber-200/90">
              Import-first mód aktív: az alap rögzítést inkább banki szinkronnal kezdd, kézi tétel csak finomhangolás.
            </div>
          ) : null}
          {bankImportStatus ? <div className="mt-1 text-[11px] text-slate-300">{bankImportStatus}</div> : null}
        </CardHeader>
        {ledgerCollapsed ? null : <CardContent className="pt-0">
          <div className="flex w-full flex-wrap items-stretch gap-3">
            <div className="card-kpi min-w-[130px] flex-1 rounded-md border border-sky-500/25 bg-sky-950/20 p-2.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Tételek</div>
              <div
                className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-white sm:text-sm"
                title={`${ledgerSummary.count} db`}
              >
                {ledgerSummary.count} db
              </div>
            </div>
            <div className="card-kpi min-w-[130px] flex-1 rounded-md border border-emerald-500/25 bg-emerald-950/30 p-2.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Bevétel</div>
              <div
                className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-emerald-400 sm:text-sm"
                title={formatMoney(Math.round(ledgerSummary.incomeNet), CURRENCY)}
              >
                {formatMoney(Math.round(ledgerSummary.incomeNet), CURRENCY)}
              </div>
            </div>
            <div className="card-kpi min-w-[130px] flex-1 rounded-md border border-rose-500/25 bg-rose-950/30 p-2.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Kiadás</div>
              <div
                className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-rose-400 sm:text-sm"
                title={formatMoney(Math.round(ledgerSummary.expenseNet), CURRENCY)}
              >
                {formatMoney(Math.round(ledgerSummary.expenseNet), CURRENCY)}
              </div>
            </div>
            <div className="card-kpi min-w-[130px] flex-1 rounded-md border border-sky-500/25 bg-sky-950/20 p-2.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Megtakarítás</div>
              <div
                className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-sky-400 sm:text-sm"
                title={formatMoney(Math.round(ledgerSummary.savingNet), CURRENCY)}
              >
                {formatMoney(Math.round(ledgerSummary.savingNet), CURRENCY)}
              </div>
            </div>
            <div className="card-kpi min-w-[130px] flex-1 rounded-md border border-amber-500/25 bg-amber-950/30 p-2.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Tőketörlesztés</div>
              <div
                className="kpi-value mt-0.5 w-full text-xs font-bold tabular-nums text-amber-400 sm:text-sm"
                title={formatMoney(Math.round(ledgerSummary.loanPrincipalNet), CURRENCY)}
              >
                {formatMoney(Math.round(ledgerSummary.loanPrincipalNet), CURRENCY)}
              </div>
            </div>
            <div className="card-kpi min-w-[130px] flex-1 rounded-md border border-sky-500/25 bg-sky-950/20 p-2.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Egyenleg</div>
              <div
                className={cn(
                  "kpi-value mt-0.5 w-full text-xs font-bold tabular-nums sm:text-sm",
                  ledgerSummary.balanceNet >= 0 ? "text-emerald-400" : "text-rose-400",
                )}
                title={`${ledgerSummary.balanceNet >= 0 ? "+" : ""}${formatMoney(Math.round(ledgerSummary.balanceNet), CURRENCY)}`}
              >
                {ledgerSummary.balanceNet >= 0 ? "+" : ""}
                {formatMoney(Math.round(ledgerSummary.balanceNet), CURRENCY)}
              </div>
            </div>
          </div>
        </CardContent>}
      </Card>

      {ledgerCollapsed ? null : <Card className="card-table w-full">
        <CardContent className="pt-3">
          <div className="mb-2 flex flex-row flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant={ledgerFilter === "all" ? "secondary" : "outline"} className="h-8" onClick={() => setLedgerFilter("all")}>
              Összes
            </Button>
            <Button type="button" size="sm" variant={ledgerFilter === "income" ? "secondary" : "outline"} className="h-8" onClick={() => setLedgerFilter("income")}>
              Bevétel
            </Button>
            <Button type="button" size="sm" variant={ledgerFilter === "expense" ? "secondary" : "outline"} className="h-8" onClick={() => setLedgerFilter("expense")}>
              Kiadás
            </Button>
            <Button type="button" size="sm" variant={ledgerFilter === "saving_transfer" ? "secondary" : "outline"} className="h-8" onClick={() => setLedgerFilter("saving_transfer")}>
              Megtakarítás
            </Button>
            <Button type="button" size="sm" variant={ledgerFilter === "liability_planned" ? "secondary" : "outline"} className="h-8" onClick={() => setLedgerFilter("liability_planned")}>
              Tartozás / Tervezett
            </Button>
          </div>
          <div className="card-scroll-body w-full rounded-md border border-border/60 bg-background/40">
            {ledgerShown.length === 0 ? (
              <div className="p-3">
                <EmptyBlock>Nincs rögzített tétel.</EmptyBlock>
              </div>
            ) : (
              <ul className="divide-y divide-border/60 px-2">
                {ledgerShown.map((txnRow) => (
                  <LedgerTxnRow
                    key={txnRow.id}
                    t={txnRow}
                    checked={selectedTxnIds.has(txnRow.id)}
                    onCheckedChange={(next) =>
                      setSelectedTxnIds((cur) => {
                        const s = new Set(cur);
                        if (next) s.add(txnRow.id);
                        else s.delete(txnRow.id);
                        return s;
                      })
                    }
                    currency={CURRENCY}
                    businessMode={businessMode}
                    txnNetHuf={txnNetHuf}
                    txnGrossHuf={txnGrossHuf}
                    categoryLabel={categoryLabel}
                    bucketName={(id) => (id ? bucketName(id) : null)}
                    showWorkspaceBadge={showWsBadge}
                    workspaceLabel={workspaceLabel}
                    workspaceBadgeClass={wsBadgeClass}
                    onEdit={() => beginEditTxn(txnRow)}
                    onPiggy={() => {
                      if ((txnRow.type === "income" || txnRow.type === "saving") && Number(txnRow.amount) > 0) {
                        setTransferSource(txnRow);
                      }
                    }}
                  />
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>}

      <div className="w-full">
        {(() => {
          const lvl = consistencyReport.level;
          const cls =
            lvl === "green"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : lvl === "yellow"
                ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                : "border-rose-500/30 bg-rose-500/10 text-rose-200";
          const icon = lvl === "green" ? "🟢" : lvl === "yellow" ? "🟡" : "🔴";
          const label =
            lvl === "green"
              ? "Adatok konzisztensek (0 duplikáció / 0 ütközés)"
              : lvl === "yellow"
                ? "Figyelem: lehetséges duplikáció vagy hiányos besorolás"
                : "Hiba: logikai ellentmondás / biztos adatátfedés";
          return (
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", cls)}>
                  {icon} {label}
                </span>
                <span className="text-muted-foreground">
                  duplikáció: <span className="font-mono text-slate-200">{consistencyReport.stats.dupBankRawCount}</span>
                  {" · "}átvezetés:{" "}
                  <span className="font-mono text-slate-200">{consistencyReport.stats.brokenTransferCount}</span>
                  {" · "}hiányzó kategória: <span className="font-mono text-slate-200">{missingCategoryCount}</span>
                </span>
              </div>
              <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={scrollToDataLineage}>
                Részletek
              </Button>
            </div>
          );
        })()}

        <RawTransactionAuditTable
          txns={isVisitorDemo ? collapseNearDuplicateTxns(txns) : txns}
          workspaceId={activeWorkspace}
          currency={CURRENCY}
          dayIso={auditDayIso}
          onClearDayFilter={() => setAuditDayIso(null)}
          onEditTxn={beginEditTxn}
        />
      </div>
    </div>
  );

  const lockedDoDeals = (
    <div className="pdca-module-stack w-full min-w-0">
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
          <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
            Üzletek & Árrés
            <HelpIcon kbId="deals-overview" />
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px]">
              {resaleDeals.kpi.closedCount}/{resaleDeals.kpi.totalCount} lezárt
            </Badge>
            <SectionSettingsGear onClick={() => jumpToReferences("partners", undefined, activeWorkspace)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <StatCard
              label="Beszerzés (nettó)"
              value={formatMoney(Math.round(resaleDeals.kpi.purchaseNetSum), CURRENCY)}
            />
            <StatCard
              label="Bevétel (nettó)"
              value={formatMoney(Math.round(resaleDeals.kpi.revenueSum), CURRENCY)}
            />
            <StatCard
              label="Árrés"
              value={`${formatMoney(Math.round(resaleDeals.kpi.marginSum), CURRENCY)} · ${resaleDeals.kpi.avgPct.toFixed(1)}%`}
            />
            <StatCard
              label="Lezárt ügyletek"
              value={`${resaleDeals.kpi.closedCount} / ${resaleDeals.kpi.totalCount}`}
            />
          </div>
        </CardContent>
      </Card>
      <Card className="card-table">
        <CardHeader className="pb-1.5">
          <CardTitle className="text-sm font-medium text-muted-foreground">Ügyletlista</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {resaleDeals.deals.length === 0 ? (
            <div className="text-sm text-muted-foreground">Még nincs továbbértékesítési ügylet.</div>
          ) : (
            <ul className="divide-y divide-border/60">
              {resaleDeals.deals.slice(0, 12).map((d) => (
                <li key={d.purchase.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                  <span className="truncate text-slate-200">{d.customer}</span>
                  <span className="font-mono text-slate-100 whitespace-nowrap">
                    {formatMoney(Math.round(d.margin), CURRENCY)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const lockedDoInventory = (
    <div className="pdca-module-stack w-full min-w-0">
      <AssetTree
        properties={personalProperties as any}
        assets={assets as any}
        locations={locations as any}
        vehicles={activeVehicles as any}
        txns={allTxns}
        currency={CURRENCY}
        businessLabel={activeWorkspace === "__all" ? "Vállalkozások (összes)" : workspaceDisplayName(activeWorkspace)}
      />

      <Card className="border-[color:var(--color-chart-6)]/30 bg-[color:var(--color-chart-6)]/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Kezelés — helyek & eszközök
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {locations.length} hely · {assets.length} eszköz
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" className="h-8" onClick={() => setLocationsOpen(true)}>
            Helyek beállítása
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-8" onClick={() => setAssetsOpen(true)}>
            Eszközök kezelése
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const lockedDoModule = (
    <div
      className={cn(
        "pdca-frame relative isolate w-full min-w-0 overflow-hidden rounded-xl border border-cyan-300/40",
        "bg-cyan-500/[0.06]",
      )}
    >
      <div className="relative z-10 min-w-0 p-1.5">
        {activeSubTab === "cashflow" ? lockedDoCashflow : null}
        {activeSubTab === "ledger" ? lockedDoLedger : null}
        {activeSubTab === "deals" ? lockedDoDeals : null}
        {activeSubTab === "inventory" ? lockedDoInventory : null}
      </div>
    </div>
  );

  const lockedCheckModule = (
    <Card className="pdca-frame relative isolate w-full min-w-0 overflow-hidden rounded-xl border border-emerald-300/40 bg-emerald-500/[0.06]">
      <CardHeader className="relative z-10 shrink-0 pb-1.5">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          <LeanTerm
            title="CHECK — összegzés"
            exact={pdcaPhaseExact("CHECK", surface, demoSegmentId)}
          >
            CHECK — összegzés
          </LeanTerm>
        </CardTitle>
      </CardHeader>
      <CardContent className="card-scroll-body relative z-10 grid gap-2.5 text-sm text-slate-300">
        {resiliencePanel("CHECK")}
        {educationPanel("CHECK")}
        {industryPanel("CHECK")}
        {strategyPanel("CHECK")}
        {surface.showFinanceModules ? (
        <>
        {activeWorkspace === "personal" ? (
          <div className="rounded-lg border border-emerald-400/20 bg-emerald-950/10 p-3">
            {(() => {
              const k = computeKaizenAudit({
                txns,
                goals,
                buckets: settings.buckets ?? [],
                workspaceId: "personal",
                now: new Date(),
              });
              const rate = k.mudaRate;
              return (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <LeanTerm
                      className="text-xs uppercase tracking-wide text-emerald-200/90"
                      title="Kaizen"
                      exact="folyamatos javítás — kis, ismétlődő ellenőrzés. Heti és havi jelzés, hogy javul-e a pazarlás."
                    >
                      Kaizen — heti/havi audit
                    </LeanTerm>
                    {rate ? (
                      <span className="font-mono text-xs text-emerald-100">
                        MUDA: {formatMoney(Math.round(rate.currentMonthMuda), CURRENCY)} · 3h átlag:{" "}
                        {formatMoney(Math.round(rate.prev3AvgMuda), CURRENCY)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>

                  {rate ? (
                    <div className="mt-2 rounded-md border border-slate-700/60 bg-slate-900/30 p-2">
                      <LeanTerm
                        className="text-[11px] text-slate-300"
                        title="MUDA-ráta"
                        exact="veszteség-arány — mennyivel kevesebb vagy több a pazarlás ebben a hónapban, mint az előző három hónap átlaga."
                      >
                        MUDA-ráta
                      </LeanTerm>
                      <div className="mt-0.5 font-mono text-slate-100">
                        {rate.reductionHuf >= 0 ? (
                          <span className="text-emerald-200">+{formatMoney(Math.round(rate.reductionHuf), CURRENCY)}</span>
                        ) : (
                          <span className="text-rose-200">{formatMoney(Math.round(rate.reductionHuf), CURRENCY)}</span>
                        )}{" "}
                        / hó (az előző 3 hónap átlagához képest)
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                    <div className="rounded-md border border-slate-700/60 bg-slate-900/30 p-2">
                      <LeanTerm
                        className="text-[11px] text-slate-300"
                        title="Impulzus"
                        exact="hirtelen, nem tervezett költések az elmúlt 7 napban."
                      >
                        Utolsó 7 nap impulzus
                      </LeanTerm>
                      {k.weekly.impulses.length === 0 ? (
                        <div className="mt-1 text-xs text-muted-foreground">Nincs jelölt impulzus tétel.</div>
                      ) : (
                        <div className="mt-1 space-y-1 text-xs">
                          {k.weekly.impulses.slice(0, 5).map((t) => (
                            <div key={t.id} className="flex items-center justify-between gap-2">
                              <span className="truncate">
                                {t.partner || "—"} · {t.description || "—"}
                              </span>
                              <span className="font-mono text-rose-200 whitespace-nowrap">{formatMoney(Math.round(t.amount), CURRENCY)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-md border border-slate-700/60 bg-slate-900/30 p-2">
                      <div className="text-[11px] text-slate-300">Legnagyobb megtakarítások (7 nap)</div>
                      {k.weekly.topSavings.length === 0 ? (
                        <div className="mt-1 text-xs text-muted-foreground">Nincs új megtakarítás tétel.</div>
                      ) : (
                        <div className="mt-1 space-y-1 text-xs">
                          {k.weekly.topSavings.slice(0, 5).map((t) => (
                            <div key={t.id} className="flex items-center justify-between gap-2">
                              <span className="truncate">{t.description || "Megtakarítás"}</span>
                              <span className="font-mono text-emerald-200 whitespace-nowrap">
                                {formatMoney(Math.round(t.amount), CURRENCY)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 text-[11px] text-slate-400">
                        Összesen: <span className="font-mono text-slate-200">{formatMoney(Math.round(k.weekly.savingsTotal7d), CURRENCY)}</span>
                      </div>
                    </div>

                    <div className="rounded-md border border-slate-700/60 bg-slate-900/30 p-2">
                      <div className="text-[11px] text-slate-300">Cél előrehaladás (átirányítás)</div>
                      {k.weekly.goals.length === 0 ? (
                        <div className="mt-1 text-xs text-muted-foreground">Nincs aktív cél a Magánban.</div>
                      ) : (
                        <div className="mt-1 space-y-1 text-xs">
                          {k.weekly.goals.map((g) => (
                            <div key={g.id} className="flex items-center justify-between gap-2">
                              <span className="truncate">{g.name}</span>
                              <span className="font-mono text-slate-200 whitespace-nowrap">{g.progressPct.toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : null}

        <div className="rounded-lg border border-emerald-400/20 bg-emerald-950/10 p-3">
          <div className="flex items-center justify-between gap-3">
            <LeanTerm
              className="text-xs uppercase tracking-wide text-emerald-200/90"
              title="Pénzügyi Valóság-Sokk"
              exact="A kiadások szükséglet / vágy / befektetés aránya."
            >
              Pénzügyi Valóság-Sokk
            </LeanTerm>
            <span
              className="font-mono text-xs text-emerald-100"
              data-exact={`Szükséglet ${mirrorSummary.needsPct.toFixed(0)}% · vágy ${mirrorSummary.wantsPct.toFixed(0)}% · befektetés ${mirrorSummary.investPct.toFixed(0)}%`}
            >
              {mirrorSummary.totalOut > 0 ? `${mirrorSummary.needsPct.toFixed(0)}/${mirrorSummary.wantsPct.toFixed(0)}/${mirrorSummary.investPct.toFixed(0)}%` : "—"}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
            <div
              className="rounded-md border border-slate-700/60 bg-slate-900/40 p-2"
              data-exact={`Kötelező, el nem hagyható kiadás.\n${formatMoney(Math.round(mirrorSummary.needs), CURRENCY)} · ${mirrorSummary.needsPct.toFixed(0)}%`}
            >
              <LeanTerm
                className="text-[11px] text-slate-300"
                title="Szükséglet"
                exact="Kötelező, el nem hagyható kiadás."
              >
                Szükséglet
              </LeanTerm>
              <div className="mt-0.5 font-mono text-slate-100">
                {formatMoney(Math.round(mirrorSummary.needs), CURRENCY)} · {mirrorSummary.needsPct.toFixed(0)}%
              </div>
            </div>
            <div
              className="rounded-md border border-slate-700/60 bg-slate-900/40 p-2"
              data-exact={`Extra, nem kötelező költés.\n${formatMoney(Math.round(mirrorSummary.wants), CURRENCY)} · ${mirrorSummary.wantsPct.toFixed(0)}%`}
            >
              <LeanTerm
                className="text-[11px] text-slate-300"
                title="Vágy"
                exact="Extra, nem kötelező költés."
              >
                Vágy
              </LeanTerm>
              <div className="mt-0.5 font-mono text-slate-100">
                {formatMoney(Math.round(mirrorSummary.wants), CURRENCY)} · {mirrorSummary.wantsPct.toFixed(0)}%
              </div>
            </div>
            <div
              className="rounded-md border border-slate-700/60 bg-slate-900/40 p-2"
              data-exact={`Megtakarítás, tőke, jövőbe tett pénz.\n${formatMoney(Math.round(mirrorSummary.invest), CURRENCY)} · ${mirrorSummary.investPct.toFixed(0)}%`}
            >
              <LeanTerm
                className="text-[11px] text-slate-300"
                title="Befektetés"
                exact="Megtakarítás, tőke, jövőbe tett pénz."
              >
                Befektetés
              </LeanTerm>
              <div className="mt-0.5 font-mono text-slate-100">
                {formatMoney(Math.round(mirrorSummary.invest), CURRENCY)} · {mirrorSummary.investPct.toFixed(0)}%
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-900/60">
              <div
                className="h-full bg-emerald-400/80 a11y-pat-diagonal"
                style={{ width: `${Math.max(0, Math.min(100, mirrorSummary.needsPct))}%` }}
              />
              <div
                className="h-full bg-amber-400/80 a11y-pat-checker"
                style={{ width: `${Math.max(0, Math.min(100, mirrorSummary.wantsPct))}%` }}
              />
              <div
                className="h-full bg-sky-400/80 a11y-pat-dots"
                style={{ width: `${Math.max(0, Math.min(100, mirrorSummary.investPct))}%` }}
              />
            </div>
            <button
              type="button"
              className="mt-2 flex w-full items-center justify-between text-left text-xs text-slate-300 hover:text-slate-100"
              onClick={() => setMudaOpen((v) => !v)}
              aria-expanded={mudaOpen}
            >
              <LeanTerm
                title="Észlelt MUDA"
                exact="veszteség — pazarlás a tételeken (impulzus, díj, selejt, dupla előfizetés)."
              >
                Észlelt MUDA
              </LeanTerm>
              <span className="font-mono text-rose-200">{formatMoney(Math.round(mirrorSummary.muda), CURRENCY)}</span>
            </button>
            {mudaOpen ? (
              <div className="mt-2 space-y-2 rounded-md border border-rose-500/25 bg-rose-950/20 p-2">
                {mirrorSummary.mudaHits.length === 0 ? (
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Nincs megjelölt pazarlás ebben a nézetben. A MUDA a tételen beállított
                    típus (impulzus, díj, selejt, dupla előfizetés).
                  </p>
                ) : (
                  <>
                    <p className="text-[11px] font-medium text-slate-200">Miből tevődik össze</p>
                    <ul className="space-y-0.5 text-[11px] text-slate-300">
                      {mirrorSummary.mudaByKind.map((k) => (
                        <li key={k.kindLabel} className="flex items-center justify-between gap-2">
                          <span>
                            {k.kindLabel}
                            <span className="text-slate-500"> · {k.count} tétel</span>
                          </span>
                          <span className="font-mono text-rose-200">
                            {formatMoney(Math.round(k.amount), CURRENCY)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="pt-1 text-[11px] font-medium text-slate-200">Hol találta</p>
                    <ul className="space-y-1.5">
                      {mirrorSummary.mudaHits.slice(0, 12).map((h) => (
                        <li key={h.id} className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-[11px] text-slate-200">{h.where}</div>
                            <div className="truncate text-[10px] text-slate-500">
                              {h.kindLabel} · {h.date} · {workspaceDisplayName(h.workspace)}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <span className="font-mono text-[11px] text-rose-200">
                              {formatMoney(Math.round(h.amount), CURRENCY)}
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-[10px]"
                              onClick={() => {
                                setAuditDayIso(h.date || null);
                                setSelectedTxnIds(new Set([h.id]));
                                setLedgerFilter("expense");
                                setActiveSubTab("ledger");
                              }}
                            >
                              Ugrás
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {mirrorSummary.mudaHits.length > 12 ? (
                      <p className="text-[10px] text-slate-500">
                        További {mirrorSummary.mudaHits.length - 12} tétel a Tételek nézetben, a kijelölt
                        napon.
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div className="viz-split">
          <MudaHeatmap
            txns={txns}
            selectedDayIso={auditDayIso}
            onSelectDay={setAuditDayIso}
            amountOf={(t) => Math.max(0, businessMode ? txnGrossHuf(t) : Number(t.amount) || 0)}
          />
        </div>
        {activeLoans.length > 0 ? (
          <div className="viz-split rounded-lg border border-emerald-400/20 bg-emerald-950/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <LeanTerm
                className="text-xs uppercase tracking-wide text-emerald-200/90"
                title="Adósság-helyreállítás"
                exact="melyik tartozást érdemes először csökkenteni, ha van extra pénz."
                summary="Két sorrend ugyanazokra a tartozásokra. lavina: a legmagasabb kamat előre. hólabda: a legkisebb tőke előre."
              >
                Adósság-helyreállítás
              </LeanTerm>
              <span className="font-mono text-xs text-slate-300">
                Min. havi teher: {formatMoney(Math.round(debtFocus.monthlyMinimumSum), CURRENCY)}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="rounded-md border border-slate-700/60 bg-slate-900/30 p-2">
                <LeanTerm
                  className="text-[11px] text-slate-300"
                  title="Avalanche"
                  exact="lavina — először a legmagasabb kamatú tartozást törleszted extra összeggel. A kamaton spórolsz."
                >
                  Avalanche
                </LeanTerm>
                <div className="mt-1 space-y-1 text-xs">
                  {debtFocus.avalanche.slice(0, 3).map((d, i) => (
                    <div key={d.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        #{i + 1} {d.name}
                        {d.interestRate > 0 ? <span className="ml-1 text-slate-400">· {d.interestRate.toFixed(1)}%</span> : null}
                      </span>
                      <span className="font-mono text-slate-200 whitespace-nowrap">{formatMoney(Math.round(d.remaining), CURRENCY)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  Javaslat: tartsd a minimumokat, a maradék “extra” törlesztést tolld a #1-re.
                </div>
              </div>
              <div className="rounded-md border border-slate-700/60 bg-slate-900/30 p-2">
                <LeanTerm
                  className="text-[11px] text-slate-300"
                  title="Snowball"
                  exact="hólabda — először a legkisebb tartozást zárod le. Gyorsabb sikerélmény, utána jöhet a kamatos."
                >
                  Snowball
                </LeanTerm>
                <div className="mt-1 space-y-1 text-xs">
                  {debtFocus.snowball.slice(0, 3).map((d, i) => (
                    <div key={d.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        #{i + 1} {d.name}
                        {d.remaining > 0 ? <span className="ml-1 text-slate-400">· min</span> : null}
                      </span>
                      <span className="font-mono text-slate-200 whitespace-nowrap">{formatMoney(Math.round(d.remaining), CURRENCY)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  Javaslat: gyors “kivezetések” a motivációért, utána vissza Avalanche-re.
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {bridge ? (
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <LeanTerm
                className="text-xs uppercase tracking-wide text-slate-200"
                title="Magán ↔ üzleti híd"
                exact="pénzáramlás-híd — a magán kassza és a cég között: mennyi vihető át, mire kell, mennyi a javasolt áthidalás."
              >
                Magán ↔ üzleti híd
              </LeanTerm>
              <span className="font-mono text-xs text-slate-300">
                Magán szabad: {formatMoney(Math.round(bridge.personalFree), CURRENCY)}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
              <div className="rounded-md border border-slate-800/60 bg-slate-950/20 p-2">
                <LeanTerm
                  className="text-[11px] text-slate-300"
                  title="Üzleti mozgósítható"
                  exact="Üzleti mozgósítható — a céges kasszából amennyi a kötelezettségek után még átvihető."
                >
                  Üzleti mozgósítható
                </LeanTerm>
                <div className="mt-0.5 font-mono text-slate-100">
                  {formatMoney(Math.round(bridge.totalBusinessSurplus), CURRENCY)}
                </div>
              </div>
              <div className="rounded-md border border-slate-800/60 bg-slate-950/20 p-2">
                <LeanTerm
                  className="text-[11px] text-slate-300"
                  title="Magán igény"
                  exact="Magán igény — amennyi a magán oldalon hiányzik (deficit vagy tartozás)."
                >
                  Magán igény (deficit / adósság)
                </LeanTerm>
                <div className="mt-0.5 font-mono text-slate-100">
                  {formatMoney(Math.round(bridge.personalNeed), CURRENCY)}
                </div>
              </div>
              <div className="rounded-md border border-slate-800/60 bg-slate-950/20 p-2">
                <LeanTerm
                  className="text-[11px] text-slate-300"
                  title="Javasolt áthidalás"
                  exact="Javasolt áthidalás — ennyit érdemes a cég és a magán között vinni. Javaslat, nem utalás."
                >
                  Javasolt áthidalás
                </LeanTerm>
                <div className="mt-0.5 font-mono text-emerald-200">
                  {formatMoney(Math.round(bridge.suggestedTransfer), CURRENCY)}
                </div>
              </div>
            </div>
            {bridge.targetDebtName ? (
              <div className="mt-2 text-[11px] text-slate-300">
                Fókusz tartozás: <span className="font-mono text-slate-100">{bridge.targetDebtName}</span>
              </div>
            ) : null}
            {bridge.allocations.length ? (
              <div className="mt-2 text-[11px] text-slate-300">
                Forrás javaslat (surplus arányosan):{" "}
                <span className="font-mono text-slate-100">
                  {bridge.allocations.map((a) => `${workspaceDisplayName(a.workspaceId)} ${formatMoney(Math.round(a.amount), CURRENCY)}`).join(" · ")}
                </span>
              </div>
            ) : null}
            {bridge.notes.length ? (
              <div className="mt-2 text-[11px] text-slate-400">{bridge.notes.join(" ")}</div>
            ) : null}
            <div className="mt-2 text-[11px] text-slate-400">
              Csatornák (válassz 1-et): tagi hitel visszafizetés / osztalék / bér.
            </div>
          </div>
        ) : null}

        {multiYear ? (
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <LeanTerm
                className="text-xs uppercase tracking-wide text-slate-200"
                title="Többéves tükör"
                exact="Többéves tükör — három évnyi minta: mennyi a pazarlás évesítve, és meddig tart a kassza, ha ezt elhagyod."
              >
                Többéves tükör (3 év)
              </LeanTerm>
              <span className="font-mono text-xs text-slate-300">
                Fix baseline: {formatMoney(Math.round(multiYear.baselineFixNeedMonthly), CURRENCY)}/hó
              </span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
              <div className="rounded-md border border-slate-800/60 bg-slate-950/20 p-2">
                <LeanTerm
                  className="text-[11px] text-slate-300"
                  title="Évesített MUDA"
                  exact="veszteség — ha a mostani pazarlás így marad, ennyi forint megy el egy év alatt."
                >
                  Évesített MUDA
                </LeanTerm>
                <div className="mt-0.5 font-mono text-rose-200">
                  {formatMoney(Math.round(multiYear.annualizedMuda), CURRENCY)}/év
                </div>
              </div>
              <div className="rounded-md border border-slate-800/60 bg-slate-950/20 p-2">
                <LeanTerm
                  className="text-[11px] text-slate-300"
                  title="Évesített WANT"
                  exact="vágy — ha a mostani extra (nem kötelező) költés így marad, ennyi egy év alatt."
                >
                  Évesített WANT
                </LeanTerm>
                <div className="mt-0.5 font-mono text-amber-200">
                  {formatMoney(Math.round(multiYear.annualizedWants), CURRENCY)}/év
                </div>
              </div>
              <div className="rounded-md border border-slate-800/60 bg-slate-950/20 p-2">
                <LeanTerm
                  className="text-[11px] text-slate-300"
                  title="Céltartalék (most → lean)"
                  exact="hány hónapig tart a kassza a mostani ütemmel, és mennyivel tovább, ha a pazarlást elhagyod."
                >
                  Céltartalék (most → lean)
                </LeanTerm>
                <div className="mt-0.5 font-mono text-slate-100">
                  {multiYear.runwayMonthsCurrent == null ? "—" : `${multiYear.runwayMonthsCurrent.toFixed(1)} hó`} →{" "}
                  {multiYear.runwayMonthsLean == null ? "—" : `${multiYear.runwayMonthsLean.toFixed(1)} hó`}
                </div>
              </div>
            </div>
            {multiYear.peaks.length ? (
              <div className="mt-2 text-[11px] text-slate-300">
                Szezonalitási csúcsok:{" "}
                <span className="font-mono text-slate-200">
                  {multiYear.peaks
                    .map((p) => `${p.month}hó ×${p.factor.toFixed(2)}`)
                    .join(" · ")}
                </span>
              </div>
            ) : null}
            <div className="mt-2 text-xs text-slate-300">
              Lean forgatókönyv: <span className="font-mono text-slate-100">{formatMoney(Math.round(multiYear.annualizedMuda), CURRENCY)}</span>{" "}
              /év felszabadul, ha a pazarlást lenullázod.
            </div>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <LeanTerm
            title="MUDA score"
            exact="veszteség-pont — 0–100: minél magasabb, annál több a pazarlás."
          >
            MUDA score
          </LeanTerm>
          <span className="font-mono text-slate-200">{checkSummary ? `${checkSummary.mudaScore}/100` : "—"}</span>
        </div>
        {resourceEfficiency ? (
          <div className="flex items-center justify-between">
            <LeanTerm
              title="EV+EFO arány"
              exact="alvállalkozói és alkalmi díjak az összes kiadáshoz képest."
              summary="EV: alvállalkozó / egyéni vállalkozó díja. EFO: alkalmi foglalkoztatás napidíja. Az arány ezeknek a költsége az összes kiadáshoz képest."
            >
              EV+EFO arány
            </LeanTerm>
            <span className="font-mono text-slate-200">
              {resourceEfficiency.totalExpenseGross > 0
                ? `${Math.round(
                    ((resourceEfficiency.evGross + resourceEfficiency.efoGross) / resourceEfficiency.totalExpenseGross) * 100,
                  )}%`
                : "—"}
            </span>
          </div>
        ) : null}
        {realEstatePanel}

        <div className="viz-split grid items-start gap-3">
          <Card className="w-full">
            <CardContent className="grid items-start gap-3 pt-2.5">
              <ChartChrome
                title={
                  <LeanTerm
                    title="Eredménylevezetés"
                    exact="Bevétel, levonások és a maradó eredmény."
                  >
                    Eredménylevezetés
                  </LeanTerm>
                }
                span={vizSpan}
                onSpan={onVizSpan}
                onPrev={onVizPrev}
                onNext={onVizNext}
                windowLabel={vizWindowLabel}
                legend={
                  <>
                    <ChartLegendSwatch color="#34d399" label="Plusz" />
                    <ChartLegendSwatch color="#fb7185" label="Levonás" />
                  </>
                }
              >
                <WaterfallChart steps={leanBuilt.waterfall} />
              </ChartChrome>
              <div className="viz-split">
                <ChartChrome
                  title="Havi bevétel, kiadás és megtakarítás"
                  span={vizSpan}
                  onSpan={onVizSpan}
                  onPrev={onVizPrev}
                  onNext={onVizNext}
                  windowLabel={vizWindowLabel}
                  legend={
                    <>
                      <ChartLegendSwatch color="#34d399" label="Bevétel" line />
                      <ChartLegendSwatch color="#fb7185" label="Kiadás" line />
                      <ChartLegendSwatch color="var(--accent-color)" label="Megtakarítás" line />
                    </>
                  }
                >
                  <SmallMultiples
                    series={[
                      { id: "inc", label: "Bevétel", points: series.map((s) => ({ x: s.label, y: s.income })) },
                      { id: "exp", label: "Kiadás", points: series.map((s) => ({ x: s.label, y: s.expense })) },
                      { id: "sav", label: "Megtakarítás", points: series.map((s) => ({ x: s.label, y: s.saving })) },
                    ]}
                    xLabel="Hónap"
                    yLabel={currencyUnit()}
                  />
                </ChartChrome>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardContent className="pt-2.5">
              {leanBuilt.links.length === 0 ? (
                <EmptyBlock>Még nincs rögzített áramlás.</EmptyBlock>
              ) : (
                <ChartChrome
                  title={
                    <LeanTerm
                      title="Pénzáramlás"
                      exact="Pénzáramlás — honnan hová megy a pénz. A vastagság az összeg."
                    >
                      Pénzáramlás
                    </LeanTerm>
                  }
                  span={vizSpan}
                  onSpan={onVizSpan}
                  onPrev={onVizPrev}
                  onNext={onVizNext}
                  windowLabel={vizWindowLabel}
                  legend={
                    <>
                      <ChartLegendSwatch color="var(--accent-color)" label="Honnan" />
                      <ChartLegendSwatch color="#94a3b8" label="Költséghely" />
                    </>
                  }
                >
                  <FlowSankey sources={leanBuilt.sources} sinks={leanBuilt.sinks} links={leanBuilt.links} />
                </ChartChrome>
              )}
              <div className="viz-split">
                <ChartChrome
                  title="Kivétel-hőtérkép"
                  span={vizSpan}
                  onSpan={onVizSpan}
                  onPrev={onVizPrev}
                  onNext={onVizNext}
                  windowLabel={vizWindowLabel}
                  legend={
                    <>
                      <ChartLegendSwatch color="#34d399" label="Plusz" />
                      <ChartLegendSwatch color="#94a3b8" label="Semleges" />
                      <ChartLegendSwatch color="#fb7185" label="Levonás" />
                    </>
                  }
                >
                  <ExceptionHeatmap
                    rows={leanBuilt.heatRows}
                    cols={leanBuilt.heatCols}
                    cells={leanBuilt.heatCells}
                  />
                </ChartChrome>
              </div>
            </CardContent>
          </Card>
        </div>
        </>
        ) : null}
      </CardContent>
    </Card>
  );

  const lockedActModule = (
    <Card className="pdca-frame relative isolate w-full min-w-0 overflow-hidden rounded-xl border border-rose-300/40 bg-rose-500/[0.06]">
      <CardHeader className="relative z-10 shrink-0 pb-1.5">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          <LeanTerm
            title="ACT"
            exact="beavatkozás — árazás, költségkeret, átütemezés, Lean javaslat."
          >
            ACT — Beavatkozás & Döntéstámogatás
          </LeanTerm>
        </CardTitle>
      </CardHeader>
      <CardContent className="card-scroll-body relative z-10 grid gap-3">
        {resiliencePanel("ACT")}
        {educationPanel("ACT")}
        {industryPanel("ACT")}
        {strategyPanel("ACT")}
        {surface.showFinanceModules ? (
        <>
        {personalLoans.length > 0 ? (
          <div className="rounded-lg border border-rose-400/20 bg-rose-950/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <LeanTerm
                className="text-xs uppercase tracking-wide text-rose-200/90"
                title="Törlesztési fókusz"
                exact="ugyanaz a két sorrend: kamat előre vagy kis tőke előre."
              >
                Javasolt havi törlesztési fókusz
              </LeanTerm>
              <span className="font-mono text-xs text-slate-300">{personalLoans.length} aktív tartozás</span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="rounded-md border border-slate-700/60 bg-slate-900/30 p-2">
                <LeanTerm
                  className="text-[11px] text-slate-300"
                  title="Avalanche"
                  exact="lavina — először a legmagasabb kamatú tartozást törleszted extra összeggel."
                >
                  Avalanche
                </LeanTerm>
                <div className="mt-1 space-y-1 text-xs">
                  {suggestedDebtFocus(personalLoans).avalanche.slice(0, 2).map((d, i) => (
                    <div key={d.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        #{i + 1} {d.name} {d.interestRate > 0 ? <span className="text-slate-400">· {d.interestRate.toFixed(1)}%</span> : null}
                      </span>
                      <span className="font-mono text-slate-200 whitespace-nowrap">{formatMoney(Math.round(d.remaining), CURRENCY)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-slate-700/60 bg-slate-900/30 p-2">
                <LeanTerm
                  className="text-[11px] text-slate-300"
                  title="Snowball"
                  exact="hólabda — először a legkisebb tartozást zárod le, a gyorsabb lezárásért."
                >
                  Snowball
                </LeanTerm>
                <div className="mt-1 space-y-1 text-xs">
                  {suggestedDebtFocus(personalLoans).snowball.slice(0, 2).map((d, i) => (
                    <div key={d.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        #{i + 1} {d.name}
                      </span>
                      <span className="font-mono text-slate-200 whitespace-nowrap">{formatMoney(Math.round(d.remaining), CURRENCY)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {bridge.suggestedTransfer > 0 ? (
              <div className="mt-2 text-[11px] text-slate-300">
                Pénzáramlás-híd: javasolt áthidalás{" "}
                <span className="font-mono text-emerald-200">{formatMoney(Math.round(bridge.suggestedTransfer), CURRENCY)}</span> (üzleti surplusból)
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-2">
          <LeanTerm
            className="text-xs font-medium text-slate-200"
            title="Döntési elágazások"
            exact="Döntési elágazások — három beavatkozás: árazás, extra-költés keret, projekt átütemezés."
          >
            Döntési elágazások
          </LeanTerm>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-10 w-full whitespace-normal break-words leading-tight"
              data-exact="Árazás módosítása — árrés / óradíj döntés az Üzletek nézetben, ha a céges kassza nem fedezi a magán áthidalást."
              onClick={() => {
                setActiveSubTab("deals");
                if (bridge.personalNeed > 0 && bridge.totalBusinessSurplus < bridge.personalNeed) {
                  const gap = Math.max(0, bridge.personalNeed - bridge.totalBusinessSurplus);
                  toast.success(
                    `ACT: Árazás javaslat — a céges szabad kassza nem fedezi a magán áthidalást (${formatMoney(
                      Math.round(gap),
                      CURRENCY,
                    )} hiány). Emeld az árrést / óradíjat vagy csökkentsd a fix burn-t.`,
                  );
                } else {
                  toast.success("ACT: Árazás / margin döntések az Üzletek nézetben.");
                }
              }}
            >
              💸 Árazás módosítása
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-10 w-full whitespace-normal break-words leading-tight"
              data-exact="Havi vágy-limit rögzítése, hogy az extra költés ne nőjön tovább."
              onClick={() => {
                setActiveSubTab("ledger");
                if (activeWorkspace === "__all") return toast.error("Válassz egy workspace-t a zároláshoz.");
                const suggested = Math.max(0, Math.round(wantsMonthlyAvg90 * 0.7));
                const limit = suggested > 0 ? suggested : Math.max(0, Math.round(wantsMonthlyAvg90));
                updateWorkspaceMeta(activeWorkspace, { wants_budget_monthly_huf: limit } as any, "WANT budget zárolás");
                toast.success(`ACT: WANT költségkeret zárolva: ${formatMoney(Math.round(limit), CURRENCY)}/hó.`);
              }}
            >
              🔒 Költségkeret zárolása
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-10 w-full whitespace-normal break-words leading-tight"
              data-exact="Projekt átütemezése — új tervezési ciklus, ha az üzleti puffer 90 nap alá esne."
              onClick={() => {
                const risky = (bridge.business ?? []).some((b: any) => {
                  const burn = Number(b.monthlyBurn ?? 0);
                  const free = Number(b.free ?? 0);
                  if (!(burn > 0) || !(free >= 0)) return false;
                  const days = (free / burn) * 30;
                  return days < 90;
                });
                if (risky) {
                  toast.success("ACT: Projekt átütemezés javasolt — a Cash‑Flow híd szerint az üzleti puffer 90 nap alá esne.");
                }
                startNewPlanningCycle();
              }}
            >
              🗓️ Projekt átütemezése
            </Button>
          </div>
        </div>
        </>
        ) : null}

        {surface.showLean || surface.showFinanceModules ? (
        <ActRecommendations
          recommendations={leanRecommendations}
          onExecute={executeLeanRecommendation}
        />
        ) : null}

        <LeanConsultantPanel
          transactions={allTxns}
          workspaces={workspaceMetas as any}
          workspaceId={activeWorkspace === "__all" ? null : activeWorkspace}
          pdcaMode={pdcaMode}
          onApplyAdvice={(advice, plan) => {
            markWsPdca("act");
            if (plan?.id === "tag_manual_auto") {
              toast.success("Lean: Jelöltem a kézi vs banki forrást a listákban (finom, nem tolakodó).");
            } else if (plan?.id === "prefer_import") {
              toast.success("Lean: Import-first mód — a kézi rögzítést innentől inkább finomhangolásra használd.");
            } else if (plan?.id === "other") {
              toast.success(`Lean: Elfogadva — ${advice.title}`);
            } else {
              toast.success(`Lean: ${advice.title}`);
            }
            if (advice.target === "ledger" || advice.target === "bank_import") setActiveSubTab("ledger");
            else if (advice.target === "cashflow") setActiveSubTab("cashflow");
            else if (advice.target === "buckets" || advice.target === "plan") setActiveSubTab("inventory");
          }}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <Button type="button" variant="outline" onClick={promotePlanToDo} title="Projekt élesítése (PLAN→DO)">
            🚀 {t("dash.goLive")}
          </Button>
          <Button type="button" variant="outline" onClick={newImprovementGoal} title="Új fejlesztési cél">
            🎯 {t("dash.newGoal")}
          </Button>
          <Button type="button" variant="outline" onClick={quickSave} title="Gyors mentés (encrypted JSON)">
            💾 {t("chrome.quickSave")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const lockedLeftContent = (() => {
    if (pdcaMode === "PD") return lockedPlanModule;
    if (pdcaMode === "DC") return lockedDoModule;
    if (pdcaMode === "CA") return lockedCheckModule;
    return lockedActModule; // AP
  })();

  const lockedRightContent = (() => {
    if (pdcaMode === "PD") return lockedDoModule;
    if (pdcaMode === "DC") return lockedCheckModule;
    if (pdcaMode === "CA") return lockedActModule;
    return lockedPlanModule; // AP
  })();

  return (
    <div
      data-site-surface="dashboard"
      className="h-screen flex flex-col overflow-hidden bg-background text-foreground"
    >
      <div className="shrink-0">
        <ProfileHeader
          profileId={profileId}
          profileName={visitorCaseTitle ?? profileName}
          profileHint={visitorCaseLead ?? undefined}
          situationLead={visitorCaseLead ?? undefined}
          visitorDemo={isVisitorDemo}
          onAddDevice={isVisitorDemo ? undefined : () => setExportOpen(true)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pdcaMode={pdcaMode}
          onPdcaModeChange={setPdcaMode}
          onRotatePdca={rotatePdcaQuarter}
          bottomRow={
            <WorkspaceTabs
              activeWs={activeWs}
              setActiveWs={setActiveWs}
              middleWs={middleWs}
              setMiddleWs={setMiddleWs}
              wsOptions={wsOptions}
              workspaces={workspaceMetas as any}
              labelFor={workspaceTabLabel}
              colorFor={workspaceColorCls}
              onOpenCreate={() => {
                setWsCreateDenied(false);
                setPdcaNewOpen(true);
              }}
            />
          }
        />
      </div>

      {settings.showKpiQuickBar ? <KpiQuickBar /> : null}

      <ExportQrDialog open={exportOpen} onOpenChange={setExportOpen} />

      <Dialog
        open={pdcaNewOpen}
        onOpenChange={(o) => {
          setPdcaNewOpen(o);
          if (!o) setWsCreateDenied(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Új munkaterület</DialogTitle>
          </DialogHeader>
          {wsCreateDenied ? (
            <p className="text-sm text-slate-200">Ez a funkció a jelenlegi verzióban nem engedélyezett.</p>
          ) : (
            <div className="grid gap-3">
              <div className="text-sm text-muted-foreground">Új Munkaterület Típusa:</div>
              <button
                type="button"
                className="rounded-lg border border-border/60 bg-background/40 p-3 text-left hover:bg-muted/30"
                onClick={denyWorkspaceCreate}
              >
                <div className="text-sm font-medium">🔵 Élő működés (DO)</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Éles működés: vállalkozás / élő folyamat.
                </div>
              </button>
              <button
                type="button"
                className="rounded-lg border border-border/60 bg-background/40 p-3 text-left hover:bg-muted/30"
                onClick={denyWorkspaceCreate}
              >
                <div className="text-sm font-medium">🟡 Tervezés / Szimuláció (PLAN)</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Projekt (alapból Szimuláció mód).
                </div>
              </button>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setPdcaNewOpen(false)}>
              {wsCreateDenied ? "Bezár" : "Mégse"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={autoRuleOpen} onOpenChange={setAutoRuleOpen}>
        <DialogContent className="w-full max-w-3xl max-h-[85vh] overflow-y-auto p-8 custom-scrollbar">
          <DialogHeader>
            <DialogTitle>⚡ Automatikus besorolási szabály létrehozása</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              🎯 Mire jó? A következő importnál/mentésnél a hasonló tételek már automatikusan megkapják a megadott
              kategóriát/partnert.
            </div>
            <div className="grid gap-2">
              <Label>Munkaterület</Label>
              <div className="rounded-md border border-border/60 bg-background/40 px-3 py-2 text-sm">
                {workspaceDisplayName(autoRuleWsId)}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Kulcsszó / minta</Label>
              <Input
                value={autoRuleKeyword}
                onChange={(e) => setAutoRuleKeyword(e.currentTarget.value)}
                placeholder='pl. "Lidl" vagy regex: re:(MOL|SHELL)'
              />
            </div>
            <div className="grid gap-2">
              <Label>Cél kategória</Label>
              <Select value={autoRuleCategory} onValueChange={setAutoRuleCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Válassz kategóriát" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    ...(settings.incomeCategories ?? []),
                    ...(settings.expenseCategories ?? []),
                    ...(((settings as any).savingCategories ?? []) as string[]),
                  ]
                    .filter(Boolean)
                    .slice(0, 250)
                    .map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Partner (opcionális)</Label>
              <Input
                value={autoRulePartner}
                onChange={(e) => setAutoRulePartner(e.currentTarget.value)}
                placeholder="pl. MBH, NAV, Telekom"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setAutoRuleOpen(false)}>
              Mégse
            </Button>
            <Button
              type="button"
              disabled={autoRuleBusy || !autoRuleKeyword.trim() || !autoRuleCategory.trim()}
              onClick={async () => {
                setAutoRuleBusy(true);
                try {
                  await localdb.putCategoryRule({
                    id: newId(),
                    profile_id: profileId,
                    workspace_id: autoRuleWsId,
                    keyword: autoRuleKeyword.trim(),
                    target_category: autoRuleCategory.trim(),
                    target_partner: autoRulePartner.trim() || null,
                    target_type: null,
                    is_active: true,
                  } as any);
                  await qc.invalidateQueries({ queryKey: ["category_rules"] });
                  toast.success("Szabály létrehozva.");
                  setAutoRuleOpen(false);
                } catch (e: any) {
                  toast.error(e?.message || "Szabály mentése sikertelen.");
                } finally {
                  setAutoRuleBusy(false);
                }
              }}
            >
              Mentés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk: Delete confirm */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Biztosan törlöd a kijelölt tételeket?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-slate-300">
            Biztosan törölni szeretnéd a kijelölt <span className="font-mono">{selectedCount}</span> db tételt?
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setBulkDeleteOpen(false)}>
              Mégse
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                const ids = Array.from(selectedTxnIds);
                bulkDeleteTxns.mutate(ids);
                setSelectedTxnIds(new Set());
                setBulkDeleteOpen(false);
              }}
            >
              Törlés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk: Piggy */}
      <Dialog open={bulkPiggyOpen} onOpenChange={setBulkPiggyOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tömeges perselybe helyezés</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="text-sm text-slate-300">
              A kijelöltek közül csak a <span className="font-medium">bevétel</span> és <span className="font-medium">megtakarítás</span>{" "}
              típusú, pozitív tételek kerülnek perselybe. A kiadások automatikusan kimaradnak.
            </div>
            <div className="grid gap-2">
              <Label>Persely / alhalmaz</Label>
              <Select value={bulkBucketId || "__none"} onValueChange={(v) => setBulkBucketId(v === "__none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Általános megtakarítás</SelectItem>
                  {(settings.buckets ?? []).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(() => {
              const eligible = selectedTxns.filter(
                (t) => (t.type === "income" || t.type === "saving") && Number(t.amount) > 0,
              ).length;
              const skipped = selectedCount - eligible;
              return (
                <div className="text-xs text-slate-300">
                  Érintett: <span className="font-mono">{eligible}</span> · Kihagyva:{" "}
                  <span className="font-mono">{Math.max(0, skipped)}</span>
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setBulkPiggyOpen(false)}>
              Mégse
            </Button>
            <Button
              type="button"
              onClick={() => {
                bulkPiggy.mutate({
                  ids: Array.from(selectedTxnIds),
                  bucketId: bulkBucketId.trim() ? bulkBucketId.trim() : null,
                });
                setSelectedTxnIds(new Set());
                setBulkPiggyOpen(false);
              }}
            >
              Alkalmaz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk: Copy to project */}
      <Dialog open={bulkCopyOpen} onOpenChange={setBulkCopyOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Másolás projektbe (értékmásolás)</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="text-sm text-slate-300">
              Ez <span className="font-medium">nem áthelyezés</span>, hanem másolat: az eredeti tételek megmaradnak.
            </div>
            <div className="grid gap-2">
              <Label>Projekt munkaterület</Label>
              <Select value={bulkProjectId || "__none"} onValueChange={(v) => setBulkProjectId(v === "__none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">—</SelectItem>
                  {workspaceMetas
                    .filter((w) => w.type === "project")
                    .map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {workspaceDisplayName(w.id)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setBulkCopyOpen(false)}>
              Mégse
            </Button>
            <Button
              type="button"
              disabled={!bulkProjectId.trim()}
              onClick={() => {
                bulkCopyToProject.mutate({ ids: Array.from(selectedTxnIds), projectWs: bulkProjectId.trim() });
                setSelectedTxnIds(new Set());
                setBulkCopyOpen(false);
              }}
            >
              Másolás
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={locationTcoOpen}
        onOpenChange={(o) => {
          setLocationTcoOpen(o);
          if (!o) setSelectedLocationId(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Telephely összesítő{selectedLocation ? ` — ${selectedLocation.name}` : ""}
            </DialogTitle>
          </DialogHeader>

          {!selectedLocation ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Nincs kiválasztott telephely.</div>
          ) : (
            <>
              <div className="mb-3 grid gap-3 sm:grid-cols-4">
                <StatCard label="Összes ráfordítás" value={formatMoney(Math.round(locationTotals.totalGross), CURRENCY)} />
                <StatCard label="CAPEX" value={formatMoney(Math.round(locationTotals.capexGross), CURRENCY)} />
                <StatCard label="Karbantartás" value={formatMoney(Math.round(locationTotals.maintGross), CURRENCY)} />
                <StatCard label="OPEX" value={formatMoney(Math.round(locationTotals.opexGross), CURRENCY)} />
              </div>
              <div className="overflow-x-auto whitespace-nowrap rounded-md border">
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground">
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Dátum</th>
                      <th className="py-2 text-left font-medium">Megnevezés</th>
                      <th className="py-2 text-left font-medium">Típus</th>
                      <th className="py-2 text-right font-medium">Bruttó (bank)</th>
                      <th className="py-2 text-right font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {locationTxns.slice(0, 80).map((t) => (
                      <tr key={t.id} className="border-b last:border-b-0">
                        <td className="py-2 font-mono">{new Date(t.occurred_at).toISOString().slice(0, 10)}</td>
                        <td className="py-2">
                          <div className="font-medium">
                            {displayTxnLabel(t)}
                          </div>
                          <div className="text-muted-foreground">{categoryLabel(t.category)}</div>
                        </td>
                        <td className="py-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {t.cost_kind === "capex"
                              ? "CAPEX"
                              : t.cost_kind === "maintenance"
                                ? "Karb."
                                : "OPEX"}
                          </Badge>
                        </td>
                        <td className="py-2 text-right tabular-nums font-semibold">
                          {formatMoney(Math.round(txnGrossHuf(t)), CURRENCY)}
                        </td>
                        <td className="py-2 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (denyShowcaseWrite(isVisitorDemo)) return;
                              beginEditTxn(t);
                            }}
                            aria-label="Szerkesztés"
                            title="Tétel szerkesztése"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {locationTxns.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          Nincs tétel ehhez a telephelyhez.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setLocationTcoOpen(false)}>
              Bezár
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={assetTcoOpen}
        onOpenChange={(o) => {
          setAssetTcoOpen(o);
          if (!o) setSelectedAssetId(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Eszköz összesítő{selectedAsset ? ` — ${selectedAsset.name}` : ""}
            </DialogTitle>
          </DialogHeader>

          {!selectedAsset ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Nincs kiválasztott eszköz.</div>
          ) : (
            <>
              <div className="mb-2 text-xs text-muted-foreground">
                Hely: <span className="text-foreground">{locationName(selectedAsset.location_id) ?? "—"}</span>
                {" · "}Projekt: <span className="text-foreground">{projectName(selectedAsset.project_id) ?? "—"}</span>
              </div>
              <div className="mb-3 grid gap-3 sm:grid-cols-4">
                <StatCard label="Összes ráfordítás" value={formatMoney(Math.round(assetTotals.totalGross), CURRENCY)} />
                <StatCard label="CAPEX" value={formatMoney(Math.round(assetTotals.capexGross), CURRENCY)} />
                <StatCard label="Karbantartás" value={formatMoney(Math.round(assetTotals.maintGross), CURRENCY)} />
                <StatCard label="OPEX" value={formatMoney(Math.round(assetTotals.opexGross), CURRENCY)} />
              </div>
              <div className="overflow-x-auto whitespace-nowrap rounded-md border">
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground">
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Dátum</th>
                      <th className="py-2 text-left font-medium">Megnevezés</th>
                      <th className="py-2 text-left font-medium">Típus</th>
                      <th className="py-2 text-right font-medium">Bruttó (bank)</th>
                      <th className="py-2 text-right font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {assetTxns.slice(0, 80).map((t) => (
                      <tr key={t.id} className="border-b last:border-b-0">
                        <td className="py-2 font-mono">{new Date(t.occurred_at).toISOString().slice(0, 10)}</td>
                        <td className="py-2">
                          <div className="font-medium">
                            {displayTxnLabel(t)}
                          </div>
                          <div className="text-muted-foreground">{categoryLabel(t.category)}</div>
                        </td>
                        <td className="py-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {t.cost_kind === "capex"
                              ? "CAPEX"
                              : t.cost_kind === "maintenance"
                                ? "Karb."
                                : "OPEX"}
                          </Badge>
                        </td>
                        <td className="py-2 text-right tabular-nums font-semibold">
                          {formatMoney(Math.round(txnGrossHuf(t)), CURRENCY)}
                        </td>
                        <td className="py-2 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (denyShowcaseWrite(isVisitorDemo)) return;
                              beginEditTxn(t);
                            }}
                            aria-label="Szerkesztés"
                            title="Tétel szerkesztése"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {assetTxns.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          Nincs tétel ehhez az eszközhöz.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssetTcoOpen(false)}>
              Bezár
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={projectsOpen} onOpenChange={setProjectsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Projektek beállítása</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Új projekt</Label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input
                  placeholder="pl. Ügyfél A / Telephely 2 fejlesztés"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  maxLength={60}
                />
                <Button
                  type="button"
                  onClick={() => {
                    const nm = newProjectName.trim();
                    if (!nm) return;
                    const p: BusinessProject = { id: newId(), name: nm };
                    commitSettings(
                      { ...settings, projects: [...projects, p] },
                      "Projekt hozzáadása",
                    );
                    setNewProjectName("");
                  }}
                  disabled={!newProjectName.trim()}
                >
                  Hozzáad
                </Button>
              </div>
            </div>

            <div className="rounded-md border bg-background/40">
              <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
                Meglévő projektek
              </div>
              <div className="max-h-[45vh] overflow-y-auto p-2">
                {projects.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    Még nincs projekt.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projects.map((p) => {
                      const isEditing = projEditingId === p.id;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            {isEditing ? (
                              <Input
                                value={projEditingName}
                                onChange={(e) => setProjEditingName(e.target.value)}
                                className="h-8"
                                maxLength={60}
                                autoFocus
                              />
                            ) : (
                              <div className="truncate text-sm font-medium">{p.name}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => {
                                    const nm = projEditingName.trim();
                                    if (!nm) return;
                                    commitSettings(
                                      {
                                        ...settings,
                                        projects: projects.map((x) =>
                                          x.id === p.id ? { ...x, name: nm } : x,
                                        ),
                                      },
                                      "Projekt átnevezése",
                                    );
                                    setProjEditingId(null);
                                    setProjEditingName("");
                                  }}
                                  disabled={!projEditingName.trim()}
                                >
                                  Mentés
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-8"
                                  onClick={() => {
                                    setProjEditingId(null);
                                    setProjEditingName("");
                                  }}
                                >
                                  Mégse
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => {
                                    setProjEditingId(p.id);
                                    setProjEditingName(p.name);
                                  }}
                                >
                                  Átnevez
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    commitSettings(
                                      {
                                        ...settings,
                                        projects: projects.filter((x) => x.id !== p.id),
                                      },
                                      "Projekt törlése",
                                    );
                                  }}
                                >
                                  Törlés
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setProjectsOpen(false)}>
              Bezár
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assetsOpen} onOpenChange={setAssetsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leltári eszközök beállítása</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Új eszköz</Label>
              <div className="grid grid-cols-[1fr_10rem_10rem_auto] gap-2">
                <Input
                  placeholder="pl. Nyomtató, Laptop, Raktári polc"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  maxLength={60}
                />
                <Select
                  value={newAssetLocationId || "__none"}
                  onValueChange={(v) => setNewAssetLocationId(v === "__none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hely" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Hely: —</SelectItem>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={newAssetProjectId || "__none"}
                  onValueChange={(v) => setNewAssetProjectId(v === "__none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Projekt: —</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => {
                    const nm = newAssetName.trim();
                    if (!nm) return;
                    const a: BusinessAsset = {
                      id: newId(),
                      name: nm,
                      location_id: newAssetLocationId.trim() || null,
                      project_id: newAssetProjectId.trim() || null,
                      created_at: new Date().toISOString(),
                    };
                    commitSettings(
                      { ...settings, assets: [...assets, a] },
                      "Eszköz hozzáadása",
                    );
                    setNewAssetName("");
                    setNewAssetLocationId("");
                    setNewAssetProjectId("");
                  }}
                  disabled={!newAssetName.trim()}
                >
                  Hozzáad
                </Button>
              </div>
            </div>

            <div className="rounded-md border bg-background/40">
              <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
                Meglévő eszközök
              </div>
              <div className="max-h-[45vh] overflow-y-auto p-2">
                {assets.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    Még nincs eszköz.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assets.map((a) => {
                      const isEditing = assetEditingId === a.id;
                      return (
                        <div
                          key={a.id}
                          className="rounded-md border bg-background px-3 py-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              {isEditing ? (
                                <Input
                                  value={assetEditingName}
                                  onChange={(e) => setAssetEditingName(e.target.value)}
                                  className="h-8"
                                  maxLength={60}
                                  autoFocus
                                />
                              ) : (
                                <div className="truncate text-sm font-medium">{a.name}</div>
                              )}
                              <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                                <span>Hely: {locationName(a.location_id) ?? "—"}</span>
                                <span>Projekt: {projectName(a.project_id) ?? "—"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="h-8"
                                    onClick={() => {
                                      const nm = assetEditingName.trim();
                                      if (!nm) return;
                                      commitSettings(
                                        {
                                          ...settings,
                                          assets: assets.map((x) =>
                                            x.id === a.id
                                              ? {
                                                  ...x,
                                                  name: nm,
                                                  location_id:
                                                    assetEditingLocationId.trim() || null,
                                                  project_id:
                                                    assetEditingProjectId.trim() || null,
                                                }
                                              : x,
                                          ),
                                        },
                                        "Eszköz mentése",
                                      );
                                      setAssetEditingId(null);
                                      setAssetEditingName("");
                                      setAssetEditingLocationId("");
                                      setAssetEditingProjectId("");
                                    }}
                                    disabled={!assetEditingName.trim()}
                                  >
                                    Mentés
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-8"
                                    onClick={() => {
                                      setAssetEditingId(null);
                                      setAssetEditingName("");
                                      setAssetEditingLocationId("");
                                      setAssetEditingProjectId("");
                                    }}
                                  >
                                    Mégse
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8"
                                    onClick={() => {
                                      setAssetEditingId(a.id);
                                      setAssetEditingName(a.name);
                                      setAssetEditingLocationId(a.location_id ?? "");
                                      setAssetEditingProjectId(a.project_id ?? "");
                                    }}
                                  >
                                    Szerkeszt
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                      commitSettings(
                                        {
                                          ...settings,
                                          assets: assets.filter((x) => x.id !== a.id),
                                        },
                                        "Eszköz törlése",
                                      );
                                    }}
                                  >
                                    Törlés
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          {isEditing && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <Select
                                value={assetEditingLocationId || "__none"}
                                onValueChange={(v) =>
                                  setAssetEditingLocationId(v === "__none" ? "" : v)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Hely" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none">Hely: —</SelectItem>
                                  {locations.map((l) => (
                                    <SelectItem key={l.id} value={l.id}>
                                      {l.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={assetEditingProjectId || "__none"}
                                onValueChange={(v) =>
                                  setAssetEditingProjectId(v === "__none" ? "" : v)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Projekt" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none">Projekt: —</SelectItem>
                                  {projects.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssetsOpen(false)}>
              Bezár
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={locationsOpen} onOpenChange={setLocationsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Telephelyek / raktárak beállítása</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Új hely hozzáadása</Label>
              <div className="grid grid-cols-[1fr_10rem_auto] gap-2">
                <Input
                  placeholder="pl. Székhely, Telephely 1, Raktár"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  maxLength={60}
                />
                <Select
                  value={newLocKind}
                  onValueChange={(v) => setNewLocKind(v as BusinessLocation["kind"])}
                >
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
                <Button
                  type="button"
                  onClick={() => {
                    const nm = newLocName.trim();
                    if (!nm) return;
                    const loc: BusinessLocation = { id: newId(), name: nm, kind: newLocKind };
                    commitSettings(
                      { ...settings, locations: [...locations, loc] },
                      "Hely hozzáadása",
                    );
                    setNewLocName("");
                    setNewLocKind("telephely");
                  }}
                  disabled={!newLocName.trim()}
                >
                  Hozzáad
                </Button>
              </div>
            </div>

            <div className="rounded-md border bg-background/40">
              <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
                Meglévő helyek
              </div>
              <div className="max-h-[45vh] overflow-y-auto p-2">
                {locations.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    Még nincs felvett telephely/raktár.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {locations.map((l) => {
                      const isEditing = locEditingId === l.id;
                      return (
                        <div
                          key={l.id}
                          className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px]">
                                {l.kind === "szekhely"
                                  ? "székhely"
                                  : l.kind === "telephely"
                                    ? "telephely"
                                    : l.kind === "raktar"
                                      ? "raktár"
                                      : "egyéb"}
                              </Badge>
                              {isEditing ? (
                                <Input
                                  value={locEditingName}
                                  onChange={(e) => setLocEditingName(e.target.value)}
                                  className="h-8"
                                  maxLength={60}
                                  autoFocus
                                />
                              ) : (
                                <span className="truncate text-sm font-medium">{l.name}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => {
                                    const nm = locEditingName.trim();
                                    if (!nm) return;
                                    commitSettings(
                                      {
                                        ...settings,
                                        locations: locations.map((x) =>
                                          x.id === l.id ? { ...x, name: nm } : x,
                                        ),
                                      },
                                      "Hely átnevezése",
                                    );
                                    setLocEditingId(null);
                                    setLocEditingName("");
                                  }}
                                  disabled={!locEditingName.trim()}
                                >
                                  Mentés
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-8"
                                  onClick={() => {
                                    setLocEditingId(null);
                                    setLocEditingName("");
                                  }}
                                >
                                  Mégse
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => {
                                    setLocEditingId(l.id);
                                    setLocEditingName(l.name);
                                  }}
                                >
                                  Átnevez
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    commitSettings(
                                      {
                                        ...settings,
                                        locations: locations.filter((x) => x.id !== l.id),
                                      },
                                      "Hely törlése",
                                    );
                                  }}
                                >
                                  Törlés
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setLocationsOpen(false)}>
              Bezár
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createWsOpen}
        onOpenChange={(o) => {
          setCreateWsOpen(o);
          if (!o) {
            setCreateWsType(null);
            setCreateWsName("");
            setCreateProjectMode(null);
            setCreatePilotBusinessId("");
            setWsCreateDenied(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Új munkaterület</DialogTitle>
          </DialogHeader>

          {wsCreateDenied ? (
            <p className="text-sm text-slate-200">Ez a funkció a jelenlegi verzióban nem engedélyezett.</p>
          ) : createWsType === null ? (
            <div className="grid gap-3">
              <button
                type="button"
                className="rounded-lg border border-border/60 bg-background/40 p-3 text-left hover:bg-muted/30"
                onClick={denyWorkspaceCreate}
              >
                <div className="text-sm font-medium">💼 Új Vállalkozás</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Éles üzletmenet, tényleges pénzforgalom és ÁFA-kör.
                </div>
              </button>
              <button
                type="button"
                className="rounded-lg border border-border/60 bg-background/40 p-3 text-left hover:bg-muted/30"
                onClick={denyWorkspaceCreate}
              >
                <div className="text-sm font-medium">🧪 Új Projekt</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Szimuláció / tervezés (forgatókönyvek, készültség).
                </div>
              </button>
              <button
                type="button"
                className="rounded-lg border border-border/60 bg-background/40 p-3 text-left hover:bg-muted/30"
                onClick={denyWorkspaceCreate}
              >
                <div className="text-sm font-medium">💳 Új Magán számla / Kassza</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Személyes alszámla / keret.</div>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="ws-name">Név</Label>
                <Input
                  id="ws-name"
                  value={createWsName}
                  onChange={(e) => setCreateWsName(e.target.value)}
                  placeholder={createWsType === "project" ? "pl. Kutatás 2026" : createWsType === "business" ? "pl. Vállalkozás3" : "pl. Zsebpénz"}
                  autoFocus
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Típus:{" "}
                <span className="font-medium">
                  {createWsType === "business" ? "Vállalkozás" : createWsType === "project" ? "Projekt" : "Magán"}
                </span>
              </div>

              {createWsType === "project" && (
                <div className="space-y-2">
                  <Label>Projekt mód</Label>
                  <div className="grid gap-2">
                    <button
                      type="button"
                      className={cn(
                        "rounded-lg border p-3 text-left",
                        createProjectMode === "simulation"
                          ? "border-amber-500/40 bg-amber-500/5"
                          : "border-border/60 bg-background/40 hover:bg-muted/30",
                      )}
                      onClick={() => setCreateProjectMode("simulation")}
                    >
                      <div className="text-sm font-medium">🧪 Szimuláció / Ötlet</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Fiktív költségek/bevételek, tervezés (alapértelmezett tétel státusz: tervezett).
                      </div>
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "rounded-lg border p-3 text-left",
                        createProjectMode === "pilot"
                          ? "border-sky-500/40 bg-sky-500/5"
                          : "border-border/60 bg-background/40 hover:bg-muted/30",
                      )}
                      onClick={() => setCreateProjectMode("pilot")}
                    >
                      <div className="text-sm font-medium">🚀 Pilot Projekt</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Meglévő Vállalkozás ernyője alatt futó élő tesztprojekt.
                      </div>
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "rounded-lg border p-3 text-left",
                        createProjectMode === "prep"
                          ? "border-violet-500/40 bg-violet-500/5"
                          : "border-border/60 bg-background/40 hover:bg-muted/30",
                      )}
                      onClick={() => setCreateProjectMode("prep")}
                    >
                      <div className="text-sm font-medium">📐 Független Előkészítés</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Önálló indításra váró projekt (nem csatolt).
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {createWsType === "project" && createProjectMode === "pilot" && (
                <div className="space-y-2">
                  <Label>Ernyő Vállalkozás</Label>
                  <Select
                    value={createPilotBusinessId || "__none"}
                    onValueChange={(v) => setCreatePilotBusinessId(v === "__none" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">—</SelectItem>
                      {workspaceMetas.filter((w) => w.type === "business").map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {workspaceDisplayName(b.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {createWsType !== null ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCreateWsType(null);
                  setCreateWsName("");
                  setCreateProjectMode(null);
                  setCreatePilotBusinessId("");
                }}
              >
                Vissza
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={() => setCreateWsOpen(false)}>
                Mégsem
              </Button>
            )}
            {createWsType !== null && (
              <Button
                type="button"
                onClick={() => {
                  denyWorkspaceCreate();
                  setCreateWsOpen(false);
                }}
              >
                Létrehoz
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <main className="app-shell-main">
        <div className="workspace-canvas">
          <div
            className={cn(
              "w-full space-y-2 px-2 py-1.5 sm:px-3 md:px-4",
              viewMode === "full" ? "max-w-none" : "mx-auto max-w-[98%]",
            )}
          >
        {loading ? (
          <p className="text-sm text-muted-foreground">Dekódolás…</p>
        ) : lockPdcaView ? (
          <div className="grid gap-2 md:gap-3">
          <WorkspacePanels
            activeWs={activeWs}
            setActiveWs={setActiveWs}
            middleWs={middleWs}
            setMiddleWs={setMiddleWs}
            wsOptions={wsOptions}
            workspaces={workspaceMetas as any}
            labelFor={workspaceTabLabel}
            colorFor={workspaceColorCls}
            pdcaMode={pdcaMode}
            setPdcaMode={setPdcaMode}
            activeWorkspaceId={activeWorkspace}
            viewMode={viewMode}
            checkNotes={String((activeWorkspaceMeta as any)?.check_notes ?? "")}
            onSaveCheckNotes={(next) => {
              if (!activeWorkspaceMeta || activeWorkspace === "__all") return;
              updateWorkspaceMeta(
                activeWorkspace,
                {
                  check_notes: next || null,
                  ...(applyPdcaMilestone(activeWorkspaceMeta as any, "check") ?? {}),
                },
                "PDCA check_notes",
              );
            }}
            checkSummary={checkSummary}
            resourceEfficiency={resourceEfficiency}
            realEstatePanel={realEstatePanel}
            onPromotePlanToDo={promotePlanToDo}
            onStartNewPlanningCycle={startNewPlanningCycle}
            onNewImprovementGoal={newImprovementGoal}
            useMasterGrid
            phaseExactFor={(phase) => pdcaPhaseExact(phase, surface, demoSegmentId)}
            leftContent={lockedLeftContent}
            rightContent={lockedRightContent}
          />
          {activeWorkspace === "__all" ? (
            <div className={cn("w-full px-2 pb-6 sm:px-4", viewMode === "full" ? "max-w-none" : "mx-auto max-w-[98%]")}>
              <DataLineage
                report={consistencyReport}
                workspaces={workspaceMetas as any}
                transactions={allTxns}
                loans={loans}
                workspaceLabel={workspaceDisplayName}
                onOpenSettings={(ids) => {
                  const highlightIds = ids?.length
                    ? ids
                    : consistencyReport.issues.map((i) => i.entityId);
                  const hasLoan = consistencyReport.issues.some((i) => i.entityType === "loan");
                  jumpToReferences(hasLoan ? "debts" : "bank", highlightIds, "__all");
                }}
                onDetachTransaction={async (txnId) => {
                  const t = allTxns.find((x) => x.id === txnId);
                  if (!t) return;
                  if (t.project_id) {
                    await patchTxnWorkspace(txnId, { project_id: null }, "Projekt-vonatkoztatás törölve");
                  } else if (t.bank_raw_id) {
                    await patchTxnWorkspace(txnId, { bank_raw_id: null }, "Banki vonatkoztatás törölve");
                  } else {
                    await patchTxnWorkspace(txnId, { workspace: "personal" }, "Munkaterület-kötés personal-re állítva");
                  }
                }}
                onMoveTransaction={async (txnId, toWorkspace) => {
                  await patchTxnWorkspace(
                    txnId,
                    { workspace: toWorkspace, project_id: null },
                    `Áthelyezve: ${workspaceDisplayName(toWorkspace)}`,
                  );
                }}
              />
            </div>
          ) : null}
          </div>
        ) : (
          <>
            {workspaceKind === "project" && activeWorkspace !== "__all" && activeWorkspaceMeta && (
              <Card
                className={cn(
                  "w-full",
                  activeWorkspaceMeta.project_mode === "simulation"
                    ? "border-2 border-dashed border-amber-500/40 bg-amber-500/5"
                    : activeWorkspaceMeta.project_mode === "pilot"
                      ? "border border-emerald-500/25 bg-emerald-500/5"
                      : "border border-violet-500/25 bg-violet-500/5",
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="flex items-center text-sm font-medium">
                        {activeWorkspaceMeta.project_mode === "simulation"
                          ? "🧪 SZIMULÁCIÓ MÓD"
                          : activeWorkspaceMeta.project_mode === "pilot"
                            ? `🚀 PILOT PROJEKT — ERNYŐ: ${workspaceDisplayName(activeWorkspaceMeta.parent_business_id ?? "") || "—"}`
                            : "📐 FÜGGETLEN ELŐKÉSZÍTÉS"}
                        <HelpIcon kbId="project-badges" />
                      </CardTitle>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Készültség: <span className="font-mono">{Math.round(Number(activeWorkspaceMeta.completion_pct ?? 25))}%</span>
                        {" · "}
                        Forgatókönyv: <span className="font-mono">{String(activeWorkspaceMeta.scenario ?? "realistic")}</span>
                        {" · "}
                        Tételek státusz: tervezett / lekötött / tényleges
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={String(activeWorkspaceMeta.scenario ?? "realistic")}
                        onValueChange={(v) =>
                          updateWorkspaceMeta(activeWorkspace, { scenario: v }, "Projekt forgatókönyv")
                        }
                      >
                        <SelectTrigger className="h-9 w-[160px]" title="Forgatókönyv">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">Konzervatív</SelectItem>
                          <SelectItem value="realistic">Reális</SelectItem>
                          <SelectItem value="optimistic">Optimista</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9"
                        onClick={() => {
                          if (denyShowcaseWrite(isVisitorDemo)) return;
                          setQuickAddType("expense");
                        }}
                        title="+ Új tétel"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Új tétel
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-md border border-border/60 bg-background/40 p-3">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        Készültségi állapot
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={Math.round(Number(activeWorkspaceMeta.completion_pct ?? 25))}
                          onChange={(e) =>
                            updateWorkspaceMeta(activeWorkspace, { completion_pct: Number(e.currentTarget.value) }, "Projekt készültség")
                          }
                          className="w-full"
                        />
                        <span className="w-12 text-right font-mono text-xs text-muted-foreground">
                          {Math.round(Number(activeWorkspaceMeta.completion_pct ?? 25))}%
                        </span>
                      </div>
                    </div>
                    <div className="rounded-md border border-border/60 bg-background/40 p-3">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        KPI bontás (projekt)
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        A KPI-k a tényleges tételeket külön kezelik a tervezettől (státusz alapján).
                      </div>
                    </div>
                    <div className="rounded-md border border-border/60 bg-background/40 p-3">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        Pilot megjegyzés
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Pilot módban a tételek (ha csatolt) a vállalkozás P&L/ÁFA számításaiba is beszámíthatnak.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {financeVisible &&
              pdcaMode !== "PD" &&
              pdcaMode !== "AP" &&
              activeWorkspace === "__all" &&
              sumMetrics &&
              activeSubTab === "cashflow" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Szumma — összesítő
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px]" title="Belső átvezetések kiejtve a grafikonokból">
                    elimination
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Card className="border-l-4 border-l-[color:var(--color-chart-2)]">
                      <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-wide text-foreground/80">
                          Összesített likviditás (bruttó készpénzpozíció)
                        </p>
                        <p className="mt-1 text-xl font-bold tabular-nums text-white">
                          {formatMoney(Math.round(sumMetrics.liquidity), CURRENCY)}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Magán + Céges (bruttó) − Zárolt ÁFA − Perselyek
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-[color:var(--color-chart-1)]">
                      <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-wide text-foreground/80">
                          Céges tiszta eredmény (nettó)
                        </p>
                        <p className="mt-1 text-xl font-bold tabular-nums text-white">
                          {formatMoney(Math.round(sumMetrics.businessResultNet), CURRENCY)}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Üzleti bevétel nettó − üzleti kiadás nettó (tagi tételek kizárva)
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-[color:var(--color-chart-6)]">
                      <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-wide text-foreground/80">
                          Magán kassza (bruttó)
                        </p>
                        <p className="mt-1 text-xl font-semibold tabular-nums text-[color:var(--color-chart-6)]">
                          {formatMoney(Math.round(sumMetrics.personalBankGross), CURRENCY)}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          ÁFA bontás nélkül (csak bruttó)
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    Időszak (ÁFA zárolás):{" "}
                    <span className="font-mono text-foreground">
                      {sumMetrics.period.start.toISOString().slice(0, 10)} –{" "}
                      {new Date(sumMetrics.period.end.getTime() - 1).toISOString().slice(0, 10)}
                    </span>{" "}
                    · Zárolt ÁFA:{" "}
                    <span className="font-mono text-foreground">
                      {formatMoney(Math.round(sumMetrics.lockedVat), CURRENCY)}
                    </span>{" "}
                    · Perselyek:{" "}
                    <span className="font-mono text-foreground">
                      {formatMoney(Math.round(sumMetrics.piggies), CURRENCY)}
                    </span>
                  </p>
                </CardContent>
              </Card>
            )}
            {financeVisible &&
              pdcaMode !== "PD" &&
              pdcaMode !== "AP" &&
              businessMode &&
              activeWorkspace !== "__all" &&
              activeSubTab === "cashflow" && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center">
                      <CardTitle className="truncate text-sm font-medium text-muted-foreground">
                        Cashflow (havi összesítés) — {workspaceDisplayName(activeWorkspace)}
                      </CardTitle>
                      <HelpIcon kbId="cashflow-savings" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant={leanView ? "secondary" : "outline"}
                        size="sm"
                        className="h-9"
                        onClick={() => setLeanView((v) => !v)}
                        title="☯️ Lean nézet be/ki"
                      >
                        ☯️ Lean Nézet: {leanView ? "BE" : "KI"}
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="h-9" title="Nézet: táblázat" disabled>
                        táblázat
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={() =>
                          navigate({
                            to: "/report",
                            search: { profile: profileId, workspace: activeWorkspace },
                          })
                        }
                        title="Vezetői riport (nyomtatás/PDF)"
                      >
                        📊 Riport
                      </Button>
                      {isVisitorDemo ? null : activeWorkspaceMeta?.type === "personal" ? (
                        <>
                          <input
                            ref={bankXmlFileRef}
                            type="file"
                            accept=".xml,text/xml,application/xml,.csv,text/csv"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.currentTarget.files?.[0] ?? null;
                              if (!f) return;
                              void (async () => {
                                if (!f.name.toLowerCase().endsWith(".xml")) {
                                  toast.warning("Nem megfelelő formátum (Magán)", {
                                    description: "Támogatott: Banki XML / SpreadsheetML (.xml)",
                                  });
                                  return;
                                }
                                const text = await f.text();
                                await onBankPersonalXmlText({ fileName: f.name, text, fileSize: f.size });
                              })();
                            }}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-9 gap-2"
                            onClick={() => void syncPersonalBankFromLatestFileInFolder()}
                            title="Magán: szinkron a kiválasztott mappa legfrissebb XML kivonatából"
                          >
                            <Folder className="h-4 w-4" />
                            Magán szinkron (legfrissebb)
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 gap-2"
                            onClick={() => bankXmlFileRef.current?.click()}
                            title="Magán: XML kivonat kiválasztása"
                          >
                            <Upload className="h-4 w-4" />
                            XML (SpreadsheetML)
                          </Button>
                        </>
                      ) : (
                        <>
                          <input
                            ref={bankFileRef}
                            type="file"
                            accept=".csv,text/csv"
                            className="hidden"
                            onChange={(e) => onBankCsvFile(e.currentTarget.files?.[0] ?? null)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "h-9 gap-2",
                              bankImportNudge && "ring-2 ring-amber-400/70 ring-offset-2 ring-offset-background animate-pulse",
                            )}
                            onClick={() => {
                              if (denyShowcaseWrite(isVisitorDemo)) return;
                              bankFileRef.current?.click();
                            }}
                            title={
                              activeWorkspaceMeta?.bank_sync_folder
                                ? `Banki szinkron (mappa: ${activeWorkspaceMeta.bank_sync_folder})`
                                : "Banki szinkron (fájl kiválasztása)"
                            }
                          >
                            <Upload className="h-4 w-4" />
                            Banki szinkron
                          </Button>
                        </>
                      )}
                      <HelpIcon kbId="bank-sync-dedup" />
                      {bankImportStatus ? (
                        <span className="max-w-[320px] truncate text-xs text-slate-300" title={bankImportStatus}>
                          {bankImportStatus}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {vatReserve && (
                    <>
                      {(() => {
                        const payable = Math.max(0, vatLedger?.netPosition ?? vatReserve.payable);
                        return (
                          <>
                            <div className="mt-4 mb-3 grid gap-4 md:grid-cols-2">
                              <Card className="border-[color:var(--color-chart-2)]/30 bg-[color:var(--color-chart-2)]/10 border-l-4 border-l-[color:var(--color-chart-2)]">
                                <CardContent className="p-5">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs uppercase tracking-wide text-foreground/80">
                                      Szabad nettó egyenleg (elkölthető keret)
                                    </p>
                                    <HelpIcon kbId="cashflow-savings" />
                                  </div>
                                  <p className="mt-1 text-2xl font-semibold tabular-nums text-[color:var(--color-chart-2)]">
                                    {formatMoney(Math.round(vatReserve.free), CURRENCY)}
                                  </p>
                                  <p className="mt-1 text-[11px] text-foreground/70">
                                    Ez az az összeg, ami a persely + ÁFA tartalék levonása után ténylegesen elkölthető.
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="border-[color:var(--color-chart-3)]/30 bg-[color:var(--color-chart-3)]/10 border-l-4 border-l-[color:var(--color-chart-3)]">
                                <CardContent className="p-5">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs uppercase tracking-wide text-foreground/80">
                                      Befizetésre váró ÁFA tartalék
                                    </p>
                                    <HelpIcon kbId="cashflow-savings" />
                                  </div>
                                  <p className="mt-1 text-2xl font-semibold tabular-nums text-[color:var(--color-chart-3)]">
                                    {formatMoney(Math.round(payable), CURRENCY)}
                                  </p>
                                  <p className="mt-1 text-[11px] text-foreground/70">
                                    Banki egyenleg része, de kötelezettség miatt “zárolt”.
                                  </p>
                                </CardContent>
                              </Card>
                            </div>

                            <div className="mb-4 grid gap-4 sm:grid-cols-2">
                              <StatCard
                                label={
                                  <span className="inline-flex items-center gap-2">
                                    Banki bruttó egyenleg <HelpIcon kbId="cashflow-savings" />
                                  </span>
                                }
                                value={formatMoney(Math.round(vatReserve.balance), CURRENCY)}
                              />
                              <StatCard
                                label={
                                  <span className="inline-flex items-center gap-2">
                                    Persely tartalék <HelpIcon kbId="piggy-expense-disabled" />
                                  </span>
                                }
                                value={formatMoney(Math.round(vatReserve.reserved ?? 0), CURRENCY)}
                              />
                            </div>

                            <p className="mb-4 text-xs text-muted-foreground">
                              Időszak:{" "}
                              <span className="font-mono text-foreground">
                                {vatReserve.start.toISOString().slice(0, 10)} –{" "}
                                {new Date(vatReserve.end.getTime() - 1).toISOString().slice(0, 10)}
                              </span>
                              {vatLedger && (
                                <>
                                  {" · "}Kimenő:{" "}
                                  <span className="font-mono text-foreground">
                                    {formatMoney(Math.round(vatLedger.outputVat), CURRENCY)}
                                  </span>
                                  {" · "}Levonható:{" "}
                                  <span className="font-mono text-foreground">
                                    {formatMoney(Math.round(vatLedger.deductibleVat), CURRENCY)}
                                  </span>
                                </>
                              )}
                              {vatReserve.reviewCount > 0 && (
                                <>
                                  {" · "}
                                  <span className="rounded bg-muted px-1.5 py-0.5">
                                    ellenőrzendő: {vatReserve.reviewCount}
                                  </span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="ml-2 h-7 px-2 text-[11px]"
                                    onClick={() => setVatReviewOpen(true)}
                                  >
                                    ÁFA felülvizsgálat
                                  </Button>
                                </>
                              )}
                            </p>
                          </>
                        );
                      })()}
                    </>
                  )}

                  {runway && (
                    <div className="mb-4 rounded-lg border bg-background/40 p-3">
                      <div className="flex flex-wrap items-end justify-between gap-2">
                        <div>
                          <div
                            className="flex items-center gap-2 text-sm font-semibold"
                            data-exact="hány hónapig tart a kassza a mostani költési ütemmel."
                          >
                            Céltartalék lefedettség
                            <HelpIcon kbId="loans-liabilities" />
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Elérhető keret:{" "}
                            <span className="font-mono text-foreground">
                              {formatMoney(Math.round(runway.available), CURRENCY)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-md border bg-background/30 p-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Következő 30 nap fix kiadás</span>
                            <span className="font-mono text-foreground">
                              {formatMoney(Math.round(runway.fixed30), CURRENCY)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={Math.round(runway.cov30.pct * 100)} />
                            <span className="w-12 text-right text-xs font-mono">
                              {Math.round(runway.cov30.pct * 100)}%
                            </span>
                          </div>
                          {runway.cov30.missing > 0 && (
                            <div className="mt-1 text-[11px] text-muted-foreground">
                              Hiányzik:{" "}
                              <span className="font-mono text-foreground">
                                {formatMoney(Math.round(runway.cov30.missing), CURRENCY)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="rounded-md border bg-background/30 p-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Következő 60 nap fix kiadás</span>
                            <span className="font-mono text-foreground">
                              {formatMoney(Math.round(runway.fixed60), CURRENCY)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={Math.round(runway.cov60.pct * 100)} />
                            <span className="w-12 text-right text-xs font-mono">
                              {Math.round(runway.cov60.pct * 100)}%
                            </span>
                          </div>
                          {runway.cov60.missing > 0 && (
                            <div className="mt-1 text-[11px] text-muted-foreground">
                              Hiányzik:{" "}
                              <span className="font-mono text-foreground">
                                {formatMoney(Math.round(runway.cov60.missing), CURRENCY)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {pdcaMode !== "DC" && leanView && leanInsights && (
                    <>
                      {!leanInsights.jitOk && (
                        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-sm text-amber-100">
                          Súlyponti fókusz (JIT): Először a biztonsági tartalékot töltsd fel, a célok/perselyek
                          automatikus finanszírozása most szünetel.
                        </div>
                      )}

                      <div className="mb-4 grid gap-4 md:grid-cols-2">
                        <Card className="border-border/60 bg-background/40">
                          <CardContent className="p-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold" data-exact="értékáram-térkép — 1 Ft beáramlásból mennyi lesz valódi érték.">
                                  Lean értékáram
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                  Havi nézet ({leanInsights.monthKey}). 1 Ft beáramlásból mennyi lesz valódi érték.
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10px]",
                                  leanInsights.eff >= 0.5
                                    ? "bg-emerald-950/40 text-emerald-200 border border-emerald-500/20"
                                    : leanInsights.eff >= 0.2
                                      ? "bg-amber-950/40 text-amber-200 border border-amber-500/20"
                                      : "bg-rose-950/40 text-rose-200 border border-rose-500/20",
                                )}
                                title="Nettó hatékonyság"
                              >
                                {Math.round(leanInsights.eff * 100)}%
                              </Badge>
                            </div>

                            <div className="mt-3 grid gap-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-300" data-exact="hány fillér marad 1 Ft beáramlásból.">
                                  Nettó hatékonyság
                                </span>
                                <span className="font-mono text-slate-200">
                                  1 Ft → {Math.round(leanInsights.eff * 100)} fillér
                                </span>
                              </div>
                              <Progress value={Math.round(leanInsights.eff * 100)} />
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                              <div className="rounded-md border border-emerald-500/20 bg-emerald-950/20 p-3">
                                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                  1. Beáramlás
                                </div>
                                <div className="mt-1 text-lg font-bold tabular-nums text-emerald-400">
                                  {formatMoney(Math.round(leanInsights.inflowGross), CURRENCY)}
                                </div>
                                <div className="mt-0.5 text-[11px] text-slate-300">Bruttó bevételek</div>
                              </div>

                              <div className="rounded-md border border-amber-500/20 bg-amber-950/20 p-3">
                                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                  2. Lekötés
                                </div>
                                <div className="mt-1 text-sm text-slate-200">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-slate-300">ÁFA tartalék (havi)</span>
                                    <span className="font-mono">
                                      {formatMoney(Math.round(leanInsights.bufferVatMonthly), CURRENCY)}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex items-center justify-between gap-2">
                                    <span className="text-slate-300">Fix működési költség (becslés)</span>
                                    <span className="font-mono">
                                      {formatMoney(Math.round(leanInsights.bufferFixedMonthlyGross), CURRENCY)}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex items-center justify-between gap-2">
                                    <span className="text-slate-300">Tartozások tőkerésze (havi)</span>
                                    <span className="font-mono">
                                      {formatMoney(Math.round(leanInsights.bufferLoanPrincipalNet), CURRENCY)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-md border border-sky-500/20 bg-sky-950/20 p-3">
                                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                  3. Tiszta pénzáramlás
                                </div>
                                <div
                                  className={cn(
                                    "mt-1 text-lg font-bold tabular-nums",
                                    leanInsights.netValueGross >= 0 ? "text-emerald-400" : "text-rose-400",
                                  )}
                                >
                                  {leanInsights.netValueGross >= 0 ? "+" : ""}
                                  {formatMoney(Math.round(leanInsights.netValueGross), CURRENCY)}
                                </div>
                                {leanInsights.cycleDays != null && (
                                  <div className="mt-0.5 text-[11px] text-slate-300">
                                    Ütemidő:{" "}
                                    <span className="font-mono text-slate-200">
                                      {Math.round(leanInsights.cycleDays)} nap
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="rounded-md border border-indigo-500/20 bg-indigo-950/15 p-3">
                                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                  4. Újraforgatás
                                </div>
                                <div className="mt-1 text-lg font-bold tabular-nums text-indigo-200">
                                  {formatMoney(Math.round(leanInsights.reinvestGross), CURRENCY)}
                                </div>
                                <div className="mt-0.5 text-[11px] text-slate-300">
                                  Perselyek / célok / projektek (megtakarítás tételek)
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                              <span className="rounded bg-emerald-950/30 px-2 py-1 text-emerald-200" data-exact="értékteremtő — ami a vevőnek értéket ad.">
                                VA
                              </span>
                              <span className="rounded bg-amber-950/30 px-2 py-1 text-amber-200" data-exact="szükséges — nem érték, de ma még elkerülhetetlen.">
                                NVA
                              </span>
                              <span className="rounded bg-rose-950/30 px-2 py-1 text-rose-200" data-exact="veszteség — pazarlás, elhagyható tétel.">
                                MUDA
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-border/60 bg-background/40">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-sm font-semibold" data-exact="veszteség-pont — álló tőke, súrlódás, adat-hulladék.">
                                  MUDA score
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                  Heurisztikus jelzések: álló tőke, súrlódási költségek, adat-hulladék.
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10px]",
                                  leanInsights.score >= 70
                                    ? "bg-emerald-950/40 text-emerald-200 border border-emerald-500/20"
                                    : leanInsights.score >= 40
                                      ? "bg-amber-950/40 text-amber-200 border border-amber-500/20"
                                      : "bg-rose-950/40 text-rose-200 border border-rose-500/20",
                                )}
                              >
                                {leanInsights.score}/100
                              </Badge>
                            </div>

                            <div className="mt-4 grid gap-3">
                              <div className="rounded-md border border-border/60 bg-background/30 p-3">
                                <div className="text-xs text-slate-200">Idle Cash (60 nap)</div>
                                <div className="mt-1 font-mono text-sm text-slate-200">
                                  {formatMoney(Math.round(leanInsights.idleCash), CURRENCY)}
                                </div>
                                <div className="mt-0.5 text-[11px] text-muted-foreground">
                                  Tipp: rendelj célt/perselyt, vagy állíts be fókuszált reinvesztet.
                                </div>
                              </div>

                              <div className="rounded-md border border-border/60 bg-background/30 p-3">
                                <div className="text-xs text-slate-200">Friction Costs (havi)</div>
                                <div className="mt-1 font-mono text-sm text-slate-200">
                                  {formatMoney(Math.round(leanInsights.frictionGross), CURRENCY)}
                                </div>
                                <div className="mt-0.5 text-[11px] text-muted-foreground">
                                  Banki díjak / kamat / késedelmek. Tipp: csomagváltás, előfizetések auditja.
                                </div>
                              </div>

                              <div className="rounded-md border border-border/60 bg-background/30 p-3">
                                <div className="text-xs text-slate-200">Data Waste (havi)</div>
                                <div className="mt-1 font-mono text-sm text-slate-200">
                                  {Math.round(leanInsights.dataWastePct * 100)}%
                                </div>
                                <div className="mt-0.5 text-[11px] text-muted-foreground">
                                  Tipp: alakíts automatikus szabályokat (kulcsszó → kategória/partner).
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}

                  {whatIf && (
                    <div className="mb-4 rounded-lg border border-border/60 bg-background/40 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">What‑If szimulátor (forgatókönyvek)</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            🎯 Mire jó? Gyorsan látod, mikor érkezhet el a fedezeti pont és milyen tartalék kell a
                            biztonságos működéshez.
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={whatIfScenario === "optimistic" ? "secondary" : "outline"}
                            className="h-8"
                            onClick={() => setWhatIfScenario("optimistic")}
                            title="Optimista (Best-case)"
                          >
                            🟢 Optimista
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={whatIfScenario === "realistic" ? "secondary" : "outline"}
                            className="h-8"
                            onClick={() => setWhatIfScenario("realistic")}
                            title="Reális (Base-case)"
                          >
                            🔵 Reális
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={whatIfScenario === "pessimistic" ? "secondary" : "outline"}
                            className="h-8"
                            onClick={() => setWhatIfScenario("pessimistic")}
                            title="Pesszimista (Worst-case)"
                          >
                            🔴 Pesszimista
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div
                          className="cursor-help rounded-md border border-slate-700/60 bg-slate-950/30 p-4"
                          title="Az első hónap, amikor a választott pálya halmozott eredménye eléri a nullát."
                        >
                          <div className="text-[11px] text-muted-foreground">Fedezeti pont</div>
                          <div className="mt-1 font-mono text-sm text-slate-100">
                            {whatIf.breakEvenLabel ?? "—"}
                          </div>
                        </div>
                        <div
                          className="cursor-help rounded-md border border-slate-700/60 bg-slate-950/30 p-4"
                          title="ROI: (bevétel − költség) / költség a 12 hónapon. Nem diszkontált."
                        >
                          <div className="text-[11px] text-muted-foreground">Megtérülés (ROI)</div>
                          <div className="mt-1 font-mono text-sm text-slate-100">
                            {whatIf.roi == null ? "—" : `${whatIf.roi.toFixed(0)}%`}
                          </div>
                        </div>
                        <div
                          className="cursor-help rounded-md border border-slate-700/60 bg-slate-950/30 p-4"
                          title="Kötött havi kiadás osztva az átlagos havi kiadással."
                        >
                          <div className="text-[11px] text-muted-foreground">Fix költség arány</div>
                          <div className="mt-1 font-mono text-sm text-slate-100">
                            {whatIf.fixedRatio == null ? "—" : `${Math.round(whatIf.fixedRatio * 100)}%`}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={whatIf.chart} margin={{ top: 12, right: 16, left: 28, bottom: 32 }}>
                            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                            <XAxis
                              dataKey="month"
                              stroke="var(--color-muted-foreground)"
                              fontSize={11}
                              height={36}
                              label={{ value: "Hónap", position: "bottom", offset: 0, fontSize: 10 }}
                            />
                            <YAxis
                              stroke="var(--color-muted-foreground)"
                              fontSize={11}
                              tickFormatter={compactMoney}
                              width={52}
                              label={{
                                value: "Halmozott eredmény (Ft)",
                                angle: -90,
                                position: "left",
                                offset: 16,
                                fontSize: 10,
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "var(--color-popover)",
                                border: "1px solid var(--color-border)",
                                borderRadius: 12,
                                color: "var(--color-popover-foreground)",
                              }}
                              formatter={(v: number) => formatMoney(Math.round(v), CURRENCY)}
                              labelFormatter={(lab) => `Hónap: ${lab}`}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: 12 }}
                              content={() => (
                                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-1">
                                  <ChartLegendSwatch tone="opt" label="Optimista" line />
                                  <ChartLegendSwatch tone="real" label="Reális" line />
                                  <ChartLegendSwatch tone="pess" label="Pesszimista" line />
                                </div>
                              )}
                            />
                            <Line
                              type="monotone"
                              dataKey="optimistic"
                              name="Optimista"
                              className={PRO_LINE_CLASS.opt}
                              stroke={PRO_OPT}
                              strokeWidth={whatIfScenario === "optimistic" ? 3 : 2.2}
                              dot={{ r: 3, strokeWidth: 1.5, fill: "var(--card-bg)" }}
                              activeDot={{ r: 4.5, strokeWidth: 1.5, fill: "var(--card-bg)" }}
                              opacity={whatIfScenario === "optimistic" ? 1 : 0.72}
                            />
                            <Line
                              type="monotone"
                              dataKey="realistic"
                              name="Reális"
                              className={PRO_LINE_CLASS.real}
                              stroke={PRO_REAL}
                              strokeWidth={whatIfScenario === "realistic" ? 3 : 2.2}
                              dot={{ r: 3, strokeWidth: 1.5, fill: "var(--card-bg)" }}
                              activeDot={{ r: 4.5, strokeWidth: 1.5, fill: "var(--card-bg)" }}
                              opacity={whatIfScenario === "realistic" ? 1 : 0.72}
                            />
                            <Line
                              type="monotone"
                              dataKey="pessimistic"
                              name="Pesszimista"
                              className={PRO_LINE_CLASS.pess}
                              stroke={PRO_PESS}
                              strokeWidth={whatIfScenario === "pessimistic" ? 3 : 2.2}
                              dot={{ r: 3, strokeWidth: 1.5, fill: "var(--card-bg)" }}
                              activeDot={{ r: 4.5, strokeWidth: 1.5, fill: "var(--card-bg)" }}
                              opacity={whatIfScenario === "pessimistic" ? 1 : 0.72}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-3 rounded-md border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                        💡 Pro Tip: ha a break-even túl messze van, először a fix költségeket érdemes „lehúzni” (előfizetések,
                        bérleti díjak), mert ezek minden hónapban terhelik a céltartalékot.
                      </div>
                    </div>
                  )}

                  <Dialog open={vatReviewOpen} onOpenChange={setVatReviewOpen}>
                    <DialogContent className="sm:max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>ÁFA felülvizsgálat (jelölt tételek)</DialogTitle>
                      </DialogHeader>

                      <div className="rounded-md border bg-background/40 p-3 text-xs text-muted-foreground">
                        Lean cél: csak a “gyanús” tételeket kelljen átnézni. A HU tételeket az import már bruttóból nettóra bontotta.
                      </div>

                      <div className="overflow-x-auto whitespace-nowrap">
                        <table className="w-full text-xs">
                          <thead className="text-muted-foreground">
                            <tr className="border-b">
                              <th className="py-2 text-left font-medium">Dátum</th>
                              <th className="py-2 text-left font-medium">Megnevezés</th>
                              <th className="py-2 text-left font-medium">Típus</th>
                              <th className="py-2 text-right font-medium">Nettó</th>
                              <th className="py-2 text-right font-medium">Bruttó</th>
                              <th className="py-2 text-left font-medium">Javaslat</th>
                              <th className="py-2 text-left font-medium">Művelet</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reviewTxns.slice(0, 50).map((t) => {
                              const net = txnNetHuf(t);
                              const gross = txnGrossHuf(t);
                              const treatment = t.vat_treatment ?? "hu_gross";
                              return (
                                <tr key={t.id} className="border-b last:border-b-0">
                                  <td className="py-2 font-mono">
                                    {new Date(t.occurred_at).toISOString().slice(0, 10)}
                                  </td>
                                  <td className="py-2">
                                    <div className="font-medium">
                                      {displayTxnLabel(t)}
                                    </div>
                                    {t.party?.trim() && (
                                      <div className="text-muted-foreground">{t.party.trim()}</div>
                                    )}
                                  </td>
                                  <td className="py-2">
                                    <Badge variant="secondary" className="text-[10px]">
                                      {t.type === "expense" ? "kiadás" : "bevétel"}
                                    </Badge>
                                  </td>
                                  <td className="py-2 text-right tabular-nums">
                                    {formatMoney(Math.round(net), CURRENCY)}
                                  </td>
                                  <td className="py-2 text-right tabular-nums font-semibold">
                                    {formatMoney(Math.round(gross), CURRENCY)}
                                  </td>
                                  <td className="py-2">
                                    <span className="font-mono text-[11px]">
                                      {treatment}
                                      {t.vat_rate != null ? ` @${t.vat_rate}%` : ""}
                                    </span>
                                  </td>
                                  <td className="py-2">
                                    <div className="flex flex-wrap gap-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-[11px]"
                                        onClick={async () => {
                                          await patchTxn(t.id, (prev) => ({
                                            ...prev,
                                            vat_treatment: "hu_gross",
                                            vat_rate: defaultVat,
                                            vat_review: false,
                                          }));
                                          await qc.invalidateQueries({ queryKey: ["transactions"] });
                                        }}
                                      >
                                        HU bruttó ({defaultVat}%)
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-[11px]"
                                        onClick={async () => {
                                          await patchTxn(t.id, (prev) => ({
                                            ...prev,
                                            vat_treatment: "no_vat",
                                            vat_rate: 0,
                                            vat_review: false,
                                          }));
                                          await qc.invalidateQueries({ queryKey: ["transactions"] });
                                        }}
                                      >
                                        nincs ÁFA
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-[11px]"
                                        onClick={async () => {
                                          await patchTxn(t.id, (prev) => ({
                                            ...prev,
                                            vat_treatment: "reverse_charge",
                                            vat_rate: defaultVat,
                                            vat_review: false,
                                          }));
                                          await qc.invalidateQueries({ queryKey: ["transactions"] });
                                        }}
                                      >
                                        EU fordított
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-[11px]"
                                        onClick={async () => {
                                          await patchTxn(t.id, (prev) => ({
                                            ...prev,
                                            vat_treatment: "foreign",
                                            vat_rate: 0,
                                            vat_review: false,
                                          }));
                                          await qc.invalidateQueries({ queryKey: ["transactions"] });
                                        }}
                                      >
                                        deviza/külföld
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 text-[11px]"
                                        onClick={() => {
                              if (denyShowcaseWrite(isVisitorDemo)) return;
                              beginEditTxn(t);
                            }}
                                      >
                                        Szerkesztés
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {reviewTxns.length === 0 && (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                  Nincs felülvizsgálandó tétel.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setVatReviewOpen(false)}>
                          Bezár
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <div className="max-h-[50vh] overflow-auto rounded-md border border-border/60 bg-background/40">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 z-10 bg-card/90 backdrop-blur">
                        <tr className="border-b border-border/60 text-[11px] text-slate-300">
                          <th className="px-2 py-1.5 text-left font-medium">Hónap</th>
                          <th className="px-2 py-1.5 text-right font-medium">Bevétel</th>
                          <th className="px-2 py-1.5 text-right font-medium">Kiadás</th>
                          <th className="px-2 py-1.5 text-right font-medium">Megtakarítás</th>
                          <th className="px-2 py-1.5 text-right font-medium">Változás</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cashflowRows.map((r) => {
                          const net = r.income - r.expense - r.saving;
                          return (
                            <tr key={r.month} className="border-b border-border/40 last:border-b-0">
                              <td className="px-2 py-1.5 font-mono">{r.month}</td>
                              <td className="px-2 py-1.5 text-right tabular-nums">
                                {formatMoney(Math.round(r.income), CURRENCY)}
                              </td>
                              <td className="px-2 py-1.5 text-right tabular-nums">
                                {formatMoney(Math.round(r.expense), CURRENCY)}
                              </td>
                              <td className="px-2 py-1.5 text-right tabular-nums">
                                {formatMoney(Math.round(r.saving), CURRENCY)}
                              </td>
                              <td className="px-2 py-1.5 text-right tabular-nums font-semibold">
                                {formatMoney(Math.round(net), CURRENCY)}
                              </td>
                            </tr>
                          );
                        })}
                        {cashflowRows.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">
                              Nincs adat ehhez a számlához.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 rounded-lg border bg-muted/20 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">Tervezett kiadások</div>
                        <div className="text-xs text-muted-foreground">
                          Következő 60 nap — banki pénzmozgások (bruttó), egy devizanemre (HUF) átszámolva.
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {plannedTab === "fixed" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setRecOpen(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Új FIX
                          </Button>
                        )}
                        {plannedTab === "oneoff" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setOneOffOpen(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Új eseti
                          </Button>
                        )}
                        {plannedTab === "usage" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setUsageTplOpen(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Új sablon
                          </Button>
                        )}
                      </div>
                    </div>

                    <Tabs value={plannedTab} onValueChange={(v) => setPlannedTab(v as typeof plannedTab)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="fixed">FIX költségek</TabsTrigger>
                        <TabsTrigger value="oneoff">Eseti / tervezett</TabsTrigger>
                        <TabsTrigger value="usage">Használat-alapú</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {plannedTab === "fixed" && (
                      <div className="mt-3 space-y-2">
                        {upcomingRecurring.slice(0, 12).map((x) => (
                          <div
                            key={`${x.at}:${x.item.id}`}
                            className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground">{x.at}</span>
                                <Badge
                                  variant={x.item.type === "expense" ? "destructive" : "secondary"}
                                  className="text-[10px]"
                                >
                                  {x.item.type === "expense" ? "kiadás" : "bevétel"}
                                </Badge>
                                <span className="truncate text-sm font-medium">{x.item.name}</span>
                              </div>
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                {categoryLabel(x.item.category)}
                                {" · "}
                                {x.item.interval === "weekly"
                                  ? "heti"
                                  : x.item.interval === "monthly"
                                    ? "havi"
                                    : "negyedéves"}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right text-xs">
                                <div className="font-semibold tabular-nums">
                                  {formatMoney(Math.round(x.gross), CURRENCY)}
                                </div>
                                <div className="text-muted-foreground">bruttó</div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  commitSettings(
                                    {
                                      ...settings,
                                      recurring: settings.recurring.filter((r) => r.id !== x.item.id),
                                    },
                                    "FIX költség törlése",
                                  );
                                }}
                              >
                                Törlés
                              </Button>
                            </div>
                          </div>
                        ))}
                        {upcomingRecurring.length === 0 && (
                          <div className="rounded-md border bg-background px-3 py-6 text-center text-xs text-muted-foreground">
                            Nincs beállított FIX költség ehhez a számlához.
                          </div>
                        )}
                      </div>
                    )}

                    {plannedTab === "oneoff" && (
                      <div className="mt-3 space-y-2">
                        {upcomingOneOff.slice(0, 12).map((it) => {
                          const eur = Number(it.eur_amount ?? 0);
                          const rate = Number(it.eur_rate ?? 0);
                          const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
                          const net = Number(it.amount ?? 0) + eurHuf;
                          const split = computeVatSplit(net, it.vat_rate ?? defaultVat, "net");
                          return (
                            <div
                              key={it.id}
                              className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-muted-foreground">{it.at}</span>
                                  <Badge
                                    variant={it.type === "expense" ? "destructive" : "secondary"}
                                    className="text-[10px]"
                                  >
                                    {it.type === "expense" ? "kiadás" : "bevétel"}
                                  </Badge>
                                  <span className="truncate text-sm font-medium">{it.name}</span>
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                  {categoryLabel(it.category)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right text-xs">
                                  <div className="font-semibold tabular-nums">
                                    {formatMoney(Math.round(split.gross), CURRENCY)}
                                  </div>
                                  <div className="text-muted-foreground">bruttó</div>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    commitSettings(
                                      {
                                        ...settings,
                                        plannedOneOff: settings.plannedOneOff.filter((x) => x.id !== it.id),
                                      },
                                      "Eseti terv törlése",
                                    );
                                  }}
                                >
                                  Törlés
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        {upcomingOneOff.length === 0 && (
                          <div className="rounded-md border bg-background px-3 py-6 text-center text-xs text-muted-foreground">
                            Nincs eseti terv a következő 60 napra.
                          </div>
                        )}
                      </div>
                    )}

                    {plannedTab === "usage" && (
                      <div className="mt-3 space-y-3">
                        <div className="rounded-md border bg-background p-3 text-xs text-muted-foreground">
                          Ezek csak akkor számolódnak, ha rögzítesz “használat” eseményt (pl. futár: csak abban a
                          hónapban fizetsz, amikor volt kiszállítás).
                        </div>

                        <div className="space-y-2">
                          {(settings.usageTemplates ?? [])
                            .filter((t) => (t.workspace ?? activeWorkspace) === activeWorkspace)
                            .map((tpl) => (
                              <div
                                key={tpl.id}
                                className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-medium">{tpl.name}</div>
                                  <div className="mt-0.5 text-xs text-muted-foreground">
                                    {categoryLabel(tpl.category)} · egységár (nettó):{" "}
                                    {formatMoney(Math.round(tpl.unit_amount), CURRENCY)}
                                    {tpl.eur_unit_amount ? ` + ${tpl.eur_unit_amount} EUR` : ""}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2 text-xs"
                                    onClick={() => {
                                      setUsageLogTemplateId(tpl.id);
                                      setUsageLogOpen(true);
                                    }}
                                  >
                                    Használat rögzítése
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                      commitSettings(
                                        {
                                          ...settings,
                                          usageTemplates: settings.usageTemplates.filter((x) => x.id !== tpl.id),
                                          usageEvents: settings.usageEvents.filter((e) => e.template_id !== tpl.id),
                                        },
                                        "Sablon törlése",
                                      );
                                    }}
                                  >
                                    Törlés
                                  </Button>
                                </div>
                              </div>
                            ))}

                          {(settings.usageTemplates ?? []).filter(
                            (t) => (t.workspace ?? activeWorkspace) === activeWorkspace,
                          ).length === 0 && (
                            <div className="rounded-md border bg-background px-3 py-6 text-center text-xs text-muted-foreground">
                              Nincs használat-alapú sablon.
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {upcomingUsage.slice(0, 12).map(({ e, tpl }) => {
                            const eur = Number(tpl.eur_unit_amount ?? 0);
                            const rate = Number(tpl.eur_rate ?? 0);
                            const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
                            const net = (Number(tpl.unit_amount ?? 0) + eurHuf) * Math.max(0, Number(e.count ?? 0));
                            const split = computeVatSplit(net, tpl.vat_rate ?? defaultVat, "net");
                            return (
                              <div
                                key={e.id}
                                className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-muted-foreground">{e.at}</span>
                                    <Badge variant="destructive" className="text-[10px]">
                                      használat
                                    </Badge>
                                    <span className="truncate text-sm font-medium">
                                      {tpl.name} × {e.count}
                                    </span>
                                  </div>
                                  <div className="mt-0.5 text-xs text-muted-foreground">
                                    {categoryLabel(tpl.category)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right text-xs">
                                    <div className="font-semibold tabular-nums">
                                      {formatMoney(Math.round(split.gross), CURRENCY)}
                                    </div>
                                    <div className="text-muted-foreground">bruttó</div>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                      commitSettings(
                                        {
                                          ...settings,
                                          usageEvents: settings.usageEvents.filter((x) => x.id !== e.id),
                                        },
                                        "Használat törlése",
                                      );
                                    }}
                                  >
                                    Törlés
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                          {upcomingUsage.length === 0 && (
                            <div className="rounded-md border bg-background px-3 py-6 text-center text-xs text-muted-foreground">
                              Nincs rögzített használat a következő 60 napra.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Dialog open={recOpen} onOpenChange={setRecOpen}>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Új ismétlődő tétel</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="rec-name">Megnevezés</Label>
                            <Input
                              id="rec-name"
                              value={recName}
                              onChange={(e) => setRecName(e.target.value)}
                              placeholder="pl. Internet + tárhely"
                              autoFocus
                              maxLength={120}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label>Típus</Label>
                              <Select
                                value={recType}
                                onValueChange={(v) => setRecType(v as "expense" | "income")}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="expense">Kiadás</SelectItem>
                                  <SelectItem value="income">Bevétel</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label>Ismétlődés</Label>
                              <Select
                                value={recInterval}
                                onValueChange={(v) => setRecInterval(v as RecurringInterval)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="weekly">Heti</SelectItem>
                                  <SelectItem value="monthly">Havi</SelectItem>
                                  <SelectItem value="quarterly">Negyedéves</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label htmlFor="rec-next">Következő esedékesség</Label>
                              <Input
                                id="rec-next"
                                type="date"
                                value={recNextDate}
                                onChange={(e) => setRecNextDate(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Kategória</Label>
                              <Select value={recCategory} onValueChange={setRecCategory}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(recType === "income"
                                    ? [
                                        ...(businessMode
                                          ? BUSINESS_INCOME_CATEGORIES
                                          : INCOME_CATEGORIES),
                                        ...settings.incomeCategories,
                                      ]
                                    : [
                                        ...(businessMode
                                          ? BUSINESS_EXPENSE_CATEGORIES
                                          : EXPENSE_CATEGORIES),
                                        ...settings.expenseCategories,
                                      ]
                                  ).map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {categoryLabel(c)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label htmlFor="rec-huf">Nettó (HUF)</Label>
                              <Input
                                id="rec-huf"
                                inputMode="decimal"
                                placeholder="0"
                                value={recAmountHuf}
                                onChange={(e) => setRecAmountHuf(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="rec-vat">ÁFA kulcs (%)</Label>
                              <Input
                                id="rec-vat"
                                inputMode="decimal"
                                placeholder={String(defaultVat)}
                                value={recVatRate}
                                onChange={(e) => setRecVatRate(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label htmlFor="rec-eur">Nettó (EUR)</Label>
                              <Input
                                id="rec-eur"
                                inputMode="decimal"
                                placeholder="0"
                                value={recAmountEur}
                                onChange={(e) => setRecAmountEur(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="rec-eur-rate">EUR árfolyam (HUF/EUR)</Label>
                              <Input
                                id="rec-eur-rate"
                                inputMode="decimal"
                                placeholder="pl. 390"
                                value={recEurRate}
                                onChange={(e) => setRecEurRate(e.target.value)}
                              />
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            Nettót rögzítesz (HUF + EUR→HUF), a cashflow-ban a bruttó banki pénzmozgás
                            jelenik meg (nettó + ÁFA).
                          </p>
                        </div>

                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setRecOpen(false)}>
                            Mégse
                          </Button>
                          <Button
                            onClick={() => {
                              const nm = recName.trim();
                              if (!nm) return toast.error("Adj meg megnevezést.");
                              if (!/^\d{4}-\d{2}-\d{2}$/.test(recNextDate))
                                return toast.error("Hibás dátum.");
                              const huf = Number(recAmountHuf.replace(",", "."));
                              const eur = Number(recAmountEur.replace(",", "."));
                              const rate = Number(recEurRate.replace(",", "."));
                              const vat = Number(recVatRate.replace(",", "."));
                              const hufNum = recAmountHuf.trim() && Number.isFinite(huf) ? Math.max(0, huf) : 0;
                              const eurNum = recAmountEur.trim() && Number.isFinite(eur) ? Math.max(0, eur) : 0;
                              const rateNum = recEurRate.trim() && Number.isFinite(rate) ? Math.max(0, rate) : 0;
                              if (eurNum > 0 && rateNum <= 0)
                                return toast.error("EUR összeghez kötelező árfolyamot megadni.");
                              if (hufNum <= 0 && eurNum <= 0)
                                return toast.error("Adj meg HUF vagy EUR nettó összeget.");
                              const item: RecurringItem = {
                                id: newId(),
                                name: nm,
                                type: recType,
                                interval: recInterval,
                                next_date: recNextDate,
                                category: recCategory,
                                amount: hufNum,
                                eur_amount: eurNum > 0 ? eurNum : null,
                                eur_rate: eurNum > 0 ? rateNum : null,
                                vat_rate: Number.isFinite(vat) ? Math.max(0, vat) : defaultVat,
                                workspace: activeWorkspace,
                              };
                              commitSettings(
                                { ...settings, recurring: [...settings.recurring, item] },
                                "FIX költség hozzáadása",
                              );
                              setRecOpen(false);
                            }}
                          >
                            Mentés
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={oneOffOpen} onOpenChange={setOneOffOpen}>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Új eseti / tervezett tétel</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="oneoff-name">Megnevezés</Label>
                            <Input
                              id="oneoff-name"
                              value={oneOffName}
                              onChange={(e) => setOneOffName(e.target.value)}
                              placeholder="pl. tervezett fejlesztés / beszerzés megelőlegezés"
                              autoFocus
                              maxLength={120}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label>Típus</Label>
                              <Select
                                value={oneOffType}
                                onValueChange={(v) => setOneOffType(v as "expense" | "income")}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="expense">Kiadás</SelectItem>
                                  <SelectItem value="income">Bevétel</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="oneoff-at">Dátum</Label>
                              <Input
                                id="oneoff-at"
                                type="date"
                                value={oneOffAt}
                                onChange={(e) => setOneOffAt(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <Label>Kategória</Label>
                            <Select value={oneOffCategory} onValueChange={setOneOffCategory}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(oneOffType === "income"
                                  ? [...BUSINESS_INCOME_CATEGORIES, ...settings.incomeCategories]
                                  : [...BUSINESS_EXPENSE_CATEGORIES, ...settings.expenseCategories]
                                ).map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {categoryLabel(c)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label htmlFor="oneoff-huf">Nettó (HUF)</Label>
                              <Input
                                id="oneoff-huf"
                                inputMode="decimal"
                                placeholder="0"
                                value={oneOffAmountHuf}
                                onChange={(e) => setOneOffAmountHuf(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="oneoff-vat">ÁFA kulcs (%)</Label>
                              <Input
                                id="oneoff-vat"
                                inputMode="decimal"
                                placeholder={String(defaultVat)}
                                value={oneOffVatRate}
                                onChange={(e) => setOneOffVatRate(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label htmlFor="oneoff-eur">Nettó (EUR)</Label>
                              <Input
                                id="oneoff-eur"
                                inputMode="decimal"
                                placeholder="0"
                                value={oneOffAmountEur}
                                onChange={(e) => setOneOffAmountEur(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="oneoff-eur-rate">EUR árfolyam (HUF/EUR)</Label>
                              <Input
                                id="oneoff-eur-rate"
                                inputMode="decimal"
                                placeholder="pl. 390"
                                value={oneOffEurRate}
                                onChange={(e) => setOneOffEurRate(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setOneOffOpen(false)}>
                            Mégse
                          </Button>
                          <Button
                            onClick={() => {
                              const nm = oneOffName.trim();
                              if (!nm) return toast.error("Adj meg megnevezést.");
                              if (!/^\d{4}-\d{2}-\d{2}$/.test(oneOffAt))
                                return toast.error("Hibás dátum.");
                              const huf = Number(oneOffAmountHuf.replace(",", "."));
                              const eur = Number(oneOffAmountEur.replace(",", "."));
                              const rate = Number(oneOffEurRate.replace(",", "."));
                              const vat = Number(oneOffVatRate.replace(",", "."));
                              const hufNum =
                                oneOffAmountHuf.trim() && Number.isFinite(huf) ? Math.max(0, huf) : 0;
                              const eurNum =
                                oneOffAmountEur.trim() && Number.isFinite(eur) ? Math.max(0, eur) : 0;
                              const rateNum =
                                oneOffEurRate.trim() && Number.isFinite(rate) ? Math.max(0, rate) : 0;
                              if (eurNum > 0 && rateNum <= 0)
                                return toast.error("EUR összeghez kötelező árfolyamot megadni.");
                              if (hufNum <= 0 && eurNum <= 0)
                                return toast.error("Adj meg HUF vagy EUR nettó összeget.");
                              const item: PlannedOneOff = {
                                id: newId(),
                                name: nm,
                                type: oneOffType,
                                at: oneOffAt,
                                category: oneOffCategory,
                                amount: hufNum,
                                eur_amount: eurNum > 0 ? eurNum : null,
                                eur_rate: eurNum > 0 ? rateNum : null,
                                vat_rate: Number.isFinite(vat) ? Math.max(0, vat) : defaultVat,
                                workspace: activeWorkspace,
                              };
                              commitSettings(
                                { ...settings, plannedOneOff: [...settings.plannedOneOff, item] },
                                "Eseti terv hozzáadása",
                              );
                              setOneOffOpen(false);
                            }}
                          >
                            Mentés
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={usageTplOpen} onOpenChange={setUsageTplOpen}>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Új használat-alapú sablon</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="usage-name">Megnevezés</Label>
                            <Input
                              id="usage-name"
                              value={usageTplName}
                              onChange={(e) => setUsageTplName(e.target.value)}
                              placeholder="pl. Futárszolgálat"
                              autoFocus
                              maxLength={120}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label>Kategória</Label>
                            <Select value={usageTplCategory} onValueChange={setUsageTplCategory}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[...BUSINESS_EXPENSE_CATEGORIES, ...settings.expenseCategories].map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {categoryLabel(c)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label htmlFor="usage-huf">Egységár nettó (HUF)</Label>
                              <Input
                                id="usage-huf"
                                inputMode="decimal"
                                placeholder="0"
                                value={usageTplAmountHuf}
                                onChange={(e) => setUsageTplAmountHuf(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="usage-vat">ÁFA kulcs (%)</Label>
                              <Input
                                id="usage-vat"
                                inputMode="decimal"
                                placeholder={String(defaultVat)}
                                value={usageTplVatRate}
                                onChange={(e) => setUsageTplVatRate(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label htmlFor="usage-eur">Egységár nettó (EUR)</Label>
                              <Input
                                id="usage-eur"
                                inputMode="decimal"
                                placeholder="0"
                                value={usageTplAmountEur}
                                onChange={(e) => setUsageTplAmountEur(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="usage-eur-rate">EUR árfolyam (HUF/EUR)</Label>
                              <Input
                                id="usage-eur-rate"
                                inputMode="decimal"
                                placeholder="pl. 390"
                                value={usageTplEurRate}
                                onChange={(e) => setUsageTplEurRate(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setUsageTplOpen(false)}>
                            Mégse
                          </Button>
                          <Button
                            onClick={() => {
                              const nm = usageTplName.trim();
                              if (!nm) return toast.error("Adj meg megnevezést.");
                              const huf = Number(usageTplAmountHuf.replace(",", "."));
                              const eur = Number(usageTplAmountEur.replace(",", "."));
                              const rate = Number(usageTplEurRate.replace(",", "."));
                              const vat = Number(usageTplVatRate.replace(",", "."));
                              const hufNum =
                                usageTplAmountHuf.trim() && Number.isFinite(huf) ? Math.max(0, huf) : 0;
                              const eurNum =
                                usageTplAmountEur.trim() && Number.isFinite(eur) ? Math.max(0, eur) : 0;
                              const rateNum =
                                usageTplEurRate.trim() && Number.isFinite(rate) ? Math.max(0, rate) : 0;
                              if (eurNum > 0 && rateNum <= 0)
                                return toast.error("EUR összeghez kötelező árfolyamot megadni.");
                              if (hufNum <= 0 && eurNum <= 0)
                                return toast.error("Adj meg HUF vagy EUR egységárat.");
                              const tpl: UsageTemplate = {
                                id: newId(),
                                name: nm,
                                type: "expense",
                                category: usageTplCategory,
                                unit_amount: hufNum,
                                eur_unit_amount: eurNum > 0 ? eurNum : null,
                                eur_rate: eurNum > 0 ? rateNum : null,
                                vat_rate: Number.isFinite(vat) ? Math.max(0, vat) : defaultVat,
                                workspace: activeWorkspace,
                              };
                              commitSettings(
                                { ...settings, usageTemplates: [...settings.usageTemplates, tpl] },
                                "Sablon hozzáadása",
                              );
                              setUsageTplOpen(false);
                            }}
                          >
                            Mentés
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={usageLogOpen} onOpenChange={setUsageLogOpen}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Használat rögzítése</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="use-at">Dátum</Label>
                            <Input
                              id="use-at"
                              type="date"
                              value={usageLogAt}
                              onChange={(e) => setUsageLogAt(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="use-count">Mennyiség (hányszor)</Label>
                            <Input
                              id="use-count"
                              inputMode="numeric"
                              value={usageLogCount}
                              onChange={(e) => setUsageLogCount(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setUsageLogOpen(false)}>
                            Mégse
                          </Button>
                          <Button
                            onClick={() => {
                              if (!usageLogTemplateId) return toast.error("Nincs sablon kiválasztva.");
                              if (!/^\d{4}-\d{2}-\d{2}$/.test(usageLogAt))
                                return toast.error("Hibás dátum.");
                              const c = Number(usageLogCount.replace(",", "."));
                              const count = Number.isFinite(c) ? Math.max(1, Math.round(c)) : 1;
                              const ev: UsageEvent = {
                                id: newId(),
                                template_id: usageLogTemplateId,
                                at: usageLogAt,
                                count,
                                workspace: activeWorkspace,
                              };
                              commitSettings(
                                { ...settings, usageEvents: [...settings.usageEvents, ev] },
                                "Használat rögzítése",
                              );
                              setUsageLogOpen(false);
                            }}
                          >
                            Mentés
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Txn/Loan/Savings dialogs mounted outside lockPdcaView (see before BottomNav). */}


            {dragging && (
              <div
                className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-primary/60 bg-popover px-3 py-2 text-xs font-medium text-popover-foreground shadow-xl"
                style={{ left: dragging.x, top: dragging.y }}
              >
                {TYPE_LABEL[dragging.type]} · {dragging.label}
              </div>
            )}


            {financeVisible && pdcaMode !== "PD" && pdcaMode !== "AP" && activeSubTab === "cashflow" && (
            <section className={cn("grid gap-4", pdcaMode === "DC" ? "lg:grid-cols-2" : "")}>
              <div className={cn("grid gap-4", pdcaMode === "DC" ? "" : "lg:col-span-2")}>
              {activeWorkspace === "personal" && personalCashflowKpis && (
                <Card className="w-full">
                  <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <CardTitle className="truncate text-sm font-medium text-muted-foreground">
                          Cashflow (havi összesítés) — {workspaceDisplayName("personal")}
                        </CardTitle>
                        <HelpIcon kbId="cashflow-savings" />
                      </div>
                      <div className="mr-2 flex w-full max-w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                        {isVisitorDemo ? null : (
                          <>
                            <input
                              ref={bankXmlFileRef}
                              type="file"
                              accept=".xml,text/xml,application/xml"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.currentTarget.files?.[0] ?? null;
                                if (!f) return;
                                void (async () => {
                                  if (!f.name.toLowerCase().endsWith(".xml")) {
                                    toast.error("HIBA: Nem megfelelő formátum (Magán). Csak XML (SpreadsheetML).");
                                    return;
                                  }
                                  const text = await f.text();
                                  await onBankPersonalXmlText({ fileName: f.name, text, fileSize: f.size });
                                })();
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="h-9 gap-2 px-2 sm:px-3"
                              onClick={() => void syncPersonalBankFromLatestFileInFolder()}
                              title={
                                activeWorkspaceMeta?.bank_sync_folder
                                  ? `Magán szinkron (mappa: ${activeWorkspaceMeta.bank_sync_folder})`
                                  : "Magán szinkron (legfrissebb XML a mappából)"
                              }
                              aria-label="Magán szinkron"
                            >
                              <Folder className="h-4 w-4" />
                              <span className="hidden sm:inline">Magán szinkron</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-9 gap-2 px-2 sm:px-3"
                              onClick={() => bankXmlFileRef.current?.click()}
                              title="Magán: XML kivonat kiválasztása"
                              aria-label="XML kivonat kiválasztása"
                            >
                              <Upload className="h-4 w-4" />
                              <span className="hidden sm:inline">XML</span>
                            </Button>
                            <HelpIcon kbId="bank-sync-dedup" />
                            {bankImportStatus ? (
                              <span className="max-w-[320px] truncate text-xs text-slate-300" title={bankImportStatus}>
                                {bankImportStatus}
                              </span>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="mt-4 grid gap-4 md:grid-cols-4">
                      <Card className="border-l-4 border-l-[color:var(--color-chart-1)] bg-[color:var(--color-chart-1)]/5">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs uppercase tracking-wide text-foreground/80">
                              Szabad egyenleg (elkölthető keret)
                            </p>
                            <HelpIcon kbId="cashflow-savings" />
                          </div>
                          <p className="mt-1 text-xl font-semibold tabular-nums text-[color:var(--color-chart-1)]">
                            {formatMoney(Math.round(personalCashflowKpis.free), CURRENCY)}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Ez az az összeg, ami a megtakarítások levonása után ténylegesen elkölthető.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-[color:var(--color-chart-6)] bg-[color:var(--color-chart-6)]/5">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs uppercase tracking-wide text-foreground/80">
                              Megtakarítások és perselyek
                            </p>
                            <HelpIcon kbId="piggy-expense-disabled" />
                          </div>
                          <p className="mt-1 text-xl font-semibold tabular-nums text-[color:var(--color-chart-6)]">
                            {formatMoney(Math.round(personalCashflowKpis.piggies), CURRENCY)}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Célokra és tartalékokra félretett összeg.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-[color:var(--color-chart-2)] bg-[color:var(--color-chart-2)]/5">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs uppercase tracking-wide text-foreground/80">
                              Összes banki egyenleg / kassa
                            </p>
                            <HelpIcon kbId="cashflow-savings" />
                          </div>
                          <p className="mt-1 text-xl font-semibold tabular-nums text-[color:var(--color-chart-2)]">
                            {formatMoney(Math.round(personalCashflowKpis.bankGross), CURRENCY)}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Bruttó likvid összeg (bevétel − kiadás).
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-border bg-muted/25">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs uppercase tracking-wide text-foreground/80">
                              Biztonsági tartalék
                            </p>
                            <HelpIcon kbId="cashflow-savings" />
                          </div>
                          <p className="mt-1 text-xl font-semibold tabular-nums">
                            {personalCashflowKpis.runwayMonths == null
                              ? "—"
                              : `${personalCashflowKpis.runwayMonths.toFixed(1)} hó`}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {personalCashflowKpis.fixedMonthly > 0
                              ? `${formatMoney(Math.round(personalCashflowKpis.fixedMonthly), CURRENCY)} fix havi kiadás alapján`
                              : "Nincs beállított fix kiadás — add meg a Magán ismétlődő tételeket."}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}

              {pdcaMode !== "DC" && (
              <div className="grid gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Mire ment el
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {byCatPie.length === 0 ? (
                      <EmptyBlock>Még nincs rögzített kiadás.</EmptyBlock>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={byCatPie}
                              dataKey="value"
                              nameKey="label"
                              innerRadius={55}
                              outerRadius={90}
                              paddingAngle={2}
                              stroke="var(--color-background)"
                              strokeWidth={2}
                            >
                              {byCatPie.map((_, i) => (
                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                background: "var(--color-popover)",
                                border: "1px solid var(--color-border)",
                                borderRadius: 12,
                                color: "var(--color-popover-foreground)",
                              }}
                              formatter={(v: number) => formatMoney(v, CURRENCY)}
                            />
                            {byCatPie.length <= 8 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Havi bevétel vs. kiadás
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} />
                          <YAxis
                            stroke="var(--color-muted-foreground)"
                            fontSize={12}
                            tickFormatter={compactMoney}
                            width={60}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "var(--color-popover)",
                              border: "1px solid var(--color-border)",
                              borderRadius: 12,
                              color: "var(--color-popover-foreground)",
                            }}
                            formatter={(v: number) => formatMoney(v, CURRENCY)}
                          />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="income" name="Bevétel" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="expense" name="Kiadás" fill="var(--color-chart-7)" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="saving" name="Megtakarítás" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              )}
              </div>

              {pdcaMode === "DC" && (
                <div className="grid gap-4">
                  <div className="grid gap-4 lg:grid-cols-5">
                    <Card className="lg:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Mire ment el
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {byCatPie.length === 0 ? (
                          <EmptyBlock>Még nincs rögzített kiadás.</EmptyBlock>
                        ) : (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={byCatPie}
                                  dataKey="value"
                                  nameKey="label"
                                  innerRadius={55}
                                  outerRadius={90}
                                  paddingAngle={2}
                                  stroke="var(--color-background)"
                                  strokeWidth={2}
                                >
                                  {byCatPie.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    background: "var(--color-popover)",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: 12,
                                    color: "var(--color-popover-foreground)",
                                  }}
                                  formatter={(v: number) => formatMoney(v, CURRENCY)}
                                />
                                {byCatPie.length <= 8 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="lg:col-span-3">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Havi bevétel vs. kiadás
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} />
                              <YAxis
                                stroke="var(--color-muted-foreground)"
                                fontSize={12}
                                tickFormatter={compactMoney}
                                width={60}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: "var(--color-popover)",
                                  border: "1px solid var(--color-border)",
                                  borderRadius: 12,
                                  color: "var(--color-popover-foreground)",
                                }}
                                formatter={(v: number) => formatMoney(v, CURRENCY)}
                              />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Bar dataKey="income" name="Bevétel" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                              <Bar dataKey="expense" name="Kiadás" fill="var(--color-chart-7)" radius={[6, 6, 0, 0]} />
                              <Bar dataKey="saving" name="Megtakarítás" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {leanView && leanInsights && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="border-border/60 bg-background/40">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold" data-exact="értékáram-térkép — 1 Ft beáramlásból mennyi lesz valódi érték.">
                                Lean értékáram
                              </div>
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                Havi nézet ({leanInsights.monthKey})
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-[10px]">
                              {Math.round(leanInsights.eff * 100)}%
                            </Badge>
                          </div>
                          <div className="mt-3 grid gap-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-300" data-exact="hány fillér marad 1 Ft beáramlásból.">
                                Nettó hatékonyság
                              </span>
                              <span className="font-mono text-slate-200">
                                1 Ft → {Math.round(leanInsights.eff * 100)} fillér
                              </span>
                            </div>
                            <Progress value={Math.round(leanInsights.eff * 100)} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/60 bg-background/40">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold" data-exact="veszteség-pont — álló tőke, súrlódás, adat-hulladék.">
                                MUDA score
                              </div>
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                Álló tőke · súrlódás · adat-hulladék
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px]",
                                leanInsights.score >= 70
                                  ? "bg-emerald-950/40 text-emerald-200 border border-emerald-500/20"
                                  : leanInsights.score >= 40
                                    ? "bg-amber-950/40 text-amber-200 border border-amber-500/20"
                                    : "bg-rose-950/40 text-rose-200 border border-rose-500/20",
                              )}
                            >
                              {leanInsights.score}/100
                            </Badge>
                          </div>
                          <div className="mt-3 text-xs text-slate-300">
                            Runway 60 nap:{" "}
                            <span className="font-mono text-slate-200">
                              {runway?.cov60?.pct != null ? `${Math.round(runway.cov60.pct * 100)}%` : "—"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </section>
            )}

            {activeSubTab === "inventory" && (
              <section className="w-full grid gap-3">
                <div className="grid grid-cols-2 gap-8 relative min-h-[600px]">
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-800 -translate-x-1/2 pointer-events-none" />

                  {/* LEFT COLUMN — DO */}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider">
                      <span className="text-cyan-400 font-bold">
                        DO — {activeWorkspace === "personal" || activeWorkspace === "__all" ? "Vagyon" : "Leltár"}
                      </span>
                    </div>

                    <div className="mt-2 grid gap-4 lg:grid-cols-3">
                      <div className="lg:col-span-3">
                        <AssetTree
                          properties={personalProperties as any}
                          assets={assets as any}
                          locations={locations as any}
                          vehicles={activeVehicles as any}
                          txns={allTxns}
                          currency={CURRENCY}
                          businessLabel={
                            activeWorkspace === "__all" ? "Vállalkozások (összes)" : workspaceDisplayName(activeWorkspace)
                          }
                        />
                      </div>
                  <Card className="lg:col-span-1 border-[color:var(--color-chart-6)]/30 bg-[color:var(--color-chart-6)]/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {activeWorkspace === "personal" || activeWorkspace === "__all"
                          ? "Vagyon — helyek"
                          : "Leltár — helyek"}
                      </CardTitle>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => setLocationsOpen(true)}
                      >
                        Beállítás
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {locations.length === 0 ? (
                        <div className="text-xs text-muted-foreground">
                          Nincs beállított telephely/raktár. Adj hozzá a Beállítás gombbal.
                        </div>
                      ) : (
                        locations.map((l) => {
                          const count = txns.filter(
                            (t) => t.type === "expense" && t.is_asset && t.location_id === l.id,
                          ).length;
                          return (
                            <button
                              type="button"
                              key={l.id}
                              className="flex w-full items-center justify-between rounded-md border bg-background/50 px-3 py-2 text-left text-xs hover:bg-background/70"
                              onClick={() => {
                                setSelectedLocationId(l.id);
                                setLocationTcoOpen(true);
                              }}
                            >
                              <div className="min-w-0">
                                <div className="truncate font-medium">{l.name}</div>
                                <div className="text-muted-foreground">
                                  {l.kind === "szekhely"
                                    ? "székhely"
                                    : l.kind === "telephely"
                                      ? "telephely"
                                      : l.kind === "raktar"
                                        ? "raktár"
                                        : "egyéb"}
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-[10px]">
                                {count} eszköz
                              </Badge>
                            </button>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2 border-[color:var(--color-chart-6)]/30 bg-[color:var(--color-chart-6)]/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {activeWorkspace === "personal" || activeWorkspace === "__all"
                          ? "Vagyon — eszközök"
                          : "Leltár — tárgyi eszközök"}
                      </CardTitle>
                      <Badge variant="secondary" className="text-[10px]">
                        {txns.filter((t) => t.type === "expense" && t.is_asset).length}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      {assets.length > 0 && (
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => setAssetsOpen(true)}
                          >
                            Eszközök kezelése
                          </Button>
                        </div>
                      )}
                      <div className="max-h-[60vh] overflow-auto rounded-md border border-border/60 bg-background/40">
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 z-10 bg-card/90 backdrop-blur">
                            <tr className="border-b border-border/60 text-[11px] text-slate-300">
                              <th className="px-2 py-1.5 text-left font-medium">Dátum</th>
                              <th className="px-2 py-1.5 text-left font-medium">Megnevezés</th>
                              <th className="px-2 py-1.5 text-left font-medium">Hely</th>
                              <th className="px-2 py-1.5 text-left font-medium">Eszköz</th>
                              <th className="px-2 py-1.5 text-right font-medium">Bruttó (bank)</th>
                              <th className="px-2 py-1.5 text-right font-medium" />
                            </tr>
                          </thead>
                          <tbody>
                            {txns
                              .filter((t) => t.type === "expense" && t.is_asset)
                              .sort((a, b) =>
                                a.occurred_at < b.occurred_at ? 1 : a.occurred_at > b.occurred_at ? -1 : 0,
                              )
                              .slice(0, 50)
                              .map((t) => (
                                <tr key={t.id} className="border-b last:border-b-0">
                                  <td className="px-2 py-1.5 font-mono">
                                    {new Date(t.occurred_at).toISOString().slice(0, 10)}
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <div className="font-medium">
                                      {displayTxnLabel(t)}
                                    </div>
                                    <div className="text-muted-foreground">{categoryLabel(t.category)}</div>
                                  </td>
                                  <td className="px-2 py-1.5">{locationName(t.location_id) ?? "—"}</td>
                                  <td className="px-2 py-1.5">
                                    {t.asset_id ? (
                                      <button
                                        type="button"
                                        className="truncate text-left text-[color:var(--color-primary)] hover:underline"
                                        onClick={() => {
                                          setSelectedAssetId(t.asset_id!);
                                          setAssetTcoOpen(true);
                                        }}
                                        title="Eszköz összesítő"
                                      >
                                        {assetName(t.asset_id) ?? "Eszköz"}
                                      </button>
                                    ) : (
                                      "—"
                                    )}
                                  </td>
                                  <td className="px-2 py-1.5 text-right tabular-nums font-semibold">
                                    {formatMoney(Math.round(txnGrossHuf(t)), CURRENCY)}
                                  </td>
                                  <td className="px-2 py-1.5 text-right">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={() => {
                              if (denyShowcaseWrite(isVisitorDemo)) return;
                              beginEditTxn(t);
                            }}
                                      aria-label="Szerkesztés"
                                      title="Szerkesztés"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            {txns.filter((t) => t.type === "expense" && t.is_asset).length === 0 && (
                              <tr>
                                <td colSpan={6} className="px-2 py-8 text-center text-muted-foreground">
                                  Még nincs tárgyi eszköz jelölve. Szerkesztésnél kapcsold be a “Tárgyi eszköz” gombot.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-3 border-[color:var(--color-chart-6)]/30 bg-[color:var(--color-chart-6)]/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Tartozások — áthelyezve a Cashflow aloldalra
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", debtBuffer.cls)}>
                          {debtBuffer.icon} puffer
                        </span>
                        <span className="font-mono">
                          szabad: {formatMoney(Math.round(debtBuffer.free), CURRENCY)} · tartozás:{" "}
                          {formatMoney(Math.round(debtBuffer.outstanding), CURRENCY)}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => setActiveSubTab("cashflow")}
                        title="Ugrás a Cashflow aloldalra"
                      >
                        Megnyitás Cashflow-ban
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-3 border-[color:var(--color-chart-6)]/30 bg-[color:var(--color-chart-6)]/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Erőforrások (Bankszámlák · Költséghelyek · Jármű · HR)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-md border border-slate-700/60 bg-slate-800/80 p-3">
                        <div className="text-[11px] text-slate-300">Költséghelyek / raktárak (workspace)</div>
                        <div className="mt-1 text-sm font-semibold text-white tabular-nums">
                          {Array.isArray((activeWorkspaceMeta as any)?.locationIds)
                            ? `${((activeWorkspaceMeta as any).locationIds as string[]).length} db`
                            : "—"}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          A helyszínek globálisan a Beállításokban kezelhetők, itt a munkaterülethez rendelés látszik.
                        </div>
                      </div>
                      <div className="rounded-md border border-slate-700/60 bg-slate-800/80 p-3">
                        <div className="text-[11px] text-slate-300">Járműpark</div>
                        <div className="mt-1 text-sm font-semibold text-white tabular-nums">
                          {Array.isArray((activeWorkspaceMeta as any)?.vehicles)
                            ? `${((activeWorkspaceMeta as any).vehicles as any[]).length} db`
                            : "0 db"}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          Magánautónál alap: 100 Ft/km adómentes keret.
                        </div>
                      </div>
                      <div className="rounded-md border border-slate-700/60 bg-slate-800/80 p-3">
                        <div className="text-[11px] text-slate-300">Humán erőforrások</div>
                        <div className="mt-1 text-sm font-semibold text-white tabular-nums">
                          {Array.isArray((activeWorkspaceMeta as any)?.humanResources)
                            ? `${((activeWorkspaceMeta as any).humanResources as any[]).length} fő`
                            : "0 fő"}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          EV alvállalkozók és EFO eseti segítők listája.
                        </div>
                      </div>
                      <div className="rounded-md border border-slate-700/60 bg-slate-800/80 p-3">
                        <div className="text-[11px] text-slate-300">Gyors HR összegzés (CHECK)</div>
                        <div className="mt-1 text-sm font-semibold text-white tabular-nums">
                          {resourceEfficiency
                            ? `${Math.round(
                                ((resourceEfficiency.evGross + resourceEfficiency.efoGross) /
                                  Math.max(1, resourceEfficiency.totalExpenseGross)) *
                                  100,
                              )}%`
                            : "—"}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          EV+EFO arány az összes költségen belül (bruttó).
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                    </div>
                  </div>

                  {/* RIGHT COLUMN — PLAN */}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-right">
                      <span className="text-amber-400 font-bold">PLAN — Célok & Beruházások</span>
                    </div>
                    <div className="mt-2">{planStack}</div>
                  </div>
                </div>
              </section>
            )}

            {/* cashflow master grid is rendered inside WorkspaceTabs */}

            {financeVisible && activeSubTab === "ledger" && (
            <section className="w-full grid gap-3">
              {autoRuleSuggestion &&
              (activeWorkspace === "__all" || autoRuleSuggestion.workspaceId === activeWorkspace) ? (
                <Card className="w-full border border-border/60 bg-background/40">
                  <CardContent className="py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="text-sm text-slate-200">
                        💡 <span className="font-semibold">Szabály létrehozása:</span> Észrevettük, hogy több hasonló
                        tételt (<span className="font-mono">{autoRuleSuggestion.display}</span>) címkézel. Készítesz rá
                        egy automatikus szabályt, hogy a legközelebbi import már magától rendeződjön?
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            const s = autoRuleSuggestion;
                            setAutoRuleWsId(s.workspaceId);
                            setAutoRuleKeyword(s.keyword);
                            setAutoRuleCategory(s.category);
                            setAutoRulePartner(s.partner);
                            setAutoRuleOpen(true);
                          }}
                          title="Automatikus szabály létrehozása"
                        >
                          ⚡ Szabály létrehozása
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setAutoRuleDismissedKey(autoRuleSuggestion.key);
                            setAutoRuleSuggestion(null);
                          }}
                          title="Most nem"
                        >
                          Most nem
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
              <div className="grid grid-cols-2 gap-8 relative min-h-[600px]">
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-800 -translate-x-1/2 pointer-events-none" />

                {/* LEFT COLUMN — DO */}
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider">
                    <span className="text-cyan-400 font-bold">DO — Élő folyamatok / Működés</span>
                  </div>

                  <Card className="mt-2 w-full">
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
                          {businessMode && activeWorkspace !== "__all"
                            ? `Tételek (Excel nézet) — ${activeWorkspace}`
                            : "Tételek"}
                          <HelpIcon kbId="ledger-overview" />
                        </CardTitle>
                        <Button
                          type="button"
                          className="h-10 gap-2"
                          onClick={() => {
                          if (denyShowcaseWrite(isVisitorDemo)) return;
                          setQuickAddType("expense");
                        }}
                          title="+ Új tétel"
                        >
                          <Plus className="h-4 w-4" />
                          Új tétel
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="rounded-md border border-sky-500/25 bg-sky-950/20 p-4">
                          <div className="inline-flex items-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            <span>Tételek</span>
                            <HelpIcon kbId="ledger-count" />
                          </div>
                          <div className="mt-1 text-base font-bold tabular-nums text-white">{ledgerSummary.count} db</div>
                        </div>
                        <div className="rounded-md border border-emerald-500/25 bg-emerald-950/30 p-4">
                          <div className="inline-flex items-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            <span>Összes bevétel</span>
                            <HelpIcon kbId="ledger-income" />
                          </div>
                          <div className="mt-1 text-base font-bold tabular-nums text-emerald-400">
                            {formatMoney(Math.round(ledgerSummary.incomeNet), CURRENCY)}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-300 tabular-nums">
                            bruttó: {formatMoney(Math.round(ledgerSummary.incomeGross), CURRENCY)}
                          </div>
                        </div>
                        <div className="rounded-md border border-rose-500/25 bg-rose-950/30 p-4">
                          <div className="inline-flex items-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            <span>Összes kiadás</span>
                            <HelpIcon kbId="ledger-expense" />
                          </div>
                          <div className="mt-1 text-base font-bold tabular-nums text-rose-400">
                            {formatMoney(Math.round(ledgerSummary.expenseNet), CURRENCY)}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-300 tabular-nums">
                            bruttó: {formatMoney(Math.round(ledgerSummary.expenseGross), CURRENCY)}
                          </div>
                        </div>
                        <div className="rounded-md border border-sky-500/25 bg-sky-950/20 p-4">
                          <div className="inline-flex items-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            <span>Megtakarítás</span>
                            <HelpIcon kbId="ledger-saving" />
                          </div>
                          <div className="mt-1 text-base font-bold tabular-nums text-sky-400">
                            {formatMoney(Math.round(ledgerSummary.savingNet), CURRENCY)}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-300 tabular-nums">
                            bruttó: {formatMoney(Math.round(ledgerSummary.savingGross), CURRENCY)}
                          </div>
                        </div>
                        <div className="rounded-md border border-amber-500/25 bg-amber-950/30 p-4">
                          <div className="inline-flex items-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            <span>Tőketörlesztés</span>
                            <HelpIcon kbId="ledger-loan-principal" />
                          </div>
                          <div className="mt-1 text-base font-bold tabular-nums text-amber-400">
                            {formatMoney(Math.round(ledgerSummary.loanPrincipalNet), CURRENCY)}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-300 tabular-nums">
                            tervezett: {ledgerSummary.plannedCount} db
                          </div>
                        </div>
                        <div className="rounded-md border border-sky-500/25 bg-sky-950/20 p-4">
                          <div className="inline-flex items-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            <span>Egyenleg</span>
                            <HelpIcon kbId="ledger-balance" />
                          </div>
                          <div
                            className={cn(
                              "mt-1 text-base font-bold tabular-nums text-white",
                              ledgerSummary.balanceNet >= 0 ? "text-emerald-400" : "text-rose-400",
                            )}
                          >
                            {ledgerSummary.balanceNet >= 0 ? "+" : ""}
                            {formatMoney(Math.round(ledgerSummary.balanceNet), CURRENCY)}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-300 tabular-nums">
                            bruttó: {ledgerSummary.balanceGross >= 0 ? "+" : ""}
                            {formatMoney(Math.round(ledgerSummary.balanceGross), CURRENCY)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mt-3 w-full">
                    <CardContent className="pt-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <div className="mr-1 inline-flex items-center text-xs text-slate-300">
                      Szűrők
                      <HelpIcon kbId="ledger-filters" />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={ledgerFilter === "all" ? "secondary" : "outline"}
                      className={cn("h-8", ledgerFilter === "all" && "bg-slate-800/80")}
                      onClick={() => setLedgerFilter("all")}
                      title="Összes tétel"
                    >
                      Összes
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={ledgerFilter === "income" ? "secondary" : "outline"}
                      className={cn(
                        "h-8",
                        ledgerFilter === "income" && "bg-emerald-950/40 border-emerald-500/30 text-emerald-200",
                      )}
                      onClick={() => setLedgerFilter("income")}
                      title="Bevételek"
                    >
                      Bevétel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={ledgerFilter === "expense" ? "secondary" : "outline"}
                      className={cn(
                        "h-8",
                        ledgerFilter === "expense" && "bg-rose-950/40 border-rose-500/30 text-rose-200",
                      )}
                      onClick={() => setLedgerFilter("expense")}
                      title="Kiadások"
                    >
                      Kiadás
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={ledgerFilter === "saving_transfer" ? "secondary" : "outline"}
                      className={cn(
                        "h-8",
                        ledgerFilter === "saving_transfer" && "bg-sky-950/40 border-sky-500/30 text-sky-200",
                      )}
                      onClick={() => setLedgerFilter("saving_transfer")}
                      title="Megtakarítások / átvezetések"
                    >
                      Megtakarítás / Átvezetés
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={ledgerFilter === "liability_planned" ? "secondary" : "outline"}
                      className={cn(
                        "h-8",
                        ledgerFilter === "liability_planned" && "bg-amber-950/40 border-amber-500/30 text-amber-200",
                      )}
                      onClick={() => setLedgerFilter("liability_planned")}
                      title="Tartozás / törlesztés / tervezett"
                    >
                      Tartozás / Tervezett
                    </Button>

                    {(activeWorkspace === "personal" || activeWorkspace === "__all") && personalProperties.length > 0 ? (
                      <div className="ml-auto flex items-center gap-2">
                        <div className="text-xs text-slate-300">Ingatlan</div>
                        <Select value={ledgerPropertyId} onValueChange={setLedgerPropertyId}>
                          <SelectTrigger className="h-8 w-52 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all">Összes</SelectItem>
                            {personalProperties.map((p: any) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {String(p.name ?? "Ingatlan")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border/60 bg-background/40 w-full">
                  <div className="sticky top-0 z-10 grid grid-cols-[auto_1fr_11rem_3.5rem_3.5rem] items-center gap-3 border-b border-border/60 bg-slate-900/60 px-2 py-2 text-[11px] text-slate-200 backdrop-blur-md">
                      <Checkbox
                        checked={allShownSelected}
                        onCheckedChange={() => toggleSelectAllShown()}
                        aria-label="Összes kijelölése"
                      />
                      <div className="min-w-0 pr-2">Megnevezés</div>
                      <div className="w-[11rem] text-right font-mono tabular-nums whitespace-nowrap">Összeg</div>
                      <div className="w-[3.5rem]" />
                      <div className="w-[3.5rem]" />
                    </div>

                    {ledgerShown.length === 0 ? (
                      <div className="p-3">
                        <EmptyBlock>Nincs rögzített tétel.</EmptyBlock>
                      </div>
                    ) : (
                      <ul className="divide-y divide-border/60 px-2">
                        {ledgerShown.map((t) => (
                          <LedgerTxnRow
                            key={t.id}
                            t={t}
                            checked={selectedTxnIds.has(t.id)}
                            onCheckedChange={(next) =>
                              setSelectedTxnIds((cur) => {
                                const s = new Set(cur);
                                if (next) s.add(t.id);
                                else s.delete(t.id);
                                return s;
                              })
                            }
                            currency={CURRENCY}
                            businessMode={businessMode}
                            txnNetHuf={txnNetHuf}
                            txnGrossHuf={txnGrossHuf}
                            categoryLabel={categoryLabel}
                            bucketName={(id) => (id ? bucketName(id) : null)}
                            showWorkspaceBadge={showWsBadge}
                            workspaceLabel={workspaceLabel}
                            workspaceBadgeClass={wsBadgeClass}
                            onEdit={() => beginEditTxn(t)}
                            onPiggy={() => {
                              if ((t.type === "income" || t.type === "saving") && Number(t.amount) > 0) setTransferSource(t);
                            }}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                    </CardContent>
                  </Card>
                </div>

                {/* RIGHT COLUMN — PLAN */}
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-right">
                    <span className="text-amber-400 font-bold">PLAN — Célkitűzések & Megtakarítás</span>
                  </div>

                  <div className="mt-2">{planStack}</div>
                </div>
              </div>

              {selectedCount > 0 && (
                <div className="fixed bottom-4 left-1/2 z-50 w-[min(980px,calc(100%-2rem))] -translate-x-1/2 rounded-xl border border-border bg-card/90 p-3 shadow-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-slate-100">
                      Kijelölve: <span className="font-mono">{selectedCount}</span> db
                      <span className="ml-2 inline-flex align-middle">
                        <HelpIcon kbId="ledger-bulk-actions" />
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => setBulkDeleteOpen(true)}
                        title="Tömeges törlés"
                      >
                        🗑️ Tömeges törlés
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => setBulkPiggyOpen(true)}
                        title="Tömeges persely"
                      >
                        🐷 Perselybe helyezés
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => setBulkCopyOpen(true)}
                        title="Másolás projektbe"
                      >
                        📋 Másolás projektbe
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-slate-300"
                        onClick={() => setSelectedTxnIds(new Set())}
                        title="Kijelölés törlése"
                      >
                        Kijelölés törlése
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </section>
            )}

            {financeVisible && activeSubTab === "deals" && (
            <section className="w-full grid gap-3">
              <div className="grid grid-cols-2 gap-8 relative min-h-[600px]">
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-800 -translate-x-1/2 pointer-events-none" />

                {/* LEFT COLUMN — DO */}
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider">
                    <span className="text-cyan-400 font-bold">DO — Üzletek / Pipeline</span>
                  </div>

                  <div className="mt-2 grid gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
                    Üzletek & Árrés
                    <HelpIcon kbId="deals-overview" />
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px]" title="Lezárt / összes továbbértékesítési beszerzés">
                    {resaleDeals.kpi.closedCount}/{resaleDeals.kpi.totalCount} lezárt
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-4">
                    <StatCard
                      label={
                        <span className="inline-flex items-center">
                          Összes továbbértékesített beszerzés (nettó)
                          <HelpIcon kbId="deals-margin" />
                        </span>
                      }
                      value={formatMoney(Math.round(resaleDeals.kpi.purchaseNetSum), CURRENCY)}
                    />
                    <StatCard
                      label={
                        <span className="inline-flex items-center">
                          Összes továbbértékesített beszerzés (bruttó)
                          <HelpIcon kbId="deals-margin" />
                        </span>
                      }
                      value={formatMoney(Math.round(resaleDeals.kpi.purchaseGrossSum), CURRENCY)}
                    />
                    <StatCard
                      label={
                        <span className="inline-flex items-center">
                          Kapcsolódó bevételek összege (nettó)
                          <HelpIcon kbId="deals-margin" />
                        </span>
                      }
                      value={formatMoney(Math.round(resaleDeals.kpi.revenueSum), CURRENCY)}
                    />
                    <StatCard
                      label={
                        <span className="inline-flex items-center">
                          Megvalósult árrés (Ft) / Átlag %
                          <HelpIcon kbId="deals-margin" />
                        </span>
                      }
                      value={`${formatMoney(Math.round(resaleDeals.kpi.marginSum), CURRENCY)} · ${resaleDeals.kpi.avgPct.toFixed(1)}%`}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Partner / vevő szerinti bontás
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {resaleDeals.byCustomer.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Még nincs lezárt ügylet (kapcsolt bevétel) a továbbértékesítési tételekhez.
                      </div>
                    ) : (
                      <ul className="divide-y divide-border/60">
                        {resaleDeals.byCustomer.slice(0, 12).map((c) => (
                          <li key={c.customer} className="flex items-center justify-between py-2 text-sm">
                            <div className="min-w-0">
                              <div className="truncate font-medium">{c.customer}</div>
                              <div className="text-xs text-muted-foreground">
                                {c.count} lezárt · bevétel {formatMoney(Math.round(c.revenue), CURRENCY)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="tabular-nums font-semibold text-[color:var(--color-chart-1)]">
                                {formatMoney(Math.round(c.margin), CURRENCY)}
                              </div>
                              <div className="text-xs text-muted-foreground tabular-nums">{c.pct.toFixed(1)}%</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Üzletek</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border/60 bg-background/40">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-background/90 backdrop-blur">
                          <tr className="border-b border-border/60 text-xs text-muted-foreground">
                            <th className="px-3 py-2 text-left">Tétel</th>
                            <th className="px-3 py-2 text-left">Partner</th>
                            <th className="px-3 py-2 text-right">Beszerzés (nettó/bruttó)</th>
                            <th className="px-3 py-2 text-left">Kapcsolódó bevétel</th>
                            <th className="px-3 py-2 text-right">Árrés (Ft / %)</th>
                            <th className="px-3 py-2 text-left">Státusz</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resaleDeals.deals.map((d) => (
                            <tr key={d.purchase.id} className="border-b border-border/40">
                              <td className="px-3 py-2">
                                <div className="font-medium">
                                  {displayTxnLabel(d.purchase)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {d.purchase.occurred_at} · {workspaceLabel(d.purchase.workspace ?? "personal")}
                                </div>
                              </td>
                              <td className="px-3 py-2">{d.customer}</td>
                              <td className="px-3 py-2 text-right tabular-nums">
                                <div className="font-semibold">{formatMoney(Math.round(d.purchaseNet), CURRENCY)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatMoney(Math.round(d.purchaseGross), CURRENCY)}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                {d.revenue ? (
                                  <div>
                                    <div className="font-medium">
                                      {displayTxnLabel(d.revenue)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {d.revenue.occurred_at} · {formatMoney(Math.round(d.revenueNet), CURRENCY)}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums">
                                {d.status === "closed" ? (
                                  <div>
                                    <div className="font-semibold text-[color:var(--color-chart-1)]">
                                      {formatMoney(Math.round(d.margin), CURRENCY)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{d.pct.toFixed(1)}%</div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {d.status === "closed" ? (
                                  <Badge
                                    variant="secondary"
                                    className="border border-[color:var(--color-chart-1)]/30 bg-[color:var(--color-chart-1)]/10 text-[color:var(--color-chart-1)]"
                                  >
                                    Lezárt üzlet
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="border border-[color:var(--color-chart-5)]/30 bg-[color:var(--color-chart-5)]/10 text-[color:var(--color-chart-5)]"
                                  >
                                    Készleten / eladásra vár
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                          {resaleDeals.deals.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">
                                Nincs továbbértékesítésre jelölt beszerzés ebben a nézetben.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

                  </div>
                </div>

                {/* RIGHT COLUMN — PLAN */}
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-right">
                    <span className="text-amber-400 font-bold">PLAN — Célok & Akciótervek</span>
                  </div>
                  <div className="mt-2">{planStack}</div>
                </div>
              </div>
            </section>
            )}

          </>
        )}
        </div>
        </div>
      </main>

      {/* Always mounted — lockPdcaView hides the legacy else-branch UI */}
            {/* Removed the middle "T-számla" / 2x2 cross block (dashboard cleanup). */}

            <TxnDialog
              onSave={(t) => {
                const ws = t.payload.workspace ?? (activeWorkspace === "__all" ? "personal" : activeWorkspace);
                const et = wantsExpenseTypeOf(t.type, String(t.payload.category ?? ""), t.payload.expense_type);
                const limit = wantsBudgetMonthlyHuf;
                if (
                  ws === "personal" &&
                  activeWorkspace === "personal" &&
                  t.type === "expense" &&
                  limit != null &&
                  et === "WANT"
                ) {
                  const amt = Math.max(0, Number(t.payload.amount ?? 0));
                  const projected = wantsSpendThisMonth + amt;
                  if (projected > limit) {
                    setWantsLockPending({
                      kind: "add",
                      overBy: Math.max(0, projected - limit),
                      limit,
                      input: { ...t, payload: { ...t.payload, expense_type: et }, bypassWantsLock: true },
                    });
                    setWantsLockOpen(true);
                    return;
                  }
                }
                addTxn.mutate(t);
              }}
              defaultType={quickAddType ?? undefined}
              open={quickAddType !== null}
              onOpenChange={(o) => {
                if (!o) setQuickAddType(null);
              }}
              trigger={null}
              settings={settings}
              onAddCategory={addCategory}
              onAddBucket={addBucket}
              businessMode={businessMode}
              defaultVat={defaultVat}
              onManageLocations={() => setLocationsOpen(true)}
              onManageProjects={() => setProjectsOpen(true)}
              onManageAssets={() => setAssetsOpen(true)}
              incomeTxns={txns.filter((t) => t.type === "income")}
              loans={loans}
              activeWorkspace={activeWorkspace}
              wsOptions={wsOptions}
              workspaceKind={workspaceKind}
              projectMode={(activeWorkspaceMeta?.project_mode as any) ?? null}
            />

            <TxnDialog
              onSave={(t) => {
                const ws = t.payload.workspace ?? (activeWorkspace === "__all" ? "personal" : activeWorkspace);
                const et = wantsExpenseTypeOf(t.type, String(t.payload.category ?? ""), t.payload.expense_type);
                const limit = wantsBudgetMonthlyHuf;
                if (
                  ws === "personal" &&
                  activeWorkspace === "personal" &&
                  t.type === "expense" &&
                  limit != null &&
                  et === "WANT"
                ) {
                  const amt = Math.max(0, Number(t.payload.amount ?? 0));
                  const projected = wantsSpendThisMonth + amt;
                  if (projected > limit) {
                    setWantsLockPending({
                      kind: "add",
                      overBy: Math.max(0, projected - limit),
                      limit,
                      input: { ...t, payload: { ...t.payload, expense_type: et }, bypassWantsLock: true },
                    });
                    setWantsLockOpen(true);
                    return;
                  }
                }
                addTxn.mutate(t);
              }}
              onUpdate={(id, t) => {
                const ws = t.payload.workspace ?? (activeWorkspace === "__all" ? "personal" : activeWorkspace);
                const et = wantsExpenseTypeOf(t.type, String(t.payload.category ?? ""), t.payload.expense_type);
                const limit = wantsBudgetMonthlyHuf;
                if (
                  ws === "personal" &&
                  activeWorkspace === "personal" &&
                  t.type === "expense" &&
                  limit != null &&
                  et === "WANT"
                ) {
                  const prev = txns.find((x) => x.id === id) ?? null;
                  const prevWasWant =
                    prev?.type === "expense" &&
                    String(prev.workspace ?? "personal") === "personal" &&
                    (prev.expense_type ?? null) === "WANT" &&
                    (() => {
                      const d = new Date(String(prev.occurred_at ?? ""));
                      const n = new Date();
                      return Number.isFinite(d.getTime()) && d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
                    })();
                  const prevAmt = prevWasWant ? Math.max(0, Number(prev?.amount ?? 0)) : 0;
                  const nextAmt = Math.max(0, Number(t.payload.amount ?? 0));
                  const projected = Math.max(0, wantsSpendThisMonth - prevAmt) + nextAmt;
                  if (projected > limit) {
                    setWantsLockPending({
                      kind: "update",
                      overBy: Math.max(0, projected - limit),
                      limit,
                      id,
                      input: { ...t, payload: { ...t.payload, expense_type: et }, bypassWantsLock: true },
                    });
                    setWantsLockOpen(true);
                    return;
                  }
                }
                updateTxn.mutate({ id, ...t });
              }}
              onDelete={(id) => delTxn.mutate(id)}
              editing={editing}
              open={editing !== null}
              onOpenChange={(o) => {
                if (!o) setEditing(null);
              }}
              trigger={null}
              settings={settings}
              onAddCategory={addCategory}
              onAddBucket={addBucket}
              businessMode={businessMode}
              defaultVat={defaultVat}
              onManageLocations={() => setLocationsOpen(true)}
              onManageProjects={() => setProjectsOpen(true)}
              onManageAssets={() => setAssetsOpen(true)}
              incomeTxns={txns.filter((t) => t.type === "income")}
              loans={loans}
              activeWorkspace={activeWorkspace}
              wsOptions={wsOptions}
              workspaceKind={workspaceKind}
              projectMode={(activeWorkspaceMeta?.project_mode as any) ?? null}
            />

            <LoanDialog
              open={loanOpen}
              onOpenChange={(o) => {
                setLoanOpen(o);
                if (!o) setLoanEditing(null);
              }}
              editing={loanEditing}
              workspaceId={activeWorkspace === "__all" ? "personal" : activeWorkspace}
              workspaceName={workspaceDisplayName(activeWorkspace === "__all" ? "personal" : activeWorkspace)}
              onSave={(payload) => {
                const ws = activeWorkspace === "__all" ? "personal" : activeWorkspace;
                upsertLoan.mutate({
                  id: loanEditing?.id,
                  payload: { ...payload, workspace_id: ws },
                });
              }}
            />


            <TransferPickerDialog
              open={transferPickerOpen}
              onOpenChange={setTransferPickerOpen}
              incomeTxns={txns.filter((t) => t.type === "income")}
              onPick={(t) => {
                setTransferPickerOpen(false);
                setTransferSource(t);
              }}
            />

            <AlertDialog open={wantsLockOpen} onOpenChange={setWantsLockOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Vigyázat! Keret túllépés</AlertDialogTitle>
                  <AlertDialogDescription>
                    {wantsLockPending
                      ? `Ez a tétel / művelet túllépi a havi WANT keretet kb. ${formatMoney(
                          Math.round(wantsLockPending.overBy),
                          CURRENCY,
                        )}-tal. Biztosan rögzíted?`
                      : "Ez a művelet túllépi a havi WANT keretet. Biztosan rögzíted?"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setWantsLockOpen(false);
                      setWantsLockPending(null);
                    }}
                  >
                    Mégse
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const p = wantsLockPending;
                      setWantsLockOpen(false);
                      setWantsLockPending(null);
                      if (!p) return;
                      if (p.kind === "add") addTxn.mutate(p.input);
                      else if (p.kind === "update") updateTxn.mutate({ id: p.id, ...p.input });
                      else if (p.kind === "bankImport") void onBankPersonalXmlText(p.input);
                    }}
                  >
                    Igen, rögzítem
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <SavingsTransferDialog
              source={transferSource}
              buckets={settings.buckets}
              onAddBucket={addBucket}
              goals={goals}
              onOpenChange={(o) => {
                if (!o) setTransferSource(null);
              }}
              onConfirm={(amount, note, bucket_id) => {
                if (!transferSource) return;
                splitToSaving.mutate({
                  id: transferSource.id,
                  amount,
                  note,
                  bucket_id,
                });
                setTransferSource(null);
                toast.success("Átvezetve megtakarításba.");
              }}
            />

      <BottomNav
        activeSubTab={activeSubTab}
        onChangeSubTab={setActiveSubTab}
        labels={{
          cashflow: lens.tabs.cashflow,
          items: lens.tabs.items,
          deals: lens.tabs.deals,
          inventory:
            (activeWorkspace === "personal" || activeWorkspace === "__all") &&
            (lens.tabs.inventory === "Leltár" || lens.tabs.inventory === "Inventory")
              ? t("dash.assets")
              : lens.tabs.inventory,
        }}
        isSzummaActive={activeWs === "szumma"}
        onToggleSzumma={toggleSzumma}
        onOpenCreate={() => setPdcaNewOpen(true)}
      />
    </div>
  );
}

function compactMoney(v: number) {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return `${v}`;
}

function EmptyBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-start justify-start overflow-hidden rounded-lg border border-dashed border-white/10 px-3 py-2.5 text-sm text-slate-400">
      <span className="kpi-label">{children}</span>
    </div>
  );
}

function TxnDot({ type }: { type: TxnType }) {
  const color =
    type === "income"
      ? "var(--color-chart-1)"
      : type === "saving"
        ? "var(--color-chart-2)"
        : "var(--color-chart-7)";
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function PlannedExpensesCard({
  total,
  goals,
  currency,
  expanded,
  onToggleExpand,
  allActiveGoals,
  business,
}: {
  total: number;
  goals: Goal[];
  currency: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
  allActiveGoals?: Goal[];
  business?: boolean;
}) {
  const { openComingSoon } = useFeatureComingSoon();
  return (
    <Card className="relative border-[color:var(--color-chart-7)]/40 bg-[color:var(--color-chart-7)]/5">
      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-[color:var(--color-chart-3)]" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Tervezett műveletek
        </CardTitle>
        <CalendarClock className="h-4 w-4 text-[color:var(--color-chart-7)]" />
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-semibold tabular-nums text-[color:var(--color-chart-7)]">
          {formatMoney(total, currency)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Következő 3 hét – összesített hátralék
        </p>
        {goals.length > 0 ? (
          <ul className="space-y-1 pt-1">
            {goals.map((g) => {
              const d = new Date(g.deadline);
              return (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs"
                >
                  <span className="truncate">{g.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" })}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <button
            type="button"
            className="w-full rounded-md border border-dashed border-border/50 bg-muted/10 px-3 py-2 text-left text-xs text-muted-foreground transition-all duration-200 hover:bg-muted/30 hover:text-foreground"
            onClick={() =>
              openComingSoon({
                title: "Ismétlődő tételek & ütemező",
                purpose:
                  "Automatikus ismétlődő bevétel/kiadás generálás és naptár nézet. A scheduler modul előkészítés alatt áll — a célok listája már működik.",
                featureId: "plan.recurring_scheduler",
              })
            }
          >
            Nincs közelgő célod. Ismétlődő tételek — előkészítés alatt (kattints).
          </button>
        )}
        {expanded && allActiveGoals && allActiveGoals.length > 0 && (
          <ul className="mt-2 max-h-[60vh] divide-y divide-border/60 overflow-y-auto rounded-md border border-border/60">
            {[...allActiveGoals]
              .sort(
                (a, b) =>
                  new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
              )
              .map((g) => {
                const d = new Date(g.deadline);
                const days = Math.ceil(
                  (d.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
                );
                return (
                  <li
                    key={g.id}
                    className="flex items-center justify-between gap-3 px-2 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{g.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {d.toLocaleDateString("hu-HU", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        {" · "}
                        {days >= 0 ? `${days} nap múlva` : `${-days} napja lejárt`}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-[color:var(--color-chart-7)]">
                      {formatMoney(Number(g.target_amount), currency)}
                    </span>
                  </li>
                );
              })}
          </ul>
        )}
        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
            />
            {expanded ? "Bezárás" : "Továbbiak megtekintése"}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function ExpandedPlannedList({
  goals,
  currency,
}: {
  goals: Goal[];
  currency: string;
}) {
  const sorted = [...goals].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  );
  return (
    <Card className="min-h-[75vh]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">
          Tervezett műveletek — összes aktív elem
        </CardTitle>
        <span className="text-xs text-muted-foreground">{sorted.length} tétel</span>
      </CardHeader>
      <CardContent className="max-h-[68vh] overflow-y-auto">
        {sorted.length === 0 ? (
          <EmptyBlock>Nincs aktív cél.</EmptyBlock>
        ) : (
          <ul className="divide-y divide-border/60">
            {sorted.map((g) => {
              const d = new Date(g.deadline);
              const days = Math.ceil((d.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
              return (
                <li key={g.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{g.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.toLocaleDateString("hu-HU", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {" · "}
                      {days >= 0 ? `${days} nap múlva` : `${-days} napja lejárt`}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-[color:var(--color-chart-7)]">
                    {formatMoney(Number(g.target_amount), currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}




function StatCard({
  label,
  value,
  subValue,
  statusColor,
  type,
  expanded,
  onToggleExpand,
  onQuickAdd,
  onTransferToSaving,
  dragOver,
  business,
  children,
}: {
  label: React.ReactNode;
  value: string;
  subValue?: string;
  statusColor?: "red" | "green" | "yellow";
  type?: TxnType;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onQuickAdd?: () => void;
  onTransferToSaving?: () => void;
  dragOver?: boolean;
  business?: boolean;
  children?: React.ReactNode;
}) {
  const statusBarColor =
    statusColor &&
    {
      red: "bg-[color:var(--color-chart-7)]",
      green: "bg-[color:var(--color-chart-2)]",
      yellow: "bg-[color:var(--color-chart-3)]",
    }[statusColor];
  return (
    <Card
      data-drop-type={type}
      className={cn(
        "relative transition-all",
        dragOver && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        business && "border-foreground/30 bg-background/60 shadow-none",
      )}
    >
      {statusBarColor && (
        <div className={cn("absolute left-0 top-4 bottom-4 w-1 rounded-r-full", statusBarColor)} />
      )}
      <div className="absolute right-2 top-2 flex items-center gap-1">
        {onTransferToSaving && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onTransferToSaving}
            aria-label="Átvezetés megtakarításba"
            title="Átvezetés megtakarításba"
            className="h-7 w-7 text-[color:var(--color-chart-2)]"
          >
            <PiggyBank className="h-4 w-4" />
          </Button>
        )}
        {type && onQuickAdd && (
          <Button
            size="icon"
            variant="secondary"
            onClick={onQuickAdd}
            aria-label={`Új ${TYPE_LABEL[type].toLowerCase()} tétel`}
            title={`Új ${TYPE_LABEL[type].toLowerCase()}`}
            className="h-7 w-7"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      <CardContent className="p-5">
        <div>
          <p
            className={cn(
              "text-xs uppercase tracking-wide text-muted-foreground",
              business && "font-serif italic tracking-wider",
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold tracking-tight tabular-nums",
              business && "font-mono",
            )}
          >
            {value}
          </p>
          {subValue && (
            <p className="mt-0.5 text-[11px] font-mono text-muted-foreground">
              {subValue}
            </p>
          )}
        </div>
        {type && onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
            />
            {expanded ? "Bezárás" : "Továbbiak megtekintése"}
          </button>
        )}
        {children}
      </CardContent>
    </Card>
  );
}


function InlineTxnList({
  type,
  txns,
  onStartDrag,
  onDelete,
  onEdit,
  onTransferToSaving,
  draggingId,
  buckets,
  businessMode,
  defaultVat,
  vatMode,
}: {
  type: TxnType;
  txns: Transaction[];
  onStartDrag: (t: Transaction, e: React.PointerEvent) => void;
  onDelete: (id: string) => void;
  onEdit: (t: Transaction) => void;
  onTransferToSaving: (t: Transaction) => void;
  draggingId: string | null;
  buckets: SavingBucket[];
  businessMode?: boolean;
  defaultVat?: number;
  vatMode?: VatMode;
}) {
  const bucketName = (id?: string | null) =>
    id ? displayBucketName(buckets.find((b) => b.id === id)?.name) || null : null;
  const netHuf = (t: Transaction) => {
    const huf = Number(t.amount ?? 0);
    const eur = Number(t.eur_amount ?? 0);
    const rate = Number(t.eur_rate ?? 0);
    const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
    return huf + eurHuf;
  };
  const amountClass =
    type === "income" ? "text-emerald-400" : type === "saving" ? "text-sky-400" : "text-rose-400";
  const sorted = [...txns].sort(
    (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
  );
  return (
    <div className="mt-3 max-h-[55vh] overflow-y-auto rounded-md border border-border/60 bg-background/40">
      {sorted.length === 0 ? (
        <div className="p-3">
          <EmptyBlock>Nincs tétel ebben a szekcióban.</EmptyBlock>
        </div>
      ) : (
        <>
          {businessMode && (
            <div className="sticky top-0 z-10 grid grid-cols-[auto_1fr_5rem_5rem_5rem_auto] items-center gap-2 border-b border-foreground/30 bg-muted/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span />
              <span>Megnevezés</span>
              <span className="text-right">Nettó</span>
              <span className="text-right">ÁFA %</span>
              <span className="text-right">Bruttó</span>
              <span />
            </div>
          )}
          <ul className="divide-y divide-border/60 px-2">
            {sorted.map((t) => {
              const rate = t.vat_rate ?? defaultVat ?? 0;
              const treatment = t.vat_treatment ?? "hu_gross";
              const split = businessMode
                ? t.type === "saving"
                  ? (() => {
                      const net = Math.round(netHuf(t));
                      return { net, vat: 0, gross: net };
                    })()
                  : treatment === "no_vat" || treatment === "foreign" || treatment === "reverse_charge"
                    ? (() => {
                        const net = Math.round(netHuf(t));
                        return { net, vat: 0, gross: net };
                      })()
                    : computeVatSplit(netHuf(t), rate, "net")
                : null;
              return (
                <li
                  key={t.id}
                  className={cn(
                    "flex items-center gap-2 py-2 transition-opacity",
                    draggingId === t.id && "opacity-40",
                  )}
                >
                  <button
                    type="button"
                    onPointerDown={(e) => onStartDrag(t, e)}
                    className="flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
                    aria-label="Áthelyezés fogantyú"
                    title="Húzd egy másik szekcióra"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {displayTxnLabel(t)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {categoryLabel(t.category)}
                      {" · "}
                      {new Date(t.occurred_at).toLocaleDateString("hu-HU")}
                      {t.type === "saving" && bucketName(t.bucket_id) && (
                        <span className="ml-2 inline-block rounded bg-[color:var(--color-chart-2)]/15 px-1.5 py-0.5 text-[10px] text-[color:var(--color-chart-2)]">
                          {bucketName(t.bucket_id)}
                        </span>
                      )}
                      {t.history && t.history.length > 0 && (
                        <span
                          className="ml-2 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px]"
                          title={t.history
                            .map(
                              (h) =>
                                `${new Date(h.at).toLocaleString("hu-HU")}: ${TYPE_LABEL[h.from]} → ${TYPE_LABEL[h.to]}`,
                            )
                            .join("\n")}
                        >
                          napló {t.history.length}×
                        </span>
                      )}
                    </p>
                  </div>
                  {split ? (
                    <div className="flex shrink-0 items-center gap-2 font-mono text-xs tabular-nums">
                      <span className={cn("w-20 text-right font-semibold", amountClass)}>
                        {formatMoney(split.net, CURRENCY)}
                      </span>
                      <span className="w-20 text-right text-muted-foreground">
                        {rate}% · {formatMoney(split.vat, CURRENCY)}
                      </span>
                      <span className="w-20 text-right text-foreground/80">
                        {formatMoney(split.gross, CURRENCY)}
                      </span>
                    </div>
                  ) : (
                    <span className={cn("shrink-0 text-sm font-semibold tabular-nums", amountClass)}>
                      {t.type === "income" ? "+" : "−"}
                      {formatMoney(Number(t.amount), CURRENCY)}
                    </span>
                  )}
                  {(t.type === "income" || t.type === "saving") && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onTransferToSaving(t)}
                      aria-label="Átvezetés megtakarításba"
                      title={
                        t.type === "saving"
                          ? "Átvezetés másik alhalmazba"
                          : "Átvezetés megtakarításba"
                      }
                      className="text-[color:var(--color-chart-2)]"
                    >
                      <PiggyBank className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(t)}
                    aria-label="Szerkesztés"
                    title="Szerkesztés"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(t.id)}
                    aria-label="Törlés"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}


function typeColor(t: TxnType) {
  return t === "income"
    ? "var(--color-chart-1)"
    : t === "saving"
      ? "var(--color-chart-2)"
      : "var(--color-chart-7)";
}


function GoalCard({
  goal,
  goals,
  savings,
  workspaceId,
  workspaceLabel,
  leanMonthlySupport,
  currency,
  properties,
  onSelect,
  onRemove,
  onAdd,
}: {
  goal: Goal | null;
  goals: Goal[];
  savings: number;
  workspaceId?: string;
  workspaceLabel?: string;
  leanMonthlySupport?: number;
  currency: string;
  properties?: Array<{ id: string; name: string }>;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (g: { deadline: string; payload: GoalPayload }) => void;
}) {
  if (!goal) {
    return (
      <Card className="pdca-tile--wide">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Target className="h-4 w-4" /> Célok
          </CardTitle>
          <GoalDialog
            onSave={onAdd}
            properties={properties}
            trigger={
              <Button size="icon" variant="outline" className="h-7 w-7" aria-label="Új cél">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          <EmptyBlock>Adj hozzá egy célt, hogy lásd a mérföldköveket.</EmptyBlock>
        </CardContent>
      </Card>
    );
  }

  const goalHide = [workspaceId, workspaceLabel];
  const goalLabel = (g: { name?: string | null }) => displayGoalLabel(g.name, goalHide);
  const target = Number(goal.target_amount);
  const progress = Math.min(100, (savings / target) * 100);
  const remaining = Math.max(0, target - savings);
  const months = Math.max(1, monthsUntil(goal.deadline));
  const monthly = Math.ceil(remaining / months);
  const leanMonthly = Math.max(0, Number(leanMonthlySupport ?? 0));
  const monthlyLean = monthly + leanMonthly;
  const monthsLean = monthlyLean > 0 ? Math.max(1, Math.ceil(remaining / monthlyLean)) : months;
  const monthsEarlier = Math.max(0, months - monthsLean);

  return (
    <Card className="pdca-tile--wide relative w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-30"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, var(--color-primary), transparent 70%)",
        }}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          className="flex items-center text-sm font-medium text-slate-300"
          data-exact="Célok — mennyi van meg, mennyi hiányzik, és havonta mennyit kell félretenni."
        >
          <Target className="h-4 w-4" /> Célok
          <HelpIcon kbId="goals-remaining" />
        </CardTitle>
        <div className="flex items-center gap-2">
          {goals.length > 1 && (
            <Select value={goal.id} onValueChange={onSelect}>
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {goals.map((g) => (
                  <SelectItem key={g.id} value={g.id} title={g.name}>
                    {goalLabel(g)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <GoalDialog
            onSave={onAdd}
            properties={properties}
            trigger={
              <Button size="icon" variant="outline" className="h-7 w-7" aria-label="Új cél">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="min-w-0 truncate text-sm font-semibold tracking-tight text-slate-50" title={goal.name}>
              {goalLabel(goal)}
            </h3>
            <span className="shrink-0 whitespace-nowrap text-xs text-slate-300">
              {new Date(goal.deadline).toLocaleDateString("hu-HU")}
            </span>
          </div>
        <p className="flex items-center gap-2 text-sm">
          <span className="kpi-value font-bold text-white">{formatMoney(savings, currency)}</span>
          <span className="kpi-value text-slate-300">/ {formatMoney(target, currency)}</span>
          <HelpIcon kbId="goals-progress" />
        </p>
          {leanMonthly > 0 && remaining > 0 && (
            <div className="mt-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs">
              <div className="font-semibold text-emerald-200">
                Lean támogatás: +{formatMoney(Math.round(leanMonthly), currency)}/hó átcsoportosítható (MUDA/WANT)
              </div>
              <div className="mt-0.5 text-emerald-100/80">
                Élesített célidő: ~{monthsLean} hó{" "}
                {monthsEarlier > 0 ? <span className="font-semibold text-emerald-200">({monthsEarlier} hóval korábban)</span> : null}
              </div>
            </div>
          )}
          <p
            className="kpi-label mt-1 text-[10px] text-slate-400"
            title="Csak az általános megtakarítás és a cél nevével egyező alhalmaz számít bele."
          >
            Általános megtakarítás + egyező alhalmaz számít.
          </p>
        </div>

        <BulletGraph
          item={{
            id: goal.id,
            label: "Tény vs. cél",
            actual: savings,
            target,
          }}
        />
        <div className="viz-split">
          <RevealPanel id="plan.goal" title="Részletes progresszió" kind="bullet">
            <Progress value={progress} className="h-2" />
            <p className="kpi-label mt-1 text-right text-xs text-slate-300">{progress.toFixed(1)}%</p>
          </RevealPanel>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <MiniStat
            label={
              <span className="inline-flex items-center">
                Hátralévő
                <HelpIcon kbId="goals-remaining" />
              </span>
            }
            value={formatMoney(remaining, currency)}
            exact={`Hátralévő — ennyi hiányzik a célhoz: ${formatMoney(remaining, currency)}`}
          />
          <MiniStat
            label={
              <span className="inline-flex items-center">
                Havonta ({months} hó)
                <HelpIcon kbId="goals-remaining" />
              </span>
            }
            value={formatMoney(monthly, currency)}
            highlight
            exact={`Havi ütem — ${months} hónap alatt ${formatMoney(monthly, currency)}/hó kell a határidőhöz.`}
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-full text-xs text-slate-300 hover:text-destructive"
          onClick={() => onRemove(goal.id)}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Cél törlése
        </Button>
      </CardContent>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  highlight,
  exact,
}: {
  label: React.ReactNode;
  value: string;
  highlight?: boolean;
  exact?: string;
}) {
  return (
    <div
      className={`tile-lift min-w-0 rounded-md p-1.5 ${highlight ? "ring-1 ring-white/10" : ""}`}
      data-exact={exact}
    >
      <p className="kpi-label text-[10px] uppercase tracking-wide text-slate-300">{label}</p>
      <p className="kpi-value mt-1 text-sm font-semibold text-white" title={value}>
        {value}
      </p>
    </div>
  );
}

function TransferPickerDialog({
  open,
  onOpenChange,
  incomeTxns,
  onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  incomeTxns: Transaction[];
  onPick: (t: Transaction) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Válaszd ki a bevételi tételt</DialogTitle>
        </DialogHeader>
        {incomeTxns.length === 0 ? (
          <EmptyBlock>Nincs bevételi tétel az átvezetéshez.</EmptyBlock>
        ) : (
          <ul className="max-h-80 divide-y divide-border/60 overflow-y-auto">
            {incomeTxns.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onPick(t)}
                  className="flex w-full items-center justify-between gap-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {displayTxnLabel(t)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {categoryLabel(t.category)} ·{" "}
                      {new Date(t.occurred_at).toLocaleDateString("hu-HU")}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[color:var(--color-chart-1)]">
                    +{formatMoney(Number(t.amount), CURRENCY)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SavingsTransferDialog({
  source,
  onOpenChange,
  onConfirm,
  buckets,
  onAddBucket,
  goals,
}: {
  source: Transaction | null;
  onOpenChange: (o: boolean) => void;
  onConfirm: (amount: number, note: string, bucket_id: string | null) => void;
  buckets: SavingBucket[];
  onAddBucket: (name: string) => SavingBucket | null;
  goals: Goal[];
}) {
  const max = source ? Number(source.amount) : 0;
  const [value, setValue] = useState<number>(0);
  const [note, setNote] = useState("");
  const [bucketId, setBucketId] = useState<string>("");
  const [newBucketOpen, setNewBucketOpen] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");

  useEffect(() => {
    if (source) {
      setValue(Math.round(max / 2));
      setNote("");
      setBucketId("");
      setNewBucketOpen(false);
      setNewBucketName("");
    }
  }, [source?.id, max]);

  const open = source !== null;
  const step = Math.max(1, Math.round(max / 100));
  const pct = max > 0 ? (value / max) * 100 : 0;

  const commitNewBucket = () => {
    const b = onAddBucket(newBucketName);
    if (b) setBucketId(b.id);
    setNewBucketName("");
    setNewBucketOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-[color:var(--color-chart-2)]" />
            Átvezetés megtakarításba
          </DialogTitle>
        </DialogHeader>
        {source && (
          <div className="space-y-5 pt-1">
            <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Forrás {TYPE_LABEL[source.type].toLowerCase()}
              </p>
              <p className="mt-0.5 truncate text-sm font-medium">
                {source.note?.trim() || categoryLabel(source.category)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatMoney(max, CURRENCY)} ·{" "}
                {new Date(source.occurred_at).toLocaleDateString("hu-HU")}
              </p>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Cél alhalmaz
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground"
                  onClick={() => setNewBucketOpen((o) => !o)}
                >
                  <Plus className="h-3 w-3" />
                  Új alhalmaz
                </Button>
              </div>
              <Select
                value={bucketId || "__none"}
                onValueChange={(v) => setBucketId(v === "__none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Általános megtakarítás</SelectItem>
                  {buckets.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newBucketOpen && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      autoFocus
                      placeholder="pl. Nyaralás, Vésztartalék"
                      value={newBucketName}
                      onChange={(e) => setNewBucketName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && commitNewBucket()}
                      maxLength={40}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={commitNewBucket}
                      disabled={!newBucketName.trim()}
                    >
                      Hozzáad
                    </Button>
                  </div>
                  {goals.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Cél nevével:
                      </span>
                      {goals.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setNewBucketName(g.name)}
                          className="rounded-full border border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/10 px-2 py-0.5 text-[11px] text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/20"
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    Csak azok az alhalmazok számítanak bele az aktív célba,
                    amelyek neve pontosan megegyezik a cél nevével.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Átvezetendő összeg
                </Label>
                <span className="text-xs text-muted-foreground">
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="text-3xl font-semibold tracking-tight text-[color:var(--color-chart-2)]">
                {formatMoney(value, CURRENCY)}
              </div>
              <Slider
                min={0}
                max={max}
                step={step}
                value={[value]}
                onValueChange={(v) => setValue(v[0] ?? 0)}
                className="touch-none py-2"
              />
              <div className="flex items-center justify-between gap-2">
                <Input
                  inputMode="decimal"
                  value={String(value)}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(",", "."));
                    if (Number.isFinite(n))
                      setValue(Math.max(0, Math.min(max, Math.round(n))));
                  }}
                  className="h-8 flex-1 text-sm"
                />
                <div className="flex gap-1">
                  {[25, 50, 75, 100].map((p) => (
                    <Button
                      key={p}
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs"
                      onClick={() => setValue(Math.round((max * p) / 100))}
                    >
                      {p}%
                    </Button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Marad forrásként:{" "}
                <span className="font-medium text-foreground">
                  {formatMoney(max - value, CURRENCY)}
                </span>
                {value >= max && (
                  <span className="ml-1 rounded bg-muted px-1.5 py-0.5">
                    teljes tétel áthelyezve
                  </span>
                )}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transfer-note" className="text-xs">
                Megjegyzés (opcionális)
              </Label>
              <Input
                id="transfer-note"
                placeholder="pl. vésztartalék"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
          <Button
            onClick={() => onConfirm(value, note, bucketId || null)}
            disabled={value <= 0}
          >
            Átvezetés
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const txnFormSchema = z.object({
  type: z.enum(["income", "expense", "saving"]),
  amount: z.number().positive().max(1e12),
  category: z.string().min(1).max(64),
  note: z.string().max(500).nullable(),
  occurred_at: z.string(),
});

function TxnDialog({
  onSave,
  onUpdate,
  onDelete,
  editing,
  defaultType,
  open: openProp,
  onOpenChange,
  trigger,
  settings,
  onAddCategory,
  onAddBucket,
  businessMode,
  defaultVat,
  onManageLocations,
  onManageProjects,
  onManageAssets,
  incomeTxns,
  loans,
  activeWorkspace,
  wsOptions,
  workspaceKind,
  projectMode,
}: {
  onSave: (t: { type: TxnType; occurred_at: string; payload: TxnPayload }) => void;
  onUpdate?: (
    id: string,
    t: { type: TxnType; occurred_at: string; payload: TxnPayload },
  ) => void;
  onDelete?: (id: string) => void;
  editing?: Transaction | null;
  defaultType?: TxnType;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  trigger?: React.ReactNode | null;
  settings: CustomSettings;
  onAddCategory: (kind: "income" | "expense", label: string) => void;
  onAddBucket: (name: string) => SavingBucket | null;
  businessMode?: boolean;
  defaultVat?: number;
  onManageLocations?: () => void;
  onManageProjects?: () => void;
  onManageAssets?: () => void;
  incomeTxns?: Transaction[];
  loans?: Loan[];
  activeWorkspace: string;
  wsOptions: string[];
  workspaceKind: "personal" | "business" | "project" | "sum";
  projectMode?: "simulation" | "pilot" | "prep" | null;
}) {
  const isBankImmutable = Boolean(editing?.bank_raw_id);
  const [openState, setOpenState] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openState;
  const setOpen = (o: boolean) => {
    if (!isControlled) setOpenState(o);
    onOpenChange?.(o);
  };
  const [type, setType] = useState<TxnType>(editing?.type ?? defaultType ?? "expense");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [eurAmount, setEurAmount] = useState(editing?.eur_amount != null ? String(editing.eur_amount) : "");
  const [eurRate, setEurRate] = useState(editing?.eur_rate != null ? String(editing.eur_rate) : "");
  const [category, setCategory] = useState<string>(editing?.category ?? "food");
  const [title, setTitle] = useState<string>(editing?.title ?? "");
  const [party, setParty] = useState<string>(editing?.party ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "cash" | "">(editing?.payment_method ?? "");
  const [tags, setTags] = useState<string>((editing?.tags ?? []).join(", "));
  const [locationId, setLocationId] = useState<string>(editing?.location_id ?? "");
  const personalRealEstateProperties = useMemo(() => {
    const ws = (settings.workspaces ?? []).find((w: any) => w.id === "personal") as any;
    const list = ws?.realEstateProperties;
    return Array.isArray(list) ? (list as any[]) : [];
  }, [settings.workspaces]);
  const isPersonalTxnScope = (editing?.workspace ?? activeWorkspace) === "personal";
  const [propertyId, setPropertyId] = useState<string>((editing as any)?.property_id ?? "");
  const [projectId, setProjectId] = useState<string>(editing?.project_id ?? "");
  const [assetId, setAssetId] = useState<string>(editing?.asset_id ?? "");
  const [costKind, setCostKind] = useState<CostKind>(
    (editing?.cost_kind as CostKind | null) ?? "opex",
  );
  const [isAsset, setIsAsset] = useState<boolean>(Boolean(editing?.is_asset));
  const [bucketId, setBucketId] = useState<string>(editing?.bucket_id ?? "");
  const [loanId, setLoanId] = useState<string>(editing?.loan_id ?? "");
  const [loanPrincipalPaid, setLoanPrincipalPaid] = useState<string>(
    editing?.loan_principal_paid != null ? String(editing.loan_principal_paid) : "",
  );
  const [note, setNote] = useState(editing?.note ?? "");
  const [date, setDate] = useState(
    editing
      ? new Date(editing.occurred_at).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );
  const [vatRate, setVatRate] = useState<string>(
    editing?.vat_rate != null ? String(editing.vat_rate) : String(defaultVat ?? 0),
  );
  const [vatDeduct, setVatDeduct] = useState<VatDeductibility>(
    (editing?.vat_deductibility as VatDeductibility | null) ?? 1,
  );
  const [isResale, setIsResale] = useState<boolean>(Boolean(editing?.is_resale));
  const [customerName, setCustomerName] = useState<string>(editing?.customer_name ?? "");
  const [linkedRevenueId, setLinkedRevenueId] = useState<string>(editing?.linked_revenue_id ?? "");
  const [internalOn, setInternalOn] = useState<boolean>(Boolean(editing?.internal_transfer_kind));
  const [internalTo, setInternalTo] = useState<string>(editing?.internal_transfer_to ?? "");
  const [amountMode, setAmountMode] = useState<"net" | "gross">("net");
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newBucketOpen, setNewBucketOpen] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");
  const [txnStatus, setTxnStatus] = useState<"planned" | "committed" | "actual">(
    (editing?.status as any) ??
      (workspaceKind === "project" && projectMode === "simulation" ? "planned" : "actual"),
  );
  const [invoiceStatus, setInvoiceStatus] = useState<"unpaid" | "pending" | "paid" | "">(
    (editing?.invoice_status as any) ?? "",
  );

  const netHufTxn = useCallback((t: Transaction) => {
    const huf = Number(t.amount ?? 0);
    const eur = Number(t.eur_amount ?? 0);
    const rate = Number(t.eur_rate ?? 0);
    const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
    return huf + eurHuf;
  }, []);

  const currentHufNet = useMemo(() => {
    const r = Number(vatRate.replace(",", "."));
    const rate = Number.isFinite(r) ? Math.max(0, r) : defaultVat ?? 0;
    const huf = Number(amount.replace(",", "."));
    const base = Number.isFinite(huf) ? Math.max(0, huf) : 0;
    return amountMode === "gross" ? computeVatSplit(base, rate, "gross").net : base;
  }, [amount, amountMode, defaultVat, vatRate]);

  const canInternalTransfer =
    !isBankImmutable &&
    activeWorkspace !== "__all" &&
    type !== "saving" &&
    (activeWorkspace === "personal" ||
      activeWorkspace.toLowerCase().startsWith("vállalkozás") ||
      activeWorkspace.toLowerCase().startsWith("vallalkozas"));
  const internalKind: "member_loan_out" | "member_loan_repay" = useMemo(() => {
    if (editing?.internal_transfer_kind === "member_loan_out" || editing?.internal_transfer_kind === "member_loan_repay") {
      return editing.internal_transfer_kind;
    }
    return activeWorkspace === "personal" ? "member_loan_out" : "member_loan_repay";
  }, [activeWorkspace, editing?.internal_transfer_kind]);
  const internalLabel =
    internalKind === "member_loan_out"
      ? "Tagi befizetés / Tagi kölcsön nyújtása (Magán → Vállalkozás)"
      : "Tagi kölcsön visszafizetése (Vállalkozás → Magán)";
  const internalTargets = useMemo(() => {
    const isBiz = (w: string) =>
      w.toLowerCase().startsWith("vállalkozás") || w.toLowerCase().startsWith("vallalkozas");
    if (activeWorkspace === "personal") return (wsOptions ?? []).filter(isBiz);
    return ["personal"];
  }, [activeWorkspace, wsOptions]);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type);
      setAmount(String(editing.amount));
      setEurAmount(editing.eur_amount != null ? String(editing.eur_amount) : "");
      setEurRate(editing.eur_rate != null ? String(editing.eur_rate) : "");
      setCategory(editing.category);
      setTitle(editing.title ?? "");
      setParty(editing.party ?? "");
      setPaymentMethod(editing.payment_method ?? "");
      setTags((editing.tags ?? []).join(", "));
      setLocationId(editing.location_id ?? "");
      setPropertyId((editing as any).property_id ?? "");
      setProjectId(editing.project_id ?? "");
      setAssetId(editing.asset_id ?? "");
      setCostKind(((editing.cost_kind as any) ?? "opex") as CostKind);
      setIsAsset(Boolean(editing.is_asset));
      setBucketId(editing.bucket_id ?? "");
      setLoanId(editing.loan_id ?? "");
      setLoanPrincipalPaid(editing.loan_principal_paid != null ? String(editing.loan_principal_paid) : "");
      setNote(editing.note ?? "");
      setDate(new Date(editing.occurred_at).toISOString().slice(0, 10));
      setAmountMode("net");
      setVatDeduct(
        editing.vat_deductibility === 1 ||
          editing.vat_deductibility === 0.5 ||
          editing.vat_deductibility === 0
          ? (editing.vat_deductibility as VatDeductibility)
          : 1,
      );
      setIsResale(Boolean(editing.is_resale));
      setCustomerName(editing.customer_name ?? "");
      setLinkedRevenueId(editing.linked_revenue_id ?? "");
      setTxnStatus((editing.status as any) ?? "actual");
      setInvoiceStatus((editing.invoice_status as any) ?? "");
      setInternalOn(
        editing.internal_transfer_kind === "member_loan_out" ||
          editing.internal_transfer_kind === "member_loan_repay",
      );
      setInternalTo(editing.internal_transfer_to ?? "");
    } else if (defaultType) {
      setType(defaultType);
      setTxnStatus(workspaceKind === "project" && projectMode === "simulation" ? "planned" : "actual");
      setInvoiceStatus("");
    }
    setNewCatOpen(false);
    setNewCatLabel("");
    setNewBucketOpen(false);
    setNewBucketName("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing?.id]);

  const categoryOptions = useMemo<string[]>(() => {
    const INTERNAL_INCOME = "PÉNZÜGYI BEVÉTELEK: Tagi kölcsön befizetés";
    const INTERNAL_EXPENSE = "PÉNZÜGYI KIADÁSOK: Tagi kölcsön kifizetés";
    if (type === "income")
      return [
        ...(businessMode
          ? [...BUSINESS_INCOME_CATEGORIES, ...settings.incomeCategories]
          : [...INCOME_CATEGORIES, ...settings.incomeCategories]),
        ...(internalOn ? [INTERNAL_INCOME] : []),
      ];
    if (type === "saving") return ["savings"];
    return [
      ...(businessMode
        ? [...BUSINESS_EXPENSE_CATEGORIES, ...settings.expenseCategories]
        : [...EXPENSE_CATEGORIES, ...settings.expenseCategories]),
      ...(internalOn ? [INTERNAL_EXPENSE] : []),
    ];
  }, [type, settings.incomeCategories, settings.expenseCategories, businessMode, internalOn]);

  useEffect(() => {
    if (!categoryOptions.includes(category)) {
      setCategory(categoryOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, categoryOptions.length]);

  const commitNewCategory = () => {
    if (type === "saving") return;
    const trimmed = newCatLabel.trim();
    if (!trimmed) return;
    onAddCategory(type, trimmed);
    setCategory(trimmed);
    setNewCatLabel("");
    setNewCatOpen(false);
  };

  const commitNewBucket = () => {
    const b = onAddBucket(newBucketName);
    if (b) setBucketId(b.id);
    setNewBucketName("");
    setNewBucketOpen(false);
  };

  const submit = async () => {
    const effectiveType: TxnType = internalOn ? "expense" : type;
    const inputHuf = Number(amount.replace(",", "."));
    const parsed = txnFormSchema.safeParse({
      type: effectiveType,
      amount: Number.isFinite(inputHuf) ? inputHuf : NaN,
      category,
      note: note.trim() || null,
      occurred_at: new Date(date).toISOString(),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const eurN = Number(eurAmount.replace(",", "."));
    const eurR = Number(eurRate.replace(",", "."));
    const eurInput =
      eurAmount.trim() && Number.isFinite(eurN) ? Math.max(0, eurN) : null;
    const eurRateNum =
      eurRate.trim() && Number.isFinite(eurR) ? Math.max(0, eurR) : null;
    if (eurInput && !eurRateNum) {
      toast.error("EUR összeghez kötelező árfolyamot megadni.");
      return;
    }
    const vatNum = Number(vatRate.replace(",", "."));
    const rate = businessMode
      ? Number.isFinite(vatNum)
        ? Math.max(0, vatNum)
        : (defaultVat ?? 0)
      : 0;

    let hufNet =
      businessMode && amountMode === "gross"
        ? computeVatSplit(parsed.data.amount, rate, "gross").net
        : parsed.data.amount;
    const eurNet =
      eurInput == null
        ? null
        : businessMode && amountMode === "gross"
          ? computeVatSplit(eurInput, rate, "gross").net
          : eurInput;

    if (isBankImmutable && editing?.bank_raw_id) {
      const raw = await localdb.getBankRaw(editing.bank_raw_id);
      if (raw) {
        const gross = Math.abs(raw.amount_signed);
        const treatment = (editing.vat_treatment ?? "hu_gross") as any;
        hufNet =
          treatment === "hu_gross" ? computeVatSplit(gross, rate, "gross").net : gross;
      }
    }
    const payload: TxnPayload = {
      amount: hufNet,
      category: parsed.data.category,
      title: title.trim() || null,
      party: businessMode ? (party.trim() || null) : null,
      payment_method: businessMode ? (paymentMethod || null) : null,
      source: editing?.bank_raw_id ? "bank" : "manual",
      bank_raw_id: editing?.bank_raw_id ?? null,
      tags: businessMode
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 12)
        : [],
      location_id: businessMode ? (locationId.trim() || null) : null,
      property_id: !businessMode && isPersonalTxnScope ? (propertyId.trim() || null) : null,
      project_id: businessMode ? (projectId.trim() || null) : null,
      asset_id: businessMode ? (assetId.trim() || null) : null,
      cost_kind: businessMode ? costKind : null,
      is_asset: businessMode ? Boolean(isAsset) : false,
      vat_deductibility: businessMode ? vatDeduct : null,
      is_resale: businessMode ? Boolean(isResale) : false,
      customer_name: businessMode && isResale ? (customerName.trim() || null) : null,
      linked_revenue_id: businessMode && isResale ? (linkedRevenueId.trim() || null) : null,
      calculated_margin:
        businessMode && isResale && linkedRevenueId.trim()
          ? (() => {
              const rev = (incomeTxns ?? []).find((x) => x.id === linkedRevenueId.trim());
              const revNet = rev ? netHufTxn(rev) : 0;
              const margin = revNet - hufNet;
              const pct = revNet > 0 ? (margin / revNet) * 100 : 0;
              return { huf: margin, pct };
            })()
          : null,
      note: parsed.data.note,
      bucket_id: type === "saving" ? bucketId || null : null,
      vat_rate: businessMode
        ? rate
        : null,
      eur_amount: eurNet,
      eur_rate: eurRateNum,
      status: workspaceKind === "project" ? txnStatus : "actual",
      invoice_status: invoiceStatus || null,
      workspace: editing?.workspace ?? (activeWorkspace === "__all" ? "personal" : activeWorkspace),
      loan_id:
        type === "expense" &&
        (category === "loan_repayment" || category === "PÉNZÜGYI KIADÁSOK: Hitel törlesztés") &&
        loanId.trim()
          ? loanId.trim()
          : null,
      loan_principal_paid:
        type === "expense" &&
        (category === "loan_repayment" || category === "PÉNZÜGYI KIADÁSOK: Hitel törlesztés") &&
        loanId.trim()
          ? (() => {
              const x = Number(String(loanPrincipalPaid ?? "").replace(/\s+/g, "").replace(",", "."));
              if (!loanPrincipalPaid.trim() || !Number.isFinite(x)) return null;
              return Math.max(0, x);
            })()
          : null,
    };
    if (internalOn && canInternalTransfer) {
      const to = internalTargets.includes(internalTo) ? internalTo : (internalTargets[0] ?? "");
      payload.internal_transfer_kind = internalKind;
      payload.internal_transfer_from = activeWorkspace;
      payload.internal_transfer_to = to || (internalKind === "member_loan_out" ? (internalTargets[0] ?? "") : "personal");
      payload.vat_rate = 0;
      payload.vat_treatment = "no_vat";
      payload.vat_review = false;
      payload.vat_deductibility = 0;
      payload.status = "actual";
      // Make it visually explicit even in personal mode (no title field)
      if (!payload.note) payload.note = internalKind === "member_loan_out" ? "Tagi befizetés / kölcsön" : "Tagi kölcsön visszafizetés";
    }
    if (editing && onUpdate) {
      onUpdate(editing.id, {
        type: internalOn ? "expense" : parsed.data.type,
        occurred_at: parsed.data.occurred_at,
        payload,
      });
    } else {
      onSave({
        type: internalOn ? "expense" : parsed.data.type,
        occurred_at: parsed.data.occurred_at,
        payload,
      });
    }
    setOpen(false);
    if (!editing) {
      setAmount("");
      setNote("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Új tétel
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="flex w-full max-w-2xl flex-col overflow-hidden p-0 max-h-[85vh]">
        <div className="p-4 pb-3">
          <DialogHeader>
            <DialogTitle>{editing ? "Tétel szerkesztése" : "Új tétel rögzítése"}</DialogTitle>
          </DialogHeader>

          <Tabs value={type} onValueChange={(v) => setType(v as TxnType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="expense">Kiadás</TabsTrigger>
              <TabsTrigger value="income">Bevétel</TabsTrigger>
              <TabsTrigger value="saving">Megtakarítás</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4 px-4 pb-4 md:grid-cols-2">
          {canInternalTransfer && (
            <div className="rounded-lg border bg-[color:var(--color-chart-6)]/5 p-3 md:col-span-2 border-l-4 border-l-[color:var(--color-chart-6)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">Belső átvezetés (tagi)</div>
                  <div className="text-[11px] text-muted-foreground">{internalLabel}</div>
                </div>
                <Button
                  type="button"
                  variant={internalOn ? "default" : "outline"}
                  className="h-8"
                  onClick={() => {
                    setInternalOn((v) => {
                      const next = !v;
                      if (next) {
                        setType("expense");
                        setVatRate("0");
                        setVatDeduct(0);
                        if (!internalTo) setInternalTo(internalTargets[0] ?? "");
                      }
                      return next;
                    });
                  }}
                  title="Belső átvezetés bekapcsolása"
                >
                  {internalOn ? "Bekapcsolva" : "Kikapcsolva"}
                </Button>
              </div>

              {internalOn && internalKind === "member_loan_out" && (
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Cél vállalkozás</Label>
                    <Select
                      value={internalTo || "__none"}
                      onValueChange={(v) => setInternalTo(v === "__none" ? "" : v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">—</SelectItem>
                        {internalTargets.map((w) => (
                          <SelectItem key={w} value={w}>
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-md border bg-background/40 p-3 text-xs text-muted-foreground">
                    Automatikus: 0% ÁFA, és a Szumma/P&L nézetből kiejtve.
                  </div>
                </div>
              )}

              {internalOn && internalKind === "member_loan_repay" && (
                <div className="mt-3 rounded-md border bg-background/40 p-3 text-xs text-muted-foreground">
                  Cél: <span className="font-mono text-foreground">Magán</span>. Automatikus: 0% ÁFA, és a Szumma/P&L
                  nézetből kiejtve.
                </div>
              )}
            </div>
          )}
          {businessMode && (
            <div className="grid gap-2 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <Label>ÁFA kulcs</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">%</span>
                  <Input
                    inputMode="decimal"
                    className="h-8 w-20 text-right"
                    placeholder={String(defaultVat ?? 27)}
                    value={vatRate}
                    onChange={(e) => setVatRate(e.target.value)}
                  />
                </div>
              </div>
              <Slider
                min={0}
                max={40}
                step={1}
                value={[
                  Math.max(
                    0,
                    Math.min(40, Number.isFinite(Number(vatRate.replace(",", "."))) ? Number(vatRate.replace(",", ".")) : (defaultVat ?? 0)),
                  ),
                ]}
                onValueChange={(v) => setVatRate(String(v[0] ?? defaultVat ?? 0))}
                className="touch-none py-2"
              />
              <p className="text-[11px] text-muted-foreground">
                Alapérték HUF EU-n belüli 27%. Tételenként felülírható (pl. 5, 18, 0).
              </p>
            </div>
          )}

          <div className={cn("grid gap-3 md:col-span-2", businessMode && "rounded-lg border bg-muted/20 p-3")}>
            {businessMode && (
              <div className="flex items-center justify-between gap-3">
                <Label>Bevitel mód</Label>
                <Tabs value={amountMode} onValueChange={(v) => setAmountMode(v as "net" | "gross")}>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="net">Nettó</TabsTrigger>
                    <TabsTrigger value="gross">Bruttó</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            <div className={cn("grid gap-3", businessMode ? "grid-cols-2" : "grid-cols-1")}>
              <div className="grid gap-2">
                <Label htmlFor="amount">
                  {businessMode ? (amountMode === "gross" ? "Bruttó összeg (HUF)" : "Nettó összeg (HUF)") : "Összeg"}
                </Label>
                <Input
                  id="amount"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  disabled={isBankImmutable}
                />
              </div>

              {businessMode && (
                <div className="grid gap-2">
                  <Label>
                    {amountMode === "gross" ? "Számított nettó (HUF)" : "Számított bruttó (HUF)"}
                  </Label>
                  {(() => {
                    const r = Number(vatRate.replace(",", "."));
                    const rate = Number.isFinite(r) ? Math.max(0, r) : defaultVat ?? 0;
                    const huf = Number(amount.replace(",", "."));
                    const base = Number.isFinite(huf) ? Math.max(0, huf) : 0;
                    const s =
                      amountMode === "gross"
                        ? computeVatSplit(base, rate, "gross")
                        : computeVatSplit(base, rate, "net");
                    const v = amountMode === "gross" ? s.net : s.gross;
                    return (
                      <Input
                        readOnly
                        value={formatMoney(Math.round(v), CURRENCY)}
                        className="bg-muted/30"
                      />
                    );
                  })()}
                </div>
              )}
            </div>

            {businessMode && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="eur-amount">
                    {amountMode === "gross" ? "Deviza bruttó (EUR)" : "Deviza nettó (EUR)"}
                  </Label>
                  <Input
                    id="eur-amount"
                    inputMode="decimal"
                    placeholder="0"
                    value={eurAmount}
                    onChange={(e) => setEurAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="eur-rate">EUR árfolyam (HUF/EUR)</Label>
                  <Input
                    id="eur-rate"
                    inputMode="decimal"
                    placeholder="pl. 390"
                    value={eurRate}
                    onChange={(e) => setEurRate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Deviza nettó (EUR→HUF)</Label>
                  {(() => {
                    const r = Number(vatRate.replace(",", "."));
                    const ratePct = Number.isFinite(r) ? Math.max(0, r) : defaultVat ?? 0;
                    const eurN = Number(eurAmount.replace(",", "."));
                    const eurR = Number(eurRate.replace(",", "."));
                    const eurBase = eurAmount.trim() && Number.isFinite(eurN) ? Math.max(0, eurN) : 0;
                    const fx = eurRate.trim() && Number.isFinite(eurR) ? Math.max(0, eurR) : 0;
                    const eurNet =
                      amountMode === "gross" ? computeVatSplit(eurBase, ratePct, "gross").net : eurBase;
                    const eurHufNet = eurNet > 0 && fx > 0 ? eurNet * fx : 0;
                    return (
                      <Input
                        readOnly
                        value={formatMoney(Math.round(eurHufNet), CURRENCY)}
                        className="bg-muted/30"
                      />
                    );
                  })()}
                </div>
              </div>
            )}

            {businessMode && (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                {(() => {
                  const r = Number(vatRate.replace(",", "."));
                  const rate = Number.isFinite(r) ? Math.max(0, r) : defaultVat ?? 0;

                  const huf = Number(amount.replace(",", "."));
                  const hufBase = Number.isFinite(huf) ? Math.max(0, huf) : 0;
                  const hufNet =
                    amountMode === "gross"
                      ? computeVatSplit(hufBase, rate, "gross").net
                      : hufBase;
                  const hufGross =
                    amountMode === "gross"
                      ? hufBase
                      : computeVatSplit(hufBase, rate, "net").gross;

                  const eurN = Number(eurAmount.replace(",", "."));
                  const eurR = Number(eurRate.replace(",", "."));
                  const eurBase = eurAmount.trim() && Number.isFinite(eurN) ? Math.max(0, eurN) : 0;
                  const fx = eurRate.trim() && Number.isFinite(eurR) ? Math.max(0, eurR) : 0;
                  const eurNet =
                    amountMode === "gross"
                      ? computeVatSplit(eurBase, rate, "gross").net
                      : eurBase;
                  const eurHufNet = eurNet > 0 && fx > 0 ? eurNet * fx : 0;
                  const totalNet = hufNet + eurHufNet;
                  const split = computeVatSplit(totalNet, rate, "net");
                  const eurHufGross = eurBase > 0 && fx > 0 ? eurBase * fx : 0;

                  return (
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">HUF nettó / bruttó</span>
                        <span className="font-medium">
                          {formatMoney(Math.round(hufNet), CURRENCY)} · {formatMoney(Math.round(hufGross), CURRENCY)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">EUR→HUF nettó</span>
                        <span className="font-medium">
                          {formatMoney(Math.round(eurHufNet), CURRENCY)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">EUR→HUF bruttó (ha bruttót adtál meg)</span>
                        <span className="font-medium">
                          {formatMoney(Math.round(eurHufGross), CURRENCY)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Nettó összesen (HUF)</span>
                        <span className="font-medium">{formatMoney(split.net, CURRENCY)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">ÁFA</span>
                        <span className="font-medium">{formatMoney(split.vat, CURRENCY)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Bruttó összesen (banki pénzmozgás)</span>
                        <span className="font-semibold">{formatMoney(split.gross, CURRENCY)}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Mentéskor nettót tárolunk; a bruttó/napi FX csak megjelenítés és tervezés.
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {type !== "saving" && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Kategória</Label>
                <HelpIcon kbId="loan-repayment-linking" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground"
                  onClick={() => setNewCatOpen((o) => !o)}
                >
                  <Plus className="h-3 w-3" />
                  Új kategória
                </Button>
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newCatOpen && (
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    placeholder="pl. Sport, Előfizetések"
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && commitNewCategory()}
                    maxLength={40}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={commitNewCategory}
                    disabled={!newCatLabel.trim()}
                  >
                    Hozzáad
                  </Button>
                </div>
              )}
            </div>
          )}

          {type === "expense" &&
            (category === "loan_repayment" || category === "PÉNZÜGYI KIADÁSOK: Hitel törlesztés") && (
              <div className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-3">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Kapcsolódó hitel / tartozás</Label>
                    <HelpIcon kbId="loan-repayment-linking" />
                  </div>
                  <Select value={loanId || "__none"} onValueChange={(v) => setLoanId(v === "__none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">—</SelectItem>
                      {(loans ?? [])
                        .filter((l) => (l.status ?? "active") === "active")
                        .filter((l) => (l.workspace_id ?? "personal") === activeWorkspace)
                        .map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="text-[11px] text-muted-foreground">
                    Ha kiválasztod, a mentés automatikusan csökkenti a fennálló tőketartozást.
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Tőkerész (Ft) — opcionális</Label>
                    <HelpIcon kbId="loan-repayment-linking" />
                  </div>
                  <Input
                    inputMode="decimal"
                    value={loanPrincipalPaid}
                    onChange={(e) => setLoanPrincipalPaid(e.currentTarget.value)}
                    placeholder="Alapértelmezés: teljes összeg"
                  />
                  <div className="text-[11px] text-muted-foreground">
                    Ha üresen hagyod, a teljes tételösszeget tőketörlesztésnek vesszük (konzervatív).
                  </div>
                </div>
              </div>
            )}

          {type !== "saving" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-2">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="txn-description">Tétel pontos megnevezése / Leírás</Label>
                <Input
                  id="txn-description"
                  placeholder="pl. Lidl bevásárlás, Irodaszer, Kávézó…"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                />
              </div>
              {businessMode ? (
                <div className="grid gap-2">
                  <Label htmlFor="party">Partner / Ellenoldal (opcionális)</Label>
                  <Input
                    id="party"
                    placeholder="pl. ügyfél / beszállító / partner"
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                    maxLength={160}
                    disabled={isBankImmutable}
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="txn-description">Tétel pontos megnevezése / Leírás</Label>
              <Input
                id="txn-description"
                placeholder="pl. megtakarítás célja"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
              />
            </div>
          )}

          {businessMode && type !== "saving" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Fizetés módja</Label>
                <Select
                  value={paymentMethod || "__none"}
                  onValueChange={(v) =>
                    setPaymentMethod(v === "__none" ? "" : (v as "transfer" | "cash"))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">—</SelectItem>
                    <SelectItem value="transfer">Utalás</SelectItem>
                    <SelectItem value="cash">Készpénz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Címkék (opcionális)</Label>
                <Input
                  id="tags"
                  placeholder="pl. telephely, beszerzés, fejlesztés"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  maxLength={160}
                />
                <p className="text-[11px] text-muted-foreground">
                  Vesszővel elválasztva. Példa: <span className="font-mono">fix, telephely, eszköz</span>
                </p>
              </div>
            </div>
          )}

          {businessMode && type !== "saving" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Telephely / raktár (opcionális)</Label>
                  {onManageLocations && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[11px] text-muted-foreground"
                      onClick={onManageLocations}
                    >
                      Beállítás
                    </Button>
                  )}
                </div>
                <Select
                  value={locationId || "__none"}
                  onValueChange={(v) => setLocationId(v === "__none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">—</SelectItem>
                    {(settings.locations ?? []).map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Projekt (opcionális)</Label>
                <div className="flex items-center justify-between">
                  <span />
                  {onManageProjects && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[11px] text-muted-foreground"
                      onClick={onManageProjects}
                    >
                      Beállítás
                    </Button>
                  )}
                </div>
                <Select
                  value={projectId || "__none"}
                  onValueChange={(v) => setProjectId(v === "__none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">—</SelectItem>
                    {(settings.projects ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {!businessMode && isPersonalTxnScope && (
            <div className="grid gap-2">
              <Label>Ingatlan költséghely (opcionális)</Label>
              {personalRealEstateProperties.length === 0 ? (
                <div className="rounded-md border border-border/60 bg-muted/20 p-2 text-xs text-muted-foreground">
                  Nincs felvett ingatlan. Add hozzá: Beállítások → Munkaterületek → Magán → 🧩 Erőforrások → 🏠 Ingatlanok.
                </div>
              ) : (
                <Select value={propertyId || "__none"} onValueChange={(v) => setPropertyId(v === "__none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">—</SelectItem>
                    {personalRealEstateProperties.map((p: any) => (
                      <SelectItem key={String(p.id)} value={String(p.id)}>
                        {String(p.name ?? "Ingatlan")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {businessMode && type !== "saving" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Típus</Label>
                <Select value={costKind} onValueChange={(v) => setCostKind(v as CostKind)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opex">Üzemeltetési költség (OPEX)</SelectItem>
                    <SelectItem value="capex">Tárgyi eszköz / Beruházás (CAPEX)</SelectItem>
                    <SelectItem value="maintenance">Karbantartás</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>ÁFA levonhatóság</Label>
                <Select
                  value={String(vatDeduct)}
                  onValueChange={(v) => setVatDeduct((Number(v) as VatDeductibility) ?? 1)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">100% Levonható</SelectItem>
                    <SelectItem value="0.5">50% Levonható</SelectItem>
                    <SelectItem value="0">0% Nem levonható</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {businessMode && type === "expense" && (
            <div className="rounded-lg border bg-muted/20 p-3 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-sm">Továbbértékesítés</Label>
                <Button
                  type="button"
                  variant={isResale ? "default" : "outline"}
                  className="h-8"
                  onClick={() => setIsResale((v) => !v)}
                >
                  {isResale ? "Bekapcsolva" : "Kikapcsolva"}
                </Button>
              </div>
              {isResale && (
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="resale-customer">Vevő / partner</Label>
                    <Input
                      id="resale-customer"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="pl. Ügyfél Kft."
                      maxLength={160}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Kapcsolódó bevétel</Label>
                    <Select
                      value={linkedRevenueId || "__none"}
                      onValueChange={(v) => setLinkedRevenueId(v === "__none" ? "" : v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">—</SelectItem>
                        {(incomeTxns ?? []).slice(0, 100).map((it) => (
                          <SelectItem key={it.id} value={it.id}>
                            {new Date(it.occurred_at).toISOString().slice(0, 10)} ·{" "}
                            {formatMoney(Math.round(netHufTxn(it)), CURRENCY)} ·{" "}
                            {displayTxnLabel(it).slice(0, 40)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {linkedRevenueId && (
                    <div className="md:col-span-2 rounded-md border bg-background/40 p-3 text-xs">
                      {(() => {
                        const rev = (incomeTxns ?? []).find((x) => x.id === linkedRevenueId);
                        const revNet = rev ? netHufTxn(rev) : 0;
                        const purchaseNet = currentHufNet;
                        const margin = revNet - purchaseNet;
                        const pct = revNet > 0 ? (margin / revNet) * 100 : 0;
                        return (
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-muted-foreground">
                              Számított árrés (nettó):{" "}
                              <span className="font-mono text-foreground">
                                {formatMoney(Math.round(margin), CURRENCY)}
                              </span>{" "}
                              <span className="font-mono text-foreground">({pct.toFixed(1)}%)</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              (Bevétel nettó − Beszerzés nettó)
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {businessMode && type === "expense" && costKind === "capex" && currentHufNet > 200_000 && !assetId && (
            <div className="rounded-md border bg-background/40 p-3 text-xs">
              <div className="font-medium">Javaslat</div>
              <div className="mt-1 text-muted-foreground">
                CAPEX + 200 000 Ft felett érdemes leltár-eszközként nyilvántartani (TCO / karbantartások miatt).
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => {
                    setIsAsset(true);
                    onManageAssets?.();
                  }}
                >
                  Felveszem leltárba
                </Button>
                <span className="text-[11px] text-muted-foreground">
                  Tipp: előbb mentsd a tételt, utána az eszköz listában gyorsan hozzárendelhető.
                </span>
              </div>
            </div>
          )}

          {businessMode && type !== "saving" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Leltári eszköz (opcionális)</Label>
                  {onManageAssets && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[11px] text-muted-foreground"
                      onClick={onManageAssets}
                    >
                      Beállítás
                    </Button>
                  )}
                </div>
                <Select
                  value={assetId || "__none"}
                  onValueChange={(v) => {
                    const next = v === "__none" ? "" : v;
                    setAssetId(next);
                    if (next) setIsAsset(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">—</SelectItem>
                    {(settings.assets ?? []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Tárgyi eszköz</Label>
                <Button
                  type="button"
                  variant={isAsset ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setIsAsset((v) => !v)}
                >
                  {isAsset ? "Igen (leltárba)" : "Nem"}
                </Button>
              </div>
            </div>
          )}

          {type === "saving" && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Alhalmaz</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground"
                  onClick={() => setNewBucketOpen((o) => !o)}
                >
                  <Plus className="h-3 w-3" />
                  Új alhalmaz
                </Button>
              </div>
              <Select
                value={bucketId || "__none"}
                onValueChange={(v) => setBucketId(v === "__none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Általános megtakarítás</SelectItem>
                  {settings.buckets.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newBucketOpen && (
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    placeholder="pl. Nyaralás, Vésztartalék"
                    value={newBucketName}
                    onChange={(e) => setNewBucketName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && commitNewBucket()}
                    maxLength={40}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={commitNewBucket}
                    disabled={!newBucketName.trim()}
                  >
                    Hozzáad
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="date">Dátum</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isBankImmutable}
            />
            {isBankImmutable && (
              <p className="text-[11px] text-muted-foreground">
                Banki import dátuma módosíthatatlan (immutable).
              </p>
            )}
          </div>

          {workspaceKind === "project" && (
            <div className="grid gap-2 md:col-span-2">
              <Label>Státusz (projekt)</Label>
              <Select value={txnStatus} onValueChange={(v) => setTxnStatus(v as any)} disabled={isBankImmutable}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Tervezett</SelectItem>
                  <SelectItem value="committed">Lekötött</SelectItem>
                  <SelectItem value="actual">Tényleges</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-[11px] text-muted-foreground">
                Szimuláció módban az alapértelmezett a “Tervezett”.
              </div>
            </div>
          )}

          <div className="grid gap-2 md:col-span-2">
            <Label>Számla státusz</Label>
            <Select
              value={invoiceStatus || "__none"}
              onValueChange={(v) => setInvoiceStatus(v === "__none" ? "" : (v as any))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">—</SelectItem>
                <SelectItem value="unpaid">Fizetetlen</SelectItem>
                <SelectItem value="pending">Folyamatban</SelectItem>
                <SelectItem value="paid">Kifizetve</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isBankImmutable && note.trim() ? (
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="bank-note">Nyers banki közlemény (Bank Note)</Label>
              <Textarea
                id="bank-note"
                rows={2}
                readOnly
                value={note}
                className="bg-muted/30"
              />
              <div className="text-[11px] text-muted-foreground">
                Ez a banki közlemény mező (nyers import) — nem szerkeszthető. A pontos megnevezést fent add meg.
              </div>
            </div>
          ) : null}

          {!isBankImmutable ? (
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="note">Megjegyzés (opcionális)</Label>
              <Textarea
                id="note"
                rows={2}
                maxLength={500}
                placeholder="pl. extra részletek, belső megjegyzés…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          ) : null}
        </div>
        </div>

        <div className="sticky bottom-0 border-t border-border/60 bg-background/80 backdrop-blur">
          <div className="flex items-center justify-between gap-2 p-3">
            {editing && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                className="h-9"
                onClick={() => onDelete(editing.id)}
                title="Törlés"
              >
                Törlés
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="h-9" onClick={() => setOpen(false)}>
                Mégse
              </Button>
              <Button className="h-9" onClick={submit}>
                Mentés
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const goalFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  target_amount: z.number().positive().max(1e12),
  deadline: z.string(),
});

function GoalDialog({
  onSave,
  trigger,
  properties,
}: {
  onSave: (g: { deadline: string; payload: GoalPayload }) => void;
  trigger?: React.ReactNode | null;
  properties?: Array<{ id: string; name: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const defaultDeadline = new Date(new Date().setMonth(new Date().getMonth() + 6))
    .toISOString()
    .slice(0, 10);
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [propertyId, setPropertyId] = useState<string>("__none");

  const submit = () => {
    const t = Number(target.replace(",", "."));
    const parsed = goalFormSchema.safeParse({ name, target_amount: t, deadline });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    onSave({
      deadline: parsed.data.deadline,
      payload: {
        name: parsed.data.name,
        target_amount: parsed.data.target_amount,
        property_id: properties && properties.length > 0 && propertyId !== "__none" ? propertyId : null,
      },
    });
    setOpen(false);
    setName("");
    setTarget("");
    setPropertyId("__none");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="secondary">
            <Target className="mr-2 h-4 w-4" /> Új cél
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Új megtakarítási cél</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 pt-2">
          <div className="grid gap-2">
            <Label htmlFor="gname">Név</Label>
            <Input
              id="gname"
              placeholder="pl. Nyaralás Görögországba"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gtarget">Célösszeg</Label>
            <Input
              id="gtarget"
              inputMode="decimal"
              placeholder="0"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gdeadline">Határidő</Label>
            <Input
              id="gdeadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          {properties && properties.length > 0 ? (
            <div className="grid gap-2">
              <Label>Ingatlan (opcionális)</Label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">—</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Mégse
          </Button>
          <Button onClick={submit}>Létrehozás</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VaultShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-12">
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          backgroundColor: "#dc2626",
          color: "white",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
        }}
      >
        DEPLOYMENT TESZT: VÁLTOZAT KÜLDVE (FRISSÍTVE).
      </div>
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-xl">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        {children}
      </div>
    </div>
  );
}

const LAST_PROFILE_KEY = "vault:lastProfile";

function HomeLoginScreen({
  profiles,
  preselectId,
}: {
  profiles: Profile[];
  preselectId?: string;
}) {
  const { unlockById, beginCreate, deleteProfile, backToPicker } = useVault();
  const hasProfiles = profiles.length > 0;

  const initialId = useMemo(() => {
    if (preselectId) return preselectId;
    if (!hasProfiles) return "";
    const last = typeof window !== "undefined" ? localStorage.getItem(LAST_PROFILE_KEY) : null;
    if (last && profiles.some((p) => p.id === last)) return last;
    return profiles[0].id;
  }, [preselectId, profiles, hasProfiles]);

  const [selectedId, setSelectedId] = useState(initialId);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    setSelectedId(initialId);
  }, [initialId]);

  const submit = async () => {
    if (!selectedId || !pw) return;
    setBusy(true);
    setError(false);
    try {
      const ok = await unlockById(selectedId, pw);
      if (ok) {
        localStorage.setItem(LAST_PROFILE_KEY, selectedId);
      } else {
        setError(true);
      }
    } finally {
      setBusy(false);
    }
  };

  const selectedProfile = profiles.find((p) => p.id === selectedId);

  return (
    <VaultShell>
      <div className="text-center">
        <h2 className="text-lg font-semibold tracking-tight">Profil megnyitása</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {hasProfiles
            ? "Add meg a mesterjelszót a helyi profil megnyitásához (az eseteid ezen az eszközön vannak)."
            : "Még nincs profil ezen az eszközön. Hozz létre egyet a folytatáshoz."}
        </p>
      </div>

      {hasProfiles && (
        <div className="mt-6 space-y-4">
          {profiles.length > 1 && (
            <div className="grid gap-2">
              <Label htmlFor="profile-pick">Profil</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger id="profile-pick">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="unlock-pw">
              Mesterjelszó{selectedProfile ? ` — ${selectedProfile.name}` : ""}
            </Label>
            <Input
              id="unlock-pw"
              type="password"
              autoComplete="current-password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                if (error) setError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus
            />
            {error && <p className="text-xs text-destructive">Hibás jelszó.</p>}
          </div>

          <Button className="w-full" onClick={submit} disabled={busy || !pw}>
            {busy ? "Megnyitás…" : "Megnyitás"}
          </Button>

          {profiles.length === 1 && selectedProfile && (
            <button
              type="button"
              className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
              onClick={() => setConfirmDel(selectedProfile.id)}
            >
              Profil törlése erről az eszközről
            </button>
          )}
        </div>
      )}

      <div className="mt-6 border-t border-border/60 pt-5">
        <p className="mb-3 text-center text-[11px] uppercase tracking-wide text-muted-foreground">
          Új profil
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => void beginCreate()}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Profil létrehozása
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          A következő lépésben nevet és mesterjelszót adhatsz meg — Bitwarden-ajánlással
          erős jelszó generálásához.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            vagy
          </span>
          <div className="h-px flex-1 bg-border/60" />
        </div>
        <Button
          variant="ghost"
          className="mt-3 w-full"
          onClick={() => setImportOpen(true)}
        >
          <QrCode className="mr-2 h-4 w-4" />
          Eszköz hozzáadása QR-rel
        </Button>
        <p className="mt-1 text-center text-[11px] text-muted-foreground">
          Meglévő profil áthozatala másik eszközről — a mesterjelszó itt marad.
        </p>
      </div>

      <ImportQrDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={(id) => {
          if (typeof window !== "undefined") {
            localStorage.setItem(LAST_PROFILE_KEY, id);
          }
          void backToPicker();
        }}
      />

      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil törlése</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            A profil összes titkosított adata véglegesen elvész erről az eszközről.
            Nincs visszaállítás.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDel(null)}>
              Mégse
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!confirmDel) return;
                await deleteProfile(confirmDel);
                setConfirmDel(null);
                toast.success("Profil törölve.");
              }}
            >
              Törlés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VaultShell>
  );
}

function VaultSetupScreen({ first = false }: { first?: boolean }) {
  const { createProfile, cancelCreate } = useVault();
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const strength = useMemo(() => scorePassword(pw), [pw]);

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Adj nevet a profilnak.");
      return;
    }
    if (pw.length < 12) {
      toast.error("Legalább 12 karakter kell.");
      return;
    }
    if (pw !== confirm) {
      toast.error("A két jelszó nem egyezik.");
      return;
    }
    setBusy(true);
    try {
      await createProfile(name, pw);
      toast.success("Profil létrehozva.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Hiba");
    } finally {
      setBusy(false);
    }
  };

  return (
    <VaultShell>
      <div className="text-center">
        <h2 className="text-lg font-semibold tracking-tight">
          {first ? "Első profil beállítása" : "Új profil létrehozása"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Nincs fiók, nincs e-mail. A jelszavad titkosítja az adataidat itt, ezen az
          eszközön. Sehova nem kerül el.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          <strong>Fontos:</strong> ha elfelejted a jelszót, a profil adatai{" "}
          <em>véglegesen</em> elvesznek. Nincs visszaállítás.
        </div>

        <a
          href="https://bitwarden.com/go/start-free/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3 text-sm transition-colors hover:bg-muted"
        >
          <span className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Erős jelszó generálása Bitwardennel
          </span>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </a>

        <div className="grid gap-2">
          <Label htmlFor="profile-name">Profil neve</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="pl. Személyes, Vállalkozás"
            autoFocus
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="pw">Mesterjelszó</Label>
          <Input
            id="pw"
            type="password"
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="min. 12 karakter"
          />
          {pw.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${strength.pct}%`,
                    backgroundColor: strength.color,
                  }}
                />
              </div>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="pw2">Ismételd meg</Label>
          <Input
            id="pw2"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {!first && (
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => void cancelCreate()}
              disabled={busy}
            >
              Mégse
            </Button>
          )}
          <Button className="flex-1" onClick={submit} disabled={busy}>
            {busy ? "Létrehozás…" : "Profil létrehozása"}
          </Button>
        </div>
      </div>
    </VaultShell>
  );
}

function VaultUnlockScreen({ profile }: { profile: Profile }) {
  const { unlock, backToPicker } = useVault();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const submit = async () => {
    if (!pw) return;
    setBusy(true);
    setError(false);
    try {
      const ok = await unlock(pw);
      if (!ok) setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <VaultShell>
      <div className="text-center">
        <h2 className="text-lg font-semibold tracking-tight">Belépés — {profile.name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add meg a profil mesterjelszavát az adatok dekódolásához.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="unlock-pw">Mesterjelszó</Label>
          <Input
            id="unlock-pw"
            type="password"
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus
          />
          {error && <p className="text-xs text-destructive">Hibás jelszó.</p>}
        </div>
        <Button className="w-full" onClick={submit} disabled={busy || !pw}>
          {busy ? "Belépés…" : "Belépés"}
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => void backToPicker()}
          disabled={busy}
        >
          Vissza a profilokhoz
        </Button>
      </div>
    </VaultShell>
  );
}

function scorePassword(pw: string): { pct: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (pw.length >= 20) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const pct = Math.min(100, (score / 6) * 100);
  const label = score <= 2 ? "gyenge" : score <= 4 ? "közepes" : "erős";
  const color =
    score <= 2
      ? "var(--color-chart-7)"
      : score <= 4
        ? "var(--color-chart-4)"
        : "var(--color-chart-1)";
  return { pct, label, color };
}

type WsKey = "magan" | "middle" | "szumma";

const WORKSPACE_COLORS: Record<string, { label: string; cls: string }> = {
  personal: {
    label: "Magán",
    cls: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  },
  Vállalkozás1: {
    label: "Vállalkozás1",
    cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  Vállalkozás2: {
    label: "Vállalkozás2",
    cls: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  },
  Projekt1: {
    label: "Projekt1",
    cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  Projekt2: {
    label: "Projekt2",
    cls: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  },
  __all: {
    label: "Szumma",
    cls: "bg-slate-500/15 text-slate-200 border-slate-500/30",
  },
};

function workspaceColorCls(workspaceId: string) {
  const v = WORKSPACE_COLORS[workspaceId];
  if (v) return v.cls;
  const palette = [
    "bg-sky-500/15 text-sky-300 border-sky-500/30",
    "bg-violet-500/15 text-violet-300 border-violet-500/30",
    "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
    "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    "bg-lime-500/15 text-lime-300 border-lime-500/30",
    "bg-rose-500/15 text-rose-300 border-rose-500/30",
  ];
  let h = 0;
  for (let i = 0; i < workspaceId.length; i++) h = (h * 31 + workspaceId.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

function WorkspaceTabsLegacy({
  activeWs,
  setActiveWs,
  middleWs,
  setMiddleWs,
  wsOptions,
  onCustom,
  labelFor,
}: {
  activeWs: WsKey;
  setActiveWs: (k: WsKey) => void;
  middleWs: string;
  setMiddleWs: (v: string) => void;
  wsOptions: string[];
  onCustom: () => void;
  labelFor: (wsId: string) => string;
}) {
  const tabBase =
    "relative -mb-px inline-flex items-center gap-1.5 rounded-t-lg border border-b-0 px-3 py-1.5 text-xs font-medium transition-colors";
  const active =
    "border-border/60 bg-background text-foreground z-10";
  const idle =
    "border-transparent bg-card/30 text-muted-foreground hover:text-foreground hover:bg-card/60";

  return (
    <div className="mx-auto flex max-w-[98%] items-end gap-1 px-2 pt-3 sm:px-4">
      <button
        type="button"
        onClick={() => setActiveWs("magan")}
        className={`${tabBase} ${activeWs === "magan" ? active : idle} border-t-2 ${
          activeWs === "magan" ? "border-t-indigo-500/80" : "border-t-transparent"
        }`}
        aria-pressed={activeWs === "magan"}
      >
        <Folder className="h-3.5 w-3.5" />
        Magán
      </button>

      <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto">
        {wsOptions.map((o) => {
          const isActive = activeWs === "middle" && middleWs === o;
          const cls = workspaceColorCls(o);
          const borderTop = cls.includes("border-emerald")
            ? "border-t-emerald-500/80"
            : cls.includes("border-teal")
              ? "border-t-teal-500/80"
              : cls.includes("border-amber")
                ? "border-t-amber-500/80"
                : cls.includes("border-orange")
                  ? "border-t-orange-500/80"
                  : cls.includes("border-indigo")
                    ? "border-t-indigo-500/80"
                    : "border-t-slate-500/80";
          return (
            <button
              key={o}
              type="button"
              onClick={() => {
                setMiddleWs(o);
                setActiveWs("middle");
              }}
              className={`${tabBase} ${isActive ? active : idle} border-t-2 ${
                isActive ? borderTop : "border-t-transparent"
              }`}
              aria-pressed={isActive}
            >
              <Folder className="h-3.5 w-3.5" />
              {labelFor(o)}
            </button>
          );
        })}

        <div className="btn-new-item-wrap">
          <button
            type="button"
            onClick={onCustom}
            className="btn-new-item"
            title="Új munkaterület hozzáadása"
            aria-label="Új munkaterület hozzáadása"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="btn-new-item-label">Új</span>
          </button>
          <HelpIcon kbId="new-workspace" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setActiveWs("szumma")}
        className={`${tabBase} ml-auto ${activeWs === "szumma" ? active : idle} border-t-2 ${
          activeWs === "szumma" ? "border-t-slate-400/80" : "border-t-transparent"
        }`}
        aria-pressed={activeWs === "szumma"}
        title="Szumma nézet (összes munkaterület)"
      >
        <Sigma className="h-3.5 w-3.5" />
        Szumma
      </button>
    </div>
  );
}

// keep type imports referenced for tree-shaker clarity
export type _Rows = EncTxnRow | EncGoalRow;

