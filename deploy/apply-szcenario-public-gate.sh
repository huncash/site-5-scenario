#!/bin/bash
# Csak szcenario.hu. TILOS: site-1..4, vrgo.hu, 3000-3003.
set -euo pipefail

[[ "$(id -u)" -eq 0 ]] || { echo "root/sudo kell (nginx)"; exit 1; }

SRC="${1:-}"
if [[ -z "$SRC" || ! -d "$SRC/deploy/nginx" ]]; then
  echo "usage: $0 /path/to/mesh-data-manager-fuszer"
  exit 1
fi

for forbidden in vrgo.hu projektorlampacsere.hu offlinebiztonsag.hu rendezvenyarnyekolas.hu; do
  if [[ "$SRC" == *"$forbidden"* ]]; then
    echo "refusing: $forbidden"
    exit 1
  fi
done

install -d /etc/nginx/snippets
install -m 644 "$SRC/deploy/nginx/szcenario.proxy-params.inc" /etc/nginx/snippets/szcenario.proxy-params.inc
install -m 644 "$SRC/deploy/nginx/szcenario.conf" /etc/nginx/sites-available/szcenario.hu
if [[ -f /etc/nginx/sites-available/szcenario.subdomains ]]; then
  install -m 644 "$SRC/deploy/nginx/szcenario.subdomains.conf" /etc/nginx/sites-available/szcenario.subdomains
fi
if [[ -f /etc/nginx/sites-enabled/app.szcenario.hu || -f /etc/nginx/sites-available/app.szcenario.hu ]]; then
  install -m 644 "$SRC/deploy/nginx-app.szcenario.hu.conf" /etc/nginx/sites-available/app.szcenario.hu
fi

HT=/etc/nginx/htpasswd-szcenario
if [[ ! -f "$HT" ]]; then
  PASS="$(openssl rand -base64 18 | tr -d '/+=' | head -c 20)"
  HASH="$(openssl passwd -apr1 "$PASS")"
  printf 'owner:%s\n' "$HASH" > "$HT"
  chmod 640 "$HT"
  chown root:www-data "$HT" 2>/dev/null || chown root:root "$HT"
  echo "HTPASSWD_USER=owner"
  echo "HTPASSWD_PASS=$PASS"
else
  echo "HTPASSWD_EXISTS=$HT"
fi

nginx -t

# Ne nyúlj más vhostokhoz — csak reload.
systemctl reload nginx

CURRENT=/var/www/szcenario/current/scripts
if [[ -d "$CURRENT" ]]; then
  install -m 644 "$SRC/scripts/publicHomeGate.mjs" "$CURRENT/publicHomeGate.mjs"
  install -m 644 "$SRC/scripts/static-origin.mjs" "$CURRENT/static-origin.mjs"
  chown deploy:deploy "$CURRENT/publicHomeGate.mjs" "$CURRENT/static-origin.mjs" 2>/dev/null || true
fi

if command -v sudo >/dev/null && id deploy >/dev/null 2>&1; then
  sudo -u deploy bash -lc 'export HOME=/home/deploy; pm2 restart szcenario --update-env || true; pm2 save || true'
fi

echo "nginx_ok"
echo "DONE"
