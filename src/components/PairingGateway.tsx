import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy } from "lucide-react";

import { ACCESS_ROLE, type AccessRole } from "@/lib/accessRole";
import { useMeshRepository } from "@/lib/mesh/meshRepository";
import { setMeshTransport } from "@/lib/mesh/meshRepository";
import { WebRTCDataTransport } from "@/lib/mesh/transport";
import { isViewerInviteRevokedLocally } from "@/lib/viewerInvite";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
    };
  }, []);

  const copy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => setCopied(false), 2200);
  }, [text]);

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded border px-2 py-1 text-xs"
      onClick={copy}
      disabled={!text}
    >
      <Copy className="h-3.5 w-3.5" />
      {copied ? "Másolva!" : "Másolás vágólapra"}
    </button>
  );
}

export function PairingGateway({
  sessionId,
  accessRole = ACCESS_ROLE.OWNER_EDITOR,
}: {
  sessionId?: string;
  accessRole?: AccessRole;
}) {
  const repo = useMeshRepository();
  const [status, setStatus] = useState<string>("");
  const [mode, setMode] = useState<"offer" | "answer">(() => {
    if (typeof navigator === "undefined") return "offer";
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("iphone") || ua.includes("ipad") ? "answer" : "offer";
  });

  const [offerBlob, setOfferBlob] = useState("");
  const [answerBlob, setAnswerBlob] = useState("");
  const [remoteBlob, setRemoteBlob] = useState("");
  const [qr, setQr] = useState<string>("");

  const clean = useMemo(() => sessionId?.trim() || "", [sessionId]);
  const viewer = accessRole === ACCESS_ROLE.VIEWER_READONLY;

  useEffect(() => {
    if (!clean) {
      setStatus("Hiányzó session paraméter.");
      return;
    }
    if (viewer && isViewerInviteRevokedLocally(clean)) {
      setStatus("Ez az olvasói kulcs visszavonva.");
      return;
    }
    void repo
      .save("pairingSessions", {
        id: clean,
        created_at: new Date().toISOString(),
        role: accessRole,
        revoked: viewer ? isViewerInviteRevokedLocally(clean) : false,
      })
      .then(() =>
        setStatus(
          viewer
            ? `Olvasói session: ${clean} (VIEWER_READONLY)`
            : `Session mentve: ${clean}`,
        ),
      )
      .catch((e: unknown) =>
        setStatus(e instanceof Error ? e.message : "Nem sikerült menteni a session-t."),
      );
  }, [accessRole, clean, repo, viewer]);

  const transport = useMemo(
    () => new WebRTCDataTransport({ channelLabel: `mesh:${clean || "session"}` }),
    [clean],
  );

  useEffect(() => {
    setMeshTransport(transport);
    return () => setMeshTransport(null);
  }, [transport]);

  useEffect(() => {
    const off = transport.onStatus((s) => setStatus(`WebRTC: ${s}`));
    return () => off();
  }, [transport]);

  useEffect(() => {
    const off = transport.onOpen(() => {
      if (typeof window !== "undefined") window.location.assign("/");
    });
    return () => off();
  }, [transport]);

  const makeQr = useCallback(async (text: string) => {
    if (!text) return setQr("");
    try {
      setQr(await QRCode.toDataURL(text, { errorCorrectionLevel: "M", margin: 1, scale: 5 }));
    } catch {
      setQr("");
    }
  }, []);

  const createOffer = useCallback(async () => {
    const blob = await transport.createOffer();
    setOfferBlob(blob);
    await makeQr(blob);
  }, [makeQr, transport]);

  const acceptOffer = useCallback(async () => {
    const blob = await transport.acceptOffer(remoteBlob.trim());
    setAnswerBlob(blob);
    await makeQr(blob);
  }, [makeQr, remoteBlob, transport]);

  const acceptAnswer = useCallback(async () => {
    await transport.acceptAnswer(remoteBlob.trim());
  }, [remoteBlob, transport]);

  return (
    <div className="mx-auto max-h-[80vh] w-full max-w-[500px] space-y-3 overflow-y-auto px-6 py-10">
      <h1 className="text-lg font-semibold tracking-tight">Párosítás</h1>
      {viewer ? (
        <div className="rounded border border-amber-400/40 bg-amber-500/10 p-3 text-[12px] text-amber-100">
          Olvasói mód (VIEWER_READONLY): szcenáriók és elemzés engedélyezett; adatbevitel, törlés, nyers export
          tiltva. A tulajdonos egyoldalúan visszavonhatja a kulcsot.
        </div>
      ) : null}
      <div className="rounded border p-3 text-sm">{status || "Inicializálás…"}</div>

      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          className={`rounded border px-2 py-1 ${mode === "offer" ? "bg-muted" : ""}`}
          onClick={() => setMode("offer")}
        >
          PC (Offer)
        </button>
        <button
          type="button"
          className={`rounded border px-2 py-1 ${mode === "answer" ? "bg-muted" : ""}`}
          onClick={() => setMode("answer")}
        >
          iOS (Answer)
        </button>
      </div>

      {mode === "offer" ? (
        <div className="space-y-2 rounded border p-3">
          <div className="text-sm font-semibold">1) Offer generálása</div>
          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={createOffer}>
            Offer készítése
          </button>

          {!!offerBlob && (
            <>
              <CopyButton text={offerBlob} />
              <textarea
                className="h-28 w-full rounded border bg-background p-2 font-mono text-[10px]"
                value={offerBlob}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
              />
            </>
          )}

          {!!qr && (
            <img src={qr} alt="Offer/Answer QR" className="h-56 w-56 rounded bg-white p-2" />
          )}

          <div className="text-sm font-semibold">2) Answer beillesztése</div>
          <textarea
            className="h-28 w-full rounded border bg-background p-2 font-mono text-[10px]"
            value={remoteBlob}
            onChange={(e) => setRemoteBlob(e.target.value)}
            placeholder="Ide illeszd az iOS által generált ANSWER blobot"
          />
          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={acceptAnswer}>
            Answer elfogadása
          </button>
        </div>
      ) : (
        <div className="space-y-2 rounded border p-3">
          <div className="text-sm font-semibold">1) Offer beillesztése</div>
          <textarea
            className="h-28 w-full rounded border bg-background p-2 font-mono text-[10px]"
            value={remoteBlob}
            onChange={(e) => setRemoteBlob(e.target.value)}
            placeholder="Ide illeszd a PC által generált OFFER blobot"
          />
          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={acceptOffer}>
            Answer generálása
          </button>

          {!!answerBlob && (
            <>
              <CopyButton text={answerBlob} />
              <textarea
                className="h-28 w-full rounded border bg-background p-2 font-mono text-[10px]"
                value={answerBlob}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
              />
            </>
          )}

          {!!qr && (
            <img src={qr} alt="Offer/Answer QR" className="h-56 w-56 rounded bg-white p-2" />
          )}
        </div>
      )}
    </div>
  );
}

