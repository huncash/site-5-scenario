import { useMemo, type CSSProperties } from "react";

import {
  listSearchPairs,
  searchFromLocation,
  siteKindSuccessLabel,
  type SiteKindProbeKind,
} from "@/lib/siteKindProbe";

const BOX: CSSProperties = {
  margin: "0 0 20px",
  padding: "14px 16px",
  borderRadius: 12,
  border: "2px solid #34d399",
  background: "#064e3b",
  color: "#ecfdf5",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

const TITLE: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 750,
  letterSpacing: "0.01em",
  lineHeight: 1.35,
};

const META: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 12,
  color: "#a7f3d0",
  wordBreak: "break-all",
};

const CHIPS: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 10,
};

const CHIP: CSSProperties = {
  display: "inline-flex",
  gap: 6,
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: 999,
  background: "#022c22",
  border: "1px solid #34d399",
  fontSize: 12,
  fontWeight: 650,
};

export function SiteKindProbe(props: { kind: SiteKindProbeKind; search?: string }) {
  const search = props.search ?? searchFromLocation();
  const pairs = useMemo(() => listSearchPairs(search), [search]);
  const host = typeof window === "undefined" ? "" : window.location.hostname;
  const path = typeof window === "undefined" ? "" : window.location.pathname;

  return (
    <aside
      data-site-kind-probe={props.kind}
      role="status"
      aria-live="polite"
      style={BOX}
    >
      <p style={TITLE}>{siteKindSuccessLabel(props.kind)}</p>
      <p style={META}>
        host={host || "—"} · path={path || "—"}
      </p>
      {props.kind === "bill" ? (
        pairs.length ? (
          <div style={CHIPS}>
            {pairs.map((p) => (
              <span key={`${p.key}:${p.value}`} style={CHIP}>
                {p.key}={p.value}
              </span>
            ))}
          </div>
        ) : (
          <p style={META}>query: (nincs) — a funnel `?tier=&interval=` ide érkezik</p>
        )
      ) : null}
    </aside>
  );
}
