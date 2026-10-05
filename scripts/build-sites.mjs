/**
 * Aldomain site-ek a fő build mellé:
 *   .output/public/sites/support  ← support Vite SPA
 *   .output/public/sites/docs
 *   .output/public/sites/blog
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, ".output", "public");
const SITES = path.join(PUBLIC, "sites");

function run(cmd, args) {
  const bin = process.platform === "win32" && cmd === "npm" ? "npm.cmd" : cmd;
  const r = spawnSync(bin, args, { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function writePlaceholder(site, title, lead) {
  const dest = path.join(SITES, site);
  ensureDir(dest);
  const srcHtml = path.join(ROOT, "sites", site, "index.html");
  if (existsSync(srcHtml)) {
    cpSync(srcHtml, path.join(dest, "index.html"));
    return;
  }
  writeFileSync(
    path.join(dest, "index.html"),
    `<!doctype html>
<html lang="hu">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root { color-scheme: dark; font-family: "Segoe UI", system-ui, sans-serif; }
      body { margin: 0; min-height: 100dvh; display: grid; place-items: center;
        background: radial-gradient(1200px 600px at 20% -10%, #16382c, #071511 55%); color: #ecfdf5; }
      main { max-width: 36rem; padding: 2rem; }
      h1 { font-size: 1.5rem; margin: 0 0 0.75rem; }
      p { color: #94a3b8; line-height: 1.55; margin: 0 0 1rem; }
      a { color: #6ee7b7; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${lead}</p>
      <p><a href="https://szcenario.hu">← szcenario.hu</a></p>
    </main>
  </body>
</html>
`,
    "utf8",
  );
}

if (!existsSync(PUBLIC)) {
  console.error("[build-sites] hiányzik .output/public — előbb futtasd a fő buildet");
  process.exit(1);
}

console.log("[build-sites] support:build");
run("npm", ["run", "support:build"]);

const supportDist = path.join(ROOT, "support", "dist");
if (!existsSync(path.join(supportDist, "index.html"))) {
  console.error("[build-sites] support/dist/index.html hiányzik");
  process.exit(1);
}

const supportDest = path.join(SITES, "support");
rmSync(supportDest, { recursive: true, force: true });
ensureDir(SITES);
cpSync(supportDist, supportDest, { recursive: true });
console.log("[build-sites] → sites/support");

writePlaceholder(
  "docs",
  "Szcenárió · docs",
  "Dokumentáció — hamarosan. Addig a support tudástár és a GYIK elérhető.",
);
writePlaceholder(
  "blog",
  "Szcenárió · blog",
  "Blog — hamarosan. A termékhírek és esettanulmányok ide kerülnek.",
);

const billSrc = path.join(ROOT, "sites", "bill", "index.html");
if (!existsSync(billSrc)) {
  console.error("[build-sites] hiányzik sites/bill/index.html");
  process.exit(1);
}
const billDest = path.join(SITES, "bill");
rmSync(billDest, { recursive: true, force: true });
ensureDir(billDest);
cpSync(billSrc, path.join(billDest, "index.html"));
console.log("[build-sites] → sites/bill");

for (const site of ["support", "docs", "blog", "bill"]) {
  if (!existsSync(path.join(SITES, site, "index.html"))) {
    console.error(`[build-sites] hiányzik sites/${site}/index.html`);
    process.exit(1);
  }
}

console.log("[build-sites] kész");
