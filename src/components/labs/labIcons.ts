import {
  Compass,
  Flag,
  Gauge,
  Layers,
  LayoutGrid,
  LineChart,
  Radio,
  VenetianMask,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { DashboardLabId } from "@/lib/dashboardLabs";

export const LAB_ICON: Record<DashboardLabId, LucideIcon> = {
  "labs-baseline": Flag,
  "labs-sim": LineChart,
  "labs-shock": Zap,
  "labs-advise": Compass,
  "labs-kpi": Gauge,
  "labs-halmozott": Layers,
  "labs-szumma": LayoutGrid,
  "labs-edge": Radio,
  "labs-anon": VenetianMask,
};
