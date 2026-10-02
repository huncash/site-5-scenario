import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function pngRGBA(width, height, pixel) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixel(x, y, width);
      const o = row + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function inRoundedRect(x, y, size, radius) {
  const ix = Math.min(x, size - 1 - x);
  const iy = Math.min(y, size - 1 - y);
  if (ix >= radius || iy >= radius) return true;
  const dx = radius - ix;
  const dy = radius - iy;
  return dx * dx + dy * dy <= radius * radius;
}

function nearLine(x, y, x1, y1, x2, y2, w) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((x - x1) * dx + (y - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = x1 + t * dx;
  const py = y1 + t * dy;
  const dist = Math.hypot(x - px, y - py);
  return dist <= w;
}

function iconPixel(x, y, size) {
  const bg = [11, 19, 43, 255];
  const fg = [0, 240, 255, 255];
  const pad = size * 0.06;
  const radius = size * 0.18;
  if (!inRoundedRect(x, y, size, radius)) return [0, 0, 0, 0];
  if (x < pad || y < pad || x >= size - pad || y >= size - pad) return bg;

  const s = (n) => (n / 512) * size;
  const w = size * 0.028;
  const shield = [
    [s(256), s(96), s(416), s(128)],
    [s(416), s(128), s(416), s(240)],
    [s(416), s(240), s(256), s(448)],
    [s(256), s(448), s(96), s(240)],
    [s(96), s(240), s(96), s(128)],
    [s(96), s(128), s(256), s(96)],
  ];
  for (const [x1, y1, x2, y2] of shield) {
    if (nearLine(x, y, x1, y1, x2, y2, w)) return fg;
  }
  if (nearLine(x, y, s(256), s(150), s(256), s(362), w)) return fg;
  if (nearLine(x, y, s(222), s(188), s(296), s(188), w)) return fg;
  if (nearLine(x, y, s(216), s(341), s(290), s(341), w)) return fg;
  return bg;
}

function icoFromPng(pngBuf, w, h) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = w >= 256 ? 0 : w;
  entry[1] = h >= 256 ? 0 : h;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuf.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, pngBuf]);
}

writeFileSync(path.join(outDir, "icon-192.png"), pngRGBA(192, 192, iconPixel));
writeFileSync(path.join(outDir, "icon-512.png"), pngRGBA(512, 512, iconPixel));
writeFileSync(path.join(outDir, "favicon.ico"), icoFromPng(pngRGBA(32, 32, iconPixel), 32, 32));
console.log("PWA icons written to public/");
