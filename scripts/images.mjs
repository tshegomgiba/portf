import { readFile, writeFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const images = join(root, "src", "images");

// Each source is resized to roughly twice its largest on-screen size, which is
// plenty for retina displays and far smaller than the originals.
const jobs = [
  { file: "pexels-stywo-1054218.jpg", width: 2200, quality: 70 },
  { file: "Untitled Project.jpg", out: "portrait.jpg", width: 640, quality: 82 },
  { file: "shot-histakes.png", width: 720, quality: 80 },
  { file: "shot-houseofmash.png", width: 720, quality: 80 },
  { file: "shot-naruto.png", width: 720, quality: 80 },
  { file: "logo-anime.png", width: 320, quality: 85 },
  { file: "logo-histakes.png", width: 256, quality: 88 },
  { file: "logo-houseofmash.png", width: 256, quality: 88 },
  { file: "logo-aucrada.png", width: 256, quality: 88 },
  { file: "logo-asante.png", width: 256, quality: 88 },
  { file: "logo-tshimologong.png", width: 256, quality: 88 },
];

const kb = (bytes) => `${Math.round(bytes / 1024)} kB`;

let before = 0;
let after = 0;

for (const { file, out, width, quality } of jobs) {
  const source = join(images, file);
  const name = (out ?? file).replace(/\.(png|jpe?g)$/i, ".webp");
  const target = join(images, name);

  const input = await readFile(source);
  const output = await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  await writeFile(target, output);

  const original = (await stat(source)).size;
  before += original;
  after += output.length;

  const saved = Math.round((1 - output.length / original) * 100);
  console.log(`${file} -> ${name}  ${kb(original)} to ${kb(output.length)}  (-${saved}%)`);
}

console.log(`\ntotal ${kb(before)} to ${kb(after)}`);
