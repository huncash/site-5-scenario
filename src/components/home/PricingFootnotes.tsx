import { useI18n } from "@/i18n";
import { supportPricingHref } from "@/lib/support";

/**
 * Főoldali lábjegyzet: tömör + hivatkozás a Support SSOT horgonyokra.
 * Részletes szöveg NEM itt él — lásd support /pricing.
 */
export function PricingFootnotes(props: { className?: string }) {
  const { t } = useI18n();
  return (
    <div
      id="pricing-footnotes"
      className={
        props.className ??
        "mt-8 space-y-1.5 border-t border-slate-800 pt-4 text-xs text-slate-400"
      }
    >
      <p>
        <a href={supportPricingHref("active-workspaces")} className="underline hover:text-emerald-300">
          {t("pricing.fnActiveLink")}
        </a>
        {" — "}
        {t("pricing.fnActiveShort")}
      </p>
      <p>
        <a href={supportPricingHref("license-frame")} className="underline hover:text-emerald-300">
          {t("pricing.fnEngineLink")}
        </a>
        {" — "}
        {t("pricing.fnEngineShort")}
      </p>
      <p>
        <a href={supportPricingHref("tiered-loyalty")} className="underline hover:text-emerald-300">
          {t("pricing.fnLoyaltyLink")}
        </a>
        {" — "}
        {t("pricing.fnLoyaltyShort")}
      </p>
      <p>
        <a href={supportPricingHref("local-import")} className="underline hover:text-emerald-300">
          {t("pricing.fnLocalLink")}
        </a>
        {" — "}
        {t("pricing.fnLocalShort")}
      </p>
    </div>
  );
}
