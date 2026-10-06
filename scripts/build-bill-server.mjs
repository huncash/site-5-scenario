/**
 * Bill Node API → egy fájl (.output/bill-server.mjs), tsx nélkül a VPS-en.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outfile = path.join(ROOT, ".output", "bill-server.mjs");

mkdirSync(path.dirname(outfile), { recursive: true });

await build({
  entryPoints: [path.join(ROOT, "bill/server/index.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  outfile,
  sourcemap: true,
  legalComments: "none",
  logLevel: "info",
  external: ["vite"],
});

console.log(`[build-bill-server] → ${outfile}`);
