import { readClientLocale, type Locale } from "@/i18n/locale";

/** Personal preset IDs → EN. Business IDs keep the HU ledger code as key. */
export const CATEGORY_LABEL_EN: Record<string, string> = {
  salary: "Salary",
  freelance: "Freelance",
  "other-income": "Other income",
  uncategorized: "Uncategorized",
  housing: "Housing",
  food: "Food",
  transport: "Transport",
  utilities: "Utilities",
  entertainment: "Entertainment",
  health: "Health",
  shopping: "Shopping",
  education: "Education",
  savings: "Saving",
  loan_repayment: "Loan repayment",
  other: "Other",
  "PÉNZÜGYI KIADÁSOK: Hitel törlesztés": "FINANCIAL OUTFLOW: Loan repayment",
  "ANYAG: Beszerzés (resale)": "MATERIALS: Resale purchase",
  "ANYAG: Továbbértékesítés": "MATERIALS: Resale",
  ÉRTÉKESÍTÉS: "SALES",
  "PÉNZÜGYI BEVÉTELEK: Áru vissza/befizetés": "FINANCIAL INCOME: Goods return / pay-in",
  "PÉNZÜGYI BEVÉTELEK: ATM befizetés": "FINANCIAL INCOME: ATM deposit",
  "PÉNZÜGYI BEVÉTELEK: Banki hitel beérkezés": "FINANCIAL INCOME: Bank loan received",
  "PÉNZÜGYI BEVÉTELEK: NAV ÁFA visszatérítés": "FINANCIAL INCOME: VAT refund",
  "PÉNZÜGYI BEVÉTELEK: Tagi kölcsön befizetés": "FINANCIAL INCOME: Member loan in",
  "TŐKE: Alaptőke befizetés": "CAPITAL: Share capital in",
  "BÉR: Bruttó havi": "PAYROLL: Gross monthly",
  "BÉR: Bér nettó": "PAYROLL: Net wage",
  "BÉR: NAV bér járulék": "PAYROLL: Wage contributions",
  "BÉR: Alvállalkozói kifizetések": "PAYROLL: Subcontractor pay",
  "BESZERZÉS: Alapanyag": "PROCUREMENT: Raw material",
  "BESZERZÉS: Ital / nagyker": "PROCUREMENT: Drink / wholesale",
  "BESZERZÉS: Csomagolás": "PROCUREMENT: Packaging",
  "BESZERZÉS: Kiszállítás": "PROCUREMENT: Delivery",
  "REZSI: Adók": "OVERHEAD: Taxes",
  "REZSI: Bank szla.díjak": "OVERHEAD: Bank fees",
  "REZSI: Informatikus": "OVERHEAD: IT contractor",
  "REZSI: Internet +tárhely.eu": "OVERHEAD: Internet + hosting",
  "REZSI: IPA": "OVERHEAD: Local business tax",
  "REZSI: Iroda bérlet": "OVERHEAD: Office rent",
  "REZSI: Irodaszerek": "OVERHEAD: Office supplies",
  "REZSI: Könyvelés": "OVERHEAD: Bookkeeping",
  "REZSI: Tel., mobitelefon": "OVERHEAD: Phone",
  "REZSI: Ügyvéd": "OVERHEAD: Lawyer",
  "REZSI: Egyéb rezsi ktg.": "OVERHEAD: Other overhead",
  "FEJLESZTÉS: Folyamatfejlesztés": "DEVELOPMENT: Process",
  "FEJLESZTÉS: Üzletviteli tanácsadás": "DEVELOPMENT: Business advice",
  "FEJLESZTÉS: Marketing": "DEVELOPMENT: Marketing",
  "FEJLESZTÉS: Új eszköz": "DEVELOPMENT: New asset",
  "FLOTTA: Autómentés": "FLEET: Roadside",
  "FLOTTA: Autómosás": "FLEET: Car wash",
  "FLOTTA: Autópályadíj": "FLEET: Toll",
  "FLOTTA: Biztosítás casco": "FLEET: Casco",
  "FLOTTA: Biztosítás KGFB": "FLEET: Third-party insurance",
  "FLOTTA: Büntetés": "FLEET: Fine",
  "FLOTTA: Egyéb adó": "FLEET: Other tax",
  "FLOTTA: Érdekképviselet tagdíj": "FLEET: Association fee",
  "FLOTTA: Gépjárműadó": "FLEET: Vehicle tax",
  "FLOTTA: Gumi": "FLEET: Tyres",
  "FLOTTA: Hatósági díj (vizsga)": "FLEET: Authority fee (test)",
  "FLOTTA: Oktatás": "FLEET: Training",
  "FLOTTA: Parkolás": "FLEET: Parking",
  "FLOTTA: Súly adó": "FLEET: Weight tax",
  "FLOTTA: Tankolás": "FLEET: Fuel",
  "FLOTTA: Szerviz": "FLEET: Service",
  "FLOTTA: Flotta egyéb ktg.": "FLEET: Other fleet",
  "EGYEBEK: Autó bérlés": "OTHER: Car hire",
  "EGYEBEK: Autó törlesztő": "OTHER: Car installment",
  "EGYEBEK: Telephely engedély kérelem": "OTHER: Site permit",
  "EGYEBEK: Utánfutó bérlés": "OTHER: Trailer hire",
  "EGYEBEK: Program költség": "OTHER: Software",
  "EGYEBEK: Egyéb ktg.": "OTHER: Other cost",
  "BERUHÁZÁSOK: Autó vétel": "CAPEX: Car purchase",
  "BERUHÁZÁSOK: Egyéb beruházások": "CAPEX: Other investment",
  "PÉNZÜGYI KIADÁSOK: ATM kifizetés": "FINANCIAL OUTFLOW: ATM withdrawal",
  "PÉNZÜGYI KIADÁSOK: Banki hitel visszafizetése": "FINANCIAL OUTFLOW: Bank loan repayment",
  "PÉNZÜGYI KIADÁSOK: Hitel kamat megfizetése": "FINANCIAL OUTFLOW: Loan interest",
  "PÉNZÜGYI KIADÁSOK: Osztalék kifizetés": "FINANCIAL OUTFLOW: Dividend",
  "PÉNZÜGYI KIADÁSOK: Tagi kölcsön kifizetés": "FINANCIAL OUTFLOW: Member loan out",
  "PÉNZÜGYI KIADÁSOK: Egyéb pü. kiadások": "FINANCIAL OUTFLOW: Other finance",
};

const TITLE_EN: Record<string, string> = {
  "Beszerzés: Továbbértékesítésre (nyitott)": "Purchase: for resale (open)",
  "Beszerzés: Továbbértékesítésre": "Purchase: for resale",
  "Céltartalék-puffer félretétel": "Reserve-buffer set-aside",
  "Eszközalap félretétel": "Asset-fund set-aside",
  "Továbbértékesített beszerzés (nyitott)": "Purchase: for resale (open)",
  "Továbbértékesített beszerzés": "Purchase: for resale",
  "Resale purchase (open)": "Purchase: for resale (open)",
  "Resale purchase": "Purchase: for resale",
  "Runway puffer félretétel": "Reserve-buffer set-aside",
  "CAPEX alap félretétel": "Asset-fund set-aside",
};

const BUCKET_EN: Record<string, string> = {
  "Céltartalék-puffer": "Reserve buffer",
  Eszközalap: "Asset fund",
  "Runway puffer": "Reserve buffer",
  "Eszköz / CAPEX alap": "Asset fund",
};

export function categoryLabelForLocale(id: string, huLabel: string, locale?: Locale): string {
  const loc = locale ?? readClientLocale();
  if (loc !== "en") return huLabel;
  return CATEGORY_LABEL_EN[id] ?? huLabel;
}

export function txnTitleForLocale(huTitle: string, locale?: Locale): string {
  const loc = locale ?? readClientLocale();
  if (loc !== "en") return huTitle;
  return TITLE_EN[huTitle] ?? huTitle;
}

export function bucketNameForLocale(huName: string, locale?: Locale): string {
  const loc = locale ?? readClientLocale();
  if (loc !== "en") return huName;
  return BUCKET_EN[huName] ?? huName;
}
