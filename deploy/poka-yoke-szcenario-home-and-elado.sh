#!/bin/bash
# Poka-Yoke VPS: (1) téves site-5/:5140 le, (2) szcenario.hu Fejlesztés alatt,
# (3) eladoingatlan → :5140. TILOS: site-1..4, 3000–3003, pm2 kill, lokális törlés.
set -euo pipefail

TGZ="${ELADO_TGZ:-/tmp/eladoingatlan-deploy.tgz}"
APP=/var/www/eladoingatlan
SRC=$APP/src

echo "=== 1) Tisztítás: site-5 Nitro a :5140-en (ha van) ==="
pm2 delete site-5 2>/dev/null || true
# Ne töröld /var/www/szcenario — csak a téves PM2 név.
# /var/www/site-5: csak jelzés, nem rm -rf (Poka-Yoke: nincs vak törlés)
if [[ -d /var/www/site-5 ]]; then
  echo "NOTE: /var/www/site-5 megmarad a lemezen (nem töröljük vakon). PM2 site-5 leállítva."
fi

echo "=== 2) szcenario.hu — PUBLIC_HOME_GATE + static-origin ==="
# Ha a current release-ben megvan a gate script:
CURRENT=/var/www/szcenario/current
if [[ -d "$CURRENT/scripts" ]]; then
  if [[ -f /tmp/publicHomeGate.mjs ]]; then
    install -m 644 /tmp/publicHomeGate.mjs "$CURRENT/scripts/publicHomeGate.mjs" 2>/dev/null || \
      sudo -u deploy install -m 644 /tmp/publicHomeGate.mjs "$CURRENT/scripts/publicHomeGate.mjs" || true
  fi
fi
# PM2 szcenario: kapu be
if pm2 describe szcenario >/dev/null 2>&1; then
  PUBLIC_HOME_GATE=1 pm2 restart szcenario --update-env || true
  pm2 save || true
fi

echo "=== 2b) curl apex gate (helyi :5100) ==="
GATE_BODY=$(curl -s -H 'Host: szcenario.hu' http://127.0.0.1:5100/ | head -c 600 || true)
echo "$GATE_BODY" | head -c 300; echo
if echo "$GATE_BODY" | grep -q 'Fejlesztés alatt' && echo "$GATE_BODY" | grep -q 'szcenario.hu'; then
  echo "OK: Fejlesztés alatt kapu"
else
  echo "WARN: kapu szöveg nem egyértelmű a :5100-on — nginx/auth/release ellenőrzés kell"
fi

echo "=== 3) eladoingatlan → :5140 ==="
if [[ ! -f "$TGZ" ]]; then
  echo "HIÁNYZIK: $TGZ — előbb scp a helyi poka-yoke archívumot /tmp/eladoingatlan-deploy.tgz néven"
  exit 1
fi

sudo mkdir -p "$APP" /var/log/eladoingatlan
sudo chown -R "$(id -un):$(id -gn)" "$APP" /var/log/eladoingatlan
rm -rf "$SRC"
mkdir -p "$SRC"
tar -xzf "$TGZ" -C "$SRC"
# Archívum lehet 'eladoingatlan/' + 'deploy/' gyökerű
if [[ ! -d "$SRC/eladoingatlan" && -f "$SRC/package.json" ]]; then
  mkdir -p "$SRC/_wrap"
  # ha flat pack: mozgassuk eladoingatlan alá
  echo "WARN: flat layout — ellenőrizd a tarball szerkezetet"
fi
test -f "$SRC/eladoingatlan/package.json"
test -f "$SRC/deploy/vps-eladoingatlan-go-live.sh"

if [[ ! -f "$SRC/eladoingatlan/.env.production" ]]; then
  cat > "$SRC/eladoingatlan/.env.production" <<'EOF'
NODE_ENV=production
PORT=5140
SMTP_HOST=smtp.szcenario.hu
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=kisspatrikpetervr@gmail.com
SMTP_FROM=kisspatrikpetervr@gmail.com
SMTP_PASS=
RECIPIENT_ELADOINGATLAN=kisspatrikpetervr@gmail.com
EOF
fi

chmod +x "$SRC/deploy/"*.sh
bash "$SRC/deploy/vps-eladoingatlan-go-live.sh" "$SRC"

# Nginx HTTPS vhost (certbot dedikált cert)
if [[ -f "$SRC/deploy/nginx/eladoingatlan.szcenario.conf" ]]; then
  TMP=/tmp/eladoingatlan.nginx.conf
  sed 's|/etc/letsencrypt/live/szcenario.hu/|/etc/letsencrypt/live/eladoingatlan.szcenario.hu/|g' \
    "$SRC/deploy/nginx/eladoingatlan.szcenario.conf" > "$TMP"
  sudo install -d /etc/nginx/snippets
  sudo install -m 644 "$SRC/deploy/nginx/szcenario.proxy-params.inc" /etc/nginx/snippets/szcenario.proxy-params.inc
  sudo install -m 644 "$TMP" /etc/nginx/sites-available/eladoingatlan.szcenario
  sudo install -m 644 "$TMP" /etc/nginx/sites-available/eladoingatlan.szcenario.hu
  sudo ln -sfn /etc/nginx/sites-available/eladoingatlan.szcenario /etc/nginx/sites-enabled/eladoingatlan.szcenario
  sudo rm -f /etc/nginx/sites-enabled/eladoingatlan.szcenario.hu
  for f in /etc/nginx/sites-enabled/*; do
    base=$(basename "$f")
    case "$base" in eladoingatlan*) continue ;; esac
    if sudo grep -q 'eladoingatlan\.szcenario\.hu' "$f" 2>/dev/null; then
      sudo cp -a "$f" "${f}.bak-eladoingatlan-$(date +%Y%m%d%H%M%S)"
      sudo sed -i -E 's/[[:space:]]*eladoingatlan\.szcenario\.hu//g' "$f"
    fi
  done
  sudo nginx -t && sudo systemctl reload nginx
fi

echo "=== VERIFY ==="
pm2 ls | grep -E 'eladoingatlan|site-5|szcenario' || true
ELADO=$(curl -s http://127.0.0.1:5140/ | head -c 800 || true)
echo "$ELADO" | head -c 350; echo
if echo "$ELADO" | grep -qiE 'faház|Börzsöny|1046|ingatlan'; then
  echo "OK: eladoingatlan Next a :5140-en"
else
  echo "FAIL: :5140 nem az ingatlanoldal"
  exit 1
fi
echo "DONE"
