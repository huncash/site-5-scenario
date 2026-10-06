import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supportPageUrl } from "@/lib/support";

const HORIZON_SHOTS = [
  { src: "/product-shots/horizon-6-cashflow.webp", label: "6 hó — cashflow" },
  { src: "/product-shots/horizon-6-heatmap.webp", label: "6 hó — tételek" },
  { src: "/product-shots/horizon-12-heatmap.webp", label: "12 hó — tételek" },
] as const;

export function DemoSlotTeaser(props: {
  title: string;
  body: string;
  cta: string;
  to?: string;
  pricingHref: string;
  onCta?: () => void;
}) {
  const { title, body, cta, to, pricingHref, onCta } = props;
  return (
    <Card className="relative overflow-hidden border-white/12 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-base font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-1.5">
          {HORIZON_SHOTS.map((shot) => (
            <figure key={shot.src} className="min-w-0 overflow-hidden rounded-md border border-white/10">
              <img src={shot.src} alt={shot.label} className="aspect-[16/10] h-auto w-full object-cover object-top" />
              <figcaption className="truncate px-1 py-0.5 text-center text-[9px] text-muted-foreground">
                {shot.label}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="text-[12px] text-muted-foreground">{body}</p>
        <p className="text-[11px] text-muted-foreground">
          6 → 12 hónap: ugyanaz a tétel, hosszabb ablak.{" "}
          <a className="underline underline-offset-2" href={supportPageUrl("lecke-dash-horizont")}>
            Lecke
          </a>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {onCta ? (
            <Button type="button" className="btn-cta" onClick={onCta}>
              {cta}
            </Button>
          ) : (
            <Button asChild className="btn-cta">
              <a href={to}>{cta}</a>
            </Button>
          )}
          <Button asChild variant="outline" className="border-white/35 bg-transparent text-foreground">
            <a href={pricingHref}>Csomagok</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
