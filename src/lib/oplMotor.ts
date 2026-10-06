import type { GlossaryTermId } from "@/lib/glossary";
import type { OplLesson, OplStep } from "@/lib/opl";

function step(
  id: string,
  titleHu: string,
  titleEn: string,
  actionHu: string,
  actionEn: string,
  captionHu: string,
  captionEn: string,
): OplStep {
  return {
    id,
    titleHu,
    titleEn,
    actionHu,
    actionEn,
    image: { captionHu, captionEn },
  };
}

function motor(p: {
  slug: string;
  categoryHu: string;
  categoryEn: string;
  titleHu: string;
  titleEn: string;
  whyHu: string;
  whyEn: string;
  deepDiveHu: string;
  deepDiveEn: string;
  jargon: GlossaryTermId[];
  keywords: string[];
  steps: OplStep[];
}): OplLesson {
  const { slug, ...rest } = p;
  const path = `lecke-motor-${slug}`;
  return { id: path, path, ...rest };
}

/** Szcenáriómotor — pénz, likviditás, ütemezés, Lean művelet. Nem dashboard-csempe. */
export const MOTOR_OPL_LESSONS: OplLesson[] = [
  motor({
    slug: "jit",
    categoryHu: "Likviditás",
    categoryEn: "Liquidity",
    titleHu: "JIT — épp időben",
    titleEn: "JIT — just in time",
    whyHu: "Először a 60 nap fedezet. A persely és a készlet vár, amíg van levegő.",
    whyEn: "Sixty-day cover first. Piggies and stock wait until there is air.",
    jargon: ["jit", "runway", "idleCash"],
    keywords: ["jit", "épp időben", "60 nap", "fedezet", "készlet"],
    deepDiveHu:
      "A motor JIT-szabálya nem raktárdivat. Amíg nincs meg a stabil 60 napos fedezet a fix kiadásra, a perselytöltés — vágyak, extra fejlesztés — várólistára kerül. Először a levegő. Ne köss le pénzt „későbbre”, ha a kasszának nincs levegője. A holtpénz a másik szélsőség: ott áll, se tartalék, se munka. A runway hónapja megmondja, van-e jogod perselyt tölteni.",
    deepDiveEn:
      "The engine’s JIT rule is not warehouse fashion. Until you have a solid 60-day cover for fixed spend, filling piggies — wants, extra build — waits. Air first. Do not lock money “for later” if the till has no air. Idle cash is the other extreme: it sits, neither reserve nor work. Runway months tell you whether you have the right to fill a piggy.",
    steps: [
      step("s1", "60 nap", "60 days", "Nézd a fedezetcsíkot, mielőtt perselyt töltesz.", "See the cover bar before you fill a piggy.", "JIT 60 nap küszöb", "JIT 60-day threshold"),
      step("s2", "Vár", "Wait", "Ha a csík piros, a motor nem tölt automatikusan.", "If the bar is red, the engine does not auto-fill.", "JIT szünet / persely", "JIT pause / piggy"),
      step("s3", "Akkor", "Then", "60 nap felett mehet a cél. Előbb a NEED.", "Above 60 days the goal may fill. NEED first.", "JIT után persely", "Piggy after JIT"),
    ],
  }),
  motor({
    slug: "dokk",
    categoryHu: "Művelet",
    categoryEn: "Operations",
    titleHu: "Dokk / rakodókapu",
    titleEn: "Dock / loading bay",
    whyHu: "A kapu ideje pénz. Ha a WMS sötét, a dokk akkor is sorban áll.",
    whyEn: "Gate time is money. If WMS is dark, the dock still queues.",
    jargon: ["dock", "wms", "smed"],
    keywords: ["dokk", "rakodó", "kapu", "torlódás", "dock"],
    deepDiveHu:
      "A dokk a fizikai rakodási pont: teherautó, raklap, kapuóra. A motor nem a képernyőt méri, hanem a torlódást és az átállást. Ha a WMS kiesik, a sor papíron és a kapun marad — ugyanaz a lead time, más eszköz. SMED a kapun: percben cseréld a rakományt, ne órában. A BCP-lecke a kiesést meséli; ez a lecke a mindennapi kapuidőt.",
    deepDiveEn:
      "The dock is the physical loading point: truck, pallet, gate clock. The engine does not measure the screen; it measures congestion and changeover. If WMS is down, the queue stays on paper and at the gate — same lead time, different tool. SMED at the gate: swap the load in minutes, not hours. The BCP lesson tells the outage; this lesson is everyday gate time.",
    steps: [
      step("s1", "Kapu", "Gate", "Keresd a dokk / kapuóra feliratot a műveleti sávon.", "Find dock / gate time on the ops band.", "Dokk kapuóra", "Dock gate clock"),
      step("s2", "Sor", "Queue", "Hány jármű vár. Ez várakozás-muda.", "How many vehicles wait. That is waiting muda.", "Dokk torlódás", "Dock congestion"),
      step("s3", "Sötét IT", "Dark IT", "WMS nélkül is mérd a kaput. A sor nem tűnik el.", "Without WMS still time the gate. The queue does not vanish.", "Dokk papír / WMS nélkül", "Dock paper / no WMS"),
    ],
  }),
  motor({
    slug: "afa-kor",
    categoryHu: "Pénz",
    categoryEn: "Money",
    titleHu: "ÁFA-kör",
    titleEn: "VAT cycle",
    whyHu: "Bruttóból nettó, zárolás a bevallásig. A kör nem a tied elkölteni.",
    whyEn: "Net from gross, locked until filing. The cycle is not yours to spend.",
    jargon: ["vat", "cashflow", "jit"],
    keywords: ["áfa", "bevallás", "kör", "negyedév", "bruttó", "nettó"],
    deepDiveHu:
      "A magyar ÁFA-kör: a motor a bruttó sorból nettót és adót számol, a különbözetet tartalékba zárja a következő bevallásig. Ez nem holtpénz — idegen pénz nálad. A gyanús kulcsot megjelöli; ne írd át, ha a bizonylat nem stimmel. Importnál ugyanaz a kör fut. A szabad nettó csak a zár után marad. Ha a kört „ott van a számlán” alapon költöd, a bevalláskor a működés áll.",
    deepDiveEn:
      "Hungarian VAT cycle: the engine derives net and tax from a gross line, and locks the gap until the next filing. That is not idle cash — it is someone else’s money in your hands. It flags a suspicious rate; do not rewrite it if the voucher is unclear. Import runs the same cycle. Free net is what remains after the lock. If you spend the cycle because “it is in the account”, operations stop at filing.",
    steps: [
      step("s1", "Bruttó", "Gross", "HU sornál a motor bruttóból nettót számol.", "On a HU line the engine derives net from gross.", "ÁFA bruttó → nettó", "VAT gross → net"),
      step("s2", "Zár", "Lock", "A tartalék a bevallásig áll. Ne vidd WANT-ra.", "The reserve sits until filing. Do not send it to WANT.", "ÁFA-kör zárolás", "VAT cycle lock"),
      step("s3", "Gyanú", "Flag", "A megjelölt kulcsot a bizonylattal egyeztesd.", "Reconcile a flagged rate with the voucher.", "ÁFA felülvizsgálat", "VAT review"),
    ],
  }),
  motor({
    slug: "holtpenz",
    categoryHu: "Likviditás",
    categoryEn: "Liquidity",
    titleHu: "Holtpénz",
    titleEn: "Idle cash",
    whyHu: "Pénz, ami nem dolgozik. Sem tartalék, sem működés — ez muda.",
    whyEn: "Money that does not work. Neither reserve nor operations — that is muda.",
    jargon: ["idleCash", "muda", "jit"],
    keywords: ["holtpénz", "idle", "ott áll", "készletpénz"],
    deepDiveHu:
      "A holtpénz ott áll a kasszában, és semmire nincs lekötve: nincs NEED, nincs 60 nap, nincs cél. A motor pazarlásnak számolja. Gyakori hiba: „majd jól jön” — közben a runway fogy, a WANT megy. JIT a fordítottja: először a fedezet, aztán a cél. A CHECK forintban mutatja. Ne büntesd magad — irányítsd: tartalék vagy munka.",
    deepDiveEn:
      "Idle cash sits in the till and is tied to nothing: not NEED, not the 60 days, not a goal. The engine counts it as waste. Common failure: “it will come in handy” — meanwhile runway shrinks and WANT runs. JIT is the inverse: cover first, then the goal. CHECK shows it in forints. Do not punish yourself — steer it: reserve or work.",
    steps: [
      step("s1", "CHECK", "CHECK", "Olvasd a holtpénz sort a CHECK összegzésben.", "Read the idle-cash line in the CHECK summary.", "Holtpénz a CHECK-en", "Idle cash on CHECK"),
      step("s2", "Kérdés", "Question", "Tartalék vagy munka? A „majd” nem válasz.", "Reserve or work? “Later” is not an answer.", "Holtpénz döntés", "Idle cash decision"),
      step("s3", "JIT", "JIT", "60 nap alá ne tegyél újabb perselyt. Előbb a levegő.", "Below 60 days do not add another piggy. Air first.", "Holtpénz vs. JIT", "Idle cash vs JIT"),
    ],
  }),
  motor({
    slug: "kuszob",
    categoryHu: "Küszöb",
    categoryEn: "Threshold",
    titleHu: "Küszöbök",
    titleEn: "Thresholds",
    whyHu: "60 nap, stop-loss, WANT sapka. Szám, nem érzés — a motor itt állít meg.",
    whyEn: "60 days, stop-loss, WANT cap. A number, not a vibe — the engine stops you here.",
    jargon: ["stopLoss", "jit", "want"],
    keywords: ["küszöb", "threshold", "60 nap", "sapka", "limit"],
    deepDiveHu:
      "Három kemény szám. JIT 60 nap: perselytöltés vár. Stop-loss: hány nap a törzs előtt. WANT sapka: a vágy teteje. A motor megkérdez, nem ír titokban. A P pályán ezek közelebb vannak, mert ott rosszabb a világ. Ha mindig felülírod, a küszöb dísz. A szabály a gépeden van, nem a felhőben.",
    deepDiveEn:
      "Three hard numbers. JIT 60 days: filling piggies waits. Stop-loss: days before the trunk. WANT cap: the lid on wants. The engine asks; it does not write in silence. On the P path they sit closer, because that world is worse. If you always override, the threshold is decoration. The rule lives on your machine, not in a cloud.",
    steps: [
      step("s1", "Három", "Three", "60 nap · stop-loss nap · WANT sapka.", "60 days · stop-loss days · WANT cap.", "Három motor-küszöb", "Three engine thresholds"),
      step("s2", "Pálya", "Path", "P-n a küszöb közelebb van. Ez a tartomány.", "On P the threshold is nearer. That is the range.", "Küszöb a P pályán", "Threshold on the P path"),
      step("s3", "Felülír", "Override", "Ha a motor megállít, egyszer gondolkodj. Ne rutinból.", "If the engine stops you, think once. Not by habit.", "Küszöb megerősítés", "Threshold confirm"),
    ],
  }),
  motor({
    slug: "opcio",
    categoryHu: "Döntés",
    categoryEn: "Decision",
    titleHu: "Opció / nyitva tartás",
    titleEn: "Option / keeping it open",
    whyHu: "Az opció díja vs. a kilépés ára. Meddig fizetsz azért, hogy ne dönts.",
    whyEn: "Option fee vs. exit price. How long you pay in order not to decide.",
    jargon: ["penalty", "whatIf", "pro"],
    keywords: ["opció", "option", "nyitva", "díj", "kilépés"],
    deepDiveHu:
      "A rosszabb ágat nyitva tartani is kerül. Az opciódíj a What-if kártyán a kötbér mellett áll — ezer forintban. Ha a díj nagyobb, mint a kilépés, vágsz. Az opció nem azt jelenti, hogy „még jó lesz”; időt veszel, amíg nem döntesz. A törzset ne tartsd opcióban — az nem kísérlet. A Projekt viselheti.",
    deepDiveEn:
      "Keeping the worse branch open also costs. The option fee sits beside the penalty on the What-if card — in thousand forints. If the fee is bigger than exit, you cut. An option does not mean “it will still work”; you are buying time while you do not decide. Do not keep the trunk as an option — that is not an experiment. A Project may carry it.",
    steps: [
      step("s1", "Díj", "Fee", "A What-if kártyán az opció / nyitva tartás díja.", "On the What-if card: the option / keep-open fee.", "Opciódíj csempe", "Option fee tile"),
      step("s2", "Összevet", "Compare", "Díj vs. kilépési kötbér. Melyik kisebb.", "Fee vs exit penalty. Which is smaller.", "Opció vs. kilépés", "Option vs exit"),
      step("s3", "Core", "Core", "A törzset ne tartsd opcióban. A Projekt viselheti.", "Do not keep the trunk as an option. A Project may.", "Opció a Projekten", "Option on a Project"),
    ],
  }),
  motor({
    slug: "burn",
    categoryHu: "Likviditás",
    categoryEn: "Liquidity",
    titleHu: "Burn / égési ráta",
    titleEn: "Burn rate",
    whyHu: "Mennyi folyik ki havonta a kassza alján. A runway ebből jön.",
    whyEn: "How much leaks out of the till each month. Runway comes from this.",
    jargon: ["burn", "runway", "cashflow"],
    keywords: ["burn", "égési", "havi kiadás", "ráta"],
    deepDiveHu:
      "A burn az, mennyi folyik ki havonta a kassza alján: NEED, a futó WANT, a tartozás. Nem az egyszeri nagy tétel. A runway ebből jön: szabad tartalék osztva a burnnel — mintha holnaptól semmi sem jönne be. Ha a burn nő és a bevétel áll, a 60 nap előbb piros. A díj és az újraküldés is ide számít. Ne szépítsd „átmeneti WANT-nak”.",
    deepDiveEn:
      "Burn is how much leaks out of the till each month: NEED, running WANT, debt. Not the one-off big item. Runway comes from this: free reserve divided by burn — as if nothing came in from tomorrow. If burn rises and income stands still, the 60 days go red sooner. Fees and resends count here too. Do not pretty it up as a “temporary WANT”.",
    steps: [
      step("s1", "Hó", "Month", "Olvasd a havi égést a runway mellett.", "Read monthly burn next to runway.", "Burn ráta kijelző", "Burn rate readout"),
      step("s2", "Képlet", "Formula", "Runway = tartalék / burn. Nulla bevétel.", "Runway = reserve / burn. Zero income.", "Burn → runway", "Burn → runway"),
      step("s3", "Teher", "Burden", "A tartozás részlete a burn része. Ne hagyd ki.", "The debt installment is part of burn. Do not omit it.", "Burn + tartozás", "Burn + debt"),
    ],
  }),
  motor({
    slug: "heijunka",
    categoryHu: "Ütemezés",
    categoryEn: "Scheduling",
    titleHu: "Heijunka / csúcsok",
    titleEn: "Heijunka / peaks",
    whyHu: "A költés és a teher ne ugráljon. A csúcs viszi a runwayt.",
    whyEn: "Spend and burden should not swing. A peak eats runway.",
    jargon: ["heijunka", "burn", "friction"],
    keywords: ["heijunka", "csúcs", "simítás", "ütemezés", "peak"],
    deepDiveHu:
      "A Heijunka a terhelés simítása. A motor a tételek dátumából csúcsokat keres: egy héten túl sok kimenő, aztán üresjárat. Ez várakozás- és túltermelés-muda pénzben. A tartozás-ütemezés és az EFO/EV napidíj ugyanitt torlódhat. A tanácsadó a csúcsot átteszi — nem a havi összeget, a naptárat. Ha minden számla ugyanarra a napra esik, a 60 napos fedezet hazudik.",
    deepDiveEn:
      "Heijunka is load levelling. The engine hunts peaks in posting dates: too much outbound in one week, then idle. That is waiting and overproduction muda in money. Debt schedules and EV/EFO day rates can pile up here too. The consultant moves the peak — not the monthly total, the calendar. If every invoice lands on the same day, the 60-day cover lies.",
    steps: [
      step("s1", "Csúcs", "Peak", "A Lean tanácsadó a heijunka-csúcsot jelöli.", "The Lean consultant marks the heijunka peak.", "Heijunka csúcs jelölés", "Heijunka peak mark"),
      step("s2", "Naptár", "Calendar", "Ne a havi összeget, a napot told.", "Do not push the monthly total — move the day.", "Csúcs áttolása", "Shift the peak"),
      step("s3", "Fedezet", "Cover", "Egyenletes teher: a 60 nap őszintébb.", "Level burden: the 60 days are more honest.", "Heijunka vs. JIT 60", "Heijunka vs JIT 60"),
    ],
  }),
  motor({
    slug: "utemezes",
    categoryHu: "Ütemezés",
    categoryEn: "Scheduling",
    titleHu: "Ütemezés / részletnaptár",
    titleEn: "Schedule / installment calendar",
    whyHu: "A következő 30–60 nap ténye. Ez viszi a burnt, nem a teljes tőke.",
    whyEn: "The fact of the next 30–60 days. That eats burn, not the full principal.",
    jargon: ["burn", "heijunka", "cashflow"],
    keywords: ["ütemezés", "naptár", "részlet", "esedékesség", "schedule"],
    deepDiveHu:
      "A tartozás és a tervezett használat naptára a DO / tartozó kártyán él. A motor a következő 30 és 60 nap összegét adja a burnhez. A teljes tőke ijeszt, de a runway a közeli terhet kéri. Heijunka: ha minden részlet egy hétre esik, told szét. Az import nem ír ütemezést — a hitel sorát te rakod. Szummában a belső kölcsön kieshet.",
    deepDiveEn:
      "The calendar of debt and planned usage lives on the DO / debt card. The engine adds the next 30 and 60 day sums to burn. Full principal scares you, but runway asks for the near burden. Heijunka: if every installment lands in one week, spread it. Import does not write a schedule — you place the loan line. In Szumma an internal loan may drop.",
    steps: [
      step("s1", "60 nap", "60 days", "Olvasd a közeli részletlistát, ne a tőkét.", "Read the near installment list, not the principal.", "60 napos ütemezés", "60-day schedule"),
      step("s2", "Burn", "Burn", "A havi teher a burn része. Add hozzá fejben.", "Monthly burden is part of burn. Add it in your head.", "Ütemezés → burn", "Schedule → burn"),
      step("s3", "Simít", "Level", "Egy hétre zsúfolt nap? Told a dátumot.", "A crowded week? Move the date.", "Ütemezés heijunka", "Schedule heijunka"),
    ],
  }),
  motor({
    slug: "smed",
    categoryHu: "Lean",
    categoryEn: "Lean",
    titleHu: "SMED / átállás",
    titleEn: "SMED / changeover",
    whyHu: "Percben cseréld a sort vagy a dokkot. Az óra várakozás-muda.",
    whyEn: "Swap the line or the dock in minutes. An hour is waiting muda.",
    jargon: ["smed", "dock", "oee"],
    keywords: ["smed", "átállás", "changeover", "perc"],
    deepDiveHu:
      "SMED: az átállás percben, ne órában. A motor akkor ajánlja, ha a CHECK várakozást lát — dokk, admin, új ritmus. Amit a kapu előtt elvégezhetsz, hozd ki. A lyuk a soron gyakran átállás. Fogadj el egy sort, mérd a kapuidőt. A KPI csempe nem SMED — a kapuóra az.",
    deepDiveEn:
      "SMED: swap in minutes, not hours. The engine suggests it when CHECK sees waiting — dock, admin, a new rhythm. What you can do before the gate, pull out. The hole on the line is often changeover. Accept one row, time the gate. The KPI tile is not SMED — the gate clock is.",
    steps: [
      step("s1", "Vár", "Wait", "CHECK-ben a várakozás / dokkóra a jel.", "In CHECK, wait / dock clock is the signal.", "SMED jel a CHECK-en", "SMED signal on CHECK"),
      step("s2", "Belső", "Inner", "Amit a kapu előtt elvégezhetsz, hozd ki.", "What you can do before the gate, pull out.", "SMED belső lépés", "SMED inner step"),
      step("s3", "Mér", "Measure", "Egy átállás, egy mérés. A perc a cél.", "One changeover, one measurement. Minutes are the goal.", "SMED kapuidő", "SMED gate time"),
    ],
  }),
  motor({
    slug: "oee",
    categoryHu: "Lean",
    categoryEn: "Lean",
    titleHu: "OEE / rendelkezésre állás",
    titleEn: "OEE / availability",
    whyHu: "Mennyit dolgozik tényleg a sor. 100% ritka — a lyuk pénz.",
    whyEn: "How much the line really works. 100% is rare — the hole is money.",
    jargon: ["oee", "smed", "muda"],
    keywords: ["oee", "rendelkezésre", "gép", "lyuk"],
    deepDiveHu:
      "OEE = rendelkezésre állás × teljesítmény × minőség. A fizikai / campus motor órában méri a kiesést; a gazdasági oldalon a „lyuk” a várakozás és a selejt cash-költsége. TPM a tanácsadóban: tartsd a folyamatot, ne a hőst. Ha az OEE zuhan, először SMED vagy Poka-yoke, nem új gép. A KPI sáv nem OEE — a műveleti óra az.",
    deepDiveEn:
      "OEE = availability × performance × quality. The physical / campus engine measures outage in hours; on the economic side the “hole” is the cash cost of waiting and scrap. TPM in the consultant: keep the process, not the hero. If OEE drops, SMED or poka-yoke first, not a new machine. The KPI bar is not OEE — the ops clock is.",
    steps: [
      step("s1", "Lyuk", "Hole", "Hol áll a sor / a dokk. Ez az OEE lyuk.", "Where the line / dock sits. That is the OEE hole.", "OEE kiesés óra", "OEE outage hours"),
      step("s2", "Három", "Three", "Állás × tempó × hiba. Melyik viszi.", "Down × pace × defect. Which one eats it.", "OEE három szorzó", "OEE three factors"),
      step("s3", "Első", "First", "SMED vagy Poka-yoke, mielőtt CapEx.", "SMED or poka-yoke before CapEx.", "OEE → SMED / Poka-yoke", "OEE → SMED / poka-yoke"),
    ],
  }),
  motor({
    slug: "vsm",
    categoryHu: "Lean",
    categoryEn: "Lean",
    titleHu: "VSM / értékáram",
    titleEn: "VSM / value stream",
    whyHu: "Hol áll meg az anyag vagy az infó. A térkép a muda helye.",
    whyEn: "Where material or info stalls. The map is where muda sits.",
    jargon: ["vsm", "muda", "wms"],
    keywords: ["vsm", "értékáram", "térkép", "lead time"],
    deepDiveHu:
      "A VSM a folyamat lépéseinek térképe: értékadó vs. várakozás. A motor nem külön termék — a CHECK / Lean tanácsadó lead time-nál ajánlja. WMS-kieséskor a térkép a dokkra és a papírra esik. Ne rajzolj szépet: egy szűk keresztmetszet, egy Kaizen. Az adatvonal (lineage) a pénzügyi VSM: melyik import, melyik kézi sor.",
    deepDiveEn:
      "VSM is the map of process steps: value-adding vs waiting. The engine is not a separate product — CHECK / the Lean consultant suggests it on lead time. When WMS is down, the map falls onto the dock and paper. Do not draw something pretty: one bottleneck, one Kaizen. Lineage is the financial VSM: which import, which manual line.",
    steps: [
      step("s1", "Térkép", "Map", "A tanácsadó VSM-et ajánl lead time-nál.", "The consultant suggests VSM on lead time.", "VSM ajánlás", "VSM suggestion"),
      step("s2", "Szűk", "Bottleneck", "Egy várakozás. Ne az egész folyamatot.", "One wait. Not the whole process.", "VSM szűk keresztmetszet", "VSM bottleneck"),
      step("s3", "Pénz", "Money", "Az adatsor a pénzügyi VSM. Nyisd piros lámpánál.", "Lineage is the financial VSM. Open it on a red lamp.", "VSM / lineage", "VSM / lineage"),
    ],
  }),
  motor({
    slug: "wms",
    categoryHu: "Művelet",
    categoryEn: "Operations",
    titleHu: "WMS kiesés",
    titleEn: "WMS outage",
    whyHu: "Ha a raktárszoftver sötét, a dokk és a papír viszi a sort.",
    whyEn: "If warehouse software is dark, the dock and paper carry the flow.",
    jargon: ["wms", "dock", "vsm"],
    keywords: ["wms", "raktár", "kiesés", "sötét it"],
    deepDiveHu:
      "A WMS a raktárirányító. A motor offline: nincs felhőfüggés a szimulációhoz. Kieséskor a kérdés a dokk kapuideje, a készletpapír és a kulcsember — nem a képernyő. A BCP-lecke a vállalati történet; ez a lecke a műveleti szabály: mérd a kaput, ne várd a szervert. A KPI sáv nem WMS-állapot.",
    deepDiveEn:
      "WMS is warehouse control. The engine is offline: the simulation has no cloud dependency. In an outage the question is dock gate time, stock paper and the key person — not the screen. The BCP lesson is the corporate story; this lesson is the ops rule: time the gate, do not wait for the server. The KPI bar is not WMS status.",
    steps: [
      step("s1", "Sötét", "Dark", "Ha a WMS áll, a dokkóra a forrás.", "If WMS is down, the dock clock is the source.", "WMS sötét / dokkóra", "WMS dark / dock clock"),
      step("s2", "Papír", "Paper", "A készletsor papíron. Ez a VSM most.", "The stock line on paper. That is VSM now.", "WMS nélkül papír", "Paper without WMS"),
      step("s3", "Ne várd", "Do not wait", "A szimuláció a gépeden fut. A kapu is.", "The simulation runs on your machine. So does the gate.", "WMS vs. helyi motor", "WMS vs local engine"),
    ],
  }),
  motor({
    slug: "poka-yoke",
    categoryHu: "Lean",
    categoryEn: "Lean",
    titleHu: "Poka-Yoke",
    titleEn: "Poka-Yoke",
    whyHu: "Ne lehessen elrontani. A motor megkérdez, nem ír titokban.",
    whyEn: "Make the error hard. The engine asks; it does not write in silence.",
    jargon: ["pokaYoke", "want", "vat"],
    keywords: ["poka-yoke", "hibaellenes", "megelőzés", "selejt"],
    deepDiveHu:
      "Poka-Yoke: folyamatba épített hibamegelőzés. A motorban: WANT keret túllépés megerősítése, Szummában tiltott import, gyanús ÁFA-kulcs jelölése, konzisztencia lámpa. Nem büntetés — a hiba drágább, mint a kérdés. A fizikai oldalon a hibaindex a sérült lépést számolja. Egy zárat fogadj el, ne mindet kapcsold ki.",
    deepDiveEn:
      "Poka-Yoke: mistake-proofing built into the process. In the engine: WANT-cap confirm, import blocked in Szumma, flagged VAT rate, consistency lamp. Not punishment — the error is costlier than the question. On the physical side the fault index counts a broken step. Accept one lock; do not switch them all off.",
    steps: [
      step("s1", "Zár", "Lock", "A WANT / import / ÁFA kérdés Poka-yoke.", "WANT / import / VAT prompts are poka-yoke.", "Poka-yoke megerősítés", "Poka-yoke confirm"),
      step("s2", "Lámpa", "Lamp", "A piros konzisztencia a forrást kéri, nem a KPI-t.", "A red lamp asks for the source, not the KPI.", "Poka-yoke lámpa", "Poka-yoke lamp"),
      step("s3", "Ne kapcsold ki", "Do not disable", "Ha mindig felülírod, a hiba olcsónak tűnik.", "If you always override, the error looks cheap.", "Poka-yoke felülírás", "Poka-yoke override"),
    ],
  }),
  motor({
    slug: "otos-s",
    categoryHu: "Lean",
    categoryEn: "Lean",
    titleHu: "5S / rend",
    titleEn: "5S / order",
    whyHu: "Ami kell, az kéznél van. A keresés mozgás-muda — a nézet is.",
    whyEn: "What you need is at hand. Searching is motion muda — the view too.",
    jargon: ["fiveS", "muda", "pdca"],
    keywords: ["5s", "ötös", "rend", "seiri", "admin"],
    deepDiveHu:
      "5S: Seiri–Seiton–Seiso–Seiketsu–Shitsuke. A motor a kézi admin mozgást és a nézetzajot számolja ide. A paletta/split a képernyő 5S-e; a Tételek szűrése a sor 5S-e. A tanácsadó PDCA-módhoz ad checklistet. Nem takarítás-erkölcs: kevesebb keresés, kevesebb súrlódás. Előbb egy fiók / egy szűrő, aztán a következő.",
    deepDiveEn:
      "5S: Sort–Set–Shine–Standardise–Sustain. The engine counts manual admin motion and view noise here. Palette/split is 5S on screen; Ledger filters are 5S on the line. The consultant gives a checklist per PDCA mode. Not cleaning morals: less search, less friction. One drawer / one filter first, then the next.",
    steps: [
      step("s1", "Zaj", "Noise", "Vedd le, ami nem kell a nézetből vagy a sorból.", "Remove what you do not need from the view or the line.", "5S felesleg", "5S unused"),
      step("s2", "Hely", "Place", "A tételnek és a Slotra való szűrőnek legyen helye.", "Give the posting and the Slot filter a place.", "5S hely / szűrő", "5S place / filter"),
      step("s3", "Egy", "One", "Egy checklist-sor a tanácsadóból. Mérj.", "One checklist row from the consultant. Measure.", "5S checklist", "5S checklist"),
    ],
  }),
  motor({
    slug: "ev",
    categoryHu: "Kiadás",
    categoryEn: "Spend",
    titleHu: "EV számla",
    titleEn: "EV invoice",
    whyHu: "Külső ev. díj, bruttó. Nem bér — de ugyanúgy viszi a cashflow-t.",
    whyEn: "External sole-trader fee, gross. Not payroll — it still hits cashflow.",
    jargon: ["ev", "vat", "cashflow"],
    keywords: ["ev", "egyéni", "alvállalkozó", "számla"],
    deepDiveHu:
      "Az EV sor külső számla: bruttó, ÁFA-körrel. Nem bér, nem EFO napidíj. A burnbe beleszámít, a NEED/INVEST címke a tartalomtól függ. Heijunka: ha minden ev. ugyanarra a hétre esik, a 60 nap hazudik. Ne keverd a magán Slottal a céges ev.-t. A motor nem „olcsóbb mint a bér” erkölcsöt ad — likviditást.",
    deepDiveEn:
      "An EV line is an external invoice: gross, with the VAT cycle. Not payroll, not an EFO day rate. It counts in burn; NEED/INVEST depends on the content. Heijunka: if every EV lands in the same week, the 60 days lie. Do not mix a company EV onto the Personal Slot. The engine does not moralise “cheaper than payroll” — it talks liquidity.",
    steps: [
      step("s1", "Címke", "Label", "EV = külső számla. Nem bér, nem EFO.", "EV = external invoice. Not payroll, not EFO.", "EV tétel típusa", "EV posting type"),
      step("s2", "ÁFA", "VAT", "Bruttó sorból a kör számol. Zárd a tartalékot.", "The cycle computes from gross. Lock the reserve.", "EV + ÁFA-kör", "EV + VAT cycle"),
      step("s3", "Nap", "Day", "Ne egy hétre zsúfold. A burn egyenletesebb.", "Do not pile them in one week. Burn is smoother.", "EV heijunka", "EV heijunka"),
    ],
  }),
  motor({
    slug: "efo",
    categoryHu: "Kiadás",
    categoryEn: "Spend",
    titleHu: "EFO napidíj",
    titleEn: "EFO day rate",
    whyHu: "Alkalmi napidíj, bruttó. Nem havi bér — a naptár viszi a burnt.",
    whyEn: "Casual day rate, gross. Not a monthly salary — the calendar eats burn.",
    jargon: ["efo", "heijunka", "burn"],
    keywords: ["efo", "alkalmi", "napidíj", "egyszerűsített"],
    deepDiveHu:
      "Az EFO egyszerűsített foglalkoztatás: napi bruttó, nem havi bér. A motor a napokat összeadja a burnbe. Ha egy hétre sűríted, Heijunka-csúcs. NEED, ha nélkülük megáll a sor; WANT, ha „jól jön”. Az ÁFA-kör más, mint az EV számla — ne keverd a kulcsot. A CHECK a túlórázott hetet súrlódásnak is láthatja.",
    deepDiveEn:
      "EFO is simplified employment: a gross day rate, not a monthly salary. The engine adds the days into burn. Pile them into one week and you get a Heijunka peak. NEED if the line stops without them; WANT if it is “nice to have”. The VAT cycle differs from an EV invoice — do not mix the rate. CHECK may also read an overtime week as friction.",
    steps: [
      step("s1", "Nap", "Day", "EFO = napidíj. Add a napokat, ne a „havi bért”.", "EFO = day rate. Add the days, not a “monthly wage”.", "EFO napidíj tétel", "EFO day-rate posting"),
      step("s2", "Hét", "Week", "Egy hétre zsúfolt nap = csúcs. Told szét.", "Days piled in one week = a peak. Spread them.", "EFO csúcs", "EFO peak"),
      step("s3", "Címke", "Label", "NEED, ha a sor áll nélküle. Különben WANT.", "NEED if the line stops without it. Otherwise WANT.", "EFO NEED vs WANT", "EFO NEED vs WANT"),
    ],
  }),
  motor({
    slug: "surladas",
    categoryHu: "Lean",
    categoryEn: "Lean",
    titleHu: "Súrlódás",
    titleEn: "Friction",
    whyHu: "Rejtett díj, késés, kétszer megcsinált munka. Forintban a CHECK-en.",
    whyEn: "Hidden fee, delay, work done twice. In forints on CHECK.",
    jargon: ["friction", "muda", "idleCash"],
    keywords: ["súrlódás", "friction", "díj", "késés", "újraküldés"],
    deepDiveHu:
      "A súrlódás a CHECK-en forint. Díjak, késedelmek, ismételt lépések — nem a NEED ára, hanem ami ráül. A motor a banki közreműködői díjat, a kézi újrakönyvelést és a várakozó kintlévőséget ide rakja. Holtpénz ott áll; súrlódás mozog és visz. Egy Kaizen: egy díjforrás vagy egy ismételt lépés, aztán mérés. Ne a KPI-t „javítsd”.",
    deepDiveEn:
      "Friction is forints on CHECK. Fees, delays, repeated steps — not the price of NEED, but what sits on top. The engine puts bank intermediary fees, manual re-booking and waiting receivables here. Idle cash sits; friction moves and eats. One Kaizen: one fee source or one repeated step, then measure. Do not “fix” the KPI.",
    steps: [
      step("s1", "CHECK", "CHECK", "Olvasd a súrlódás forintját a CHECK-en.", "Read friction forints on CHECK.", "Súrlódás a CHECK-en", "Friction on CHECK"),
      step("s2", "Forrás", "Source", "Díj, késés vagy dupla sor. Válassz egyet.", "Fee, delay or a double line. Pick one.", "Súrlódás forrása", "Friction source"),
      step("s3", "Egy", "One", "Egy beavatkozás. A holtpénz más kérdés.", "One intervention. Idle cash is a different question.", "Súrlódás Kaizen", "Friction Kaizen"),
    ],
  }),
];
