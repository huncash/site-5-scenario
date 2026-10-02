/**
 * Lightweight static origin for .output/public.
 * No React SSR, no database — Cloudflare cache-eli, a VPS csak cache-miss-t szolgál ki.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || process.env.NITRO_PORT || 4100);
const ROOT = path.resolve(process.cwd(), ".output/public");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

function cacheControl(urlPath, ext) {
  if (urlPath === "/sw.js") return "public, max-age=0, must-revalidate";
  if (urlPath === "/build-id.txt" || urlPath === "/version.json") return "no-store";
  if (urlPath.startsWith("/assets/") || urlPath.startsWith("/_build/")) {
    return "public, max-age=31536000, immutable";
  }
  if (ext === ".html" || urlPath === "/" || !path.extname(urlPath)) {
    return "public, max-age=0, must-revalidate";
  }
  return "public, max-age=86400";
}

function safeJoin(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = decoded.replace(/^\/+/, "");
  const abs = path.resolve(ROOT, rel);
  if (!abs.startsWith(ROOT)) return null;
  return abs;
}

async function fileIfExists(filePath) {
  try {
    const info = await stat(filePath);
    if (info.isFile()) return filePath;
    if (info.isDirectory()) {
      const index = path.join(filePath, "index.html");
      const indexInfo = await stat(index);
      if (indexInfo.isFile()) return index;
    }
  } catch {
    return null;
  }
  return null;
}

async function resolveFile(urlPath) {
  const abs = safeJoin(urlPath);
  if (!abs) return null;
  const direct = await fileIfExists(abs);
  if (direct) return direct;
  if (!path.extname(abs)) {
    const asHtml = await fileIfExists(`${abs}.html`);
    if (asHtml) return asHtml;
  }
  return null;
}

async function shellFile() {
  return (
    (await fileIfExists(path.join(ROOT, "_shell.html"))) ||
    (await fileIfExists(path.join(ROOT, "index.html"))) ||
    (await fileIfExists(path.join(ROOT, "offline.html")))
  );
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`).pathname;
    let file = await resolveFile(urlPath);
    let status = 200;
    if (!file) {
      const accept = req.headers.accept || "";
      if (req.method === "GET" && (accept.includes("text/html") || urlPath === "/")) {
        file = await shellFile();
      }
      if (!file) {
        res.writeHead(404, { "cache-control": "no-store" });
        res.end("Not found");
        return;
      }
      status = accept.includes("text/html") ? 200 : 404;
      if (urlPath === "/") status = 200;
    }

    const ext = path.extname(file).toLowerCase();
    const headers = {
      "content-type": MIME[ext] || "application/octet-stream",
      "cache-control": cacheControl(urlPath, ext),
    };
    if (urlPath === "/sw.js") headers["service-worker-allowed"] = "/";

    const body = await readFile(file);
    res.writeHead(status, headers);
    res.end(body);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "cache-control": "no-store" });
    res.end("Internal error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`szcenario static origin ${HOST}:${PORT} → ${ROOT}`);
});
