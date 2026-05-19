import { resolveIcon } from "./icon-resolver.mjs";

const query = process.argv.slice(2).join(" ");
if (!query) {
  console.error("Usage: node scripts/resolve-icon.mjs <alias|model|provider>");
  process.exit(1);
}

const result = resolveIcon(query);
if (!result.matched) {
  console.error(`No icon matched for: ${query}`);
  process.exit(1);
}

console.log(JSON.stringify({
  query,
  id: result.item.id,
  name: result.item.name,
  ownerId: result.item.ownerId || null,
  icon: result.item.icon.path,
  match: result.item.icon.match || null,
  score: result.score
}, null, 2));
