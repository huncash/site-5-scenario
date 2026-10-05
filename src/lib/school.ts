export const SCHOOL_HOST = "school.szcenario.hu";
export const SCHOOL_ORIGIN_PROD = "https://school.szcenario.hu";
export const SCHOOL_CASES = 1;
export const SCHOOL_SLOTS_PER_CASE = 2;
export const SCHOOL_WATERMARK = "Oktatási Licenc – Üzleti célra nem használható";
export const SCHOOL_PROOF_KEY = "szcenario_school_proof_v1";
export const SCHOOL_SESSION_KEY = "szcenario_school_channel";
export const SCHOOL_PROOF_EVENT = "szcenario:school_proof";
export const SCHOOL_VPS_IPV4 = "195.228.152.141";
export const SCHOOL_PROOF_MAX_BYTES = 8 * 1024 * 1024;

const HU_EDU_EXACT = new Set([
  "elte.hu",
  "inf.elte.hu",
  "bme.hu",
  "mail.bme.hu",
  "corvinus.hu",
  "uni-corvinus.hu",
  "unideb.hu",
  "u-szeged.hu",
  "szte.hu",
  "pte.hu",
  "uni-miskolc.hu",
  "uni-nke.hu",
  "nke.hu",
  "semmelweis.hu",
  "uni-sopron.hu",
  "nye.hu",
  "uni-eszterhazy.hu",
  "uni-obuda.hu",
  "uni-obuda.hu",
  "sze.hu",
  "uni-pannon.hu",
  "uni-mate.hu",
  "mome.hu",
  "metropolitan.hu",
  "nje.hu",
  "kodolanyi.hu",
  "gde.hu",
  "edutus.hu",
  "szfe.hu",
  "lfze.hu",
  "mke.hu",
]);

export type SchoolProof =
  | { kind: "edu-email"; email: string; at: string }
  | { kind: "id-upload"; fileName: string; size: number; mime: string; at: string };

function hostOf(hostname?: string): string {
  return (hostname ?? (typeof window !== "undefined" ? window.location.hostname : ""))
    .toLowerCase()
    .replace(/\.$/, "");
}

function pathOf(pathname?: string): string {
  const p = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const n = p.replace(/\/+$/, "");
  return n || "/";
}

export function isSchoolHostname(hostname?: string): boolean {
  const h = hostOf(hostname);
  return h === SCHOOL_HOST || h.startsWith("school.");
}

export function isSchoolPath(pathname?: string): boolean {
  const p = pathOf(pathname);
  return p === "/school" || p.startsWith("/school/");
}

export function isSchoolSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SCHOOL_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSchoolSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SCHOOL_SESSION_KEY, "1");
  } catch {
    // ignore
  }
}

export function isSchoolHost(hostname?: string, pathname?: string): boolean {
  return isSchoolHostname(hostname) || isSchoolPath(pathname) || isSchoolSession();
}

export function schoolPublicHref(hostname?: string, pathname?: string): string {
  if (isSchoolHostname(hostname)) return "/";
  const h = hostOf(hostname);
  if (/^(localhost|127\.0\.0\.1)$/.test(h) || isSchoolPath(pathname)) return "/school";
  return SCHOOL_ORIGIN_PROD;
}

export function isEduEmail(raw: string): boolean {
  const email = raw.trim().toLowerCase();
  const m = email.match(/^[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})$/i);
  if (!m) return false;
  const d = m[1].toLowerCase();
  if (d.endsWith(".edu") || d.endsWith(".edu.hu") || d.endsWith(".ac.uk") || d.endsWith(".ac.hu")) return true;
  if (d.includes(".edu.")) return true;
  if (d.startsWith("uni-") || d.includes(".uni-")) return true;
  if (d.includes("egyetem") || d.includes("oktatas")) return true;
  return HU_EDU_EXACT.has(d);
}

export function isSchoolProofFile(file: Pick<File, "name" | "size" | "type">): boolean {
  if (file.size <= 0 || file.size > SCHOOL_PROOF_MAX_BYTES) return false;
  const mime = (file.type || "").toLowerCase();
  if (mime === "application/pdf" || mime === "image/jpeg" || mime === "image/png" || mime === "image/webp") {
    return true;
  }
  return /\.(pdf|jpe?g|png|webp)$/i.test(file.name);
}

export function readSchoolProof(): SchoolProof | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SCHOOL_PROOF_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as SchoolProof;
    if (p?.kind === "edu-email" && typeof p.email === "string") return p;
    if (p?.kind === "id-upload" && typeof p.fileName === "string") return p;
    return null;
  } catch {
    return null;
  }
}

export function writeSchoolProof(proof: SchoolProof): void {
  window.localStorage.setItem(SCHOOL_PROOF_KEY, JSON.stringify(proof));
  markSchoolSession();
  window.dispatchEvent(new Event(SCHOOL_PROOF_EVENT));
}

export function isSchoolVerified(): boolean {
  return readSchoolProof() != null;
}
