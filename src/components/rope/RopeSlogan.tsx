import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

type RopeSloganProps = {
  variant: "pricing" | "footer";
  className?: string;
};

/** Statikus szlogen a kötél-SVG alatt — nem lebegő tooltip. */
export function RopeSlogan({ variant, className }: RopeSloganProps) {
  const { t } = useI18n();

  if (variant === "pricing") {
    return (
      <div className={cn("mt-2 text-center", className)}>
        <p className="text-sm font-semibold text-slate-100">{t("rope.tipTitle")}</p>
        <p className="mx-auto mt-0.5 max-w-md text-xs leading-relaxed text-slate-300">{t("rope.tipBody")}</p>
      </div>
    );
  }

  return (
    <p className={cn("mt-1.5 max-w-sm text-left text-xs font-normal leading-relaxed text-slate-400", className)}>
      <span className="font-medium text-slate-200">{t("rope.tipTitle")}</span> {t("rope.tipBody")}
    </p>
  );
}
