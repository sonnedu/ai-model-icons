import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = new URL("..", import.meta.url).pathname;
const catalog = JSON.parse(fs.readFileSync(path.join(root, "catalog/models.json"), "utf8"));
const outRoot = path.join(root, "assets/raster");

const renditions = [
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
  ["favicon-48.png", 48],
  ["apple-touch-icon-180.png", 180],
  ["android-chrome-192.png", 192],
  ["android-chrome-512.png", 512],
  ["icon-1024.png", 1024]
];

fs.mkdirSync(outRoot, { recursive: true });

let count = 0;

for (const item of catalog.items) {
  const input = path.join(root, item.icon.path);
  const dir = path.join(outRoot, item.id);
  fs.mkdirSync(dir, { recursive: true });

  for (const [filename, size] of renditions) {
    await sharp(input, { density: 384 })
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(dir, filename));
    count += 1;
  }

  fs.writeFileSync(
    path.join(dir, "manifest.json"),
    `${JSON.stringify({
      id: item.id,
      name: item.name,
      source: item.icon.path,
      renditions: Object.fromEntries(
        renditions.map(([filename, size]) => [
          filename,
          {
            size,
            path: `assets/raster/${item.id}/${filename}`
          }
        ])
      )
    }, null, 2)}\n`
  );
}

console.log(`Generated ${count} PNG renditions for ${catalog.items.length} icons`);
