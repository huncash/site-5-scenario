import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DemoSlotTeaser(props: { title: string; body: string; cta: string; to?: string }) {
  const { title, body, cta, to = "/f/multi-site/demo" } = props;
  return (
    <Card className="relative overflow-hidden border-slate-700/60 bg-slate-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-base font-semibold text-slate-100">
          {title}
          <Badge variant="secondary" className="ml-2 text-[10px]">
            preload
          </Badge>
        </CardTitle>
        <div className="mt-0.5 text-[11px] text-slate-300">
          A demó a meglévő rendszerállapotot tölti be — nincs új feature, csak wrapper.
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-[12px] text-slate-300">{body}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <a href={to}>{cta}</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/f/multi-site/pricing">Csomagok</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

