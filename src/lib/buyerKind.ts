export type BuyerKind = "b2c" | "b2b";

/** A választott partner típus a forrás — opcionális B2C adószám nem billenti B2B-re. */
export function resolveBuyerKind(kind: BuyerKind, _taxId?: string): BuyerKind {
  return kind;
}
