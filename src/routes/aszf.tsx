import { createFileRoute, Link } from "@tanstack/react-router";

import { FunnelShell } from "@/components/funnel/FunnelShell";
import { ASZF_META, ASZF_SECTIONS_EN, ASZF_SECTIONS_HU } from "@/content/aszf";
import { useI18n } from "@/i18n";
import { keepLang, langSearch } from "@/lib/langSearch";
import { publicSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/aszf")({
  head: () => publicSeoHead("aszf"),
  component: AszfPage,
});

function AszfPage() {
  const { t, locale } = useI18n();
  const meta = locale === "en" ? ASZF_META.en : ASZF_META.hu;
  const sections = locale === "en" ? ASZF_SECTIONS_EN : ASZF_SECTIONS_HU;

  return (
    <FunnelShell eyebrow={t("footer.terms")} title={meta.title} subtitle={meta.lead}>
      <div className="mx-auto max-w-3xl space-y-8 text-[14px] leading-relaxed text-muted-foreground">
        <p className="text-xs text-slate-500">{meta.updated}</p>
        {sections.map((s) => (
          <section key={s.title} className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">{s.title}</h2>
            {s.paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </section>
        ))}
        <p>
          <Link to="/gdpr" search={keepLang} className="text-[var(--accent)] underline-offset-4 hover:underline">
            {t("footer.gdpr")}
          </Link>
          {" · "}
          <Link to="/" search={langSearch} className="text-[var(--accent)] underline-offset-4 hover:underline">
            {t("brand.aboutBack")}
          </Link>
        </p>
      </div>
    </FunnelShell>
  );
}
