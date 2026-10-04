import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        <p className="text-[12px] text-muted-foreground">{body}</p>
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

