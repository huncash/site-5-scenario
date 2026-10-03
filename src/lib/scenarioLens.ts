import type { Locale } from "@/i18n/locale";

export type ScenarioTabLabels = {
  cashflow: string;
  items: string;
  deals: string;
  inventory: string;
};

export type ScenarioPdcaCopy = {
  PLAN: string;
  DO: string;
  CHECK: string;
  ACT: string;
};

export type ScenarioLens = {
  tabs: ScenarioTabLabels;
  pdca: ScenarioPdcaCopy;
};

const DEFAULT_TABS_HU: ScenarioTabLabels = {
  cashflow: "Cashflow",
  items: "Tételek",
  deals: "Üzletek",
  inventory: "Leltár",
};

const DEFAULT_TABS_EN: ScenarioTabLabels = {
  cashflow: "Cashflow",
  items: "Items",
  deals: "Deals",
  inventory: "Inventory",
};

const DEFAULT_PDCA_HU: ScenarioPdcaCopy = {
  PLAN: "PLAN — cél, tőke, készlet és erőforrás-allokáció. Itt még nem a futás van.",
  DO: "DO — napi üzem: tranzakció, anyagmozgás, beavatkozás. Ami most történik, nem a tervkártya.",
  CHECK: "CHECK — eltérés, meghibásodási kockázat, fogyasztási ráta, külső függőség.",
  ACT: "ACT — korrekció: bekészletezés, árazás, alternatív input, a következő kör standardja.",
};

const DEFAULT_PDCA_EN: ScenarioPdcaCopy = {
  PLAN: "PLAN — goal, capital, stock and resource split. This is not the live run yet.",
  DO: "DO — daily ops: transaction, material move, intervention. What happens now, not the plan card.",
  CHECK: "CHECK — gap, failure risk, burn rate, outer dependency.",
  ACT: "ACT — correct: restock, price, alternate input, the next-cycle standard.",
};

type Pack = { tabs: ScenarioTabLabels; pdca: ScenarioPdcaCopy };

const BY_ID_HU: Record<string, Pack> = {
  demo7_personal_pocket_seasonal_pilot: {
    tabs: { ...DEFAULT_TABS_HU, inventory: "Vagyon" },
    pdca: DEFAULT_PDCA_HU,
  },
  demo11_resilience_saas_outage: {
    tabs: { cashflow: "Cashflow", items: "Tételek", deals: "Node-ok", inventory: "Tartalék" },
    pdca: {
      PLAN: "PLAN — TTR-cél, local-first másolat, tartalék link. A core üzem számát a törzs viszi.",
      DO: "DO — manuális P2P, helyi másolat, élő pénzáram. Ami most tartja az üzemet.",
      CHECK: "CHECK — helyreállási idő, külső SaaS-függés, likviditási lyuk a kiesés alatt.",
      ACT: "ACT — redundáns csatorna, dual-run lezárás, a következő kör standardja.",
    },
  },
  demo12_resilience_community_grid: {
    tabs: { cashflow: "Cashflow", items: "Tételek", deals: "Telephelyek", inventory: "Készlet" },
    pdca: {
      PLAN: "PLAN — víz- és energiahányad, lajtos ütem, mesh-lefedettség.",
      DO: "DO — kiosztás, tartály, helyi elszámolás. Ami ma elmegy a közösségből.",
      CHECK: "CHECK — liter/óra, lefedetlen utca, 72 órás tartalék.",
      ACT: "ACT — járat, kvóta, tartalék-átcsoportosítás.",
    },
  },
  demo13_resilience_home_blackout: {
    tabs: { cashflow: "Cashflow", items: "Tételek", deals: "Háztartás", inventory: "Tartalék" },
    pdca: {
      PLAN: "PLAN — 72 órás tartalék: Wh, szűrő, készlet napokban.",
      DO: "DO — fogyasztás, készpénz, készletmozgás a kiesés alatt.",
      CHECK: "CHECK — akkumulátor-óra, készletnap, készpénz-runway.",
      ACT: "ACT — adagolás, tartalék-csere, a következő 72 óra standardja.",
    },
  },
  demo14_resilience_demography: {
    tabs: { cashflow: "Cashflow", items: "Tételek", deals: "Nemzetek", inventory: "Mátrix" },
    pdca: {
      PLAN: "PLAN — TFR-pálya, munkaképes kor, kezelési keret.",
      DO: "DO — a mátrix élő számai; a pénzáram a strukturális teher rétege.",
      CHECK: "CHECK — rés a 2,1-hez, 20 éves pálya, fiskális teher.",
      ACT: "ACT — kezelési ág választása, nem riadó.",
    },
  },
  demo16_edu_lean_vsm: {
    tabs: { cashflow: "Cashflow", items: "Tételek", deals: "Sorok", inventory: "Készlet" },
    pdca: {
      PLAN: "PLAN — VSM, OEE-cél, SMED-ablak, Poka-Yoke pont.",
      DO: "DO — átállás, selejt, kiesés Ft-óradíja.",
      CHECK: "CHECK — OEE-lyuk, átfutás, muda a soron.",
      ACT: "ACT — SMED / Poka-Yoke protokoll, a következő kör standardja.",
    },
  },
  demo19_strategy_kahn_fork: {
    tabs: { cashflow: "Cashflow", items: "Tételek", deals: "Ágak", inventory: "Leltár" },
    pdca: {
      PLAN: "PLAN — Kahn-elágazás a törzsből: hitel vagy organikus.",
      DO: "DO — a választott ág élő cash-flowja, nem jóslat.",
      CHECK: "CHECK — kötbér vs rugalmasság, runway, árrés.",
      ACT: "ACT — ág mellett döntés, vagy tartalék a pesszimista sávon.",
    },
  },
  demo20_industry_hospital_blackout: {
    tabs: { cashflow: "Cashflow", items: "Tételek", deals: "Osztályok", inventory: "Energia" },
    pdca: {
      PLAN: "PLAN — kW-osztás: ICU / műtő / NICU, dízel-runway.",
      DO: "DO — triázs a szűkös kW-on, készlet és költség együtt.",
      CHECK: "CHECK — túlélés, üzemanyag-óra, lekapcsolt osztály.",
      ACT: "ACT — terhelés-áthelyezés, tartalék aggregát, a következő 12 óra.",
    },
  },
  demo21_industry_supply_shock: {
    tabs: { cashflow: "Cashflow", items: "Tételek", deals: "Beszállítók", inventory: "Alkatrész" },
    pdca: {
      PLAN: "PLAN — helyettesítő, SMED-idő, OEE-cél.",
      DO: "DO — átállás, beszerzés, élő sor.",
      CHECK: "CHECK — OEE-lyuk, átfutás, egyedi komponens-függés.",
      ACT: "ACT — alternatív input, bekészletezés, a következő kör.",
    },
  },
  demo22_industry_poka_recall: {
    tabs: { cashflow: "Cashflow", items: "Tételek", deals: "Sorok", inventory: "Selejttár" },
    pdca: {
      PLAN: "PLAN — tétel-elhatárolás, gyökérok, poka-pont.",
      DO: "DO — visszavonás, selejtmozgás, élő költség.",
      CHECK: "CHECK — rejtett sorozathiba, visszahívás Ft, folyamatlyuk.",
      ACT: "ACT — folyamatba épített poka, a következő tétel standardja.",
    },
  },
  demo23_industry_wms_outage: {
    tabs: { cashflow: "Cashflow", items: "Tételek", deals: "Dokkok", inventory: "Készlet" },
    pdca: {
      PLAN: "PLAN — papír- és vonalkód-BCP, dokk-ütem.",
      DO: "DO — manuális komissió, élő átfutás és költség.",
      CHECK: "CHECK — lead time, torlódás, IT-függés.",
      ACT: "ACT — dual-run, tartalék csatorna, a következő kör.",
    },
  },
};

const BY_ID_EN: Record<string, Pack> = {
  demo7_personal_pocket_seasonal_pilot: {
    tabs: { ...DEFAULT_TABS_EN, inventory: "Assets" },
    pdca: DEFAULT_PDCA_EN,
  },
  demo11_resilience_saas_outage: {
    tabs: { cashflow: "Cashflow", items: "Items", deals: "Nodes", inventory: "Reserve" },
    pdca: {
      PLAN: "PLAN — TTR target, local-first copy, spare link. Core numbers sit on the trunk.",
      DO: "DO — hand P2P, local copy, live cash. What holds the plant now.",
      CHECK: "CHECK — recovery time, outer SaaS lock, cash hole during the outage.",
      ACT: "ACT — spare channel, close dual-run, next-cycle standard.",
    },
  },
  demo12_resilience_community_grid: {
    tabs: { cashflow: "Cashflow", items: "Items", deals: "Sites", inventory: "Stock" },
    pdca: {
      PLAN: "PLAN — water and energy share, tanker cadence, mesh cover.",
      DO: "DO — allotment, tank, local ledger. What leaves the community today.",
      CHECK: "CHECK — litres/hour, uncovered street, 72-hour reserve.",
      ACT: "ACT — run, quota, reserve shift.",
    },
  },
  demo13_resilience_home_blackout: {
    tabs: { cashflow: "Cashflow", items: "Items", deals: "Household", inventory: "Reserve" },
    pdca: {
      PLAN: "PLAN — 72-hour reserve: Wh, filter, stock in days.",
      DO: "DO — burn, cash, stock move during the outage.",
      CHECK: "CHECK — battery hours, stock days, cash runway.",
      ACT: "ACT — ration, reserve swap, next 72-hour standard.",
    },
  },
  demo14_resilience_demography: {
    tabs: { cashflow: "Cashflow", items: "Items", deals: "Nations", inventory: "Matrix" },
    pdca: {
      PLAN: "PLAN — TFR path, working age, treatment frame.",
      DO: "DO — live matrix numbers; cash is the structural-burden layer.",
      CHECK: "CHECK — gap to 2.1, 20-year path, fiscal load.",
      ACT: "ACT — pick a treatment branch, not an alarm.",
    },
  },
  demo16_edu_lean_vsm: {
    tabs: { cashflow: "Cashflow", items: "Items", deals: "Lines", inventory: "Stock" },
    pdca: {
      PLAN: "PLAN — VSM, OEE target, SMED window, Poka-Yoke point.",
      DO: "DO — changeover, scrap, downtime cash rate.",
      CHECK: "CHECK — OEE hole, lead time, muda on the line.",
      ACT: "ACT — SMED / Poka-Yoke protocol, next-cycle standard.",
    },
  },
  demo19_strategy_kahn_fork: {
    tabs: { cashflow: "Cashflow", items: "Items", deals: "Forks", inventory: "Inventory" },
    pdca: {
      PLAN: "PLAN — Kahn fork from the trunk: loan or organic.",
      DO: "DO — live cash of the chosen branch, not a forecast.",
      CHECK: "CHECK — penalty vs flexibility, runway, margin.",
      ACT: "ACT — stay on a branch, or reserve the pessimistic band.",
    },
  },
  demo20_industry_hospital_blackout: {
    tabs: { cashflow: "Cashflow", items: "Items", deals: "Wards", inventory: "Energy" },
    pdca: {
      PLAN: "PLAN — kW split: ICU / OR / NICU, diesel runway.",
      DO: "DO — triage on scarce kW, stock and cost together.",
      CHECK: "CHECK — survival, fuel hours, shed ward.",
      ACT: "ACT — load shift, spare genset, next 12 hours.",
    },
  },
  demo21_industry_supply_shock: {
    tabs: { cashflow: "Cashflow", items: "Items", deals: "Suppliers", inventory: "Parts" },
    pdca: {
      PLAN: "PLAN — substitute, SMED time, OEE target.",
      DO: "DO — changeover, buy, live line.",
      CHECK: "CHECK — OEE hole, lead time, unique-part lock.",
      ACT: "ACT — alternate input, restock, next cycle.",
    },
  },
  demo22_industry_poka_recall: {
    tabs: { cashflow: "Cashflow", items: "Items", deals: "Lines", inventory: "Scrap" },
    pdca: {
      PLAN: "PLAN — lot isolation, root cause, poka point.",
      DO: "DO — recall, scrap move, live cost.",
      CHECK: "CHECK — hidden series fault, recall cash, process hole.",
      ACT: "ACT — poka in the process, next-lot standard.",
    },
  },
  demo23_industry_wms_outage: {
    tabs: { cashflow: "Cashflow", items: "Items", deals: "Docks", inventory: "Stock" },
    pdca: {
      PLAN: "PLAN — paper and barcode BCP, dock cadence.",
      DO: "DO — hand pick, live lead time and cost.",
      CHECK: "CHECK — lead time, jam, IT lock.",
      ACT: "ACT — dual-run, spare channel, next cycle.",
    },
  },
};

const DEFAULT_HU: Pack = { tabs: DEFAULT_TABS_HU, pdca: DEFAULT_PDCA_HU };
const DEFAULT_EN: Pack = { tabs: DEFAULT_TABS_EN, pdca: DEFAULT_PDCA_EN };

export function scenarioLens(segmentId: string | null | undefined, locale: Locale = "hu"): ScenarioLens {
  const pack = locale === "en" ? BY_ID_EN : BY_ID_HU;
  const fallback = locale === "en" ? DEFAULT_EN : DEFAULT_HU;
  return pack[segmentId ?? ""] ?? fallback;
}
