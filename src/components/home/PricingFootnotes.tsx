import { useI18n } from "@/i18n";
import { supportPublicOrigin } from "@/lib/support";

/** Árazás / mátrix alatti fogalom-lábjegyzetek — sorrend: Case → Slot → P-R-O → Seat / Guest. */
export function PricingFootnotes(props: { className?: string }) {
  const { t } = useI18n();
  const faqHref = `${supportPublicOrigin()}/gyik#faq-slot`;
  return (
    <div
      id="pricing-footnotes"
      className={
        props.className ??
        "mt-8 space-y-1 border-t border-slate-800 pt-4 text-xs text-slate-400"
      }
    >
      <p className="font-medium text-foreground/90">{t("pricing.activeWorkspaceTitle")}</p>
      <p className="text-slate-300">{t("pricing.activeWorkspaceNote")}</p>
      <p>
        <span className="font-medium text-emerald-400">* {t("pricing.fnCaseLabel")}:</span>{" "}
        {t("pricing.fnCase")}
      </p>
      <p>
        <span className="font-medium text-emerald-400">** {t("pricing.fnSlotLabel")}:</span>{" "}
        {t("pricing.fnSlot")}{" "}
        <a href={faqHref} className="underline hover:text-emerald-300">
          {t("pricing.fnConceptsLink")}
        </a>
        .
      </p>
      <p>
        <span className="font-medium text-emerald-400">*** P-R-O:</span> {t("pricing.fnPro")}
      </p>
      <p>
        <span className="font-medium text-emerald-400">**** Seat / Guest:</span> {t("pricing.fnSeat")}
      </p>
    </div>
  );
}
