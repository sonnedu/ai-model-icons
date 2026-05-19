import fs from "node:fs";
import { allowedConfidence, allowedIconQualities, confidenceForIcon } from "./icon-quality.mjs";

const path = new URL("../catalog/models.json", import.meta.url);
const catalog = JSON.parse(fs.readFileSync(path, "utf8"));

const required = ["id", "name", "modelFamilies", "category", "country", "website", "icon"];
const allowedCategories = new Set([
  "foundation-model",
  "assistant",
  "media-model",
  "audio-model",
  "platform",
  "local-runtime",
  "research-lab"
]);
const allowedIconTypes = new Set(["svg"]);
const ids = new Set();
const errors = [];

if (!Array.isArray(catalog.items)) {
  errors.push("catalog.items must be an array");
} else {
  for (const [index, item] of catalog.items.entries()) {
    for (const field of required) {
      if (!(field in item)) errors.push(`items[${index}] missing ${field}`);
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id || "")) {
      errors.push(`${item.id || `items[${index}]`} has invalid id`);
    }
    if (ids.has(item.id)) errors.push(`${item.id} is duplicated`);
    ids.add(item.id);

    if (!Array.isArray(item.modelFamilies) || item.modelFamilies.length === 0) {
      errors.push(`${item.id} modelFamilies must be a non-empty array`);
    }
    if (!allowedCategories.has(item.category)) {
      errors.push(`${item.id} has invalid category: ${item.category}`);
    }
    if (!/^https:\/\//.test(item.website || "")) {
      errors.push(`${item.id} website must be https`);
    }
    if (!item.icon || !allowedIconTypes.has(item.icon.type)) {
      errors.push(`${item.id} has invalid icon.type`);
    }
    if (item.icon?.type === "svg") {
      if (!/^assets\/icons\/[a-z0-9-]+\.svg$/.test(item.icon.path || "")) {
        errors.push(`${item.id} icon.path must point to assets/icons/*.svg`);
      } else if (!fs.existsSync(new URL(`../${item.icon.path}`, import.meta.url))) {
        errors.push(`${item.id} icon.path does not exist`);
      }
      if (!allowedIconQualities.has(item.icon.quality)) {
        errors.push(`${item.id} svg icon has invalid quality: ${item.icon.quality}`);
      }
      if (!allowedConfidence.has(item.icon.confidence)) {
        errors.push(`${item.id} icon has invalid confidence: ${item.icon.confidence}`);
      } else {
        const expectedConfidence = confidenceForIcon(item.icon);
        if (item.icon.confidence !== expectedConfidence) {
          errors.push(`${item.id} icon.confidence should be ${expectedConfidence}`);
        }
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`OK: ${catalog.items.length} model icon entries`);
