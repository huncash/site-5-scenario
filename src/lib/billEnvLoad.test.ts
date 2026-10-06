import path from "node:path";
import { describe, expect, it } from "vitest";

import { billEnvFileCandidates } from "../../bill/server/loadenv.ts";

describe("bill env Poka-Yoke — abszolút jelöltek", () => {
  it("BILL_ENV_FILE az első, shared/.env.production mindig bent van", () => {
    const prev = process.env.BILL_ENV_FILE;
    process.env.BILL_ENV_FILE = "/var/www/szcenario/shared/.env.production";
    try {
      const cwd = "/var/www/szcenario/current";
      const here = "/var/www/szcenario/current/.output";
      const list = billEnvFileCandidates(here, cwd);
      expect(list[0]).toBe(path.resolve("/var/www/szcenario/shared/.env.production"));
      expect(list).toContain(path.resolve(cwd, ".env"));
      expect(list).toContain(path.resolve(here, "..", ".env"));
      expect(list).toContain(path.resolve("/var/www/szcenario/shared/.env.production"));
    } finally {
      if (prev === undefined) delete process.env.BILL_ENV_FILE;
      else process.env.BILL_ENV_FILE = prev;
    }
  });

  it("cwd-től függetlenül a bundle mappája fölötti .env is jelölt", () => {
    const list = billEnvFileCandidates("/opt/release/.output", "/tmp/wrong-cwd");
    expect(list).toContain(path.resolve("/opt/release/.env"));
    expect(list).toContain(path.resolve("/tmp/wrong-cwd", ".env"));
  });
});
