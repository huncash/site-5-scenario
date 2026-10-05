#!/usr/bin/env node
/**
 * Poka-Yoke DNS: school.szcenario.hu → éles VPS IPv4 (A rekord, Cloudflare proxy).
 * CNAME nem mutathat nyers IP-re, ezért A rekord kell.
 *
 * Env:
 *   CF_API_TOKEN   Zone.DNS Edit (kötelező)
 *   CF_ZONE_ID     opcionális; ha nincs, CF_ZONE_NAME alapján feloldás
 *   CF_ZONE_NAME   alapértelmezett: szcenario.hu
 *   SCHOOL_A_IP    alapértelmezett: 195.228.152.141
 *   SCHOOL_PROXIED true|false — alap: true (narancs felhő)
 *
 *   node scripts/cloudflare-school-dns.mjs
 */
const ZONE_NAME = process.env.CF_ZONE_NAME || "szcenario.hu";
const RECORD_NAME = "school";
const FQDN = `${RECORD_NAME}.${ZONE_NAME}`;
const IP = process.env.SCHOOL_A_IP || "195.228.152.141";
const PROXIED = String(process.env.SCHOOL_PROXIED ?? "true") !== "false";
const TOKEN = process.env.CF_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN || "";

if (!TOKEN) {
  console.error("Hiányzik CF_API_TOKEN (Cloudflare Zone.DNS Edit).");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const err = body.errors?.[0]?.message || res.statusText;
    throw new Error(`Cloudflare ${path}: ${err}`);
  }
  return body;
}

async function zoneId() {
  if (process.env.CF_ZONE_ID) return process.env.CF_ZONE_ID;
  const data = await cf(`/zones?name=${encodeURIComponent(ZONE_NAME)}`);
  const id = data.result?.[0]?.id;
  if (!id) throw new Error(`Nincs Cloudflare zóna: ${ZONE_NAME}`);
  return id;
}

async function findRecord(zid, type, name) {
  const data = await cf(
    `/zones/${zid}/dns_records?type=${type}&name=${encodeURIComponent(name)}`,
  );
  return data.result?.[0] ?? null;
}

async function upsertA(zid) {
  const existing = await findRecord(zid, "A", FQDN);
  const payload = {
    type: "A",
    name: RECORD_NAME,
    content: IP,
    ttl: 1,
    proxied: PROXIED,
    comment: "school.szcenario.hu → VPS (poka-yoke)",
  };
  if (!existing) {
    const created = await cf(`/zones/${zid}/dns_records`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { action: "created", id: created.result?.id };
  }
  const same =
    existing.content === IP && Boolean(existing.proxied) === PROXIED && existing.type === "A";
  if (same) return { action: "unchanged", id: existing.id };
  await cf(`/zones/${zid}/dns_records/${existing.id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return { action: "updated", id: existing.id };
}

const zid = await zoneId();
const result = await upsertA(zid);
console.log(
  JSON.stringify(
    {
      ok: true,
      fqdn: FQDN,
      type: "A",
      ip: IP,
      proxied: PROXIED,
      ...result,
      next: [
        "nginx: deploy/nginx/szcenario.subdomains.conf (school named vhost → :5100)",
        "cert: sudo certbot certonly --expand -d szcenario.hu -d school.szcenario.hu …",
        "curl -sS -H 'Host: school.szcenario.hu' http://127.0.0.1:5100/ | head",
      ],
    },
    null,
    2,
  ),
);
