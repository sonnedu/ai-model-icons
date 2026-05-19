import fs from "node:fs";
import { manualAliases } from "../data/manual-aliases.mjs";

const catalogPath = new URL("../catalog/models.json", import.meta.url);
const aliasesPath = new URL("../catalog/aliases.json", import.meta.url);
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

export const normalize = (value) =>
  String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");

const compactTokens = (value) =>
  String(value || "")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

const initials = (value) =>
  compactTokens(value)
    .filter((token) => !["ai", "labs", "lab", "cloud", "model", "studio", "the"].includes(token.toLowerCase()))
    .map((token) => token[0])
    .join("");

const aliases = {};
const collisions = {};

const add = (alias, id) => {
  const key = normalize(alias);
  if (!key || key.length < 2) return;
  if (aliases[key] && aliases[key] !== id) {
    collisions[key] = [...new Set([aliases[key], id])];
    return;
  }
  aliases[key] = id;
};

for (const item of catalog.items) {
  add(item.id, item.id);
  add(item.name, item.id);
  add(item.name.replace(/\bAI\b/gi, ""), item.id);
  add(initials(item.name), item.id);
  for (const family of item.modelFamilies) {
    add(family, item.id);
    add(initials(family), item.id);
  }
  for (const alias of manualAliases[item.id] || []) add(alias, item.id);
}

const payload = {
  version: catalog.version,
  count: Object.keys(aliases).length,
  aliases: Object.fromEntries(Object.entries(aliases).sort(([a], [b]) => a.localeCompare(b))),
  collisions
};

fs.writeFileSync(aliasesPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Built ${payload.count} aliases`);
if (Object.keys(collisions).length) {
  console.log(`Skipped ${Object.keys(collisions).length} ambiguous aliases`);
}
