import { describe, expect, it } from "vitest";

import {
  CASE_PAYLOAD_HEAVY_BYTES,
  CASE_PAYLOAD_HEAVY_TXNS,
  weighCasePayload,
} from "@/lib/casePayload";

describe("casePayload", () => {
  it("stays light on a small encrypted case", () => {
    const r = weighCasePayload({
      txnEnc: [{ data_enc: "abcd" }, { data_enc: "ef" }],
      bankRaw: [{ data_enc: "raw" }],
      snapshots: [],
    });
    expect(r.txnCount).toBe(2);
    expect(r.bankRawCount).toBe(1);
    expect(r.heavy).toBe(false);
    expect(r.approxBytes).toBeGreaterThan(0);
  });

  it("flags huge txn counts for desktop", () => {
    const r = weighCasePayload({
      txnEnc: Array.from({ length: CASE_PAYLOAD_HEAVY_TXNS }, () => ({ data_enc: "x" })),
    });
    expect(r.heavy).toBe(true);
  });

  it("flags large blob size for desktop", () => {
    const r = weighCasePayload({
      txnEnc: [{ data_enc: "y".repeat(CASE_PAYLOAD_HEAVY_BYTES) }],
    });
    expect(r.heavy).toBe(true);
  });
});
