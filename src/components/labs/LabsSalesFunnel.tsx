import { NotifyLaunchButton } from "@/components/legal/NotifyLaunchButton";
import { formatCurrency, useI18n } from "@/i18n";
import { useSalesCart } from "@/hooks/useSalesCart";
import { PURCHASABLE_JIT_ADDONS, PUBLIC_JIT_ADDONS } from "@/content/pricing/addons";
import { publicGrossFromNet } from "@/content/pricing/vat";
import { cn } from "@/lib/utils";

function goCheckout(href: string) {
  if (typeof window === "undefined" || !href) return;
  window.location.assign(href);
}

export function LabsSalesFunnel() {
  const { t, locale } = useI18n();
  const { quote, add, remove, pickPack, checkoutHref } = useSalesCart();
  const money = (n: number) => formatCurrency(n, locale);
  const gross = publicGrossFromNet(quote.totalHuf, 27);
  const canOrder = Boolean(checkoutHref);

  return (
    <section className="space-y-1.5 rounded-lg border border-border/70 bg-card/50 p-2" data-labs-funnel="">
      <p className="px-0.5 text-[10px] leading-snug text-muted-foreground">{t("labs.funnelLead")}</p>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          className={cn(
            "rounded-md border px-2 py-0.5 text-[11px] hover:bg-accent",
            quote.plan === "starter"
              ? "border-cyan-400/60 bg-cyan-500/15 font-medium"
              : "border-border",
          )}
          onClick={() => void pickPack("starter")}
        >
          {t("labs.funnelBasic")}
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md border px-2 py-0.5 text-[11px] font-medium hover:bg-emerald-500/20",
            quote.plan === "pro"
              ? "border-emerald-400/70 bg-emerald-500/20"
              : "border-emerald-500/40 bg-emerald-500/10",
          )}
          onClick={() => void pickPack("pro")}
        >
          {t("labs.funnelPro")}
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md border px-2 py-0.5 text-[11px] hover:bg-accent",
            quote.engines.includes("education")
              ? "border-cyan-400/60 bg-cyan-500/15 font-medium"
              : "border-border",
          )}
          onClick={() => void add("education")}
        >
          {t("labs.funnelEdu")}
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md border px-2 py-0.5 text-[11px] hover:bg-accent",
            quote.engines.includes("resilience")
              ? "border-cyan-400/60 bg-cyan-500/15 font-medium"
              : "border-border",
          )}
          onClick={() => void add("resilience")}
        >
          {t("labs.funnelBcp")}
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {PURCHASABLE_JIT_ADDONS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-[10px] hover:bg-accent",
              quote.addons.includes(a.id) ? "border-cyan-400/60 bg-cyan-500/15" : "border-border/80",
            )}
            onClick={() => void add(a.id)}
          >
            {locale === "en" ? a.labelEn : a.labelHu}
          </button>
        ))}
        {PUBLIC_JIT_ADDONS.filter((a) => a.comingSoon).map((a) => (
          <span key={a.id} className="inline-flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">{locale === "en" ? a.labelEn : a.labelHu}</span>
            <NotifyLaunchButton
              featureId={`jit:${a.id}`}
              size="sm"
              variant="outline"
              className="h-auto px-1.5 py-0.5 text-[10px]"
            />
          </span>
        ))}
      </div>
      {quote.lines.length ? (
        <ul className="space-y-0.5 text-[11px]">
          {quote.lines.map((line) => (
            <li key={line.sku} className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate">{locale === "en" ? line.labelEn : line.labelHu}</span>
              <span className="flex shrink-0 items-center gap-1 font-mono tabular-nums">
                {line.quoteOnly
                  ? t("labs.funnelQuote")
                  : money(publicGrossFromNet(line.netHuf, 27))}
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
        <span className="min-w-0 text-[11px] leading-snug">
          <span className="font-medium">{t("labs.funnelTotal")}</span>
          <span className="ml-1 font-mono tabular-nums">
            {t("pricing.gross")} {money(gross)}
          </span>
          <span className="mt-0.5 block text-[10px] text-muted-foreground">
            {t("pricing.once")} · {t("pricing.net")} {money(quote.totalHuf)} + 27% {t("pricing.vatShort")}
          </span>
        </span>
        <button
          type="button"
          className={cn(
            "rounded-md px-2 py-1 text-[11px] font-semibold",
            canOrder ? "btn-cta" : "cursor-not-allowed border border-border text-muted-foreground",
          )}
          disabled={!canOrder}
          onClick={() => goCheckout(checkoutHref)}
        >
          {t("labs.funnelOrder")}
        </button>
      </div>
    </section>
  );
}
