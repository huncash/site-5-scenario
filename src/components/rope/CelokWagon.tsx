import { hitchXAtHaul, ROPE_LINE_Y, ROPE_WAGON } from "@/lib/ropePath";

type CelokWagonProps = {
  /** Kötél–vagon csatlakozás X (bal oldali vonószem). */
  hitchX: number;
  /** 0 = még alig látszik a jobb szélen, 1 = a görgőnél. */
  haul: number;
};

/** Egyszerű oldalnézetes kísérleti teherkocsi — egyszínű arany rakomány; kerekek a plató alatt. */
export function CelokWagon({ hitchX, haul }: CelokWagonProps) {
  const { w, h, wheelR, hitchLen } = ROPE_WAGON;
  const bodyX = hitchX + hitchLen;
  const bodyH = h - 10;
  const bodyY = ROPE_LINE_Y - bodyH * 0.62;
  const platformH = 10;
  const platformY = bodyY + bodyH;
  const platformBottom = platformY + platformH;
  // Kerék tengelye a plató alatt — a kerék teteje csak enyhén ér a plató aljához
  const wheelCy = platformBottom + wheelR * 0.92;
  const opacity = haul < 0.02 ? 0.15 + haul * 10 : Math.min(1, 0.35 + haul * 1.2);

  // Balra húzáskor a kerék az óramutatóval ellentétesen forog (görduĺás): −Δs / r
  const travel = Math.max(0, hitchXAtHaul(0) - hitchX);
  const wheelDeg = -(travel / Math.max(1, wheelR)) * (180 / Math.PI);

  return (
    <g data-celok-wagon opacity={opacity}>
      {/* Vonószem — a kötélstílust a TangledRopeSvg hitch szakasza adja */}
      <circle cx={hitchX} cy={ROPE_LINE_Y} r={5} fill="#5c4033" stroke="#c4a574" strokeWidth={1.5} />

      {/* Kerekek — a plató alatt, húzáskor forognak */}
      {[0.22, 0.78].map((t) => {
        const wx = bodyX + w * t;
        return (
          <g key={t} data-wagon-wheel>
            <line
              x1={wx}
              y1={platformBottom}
              x2={wx}
              y2={wheelCy - wheelR * 0.2}
              stroke="#6b5344"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <g transform={`rotate(${wheelDeg} ${wx} ${wheelCy})`}>
              <circle cx={wx} cy={wheelCy} r={wheelR} fill="#1a1410" stroke="#8b6914" strokeWidth={2} />
              {/* Küllők — a forgás látható jele */}
              {[0, 60, 120].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <line
                    key={deg}
                    x1={wx + Math.cos(rad) * wheelR * 0.2}
                    y1={wheelCy + Math.sin(rad) * wheelR * 0.2}
                    x2={wx + Math.cos(rad) * wheelR * 0.85}
                    y2={wheelCy + Math.sin(rad) * wheelR * 0.85}
                    stroke="#a8844f"
                    strokeWidth={1.4}
                    strokeOpacity={0.75}
                    strokeLinecap="round"
                  />
                );
              })}
              <circle cx={wx} cy={wheelCy} r={wheelR * 0.35} fill="#5c4033" stroke="#8b6914" strokeWidth={1} />
            </g>
          </g>
        );
      })}

      {/* Kocsiszekrény */}
      <rect
        x={bodyX}
        y={bodyY}
        width={w}
        height={bodyH}
        rx={5}
        fill="#3d2b1f"
        stroke="#a8844f"
        strokeWidth={2.2}
      />
      {/* Rakomány — egyszínű arany */}
      <rect
        x={bodyX + 8}
        y={bodyY + 8}
        width={w - 16}
        height={bodyH - 16}
        rx={3}
        fill="#c4a574"
      />

      {/* Plató — a kerekek felett, rájuk ülve */}
      <rect
        x={bodyX - 3}
        y={platformY}
        width={w + 6}
        height={platformH}
        rx={2}
        fill="#5c4033"
        stroke="#c4a574"
        strokeWidth={1.6}
      />
      <line
        x1={bodyX}
        y1={platformY + 3}
        x2={bodyX + w}
        y2={platformY + 3}
        stroke="#a8844f"
        strokeWidth={1}
        strokeOpacity={0.4}
      />
    </g>
  );
}
