import fs from "node:fs";

const catalog = JSON.parse(fs.readFileSync(new URL("../catalog/models.json", import.meta.url), "utf8"));

const reviewMatches = new Set(["parent-brand", "model-family", "needs-entity-icon"]);
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

for (const item of catalog.items) {
  const sourceUrl = String(item.icon.sourceUrl || "").toLowerCase();
  const match = item.icon.match || "missing";
  const issues = [];

  if (!item.icon.path || !fs.existsSync(new URL(`../${item.icon.path}`, import.meta.url))) {
    issues.push("missing-local-svg");
  }
  if (match === "missing") issues.push("missing-match");
  if (reviewMatches.has(match)) issues.push(`review-${match}`);
  if (item.icon.source === "generated-vector") issues.push("generated-vector");
  if (suspiciousSourceTokens.some((token) => sourceUrl.includes(token))) {
    issues.push("suspicious-source-url");
  }

  if (issues.length) {
    rows.push({
      id: item.id,
      name: item.name,
      category: item.category,
      source: item.icon.source,
      match,
      sourceUrl: item.icon.sourceUrl,
      issues
    });
  }
}

const output = {
  checked: catalog.items.length,
  reviewCount: rows.length,
  rows
};

fs.writeFileSync(new URL("../catalog/icon-match-audit.json", import.meta.url), `${JSON.stringify(output, null, 2)}\n`);

console.log(`Checked ${output.checked} icons`);
console.log(`Needs review: ${output.reviewCount}`);
for (const row of rows) {
  console.log(`${row.id}\t${row.match}\t${row.issues.join(",")}`);
}
