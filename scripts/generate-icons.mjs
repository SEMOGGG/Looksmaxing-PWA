// Génère les icônes PWA (PNG) à partir du logomark de Faciem : un "F" à
// angles vifs, légèrement penché, avec une étincelle en accent
// (cf. components/logo.tsx). Pas de dépendance externe : rendu par pixel
// (avec anti-aliasing par sur-échantillonnage) + encodage PNG manuel via zlib.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const BG = [10, 10, 15]; // #0A0A0F - fond sombre de l'app
const VIOLET = [139, 92, 246]; // #8B5CF6 (halo)
const PINK = [255, 93, 162]; // #FF5DA2
const GRAD_A = [167, 139, 250]; // #A78BFA - départ du dégradé du F
const GRAD_B = [255, 93, 162]; // #FF5DA2 - fin du dégradé du F
const DOT_A = [255, 180, 216]; // #FFB4D8
const DOT_B = [255, 93, 162]; // #FF5DA2
const WHITE = [255, 255, 255];

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgbaPixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk("IHDR", ihdrData);

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type none
    rgbaPixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = chunk("IDAT", deflateSync(raw));
  const iend = chunk("IEND", Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function mix(base, color, alpha) {
  const a = Math.max(0, Math.min(1, alpha));
  return lerpColor(base, color, a);
}

// skewX(-9°) appliqué à la lettre, comme dans components/logo.tsx
const SKEW = Math.tan((-9 * Math.PI) / 180);
const skew = ([x, y]) => [x + y * SKEW, y];

const F_BODY = [
  [11, 7],
  [29, 7],
  [24, 15],
  [16, 15],
  [16, 33],
  [11, 33],
].map(skew);

const F_BAR = [
  [11, 18],
  [23, 18],
  [19, 24],
  [11, 24],
].map(skew);

const [GX1, GY1] = skew([8, 6]);
const [GX2, GY2] = skew([26, 34]);

const HALO_PINK = { cx: 31, cy: 11, r: 7, opacity: 0.45 };
const HALO_VIOLET = { cx: 9, cy: 30, r: 6.5, opacity: 0.4 };
const DOT = { cx: 33.5, cy: 8.5, r: 2.6 };
const DOT_HIGHLIGHT = { cx: 32.7, cy: 7.7, r: 0.9 };

function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function drawIcon(size, { maskable = false } = {}) {
  const pixels = Buffer.alloc(size * size * 4);
  // padding supplémentaire pour les icônes "maskable" (zone de sécurité)
  const pad = maskable ? size * 0.18 : size * 0.03;
  const scale = (size - pad * 2) / 40;
  const toPx = (v) => pad + v * scale;
  const toPoly = (poly) => poly.map(([x, y]) => [toPx(x), toPx(y)]);

  const bodyPx = toPoly(F_BODY);
  const barPx = toPoly(F_BAR);
  const gx1 = toPx(GX1);
  const gy1 = toPx(GY1);
  const gx2 = toPx(GX2);
  const gy2 = toPx(GY2);
  const gdx = gx2 - gx1;
  const gdy = gy2 - gy1;
  const gLenSq = gdx * gdx + gdy * gdy;

  const haloPinkCx = toPx(HALO_PINK.cx);
  const haloPinkCy = toPx(HALO_PINK.cy);
  const haloPinkR = HALO_PINK.r * scale;
  const haloVioletCx = toPx(HALO_VIOLET.cx);
  const haloVioletCy = toPx(HALO_VIOLET.cy);
  const haloVioletR = HALO_VIOLET.r * scale;

  const dotCx = toPx(DOT.cx);
  const dotCy = toPx(DOT.cy);
  const dotR = DOT.r * scale;
  const dotHx = toPx(DOT_HIGHLIGHT.cx);
  const dotHy = toPx(DOT_HIGHLIGHT.cy);
  const dotHr = DOT_HIGHLIGHT.r * scale;

  const SS = 4; // sur-échantillonnage pour l'anti-aliasing du F

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      let color = BG;

      const dViolet = Math.hypot(x - haloVioletCx, y - haloVioletCy);
      const aViolet = HALO_VIOLET.opacity * Math.exp(-((dViolet / (haloVioletR * 0.85)) ** 2));
      color = mix(color, VIOLET, aViolet);

      const dPink = Math.hypot(x - haloPinkCx, y - haloPinkCy);
      const aPink = HALO_PINK.opacity * Math.exp(-((dPink / (haloPinkR * 0.85)) ** 2));
      color = mix(color, PINK, aPink);

      // Coverage du "F" par sur-échantillonnage (union des deux polygones)
      let inCount = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          if (pointInPolygon(px, py, bodyPx) || pointInPolygon(px, py, barPx)) {
            inCount++;
          }
        }
      }
      const coverage = inCount / (SS * SS);
      if (coverage > 0) {
        const t = gLenSq === 0 ? 0 : Math.max(0, Math.min(1, ((x - gx1) * gdx + (y - gy1) * gdy) / gLenSq));
        const letterColor = lerpColor(GRAD_A, GRAD_B, t);
        color = mix(color, letterColor, coverage);
      }

      // Étincelle (cercle plein + reflet)
      const dDot = Math.hypot(x - dotCx, y - dotCy);
      const feather = Math.max(0.6, scale * 0.06);
      const dotCoverage = 1 - Math.min(1, Math.max(0, (dDot - (dotR - feather)) / (2 * feather)));
      if (dotCoverage > 0.001) {
        const tDot = Math.max(0, Math.min(1, (dDot / dotR)));
        const dotColor = lerpColor(DOT_A, DOT_B, tDot);
        color = mix(color, dotColor, dotCoverage);
      }
      const dHighlight = Math.hypot(x - dotHx, y - dotHy);
      const highlightAlpha = 0.75 * Math.max(0, 1 - dHighlight / dotHr);
      if (highlightAlpha > 0.001) {
        color = mix(color, WHITE, highlightAlpha * dotCoverage);
      }

      pixels[idx] = Math.round(color[0]);
      pixels[idx + 1] = Math.round(color[1]);
      pixels[idx + 2] = Math.round(color[2]);
      pixels[idx + 3] = 255;
    }
  }
  return encodePNG(size, size, pixels);
}

mkdirSync("public/icons", { recursive: true });

writeFileSync("public/icons/icon-192.png", drawIcon(192));
writeFileSync("public/icons/icon-512.png", drawIcon(512));
writeFileSync("public/icons/icon-maskable-192.png", drawIcon(192, { maskable: true }));
writeFileSync("public/icons/icon-maskable-512.png", drawIcon(512, { maskable: true }));
writeFileSync("public/icons/apple-touch-icon.png", drawIcon(180));

console.log("Icônes générées dans public/icons/");
