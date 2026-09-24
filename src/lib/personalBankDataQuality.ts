export type PersonalBankQualitySummary = {
  totalPersonal: number;
  totalPersonalBank: number;
  uncategorized: number;
  missingParty: number;
  missingDescription: number;
  duplicateBankRawIdsExtraRows: number;
  sampleDuplicateBankRawIds: string[];
};

export function analyzePersonalBankQuality(input: {
  payloads: Array<{
    workspace?: string | null;
    source?: string | null;
    bank_raw_id?: string | null;
    category?: string | null;
    party?: string | null;
    title?: string | null;
    note?: string | null;
  }>;
}): PersonalBankQualitySummary {
  let totalPersonal = 0;
  let totalPersonalBank = 0;
  let uncategorized = 0;
  let missingParty = 0;
  let missingDescription = 0;

  const byRaw = new Map<string, number>();
  for (const p of input.payloads) {
    const ws = String(p?.workspace ?? "personal");
    if (ws !== "personal") continue;
    totalPersonal++;

    const isBank = String(p?.source ?? "") === "bank" || Boolean(p?.bank_raw_id);
    if (!isBank) continue;
    totalPersonalBank++;

    if (String(p?.category ?? "") === "uncategorized") uncategorized++;
    if (!String(p?.party ?? "").trim()) missingParty++;
    const desc = [p?.title ?? "", p?.note ?? ""].filter(Boolean).join(" ").trim();
    if (!desc) missingDescription++;

    const rawId = String(p?.bank_raw_id ?? "");
    if (rawId) byRaw.set(rawId, (byRaw.get(rawId) ?? 0) + 1);
  }

  let duplicateBankRawIdsExtraRows = 0;
  const sampleDuplicateBankRawIds: string[] = [];
  for (const [k, n] of byRaw) {
    if (n <= 1) continue;
    duplicateBankRawIdsExtraRows += n - 1;
    if (sampleDuplicateBankRawIds.length < 8) sampleDuplicateBankRawIds.push(k);
  }

  return {
    totalPersonal,
    totalPersonalBank,
    uncategorized,
    missingParty,
    missingDescription,
    duplicateBankRawIdsExtraRows,
    sampleDuplicateBankRawIds,
  };
}

