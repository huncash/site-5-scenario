#!/bin/bash
# Egyben: build + PM2 + nginx (sudo kell a nginx részhez).
# Használat a VPS-en, deploy userként:
#   bash /var/www/eladoingatlan/src/deploy/vps-eladoingatlan-go-live.sh
# vagy ha a repo gyökér a SRC:
#   bash "$SRC/deploy/vps-eladoingatlan-go-live.sh"
set -euo pipefail

# TILOS: site-1..4, 3000–3003, pm2 kill, szcenario :5100.
APP_ROOT="${ELADOINGATLAN_APP:-/var/www/eladoingatlan}"
SRC="${1:-$APP_ROOT/src}"
APP="$SRC/eladoingatlan"

[[ -d "$APP" ]] || { echo "nincs eladoingatlan mappa: $APP"; exit 1; }
[[ -f "$APP/package.json" ]] || { echo "nincs package.json: $APP"; exit 1; }

sudo mkdir -p /var/log/eladoingatlan
sudo chown "$(id -un):$(id -gn)" /var/log/eladoingatlan

cd "$APP"
npm ci
npm run build

export HOME="${HOME:-/home/$(id -un)}"
if pm2 describe eladoingatlan-szcenario >/dev/null 2>&1; then
  pm2 restart eladoingatlan-szcenario --update-env
else
  ELADOINGATLAN_DIR="$APP" pm2 start "$APP/ecosystem.config.cjs"
fi
pm2 save

if [[ "$(id -u)" -eq 0 ]]; then
  bash "$SRC/deploy/apply-eladoingatlan.sh" "$SRC"
else
  sudo bash "$SRC/deploy/apply-eladoingatlan.sh" "$SRC"
fi

echo "curl_local=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5140/ || true)"
echo "DONE eladoingatlan.szcenario.hu"
