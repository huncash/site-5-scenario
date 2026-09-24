export type TransportStatus = "idle" | "connecting" | "open" | "closed" | "error";

export type TransportMessage = string;

export type WebRTCDataTransportOptions = {
  /**
   * No external infrastructure by default (LAN-only).
   * Provide STUN/TURN later if needed.
   */
  rtcConfig?: RTCConfiguration;
  channelLabel?: string;
};

function waitIceGatheringComplete(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    const onState = () => {
      if (pc.iceGatheringState !== "complete") return;
      pc.removeEventListener("icegatheringstatechange", onState);
      resolve();
    };
    pc.addEventListener("icegatheringstatechange", onState);
  });
}

export class WebRTCDataTransport {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private status: TransportStatus = "idle";

  private onMessageHandlers = new Set<(msg: TransportMessage) => void>();
  private onOpenHandlers = new Set<() => void>();
  private onStatusHandlers = new Set<(s: TransportStatus) => void>();

  constructor(private readonly options: WebRTCDataTransportOptions = {}) {}

  getStatus(): TransportStatus {
    return this.status;
  }

  isOpen(): boolean {
    return this.status === "open" && this.dc?.readyState === "open";
  }

  onMessage(cb: (msg: TransportMessage) => void): () => void {
    this.onMessageHandlers.add(cb);
    return () => this.onMessageHandlers.delete(cb);
  }

  onOpen(cb: () => void): () => void {
    this.onOpenHandlers.add(cb);
    return () => this.onOpenHandlers.delete(cb);
  }

  onStatus(cb: (s: TransportStatus) => void): () => void {
    this.onStatusHandlers.add(cb);
    return () => this.onStatusHandlers.delete(cb);
  }

  private setStatus(next: TransportStatus) {
    this.status = next;
    for (const cb of this.onStatusHandlers) cb(next);
  }

  private ensurePeerConnection(): RTCPeerConnection {
    if (this.pc) return this.pc;
    const pc = new RTCPeerConnection(this.options.rtcConfig ?? { iceServers: [] });
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") this.setStatus("open");
      if (pc.connectionState === "failed") this.setStatus("error");
      if (pc.connectionState === "closed") this.setStatus("closed");
      if (pc.connectionState === "disconnected") this.setStatus("connecting");
    };
    pc.ondatachannel = (e) => {
      this.attachDataChannel(e.channel);
    };
    this.pc = pc;
    return pc;
  }

  private attachDataChannel(channel: RTCDataChannel) {
    this.dc = channel;
    channel.onopen = () => {
      this.setStatus("open");
      for (const cb of this.onOpenHandlers) cb();
    };
    channel.onclose = () => this.setStatus("closed");
    channel.onerror = () => this.setStatus("error");
    channel.onmessage = (e) => {
      const msg = typeof e.data === "string" ? e.data : "";
      for (const cb of this.onMessageHandlers) cb(msg);
    };
  }

  /**
   * Offerer side: creates DataChannel and returns an offer blob to send to peer.
   */
  async createOffer(): Promise<string> {
    this.setStatus("connecting");
    const pc = this.ensurePeerConnection();
    if (!this.dc) {
      const dc = pc.createDataChannel(this.options.channelLabel ?? "mesh");
      this.attachDataChannel(dc);
    }
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await waitIceGatheringComplete(pc);
    const desc = pc.localDescription;
    if (!desc) throw new Error("Hiányzó localDescription (offer).");
    return JSON.stringify({ type: desc.type, sdp: desc.sdp });
  }

  /**
   * Answerer side: accepts offer blob and returns an answer blob to send back.
   */
  async acceptOffer(offerBlob: string): Promise<string> {
    this.setStatus("connecting");
    const pc = this.ensurePeerConnection();
    const offer = JSON.parse(offerBlob) as RTCSessionDescriptionInit;
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await waitIceGatheringComplete(pc);
    const desc = pc.localDescription;
    if (!desc) throw new Error("Hiányzó localDescription (answer).");
    return JSON.stringify({ type: desc.type, sdp: desc.sdp });
  }

  /**
   * Offerer side: finalizes connection after receiving the answer blob.
   */
  async acceptAnswer(answerBlob: string): Promise<void> {
    const pc = this.ensurePeerConnection();
    const answer = JSON.parse(answerBlob) as RTCSessionDescriptionInit;
    await pc.setRemoteDescription(answer);
  }

  send(msg: TransportMessage) {
    if (!this.isOpen()) throw new Error("DataChannel nincs nyitva.");
    this.dc!.send(msg);
  }

  close() {
    try {
      this.dc?.close();
    } catch {
      /* ignore */
    }
    try {
      this.pc?.close();
    } catch {
      /* ignore */
    }
    this.dc = null;
    this.pc = null;
    this.setStatus("closed");
  }
}

