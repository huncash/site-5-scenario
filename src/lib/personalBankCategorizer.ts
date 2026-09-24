import type { CategoryRuleLike } from "@/lib/categoryRules";
import { suggestFromRules } from "@/lib/categoryRules";

export type PersonalBankIngestRow = {
  accountRef?: string | null;
  amountSigned: number;
  bookingText: string;
  message: string;
  partner: string;
  partnerAccount: string;
};

export type PersonalBankCategorization = {
  category: string;
  tags: string[];
  payment_method: "transfer" | "cash" | null;
  matchedRuleId?: string | null;
  expense_type?: "FIX_NEED" | "VARIABLE_NEED" | "WANT" | "INVESTMENT";
  muda_type?: "NONE" | "DUPLICATE_SUBSCRIPTION" | "FEES" | "IMPULSE_SPEND" | "WASTE";
  is_recurring?: boolean;
};

function norm(s: string) {
  return (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function haystack(r: PersonalBankIngestRow) {
  return norm(
    [
      r.bookingText,
      r.message,
      r.partner,
      r.partnerAccount,
      r.accountRef ?? "",
      String(r.amountSigned),
    ].join(" "),
  );
}

function includesAny(h: string, needles: string[]) {
  return needles.some((n) => h.includes(n));
}

function tag(out: Set<string>, ...t: string[]) {
  for (const x of t) if (x) out.add(x);
}

export function categorizePersonalBankRow(input: {
  row: PersonalBankIngestRow;
  workspaceId: string;
  rules: CategoryRuleLike[];
}): PersonalBankCategorization {
  const { row, workspaceId, rules } = input;
  const h = haystack(row);
  const tags = new Set<string>();

  // 1) User rules (highest priority)
  const s = suggestFromRules(rules, {
    workspaceId,
    any: h,
    partner: row.partner ?? "",
    description: [row.bookingText ?? "", row.message ?? ""].filter(Boolean).join(" "),
    accountRef: row.accountRef ?? "",
  });
  if (s?.category) {
    if (s.type) tag(tags, s.type);
    if (Array.isArray(s.tags)) tag(tags, ...s.tags);
    return {
      category: s.category,
      tags: Array.from(tags),
      payment_method: h.includes("átutal") || h.includes("atutal") ? "transfer" : null,
      matchedRuleId: s.matchedRuleId ?? null,
      expense_type: (s.expense_type as any) ?? undefined,
      muda_type: (s.muda_type as any) ?? undefined,
      is_recurring: typeof (s as any).is_recurring === "boolean" ? ((s as any).is_recurring as boolean) : undefined,
    };
  }

  // 2) Built-in heuristics (personal)
  const isIncome = row.amountSigned > 0;

  // Payment channel
  const pm: "transfer" | "cash" | null =
    h.includes("átutal") || h.includes("atutal") || h.includes("utalás") || h.includes("utalas")
      ? "transfer"
      : includesAny(h, ["atm", "készpénz", "keszpenz", "kp "])
        ? "cash"
        : null;

  // Card transactions
  if (includesAny(h, ["kártyafoglalás", "kartyafoglalas", "kártyás", "kartyas", "kártya", "kartya"])) {
    tag(tags, "card");
  }

  // Loans / repayments
  if (includesAny(h, ["törleszt", "torleszt", "törlesztő", "torleszto"])) {
    tag(tags, "loan");
    return {
      category: isIncome ? "other-income" : "loan_repayment",
      tags: Array.from(tags),
      payment_method: pm,
      matchedRuleId: null,
    };
  }
  if (includesAny(h, ["hitel", "kölcsön", "kolcson", "kamat"])) {
    tag(tags, "loan");
    if (includesAny(h, ["kamat"])) tag(tags, "interest");
    return {
      category: isIncome ? "other-income" : "loan_repayment",
      tags: Array.from(tags),
      payment_method: pm,
      matchedRuleId: null,
    };
  }

  // Utilities / subscriptions
  if (
    includesAny(h, [
      "mvm",
      "e.on",
      "eon",
      "főgáz",
      "fogaz",
      "főtáv",
      "fotav",
      "vodafone",
      "telekom",
      "yettel",
      "digi",
      "internet",
      "áram",
      "aram",
      "gáz",
      "gaz",
      "víz",
      "viz",
      "csatorna",
      "rezsi",
    ])
  ) {
    tag(tags, "utilities");
    return { category: isIncome ? "other-income" : "utilities", tags: Array.from(tags), payment_method: pm, matchedRuleId: null };
  }

  // Groceries / everyday food
  if (includesAny(h, ["lidl", "aldi", "spar", "tesco", "auchan", "penny", "cba", "príma", "prima"])) {
    tag(tags, "grocery");
    return { category: isIncome ? "other-income" : "food", tags: Array.from(tags), payment_method: pm, matchedRuleId: null };
  }

  // Fuel / transport
  if (includesAny(h, ["mol", "omv", "shell", "lukoil", "benzin", "üzemanyag", "uzemanyag", "tankol"])) {
    tag(tags, "fuel");
    return { category: isIncome ? "other-income" : "transport", tags: Array.from(tags), payment_method: pm, matchedRuleId: null };
  }
  if (includesAny(h, ["bkk", "máv", "mav", "volán", "volan", "uber", "bolt", "parkol"])) {
    tag(tags, "transport");
    return { category: isIncome ? "other-income" : "transport", tags: Array.from(tags), payment_method: pm, matchedRuleId: null };
  }

  // Health
  if (includesAny(h, ["patika", "gyógysz", "gyogysz", "orvos", "klinika", "magánrendel", "maganrendel"])) {
    tag(tags, "health");
    return { category: isIncome ? "other-income" : "health", tags: Array.from(tags), payment_method: pm, matchedRuleId: null };
  }

  // Entertainment / streaming
  if (includesAny(h, ["netflix", "spotify", "hbo", "disney", "youtube", "steam", "playstation", "xbox"])) {
    tag(tags, "subscription");
    return {
      category: isIncome ? "other-income" : "entertainment",
      tags: Array.from(tags),
      payment_method: pm,
      matchedRuleId: null,
    };
  }

  // Shopping
  if (includesAny(h, ["kauf", "ikea", "dm", "rossmann", "decathlon", "pepco", "h&m", "hm", "zara"])) {
    tag(tags, "shopping");
    return { category: isIncome ? "other-income" : "shopping", tags: Array.from(tags), payment_method: pm, matchedRuleId: null };
  }

  // Default
  if (isIncome) {
    return { category: "other-income", tags: Array.from(tags), payment_method: pm, matchedRuleId: null };
  }
  return { category: "uncategorized", tags: Array.from(tags), payment_method: pm, matchedRuleId: null };
}

