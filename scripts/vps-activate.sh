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

first_pid_5100() {
  sudo fuser "${PORT_N}/tcp" 2>/dev/null | tr -s '[:space:]' '\n' | grep -E '^[0-9]+$' | head -n1 || true
}

dump_holder() {
  local pid="$1"
  [ -n "$pid" ] || return 0
  echo "==== holder pid=$pid ===="
  ps -o user,ppid,pid,cmd -p "$pid" 2>/dev/null || true
  echo "cmdline=$(sudo tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || true)"
  echo "cwd=$(sudo readlink "/proc/$pid/cwd" 2>/dev/null || true)"
  echo "cgroup=$(sudo tr '\n' ' ' < "/proc/$pid/cgroup" 2>/dev/null || true)"
}

dump_logs() {
  echo "==== listen ===="
  ss -tulpn 2>/dev/null | grep -E ":${PORT_N}([^0-9]|$)" || true
  echo "==== fuser ===="
  sudo fuser -v "${PORT_N}/tcp" 2>&1 || true
  dump_holder "$(first_pid_5100)"
  echo "==== curl :${PORT_N} ===="
  curl -sS -D- --max-time 2 "http://127.0.0.1:${PORT_N}/" | head -n 20 || true
  echo "==== pm2 list ===="
  pm2 list || true
  echo "==== $SITE_SLUG logs ===="
  tail -n 80 \
    "$LOG_DIR/err.log" "$LOG_DIR/err-0.log" \
    "$LOG_DIR/out.log" "$LOG_DIR/out-0.log" 2>/dev/null || true
}

run_as() {
  local user="$1"
  local cmd="$2"
  sudo -u "$user" bash -lc "$cmd"
}

stop_owner_pm2() {
  local owner="$1"
  local name
  echo ">> $owner pm2 list"
  run_as "$owner" "pm2 list" || true
  run_as "$owner" "pm2 delete $SITE_SLUG" || true
  run_as "$owner" "pm2 delete site-5" || true
  run_as "$owner" "pm2 jlist" > /tmp/pm2-owner.json 2>/dev/null || true
  if [ -s /tmp/pm2-owner.json ]; then
    node -e '
      let apps = [];
      try { apps = JSON.parse(require("fs").readFileSync("/tmp/pm2-owner.json", "utf8")); } catch (e) { process.exit(0); }
      for (const a of apps) {
        const env = a.pm2_env || {};
        const port = String(env.PORT || (env.env && env.env.PORT) || "");
        const script = String(env.pm_exec_path || "");
        const cwd = String(env.pm_cwd || "");
        if (port === "5100" || /szcenario|static-origin|\.output\/server/.test(script + " " + cwd)) {
          console.log(a.name);
        }
      }
    ' | while read -r name; do
      [ -n "$name" ] || continue
      echo ">> $owner pm2 delete $name"
      run_as "$owner" "pm2 delete $name" || true
    done
    run_as "$owner" "pm2 save" || true
  fi
}

stop_cgroup_unit() {
  local pid="$1"
  local unit
  unit="$(sudo tr '\n' '/' < "/proc/$pid/cgroup" 2>/dev/null | grep -oE '[^/]+\.service' | grep -vE '^user@[0-9]+\.service$' | grep -v '^init.scope$' | tail -n1 || true)"
  if [ -n "$unit" ]; then
    echo ">> systemctl stop $unit"
    sudo systemctl stop "$unit" || true
  fi
}

free_5100() {
  local pid owner uid
  pm2 delete "$SITE_SLUG" >/dev/null 2>&1 || true
  pm2 delete site-5 >/dev/null 2>&1 || true

  pid="$(first_pid_5100)"
  if [ -z "$pid" ] && [ -z "$(ss_5100)" ]; then
    echo ">> port $PORT_N already free"
    return 0
  fi
  dump_holder "$pid"

  owner="$(ps -o user= -p "$pid" 2>/dev/null | awk '{print $1}')"
  echo ">> 5100 owner=${owner:-unknown} pid=$pid"
  if [ -n "$owner" ] && [ "$owner" != "deploy" ] && [ "$owner" != "$(id -un)" ]; then
    stop_owner_pm2 "$owner"
    uid="$(id -u "$owner" 2>/dev/null || true)"
    if [ -n "$uid" ] && [ -d "/run/user/$uid" ]; then
      sudo -u "$owner" env XDG_RUNTIME_DIR="/run/user/$uid" \
        HOME="$(getent passwd "$owner" | cut -d: -f6)" \
        systemctl --user stop "$SITE_SLUG" >/dev/null 2>&1 || true
    fi
  fi
  stop_cgroup_unit "$pid"

  sleep 1
  pid="$(first_pid_5100)"
  if [ -n "$pid" ]; then
    echo ">> leftover kill $pid"
    sudo kill -9 "$pid" >/dev/null 2>&1 || true
    sudo fuser -k "${PORT_N}/tcp" >/dev/null 2>&1 || true
    sleep 1
  fi
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

echo ">> free $PORT_N (stop supervisor, not just pid)"
free_5100
busy="$(ss_5100)"
if [ -n "$busy" ]; then
  echo "port $PORT_N still busy"
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
echo ">> ls shared"
ls -la "$APP_DIR/shared/"
need "$ENVF"
if grep -q '^PORT=' "$ENVF"; then
  sed -i 's/^PORT=.*/PORT=5100/' "$ENVF"
else
  printf '\nPORT=5100\n' >> "$ENVF"
fi

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
