import { Gift, PackagePlus } from "lucide-react";

import { AddonPriceLine } from "@/components/home/AddonPriceLine";
import { Button } from "@/components/ui/button";
import { resolveVat, SELLER_COUNTRY } from "@/content/pricing/vat";
import { useI18n } from "@/i18n";
import { billCheckoutUrl } from "@/lib/billing";
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
  const { t, locale } = useI18n();
  const ledger = readSlotLedger();
  const limit = totalScenarioSlots(ledger);
  const packs = publicSlotPacksForTier(ledger.tier);
  const referral = ensureReferralCode();
  const lic = readLicense();
  const tier = lic?.tier && lic.tier !== "local" ? lic.tier : "pro";
  const interval = licenseInterval();
  const vat = resolveVat({ country: SELLER_COUNTRY });
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?referral=${encodeURIComponent(referral)}`
      : `https://szcenario.hu/?referral=${encodeURIComponent(referral)}`;

  const buy = (packId: SlotPackId) => {
    window.location.assign(
      billCheckoutUrl({
        tier,
        interval,
        slotPack: packId,
        referral: undefined,
      }),
    );
  };

  const copyReferral = async () => {
    await navigator.clipboard.writeText(shareUrl);
  };

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
    </div>
  );
}
