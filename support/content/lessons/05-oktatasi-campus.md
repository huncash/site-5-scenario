---
title: Oktatási válsághelyzetek — kiberincidens, campus hősziget és helyi körforgás
slug: oktatasi-campus-valsaghelyzet
description: Kollégiumi zsarolóvírus, passzív hűtés hőhullámban és műanyagmentes helyi élelmiszer-kör. Hallgatói BCP local-first motorral.
tags: [oktatás, campus, kiber, hősziget, körforgás, Poka-Yoke, local-first]
---

# Oktatási esetek — kortárs hallgatói működési válság

A campus nem „kicsinyített vállalat” és nem nyári tábor. Ugyanaz a PDCA, más ritmus: **vizsgahetet, kollégiumi áramot és menzát** nem lehet átütemezni egy státuszoldallal. Három helyzet, ami a hallgatói hétköznapot tényleg eléri: zsarolóvírus a tanulmányi rendszeren, hőhullám a hálózaton, és a helyi ellátás elszakadása a hosszú, műanyag- és importfüggő lánctól.

A lecke tréningnek is való. A számok a gépeden készülnek. A portál, ami elesett, nem taníthatja a saját helyreállását.

## Alapállapot / Helyzetlemez

### Kollégiumi és kari kiberincidens

Zsarolóvírus a hallgatói portálon, a Neptun-szerű tanulmányi ágon vagy a tanszéki megosztáson. Digitális lekapcsolódás: nincs jegybeírás, nincs feltöltött dolgozat, a kulcsos ajtó-rendszer is akadozhat, ha ugyanahhoz a címtárhoz kötötték. A kihívás az **izolációs idő** és az **analóg adminisztráció**: vizsgáztatsz-e papíron, van-e sorszámozott jelenléti, ki dönt 4 órán belül a szegmens leválasztásáról.

A váltságdíj nem stratégia. A TTR az, mikor a tanszék újra *saját* másolatról dolgozik, és a hallgató tudja, hol van a vizsga.

### Városi hősziget és campus energia-korlát

Extrém nyári hőhullám, a városi beton éjszaka sem hűl. A hálózat kvótát kap, a klíma aggregátora a csúcsot viszi. A kollégiumi szoba 31 °C, a gépterem is melegszik. A kihívás nem a „kapcsoljátok ki a klímát” plakát. A kihívás a **decentralizált kvóta**: melyik épület mennyi kWh-t vihet, hol van passzív hűtés (árnyék, kereszthuzat, éjszakai szellő), hova költözik a tanulóhely nappal.

A komfort és a kWh együtt mérendő. Ha csak a rezsit nézed, a vizsgázó elesik. Ha csak a komfortot, a transzformátor.

### Műanyagmentes, zártkörű helyi ökoszisztéma

Tesztkörnyezet vagy valódi zavar: a hosszú ellátási lánc (csomagolt import, egyszer használatos menza) megszakad. A campusnak **helyi élelmiszer, visszaváltható edény, rövid kör** kell. A kihívás a körforgás: ki termel / főz / oszt, hol a veszteség (muda: dobott étel, felesleges csomagolás), mennyi a készletnap.

Ez nem lifestyle-kampány. Válsághelyzeti logisztika: ugyanaz a runway, mint a lajtoskocsinál, csak tálca és kg.

## A szcenárióban rejlő lehetőségek és potenciál

A három eset egy hallgatói BCP-váz:

| Ág | Kiber | Hő / kWh | Helyi kör |
|---|---|---|---|
| Optimista | Izoláció órák alatt, analóg vizsga megvan | Passzív + kvóta tart, nincs épületszintű lekapcsolás | Rövid lánc, kevés selejt, edény forog |
| Realista | 4 óra izoláció, csúszó admin, papírjegy | 2 kollégium kvóta fölött, tanulóhely áthelyezve | Részleges menza, helyi beszállító, kevesebb variáns |
| Pesszimista | 18+ óra, campus-háló sötét, vizsga csúszik | Campus-szintű korlátozás | Üres raktár, egyszer használatos visszaáll, muda nő |

A potenciál a tréningben van. A hallgató a **késleltetett hatást** is látja (startup-lecke: a marketing ma, a bevétel később). Itt a kiberizoláció ma, a vizsga holnap; a kvóta ma, a hőterhelés este.

> **Tipp.** A campus Master Baseline-je a létszám, az épület és a kWh-kvóta. Ne írd újra minden gyakorlatra. Csak a sokkot mozgasd: ransomware, hőhullám, láncszakadás.

## Pontos, gyakorlatias know-how

### 1. Kiberincidens — izoláció, analóg, másolat

1. **Szegmens leválasztás.** Tanszéki / kollégiumi Wi‑Fi és a tanulmányi VLAN először. A „mindenki maradjon online, csak ne kattintson” nem izoláció.
2. **Analóg vizsga-készlet.** Nyomtatott feladat, sorszám, jelenléti, pótterem. A PDF a fertőzött megosztón *nem* forrás.
3. **Helyi másolat.** Jegyek, névsor, teremrend a saját gépen vagy papíron, aznapi dátummal. Ami csak a portálon élt, az a TTR része.
4. **Kommunikáció két úton.** Faliújság + megafon / portás, és ha van tiszta sáv, rövid SMS-sablon. A fertőzött levelezés ne vigye a teremszámot.
5. **Ne fizess, ne alkudozz a zsarolóval a folyosón.** A döntés a kari protokoll: izoláció, hatósági / IT, helyreállítás másolatról. A hallgatói „megjavítom” muda és kockázat.

> **Tipp.** Az izolációs időt órában mérd a riasztástól a leválasztott szegmensig. Ez a campus TTR. A demo18 ezt a sávot viszi: 1,5 / 4 / 18 óra.

### 2. Hősziget — passzív először, kvóta utána

1. **Nappali tanulóhely áthelyezés.** Földszint, árnyékos aula, pince-olvasó, könyvtár — ne a nyugati homlokzatú padlás.
2. **Éjszakai átszellőztetés.** Ablak-protokoll, ahol biztonságos: a beton éjszakai hőjét engedd ki, nappal zárd a redőnyt.
3. **Kvóta épületenként.** Kollégium A/B kWh. A közös klíma nem „aki előbb éri”. A gépterem és a hűtött gyógyszer / labor a létfontosságú kör.
4. **Decentralizált lakóhely.** Akinek van hűvösebb cím a városban (család, másik campus), nappal oda; a férőhely felszabadul. Ez Lean: kevesebb fűtött/hűtött köbméter.
5. **IT hő.** A laborgépek éjszakai lekapcsolása, a vizsgaszerver marad. A „minden gép pörög, hátha kell” a transzformátor muda-ja.

> **Tipp.** A mutató kWh *és* a kvóta-túlépő épületek száma. A demo17 ezt számolja: nincs / 2 kollégium / campus-szintű.

### 3. Helyi körforgás — kevesebb variáns, kevesebb csomagolás

1. **Egy hetes menü, helyi alapanyag.** Kevesebb SKU, ugyanaz a konyha. A variáns a muda, ha a lánc szakad.
2. **Visszaváltható edény.** Betét, sorszám, visszavételi pont. Az egyszer használatos csak a pesszimista tartalék.
3. **Készletnap és selejt.** Kg be, kg ki, kg dobott. A dobott étel a minőségi vészhelyzet unokatestvére: elhatárolod, nem kevered vissza.
4. **Rövid partnerlista.** Két helyi őstermelő / sütöde, ólomidő, minimum. Ugyanaz a supply-shock jegyzet, mint a gyártósoron.
5. **Hallgatói kiosztás.** Gyűjtőpont, nem szobánként tasak. A lajtoskocsi-lecke kannája itt a ládás zöldség.

> **Tipp.** A kör akkor zárt, ha a csomagolás *visszajön* a konyhába. Ami kimegy és szemét lesz, az nem ökoszisztéma, hanem egyszeri akció.

## Kapcsolódás a Local-First döntéstámogató motorhoz

A tréning-pályák a motorban:

- **demo18** — kiberincidens, izolációs idő, analóg vizsga, helyreállás.
- **demo17** — campus hőhullám, kWh-kvóta, passzív hűtés, decentralizált lakóhely.
- **demo16** — Lean VSM, OEE, SMED, Poka-Yoke — a menza és a laborsor ugyanaz a value stream-nyelv.
- **demo15** — ha a hallgatói vállalkozás a saját keretét osztja: késleltetett hatás, tartalék.
- A közösségi víz / készlet (demo12) a helyi élelmiszer-kör testvére.

A számítás a böngészőben van. A tanulmányi felhő kiesése nem viheti el a *gyakorlatot*, amely épp a kiesést modellezi.

PLAN: törzs (létszám, épület, kvóta). DO: izoláció / zóna / menü. CHECK: óra, kWh, kg, PRO sáv. ACT: kevesebb digitális-függő lépés, kevesebb hűtött üres terem, kevesebb csomagolás.

A lecke akkor állt össze, ha a következő gyakorlaton a hallgató **órát, kilowattórát és kilogrammot** mond, nem „majd a portál”. A motor ugyanaz, mint a céges BCP-nél — csak a ritmus a szemeszter.
