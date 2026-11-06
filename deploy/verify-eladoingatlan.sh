#!/bin/bash
# Gyors VPS ellenőrzés: eladoingatlan.szcenario.hu / :5140 friss-e.
# Használat: bash deploy/verify-eladoingatlan.sh
set -euo pipefail

SUB_DIR="${SUB_DIR:-/var/www/eladoingatlan}"
echo "=== BUILD_SHA ==="
cat "$SUB_DIR/BUILD_SHA" 2>/dev/null || echo "(nincs BUILD_SHA)"
echo "=== .next ==="
ls -la "$SUB_DIR/.next" 2>/dev/null | head -n 5 || echo "(nincs .next — build hiányzik)"
echo "=== PM2 ==="
pm2 describe eladoingatlan-szcenario 2>/dev/null | head -n 25 || echo "(nincs pm2 folyamat)"
echo "=== curl :5140 ==="
curl -sS -D- --max-time 15 http://127.0.0.1:5140/ -o /tmp/elado-check.html | head -n 15
grep -oiE 'vezetékes ivóvíz|Közművek|Börzsöny|faház|30\.700|31\.500' /tmp/elado-check.html | sort -u || true
echo "=== DONE ==="
