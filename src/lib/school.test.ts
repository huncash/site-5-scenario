import { describe, expect, it } from "vitest";

import { PLANS_CONFIG, totalSlots } from "@/config/plans";
import { hu } from "@/i18n/hu";
import {
  isEduEmail,
  isSchoolHostname,
  isSchoolPath,
  isSchoolProofFile,
  SCHOOL_CASES,
  SCHOOL_HOST,
  SCHOOL_ORIGIN_PROD,
  SCHOOL_SLOTS_PER_CASE,
  SCHOOL_WATERMARK,
  schoolPublicHref,
} from "@/lib/school";
import { BASE_SCENARIO_SLOTS, slotExpansionAllowed } from "@/lib/scenarioSlots";

describe("school channel", () => {
  it("maps the school host and local path", () => {
    expect(isSchoolHostname(SCHOOL_HOST)).toBe(true);
    expect(isSchoolHostname("school.example.test")).toBe(true);
    expect(isSchoolHostname("szcenario.hu")).toBe(false);
    expect(isSchoolPath("/school")).toBe(true);
    expect(isSchoolPath("/oktatas")).toBe(false);
    expect(schoolPublicHref("szcenario.hu")).toBe(SCHOOL_ORIGIN_PROD);
    expect(schoolPublicHref("localhost")).toBe("/school");
  });

  it("caps campus at 1 Active Case and 2 Active Slot", () => {
    expect(SCHOOL_CASES).toBe(1);
    expect(SCHOOL_SLOTS_PER_CASE).toBe(2);
    expect(PLANS_CONFIG.campus.quotas).toMatchObject({
      cases: 1,
      slotsPerCase: 2,
    });
    expect(totalSlots(PLANS_CONFIG.campus)).toBe(2);
    expect(BASE_SCENARIO_SLOTS.campus).toBe(2);
    expect(slotExpansionAllowed("campus")).toBe(false);
  });

  it("uses Case/Slot capacity copy without a szcenárió prefix", () => {
    expect(hu.school.capacity).toContain("1 Aktív Case");
    expect(hu.school.capacity).toContain("2 Aktív Slot");
    expect(hu.school.capacity).not.toMatch(/szcenárió/i);
    expect(hu.school.casesLabel).toBe("Aktív Case");
    expect(hu.school.slotsLabel).toBe("Aktív Slot");
    expect(hu.school.watermark).toBe(SCHOOL_WATERMARK);
    expect(SCHOOL_WATERMARK).toBe("Oktatási Licenc – Üzleti célra nem használható");
  });

  it("accepts education e-mail or a local ID file", () => {
    expect(isEduEmail("anna@elte.hu")).toBe(true);
    expect(isEduEmail("a.b@uni-miskolc.hu")).toBe(true);
    expect(isEduEmail("x@college.edu")).toBe(true);
    expect(isEduEmail("x@gmail.com")).toBe(false);
    expect(isSchoolProofFile({ name: "diakigazolvany.pdf", size: 1200, type: "application/pdf" })).toBe(true);
    expect(isSchoolProofFile({ name: "id.jpg", size: 800, type: "image/jpeg" })).toBe(true);
    expect(isSchoolProofFile({ name: "notes.exe", size: 800, type: "application/octet-stream" })).toBe(false);
  });
});
