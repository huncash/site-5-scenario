/**
 * Helyi, anonim érdeklődés → csomag-javaslat. Csak localhost admin.
 * Nincs hálózat, nincs PII, nem megy a nyilvános copyba.
 */
import { loyaltyFeesFromYear1Huf } from "@/config/plans";
import type { EngineInterestMap } from "@/lib/engineInterest";
import { splitEqualParts } from "@/lib/installmentPlan";
import type { LabsEngineId } from "@/lib/labsTechTree";
import type { EngineInterestRow } from "@/lib/mesh/schema";
import { PRIVATE_MONETIZATION_CASE } from "@/lib/private/monetizationCase";

export type RankedEngineInterest = {
  engine: LabsEngineId;
  label: string;
  clicks: number;
  starts: number;
  switches: number;
  score: number;
};

export type InterestConversion = {
  perStart: number;
  perSwitch: number;
  perClick: number;
};

export const DEFAULT_INTEREST_CONVERSION: InterestConversion = {
  perStart: 1,
  perSwitch: 0.25,
  perClick: 0.08,
};

export type TwoPillarProjection = {
  licenses: number;
  installmentShare: number;
  optionARevenue: number;
  optionACashMonth1: number;
  optionACashDay60: number;
  optionBAttachRate: number;
  optionBY2: number;
  optionBY3: number;
  optionBRevenue36m: number;
  total36mGross: number;
};

export type EnginePackProposal = {
  ranking: RankedEngineInterest[];
  leader: LabsEngineId | null;
  sampleSize: number;
  copyHu: string;
  projection: TwoPillarProjection;
};

export type TwoPillarProjectionInput = {
  y1?: number;
  attachRate?: number;
  installmentShare?: number;
  conversion?: InterestConversion;
};

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function licensesFromInterest(
  map: EngineInterestMap,
  conversion: InterestConversion = DEFAULT_INTEREST_CONVERSION,
): number {
  const rows = (["economic", "education", "resilience"] as const).map((id) => map[id]);
  const raw = rows.reduce(
    (n, r) => n + r.starts * conversion.perStart + r.switches * conversion.perSwitch + r.clicks * conversion.perClick,
    0,
  );
  return Math.round(raw * 100) / 100;
}

export function projectTwoPillarFromInterest(
  map: EngineInterestMap,
  input: TwoPillarProjectionInput = {},
): TwoPillarProjection {
  const y1 = input.y1 ?? PRIVATE_MONETIZATION_CASE.optionA.baseValues.perpetualPrice;
  const installmentShare = clamp01(
    input.installmentShare ?? PRIVATE_MONETIZATION_CASE.optionA.baseValues.installmentShare,
  );
  const attachRate = clamp01(
    input.attachRate ?? PRIVATE_MONETIZATION_CASE.optionB.baseValues.attachRate,
  );
  const licenses = licensesFromInterest(map, input.conversion);
  const [p1, p2] = splitEqualParts(y1);
  const fees = loyaltyFeesFromYear1Huf(y1);
  const optionARevenue = licenses * y1;
  const optionACashMonth1 = licenses * ((1 - installmentShare) * y1 + installmentShare * p1);
  const optionACashDay60 = licenses * installmentShare * p2;
  const optionBRevenue36m = licenses * attachRate * (fees.y2 + fees.y3);
  return {
    licenses,
    installmentShare,
    optionARevenue,
    optionACashMonth1,
    optionACashDay60,
    optionBAttachRate: attachRate,
    optionBY2: fees.y2,
    optionBY3: fees.y3,
    optionBRevenue36m,
    total36mGross: optionARevenue + optionBRevenue36m,
  };
}

const ENGINE_LABEL: Record<LabsEngineId, string> = {
  economic: "Gazdasági Alapmotor",
  education: "Oktatási Motor",
  resilience: "Vészhelyzeti / BCP Motor",
};

const BASE_COPY =
  "A mért modell két pillér: Opció A örök használat + 1 év frissítés (egyszeri vagy 2 egyenlő részlet 60 napon belül), Opció B opcionális Y2+ éves frissítés a meglévő örök licenc mellé. Nincs havi előfizetés. A Gazdasági motor marad az alapcsomag magja (Basic / Pro / Enterprise). Az Oktatási és a Vészhelyzeti / BCP motor ugyanabban a Case / Slot keretben kapcsolható — nem külön termékcsalád, hanem modul-legó. A belső / személyes zóna marad előkészítés. A JIT bővítők (Extra Case, Slot, Seat, Edge) a kapacitást mérik, nem a motort.";

export function scoreInterest(row: EngineInterestRow): number {
  return row.clicks + row.starts * 3 + row.switches * 2;
}

export function rankEngineInterest(map: EngineInterestMap): RankedEngineInterest[] {
  const rows: RankedEngineInterest[] = (["economic", "education", "resilience"] as const).map(
    (engine) => ({
      engine,
      label: ENGINE_LABEL[engine],
      clicks: map[engine].clicks,
      starts: map[engine].starts,
      switches: map[engine].switches,
      score: scoreInterest(map[engine]),
    }),
  );
  rows.sort((a, b) => b.score - a.score || a.engine.localeCompare(b.engine));
  return rows;
}

function dataCopy(leader: LabsEngineId, sampleSize: number): string {
  if (sampleSize === 0) {
    return `${BASE_COPY} Még nincs helyi minta: a finomhangolás a három motor élő kattintásából / indításából jöjjön.`;
  }
  if (leader === "education") {
    return `${BASE_COPY} A helyi minta az oktatási irány felé billen. Javaslat: az Oktatási motor legyen az első önálló bővítő-ág; a gazdasági Y1 ne szakadjon el, a BCP maradjon második sáv.`;
  }
  if (leader === "resilience") {
    return `${BASE_COPY} A helyi minta a vészhelyzeti / BCP irány felé billen. Javaslat: BCP motor + Edge JIT kapjon elsőbbséget a modul-legóban; az oktatási ág maradjon látható, de ne vigye el a listaár-súlyt.`;
  }
  return `${BASE_COPY} A forgalom a gazdasági magon marad. Az Oktatási és a BCP ág maradjon azonnal kapcsolható a választóban, a csomagárazás viszont a gazdasági Y1-hez igazodjon — ne legyen külön belépőcsalád.`;
}

export function buildEnginePackProposal(
  map: EngineInterestMap,
  input: TwoPillarProjectionInput = {},
): EnginePackProposal {
  const ranking = rankEngineInterest(map);
  const sampleSize = ranking.reduce((n, r) => n + r.clicks + r.starts + r.switches, 0);
  const leader = sampleSize === 0 ? null : ranking[0]?.engine ?? null;
  const projection = projectTwoPillarFromInterest(map, input);
  return {
    ranking,
    leader,
    sampleSize,
    copyHu: dataCopy(leader ?? "economic", sampleSize),
    projection,
  };
}
