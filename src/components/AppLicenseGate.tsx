import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { billCheckoutUrl } from "@/lib/billing";
import { verifyBillLicense } from "@/lib/license";

export function AppLicenseGate({ onGranted }: { onGranted?: () => void }) {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const ok = await verifyBillLicense(token);
      if (!ok) {
        setError("A token nem érvényes, vagy a bill modul most nem elérhető.");
        return;
      }
      onGranted?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border/60 bg-card p-8">
        <h1 className="text-xl font-semibold text-foreground">app.szcenario.hu</h1>
        <p className="text-sm text-muted-foreground">
          Védett munkaterület. A belépés a bill.szcenario.hu rendelési tokenjével (rendelésazonosító vagy SZC-kód) nyílik.
          A szcenáriók a saját eszközödön maradnak.
        </p>
        <form className="grid gap-3" onSubmit={(e) => void submit(e)}>
          <label className="grid gap-1 text-[12px] text-muted-foreground">
            Előfizetési token
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="rendelésazonosító vagy SZC-…"
              autoComplete="off"
              required
            />
          </label>
          {error ? <p className="text-[12px] text-rose-400">{error}</p> : null}
          <Button type="submit" disabled={busy || !token.trim()}>
            {busy ? "Ellenőrzés…" : "Token ellenőrzése"}
          </Button>
        </form>
        <div className="flex flex-wrap gap-3 text-[12px]">
          <Link to="/login" className="text-cyan-300 underline-offset-2 hover:underline">
            Profil feloldása
          </Link>
          <a href={billCheckoutUrl({ tier: "pro", interval: "yearly" })} className="text-cyan-300 underline-offset-2 hover:underline">
            Csomag a bill oldalon
          </a>
        </div>
      </div>
    </div>
  );
}
