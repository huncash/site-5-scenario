import { bucketNameForLocale, categoryLabelForLocale, txnTitleForLocale } from "@/i18n/categories";
import { formatCurrency } from "@/i18n/currency";
import type {
  HumanResource,
  RealEstateProperty,
  VehicleResource,
  WorkspaceDuty,
  WorkspacePartner,
  WorkspaceSavingBucket,
} from "@/types/workspace";

export type TxnType = "income" | "expense" | "saving";

export type ExpenseType = "FIX_NEED" | "VARIABLE_NEED" | "WANT" | "INVESTMENT";
export type MudaType = "NONE" | "DUPLICATE_SUBSCRIPTION" | "FEES" | "IMPULSE_SPEND" | "WASTE";

export const CATEGORY_LABEL: Record<string, string> = {
  salary: "Fizetés",
  freelance: "Szabadúszó",
  "other-income": "Egyéb bevétel",
  uncategorized: "Kategorizálatlan",
  housing: "Lakhatás",
  food: "Élelmiszer",
  transport: "Közlekedés",
  utilities: "Rezsi",
  entertainment: "Szórakozás",
  health: "Egészség",
  shopping: "Vásárlás",
  education: "Oktatás",
  savings: "Megtakarítás",
  loan_repayment: "Hitel törlesztés",
  "PÉNZÜGYI KIADÁSOK: Hitel törlesztés": "Hitel törlesztés",
  "ANYAG: Beszerzés (resale)": "ANYAG: Továbbértékesítés",
  "ANYAG: Továbbértékesítés": "ANYAG: Továbbértékesítés",
  other: "Egyéb",
};

export function displayTxnTitle(title: string | null | undefined): string {
  const t = (title ?? "").trim();
  let hu = t;
  if (t === "Továbbértékesített beszerzés (nyitott)") hu = "Beszerzés: Továbbértékesítésre (nyitott)";
  else if (t === "Továbbértékesített beszerzés") hu = "Beszerzés: Továbbértékesítésre";
  else if (t === "Resale purchase (open)") hu = "Beszerzés: Továbbértékesítésre (nyitott)";
  else if (t === "Resale purchase") hu = "Beszerzés: Továbbértékesítésre";
  else if (t === "Runway puffer félretétel") hu = "Céltartalék-puffer félretétel";
  else if (t === "CAPEX alap félretétel") hu = "Eszközalap félretétel";
  return txnTitleForLocale(hu);
}

export function displayBucketName(name: string | null | undefined): string {
  const n = (name ?? "").trim();
  let hu = n;
  if (n === "Runway puffer") hu = "Céltartalék-puffer";
  else if (n === "Eszköz / CAPEX alap") hu = "Eszközalap";
  return bucketNameForLocale(hu);
}

export function displayTxnLabel(t: {
  title?: string | null;
  note?: string | null;
  category?: string | null;
}): string {
  return displayTxnTitle(t.title) || String(t.note ?? "").trim() || categoryLabel(String(t.category ?? ""));
}

export function displayGoalLabel(
  name: string | null | undefined,
  hidePrefixes?: Array<string | null | undefined>,
): string {
  let n = String(name ?? "").trim();
  for (const raw of hidePrefixes ?? []) {
    const p = String(raw ?? "").trim();
    if (!p) continue;
    const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    n = n.replace(new RegExp(`^${escaped}\\s*[—–-]\\s*`, "i"), "").trim();
  }
  return n;
}

/** Szcenárió-listában: ugyanaz a nap + név + partner + közel azonos összeg ne jelenjen meg kétszer. */
export function collapseNearDuplicateTxns<T extends {
  id: string;
  type?: string;
  amount?: number;
  occurred_at?: string;
  workspace?: string | null;
  title?: string | null;
  note?: string | null;
  category?: string | null;
  party?: string | null;
}>(rows: T[]): T[] {
  const out: T[] = [];
  for (const t of rows) {
    const day = String(t.occurred_at ?? "").slice(0, 10);
    const title = displayTxnLabel(t).toLowerCase();
    const party = String(t.party ?? "").trim().toLowerCase();
    const amt = Math.round(Number(t.amount ?? 0));
    const hit = out.find((x) => {
      if ((x.workspace ?? "") !== (t.workspace ?? "")) return false;
      if ((x.type ?? "") !== (t.type ?? "")) return false;
      if (String(x.occurred_at ?? "").slice(0, 10) !== day) return false;
      if (displayTxnLabel(x).toLowerCase() !== title) return false;
      if (String(x.party ?? "").trim().toLowerCase() !== party) return false;
      return Math.abs(Math.round(Number(x.amount ?? 0)) - amt) <= 100;
    });
    if (!hit) out.push(t);
  }
  return out;
}

export const INCOME_CATEGORIES = ["salary", "freelance", "other-income"] as const;
export const EXPENSE_CATEGORIES = [
  "housing",
  "food",
  "transport",
  "utilities",
  "entertainment",
  "health",
  "shopping",
  "education",
  "loan_repayment",
  "uncategorized",
  "other",
] as const;

// Business/project presets (based on the legacy cashflow workbook categories).
export const BUSINESS_INCOME_CATEGORIES = [
  "ÉRTÉKESÍTÉS",
  "PÉNZÜGYI BEVÉTELEK: Áru vissza/befizetés",
  "PÉNZÜGYI BEVÉTELEK: ATM befizetés",
  "PÉNZÜGYI BEVÉTELEK: Banki hitel beérkezés",
  "PÉNZÜGYI BEVÉTELEK: NAV ÁFA visszatérítés",
  "PÉNZÜGYI BEVÉTELEK: Tagi kölcsön befizetés",
  "TŐKE: Alaptőke befizetés",
] as const;

export const BUSINESS_EXPENSE_CATEGORIES = [
  "BÉR: Bruttó havi",
  "BÉR: Bér nettó",
  "BÉR: NAV bér járulék",
  "BÉR: Alvállalkozói kifizetések",

  "BESZERZÉS: Alapanyag",
  "BESZERZÉS: Ital / nagyker",
  "BESZERZÉS: Csomagolás",
  "BESZERZÉS: Kiszállítás",

  "REZSI: Adók",
  "REZSI: Bank szla.díjak",
  "REZSI: Informatikus",
  "REZSI: Internet +tárhely.eu",
  "REZSI: IPA",
  "REZSI: Iroda bérlet",
  "REZSI: Irodaszerek",
  "REZSI: Könyvelés",
  "REZSI: Tel., mobitelefon",
  "REZSI: Ügyvéd",
  "REZSI: Egyéb rezsi ktg.",

  "FEJLESZTÉS: Folyamatfejlesztés",
  "FEJLESZTÉS: Üzletviteli tanácsadás",
  "FEJLESZTÉS: Marketing",
  "FEJLESZTÉS: Új eszköz",

  "FLOTTA: Autómentés",
  "FLOTTA: Autómosás",
  "FLOTTA: Autópályadíj",
  "FLOTTA: Biztosítás casco",
  "FLOTTA: Biztosítás KGFB",
  "FLOTTA: Büntetés",
  "FLOTTA: Egyéb adó",
  "FLOTTA: Érdekképviselet tagdíj",
  "FLOTTA: Gépjárműadó",
  "FLOTTA: Gumi",
  "FLOTTA: Hatósági díj (vizsga)",
  "FLOTTA: Oktatás",
  "FLOTTA: Parkolás",
  "FLOTTA: Súly adó",
  "FLOTTA: Tankolás",
  "FLOTTA: Szerviz",
  "FLOTTA: Flotta egyéb ktg.",

  "EGYEBEK: Autó bérlés",
  "EGYEBEK: Autó törlesztő",
  "EGYEBEK: Telephely engedély kérelem",
  "EGYEBEK: Utánfutó bérlés",
  "EGYEBEK: Program költség",
  "EGYEBEK: Egyéb ktg.",

  "BERUHÁZÁSOK: Autó vétel",
  "BERUHÁZÁSOK: Egyéb beruházások",

  "PÉNZÜGYI KIADÁSOK: ATM kifizetés",
  "PÉNZÜGYI KIADÁSOK: Banki hitel visszafizetése",
  "PÉNZÜGYI KIADÁSOK: Hitel törlesztés",
  "PÉNZÜGYI KIADÁSOK: Hitel kamat megfizetése",
  "PÉNZÜGYI KIADÁSOK: Osztalék kifizetés",
  "PÉNZÜGYI KIADÁSOK: Tagi kölcsön kifizetés",
  "PÉNZÜGYI KIADÁSOK: Egyéb pü. kiadások",
] as const;

export type LoanType =
  | "bank_loan"
  | "personal_loan"
  | "leasing"
  | "credit_line"
  | "shareholder_loan"
  | "nav_installment"
  | "supplier_debt"
  | "grant_own_contribution"
  | "other";
export type LoanStatus = "active" | "paid_off";
export type DebtFrequency = "monthly" | "one_off" | "custom";
export type DebtScheduleItemStatus = "pending" | "paid";
export type DebtScheduleItem = {
  due_date: string; // YYYY-MM-DD
  amount: number;
  status: DebtScheduleItemStatus;
};

/**
 * Tartozás / kötelezettség — workspace-izolált, ütemezhető részletfizetéssel.
 * A meglévő `Loan` tárolóra épül (encrypted loans store); a schedule mezők opcionálisak a visszafelé kompatibilitás miatt.
 */
export type Debt = {
  id: string;
  workspace_id: string;
  name: string;
  partner_name: string;
  total_amount: number;
  frequency: DebtFrequency;
  schedule: DebtScheduleItem[];
};

export type Loan = {
  id: string;
  workspace_id: string; // "personal" | business/project id — STRICT isolation
  name: string;
  type: LoanType;
  original_amount: number;
  remaining_principal: number;
  monthly_installment: number;
  due_date: string; // YYYY-MM-DD
  payment_day_of_month: number; // 1..28/31
  interest_rate_percent?: number | null;
  status: LoanStatus;
  /** Partner (pl. NAV, beszállító) */
  partner_name?: string | null;
  frequency?: DebtFrequency | null;
  schedule?: DebtScheduleItem[] | null;
};

function ymdAddMonths(ymd: string, months: number): string {
  const [y, m, d] = ymd.split("-").map((x) => Number(x));
  const base = new Date(y, (m || 1) - 1, d || 1);
  const day = base.getDate();
  const next = new Date(base.getFullYear(), base.getMonth() + months, 1);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
  const yy = next.getFullYear();
  const mm = String(next.getMonth() + 1).padStart(2, "0");
  const dd = String(next.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** Egyenlő részletek generálása; az utolsó sor kerekíti a maradékot (NAV-stílus). */
export function generateEqualDebtSchedule(
  totalAmount: number,
  startYmd: string,
  months: number,
): DebtScheduleItem[] {
  const n = Math.max(1, Math.round(months));
  const total = Math.max(0, Math.round(totalAmount));
  const base = Math.floor(total / n);
  const rows: DebtScheduleItem[] = [];
  let allocated = 0;
  for (let i = 0; i < n; i++) {
    const amount = i === n - 1 ? Math.max(0, total - allocated) : base;
    allocated += amount;
    rows.push({
      due_date: ymdAddMonths(startYmd, i),
      amount,
      status: "pending",
    });
  }
  return rows;
}

export function debtPendingTotal(schedule: DebtScheduleItem[] | null | undefined): number {
  return (schedule ?? [])
    .filter((r) => r.status !== "paid")
    .reduce((acc, r) => acc + Math.max(0, Number(r.amount ?? 0)), 0);
}

export function debtNextPendingDue(schedule: DebtScheduleItem[] | null | undefined): string | null {
  const pending = (schedule ?? [])
    .filter((r) => r.status !== "paid" && /^\d{4}-\d{2}-\d{2}$/.test(String(r.due_date ?? "")))
    .sort((a, b) => (a.due_date < b.due_date ? -1 : 1));
  return pending[0]?.due_date ?? null;
}

/** Következő 30 nap pending részleteinek összege (cashflow teher), schedule nélkül: monthly_installment. */
export function debtNearTermBurden(
  loan: Pick<Loan, "monthly_installment" | "schedule">,
  withinDays = 30,
  now = new Date(),
): number {
  const schedule = loan.schedule ?? [];
  if (schedule.length > 0) {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + withinDays);
    return schedule
      .filter((r) => r.status !== "paid")
      .filter((r) => {
        const d = new Date(r.due_date);
        return !Number.isNaN(d.getTime()) && d >= now && d <= end;
      })
      .reduce((acc, r) => acc + Math.max(0, Number(r.amount ?? 0)), 0);
  }
  return Math.max(0, Number(loan.monthly_installment ?? 0));
}

export function loanFromDebtFields(input: {
  workspace_id: string;
  name: string;
  partner_name?: string | null;
  type?: LoanType;
  total_amount: number;
  frequency: DebtFrequency;
  schedule: DebtScheduleItem[];
  interest_rate_percent?: number | null;
  status?: LoanStatus;
}): Omit<Loan, "id"> {
  const schedule = input.schedule ?? [];
  const pending = debtPendingTotal(schedule);
  const nextDue = debtNextPendingDue(schedule);
  const lastDue = [...schedule].sort((a, b) => (a.due_date < b.due_date ? 1 : -1))[0]?.due_date;
  const avg =
    schedule.length > 0
      ? Math.round(schedule.reduce((a, r) => a + Math.max(0, r.amount), 0) / schedule.length)
      : Math.round(input.total_amount);
  const payDay = nextDue ? Number(nextDue.slice(8, 10)) || 10 : 10;
  return {
    workspace_id: input.workspace_id,
    name: input.name,
    type: input.type ?? "other",
    original_amount: Math.max(0, Math.round(input.total_amount)),
    remaining_principal: Math.max(0, Math.round(pending || input.total_amount)),
    monthly_installment: Math.max(0, avg),
    due_date: lastDue || nextDue || new Date().toISOString().slice(0, 10),
    payment_day_of_month: payDay,
    interest_rate_percent: input.interest_rate_percent ?? null,
    status: input.status ?? (pending <= 0 && schedule.length > 0 ? "paid_off" : "active"),
    partner_name: input.partner_name ?? null,
    frequency: input.frequency,
    schedule,
  };
}

export type TxnHistoryEntry = {
  at: string;
  from: TxnType;
  to: TxnType;
};

export type CostKind = "opex" | "capex" | "maintenance";

export type VatDeductibility = 1 | 0.5 | 0;

export type BusinessProject = {
  id: string;
  name: string;
};

export type BusinessAsset = {
  id: string;
  name: string;
  location_id?: string | null;
  project_id?: string | null;
  created_at?: string | null;
};

export type Transaction = {
  id: string;
  user_id: string;
  type: TxnType;
  amount: number;
  category: string;
  expense_type?: ExpenseType;
  muda_type?: MudaType;
  is_recurring?: boolean;
  title?: string | null; // jogcím (business)
  party?: string | null; // ügyfél / megnevezés (business)
  frsz?: string | null;
  payment_method?: "transfer" | "cash" | null;
  note: string | null;
  bank_raw_id?: string | null; // immutable raw bank record reference (if imported)
  bank_account_id?: string | null;
  tags?: string[]; // business filters
  location_id?: string | null; // telephely/székhely/raktár
  property_id?: string | null; // personal: ingatlan költséghely
  project_id?: string | null;
  asset_id?: string | null;
  cost_kind?: CostKind | null; // OPEX / CAPEX / karbantartás
  is_asset?: boolean; // tárgyi eszköz jelölés
  occurred_at: string;
  history?: TxnHistoryEntry[];
  bucket_id?: string | null;
  vat_rate?: number | null; // percent; meaningful in business/project workspaces
  vat_treatment?: "hu_gross" | "no_vat" | "reverse_charge" | "foreign" | null;
  vat_review?: boolean;
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
  workspace?: string; // "personal" | business/project name; default "personal"
  eur_amount?: number | null; // optional net amount in EUR
  eur_rate?: number | null; // HUF per 1 EUR (when eur_amount is set)
  status?: "planned" | "committed" | "actual" | null; // project-mode transaction lifecycle
  invoice_status?: "unpaid" | "pending" | "paid" | null; // billing/payment lifecycle (separate from `status`)
  due_date?: string | null; // ISO date string (YYYY-MM-DD or full ISO)
  loan_id?: string | null;
  loan_principal_paid?: number | null; // optional: principal portion for repayments
};

export type VatMode = "gross" | "net";

/**
 * In business/project workspaces the stored `amount` is treated as NET
 * (VAT charged on top). In personal (magán) the `amount` is already GROSS
 * and VAT is decomposed from it.
 */
export function computeVatSplit(
  amount: number,
  rate: number | null | undefined,
  mode: VatMode,
) {
  const r = Math.max(0, Number(rate ?? 0));
  if (mode === "net") {
    const net = Math.round(amount);
    const vat = Math.round(net * (r / 100));
    return { net, vat, gross: net + vat };
  }
  const gross = Math.round(amount);
  const net = r > 0 ? Math.round(gross / (1 + r / 100)) : gross;
  return { net, vat: gross - net, gross };
}

export type SavingBucket = { id: string; name: string };

export type RecurringInterval = "weekly" | "monthly" | "quarterly";

export type RecurringItem = {
  id: string;
  name: string;
  type: "expense" | "income";
  interval: RecurringInterval;
  next_date: string; // YYYY-MM-DD
  category: string;
  amount: number; // net HUF
  eur_amount?: number | null; // net EUR
  eur_rate?: number | null; // HUF / EUR
  vat_rate?: number | null; // percent
  workspace?: string;
};

export type PlannedOneOff = {
  id: string;
  name: string;
  type: "expense" | "income";
  at: string; // YYYY-MM-DD
  category: string;
  amount: number; // net HUF
  eur_amount?: number | null; // net EUR
  eur_rate?: number | null; // HUF / EUR
  vat_rate?: number | null; // percent
  workspace?: string;
};

export type UsageTemplate = {
  id: string;
  name: string;
  type: "expense" | "income";
  category: string;
  unit_amount: number; // net HUF per use
  eur_unit_amount?: number | null; // net EUR per use
  eur_rate?: number | null; // HUF / EUR
  vat_rate?: number | null; // percent
  workspace?: string;
};

export type UsageEvent = {
  id: string;
  template_id: string;
  at: string; // YYYY-MM-DD (month grouping uses YYYY-MM)
  count: number; // how many times used
  workspace?: string;
};

export type BusinessLocation = {
  id: string;
  name: string;
  kind: "szekhely" | "telephely" | "raktar" | "egyeb";
};

export type CustomSettings = {
  __demo?: { kind: string; version: number; segmentId: string; seededAt: string } | null;
  incomeCategories: string[]; // custom labels appended to defaults
  expenseCategories: string[];
  // Optional: used by rule engine / future saving-category views.
  savingCategories?: string[];
  showKpiQuickBar?: boolean;
  buckets: SavingBucket[];
  recurring: RecurringItem[];
  plannedOneOff: PlannedOneOff[];
  usageTemplates: UsageTemplate[];
  usageEvents: UsageEvent[];
  locations: BusinessLocation[];
  projects: BusinessProject[];
  assets: BusinessAsset[];
  workspaces: WorkspaceMeta[];
  master_baseline?: import("@/lib/masterBaseline").MasterBaselineContext | null;
};

export const EMPTY_SETTINGS: CustomSettings = {
  __demo: null,
  incomeCategories: [],
  expenseCategories: [],
  savingCategories: [],
  showKpiQuickBar: false,
  buckets: [],
  recurring: [],
  plannedOneOff: [],
  usageTemplates: [],
  usageEvents: [],
  locations: [],
  projects: [],
  assets: [],
  workspaces: [],
};

export type WorkspaceType = "business" | "project" | "personal";
export type WorkspaceScenario = "conservative" | "realistic" | "optimistic";
export type ProjectMode = "simulation" | "pilot" | "prep";
export type PdcaMilestones = {
  plan_at?: string | null;
  do_at?: string | null;
  check_at?: string | null;
  act_at?: string | null;
};

export type WorkspaceMeta = {
  id: string; // transaction.workspace references this
  type: WorkspaceType;
  alias?: string | null;
  description?: string | null;
  check_notes?: string | null; // PDCA: CHECK megjegyzések
  color_tag?: string | null; // optional future: UI accent selection
  bank_sync_folder?: string | null; // best-effort hint (browser may not auto-read paths)
  // Attached resources (workspace-scoped)
  bankAccountIds?: string[] | null;
  locationIds?: string[] | null; // settings.locations ids
  vehicles?: VehicleResource[] | null;
  humanResources?: HumanResource[] | null;
  realEstateProperties?: RealEstateProperty[] | null; // personal workspace
  // References Hub (workspace-scoped master data)
  partners?: WorkspacePartner[] | null;
  workspace_buckets?: WorkspaceSavingBucket[] | null;
  duties?: WorkspaceDuty[] | null;
  // SHA-256 import dedup cache (best-effort). Workspace-scoped by design.
  imported_file_hashes?: string[] | null;
  // Legacy field (kept for backward compatibility with existing vaults).
  bank_seen_hashes?: string[] | null; // deprecated

  // PDCA cycle counter (PLAN→DO→CHECK→ACT)
  pdca_cycle_count?: number | null;
  last_cycle_completed_at?: string | null;
  pdca_milestones?: PdcaMilestones | null;

  // Project-only settings
  project_mode?: ProjectMode | null;
  project_budget_huf?: number | null; // PLAN budget target (HUF)
  completion_pct?: number | null; // 0..100
  scenario?: WorkspaceScenario | null;
  parent_business_id?: string | null; // if attached under a business
  counts_in_business?: boolean | null;
  master_baseline?: import("@/lib/masterBaseline").MasterBaselineContext | null;
  inherits_baseline?: boolean | null;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  deadline: string;
  is_active: boolean;
  workspace?: string;
  property_id?: string | null;
};

export function categoryLabel(c: string) {
  return categoryLabelForLocale(c, CATEGORY_LABEL[c] ?? c);
}

export function formatMoney(n: number, _currency = "HUF") {
  return formatCurrency(n);
}

export function monthsUntil(deadlineISO: string) {
  const d = new Date(deadlineISO);
  const now = new Date();
  const months =
    (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
  return Math.max(1, months);
}

export function computeTotals(txns: Transaction[]) {
  let income = 0,
    expense = 0,
    savings = 0;
  for (const t of txns) {
    const a = Number(t.amount);
    if (t.type === "income") income += a;
    else if (t.type === "expense") expense += a;
    else if (t.type === "saving") savings += a;
  }
  return { income, expense, savings, balance: income - expense - savings };
}

export function expensesByCategory(txns: Transaction[]) {
  const map = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== "expense") continue;
    map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount));
  }
  return Array.from(map.entries())
    .map(([category, value]) => ({
      category,
      label: categoryLabel(category),
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

/** Calendar day of a transaction in the local timezone (YYYY-MM-DD). */
export function txnDayIso(occurredAt: string | null | undefined): string | null {
  if (!occurredAt) return null;
  const d = new Date(occurredAt);
  if (!Number.isFinite(d.getTime())) {
    const m = String(occurredAt).match(/^(\d{4}-\d{2}-\d{2})/);
    return m?.[1] ?? null;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function monthlySeries(txns: Transaction[], months = 6, endOffset = 0) {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() - Math.max(0, endOffset), 1);
  const buckets: {
    key: string;
    label: string;
    income: number;
    expense: number;
    saving: number;
  }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({
      key,
      label: d.toLocaleDateString("hu-HU", { year: "numeric", month: "short" }),
      income: 0,
      expense: 0,
      saving: 0,
    });
  }
  for (const t of txns) {
    const d = new Date(t.occurred_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const b = buckets.find((x) => x.key === key);
    if (!b) continue;
    const a = Number(t.amount);
    if (t.type === "income") b.income += a;
    else if (t.type === "expense") b.expense += a;
    else b.saving += a;
  }
  return buckets;
}
