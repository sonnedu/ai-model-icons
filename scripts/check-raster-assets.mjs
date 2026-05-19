import fs from "node:fs";

const catalog = JSON.parse(fs.readFileSync(new URL("../catalog/models.json", import.meta.url), "utf8"));
const renditions = [
  "favicon-16.png",
  "favicon-32.png",
  "favicon-48.png",
  "apple-touch-icon-180.png",
  "android-chrome-192.png",
  "android-chrome-512.png",
  "icon-1024.png",
  "manifest.json"
];
const failures = [];

for (const item of catalog.items) {
  for (const filename of renditions) {
    const file = new URL(`../assets/raster/${item.id}/${filename}`, import.meta.url);
    if (!fs.existsSync(file)) {
      failures.push(`MISSING ${item.id}/${filename}`);
      continue;
    }
    if (filename.endsWith(".png")) {
      const fd = fs.openSync(file, "r");
      const header = Buffer.alloc(8);
      fs.readSync(fd, header, 0, 8, 0);
      fs.closeSync(fd);
      if (!header.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
        failures.push(`INVALID_PNG ${item.id}/${filename}`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`OK: raster assets verified for ${catalog.items.length} icons`);
