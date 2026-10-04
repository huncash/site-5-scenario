/** Adatkezelő / számlakiállító — nyilvános cégadatok. */
export const DATA_CONTROLLER = {
  legalName: "ADP-TOP Kereskedelmi és Szolgáltató Korlátolt Felelősségű Társaság",
  shortName: "ADP-TOP Kft.",
  address: "1116 Budapest, Híradó u. 29.",
  taxId: "13777164-2-43",
  /** Írásos kapcsolat: support jegy (nincs telefonos ügyfélszolgálat). */
  contactChannel: "support.szcenario.hu/ticket",
  invoiceProcessor: "Számlázz.hu",
} as const;

export const GDPR_ACK_KEY = "gdpr_acknowledged";
