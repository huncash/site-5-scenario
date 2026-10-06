import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let last: { loadedFrom: string | null; tried: string[] } = { loadedFrom: null, tried: [] };

/** A bill-server.mjs vagy a bill/server mappa — nem a cwd. */
function hereDir(): string {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
}

function sharedProductionEnv(): string {
  const slug = (process.env.SITE_SLUG || "szcenario").trim() || "szcenario";
  const appDir = (process.env.APP_DIR || `/var/www/${slug}`).trim();
  return path.join(appDir, "shared", ".env.production");
}

/** Abszolút jelöltek: BILL_ENV_FILE → cwd → release → VPS shared. */
export function billEnvFileCandidates(here = hereDir(), cwd = process.cwd()): string[] {
  const forced = (process.env.BILL_ENV_FILE || process.env.DOTENV_CONFIG_PATH || "").trim();
  const shared = sharedProductionEnv();
  const out: string[] = [];
  const add = (p: string) => {
    const abs = path.resolve(p);
    if (!out.includes(abs)) out.push(abs);
  };
  if (forced) add(forced);
  add(path.join(cwd, ".env"));
  add(path.join(cwd, ".env.production"));
  add(path.join(here, ".env"));
  add(path.join(here, "..", ".env"));
  add(path.join(here, "..", "..", ".env"));
  add(path.join(here, "..", "..", "shared", ".env.production"));
  add(path.join(here, "..", "..", "..", "shared", ".env.production"));
  add(shared);
  add(path.join(path.dirname(shared), "..", "current", ".env"));
  return out;
}

export function loadBillEnv(): { loadedFrom: string | null; tried: string[] } {
  const tried = billEnvFileCandidates();
  for (const file of tried) {
    if (!existsSync(file)) continue;
    try {
      process.loadEnvFile(file);
      last = { loadedFrom: file, tried };
      return last;
    } catch {
      /* következő jelölt */
    }
  }
  last = { loadedFrom: null, tried };
  return last;
}

export function lastBillEnvLoad(): { loadedFrom: string | null; tried: string[] } {
  return last;
}
