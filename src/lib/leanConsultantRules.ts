/**
 * Lean AI Consultant — offline szabálymotor + domain tudásbázis.
 * Tiszta függvények: UI / ACT modul ezeket hívja (nincs hálózati függőség).
 */

import { formatMoney, type Transaction, type WorkspaceMeta } from "@/lib/finance";
import { recommendLeanVisualizations, type LeanVizAdvice } from "@/lib/leanViz";

// ─── Domain: muda & tanács ───────────────────────────────────────────────────

/** Klasszikus 7 muda + 1 (unused talent / skill underutilization) */
export type MudaKind =
  | "overproduction"
  | "inventory"
  | "waiting"
  | "transport"
  | "motion"
  | "overprocessing"
  | "defects"
  | "unused_talent";

export type LeanAdviceSeverity = "critical" | "warning" | "info";

export type LeanAdviceTarget =
  | "plan"
  | "do"
  | "check"
  | "act"
  | "buckets"
  | "ledger"
  | "bank_import"
  | "cashflow";

export type LeanConsultantAdvice = {
  id: string;
  /** Mely muda / heurisztika váltotta ki */
  ruleId: string;
  muda?: MudaKind;
  severity: LeanAdviceSeverity;
  title: string;
  /** Akcióba fordítható tanács (ACT CTA szöveg) */
  action: string;
  /** Várható hatás */
  impact: string;
  target: LeanAdviceTarget;
  /** Metrikák a magyarázathoz / UI-hoz */
  metrics?: Record<string, number | string>;
};

export type PdcaPhase = "plan" | "do" | "check" | "act";

/** UI PdcaMode → fázis (WorkspaceTabs: PD|DC|CA|AP) */
export type PdcaUiMode = "PD" | "DC" | "CA" | "AP";

export type FiveSChecklistItem = {
  id: string;
  /** Seiri / Seiton / Seiso / Seiketsu / Shitsuke */
  pillar: "seiri" | "seiton" | "seiso" | "seiketsu" | "shitsuke";
  title: string;
  hint: string;
  phase: PdcaPhase;
  priority: number; // 1 = legelőbb
};

export type HeijunkaPeak = {
  monthKey: string; // YYYY-MM
  totalHuf: number;
  avgMonthlyHuf: number;
  ratio: number; // peak / avg
  drivers: Array<{ label: string; amountHuf: number }>;
};

export type LeanConsultantThresholds = {
  /** Szabad egyenleg > ennyi havi kiadás → inventory/overproduction muda */
  idleCashMonths: number;
  /** Mentés/persely arány e felett: tőke „célban” van */
  minDeployedSavingsRatio: number;
  /** Manuális tételek aránya e felett → motion/overprocessing */
  manualTxnRatio: number;
  /** Heijunka: hónap terhe / átlag e felett → csúcs */
  heijunkaPeakRatio: number;
  /** Heijunka: egy tétel „nagy” ha ≥ ennyi HUF */
  heijunkaLargeTxnHuf: number;
  /** Elemzési ablak (nap) manuális vs bank arányhoz */
  lookbackDays: number;
};

export const DEFAULT_LEAN_THRESHOLDS: Readonly<LeanConsultantThresholds> = {
  idleCashMonths: 3,
  minDeployedSavingsRatio: 0.35,
  manualTxnRatio: 0.55,
  heijunkaPeakRatio: 1.75,
  heijunkaLargeTxnHuf: 150_000,
  lookbackDays: 90,
};

/** Tudásbázis: muda leírások (HU) — UI / tooltip / ACT magyarázat */
export const MUDA_KNOWLEDGE_BASE: Readonly<
  Record<
    MudaKind,
    {
      labelHu: string;
      descriptionHu: string;
      classicExample: string;
    }
  >
> = {
  overproduction: {
    labelHu: "Túltermelés",
    descriptionHu: "Több készül / több tőke áll, mint amit a folyamat azonnal felhasznál.",
    classicExample: "Felesleges előre gyártás készletre.",
  },
  inventory: {
    labelHu: "Készlethalgatás / tőkehalmozás",
    descriptionHu: "Likvid pénz hever cél-persely vagy kamatozó eszköz nélkül.",
    classicExample: "Magas folyószámla-egyenleg cél-allokáció nélkül.",
  },
  waiting: {
    labelHu: "Várakozás",
    descriptionHu: "Folyamat áll, mert input (pl. vevői fizetés) késik.",
    classicExample: "Lejárt számlák, kintlévőségek.",
  },
  transport: {
    labelHu: "Szállítás",
    descriptionHu: "Felesleges anyag- vagy információmozgatás.",
    classicExample: "Magas fuvararány a projektköltségben.",
  },
  motion: {
    labelHu: "Felesleges mozgás",
    descriptionHu: "Emberi / adminisztratív pluszmozgás, ami automatizálható.",
    classicExample: "Manuális tételrögzítés banki import helyett.",
  },
  overprocessing: {
    labelHu: "Túlfeldolgozás",
    descriptionHu: "Több munka, mint amit az érték megkövetel.",
    classicExample: "Dupla adminisztráció (papír + bank + kézi).",
  },
  defects: {
    labelHu: "Hibák / selejt",
    descriptionHu: "Hibás adat, újrafeldolgozás, korrekció.",
    classicExample: "Hibás besorolás, ismételt javítás.",
  },
  unused_talent: {
    labelHu: "Kihasználatlan tudás",
    descriptionHu: "A rendszer nem használja a meglévő szabályokat / rutinokat.",
    classicExample: "PDCA checklist és ACT ajánlások figyelmen kívül hagyása.",
  },
};

/**
 * Beágyazott Lean módszertani tárház — nem önálló termék, hanem az AI konzulens
 * alapértelmezett domain tudása minden iparági / folyamat szcenárióban.
 * Referencia: MPDV Smart Factory Glossar — Lean Methoden.
 */
export type LeanMethodId =
  | "5s"
  | "vsm"
  | "kaizen"
  | "kanban"
  | "smed"
  | "poka_yoke"
  | "jit"
  | "heijunka"
  | "tpm";

export const LEAN_METHOD_TOOLKIT: Readonly<
  Record<
    LeanMethodId,
    {
      labelHu: string;
      whenHu: string;
      mudaHints: ReadonlyArray<MudaKind | "heijunka">;
    }
  >
> = {
  "5s": {
    labelHu: "5S (Seiri–Shitsuke)",
    whenHu: "Munkahely / admin rend: kevesebb keresés, kevesebb manuális muda.",
    mudaHints: ["motion", "overprocessing", "unused_talent"],
  },
  vsm: {
    labelHu: "Értékáram-térkép (VSM)",
    whenHu: "Lead time és szűk keresztmetszet feltárása meglévő folyamat auditnál — nem önálló termék.",
    mudaHints: ["waiting", "transport", "inventory", "overproduction"],
  },
  kaizen: {
    labelHu: "Kaizen",
    whenHu: "Iteratív PDCA: minden körben 1–3 muda-ellenintézkedés, nem egyszeri project.",
    mudaHints: ["unused_talent", "overprocessing", "defects"],
  },
  kanban: {
    labelHu: "Kanban",
    whenHu: "Húzórendszer: kevesebb várakozás és túltermelés a sor / admin átadásnál.",
    mudaHints: ["waiting", "overproduction", "inventory"],
  },
  smed: {
    labelHu: "SMED",
    whenHu: "Átállási idő vágása — kapacitásbővítés nagy CapEx nélkül.",
    mudaHints: ["waiting", "motion", "overprocessing"],
  },
  poka_yoke: {
    labelHu: "Poka-Yoke",
    whenHu: "Hibamegelőzés a folyamatba építve — selejt és utómunka cash-költsége csökken.",
    mudaHints: ["defects"],
  },
  jit: {
    labelHu: "JIT",
    whenHu: "Csak a szükséges mennyiség a szükséges időben — tőke és készlet muda ellen.",
    mudaHints: ["inventory", "overproduction", "waiting"],
  },
  heijunka: {
    labelHu: "Heijunka",
    whenHu: "Terheléskiegyenlítés: kötelezettség- és cashflow-csúcsok simítása.",
    mudaHints: ["heijunka", "waiting", "overproduction"],
  },
  tpm: {
    labelHu: "TPM",
    whenHu: "Berendezés / folyamat rendelkezésre állás — OEE lyuk és kiesés óradíja.",
    mudaHints: ["waiting", "defects", "motion"],
  },
};

/** AI konzulens alap charter — offline szabálymotor „system prompt” rétege. */
export const LEAN_ENGINE_CHARTER = [
  "A Lean (5S, VSM, Kaizen, Kanban, SMED, Poka-Yoke, JIT, Heijunka, TPM) beépített domain tudás, nem külön termék.",
  "Minden szcenárió inputjánál keresd a szűk keresztmetszetet, a 7+1 muda-t (túltermelés, várakozás, szállítás, túlfeldolgozás, készlet, mozgás, hibák, kihasználatlan tudás) és a nem értékadó lépéseket.",
  "Iteratív építésnél kontextuálisan ajánlj eszközt: SMED átállásra, 5S munkahelyre, VSM lead time-ra, Poka-Yoke selejtre, Kanban/JIT húzásra, Heijunka csúcsokra.",
  "Low-hanging fruit: az első muda-eliminálás minimális CapEx mellett azonnali, összetett cash-flow és árrésjavulást ad — ezt mindig emeld ki a megtérülésnél (ROI / payback).",
].join(" ");

export const LEAN_QUICK_WINS_COPY_HU =
  "A folyamatbeli veszteségek (várakozási idők, selejt, felesleges mozgatás) megszüntetése az első fázisban minimális beruházási igénnyel (CapEx) nagyságrendekkel több eredményt és szabad cash-flow-t termel, mint a fix megvalósítási költségek.";

export type LeanQuickWinsEstimate = {
  capexHuf: number;
  monthlySavingsHuf: number;
  annualSavingsHuf: number;
  paybackMonths: number;
  /** Éves megtakarítás / CapEx */
  roiMultiple12m: number;
  messagingHu: string;
  methodIds: LeanMethodId[];
};

export type LeanConsultantInput = {
  transactions: Transaction[];
  workspaces?: WorkspaceMeta[];
  /** Aktív workspace (üres = összes) */
  workspaceId?: string | null;
  currency?: string;
  now?: Date;
  thresholds?: Partial<LeanConsultantThresholds>;
  /** PDCA UI mód a 5S checklisthez */
  pdcaMode?: PdcaUiMode | null;
  /** Opcionális: bekötött bankszámla van-e a workspace-hez */
  hasBankAccountLink?: boolean;
};

export type LeanConsultantResult = {
  advice: LeanConsultantAdvice[];
  heijunkaPeaks: HeijunkaPeak[];
  checklist: FiveSChecklistItem[];
  thresholds: LeanConsultantThresholds;
  evaluatedAt: string;
  vizAdvice: LeanVizAdvice[];
  /** Low-hanging fruit: CapEx vs. folyamatos muda-megtakarítás */
  quickWins: LeanQuickWinsEstimate | null;
  /** Kontextuálisan releváns Lean eszközök az aktuális tanácsokhoz */
  suggestedMethods: LeanMethodId[];
  engineCharter: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function monthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function txnAmountHuf(t: Transaction): number {
  const huf = Number(t.amount ?? 0);
  const eur = Number(t.eur_amount ?? 0);
  const rate = Number(t.eur_rate ?? 0);
  const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
  return Math.abs(huf + eurHuf);
}

function isWsMatch(t: Transaction, workspaceId?: string | null): boolean {
  if (!workspaceId) return true;
  return (t.workspace ?? "") === workspaceId || (t.project_id ?? null) === workspaceId;
}

function filterTxns(txns: Transaction[], workspaceId?: string | null): Transaction[] {
  return txns.filter((t) => isWsMatch(t, workspaceId));
}

function resolveThresholds(partial?: Partial<LeanConsultantThresholds>): LeanConsultantThresholds {
  return { ...DEFAULT_LEAN_THRESHOLDS, ...partial };
}

export function pdcaUiModeToPhase(mode: PdcaUiMode): PdcaPhase {
  switch (mode) {
    case "PD":
      return "plan";
    case "DC":
      return "do";
    case "CA":
      return "check";
    case "AP":
      return "act";
  }
}

function isObligationCategory(category: string): boolean {
  const c = category.toLowerCase().trim();
  return (
    c.includes("áfa") ||
    c.includes("afa") ||
    c.includes("nav") ||
    c.includes("adó") ||
    c.includes("ado") ||
    c.includes("biztosít") ||
    c.includes("biztosit") ||
    c.includes("insurance") ||
    c.includes("vat") ||
    c.includes("tax") ||
    c.includes("járulék") ||
    c.includes("jarulek")
  );
}

function severityRank(s: LeanAdviceSeverity): number {
  return s === "critical" ? 0 : s === "warning" ? 1 : 2;
}

// ─── Rule: Inventory / Overproduction (idle cash) ────────────────────────────

/**
 * Magas szabad egyenleg a havi kiadáshoz képest, miközben a megtakarítás
 * nincs cél-perselyben allokálva → tőke-átcsoportosítás.
 */
export function detectIdleCashInventory(
  input: LeanConsultantInput,
): LeanConsultantAdvice | null {
  const th = resolveThresholds(input.thresholds);
  const currency = input.currency ?? "HUF";
  const now = input.now ?? new Date();
  const txns = filterTxns(input.transactions, input.workspaceId);

  let income = 0;
  let expense = 0;
  let savingsAbs = 0;
  let savingsInBucket = 0;

  const lookbackStart = new Date(now);
  lookbackStart.setDate(lookbackStart.getDate() - Math.max(30, th.lookbackDays));

  for (const t of txns) {
    const at = parseDate(t.occurred_at);
    if (!at || at < lookbackStart) continue;
    const a = txnAmountHuf(t);
    if (t.type === "income") income += a;
    else if (t.type === "expense") expense += a;
    else if (t.type === "saving") {
      savingsAbs += a;
      if (t.bucket_id) savingsInBucket += a;
    }
  }

  const months = Math.max(1, th.lookbackDays / 30);
  const monthlyExpense = expense / months;
  const freeCash = income - expense; // ami nincs kiadva (savings külön)

  if (!(monthlyExpense > 0) || !(freeCash > 0)) return null;

  const idleMonths = freeCash / monthlyExpense;
  if (idleMonths < th.idleCashMonths) return null;

  const deployedRatio = savingsAbs > 0 ? savingsInBucket / savingsAbs : 0;
  const hasBucketDefs =
    (input.workspaces ?? []).some(
      (w) =>
        (!input.workspaceId || w.id === input.workspaceId) &&
        Array.isArray(w.workspace_buckets) &&
        (w.workspace_buckets?.length ?? 0) > 0,
    ) ?? false;

  // Ha van jelentős szabad cash ÉS (nincs allokált persely VAGY alacsony bucket arány)
  if (deployedRatio >= th.minDeployedSavingsRatio && hasBucketDefs) return null;

  return {
    id: "muda-inventory-idle-cash",
    ruleId: "muda.inventory.idle_cash",
    muda: "inventory",
    severity: idleMonths >= th.idleCashMonths * 1.5 ? "critical" : "warning",
    title: `Tőkehalmozás: ~${idleMonths.toFixed(1)} havi kiadásnyi szabad egyenleg`,
    action:
      "Csoportosíts át cél-perselybe vagy kamatozó/kötött eszközbe — állíts fel havi tartalékolási szabályt a PLAN-ben.",
    impact: `Likviditás célzottá tétele; ${formatMoney(Math.round(freeCash), currency)} szabad tőke hasznosítása`,
    target: "buckets",
    metrics: {
      freeCashHuf: Math.round(freeCash),
      monthlyExpenseHuf: Math.round(monthlyExpense),
      idleMonths: Number(idleMonths.toFixed(2)),
      deployedSavingsRatio: Number(deployedRatio.toFixed(3)),
    },
  };
}

// ─── Rule: Waiting (overdue AR) ──────────────────────────────────────────────

export function detectWaitingReceivables(
  input: LeanConsultantInput,
): LeanConsultantAdvice | null {
  const currency = input.currency ?? "HUF";
  const today = startOfDay(input.now ?? new Date());
  const txns = filterTxns(input.transactions, input.workspaceId);

  const overdue = txns.filter((t) => {
    if (t.type !== "income") return false;
    const st = t.invoice_status ?? null;
    if (st !== "unpaid" && st !== "pending") return false;
    const due = parseDate(t.due_date);
    if (!due) return false;
    return startOfDay(due) < today;
  });

  if (overdue.length === 0) return null;

  const sum = overdue.reduce((acc, t) => acc + txnAmountHuf(t), 0);
  return {
    id: "muda-waiting-receivables",
    ruleId: "muda.waiting.receivables",
    muda: "waiting",
    severity: "critical",
    title: `Várakozás: ${overdue.length} lejárt vevői számla (${formatMoney(Math.round(sum), currency)})`,
    action:
      "Állíts be automatikus fizetési emlékeztetőt / előlegbekérőt; zárd a nyitott számlákat a Tételekben.",
    impact: "Cashflow várakozási idejének csökkentése, likviditás visszaállítása",
    target: "ledger",
    metrics: {
      overdueCount: overdue.length,
      overdueSumHuf: Math.round(sum),
    },
  };
}

// ─── Rule: Motion / Extra-processing (manual admin) ──────────────────────────

export function detectManualAdminMotion(
  input: LeanConsultantInput,
): LeanConsultantAdvice | null {
  const th = resolveThresholds(input.thresholds);
  const now = input.now ?? new Date();
  const txns = filterTxns(input.transactions, input.workspaceId);

  const lookbackStart = new Date(now);
  lookbackStart.setDate(lookbackStart.getDate() - th.lookbackDays);

  const recent = txns.filter((t) => {
    if (t.type !== "expense" && t.type !== "income") return false;
    const at = parseDate(t.occurred_at);
    return !!at && at >= lookbackStart;
  });

  if (recent.length < 5) return null;

  const manual = recent.filter((t) => !t.bank_raw_id);
  const ratio = manual.length / recent.length;
  if (ratio < th.manualTxnRatio) return null;

  // Ha már van bank link, akkor is jelezhetünk (nem használják)
  const severity: LeanAdviceSeverity =
    ratio >= 0.8 || input.hasBankAccountLink === false ? "warning" : "info";

  return {
    id: "muda-motion-manual-entry",
    ruleId: "muda.motion.manual_entry",
    muda: "motion",
    severity,
    title: `Felesleges admin: manuális rögzítés ${(ratio * 100).toFixed(0)}%`,
    action:
      "Kapcsold be / használd a banki importot — a behívható tételeket ne rögzítsd kézzel (poka-yoke).",
    impact: "Adminisztrációs muda csökkentése; kevesebb hibás besorolás",
    target: "bank_import",
    metrics: {
      manualCount: manual.length,
      recentCount: recent.length,
      manualRatio: Number(ratio.toFixed(3)),
    },
  };
}

// ─── Rule: Heijunka peaks ────────────────────────────────────────────────────

/**
 * Egy hónapban halmozódó nagy kötelezettségek (ÁFA, biztosítás, nagy expense).
 */
export function detectHeijunkaPeaks(input: LeanConsultantInput): HeijunkaPeak[] {
  const th = resolveThresholds(input.thresholds);
  const now = input.now ?? new Date();
  const txns = filterTxns(input.transactions, input.workspaceId);

  const lookbackStart = new Date(now);
  lookbackStart.setMonth(lookbackStart.getMonth() - 5);
  lookbackStart.setDate(1);

  const byMonth = new Map<string, { total: number; drivers: Map<string, number> }>();

  for (const t of txns) {
    if (t.type !== "expense") continue;
    const at = parseDate(t.occurred_at);
    if (!at || at < lookbackStart) continue;
    const amt = txnAmountHuf(t);
    const isLarge = amt >= th.heijunkaLargeTxnHuf;
    const isObl = isObligationCategory(String(t.category ?? ""));
    if (!isLarge && !isObl) continue;

    const key = monthKey(at);
    let bucket = byMonth.get(key);
    if (!bucket) {
      bucket = { total: 0, drivers: new Map() };
      byMonth.set(key, bucket);
    }
    bucket.total += amt;
    const label = isObl
      ? String(t.category || t.title || "Kötelezettség")
      : String(t.title || t.category || "Nagy tétel");
    bucket.drivers.set(label, (bucket.drivers.get(label) ?? 0) + amt);
  }

  // Duty fixed costs (workspace references) — hozzárendelés az aktuális hónaphoz is
  const currentKey = monthKey(now);
  for (const ws of input.workspaces ?? []) {
    if (input.workspaceId && ws.id !== input.workspaceId) continue;
    for (const d of ws.duties ?? []) {
      const cost = Number(d.fixed_cost_huf ?? 0);
      if (!(cost > 0)) continue;
      let bucket = byMonth.get(currentKey);
      if (!bucket) {
        bucket = { total: 0, drivers: new Map() };
        byMonth.set(currentKey, bucket);
      }
      bucket.total += cost;
      const label = d.name || "Kötelezettség";
      bucket.drivers.set(label, (bucket.drivers.get(label) ?? 0) + cost);
    }
  }

  if (byMonth.size === 0) return [];

  const totals = [...byMonth.values()].map((b) => b.total);
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;

  if (!(avg > 0)) return [];

  const peaks: HeijunkaPeak[] = [];
  for (const [month, bucket] of byMonth) {
    const ratio = bucket.total / avg;
    if (ratio < th.heijunkaPeakRatio) continue;
    const drivers = [...bucket.drivers.entries()]
      .map(([label, amountHuf]) => ({ label, amountHuf: Math.round(amountHuf) }))
      .sort((a, b) => b.amountHuf - a.amountHuf)
      .slice(0, 5);
    peaks.push({
      monthKey: month,
      totalHuf: Math.round(bucket.total),
      avgMonthlyHuf: Math.round(avg),
      ratio: Number(ratio.toFixed(2)),
      drivers,
    });
  }

  peaks.sort((a, b) => b.ratio - a.ratio);
  return peaks;
}

export function heijunkaPeaksToAdvice(
  peaks: HeijunkaPeak[],
  currency = "HUF",
): LeanConsultantAdvice[] {
  return peaks.slice(0, 2).map((p) => ({
    id: `heijunka-peak-${p.monthKey}`,
    ruleId: "heijunka.payment_peak",
    severity: p.ratio >= 2.5 ? "critical" : "warning",
    title: `Heijunka csúcs: ${p.monthKey} (${formatMoney(p.totalHuf, currency)})`,
    action:
      "Vezess be részletfizetést vagy havi arányos tartalékolási szabályt a PLAN-ben (kiegyenlített cashflow).",
    impact: `Csúcs / átlag = ${p.ratio}× — simább likviditás a következő ciklusban`,
    target: "plan",
    metrics: {
      monthKey: p.monthKey,
      totalHuf: p.totalHuf,
      avgMonthlyHuf: p.avgMonthlyHuf,
      ratio: p.ratio,
    },
  }));
}

// ─── 5S & napi rutin checklist ───────────────────────────────────────────────

const FIVE_S_POOL: ReadonlyArray<Omit<FiveSChecklistItem, "priority"> & { modes: PdcaUiMode[] }> = [
  {
    id: "5s-seiri-classify",
    pillar: "seiri",
    title: "Seiri: osztályozd a nyitott tételeket",
    hint: "Válaszd szét a döntésre váró / lezárható / irreleváns tételeket.",
    phase: "plan",
    modes: ["PD", "AP"],
  },
  {
    id: "5s-seiton-buckets",
    pillar: "seiton",
    title: "Seiton: tedd a helyére a tőkét",
    hint: "Cél-perselyek és költséghelyek legyenek egyértelműek a PLAN-ben.",
    phase: "plan",
    modes: ["PD", "AP"],
  },
  {
    id: "5s-seiso-ledger",
    pillar: "seiso",
    title: "Seiso: tisztítsd a főkönyvet",
    hint: "Hiányzó kategória / partner / ÁFA jelölés pótlása a DO tételeknél.",
    phase: "do",
    modes: ["PD", "DC"],
  },
  {
    id: "5s-seiketsu-import",
    pillar: "seiketsu",
    title: "Seiketsu: standard banki import",
    hint: "Ugyanaz a import-rutin minden héten — kevesebb manuális muda.",
    phase: "do",
    modes: ["DC", "CA"],
  },
  {
    id: "5s-check-muda",
    pillar: "seiketsu",
    title: "CHECK: futtasd a muda elemzést",
    hint: "Nézd meg a Lean tanácsokat és a lineage lámpát mielőtt ACT-re lépsz.",
    phase: "check",
    modes: ["DC", "CA"],
  },
  {
    id: "5s-act-execute",
    pillar: "shitsuke",
    title: "ACT: hajts végre 1–3 ajánlást",
    hint: "Ne halmozz tanácsot — zárj le legalább egy muda-ellenintézkedést.",
    phase: "act",
    modes: ["CA", "AP"],
  },
  {
    id: "5s-shitsuke-cycle",
    pillar: "shitsuke",
    title: "Shitsuke: zárd a PDCA ciklust",
    hint: "ACT → új PLAN: rögzítsd a standardot a következő ciklusra.",
    phase: "act",
    modes: ["AP"],
  },
];

/**
 * PDCA állapot alapján logikus következő 5S / napi lépések.
 */
export function generateFiveSChecklist(pdcaMode: PdcaUiMode | null | undefined): FiveSChecklistItem[] {
  const mode = pdcaMode ?? "PD";
  const items = FIVE_S_POOL.filter((i) => i.modes.includes(mode)).map((i, idx) => ({
    id: i.id,
    pillar: i.pillar,
    title: i.title,
    hint: i.hint,
    phase: i.phase,
    priority: idx + 1,
  }));
  return items;
}

/**
 * Napi / heti mini-rutin a fázis első 3 lépésével.
 */
export function generateDailyRoutineSteps(pdcaMode: PdcaUiMode | null | undefined): FiveSChecklistItem[] {
  return generateFiveSChecklist(pdcaMode).slice(0, 3);
}

// ─── Quick Wins / módszer-javaslat ───────────────────────────────────────────

function mudaHintsFromAdvice(a: LeanConsultantAdvice): Array<MudaKind | "heijunka"> {
  if (a.ruleId.startsWith("heijunka.")) return ["heijunka"];
  if (a.muda) return [a.muda];
  return [];
}

/** Releváns Lean eszközök a felismert muda / heijunka jelekhez. */
export function suggestLeanMethods(advice: LeanConsultantAdvice[]): LeanMethodId[] {
  const hints = new Set<MudaKind | "heijunka">();
  for (const a of advice) {
    for (const h of mudaHintsFromAdvice(a)) hints.add(h);
  }
  if (hints.size === 0) return ["kaizen", "5s"];

  const scored: Array<{ id: LeanMethodId; n: number }> = [];
  for (const id of Object.keys(LEAN_METHOD_TOOLKIT) as LeanMethodId[]) {
    const n = LEAN_METHOD_TOOLKIT[id].mudaHints.filter((h) => hints.has(h)).length;
    if (n > 0) scored.push({ id, n });
  }
  scored.sort((a, b) => b.n - a.n);
  const out = scored.map((s) => s.id).filter((id) => id !== "kaizen");
  // Kaizen mindig jelen van: iteratív PDCA az engine alapeleme.
  return ["kaizen", ...out].slice(0, 5);
}

/**
 * Low-hanging fruit: fix CapEx vs. folyamatos muda-megtakarítás (ROI / payback).
 * Offline heurisztika a tanácsok metrikáiból — nem felhőbecslés.
 */
export function estimateLeanQuickWins(
  advice: LeanConsultantAdvice[],
  currency = "HUF",
): LeanQuickWinsEstimate | null {
  if (advice.length === 0) return null;

  let critical = 0;
  let warning = 0;
  let monthlySavings = 0;

  for (const a of advice) {
    if (a.severity === "critical") critical += 1;
    else if (a.severity === "warning") warning += 1;

    const m = a.metrics ?? {};
    if (a.ruleId === "muda.waiting.receivables") {
      const overdue = Number(m.overdueSumHuf ?? m.overdueHuf ?? m.sumHuf ?? 0);
      if (overdue > 0) monthlySavings += overdue * 0.12;
    } else if (a.ruleId === "muda.inventory.idle_cash") {
      const idle = Number(m.freeCashHuf ?? 0);
      if (idle > 0) monthlySavings += idle * 0.015;
    } else if (a.ruleId === "heijunka.payment_peak") {
      const total = Number(m.totalHuf ?? 0);
      const avg = Number(m.avgMonthlyHuf ?? 0);
      const excess = Math.max(0, total - avg);
      monthlySavings += excess * 0.08;
    } else if (a.ruleId === "muda.motion.manual_entry") {
      const ratio = Number(m.manualRatio ?? 0);
      const count = Number(m.manualCount ?? m.count ?? 8);
      monthlySavings += Math.max(12_000, count * 4_500 * Math.max(ratio, 0.35));
    } else if (a.severity === "critical") {
      monthlySavings += 45_000;
    } else if (a.severity === "warning") {
      monthlySavings += 22_000;
    } else {
      monthlySavings += 8_000;
    }
  }

  // Minimális folyamat-beavatkozás CapEx (tréning / standard / poka-próba) — nem gépberuházás.
  const capex = Math.round(50_000 + critical * 35_000 + warning * 20_000 + Math.min(advice.length, 4) * 8_000);
  monthlySavings = Math.round(Math.max(monthlySavings, capex * 0.55));
  const annualSavings = monthlySavings * 12;
  const paybackMonths = Math.max(0.2, Math.round((capex / monthlySavings) * 10) / 10);
  const roiMultiple12m = Math.round((annualSavings / capex) * 10) / 10;
  const methodIds = suggestLeanMethods(advice);

  return {
    capexHuf: capex,
    monthlySavingsHuf: monthlySavings,
    annualSavingsHuf: annualSavings,
    paybackMonths,
    roiMultiple12m,
    messagingHu: `${LEAN_QUICK_WINS_COPY_HU} Becslés: CapEx ${formatMoney(capex, currency)} vs. ~${formatMoney(monthlySavings, currency)}/hó megtakarítás → payback ~${paybackMonths} hó, 12 havi ROI ~${roiMultiple12m}×.`,
    methodIds,
  };
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export function evaluateLeanConsultantRules(input: LeanConsultantInput): LeanConsultantAdvice[] {
  const currency = input.currency ?? "HUF";
  const advice: LeanConsultantAdvice[] = [];

  const idle = detectIdleCashInventory(input);
  if (idle) advice.push(idle);

  const waiting = detectWaitingReceivables(input);
  if (waiting) advice.push(waiting);

  const motion = detectManualAdminMotion(input);
  if (motion) advice.push(motion);

  const peaks = detectHeijunkaPeaks(input);
  advice.push(...heijunkaPeaksToAdvice(peaks, currency));

  advice.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
  return advice;
}

/** Teljes motor: tanácsok + heijunka + 5S checklist + Quick Wins */
export function runLeanConsultantEngine(input: LeanConsultantInput): LeanConsultantResult {
  const thresholds = resolveThresholds(input.thresholds);
  const now = input.now ?? new Date();
  const currency = input.currency ?? "HUF";
  const heijunkaPeaks = detectHeijunkaPeaks(input);
  const advice = evaluateLeanConsultantRules(input);
  const checklist = generateFiveSChecklist(input.pdcaMode);
  const quickWins = estimateLeanQuickWins(advice, currency);
  const suggestedMethods = suggestLeanMethods(advice);

  const cats = new Set<string>();
  let hasIncome = false;
  let hasExpense = false;
  const months = new Set<string>();
  for (const t of input.transactions) {
    if (t.category) cats.add(String(t.category));
    if (t.type === "income") hasIncome = true;
    if (t.type === "expense") hasExpense = true;
    if (t.occurred_at) months.add(String(t.occurred_at).slice(0, 7));
  }
  const vizAdvice = recommendLeanVisualizations({
    pdcaMode: input.pdcaMode,
    hasGoal: true,
    hasScenarios: true,
    categoryCount: cats.size,
    workspaceCount: input.workspaces?.length ?? 1,
    monthCount: months.size,
    hasIncomeAndExpense: hasIncome && hasExpense,
  });

  return {
    advice,
    heijunkaPeaks,
    checklist,
    thresholds,
    evaluatedAt: now.toISOString(),
    vizAdvice,
    quickWins,
    suggestedMethods,
    engineCharter: LEAN_ENGINE_CHARTER,
  };
}
