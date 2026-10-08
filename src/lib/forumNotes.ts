/**
 * Helyi Nostr-alakú vitafórum keret: anonim adatsorok összehasonlítása.
 * Nincs relay-ping, nincs fetch.
 */
import {
  isEducationCaseStudy,
  studyContainsRawLeak,
  type EducationCaseStudy,
  type NostrUnsignedEvent,
} from "@/lib/educationAnonymize";
import { parseAnonCasePack, textContainsLivePii } from "@/lib/anonCasePack";
import { sha256Hex } from "@/lib/hash";
import type { MeshRepository } from "@/lib/mesh/meshRepository";
import type { ForumNoteRow, MeshSchema } from "@/lib/mesh/schema";

export const FORUM_NO_RELAY_HU =
  "A szoftver nem csatlakozik relayre. A jegyzetet te másolod — nincs automata küldés.";

export function forumNotesQueryKey() {
  return ["forumNotes"] as const;
}

export function studyFromNoteContent(content: string): EducationCaseStudy | null {
  try {
    const v = JSON.parse(content) as unknown;
    return isEducationCaseStudy(v) ? v : null;
  } catch {
    return null;
  }
}

export function compareAnonSeries(a: EducationCaseStudy, b: EducationCaseStudy) {
  return {
    cashDelta: b.cashHuf - a.cashHuf,
    revenueDelta: b.monthlyRevenueHuf - a.monthlyRevenueHuf,
    opexDelta: b.monthlyOpexHuf - a.monthlyOpexHuf,
    runwayDelta: (b.runwayMonths ?? 0) - (a.runwayMonths ?? 0),
  };
}

function rowFromStudy(id: string, study: EducationCaseStudy, note: NostrUnsignedEvent): ForumNoteRow {
  return {
    id,
    createdAt: (note.created_at ?? 0) * 1000 || Date.now(),
    kind: note.kind,
    tags: note.tags,
    content: JSON.stringify(study),
    pubkey: note.pubkey ?? "",
    alias: study.orgAlias,
    cashHuf: study.cashHuf,
    monthlyOpexHuf: study.monthlyOpexHuf,
    runwayMonths: study.runwayMonths,
  };
}

export async function readForumNotes(repo: MeshRepository<MeshSchema>): Promise<ForumNoteRow[]> {
  const rows = await repo.getAll("forumNotes");
  return [...rows].sort((a, b) => b.createdAt - a.createdAt);
}

export async function importForumNote(
  repo: MeshRepository<MeshSchema>,
  raw: string,
): Promise<{ ok: true; row: ForumNoteRow } | { ok: false; reason: string }> {
  const parsed = await parseAnonCasePack(raw);
  if (!parsed.ok) return { ok: false, reason: parsed.reason };
  const study = parsed.pack.study;
  if (textContainsLivePii(JSON.stringify(study)) || studyContainsRawLeak(study, [])) {
    return { ok: false, reason: "pii" };
  }
  const id = `note-${await sha256Hex(JSON.stringify(study))}`;
  const row = rowFromStudy(id, study, parsed.pack.nostr);
  await repo.save("forumNotes", row);
  return { ok: true, row };
}

export async function deleteForumNote(repo: MeshRepository<MeshSchema>, id: string): Promise<void> {
  await repo.delete("forumNotes", id);
}
