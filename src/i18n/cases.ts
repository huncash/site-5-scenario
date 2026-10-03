import { readClientLocale, type Locale } from "@/i18n/locale";
import { PUBLIC_DEMO_SEGMENTS } from "@/lib/demoCatalog";

export type CaseCopy = { title: string; blurb: string; lead: string };

const HU: Record<string, CaseCopy> = Object.fromEntries(
  PUBLIC_DEMO_SEGMENTS.map((s) => [s.id, { title: s.title, blurb: s.blurb, lead: s.lead }]),
);

const EN: Record<string, CaseCopy> = {
  demo1_multisite_operator: {
    title: "Several hospitality sites in one hand",
    blurb: "Three to eight units, shared purchasing. Do you centralize cost, or leave it per site?",
    lead: "Several restaurants or cafés sit in one hand. Traffic is there; purchasing and compliance are scattered. Is one cost pool cheaper than leaving each site alone?",
  },
  demo2_premium_nightlife: {
    title: "Night bar, high guest spend",
    blurb: "Fewer guests, high evening ticket, expensive run. Does the weekend carry the weak months?",
    lead: "Few come, but they spend. The weekend carries the week. Staff and security still get paid on quiet weekdays; expensive stock sits, cash does not turn. Does high guest spend carry the weak months?",
  },
  demo3_specialty_cafe_tea: {
    title: "Daytime café, shifting demand",
    blurb: "Steady daytime traffic; more dairy-, sugar- and gluten-free asks. Trend, or noise?",
    lead: "Daytime traffic is even, but guests more often ask for dairy-, sugar- or gluten-free drinks and food. Lasting shift in the order mix, or a passing wave?",
  },
  demo4_fine_dining_bistro: {
    title: "Restaurant: quality and cost",
    blurb: "Higher price point, tight kitchen routine. Where does cover slip?",
    lead: "Quality needs expensive input and tight kitchen order. Does the ticket cover that cost, or does profit die on one line?",
  },
  demo5_pastry_gelato: {
    title: "Pastry shop: season and cold chain",
    blurb: "Pastry and gelato; winter is quiet. What does the dead season take?",
    lead: "Summer runs, winter drops, cooling runs all year. How much of the summer surplus do the quiet months take?",
  },
  demo6_event_catering_popup: {
    title: "Event hospitality",
    blurb: "Catering and pop-up sites, wavy revenue. Does one event carry the month?",
    lead: "Revenue waves. Logistics and staff spike for a night. Does one larger booking carry the month, or leave a hole after?",
  },
  demo18_personal_pocket_seasonal_pilot: {
    title: "Hospitality started from a private pocket",
    blurb: "Personal income plus a little extra, member loan. Growth example, not an offer.",
    lead: "Someone starts a small hospitality site from their own pay and lends the firm a member loan. The private frame and the company pull each other. Example, not an offer.",
  },
  demo11_strategy_kahn_fork: {
    title: "Kahn futures research & strategic fork",
    blurb: "A plant would expand. Loan or own reserve; cheap+penalty or dear+flexible. Worse outcome first.",
    lead:
      "A plant plans a new line or shift. Take a loan, or fund from your own reserve? The cheaper loan can be dear to exit — look at the worse outcome first.",
  },
  demo12_resilience_saas_outage: {
    title: "BCP: critical SaaS / cloud outage",
    blurb: "Operational resilience: spare network, local-first copy, manual P2P. TTR is the risk gauge.",
    lead: "The cloud is down — a black swan, not the end of the world. Spare link, local offline store, or hand P2P. How long is recovery, and does operations hold?",
  },
  demo13_resilience_community_grid: {
    title: "Local supply and community safety",
    blurb: "Decentral self-hold: water, energy, LoRa mesh. From a limit to a 72-hour regional outage.",
    lead: "Water and power stutter in the settlement. Tanker cadence and local mesh cover show how long the community holds. Local self-hold and community safety.",
  },
  demo14_resilience_home_blackout: {
    title: "Household operating reserve — 72-hour outage",
    blurb: "Battery Wh, solar, stock in days. Same engine as firm BCP — smaller scale.",
    lead: "The grid is out for seventy-two hours. Not a bunker: operating reserve. Battery, solar, rational stock — the engine counts the same physical limits as firm BCP.",
  },
  demo15_resilience_demography: {
    title: "Strategic foresight — TFR and working age",
    blurb: "KR, CN, IT/WE, JP, HU: TFR, gap to 2.1, treatment path. Structural trend, not an alarm.",
    lead: "Births sit under replacement. This is one of the next 20 years’ largest economic stresses — for government and large firms alike. You compare five nations’ TFR. A matrix, not an alarm.",
  },
  demo16_edu_startup_cashflow: {
    title: "Startup financial planning and cash-flow",
    blurb: "Fixed capital, marketing / build / wage. Lagged market, PRO band, Poka-Yoke reserve.",
    lead: "A virtual start-up with fixed capital. You split the frame. The engine simulates the market from past spread — the decision hits late.",
  },
  demo17_edu_ops_process: {
    title: "Running-process waste cut and capacity lift",
    blurb: "Existing line / shop: muda audit, OEE and lead time. Low-CapEx Quick Wins → immediate cash-flow and margin.",
    lead:
      "A running teaching shop / small line. The ops audit cuts waiting, scrap and changeover; SMED and Poka-Yoke points lift lead time and capacity — downtime hour-rate is in cash too.",
  },
  demo7_industry_hospital_blackout: {
    title: "Hospital emergency capacity and energy",
    blurb: "Grid outage. UPS, diesel, ICU / OR / incubator. Lean triage on scarce kW.",
    lead: "The outer grid is down. Vital wards share reserve power. You split the kW — the engine counts patient survival and fuel runway.",
  },
  demo8_industry_supply_shock: {
    title: "Supply chain shock — part / input",
    blurb: "A unique component chain breaks. Substitute + SMED, or the line stops. OEE hole.",
    lead: "The special part does not arrive. Alternate tech or substitute material. How long is changeover, and how far does OEE fall?",
  },
  demo9_industry_poka_recall: {
    title: "Quality emergency",
    blurb: "Hidden series fault, recall. Lot isolation, root cause, poka built into the process.",
    lead: "A hidden fault runs on the finished-goods line. You isolate the lot, open the root cause, or push on. The engine counts scrap and recall cost.",
  },
  demo10_industry_wms_outage: {
    title: "Regional DC — IT outage",
    blurb: "WMS dark. Paper and barcode pick. Lead time and jam.",
    lead: "Warehouse control is unreachable. Manual paper- and barcode BCP. How much does lead time grow, and where does the dock jam?",
  },
};

function pack(locale: Locale): Record<string, CaseCopy> {
  return locale === "en" ? EN : HU;
}

export function caseCopy(id: string | null | undefined, locale: Locale = readClientLocale()): CaseCopy | null {
  if (!id) return null;
  return pack(locale)[id] ?? HU[id] ?? null;
}

export function caseTitle(id: string | null | undefined, locale: Locale = readClientLocale()): string | null {
  return caseCopy(id, locale)?.title ?? null;
}

export function caseBlurb(id: string | null | undefined, locale: Locale = readClientLocale()): string | null {
  return caseCopy(id, locale)?.blurb ?? null;
}

export function caseLead(id: string | null | undefined, locale: Locale = readClientLocale()): string | null {
  return caseCopy(id, locale)?.lead ?? null;
}

export function caseCopyIds(): string[] {
  return Object.keys(HU);
}
