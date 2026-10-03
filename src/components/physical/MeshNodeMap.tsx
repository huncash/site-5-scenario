import { COMM_LINK_LABEL, NODE_KIND_LABEL, type CommEdge, type CommLinkKind, type CommNode, type CommRedundancy } from "@/lib/physicalMetrics";

const LINK_DASH: Record<CommLinkKind, string> = {
  mesh: "4 3",
  lora: "8 4",
  analog: "2 3",
  internet: "0",
};

export function MeshNodeMap(props: { nodes: CommNode[]; edges: CommEdge[]; comm: CommRedundancy }) {
  const { nodes, edges, comm } = props;
  if (!nodes.length) return null;
  const w = 360;
  const h = 200;
  const toX = (x: number) => 18 + (x / 100) * (w - 36);
  const toY = (y: number) => 16 + (y / 100) * (h - 36);

  return (
    <figure className="mesh-map">
      <div className="mesh-map-head">
        <span className="surv-label-chip">Hálózati topológia</span>
        <span className="surv-value-chip surv-green">
          {comm.activeNodes}/{comm.totalNodes} él · {comm.coveragePct}%
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mesh-map-svg" role="img" aria-label="Csomópontok elérhetősége">
        {edges.map((e) => {
          const a = nodes.find((n) => n.id === e.from);
          const b = nodes.find((n) => n.id === e.to);
          if (!a || !b) return null;
          return (
            <line
              key={`${e.from}-${e.to}-${e.kind}`}
              x1={toX(a.x)}
              y1={toY(a.y)}
              x2={toX(b.x)}
              y2={toY(b.y)}
              className={e.up ? "mesh-edge-up" : "mesh-edge-down"}
              strokeDasharray={LINK_DASH[e.kind]}
            />
          );
        })}
        {nodes.map((n) => (
          <g key={n.id}>
            <circle cx={toX(n.x)} cy={toY(n.y)} r={n.kind === "hq" || n.kind === "home" ? 8 : 6} className={n.up ? "mesh-node-up" : "mesh-node-down"} />
            <rect x={toX(n.x) - 28} y={toY(n.y) + 10} width="56" height="12" rx="2" className="mesh-label-bg" />
            <text x={toX(n.x)} y={toY(n.y) + 19} textAnchor="middle" className="mesh-label">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <ul className="mesh-legend">
        {(Object.keys(COMM_LINK_LABEL) as CommLinkKind[]).map((k) =>
          comm.linkMix[k] > 0 ? (
            <li key={k}>
              {COMM_LINK_LABEL[k]} · {comm.linkMix[k]}
            </li>
          ) : null,
        )}
        <li>
          {nodes.filter((n) => n.up).map((n) => NODE_KIND_LABEL[n.kind]).filter((v, i, a) => a.indexOf(v) === i).join(" · ")}
        </li>
      </ul>
    </figure>
  );
}
