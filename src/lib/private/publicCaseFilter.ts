/** Poka-Yoke: privát esetek soha ne kerüljenek publikus listába. */

export type MaybePrivate = { isPrivate?: boolean };

export function filterPublicCases<T extends MaybePrivate>(cases: readonly T[]): T[] {
  return cases.filter((c) => !c.isPrivate);
}

export function isPublicCase<T extends MaybePrivate>(c: T): boolean {
  return !c.isPrivate;
}
