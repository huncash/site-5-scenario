import { useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { caseBlurb, caseTitle, useI18n } from "@/i18n";
import { demoSerialFromId, type DemoSegmentId } from "@/lib/demoCatalog";
import { demoCaseSlotCount } from "@/lib/demoCaseSlots";
import type { DemoCatalogIndustry, DemoCatalogKind } from "@/lib/coreCases";
import {
  publicScenarioKindGroups,
  SCENARIO_INDUSTRY_TITLE_KEY,
  SCENARIO_KIND_ACCENT,
  SCENARIO_KIND_BLURB_KEY,
  SCENARIO_KIND_CARD_TITLE_KEY,
  SCENARIO_KIND_TITLE_KEY,
} from "@/lib/scenarioCatalog";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "door" | "login";
  busyId?: DemoSegmentId | null;
  disabled?: boolean;
  onSelect: (id: DemoSegmentId) => void;
  /** Nyitott kategóriák; alapból mind. */
  defaultOpenKinds?: DemoCatalogKind[];
  className?: string;
};

export function HierarchicalCaseChooser({
  variant = "door",
  busyId = null,
  disabled = false,
  onSelect,
  defaultOpenKinds,
  className,
}: Props) {
  const { t, locale } = useI18n();
  const groups = useMemo(() => publicScenarioKindGroups(), []);
  const openDefault = defaultOpenKinds ?? groups.map((g) => g.kind);
  const [industryByKind, setIndustryByKind] = useState<Partial<Record<DemoCatalogKind, DemoCatalogIndustry | "all">>>({});

  return (
    <div className={cn("space-y-3", className)}>
      <Accordion type="multiple" defaultValue={openDefault} className="w-full">
        {groups.map((group) => {
          const filter = industryByKind[group.kind] ?? "all";
          const buckets =
            filter === "all" ? group.industries : group.industries.filter((b) => b.industry === filter);
          const titleKey = variant === "login" ? SCENARIO_KIND_TITLE_KEY[group.kind] : SCENARIO_KIND_CARD_TITLE_KEY[group.kind];

          return (
            <AccordionItem
              key={group.kind}
              value={group.kind}
              className={cn(
                "rounded-xl border border-border/60 bg-card/30 px-3 mb-3 border-l-4 last:mb-0",
                SCENARIO_KIND_ACCENT[group.kind],
              )}
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="min-w-0 pr-3 text-left">
                  <div className="text-sm font-semibold text-foreground">{t(titleKey)}</div>
                  {variant === "door" ? (
                    <p className="mt-1 text-[12px] font-normal leading-snug text-muted-foreground">
                      {t(SCENARIO_KIND_BLURB_KEY[group.kind])}
                    </p>
                  ) : null}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label={t("door.industryFilters")}>
                  <FilterChip
                    active={filter === "all"}
                    onClick={() => setIndustryByKind((prev) => ({ ...prev, [group.kind]: "all" }))}
                    label={t("door.filterAll")}
                  />
                  {group.industries.map((bucket) => (
                    <FilterChip
                      key={bucket.industry}
                      active={filter === bucket.industry}
                      onClick={() => setIndustryByKind((prev) => ({ ...prev, [group.kind]: bucket.industry }))}
                      label={t(SCENARIO_INDUSTRY_TITLE_KEY[bucket.industry])}
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  {buckets.map((bucket) => (
                    <div key={bucket.industry} className="space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {t(SCENARIO_INDUSTRY_TITLE_KEY[bucket.industry])}
                      </p>
                      <div className="grid gap-1.5">
                        {bucket.segments.map((s) => {
                          const title = caseTitle(s.id, locale) ?? s.title;
                          const serial = demoSerialFromId(s.id);
                          const slots = demoCaseSlotCount(s.id);
                          const label = serial != null ? `DEMO ${serial} — ${title}` : title;
                          return (
                            <Button
                              key={s.id}
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-auto w-full justify-start gap-2 whitespace-normal px-3 py-2.5 text-left"
                              disabled={disabled || busyId !== null}
                              onClick={() => onSelect(s.id)}
                              title={caseBlurb(s.id, locale) ?? s.blurb}
                            >
                              <PlayCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-medium text-foreground">{label}</span>
                                  <Badge variant="outline" className="text-[10px] font-medium tabular-nums">
                                    {t("door.slotCount", { n: slots })}
                                  </Badge>
                                </span>
                                {variant === "door" ? (
                                  <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                                    {caseBlurb(s.id, locale) ?? s.blurb}
                                  </span>
                                ) : null}
                                {busyId === s.id ? (
                                  <span className="mt-1 block text-[11px] text-primary">{t("door.opening")}</span>
                                ) : null}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-emerald-700/50 bg-emerald-950/50 text-emerald-100"
          : "border-border/70 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground",
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
