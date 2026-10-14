/** Nyilvános apex `/` — ideiglenes főoldal. Az eredeti SPA nginx auth mögött marad. */

export const PUBLIC_HOME_GATE_HTML = `<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>szcenario.hu</title>
  <style>
    html,body{margin:0;min-height:100%;background:#f4f0ea;color:#1c1916;
      font-family:Georgia,"Times New Roman",serif;}
    main{min-height:100vh;display:flex;flex-direction:column;align-items:center;
      justify-content:center;gap:1.15rem;padding:2rem;text-align:center;}
    h1{margin:0;font-size:1.05rem;font-weight:400;letter-spacing:.14em;}
    p{margin:0;font-size:1.35rem;font-weight:400;}
  </style>
</head>
<body>
  <main>
    <h1>szcenario.hu</h1>
    <p>Fejlesztés alatt</p>
  </main>
</body>
</html>
`;

export function publicHomeGateEnabled(env = process.env) {
  const v = String(env.PUBLIC_HOME_GATE ?? "1").trim().toLowerCase();
  return v !== "0" && v !== "false" && v !== "off";
}

/**
 * Csak a nyilvános apex főoldal. app/bill/support Host → az eredeti felület (nginx zárja).
 * @param {string} urlPath
 * @param {string} hostname
 */
export function shouldServePublicHomeGate(urlPath, hostname, env = process.env) {
  if (!publicHomeGateEnabled(env)) return false;
  const pathOnly = String(urlPath || "/").split("?")[0];
  if (pathOnly !== "/" && pathOnly !== "/index.html") return false;
  const h = String(hostname || "")
    .toLowerCase()
    .split(":")[0]
    .trim();
  if (!h || h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0") return true;
  if (h === "szcenario.hu" || h === "www.szcenario.hu") return true;
  return false;
}
