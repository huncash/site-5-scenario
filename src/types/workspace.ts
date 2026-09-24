export type VehicleResourceType = "company_fleet" | "private_business";

export type VehicleResource = {
  id: string;
  name: string;
  plateNumber: string;
  type: VehicleResourceType;
  reimbursementRate: number; // Ft/km (magánautónál adómentes keret)
};

export type HumanResourceType = "subcontractor_ev" | "efo_casual";

export type HumanResource = {
  id: string;
  name: string;
  role: string;
  type: HumanResourceType;
  defaultRate: number; // fix projektdíj vagy napidíj
  fixedCost?: number | null; // havi / fix költség (HUF)
};

export type WorkspacePartnerKind = "customer" | "supplier" | "authority";

export type WorkspacePartner = {
  id: string;
  kind: WorkspacePartnerKind;
  name: string;
  tax_id?: string | null;
  payment_term_days?: number | null;
  note?: string | null;
};

export type WorkspaceSavingBucket = {
  id: string;
  name: string;
  target_amount?: number | null;
  priority?: number | null; // 1 = legmagasabb
};

export type WorkspaceDuty = {
  id: string;
  name: string;
  cadence?: string | null;
  fixed_cost_huf?: number | null;
};

export type RealEstatePropertyType = "primary_residence" | "secondary_property" | "land_plot" | "rental";

export type RealEstateProperty = {
  id: string;
  name: string; // pl. "Elsődleges lakóingatlan"
  type: RealEstatePropertyType;
  address: string;
  estimatedValue: number; // becsült vagyoni érték
  isIncomeGenerating: boolean;
};

