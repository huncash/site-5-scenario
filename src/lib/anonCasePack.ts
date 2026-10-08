/**
 * Helyi oktatási megosztó-csomag: {alias}_anonim_eset.szc
 * Vágólap + fájl. Nincs hálózati küldés.
 */
import {
  anonymizeEconomicSnapshot,
  buildEducationNostrNote,
  isEducationCaseStudy,
  studyContainsRawLeak,
  type AnonSourceRow,
  type EducationCaseStudy,
  type NostrUnsignedEvent,
} from "@/lib/educationAnonymize";
import type { EconomicReadSnapshot } from "@/lib/bcpEconomicOverlay";
import { sha256Hex } from "@/lib/hash";
import { renderPdCaSummaShots } from "@/lib/pdcaSummaShot";

export const ANON_CASE_KIND = "szcenario.anonim_eset";
export const ANON_CASE_VERSION = 1;
export const ANON_CASE_EXT = "_anonim_eset.szc";
export const ANON_CASE_MAX_BYTES = 1_500_000;

const LIVE_PII = [
  /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/,
  /\b\d{8}-\d-\d{2}\b/,
  /\b\+36[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{3,4}\b/,
  /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i,
];

export type AnonCasePack = {
  v: typeof ANON_CASE_VERSION;
  kind: typeof ANON_CASE_KIND;
  filename: string;
  study: EducationCaseStudy;
  shots: { pd: string; ca: string };
  nostr: NostrUnsignedEvent;
  sha: string;
  generatedAt: string;
  localOnly: true;
};

export type AnonPackResult =
  | { ok: true; pack: AnonCasePack; text: string }
  | { ok: false; reason: "anon" | "leak" | "pii" | "parse" | "kind" | "size" | "sha"; message: string };

export const ANON_PACK_BLOCKED_HU =
  "A csomag nem készül el: az anonimizáló ki van kapcsolva, vagy nyers adat szivárogna.";

export function slugAnonAlias(alias: string): string {
  const raw = alias
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return raw || "xyz";
}

export function anonCaseFilename(alias: string): string {
  return `${slugAnonAlias(alias)}${ANON_CASE_EXT}`;
}

export function isAnonCaseFilename(name: string): boolean {
  return /_anonim_eset\.szc$/i.test(name.trim());
}

export function textContainsLivePii(raw: string): boolean {
  const blob = raw.trim();
  if (!blob) return false;
  return LIVE_PII.some((re) => re.test(blob));
}

async function packSha(study: EducationCaseStudy, shots: { pd: string; ca: string }): Promise<string> {
  return sha256Hex(JSON.stringify({ study, pd: shots.pd.length, ca: shots.ca.length }));
}

export async function buildAnonCasePack(
  snapshot: EconomicReadSnapshot,
  opts: {
    anonOn: boolean;
    leakNeedles?: string[];
    rows?: AnonSourceRow[];
    overrides?: Record<string, string>;
    locale?: "hu" | "en";
  } = { anonOn: true },
): Promise<AnonPackResult> {
  if (!opts.anonOn) {
    return { ok: false, reason: "anon", message: ANON_PACK_BLOCKED_HU };
  }
  const study = anonymizeEconomicSnapshot(snapshot, undefined, {
    rows: opts.rows,
    overrides: opts.overrides,
    locale: opts.locale,
  });
  const needles = opts.leakNeedles ?? [snapshot.orgLabel];
  if (studyContainsRawLeak(study, needles)) {
    return { ok: false, reason: "leak", message: ANON_PACK_BLOCKED_HU };
  }
  const shots = renderPdCaSummaShots(study);
  const nostr = buildEducationNostrNote(study);
  const draft = JSON.stringify({ study, shots, nostr });
  if (textContainsLivePii(draft)) {
    return { ok: false, reason: "pii", message: ANON_PACK_BLOCKED_HU };
  }
  const pack: AnonCasePack = {
    v: ANON_CASE_VERSION,
    kind: ANON_CASE_KIND,
    filename: anonCaseFilename(study.orgAlias),
    study,
    shots,
    nostr,
    sha: await packSha(study, shots),
    generatedAt: study.generatedAt,
    localOnly: true,
  };
  const text = JSON.stringify(pack, null, 2);
  if (text.length > ANON_CASE_MAX_BYTES) {
    return { ok: false, reason: "size", message: ANON_PACK_BLOCKED_HU };
  }
  return { ok: true, pack, text };
}

export async function parseAnonCasePack(raw: string): Promise<AnonPackResult> {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: "parse", message: ANON_PACK_BLOCKED_HU };
  if (trimmed.length > ANON_CASE_MAX_BYTES) {
    return { ok: false, reason: "size", message: ANON_PACK_BLOCKED_HU };
  }
  if (textContainsLivePii(trimmed)) {
    return { ok: false, reason: "pii", message: ANON_PACK_BLOCKED_HU };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed) as unknown;
  } catch {
    return { ok: false, reason: "parse", message: ANON_PACK_BLOCKED_HU };
  }
  const o = parsed as Record<string, unknown>;
  if (o?.kind === ANON_CASE_KIND && o?.v === ANON_CASE_VERSION && isEducationCaseStudy(o.study)) {
    const study = o.study;
    const shotsRaw = o.shots as { pd?: string; ca?: string } | undefined;
    const shots = {
      pd: typeof shotsRaw?.pd === "string" ? shotsRaw.pd : renderPdCaSummaShots(study).pd,
      ca: typeof shotsRaw?.ca === "string" ? shotsRaw.ca : renderPdCaSummaShots(study).ca,
    };
    const nostr =
      o.nostr && typeof o.nostr === "object"
        ? (o.nostr as NostrUnsignedEvent)
        : buildEducationNostrNote(study);
    const sha = typeof o.sha === "string" ? o.sha : await packSha(study, shots);
    const expected = await packSha(study, shots);
    if (typeof o.sha === "string" && o.sha !== expected) {
      return { ok: false, reason: "sha", message: ANON_PACK_BLOCKED_HU };
    }
    const pack: AnonCasePack = {
      v: ANON_CASE_VERSION,
      kind: ANON_CASE_KIND,
      filename: typeof o.filename === "string" ? o.filename : anonCaseFilename(study.orgAlias),
      study,
      shots,
      nostr,
      sha,
      generatedAt: typeof o.generatedAt === "string" ? o.generatedAt : study.generatedAt,
      localOnly: true,
    };
    return { ok: true, pack, text: JSON.stringify(pack, null, 2) };
  }
  if (typeof o?.content === "string") {
    try {
      const study = JSON.parse(o.content) as unknown;
      if (isEducationCaseStudy(study)) {
        const shots = renderPdCaSummaShots(study);
        const pack: AnonCasePack = {
          v: ANON_CASE_VERSION,
          kind: ANON_CASE_KIND,
          filename: anonCaseFilename(study.orgAlias),
          study,
          shots,
          nostr: o as unknown as NostrUnsignedEvent,
          sha: await packSha(study, shots),
          generatedAt: study.generatedAt,
          localOnly: true,
        };
        return { ok: true, pack, text: JSON.stringify(pack, null, 2) };
      }
    } catch {
      return { ok: false, reason: "parse", message: ANON_PACK_BLOCKED_HU };
    }
  }
  if (isEducationCaseStudy(parsed)) {
    const shots = renderPdCaSummaShots(parsed);
    const pack: AnonCasePack = {
      v: ANON_CASE_VERSION,
      kind: ANON_CASE_KIND,
      filename: anonCaseFilename(parsed.orgAlias),
      study: parsed,
      shots,
      nostr: buildEducationNostrNote(parsed),
      sha: await packSha(parsed, shots),
      generatedAt: parsed.generatedAt,
      localOnly: true,
    };
    return { ok: true, pack, text: JSON.stringify(pack, null, 2) };
  }
  return { ok: false, reason: "kind", message: ANON_PACK_BLOCKED_HU };
}

export function isLocalSzcPackText(text: string): boolean {
  try {
    const o = JSON.parse(text) as { kind?: string; v?: number };
    return o?.kind === ANON_CASE_KIND && o?.v === ANON_CASE_VERSION && !textContainsLivePii(text);
  } catch {
    return false;
  }
}

export function downloadAnonCaseFile(filename: string, text: string): void {
  if (typeof document === "undefined") return;
  if (!isLocalSzcPackText(text)) return;
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".szc") ? filename : anonCaseFilename(filename);
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function copyAnonCaseToClipboard(text: string): Promise<boolean> {
  if (!isLocalSzcPackText(text)) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
