import { useId } from "react";

import { CelokWagon } from "@/components/rope/CelokWagon";
import {
  buildRopeAtProgress,
  ROPE_FIXED_X,
  ROPE_LINE_Y,
  ROPE_ROLLER,
  ropeGroundY,
  rollerWindAngle,
  ropeTotalLength,
} from "@/lib/ropePath";
import { cn } from "@/lib/utils";

type TangledRopeSvgProps = {
  className?: string;
  /** 0 = gubanc, 0.5 = egyenes, 1 = CÉLOK-vagon a görgőnél. */
  progress?: number;
};

/** Ugyanaz a kötélstílus 1–16-ig. Nincs SVG filter (egyenes szakaszon is stabil vastagság). */
function RopeStroke({
  d,
  gradId,
  fiberId,
  spine,
}: {
  d: string;
  gradId: string;
  fiberId: string;
  spine?: boolean;
}) {
  return (
    <>
      {/* Lágy „bloom” filter helyett — objectBoundingBox-független */}
      <path
        d={d}
        fill="none"
        stroke="#a8844f"
        strokeOpacity={0.22}
        strokeWidth={22}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        stroke="#3d2b1f"
        strokeOpacity={0.35}
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0 3)"
      />
      <path
        data-rope-spine={spine ? "" : undefined}
        d={d}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        stroke={`url(#${fiberId})`}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
      <path
        d={d}
        fill="none"
        stroke="#f5e6c8"
        strokeOpacity={0.35}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0 -2.5)"
      />
    </>
  );
}

/**
 * Bal tekercselő dob + gubancos kötél → kiegyenesítés → CÉLOK-vagon behúzása.
 */
export function TangledRopeSvg({ className, progress = 0 }: TangledRopeSvgProps) {
  const uid = useId().replace(/:/g, "");
  const bp = buildRopeAtProgress(progress);
  const totalLength = ropeTotalLength(bp);
  const { w, h } = bp.viewBox;
  const gradId = `rope-hemp-${uid}`;
  const fiberId = `rope-fiber-${uid}`;
  const wind = rollerWindAngle(progress);
  const { cx, cy, r } = ROPE_ROLLER;
  const coils = 1 + Math.min(1, bp.tension) * 2.4;
  const showWagon = bp.haul > 0.001 || bp.tension >= 0.98;
  const hauling = bp.haul > 0.001;
  const groundY = ropeGroundY();

  // Felcsévélés a dob tetején: rövid ív a tetőpontra, majd vízszintes érintő — nincs merőleges leereszkedés
  const topX = cx;
  const topY = cy - r;
  const windOnD = `M ${topX + r * 0.55} ${topY + r * 0.15} A ${r} ${r} 0 0 0 ${topX} ${topY}`;
  const hitchD = hauling ? `M ${bp.end.x} ${bp.end.y} L ${bp.end.x + 22} ${bp.end.y}` : null;

  // Felirat: „ó” törzs = görgő alatt; ékezet a betűé (fölötte kilóg). Nincs külön ferde vonal.
  const ROLLER_STROKE = 3;
  const rollerOuterD = 2 * (r + ROLLER_STROKE / 2);
  // Georgia 700 „ó” tinta (SVG mérés): törzs szélesség / em
  const O_INK_W_TO_EM = 0.594;
  const labelFontSize = rollerOuterD / O_INK_W_TO_EM;
  // Talpvonal: a földvonal 1 pt-tel alatta — a kötél-o ne tűnjön nagyobbnak a kisbetűknél
  const labelBaselineY = groundY - 1;
  const groundLineY = labelBaselineY + 1;
  const oInkW = O_INK_W_TO_EM * labelFontSize;
  const stemEndX = cx - oInkW / 2;

  return (
    <svg
      className={cn("tangled-rope-svg h-auto w-full overflow-visible", className)}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label="Kötél feszítése, majd teherkocsi behúzása a tekercselő dobhoz"
      data-rope-total-length={totalLength.toFixed(1)}
      data-rope-progress={progress.toFixed(3)}
      data-rope-haul={bp.haul.toFixed(3)}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c4a574" />
          <stop offset="35%" stopColor="#a8844f" />
          <stop offset="65%" stopColor="#d2b48c" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
        <pattern id={fiberId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#6b5344" strokeOpacity="0.22" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Föld: 1 pt-tel a felirat talpvonala alatt */}
      <line
        data-rope-ground
        x1={Math.max(0, cx - r)}
        y1={groundLineY}
        x2={w}
        y2={groundLineY}
        stroke="#5c4033"
        strokeWidth={2}
        strokeOpacity={0.55}
      />

      {/* Felirat a görgő mögött — „ó” külön, középen a dob alatt */}
      <text
        data-roller-label
        x={stemEndX}
        y={labelBaselineY}
        textAnchor="end"
        dominantBaseline="alphabetic"
        fill={`url(#${gradId})`}
        stroke="#8b6914"
        strokeWidth={1.6}
        paintOrder="stroke fill"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={labelFontSize}
        fontWeight={700}
        letterSpacing="0.04em"
      >
        Szcenári
      </text>
      <text
        data-roller-label-o
        x={cx}
        y={labelBaselineY}
        textAnchor="middle"
        dominantBaseline="alphabetic"
        fill={`url(#${gradId})`}
        stroke="#8b6914"
        strokeWidth={1.6}
        paintOrder="stroke fill"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={labelFontSize}
        fontWeight={700}
      >
        ó
      </text>

      {/* Görgő a felirat előtt (opak) — kitakarja az „ó” törzsét, az ékezet fölötte marad */}
      <g data-rope-roller transform={`translate(${cx} ${cy})`}>
        <circle r={r + ROLLER_STROKE / 2} fill="#2a2118" />
        <g transform={`rotate(${(-wind * 180) / Math.PI})`}>
          <circle r={r} fill="#2a2118" stroke="#8b6914" strokeWidth={ROLLER_STROKE} />
          <circle r={r - 10} fill="none" stroke="#5c4033" strokeWidth={2} strokeDasharray="6 5" />
          {[0, 60, 120].map((deg) => (
            <line
              key={deg}
              x1={0}
              y1={0}
              x2={Math.cos((deg * Math.PI) / 180) * (r - 14)}
              y2={Math.sin((deg * Math.PI) / 180) * (r - 14)}
              stroke="#a8844f"
              strokeWidth={2}
              strokeOpacity={0.7}
            />
          ))}
          {/* Feltekercselt kötél a dobra — a tetőpont körül sűrűsödik */}
          {Array.from({ length: Math.ceil(coils) }, (_, i) => {
            const rr = Math.max(r * 0.55, r - 3 - i * 3.2);
            const opacity = Math.min(1, coils - i) * (0.4 + Math.min(1, bp.tension) * 0.45);
            return (
              <circle
                key={i}
                r={rr}
                fill="none"
                stroke="#c4a574"
                strokeWidth={3.2}
                strokeOpacity={opacity}
                strokeDasharray={`${28 + i * 6} ${14 - i}`}
                strokeDashoffset={wind * 14 * (i + 1)}
              />
            );
          })}
        </g>
      </g>

      {/* Ív a dob felső körvonalára (ott tekeredik fel), majd a gerinc vízszintesen folytatódik */}
      <RopeStroke d={windOnD} gradId={gradId} fiberId={fiberId} />
      <RopeStroke d={bp.spine} gradId={gradId} fiberId={fiberId} spine />
      {hitchD && <RopeStroke d={hitchD} gradId={gradId} fiberId={fiberId} />}

      <g data-rope-crossings>
        {bp.crossings.map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.angleDeg})`} opacity={c.opacity}>
            <ellipse cx={0} cy={0} rx={11} ry={7} fill="none" stroke="#5c4033" strokeWidth={5} strokeOpacity={0.55} />
            <ellipse cx={0} cy={0} rx={11} ry={7} fill="none" stroke="#c4a574" strokeWidth={2.2} />
          </g>
        ))}
      </g>

      {/* Jobb rögzítés: csak amíg nincs behúzás; a vagon indulásakor azonnal eltűnik */}
      {!hauling && (
        <g data-rope-anchor-right>
          <circle cx={ROPE_FIXED_X} cy={ROPE_LINE_Y} r={7} fill="#5c4033" stroke="#c4a574" strokeWidth={1.5} />
          <line
            x1={ROPE_FIXED_X + 18}
            y1={ROPE_LINE_Y - 22}
            x2={ROPE_FIXED_X + 18}
            y2={ROPE_LINE_Y + 22}
            stroke="#6b5344"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <line
            x1={ROPE_FIXED_X}
            y1={ROPE_LINE_Y}
            x2={ROPE_FIXED_X + 18}
            y2={ROPE_LINE_Y}
            stroke="#a8844f"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      )}

      {showWagon && <CelokWagon hitchX={bp.end.x} haul={Math.max(bp.haul, bp.tension >= 0.98 ? 0.02 : 0)} />}
    </svg>
  );
}
