/**
 * PD / CA Szumma nézet — helyi SVG képernyőkép az anonim számból.
 * Nem a élő dashboard DOM-ját festi (az szivárogtatna nevet).
 */
import type { EducationCaseStudy } from "@/lib/educationAnonymize";

function fmt(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
  if (abs >= 1_000) return `${Math.round(n / 1000)} e`;
  return `${Math.round(n)}`;
}

function xml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function chip(x: number, y: number, label: string, value: string): string {
  const w = 250;
  const h = 36;
  return [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#121816" stroke="#2a3a34"/>`,
    `<text x="${x + 12}" y="${y + 23}" fill="#8aa396" font-size="12" font-family="system-ui,sans-serif">${xml(label)}</text>`,
    `<text x="${x + w - 12}" y="${y + 23}" text-anchor="end" fill="#e8eee9" font-size="13" font-family="ui-monospace,monospace">${xml(value)}</text>`,
  ].join("");
}

function mixBars(study: EducationCaseStudy, x: number, y: number): string {
  const rows = study.costMix.slice(0, 5);
  const barX = x + 150;
  const barW = 220;
  return rows
    .map((row, i) => {
      const yy = y + i * 28;
      const w = Math.max(4, Math.min(barW, (row.sharePct / 100) * barW));
      const val = `${row.sharePct}%`;
      return [
        `<text x="${x}" y="${yy + 14}" fill="#8aa396" font-size="11" font-family="system-ui,sans-serif">${xml(row.label)}</text>`,
        `<rect x="${barX}" y="${yy + 4}" width="${barW}" height="14" rx="3" fill="#1a2420"/>`,
        `<rect x="${barX}" y="${yy + 4}" width="${w}" height="14" rx="3" fill="#40916C"/>`,
        `<rect x="${barX + barW + 8}" y="${yy + 1}" width="48" height="18" rx="4" fill="#121816"/>`,
        `<text x="${barX + barW + 32}" y="${yy + 14}" text-anchor="middle" fill="#e8eee9" font-size="11" font-family="ui-monospace,monospace">${xml(val)}</text>`,
      ].join("");
    })
    .join("");
}

function wrapSvg(title: string, body: string): string {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">`,
    `<rect width="640" height="360" fill="#0f1412"/>`,
    `<text x="24" y="32" fill="#e8eee9" font-size="16" font-weight="600" font-family="system-ui,sans-serif">${xml(title)}</text>`,
    `<text x="24" y="52" fill="#8aa396" font-size="11" font-family="system-ui,sans-serif">Szumma · helyi másolat · nem élő könyvelés</text>`,
    body,
    `</svg>`,
  ].join("");
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function renderPdSummaShot(study: EducationCaseStudy): string {
  const body = [
    `<text x="24" y="88" fill="#8aa396" font-size="11" font-weight="600" font-family="system-ui,sans-serif">PLAN</text>`,
    `<text x="336" y="88" fill="#8aa396" font-size="11" font-weight="600" font-family="system-ui,sans-serif">DO</text>`,
    chip(24, 100, "Havi bevétel", `${fmt(study.monthlyRevenueHuf)} Ft`),
    chip(24, 148, "Havi üzem", `${fmt(study.monthlyOpexHuf)} Ft`),
    chip(336, 100, "Kassza", `${fmt(study.cashHuf)} Ft`),
    chip(
      336,
      148,
      "Runway",
      study.runwayMonths == null ? "—" : `${study.runwayMonths.toFixed(1)} hó`,
    ),
    `<text x="24" y="330" fill="#6b7f78" font-size="11" font-family="system-ui,sans-serif">${xml(study.orgAlias)} · ${xml(study.headcountBand)}</text>`,
  ].join("");
  return wrapSvg("PD — Szumma", body);
}

export function renderCaSummaShot(study: EducationCaseStudy): string {
  const act =
    study.runwayMonths != null && study.runwayMonths < 3
      ? "ACT: először a kassza — 3 hónap alatt a levegő"
      : "ACT: tartalék mélysége a Check arányok mellett";
  const body = [
    `<text x="24" y="88" fill="#8aa396" font-size="11" font-weight="600" font-family="system-ui,sans-serif">CHECK</text>`,
    mixBars(study, 24, 100),
    `<text x="24" y="280" fill="#8aa396" font-size="11" font-weight="600" font-family="system-ui,sans-serif">ACT</text>`,
    `<rect x="24" y="292" width="592" height="36" rx="6" fill="#121816" stroke="#2a3a34"/>`,
    `<text x="36" y="315" fill="#e8eee9" font-size="12" font-family="system-ui,sans-serif">${xml(act)}</text>`,
  ].join("");
  return wrapSvg("CA — Szumma", body);
}

export function renderPdCaSummaShots(study: EducationCaseStudy): { pd: string; ca: string } {
  return { pd: renderPdSummaShot(study), ca: renderCaSummaShot(study) };
}
