import { useState } from "react";
import { GraduationCap, IdCard, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n";
import {
  isEduEmail,
  isSchoolProofFile,
  writeSchoolProof,
} from "@/lib/school";
import { applySchoolCampusLicense } from "@/lib/schoolLicense";

type Mode = "email" | "file";

export function StudentProofForm(props: { onVerified: () => void }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submitEmail = () => {
    if (!isEduEmail(email)) {
      setError(t("school.proofInvalidEmail"));
      return;
    }
    setBusy(true);
    writeSchoolProof({ kind: "edu-email", email: email.trim().toLowerCase(), at: new Date().toISOString() });
    applySchoolCampusLicense();
    setBusy(false);
    props.onVerified();
  };

  const submitFile = (file: File | undefined) => {
    if (!file || !isSchoolProofFile(file)) {
      setError(t("school.proofInvalidFile"));
      return;
    }
    setBusy(true);
    writeSchoolProof({
      kind: "id-upload",
      fileName: file.name,
      size: file.size,
      mime: file.type || "application/octet-stream",
      at: new Date().toISOString(),
    });
    applySchoolCampusLicense();
    setBusy(false);
    props.onVerified();
  };

  return (
    <section className="rounded-2xl border border-border/70 bg-card/40 p-5" aria-labelledby="school-proof-title">
      <div className="flex items-start gap-3">
        <GraduationCap className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <div>
          <h2 id="school-proof-title" className="text-base font-semibold text-foreground">
            {t("school.proofTitle")}
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{t("school.proofLead")}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={mode === "email" ? "default" : "outline"} onClick={() => setMode("email")}>
          <Mail className="size-3.5" aria-hidden />
          {t("school.proofEmail")}
        </Button>
        <Button type="button" size="sm" variant={mode === "file" ? "default" : "outline"} onClick={() => setMode("file")}>
          <IdCard className="size-3.5" aria-hidden />
          {t("school.proofFile")}
        </Button>
      </div>

      {mode === "email" ? (
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submitEmail();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="school-edu-email">{t("school.proofEmail")}</Label>
            <Input
              id="school-edu-email"
              type="email"
              autoComplete="email"
              placeholder={t("school.proofEmailPh")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
            />
            <p className="text-[12px] text-muted-foreground">{t("school.proofEmailHint")}</p>
          </div>
          {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
          <Button type="submit" className="btn-cta" disabled={busy}>
            {t("school.proofSubmit")}
          </Button>
        </form>
      ) : (
        <div className="mt-4 space-y-3">
          <Label htmlFor="school-id-file">{t("school.proofFile")}</Label>
          <Input
            id="school-id-file"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf,.pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              setError(null);
              submitFile(e.target.files?.[0]);
            }}
          />
          <p className="text-[12px] text-muted-foreground">{t("school.proofFileHint")}</p>
          {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
        </div>
      )}
    </section>
  );
}
