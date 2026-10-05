import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Resvg } = require("@resvg/resvg-js");

const root = fileURLToPath(new URL("..", import.meta.url));
const svgPath = path.join(root, "public", "szcenario-wordmark.svg");
const pngPath = path.join(root, "public", "szcenario-wordmark.png");
const fontBold = "C:/Windows/Fonts/georgiab.ttf";
const fontReg = "C:/Windows/Fonts/georgia.ttf";

const svg = readFileSync(svgPath, "utf8");
const fontOpts = {
  loadSystemFonts: true,
  fontFiles: [fontBold, fontReg],
  defaultFontFamily: "Georgia",
  defaultFontWeight: 700,
};
const probe = new Resvg(svg, { font: fontOpts });
const box = probe.getBBox() ?? probe.innerBBox();
if (!box) throw new Error("no text bbox");
const padX = box.width * 0.08;
const padY = box.height * 0.18;
const vb = `${box.x - padX} ${box.y - padY} ${box.width + padX * 2} ${box.height + padY * 2}`;
const cropped = svg.replace(/viewBox="[^"]+"/, `viewBox="${vb}"`).replace(/width="1480"/, `width="${Math.round(box.width + padX * 2)}"`).replace(/height="340"/, `height="${Math.round(box.height + padY * 2)}"`);
const png = new Resvg(cropped, {
  fitTo: { mode: "width", value: 1600 },
  background: "rgba(0,0,0,0)",
  font: fontOpts,
}).render().asPng();
writeFileSync(pngPath, png);
console.log(`${pngPath} (${png.length} bytes)`);
