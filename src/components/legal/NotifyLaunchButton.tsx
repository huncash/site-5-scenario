import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useMeshRepository } from "@/lib/mesh/meshRepository";
import { hasModuleNotify, MODULE_NOTIFY_EVENT, saveModuleNotify } from "@/lib/moduleNotify";
import { cn } from "@/lib/utils";

export function NotifyLaunchButton({
  featureId,
  className,
  variant = "default",
  size = "default",
  onSaved,
}: {
  featureId: string;
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm";
  onSaved?: () => void;
}) {
  const { t } = useI18n();
  const repo = useMeshRepository();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let live = true;
    void hasModuleNotify(repo, featureId).then((on) => {
      if (live) setSaved(on);
    });
    const sync = () => {
      void hasModuleNotify(repo, featureId).then(setSaved);
    };
    window.addEventListener(MODULE_NOTIFY_EVENT, sync);
    return () => {
      live = false;
      window.removeEventListener(MODULE_NOTIFY_EVENT, sync);
    };
  }, [repo, featureId]);

  const save = useCallback(async () => {
    if (saved || pending) return;
    setPending(true);
    try {
      await saveModuleNotify(repo, featureId);
      setSaved(true);
      toast.success(t("door.notifySaved"));
      onSaved?.();
    } finally {
      setPending(false);
    }
  }, [featureId, onSaved, pending, repo, saved, t]);

  return (
    <Button
      type="button"
      size={size}
      variant={saved ? "outline" : variant}
      className={cn(saved ? undefined : variant === "default" ? "btn-cta" : undefined, className)}
      disabled={saved || pending}
      onClick={() => void save()}
    >
      {saved ? t("door.notifyDone") : t("door.notifySoon")}
    </Button>
  );
}
