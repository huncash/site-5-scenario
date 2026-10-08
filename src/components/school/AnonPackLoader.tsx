import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import {
  isAnonCaseFilename,
  parseAnonCasePack,
  type AnonCasePack,
} from "@/lib/anonCasePack";

export function AnonPackLoader({
  onLoaded,
}: {
  onLoaded: (pack: AnonCasePack) => void;
}) {
  const { t } = useI18n();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const applyRaw = async (raw: string) => {
    setBusy(true);
    try {
      const res = await parseAnonCasePack(raw);
      if (!res.ok) {
        setErr(res.reason === "pii" || res.reason === "leak" ? t("school.packLeak") : t("school.packInvalid"));
        return;
      }
      setErr(null);
      onLoaded(res.pack);
    } catch {
      setErr(t("school.packInvalid"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-card/40 p-4" aria-labelledby="pack-title">
      <div>
        <h2 id="pack-title" className="text-base font-semibold text-foreground">
          {t("school.packTitle")}
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{t("school.packLead")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex h-9 cursor-pointer items-center rounded-md border border-input bg-background px-3.5 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
          {t("school.packPick")}
          <input
            type="file"
            accept=".szc,application/json,text/plain"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (file.name && !isAnonCaseFilename(file.name) && !/\.(json|txt|szc)$/i.test(file.name)) {
                setErr(t("school.packInvalid"));
                return;
              }
              void file.text().then((raw) => applyRaw(raw));
            }}
          />
        </label>
      </div>
      <textarea
        ref={taRef}
        name="pack"
        className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        placeholder={t("school.packPastePh")}
      />
      <Button type="button" size="sm" disabled={busy} onClick={() => void applyRaw(taRef.current?.value ?? "")}>
        {t("school.packPaste")}
      </Button>
      {err ? <p className="text-[12px] text-destructive">{err}</p> : null}
    </section>
  );
}
