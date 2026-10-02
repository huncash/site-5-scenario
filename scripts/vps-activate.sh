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

need() {
  if [ ! -e "$1" ]; then
    echo "missing $1"
    ls -la "$(dirname "$1")" || true
    exit 1
  fi
  echo "ok $1"
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

mkdir -p "$APP_DIR/shared" /var/log/"$SITE_SLUG"

if [ ! -f "$ENVF" ]; then
  echo ">> creating $ENVF"
  printf '%s\n' 'NODE_ENV=production' 'HOST=127.0.0.1' 'PORT=4100' > "$ENVF"
  chmod 600 "$ENVF" || true
fi
need "$ENVF"

ln -sfn "$ENVF" "$RELEASE_DIR/.env"
ln -sfnT "$RELEASE_DIR" "$APP_DIR/current"
echo "current=$(readlink -f "$APP_DIR/current")"

echo ">> pm2 delete"
pm2 delete site-5 >/dev/null 2>&1 || true
pm2 delete "$SITE_SLUG" >/dev/null 2>&1 || true
sleep 1
if command -v fuser >/dev/null 2>&1; then
  fuser -k 4100/tcp >/dev/null 2>&1 || true
fi

echo ">> source env"
set -a
# shellcheck disable=SC1091
. "$ENVF"
set +a
export NODE_ENV="${NODE_ENV:-production}"
export HOST="${HOST:-127.0.0.1}"
export PORT="${PORT:-4100}"
export STATIC_ROOT="$RELEASE_DIR/.output/public"
export RELEASE_DIR
export SITE_SLUG

echo ">> pm2 start PORT=$PORT HOST=$HOST STATIC_ROOT=$STATIC_ROOT"
pm2 start "$RELEASE_DIR/ecosystem.config.cjs" --update-env
pm2 save
sleep 3

echo ">> pm2 describe"
pm2 describe "$SITE_SLUG" | tee /tmp/pm2-szcenario.txt
if ! grep -q "online" /tmp/pm2-szcenario.txt; then
  echo "==== $SITE_SLUG err.log ===="
  tail -n 80 "/var/log/$SITE_SLUG/err.log" || true
  echo "==== $SITE_SLUG out.log ===="
  tail -n 80 "/var/log/$SITE_SLUG/out.log" || true
  exit 1
fi
pm2 describe "$SITE_SLUG" | grep -E "exec cwd|script path" | tee /tmp/pm2-cwd.txt
if ! grep -qE "$RELEASE_DIR|$APP_DIR/current" /tmp/pm2-cwd.txt; then
  echo "pm2 cwd mismatch"
  cat /tmp/pm2-cwd.txt
  exit 1
fi

echo ">> curl health"
curl -fsS --max-time 8 "http://127.0.0.1:4100/build-id.txt" | tee /tmp/build-id.txt
grep -qx "$SHA" /tmp/build-id.txt
curl -fsS --max-time 8 "http://127.0.0.1:4100/version.json" | tee /tmp/version.json
grep -q "$SHA" /tmp/version.json

echo ">> prune old releases"
cd "$APP_DIR/releases"
ls -t | tail -n +6 | xargs -r rm -rf
echo ">> deploy ok $SHA"
