// Génère les icônes PWA (PNG) à partir d'un monogramme dessiné en pixels.
// Pas de dépendance externe : encodage PNG manuel via zlib (inclus dans Node).
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const BG = [26, 24, 22]; // #1A1817 - charcoal premium
const FG = [196, 154, 91]; // #C49A5B - bronze doux

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

// Monogramme "F" dessiné sur une grille 16x16, mis à l'échelle.
// 1 = bronze (avant-plan), 0 = fond
const GRID = [
  "0000000000000000",
  "0000000000000000",
  "0000111111100000",
  "0000111111100000",
  "0000110000000000",
  "0000110000000000",
  "0000110000000000",
  "0000111111000000",
  "0000111111000000",
  "0000110000000000",
  "0000110000000000",
  "0000110000000000",
  "0000110000000000",
  "0000110000000000",
  "0000000000000000",
  "0000000000000000",
];

function drawIcon(size, { maskable = false } = {}) {
  const pixels = Buffer.alloc(size * size * 4);
  // padding supplémentaire pour les icônes "maskable" (zone de sécurité)
  const pad = maskable ? size * 0.12 : 0;
  const usable = size - pad * 2;
  const cellM = usable / GRID.length;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      let isFg = false;
      const gx = Math.floor((x - pad) / cellM);
      const gy = Math.floor((y - pad) / cellM);
      if (gx >= 0 && gx < GRID.length && gy >= 0 && gy < GRID.length) {
        isFg = GRID[gy][gx] === "1";
      }
      const color = isFg ? FG : BG;
      pixels[idx] = color[0];
      pixels[idx + 1] = color[1];
      pixels[idx + 2] = color[2];
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
