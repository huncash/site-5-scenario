---
title: Vállalati BCP — SaaS-kiesés, ellátási lánc blokád és kulcsmunkatárs-hiány
slug: vallalati-bcp-folytonossag
description: Local-first ügyvitel, lean kvótacsökkentés és keresztképzési mátrix. TTR, OEE és delegálás — a működés a saját gépen marad.
tags: [BCP, SaaS, local-first, ellátási lánc, SMED, keresztképzés, TTR]
---

# Vállalati szféra — Business Continuity három éles ágon

A kkv folytonossága ritkán egyetlen „katasztrófaterv-PDF”. Három ponton szakad el a hétköznap: a **felhős ügyvitel** elérhetetlen, a **beszállító** nem jön, vagy a **kritikus kompetencia** betegszik. A BCP akkor él, ha ezekre van számolt TTR, alternatív partner és delegálási sor — a saját eszközön, nem egy újabb felhős státuszoldalon.

Ez a lecke a három ágat Lean szemmel viszi: muda a várakozás, mura a hullámzó kapacitás, muri a túlterhelt egyetlen ember.

## Alapállapot / Helyzetlemez

### Kritikus SaaS / felhő leállása

Számlázás, ügyfélnyilvántartás, raktár vagy bér a vendor felhőjében van. A szolgáltatás kiesik, drasztikusan drágul, vagy jogilag elérhetetlenné válik. A csapat a böngészőben vár. A számla nem megy ki, a komissiózás megáll, a pénztárgép-kapcsolat némul.

A kihívás nem a „majd hétfőn visszajön”. A kihívás: **van-e helyi másolat, amit 4 órán belül élesítesz**, és tudja-e valaki a manuális protokollt. A demo11 (kiesés alatti TTR) és a demo26 (vendor megszűnés / áremelés, local-first migráció) ugyanannak a függésnek két arca.

### Logisztikai ellátási lánc blokád

Üzemanyaghiány, útlezárás, egyedi alkatrész kiesése. A sor áll, vagy hamis OEE-t mutat, ha helyettesítővel, audit nélkül hajtasz. A kihívás a **kvóta**: mit gyártasz kevesebbet, melyik vevőt tartod, melyik regionális partner lép be, mennyi a SMED.

A lean válasz nem „vegyél több készletet vakon”. A válasz: rövidebb átállás, elhatárolt tétel, kevesebb üres kilométer. Ugyanez a logika a WMS-kieséses cross-dockon: papír + vonalkód, amíg a szerver sötét.

### Kulcsmunkatársak tömeges kiesése

Fertőzéshullám, egy busznyi műszak, vagy két kulcsember egyszerre. A számlázás, a gépátállítás, a vevőhívás egy fejben van. A kihívás a **keresztképzési mátrix**: melyik szerepnek van kettes számú neve, és melyik lépés Poka-Yoke — azaz nem a memórián múlik.

Ha a protokoll a kulcsember laptopján van, a kiesés kétszeres.

## A szcenárióban rejlő lehetőségek és potenciál

A BCP itt nem biztosítási melléklet. Döntési fa:

| Ág | SaaS | Ellátás | Ember |
|---|---|---|---|
| Optimista | Local-first másolat, TTR perc–néhány óra | Helyettesítő + SMED, rövid OEE-lyuk | Ketős van, a mátrix él |
| Realista | Dual-run, 6 hét / belső óra | Sorállás vagy kézi komissió, lassabb átfutás | Részleges delegálás, hosszabb ciklusidő |
| Pesszimista | 400+ óra scramble, működés áll | Audit nélküli hajtás / dokk-torlódás | Egyetlen út, TTR napokban |

A potenciál a **Master Baseline** öröklésében van. A cég mérete, létszáma, készlete egyszer van megadva. A szcenárió csak a sokkréteget mozgatja: vendor, útzár, hiányzó műszak. Nem írod újra a törzset minden válságra.

> **Tipp.** A TTR-t órában írd, ne „amint lehet”. Ami nincs mértékegységben, az nem cél, hanem kívánság.

## Pontos, gyakorlatias know-how

### 1. SaaS-kiesés — local-first élesítés

1. **Függőségi lista.** Melyik folyamat melyik vendoron ül: számla, készlet, bér, e-mail, fájl. Egy sor = egy kiesési pont.
2. **Helyi másolat ütemezve.** Nem „van egy zip a fiókban”. Export vagy saját gépen futó adatbázis, utolsó ismert jó, dátummal. A mentés próbája: *visszaállítás üres gépre*, nem csak a fájl létezése.
3. **4 órás protokoll.** Ki dönt az élesítésről, hol a jelszó / kulcs *offline*, milyen sorrend: számla → készlet → kommunikáció. Papír checklist a fiókban.
4. **Manuális számla és bizonylat.** Sorszámtartomány előre. Ha a felhő hétfőn visszajön, a helyi sorszám nem ütközik.
5. **Ne fizess pánikban automatikus megújítást.** A vendor-sokk ára és a migrációs óra külön sáv. A dual-run (régi + helyi) költsége a realista ág — számold munkaórában.

> **Tipp.** Amit a működés közben a felhőből *olvasol*, az a kiesésben nincs. Amit a saját gépeden *írsz és olvasol*, az a tartalék. A Szcenárió ezért local-first: a szcenárió maga sem kér vendor-API-t.

### 2. Ellátási lánc — kvóta és alternatíva

1. **Egyedi komponens jelölése.** Mi az, aminek nincs helyettesítője? Az a szűk keresztmetszet. Erre van SMED-forgatókönyv vagy tudatos sorállás — a kettő közül válassz, ne keverd.
2. **Regionális partnerlista.** Név, ólomidő, minimum tétel, minőségi feltétel. A „majd keresünk valakit” a 6. óra muda-ja.
3. **Kvóta Lean módon.** Először a késztermék-mix szűkítése (kevesebb variáns, ugyanaz a gép). Aztán a nem kritikus vevő csúsztatása. A teljes leállás a pesszimista ág, nem az első reflex.
4. **Tétel-elhatárolás.** Ha helyettesítővel mész, a tétel zárt, a Poka-Yoke (interlock, sablon, mérés) él. Az audit nélküli hajtás rövid OEE-t mutat, később visszahívást.
5. **Üres km és dokk.** Üzemanyagválságban a járat összevonás és a kihasználtság a muda-vágás. WMS nélkül: papír + vonalkód, indítás a kapunál, ne várj a szerverre, amíg a kamion áll.

> **Tipp.** Az OEE lyuk órában látszódjon. A „kicsit állt a sor” nem döntés. A motor a SMED-et és a lead time-ot méri, nem a hangulatot.

### 3. Emberkiesés — mátrix és delegálás

1. **Kritikus szerepek, nem nevek először.** Számlázás, gépátállítás, vevőescalation, készletzár, biztonság. Minden szerephez *ketős* és *helyettesítési idő*.
2. **Keresztképzési mátrix.** Sor: szerep. Oszlop: személy. Cella: tudja / gyakorolta / dokumentációból el tudja indítani. A „hallotta már” nem cella.
3. **Poka-Yoke a folyamatban.** Sorszám, checklist, sablon, két emberes jóváhagyás a pénzmozgásra. Ha a tudás csak a fejben van, a kiesés a tudást is viszi.
4. **Delegálási protokoll egy oldal.** Ki aktiválja, meddig tart a helyettes, mi nem delegálható (aláírás, hatósági). A döntés ideje TTR.
5. **Törzs létszám vs. műszak.** A Master Baseline a fejlétszám. A szcenárió a hiányzó százalék. 30% kiesésnél a kvóta csökken — ne ígérj 100% kibocsátást 70% emberrel.

> **Tipp.** A mátrixot negyedévente *cseréld*: A csinálja B feladatát egy műszakban. A papír, ami nincs gyakorolva, dísz.

## Kapcsolódás a Local-First döntéstámogató motorhoz

A motorban ezek az esetek már külön pályák, ugyanazzal a PDCA-héjjal:

- **demo11** — felhő kiesése, redundáns link / local-first másolat / manuális P2P, TTR.
- **demo26** — vendor megszűnés vagy áremelés, migrációs óra, nincs felhő-adat.
- **demo21** — supply shock, SMED, OEE, Poka-Yoke.
- **demo23–24** — WMS-kiesés és fuvardíj / üres km.
- A létszámkiesés a **örökölt Master Baseline fejlétszámán** mozog: a kvóta és a ciklusidő a CHECK sáv.

A számítás IndexedDB-ben, a gépeden van. A BCP-terv, ami egy újabb SaaS-ban lakik, ugyanazt a kockázatot ismétli, mint amit kezelni akar.

PLAN: függőség és mátrix. DO: élesítés vagy kvóta. CHECK: TTR, OEE, lead time, óra. ACT: kevesebb vendor-függő lépés, több beépített hibazár.
