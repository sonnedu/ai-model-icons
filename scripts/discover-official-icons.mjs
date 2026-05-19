import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const catalogPath = path.join(root, "catalog/models.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const failures = [];
const synced = [];

const timeoutFetch = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);
  try {
    return await fetch(url, {
      headers: {
        "user-agent": "ai-model-icons-icon-discovery/1.0"
      },
      redirect: "follow",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
};

const absolutize = (value, base) => {
  try {
    return new URL(value.replaceAll("&amp;", "&"), base).href;
  } catch {
    return null;
  }
};

const candidateUrls = (html, base) => {
  const found = new Set();
  const patterns = [
    /\b(?:src|href)=["']([^"']+\.svg(?:\?[^"']*)?)["']/gi,
    /\burl\(["']?([^"')]+\.svg(?:\?[^"')]*)?)["']?\)/gi
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const url = absolutize(match[1], base);
      if (url) found.add(url);
    }
  }

  return [...found].sort((a, b) => score(b) - score(a));
};

const score = (url) => {
  const text = url.toLowerCase();
  let value = 0;
  for (const token of ["logo", "brand", "mark", "symbol", "wordmark"]) {
    if (text.includes(token)) value += 10;
  }
  for (const token of ["footer", "header", "nav"]) {
    if (text.includes(token)) value += 2;
  }
  for (const token of ["sprite", "social", "facebook", "twitter", "linkedin", "youtube", "instagram"]) {
    if (text.includes(token)) value -= 20;
  }
  return value;
};

const isSvg = (text) => text.includes("<svg") && text.includes("</svg>");

for (const item of catalog.items) {
  if (item.icon.source !== "generated-vector") continue;

  try {
    const page = await timeoutFetch(item.website);
    if (!page.ok) {
      failures.push(`${page.status} ${item.id} ${item.website}`);
      continue;
    }

    const html = await page.text();
    const candidates = candidateUrls(html, page.url || item.website).slice(0, 6);
    let saved = false;

    for (const url of candidates) {
      const icon = await timeoutFetch(url, { timeoutMs: 8000 });
      if (!icon.ok) continue;
      const svg = await icon.text();
      if (!isSvg(svg)) continue;

      fs.writeFileSync(path.join(root, item.icon.path), `${svg.trim()}\n`, "utf8");
      item.icon.source = "official-website";
      item.icon.sourceUrl = url;
      item.icon.quality = "vector";
      synced.push(item.id);
      saved = true;
      break;
    }

    if (!saved) failures.push(`NO_SVG ${item.id} ${item.website}`);
  } catch (error) {
    failures.push(`ERR ${item.id} ${error.message}`);
  }
}

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

console.log(`Discovered ${synced.length} official website SVG icons`);
console.log(`Still pending official/vector source: ${catalog.items.filter((item) => item.icon.source === "generated-vector").length}`);
if (failures.length) {
  fs.writeFileSync(path.join(root, "catalog/icon-discovery-failures.txt"), `${failures.join("\n")}\n`, "utf8");
  console.log("Wrote catalog/icon-discovery-failures.txt");
}
