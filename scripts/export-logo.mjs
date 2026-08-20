// Exporte le logomark de Faciem (cf. components/logo.tsx) en fichiers
// autonomes, prêts à être uploadés ailleurs (réseaux sociaux, stores...) :
// - public/brand/faciem-logo.svg (vectoriel, fond transparent)
// - public/brand/faciem-logo.png (1024x1024, fond transparent)
// Même logique de rendu que scripts/generate-icons.mjs, mais avec un vrai
// canal alpha (composite "over") au lieu d'un fond opaque fixe.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const VIOLET = [139, 92, 246]; // #8B5CF6
const PINK = [255, 93, 162]; // #FF5DA2
const GRAD_A = [167, 139, 250]; // #A78BFA
const GRAD_B = [255, 93, 162]; // #FF5DA2
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
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk("IHDR", ihdrData);

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
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

// Composite "over" standard (Porter-Duff), alpha non prémultiplié.
function over(dstColor, dstAlpha, srcColor, srcAlpha) {
  const outAlpha = srcAlpha + dstAlpha * (1 - srcAlpha);
  if (outAlpha <= 0) return { color: [0, 0, 0], alpha: 0 };
  const outColor = srcColor.map(
    (c, i) => (c * srcAlpha + dstColor[i] * dstAlpha * (1 - srcAlpha)) / outAlpha
  );
  return { color: outColor, alpha: outAlpha };
}

const SKEW = Math.tan((-9 * Math.PI) / 180);
const skew = ([x, y]) => [x + y * SKEW, y];

const F_BODY = [[11, 7], [29, 7], [24, 15], [16, 15], [16, 33], [11, 33]].map(skew);
const F_BAR = [[11, 18], [23, 18], [19, 24], [11, 24]].map(skew);
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
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function renderLogoPixels(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const pad = size * 0.06;
  const scale = (size - pad * 2) / 40;
  const toPx = (v) => pad + v * scale;
  const toPoly = (poly) => poly.map(([x, y]) => [toPx(x), toPx(y)]);

  const bodyPx = toPoly(F_BODY);
  const barPx = toPoly(F_BAR);
  const gx1 = toPx(GX1), gy1 = toPx(GY1), gx2 = toPx(GX2), gy2 = toPx(GY2);
  const gdx = gx2 - gx1, gdy = gy2 - gy1;
  const gLenSq = gdx * gdx + gdy * gdy;

  const haloPinkCx = toPx(HALO_PINK.cx), haloPinkCy = toPx(HALO_PINK.cy), haloPinkR = HALO_PINK.r * scale;
  const haloVioletCx = toPx(HALO_VIOLET.cx), haloVioletCy = toPx(HALO_VIOLET.cy), haloVioletR = HALO_VIOLET.r * scale;
  const dotCx = toPx(DOT.cx), dotCy = toPx(DOT.cy), dotR = DOT.r * scale;
  const dotHx = toPx(DOT_HIGHLIGHT.cx), dotHy = toPx(DOT_HIGHLIGHT.cy), dotHr = DOT_HIGHLIGHT.r * scale;

  const SS = 4;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      let color = [0, 0, 0];
      let alpha = 0;

      const dViolet = Math.hypot(x - haloVioletCx, y - haloVioletCy);
      const aViolet = HALO_VIOLET.opacity * Math.exp(-((dViolet / (haloVioletR * 0.85)) ** 2));
      ({ color, alpha } = over(color, alpha, VIOLET, aViolet));

      const dPink = Math.hypot(x - haloPinkCx, y - haloPinkCy);
      const aPink = HALO_PINK.opacity * Math.exp(-((dPink / (haloPinkR * 0.85)) ** 2));
      ({ color, alpha } = over(color, alpha, PINK, aPink));

      let inCount = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          if (pointInPolygon(px, py, bodyPx) || pointInPolygon(px, py, barPx)) inCount++;
        }
      }
      const coverage = inCount / (SS * SS);
      if (coverage > 0) {
        const t = gLenSq === 0 ? 0 : Math.max(0, Math.min(1, ((x - gx1) * gdx + (y - gy1) * gdy) / gLenSq));
        const letterColor = lerpColor(GRAD_A, GRAD_B, t);
        ({ color, alpha } = over(color, alpha, letterColor, coverage));
      }

      const dDot = Math.hypot(x - dotCx, y - dotCy);
      const feather = Math.max(0.6, scale * 0.06);
      const dotCoverage = 1 - Math.min(1, Math.max(0, (dDot - (dotR - feather)) / (2 * feather)));
      if (dotCoverage > 0.001) {
        const tDot = Math.max(0, Math.min(1, dDot / dotR));
        const dotColor = lerpColor(DOT_A, DOT_B, tDot);
        ({ color, alpha } = over(color, alpha, dotColor, dotCoverage));
      }
      const dHighlight = Math.hypot(x - dotHx, y - dotHy);
      const highlightAlpha = 0.75 * Math.max(0, 1 - dHighlight / dotHr) * dotCoverage;
      if (highlightAlpha > 0.001) {
        ({ color, alpha } = over(color, alpha, WHITE, highlightAlpha));
      }

      pixels[idx] = Math.round(color[0]);
      pixels[idx + 1] = Math.round(color[1]);
      pixels[idx + 2] = Math.round(color[2]);
      pixels[idx + 3] = Math.round(alpha * 255);
    }
  }
  return pixels;
}

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="1024" height="1024" role="img" aria-label="Logo Faciem">
  <defs>
    <linearGradient id="faciem-logo-grad" x1="8" y1="6" x2="26" y2="34" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#A78BFA" />
      <stop offset="100%" stop-color="#FF5DA2" />
    </linearGradient>
    <linearGradient id="faciem-logo-dot-grad" x1="30" y1="6" x2="37" y2="13" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFB4D8" />
      <stop offset="100%" stop-color="#FF5DA2" />
    </linearGradient>
    <filter id="faciem-logo-blur" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="2.6" />
    </filter>
  </defs>
  <circle cx="31" cy="11" r="7" fill="#FF5DA2" opacity="0.45" filter="url(#faciem-logo-blur)" />
  <circle cx="9" cy="30" r="6.5" fill="#8B5CF6" opacity="0.4" filter="url(#faciem-logo-blur)" />
  <g transform="skewX(-9)" fill="url(#faciem-logo-grad)">
    <path d="M11 7 L29 7 L24 15 L16 15 L16 33 L11 33 Z" />
    <path d="M11 18 L23 18 L19 24 L11 24 Z" />
  </g>
  <circle cx="33.5" cy="8.5" r="2.6" fill="url(#faciem-logo-dot-grad)" />
  <circle cx="32.7" cy="7.7" r="0.9" fill="#ffffff" opacity="0.75" />
</svg>
`;

// Fond noir de l'app (#0A0A0F, cf. BG dans generate-icons.mjs) : on aplatit
// le rendu transparent dessus plutôt que de refaire tout le tracé.
const APP_BG = [10, 10, 15];
function flattenOnBackground(rgbaPixels, size, bg) {
  const out = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const idx = i * 4;
    const a = rgbaPixels[idx + 3] / 255;
    out[idx] = Math.round(rgbaPixels[idx] * a + bg[0] * (1 - a));
    out[idx + 1] = Math.round(rgbaPixels[idx + 1] * a + bg[1] * (1 - a));
    out[idx + 2] = Math.round(rgbaPixels[idx + 2] * a + bg[2] * (1 - a));
    out[idx + 3] = 255;
  }
  return out;
}

const SIZE = 1024;
const transparentPixels = renderLogoPixels(SIZE);
const darkPixels = flattenOnBackground(transparentPixels, SIZE, APP_BG);

mkdirSync("public/brand", { recursive: true });
writeFileSync("public/brand/faciem-logo.svg", SVG);
writeFileSync("public/brand/faciem-logo.png", encodePNG(SIZE, SIZE, transparentPixels));
writeFileSync("public/brand/faciem-logo-dark.png", encodePNG(SIZE, SIZE, darkPixels));

console.log(
  "Logo exporté dans public/brand/ : faciem-logo.svg + faciem-logo.png (fond transparent) + faciem-logo-dark.png (fond noir), 1024x1024."
);
