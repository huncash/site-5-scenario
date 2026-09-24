import { localdb, type CategoryRuleRow } from "@/lib/localdb";

export type CustomCategoryRule = {
  id: string;
  matchField: "partner" | "description" | "accountRef" | "any";
  operator: "contains" | "equals" | "startsWith";
  pattern: string;
  targetCategory: string;
  targetTags?: string[];
  targetExpenseType?: "FIX_NEED" | "VARIABLE_NEED" | "WANT" | "INVESTMENT";
  targetMudaType?: "NONE" | "DUPLICATE_SUBSCRIPTION" | "FEES" | "IMPULSE_SPEND" | "WASTE";
  targetIsRecurring?: boolean;
  workspaceId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function toCustom(r: CategoryRuleRow): CustomCategoryRule {
  const pattern = String((r.pattern ?? r.keyword ?? "")).trim();
  return {
    id: r.id,
    workspaceId: r.workspace_id,
    matchField: ((r.match_field ?? "any") as any) || "any",
    operator: ((r.operator ?? "contains") as any) || "contains",
    pattern,
    targetCategory: String(r.target_category ?? "").trim(),
    targetTags: Array.isArray(r.target_tags) ? r.target_tags.filter(Boolean) : undefined,
    targetExpenseType: (r.target_expense_type as any) ?? undefined,
    targetMudaType: (r.target_muda_type as any) ?? undefined,
    targetIsRecurring: typeof (r as any).target_is_recurring === "boolean" ? ((r as any).target_is_recurring as boolean) : undefined,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toRowInput(input: {
  id?: string;
  workspaceId: string;
  matchField: CustomCategoryRule["matchField"];
  operator: CustomCategoryRule["operator"];
  pattern: string;
  targetCategory: string;
  targetTags?: string[] | null;
  targetExpenseType?: CustomCategoryRule["targetExpenseType"] | null;
  targetMudaType?: CustomCategoryRule["targetMudaType"] | null;
  targetIsRecurring?: boolean | null;
  isActive?: boolean;
  targetPartner?: string | null;
}): Omit<CategoryRuleRow, "id" | "profile_id" | "created_at" | "updated_at"> & { id?: string } {
  const pat = String(input.pattern ?? "").trim();
  return {
    id: input.id,
    workspace_id: input.workspaceId,
    keyword: pat, // legacy field
    pattern: pat,
    match_field: input.matchField,
    operator: input.operator,
    target_category: String(input.targetCategory ?? "").trim(),
    target_partner: input.targetPartner ?? null,
    target_type: null,
    target_tags: Array.isArray(input.targetTags) && input.targetTags.length ? input.targetTags : null,
    target_expense_type: (input.targetExpenseType as any) ?? null,
    target_muda_type: (input.targetMudaType as any) ?? null,
    target_is_recurring: typeof input.targetIsRecurring === "boolean" ? input.targetIsRecurring : null,
    is_active: input.isActive ?? true,
  };
}

export function parseTargetTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 48);
}

export async function listCustomCategoryRules(workspaceId?: string | null): Promise<CustomCategoryRule[]> {
  const rows = await localdb.listCategoryRules(workspaceId ?? undefined);
  return rows.map(toCustom);
}

export async function saveCustomCategoryRule(input: {
  id?: string;
  workspaceId: string;
  matchField: CustomCategoryRule["matchField"];
  operator: CustomCategoryRule["operator"];
  pattern: string;
  targetCategory: string;
  targetTags?: string[] | null;
  targetExpenseType?: CustomCategoryRule["targetExpenseType"] | null;
  targetMudaType?: CustomCategoryRule["targetMudaType"] | null;
  targetIsRecurring?: boolean | null;
  isActive?: boolean;
  targetPartner?: string | null;
}): Promise<CustomCategoryRule> {
  const row = await localdb.putCategoryRule(toRowInput(input));
  return toCustom(row);
}

export async function deleteCustomCategoryRule(id: string): Promise<void> {
  await localdb.deleteCategoryRule(id);
}

