import { LICENSE_CHANGE_EVENT, licenseInstallmentArrears, readLicense } from "@/lib/license";
import { useI18n } from "@/i18n";
import { useEffect, useState } from "react";

/** Tesztcsík a KPI sáv helyén/felett — vendégnézetben is. Nem zárja a motort. */
export function InstallmentArrearsBar() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(() => licenseInstallmentArrears());

  useEffect(() => {
    const sync = () => setVisible(licenseInstallmentArrears(readLicense()));
    sync();
    window.addEventListener(LICENSE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(LICENSE_CHANGE_EVENT, sync);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      data-installment-arrears=""
      className="mx-auto mb-1 w-full max-w-[98%] shrink-0 px-2 sm:px-3 md:px-4"
    >
      <div className="installment-arrears-tape px-2 py-2">
        <p className="installment-arrears-tape-label mx-auto max-w-[52rem] px-3 py-1.5 text-center text-[12px] font-bold leading-snug tracking-wide text-zinc-950 sm:text-[13px]">
          {t("dash.installmentArrears")}
        </p>
      </div>
    </div>
  );
}
