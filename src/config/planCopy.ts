/**
 * Dinamikus csomag-szövegek a PLANS_CONFIG-ból (perpetual modell).
 */

import {
  formatQuota,
  getPublicPlans,
  PLANS_CONFIG,
  type BankImportMode,
  type PlanConfig,
  type ProScenarioLevel,
  type PublicPlanId,
  type QuotaCount,
} from "@/config/plans";
import type { Locale } from "@/i18n/locale";

export type CompareCell = string;
export type PricingCompareRow = {
  id: string;
  feature: string;
  cells: Record<PublicPlanId, CompareCell>;
};

function casesLabel(cases: QuotaCount, locale: Locale): string {
  if (cases === "unlimited") {
    return locale === "en" ? "Unlimited Active Case*" : "Korlátlan Aktív Case*";
  }
  return locale === "en" ? `${cases} Active Case*` : `${cases} Aktív Case*`;
}

function slotsLabel(slotsPerCase: number, locale: Locale): string {
  return locale === "en"
    ? `${slotsPerCase} Active Slot**/Case`
    : `${slotsPerCase} Aktív Slot**/Case`;
}

function bankHighlight(mode: BankImportMode, locale: Locale): string {
  if (locale === "en") {
    if (mode === "api") return "Automated bank / accounting API integration";
    if (mode === "multi") return "Multiple bank branches & statement import / Slot**";
    return "Bank statement import for any period / Slot**";
  }
  if (mode === "api") return "Automatizált banki / könyvelési API integráció";
  if (mode === "multi") return "Több bankfiók & kivonat import / Slot**";
  return "Tetszőleges időszaki bankkivonat import / Slot**";
}

function bankCompare(mode: BankImportMode, locale: Locale): string {
  if (locale === "en") {
    if (mode === "api") return "✓ Automated bank / accounting API";
    if (mode === "multi") return "✓ Multiple bank branches & statements per Slot**";
    return "✓ Statement import / Slot** (any period)";
  }
  if (mode === "api") return "✓ Automatizált banki / könyvelési API";
  if (mode === "multi") return "✓ Több bankfiók & kivonat Slot**-onként";
  return "✓ Kivonat import / Slot** (bármilyen időszakra)";
}

function proHighlight(level: ProScenarioLevel, locale: Locale): string {
  if (locale === "en") {
    if (level === "org_audit") return "Organisational BCP audit";
    if (level === "advanced") return "Advanced capacity and risk simulation";
    return "Basic P-R-O Scenario*** & BCP";
  }
  if (level === "org_audit") return "Szervezeti BCP audit";
  if (level === "advanced") return "Haladó kapacitás- és kockázatszimuláció";
  return "Alapvető P-R-O Szcenárió*** & BCP";
}

export function loyaltyLadderLine(plan: PlanConfig, locale: Locale = "hu"): string | null {
  const L = plan.loyaltyLadder;
  if (!L) return null;
  if (locale === "en") {
    return `Y2: €${L.year2.eur} (−25%) · Y3: €${L.year3.eur} (−40%) · Y4+: Lifetime Free Upgrades`;
  }
  return `2. év: ${L.year2.huf.toLocaleString("hu-HU")} Ft (−25%) · 3. év: ${L.year3.huf.toLocaleString("hu-HU")} Ft (−40%) · 4. évtől: örökélet frissítés`;
}

export function planSlogan(plan: PlanConfig, locale: Locale = "hu"): string {
  const { cases, slotsPerCase, seats, guests } = plan.quotas;
  const casePart =
    cases === "unlimited"
      ? locale === "en"
        ? "Unlimited Active Case*"
        : "Korlátlan Aktív Case*"
      : locale === "en"
        ? `${cases} Active Case*`
        : `${cases} Aktív Case*`;
  const slotPart =
    locale === "en" ? `${slotsPerCase} Active Slot**/Case` : `${slotsPerCase} Aktív Slot**/Case`;
  return `${casePart} · ${slotPart} · ${seats} Seat + ${guests} Guest****`;
}

export function planAudience(plan: PlanConfig, locale: Locale = "hu"): string {
  if (plan.id === "expert") {
    return locale === "en"
      ? "Automated bank/accounting API integration, multi-portfolio and organisational BCP audit."
      : "Automatikus banki/könyvelési API integráció, multi-portfólió és szervezeti BCP audit.";
  }
  if (plan.id === "pro") {
    return locale === "en"
      ? "Advanced capacity and risk simulation across multiple active projects. Need more than 2 concurrent Cases? Extra active Case module (+€49 perpetual)."
      : "Haladó kapacitás- és kockázatszimuláció több aktív projekten. 2-nél több párhuzamos Case-hez: Extra aktív Case modul (+49 000 Ft / örökös).";
  }
  return locale === "en"
    ? "1 active project, 3 active scenario slots (P-R-O base paths)."
    : "1 aktív projekt, 3 aktív szcenárió slot (P-R-O alappályák).";
}

/** Teljes highlight lista (összehasonlító tábla / legacy). */
export function planHighlights(plan: PlanConfig, locale: Locale = "hu"): string[] {
  return planCardBullets(plan, locale);
}

/**
 * Árazási kártya: max. 4–5 tiszta pont, ismétlés / hűséglétra nélkül.
 * (A 2–4. évi modell egyetlen láblécsávban él a kártyák alatt.)
 */
export function planCardBullets(plan: PlanConfig, locale: Locale = "hu"): string[] {
  const L = locale === "en";
  if (plan.id === "starter") {
    return L
      ? [
          "1 Active Case (main project)",
          "3 Active Scenario Slots / Case (Pessimistic, Realistic, Optimistic)",
          "1 editor Seat",
          "Unlimited data import & overwrite",
        ]
      : [
          "1 Aktív Case (fő projekt)",
          "3 Aktív Szcenárió Slot / Case (Pesszimista, Realista, Optimista)",
          "1 szerkesztői licenc",
          "Korlátlan adatimport és felülírás",
        ];
  }
  if (plan.id === "pro") {
    return L
      ? [
          "2 Active Cases (parallel projects)",
          "3 Active Scenario Slots / Case (expandable)",
          "1 editor + 5 guest access",
          "Advanced capacity & risk simulation",
        ]
      : [
          "2 Aktív Case (párhuzamos projektek)",
          "3 Aktív Szcenárió Slot / Case (bővíthető)",
          "1 szerkesztő + 5 vendég hozzáférés",
          "Haladó kapacitás- és kockázatszimuláció",
        ];
  }
  if (plan.id === "expert") {
    return L
      ? [
          "5 Active Cases (group level)",
          "4 Active Scenario Slots / Case",
          "3 editors + 20 guest access",
          "Bank / accounting API integrations",
        ]
      : [
          "5 Aktív Case (cégcsoport szint)",
          "4 Aktív Szcenárió Slot / Case",
          "3 szerkesztő + 20 vendég hozzáférés",
          "Banki/könyvelési API integrációk",
        ];
  }
  return [
    casesLabel(plan.quotas.cases, locale),
    slotsLabel(plan.quotas.slotsPerCase, locale),
    `${plan.quotas.seats} Seat + ${plan.quotas.guests} Guest`,
    bankHighlight(plan.features.bankImport, locale),
  ];
}

export function buildPricingCompareRows(locale: Locale = "hu"): PricingCompareRow[] {
  const plans = getPublicPlans();
  const byId = Object.fromEntries(plans.map((p) => [p.id, p])) as Record<PublicPlanId, PlanConfig>;
  const L = locale === "en";

  return [
    {
      id: "license",
      feature: L ? "License model" : "Licencmodell",
      cells: {
        starter: L ? "Gradual perpetual" : "Éves hűség-licenc",
        pro: L ? "Gradual perpetual" : "Éves hűség-licenc",
        expert: L ? "Gradual perpetual" : "Éves hűség-licenc",
      },
    },
    {
      id: "cases",
      feature: L ? "Active Case*" : "Aktív Case*",
      cells: {
        starter: formatQuota(byId.starter.quotas.cases),
        pro: formatQuota(byId.pro.quotas.cases),
        expert: formatQuota(byId.expert.quotas.cases),
      },
    },
    {
      id: "slots",
      feature: L ? "Active Slot** / Case" : "Aktív Slot** / Case",
      cells: {
        starter: String(byId.starter.quotas.slotsPerCase),
        pro: String(byId.pro.quotas.slotsPerCase),
        expert: String(byId.expert.quotas.slotsPerCase),
      },
    },
    {
      id: "pro",
      feature: L ? "P-R-O Scenario*** & BCP" : "P-R-O Szcenárió*** & BCP",
      cells: {
        starter: proHighlight(byId.starter.features.proLevel, locale),
        pro: proHighlight(byId.pro.features.proLevel, locale),
        expert: proHighlight(byId.expert.features.proLevel, locale),
      },
    },
    {
      id: "seat-guest",
      feature: "Seat + Guest****",
      cells: {
        starter: `${byId.starter.quotas.seats} Seat + ${byId.starter.quotas.guests} Guest`,
        pro: `${byId.pro.quotas.seats} Seat + ${byId.pro.quotas.guests} Guest`,
        expert: `${byId.expert.quotas.seats} Seat + ${byId.expert.quotas.guests} Guest`,
      },
    },
    {
      id: "maintenance",
      feature: L ? "Loyalty ladder (Y2 / Y3 / Y4+)" : "Hűséglétra (2. / 3. / 4. évtől)",
      cells: {
        starter: loyaltyLadderLine(byId.starter, locale) ?? "–",
        pro: loyaltyLadderLine(byId.pro, locale) ?? "–",
        expert: loyaltyLadderLine(byId.expert, locale) ?? "–",
      },
    },
    {
      id: "bank",
      feature: L ? "Bank / integration" : "Bank / integráció",
      cells: {
        starter: bankCompare(byId.starter.features.bankImport, locale),
        pro: bankCompare(byId.pro.features.bankImport, locale),
        expert: bankCompare(byId.expert.features.bankImport, locale),
      },
    },
    {
      id: "portfolio",
      feature: L ? "Portfolio / advisory use" : "Portfólió / tanácsadói használat",
      cells: {
        starter: "–",
        pro: "–",
        expert: byId.expert.features.canMultiPortfolio
          ? L
            ? "✓ Multi-portfolio & organisational BCP audit"
            : "✓ Multi-portfólió & szervezeti BCP audit"
          : "–",
      },
    },
  ];
}

export function buildStandardTierCopy(locale: Locale = "hu") {
  const rows = buildPricingCompareRows(locale);
  return {
    starter: {
      tagline: planSlogan(PLANS_CONFIG.starter, locale),
      description: planAudience(PLANS_CONFIG.starter, locale),
      includes: rows.map((r) => r.feature),
      limits: planHighlights(PLANS_CONFIG.starter, locale),
    },
    pro: {
      tagline: planSlogan(PLANS_CONFIG.pro, locale),
      description: planAudience(PLANS_CONFIG.pro, locale),
      includes: rows.map((r) => r.feature),
      limits: planHighlights(PLANS_CONFIG.pro, locale),
    },
    expert: {
      tagline: planSlogan(PLANS_CONFIG.expert, locale),
      description: planAudience(PLANS_CONFIG.expert, locale),
      includes: rows.map((r) => r.feature),
      limits: planHighlights(PLANS_CONFIG.expert, locale),
    },
  } as const;
}

export function capacityTipHu(): string {
  const s = PLANS_CONFIG.starter.quotas;
  const p = PLANS_CONFIG.pro.quotas;
  const e = PLANS_CONFIG.expert.quotas;
  return `A keret az egyidejűleg aktív Case-ekre és Slotokra vonatkozik (nem a felhalmozott adatokra). Case-enként párhuzamosan futható Aktív Slot**: Solo ${s.slotsPerCase}, Pro ${p.slotsPerCase}, Enterprise ${e.slotsPerCase} — bővíthető JIT modullal. Inaktív munkaterület törölhető / felülírható díj nélkül.`;
}

export function seatGuestCapacityTipHu(): string {
  const s = PLANS_CONFIG.starter.quotas;
  const p = PLANS_CONFIG.pro.quotas;
  const e = PLANS_CONFIG.expert.quotas;
  return `Solo: ${s.seats} Seat + ${s.guests} Guest · Pro: ${p.seats} Seat + ${p.guests} Guest · Enterprise: ${e.seats} Seat + ${e.guests} Guest.`;
}
