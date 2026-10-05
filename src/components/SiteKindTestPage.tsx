import { useEffect, useMemo, type CSSProperties } from "react";

import {
  listSearchPairs,
  searchFromLocation,
  siteKindSuccessLabel,
  type SiteKindProbeKind,
} from "@/lib/siteKindProbe";

const PAGE: CSSProperties = {
  minHeight: "100dvh",
  margin: 0,
  padding: "32px 20px 48px",
  boxSizing: "border-box",
  background: "#111827",
  color: "#fde68a",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

const MARK: CSSProperties = {
  display: "inline-block",
  marginBottom: 16,
  padding: "4px 10px",
  border: "2px solid #facc15",
  color: "#111827",
  background: "#facc15",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const H1: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "clamp(1.8rem, 6vw, 3rem)",
  lineHeight: 1.05,
  color: "#fefce8",
  letterSpacing: "-0.03em",
};

const LEAD: CSSProperties = {
  margin: "0 0 28px",
  maxWidth: 40,
  fontSize: 16,
  color: "#fde68a",
};

const STRIP: CSSProperties = {
  maxWidth: 720,
  padding: "18px 18px 16px",
  border: "3px solid #facc15",
  background: "#1f2937",
};

const STRIP_TITLE: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  color: "#4ade80",
};

const META: CSSProperties = {
  margin: "12px 0 0",
  fontSize: 13,
  color: "#e5e7eb",
  wordBreak: "break-all",
};

const CHIPS: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 14,
};

const CHIP: CSSProperties = {
  padding: "4px 8px",
  background: "#111827",
  border: "1px solid #facc15",
  color: "#fde68a",
  fontSize: 12,
  fontWeight: 700,
};

export function SiteKindTestPage(props: { kind: SiteKindProbeKind; search?: string }) {
  const search = props.search ?? searchFromLocation();
  const pairs = useMemo(() => listSearchPairs(search), [search]);
  const host = typeof window === "undefined" ? "—" : window.location.hostname;
  const path = typeof window === "undefined" ? "—" : window.location.pathname;

  useEffect(() => {
    document.title = props.kind === "bill" ? "Aldomain teszt — bill" : "Aldomain teszt — support";
  }, [props.kind]);

  return (
    <main data-site-kind-test={props.kind} style={PAGE}>
      <div style={MARK}>aldomain teszt oldal</div>
      <h1 style={H1}>{props.kind === "bill" ? "bill.szcenario.hu" : "support.szcenario.hu"}</h1>
      <p style={{ ...LEAD, maxWidth: 560 }}>
        Ez egy dedikált aldomain-teszt nyitóoldal — nem a főoldal, nem a számlázás, nem a support tudástár.
      </p>
      <section style={STRIP} role="status" aria-live="polite">
        <p style={STRIP_TITLE}>{siteKindSuccessLabel(props.kind)}</p>
        <p style={META}>
          kind={props.kind} · host={host} · path={path}
        </p>
        {pairs.length ? (
          <div style={CHIPS}>
            {pairs.map((p) => (
              <span key={`${p.key}:${p.value}`} style={CHIP}>
                {p.key}={p.value}
              </span>
            ))}
          </div>
        ) : (
          <p style={META}>query: (üres)</p>
        )}
      </section>
    </main>
  );
}
