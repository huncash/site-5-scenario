import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { billSearchFromLocation, readBillCheckoutSearch } from "@/lib/billing";
import { BILL_KIND_SUCCESS, listSearchPairs, searchFromLocation } from "@/lib/siteKindProbe";

const PAGE: CSSProperties = {
  minHeight: "100dvh",
  margin: 0,
  padding: "28px 20px 56px",
  boxSizing: "border-box",
  background: "radial-gradient(900px 420px at 12% -8%, #16382c, #071511 58%)",
  color: "#ecfdf5",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

const BADGE: CSSProperties = {
  display: "inline-block",
  marginBottom: 14,
  padding: "5px 12px",
  borderRadius: 999,
  background: "#064e3b",
  border: "1px solid #34d399",
  color: "#a7f3d0",
  fontSize: 11,
  fontWeight: 750,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const H1: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "clamp(1.7rem, 4vw, 2.4rem)",
  lineHeight: 1.15,
  fontWeight: 700,
  color: "#f0fdf4",
};

const LEAD: CSSProperties = {
  margin: "0 0 22px",
  maxWidth: 560,
  fontSize: 15,
  lineHeight: 1.5,
  color: "#94a3b8",
};

const STATUS: CSSProperties = {
  maxWidth: 640,
  marginBottom: 18,
  padding: "16px 18px",
  borderRadius: 14,
  border: "2px solid #34d399",
  background: "#064e3b",
};

const STATUS_TITLE: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 800,
  color: "#bbf7d0",
};

const META: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 13,
  color: "#a7f3d0",
  wordBreak: "break-all",
};

const CARD: CSSProperties = {
  maxWidth: 640,
  padding: "18px 18px 16px",
  borderRadius: 14,
  border: "1px solid #16382c",
  background: "#0d221b",
};

const ROW: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "7.5rem 1fr",
  gap: 10,
  padding: "8px 0",
  borderBottom: "1px solid #16382c",
  fontSize: 14,
};

const K: CSSProperties = { color: "#6ee7b7", fontWeight: 650 };
const V: CSSProperties = { color: "#ecfdf5", fontWeight: 600 };

const CHIPS: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 };
const CHIP: CSSProperties = {
  padding: "4px 9px",
  borderRadius: 999,
  background: "#071511",
  border: "1px solid #34d399",
  color: "#d1fae5",
  fontSize: 12,
  fontWeight: 700,
};

function empty(v: string | null | undefined) {
  return v && v.length ? v : "—";
}

/** bill.szcenario.hu / /bill — számlázási teszt-nyitó, nem support. */
export function BillTestSurface(props: { search?: string }) {
  const [search, setSearch] = useState(() => props.search ?? searchFromLocation());
  const [host, setHost] = useState("—");
  const [path, setPath] = useState("—");
  const checkout = useMemo(() => readBillCheckoutSearch(search), [search]);
  const pairs = useMemo(() => listSearchPairs(search), [search]);

  useEffect(() => {
    document.title = "Számlázás — bill.szcenario.hu";
    setSearch(props.search ?? billSearchFromLocation() ?? searchFromLocation());
    setHost(window.location.hostname);
    setPath(window.location.pathname);
  }, [props.search]);

  return (
    <main data-bill-test-surface="" style={PAGE}>
      <div style={BADGE}>Billing · Checkout</div>
      <h1 style={H1}>Számlázási origin</h1>
      <p style={LEAD}>
        Csomagrendelés és fizetési tölcsér belépője. Nem a főoldal, nem a support tudástár.
      </p>

      <section style={STATUS} role="status" aria-live="polite">
        <p style={STATUS_TITLE}>{BILL_KIND_SUCCESS}</p>
        <p style={META}>
          host={host} · path={path}
        </p>
      </section>

      <section style={CARD} aria-label="Funnel paraméterek">
        <div style={ROW}>
          <span style={K}>tier</span>
          <span style={V}>{empty(checkout.tier)}</span>
        </div>
        <div style={ROW}>
          <span style={K}>interval</span>
          <span style={V}>{checkout.interval}</span>
        </div>
        <div style={ROW}>
          <span style={K}>lang</span>
          <span style={V}>{empty(checkout.lang)}</span>
        </div>
        <div style={{ ...ROW, borderBottom: "none" }}>
          <span style={K}>ref</span>
          <span style={V}>{empty(checkout.ref || checkout.referral)}</span>
        </div>
        {pairs.length ? (
          <div style={CHIPS}>
            {pairs.map((p) => (
              <span key={`${p.key}:${p.value}`} style={CHIP}>
                {p.key}={p.value}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ ...META, color: "#94a3b8" }}>Nincs query — a tölcsér `?tier=&interval=&lang=` ide érkezik.</p>
        )}
      </section>
    </main>
  );
}
