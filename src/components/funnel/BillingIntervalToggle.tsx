import { useEffect, useState } from "react";

import {
  BILLING_INTERVAL_EVENT,
  DEFAULT_BILLING_INTERVAL,
  readBillingInterval,
  writeBillingInterval,
  type BillingInterval,
} from "@/lib/funnelOrder";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function useBillingInterval() {
  const [interval, setIntervalState] = useState<BillingInterval>(DEFAULT_BILLING_INTERVAL);

  useEffect(() => {
    const sync = () => setIntervalState(readBillingInterval());
    sync();
    window.addEventListener(BILLING_INTERVAL_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BILLING_INTERVAL_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setInterval = (next: BillingInterval) => {
    writeBillingInterval(next);
    setIntervalState(next);
  };

  return [interval, setInterval] as const;
}

export function BillingIntervalToggle(props: { className?: string }) {
  const [interval, setInterval] = useBillingInterval();
  const { t } = useI18n();
  return (
    <div className={cn("inline-flex rounded-lg border border-white/15 bg-card p-1", props.className)}>
      <button
        type="button"
        className={cn(
          "rounded-md px-3 py-1.5 text-[12px] font-medium",
          interval === "yearly" ? "bg-cyan-500 text-slate-950" : "text-muted-foreground",
        )}
        onClick={() => setInterval("yearly")}
      >
        {t("pricing.yearly")}
      </button>
      <button
        type="button"
        className={cn(
          "rounded-md px-3 py-1.5 text-[12px] font-medium",
          interval === "monthly" ? "bg-cyan-500 text-slate-950" : "text-muted-foreground",
        )}
        onClick={() => setInterval("monthly")}
      >
        {t("pricing.monthly")}
      </button>
    </div>
  );
}
