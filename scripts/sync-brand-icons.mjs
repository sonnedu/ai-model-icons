import fs from "node:fs";
import path from "node:path";
import { iconSources } from "../data/icon-sources.mjs";

const root = new URL("..", import.meta.url).pathname;
const catalogPath = path.join(root, "catalog/models.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const failures = [];
const synced = [];

const sourceUrl = (source) => {
  if (source.type === "simple-icons") {
    return `https://cdn.simpleicons.org/${source.slug}`;
  }
  if (source.type === "iconify") {
    const [prefix, name] = source.icon.split(":");
    return `https://api.iconify.design/${prefix}/${name}.svg`;
  }
  if (source.type === "lobe-icons") {
    return `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${source.slug}.svg`;
  }
  return source.url;
};

for (const item of catalog.items) {
  const source = iconSources[item.id];
  if (!source) {
    continue;
  }

  const url = sourceUrl(source);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      failures.push(`${response.status} ${item.id} ${url}`);
      continue;
    }
    const svg = await response.text();
    if (!svg.includes("<svg")) {
      failures.push(`INVALID ${item.id} ${url}`);
      continue;
    }
    fs.writeFileSync(path.join(root, item.icon.path), `${svg.trim()}\n`, "utf8");
    item.icon.source = source.type;
    item.icon.sourceUrl = source.page || url;
    item.icon.match = source.match || "brand";
    item.icon.quality = "vector";
    synced.push(item.id);
  } catch (error) {
    failures.push(`ERR ${item.id} ${error.message}`);
  }
}

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

if (failures.length) {
  console.error(failures.join("\n"));
}
console.log(`Synced ${synced.length} configured brand SVG icons`);
console.log(`Pending official/vector source: ${catalog.items.filter((item) => item.icon.source === "generated-vector").length}`);
