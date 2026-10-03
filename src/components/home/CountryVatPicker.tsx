import { countryLabel, VAT_COUNTRIES } from "@/content/pricing/vat";
import { useI18n } from "@/i18n";

export function CountryVatPicker(props: {
  country: string;
  onChange: (country: string) => void;
}) {
  const { t, locale } = useI18n();
  return (
    <label className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
      <span>{t("pricing.buyerCountry")}</span>
      <select
        className="rounded-md border border-white/20 bg-card px-2 py-1 text-[12px] text-foreground"
        value={props.country}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {VAT_COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {countryLabel(c, locale)} ({c})
          </option>
        ))}
      </select>
    </label>
  );
}
