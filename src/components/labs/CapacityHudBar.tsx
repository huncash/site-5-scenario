import { Briefcase, PackagePlus, SquareStack, UserRound, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n, type MessageKey } from "@/i18n";
import {
  capacityHudRows,
  formatCapacityFraction,
  readCapacityHud,
  type CapacityFraction,
} from "@/lib/capacityHud";
import { useSalesCart } from "@/hooks/useSalesCart";
import { nextPackageCartHref } from "@/lib/entitlement";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { JitAddonId } from "@/config/plans";

function goCart(href: string) {
  if (typeof window === "undefined" || !href) return;
  window.location.assign(href);
}

const HUD_ICON = {
  cases: Briefcase,
  slots: SquareStack,
  seats: UserRound,
  guests: Users,
} as const;

const HUD_LABEL_KEY = {
  cases: "labs.hudCase",
  slots: "labs.hudSlot",
  seats: "labs.hudSeat",
  guests: "labs.hudGuest",
} as const satisfies Record<CapacityFraction["id"], MessageKey>;

const HUD_ADDON: Record<CapacityFraction["id"], JitAddonId> = {
  cases: "case_plus_1",
  slots: "slot_plus_1",
  seats: "seat_plus_1",
  guests: "guest_plus_1",
};

export function CapacityHudBar({
  workspaceIds,
  profileCount,
  compact,
  berries,
  statusOnly,
  className,
}: {
  workspaceIds: readonly string[];
  profileCount: number;
  compact?: boolean;
  berries?: boolean;
  /** Címsor: 4 kapacitás + ikon + kosár. */
  statusOnly?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const hud = readCapacityHud({ profileCount, workspaceIds });
  const nextPack = nextPackageCartHref();
  const sales = useSalesCart();
  const putAddon = (id: JitAddonId) => {
    void sales.add(id).then(() => toast.message(t("labs.cartSaved")));
  };

  const addons: Array<{ id: JitAddonId; label: string }> = [
    { id: "case_plus_1", label: t("labs.addCase") },
    { id: "slot_plus_1", label: t("labs.addSlot") },
    { id: "seat_plus_1", label: t("labs.addSeat") },
    { id: "guest_plus_1", label: t("labs.addGuest") },
  ];

  const cart = (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={berries ? "h-7 w-7 rounded-full p-0" : "h-7 gap-1 px-2 text-[10px] font-medium"}
          aria-label={t("labs.addCasePack")}
        >
          <PackagePlus className="h-3 w-3" />
          {berries ? null : t("labs.addCasePack")}
        </Button>
      </PopoverTrigger>
        <PopoverContent align="end" className="z-[9999] w-64 space-y-1.5 p-2">
        <p className="px-1 text-[10px] leading-snug text-muted-foreground">{t("labs.cartHint")}</p>
        {addons.map((a) => (
          <button
            key={a.id}
            type="button"
            className="flex w-full rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-accent"
            onClick={() => putAddon(a.id)}
          >
            {a.label}
          </button>
        ))}
        {nextPack ? (
          <button
            type="button"
            className="flex w-full rounded-md px-2 py-1.5 text-left text-[12px] font-medium hover:bg-accent"
            onClick={() => goCart(nextPack.href)}
          >
            {t("labs.addNextPack")}
          </button>
        ) : null}
      </PopoverContent>
    </Popover>
  );

  if (statusOnly) {
    return (
      <aside
        className={cn("min-w-0 flex-1", className)}
        aria-label={t("labs.capacity")}
        data-labs-hud=""
      >
        <ul className="grid grid-cols-4 gap-1">
          {capacityHudRows(hud).map((row) => {
            const Icon = HUD_ICON[row.id];
            const name = t(HUD_LABEL_KEY[row.id]);
            const frac = formatCapacityFraction(row.used, row.limit);
            return (
              <li key={row.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full flex-col items-center gap-0.5 rounded-md px-0.5 py-0.5 text-center hover:bg-accent/60"
                      aria-label={`${name} ${frac}`}
                      onClick={() => putAddon(HUD_ADDON[row.id])}
                    >
                      <span className="text-[10px] leading-none text-muted-foreground">{name}</span>
                      <span className="font-mono text-[11px] tabular-nums leading-none text-foreground">
                        {frac}
                      </span>
                      <Icon className="h-3.5 w-3.5 text-foreground/80" aria-hidden />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="z-[9999] text-[11px]">
                    {addons.find((a) => a.id === HUD_ADDON[row.id])?.label}
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </aside>
    );
  }

  if (berries) {
    return (
      <aside className={cn("flex min-w-0 flex-wrap items-center gap-1", className)} aria-label={t("labs.capacity")}>
        {capacityHudRows(hud).map((row) => {
          const Icon = HUD_ICON[row.id];
          return (
            <Tooltip key={row.id}>
              <TooltipTrigger asChild>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-card/80 text-muted-foreground">
                  <Icon className="h-3 w-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="z-[9999] text-[11px]">
                {t(HUD_LABEL_KEY[row.id])} {formatCapacityFraction(row.used, row.limit)}
              </TooltipContent>
            </Tooltip>
          );
        })}
        {cart}
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-border/70 bg-card/90 px-2.5 py-1.5",
        compact ? "shadow-none" : "shadow-lg",
        className,
      )}
      aria-label={t("labs.capacity")}
    >
      <div className="min-w-0">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("labs.activeSumma")}
        </div>
        {!compact ? (
          <p className="text-[9px] leading-snug text-muted-foreground">{t("labs.licenseFrame")}</p>
        ) : null}
      </div>
      <ul className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-0.5">
        {capacityHudRows(hud).map((row) => (
          <li key={row.id} className="flex items-baseline gap-1 text-[11px]">
            <span className="text-muted-foreground">{t(HUD_LABEL_KEY[row.id])}</span>
            <span className="font-mono tabular-nums text-foreground">
              {formatCapacityFraction(row.used, row.limit)}
            </span>
          </li>
        ))}
      </ul>
      {cart}
      {!compact ? (
        <p className="basis-full text-[9px] leading-snug text-muted-foreground">{t("labs.payloadHint")}</p>
      ) : null}
    </aside>
  );
}
