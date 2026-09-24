import fs from "node:fs/promises";
import path from "node:path";

type Scenario = {
  scenario_name: string;
  timespan: { start: string; end: string };
  currency: string;
  targets: { personal_total_inflow_huf: number; business_total_inflow_huf: number };
  entities: {
    personal: { id: string; label: string };
    business: { id: string; label: string; revenue_sources: string[] };
    projects: Array<{ id: string; label: string; type: string }>;
  };
  linked_assets: Array<{
    id: string;
    name: string;
    purchase_price_huf: number;
    date: string;
    roles: string[];
  }>;
  recurring_rules: {
    monthly_net_draw: { amount_huf: number; from: string; to: string; label: string };
    fuel_allowance: { amount_huf: number; from: string; label: string };
  };
  generation?: { bank_xml_count?: number; bank_xml_period_months?: number };
};

type BankRow = {
  accountRef: string;
  valueDateIso: string; // YYYY-MM-DD
  amountSigned: number;
  currency: string;
  direction: "T" | "J";
  bookingText: string;
  partner: string;
  partnerAccount: string;
  message: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(rnd: () => number, xs: T[]): T {
  return xs[Math.floor(rnd() * xs.length)]!;
}

function int(rnd: () => number, lo: number, hi: number) {
  return Math.floor(lo + rnd() * (hi - lo + 1));
}

function money(rnd: () => number, base: number, jitterPct = 0.12) {
  const j = 1 + (rnd() * 2 - 1) * jitterPct;
  return Math.round(base * j);
}

function formatHuAmount(n: number) {
  // SpreadsheetML parser accepts plain numbers too; we keep it readable.
  return String(n);
}

function splitIntoPeriods(start: Date, end: Date, monthsPerPeriod: number, count: number) {
  const periods: Array<{ start: Date; end: Date }> = [];
  let cur = new Date(start);
  for (let i = 0; i < count; i++) {
    const pStart = new Date(cur);
    const pEnd = addDays(addMonths(pStart, monthsPerPeriod), -1);
    periods.push({ start: pStart, end: pEnd > end ? new Date(end) : pEnd });
    cur = addDays(pEnd, 1);
    if (cur > end) break;
  }
  return periods;
}

function spreadsheetXml(rows: BankRow[]) {
  const esc = (s: string) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const header = [
    "Számla",
    "Összeg",
    "Deviza",
    "Irány",
    "Értéknap",
    "Típus",
    "Partner",
    "Számlaszám / IBAN",
    "Közlemény",
  ];

  const rowXml = (vals: string[]) =>
    `<Row>${vals
      .map((v) => `<Cell><Data ss:Type="String">${esc(v)}</Data></Cell>`)
      .join("")}</Row>`;

  const body = [
    rowXml(header),
    ...rows.map((r) =>
      rowXml([
        r.accountRef,
        formatHuAmount(Math.abs(r.amountSigned)),
        r.currency,
        r.direction,
        r.valueDateIso,
        r.bookingText,
        r.partner,
        r.partnerAccount,
        r.message,
      ]),
    ),
  ].join("");

  return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="History">
    <Table>
      ${body}
    </Table>
  </Worksheet>
</Workbook>
`;
}

function corporateCsv(rows: BankRow[]) {
  // parseHuCorporateStatementCsv expects ; separated and "Számlaazonosító;" header.
  // Col order used there: 0 accountRef, 3 booking date, 4 value date, 5 amount, 6 currency, 7 direction, 8 bookingText, 9 message, 10 partner, 11 partnerAccount
  const header =
    "Számlaazonosító;Könyvelési dátum;Könyvelési idő;Értéknap;Könyvelési nap;Összeg;Devizanem;T/J;Könyvelési szöveg;Közlemény;Partner;Partner számla";
  const lines = [header];
  for (const r of rows) {
    const huDate = (iso: string) => {
      const d = new Date(iso + "T00:00:00");
      return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}.`;
    };
    lines.push(
      [
        r.accountRef,
        huDate(r.valueDateIso),
        "",
        huDate(r.valueDateIso),
        huDate(r.valueDateIso),
        String(r.amountSigned),
        r.currency,
        r.direction,
        r.bookingText,
        r.message.replace(/;/g, ","),
        r.partner.replace(/;/g, ","),
        r.partnerAccount.replace(/;/g, ","),
      ].join(";"),
    );
  }
  return lines.join("\n") + "\n";
}

function row(opts: Partial<BankRow> & Pick<BankRow, "accountRef" | "valueDateIso" | "amountSigned" | "direction">): BankRow {
  return {
    currency: "HUF",
    bookingText: "",
    partner: "",
    partnerAccount: "",
    message: "",
    ...opts,
  };
}

function inRange(iso: string, startIso: string, endIso: string) {
  return iso >= startIso && iso <= endIso;
}

async function main() {
  const root = process.cwd();
  const scenarioPath = path.join(root, "simulations", "test_scenario_master.json");
  const raw = await fs.readFile(scenarioPath, "utf-8");
  const scenario = JSON.parse(raw) as Scenario;

  const start = new Date(scenario.timespan.start + "T00:00:00");
  const end = new Date(scenario.timespan.end + "T00:00:00");
  const seed = seedFromString(scenario.scenario_name);
  const rnd = mulberry32(seed);

  const monthsPer = clamp(Number(scenario.generation?.bank_xml_period_months ?? 6), 1, 12);
  const xmlCount = clamp(Number(scenario.generation?.bank_xml_count ?? 6), 1, 24);
  const periods = splitIntoPeriods(start, end, monthsPer, xmlCount);

  const outDir = path.join(root, "simulations", "out");
  const outXmlDir = path.join(outDir, "bank_xml_personal");
  const outCsvDir = path.join(outDir, "bank_csv_business");
  await fs.mkdir(outXmlDir, { recursive: true });
  await fs.mkdir(outCsvDir, { recursive: true });

  const personalAcc = scenario.entities.personal.id;
  const businessAcc = scenario.entities.business.id;
  const projectId = scenario.entities.projects?.[0]?.id ?? "rendezvenyarnyekolas.hu";

  // --- Generate PERSONAL transactions (SpreadsheetML XML)
  const personalRows: BankRow[] = [];

  // Salary (net-ish) monthly
  const salaryBase = 650_000;
  // Small "other" income a few times per year
  const otherIncomeBase = 120_000;

  // Monthly schedule across timespan
  for (let m = new Date(startOfMonth(start)); m <= end; m = addMonths(m, 1)) {
    const payDay = new Date(m.getFullYear(), m.getMonth(), 5);
    const payIso = ymd(payDay);
    if (inRange(payIso, scenario.timespan.start, scenario.timespan.end)) {
      personalRows.push(
        row({
          accountRef: personalAcc,
          valueDateIso: payIso,
          amountSigned: money(rnd, salaryBase, 0.08),
          direction: "J",
          bookingText: "Munkabér",
          partner: "TESZT MUNKÁLTATÓ KFT",
          partnerAccount: "HU00-0000-0000-0000-0000-0000-0000",
          message: "Havi munkabér utalás",
        }),
      );
    }

    // Owner draw arrives from business monthly on the 12th
    const drawDay = new Date(m.getFullYear(), m.getMonth(), 12);
    const drawIso = ymd(drawDay);
    if (inRange(drawIso, scenario.timespan.start, scenario.timespan.end)) {
      personalRows.push(
        row({
          accountRef: personalAcc,
          valueDateIso: drawIso,
          amountSigned: scenario.recurring_rules.monthly_net_draw.amount_huf,
          direction: "J",
          bookingText: "Átutalás",
          partner: "ADP-TOP / Teszt cég",
          partnerAccount: businessAcc,
          message: "Tulajdonosi kivét",
        }),
      );
    }

    // 2-3 random small personal incomes per year
    if (rnd() < 0.09) {
      const d = new Date(m.getFullYear(), m.getMonth(), int(rnd, 1, 26));
      const iso = ymd(d);
      if (inRange(iso, scenario.timespan.start, scenario.timespan.end)) {
        personalRows.push(
          row({
            accountRef: personalAcc,
            valueDateIso: iso,
            amountSigned: money(rnd, otherIncomeBase, 0.35),
            direction: "J",
            bookingText: "Jóváírás",
            partner: pick(rnd, ["Visszatérítés", "Egyéb jövedelem", "Adójóváírás"]),
            partnerAccount: "",
            message: "Egyéb magán bevétel",
          }),
        );
      }
    }
  }

  // Asset purchases (personal outflows)
  for (const a of scenario.linked_assets) {
    const iso = a.date;
    if (!inRange(iso, scenario.timespan.start, scenario.timespan.end)) continue;
    personalRows.push(
      row({
        accountRef: personalAcc,
        valueDateIso: iso,
        amountSigned: -Math.abs(a.purchase_price_huf),
        direction: "T",
        bookingText: "Átutalás",
        partner: "Vagyon tétel",
        partnerAccount: "",
        message: a.name,
      }),
    );
  }

  // Some recurring personal expenses (utilities, groceries)
  const personalExpenseCats = [
    { partner: "MVM Zrt", msg: "Villanyszámla", base: 42_000 },
    { partner: "VÍZMŰVEK", msg: "Vízdíj", base: 9_500 },
    { partner: "Telekom", msg: "Internet+Mobil", base: 17_000 },
    { partner: "Tesco", msg: "Bevásárlás", base: 75_000 },
  ];
  for (let m = new Date(startOfMonth(start)); m <= end; m = addMonths(m, 1)) {
    const monthEnd = endOfMonth(m);
    for (const c of personalExpenseCats) {
      const d = new Date(m.getFullYear(), m.getMonth(), int(rnd, 10, Math.min(28, monthEnd.getDate())));
      const iso = ymd(d);
      if (!inRange(iso, scenario.timespan.start, scenario.timespan.end)) continue;
      personalRows.push(
        row({
          accountRef: personalAcc,
          valueDateIso: iso,
          amountSigned: -money(rnd, c.base, 0.25),
          direction: "T",
          bookingText: "Kártya",
          partner: c.partner,
          partnerAccount: "",
          message: c.msg,
        }),
      );
    }
  }

  // --- Generate BUSINESS transactions (CSV)
  const businessRows: BankRow[] = [];

  // Revenues: projektorlampacsere.hu (micro) + vrgo.hu (project)
  const microPartners = ["projektorlampacsere.hu", "Projektor Lámpa csere — web", "projektorlampacsere.hu rendelés"];
  const vrgoPartners = ["vrgo.hu", "VRGO Web Projekt", "VRGO — Fejlesztési díj"];

  for (let m = new Date(startOfMonth(start)); m <= end; m = addMonths(m, 1)) {
    // micro jobs: 4-7 / month
    const microCount = int(rnd, 4, 7);
    for (let i = 0; i < microCount; i++) {
      const d = new Date(m.getFullYear(), m.getMonth(), int(rnd, 2, 25));
      const iso = ymd(d);
      if (!inRange(iso, scenario.timespan.start, scenario.timespan.end)) continue;
      businessRows.push(
        row({
          accountRef: businessAcc,
          valueDateIso: iso,
          amountSigned: money(rnd, 55_000, 0.55), // 25k..90k typical micro revenue
          direction: "J",
          bookingText: "Jóváírás",
          partner: pick(rnd, microPartners),
          partnerAccount: "",
          message: "Mikro megrendelés / szolgáltatás",
        }),
      );
    }

    // vrgo: 0-2 invoices / month, heavier in Q2/Q4
    const season = m.getMonth();
    const vrgoCount = rnd() < (season === 4 || season === 5 || season === 10 || season === 11 ? 0.75 : 0.45) ? int(rnd, 1, 2) : 0;
    for (let i = 0; i < vrgoCount; i++) {
      const d = new Date(m.getFullYear(), m.getMonth(), int(rnd, 8, 26));
      const iso = ymd(d);
      if (!inRange(iso, scenario.timespan.start, scenario.timespan.end)) continue;
      businessRows.push(
        row({
          accountRef: businessAcc,
          valueDateIso: iso,
          amountSigned: money(rnd, 520_000, 0.9), // 250k..1M+
          direction: "J",
          bookingText: "Jóváírás",
          partner: pick(rnd, vrgoPartners),
          partnerAccount: "",
          message: "Projekt díj / számla",
        }),
      );
    }

    // owner draw (expense)
    const drawDay = new Date(m.getFullYear(), m.getMonth(), 12);
    const drawIso = ymd(drawDay);
    if (inRange(drawIso, scenario.timespan.start, scenario.timespan.end)) {
      businessRows.push(
        row({
          accountRef: businessAcc,
          valueDateIso: drawIso,
          amountSigned: -scenario.recurring_rules.monthly_net_draw.amount_huf,
          direction: "T",
          bookingText: "Átutalás",
          partner: "Magán számla",
          partnerAccount: personalAcc,
          message: scenario.recurring_rules.monthly_net_draw.label,
        }),
      );
    }

    // fuel allowance
    const fuelDay = new Date(m.getFullYear(), m.getMonth(), 18);
    const fuelIso = ymd(fuelDay);
    if (inRange(fuelIso, scenario.timespan.start, scenario.timespan.end)) {
      businessRows.push(
        row({
          accountRef: businessAcc,
          valueDateIso: fuelIso,
          amountSigned: -scenario.recurring_rules.fuel_allowance.amount_huf,
          direction: "T",
          bookingText: "Átutalás",
          partner: "Üzemanyag-hozzájárulás",
          partnerAccount: "",
          message: "Üzemanyag-hozzájárulás (havi)",
        }),
      );
    }

    // baseline ops costs
    const opsDay = new Date(m.getFullYear(), m.getMonth(), 3);
    const opsIso = ymd(opsDay);
    if (inRange(opsIso, scenario.timespan.start, scenario.timespan.end)) {
      businessRows.push(
        row({
          accountRef: businessAcc,
          valueDateIso: opsIso,
          amountSigned: -money(rnd, 25_000, 0.35),
          direction: "T",
          bookingText: "Kártya",
          partner: "Szoftver előfizetés",
          partnerAccount: "",
          message: "Google Workspace / Hosting / SaaS",
        }),
      );
    }
    const accDay = new Date(m.getFullYear(), m.getMonth(), 6);
    const accIso = ymd(accDay);
    if (inRange(accIso, scenario.timespan.start, scenario.timespan.end)) {
      businessRows.push(
        row({
          accountRef: businessAcc,
          valueDateIso: accIso,
          amountSigned: -money(rnd, 30_000, 0.25),
          direction: "T",
          bookingText: "Átutalás",
          partner: "Könyvelés",
          partnerAccount: "",
          message: "Könyvelői díj",
        }),
      );
    }
  }

  // Incubator project: rendezvenyarnyekolas.hu (2025-04 .. 2025-10)
  const incubStart = "2025-04-01";
  const incubEnd = "2025-10-31";
  const clientPartners = ["Rendezvény Kft", "Esküvő Szerviz", "Kültéri Expo Bt"];
  for (let m = new Date("2025-04-01T00:00:00"); m <= new Date("2025-10-01T00:00:00"); m = addMonths(m, 1)) {
    // 1-3 job revenues
    const jobCount = int(rnd, 1, 3);
    for (let i = 0; i < jobCount; i++) {
      const d = new Date(m.getFullYear(), m.getMonth(), int(rnd, 5, 24));
      const iso = ymd(d);
      if (!inRange(iso, incubStart, incubEnd)) continue;
      businessRows.push(
        row({
          accountRef: businessAcc,
          valueDateIso: iso,
          amountSigned: money(rnd, 420_000, 0.9),
          direction: "J",
          bookingText: "Jóváírás",
          partner: pick(rnd, clientPartners),
          partnerAccount: "",
          message: `rendezvenyarnyekolas.hu · megbízás · ${projectId}`,
        }),
      );
    }

    // materials/tools costs
    const matD = new Date(m.getFullYear(), m.getMonth(), int(rnd, 7, 26));
    const matIso = ymd(matD);
    if (inRange(matIso, incubStart, incubEnd)) {
      businessRows.push(
        row({
          accountRef: businessAcc,
          valueDateIso: matIso,
          amountSigned: -money(rnd, 180_000, 0.8),
          direction: "T",
          bookingText: "Kártya",
          partner: pick(rnd, ["OBI", "Praktiker", "Szerelvény Bolt"]),
          partnerAccount: "",
          message: `Anyagköltség · rendezvenyarnyekolas.hu · ${projectId}`,
        }),
      );
    }

    // EFO wages + tax (separate rows)
    const efoDay = new Date(m.getFullYear(), m.getMonth(), int(rnd, 10, 27));
    const efoIso = ymd(efoDay);
    if (inRange(efoIso, incubStart, incubEnd)) {
      const wage = money(rnd, 95_000, 0.6);
      const tax = Math.round(wage * 0.18);
      businessRows.push(
        row({
          accountRef: businessAcc,
          valueDateIso: efoIso,
          amountSigned: -wage,
          direction: "T",
          bookingText: "Átutalás",
          partner: "EFO közreműködő",
          partnerAccount: "",
          message: `EFO bér · rendezvenyarnyekolas.hu · ${projectId}`,
        }),
      );
      businessRows.push(
        row({
          accountRef: businessAcc,
          valueDateIso: efoIso,
          amountSigned: -tax,
          direction: "T",
          bookingText: "Átutalás",
          partner: "NAV",
          partnerAccount: "",
          message: `EFO adó · rendezvenyarnyekolas.hu · ${projectId}`,
        }),
      );
    }
  }

  // --- Scale inflows to hit targets (approx) without changing fixed recurring rules
  const sumPos = (rs: BankRow[]) => rs.reduce((a, r) => a + (r.amountSigned > 0 ? r.amountSigned : 0), 0);
  const scaleInflow = (rs: BankRow[], target: number, partnerNeedle: (r: BankRow) => boolean) => {
    const cur = sumPos(rs);
    if (cur <= 0) return;
    const factor = target / cur;
    // Only scale matching inflows (keep fixed transfers stable, etc.)
    for (const r of rs) {
      if (r.amountSigned <= 0) continue;
      if (!partnerNeedle(r)) continue;
      r.amountSigned = Math.max(1, Math.round(r.amountSigned * factor));
    }
  };

  // Personal: scale salary+other (keep owner draw fixed)
  scaleInflow(
    personalRows,
    scenario.targets.personal_total_inflow_huf,
    (r) => r.partner !== "ADP-TOP / Teszt cég",
  );

  // Business: scale revenues (keep internal transfers fixed-ish)
  scaleInflow(
    businessRows,
    scenario.targets.business_total_inflow_huf,
    (r) => r.amountSigned > 0,
  );

  // --- Write outputs per period
  personalRows.sort((a, b) => a.valueDateIso.localeCompare(b.valueDateIso));
  businessRows.sort((a, b) => a.valueDateIso.localeCompare(b.valueDateIso));

  const filterRows = (rs: BankRow[], p: { start: Date; end: Date }) => {
    const s = ymd(p.start);
    const e = ymd(p.end);
    return rs.filter((r) => r.valueDateIso >= s && r.valueDateIso <= e);
  };

  for (const p of periods) {
    const s = ymd(p.start);
    const e = ymd(p.end);
    const personalPart = filterRows(personalRows, p);
    const xml = spreadsheetXml(personalPart.map((r) => ({ ...r, direction: r.amountSigned >= 0 ? "J" : "T" })));
    const xmlName = `HISTORY_PERSONAL_${s}_${e}.xml`;
    await fs.writeFile(path.join(outXmlDir, xmlName), xml, "utf-8");

    const businessPart = filterRows(businessRows, p);
    const csv = corporateCsv(businessPart.map((r) => ({ ...r, direction: r.amountSigned >= 0 ? "J" : "T" })));
    const csvName = `HU_CEGES_${s}_${e}.csv`;
    await fs.writeFile(path.join(outCsvDir, csvName), csv, "utf-8");
  }

  const personalInflow = sumPos(personalRows);
  const businessInflow = sumPos(businessRows);
  const personalCount = personalRows.length;
  const businessCount = businessRows.length;

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        scenario: scenario.scenario_name,
        timespan: scenario.timespan,
        outputs: {
          personal_xml_dir: path.relative(root, outXmlDir),
          business_csv_dir: path.relative(root, outCsvDir),
          files: periods.length,
        },
        totals: {
          personal_inflow_huf: personalInflow,
          business_inflow_huf: businessInflow,
          personal_rows: personalCount,
          business_rows: businessCount,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

