import { useEffect, useMemo, useState, type FormEvent } from "react";

import { formatCurrency } from "@/i18n/currency";
import { LangSwitch, useSiteLocale } from "@/i18n/miniLocale";
import { MONTHLY_HUF, YEARLY_DISCOUNT_PCT, yearlyPriceHuf } from "../server/catalog";
import {
  countryFromTaxId,
  countryLabel,
  resolveVat,
  SELLER_COUNTRY,
  splitVat,
  VAT_COUNTRIES,
} from "../../src/content/pricing/vat";
import { SiteFooter } from "@/components/SiteFooter";
import { formatRenewalDate, nextRenewalDate } from "@/lib/billingRenewal";
import type { BillingInterval } from "@/lib/funnelOrder";
import { billCopy, tierLabel } from "./copy";

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

export function App() {
  const { locale, toggleLocale } = useSiteLocale();
  const t = billCopy(locale);
  const money = (n: number) => formatCurrency(n, locale);
  const q = useMemo(() => new URLSearchParams(window.location.search), []);
  const tier = q.get("tier") ?? "pro";
  const ref = q.get("ref") ?? "";
  const referral = (q.get("referral") ?? "").trim().toUpperCase();
  const slotPack = q.get("slotPack") ?? "";
  const thanks = q.get("thanks") === "1";
  const orderQ = q.get("order") ?? "";

  const [interval, setInterval] = useState<BillingInterval>(
    () => (q.get("interval") === "monthly" ? "monthly" : "yearly"),
  );
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
  const [lookupOk, setLookupOk] = useState(false);
  const [transfer, setTransfer] = useState<TransferInfo | null>(null);
  const [cfg, setCfg] = useState({ stripe: false, barion: false, transfer: true });

  useEffect(() => {
    document.title = locale === "en" ? "Szcenárió — payment" : "Szcenárió — fizetés";
  }, [locale]);

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
  const saveNet = monthlyNet * 12 - yearlyNet;
  const vatPct = Math.round(vat.rate);
  const planTitle = `${tierLabel(locale, tier)} · ${interval === "yearly" ? t.yearlySub : t.monthlySub}`;
  const renewalLabel = t.nextRenewal.replace(
    "{date}",
    formatRenewalDate(nextRenewalDate(interval), locale),
  );

  const setBillingInterval = (next: BillingInterval) => {
    setInterval(next);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("interval", next);
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    } catch {
      // ignore
    }
  };

  const lookup = async () => {
    setLookupBusy(true);
    setLookupNote(null);
    setLookupOk(false);
    setError(null);
    try {
      const res = await fetch("/api/billing/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ taxId }),
      });
      const data = (await res.json()) as { ok?: boolean; name?: string; address?: string; source?: string; error?: string };
      if (!data.ok) {
        setLookupNote(t.lookupEmpty);
        return;
      }
      if (data.name) setName(data.name);
      if (data.address) setAddress(data.address);
      setLookupOk(true);
      setLookupNote(data.source === "vies" ? t.lookupVies : t.lookupNav);
    } catch {
      setLookupNote(t.lookupOffline);
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
        setError(data.error || t.errOrder);
        return;
      }
      if (data.hostedUrl) {
        window.location.href = data.hostedUrl;
        return;
      }
      if (data.transfer) setTransfer(data.transfer);
    } catch {
      setError(t.errNet);
    } finally {
      setBusy(false);
    }
  };

  const top = (
    <div className="top">
      <div className="brand">{t.brand}</div>
      <div className="top-right">
        <LangSwitch locale={locale} onToggle={toggleLocale} />
      </div>
    </div>
  );

  if (thanks) {
    return (
      <div className="wrap">
        {top}
        <h1>{t.thanksTitle}</h1>
        <p className="muted">
          {t.thanksBody} {orderQ ? `${t.order}: ${orderQ}` : ""}
        </p>
        <SiteFooter inline />
      </div>
    );
  }

  if (transfer) {
    const net = transfer.netHuf ?? Math.round(transfer.amountHuf / 1.27);
    const ratePct = Math.round(transfer.vatRate ?? (net > 0 ? ((transfer.amountHuf - net) / net) * 100 : 0));
    return (
      <div className="wrap">
        {top}
        <h1>{t.transferTitle}</h1>
        <p className="muted">{t.transferLead}</p>
        {transfer.proformaNumber ? (
          <p className="ok">
            {t.proforma}: {transfer.proformaNumber} {t.proformaMail}
          </p>
        ) : null}
        <div className="steps" style={{ marginTop: 16 }}>
          <div className="step">
            <b>{t.stepAmount}</b>
            <div className="code">
              {t.gross} {money(transfer.amountHuf)}
            </div>
            <div className="hint">
              ({t.net} {money(net)} + {ratePct}% {t.vatShort})
              {transfer.buyerCountry ? ` · ${countryLabel(transfer.buyerCountry, locale)}` : ""}
            </div>
          </div>
          <div className="step">
            <b>{t.stepPayee}</b>
            <div className="code">{transfer.name}</div>
            <div className="hint">{transfer.bank}</div>
          </div>
          <div className="step">
            <b>{t.stepIban}</b>
            <div className="code">{transfer.iban}</div>
          </div>
          <div className="step">
            <b>{t.stepMemo}</b>
            <div className="code">{transfer.code}</div>
            <div className="hint">{t.stepMemoHint}</div>
          </div>
        </div>
        <SiteFooter inline />
      </div>
    );
  }

  return (
    <div className="wrap">
      {top}
      <h1>{t.payTitle}</h1>
      <p className="muted">
        {ref === "campus" ? `${t.campus}. ` : ""}
        {t.cardNote}
      </p>

      <form className="card" style={{ marginTop: 16 }} onSubmit={(e) => void submit(e)}>
        <div className="grid2">
          <label>
            {t.name}
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="organization" required />
          </label>
          <label>
            {t.email}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
        </div>
        <div className="row">
          <label>
            {t.country}
            <select value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())}>
              {VAT_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {countryLabel(c, locale)} ({c})
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.address}
            <input value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" required />
          </label>
          <label>
            {t.taxId}
            <input value={taxId} onChange={(e) => setTaxId(e.target.value)} autoComplete="off" placeholder={t.taxPh} />
          </label>
          <button type="button" className="btn" disabled={lookupBusy || taxId.trim().length < 8} onClick={() => void lookup()}>
            {lookupBusy ? t.lookupBusy : t.lookup}
          </button>
          {lookupNote ? <div className={lookupOk ? "ok" : "hint"}>{lookupNote}</div> : null}
        </div>

        <div className="card summary-card" style={{ marginTop: 4 }}>
          <div className="cycle-toggle" role="group" aria-label={t.cycleMonthly}>
            <button
              type="button"
              className={interval === "yearly" ? "on" : ""}
              aria-pressed={interval === "yearly"}
              onClick={() => setBillingInterval("yearly")}
            >
              {t.cycleYearly.replace("{n}", String(YEARLY_DISCOUNT_PCT))}
            </button>
            <button
              type="button"
              className={interval === "monthly" ? "on" : ""}
              aria-pressed={interval === "monthly"}
              onClick={() => setBillingInterval("monthly")}
            >
              {t.cycleMonthly}
            </button>
          </div>
          <div style={{ marginTop: 14, fontSize: 14, fontWeight: 650 }}>{planTitle}</div>
          <div style={{ marginTop: 10, fontSize: 22, fontWeight: 700 }}>
            {t.gross} {money(due.gross)} {interval === "yearly" ? t.perYear : t.perMonth}
          </div>
          <div className="muted" style={{ marginTop: 6 }}>
            ({t.net} {money(due.net)} + {vatPct}% {t.vatShort})
          </div>
          {interval === "yearly" && saveNet > 0 ? (
            <div className="save-pill">{t.savePctYearly.replace("{n}", String(YEARLY_DISCOUNT_PCT))}</div>
          ) : null}
          <div className="renewal">{renewalLabel}</div>
        </div>

        <div className="row">
          <div className="muted">{t.payMethod}</div>
          <div className="pay">
            <button type="button" className={payMethod === "hu_transfer" ? "on" : ""} onClick={() => setPayMethod("hu_transfer")}>
              {t.transfer}
            </button>
            <button type="button" className={payMethod === "stripe" ? "on" : ""} onClick={() => setPayMethod("stripe")}>
              {t.stripe} {cfg.stripe ? "" : t.noKey}
            </button>
            <button type="button" className={payMethod === "barion" ? "on" : ""} onClick={() => setPayMethod("barion")}>
              {t.barion} {cfg.barion ? "" : t.noKey}
            </button>
          </div>
        </div>

        {error ? <p className="err">{error}</p> : null}
        <button className="btn primary" style={{ marginTop: 16, width: "100%" }} disabled={busy} type="submit">
          {busy ? t.busy : t.submit.replace("{n}", `${t.gross} ${money(due.gross)}`)}
        </button>
      </form>
      <SiteFooter inline />
    </div>
  );
}
