import { useMemo, useState } from "react";
import { GraduationCap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { KB_ARTICLES, KB_CATEGORIES, type KnowledgeBaseArticle, type KnowledgeBaseCategoryId } from "@/lib/knowledgeBase";

function normalize(s: string) {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function KnowledgeBaseModal({
  open,
  onOpenChange,
  trigger,
}: {
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  trigger?: React.ReactNode;
}) {
  const [openState, setOpenState] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? Boolean(open) : openState;
  const setOpen = (o: boolean) => {
    if (!isControlled) setOpenState(o);
    onOpenChange?.(o);
  };

  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<KnowledgeBaseCategoryId | "all">("all");
  const [activeArticle, setActiveArticle] = useState<KnowledgeBaseArticle | null>(null);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    const inCat = (a: KnowledgeBaseArticle) => activeCat === "all" || a.category === activeCat;
    const inQuery = (a: KnowledgeBaseArticle) => {
      if (!nq) return true;
      const hay = normalize([a.title, a.summary, a.body, ...(a.tags ?? [])].join(" "));
      return hay.includes(nq);
    };
    return KB_ARTICLES.filter((a) => inCat(a) && inQuery(a));
  }, [activeCat, q]);

  const categories = KB_CATEGORIES;

  return (
    <>
      {trigger ? (
        <span
          onClick={() => setOpen(true)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? setOpen(true) : null)}
          role="button"
          tabIndex={0}
        >
          {trigger}
        </span>
      ) : null}

      <Dialog
        open={isOpen}
        onOpenChange={(o) => {
          setOpen(o);
          if (o && !activeArticle) setActiveArticle(KB_ARTICLES[0] ?? null);
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-slate-200" />
              Tudásbázis / GYIK
            </DialogTitle>
            <div className="text-xs text-slate-300">
              Kereshető rendszerleírás, fogalomtár és gyors magyarázatok a fő funkciókról.
            </div>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.currentTarget.value)}
                  placeholder="Keresés: pl. ÁFA, pilot, törlesztés, dedup…"
                  className="pl-8"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={activeCat === "all" ? "secondary" : "outline"}
                  size="sm"
                  className="h-7"
                  onClick={() => setActiveCat("all")}
                >
                  Összes
                </Button>
                {categories.map((c) => (
                  <Button
                    key={c.id}
                    type="button"
                    variant={activeCat === c.id ? "secondary" : "outline"}
                    size="sm"
                    className="h-7"
                    onClick={() => setActiveCat(c.id)}
                  >
                    {c.title}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-1">
                <div className="max-h-[60vh] overflow-auto rounded-md border border-slate-700/60 bg-slate-900/40 p-2">
                  {filtered.length === 0 ? (
                    <div className="p-3 text-xs text-slate-300">Nincs találat.</div>
                  ) : (
                    <div className="grid gap-1">
                      {filtered.map((a) => {
                        const active = a.id === activeArticle?.id;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setActiveArticle(a)}
                            className={cn(
                              "w-full rounded-md px-3 py-2 text-left text-xs hover:bg-slate-800/60",
                              active && "bg-slate-800/80 border border-slate-700/60",
                            )}
                          >
                            <div className="font-medium text-slate-100">{a.title}</div>
                            <div className="mt-0.5 line-clamp-2 text-[11px] text-slate-300">{a.summary}</div>
                            <div className="mt-1">
                              <Badge variant="secondary" className="text-[10px] font-normal">
                                {categories.find((c) => c.id === a.category)?.title ?? a.category}
                              </Badge>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="max-h-[60vh] overflow-auto rounded-md border border-slate-700/60 bg-slate-950/40 p-4">
                  {activeArticle ? (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-base font-semibold text-white">{activeArticle.title}</div>
                          <div className="mt-1 text-xs text-slate-300">{activeArticle.summary}</div>
                        </div>
                      </div>
                      <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                        {activeArticle.body}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-slate-300">Válassz egy cikket bal oldalon.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

