/**
 * Host → site kulcs (static-origin „middleware”).
 * A böngésző oldali párja: src/lib/siteSurface.ts
 */

export const SITE_KEYS = ["main", "support", "docs", "blog", "bill", "app"];

/**
 * @param {string} hostname
 * @param {string | number} [port]
 * @returns {"main" | "support" | "docs" | "blog" | "bill" | "app"}
 */
export function resolveSiteKey(hostname, port = "") {
  const h = String(hostname || "")
    .toLowerCase()
    .split(":")[0]
    .trim();
  const p = String(port || "");

  if (h === "app.szcenario.hu" || h.startsWith("app.")) return "app";
  if (h === "bill.szcenario.hu" || h.startsWith("bill.") || (isLocal(h) && p === "5110")) return "bill";
  if (h === "support.szcenario.hu" || h.startsWith("support.") || (isLocal(h) && p === "5120")) {
    return "support";
  }
  if (h === "docs.szcenario.hu" || h.startsWith("docs.") || (isLocal(h) && p === "5121")) return "docs";
  if (h === "blog.szcenario.hu" || h.startsWith("blog.") || (isLocal(h) && p === "5122")) return "blog";

  const forced = String(process.env.SITE_KEY || "").toLowerCase();
  if (forced === "support" || forced === "docs" || forced === "blog") return forced;

  return "main";
}

/**
 * @param {string} siteKey
 * @param {string} mainRoot absolute path to .output/public
 */
export function resolveSiteRoot(siteKey, mainRoot) {
  if (!siteKey || siteKey === "main" || siteKey === "app" || siteKey === "bill") {
    return mainRoot;
  }
  return `${String(mainRoot).replace(/[/\\]+$/, "")}/sites/${siteKey}`;
}

function isLocal(hostname) {
  return /^(localhost|127\.0\.0\.1)$/.test(hostname);
}
