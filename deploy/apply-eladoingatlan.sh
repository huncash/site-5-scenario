#!/bin/bash
# Csak eladoingatlan.szcenario.hu → :5140.
# TILOS: site-1..4, vrgo.hu, 3000–3003, szcenario gate / :5100 rewrite.
set -euo pipefail

[[ "$(id -u)" -eq 0 ]] || { echo "root/sudo kell (nginx)"; exit 1; }

SRC="${1:-}"
if [[ -z "$SRC" || ! -f "$SRC/deploy/nginx/eladoingatlan.szcenario.conf" ]]; then
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
if [[ -f "$SRC/deploy/nginx/szcenario.proxy-params.inc" ]]; then
  install -m 644 "$SRC/deploy/nginx/szcenario.proxy-params.inc" /etc/nginx/snippets/szcenario.proxy-params.inc
fi

install -m 644 "$SRC/deploy/nginx/eladoingatlan.szcenario.conf" \
  /etc/nginx/sites-available/eladoingatlan.szcenario

ln -sfn /etc/nginx/sites-available/eladoingatlan.szcenario \
  /etc/nginx/sites-enabled/eladoingatlan.szcenario

# Régi/félkész HTTP-only fájlnév takarítás (ha nano-s vázlat volt)
if [[ -L /etc/nginx/sites-enabled/eladoingatlan.szcenario.conf ]]; then
  rm -f /etc/nginx/sites-enabled/eladoingatlan.szcenario.conf
fi

nginx -t
systemctl reload nginx

echo "nginx_ok eladoingatlan.szcenario.hu → 127.0.0.1:5140"
echo "DONE"
