import fs from "node:fs";
import path from "node:path";
import { providers } from "../data/providers.mjs";

const root = new URL("..", import.meta.url).pathname;
const iconsDir = path.join(root, "assets/icons");
const catalogPath = path.join(root, "catalog/models.json");
const existingCatalog = fs.existsSync(catalogPath)
  ? JSON.parse(fs.readFileSync(catalogPath, "utf8"))
  : { items: [] };
const existingById = new Map(existingCatalog.items.map((item) => [item.id, item]));

fs.mkdirSync(iconsDir, { recursive: true });

const hashColor = (id) => {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  return {
    bg: `hsl(${hue} 58% 24%)`,
    fg: `hsl(${(hue + 38) % 360} 88% 92%)`,
    ring: `hsl(${(hue + 18) % 360} 70% 54%)`
  };
};

const initials = (name) => {
  const clean = name
    .replace(/\b(AI|Labs?|Cloud|Studio|Model|Machine|Learning|Research)\b/gi, "")
    .replace(/[^a-z0-9. ]/gi, " ")
    .trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].replace(".", "").slice(0, 3).toUpperCase();
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
};

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const iconSvg = (provider) => {
  const [id, name] = provider;
  const colors = hashColor(id);
  const label = initials(name);
  const fontSize = label.length > 2 ? 78 : 94;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="${escapeXml(name)} icon">
  <rect width="256" height="256" rx="56" fill="${colors.bg}"/>
  <path d="M40 68C40 52.5 52.5 40 68 40h120c15.5 0 28 12.5 28 28v120c0 15.5-12.5 28-28 28H68c-15.5 0-28-12.5-28-28V68Z" fill="none" stroke="${colors.ring}" stroke-width="12"/>
  <text x="128" y="146" text-anchor="middle" dominant-baseline="middle" fill="${colors.fg}" font-family="Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="800" letter-spacing="0">${escapeXml(label)}</text>
</svg>
`;
};

const items = providers.map(([id, name, modelFamilies, category, country, website, ownerId]) => {
  const iconPath = `assets/icons/${id}.svg`;
  const absoluteIconPath = path.join(root, iconPath);
  if (!fs.existsSync(absoluteIconPath)) {
    fs.writeFileSync(absoluteIconPath, iconSvg([id, name]), "utf8");
  }
  const existing = existingById.get(id);
  return {
    ...existing,
    id,
    name,
    modelFamilies,
    category,
    country,
    website,
    ...(ownerId ? { ownerId } : {}),
    icon: existing?.icon || {
      type: "svg",
      source: "generated-vector",
      quality: "vector",
      path: iconPath,
      sourceUrl: null,
      match: "needs-entity-icon"
    }
  };
});

const catalog = {
  version: new Date().toISOString().slice(0, 10),
  licenseNote:
    existingCatalog.licenseNote ||
    "Brand names are trademarks of their respective owners. Icons in assets/icons are local vector placeholders unless source says otherwise; replace with official brand SVGs only when license terms permit.",
  items
};

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(`Built ${items.length} catalog entries without overwriting existing icons`);
