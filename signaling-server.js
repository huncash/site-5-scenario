import http from "node:http";
import { WebSocketServer } from "ws";

const PORT = Number(process.env.SIGNALING_PORT ?? 5130);

const server = http.createServer((req, res) => {
  if (req.url === "/healthz") {
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end("ok");
    return;
  }
  res.writeHead(426, { "content-type": "text/plain; charset=utf-8" });
  res.end("WebSocket endpoint only.");
});

const wss = new WebSocketServer({ server });

function getSessionFromUrl(url) {
  try {
    const u = new URL(url ?? "/", "http://localhost");
    return u.searchParams.get("session") || "default";
  } catch {
    return "default";
  }
}

/** @type {Map<string, Set<import("ws").WebSocket>>} */
const sessions = new Map();

function sessionSet(id) {
  let set = sessions.get(id);
  if (!set) {
    set = new Set();
    sessions.set(id, set);
  }
  return set;
}

function broadcast(sessionId, sender, data) {
  const peers = sessions.get(sessionId);
  if (!peers) return;
  for (const ws of peers) {
    if (ws === sender) continue;
    if (ws.readyState !== ws.OPEN) continue;
    ws.send(data);
  }
}

wss.on("connection", (ws, req) => {
  const sessionId = getSessionFromUrl(req.url);
  sessionSet(sessionId).add(ws);

  ws.on("message", (data) => {
    // Clients are expected to forward WebRTC SDP/ICE payloads as-is (string or binary).
    broadcast(sessionId, ws, data);
  });

  ws.on("close", () => {
    const set = sessions.get(sessionId);
    if (!set) return;
    set.delete(ws);
    if (set.size === 0) sessions.delete(sessionId);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`[signaling] ws://0.0.0.0:${PORT} (health: /healthz)`);
});

