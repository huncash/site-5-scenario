import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import QRCode from "qrcode";

import { BuyerKindFields } from "@/components/checkout/BuyerKindFields";
import { FunnelShell } from "@/components/funnel/FunnelShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CountryVatPicker } from "@/components/home/CountryVatPicker";
import { PriceBreakdown } from "@/components/home/PriceBreakdown";
import type { TierCopy, TierCore, TierId } from "@/content/pricing/tiers";
import { TIER_MONTHLY_HUF } from "@/content/pricing/tiers";
import { countryFromTaxId, resolveVat, SELLER_COUNTRY, splitVat } from "@/content/pricing/vat";
import { useI18n } from "@/i18n";
import { resolveBuyerKind, type BuyerKind } from "@/lib/buyerKind";
import { readCampaignAttribution } from "@/lib/campaignSession";
import { useBillingInterval } from "@/components/funnel/BillingIntervalToggle";
import {
  chargeHuf,
  newToken,
  writeActivationTicket,
  type PayMethod,
} from "@/lib/funnelOrder";
export function FunnelCheckout(props: {
  eyebrow: string;
  funnelName: string;
  tier: TierCore | null;
  copy: TierCopy | null;
}) {
  const { eyebrow, funnelName, tier, copy } = props;
  const navigate = useNavigate();
  const { t } = useI18n();
  const [interval, setInterval] = useBillingInterval();
  const [country, setCountry] = useState(SELLER_COUNTRY);
  const [payMethod, setPayMethod] = useState<PayMethod>("hu_transfer");
  const [buyerKind, setBuyerKind] = useState<BuyerKind>("b2c");
  const [immediateConsent, setImmediateConsent] = useState(false);
  const [aszfAccepted, setAszfAccepted] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [thanks, setThanks] = useState<{ url: string; email: string; qr: string; token: string } | null>(null);
  const effectiveKind = resolveBuyerKind(buyerKind, taxId);

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
      setError(t("pricing.pickTier"));
      return;
    }
    const n = name.trim();
    const m = email.trim();
    const addr = address.trim();
    if (!n || !m || !addr) {
      setError(t("pricing.needBilling"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) {
      setError(t("pricing.badEmail"));
      return;
    }
    const kind = resolveBuyerKind(buyerKind, taxId);
    if (kind === "b2b" && taxId.trim().length < 8) {
      setError(t("pricing.needTaxIdB2b"));
      return;
    }
    if (!aszfAccepted || (kind === "b2c" && !immediateConsent)) {
      setError(t("pricing.needBuyerConsent"));
      return;
    }
    setError(null);
    const token = newToken();
    const campaign = readCampaignAttribution();
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
      partnerKind: kind,
      campaignId: campaign?.id,
      utm: campaign?.utm,
    });
    const url = `${window.location.origin}/login/activate?k=${encodeURIComponent(token)}`;
    setThanks({ url, email: m, qr: "", token });
    void QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 1, scale: 5 })
      .then((qr) => setThanks((cur) => (cur ? { ...cur, qr } : cur)))
      .catch(() => undefined);
  };

  if (thanks) {
    return (
      <FunnelShell eyebrow={eyebrow} title={t("pricing.thanksTitle")} subtitle={t("pricing.thanksSub")}>
        <div className="mx-auto grid w-full max-w-xl gap-4">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-slate-200">
            {t("pricing.thanksMail", { email: thanks.email })}
          </div>
          <div className="rounded-xl border border-border/60 bg-background/30 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t("pricing.firstLogin")}</div>
            <p className="mt-1 text-sm text-slate-300">{t("pricing.firstLoginBody")}</p>
            {thanks.qr ? (
              <img src={thanks.qr} alt={t("pricing.firstLogin")} className="mx-auto mt-3 h-40 w-40 rounded-md bg-white p-1" />
            ) : null}
            <div className="mt-3 break-all rounded-md border border-border/50 bg-slate-950/40 px-3 py-2 font-mono text-[11px] text-slate-300">
              {thanks.url}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" onClick={() => void navigate({ to: "/login/activate", search: { k: thanks.token } })}>
                {t("pricing.activatePage")}
              </Button>
              <Button type="button" variant="outline" onClick={goBack}>
                {t("chrome.back")}
              </Button>
            </div>
          </div>
        </div>
      </FunnelShell>
    );
  }

  return (
    <FunnelShell eyebrow={eyebrow} title={t("pricing.checkoutTitle")} subtitle={t("pricing.checkoutSub")}>
      <div className="mx-auto grid w-full max-w-2xl gap-4">
        <div className="rounded-xl border border-border/60 bg-background/30 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t("pricing.pack")}</div>
          {tier && copy ? (
            <div className="mt-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-base font-semibold text-slate-100">{tier.label}</div>
                {tier.badge ? <Badge variant="secondary">{tier.badge}</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-slate-300">{copy.tagline}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-300">{t("pricing.noTier")}</p>
          )}
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          <fieldset className="rounded-xl border border-border/60 bg-background/30 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-100">{t("pricing.buyerCountry")}</legend>
            <div className="mt-2">
              <CountryVatPicker country={country} onChange={(c) => setCountry(c.toUpperCase())} />
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-border/60 bg-background/30 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-100">{t("pricing.payMethod")}</legend>
            <div className="mt-2 grid gap-2">
              <label className="flex items-start gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm">
                <input type="radio" name="pay" className="mt-1" checked={payMethod === "hu_transfer"} onChange={() => setPayMethod("hu_transfer")} />
                <span>
                  <span className="font-medium text-slate-100">{t("pricing.transfer")}</span>
                  <span className="mt-0.5 block text-[12px] text-slate-400">{t("pricing.transferHint")}</span>
                </span>
              </label>
              <label className="flex items-start gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm">
                <input type="radio" name="pay" className="mt-1" checked={payMethod === "wise"} onChange={() => setPayMethod("wise")} />
                <span>
                  <span className="font-medium text-slate-100">{t("pricing.wise")}</span>
                  <span className="mt-0.5 block text-[12px] text-slate-400">{t("pricing.wiseHint")}</span>
                </span>
              </label>
            </div>
          </fieldset>

          <BuyerKindFields
            kind={effectiveKind}
            onKindChange={(k) => {
              setBuyerKind(k);
              if (k === "b2c") {
                setImmediateConsent(false);
                setTaxId("");
              }
            }}
            immediateConsent={immediateConsent}
            onImmediateConsentChange={setImmediateConsent}
            aszfAccepted={aszfAccepted}
            onAszfAcceptedChange={setAszfAccepted}
          />

          <fieldset className="rounded-xl border border-border/60 bg-background/30 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-100">{t("pricing.billingContact")}</legend>
            <p className="text-[12px] text-slate-400">{t("pricing.billingNote")}</p>
            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-[12px] text-slate-300">
                {t("pricing.contactName")}
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
              </label>
              <label className="grid gap-1 text-[12px] text-slate-300">
                {t("pricing.companyName")}
                <Input value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
              </label>
              <label className="grid gap-1 text-[12px] text-slate-300">
                {effectiveKind === "b2b" ? t("pricing.taxIdRequired") : t("pricing.taxId")}
                <Input
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  autoComplete="off"
                  required={effectiveKind === "b2b"}
                />
              </label>
              <label className="grid gap-1 text-[12px] text-slate-300">
                {t("pricing.address")}
                <Input value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" required />
              </label>
              <label className="grid gap-1 text-[12px] text-slate-300">
                {t("pricing.email")}
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              </label>
            </div>
          </fieldset>

          {tier ? (
            <div className="rounded-xl border border-border/60 bg-background/30 p-4">
              <PriceBreakdown
                planLabel={tier.label}
                netMonthly={monthly}
                interval={interval}
                vat={vat}
                onIntervalChange={setInterval}
              />
            </div>
          ) : null}

          {error ? <p className="text-[12px] text-rose-300">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="h-10" disabled={!tier}>
              {t("pricing.submitOrder")}
            </Button>
            <Button type="button" variant="outline" className="h-10" onClick={goBack}>
              {t("chrome.back")}
            </Button>
          </div>
        </form>
      </div>
    </FunnelShell>
  );
}
