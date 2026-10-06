import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createMemoryOplMedia,
  evictOplMediaCache,
  isCacheableOplSrc,
  oplCatalog,
  oplCatalogBytes,
  oplCatalogJson,
  oplLessonText,
  oplMediaCacheKey,
  resolveOplFrame,
  setOplMediaBackend,
  OPL_STORAGE,
} from "@/lib/oplStorage";

afterEach(() => {
  setOplMediaBackend(null);
  vi.unstubAllGlobals();
});

describe("oplStorage", () => {
  it("keeps 30–50 lesson records as JSON text with no bundled frames", () => {
    const catalog = oplCatalog();
    expect(catalog.version).toBe(1);
    expect(catalog.frame).toEqual({ widthPx: 320, heightPx: 180 });
    expect(catalog.lessons.length).toBeGreaterThanOrEqual(25);
    expect(catalog.meta.length).toBeGreaterThanOrEqual(30);
    expect(catalog.meta.length).toBeLessThanOrEqual(80);
    expect(catalog.lessons.every((l) => l.deepDiveHu.length > 0 && l.jargon.length > 0)).toBe(true);
    expect(catalog.lessons.filter((l) => l.path.startsWith("lecke-dash-")).length).toBeGreaterThanOrEqual(25);
    expect(catalog.lessons.filter((l) => l.path.startsWith("lecke-motor-")).length).toBeGreaterThanOrEqual(15);

    const json = oplCatalogJson();
    expect(() => JSON.parse(json)).not.toThrow();
    expect(json).not.toMatch(/data:image\//);
    expect(json).not.toMatch(/"blob:/);
    expect(oplCatalogBytes()).toBeLessThan(600_000);
    expect(catalog.meta.flatMap((m) => m.mediaRefs).every(isCacheableOplSrc)).toBe(true);
  });

  it("reads a full lesson body synchronously from the local catalog", () => {
    const lesson = oplLessonText("lecke-dash-runway");
    expect(lesson?.titleHu).toMatch(/runway/i);
    expect(oplLessonText("lecke-motor-holtpenz")?.titleHu).toMatch(/holtpénz/i);
    expect(lesson?.steps[0]?.image?.src).toBeUndefined();
    expect(oplLessonText("nincs")).toBeNull();
  });

  it("falls back when the frame is missing or the machine is offline", async () => {
    const backend = createMemoryOplMedia();
    await expect(resolveOplFrame(undefined, { backend })).resolves.toEqual({ kind: "fallback" });
    await expect(resolveOplFrame("data:image/png;base64,xx", { backend })).resolves.toEqual({
      kind: "fallback",
    });
    await expect(
      resolveOplFrame("/opl-frames/runway.webp", { backend, online: false }),
    ).resolves.toEqual({ kind: "fallback" });
  });

  it("fetches once, caches locally, then serves without network", async () => {
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:opl-test",
      revokeObjectURL: () => undefined,
    });
    const backend = createMemoryOplMedia();
    const blob = new Blob([new Uint8Array([1, 2, 3, 4])], { type: "image/webp" });
    const fetchFn = vi.fn(async () => new Response(blob, { headers: { "content-type": "image/webp" } }));
    const src = "/opl-frames/kpi.webp";

    const first = await resolveOplFrame(src, { backend, fetch: fetchFn as unknown as typeof fetch, online: true });
    expect(first.kind).toBe("fetched");
    expect(first.objectUrl).toMatch(/^blob:/);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    const second = await resolveOplFrame(src, { backend, fetch: fetchFn as unknown as typeof fetch, online: false });
    expect(second.kind).toBe("cached");
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(await backend.get(oplMediaCacheKey(src))).toMatchObject({ src, bytes: 4 });

    vi.unstubAllGlobals();
  });

  it("rejects oversized frames so the cache cannot bloat", async () => {
    const backend = createMemoryOplMedia();
    const fat = new Blob([new Uint8Array(OPL_STORAGE.maxFrameBytes + 8)], { type: "image/png" });
    const fetchFn = vi.fn(async () => new Response(fat, { headers: { "content-type": "image/png" } }));
    const resolved = await resolveOplFrame("/opl-frames/fat.png", {
      backend,
      fetch: fetchFn as unknown as typeof fetch,
      online: true,
    });
    expect(resolved.kind).toBe("fallback");
    expect(await backend.getAll()).toEqual([]);
  });

  it("can wipe the on-demand media cache", async () => {
    const backend = createMemoryOplMedia();
    await backend.save({
      key: "k",
      src: "/x.webp",
      type: "image/webp",
      blob: new Blob([new Uint8Array([9])], { type: "image/webp" }),
      storedAt: 1,
      bytes: 1,
    });
    await evictOplMediaCache({ backend });
    expect(await backend.getAll()).toEqual([]);
  });
});
