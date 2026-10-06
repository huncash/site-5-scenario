/**
 * Bill API útvonalak — static-origin / nginx / Vite ugyanerre a mintára proxyz.
 * GET /api/billing/* ne essen SPA index.html-be.
 */

export function isBillApiPath(urlPath) {
  const p = String(urlPath || "").split("?")[0];
  return p === "/api" || p.startsWith("/api/");
}

/** /api/billing mindig; egyéb /api/* csak a bill hoston. */
export function shouldProxyBillApi(urlPath, siteKey = "") {
  const p = String(urlPath || "").split("?")[0];
  if (p === "/api/billing" || p.startsWith("/api/billing/")) return true;
  return siteKey === "bill" && isBillApiPath(p);
}
