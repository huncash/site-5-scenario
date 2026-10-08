import { describe, expect, it } from "vitest";

import { bucketNameForLocale, categoryLabelForLocale, txnTitleForLocale } from "@/i18n/categories";

describe("categories locale overlay", () => {
  it("keeps HU labels on hu", () => {
    expect(categoryLabelForLocale("salary", "Fizetés", "hu")).toBe("Fizetés");
    expect(categoryLabelForLocale("BÉR: Bruttó havi", "BÉR: Bruttó havi", "hu")).toBe("BÉR: Bruttó havi");
  });

  it("overlays EN for personal and business ledger ids", () => {
    expect(categoryLabelForLocale("salary", "Fizetés", "en")).toBe("Salary");
    expect(categoryLabelForLocale("BÉR: Bruttó havi", "BÉR: Bruttó havi", "en")).toBe("PAYROLL: Gross monthly");
    expect(categoryLabelForLocale("REZSI: Bank szla.díjak", "REZSI: Bank szla.díjak", "en")).toBe(
      "OVERHEAD: Bank fees",
    );
  });

  it("overlays txn titles and buckets", () => {
    expect(txnTitleForLocale("Céltartalék-puffer félretétel", "en")).toBe("Reserve-buffer set-aside");
    expect(bucketNameForLocale("Eszközalap", "en")).toBe("Asset fund");
    expect(bucketNameForLocale("Céltartalék-puffer", "hu")).toBe("Céltartalék-puffer");
  });
});
