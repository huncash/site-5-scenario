import { grantLocalLicense } from "@/lib/license";
import type { LicenseEntitlement } from "@/lib/license";

export function applySchoolCampusLicense(): LicenseEntitlement {
  return grantLocalLicense("campus");
}
