"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { SupportEmbedModal } from "@/components/support/SupportEmbedModal";
import { useI18n } from "@/i18n";

type SupportEmbedApi = {
  openEmbed: (slug: string, title?: string) => void;
  closeEmbed: () => void;
};

const Ctx = createContext<SupportEmbedApi | null>(null);

export function SupportEmbedProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [slug, setSlug] = useState<string | null>(null);
  const [title, setTitle] = useState(() => t("support.help"));

  const openEmbed = useCallback((next: string, nextTitle?: string) => {
    setTitle(nextTitle ?? t("support.help"));
    setSlug(next);
  }, [t]);

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
