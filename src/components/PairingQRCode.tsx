import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

import { useMeshRepository } from "@/lib/mesh/meshRepository";

function newSessionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function buildConnectUrl(sessionId: string) {
  if (typeof window === "undefined") return `/connect?session=${encodeURIComponent(sessionId)}`;
  const u = new URL("/connect", window.location.origin);
  u.searchParams.set("session", sessionId);
  return u.toString();
}

export function PairingQRCode() {
  const repo = useMeshRepository();
  const [sessionId, setSessionId] = useState(() => newSessionId());
  const url = useMemo(() => buildConnectUrl(sessionId), [sessionId]);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    void QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 1, scale: 6 }).then(
      setDataUrl,
    );
  }, [url]);

  useEffect(() => {
    void repo.save("pairingSessions", { id: sessionId, created_at: new Date().toISOString() });
  }, [repo, sessionId]);

  const regenerate = useCallback(() => setSessionId(newSessionId()), []);

  return (
    <div className="space-y-3 rounded border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">Eszközpárosítás (QR)</div>
        <button
          type="button"
          className="rounded-md border px-2 py-1 text-xs"
          onClick={regenerate}
        >
          Új session
        </button>
      </div>

      {dataUrl ? (
        <img src={dataUrl} alt="Pairing QR" className="h-48 w-48 rounded bg-white p-2" />
      ) : (
        <div className="text-xs text-muted-foreground">QR generálás…</div>
      )}

      <div className="break-all rounded bg-muted/40 p-2 text-[11px] text-muted-foreground">
        {url}
      </div>
    </div>
  );
}

