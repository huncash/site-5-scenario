/**
 * Oktatási anonimizáló: élő céges számokból diák-esettanulmány.
 * Nyers IBAN / adószám / cégnév nem megy ki. Nincs hálózati küldés.
 */
import { licenseFingerprint } from "@/lib/licenseFusion";
import type { EconomicReadSnapshot } from "@/lib/bcpEconomicOverlay";

export type AnonKind = "org" | "material" | "product" | "partner" | "item" | "account" | "place";

export type AnonSourceRow = {
  raw: string;
  hint?: AnonKind;
};

export type AnonCover = {
  key: string;
  raw: string;
  kind: AnonKind;
  code: string;
  label: string;
};

export type AnonCoverPublic = {
  kind: AnonKind;
  code: string;
  label: string;
};

export type AnonLexicon = {
  org: AnonCover;
  covers: AnonCover[];
};

export type EducationCaseStudy = {
  title: string;
  orgAlias: string;
  headcountBand: string;
  cashHuf: number;
  monthlyRevenueHuf: number;
  monthlyOpexHuf: number;
  runwayMonths: number | null;
  costMix: Array<{ label: string; sharePct: number }>;
  covers: AnonCoverPublic[];
  notes: string[];
  generatedAt: string;
};

export type NostrUnsignedEvent = {
  kind: number;
  created_at: number;
  tags: string[][];
  content: string;
  pubkey: string;
};

export const NOSTR_EDU_KIND = 1;

function roundHuf(n: number): number {
  const abs = Math.abs(n);
  if (abs < 1_000) return Math.round(n / 10) * 10;
  if (abs < 100_000) return Math.round(n / 1_000) * 1_000;
  return Math.round(n / 10_000) * 10_000;
}

function headcountBand(n: number): string {
  if (n <= 5) return "1–5 fő";
  if (n <= 15) return "6–15 fő";
  if (n <= 50) return "16–50 fő";
  return "50+ fő";
}

export const ANON_KIND_PREFIX: Record<AnonKind, string> = {
  org: "T",
  material: "A",
  product: "C",
  partner: "P",
  item: "E",
  account: "S",
  place: "H",
};

const ANON_KIND_NOUN: Record<AnonKind, { hu: string; en: string }> = {
  org: { hu: "tanműhely", en: "workshop" },
  material: { hu: "alapanyag", en: "material" },
  product: { hu: "termék", en: "product" },
  partner: { hu: "partner", en: "partner" },
  item: { hu: "tétel", en: "item" },
  account: { hu: "számla", en: "account" },
  place: { hu: "helyszín", en: "site" },
};

const KIND_HINTS: Array<{ kind: AnonKind; re: RegExp }> = [
  { kind: "account", re: /\b([a-z]{2}\d{2}[a-z0-9]{10,30}|\d{8}-\d-\d{2}|iban|számlaszám|adoszam|adószám)\b/i },
  { kind: "material", re: /\b(alapanyag|nyersanyag|liszt|tej|acél|acel|alkatrész|alkatresz|ingredient|raw\s*material|feedstock)\b/i },
  { kind: "product", re: /\b(késztermék|kesztermek|termék|termek|áru|aru|sku|product|finished)\b/i },
  { kind: "place", re: /\b(telephely|raktár|raktar|üzem|uzem|műhely|muhely|warehouse|plant|site|lab)\b/i },
  { kind: "partner", re: /\b(partner|szállító|szallito|vevő|vevo|ügyfél|ugyfel|supplier|vendor|customer|kft|zrt|bt|nyrt)\b/i },
];

export function anonKey(raw: string): string {
  return raw.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

export function classifyAnonKind(raw: string, hint?: AnonKind): AnonKind {
  if (hint && hint !== "org") return hint;
  const t = raw.trim();
  for (const row of KIND_HINTS) {
    if (row.re.test(t)) return row.kind;
  }
  return "item";
}

export function formatAnonCover(kind: AnonKind, index: number, locale: "hu" | "en" = "hu"): { code: string; label: string } {
  const n = Math.max(1, Math.floor(index));
  const code = `${ANON_KIND_PREFIX[kind]}${n}`;
  const noun = ANON_KIND_NOUN[kind][locale === "en" ? "en" : "hu"];
  return { code, label: `${code} ${noun}` };
}

export function maskAnonRaw(raw: string, kind: AnonKind): string {
  const t = raw.trim();
  if (kind !== "account" || t.length < 8) return t;
  return `${t.slice(0, 2)}••••${t.slice(-4)}`;
}

export function aliasOrgLabel(raw: string): string {
  const fp = licenseFingerprint(raw.trim() || "org");
  const n = (parseInt(fp.slice(0, 2), 16) % 12) + 1;
  return `Tanműhely ${n}`;
}

function orgCover(raw: string, locale: "hu" | "en"): AnonCover {
  const alias = aliasOrgLabel(raw);
  const n = Number(alias.replace(/\D/g, "")) || 1;
  const formatted = formatAnonCover("org", n, locale);
  return {
    key: anonKey(raw) || "org",
    raw: raw.trim() || alias,
    kind: "org",
    code: formatted.code,
    label: alias,
  };
}

export function buildAnonLexicon(input: {
  orgLabel: string;
  rows?: AnonSourceRow[];
  locale?: "hu" | "en";
}): AnonLexicon {
  const locale = input.locale === "en" ? "en" : "hu";
  const org = orgCover(input.orgLabel, locale);
  const seen = new Set<string>([org.key]);
  const counters: Partial<Record<AnonKind, number>> = {};
  const covers: AnonCover[] = [org];
  for (const row of input.rows ?? []) {
    const raw = row.raw.trim();
    if (raw.length < 2) continue;
    const key = anonKey(raw);
    if (!key || seen.has(key) || key === org.key) continue;
    if (covers.length >= 81) break;
    seen.add(key);
    const kind = classifyAnonKind(raw, row.hint);
    const next = (counters[kind] ?? 0) + 1;
    counters[kind] = next;
    const formatted = formatAnonCover(kind, next, locale);
    covers.push({ key, raw, kind, code: formatted.code, label: formatted.label });
  }
  return { org, covers };
}

export function applyAnonOverrides(lexicon: AnonLexicon, overrides?: Record<string, string>): AnonLexicon {
  if (!overrides) return lexicon;
  const covers = lexicon.covers.map((c) => {
    const next = overrides[c.key]?.trim();
    if (!next) return c;
    return { ...c, label: next };
  });
  const org = covers.find((c) => c.kind === "org") ?? lexicon.org;
  return { org, covers };
}

export function scrubWithLexicon(text: string, lexicon: AnonLexicon): string {
  let out = text;
  const rows = [...lexicon.covers].sort((a, b) => b.raw.length - a.raw.length);
  for (const c of rows) {
    if (c.raw.length < 2) continue;
    out = out.split(c.raw).join(c.label);
  }
  return out;
}

export function anonRowsFromTxns(
  rows: Array<{
    party?: string | null;
    title?: string | null;
    note?: string | null;
    category?: string | null;
    customer_name?: string | null;
  }>,
): AnonSourceRow[] {
  const out: AnonSourceRow[] = [];
  for (const t of rows) {
    if (t.party) out.push({ raw: t.party, hint: "partner" });
    if (t.customer_name) out.push({ raw: t.customer_name, hint: "partner" });
    if (t.title) out.push({ raw: t.title });
    if (t.note) out.push({ raw: t.note });
    if (t.category) out.push({ raw: t.category });
  }
  return out;
}

export function anonRowsFromSnapshot(snap: EconomicReadSnapshot, extra?: AnonSourceRow[]): AnonSourceRow[] {
  return [...snap.costMix.map((row) => ({ raw: row.family })), ...(extra ?? [])];
}

export function scrubIdentifier(raw: string): string {
  const fp = licenseFingerprint(raw.trim());
  return `ID-${fp.slice(0, 6)}`;
}

export function anonymizeEconomicSnapshot(
  snap: EconomicReadSnapshot,
  title = "Oktatási esettanulmány — helyi másolat",
  opts?: { rows?: AnonSourceRow[]; overrides?: Record<string, string>; locale?: "hu" | "en" },
): EducationCaseStudy {
  const cash = roundHuf(snap.cashHuf);
  const rev = roundHuf(snap.monthlyRevenueNet);
  const opex = roundHuf(snap.monthlyOpexHuf);
  const lexicon = applyAnonOverrides(
    buildAnonLexicon({
      orgLabel: snap.orgLabel,
      rows: anonRowsFromSnapshot(snap, opts?.rows),
      locale: opts?.locale,
    }),
    opts?.overrides,
  );
  const byKey = new Map(lexicon.covers.map((c) => [c.key, c]));
  return {
    title,
    orgAlias: lexicon.org.label,
    headcountBand: headcountBand(snap.headcount),
    cashHuf: cash,
    monthlyRevenueHuf: rev,
    monthlyOpexHuf: opex,
    runwayMonths: snap.runwayMonths == null ? null : Math.round(snap.runwayMonths * 10) / 10,
    costMix: snap.costMix.map((row) => ({
      label: byKey.get(anonKey(row.family))?.label ?? scrubWithLexicon(row.family, lexicon),
      sharePct: Math.round(row.share * 100),
    })),
    covers: lexicon.covers.map(({ kind, code, label }) => ({ kind, code, label })),
    notes: [
      "A nevek, adószámok és számlaszámok nincsenek a másolatban.",
      "Az összegek kerekítettek; az arányok megmaradnak.",
      "Fedőnevek kategória szerint (A/C/P…) — a nyers megnevezés nem megy ki.",
      "Diák / partner másolat — nem élő könyvelés.",
    ],
    generatedAt: new Date().toISOString(),
  };
}

export function isEducationCaseStudy(v: unknown): v is EducationCaseStudy {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.orgAlias === "string" &&
    typeof o.cashHuf === "number" &&
    typeof o.monthlyRevenueHuf === "number" &&
    typeof o.monthlyOpexHuf === "number" &&
    Array.isArray(o.costMix)
  );
}

export function studyContainsRawLeak(study: EducationCaseStudy, raw: string[]): boolean {
  const blob = JSON.stringify(study).toLowerCase();
  return raw.some((s) => s.trim().length > 3 && blob.includes(s.trim().toLowerCase()));
}

/** Helyi Nostr-esemény. Relayre a felhasználó teszi, ha akarja — a szoftver nem pingel. */
export function buildEducationNostrNote(study: EducationCaseStudy, pubkey = ""): NostrUnsignedEvent {
  return {
    kind: NOSTR_EDU_KIND,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["t", "szcenario-edu"],
      ["anon", "1"],
      ["client", "szcenario"],
    ],
    content: JSON.stringify(study),
    pubkey,
  };
}
