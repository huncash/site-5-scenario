import { useEffect, useState, type FormEvent } from "react";

import { getPlan, isPublicPlanId } from "@/config/plans";
import { planCardBullets } from "@/config/planCopy";
import { formatCurrency } from "@/i18n/currency";
import { LocaleProvider, useI18n } from "@/i18n";
import { checkoutGap, composeBuyerName, ingestAddress } from "../server/checkoutReady";
import { installmentAllowed, splitEqualParts } from "@/lib/installmentPlan";

type PayPlan = "full" | "installment2";
import {
  addonNetForTier,
  chargeHuf,
  isBillTier,
  isJitAddonId,
  isSlotPackId,
  JIT_ADDON_LABELS,
  SLOT_PACK_LABELS,
  slotPackAllowedForTier,
  slotPackNetForInterval,
} from "../server/catalog";
import {
  countryFromTaxId,
  countryLabel,
  resolveVat,
  SELLER_COUNTRY,
  splitVat,
  VAT_COUNTRIES,
} from "../../src/content/pricing/vat";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ViewSettingsMenu } from "@/components/ViewSettingsMenu";
import { SiteFooter } from "@/components/SiteFooter";
import { billCheckoutUrl, billSearchFromLocation, readBillCheckoutSearch } from "@/lib/billing";
import { bundleLockUpgradeCart, evaluateBundleLockFromCart } from "@/lib/bundleLock";
import { formatRenewalDate, nextRenewalDate } from "@/lib/billingRenewal";
import { enterpriseInquiryHref, ENTERPRISE_SELF_SERVE_CHECKOUT, isEnterprisePlanId } from "@/lib/enterpriseSchedule";
import type { BillingInterval } from "@/lib/funnelOrder";
import { mainPublicOrigin } from "@/lib/siteSurface";
import { withViewPrefs } from "@/lib/viewPrefs";
import { billCopy, statusLabel, tierLabel } from "./copy";
import { isBillingRoutingError, readBillingJson } from "./parseBillingJson";
import { PayLogos } from "./PayLogos.tsx";

type PayMethod = "barion" | "hu_transfer";

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
  pdfUrl?: string;
  pdfBase64?: string;
  buyerAccountUrl?: string;
  installment?: 1 | 2;
  dueAt?: string;
  payPlan?: string;
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

function pdfHref(transfer: TransferInfo, email?: string): string | undefined {
  if (transfer.pdfBase64) return `data:application/pdf;base64,${transfer.pdfBase64}`;
  const url = transfer.pdfUrl;
  if (!url) return undefined;
  if (url.startsWith("/") && email) {
    const u = new URL(url, window.location.origin);
    u.searchParams.set("email", email);
    return `${u.pathname}${u.search}`;
  }
  return url;
}

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
      const data = await readBillingJson<{ ok?: boolean; order?: PortalOrder }>(res);
      if (!data.ok || !data.order) {
        setError(t.loginErr);
        return;
      }
      onOpened(data.order);
      setToken("");
    } catch (err) {
      setError(isBillingRoutingError(err) ? t.errApiRouting : t.errNet);
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
  return (
    <LocaleProvider>
      <ThemeProvider>
        <BillingCheckout />
      </ThemeProvider>
    </LocaleProvider>
  );
}

export function BillingCheckout({ search }: { search?: string } = {}) {
  const { locale } = useI18n();
  const t = billCopy(locale);
  const money = (n: number) => formatCurrency(n, locale);
  const [q, setQ] = useState(() => readBillCheckoutSearch(search ?? billSearchFromLocation()));
  const hasCheckoutIntent = q.hasCheckoutIntent;
  const tier = q.tier ?? "pro";
  const ref = q.ref;
  const slotPack = q.slotPack;
  const addon = q.addon;
  const thanks = q.thanks;
  const orderQ = q.order;
  const pricingHref = withViewPrefs(`${mainPublicOrigin()}/#csomagok`);

  const [interval, setInterval] = useState<BillingInterval>(() => q.interval);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [nostr, setNostr] = useState("");
  const [country, setCountry] = useState(q.country || SELLER_COUNTRY);
  const [email, setEmail] = useState("");
  const [buyerKind, setBuyerKind] = useState<"b2c" | "b2b">("b2c");
  const [immediateConsent, setImmediateConsent] = useState(false);
  const [aszfAccepted, setAszfAccepted] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>("hu_transfer");
  const [payPlan, setPayPlan] = useState<PayPlan>("full");
  const [transfers, setTransfers] = useState<TransferInfo[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupNote, setLookupNote] = useState<string | null>(null);
  const [lookupOk, setLookupOk] = useState(false);
  const [transfer, setTransfer] = useState<TransferInfo | null>(null);
  const [cfg, setCfg] = useState({
    stripe: false,
    barion: false,
    transfer: true,
    sandbox: false,
    live: false,
    missingKeys: [] as string[],
    error: "",
  });
  const [portal, setPortal] = useState<PortalOrder | null>(() =>
    typeof window === "undefined" ? null : readPortal(),
  );

  useEffect(() => {
    const next = readBillCheckoutSearch(search ?? billSearchFromLocation());
    setQ(next);
    setInterval(next.interval);
    if (next.country) setCountry(next.country);
  }, [search]);

  useEffect(() => {
    document.title = locale === "en" ? "Szcenárió — billing" : "Szcenárió — számlázás";
  }, [locale]);

  useEffect(() => {
    void fetch("/api/billing/config")
      .then((r) =>
        readBillingJson<{
          stripe?: boolean;
          barion?: boolean;
          sandbox?: boolean;
          live?: boolean;
          missingKeys?: unknown;
          error?: string;
        }>(r),
      )
      .then((d) =>
        setCfg({
          stripe: !!d.stripe,
          barion: !!d.barion,
          transfer: true,
          sandbox: !!d.sandbox,
          live: !!d.live,
          missingKeys: Array.isArray(d.missingKeys) ? d.missingKeys.map(String) : [],
          error: typeof d.error === "string" ? d.error : "",
        }),
      )
      .catch((err) => {
        if (isBillingRoutingError(err)) {
          setCfg((c) => ({ ...c, error: t.errApiRouting }));
        }
      });
  }, [t.errApiRouting]);

  useEffect(() => {
    const raw = taxId.replace(/[\s./-]/g, "").toUpperCase();
    if (!/^[A-Z]{2}/.test(raw)) return;
    const inferred = countryFromTaxId(taxId);
    if (inferred) setCountry(inferred);
  }, [taxId]);

  const planTier = isBillTier(tier) ? tier : "pro";
  const plan = isPublicPlanId(planTier) || planTier === "campus" ? getPlan(planTier) : getPlan("pro");
  const vat = resolveVat({ country, taxId });
  let dueNet = chargeHuf(planTier, interval);
  if (addon && isJitAddonId(addon) && addon !== slotPack) {
    dueNet += addonNetForTier(addon, planTier);
  }
  if (slotPack && isSlotPackId(slotPack) && slotPackAllowedForTier(planTier)) {
    dueNet += slotPackNetForInterval(slotPack, interval);
  }
  const bundleLock = evaluateBundleLockFromCart({
    planId: planTier,
    addon,
    slotPack: slotPackAllowedForTier(planTier) ? slotPack : undefined,
  });
  const bundleNextLabel = bundleLock.nextTier ? tierLabel(locale, bundleLock.nextTier) : "";
  const due = splitVat(dueNet, vat.rate);
  const canInstallment = installmentAllowed(planTier, interval);
  const useInstallment = canInstallment && payPlan === "installment2";
  const dueNow = useInstallment ? splitVat(splitEqualParts(due.net)[0] ?? due.net, vat.rate) : due;
  const vatPct = Math.round(vat.rate);
  const planTitle = `${plan.label} · ${planTier === "campus" ? (interval === "yearly" ? t.yearlySub : t.monthlySub) : t.yearlySub}`;
  const bullets = planTier === "campus" ? [] : planCardBullets(plan, locale);
  const renewalLabel =
    planTier === "campus"
      ? t.nextRenewal.replace("{date}", formatRenewalDate(nextRenewalDate(interval), locale))
      : locale === "en"
        ? "Year-1 perpetual license. Optional updates: Y2 75% / Y3 60% of Year-1, then free."
        : "1. évi örökös licenc. Opcionális frissítés: 2. év 75% / 3. év 60% az 1. évi árból, majd díjmentes.";
  const composedName = composeBuyerName({
    partnerKind: buyerKind,
    lastName,
    firstName,
    companyName,
  });
  const gapHint = checkoutGap({
    name: composedName,
    lastName,
    firstName,
    companyName,
    address,
    zip,
    city,
    email,
    taxId,
    country,
    nostr,
    partnerKind: buyerKind,
    immediateConsent,
    aszfAccepted,
    payMethod,
  });
  const canSubmit =
    !busy &&
    !gapHint &&
    !bundleLock.tripped &&
    !(payMethod === "barion" && !cfg.barion) &&
    cfg.missingKeys.length === 0;

  const goBundleUpgrade = () => {
    if (!bundleLock.nextTier) return;
    if (bundleLock.nextTier === "expert" && !ENTERPRISE_SELF_SERVE_CHECKOUT) {
      window.location.assign(enterpriseInquiryHref({ locale }));
      return;
    }
    const kept = bundleLockUpgradeCart({ addon, slotPack });
    window.location.assign(
      billCheckoutUrl({
        tier: bundleLock.nextTier,
        interval,
        addon: kept.addon,
        country,
        partnerKind: buyerKind,
        hostname: window.location.hostname,
        pathname: window.location.pathname,
      }),
    );
  };
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
      if (data.name) setCompanyName(data.name);
      if (data.address) {
        const loc = ingestAddress({ address: data.address });
        if (loc.zip) setZip(loc.zip);
        if (loc.city) setCity(loc.city);
        setAddress(loc.address);
      }
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
    const gap = checkoutGap({
      name: composedName,
      lastName,
      firstName,
      companyName,
      address,
      zip,
      city,
      email,
      taxId,
      country,
      nostr,
      partnerKind: buyerKind,
      immediateConsent,
      aszfAccepted,
      payMethod,
    });
    if (gap) {
      setError(
        gap === "taxId"
          ? t.needTaxIdB2b
          : gap === "zip"
            ? t.needZip
            : gap === "nostr"
              ? t.needNostr
              : gap === "consent" || gap === "aszf"
                ? t.needBuyerConsent
                : t.needCheckout,
      );
      return;
    }
    if (payMethod === "barion" && !cfg.barion) {
      setError(t.liveKeysMissing.replace("{keys}", "BARION_POS_KEY"));
      return;
    }
    if (cfg.missingKeys.length) {
      setError(cfg.error || t.liveKeysMissing.replace("{keys}", cfg.missingKeys.join(", ")));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lastName: buyerKind === "b2c" ? lastName : undefined,
          firstName: buyerKind === "b2c" ? firstName : undefined,
          companyName: buyerKind === "b2b" ? companyName : undefined,
          name: composedName,
          zip,
          city,
          address,
          taxId: buyerKind === "b2b" ? taxId : taxId.trim() || undefined,
          country,
          email,
          nostr: nostr.trim() || undefined,
          tier,
          interval,
          ref: ref || undefined,
          slotPack: slotPack || undefined,
          addon: addon || undefined,
          payMethod,
          payPlan: useInstallment ? "installment2" : "full",
          partnerKind: buyerKind,
          immediateConsent: buyerKind === "b2c" ? immediateConsent : undefined,
          aszfAccepted,
        }),
      });
      const data = await readBillingJson<{
        ok?: boolean;
        error?: string;
        hostedUrl?: string;
        warning?: string;
        sandbox?: boolean;
        pdfUrl?: string;
        pdfBase64?: string;
        buyerAccountUrl?: string;
        transfer?: TransferInfo;
        transfers?: TransferInfo[];
      }>(res);
      if (!data.ok) {
        setError(data.error || t.errOrder);
        return;
      }
      if (data.hostedUrl) {
        window.location.href = data.hostedUrl;
        return;
      }
      if (data.transfers?.length) {
        setTransfers(data.transfers);
        setTransfer(data.transfers[0] ?? null);
        if (data.warning) setError(data.warning);
      } else if (data.transfer) {
        setTransfers(null);
        setTransfer({
          ...data.transfer,
          pdfUrl: data.pdfUrl ?? data.transfer.pdfUrl,
          pdfBase64: data.pdfBase64 ?? data.transfer.pdfBase64,
          buyerAccountUrl: data.buyerAccountUrl ?? data.transfer.buyerAccountUrl,
        });
        if (data.warning) setError(data.warning);
      }
    } catch (err) {
      setError(isBillingRoutingError(err) ? t.errApiRouting : t.errNet);
    } finally {
      setBusy(false);
    }
  };

  const top = (
    <div className="top">
      <a className="brand" href="/">
        {t.brand}
      </a>
      <div className="top-right">
        <ViewSettingsMenu />
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

  if (hasCheckoutIntent && isEnterprisePlanId(tier) && !ENTERPRISE_SELF_SERVE_CHECKOUT) {
    const expertPlan = getPlan("expert");
    return (
      <div className="wrap">
        {top}
        <h1>{t.expert}</h1>
        <p className="muted">{t.enterpriseBadge}</p>
        <p>
          {locale === "en" && expertPlan.priceEur > 0
            ? `€${expertPlan.priceEur.toLocaleString("en-IE")}`
            : `${expertPlan.priceHuf.toLocaleString("hu-HU")} Ft`}{" "}
          · {t.enterpriseInquiryLead}
        </p>
        <p className="home-plans" style={{ marginTop: 16 }}>
          <a
            className="btn primary"
            href={enterpriseInquiryHref({ locale })}
            onClick={(e) => {
              e.preventDefault();
              window.location.assign(enterpriseInquiryHref({ locale }));
            }}
          >
            {t.enterpriseCta}
          </a>
          <a className="btn" href={pricingHref}>
            {t.homePricingCta}
          </a>
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
            {pdfHref(portal.transfer, portal.buyerEmail) ? (
              <p>
                <a
                  className="btn primary"
                  href={pdfHref(portal.transfer, portal.buyerEmail)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.pdfDownload}
                </a>
              </p>
            ) : null}
            <TransferSteps t={t} transfer={portal.transfer} money={money} locale={locale} />
          </>
        ) : null}
        <SiteFooter inline />
      </div>
    );
  }

  if (transfer) {
    const parts = transfers?.length ? transfers : [transfer];
    return (
      <div className="wrap">
        {top}
        <LoginBar t={t} onOpened={openPortal} />
        <h1>{t.transferTitle}</h1>
        <p className="muted">{t.transferLead}</p>
        {parts.map((part, idx) => (
          <div key={`${part.code ?? idx}-${part.installment ?? 0}`} className="card" style={{ marginTop: 16 }}>
            {part.installment ? (
              <h2 style={{ fontSize: 16, margin: "0 0 8px" }}>
                {t.transferInstTitle.replace("{n}", String(part.installment))}
              </h2>
            ) : null}
            {part.proformaNumber ? (
              <p className="ok">
                {t.proformaReady} {t.proforma}: <span className="code">{part.proformaNumber}</span> {t.proformaMail}
              </p>
            ) : null}
            {pdfHref(part, email) || part.buyerAccountUrl ? (
              <p className="home-plans">
                {pdfHref(part, email) ? (
                  <a
                    className="btn primary"
                    href={pdfHref(part, email)}
                    download={part.pdfUrl?.startsWith("http") ? undefined : "dijbekero.pdf"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t.pdfDownload}
                  </a>
                ) : null}
                {part.buyerAccountUrl ? (
                  <a className="btn" href={part.buyerAccountUrl} target="_blank" rel="noreferrer">
                    {t.openBuyerAccount}
                  </a>
                ) : null}
              </p>
            ) : null}
            <TransferSteps t={t} transfer={part} money={money} locale={locale} />
          </div>
        ))}
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
          <a className="btn" href={withViewPrefs("/?tier=starter&interval=yearly")}>
            {t.homePickStarter}
          </a>
          <a className="btn primary" href={withViewPrefs("/?tier=pro&interval=yearly")}>
            {t.homePickPro}
          </a>
          <a
            className="btn"
            href={enterpriseInquiryHref({ locale })}
            onClick={(e) => {
              e.preventDefault();
              window.location.assign(enterpriseInquiryHref({ locale }));
            }}
          >
            {t.homePickExpert} — {t.enterpriseCta}
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
    <div className="wrap" data-bill-checkout-surface="">
      {top}
      {cfg.sandbox ? <p className="hint">{t.sandboxNote}</p> : null}
      {cfg.error || cfg.missingKeys.length ? (
        <p className="err">{cfg.error || t.liveKeysMissing.replace("{keys}", cfg.missingKeys.join(", "))}</p>
      ) : null}
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
                setTaxId("");
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
          {buyerKind === "b2c" ? (
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
        {buyerKind === "b2c" ? (
          <div className="grid2">
            <label>
              {t.lastName}
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </label>
            <label>
              {t.firstName}
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </label>
          </div>
        ) : (
          <label>
            {t.companyName}
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoComplete="organization"
              required
            />
          </label>
        )}
        <label>
          {t.email}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <span className="hint">{t.emailHint}</span>
        </label>
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
          <div className="grid2">
            <label>
              {t.zip}
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                autoComplete="postal-code"
                inputMode={country === "HU" ? "numeric" : "text"}
                required
              />
            </label>
            <label>
              {t.city}
              <input value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" required />
            </label>
          </div>
          <label>
            {t.address}
            <input value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" required />
          </label>
          {buyerKind === "b2b" ? (
            <>
              <label>
                {t.taxIdRequired}
                <input
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  autoComplete="off"
                  placeholder={t.taxPh}
                  required
                />
              </label>
              <button type="button" className="btn" disabled={lookupBusy || taxId.trim().length < 8} onClick={() => void lookup()}>
                {lookupBusy ? t.lookupBusy : t.lookup}
              </button>
              {lookupNote ? <div className={lookupOk ? "ok" : "hint"}>{lookupNote}</div> : null}
            </>
          ) : null}
          <label>
            {t.nostr}
            <input
              value={nostr}
              onChange={(e) => setNostr(e.target.value)}
              autoComplete="off"
              placeholder={t.nostrPh}
            />
            <span className="hint">{t.nostrHint}</span>
          </label>
        </div>

        <div className="card summary-card" style={{ marginTop: 4 }}>
          {planTier === "campus" ? (
            <div className="cycle-toggle" role="group" aria-label={t.cycleMonthly}>
              <button
                type="button"
                className={interval === "yearly" ? "on" : ""}
                aria-pressed={interval === "yearly"}
                onClick={() => setBillingInterval("yearly")}
              >
                {t.cycleYearly.replace("{n}", "0")}
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
          ) : null}
          <div style={{ marginTop: 14, fontSize: 14, fontWeight: 650 }}>{planTitle}</div>
          <div style={{ marginTop: 10, fontSize: 22, fontWeight: 700 }}>
            {t.gross} {money(due.gross)} {planTier === "campus" ? (interval === "yearly" ? t.perYear : t.perMonth) : ""}
          </div>
          <div className="muted" style={{ marginTop: 6 }}>
            ({t.net} {money(due.net)} + {vatPct}% {t.vatShort})
          </div>
          {useInstallment ? (
            <div className="hint" style={{ marginTop: 8 }}>
              {t.installmentNow}: {t.gross} {money(dueNow.gross)}
              <br />
              {t.installmentLater}: {t.gross} {money(due.gross - dueNow.gross)}
            </div>
          ) : null}
          {bullets.length ? (
            <ul className="hint" style={{ marginTop: 10, paddingLeft: 18 }}>
              {bullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
          {addon && isJitAddonId(addon) ? (
            <div className="hint" style={{ marginTop: 8 }}>
              {JIT_ADDON_LABELS[addon]}
            </div>
          ) : null}
          {slotPack && isSlotPackId(slotPack) && slotPack !== addon ? (
            <div className="hint" style={{ marginTop: 8 }}>
              {SLOT_PACK_LABELS[slotPack]}
            </div>
          ) : null}
          <div className="renewal">{renewalLabel}</div>
        </div>

        {canInstallment ? (
          <div className="row">
            <div className="muted">{t.payPlan}</div>
            <div className="pay">
              <button type="button" className={payPlan === "full" ? "on" : ""} onClick={() => setPayPlan("full")}>
                <span>{t.payFull}</span>
                <span className="pay-sub">{t.payFullHint}</span>
              </button>
              <button
                type="button"
                className={payPlan === "installment2" ? "on" : ""}
                onClick={() => setPayPlan("installment2")}
              >
                <span>{t.payInstallment}</span>
                <span className="pay-sub">{t.payInstallmentHint}</span>
              </button>
            </div>
          </div>
        ) : null}

        <div className="row">
          <div className="muted">{t.payMethod}</div>
          <div className="pay">
            <button type="button" className={payMethod === "hu_transfer" ? "on" : ""} onClick={() => setPayMethod("hu_transfer")}>
              <span>{t.transfer}</span>
              <span className="pay-sub">{t.transferHint}</span>
            </button>
            <button type="button" className={payMethod === "barion" ? "on" : ""} onClick={() => setPayMethod("barion")}>
              <span>{t.barion}</span>
              <span className="pay-sub">
                {t.barionHint}
                {cfg.barion ? "" : ` ${t.noKey}`}
              </span>
            </button>
          </div>
        </div>

        {bundleLock.tripped ? (
          <div className="card" style={{ marginTop: 16, borderColor: "var(--border)" }}>
            <div style={{ fontSize: 14, fontWeight: 650 }}>{t.bundleLockTitle}</div>
            <p className="hint" style={{ marginTop: 8 }}>
              {t.bundleLockBody
                .replaceAll("{next}", bundleNextLabel)
                .replace("{upgrade}", money(bundleLock.upgradeNet))
                .replace("{stay}", money(bundleLock.stayNet))
                .replace("{save}", money(bundleLock.saveHuf))}
            </p>
            <p className="err" style={{ marginTop: 8 }}>
              {t.bundleLockBlocked}
            </p>
            <button type="button" className="btn primary" style={{ marginTop: 12, width: "100%" }} onClick={goBundleUpgrade}>
              {bundleLock.nextTier === "expert" && !ENTERPRISE_SELF_SERVE_CHECKOUT
                ? t.bundleLockInquiry
                : t.bundleLockCta.replace("{next}", bundleNextLabel)}
            </button>
          </div>
        ) : null}
        {error ? <p className="err">{error}</p> : null}
        {gapHint && !bundleLock.tripped ? <p className="hint poka-hint">{t.needCheckout}</p> : null}
        <button
          className="btn primary"
          style={{ marginTop: 16, width: "100%" }}
          disabled={!canSubmit}
          type="submit"
        >
          {busy ? t.busy : t.submit.replace("{n}", `${t.gross} ${money(dueNow.gross)}`)}
        </button>
        <PayLogos alt={t.payLogosAlt} />
      </form>
      <SiteFooter inline />
    </div>
  );
}

export { App as BillingView };
