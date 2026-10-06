export class BillingRoutingError extends Error {
  readonly routing = true as const;
  constructor() {
    super("API végpont nem elérhető / routing hiba");
    this.name = "BillingRoutingError";
  }
}

export function isBillingRoutingError(err: unknown): boolean {
  return (
    err instanceof BillingRoutingError ||
    (typeof err === "object" && err !== null && "routing" in err && (err as { routing?: boolean }).routing === true)
  );
}

export function parseBillingJson<T>(text: string, contentType = ""): T {
  const trimmed = text.trim();
  const html = /html/i.test(contentType) || /^<!doctype|^<html/i.test(trimmed) || /^</.test(trimmed);
  if (!trimmed || html) throw new BillingRoutingError();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new BillingRoutingError();
  }
}

export async function readBillingJson<T>(res: Response): Promise<T> {
  return parseBillingJson<T>(await res.text(), res.headers.get("content-type") || "");
}
