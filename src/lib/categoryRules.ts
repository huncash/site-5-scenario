export type AutoRuleSuggestion = {
  category?: string | null;
  partner?: string | null;
  type?: "income" | "expense" | "saving" | null;
  tags?: string[] | null;
  expense_type?: "FIX_NEED" | "VARIABLE_NEED" | "WANT" | "INVESTMENT" | null;
  muda_type?: "NONE" | "DUPLICATE_SUBSCRIPTION" | "FEES" | "IMPULSE_SPEND" | "WASTE" | null;
  is_recurring?: boolean | null;
  matchedRuleId?: string | null;
};

export type CategoryRuleLike = {
  id: string;
  workspace_id: string;
  keyword: string; // legacy pattern field
  match_field?: "partner" | "description" | "accountRef" | "any" | null;
  operator?: "contains" | "equals" | "startsWith" | null;
  pattern?: string | null;
  target_category: string;
  target_partner?: string | null;
  target_type?: "income" | "expense" | "saving" | null;
  target_tags?: string[] | null;
  target_expense_type?: "FIX_NEED" | "VARIABLE_NEED" | "WANT" | "INVESTMENT" | null;
  target_muda_type?: "NONE" | "DUPLICATE_SUBSCRIPTION" | "FEES" | "IMPULSE_SPEND" | "WASTE" | null;
  target_is_recurring?: boolean | null;
  is_active: boolean;
};

function normalize(s: string) {
  return (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

type RuleMatchInput =
  | { workspaceId: string; text: string } // legacy: one combined haystack
  | {
      workspaceId: string;
      any: string;
      partner?: string | null;
      description?: string | null;
      accountRef?: string | null;
    };

function pickField(rule: CategoryRuleLike, input: RuleMatchInput): string {
  if ("text" in input) return input.text ?? "";
  const f = (rule.match_field ?? "any") as "partner" | "description" | "accountRef" | "any";
  if (f === "partner") return input.partner ?? "";
  if (f === "description") return input.description ?? input.any ?? "";
  if (f === "accountRef") return input.accountRef ?? "";
  return input.any ?? "";
}

function matches(rule: CategoryRuleLike, input: RuleMatchInput): boolean {
  const pat = String((rule.pattern ?? rule.keyword ?? "")).trim();
  if (!pat) return false;
  const raw = pickField(rule, input);
  const op = (rule.operator ?? "contains") as "contains" | "equals" | "startsWith";

  // Regex mode: prefix "re:" (case-insensitive via /i)
  if (pat.toLowerCase().startsWith("re:")) {
    const pattern = pat.slice(3).trim();
    try {
      return new RegExp(pattern, "i").test(raw);
    } catch {
      return false;
    }
  }

  const a = normalize(raw);
  const b = normalize(pat);
  if (op === "equals") return a === b;
  if (op === "startsWith") return a.startsWith(b);
  return a.includes(b);
}

export function suggestFromRules(rules: CategoryRuleLike[], input: RuleMatchInput): AutoRuleSuggestion | null {
  const eligible = rules
    .filter((r) => r.is_active)
    .filter((r) => r.workspace_id === input.workspaceId);

  let best: CategoryRuleLike | null = null;
  for (const r of eligible) {
    if (!matches(r, input)) continue;
    if (!best) best = r;
    else if (String(r.pattern ?? r.keyword ?? "").length > String(best.pattern ?? best.keyword ?? "").length) best = r; // prefer more specific
  }
  if (!best) return null;
  return {
    category: best.target_category || null,
    partner: best.target_partner ?? null,
    type: best.target_type ?? null,
    tags: Array.isArray(best.target_tags) ? best.target_tags : null,
    expense_type: (best.target_expense_type as any) ?? null,
    muda_type: (best.target_muda_type as any) ?? null,
    is_recurring: typeof (best as any).target_is_recurring === "boolean" ? ((best as any).target_is_recurring as boolean) : null,
    matchedRuleId: best.id,
  };
}

export function applySuggestion<
  T extends { category?: any; party?: any; title?: any; type?: any; tags?: any; expense_type?: any; muda_type?: any; is_recurring?: any }
>(
  payload: T,
  s: AutoRuleSuggestion | null,
): T {
  if (!s) return payload;
  const curTags = Array.isArray((payload as any).tags) ? ((payload as any).tags as string[]) : [];
  const sugTags = Array.isArray(s.tags) ? (s.tags as string[]) : [];
  const mergedTags = sugTags.length
    ? Array.from(new Set<string>([...curTags, ...sugTags].filter(Boolean)))
    : curTags;
  return {
    ...payload,
    category: payload.category ? payload.category : s.category ?? payload.category,
    party: payload.party ? payload.party : s.partner ?? payload.party,
    // do NOT overwrite title; partner/category are the main auto-fill targets
    ...(mergedTags.length ? ({ tags: mergedTags } as any) : {}),
    expense_type: (payload as any).expense_type ? (payload as any).expense_type : (s.expense_type ?? (payload as any).expense_type),
    muda_type: (payload as any).muda_type ? (payload as any).muda_type : (s.muda_type ?? (payload as any).muda_type),
    is_recurring:
      typeof (payload as any).is_recurring === "boolean"
        ? (payload as any).is_recurring
        : typeof s.is_recurring === "boolean"
          ? s.is_recurring
          : (payload as any).is_recurring,
  };
}

