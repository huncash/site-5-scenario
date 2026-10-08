import { formatCurrency, useI18n } from "@/i18n";
import { useSalesCart } from "@/hooks/useSalesCart";
import { PUBLIC_JIT_ADDONS } from "@/content/pricing/addons";
import { cn } from "@/lib/utils";

function goCheckout(href: string) {
  if (typeof window === "undefined" || !href) return;
  window.location.assign(href);
}

export function LabsSalesFunnel() {
  const { t, locale } = useI18n();
  const { quote, add, remove, pickPack, checkoutHref } = useSalesCart();
  const money = (n: number) => formatCurrency(n, locale);

  return (
    <section className="space-y-1.5 rounded-lg border border-border/70 bg-card/50 p-2" data-labs-funnel="">
      <p className="px-0.5 text-[10px] leading-snug text-muted-foreground">{t("labs.funnelLead")}</p>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          className="rounded-md border border-border px-2 py-0.5 text-[11px] hover:bg-accent"
          onClick={() => void pickPack("starter")}
        >
          {t("labs.funnelBasic")}
        </button>
        <button
          type="button"
          className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium hover:bg-emerald-500/20"
          onClick={() => void pickPack("pro")}
        >
          {t("labs.funnelPro")}
        </button>
        <button
          type="button"
          className="rounded-md border border-border px-2 py-0.5 text-[11px] hover:bg-accent"
          onClick={() => void add("education")}
        >
          {t("labs.funnelEdu")}
        </button>
        <button
          type="button"
          className="rounded-md border border-border px-2 py-0.5 text-[11px] hover:bg-accent"
          onClick={() => void add("resilience")}
        >
          {t("labs.funnelBcp")}
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {PUBLIC_JIT_ADDONS.map((a) => (
          <button
            key={a.id}
            type="button"
            className="rounded-md border border-border/80 px-1.5 py-0.5 text-[10px] hover:bg-accent"
            onClick={() => void add(a.id)}
          >
            {locale === "en" ? a.labelEn : a.labelHu}
          </button>
        ))}
      </div>
      {quote.lines.length ? (
        <ul className="space-y-0.5 text-[11px]">
          {quote.lines.map((line) => (
            <li key={line.sku} className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate">{locale === "en" ? line.labelEn : line.labelHu}</span>
              <span className="flex shrink-0 items-center gap-1 font-mono tabular-nums">
                {line.quoteOnly ? t("labs.funnelQuote") : money(line.netHuf)}
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => void remove(line.sku)}
                  aria-label={t("labs.funnelRemove")}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[10px] text-muted-foreground">{t("labs.funnelEmpty")}</p>
      )}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <span className="font-mono text-[11px] tabular-nums">
          {t("labs.funnelTotal")}: {money(quote.totalHuf)}
        </span>
        <button
          type="button"
          className={cn(
            "rounded-md px-2 py-1 text-[11px] font-semibold",
            quote.lines.length ? "btn-cta" : "cursor-not-allowed border border-border text-muted-foreground",
          )}
          disabled={!quote.lines.length}
          onClick={() => goCheckout(checkoutHref)}
        >
          {t("labs.funnelOrder")}
        </button>
      </div>
    </section>
  );
}
