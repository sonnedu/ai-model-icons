import fs from "node:fs";
import { confidenceForIcon } from "./icon-quality.mjs";

const catalog = JSON.parse(fs.readFileSync(new URL("../catalog/models.json", import.meta.url), "utf8"));

const reviewMatches = new Set(["parent-brand", "model-family", "needs-entity-icon"]);
const reviewConfidence = new Set(["parent-brand", "placeholder"]);
const suspiciousSourceTokens = [
  "anthropic.svg",
  "digital%20ocean",
  "rolling_stone",
  "share-point",
  "vercel-wordmark",
  "meity.svg",
  "hero-dashboard",
  "hf-logo",
  "logo_pika",
  "homepage-download",
  "sparkle.svg",
  "right-1.svg",
  "documentparse"
];

const rows = [];
const pending = [];

for (const item of catalog.items) {
  const sourceUrl = String(item.icon.sourceUrl || "").toLowerCase();
  const match = item.icon.match || "missing";
  const confidence = item.icon.confidence || confidenceForIcon(item.icon);
  const issues = new Set();

  if (!item.icon.path || !fs.existsSync(new URL(`../${item.icon.path}`, import.meta.url))) {
    issues.add("missing-local-svg");
  }
  if (match === "missing") issues.add("missing-match");
  if (reviewMatches.has(match)) issues.add(`review-${match}`);
  if (reviewConfidence.has(confidence)) issues.add(`review-${confidence}`);
  if (item.icon.confidence && item.icon.confidence !== confidenceForIcon(item.icon)) {
    issues.add("confidence-mismatch");
  }
  if (item.icon.source === "generated-vector") issues.add("generated-vector");
  if (item.icon.source === "local-product-vector") issues.add("local-placeholder");
  if (item.icon.quality === "embedded-raster") issues.add("embedded-raster");
  if (suspiciousSourceTokens.some((token) => sourceUrl.includes(token))) {
    issues.add("suspicious-source-url");
  }

  if (confidence === "placeholder") {
    pending.push({
      id: item.id,
      name: item.name,
      category: item.category,
      country: item.country,
      website: item.website,
      currentSource: item.icon.source,
      currentMatch: match,
      reason: item.icon.sourceUrl ? "verify-source" : "needs-official-or-community-vector"
    });
  }

  if (issues.size) {
    rows.push({
      id: item.id,
      name: item.name,
      category: item.category,
      source: item.icon.source,
      quality: item.icon.quality,
      confidence,
      match,
      sourceUrl: item.icon.sourceUrl,
      issues: [...issues]
    });
  }
}

const output = {
  checked: catalog.items.length,
  reviewCount: rows.length,
  rows
};

fs.writeFileSync(new URL("../catalog/icon-match-audit.json", import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
fs.writeFileSync(
  new URL("../catalog/pending-icons.json", import.meta.url),
  `${JSON.stringify({ count: pending.length, items: pending }, null, 2)}\n`
);

console.log(`Checked ${output.checked} icons`);
console.log(`Needs review: ${output.reviewCount}`);
console.log(`Pending placeholders: ${pending.length}`);
for (const row of rows) {
  console.log(`${row.id}\t${row.confidence}\t${row.match}\t${row.issues.join(",")}`);
}
