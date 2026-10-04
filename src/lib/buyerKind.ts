export type BuyerKind = "b2c" | "b2b";

/** Céges adószám → B2B; egyébként a választott partner típus. */
export function resolveBuyerKind(kind: BuyerKind, taxId: string): BuyerKind {
  const tax = taxId.replace(/[\s./-]/g, "");
  if (tax.length >= 8) return "b2b";
  return kind;
}
