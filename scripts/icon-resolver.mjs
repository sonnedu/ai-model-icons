import fs from "node:fs";

const catalog = JSON.parse(fs.readFileSync(new URL("../catalog/models.json", import.meta.url), "utf8"));
const aliasIndex = JSON.parse(fs.readFileSync(new URL("../catalog/aliases.json", import.meta.url), "utf8"));
const byId = new Map(catalog.items.map((item) => [item.id, item]));

export const normalize = (value) =>
  String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");

const scoreItem = (query, item) => {
  const key = normalize(query);
  const fields = [item.id, item.name, ...item.modelFamilies].map(normalize);
  let score = 0;
  for (const field of fields) {
    if (field === key) score = Math.max(score, 100);
    else if (field.startsWith(key) || key.startsWith(field)) score = Math.max(score, 85);
    else if (field.includes(key) || key.includes(field)) score = Math.max(score, 70);
  }
  return score;
};

export const resolveIcon = (query) => {
  const key = normalize(query);
  const directId = aliasIndex.aliases[key];
  const item = directId ? byId.get(directId) : null;
  if (item) return { matched: true, score: 100, query, alias: key, item };

  const ranked = catalog.items
    .map((candidate) => ({ candidate, score: scoreItem(query, candidate) }))
    .filter((entry) => entry.score >= 70)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) return { matched: false, score: 0, query, alias: key, item: null };
  return { matched: true, score: ranked[0].score, query, alias: key, item: ranked[0].candidate };
};
