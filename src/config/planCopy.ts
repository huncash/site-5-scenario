/**
 * Dinamikus csomag-szövegek a PLANS_CONFIG kvótáiból / feature flagjeiből.
 * Számok soha nem hardkódoltak a UI komponensekben.
 */

import {
  getPublicPlans,
  PLANS_CONFIG,
  type BankImportMode,
  type PlanConfig,
  type ProScenarioLevel,
  type PublicPlanId,
} from "@/config/plans";
import type { Locale } from "@/i18n/locale";

export type CompareCell = string;
export type PricingCompareRow = {
  id: string;
  feature: string;
  cells: Record<PublicPlanId, CompareCell>;
};

function bankSlogan(mode: BankImportMode, locale: Locale, slotsLabel: string): string {
  if (locale === "en") {
    if (mode === "api") return "automated bank/accounting API";
    if (mode === "multi") return `multiple bank branches & statements / ${slotsLabel}`;
    return `1 bank statement / ${slotsLabel}`;
  }
  if (mode === "api") return "automata banki/könyvelési API";
  if (mode === "multi") return `több bankfiók & kivonat / ${slotsLabel}`;
  return `1 banki kivonat / ${slotsLabel}`;
}

function bankHighlight(mode: BankImportMode, locale: Locale): string {
  if (locale === "en") {
    if (mode === "api") return "Automated bank/accounting API";
    if (mode === "multi") return "Multiple bank branches & statement import / Slot**";
    return "1 Bank statement import / Slot**";
  }
  if (mode === "api") return "Automata banki/könyvelési API";
  if (mode === "multi") return "Több bankfiók & kivonat import / Slot**";
  return "1 Banki kivonat import / Slot**";
}

function bankCompare(mode: BankImportMode, locale: Locale): string {
  if (locale === "en") {
    if (mode === "api") return "✓ Automated bank/accounting API + multi-bank";
    if (mode === "multi") return "✓ Multiple bank branches & statements per Slot**";
    return "✓ 1 statement / Slot** (any period)";
  }
  if (mode === "api") return "✓ Automata banki/könyvelési API + multi-bank";
  if (mode === "multi") return "✓ Több bankfiók & kivonat Slot**-onként";
  return "✓ 1 kivonat / Slot** (bármilyen időszakra)";
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

function proCompare(level: ProScenarioLevel, locale: Locale): string {
  if (locale === "en") {
    if (level === "org_audit") return "Organisational BCP audit";
    if (level === "advanced") return "Advanced capacity and risk simulation";
    return "Basic P-R-O & BCP calculation";
  }
  if (level === "org_audit") return "Szervezeti BCP audit";
  if (level === "advanced") return "Haladó kapacitás- és kockázatszimuláció";
  return "Alapvető P-R-O & BCP számítás";
}

export function planSlogan(plan: PlanConfig, locale: Locale = "hu"): string {
  const { cases, slotsPerCase, seats, guests } = plan.quotas;
  const bank = bankSlogan(plan.features.bankImport, locale, "Slot**");
  if (plan.id === "expert") {
    return locale === "en"
      ? `${cases} Active Case* · ${slotsPerCase} Slot** / Case · ${seats} Seat + ${guests} Guest`
      : `${cases} Active Case* · ${slotsPerCase} Slot** / Case · ${seats} Seat + ${guests} Guest`;
  }
  return `${cases} Active Case* · ${slotsPerCase} Slot** / Case · ${bank}`;
}

export function planAudience(plan: PlanConfig, locale: Locale = "hu"): string {
  const { cases, slotsPerCase, seats } = plan.quotas;
  if (locale === "en") {
    if (plan.features.bankImport === "api") {
      return `${cases === 5 ? "Five" : cases} Cases*, ${slotsPerCase} Slots** / Case, ${seats} Seats — automated bank/accounting API.`;
    }
    if (plan.features.bankImport === "multi") {
      return `${cases} Active Cases*, ${slotsPerCase} Slots** each — multiple attached bank branches & statements.`;
    }
    return `One saved Case*, ${slotsPerCase} Slots** — bank statement import for any period.`;
  }
  if (plan.features.bankImport === "api") {
    return `Öt Case*, ${slotsPerCase} Slot** / Case, ${seats} Seat — automata banki/könyvelési API.`;
  }
  if (plan.features.bankImport === "multi") {
    return `Két Active Case*, Case-enként ${slotsPerCase} Slot** — több csatolt bankfiók & kivonat.`;
  }
  return `Egy elmenthető Case*, ${slotsPerCase === 2 ? "két" : slotsPerCase} Slot** — banki kivonat import bármilyen időszakra.`;
}

/** Kártya bulletök: Case → Slot → P-R-O → Seat/Guest → bank (vagy Enterprise speciális). */
export function planHighlights(plan: PlanConfig, locale: Locale = "hu"): string[] {
  const { cases, slotsPerCase, seats, guests } = plan.quotas;
  const lines = [
    `${cases} Active Case*`,
    `${slotsPerCase} Slot** / Case`,
  ];
  if (plan.id === "expert") {
    lines.push(`${seats} Seat + ${guests} Guest****`);
    lines.push(bankHighlight(plan.features.bankImport, locale));
    lines.push(
      locale === "en"
        ? "Multi-portfolio & organisational BCP audit"
        : "Multi-portfolio & szervezeti BCP audit",
    );
    return lines;
  }
  lines.push(proHighlight(plan.features.proLevel, locale));
  lines.push(`${seats} Seat + ${guests} Guest****`);
  lines.push(bankHighlight(plan.features.bankImport, locale));
  return lines;
}

export function buildPricingCompareRows(locale: Locale = "hu"): PricingCompareRow[] {
  const plans = getPublicPlans();
  const byId = Object.fromEntries(plans.map((p) => [p.id, p])) as Record<PublicPlanId, PlanConfig>;

  const L = locale === "en";
  return [
    {
      id: "lower",
      feature: L ? "Features of lower plans" : "Alsóbb csomagok funkciói",
      cells: {
        starter: "–",
        pro: "✓ Basic",
        expert: "✓ Basic + Pro",
      },
    },
    {
      id: "cases",
      feature: "Active Case*",
      cells: {
        starter: String(byId.starter.quotas.cases),
        pro: String(byId.pro.quotas.cases),
        expert: String(byId.expert.quotas.cases),
      },
    },
    {
      id: "slots",
      feature: "Slot** / Case",
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
        starter: proCompare(byId.starter.features.proLevel, locale),
        pro: proCompare(byId.pro.features.proLevel, locale),
        expert: proCompare(byId.expert.features.proLevel, locale),
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
      id: "bank",
      feature: L ? "Bank statement import" : "Banki kivonat import",
      cells: {
        starter: bankCompare(byId.starter.features.bankImport, locale),
        pro: bankCompare(byId.pro.features.bankImport, locale),
        expert: bankCompare(byId.expert.features.bankImport, locale),
      },
    },
    {
      id: "sovereignty",
      feature: L ? "Data sovereignty & safety" : "Adatszuverenitás & Biztonság",
      cells: {
        starter: L ? "Encrypted local backup" : "Titkosított lokális mentés",
        pro: "✓",
        expert: byId.expert.features.optionalSync
          ? L
            ? "✓ + optional sync"
            : "✓ + opcionális szinkron"
          : "✓",
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
            : "✓ Multi-portfolio & szervezeti BCP audit"
          : "–",
      },
    },
  ];
}

/** Funnel / legacy TierCopy limits & tagline. */
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

/** Kapacitás tipp tudásbázishoz — számok a configból. */
export function capacityTipHu(): string {
  const s = PLANS_CONFIG.starter.quotas;
  const p = PLANS_CONFIG.pro.quotas;
  const e = PLANS_CONFIG.expert.quotas;
  return `Egy Case-en belül a csomagodtól függően több Slot is futhat egyidejűleg (Basic: ${s.slotsPerCase}, Pro: ${p.slotsPerCase}, Enterprise: ${e.slotsPerCase} Case-enként).`;
}

export function seatGuestCapacityTipHu(): string {
  const s = PLANS_CONFIG.starter.quotas;
  const p = PLANS_CONFIG.pro.quotas;
  const e = PLANS_CONFIG.expert.quotas;
  return `Basic: ${s.seats} Seat + ${s.guests} Guest · Pro: ${p.seats} Seat + ${p.guests} Guest · Enterprise: ${e.seats} Seat + ${e.guests} Guest.`;
}
