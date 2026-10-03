/**
 * Nitro build után statikus HTML-t ment a publikus kimenetbe.
 * A VPS / Cloudflare ezután fájlt szolgál, nem SSR-ez.
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PORT = Number(process.env.SPA_SHELL_PORT || 4198);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const PUBLIC_DIR = path.resolve(".output/public");
const SERVER = path.resolve(".output/server/index.mjs");

const PAGES = [
  { url: "/", files: ["index.html", "_shell.html"] },
  { url: "/login", files: ["login/index.html"] },
  { url: "/f/adossag-helyreallitas", files: ["f/adossag-helyreallitas/index.html"] },
  { url: "/f/minoseg-koltseg", files: ["f/minoseg-koltseg/index.html"] },
  { url: "/f/multi-site", files: ["f/multi-site/index.html"] },
  { url: "/f/projekt-kontrolling", files: ["f/projekt-kontrolling/index.html"] },
];

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(ORIGIN, { redirect: "manual" });
      if (res.status > 0) return;
    } catch {
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  throw new Error(`SPA shell: ${ORIGIN} nem indult el`);
}

const child = spawn(process.execPath, [SERVER], {
  env: {
    ...process.env,
    PORT: String(PORT),
    NITRO_PORT: String(PORT),
    HOST: "127.0.0.1",
    NITRO_HOST: "127.0.0.1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

child.stdout.on("data", (chunk) => process.stdout.write(chunk));
child.stderr.on("data", (chunk) => process.stderr.write(chunk));

async function fetchPage(url) {
  return fetch(`${ORIGIN}${url}`);
}

try {
  await waitForServer();
  for (const page of PAGES) {
    let res = await fetchPage(page.url);
    let source = page.url;
    if (!res.ok) {
      console.warn(`SPA shell: ${page.url} → ${res.status}, fallback /`);
      if (page.url !== "/") {
        res = await fetchPage("/");
        source = "/";
      }
    }
    if (!res.ok) {
      console.warn(`SPA shell: ${source} → ${res.status}, skip ${page.files.join(", ")}`);
      continue;
    }
    const html = await res.text();
    if (!html.includes("<div id=") && !html.includes("<html")) {
      console.warn(`SPA shell: ${source} nem HTML, skip ${page.files.join(", ")}`);
      continue;
    }
    for (const file of page.files) {
      const out = path.join(PUBLIC_DIR, file);
      await mkdir(path.dirname(out), { recursive: true });
      await writeFile(out, html);
      console.log(`wrote ${file} (${html.length} B)${source !== page.url ? ` via ${source}` : ""}`);
    }
  }
} finally {
  child.kill("SIGTERM");
}
