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

echo ">> activate $SHA"
need "$RELEASE_DIR/ecosystem.config.cjs"
need "$RELEASE_DIR/.output/server/index.mjs"
need "$RELEASE_DIR/BUILD_SHA"
grep -qx "$SHA" "$RELEASE_DIR/BUILD_SHA"
need "$RELEASE_DIR/.output/public/build-id.txt"
grep -qx "$SHA" "$RELEASE_DIR/.output/public/build-id.txt"
need "$RELEASE_DIR/scripts/static-origin.mjs"
need "$RELEASE_DIR/.output/public"

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
mkdir -p "$APP_DIR/shared" "$LOG_DIR"
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

echo ">> prune old releases"
cd "$APP_DIR/releases"
ls -t | tail -n +6 | xargs -r rm -rf
echo ">> deploy ok $SHA"
