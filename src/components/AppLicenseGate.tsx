import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { billCheckoutUrl } from "@/lib/billing";
import { useI18n } from "@/i18n";
import { keepLang } from "@/lib/langSearch";
import { lastLicenseFusionError, verifyBillLicense } from "@/lib/license";

export function AppLicenseGate({ onGranted }: { onGranted?: () => void }) {
  const { t } = useI18n();
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
        setError(lastLicenseFusionError() ?? t("login.gateBadToken"));
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
        <h1 className="text-xl font-semibold text-foreground">{t("login.gateTitle")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("login.gateBody")}
        </p>
        <form className="grid gap-3" onSubmit={(e) => void submit(e)}>
          <label className="grid gap-1 text-[12px] text-muted-foreground">
            {t("login.gateToken")}
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t("login.gateTokenPh")}
              autoComplete="off"
              required
            />
          </label>
          {error ? <p className="text-[12px] text-rose-400">{error}</p> : null}
          <Button type="submit" disabled={busy || !token.trim()}>
            {busy ? t("login.gateChecking") : t("login.gateCheck")}
          </Button>
        </form>
        <div className="flex flex-wrap gap-3 text-[12px]">
          <Link to="/login" search={keepLang} className="text-cyan-300 underline-offset-2 hover:underline">
            {t("login.gateUnlock")}
          </Link>
          <a href={billCheckoutUrl({ tier: "pro", interval: "yearly" })} className="text-cyan-300 underline-offset-2 hover:underline">
            {t("login.gateBill")}
          </a>
        </div>
      </div>
    </div>
  );
}
