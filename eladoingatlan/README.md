# eladoingatlan.szcenario.hu

Lean Next.js listing site for the Kismaros–Börzsönyliget property. Lives under the Szcenárió project tree; runs on **port 5140** (separate from `vrgo.hu` / site-1 on 3000).

## Local

```bash
cd eladoingatlan
npm install
cp .env.example .env.local   # set RECIPIENT_ELADOINGATLAN + SMTP_*
npm run dev                  # http://localhost:5140
```

## Build notes

- Leaflet loads from **unpkg CDN** (no `leaflet` npm package, no marker PNG bundling).
- `images.unoptimized: true` avoids `sharp` / x86-64-v2 VPS crashes.
- Inbox addresses only in server env (`RECIPIENT_ELADOINGATLAN`).

## Nginx (sketch)

Proxy `eladoingatlan.szcenario.hu` → `http://127.0.0.1:5140` (see `../deploy/nginx/eladoingatlan.szcenario.conf`).
