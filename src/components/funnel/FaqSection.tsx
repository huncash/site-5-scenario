import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function FaqSection(props: { items: ReadonlyArray<{ q: string; a: string }>; defaultOpenFirst?: boolean }) {
  const { items, defaultOpenFirst = true } = props;
  const first = items[0]?.q ?? null;
  return (
    <div className="rounded-xl border border-border/60 bg-background/30 px-4 py-3">
      <div className="text-sm font-semibold text-slate-100">GYIK</div>
      <div className="mt-1 text-[12px] text-slate-300">
        Local‑first adatbiztonság és multi‑site használat — röviden, lényegre törően.
      </div>
      <div className="mt-3">
        <Accordion type="single" collapsible defaultValue={defaultOpenFirst && first ? first : undefined}>
          {items.map((x) => (
            <AccordionItem key={x.q} value={x.q} className="border-border/50">
              <AccordionTrigger className="text-slate-100 hover:no-underline">{x.q}</AccordionTrigger>
              <AccordionContent className="text-slate-300">{x.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

