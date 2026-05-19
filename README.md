# AI Model Icons

面向 GitHub 托管的大模型图标资源库。项目把模型厂商、模型产品、助手、平台和本地运行时拆成可独立解析的条目，提供本地 SVG、PNG 缓存、别名匹配、Apple / Android / Web asset profile，以及一个零框架 Node API。

当前状态：

- `148` 个模型/品牌/产品图标条目
- `514` 个别名，支持大小写、简称、中文名、模型名、产品名匹配
- `148` 组 SVG 本地缓存
- `148` 组 PNG raster 缓存，每组包含 `16`、`32`、`48`、`180`、`192`、`512`、`1024` 尺寸
- 图标语义审计已清零：`Needs review: 0`
- 不再保留 `generated-vector`、`parent-brand`、`needs-entity-icon` 审计项

## Repository Layout

| Path | Purpose |
| --- | --- |
| [`catalog/models.json`](catalog/models.json) | 主 catalog，包含条目元数据、owner、icon 来源和本地路径 |
| [`catalog/aliases.json`](catalog/aliases.json) | 归一化后的别名索引，用于静态解析 |
| [`catalog/icon-match-audit.json`](catalog/icon-match-audit.json) | 图标匹配审计结果 |
| [`assets/icons`](assets/icons) | SVG 图标缓存 |
| [`assets/raster`](assets/raster) | PNG raster 缓存 |
| [`data/providers.mjs`](data/providers.mjs) | 生成 catalog 的结构化条目源 |
| [`data/manual-aliases.mjs`](data/manual-aliases.mjs) | 人工别名和模型名映射 |
| [`data/icon-sources.mjs`](data/icon-sources.mjs) | 可自动同步的官方/社区矢量源 |
| [`docs/index.html`](docs/index.html) | 静态浏览页面源文件 |
| [`scripts/build-site.mjs`](scripts/build-site.mjs) | 生成可部署的 `public/` 静态站点 |
| [`scripts/api-server.mjs`](scripts/api-server.mjs) | 本地或服务器 API |

## Publish On GitHub

1. 创建 GitHub 仓库并推送本项目。
2. 在 GitHub repo settings 里启用 GitHub Pages。
3. Pages source 选择 `GitHub Actions`。
4. 保留 `.github/workflows/pages.yml`，每次 push 到 `main` 会执行 `npm run build:site` 并发布 `public/`。
5. 发布后可以用 Pages 同源 URL 或 GitHub raw URL 访问 catalog 和图标。

示例 URL：

```text
Catalog: https://raw.githubusercontent.com/sonnedu/ai-model-icons/main/catalog/models.json
Aliases: https://raw.githubusercontent.com/sonnedu/ai-model-icons/main/catalog/aliases.json
SVG: https://raw.githubusercontent.com/sonnedu/ai-model-icons/main/assets/icons/grok.svg
Apple PNG: https://raw.githubusercontent.com/sonnedu/ai-model-icons/main/assets/raster/grok/apple-touch-icon-180.png
Pages: https://sonnedu.github.io/ai-model-icons/
```

Pages 同源示例：

```text
Catalog: https://sonnedu.github.io/ai-model-icons/catalog/models.json
Aliases: https://sonnedu.github.io/ai-model-icons/catalog/aliases.json
SVG: https://sonnedu.github.io/ai-model-icons/assets/icons/grok.svg
Apple PNG: https://sonnedu.github.io/ai-model-icons/assets/raster/grok/apple-touch-icon-180.png
```

## Static Usage

适合 GitHub Pages、CDN、前端项目、无服务端项目。

1. 拉取 `catalog/models.json`。
2. 拉取 `catalog/aliases.json`。
3. 把用户输入归一化：小写，移除空格、标点和连接符。
4. 用 `aliases[normalizedInput]` 找到 `id`。
5. 从 catalog 中取 `icon.path` 或 `assets/raster/<id>/manifest.json`。

JavaScript 示例：

```js
const normalize = (value) =>
  String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");

const catalog = await fetch("/catalog/models.json").then((res) => res.json());
const aliases = await fetch("/catalog/aliases.json").then((res) => res.json());

const id = aliases.aliases[normalize("Grok 4")];
const item = catalog.items.find((entry) => entry.id === id);

console.log(item.icon.path); // assets/icons/grok.svg
```

## API Usage

安装依赖并启动：

```bash
npm install
npm run serve
```

默认地址：

```text
http://localhost:8787
```

指定端口：

```bash
PORT=3000 npm run serve
```

### Resolve

支持别名、大小写、简称、中文名、模型名和产品名。

```bash
curl "http://localhost:8787/api/resolve?q=grok"
curl "http://localhost:8787/api/resolve?q=Grok%204"
curl "http://localhost:8787/api/resolve?q=glm"
curl "http://localhost:8787/api/resolve?q=z.ai"
curl "http://localhost:8787/api/resolve?q=github%20copilot"
curl "http://localhost:8787/api/resolve?q=豆包"
curl "http://localhost:8787/api/resolve?q=cici"
```

Response:

```json
{
  "matched": true,
  "query": "grok",
  "id": "grok",
  "name": "Grok",
  "ownerId": "xai",
  "score": 100,
  "icon": "/assets/icons/grok.svg",
  "source": "lobe-icons",
  "match": "entity",
  "assets": "/api/assets?q=Grok"
}
```

Shortcut endpoint:

```bash
curl "http://localhost:8787/icon/grok"
```

### Asset Profiles

```bash
curl "http://localhost:8787/api/assets?q=grok"
```

返回 SVG、Web favicon、Apple、Android 和 raster 缓存路径：

```json
{
  "matched": true,
  "id": "grok",
  "name": "Grok",
  "ownerId": "xai",
  "source": "lobe-icons",
  "match": "entity",
  "svg": "/assets/icons/grok.svg",
  "apple": {
    "xcodeImageSet": "/assets/apple/grok.imageset/Contents.json",
    "appleTouchIconPng": "/assets/raster/grok/apple-touch-icon-180.png",
    "icon1024Png": "/assets/raster/grok/icon-1024.png"
  },
  "android": {
    "adaptiveIconXml": "/assets/android/grok/mipmap-anydpi-v26/ic_launcher.xml",
    "foregroundVectorDrawable": "/assets/android/grok/drawable/ic_launcher_foreground.xml",
    "monochromeVectorDrawable": "/assets/android/grok/drawable/ic_launcher_monochrome.xml",
    "chrome192Png": "/assets/raster/grok/android-chrome-192.png",
    "chrome512Png": "/assets/raster/grok/android-chrome-512.png",
    "webManifest": "/manifest/grok.webmanifest"
  },
  "web": {
    "faviconSvg": "/assets/icons/grok.svg",
    "favicon16Png": "/assets/raster/grok/favicon-16.png",
    "favicon32Png": "/assets/raster/grok/favicon-32.png",
    "favicon48Png": "/assets/raster/grok/favicon-48.png",
    "webManifest": "/manifest/grok.webmanifest"
  }
}
```

### Direct Asset URLs

```bash
curl "http://localhost:8787/assets/icons/grok.svg"
curl "http://localhost:8787/assets/raster/grok/favicon-32.png"
curl "http://localhost:8787/assets/raster/grok/android-chrome-512.png"
curl "http://localhost:8787/assets/raster/grok/manifest.json"
curl "http://localhost:8787/manifest/grok.webmanifest"
```

### Apple Assets

```bash
curl "http://localhost:8787/assets/apple/grok.imageset/Contents.json"
curl "http://localhost:8787/assets/apple/grok.imageset/grok.svg"
curl "http://localhost:8787/assets/raster/grok/apple-touch-icon-180.png"
curl "http://localhost:8787/assets/raster/grok/icon-1024.png"
```

### Android Assets

```bash
curl "http://localhost:8787/assets/android/grok/mipmap-anydpi-v26/ic_launcher.xml"
curl "http://localhost:8787/assets/android/grok/drawable/ic_launcher_foreground.xml"
curl "http://localhost:8787/assets/android/grok/drawable/ic_launcher_monochrome.xml"
curl "http://localhost:8787/assets/raster/grok/android-chrome-192.png"
curl "http://localhost:8787/assets/raster/grok/android-chrome-512.png"
```

Android VectorDrawable 不等价于任意 SVG。API 提供的是 profile XML 和 PNG 缓存；如果要把复杂 SVG 作为原生 APK resource，建议用 Android Studio Vector Asset 或单独的 SVG-to-VectorDrawable 构建步骤转换。

## Important Matching Examples

这些条目已经按“厂商”和“产品/模型”分开管理：

| Query | Returned ID | Owner |
| --- | --- | --- |
| `xai` | `xai` | `null` |
| `grok` | `grok` | `xai` |
| `z.ai` | `z-ai` | `zhipu-ai` |
| `智谱` | `zhipu-ai` | `null` |
| `glm` | `glm` | `zhipu-ai` |
| `copilot` | `microsoft-copilot` | `microsoft-ai` |
| `github copilot` | `github-copilot` | `microsoft-ai` |
| `doubao` / `豆包` | `doubao` | `bytedance-doubao` |
| `cici` / `dola` | `cici-ai` | `bytedance-doubao` |
| `llama` | `llama` | `meta-ai` |
| `phi` | `phi` | `microsoft-ai` |
| `pangu` | `pangu` | `huawei-pangu` |
| `qianfan` | `baidu-qianfan` | `null` |

## Scripts

```bash
npm run build:aliases
npm run build:raster
npm run check
npm run serve
```

Lower-level commands:

```bash
node scripts/build-catalog.mjs
node scripts/sync-brand-icons.mjs
node scripts/resolve-icon.mjs "gpt-4o"
node scripts/resolve-icon.mjs "github copilot"
node scripts/audit-icon-matches.mjs
```

## Maintenance Workflow

1. Add or update entries in [`data/providers.mjs`](data/providers.mjs).
2. Add aliases in [`data/manual-aliases.mjs`](data/manual-aliases.mjs).
3. Add a sync source in [`data/icon-sources.mjs`](data/icon-sources.mjs) only when it points to the correct entity icon.
4. Put local SVGs in `assets/icons/<id>.svg`.
5. Rebuild:

```bash
node scripts/build-catalog.mjs
npm run build:aliases
npm run build:raster
npm run check
```

6. Start the API and verify representative queries:

```bash
npm run serve
curl "http://localhost:8787/api/resolve?q=llama"
curl "http://localhost:8787/api/assets?q=gemini"
```

## Icon Policy

- Product/model entries should resolve to product/model icons, not parent company logos.
- Vendor entries may use vendor brand icons.
- If a reliable official/public SVG cannot be found, use a distinct `local-product-vector` SVG and mark it as `entity`.
- Do not mark a parent company icon as `entity` for a product/model entry.
- `npm run check` must leave `catalog/icon-match-audit.json` with `reviewCount: 0`.

## License And Trademarks

This repository is an index and cache for fast local/GitHub access. Brand names, trademarks, and icons belong to their respective owners. Check each brand's asset terms before commercial redistribution.
