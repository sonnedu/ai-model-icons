import fs from "node:fs";

const catalogPath = new URL("../catalog/models.json", import.meta.url);
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const byId = new Map(catalog.items.map((item) => [item.id, item]));

const products = [
  ["grok", "Grok", ["Grok", "Grok 3", "Grok 4", "SuperGrok"], "assistant", "US", "https://grok.com", "xai"],
  ["github-copilot", "GitHub Copilot", ["Copilot", "GitHub Copilot"], "assistant", "US", "https://github.com/features/copilot", "microsoft-ai"],
  ["gemini", "Gemini", ["Gemini", "Gemini Pro", "Gemini Flash"], "assistant", "US", "https://gemini.google.com", "google-gemini"],
  ["sora", "Sora", ["Sora"], "media-model", "US", "https://sora.chatgpt.com", "openai"],
  ["dall-e", "DALL-E", ["DALL-E", "DALL-E 3"], "media-model", "US", "https://openai.com/dall-e", "openai"],
  ["qwen", "Qwen", ["Qwen", "QwQ", "QvQ"], "assistant", "CN", "https://qwen.ai", "alibaba-qwen"],
  ["kimi", "Kimi", ["Kimi", "Kimi K2"], "assistant", "CN", "https://www.kimi.com", "moonshot-ai"],
  ["doubao", "Doubao", ["Doubao"], "assistant", "CN", "https://www.doubao.com", "bytedance-doubao"],
  ["hunyuan", "Hunyuan", ["Hunyuan", "Tencent Hunyuan"], "assistant", "CN", "https://hunyuan.tencent.com", "tencent-hunyuan"],
  ["ernie", "ERNIE", ["ERNIE", "Wenxin", "文心一言"], "assistant", "CN", "https://yiyan.baidu.com", "baidu-ernie"],
  ["pangu", "Pangu", ["Pangu", "盘古"], "foundation-model", "CN", "https://www.huaweicloud.com/product/pangu.html", "huawei-pangu"],
  ["stable-diffusion", "Stable Diffusion", ["Stable Diffusion", "SDXL"], "media-model", "UK", "https://stability.ai/stable-diffusion", "stability-ai"],
  ["flux", "FLUX", ["FLUX", "FLUX.1"], "media-model", "DE", "https://blackforestlabs.ai", "black-forest-labs"],
  ["llama", "Llama", ["Llama", "Llama 3", "Llama 4"], "foundation-model", "US", "https://www.llama.com", "meta-ai"],
  ["phi", "Phi", ["Phi", "Phi-4"], "foundation-model", "US", "https://azure.microsoft.com/products/phi", "microsoft-ai"]
];

for (const [id, name, modelFamilies, category, country, website, ownerId] of products) {
  const item = {
    id,
    name,
    modelFamilies,
    category,
    country,
    website,
    ownerId,
    icon: {
      type: "svg",
      source: "generated-vector",
      quality: "vector",
      confidence: "placeholder",
      path: `assets/icons/${id}.svg`,
      sourceUrl: null,
      match: "needs-entity-icon"
    }
  };

  if (byId.has(id)) Object.assign(byId.get(id), item);
  else catalog.items.push(item);
}

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Catalog now has ${catalog.items.length} entries`);
