/** Official MNB mid-rate (középárfolyam) for HUF→EUR display. Model stays HUF. */

export const MNB_RATE_STORAGE_KEY = "szcenario_mnb_eur";
export const MNB_RATE_EVENT = "szcenario:mnb_rate";

/** Last published official EUR mid-rate used when offline / CORS blocks SOAP. */
export const FALLBACK_HUF_PER_EUR = 367.87;
export const FALLBACK_MNB_DATE = "2026-10-02";

const SOAP_URL = "http://www.mnb.hu/arfolyamok.asmx";
const SOAP_PROXY = "/mnb-rates";
const HTML_URL = "https://www.mnb.hu/arfolyamok";
const SOAP_ACTION = "http://www.mnb.hu/webservices/MNBArfolyamServiceSoap/GetCurrentExchangeRates";
const SOAP_BODY =
  '<?xml version="1.0" encoding="utf-8"?>' +
  '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
  "<soap:Body>" +
  '<GetCurrentExchangeRates xmlns="http://www.mnb.hu/webservices/" />' +
  "</soap:Body>" +
  "</soap:Envelope>";

export type MnbQuote = {
  rate: number;
  date: string;
  source: "mnb" | "cache" | "fallback";
};

let memory: MnbQuote | null = null;
let inflight: Promise<MnbQuote> | null = null;

export function parseHuNumber(raw: string): number | null {
  const n = Number(String(raw).trim().replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function parseMnbEur(xml: string): MnbQuote | null {
  if (!xml) return null;
  const decoded = xml
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
  const date =
    decoded.match(/Day\s+date="(\d{4}-\d{2}-\d{2})"/i)?.[1] ??
    decoded.match(/date="(\d{4}-\d{2}-\d{2})"/i)?.[1] ??
    FALLBACK_MNB_DATE;
  const soap = decoded.match(/<Rate\b[^>]*\bcurr="EUR"[^>]*>([0-9]+,[0-9]+)<\/Rate>/i);
  const soapFlip = decoded.match(/<Rate\b[^>]*>([0-9]+,[0-9]+)<\/Rate>[^<]*curr="EUR"/i);
  const html = decoded.match(/>EUR<\/t[dh]>\s*<t[dh]>[^<]*<\/t[dh]>\s*<t[dh]>\s*(\d+)\s*<\/t[dh]>\s*<t[dh]>\s*([0-9]+,[0-9]+)/i);
  const loose = decoded.match(/\bEUR\b[^0-9]{0,80}([0-9]{2,4},[0-9]{2,5})/);
  const unitMatch = decoded.match(/<Rate\b[^>]*\bcurr="EUR"[^>]*\bunit="(\d+)"/i);
  const raw = soap?.[1] ?? soapFlip?.[1] ?? html?.[2] ?? loose?.[1];
  const parsed = raw ? parseHuNumber(raw) : null;
  if (parsed == null) return null;
  const unit = Number(html?.[1] ?? unitMatch?.[1] ?? 1) || 1;
  const rate = parsed / unit;
  if (rate < 200 || rate > 800) return null;
  return { rate, date, source: "mnb" };
}

function fallbackQuote(): MnbQuote {
  return { rate: FALLBACK_HUF_PER_EUR, date: FALLBACK_MNB_DATE, source: "fallback" };
}

function readStored(): MnbQuote | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(MNB_RATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { rate?: unknown; date?: unknown };
    const rate = typeof parsed.rate === "number" ? parsed.rate : parseHuNumber(String(parsed.rate ?? ""));
    if (rate == null || rate < 200 || rate > 800) return null;
    const date = typeof parsed.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : FALLBACK_MNB_DATE;
    return { rate, date, source: "cache" };
  } catch {
    return null;
  }
}

function persist(quote: MnbQuote): void {
  memory = quote;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(MNB_RATE_STORAGE_KEY, JSON.stringify({ rate: quote.rate, date: quote.date }));
    }
  } catch {
    /* private mode */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MNB_RATE_EVENT, { detail: quote }));
  }
}

export function getHufPerEur(): number {
  return memory?.rate ?? readStored()?.rate ?? FALLBACK_HUF_PER_EUR;
}

export function getMnbQuote(): MnbQuote {
  return memory ?? readStored() ?? fallbackQuote();
}

export function resetMnbRateForTests(): void {
  memory = null;
  inflight = null;
}

async function fetchSoap(url: string): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: SOAP_ACTION,
    },
    body: SOAP_BODY,
  });
  if (!res.ok) throw new Error(`mnb soap ${res.status}`);
  return res.text();
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`mnb html ${res.status}`);
  return res.text();
}

export async function refreshMnbEurRate(): Promise<MnbQuote> {
  if (inflight) return inflight;
  inflight = (async () => {
    const attempts: Array<() => Promise<string>> = [
      () => fetchSoap(SOAP_PROXY),
      () => fetchSoap(SOAP_URL),
      () => fetchHtml(HTML_URL),
    ];
    for (const attempt of attempts) {
      try {
        const parsed = parseMnbEur(await attempt());
        if (parsed) {
          persist(parsed);
          return parsed;
        }
      } catch {
        /* next source */
      }
    }
    const cached = readStored();
    if (cached) {
      memory = cached;
      return cached;
    }
    const fb = fallbackQuote();
    memory = fb;
    return fb;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}
