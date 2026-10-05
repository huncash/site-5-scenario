/**
 * Lightweight static origin for .output/public (+ aldomain site rootok).
 * Host header alapján: support/docs/blog → sites/<key>, egyébként main.
 * SPA fallback: ismeretlen HTML útvonal → az adott site index.html-je (pl. /ticket).
 */
import { createServer, request as httpRequest } from "node:http";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveSiteKey, resolveSiteRoot } from "./site-hosts.mjs";

process.on("uncaughtException", (error) => {
  console.error("[static-origin] uncaughtException", error);
  process.exit(1);
});
process.on("unhandledRejection", (error) => {
  console.error("[static-origin] unhandledRejection", error);
  process.exit(1);
});

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RELEASE_ROOT = path.resolve(HERE, "..");

function resolvePort() {
  const raw = process.env.PORT || process.env.NITRO_PORT || "5100";
  const port = Number(raw);
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    console.error("[static-origin] érvénytelen PORT", { raw, cwd: process.cwd() });
    process.exit(1);
  }
  return port;
}

function resolveMainRoot() {
  const candidates = [
    process.env.STATIC_ROOT,
    path.resolve(process.cwd(), ".output/public"),
    path.resolve(RELEASE_ROOT, ".output/public"),
  ].filter(Boolean);
  for (const candidate of candidates) {
    const abs = path.resolve(candidate);
    if (existsSync(path.join(abs, "index.html")) || existsSync(path.join(abs, "_shell.html"))) {
      return abs;
    }
  }
  console.error("[static-origin] nincs statikus build", {
    cwd: process.cwd(),
    scriptDir: HERE,
    releaseRoot: RELEASE_ROOT,
    candidates,
  });
  process.exit(1);
}

const HOST = process.env.HOST || "127.0.0.1";
const PORT = resolvePort();
const MAIN_ROOT = resolveMainRoot();

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

function parseHostPort(req) {
  const raw = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  const hostOnly = raw.split(",")[0].trim().toLowerCase();
  const [hostname, headerPort] = hostOnly.split(":");
  return { hostname: hostname || "", port: headerPort || String(PORT) };
}

function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = decoded.replace(/^\/+/, "");
  const abs = path.resolve(root, rel);
  const relToRoot = path.relative(root, abs);
  if (relToRoot.startsWith("..") || path.isAbsolute(relToRoot)) return null;
  return abs;
}

async function readBuildId() {
  const direct = path.join(MAIN_ROOT, "build-id.txt");
  if (existsSync(direct)) return readFile(direct);
  if (process.env.BUILD_SHA) return Buffer.from(`${process.env.BUILD_SHA}\n`);
  const shaFile = path.join(RELEASE_ROOT, "BUILD_SHA");
  if (existsSync(shaFile)) return readFile(shaFile);
  return null;
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

async function resolveFile(root, urlPath) {
  const abs = safeJoin(root, urlPath);
  if (!abs) return null;
  const direct = await fileIfExists(abs);
  if (direct) return direct;
  if (!path.extname(abs)) {
    const asHtml = await fileIfExists(`${abs}.html`);
    if (asHtml) return asHtml;
  }
  return null;
}

async function shellFile(root) {
  return (
    (await fileIfExists(path.join(root, "_shell.html"))) ||
    (await fileIfExists(path.join(root, "index.html"))) ||
    (await fileIfExists(path.join(root, "offline.html")))
  );
}

const server = createServer(async (req, res) => {
  try {
    const { hostname, port } = parseHostPort(req);
    const siteKey = resolveSiteKey(hostname, port);
    const root = resolveSiteRoot(siteKey, MAIN_ROOT);
    const urlPath = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`).pathname;

    if (urlPath === "/mnb-rates") {
      const upstream = await fetch("http://www.mnb.hu/arfolyamok.asmx", {
        method: req.method || "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: "http://www.mnb.hu/webservices/MNBArfolyamServiceSoap/GetCurrentExchangeRates",
        },
        body:
          req.method === "GET"
            ? undefined
            : await new Promise((resolve, reject) => {
                const chunks = [];
                req.on("data", (c) => chunks.push(c));
                req.on("end", () => resolve(Buffer.concat(chunks)));
                req.on("error", reject);
              }),
      });
      const xml = await upstream.text();
      res.writeHead(upstream.ok ? 200 : upstream.status, {
        "content-type": "text/xml; charset=utf-8",
        "cache-control": "no-store",
      });
      res.end(xml);
      return;
    }
    if (urlPath === "/healthz") {
      res.writeHead(200, {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      });
      res.end(`ok ${HOST}:${PORT} site=${siteKey} root=${root}\n`);
      return;
    }
    if (urlPath === "/build-id.txt") {
      const body = await readBuildId();
      if (!body) {
        console.error("[static-origin] 404 /build-id.txt", { root: MAIN_ROOT, cwd: process.cwd() });
        res.writeHead(404, { "cache-control": "no-store" });
        res.end("Not found");
        return;
      }
      res.writeHead(200, {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      });
      res.end(body);
      return;
    }

    if (!existsSync(path.join(root, "index.html")) && !existsSync(path.join(root, "_shell.html"))) {
      console.error("[static-origin] site root missing", { siteKey, root, host: hostname });
      res.writeHead(503, {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      });
      res.end(`site unavailable: ${siteKey}\n`);
      return;
    }

    let file = await resolveFile(root, urlPath);
    let status = 200;
    if (!file) {
      const accept = req.headers.accept || "";
      const method = String(req.method || "GET").toUpperCase();
      const isDoc = method === "GET" || method === "HEAD";
      // SPA deep-link: /ticket, /gyik, /embed/* → site index (HEAD is, nginx/curl probe)
      const wantsSpa =
        isDoc && (accept.includes("text/html") || accept.includes("*/*") || urlPath === "/" || !path.extname(urlPath));
      if (wantsSpa) {
        file = await shellFile(root);
      }
      if (!file) {
        console.error("[static-origin] 404", { urlPath, siteKey, root });
        res.writeHead(404, { "cache-control": "no-store" });
        res.end("Not found");
        return;
      }
      status = accept.includes("text/html") || accept.includes("*/*") || !path.extname(urlPath) ? 200 : 404;
      if (urlPath === "/") status = 200;
    }

    const ext = path.extname(file).toLowerCase();
    const headers = {
      "content-type": MIME[ext] || "application/octet-stream",
      "cache-control": cacheControl(urlPath, ext),
      "x-szcenario-site": siteKey,
    };
    if (urlPath === "/sw.js") headers["service-worker-allowed"] = "/";

    const body = await readFile(file);
    res.writeHead(status, headers);
    res.end(body);
  } catch (error) {
    console.error("[static-origin] request failed", error);
    res.writeHead(500, { "cache-control": "no-store" });
    res.end("Internal error");
  }
});

server.on("error", (error) => {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  console.error("[static-origin] listen failed", { host: HOST, port: PORT, root: MAIN_ROOT, code, error });
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`[static-origin] ${HOST}:${PORT} → ${MAIN_ROOT}`);
  console.log(`[static-origin] sites: bill/support/docs/blog under ${path.join(MAIN_ROOT, "sites")}`);
  console.log(`[static-origin] build-id.txt=${existsSync(path.join(MAIN_ROOT, "build-id.txt"))}`);
});
