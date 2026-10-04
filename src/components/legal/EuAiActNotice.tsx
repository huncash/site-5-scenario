import { translate, type MessageKey } from "@/i18n";
import type { Locale } from "@/i18n/locale";

/** Footer: EU AI Act (2024/1689) átláthatósági nyilatkozat — helyi, client-side modellezés. */
export function EuAiActNotice({ locale }: { locale: Locale }) {
  const t = (key: MessageKey) => translate(locale, key);
  return (
    <div className="mt-6 max-w-4xl border-t border-slate-800/80 pt-4 text-[11px] leading-relaxed text-slate-400">
      <div className="mb-1.5 flex items-center gap-2 font-medium text-slate-300">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-700" aria-hidden />
        <span>{t("legal.aiActTitle")}</span>
      </div>
      <p>{t("legal.aiActBody")}</p>
    </div>
  );
}
