# VPS deploy — site-5 (szcenario.hu, port 4100)

**Forrásmappa:** `C:\Users\patri\DEVELOPMENT\dev\fuszer-platform\vendor\mesh-data-manager-fuszer`  
GitHub repo: `site-5-scenario`. VPS: `/var/www/szcenario`, PM2 `szcenario`, port **4100**.

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
git commit -m "site-5-scenario: VPS nginx + PM2 4100 + GitHub deploy"
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
printf '%s\n' 'NODE_ENV=production' 'HOST=127.0.0.1' 'PORT=4100' > /var/www/szcenario/shared/.env.production
chmod 600 /var/www/szcenario/shared/.env.production
chown deploy:deploy /var/www/szcenario/shared/.env.production
```

A `szcenario.http-first.conf` / `szcenario.conf` a repo `deploy/nginx/` alatt van. Rooton, cert után:

```bash
# a fájlokat a VPS-re a repo/scp vagy kézi másolás után:
ln -sf /etc/nginx/sites-available/szcenario.hu /etc/nginx/sites-enabled/szcenario.hu
certbot certonly --webroot -w /var/www/letsencrypt \
  -d szcenario.hu -d www.szcenario.hu \
  --non-interactive --agree-tos -m sales@adp-top.hu
nginx -t && systemctl reload nginx
```

Ha nem emlékszel, honnan nyitottad a rootot a site-4-nél: írd meg (PuTTY / atlasz Shell / WSL) — arra adjuk a másolást. Windows `ssh -i` jegyzettömbből **nem** a bevált út.

---

## 4. Ellenőrzés — böngésző

`https://szcenario.hu` — várt: az app. GitHub Actions log, ha 502: a 3. lépés (mappa + nginx) még hiányzik.
