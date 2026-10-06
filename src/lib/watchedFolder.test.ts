import { describe, expect, it } from "vitest";

import { ensureDirectoryReadPermission, pickLatestStatementFile, type DirectoryLike } from "@/lib/watchedFolder";

describe("watchedFolder permission", () => {
  it("returns true when queryPermission is granted without a request", async () => {
    const handle: DirectoryLike = {
      queryPermission: async () => "granted",
      requestPermission: async () => {
        throw new Error("must not request");
      },
    };
    expect(await ensureDirectoryReadPermission(handle)).toBe(true);
  });

  it("requests when query is prompt, then grants", async () => {
    let requested = false;
    const handle: DirectoryLike = {
      queryPermission: async () => "prompt",
      requestPermission: async () => {
        requested = true;
        return "granted";
      },
    };
    expect(await ensureDirectoryReadPermission(handle)).toBe(true);
    expect(requested).toBe(true);
  });

  it("stops on denied query", async () => {
    const handle: DirectoryLike = {
      queryPermission: async () => "denied",
      requestPermission: async () => "granted",
    };
    expect(await ensureDirectoryReadPermission(handle)).toBe(false);
  });
});

describe("watchedFolder latest file", () => {
  it("picks the newest xml/csv by lastModified", async () => {
    const files = new Map([
      ["old.xml", { lastModified: 1, name: "old.xml" } as File],
      ["skip.txt", { lastModified: 9, name: "skip.txt" } as File],
      ["new.xml", { lastModified: 5, name: "new.xml" } as File],
    ]);
    const dir: DirectoryLike = {
      async *entries() {
        for (const [name, file] of files) {
          yield [name, { kind: "file", getFile: async () => file }];
        }
      },
    };
    const best = await pickLatestStatementFile(dir);
    expect(best?.name).toBe("new.xml");
  });
});
