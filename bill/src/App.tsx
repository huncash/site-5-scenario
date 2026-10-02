import { useEffect, useMemo, useState, type FormEvent } from "react";

import { MONTHLY_HUF, YEARLY_DISCOUNT_PCT, yearlyPriceHuf } from "../server/catalog";
import {
  countryFromTaxId,
  countryLabel,
  resolveVat,
  SELLER_COUNTRY,
  splitVat,
  VAT_COUNTRIES,
} from "../../src/content/pricing/vat";

type PayMethod = "stripe" | "barion" | "hu_transfer";

type TransferInfo = {
  amountHuf: number;
  netHuf?: number;
  vatRate?: number;
  vatCode?: string;
  vatTreatment?: string;
  vatLabel?: string;
  buyerCountry?: string;
  iban: string;
  name: string;
  bank: string;
  code: string;
  label: string;
  proformaNumber?: string;
};

const TIERS: Record<string, string> = {
  starter: "Alapcsomag",
  pro: "Üzleti / Pro",
  expert: "Nagyvállalati / Enterprise",
  campus: "Hallgatói / Campus",
};

function money(n: number) {
  return `${new Intl.NumberFormat("hu-HU").format(n)} Ft`;
}

export function App() {
  const q = useMemo(() => new URLSearchParams(window.location.search), []);
  const tier = q.get("tier") ?? "pro";
  const interval = q.get("interval") === "monthly" ? "monthly" : "yearly";
  const ref = q.get("ref") ?? "";
  const thanks = q.get("thanks") === "1";
  const orderQ = q.get("order") ?? "";

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [country, setCountry] = useState((q.get("country") || SELLER_COUNTRY).toUpperCase());
  const [email, setEmail] = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod>("hu_transfer");
  const [busy, setBusy] = useState(false);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupNote, setLookupNote] = useState<string | null>(null);
  const [transfer, setTransfer] = useState<TransferInfo | null>(null);
  const [cfg, setCfg] = useState({ stripe: false, barion: false, transfer: true });

  useEffect(() => {
    void fetch("/api/billing/config")
      .then((r) => r.json())
      .then((d) => setCfg({ stripe: !!d.stripe, barion: !!d.barion, transfer: true }))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const raw = taxId.replace(/[\s./-]/g, "").toUpperCase();
    if (!/^[A-Z]{2}/.test(raw)) return;
    const inferred = countryFromTaxId(taxId);
    if (inferred) setCountry(inferred);
  }, [taxId]);

  const monthlyNet = MONTHLY_HUF[tier as keyof typeof MONTHLY_HUF] ?? MONTHLY_HUF.pro;
  const vat = resolveVat({ country, taxId });
  const yearlyNet = yearlyPriceHuf(monthlyNet);
  const dueNet = interval === "yearly" ? yearlyNet : monthlyNet;
  const due = splitVat(dueNet, vat.rate);
  const yearly = splitVat(yearlyNet, vat.rate);
  const monthly12 = splitVat(monthlyNet * 12, vat.rate);
  const saveNet = monthlyNet * 12 - yearlyNet;

  const lookup = async () => {
    setLookupBusy(true);
    setLookupNote(null);
    setError(null);
    try {
      const res = await fetch("/api/billing/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ taxId }),
      });
      const data = (await res.json()) as { ok?: boolean; name?: string; address?: string; source?: string; error?: string };
      if (!data.ok) {
        setLookupNote(data.error || "Nincs találat.");
        return;
      }
      if (data.name) setName(data.name);
      if (data.address) setAddress(data.address);
      setLookupNote(data.source === "vies" ? "VIES kitöltötte a cégadatokat." : "NAV-proxy kitöltötte a cégadatokat.");
    } catch {
      setLookupNote("A lekérdezés most nem elérhető.");
    } finally {
      setLookupBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, address, taxId, country, email, tier, interval, ref: ref || undefined, payMethod }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        hostedUrl?: string;
        transfer?: TransferInfo;
      };
      if (!data.ok) {
        setError(data.error || "A rendelést nem sikerült rögzíteni.");
        return;
      }
      if (data.hostedUrl) {
        window.location.href = data.hostedUrl;
        return;
      }
      if (data.transfer) setTransfer(data.transfer);
    } catch {
      setError("Hálózati hiba.");
    } finally {
      setBusy(false);
    }
  };

  if (thanks) {
    return (
      <div className="wrap">
        <div className="top">
          <div className="brand">Szcenárió · számla</div>
        </div>
        <h1>Köszönjük</h1>
        <p className="muted">Ha a fizetés sikeres, a számla a megadott e-mailre megy. {orderQ ? `Rendelés: ${orderQ}` : ""}</p>
      </div>
    );
  }

  if (transfer) {
    const net = transfer.netHuf ?? Math.round(transfer.amountHuf / 1.27);
    const vatAmt = transfer.amountHuf - net;
    return (
      <div className="wrap">
        <div className="top">
          <div className="brand">Szcenárió · számla</div>
          <div className="muted">{transfer.label}</div>
        </div>
        <h1>Belföldi átutalás</h1>
        <p className="muted">A díjbekérőhöz ezeket add meg a bankodban. A jóváírás után a végszámla automatikusan megy.</p>
        {transfer.proformaNumber ? (
          <p className="ok">Díjbekérő: {transfer.proformaNumber} — a Számlázz.hu a megadott e-mailre is elküldi.</p>
        ) : null}
        <div className="steps" style={{ marginTop: 16 }}>
          <div className="step">
            <b>1. Összeg (bruttó fizetendő)</b>
            <div className="code">{money(transfer.amountHuf)}</div>
            <div className="hint">
              {money(net)} nettó + {transfer.vatLabel ?? transfer.vatCode ?? "ÁFA"}
              {vatAmt > 0 ? ` = ${money(vatAmt)}` : ""}
              {transfer.buyerCountry ? ` · ${countryLabel(transfer.buyerCountry)}` : ""}
            </div>
          </div>
          <div className="step">
            <b>2. Kedvezményezett</b>
            <div className="code">{transfer.name}</div>
            <div className="hint">{transfer.bank}</div>
          </div>
          <div className="step">
            <b>3. Számlaszám / IBAN</b>
            <div className="code">{transfer.iban}</div>
          </div>
          <div className="step">
            <b>4. Közlemény — ezt írd be pontosan</b>
            <div className="code">{transfer.code}</div>
            <div className="hint">Ebből párosítjuk a befizetést. Más szöveget ne tegyél mellé.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="top">
        <div className="brand">Szcenárió · számla</div>
        <div className="muted">bill.szcenario.hu</div>
      </div>
      <h1>Fizetés</h1>
      <p className="muted">
        {TIERS[tier] ?? tier} · {interval === "yearly" ? "éves" : "havi"}
        {ref === "campus" ? " · campus" : ""}. A kártyaadat a Stripe / Barion hosted oldalán marad.
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="muted">Listaár nettó. Fizetendő = nettó + ÁFA, a megrendelő országa szerint.</div>
        <div style={{ marginTop: 10, fontSize: 22, fontWeight: 650 }}>
          {money(due.gross)} bruttó {interval === "yearly" ? "/ év" : "/ hó"}
        </div>
        <div className="muted" style={{ marginTop: 6 }}>
          {money(due.net)} nettó · +{vat.labelHu}
          {due.vat > 0 ? ` = ${money(due.vat)}` : ""}
        </div>
        <div className="hint" style={{ marginTop: 8 }}>
          Éves csomag: {money(yearly.net)} nettó / {money(yearly.gross)} bruttó · −{YEARLY_DISCOUNT_PCT}%
        </div>
        <div className="hint">
          12× havi: {money(monthly12.net)} nettó / {money(monthly12.gross)} bruttó
        </div>
        {saveNet > 0 ? (
          <div className="ok" style={{ marginTop: 6 }}>
            Éves fizetéssel {money(saveNet)} nettóval kevesebb, mint 12 havi díj.
          </div>
        ) : null}
      </div>

      <form className="card" style={{ marginTop: 16 }} onSubmit={(e) => void submit(e)}>
        <div className="grid2">
          <label>
            Cégnév / név
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="organization" required />
          </label>
          <label>
            E-mail
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
        </div>
        <div className="row">
          <label>
            Megrendelő országa
            <select value={country} onChange={(e) => setCountry(e.target.value)}>
              {VAT_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {countryLabel(c)} ({c})
                </option>
              ))}
            </select>
          </label>
          <label>
            Számlázási cím
            <input value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" required />
          </label>
          <label>
            Adószám
            <input value={taxId} onChange={(e) => setTaxId(e.target.value)} autoComplete="off" placeholder="12345678-2-41 vagy DE123456789" />
          </label>
          <button type="button" className="btn" disabled={lookupBusy || taxId.trim().length < 8} onClick={() => void lookup()}>
            {lookupBusy ? "Lekérdezés…" : "Cégadatok NAV / VIES alapján"}
          </button>
          {lookupNote ? <div className={lookupNote.includes("kitöltötte") ? "ok" : "hint"}>{lookupNote}</div> : null}
        </div>

        <div className="row">
          <div className="muted">Fizetési mód</div>
          <div className="pay">
            <button type="button" className={payMethod === "hu_transfer" ? "on" : ""} onClick={() => setPayMethod("hu_transfer")}>
              Belföldi átutalás — díjbekérő, egyedi közlemény
            </button>
            <button type="button" className={payMethod === "stripe" ? "on" : ""} onClick={() => setPayMethod("stripe")}>
              Stripe — kártya, Apple Pay, Google Pay {cfg.stripe ? "" : "(kulcs nincs beállítva)"}
            </button>
            <button type="button" className={payMethod === "barion" ? "on" : ""} onClick={() => setPayMethod("barion")}>
              Barion — kártya, Apple Pay, Google Pay {cfg.barion ? "" : "(kulcs nincs beállítva)"}
            </button>
          </div>
        </div>

        {error ? <p className="err">{error}</p> : null}
        <button className="btn primary" style={{ marginTop: 16, width: "100%" }} disabled={busy} type="submit">
          {busy ? "Feldolgozás…" : `Tovább · ${money(due.gross)} bruttó`}
        </button>
      </form>
    </div>
  );
}
