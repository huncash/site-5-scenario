/**
 * Case-en belüli adathalmaz súlya — multicase optimalizálás, helyi kalkulus.
 * Óriási halmaznál a böngésző a szűk keresztmetszet: dedikált asztali / erősebb gép.
 */

export const CASE_PAYLOAD_HEAVY_BYTES = 12 * 1024 * 1024;
export const CASE_PAYLOAD_HEAVY_TXNS = 80_000;

export const CASE_PAYLOAD_DESKTOP_HINT_HU =
  "Nagy adathalmaznál a stabil futtatáshoz dedikált asztali gép / erősebb hardver ajánlott — a böngésző a szűk keresztmetszet.";

export type CasePayloadReport = {
  txnCount: number;
  bankRawCount: number;
  snapshotCount: number;
  approxBytes: number;
  heavy: boolean;
};

export function approxBlobBytes(value: unknown): number {
  if (typeof value === "string") return value.length;
  if (value == null) return 0;
  try {
    return JSON.stringify(value).length;
  } catch {
    return 0;
  }
}

export async function weighActiveCaseFromLocalDb(): Promise<CasePayloadReport> {
  const { localdb } = await import("@/lib/localdb");
  const [txns, raw, snaps] = await Promise.all([
    localdb.listTxns(),
    localdb.listBankRaw(),
    localdb.listSnapshots(),
  ]);
  return weighCasePayload({
    txnEnc: txns.map((r) => r.data_enc),
    bankRaw: raw,
    snapshots: snaps.map((r) => r.data_enc),
  });
}

export function weighCasePayload(input: {
  txnEnc?: readonly unknown[];
  bankRaw?: readonly unknown[];
  snapshots?: readonly unknown[];
}): CasePayloadReport {
  const txnEnc = input.txnEnc ?? [];
  const bankRaw = input.bankRaw ?? [];
  const snapshots = input.snapshots ?? [];
  const approxBytes =
    txnEnc.reduce((n, row) => n + approxBlobBytes(row), 0) +
    bankRaw.reduce((n, row) => n + approxBlobBytes(row), 0) +
    snapshots.reduce((n, row) => n + approxBlobBytes(row), 0);
  const txnCount = txnEnc.length;
  return {
    txnCount,
    bankRawCount: bankRaw.length,
    snapshotCount: snapshots.length,
    approxBytes,
    heavy: approxBytes >= CASE_PAYLOAD_HEAVY_BYTES || txnCount >= CASE_PAYLOAD_HEAVY_TXNS,
  };
}
