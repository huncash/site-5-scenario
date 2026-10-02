"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { SupportEmbedModal } from "@/components/support/SupportEmbedModal";

type SupportEmbedApi = {
  openEmbed: (slug: string, title?: string) => void;
  closeEmbed: () => void;
};

const Ctx = createContext<SupportEmbedApi | null>(null);

export function SupportEmbedProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [title, setTitle] = useState("Súgó");

  const openEmbed = useCallback((next: string, nextTitle?: string) => {
    setTitle(nextTitle ?? "Súgó");
    setSlug(next);
  }, []);

  const closeEmbed = useCallback(() => setSlug(null), []);

  const api = useMemo(() => ({ openEmbed, closeEmbed }), [openEmbed, closeEmbed]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <SupportEmbedModal
        open={Boolean(slug)}
        onOpenChange={(o) => {
          if (!o) closeEmbed();
        }}
        slug={slug ?? "tippek"}
        title={title}
      />
    </Ctx.Provider>
  );
}

export function useSupportEmbed() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSupportEmbed must be used within SupportEmbedProvider");
  return v;
}

export function useSupportEmbedOptional() {
  return useContext(Ctx);
}
