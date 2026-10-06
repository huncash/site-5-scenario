import { supportPricingHref } from "@/lib/support";
import type { PlanPermission } from "@/lib/planPermissions";

export type PlanUpgradeCopy = {
  title: string;
  purpose: string;
  featureId: string;
};

const UPGRADE: Partial<Record<PlanPermission, PlanUpgradeCopy>> = {
  WATCHED_FOLDER: {
    title: "Figyelt mappa",
    purpose:
      "A mappából olvasás a Pro csomagban él. Basicben a kivonatot fájlként választod a gépeden — semmi nem megy felhőbe.",
    featureId: "plan.watched_folder",
  },
  CUSTOM_RULES: {
    title: "Egyéni besorolási szabályok",
    purpose:
      "A beépített heurisztika Basicben is fut. Saját minta rögzítése — nem tanítás — a Pro csomagban él.",
    featureId: "plan.custom_rules",
  },
  BUSINESS_WORKSPACES: {
    title: "Vállalkozási modul",
    purpose:
      "Basic a magánvagyon és a kézi/fájl-import asztala. Vállalkozási ÁFA-kör és üzleti slot a Proban.",
    featureId: "plan.business",
  },
  PROJECTS: {
    title: "Projekt-slot",
    purpose: "Aktív és pihentetett projektek a Pro asztalán futnak. Basicben a magánpálya marad.",
    featureId: "plan.projects",
  },
  ADVANCED_SCENARIO: {
    title: "Összetett döntési mátrix",
    purpose:
      "Basicben a három alappálya él. Az elágazó mátrix és a teljes gazdasági motor a Pro csomagban van.",
    featureId: "plan.advanced_scenario",
  },
  MANAGE_GUESTS: {
    title: "Vendégmeghívó",
    purpose: "Meghívott vendég és megosztó kulcs a csomagod vendégkeretén belül.",
    featureId: "plan.guests",
  },
};

export function planUpgradeCopy(permission: PlanPermission): PlanUpgradeCopy {
  return (
    UPGRADE[permission] ?? {
      title: "Pro funkció",
      purpose: "Ez a belépési pont a Pro csomagban él. A számok a gépeden maradnak.",
      featureId: `plan.${permission.toLowerCase()}`,
    }
  );
}

export function planUpgradeHref(): string {
  return supportPricingHref("pro");
}
