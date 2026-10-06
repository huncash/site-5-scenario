# VPS deploy — site-5 (szcenario.hu, port 5100)

**Forrásmappa:** `C:\Users\patri\DEVELOPMENT\dev\fuszer-platform\vendor\mesh-data-manager-fuszer`  
GitHub repo: `site-5-scenario`. VPS: `/var/www/szcenario`, PM2 `szcenario`, port **5100**.  
Bill / support / docs / blog: ugyanaz a **5100** static-origin (Host → `sites/bill` tesztoldal, `sites/support`, …). Local support: **5120**, signaling: **5130**.

Aldomain nginx:
- `deploy/nginx/szcenario.conf` (kanonikus HTTPS) — `bill.szcenario.hu` és apex / `*.szcenario.hu` → **:5100**
- `deploy/nginx/szcenario.http-first.conf` — ugyanaz port-szétválasztás HTTP-n (cert előtt)
- `deploy/nginx/szcenario.subdomains.conf` — named `support` / `docs` / `blog` / `app` → `:5100`

Exact `bill.*` mindig megelőzi a `*.szcenario.hu` wildcardot → nincs offlinebiztonsag.hu fallback.  
Cloudflare / DNS: ezeknek a VPS-re kell mutatniuk (ne idegen Next.js originre), különben `/ticket` 404 marad.

A site-1–4 menete: DNS → GitHub repo + `VPS_SSH_KEY` → `main` push → Actions (nginx/PM2).  
A jegyzettömbös kulcs a **GitHub secret**, nem Windows `ssh -i`. A Cursor terminaljába semmit se másolj.

---

## 0. DNS — kész, ha az nslookup a VPS IP-t adja

Extra A (pl. `80.249.168.154`) a dima zónában törlendő. Maradjon csak `195.228.152.141` + az AAAA.

---

## 1. GitHub repo + secret — böngésző (NEM terminál)

1. github.com → **New repository** → név: `site-5-scenario` → **Private**.
2. **Settings → Secrets and variables → Actions → New repository secret**.
3. Név pontosan: `VPS_SSH_KEY`.
4. Érték: a `C:\Users\patri\Desktop\B\GITHUB UJ MINDEGYIKRE.txt` **egész** tartalma (`BEGIN`…`END`). Ugyanaz, mint a többi site secretje.
5. Más secret nem kell.

A kulcsot chatbe / Cursorba ne illeszd.

---

## 2. Első push — a mesh-data-manager-fuszer PowerShell (NEM Cursor)

Ha a promptod már `...\vendor\mesh-data-manager-fuszer>`, ide. A `CSERÉLD_A_USERED` = a site-1–4 GitHub user/org.

```powershell
git init
git branch -M main
git add .
git commit -m "site-5-scenario: VPS nginx + PM2 5100 + GitHub deploy"
git remote add origin https://github.com/CSERÉLD_A_USERED/site-5-scenario.git
git push -u origin main
```

**Actions → Deploy to VPS** — várd meg a zöldet. A workflow a `deploy` userrel másol a VPS-re (ahogy a site-1–4-nél).

---

## 3. nginx + mappák (egyszer) — nem Windows SSH

Ez a site-1–4-nél is **root** volt, nem a jegyzettömbös kulcs Windows-on.

Nyisd **ugyanazt**, amivel a többi site első nginxét csináltad (atlasz Shell / dima VPS konzol / PuTTY / WSL). Ha a prompt `root@...`, oda:

```bash
mkdir -p /var/www/szcenario/{releases,shared,incoming}
mkdir -p /var/log/szcenario /var/www/letsencrypt
chown -R deploy:deploy /var/www/szcenario /var/log/szcenario
printf '%s\n' 'NODE_ENV=production' 'HOST=127.0.0.1' 'PORT=5100' \
  'SZAMLAZZ_SANDBOX=false' 'BARION_ENV=prod' \
  'SZAMLAZZ_AGENT_KEY=' 'BARION_POS_KEY=' \
  > /var/www/szcenario/shared/.env.production
chmod 600 /var/www/szcenario/shared/.env.production
chown deploy:deploy /var/www/szcenario/shared/.env.production
# A két kulcsot töltsd ki — enélkül a bill API 503-at ad.
```

A `szcenario.http-first.conf` / `szcenario.conf` a repo `deploy/nginx/` alatt van. Rooton:

```bash
# HTTP port-szétválasztás (bill→5110, minden más→5100) — másold a http-first tartalmat:
# /etc/nginx/sites-available/szcenario.hu
ln -sf /etc/nginx/sites-available/szcenario.hu /etc/nginx/sites-enabled/szcenario.hu
nginx -t && systemctl reload nginx

# Cert (apex + www + bill). Named aldomainekhez told meg: -d support… -d app…
sudo certbot --nginx -d szcenario.hu -d www.szcenario.hu -d bill.szcenario.hu

# Cert után a kanonikus HTTPS: szcenario.conf tartalma → sites-available/szcenario.hu
nginx -t && systemctl reload nginx
```

Wildcard `*.szcenario.hu` SSL-hez DNS-01 (Cloudflare API) kell; 1–2 aldomainnél elég a `-d` bővítés.  
Windows `ssh -i` jegyzettömbből **nem** a bevált út.

---

## 4. Ellenőrzés — böngésző

`https://szcenario.hu` — várt: az app. GitHub Actions log, ha 502: a 3. lépés (mappa + nginx) még hiányzik.
