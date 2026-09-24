import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle, useCallback } from "react";

type PdcaMode = "PD" | "DC" | "CA" | "AP";

export type PdcaSemiRotaryKnobHandle = {
  handleQuarterRotate: () => void;
};

function modeToIndex(mode: PdcaMode): number {
  return mode === "PD" ? 0 : mode === "DC" ? 1 : mode === "CA" ? 2 : 3;
}

function modeFromIndex(idx: number): PdcaMode {
  const i = ((idx % 4) + 4) % 4;
  return i === 0 ? "PD" : i === 1 ? "DC" : i === 2 ? "CA" : "AP";
}

function forwardDelta(currentIdx: number, targetIdx: number): number {
  return ((targetIdx - currentIdx) % 4 + 4) % 4; // 0..3
}

export const PdcaSemiRotaryKnob = forwardRef<PdcaSemiRotaryKnobHandle, {
  mode: PdcaMode;
  onModeChange: (m: PdcaMode) => void;
  className?: string;
}>(({ mode, onModeChange, className }, ref) => {
  // Keep a monotonic quarter-turn counter to avoid modulo angle resets.
  // We render a continuous rotation degree so transitions never "shortest-path" backspin.
  const turnsRef = useRef<number>(modeToIndex(mode));
  const [rotationDeg, setRotationDeg] = useState<number>(() => -turnsRef.current * 90);

  useEffect(() => {
    const targetIdx = modeToIndex(mode);
    const currentIdx = ((turnsRef.current % 4) + 4) % 4;
    const d = forwardDelta(currentIdx, targetIdx);
    if (d === 0) return;
    turnsRef.current += d;
    setRotationDeg(-turnsRef.current * 90);
  }, [mode]);

  // Active phase must land in the TOP-LEFT quadrant of the visible half-circle.
  // With our quadrant drawing (P=top-left, D=top-right, C=bottom-right, A=bottom-left),
  // this is achieved by rotating counter-clockwise in 90° steps (negative degrees).
  const angle = useMemo(() => rotationDeg, [rotationDeg]);

  const handleQuarterRotate = useCallback(() => {
    turnsRef.current += 1;
    setRotationDeg(-turnsRef.current * 90);
    onModeChange(modeFromIndex(turnsRef.current));
  }, [onModeChange]);

  useImperativeHandle(
    ref,
    () => ({
      handleQuarterRotate,
    }),
    [handleQuarterRotate],
  );

  const label =
    mode === "PD"
      ? "PD: Tervezés & Működés"
      : mode === "DC"
        ? "DC: Működés & Elemzés"
        : mode === "CA"
          ? "CA: Elemzés & Beavatkozás"
          : "AP: Beavatkozás & Tervezés";

  return (
    <div
      className={`relative w-[124px] pointer-events-none ${className ?? ""}`.trim()}
      title={label}
      aria-label={`PDCA tárcsa — ${label}`}
    >
      <div className="flex flex-col items-end">
        <div className="relative">
        {/* viewBox x=50 is the pivot = 50% of this 124-wide box; header centers this box on the viewport. */}
        <svg
          viewBox="-12 0 124 55"
          className="pointer-events-none h-[55px] w-[124px] select-none overflow-hidden bg-transparent"
          aria-hidden="true"
        >
        <defs>
          {/* 1) P: átlós sávos */}
          <pattern
            id="pattern-p-stripes"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.35" />
          </pattern>

          {/* 2) D: keresztben satírozott */}
          <pattern
            id="pattern-d-crosshatch"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(30)"
          >
            <path d="M 0 0 L 4 4 M 0 4 L 4 0" stroke="#FFFFFF" strokeWidth="1" opacity="0.35" />
          </pattern>

          {/* 3) C: kockás */}
          <pattern id="pattern-c-grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.35" />
          </pattern>

          {/* 4) A: üres (transzparens) */}
          <pattern id="pattern-a-empty" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="10" height="10" fill="transparent" />
          </pattern>
        </defs>

        {/* Alsó takaróvonal (tárcsa + jelölők közös „header” éle) */}
        <line x1="-12" y1="53" x2="112" y2="53" stroke="#475569" strokeWidth="2" />

        {/* Forgó belső tárcsa: CSS transform a finom animációhoz */}
        <g
          className="transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: `translate(50px, 52px) rotate(${angle}deg)`,
            transformOrigin: "0px 0px",
          }}
        >
          {/* P (top-left) */}
          <path
            d="M 0 0 L -45 0 A 45 45 0 0 1 0 -45 Z"
            fill="#F59E0B"
            fillOpacity="0.8"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          <path d="M 0 0 L -45 0 A 45 45 0 0 1 0 -45 Z" fill="url(#pattern-p-stripes)" opacity="0.22" />
          <g transform="translate(-22, -22)">
            <g transform={`rotate(${-angle})`}>
              <text
                x="0"
                y="0"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="900"
                textAnchor="middle"
                dominantBaseline="central"
              >
                P
              </text>
            </g>
          </g>

          {/* D (top-right) */}
          <path
            d="M 0 0 L 0 -45 A 45 45 0 0 1 45 0 Z"
            fill="#06B6D4"
            fillOpacity="0.8"
            stroke="#0891B2"
            strokeWidth="1.5"
          />
          <path d="M 0 0 L 0 -45 A 45 45 0 0 1 45 0 Z" fill="url(#pattern-d-crosshatch)" opacity="0.22" />
          <g transform="translate(22, -22)">
            <g transform={`rotate(${-angle})`}>
              <text
                x="0"
                y="0"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="900"
                textAnchor="middle"
                dominantBaseline="central"
              >
                D
              </text>
            </g>
          </g>

          {/* C (bottom-right) */}
          <path
            d="M 0 0 L 45 0 A 45 45 0 0 1 0 45 Z"
            fill="#10B981"
            fillOpacity="0.8"
            stroke="#059669"
            strokeWidth="1.5"
          />
          <path d="M 0 0 L 45 0 A 45 45 0 0 1 0 45 Z" fill="url(#pattern-c-grid)" opacity="0.22" />
          <g transform="translate(22, 22)">
            <g transform={`rotate(${-angle})`}>
              <text
                x="0"
                y="0"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="900"
                textAnchor="middle"
                dominantBaseline="central"
              >
                C
              </text>
            </g>
          </g>

          {/* A (bottom-left, üres) */}
          <path
            d="M 0 0 L 0 45 A 45 45 0 0 1 -45 0 Z"
            fill="#F43F5E"
            fillOpacity="0.8"
            stroke="#E11D48"
            strokeWidth="1.5"
          />
          <g transform="translate(-22, 22)">
            <g transform={`rotate(${-angle})`}>
              <text
                x="0"
                y="0"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="900"
                textAnchor="middle"
                dominantBaseline="central"
              >
                A
              </text>
            </g>
          </g>
        </g>

        {/*
          Aktív félkör kerete: 180° / 0° — körön kívül, derékszög kifelé (mint korábban).
          Csúcs a kör felé; derékszög a külső élen. y=53 alatt overflow takar.
        */}
        <polygon points="-2,53 -9,46 -9,60" fill="#FFFFFF" />
        <polygon points="102,53 109,46 109,60" fill="#FFFFFF" />
        </svg>

        {/* alsó “beépített” vágási vonal */}
        <div className="-mt-[2px] w-[124px] border-b-2 border-slate-700" />
        </div>
      </div>
    </div>
  );
});

PdcaSemiRotaryKnob.displayName = "PdcaSemiRotaryKnob";

