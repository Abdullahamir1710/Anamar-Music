import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height) {
  // Create uncompressed RGBA pixel buffer
  const stride = width * 4 + 1; // 1 filter byte per scanline
  const rawBuffer = Buffer.alloc(stride * height);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.44;
  const rInner = width * 0.41;

  for (let y = 0; y < height; y++) {
    const lineOffset = y * stride;
    rawBuffer[lineOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = lineOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: deep dark space with subtle radial glow
      let r = 7, g = 9, b = 14, a = 255;
      const normDist = dist / (width / 2);
      if (normDist < 1.0) {
        const glow = Math.max(0, 1.0 - normDist);
        r = Math.min(255, Math.floor(7 + glow * 18));
        g = Math.min(255, Math.floor(9 + glow * 24));
        b = Math.min(255, Math.floor(14 + glow * 40));
      }

      // Outer ring
      if (dist >= rInner && dist <= rOuter) {
        const ringProgress = (dx + rOuter) / (2 * rOuter); // 0 (left cyan) to 1 (right magenta)
        const ringR = Math.floor(0 * (1 - ringProgress) + 217 * ringProgress);
        const ringG = Math.floor(210 * (1 - ringProgress) + 70 * ringProgress);
        const ringB = Math.floor(255 * (1 - ringProgress) + 239 * ringProgress);
        r = ringR;
        g = ringG;
        b = ringB;
      }

      // Headphone ear pads (left and right)
      const padWidth = width * 0.08;
      const padHeight = height * 0.32;
      // Left pad
      if (Math.abs(x - (cx - rOuter * 0.95)) < padWidth / 2 && Math.abs(y - cy) < padHeight / 2) {
        r = 0; g = 210; b = 255;
      }
      // Right pad
      if (Math.abs(x - (cx + rOuter * 0.95)) < padWidth / 2 && Math.abs(y - cy) < padHeight / 2) {
        r = 217; g = 70; b = 239;
      }

      // Stylized central 'A'
      // Left leg
      const leftLegX = cx - (width * 0.18) * (1 - (cy - y) / (height * 0.3));
      const rightLegX = cx + (width * 0.18) * (1 - (cy - y) / (height * 0.3));

      if (y >= cy - height * 0.3 && y <= cy + height * 0.28) {
        const dLeft = Math.abs(x - leftLegX);
        const dRight = Math.abs(x - rightLegX);
        const legThick = width * 0.065;

        if (dLeft < legThick) {
          const t = (x - (cx - width * 0.3)) / (width * 0.6);
          r = Math.floor(0 + t * 150);
          g = Math.floor(210 - t * 120);
          b = 255;
        } else if (dRight < legThick) {
          const t = (x - cx) / (width * 0.3);
          r = Math.floor(122 + t * 100);
          g = Math.floor(92 - t * 20);
          b = Math.floor(255 - t * 16);
        }

        // Crossbar wave
        if (Math.abs(y - (cy + height * 0.04)) < width * 0.04 && x >= leftLegX - 5 && x <= rightLegX + 5) {
          const t = (x - leftLegX) / (rightLegX - leftLegX);
          r = Math.floor(0 * (1 - t) + 217 * t);
          g = Math.floor(210 * (1 - t) + 70 * t);
          b = Math.floor(255 * (1 - t) + 239 * t);
        }
      }

      rawBuffer[pxOffset] = r;
      rawBuffer[pxOffset + 1] = g;
      rawBuffer[pxOffset + 2] = b;
      rawBuffer[pxOffset + 3] = a;
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawBuffer);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crcData = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(crcData), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = chunk('IHDR', ihdr);
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64));

console.log('Successfully generated Anamar Music PNG icons!');
