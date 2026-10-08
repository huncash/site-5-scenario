import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { consumeActivationTicket, peekActivationTicket } from "@/lib/funnelOrder";
import { useI18n } from "@/i18n";
import { langSearch, parseLangSearch } from "@/lib/langSearch";
import { lastLicenseFusionError, writeLicense } from "@/lib/license";
import { useVault } from "@/lib/vault";

export const Route = createFileRoute("/login_/activate")({
  validateSearch: (s: Record<string, unknown>) => ({
    ...parseLangSearch(s),
    k: typeof s.k === "string" ? s.k : "",
  }),
  component: ActivatePage,
});

function ActivatePage() {
  const { k } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useI18n();
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
      setError(t("login.activatePwShort"));
      return;
    }
    if (pw !== pw2) {
      setError(t("login.activatePwMismatch"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createProfile(ticket.profileLabel || "Szcenárió", pw);
      consumeActivationTicket(k);
      const written = writeLicense({
        token: ticket.token,
        tier: ticket.tierId,
        interval: ticket.interval,
        status: "local",
        verifiedAt: new Date().toISOString(),
      });
      if (!written) {
        setError(lastLicenseFusionError() ?? t("login.activateTokenFail"));
        return;
      }
      try {
        localStorage.setItem("szcenario_home_mode", "dashboard");
        window.dispatchEvent(new Event("szcenario:home_mode"));
      } catch {
        // ignore
      }
      await navigate({ to: "/", search: langSearch() });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("login.activateProfileFail"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border/60 bg-card p-8">
        <Link to="/" search={langSearch} className="text-[12px] text-muted-foreground underline-offset-4 hover:underline">
          {t("login.home")}
        </Link>
        <h1 className="text-xl font-semibold text-foreground">{t("login.activateTitle")}</h1>
        {!ticket ? (
          <p className="text-sm text-muted-foreground">
            {t("login.activateInvalid")}
          </p>
        ) : (
          <form className="grid gap-3" onSubmit={(e) => void submit(e)}>
            <p className="text-sm text-muted-foreground">
              {t("login.activatePack", { tier: ticket.tierLabel })}
            </p>
            <label className="grid gap-1 text-[12px] text-muted-foreground">
              {t("login.password")}
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} autoComplete="new-password" required />
            </label>
            <label className="grid gap-1 text-[12px] text-muted-foreground">
              {t("login.activatePwAgain")}
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={8} autoComplete="new-password" required />
            </label>
            {error ? <p className="text-[12px] text-rose-400">{error}</p> : null}
            <Button type="submit" disabled={busy || pw.length < 8 || pw !== pw2}>
              {busy ? t("login.activateCreating") : t("login.activateSave")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
