import { useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";

import { AddonModuleDialog } from "@/components/cases/AddonModuleDialog";
import { SimLegalDisclaimer } from "@/components/legal/SimLegalDisclaimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { caseBlurb, caseTitle, useI18n } from "@/i18n";
import { demoSerialFromId, KAHN_SEGMENT_ID, type DemoSegmentId } from "@/lib/demoCatalog";
import { demoCaseSlotCount } from "@/lib/demoCaseSlots";
import type { DemoCatalogIndustry, DemoCatalogKind } from "@/lib/coreCases";
import { recordEngineClick } from "@/lib/engineInterest";
import { isLabsEngineId } from "@/lib/labsTechTree";
import {
  isCoreDefaultKind,
  isStartableScenarioKind,
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
  /** Nyitott kategóriák; alapból csak a Gazdasági Szcenárió Motor. */
  defaultOpenKinds?: DemoCatalogKind[];
  /** Csak ezek a kind-ek; school: kizárólag economic. */
  allowedKinds?: DemoCatalogKind[];
  className?: string;
};

const DEFAULT_CASE: DemoSegmentId = KAHN_SEGMENT_ID;

export function HierarchicalCaseChooser({
  variant = "door",
  busyId = null,
  disabled = false,
  onSelect,
  defaultOpenKinds,
  allowedKinds,
  className,
}: Props) {
  const { t, locale } = useI18n();
  const groups = useMemo(() => {
    const all = publicScenarioKindGroups();
    if (!allowedKinds?.length) return all;
    return all.filter((g) => allowedKinds.includes(g.kind));
  }, [allowedKinds]);
  const openDefault = defaultOpenKinds?.[0] ?? "economic";
  const initialKind = groups.some((g) => g.kind === openDefault) ? openDefault : groups[0]?.kind ?? "economic";
  const [kind, setKind] = useState<DemoCatalogKind>(initialKind);
  const [industry, setIndustry] = useState<DemoCatalogIndustry | "all">("all");
  const [caseId, setCaseId] = useState<DemoSegmentId>(DEFAULT_CASE);
  const [addonTitle, setAddonTitle] = useState<string | null>(null);

  const active = groups.find((g) => g.kind === kind) ?? groups[0];
  const startable = active ? isStartableScenarioKind(active.kind) : false;
  const kindTitle = active
    ? t(variant === "login" ? SCENARIO_KIND_TITLE_KEY[active.kind] : SCENARIO_KIND_CARD_TITLE_KEY[active.kind])
    : "";

  const industries = active?.industries ?? [];
  const buckets =
    industry === "all" ? industries : industries.filter((b) => b.industry === industry);
  const cases = buckets.flatMap((b) => b.segments);
  const selected = cases.some((s) => s.id === caseId) ? caseId : (cases[0]?.id ?? DEFAULT_CASE);
  const selectedMeta = cases.find((s) => s.id === selected);
  const selectedBlurb = selectedMeta ? (caseBlurb(selectedMeta.id, locale) ?? selectedMeta.blurb) : "";

  const pickKind = (next: DemoCatalogKind) => {
    if (isLabsEngineId(next)) recordEngineClick(next);
    setKind(next);
    setIndustry("all");
    const g = groups.find((x) => x.kind === next);
    const first = g?.industries[0]?.segments[0]?.id;
    const prefer = next === "economic" ? DEFAULT_CASE : first;
    const ids = g?.industries.flatMap((b) => b.segments.map((s) => s.id)) ?? [];
    setCaseId((prefer && ids.includes(prefer) ? prefer : first) ?? DEFAULT_CASE);
  };

  const start = () => {
    if (!active) return;
    if (isLabsEngineId(active.kind)) recordEngineClick(active.kind);
    if (startable) onSelect(selected);
    else setAddonTitle(kindTitle);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t("door.typesTitle")}>
        {groups.map((group) => {
          const titleKey = variant === "login" ? SCENARIO_KIND_TITLE_KEY[group.kind] : SCENARIO_KIND_CARD_TITLE_KEY[group.kind];
          const on = group.kind === kind;
          return (
            <button
              key={group.kind}
              type="button"
              role="tab"
              aria-selected={on}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-left text-[12px] font-medium transition-colors border-l-4",
                SCENARIO_KIND_ACCENT[group.kind],
                on
                  ? "border-border bg-card text-foreground"
                  : "border-border/50 bg-background/30 text-muted-foreground hover:text-foreground",
              )}
              onClick={() => pickKind(group.kind)}
            >
              {t(titleKey)}
            </button>
          );
        })}
      </div>

      {active ? (
        <div className="rounded-xl border border-border/60 bg-card/30 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={startable ? "secondary" : "outline"} className="text-[10px] font-medium">
              {isCoreDefaultKind(active.kind)
                ? t("door.coreBadge")
                : startable
                  ? t("door.availableBadge")
                  : t("door.addonBadge")}
            </Badge>
            {variant === "door" ? (
              <p className="text-[12px] leading-snug text-muted-foreground">{t(SCENARIO_KIND_BLURB_KEY[active.kind])}</p>
            ) : null}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[11px] font-medium text-muted-foreground">
              {t("door.chooseIndustry")}
              <Select
                value={industry}
                onValueChange={(v) => setIndustry(v as DemoCatalogIndustry | "all")}
              >
                <SelectTrigger className="h-11 bg-background/50 text-sm text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("door.filterAll")}</SelectItem>
                  {industries.map((bucket) => (
                    <SelectItem key={bucket.industry} value={bucket.industry}>
                      {t(SCENARIO_INDUSTRY_TITLE_KEY[bucket.industry])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="grid gap-1.5 text-[11px] font-medium text-muted-foreground">
              {t("door.chooseCase")}
              <Select value={selected} onValueChange={(v) => setCaseId(v as DemoSegmentId)}>
                <SelectTrigger className="h-11 bg-background/50 text-sm text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buckets.map((bucket) => (
                    <SelectGroup key={bucket.industry}>
                      <SelectLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {t(SCENARIO_INDUSTRY_TITLE_KEY[bucket.industry])}
                      </SelectLabel>
                      {bucket.segments.map((s) => {
                        const title = caseTitle(s.id, locale) ?? s.title;
                        const serial = demoSerialFromId(s.id);
                        const slots = demoCaseSlotCount(s.id);
                        const label = serial != null ? `DEMO ${serial} — ${title}` : title;
                        return (
                          <SelectItem key={s.id} value={s.id}>
                            {label} · {t("door.slotCount", { n: slots })}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>

          {variant === "door" && selectedBlurb ? (
            <p className="mt-3 text-[12px] leading-snug text-muted-foreground">{selectedBlurb}</p>
          ) : null}

          {active && (active.kind === "education" || selected === KAHN_SEGMENT_ID) ? (
            <SimLegalDisclaimer className="mt-3" />
          ) : null}

          <Button
            type="button"
            className="mt-4 w-full sm:w-auto"
            disabled={disabled || busyId !== null || cases.length === 0}
            onClick={start}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            {busyId === selected ? t("door.opening") : startable ? t("door.startDemo") : t("door.notifySoon")}
          </Button>
        </div>
      ) : null}

      <AddonModuleDialog
        open={addonTitle !== null}
        title={addonTitle ?? ""}
        notifyId={active?.kind}
        onOpenChange={(next) => {
          if (!next) setAddonTitle(null);
        }}
      />
    </div>
  );
}
