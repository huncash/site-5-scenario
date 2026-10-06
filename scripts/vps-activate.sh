#!/usr/bin/env bash
set -euo pipefail

SITE_SLUG="${SITE_SLUG:-szcenario}"
APP_DIR="${APP_DIR:-/var/www/$SITE_SLUG}"
SHA="${1:-}"
if [ -z "$SHA" ]; then
  echo "usage: vps-activate.sh <sha>"
  exit 1
fi

RELEASE_DIR="$APP_DIR/releases/$SHA"
ENVF="$APP_DIR/shared/.env.production"
LOG_DIR="/var/log/$SITE_SLUG"
PORT_N=5100
CURRENT_USER="$(whoami)"

need() {
  if [ ! -e "$1" ]; then
    echo "missing $1"
    ls -la "$(dirname "$1")" || true
    exit 1
  fi
  echo "ok $1"
}

ss_5100() {
  ss -tlnH 2>/dev/null | awk '{print $4}' | grep -E ":${PORT_N}$" || true
}

dump_logs() {
  echo "==== listen ===="
  ss -tulpn 2>/dev/null | grep -E ":${PORT_N}([^0-9]|$)" || true
  echo "==== fuser ===="
  fuser -v "${PORT_N}/tcp" 2>&1 || true
  echo "==== curl :${PORT_N} ===="
  curl -sS -D- --max-time 2 "http://127.0.0.1:${PORT_N}/" | head -n 20 || true
  echo "==== pm2 list ===="
  pm2 list || true
  echo "==== $SITE_SLUG logs ===="
  tail -n 80 \
    "$LOG_DIR/err.log" "$LOG_DIR/err-0.log" \
    "$LOG_DIR/out.log" "$LOG_DIR/out-0.log" 2>/dev/null || true
}

kill_pids() {
  local pid
  for pid in "$@"; do
    [ -n "$pid" ] || continue
    echo ">> kill -9 $pid"
    kill -9 "$pid" >/dev/null 2>&1 || true
  done
}

kill_own_5100() {
  local pids pid cmdline cwd attempt=1
  while [ $attempt -le 5 ]; do
    pids="$(fuser "${PORT_N}/tcp" 2>/dev/null || true)"
    if [ -z "$pids" ] && [ -z "$(ss_5100)" ]; then
      break
    fi
    echo ">> cleanup attempt $attempt: fuser ${PORT_N}: ${pids:-none}"

    fuser -k "${PORT_N}/tcp" >/dev/null 2>&1 || true

    if command -v lsof >/dev/null 2>&1; then
      lsof -t -iTCP:"$PORT_N" -sTCP:LISTEN 2>/dev/null | xargs -r kill -9 >/dev/null 2>&1 || true
    fi

    for pid in $(pgrep -u "$CURRENT_USER" -x node || true); do
      cmdline="$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || true)"
      cwd="$(readlink "/proc/$pid/cwd" 2>/dev/null || true)"
      case "$cmdline $cwd" in
        *static-origin.mjs*|*"/.output/server/index.mjs"*|*signaling-server.js*|*"/var/www/$SITE_SLUG"*)
          echo ">> force kill node $pid"
          kill -9 "$pid" >/dev/null 2>&1 || true
          ;;
      esac
    done

    sleep 1
    attempt=$((attempt + 1))
  done
}

delete_pm2_5100() {
  pm2 kill >/dev/null 2>&1 || true
}

point_nginx_5100() {
  echo ">> nginx proxy_pass 4100 → 5100 (5110 bill API marad)"
  local f patched=0
  if sudo -n grep -rlE '127.0.0.1:4100' /etc/nginx >/tmp/nginx-ports.txt 2>/dev/null; then
    while IFS= read -r f; do
      [ -n "$f" ] || continue
      echo ">> patch $f"
      sudo -n sed -i 's/127\.0\.0\.1:4100/127.0.0.1:5100/g' "$f"
      patched=1
    done < /tmp/nginx-ports.txt
  fi
  if [ "$patched" -eq 1 ]; then
    sudo -n nginx -t
    sudo -n systemctl reload nginx
    echo ">> nginx reloaded"
    sudo -n grep -n 'proxy_pass' /etc/nginx/sites-enabled/* 2>/dev/null || true
    return 0
  fi
  echo ">> nginx: nincs 4100, vagy a deploy user nem irhatja /etc/nginx-et"
  echo "ROOT, EGYSZER (SPA 5100, bill /api 5110):"
  echo "  # deploy/nginx/szcenario.conf → /etc/nginx/sites-available/szcenario.hu"
  echo "  sudo nginx -t && sudo systemctl reload nginx"
  echo "  curl -sS -H 'Host: school.szcenario.hu' http://127.0.0.1:5100/ | head"
  echo "  curl -sS -H 'Host: bill.szcenario.hu' http://127.0.0.1:5110/api/billing/config | head"
  return 0
}

echo ">> activate $SHA"
need "$RELEASE_DIR/ecosystem.config.cjs"
need "$RELEASE_DIR/.output/server/index.mjs"
need "$RELEASE_DIR/BUILD_SHA"
grep -qx "$SHA" "$RELEASE_DIR/BUILD_SHA"
need "$RELEASE_DIR/.output/public/build-id.txt"
grep -qx "$SHA" "$RELEASE_DIR/.output/public/build-id.txt"
need "$RELEASE_DIR/scripts/static-origin.mjs"
need "$RELEASE_DIR/scripts/bill-api-path.mjs"
need "$RELEASE_DIR/.output/public"
need "$RELEASE_DIR/.output/bill-server.mjs"

echo ">> pm2 kill + free $PORT_N"
delete_pm2_5100
kill_own_5100
busy="$(ss_5100)"
if [ -n "$busy" ]; then
  echo "port $PORT_N still busy after cleanup"
  echo "$busy"
  dump_logs
  exit 1
fi
echo ">> port $PORT_N free"

echo ">> ensure $ENVF"
mkdir -p "$APP_DIR/shared" "$APP_DIR/shared/bill-data" "$LOG_DIR"
if [ ! -f "$ENVF" ]; then
  echo ">> creating $ENVF"
  printf '%s\n' 'NODE_ENV=production' 'HOST=127.0.0.1' 'PORT=5100' > "$ENVF"
  chmod 600 "$ENVF" || true
fi
if grep -q '^PORT=' "$ENVF"; then
  sed -i 's/^PORT=.*/PORT=5100/' "$ENVF" || true
else
  printf '\nPORT=5100\n' >> "$ENVF"
fi
echo ">> ls shared"
ls -la "$APP_DIR/shared/"
need "$ENVF"

set -a
# shellcheck disable=SC1091
. "$ENVF"
set +a
export NODE_ENV="${NODE_ENV:-production}"
export HOST="${HOST:-127.0.0.1}"
export PORT=5100
export STATIC_ROOT="$RELEASE_DIR/.output/public"
export BUILD_SHA="$SHA"
export RELEASE_DIR
export SITE_SLUG
export APP_DIR
export BILL_ENV_FILE="$ENVF"

need_key() {
  local name="$1"
  eval "local v=\${$name:-}"
  if [ -z "$v" ]; then
    echo "[bill] POKA-YOKE: $name hiányzik $ENVF-ből"
    return 1
  fi
  return 0
}
bill_keys_ok=1
need_key SZAMLAZZ_AGENT_KEY || bill_keys_ok=0
need_key BARION_POS_KEY || need_key BARION_POSKEY || bill_keys_ok=0
if [ "$bill_keys_ok" -ne 1 ]; then
  echo "[bill] Tedd a kulcsokat ide (chmod 600), aztán újra activate:"
  echo "  $ENVF"
  echo "  SZAMLAZZ_AGENT_KEY=..."
  echo "  SZAMLAZZ_SANDBOX=false"
  echo "  BARION_POS_KEY=..."
  echo "  BARION_ENV=prod"
fi

ln -sfn "$ENVF" "$RELEASE_DIR/.env"
ln -sfnT "$RELEASE_DIR" "$APP_DIR/current"
echo "current=$(readlink -f "$APP_DIR/current")"

echo ">> pm2 start PORT=$PORT HOST=$HOST STATIC_ROOT=$STATIC_ROOT"
pm2 start "$RELEASE_DIR/ecosystem.config.cjs" --update-env
pm2 save

echo ">> wait health"
health_ok=0
for i in $(seq 1 20); do
  if curl -fsS --max-time 2 "http://127.0.0.1:${PORT}/healthz" | tee /tmp/healthz.txt; then
    health_ok=1
    break
  fi
  echo "healthz try $i"
  sleep 1
done
if [ "$health_ok" -ne 1 ]; then
  echo "healthz failed"
  dump_logs
  exit 1
fi

echo ">> pm2 describe"
pm2 describe "$SITE_SLUG" | tee /tmp/pm2-szcenario.txt
if ! grep -q "online" /tmp/pm2-szcenario.txt; then
  dump_logs
  exit 1
fi
pm2 describe "$SITE_SLUG" | grep -E "exec cwd|script path" | tee /tmp/pm2-cwd.txt
if ! grep -qE "$RELEASE_DIR|$APP_DIR/current" /tmp/pm2-cwd.txt; then
  echo "pm2 cwd mismatch"
  cat /tmp/pm2-cwd.txt
  dump_logs
  exit 1
fi

echo ">> curl health"
if ! curl -fsS --max-time 8 "http://127.0.0.1:${PORT}/build-id.txt" | tee /tmp/build-id.txt; then
  dump_logs
  exit 1
fi
grep -qx "$SHA" /tmp/build-id.txt
if ! curl -fsS --max-time 8 "http://127.0.0.1:${PORT}/version.json" | tee /tmp/version.json; then
  dump_logs
  exit 1
fi
grep -q "$SHA" /tmp/version.json

echo ">> school Host probe"
curl -sS -D- --max-time 8 -H "Host: school.szcenario.hu" "http://127.0.0.1:${PORT}/" | head -n 16 || true

echo ">> wait bill API :5110"
bill_ok=0
for i in $(seq 1 20); do
  if curl -sS --max-time 2 "http://127.0.0.1:5110/api/billing/config" | grep -q '{'; then
    bill_ok=1
    break
  fi
  echo "bill config try $i"
  sleep 1
done
if [ "$bill_ok" -ne 1 ]; then
  echo "bill API failed"
  pm2 describe bill-app || true
  tail -n 80 "$LOG_DIR/bill-err.log" "$LOG_DIR/bill-out.log" 2>/dev/null || true
  dump_logs
  exit 1
fi
curl -sS --max-time 4 "http://127.0.0.1:5110/api/billing/config" | tee /tmp/bill-config.json
echo ">> bill Host /api via static-origin"
curl -sS -D- --max-time 4 -H "Host: bill.szcenario.hu" "http://127.0.0.1:${PORT}/api/billing/config" | head -n 20 || true

echo ">> nginx → 5100"
point_nginx_5100

echo ">> prune old releases"
cd "$APP_DIR/releases"
ls -t | tail -n +6 | xargs -r rm -rf
echo ">> deploy ok $SHA"
