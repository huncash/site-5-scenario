#!/usr/bin/env bash
# bill.szcenario.hu → 127.0.0.1:5110 — PM2 cwd a site-5 / szcenario gyökér, NEM $HOME.
set -euo pipefail

PORT="${BILL_PORT:-5110}"
PUBLIC_URL="${BILL_PUBLIC_URL:-https://bill.szcenario.hu}"

find_root() {
  local c
  for c in \
    "$(pm2 jlist 2>/dev/null | node -e '
      let s=""; process.stdin.on("data",d=>s+=d); process.stdin.on("end",()=>{
        const apps=JSON.parse(s||"[]");
        const a=apps.find(x=>x.name==="site-5")||apps.find(x=>x.name==="szcenario");
        if(a) process.stdout.write(a.pm2_env.pm_cwd||"");
      });
    ')" \
    /var/www/site-5 \
    /var/www/szcenario/current \
    /var/www/szcenario
  do
    [ -n "${c:-}" ] || continue
    if [ -f "$c/package.json" ] && [ -f "$c/bill/server/index.ts" ]; then
      printf '%s\n' "$c"
      return 0
    fi
  done
  return 1
}

ROOT="$(find_root)" || {
  echo "Nincs bill modul. Keress package.json + bill/server/index.ts:"
  echo "  pm2 info site-5 | grep 'exec cwd'"
  echo "  ls /var/www/site-5 /var/www/szcenario /var/www/szcenario/current"
  exit 1
}

echo ">> bill root=$ROOT"
cd "$ROOT"

if [ ! -d node_modules/tsx ]; then
  echo ">> npm ci (tsx kell a bill:start-hoz)"
  npm ci
fi

echo ">> bill:build"
npm run bill:build

pm2 delete bill-app >/dev/null 2>&1 || true

echo ">> pm2 start bill:start PORT=$PORT"
BILL_PORT="$PORT" BILL_PUBLIC_URL="$PUBLIC_URL" NODE_ENV=production \
  pm2 start npm --name bill-app --cwd "$ROOT" -- run bill:start
pm2 save

echo ">> listen $PORT"
ss -tlnH 2>/dev/null | awk '{print $4}' | grep -E ":${PORT}$" || {
  echo "5110 nem figyel"
  pm2 logs bill-app --lines 40 --nostream
  exit 1
}

code="$(curl -sS -o /tmp/bill-health.html -w '%{http_code}' --max-time 4 "http://127.0.0.1:${PORT}/" || true)"
echo ">> curl :$PORT → $code"
if [ "$code" != "200" ] && [ "$code" != "304" ]; then
  pm2 logs bill-app --lines 40 --nostream
  exit 1
fi
echo ">> ok $PUBLIC_URL"
