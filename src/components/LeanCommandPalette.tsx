"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  requestWorkspaceSwitch,
  WORKSPACE_CATALOG_EVENT,
  type WorkspaceCatalogItem,
} from "@/lib/workspaceSwitch";

type Item = {
  id: string;
  label: string;
  hint: string;
  keywords: string;
};

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function LeanCommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [extra, setExtra] = useState<WorkspaceCatalogItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onCatalog = (e: Event) => {
      const items = (e as CustomEvent<{ items?: WorkspaceCatalogItem[] }>).detail?.items;
      if (Array.isArray(items)) setExtra(items);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(WORKSPACE_CATALOG_EVENT, onCatalog as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(WORKSPACE_CATALOG_EVENT, onCatalog as EventListener);
    };
  }, []);

  const items = useMemo<Item[]>(() => {
    const rows: Item[] = [
      { id: "personal", label: "Magán", hint: "Személyes tér", keywords: "magan personal privat" },
      { id: "__all", label: "Szumma", hint: "Összesítés", keywords: "szumma osszes all" },
    ];
    for (const w of extra) {
      rows.push({
        id: w.id,
        label: w.label,
        hint: w.hint,
        keywords: w.keywords ?? "",
      });
    }
    return rows;
  }, [extra]);

  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    if (!nq) return items;
    return items.filter((it) => norm(`${it.label} ${it.hint} ${it.keywords}`).includes(nq));
  }, [items, q]);

  const go = (id: string) => {
    requestWorkspaceSwitch(id);
    setOpen(false);
    setQ("");
    try {
      localStorage.setItem("szcenario_home_mode", "dashboard");
      window.dispatchEvent(new Event("szcenario:home_mode"));
    } catch {
      // ignore
    }
    void navigate({ to: "/" });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={q}
        onValueChange={setQ}
        placeholder="Projekt / munkatér keresése…"
      />
      <CommandList>
        <CommandEmpty>Nincs találat.</CommandEmpty>
        <CommandGroup heading="Lean betöltő">
          {filtered.map((it) => (
            <CommandItem key={it.id} value={`${it.label} ${it.keywords}`} onSelect={() => go(it.id)}>
              <span className="min-w-0 truncate">{it.label}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{it.hint}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
