import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Ban, Copy, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { canConfigureStructure, isViewerReadonly } from "@/lib/accessRole";
import { ensureReferralCode } from "@/lib/referral";
import {
  createViewerInvite,
  listViewerInvites,
  revokeViewerInvite,
  viewerConnectUrl,
  type ViewerInvite,
} from "@/lib/viewerInvite";

export function ViewerInvitePanel() {
  const [invites, setInvites] = useState<ViewerInvite[]>(() => listViewerInvites());
  const [qr, setQr] = useState("");
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const referral = ensureReferralCode();
  const owner = canConfigureStructure() && !isViewerReadonly();

  const refresh = useCallback(() => setInvites(listViewerInvites()), []);

  useEffect(() => {
    const on = () => refresh();
    window.addEventListener("szcenario:viewer_invites", on);
    return () => window.removeEventListener("szcenario:viewer_invites", on);
  }, [refresh]);

  const make = async () => {
    const inv = createViewerInvite("Olvasó vendég");
    setActiveToken(inv.token);
    const url = viewerConnectUrl(inv.token);
    setQr(await QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 1, scale: 5 }));
    refresh();
  };

  const show = async (token: string) => {
    setActiveToken(token);
    setQr(await QRCode.toDataURL(viewerConnectUrl(token), { errorCorrectionLevel: "M", margin: 1, scale: 5 }));
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  if (!owner) {
    return (
      <div className="rounded-xl border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground">
        Olvasói módban nem generálható vendégkulcs.
      </div>
    );
  }

  return (
    <section className="space-y-3 rounded-xl border border-border/60 bg-card p-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Olvasói vendég (VIEWER_READONLY)</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          Egy kattintással korlátozott szinkronkulcs / QR. A vendég váltogathat szcenáriók között és
          futtathat elemzést; adatbevitel, törlés, nyers export és szerkezeti konfiguráció tiltva. A kulcs
          bármikor visszavonható.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={() => void make()}>
          <QrCode className="mr-1.5 h-3.5 w-3.5" />
          Olvasói kulcs generálása
        </Button>
        <span className="text-[11px] text-muted-foreground">
          Ajánlói kódod: <span className="font-mono text-foreground">{referral}</span>
        </span>
      </div>

      {activeToken ? (
        <div className="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-start">
          {qr ? <img src={qr} alt="Olvasói QR" className="h-36 w-36 rounded-md border border-border bg-white" /> : null}
          <div className="space-y-2 text-[12px]">
            <div className="font-mono break-all text-foreground">{activeToken}</div>
            <div className="break-all text-muted-foreground">{viewerConnectUrl(activeToken)}</div>
            <Button type="button" size="sm" variant="outline" onClick={() => void copy(viewerConnectUrl(activeToken))}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              {copied ? "Másolva" : "Link másolása"}
            </Button>
          </div>
        </div>
      ) : null}

      <ul className="space-y-2">
        {invites.map((inv) => (
          <li
            key={inv.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2 text-[12px]"
          >
            <div className="min-w-0">
              <div className="font-mono text-foreground">{inv.token}</div>
              <div className="text-muted-foreground">
                {inv.revokedAt ? `Visszavonva: ${new Date(inv.revokedAt).toLocaleString("hu-HU")}` : "Aktív"}
              </div>
            </div>
            <div className="flex gap-1.5">
              {!inv.revokedAt ? (
                <>
                  <Button type="button" size="sm" variant="outline" onClick={() => void show(inv.token)}>
                    QR
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      revokeViewerInvite(inv.token);
                      refresh();
                      if (activeToken === inv.token) {
                        setActiveToken(null);
                        setQr("");
                      }
                    }}
                  >
                    <Ban className="mr-1 h-3.5 w-3.5" />
                    Visszavon
                  </Button>
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
