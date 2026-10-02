import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { consumeActivationTicket, peekActivationTicket } from "@/lib/funnelOrder";
import { writeLicense } from "@/lib/license";
import { useVault } from "@/lib/vault";

export const Route = createFileRoute("/login_/activate")({
  validateSearch: (s: Record<string, unknown>) => ({
    k: typeof s.k === "string" ? s.k : "",
  }),
  component: ActivatePage,
});

function ActivatePage() {
  const { k } = Route.useSearch();
  const navigate = useNavigate();
  const { createProfile } = useVault();
  const ticket = useMemo(() => (k ? peekActivationTicket(k) : null), [k]);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    if (pw.length < 8) {
      setError("A mesterjelszó legalább 8 karakter.");
      return;
    }
    if (pw !== pw2) {
      setError("A két jelszó nem egyezik.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createProfile(ticket.profileLabel || "Szcenárió", pw);
      consumeActivationTicket(k);
      writeLicense({
        token: ticket.token,
        tier: ticket.tierId,
        interval: ticket.interval,
        status: "local",
        verifiedAt: new Date().toISOString(),
      });
      try {
        localStorage.setItem("szcenario_home_mode", "dashboard");
        window.dispatchEvent(new Event("szcenario:home_mode"));
      } catch {
        // ignore
      }
      await navigate({ to: "/" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "A profilt nem sikerült létrehozni.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border/60 bg-card p-8">
        <Link to="/" className="text-[12px] text-muted-foreground underline-offset-4 hover:underline">
          ← Főoldal
        </Link>
        <h1 className="text-xl font-semibold text-foreground">Mesterjelszó beállítása</h1>
        {!ticket ? (
          <p className="text-sm text-muted-foreground">
            Ez a link érvénytelen vagy már felhasznált. A megrendelés után kapott QR/link egyszer nyitható meg ezen az eszközön.
          </p>
        ) : (
          <form className="grid gap-3" onSubmit={(e) => void submit(e)}>
            <p className="text-sm text-muted-foreground">
              Csomag: <span className="text-foreground">{ticket.tierLabel}</span>. A jelszó csak ezen az eszközön marad.
            </p>
            <label className="grid gap-1 text-[12px] text-muted-foreground">
              Mesterjelszó
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} autoComplete="new-password" required />
            </label>
            <label className="grid gap-1 text-[12px] text-muted-foreground">
              Mesterjelszó mégegyszer
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={8} autoComplete="new-password" required />
            </label>
            {error ? <p className="text-[12px] text-rose-400">{error}</p> : null}
            <Button type="submit" disabled={busy || pw.length < 8 || pw !== pw2}>
              {busy ? "Létrehozás…" : "Jelszó mentése és belépés"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
