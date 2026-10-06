import { describe, expect, it } from "vitest";

import { ENGINE_VERSION, PLANS_CONFIG, totalSlots } from "@/config/plans";
import { guestCodeSlotsForTier } from "@/lib/auth/guestSlots";
import { evaluateLicenseGate, hasPermission, planQuotaLimit, type PlanPermission } from "@/lib/planPermissions";
import { isDemoProfileName } from "@/lib/demoSession";
import { VERSION_WRITE_DENIED } from "@/lib/versionPolicy";
import { hasWorkspaceAccess, licenseInstallmentArrears, type LicenseEntitlement } from "@/lib/license";
import {
  BASE_SCENARIO_SLOTS,
  checkScenarioSlotCapacity,
  emptySlotLedger,
  normalizeTierId,
} from "@/lib/scenarioSlots";
import { buildSzamlazzXml } from "../../bill/server/szamlazz.ts";
import type { Order } from "../../bill/server/store.ts";

function lic(
  partial: Partial<LicenseEntitlement> & Pick<LicenseEntitlement, "tier" | "status">,
): LicenseEntitlement {
  return {
    token: "tok",
    interval: "yearly",
    verifiedAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
    updatesUntil: new Date(Date.now() + 365 * 86400000).toISOString(),
    licenseExpiryDate: null,
    ...partial,
  };
}

const PRO_ONLY: PlanPermission[] = [
  "WATCHED_FOLDER",
  "CUSTOM_RULES",
  "BUSINESS_WORKSPACES",
  "PROJECTS",
  "ADVANCED_SCENARIO",
];

describe("E2E 1 — díjbekérő e-mail + licenc élesítés logika", () => {
  it("e-mailes vevőnél a Számlázz XML sendEmail=true", () => {
    const order = {
      id: "ord-e2e",
      createdAt: "2026-10-07T00:00:00.000Z",
      status: "awaiting_transfer",
      tier: "starter",
      interval: "yearly",
      amountHuf: 252_730,
      netHuf: 199_000,
      vatRate: 27,
      vatCode: "27",
      payMethod: "hu_transfer",
      transferCode: "SZC-E2E1",
      buyer: {
        name: "E2e Teszt",
        lastName: "Teszt",
        firstName: "E2e",
        address: "Példa utca 1",
        zip: "1051",
        city: "Budapest",
        taxId: "",
        email: "e2e-bill@example.invalid",
        partnerKind: "b2c",
      },
      lines: [{ name: "Basic", quantity: 1, unit: "db", netUnitPrice: 199_000, vat: 27 }],
    } satisfies Order;
    const xml = buildSzamlazzXml(order, "dijbekero");
    expect(xml).toContain("<sendEmail>true</sendEmail>");
    expect(xml).toContain("<email>e2e-bill@example.invalid</email>");
    expect(xml).toContain("<dijbekero>true</dijbekero>");
  });

  it("licenc API / gate: awaiting_transfer már runtime, pending nem", () => {
    const awaiting = lic({ tier: "starter", status: "awaiting_transfer" });
    const paid = lic({ tier: "starter", status: "paid" });
    expect(evaluateLicenseGate(awaiting).runtimeOk).toBe(true);
    expect(evaluateLicenseGate(paid).runtimeOk).toBe(true);
    expect(evaluateLicenseGate(null).runtimeOk).toBe(false);
    expect(evaluateLicenseGate(lic({ tier: "starter", status: "local" })).runtimeOk).toBe(true);
  });

  it("2. részlet hátralék nem zárja a runtime-ot", () => {
    const unpaid = lic({
      tier: "starter",
      status: "paid",
      installmentPlan: true,
      installment2Paid: false,
      year1StartedAt: new Date(Date.now() - 70 * 86400000).toISOString(),
    });
    expect(licenseInstallmentArrears(unpaid)).toBe(true);
    expect(evaluateLicenseGate(unpaid).runtimeOk).toBe(true);
  });
});

describe("E2E 2 — Basic vs Pro / Enterprise modulzárak", () => {
  it("Basic (örökös + 1. év): alap írható, Pro modulok zárva", () => {
    const starter = lic({ tier: "starter", status: "paid" });
    expect(hasPermission("starter", "SEAT", "EDIT_MODELS", starter)).toBe(true);
    expect(hasPermission("starter", "SEAT", "EXPORT_RAW", starter)).toBe(true);
    expect(hasPermission("starter", "SEAT", "BANK_API", starter)).toBe(false);
    for (const p of PRO_ONLY) {
      expect(hasPermission("starter", "SEAT", p, starter)).toBe(false);
    }
    expect(PLANS_CONFIG.starter.quotas).toMatchObject({ cases: 1, slotsPerCase: 3 });
    expect(totalSlots(PLANS_CONFIG.starter)).toBe(3);
    expect(BASE_SCENARIO_SLOTS.starter).toBe(3);
    expect(checkScenarioSlotCapacity(3, emptySlotLedger("starter")).ok).toBe(false);
    expect(checkScenarioSlotCapacity(2, emptySlotLedger("starter")).ok).toBe(true);
  });

  it("Pro feloldja a Pro modulokat, Enterprise a BANK_API-t", () => {
    const pro = lic({ tier: "pro", status: "paid" });
    const expert = lic({ tier: "expert", status: "paid" });
    for (const p of PRO_ONLY) {
      expect(hasPermission("pro", "SEAT", p, pro)).toBe(true);
      expect(hasPermission("expert", "SEAT", p, expert)).toBe(true);
    }
    expect(hasPermission("pro", "SEAT", "BANK_API", pro)).toBe(false);
    expect(hasPermission("expert", "SEAT", "BANK_API", expert)).toBe(true);
    expect(hasPermission("pro", "SEAT", "MULTI_PORTFOLIO", pro)).toBe(false);
    expect(hasPermission("expert", "SEAT", "MULTI_PORTFOLIO", expert)).toBe(true);
    expect(guestCodeSlotsForTier("starter")).toBe(1);
    expect(guestCodeSlotsForTier("pro")).toBe(5);
    expect(guestCodeSlotsForTier("expert")).toBe(20);
  });

  it("vendég (GUEST) semmit sem ír", () => {
    const pro = lic({ tier: "pro", status: "paid" });
    expect(hasPermission("pro", "GUEST", "EDIT_MODELS", pro)).toBe(false);
    expect(hasPermission("pro", "GUEST", "EXPORT_RAW", pro)).toBe(false);
  });
});

describe("E2E 3 — demo / ingyenes használat védelme", () => {
  it("demo profilnév + showcase írás tiltva", () => {
    expect(isDemoProfileName("DEMO Vendéglátás")).toBe(true);
    expect(isDemoProfileName("Saját cégem")).toBe(false);
    expect(VERSION_WRITE_DENIED).toMatch(/nem engedélyezett/);
  });

  it("demo plan: nincs nyers export, vendég, felhő; kvóta 1×3", () => {
    expect(hasPermission("demo", "DEMO", "EXPORT_RAW")).toBe(false);
    expect(hasPermission("demo", "DEMO", "MANAGE_GUESTS")).toBe(false);
    expect(hasPermission("demo", "DEMO", "SAVE_TO_CLOUD")).toBe(false);
    expect(hasPermission("demo", "DEMO", "RESET_DEMO")).toBe(true);
    expect(PLANS_CONFIG.demo.quotas).toMatchObject({ cases: 1, slotsPerCase: 3, guests: 0 });
    expect(planQuotaLimit("demo", "guests")).toBe(0);
  });

  it("nincs licenc → runtime zárva; hamis pending nem kap kaput", () => {
    expect(evaluateLicenseGate(null).reason).toBe("no_license");
    expect(hasPermission("pro", "SEAT", "EDIT_MODELS", null)).toBe(false);
  });

  it("demo / ismeretlen tier nem válik local unlimiteddé", () => {
    expect(normalizeTierId("starter")).toBe("starter");
    expect(normalizeTierId("pro")).toBe("pro");
    expect(normalizeTierId("demo")).toBe("demo");
    expect(normalizeTierId("DEMO")).toBe("demo");
    expect(normalizeTierId("trial_expired")).toBe("demo");
    expect(normalizeTierId("enterprise")).toBe("demo");
    expect(normalizeTierId("hacked")).toBe("demo");
    expect(normalizeTierId("")).toBe("demo");
    expect(normalizeTierId("local")).toBe("local");
    expect(BASE_SCENARIO_SLOTS.demo).toBe(totalSlots(PLANS_CONFIG.demo));
    expect(BASE_SCENARIO_SLOTS.demo).toBeLessThan(BASE_SCENARIO_SLOTS.local);
    expect(checkScenarioSlotCapacity(3, emptySlotLedger("demo")).ok).toBe(false);
  });
});

describe("E2E 4 — local-first hozzáférés a frissített jogosultsággal", () => {
  it("hasWorkspaceAccess: paid / invoiced / awaiting_transfer / local", () => {
    const prev = globalThis.localStorage;
    const map = new Map<string, string>();
    const storage = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => {
        map.set(k, v);
      },
      removeItem: (k: string) => {
        map.delete(k);
      },
    } as Storage;
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
    try {
      expect(hasWorkspaceAccess()).toBe(false);
      map.set(
        "szcenario_license_v1",
        JSON.stringify(lic({ tier: "starter", status: "awaiting_transfer", token: "SZC-E2E" })),
      );
      expect(hasWorkspaceAccess()).toBe(true);
      map.set(
        "szcenario_license_v1",
        JSON.stringify(lic({ tier: "starter", status: "paid", token: "SZC-E2E" })),
      );
      expect(hasWorkspaceAccess()).toBe(true);
    } finally {
      Object.defineProperty(globalThis, "localStorage", { value: prev, configurable: true });
    }
  });
});
