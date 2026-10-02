/** Globális SVG minták a diagramokhoz. A fill:url(#id) csak document-szintű style-ból megbízható. */

const PATTERN_STYLE = `
html[data-accessibility="active"] .a11y-pat-diagonal,
html.a11y-vision .a11y-pat-diagonal,
html.accessibility-mode .a11y-pat-diagonal {
  fill: url(#pattern-diagonal-stripe) !important;
  background-image: var(--a11y-bg-diagonal) !important;
  background-size: 8px 8px !important;
  background-repeat: repeat !important;
  background-color: var(--a11y-pattern-base, #000) !important;
}
html[data-accessibility="active"] .a11y-pat-checker,
html.a11y-vision .a11y-pat-checker,
html.accessibility-mode .a11y-pat-checker {
  fill: url(#pattern-checker) !important;
  background-image: var(--a11y-bg-checker) !important;
  background-size: 8px 8px !important;
  background-repeat: repeat !important;
  background-color: var(--a11y-pattern-base, #000) !important;
}
html[data-accessibility="active"] .a11y-pat-dots,
html.a11y-vision .a11y-pat-dots,
html.accessibility-mode .a11y-pat-dots {
  fill: url(#pattern-dots) !important;
  background-image: var(--a11y-bg-dots) !important;
  background-size: 8px 8px !important;
  background-repeat: repeat !important;
  background-color: var(--a11y-pattern-base, #000) !important;
}
html[data-accessibility="active"] .a11y-pat-h-stripe,
html.a11y-vision .a11y-pat-h-stripe,
html.accessibility-mode .a11y-pat-h-stripe {
  fill: url(#pattern-h-stripe) !important;
  background-image: var(--a11y-bg-h-stripe) !important;
  background-size: 8px 8px !important;
  background-repeat: repeat !important;
  background-color: var(--a11y-pattern-base, #000) !important;
}
html[data-accessibility="active"] .a11y-pat-v-stripe,
html.a11y-vision .a11y-pat-v-stripe,
html.accessibility-mode .a11y-pat-v-stripe {
  fill: url(#pattern-v-stripe) !important;
  background-image: var(--a11y-bg-v-stripe) !important;
  background-size: 8px 8px !important;
  background-repeat: repeat !important;
  background-color: var(--a11y-pattern-base, #000) !important;
}

html[data-accessibility="active"] .recharts-bar:nth-of-type(5n+1) .recharts-rectangle,
html[data-accessibility="active"] .recharts-pie-sector:nth-of-type(5n+1) .recharts-sector,
html[data-accessibility="active"] .recharts-legend-item:nth-of-type(5n+1) path {
  fill: url(#pattern-diagonal-stripe) !important;
}
html[data-accessibility="active"] .recharts-bar:nth-of-type(5n+2) .recharts-rectangle,
html[data-accessibility="active"] .recharts-pie-sector:nth-of-type(5n+2) .recharts-sector,
html[data-accessibility="active"] .recharts-legend-item:nth-of-type(5n+2) path {
  fill: url(#pattern-checker) !important;
}
html[data-accessibility="active"] .recharts-bar:nth-of-type(5n+3) .recharts-rectangle,
html[data-accessibility="active"] .recharts-pie-sector:nth-of-type(5n+3) .recharts-sector,
html[data-accessibility="active"] .recharts-legend-item:nth-of-type(5n+3) path {
  fill: url(#pattern-dots) !important;
}
html[data-accessibility="active"] .recharts-bar:nth-of-type(5n+4) .recharts-rectangle,
html[data-accessibility="active"] .recharts-pie-sector:nth-of-type(5n+4) .recharts-sector,
html[data-accessibility="active"] .recharts-legend-item:nth-of-type(5n+4) path {
  fill: url(#pattern-h-stripe) !important;
}
html[data-accessibility="active"] .recharts-bar:nth-of-type(5n+5) .recharts-rectangle,
html[data-accessibility="active"] .recharts-pie-sector:nth-of-type(5n+5) .recharts-sector,
html[data-accessibility="active"] .recharts-legend-item:nth-of-type(5n+5) path {
  fill: url(#pattern-v-stripe) !important;
}

html[data-accessibility="active"] .recharts-rectangle,
html[data-accessibility="active"] .recharts-sector {
  stroke: var(--a11y-pattern-mark, #ffd100) !important;
  stroke-width: 1px !important;
}
`;

export function A11yChartPatterns() {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="0"
        height="0"
        className="pointer-events-none fixed left-0 top-0 h-px w-px overflow-hidden opacity-0"
        aria-hidden
        focusable="false"
      >
        <defs>
          <pattern id="pattern-diagonal-stripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="var(--a11y-pattern-base, #000000)" />
            <rect width="3.2" height="8" fill="var(--a11y-pattern-mark, #ffd100)" />
          </pattern>
          <pattern id="pattern-checker" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="var(--a11y-pattern-base, #000000)" />
            <rect width="4" height="4" fill="var(--a11y-pattern-mark, #ffd100)" />
            <rect x="4" y="4" width="4" height="4" fill="var(--a11y-pattern-mark, #ffd100)" />
          </pattern>
          <pattern id="pattern-dots" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="var(--a11y-pattern-base, #000000)" />
            <circle cx="4" cy="4" r="1.65" fill="var(--a11y-pattern-mark, #ffd100)" />
          </pattern>
          <pattern id="pattern-h-stripe" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="var(--a11y-pattern-base, #000000)" />
            <rect y="2.5" width="8" height="3" fill="var(--a11y-pattern-mark, #ffd100)" />
          </pattern>
          <pattern id="pattern-v-stripe" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="var(--a11y-pattern-base, #000000)" />
            <rect x="2.5" width="3" height="8" fill="var(--a11y-pattern-mark, #ffd100)" />
          </pattern>
        </defs>
      </svg>
      <style>{PATTERN_STYLE}</style>
    </>
  );
}
