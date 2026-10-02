import { useEffect, useMemo, useState, type FormEvent } from "react";

type PayMethod = "stripe" | "barion" | "hu_transfer";

type TransferInfo = {
  amountHuf: number;
  iban: string;
  name: string;
  bank: string;
  code: string;
  label: string;
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
        body: JSON.stringify({ name, address, taxId, email, tier, interval, ref: ref || undefined, payMethod }),
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
    return (
      <div className="wrap">
        <div className="top">
          <div className="brand">Szcenárió · számla</div>
          <div className="muted">{transfer.label}</div>
        </div>
        <h1>Belföldi átutalás</h1>
        <p className="muted">A díjbekérőhez ezeket add meg a bankodban. A jóváírás után a számla automatikusan megy.</p>
        <div className="steps" style={{ marginTop: 16 }}>
          <div className="step">
            <b>1. Összeg</b>
            <div className="code">{money(transfer.amountHuf)}</div>
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
            Számlázási cím
            <input value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" required />
          </label>
          <label>
            Adószám
            <input value={taxId} onChange={(e) => setTaxId(e.target.value)} autoComplete="off" placeholder="12345678-2-41 vagy HU12345678" />
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
          {busy ? "Feldolgozás…" : "Tovább a fizetéshez"}
        </button>
      </form>
    </div>
  );
}
