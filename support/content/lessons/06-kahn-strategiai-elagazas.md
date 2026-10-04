---
title: Herman Kahn döntési elágazás & szórásmodell (P-R-O)
slug: kahn-strategiai-elagazas
description: Nem jóslat — tartomány. Elágazási pontok, Pesszimista–Realista–Optimista sávok és Stop-Loss a cégtörzs védelmére. Local-first demó (DEMO 11).
tags: [Kahn, RAND, P-R-O, szcenárió, hitel, Stop-Loss, runway, demo11]
---

# Herman Kahn döntési elágazás & szórásmodell (P-R-O)

A **Herman Kahn (RAND Corporation)** által kifejlesztett szcenárió-modellezési módszertan célja nem a jövő megjóslása, hanem a **vállalati reziliencia és döntési rugalmasság kiépítése**. A módszer a döntéshozót kényszeríti arra, hogy ne egyetlen „legvalószínűbb” tervben gondolkodjon, hanem felkészüljön a szélsőséges kimenetelekre is.

A Szcenárió engine-ben ez a **DEMO 11** (Kahn-féle jövőkutató & stratégiai elágazás): a számítás a saját eszközödön fut, telemetria nélkül.

---

## 1. A Kahn-módszertan működési elve

1. **Nem jóslat, hanem tartomány:** A jövő determinisztikus pontok helyett valószínűségi sávokban mozaikolható.
2. **Kritikus elágazási pontok (Decision Nodes):** A döntéseknek nem csak közvetlen, hanem többlépcsős (1. forduló, 2. forduló) visszaható következményei vannak.
3. **Pesszimista – Realista – Optimista (P-R-O) kimenet:** A kimeneteleket 3 párhuzamos idősávon modellezzük, hogy a legrosszabb eshetőség se döntse be a vállalkozást.

---

## 2. Lépésről lépésre: a Kahn-eset megoldási folyamata

### 1. LÉPÉS: A törzs-alapműködés és kockázatok elkülönítése

* Mielőtt bővítésbe vagy hitelfelvételbe kezdesz, tisztázni kell a **Core Üzem** (törzsműködés) runway-jét és fix kötelezettségeit.
* *Kahn-elv:* Soha ne kockáztasd a cég alapvető fennmaradását egy tőkeáttételes növekedési kísérlettel.

### 2. LÉPÉS: Döntési elágazás (Decision Tree)

* **1. Forduló (Finanszírozási irány):** Külső hitel vs. organikus növekedés / saját tőke bevonása.
* **2. Forduló (Konstrukció kiválasztása):** Kötött/olcsóbb vs. drága/rugalmas finanszírozás.
* *Elágazás hatása:* A drágább, de rugalmasabb finanszírozás rosszabb kimenet esetén sem indít azonnali csődeljárást (call option jelleg).

### 3. LÉPÉS: P-R-O szórásmodell és Stop-Loss meghatározása

* **Pesszimista sáv (P):** Piaci lejtmenet / kamatemelés. Meghatározzuk azt a **Stop-Loss pontot** (pl. minimális cash runway), ahol a projektet azonnal le kell állítani a cégvagyon védelmében.
* **Realista sáv (R):** Az üzleti terv szerinti átlagos pálya.
* **Optimista sáv (O):** Kapacitás-túlfutás és gyors megtérülés.

---

## 3. Hogyan értelmezd a PRO kimeneteket a Szcenárió engine-ben?

| Kimeneti sáv | Üzleti jelentés & lépés | Kritikus mutató |
| :--- | :--- | :--- |
| **Optimista (O)** | Hitel + kapacitás előre: a piac felveszi a növekedést, a megtérülés felgyorsul. | Tőkehatékonyság / növekedési sáv |
| **Realista (R)** | Organikus / meglepetésmentes: szilárd növekedés, kiszámítható törlesztés és fenntartható runway. | Runway tartomány |
| **Pesszimista (P)** | Stop-Loss nehéz sávon: a piac bedől. A rugalmasabb finanszírozási opció segíti a túlélést a fizetésképtelenség elkerülésével. | Cash buffer ≥ fix költség |

> **Tervezési szabály:** Akkor hozd meg a bővítési döntést, ha a pesszimista pálya mellett is megmarad a cég minimális működési runway-je.
