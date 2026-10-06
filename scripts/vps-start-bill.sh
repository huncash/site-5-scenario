#!/usr/bin/env bash
# bill API → 127.0.0.1:5110. A SPA a 5100-as static-origin Host: bill.
set -euo pipefail

PORT="${BILL_PORT:-5110}"
PUBLIC_URL="${BILL_PUBLIC_URL:-https://bill.szcenario.hu}"
DATA_DIR="${BILL_DATA_DIR:-/var/www/szcenario/shared/bill-data}"

find_root() {
  local c
  for c in \
    "$(pm2 jlist 2>/dev/null | node -e '
      let s=""; process.stdin.on("data",d=>s+=d); process.stdin.on("end",()=>{
        const apps=JSON.parse(s||"[]");
        const a=apps.find(x=>x.name==="szcenario")||apps.find(x=>x.name==="site-5");
        if(a) process.stdout.write(a.pm2_env.pm_cwd||"");
      });
    ')" \
    /var/www/szcenario/current \
    /var/www/szcenario \
    /var/www/site-5
  do
    [ -n "${c:-}" ] || continue
    if [ -f "$c/.output/bill-server.mjs" ] || { [ -f "$c/package.json" ] && [ -f "$c/bill/server/index.ts" ]; }; then
      printf '%s\n' "$c"
      return 0
    fi
  done
  return 1
}

ROOT="$(find_root)" || {
  echo "Nincs bill modul. Keress .output/bill-server.mjs vagy bill/server/index.ts:"
  echo "  pm2 info szcenario | grep 'exec cwd'"
  echo "  ls /var/www/szcenario/current /var/www/szcenario /var/www/site-5"
  exit 1
}

echo ">> bill root=$ROOT"
cd "$ROOT"
mkdir -p "$DATA_DIR"

pm2 delete bill-app >/dev/null 2>&1 || true

if [ -f "$ROOT/.output/bill-server.mjs" ]; then
  echo ">> pm2 start .output/bill-server.mjs PORT=$PORT"
  BILL_PORT="$PORT" BILL_PUBLIC_URL="$PUBLIC_URL" BILL_DATA_DIR="$DATA_DIR" NODE_ENV=production \
    pm2 start "$ROOT/.output/bill-server.mjs" --name bill-app --cwd "$ROOT" --interpreter node
else
  if [ ! -d node_modules/tsx ]; then
    echo ">> npm ci (tsx kell a bill:start-hoz)"
    npm ci
  fi
  echo ">> bill:build"
  npm run bill:build
  echo ">> pm2 start bill:start PORT=$PORT"
  BILL_PORT="$PORT" BILL_PUBLIC_URL="$PUBLIC_URL" BILL_DATA_DIR="$DATA_DIR" NODE_ENV=production \
    pm2 start npm --name bill-app --cwd "$ROOT" -- run bill:start
fi
pm2 save

echo ">> listen $PORT"
ss -tlnH 2>/dev/null | awk '{print $4}' | grep -E ":${PORT}$" || {
  echo "5110 nem figyel"
  pm2 logs bill-app --lines 40 --nostream
  exit 1
}

code="$(curl -sS -o /tmp/bill-health.json -w '%{http_code}' --max-time 4 "http://127.0.0.1:${PORT}/api/billing/config" || true)"
echo ">> curl :$PORT/api/billing/config → $code"
if [ "$code" != "200" ] && [ "$code" != "503" ]; then
  pm2 logs bill-app --lines 40 --nostream
  exit 1
fi
if ! grep -q '{' /tmp/bill-health.json; then
  echo "bill API nem JSON"
  cat /tmp/bill-health.json
  exit 1
fi
echo ">> ok $PUBLIC_URL /api/billing"
