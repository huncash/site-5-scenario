import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACCESS_ROLE, writeAccessRole, writeViewerToken } from "@/lib/accessRole";
import { claimGuestSession, normalizeGuestCode, parseGuestCode } from "@/lib/auth/guestSlots";
import { langSearch } from "@/lib/langSearch";

/** Anonymous Guest belépés: egyedi kód + opcionális helyi jelszó — nincs e-mail / név. */
export function GuestLoginCard() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [localPw, setLocalPw] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizeGuestCode(code);
    if (!parseGuestCode(normalized)) {
      toast.error("Érvénytelen Guest kód. Formátum: GUEST-XXXX-01");
      return;
    }
    setBusy(true);
    try {
      const res = await claimGuestSession({
        code: normalized,
        localPassword: localPw.trim() || undefined,
      });
      if (!res.ok) {
        if (res.reason === "revoked") toast.error("Ez a Guest kód vissza van vonva.");
        else if (res.reason === "bad_password") toast.error("Helyi jelszó hibás.");
        else toast.error("Érvénytelen Guest kód.");
        return;
      }
      writeAccessRole(ACCESS_ROLE.VIEWER_READONLY);
      writeViewerToken(res.claim.code);
      if (res.displaced) {
        toast.message("Ez a Guest kód más eszközön aktív volt — az előző session lezárult.");
      } else {
        toast.success(`Guest Slot #${String(res.claim.slotIndex).padStart(2, "0")} aktív.`);
      }
      void navigate({ to: "/", search: langSearch() });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="mt-4 space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4 text-left"
    >
      <div className="flex items-start gap-2">
        <Eye className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <div>
          <div className="text-sm font-semibold text-foreground">Guest belépés</div>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
            Egyedi vendégkód — nincs e-mail, nincs név. Opcionális helyi jelszó csak ezen az eszközön.
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="guest-code" className="text-xs">
          Guest kód
        </Label>
        <Input
          id="guest-code"
          className="font-mono text-sm uppercase"
          placeholder="GUEST-8F3K-01"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="guest-local-pw" className="text-xs">
          Helyi jelszó (opcionális)
        </Label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="guest-local-pw"
            type="password"
            className="pl-9 text-sm"
            placeholder="Csak ezen az eszközön"
            autoComplete="new-password"
            value={localPw}
            onChange={(e) => setLocalPw(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" size="sm" className="w-full" disabled={busy || !code.trim()}>
        {busy ? "Belépés…" : "Guest mód indítása"}
      </Button>
    </form>
  );
}
