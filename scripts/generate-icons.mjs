// Génère les icônes PWA (PNG) à partir du logomark de Faciem : un orbe en
// dégradé entouré de deux halos flous asymétriques (cf. components/logo.tsx).
// Pas de dépendance externe : rendu par pixel + encodage PNG manuel via zlib.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const BG = [10, 10, 15]; // #0A0A0F - fond sombre de l'app
const VIOLET = [139, 92, 246]; // #8B5CF6
const PINK = [255, 93, 162]; // #FF5DA2
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
  return lerpColor(base, color, Math.max(0, Math.min(1, alpha)));
}

// Coordonnées calquées sur le viewBox 0..40 de components/logo.tsx
const MAIN = { cx: 19.5, cy: 20, r: 12.5 };
const ACCENT_PINK = { cx: 29, cy: 13, r: 8.5, opacity: 0.7 };
const ACCENT_VIOLET = { cx: 10, cy: 27, r: 7, opacity: 0.6 };

function drawIcon(size, { maskable = false } = {}) {
  const pixels = Buffer.alloc(size * size * 4);
  // padding supplémentaire pour les icônes "maskable" (zone de sécurité)
  const pad = maskable ? size * 0.16 : size * 0.02;
  const scale = (size - pad * 2) / 40;
  const toPx = (v) => pad + v * scale;

  const mainCx = toPx(MAIN.cx);
  const mainCy = toPx(MAIN.cy);
  const mainR = MAIN.r * scale;
  const sheenCx = mainCx - mainR * 0.3;
  const sheenCy = mainCy - mainR * 0.42;
  const sheenR = mainR * 1.05;

  const pinkCx = toPx(ACCENT_PINK.cx);
  const pinkCy = toPx(ACCENT_PINK.cy);
  const pinkR = ACCENT_PINK.r * scale;

  const violetCx = toPx(ACCENT_VIOLET.cx);
  const violetCy = toPx(ACCENT_VIOLET.cy);
  const violetR = ACCENT_VIOLET.r * scale;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      let color = BG;

      // Halo flou violet (rendu par une chute gaussienne, pas de bord net)
      const dViolet = Math.hypot(x - violetCx, y - violetCy);
      const aViolet = ACCENT_VIOLET.opacity * Math.exp(-((dViolet / (violetR * 0.85)) ** 2));
      color = mix(color, VIOLET, aViolet);

      // Halo flou rose
      const dPink = Math.hypot(x - pinkCx, y - pinkCy);
      const aPink = ACCENT_PINK.opacity * Math.exp(-((dPink / (pinkR * 0.85)) ** 2));
      color = mix(color, PINK, aPink);

      // Orbe principal : bord net avec anti-aliasing léger + dégradé diagonal
      const dMain = Math.hypot(x - mainCx, y - mainCy);
      const feather = Math.max(1, scale * 0.08);
      const coverage = 1 - Math.min(1, Math.max(0, (dMain - (mainR - feather)) / (2 * feather)));
      if (coverage > 0.001) {
        const t = Math.max(
          0,
          Math.min(1, (x - (mainCx - mainR) + (y - (mainCy - mainR))) / (4 * mainR))
        );
        let mainColor = lerpColor(VIOLET, PINK, t);

        const dSheen = Math.hypot(x - sheenCx, y - sheenCy);
        const sheenAlpha = 0.4 * Math.max(0, 1 - dSheen / sheenR) ** 2;
        mainColor = mix(mainColor, WHITE, sheenAlpha);

        color = mix(color, mainColor, coverage);
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
