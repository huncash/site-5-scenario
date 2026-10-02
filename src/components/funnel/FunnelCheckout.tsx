import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import QRCode from "qrcode";

import { FunnelShell } from "@/components/funnel/FunnelShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CountryVatPicker } from "@/components/home/CountryVatPicker";
import { PriceBreakdown } from "@/components/home/PriceBreakdown";
import type { TierCopy, TierCore, TierId } from "@/content/pricing/tiers";
import { formatHuf, TIER_MONTHLY_HUF } from "@/content/pricing/tiers";
import { countryFromTaxId, resolveVat, SELLER_COUNTRY, splitVat } from "@/content/pricing/vat";
import {
  chargeHuf,
  newToken,
  writeActivationTicket,
  type BillingInterval,
  type PayMethod,
} from "@/lib/funnelOrder";
import { cn } from "@/lib/utils";

export function FunnelCheckout(props: {
  eyebrow: string;
  funnelName: string;
  tier: TierCore | null;
  copy: TierCopy | null;
}) {
  const { eyebrow, funnelName, tier, copy } = props;
  const navigate = useNavigate();
  const [interval, setInterval] = useState<BillingInterval>("yearly");
  const [country, setCountry] = useState(SELLER_COUNTRY);
  const [payMethod, setPayMethod] = useState<PayMethod>("hu_transfer");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [thanks, setThanks] = useState<{ url: string; email: string; qr: string; token: string } | null>(null);

  useEffect(() => {
    const raw = taxId.replace(/[\s./-]/g, "").toUpperCase();
    if (!/^[A-Z]{2}/.test(raw)) return;
    const inferred = countryFromTaxId(taxId);
    if (inferred) setCountry(inferred);
  }, [taxId]);

  const monthly = tier ? TIER_MONTHLY_HUF[tier.id] : 0;
  const vat = resolveVat({ country, taxId });
  const dueNet = tier ? chargeHuf(tier.id, interval) : 0;
  const due = splitVat(dueNet, vat.rate).gross;

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) window.history.back();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!tier || !copy) {
      setError("Válassz csomagot az előző oldalon.");
      return;
    }
    const n = name.trim();
    const m = email.trim();
    const addr = address.trim();
    if (!n || !m || !addr) {
      setError("Név, e-mail és számlázási cím kell a díjbekérőhöz.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) {
      setError("Az e-mail cím formája hibás.");
      return;
    }
    setError(null);
    const token = newToken();
    writeActivationTicket({
      token,
      createdAt: new Date().toISOString(),
      funnelName,
      tierId: tier.id as TierId,
      tierLabel: tier.label,
      interval,
      payMethod,
      amountHuf: due,
      emailHint: m.replace(/(^.).*(@.*$)/, "$1***$2"),
      profileLabel: n.slice(0, 48),
      used: false,
    });
    const url = `${window.location.origin}/login/activate?k=${encodeURIComponent(token)}`;
    setThanks({ url, email: m, qr: "", token });
    void QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 1, scale: 5 })
      .then((qr) => setThanks((cur) => (cur ? { ...cur, qr } : cur)))
      .catch(() => undefined);
  };

  if (thanks) {
    return (
      <FunnelShell
        eyebrow={eyebrow}
        title="Köszönjük a megrendelést"
        subtitle="Hamarosan e-mailt kapsz a díjbekérővel és az első belépéshez szükséges adattal. A fizetési szolgáltató még nincs bekötve — ez a folyamat placeholder."
      >
        <div className="mx-auto grid w-full max-w-xl gap-4">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-slate-200">
            A levél a(z) <span className="font-medium text-slate-50">{thanks.email}</span> címre megy (későbbi űrlap‑automatizáció).
            A számlázási adatok nem kerülnek az appba.
          </div>
          <div className="rounded-xl border border-border/60 bg-background/30 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Első belépés</div>
            <p className="mt-1 text-sm text-slate-300">
              A QR vagy a link a mesterjelszó beállításához visz. Nincs előre beégetett jelszó a programban.
            </p>
            {thanks.qr ? (
              <img src={thanks.qr} alt="Aktiváló QR" className="mx-auto mt-3 h-40 w-40 rounded-md bg-white p-1" />
            ) : null}
            <div className="mt-3 break-all rounded-md border border-border/50 bg-slate-950/40 px-3 py-2 font-mono text-[11px] text-slate-300">
              {thanks.url}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" onClick={() => void navigate({ to: "/login/activate", search: { k: thanks.token } })}>
                Aktiváló oldal
              </Button>
              <Button type="button" variant="outline" onClick={goBack}>
                Vissza
              </Button>
            </div>
          </div>
        </div>
      </FunnelShell>
    );
  }

  return (
    <FunnelShell
      eyebrow={eyebrow}
      title="Megrendelés"
      subtitle="Éves előfizetés az alapértelmezett. A fizetés díjbekérő után történik — a szolgáltatóintegráció később csatlakozik."
    >
      <div className="mx-auto grid w-full max-w-2xl gap-4">
        <div className="rounded-xl border border-border/60 bg-background/30 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Csomag</div>
          {tier && copy ? (
            <div className="mt-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-base font-semibold text-slate-100">{tier.label}</div>
                {tier.badge ? <Badge variant="secondary">{tier.badge}</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-slate-300">{copy.tagline}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-300">Nincs kiválasztott csomag. Lépj vissza.</p>
          )}
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          <fieldset className="rounded-xl border border-border/60 bg-background/30 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-100">Fizetési gyakoriság</legend>
            <div className="mt-2">
              <CountryVatPicker country={country} onChange={setCountry} />
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className={cn(
                  "rounded-lg border px-3 py-3 text-left",
                  interval === "yearly" ? "border-cyan-400/50 bg-cyan-500/10" : "border-border/60 bg-background/20",
                )}
                onClick={() => setInterval("yearly")}
              >
                <div className="text-sm font-semibold text-slate-100">Évente (alapértelmezett)</div>
                <div className="mt-2">
                  <PriceBreakdown netMonthly={monthly} interval="yearly" vat={vat} compact />
                </div>
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-lg border px-3 py-3 text-left",
                  interval === "monthly" ? "border-cyan-400/50 bg-cyan-500/10" : "border-border/60 bg-background/20",
                )}
                onClick={() => setInterval("monthly")}
              >
                <div className="text-sm font-semibold text-slate-100">Havonta</div>
                <div className="mt-2">
                  <PriceBreakdown netMonthly={monthly} interval="monthly" vat={vat} compact />
                </div>
              </button>
            </div>
            <div className="mt-3 text-sm text-slate-200">
              Fizetendő most: <span className="font-semibold text-slate-50">{formatHuf(due)} bruttó</span>
              {" · "}
              {formatHuf(dueNet)} nettó + {vat.labelHu}
              {interval === "yearly" ? " (egy év)" : " (első hónap)"}
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-border/60 bg-background/30 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-100">Fizetési mód</legend>
            <div className="mt-2 grid gap-2">
              <label className="flex items-start gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm">
                <input type="radio" name="pay" className="mt-1" checked={payMethod === "hu_transfer"} onChange={() => setPayMethod("hu_transfer")} />
                <span>
                  <span className="font-medium text-slate-100">Belföldi banki utalás</span>
                  <span className="mt-0.5 block text-[12px] text-slate-400">Díjbekérő alapján. A közlemény és a számlaadatok a levélben lesznek (placeholder).</span>
                </span>
              </label>
              <label className="flex items-start gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm">
                <input type="radio" name="pay" className="mt-1" checked={payMethod === "wise"} onChange={() => setPayMethod("wise")} />
                <span>
                  <span className="font-medium text-slate-100">Wise — nemzetközi utalás</span>
                  <span className="mt-0.5 block text-[12px] text-slate-400">Wise fogadóadatok a díjbekérőn (placeholder, nincs Wise‑API).</span>
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-border/60 bg-background/30 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-100">Számlázás és kapcsolat</legend>
            <p className="text-[12px] text-slate-400">Ezek a mezők a díjbekérőhöz kellenek. Az app nem tölti be őket a pénzügyekbe.</p>
            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-[12px] text-slate-300">
                Kapcsolattartó neve
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
              </label>
              <label className="grid gap-1 text-[12px] text-slate-300">
                Cég / számlázási név
                <Input value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
              </label>
              <label className="grid gap-1 text-[12px] text-slate-300">
                Adószám (ha van)
                <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} autoComplete="off" />
              </label>
              <label className="grid gap-1 text-[12px] text-slate-300">
                Számlázási cím
                <Input value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" required />
              </label>
              <label className="grid gap-1 text-[12px] text-slate-300">
                E-mail
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              </label>
            </div>
          </fieldset>

          {error ? <p className="text-[12px] text-rose-300">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="h-10" disabled={!tier}>
              Megrendelés elküldése
            </Button>
            <Button type="button" variant="outline" className="h-10" onClick={goBack}>
              Vissza
            </Button>
          </div>
        </form>
      </div>
    </FunnelShell>
  );
}
