import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { toast } from "sonner";
import {
  Camera,
  ClipboardPaste,
  QrCode,
  ShieldAlert,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  FrameCollector,
  applyTransferPayload,
  buildTransferPayload,
  encodeFrames,
  isTransferFrame,
  type TransferKind,
} from "@/lib/profileTransfer";

// ------------------------------ EXPORT (feloldott állapotból) --------------

export function ExportQrDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [full, setFull] = useState(true);
  const [frames, setFrames] = useState<string[]>([]);
  const [dataUrls, setDataUrls] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  const build = useCallback(async (kind: TransferKind) => {
    setBusy(true);
    try {
      const payload = await buildTransferPayload(kind);
      const fr = encodeFrames(payload);
      const urls = await Promise.all(
        fr.map((f) =>
          QRCode.toDataURL(f, {
            errorCorrectionLevel: "M",
            margin: 1,
            scale: 6,
          }),
        ),
      );
      setFrames(fr);
      setDataUrls(urls);
      setIdx(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Hiba a QR generáláskor.");
      setFrames([]);
      setDataUrls([]);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void build(full ? "profile-full" : "profile-shell");
  }, [open, full, build]);

  useEffect(() => {
    if (!open) {
      setFrames([]);
      setDataUrls([]);
      setIdx(0);
    }
  }, [open]);

  useEffect(() => {
    if (dataUrls.length <= 1) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % dataUrls.length);
    }, 450);
    return () => clearInterval(t);
  }, [dataUrls.length]);

  const total = dataUrls.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Eszköz hozzáadása QR-rel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                A QR titkosított adatokat tartalmaz, de a <em>sót</em> és a{" "}
                <em>verifiert</em> is — aki lefotózza, offline próbálhatja
                törni a mesterjelszavadat. Csak megbízható eszköz kamerájával
                olvastasd be, és zárd be a QR-t utána.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <Label htmlFor="qr-full" className="text-sm">
                Teljes snapshot
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Ki: csak profil-héj (üresen), be: profil + összes tétel.
              </p>
            </div>
            <Switch id="qr-full" checked={full} onCheckedChange={setFull} />
          </div>

          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-border/60 bg-muted/30 p-4">
            {busy && (
              <p className="text-sm text-muted-foreground">QR generálása…</p>
            )}
            {!busy && dataUrls[idx] && (
              <>
                <img
                  src={dataUrls[idx]}
                  alt={`QR frame ${idx + 1}/${total}`}
                  className="h-64 w-64 rounded bg-white p-2"
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  {total > 1
                    ? `Frame ${idx + 1} / ${total} — tartsd a kamera előtt, amíg mind lefut`
                    : "Olvasd be a másik eszköz kamerájával"}
                </p>
              </>
            )}
          </div>

          {frames.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">
                Kamera nélkül? Másold ki a szöveges formát
              </summary>
              <Textarea
                readOnly
                className="mt-2 h-32 font-mono text-[10px]"
                value={frames.join("\n")}
                onFocus={(e) => e.currentTarget.select()}
              />
            </details>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            QR bezárása
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------ IMPORT (login képernyőről) -----------------

export function ImportQrDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onImported: (profileId: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const collectorRef = useRef(new FrameCollector());

  const [status, setStatus] = useState<"idle" | "camera" | "no-camera">("idle");
  const [progress, setProgress] = useState({ got: 0, total: 0 });
  const [pasteText, setPasteText] = useState("");
  const [importing, setImporting] = useState(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const finalize = useCallback(async () => {
    try {
      setImporting(true);
      const payload = collectorRef.current.assemble();
      const created = await applyTransferPayload(payload);
      toast.success(`Profil importálva: „${created.name}"`);
      collectorRef.current.reset();
      stopCamera();
      onOpenChange(false);
      onImported(created.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sikertelen import.");
    } finally {
      setImporting(false);
    }
  }, [onImported, onOpenChange, stopCamera]);

  const ingest = useCallback(
    (raw: string) => {
      if (!isTransferFrame(raw)) return;
      const res = collectorRef.current.ingest(raw);
      if (!res.accepted) return;
      setProgress({ got: res.got, total: res.total });
      if (res.done) void finalize();
    },
    [finalize],
  );

  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("no-camera");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setStatus("camera");

      const canvas = canvasRef.current ?? document.createElement("canvas");
      canvasRef.current = canvas;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const tick = () => {
        if (!streamRef.current) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(img.data, img.width, img.height, {
            inversionAttempts: "dontInvert",
          });
          if (code?.data) ingest(code.data);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setStatus("no-camera");
    }
  }, [ingest]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      collectorRef.current.reset();
      setProgress({ got: 0, total: 0 });
      setPasteText("");
      setStatus("idle");
      return;
    }
    void startCamera();
    return () => stopCamera();
  }, [open, startCamera, stopCamera]);

  const applyPaste = () => {
    const lines = pasteText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) {
      toast.error("Illessz be legalább egy QR-frame szöveget.");
      return;
    }
    for (const line of lines) ingest(line);
    if (progress.total > 0 && progress.got < progress.total) {
      toast.info(`Beolvasva: ${progress.got}/${progress.total}. Illessz be többet.`);
    }
  };

  const progressLabel = useMemo(() => {
    if (progress.total === 0) return "Keresés…";
    return `${progress.got} / ${progress.total} frame`;
  }, [progress]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Eszköz hozzáadása QR-rel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            A meglévő eszközön nyisd meg a profilt → <em>Eszköz hozzáadása</em>,
            és tartsd a QR-t a kamera elé. Utána itt beírod a mesterjelszót.
          </p>

          <div className="relative overflow-hidden rounded-lg border border-border/60 bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-64 w-full object-cover"
            />
            {status !== "camera" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-center text-xs text-white/80">
                {status === "no-camera"
                  ? "Nincs elérhető kamera — használd a szöveges beillesztést lent."
                  : "Kamera engedélyezése…"}
              </div>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {importing ? "Importálás…" : progressLabel}
          </p>

          <details className="text-xs">
            <summary className="flex cursor-pointer items-center gap-1 text-muted-foreground">
              <ClipboardPaste className="h-3.5 w-3.5" />
              QR helyett szöveges beillesztés
            </summary>
            <Textarea
              className="mt-2 h-24 font-mono text-[10px]"
              placeholder="Illeszd be a QR-frame sorokat (LFV1|…)"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full"
              onClick={applyPaste}
              disabled={importing}
            >
              Beolvasás
            </Button>
          </details>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
