import { describe, expect, it } from "vitest";

import {
  applyAttributionSearchParams,
  campaignIdFromPath,
  campaignIdFromUtmCampaign,
  CAMPAIGN_SEGMENT_IDS,
  defaultUtmForCampaign,
  filterByCampaign,
} from "./campaignFunnels";

describe("campaignFunnels", () => {
  it("parses dedicated entry paths", () => {
    expect(campaignIdFromPath("/bcp")).toBe("bcp");
    expect(campaignIdFromPath("/oktatas/")).toBe("oktatas");
    expect(campaignIdFromPath("/strategia?utm_source=meta")).toBe("strategia");
    expect(campaignIdFromPath("/f/oktatas-szimulacio")).toBeNull();
  });

  it("parses utm_campaign aliases", () => {
    expect(campaignIdFromUtmCampaign("bcp")).toBe("bcp");
    expect(campaignIdFromUtmCampaign("kampany-makro")).toBe("makro");
    expect(campaignIdFromUtmCampaign("what-if")).toBe("strategia");
    expect(campaignIdFromUtmCampaign("off-grid")).toBe("kozosseg");
    expect(campaignIdFromUtmCampaign("unknown")).toBeNull();
  });

  it("filters cases to the campaign segment", () => {
    const rows = [
      { id: "demo11_resilience_saas_outage" },
      { id: "demo12_resilience_community_grid" },
      { id: "demo13_resilience_home_blackout" },
      { id: "demo14_resilience_demography" },
    ];
    expect(filterByCampaign(rows, "bcp").map((r) => r.id)).toEqual(["demo11_resilience_saas_outage"]);
    expect(filterByCampaign(rows, "kozosseg")).toHaveLength(2);
    expect(filterByCampaign(rows, "makro").map((r) => r.id)).toEqual(["demo14_resilience_demography"]);
    expect(filterByCampaign(rows, "strategia")).toEqual(rows);
    expect(CAMPAIGN_SEGMENT_IDS.oktatas).toHaveLength(4);
    expect(CAMPAIGN_SEGMENT_IDS.strategia).toHaveLength(4);
  });

  it("attaches campaign UTM to checkout URL", () => {
    const url = new URL("https://bill.szcenario.hu/");
    url.searchParams.set("tier", "pro");
    applyAttributionSearchParams(
      url,
      { id: "bcp", utm: defaultUtmForCampaign("bcp", { source: "meta", medium: "cpc" }) },
    );
    expect(url.searchParams.get("ref")).toBe("kampany-bcp");
    expect(url.searchParams.get("utm_source")).toBe("meta");
    expect(url.searchParams.get("utm_medium")).toBe("cpc");
    expect(url.searchParams.get("utm_campaign")).toBe("bcp");
  });
});
