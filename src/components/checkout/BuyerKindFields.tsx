import { Link } from "@tanstack/react-router";

import type { BuyerKind } from "@/lib/buyerKind";
import { useI18n } from "@/i18n";
import { keepLang } from "@/lib/langSearch";
import { cn } from "@/lib/utils";

type BuyerKindFieldsProps = {
  kind: BuyerKind;
  onKindChange: (k: BuyerKind) => void;
  immediateConsent: boolean;
  onImmediateConsentChange: (v: boolean) => void;
  aszfAccepted: boolean;
  onAszfAcceptedChange: (v: boolean) => void;
  className?: string;
};

/** B2C / B2B választó + elállási / ÁSZF nyilatkozatok a pénztárban. */
export function BuyerKindFields(props: BuyerKindFieldsProps) {
  const { t } = useI18n();
  const { kind, immediateConsent, aszfAccepted } = props;

  return (
    <fieldset className={cn("rounded-xl border border-border/60 bg-background/30 p-4", props.className)}>
      <legend className="px-1 text-sm font-semibold text-slate-100">{t("pricing.buyerKindTitle")}</legend>
      <div className="mt-2 grid gap-2">
        <label className="flex items-start gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm">
          <input
            type="radio"
            name="buyerKind"
            className="mt-1"
            checked={kind === "b2c"}
            onChange={() => props.onKindChange("b2c")}
          />
          <span>
            <span className="font-medium text-slate-100">{t("pricing.buyerB2c")}</span>
            <span className="mt-0.5 block text-[12px] text-slate-400">{t("pricing.buyerB2cHint")}</span>
          </span>
        </label>
        <label className="flex items-start gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm">
          <input
            type="radio"
            name="buyerKind"
            className="mt-1"
            checked={kind === "b2b"}
            onChange={() => props.onKindChange("b2b")}
          />
          <span>
            <span className="font-medium text-slate-100">{t("pricing.buyerB2b")}</span>
            <span className="mt-0.5 block text-[12px] text-slate-400">{t("pricing.buyerB2bHint")}</span>
          </span>
        </label>
      </div>

      {kind === "b2c" ? (
        <label className="mt-3 flex items-start gap-2 text-[12px] leading-snug text-slate-300">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={immediateConsent}
            onChange={(e) => props.onImmediateConsentChange(e.target.checked)}
            required
          />
          <span>{t("pricing.b2cImmediateConsent")}</span>
        </label>
      ) : (
        <p className="mt-3 text-[12px] leading-snug text-slate-400">{t("pricing.b2bNoWithdrawal")}</p>
      )}

      <label className="mt-3 flex items-start gap-2 text-[12px] leading-snug text-slate-300">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={aszfAccepted}
          onChange={(e) => props.onAszfAcceptedChange(e.target.checked)}
          required
        />
        <span>
          {t("pricing.acceptAszfPrefix")}{" "}
          <Link to="/aszf" search={keepLang} className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
            {t("footer.terms")}
          </Link>{" "}
          {t("pricing.acceptAszfAnd")}{" "}
          <Link to="/gdpr" search={keepLang} className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
            {t("footer.gdpr")}
          </Link>
          .
        </span>
      </label>
    </fieldset>
  );
}
