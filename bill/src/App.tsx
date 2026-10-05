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
import { SiteKindProbe } from "@/components/SiteKindProbe";
import { billSearchFromLocation, readBillCheckoutSearch } from "@/lib/billing";
import { formatRenewalDate, nextRenewalDate } from "@/lib/billingRenewal";
import type { BillingInterval } from "@/lib/funnelOrder";
import { mainPublicOrigin } from "@/lib/siteSurface";
import { billCopy, statusLabel, tierLabel } from "./copy";

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

type PortalOrder = {
  id: string;
  status: string;
  amountHuf: number;
  netHuf?: number;
  vatRate?: number;
  tier: string;
  interval: string;
  payMethod: string;
  transferCode?: string;
  invoiceNumber?: string;
  proformaNumber?: string;
  buyerEmail?: string;
  buyerName?: string;
  buyerCountry?: string;
  transfer?: TransferInfo;
};

const PORTAL_KEY = "bill_portal_v1";

function readPortal(): PortalOrder | null {
  try {
    const raw = sessionStorage.getItem(PORTAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PortalOrder;
  } catch {
    return null;
  }
}

function writePortal(order: PortalOrder | null) {
  try {
    if (!order) sessionStorage.removeItem(PORTAL_KEY);
    else sessionStorage.setItem(PORTAL_KEY, JSON.stringify(order));
  } catch {
    // ignore
  }
}

function TransferSteps({
  t,
  transfer,
  money,
  locale,
}: {
  t: ReturnType<typeof billCopy>;
  transfer: TransferInfo;
  money: (n: number) => string;
  locale: "hu" | "en";
}) {
  const net = transfer.netHuf ?? Math.round(transfer.amountHuf / 1.27);
  const ratePct = Math.round(transfer.vatRate ?? (net > 0 ? ((transfer.amountHuf - net) / net) * 100 : 0));
  return (
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
  );
}

function LoginBar({
  t,
  onOpened,
}: {
  t: ReturnType<typeof billCopy>;
  onOpened: (order: PortalOrder) => void;
}) {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const tok = token.trim();
    const mail = email.trim().toLowerCase();
    if (!tok || !mail.includes("@")) {
      setError(t.loginNeed);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: tok, email: mail }),
      });
      const data = (await res.json()) as { ok?: boolean; order?: PortalOrder };
      if (!data.ok || !data.order) {
        setError(t.loginErr);
        return;
      }
      onOpened(data.order);
      setToken("");
    } catch {
      setError(t.errNet);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="login-bar" onSubmit={(e) => void submit(e)} aria-label={t.loginTitle}>
      <div className="login-bar-title">{t.loginTitle}</div>
      <div className="login-bar-fields">
        <label>
          {t.loginToken}
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            placeholder={t.loginTokenPh}
            required
          />
        </label>
        <label>
          {t.loginEmail}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <button type="submit" className="btn primary login-bar-btn" disabled={busy}>
          {busy ? t.loginBusy : t.loginSubmit}
        </button>
      </div>
      <p className="hint login-bar-hint">{t.loginHint}</p>
      {error ? <p className="err">{error}</p> : null}
    </form>
  );
}

export function App() {
  const { locale, toggleLocale } = useSiteLocale();
  const t = billCopy(locale);
  const money = (n: number) => formatCurrency(n, locale);
  const q = useMemo(() => readBillCheckoutSearch(billSearchFromLocation()), []);
  const hasCheckoutIntent = q.hasCheckoutIntent;
  const tier = q.tier ?? "pro";
  const ref = q.ref;
  const slotPack = q.slotPack;
  const addon = q.addon;
  const thanks = q.thanks;
  const orderQ = q.order;
  const pricingHref = `${mainPublicOrigin()}/#csomagok`;

  const [interval, setInterval] = useState<BillingInterval>(() => q.interval);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [country, setCountry] = useState(q.country || SELLER_COUNTRY);
  const [email, setEmail] = useState("");
  const [buyerKind, setBuyerKind] = useState<"b2c" | "b2b">("b2c");
  const [immediateConsent, setImmediateConsent] = useState(false);
  const [aszfAccepted, setAszfAccepted] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>("hu_transfer");
  const [busy, setBusy] = useState(false);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupNote, setLookupNote] = useState<string | null>(null);
  const [lookupOk, setLookupOk] = useState(false);
  const [transfer, setTransfer] = useState<TransferInfo | null>(null);
  const [cfg, setCfg] = useState({ stripe: false, barion: false, transfer: true });
  const [portal, setPortal] = useState<PortalOrder | null>(() =>
    typeof window === "undefined" ? null : readPortal(),
  );

  useEffect(() => {
    document.title = locale === "en" ? "Szcenárió — billing" : "Szcenárió — számlázás";
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
  const effectiveKind: "b2c" | "b2b" =
    taxId.replace(/[\s./-]/g, "").length >= 8 ? "b2b" : buyerKind;
  const mainOrigin = mainPublicOrigin();
  const aszfHref = `${mainOrigin}/aszf`;
  const gdprHref = `${mainOrigin}/gdpr`;

  const openPortal = (order: PortalOrder) => {
    writePortal(order);
    setPortal(order);
    setTransfer(null);
  };

  const closePortal = () => {
    writePortal(null);
    setPortal(null);
  };

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
    setError(null);
    if (effectiveKind === "b2b" && taxId.replace(/[\s./-]/g, "").length < 8) {
      setError(t.needTaxIdB2b);
      return;
    }
    if (!aszfAccepted || (effectiveKind === "b2c" && !immediateConsent)) {
      setError(t.needBuyerConsent);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          taxId,
          country,
          email,
          tier,
          interval,
          ref: ref || undefined,
          slotPack: slotPack || undefined,
          addon: addon || undefined,
          payMethod,
          partnerKind: effectiveKind,
          immediateConsent: effectiveKind === "b2c" ? immediateConsent : undefined,
          aszfAccepted,
        }),
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
    <>
      <div className="top">
        <a className="brand" href="/">
          {t.brand}
        </a>
        <div className="top-right">
          <LangSwitch locale={locale} onToggle={toggleLocale} />
        </div>
      </div>
      <SiteKindProbe kind="bill" search={billSearchFromLocation()} />
    </>
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

  if (portal) {
    return (
      <div className="wrap">
        {top}
        <div className="portal-head">
          <h1>{t.portalTitle}</h1>
          <button type="button" className="btn" onClick={closePortal}>
            {t.logout}
          </button>
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <div className="portal-row">
            <span className="muted">{t.order}</span>
            <span className="code">{portal.id}</span>
          </div>
          <div className="portal-row">
            <span className="muted">{t.portalStatus}</span>
            <span className="ok">{statusLabel(locale, portal.status)}</span>
          </div>
          <div className="portal-row">
            <span className="muted">{t.portalTier}</span>
            <span>
              {tierLabel(locale, portal.tier)} · {portal.interval === "monthly" ? t.monthlySub : t.yearlySub}
            </span>
          </div>
          <div className="portal-row">
            <span className="muted">{t.portalAmount}</span>
            <span>
              {t.gross} {money(portal.amountHuf)}
            </span>
          </div>
          {portal.proformaNumber ? (
            <div className="portal-row">
              <span className="muted">{t.portalProforma}</span>
              <span>{portal.proformaNumber}</span>
            </div>
          ) : null}
          {portal.invoiceNumber ? (
            <div className="portal-row">
              <span className="muted">{t.portalInvoice}</span>
              <span>{portal.invoiceNumber}</span>
            </div>
          ) : null}
          {portal.transferCode ? (
            <div className="portal-row">
              <span className="muted">{t.portalCode}</span>
              <span className="code">{portal.transferCode}</span>
            </div>
          ) : null}
        </div>
        {portal.transfer ? (
          <>
            <h2 style={{ fontSize: 18, margin: "24px 0 0" }}>{t.transferTitle}</h2>
            <p className="muted">{t.transferLead}</p>
            <TransferSteps t={t} transfer={portal.transfer} money={money} locale={locale} />
          </>
        ) : null}
        <SiteFooter inline />
      </div>
    );
  }

  if (transfer) {
    return (
      <div className="wrap">
        {top}
        <LoginBar t={t} onOpened={openPortal} />
        <h1>{t.transferTitle}</h1>
        <p className="muted">{t.transferLead}</p>
        {transfer.proformaNumber ? (
          <p className="ok">
            {t.proforma}: {transfer.proformaNumber} {t.proformaMail}
          </p>
        ) : null}
        <TransferSteps t={t} transfer={transfer} money={money} locale={locale} />
        <SiteFooter inline />
      </div>
    );
  }

  if (!hasCheckoutIntent) {
    return (
      <div className="wrap">
        {top}
        <h1>{t.homeTitle}</h1>
        <p className="muted">{t.homeLead}</p>
        <LoginBar t={t} onOpened={openPortal} />
        <p className="muted" style={{ marginTop: 20 }}>
          {t.homePickLead}
        </p>
        <div className="home-plans">
          <a className="btn" href="?tier=starter&interval=yearly">
            {t.homePickStarter}
          </a>
          <a className="btn primary" href="?tier=pro&interval=yearly">
            {t.homePickPro}
          </a>
          <a className="btn" href="?tier=expert&interval=yearly">
            {t.homePickExpert}
          </a>
        </div>
        <p className="muted" style={{ marginTop: 20 }}>
          <a className="home-cta" href={pricingHref}>
            {t.homePricingCta}
          </a>
        </p>
        <SiteFooter inline />
      </div>
    );
  }

  return (
    <div className="wrap">
      {top}
      <LoginBar t={t} onOpened={openPortal} />
      <h1>{t.payTitle}</h1>
      <p className="muted">
        {ref === "campus" ? `${t.campus}. ` : ""}
        {t.cardNote}
      </p>

      <form className="card" style={{ marginTop: 16 }} onSubmit={(e) => void submit(e)}>
        <div className="row" style={{ marginBottom: 12 }}>
          <div className="muted">{t.buyerKindTitle}</div>
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 8 }}>
            <input
              type="radio"
              name="buyerKind"
              checked={buyerKind === "b2c"}
              onChange={() => {
                setBuyerKind("b2c");
                setImmediateConsent(false);
              }}
            />
            <span>
              <b>{t.buyerB2c}</b>
              <div className="hint">{t.buyerB2cHint}</div>
            </span>
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 8 }}>
            <input
              type="radio"
              name="buyerKind"
              checked={buyerKind === "b2b"}
              onChange={() => setBuyerKind("b2b")}
            />
            <span>
              <b>{t.buyerB2b}</b>
              <div className="hint">{t.buyerB2bHint}</div>
            </span>
          </label>
          {effectiveKind === "b2c" ? (
            <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12 }}>
              <input
                type="checkbox"
                checked={immediateConsent}
                onChange={(e) => setImmediateConsent(e.target.checked)}
                required
              />
              <span className="hint">{t.b2cImmediateConsent}</span>
            </label>
          ) : (
            <p className="hint" style={{ marginTop: 12 }}>
              {t.b2bNoWithdrawal}
            </p>
          )}
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10 }}>
            <input
              type="checkbox"
              checked={aszfAccepted}
              onChange={(e) => setAszfAccepted(e.target.checked)}
              required
            />
            <span className="hint">
              {t.acceptAszf}{" "}
              <a href={aszfHref} target="_blank" rel="noreferrer">
                ÁSZF
              </a>
              {" · "}
              <a href={gdprHref} target="_blank" rel="noreferrer">
                GDPR
              </a>
            </span>
          </label>
        </div>
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
            {effectiveKind === "b2b" ? t.taxIdRequired : t.taxId}
            <input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              autoComplete="off"
              placeholder={t.taxPh}
              required={effectiveKind === "b2b"}
            />
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

export { App as BillingView };
