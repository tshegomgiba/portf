import { writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "src", "images", "pexels-stywo-1054218.webp");
const target = join(root, "public", "og-image.jpg");

const WIDTH = 1200;
const HEIGHT = 630;

const overlay = Buffer.from(`
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0d1720" stop-opacity="0.62" />
      <stop offset="100%" stop-color="#16232f" stop-opacity="0.92" />
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#veil)" />
  <text x="80" y="300" font-family="Verdana, sans-serif" font-size="30"
        letter-spacing="10" fill="#7ec8e3">FULL STACK DEVELOPER</text>
  <text x="80" y="392" font-family="Verdana, sans-serif" font-size="72"
        font-weight="bold" fill="#ffffff">Tshegofatso Mgiba</text>
  <text x="80" y="452" font-family="Verdana, sans-serif" font-size="26"
        fill="#b8e0f0">React, TypeScript and Tailwind CSS</text>
  <text x="80" y="530" font-family="Verdana, sans-serif" font-size="22"
        fill="#ffffff" opacity="0.65">Pretoria and Johannesburg, South Africa</text>
  <rect x="80" y="486" width="64" height="3" fill="#7ec8e3" />
</svg>
`);

const image = await sharp(source)
  .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
  .composite([{ input: overlay, top: 0, left: 0 }])
  .jpeg({ quality: 84 })
  .toBuffer();

await writeFile(target, image);
console.log(`og-image.jpg written, ${Math.round(image.length / 1024)} kB`);
