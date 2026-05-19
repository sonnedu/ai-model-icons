import fs from "node:fs/promises";
import path from "node:path";
import { manualAliases } from "../data/manual-aliases.mjs";

const root = process.cwd();
const outDir = path.join(root, "public");
const catalogPath = path.join(root, "catalog", "models.json");
const aliasesPath = path.join(root, "catalog", "aliases.json");

const pathSafe = (value) =>
  String(value || "")
    .trim()
    .replace(/[/:\\?#\[\]@!$&'()*+,;=%\s]+/g, "-")
    .replace(/^-+|-+$/g, "");

const aliasPathCandidates = (value) => {
  const raw = String(value || "").trim();
  const candidates = new Set([raw]);
  const compact = raw.replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, "");
  if (compact) {
    candidates.add(compact);
    candidates.add(compact.replace(/([a-zA-Z])(\d)/g, "$1-$2"));
    candidates.add(compact.replace(/([a-zA-Z])(\d)([a-zA-Z])/g, "$1-$2$3"));
  }
  return [...candidates].map(pathSafe).filter(Boolean);
};

await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(outDir, { recursive: true });

for (const name of ["docs", "catalog", "assets"]) {
  await fs.cp(path.join(root, name), path.join(outDir, name === "docs" ? "" : name), {
    recursive: true
  });
}

const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));
const aliases = JSON.parse(await fs.readFile(aliasesPath, "utf8"));
const byId = new Map(catalog.items.map((item) => [item.id, item]));
const aliasValues = new Map();

for (const [alias, id] of Object.entries(aliases.aliases || {})) {
  if (!aliasValues.has(id)) aliasValues.set(id, new Set());
  aliasValues.get(id).add(alias);
}

for (const item of catalog.items) {
  const candidates = new Set([
    item.name,
    ...(item.modelFamilies || []),
    ...(manualAliases[item.id] || []),
    ...(aliasValues.get(item.id) || [])
  ]);

  for (const candidate of candidates) {
    for (const alias of aliasPathCandidates(candidate)) {
      if (!alias || alias === item.id || byId.has(alias)) continue;

      const iconSource = path.join(outDir, item.icon.path);
      const iconTarget = path.join(outDir, "assets", "icons", `${alias}.svg`);
      if (iconSource.toLowerCase() !== iconTarget.toLowerCase()) {
        await fs.cp(iconSource, iconTarget, { force: true });
      }

      const rasterSource = path.join(outDir, "assets", "raster", item.id);
      const rasterTarget = path.join(outDir, "assets", "raster", alias);
      if (rasterSource.toLowerCase() !== rasterTarget.toLowerCase()) {
        await fs.cp(rasterSource, rasterTarget, { recursive: true, force: true });
      }
    }
  }
}
