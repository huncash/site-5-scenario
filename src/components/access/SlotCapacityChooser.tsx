import { Gift, PackagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { billCheckoutUrl } from "@/lib/billing";
import { readLicense, readSlotLedger } from "@/lib/license";
import { ensureReferralCode } from "@/lib/referral";
import {
  publicSlotPacksForTier,
  totalScenarioSlots,
  type SlotPackId,
} from "@/lib/scenarioSlots";
import { formatHuf } from "@/content/pricing/tiers";

export function SlotCapacityChooser(props: {
  used: number;
  onClose?: () => void;
  className?: string;
}) {
  const ledger = readSlotLedger();
  const limit = totalScenarioSlots(ledger);
  const packs = publicSlotPacksForTier(ledger.tier);
  const referral = ensureReferralCode();
  const lic = readLicense();
  const tier = lic?.tier && lic.tier !== "local" ? lic.tier : "pro";
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?referral=${encodeURIComponent(referral)}`
      : `https://szcenario.hu/?referral=${encodeURIComponent(referral)}`;

  const buy = (packId: SlotPackId) => {
    window.location.assign(
      billCheckoutUrl({
        tier,
        interval: "yearly",
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
        <h3 className="text-sm font-semibold text-foreground">Szcenárió-hely keret elérve</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          Jelenleg {props.used} / {limit} slot van használatban. Válassz konstrukciót a bővítéshez — nem
          általános hiba, hanem kapacitásdöntés.
        </p>
      </div>

      <button
        type="button"
        className="flex w-full items-start gap-3 rounded-xl border border-cyan-400/35 bg-cyan-500/10 p-4 text-left transition-colors hover:border-cyan-300/50"
        onClick={() => void copyReferral()}
      >
        <Gift className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
        <span>
          <span className="block text-sm font-semibold text-foreground">
            Ajánld a rendszert egy partnernek/ismerősnek a +1 díjmentes slotért
          </span>
          <span className="mt-1 block text-[12px] text-muted-foreground">
            Sikeres fizetés után te és az új előfizető is +1 permanent slotot kap. Kód:{" "}
            <span className="font-mono text-foreground">{referral}</span> — kattints a link másolásához.
          </span>
        </span>
      </button>

      {packs.length ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <PackagePlus className="h-4 w-4" />
            Bővítsd a kapacitást (+1, +3 vagy +5 slot csomaggal)
          </div>
          <div className="grid gap-2">
            {packs.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant="outline"
                className="h-auto justify-between px-3 py-2.5 text-left"
                onClick={() => buy(p.id)}
              >
                <span className="text-[13px] font-medium">{p.labelHu}</span>
                <span className="text-[12px] text-muted-foreground">{formatHuf(p.priceHuf)} nettó</span>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[12px] text-muted-foreground">
          A Campus / oktatási keretben a slot-bővítő mátrix nem elérhető — a keret fix.
        </p>
      )}

      {props.onClose ? (
        <Button type="button" variant="ghost" className="w-full" onClick={props.onClose}>
          Bezár
        </Button>
      ) : null}
    </div>
  );
}
