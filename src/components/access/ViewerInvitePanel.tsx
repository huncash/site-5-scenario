import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Ban, Copy, KeyRound, QrCode, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { canConfigureStructure, isViewerReadonly } from "@/lib/accessRole";
import {
  ensureGuestSlotPool,
  generateGuestCodeForSlot,
  guestCodeSlotsForTier,
  listGuestSlots,
  resolveGuestTier,
  revokeGuestSlotIndex,
  type GuestCodeSlot,
} from "@/lib/auth/guestSlots";
import { ensureReferralCode } from "@/lib/referral";
import { viewerConnectUrl } from "@/lib/viewerInvite";

export function ViewerInvitePanel() {
  const tier = resolveGuestTier();
  const limit = guestCodeSlotsForTier(tier);
  const [slots, setSlots] = useState<GuestCodeSlot[]>(() => listGuestSlots(tier));
  const [qr, setQr] = useState("");
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const referral = ensureReferralCode();
  const owner = canConfigureStructure() && !isViewerReadonly();

  const refresh = useCallback(() => {
    ensureGuestSlotPool(tier);
    setSlots(listGuestSlots(tier));
  }, [tier]);

  useEffect(() => {
    const on = () => refresh();
    window.addEventListener("szcenario:guest_slots", on);
    window.addEventListener("szcenario:viewer_invites", on);
    return () => {
      window.removeEventListener("szcenario:guest_slots", on);
      window.removeEventListener("szcenario:viewer_invites", on);
    };
  }, [refresh]);

  const show = async (code: string) => {
    setActiveCode(code);
    setQr(await QRCode.toDataURL(viewerConnectUrl(code), { errorCorrectionLevel: "M", margin: 1, scale: 5 }));
  };

  const gen = async (index: number) => {
    const res = generateGuestCodeForSlot(index, tier);
    if (!res.ok) {
      toast.warning(
        res.reason === "already_active"
          ? "Ehhez a Slothoz már van aktív kód — előbb vond vissza."
          : "Guest kód nem generálható.",
      );
      return;
    }
    refresh();
    await show(res.slot.code!);
    toast.success(`Guest Slot #${String(index).padStart(2, "0")} kód kész.`);
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  if (!owner) {
    return (
      <div className="rounded-xl border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground">
        Guest módban nem generálható megosztó kulcs.
      </div>
    );
  }

  const activeCount = slots.filter((s) => s.code && !s.revokedAt).length;

  return (
    <section className="space-y-3 rounded-xl border border-border/60 bg-card p-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Guest Code Slotok</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          N egyedi, anonim vendégkód (1 kód / Guest Slot). Nincs e-mail, nincs név. Csomagkeret:{" "}
          <span className="font-medium text-foreground">
            {activeCount} / {limit}
          </span>
          . Egy kód = egy aktív eszköz-session; egyedi visszavonás nem érinti a többi Slotot.
        </p>
      </div>

      <div className="text-[11px] text-muted-foreground">
        Ajánlói kódod: <span className="font-mono text-foreground">{referral}</span>
      </div>

      {activeCode ? (
        <div className="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-start">
          {qr ? <img src={qr} alt="Guest QR" className="h-36 w-36 rounded-md border border-border bg-white" /> : null}
          <div className="space-y-2 text-[12px]">
            <div className="font-mono break-all text-foreground">{activeCode}</div>
            <div className="break-all text-muted-foreground">{viewerConnectUrl(activeCode)}</div>
            <div className="flex flex-wrap gap-1.5">
              <Button type="button" size="sm" variant="outline" onClick={() => void copy(activeCode)}>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {copied ? "Másolva" : "Kód másolása"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => void copy(viewerConnectUrl(activeCode))}>
                Link másolása
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ul className="space-y-2">
        {slots.map((slot) => {
          const active = Boolean(slot.code && !slot.revokedAt);
          const revoked = Boolean(slot.revokedAt);
          return (
            <li
              key={slot.index}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2 text-[12px]"
            >
              <div className="min-w-0">
                <div className="font-medium text-foreground">
                  Guest Slot #{String(slot.index).padStart(2, "0")}
                </div>
                <div className="font-mono text-foreground/90">
                  {slot.code ?? "— nincs kód —"}
                </div>
                <div className="text-muted-foreground">
                  {active
                    ? "Aktív"
                    : revoked
                      ? `Visszavonva: ${new Date(slot.revokedAt!).toLocaleString("hu-HU")}`
                      : "Üres — generálható"}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {active ? (
                  <>
                    <Button type="button" size="sm" variant="outline" onClick={() => void show(slot.code!)}>
                      <QrCode className="mr-1 h-3.5 w-3.5" />
                      QR
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => void copy(slot.code!)}>
                      <Copy className="mr-1 h-3.5 w-3.5" />
                      Másolás
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        revokeGuestSlotIndex(slot.index);
                        refresh();
                        if (activeCode === slot.code) {
                          setActiveCode(null);
                          setQr("");
                        }
                        toast.message(`Guest Slot #${String(slot.index).padStart(2, "0")} visszavonva.`);
                      }}
                    >
                      <Ban className="mr-1 h-3.5 w-3.5" />
                      Egyedi visszavonás
                    </Button>
                  </>
                ) : (
                  <Button type="button" size="sm" onClick={() => void gen(slot.index)}>
                    {revoked ? <RefreshCw className="mr-1 h-3.5 w-3.5" /> : <KeyRound className="mr-1 h-3.5 w-3.5" />}
                    {revoked ? "Új kód" : "Kód generálása"}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
