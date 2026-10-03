---
title: Kisközösségi válságkezelés — víz, LoRa mesh és közösségi melegedő
slug: kozossegi-civil-valsagkezeles
description: Helyi vízellátási krízis, offline LoRa hálózat és téli melegedő-bázis. Lean készlet, önkéntes logisztika, local-first döntéstámogatás.
tags: [közösség, víz, LoRa, mesh, melegedő, BCP, local-first]
---

# Kisközösségi és civil válságkezelés

Egy kistelepülésen vagy városrészben a közmű és a távközlés egyszerre tud elvékonyodni. A civil szervezet — polgárőrség, egyesület, önkéntes kör — ekkor nem „segít a hatóságnak a háttérből”, hanem **saját, számolható készletet és útvonalat** visz. Ez a lecke három egymásra épülő helyzetet jár körül: szennyezett vezetékes víz, áram- és távközlés-kiesés, extrém téli energetikai krízis.

A cél nem a riadó. A cél, hogy a következő 72 órában tudd: **kinek mennyi liter jár, hol van rádió, és melyik helyiség tartható melegen** a saját eszközeiden számolt korlátokból.

## Alapállapot / Helyzetlemez

### Helyi vízellátási krízis és lajtoskocsi-koordináció

A vezetékes ivóvíz mikrobiológiai szennyeződése egy településrészen azonnal két szűk keresztmetszetet nyit. Az egyik a **tiszta liter / fő / nap**. A másik a **kiszállítás ideje** az idős és mozgáskorlátozott háztartásokhoz. A hatósági lajtoskocsi ritkán elég: a civil kör a hiányzó utolsó kilométer. Ha nincs nyilvántartás, ugyanarra az utcára kétszer megy a kanna, a zsákutcában pedig senki.

A kihívás Lean nyelven: *muda* a felesleges kör, *mura* a hullámzó készlet, *muri* a túlterhelt önkéntes. A helyzetlemez csak akkor áll, ha literben, címben és időablakban látod a sort — nem „majd megoldjuk” hangulatban.

### Offline LoRa hálózati pont

Hosszabb áramszünet vagy mobiltorony-kiesés után a telefonos csoportok elhallgatnak. A lakossági segélyhívás és a belső infó — „a lajtos holnap 9-kor a templomnál” — nem fér el egyetlen megmaradt 4G-szigeten. A decentralizált, hordozható **LoRa mesh** nem internetpótló böngésző. Rövid, alacsony sávszélességű üzenet: riasztás, készlet, találkozó, állapot.

A kihívás: a node-ok akkumulátora, a rádióhorizont és a **ki beszél kinek**. Ha egyetlen „központi” laptopra teszed a hálózatot, ugyanazt a felhős egyetlen pontot hozod létre, csak rádióval.

### Közösségi melegedő és logisztikai bázis

Extrém téli energetikai krízisben a civil ház, könyvtár vagy gyülekezeti terem lehet az egyetlen fűthető pont. Ha mindent fűtesz, a tartalék órák alatt elfogy. Ha semmit, a kiszolgáltatott lakos kint marad. Ugyanez a helyszín gyakran a **segélyelosztó**: víz, takaró, gyógyszerlista, töltőpont.

A kihívás a zónázás. Egy meleg mag (tartózkodás), egy hűvös raktár (készlet), egy előtér (beléptetés). A kW és a liter ugyanarra a törzsre ül: hány fő, hány óra, mennyi üzemanyag vagy akkumulátor.

## A szcenárióban rejlő lehetőségek és potenciál

A három helyzet nem három külön „katasztrófa-játék”. Egy **helyi folytonossági váz**:

1. A víz literben mérhető. A lajtoskocsi üteme és a kannás kör **Resource Runway**.
2. A LoRa lefedettség **kommunikációs redundancia**. Ha a mesh él, a víz-kör nem vakrepülés.
3. A melegedő **energia-autonómia**: melyik helyiséget tartod, melyiket zárod.

A potenciál a döntési fában van. Optimista ág: a hatóság rendszeresen jön, a mesh tart, a melegedő 72 órát kibír. Realista: ritkább lajtos, részleges rádió, egy fűtött terem. Pesszimista: a tartály késik, a node lemerül, a ház kihűl — és ezt **előre látod**, nem a 36. órában.

A civil szervezet ezzel tervezhetővé válik. Nem több önkéntest ígér, hanem kevesebb pazarolt kört. A Master Baseline — létszám, készletnap, energia — egyszer rögzül. A szcenárió csak a változót mozgatja: szennyezés, szünet, fagy.

> **Tipp.** Először a pesszimista 72 órát számold. Aki a nehéz sávot is látja, az osztja a litert és a kW-ot. Aki csak a derűs ágat írja, az a második napon osztogat ígéretet.

## Pontos, gyakorlatias know-how

### 1. Vízkrízis — lajtoskocsi és háztartási kör

1. **Helyzetlemez egy lapon.** Településrész, becsült létszám, ebből mozgáskorlátozott / 70+ / csecsemős háztartás. Ivóvíz-cél: 3–4 liter/fő/nap ivásra és alapvető higiéniára; a mosás külön sáv, ne keverd.
2. **Készlet egysége.** Kannánként liter, nem „sok láda”. Minden bejövő lajtos tétel: időpont, liter, forrás (hatóság / kút / palack). Minden kimenő: cím vagy gyűjtőpont, liter, átvevő.
3. **Két kör, nem egy.** Gyűjtőpont a mobilaknak (templom, bolt, iskola). Házhoz csak a listán lévő, helyben maradó háztartások. A második kör a muda.
4. **Prioritás Lean triázzsal.** Először ivás és gyógyszerbevétel, aztán főzés, aztán higiénia. A kannát nem „igazságosan csepegteted szét”, hanem a létfontosságú kört tartod.
5. **Szennyezés határa.** A csapvizet tilosnak kezeled, amíg a vízmű fel nem oldja. Esővíz és kút csak **előszűrés + fertőtlenítés** után ivó; a nyers tartályt külön címkézed.

> **Tipp.** A nyilvántartás papír + vonalkód vagy sorszámozott cédula. Ha a telefonos táblázat eltűnik, a cédula a dokkon marad. Ugyanez a logika, mint a WMS-kieséses cross-dock BCP-nél: a fizikai sor a tartalék rendszer.

### 2. LoRa mesh — hordozható, nem központosított

1. **Három szerep.** *Átjátszó* (magas pont, tartós akku), *mozgó* (járőr, lajtoskísérő), *végpont* (melegedő, idősotthon, polgárőr-ügyelet).
2. **Üzenetsablon, 20 szó.** „VÍZ / hely / liter / idő” — „MELEG / nyitva / férőhely” — „SEGÉLY / cím / 1 mondat”. A csevegés lemeríti a node-ot és a figyelmet.
3. **Táp.** Minden node-hoz írható Wh és tartalék. Napelemes power station a tető-átjátszóra; a zsebrádió ne a melegedő egyetlen inverterén lógjon.
4. **Analóg tartalék.** PMR / sávengedély szerinti kézi rádió a járőrnek, papírtérkép a körzetekről. A mesh kiesése ne legyen néma falu.
5. **Nincs felhős napló.** A forgalom a helyi füzetben vagy a saját gépen futó listában van. Semmilyen „ingyenes dashboard” ne legyen a működés feltétele.

> **Tipp.** Egy próbaeste áram nélkül többet ér, mint tíz jegyzőkönyv. Mérd: hány perc a riasztás a melegedőtől a zsákutcáig. Ez a közösségi TTR.

### 3. Melegedő — zóna, nem „fűtsünk mindent”

1. **Hőmag.** Egy terem, alacsony belmagasság ha lehet, függöny / fólia az ajtón, zárt ablak. Cél: tartózkodásra elég hő, nem nyári komfort.
2. **Raktár hidegen.** A készlet nem a kályha mellett áll. A dízel, a palack és az elemek külön, szellőztethető helyen, leltárral.
3. **Beléptetés.** Név vagy sorszám, érkezés, férőhely. Ha tele a mag, a következő óra ütemezett, nem tolongás.
4. **Töltőpont kvótával.** Telefon és rádió akkumulátor előre, nem „aki előbb éri”. A power station a létfontosságú kör: világítás a magban, rádió, egy lámpa a raktárban.
5. **Nyitás–zárás órája.** A melegedő sem 24 órás ígéret, ha a kW nem bírja. Írd ki: mikor van ügyelet, hol a következő pont.

> **Tipp.** A fűtött köbméter a muda, ha üresen melegszik. Zárd a szárnyat. A motorban ez az energia-autonómia óráinak növekedése.

## Kapcsolódás a Local-First döntéstámogató motorhoz

A Szcenárió **demo12 — Helyi ellátás és közösségi biztonság** esete ugyanerre a törzsre épül: víz, energia, LoRa. A számítás a böngészőben marad. Nincs felhő-adatbázis, nincs használatküldés, nincs élő hatósági API.

A motor fizikai mutatókat visz, nem csak forintot:

- **Resource Runway** — meddig tart a liter és a kannás készlet a napi kiosztás mellett.
- **Energy Autonomy** — a melegedő és a node-ok Wh / kW korlátja.
- **Kommunikációs redundancia** — mesh + analóg, vagy egyetlen függő út.
- **TTR** — mennyi idő, mire a következő lajtos vagy a helyreállt hálózat megérkezik.

A PDCA keret fix. PLAN: a törzs (létszám, készletnap, energia). DO: a kiosztás és a rádiókör. CHECK: a három sáv — optimista / realista / pesszimista. ACT: kevesebb kör, szűkebb fűtött mag, több átjátszó.

A lecke akkor állt össze, ha a következő gyakorlaton **literben, órában és lefedett utcában** beszélsz, nem „kitartunk”-ban. A döntési fa a saját eszközödön fut.
