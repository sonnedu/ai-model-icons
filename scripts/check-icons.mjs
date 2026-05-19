import fs from "node:fs";

const path = new URL("../catalog/models.json", import.meta.url);
const catalog = JSON.parse(fs.readFileSync(path, "utf8"));
const failures = [];

async function check(item) {
  const iconPath = new URL(`../${item.icon.path}`, import.meta.url);
  if (!fs.existsSync(iconPath)) {
    failures.push(`MISSING ${item.id} ${item.icon.path}`);
    return;
  }
  const svg = fs.readFileSync(iconPath, "utf8");
  if (!svg.includes("<svg") || !svg.includes("viewBox=")) {
    failures.push(`INVALID ${item.id} ${item.icon.path}`);
  }
}

await Promise.all(catalog.items.map(check));

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`OK: ${catalog.items.length} local SVG icons verified`);
