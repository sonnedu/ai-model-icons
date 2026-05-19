import fs from "node:fs";

const path = new URL("../catalog/models.json", import.meta.url);
const catalog = JSON.parse(fs.readFileSync(path, "utf8"));
const timeoutMs = 8000;
const failures = [];

async function check(item) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(item.icon.url, {
      method: "HEAD",
      signal: controller.signal
    });
    if (!response.ok) {
      failures.push(`${response.status} ${item.id} ${item.icon.url}`);
    }
  } catch (error) {
    failures.push(`ERR ${item.id} ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }
}

await Promise.all(catalog.items.map(check));

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`OK: ${catalog.items.length} icon URLs responded`);
