/**
 * Two-phase renumber: public demos → DEMO 1..18 in catalog-group order;
 * hidden seed leftovers → DEMO 19..26.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

/** Old id → new id (canonical public order = kind→industry groups). */
const PUBLIC_MAP = [
  ["demo1_multisite_operator", "demo1_multisite_operator"],
  ["demo2_premium_nightlife", "demo2_premium_nightlife"],
  ["demo3_specialty_cafe_tea", "demo3_specialty_cafe_tea"],
  ["demo4_fine_dining_bistro", "demo4_fine_dining_bistro"],
  ["demo5_pastry_gelato", "demo5_pastry_gelato"],
  ["demo6_event_catering_popup", "demo6_event_catering_popup"],
  ["demo20_industry_hospital_blackout", "demo7_industry_hospital_blackout"],
  ["demo21_industry_supply_shock", "demo8_industry_supply_shock"],
  ["demo22_industry_poka_recall", "demo9_industry_poka_recall"],
  ["demo23_industry_wms_outage", "demo10_industry_wms_outage"],
  ["demo19_strategy_kahn_fork", "demo11_strategy_kahn_fork"],
  ["demo11_resilience_saas_outage", "demo12_resilience_saas_outage"],
  ["demo12_resilience_community_grid", "demo13_resilience_community_grid"],
  ["demo13_resilience_home_blackout", "demo14_resilience_home_blackout"],
  ["demo14_resilience_demography", "demo15_resilience_demography"],
  ["demo15_edu_startup_cashflow", "demo16_edu_startup_cashflow"],
  ["demo16_edu_lean_vsm", "demo17_edu_ops_process"],
  ["demo7_personal_pocket_seasonal_pilot", "demo18_personal_pocket_seasonal_pilot"],
];

const HIDDEN_MAP = [
  ["demo8_strategy_new_line", "demo19_strategy_new_line"],
  ["demo9_strategy_input_inflation", "demo20_strategy_input_inflation"],
  ["demo10_strategy_new_market", "demo21_strategy_new_market"],
  ["demo17_edu_campus_energy", "demo22_edu_campus_energy"],
  ["demo18_edu_cyber_incident", "demo23_edu_cyber_incident"],
  ["demo24_industry_fuel_crisis", "demo24_industry_fuel_crisis"],
  ["demo25_industry_tax_shock", "demo25_industry_tax_shock"],
  ["demo26_industry_saas_exit", "demo26_industry_saas_exit"],
];

const ALL = [...PUBLIC_MAP, ...HIDDEN_MAP];

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git" || ent.name === "dist" || ent.name === "scripts") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx|md|json)$/.test(ent.name)) out.push(p);
  }
  return out;
}

function replaceAll(text, from, to) {
  return text.split(from).join(to);
}

const files = walk(path.join(root, "src")).concat(walk(path.join(root, "bill")));
let changedFiles = 0;

for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const orig = text;

  // Phase 1: old → __TMP__
  for (const [oldId] of ALL) {
    text = replaceAll(text, oldId, `__TMP__${oldId}`);
  }
  // Phase 2: __TMP__old → new
  for (const [oldId, newId] of ALL) {
    text = replaceAll(text, `__TMP__${oldId}`, newId);
  }

  // Sync "DEMO N —" label prefix from new id number when name/title lines carry DEMO
  text = text.replace(/DEMO\s+(\d+)\s*[—–-]/g, (full, num) => {
    // leave alone unless we can prove context — handled below per known pairs
    return full;
  });

  if (text !== orig) {
    fs.writeFileSync(file, text);
    changedFiles += 1;
  }
}

// Second pass: rewrite DEMO N — using surrounding id when pattern `id: "demoN_..."` nearby is hard;
// instead map known old DEMO display numbers via explicit name replacements.
const NAME_FIXES = [
  // public new numbers
  ["DEMO 20 —", "DEMO 7 —"],
  ["DEMO 21 —", "DEMO 8 —"],
  ["DEMO 22 —", "DEMO 9 —"],
  ["DEMO 23 —", "DEMO 10 —"],
  ["DEMO 19 —", "DEMO 11 —"],
  // resilience chain: old 11→12, 12→13, 13→14, 14→15 (after id rename names still say old)
  // Order matters: apply high→temp→final for colliding display numbers
];

// Display renames that conflict must be temp-phased too.
const DISPLAY = [
  // From old display numbers still in strings after id rename:
  // personal was DEMO 7 → DEMO 18
  // edu 15→16, 16→17
  // resilience 11→12, 12→13, 13→14, 14→15
  // industry 20→7, 21→8, 22→9, 23→10
  // kahn 19→11
  // hidden 8→19, 9→20, 10→21, 17→22, 18→23
  ["DEMO 26 —", "__D__26 —"],
  ["DEMO 25 —", "__D__25 —"],
  ["DEMO 24 —", "__D__24 —"],
  ["DEMO 23 —", "__D__23 —"],
  ["DEMO 22 —", "__D__22 —"],
  ["DEMO 21 —", "__D__21 —"],
  ["DEMO 20 —", "__D__20 —"],
  ["DEMO 19 —", "__D__19 —"],
  ["DEMO 18 —", "__D__18 —"],
  ["DEMO 17 —", "__D__17 —"],
  ["DEMO 16 —", "__D__16 —"],
  ["DEMO 15 —", "__D__15 —"],
  ["DEMO 14 —", "__D__14 —"],
  ["DEMO 13 —", "__D__13 —"],
  ["DEMO 12 —", "__D__12 —"],
  ["DEMO 11 —", "__D__11 —"],
  ["DEMO 10 —", "__D__10 —"],
  ["DEMO 9 —", "__D__9 —"],
  ["DEMO 8 —", "__D__8 —"],
  ["DEMO 7 —", "__D__7 —"],
  // finals from old numbers (ids already new; display still old until this)
  ["__D__20 —", "DEMO 7 —"], // hospital
  ["__D__21 —", "DEMO 8 —"],
  ["__D__22 —", "DEMO 9 —"],
  ["__D__23 —", "DEMO 10 —"],
  ["__D__19 —", "DEMO 11 —"], // kahn
  ["__D__11 —", "DEMO 12 —"], // saas
  ["__D__12 —", "DEMO 13 —"],
  ["__D__13 —", "DEMO 14 —"],
  ["__D__14 —", "DEMO 15 —"],
  ["__D__15 —", "DEMO 16 —"], // startup
  ["__D__16 —", "DEMO 17 —"], // ops
  ["__D__7 —", "DEMO 18 —"], // personal
  ["__D__8 —", "DEMO 19 —"], // hidden strategy
  ["__D__9 —", "DEMO 20 —"],
  ["__D__10 —", "DEMO 21 —"],
  ["__D__17 —", "DEMO 22 —"],
  ["__D__18 —", "DEMO 23 —"],
  ["__D__24 —", "DEMO 24 —"],
  ["__D__25 —", "DEMO 25 —"],
  ["__D__26 —", "DEMO 26 —"],
];

for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const orig = text;
  for (const [a, b] of DISPLAY) text = replaceAll(text, a, b);
  if (text !== orig) {
    fs.writeFileSync(file, text);
    changedFiles += 1;
  }
}

console.log(`Updated files (passes): ${changedFiles}`);
console.log("Public map:");
for (const [a, b] of PUBLIC_MAP) if (a !== b) console.log(`  ${a} → ${b}`);
