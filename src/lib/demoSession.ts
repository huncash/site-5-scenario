import { deriveKey, makeVerifier, randomSaltB64 } from "@/lib/crypto";
import {
  DEMO_PASSWORD,
  DEMO_SEGMENTS,
  purgeDemoGeneratedDataForActiveProfile,
  seedDemoDataForSegment,
  segmentIdFromDemoName,
  type DemoSegmentId,
} from "@/lib/demoSeed";
import { isEducationSegment } from "@/lib/educationCases";
import { isResilienceSegment, resilienceEntryWorkspace } from "@/lib/resilienceCases";
import { isStrategySegment } from "@/lib/strategyCases";
import { localdb } from "@/lib/localdb";

export const LAST_PROFILE_KEY = "vault:lastProfile";
export const SCENARIO_DOOR_STEP_KEY = "ui:scenarioDoorStep";
export const CASE_ENTRY_TAB_KEY = "ui:caseEntryTab";
export const CASE_ENTRY_DEFAULT_WS = "Vállalkozás1";

export function writeCaseEntryTab(wsId: string = CASE_ENTRY_DEFAULT_WS) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CASE_ENTRY_TAB_KEY, wsId);
  } catch {
    /* ignore */
  }
}

export type ScenarioDoorStep = "type" | "industry" | "hospitality" | "strategy" | "resilience" | "education";

export function doorStepForSegment(segmentId: string | null | undefined): ScenarioDoorStep {
  if (isEducationSegment(segmentId)) return "education";
  if (isResilienceSegment(segmentId)) return "resilience";
  if (isStrategySegment(segmentId)) return "strategy";
  return "hospitality";
}

export function caseEntryTabForSegment(segmentId: string | null | undefined): string {
  if (isResilienceSegment(segmentId)) return resilienceEntryWorkspace(segmentId);
  if (isEducationSegment(segmentId) || isStrategySegment(segmentId)) return "Projekt1";
  return CASE_ENTRY_DEFAULT_WS;
}

export function isDemoProfileName(name: unknown): boolean {
  return String(name ?? "")
    .trim()
    .startsWith("DEMO ");
}

export function visitorTitleForSegment(segmentId: string | null | undefined): string | null {
  if (!segmentId) return null;
  return DEMO_SEGMENTS.find((s) => s.id === segmentId)?.title ?? null;
}

export function visitorLeadForSegment(segmentId: string | null | undefined): string | null {
  if (!segmentId) return null;
  return DEMO_SEGMENTS.find((s) => s.id === segmentId)?.lead ?? null;
}

export function readScenarioDoorStep(): ScenarioDoorStep {
  if (typeof window === "undefined") return "type";
  try {
    const raw = sessionStorage.getItem(SCENARIO_DOOR_STEP_KEY);
    if (raw === "hospitality" || raw === "economic") return "hospitality";
    if (raw === "strategy") return "strategy";
    if (raw === "education" || raw === "training") return "education";
    if (raw === "resilience" || raw === "crisis" || raw === "disaster") return "resilience";
    if (raw === "industry") return "industry";
    return "type";
  } catch {
    return "type";
  }
}

export function writeScenarioDoorStep(step: ScenarioDoorStep) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SCENARIO_DOOR_STEP_KEY, step);
  } catch {
    /* ignore */
  }
}

function norm(s: unknown) {
  return String(s ?? "")
    .normalize("NFKC")
    .replace(/[\u2010\u2011\u2012\u2013\u2212]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export async function dedupeAllDemoProfiles() {
  const list = await localdb.listProfiles();
  const allowedNorm = new Set(DEMO_SEGMENTS.map((s) => norm(s.name)));
  const legacyNames = new Set<string>(["DEMO / Fűszer (DUPE)"]);

  for (const p of list) {
    const rawName = String(p.name ?? "");
    const n = norm(rawName);
    const isDemo = n.startsWith("DEMO ");
    const isKnownCurrentDemo = allowedNorm.has(n);
    const isLegacyNamed = legacyNames.has(rawName);
    if (isLegacyNamed || (isDemo && !isKnownCurrentDemo)) {
      await localdb.deleteProfile(p.id);
    }
  }

  const list2 = await localdb.listProfiles();
  const groups = new Map<string, typeof list2>();
  for (const p of list2) {
    const key = norm(p.name);
    if (!allowedNorm.has(key)) continue;
    const g = groups.get(key);
    if (g) g.push(p);
    else groups.set(key, [p]);
  }

  for (const [, matches] of groups) {
    if (matches.length <= 1) continue;
    const sorted = [...matches].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    for (const d of sorted.slice(1)) await localdb.deleteProfile(d.id);
  }
}

export async function ensureDemoPackProfilesExist() {
  const list = await localdb.listProfiles();
  const existingKeys = new Set(list.map((p) => norm(p.name)));

  for (const seg of DEMO_SEGMENTS) {
    const k = norm(seg.name);
    if (existingKeys.has(k)) continue;
    const salt = randomSaltB64();
    const key = await deriveKey(DEMO_PASSWORD, salt);
    const verifier = await makeVerifier(key);
    await localdb.createProfile({ name: seg.name, salt, verifier });
    existingKeys.add(k);
  }
}

export async function enterRememberedOrFirstDemo(vault: {
  unlockById: (id: string, password: string) => Promise<boolean>;
  createProfile: (name: string, password: string) => Promise<void>;
}): Promise<DemoSegmentId> {
  await ensureDemoPackProfilesExist();
  await dedupeAllDemoProfiles();
  const list = await localdb.listProfiles();
  const lastId = typeof window !== "undefined" ? localStorage.getItem(LAST_PROFILE_KEY) : null;
  const last = lastId ? list.find((p) => p.id === lastId) : null;
  const fromLast = last ? segmentIdFromDemoName(last.name) : null;
  const segmentId = fromLast ?? DEMO_SEGMENTS[0]!.id;
  await enterDemoSegment(segmentId, vault);
  return segmentId;
}

export async function enterDemoSegment(
  segmentId: DemoSegmentId,
  vault: {
    unlockById: (id: string, password: string) => Promise<boolean>;
    createProfile: (name: string, password: string) => Promise<void>;
  },
) {
  const seg = DEMO_SEGMENTS.find((s) => s.id === segmentId);
  if (!seg) throw new Error("Ismeretlen gazdasági eset.");

  await dedupeAllDemoProfiles();

  const listAfter = await localdb.listProfiles();
  const existing = listAfter.find((p) => p.name === seg.name) ?? null;
  if (existing) {
    const ok = await vault.unlockById(existing.id, DEMO_PASSWORD);
    if (!ok) {
      throw new Error("A demó eset megvan, de a széf jelszava nem stimmel.");
    }
    if (typeof window !== "undefined") localStorage.setItem(LAST_PROFILE_KEY, existing.id);
    const prefix = `demo:${segmentId}:`;
    const rows = await localdb.listTxns();
    const alreadySeeded = rows.some((t) => String(t.id).startsWith(prefix));
    if (!alreadySeeded) {
      await purgeDemoGeneratedDataForActiveProfile();
      await seedDemoDataForSegment(segmentId);
    }
    writeScenarioDoorStep(doorStepForSegment(segmentId));
    writeCaseEntryTab(caseEntryTabForSegment(segmentId));
    return;
  }

  await vault.createProfile(seg.name, DEMO_PASSWORD);
  await dedupeAllDemoProfiles();
  const list2 = await localdb.listProfiles();
  const created = list2.find((p) => p.name === seg.name) ?? null;
  if (created && typeof window !== "undefined") localStorage.setItem(LAST_PROFILE_KEY, created.id);
  await purgeDemoGeneratedDataForActiveProfile();
  await seedDemoDataForSegment(segmentId);
  writeScenarioDoorStep(doorStepForSegment(segmentId));
  writeCaseEntryTab(caseEntryTabForSegment(segmentId));
}
