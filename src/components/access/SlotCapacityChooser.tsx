import { useMemo, useState } from "react";
import { Gift, PackagePlus } from "lucide-react";

import { AddonPriceLine } from "@/components/home/AddonPriceLine";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveVat, SELLER_COUNTRY } from "@/content/pricing/vat";
import { useI18n } from "@/i18n";
import { billCheckoutUrl } from "@/lib/billing";
import { evaluateBundleLockFromCart, type BundleLockDecision } from "@/lib/bundleLock";
import { ENTERPRISE_SELF_SERVE_CHECKOUT, enterpriseInquiryHref } from "@/lib/enterpriseSchedule";
import type { BillingInterval } from "@/lib/funnelOrder";
import { readLicense, readSlotLedger } from "@/lib/license";
import { ensureReferralCode } from "@/lib/referral";
import {
  publicSlotPacksForTier,
  slotPackLabel,
  totalScenarioSlots,
  type SlotPackId,
} from "@/lib/scenarioSlots";

function licenseInterval(): BillingInterval {
  const lic = readLicense();
  return lic?.interval === "monthly" ? "monthly" : "yearly";
}

export function SlotCapacityChooser(props: {
  used: number;
  onClose?: () => void;
  className?: string;
}) {
  const { t, locale, money } = useI18n();
  const ledger = readSlotLedger();
  const limit = totalScenarioSlots(ledger);
  const packs = publicSlotPacksForTier(ledger.tier);
  const referral = ensureReferralCode();
  const lic = readLicense();
  const tier = lic?.tier && lic.tier !== "local" ? lic.tier : "pro";
  const interval = licenseInterval();
  const vat = resolveVat({ country: SELLER_COUNTRY });
  const [lockOffer, setLockOffer] = useState<BundleLockDecision | null>(null);
  const ownedSlotPacks = useMemo(() => {
    if (lic?.slotPacks?.length) return lic.slotPacks;
    const out: string[] = [];
    for (const [id, qty] of Object.entries(ledger.purchasedPacks)) {
      for (let i = 0; i < (qty ?? 0); i++) out.push(id);
    }
    return out;
  }, [ledger.purchasedPacks, lic?.slotPacks]);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?referral=${encodeURIComponent(referral)}`
      : `https://szcenario.hu/?referral=${encodeURIComponent(referral)}`;

  const buy = (packId: SlotPackId) => {
    const lock = evaluateBundleLockFromCart({
      planId: tier,
      slotPack: packId,
      ownedAddons: lic?.addons,
      ownedSlotPacks,
    });
    if (lock.tripped) {
      setLockOffer(lock);
      return;
    }
    window.location.assign(
      billCheckoutUrl({
        tier,
        interval,
        slotPack: packId,
        referral: undefined,
      }),
    );
  };

  const acceptUpgrade = () => {
    if (!lockOffer?.nextTier) return;
    if (lockOffer.nextTier === "expert" && !ENTERPRISE_SELF_SERVE_CHECKOUT) {
      window.location.assign(enterpriseInquiryHref({ locale }));
      return;
    }
    window.location.assign(
      billCheckoutUrl({
        tier: lockOffer.nextTier,
        interval,
      }),
    );
  };

  const copyReferral = async () => {
    await navigator.clipboard.writeText(shareUrl);
  };

  const nextLabel =
    lockOffer?.nextTier === "pro"
      ? t("pricing.pro")
      : lockOffer?.nextTier === "expert"
        ? t("pricing.expert")
        : "";

  return (
    <div className={props.className ?? "space-y-4"}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{t("pricing.slotLimitTitle")}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          {t("pricing.slotLimitBody", { used: props.used, limit })}
        </p>
      </div>

      <button
        type="button"
        className="flex w-full items-start gap-3 rounded-xl border border-cyan-400/35 bg-cyan-500/10 p-4 text-left transition-colors hover:border-cyan-300/50"
        onClick={() => void copyReferral()}
      >
        <Gift className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
        <span>
          <span className="block text-sm font-semibold text-foreground">{t("pricing.slotReferralTitle")}</span>
          <span className="mt-1 block text-[12px] text-muted-foreground">
            {t("pricing.slotReferralBody", { code: referral })}
          </span>
        </span>
      </button>

      {packs.length ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <PackagePlus className="h-4 w-4" />
            {t("pricing.slotExpandCta")}
          </div>
          <div className="grid gap-2">
            {packs.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant="outline"
                className="h-auto justify-between gap-3 px-3 py-2.5 text-left"
                onClick={() => buy(p.id)}
              >
                <span className="text-[13px] font-medium">{slotPackLabel(p, locale)}</span>
                <AddonPriceLine monthlyNetHuf={p.priceHuf} interval={interval} vatRate={vat.rate} />
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[12px] text-muted-foreground">{t("pricing.slotCampusLocked")}</p>
      )}

      {props.onClose ? (
        <Button type="button" variant="ghost" className="w-full" onClick={props.onClose}>
          {t("pricing.close")}
        </Button>
      ) : null}

      <Dialog open={!!lockOffer} onOpenChange={(open) => !open && setLockOffer(null)}>
        <DialogContent className="max-w-lg border-border bg-card text-foreground sm:rounded-xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg tracking-tight">{t("pricing.bundleLockTitle")}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {lockOffer
                ? t("pricing.bundleLockBody", {
                    next: nextLabel,
                    stay: money(lockOffer.stayNet),
                    upgrade: money(lockOffer.upgradeNet),
                    save: money(lockOffer.saveHuf),
                  })
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setLockOffer(null)}>
              {t("pricing.close")}
            </Button>
            <Button type="button" className="btn-cta" onClick={acceptUpgrade}>
              {lockOffer?.nextTier === "expert" && !ENTERPRISE_SELF_SERVE_CHECKOUT
                ? t("pricing.bundleLockInquiry")
                : t("pricing.bundleLockCta", { next: nextLabel })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
