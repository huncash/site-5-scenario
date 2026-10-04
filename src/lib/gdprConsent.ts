import { GDPR_ACK_KEY } from "@/content/legal";

export function hasGdprAcknowledged(storage?: Pick<Storage, "getItem"> | null): boolean {
  try {
    const s = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);
    return s?.getItem(GDPR_ACK_KEY) === "true";
  } catch {
    return false;
  }
}

export function setGdprAcknowledged(storage?: Pick<Storage, "setItem"> | null): void {
  try {
    const s = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);
    s?.setItem(GDPR_ACK_KEY, "true");
  } catch {
    /* ignore quota / private mode */
  }
}
