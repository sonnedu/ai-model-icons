# Model Icons Assets

一个面向 GitHub 和 API 快速访问的大模型图标资源库。它同时管理模型厂商、模型产品、助手、媒体模型、推理平台和本地运行时，并提供本地 SVG 缓存、别名解析、跨平台 asset profile。

## What It Provides

- 144 个图标条目，包含厂商和产品级模型，例如 `xai` 与 `grok`、`microsoft-ai` 与 `github-copilot` 分开管理。
- 本地 SVG 缓存：[`assets/icons`](assets/icons)
- 本地 PNG 缓存：[`assets/raster`](assets/raster)
- 机器可读 catalog：[`catalog/models.json`](catalog/models.json)
- 别名索引：[`catalog/aliases.json`](catalog/aliases.json)
- 可浏览页面：[`docs/index.html`](docs/index.html)
- 自部署 API：[`scripts/api-server.mjs`](scripts/api-server.mjs)
- 图标匹配审计：[`catalog/icon-match-audit.json`](catalog/icon-match-audit.json)

发布到 GitHub 后：

```text
Raw catalog: https://raw.githubusercontent.com/<owner>/<repo>/main/catalog/models.json
Raw aliases: https://raw.githubusercontent.com/<owner>/<repo>/main/catalog/aliases.json
GitHub Pages: https://<owner>.github.io/<repo>/
```

## Data Model

`catalog/models.json` 的核心字段：

| Field | Description |
| --- | --- |
| `id` | 稳定唯一 ID，kebab-case |
| `name` | 展示名称 |
| `ownerId` | 产品/模型所属厂商 ID；厂商条目通常为空 |
| `modelFamilies` | 相关模型族、产品线、常见名称 |
| `category` | `foundation-model`、`assistant`、`media-model`、`audio-model`、`platform`、`local-runtime`、`research-lab` |
| `country` | 品牌/机构主要所在地 |
| `website` | 官网 |
| `icon.type` | 当前统一为 `svg` |
| `icon.path` | 本地 SVG 路径，如 `assets/icons/grok.svg` |
| `icon.source` | 来源类型，如 `wikimedia-commons`、`lobe-icons`、`simple-icons`、`official-website`、`generated-vector` |
| `icon.sourceUrl` | 来源页面或文件 URL |
| `icon.quality` | 当前统一为 `vector` |
| `icon.match` | 图标与条目的语义匹配程度 |

`icon.match` 的含义：

| Value | Meaning |
| --- | --- |
| `entity` | 图标匹配条目本体，推荐用于 API 返回 |
| `brand` | 图标匹配该品牌/机构 |
| `parent-brand` | 暂时使用母品牌图标，模型/产品本体图标待补 |
| `model-family` | 使用模型族图标，不一定是机构 logo |
| `host-brand` | 使用托管/发起方品牌图标 |
| `needs-entity-icon` | 尚未找到可靠实体图标，目前是本地矢量占位 |

## Static Usage

适合 GitHub Pages、CDN、无服务端场景。

1. 读取 `catalog/models.json`
2. 读取 `catalog/aliases.json`
3. 对用户输入做归一化：小写、移除空格和标点
4. 用 `aliases[normalizedInput]` 找到 `id`
5. 从 catalog 取对应条目的 `icon.path`

归一化规则在 [`scripts/build-aliases.mjs`](scripts/build-aliases.mjs) 和 [`scripts/icon-resolver.mjs`](scripts/icon-resolver.mjs) 中保持一致。

## API Server

启动：

```bash
node scripts/api-server.mjs
```

默认监听：

```text
http://localhost:8787
```

可用环境变量：

```bash
PORT=3000 node scripts/api-server.mjs
```

### Health

```bash
curl "http://localhost:8787/health"
```

Response:

```json
{
  "ok": true
}
```

### Resolve Icon

支持大小写、空格、标点、简称、中文名、模型名、产品名自动匹配。

```bash
curl "http://localhost:8787/api/resolve?q=Grok%204"
curl "http://localhost:8787/icon/grok"
curl "http://localhost:8787/icon/copilot"
curl "http://localhost:8787/icon/qwen"
curl "http://localhost:8787/icon/混元"
```

Example:

```json
{
  "matched": true,
  "query": "grok",
  "id": "grok",
  "name": "Grok",
  "ownerId": "xai",
  "score": 100,
  "icon": "/assets/icons/grok.svg",
  "source": "wikimedia-commons",
  "match": "entity",
  "assets": "/api/assets?q=Grok"
}
```

`ownerId` 用来区分产品和厂商，例如：

| Query | Returned ID | Owner |
| --- | --- | --- |
| `xai` | `xai` | `null` |
| `grok` | `grok` | `xai` |
| `copilot` | `github-copilot` | `microsoft-ai` |
| `qwen` | `qwen` | `alibaba-qwen` |
| `kimi` | `kimi` | `moonshot-ai` |

### Asset Profile

```bash
curl "http://localhost:8787/api/assets?q=grok"
```

Returns grouped asset links for Web, Apple, Android, and raw SVG:

```json
{
  "id": "grok",
  "name": "Grok",
  "ownerId": "xai",
  "source": "wikimedia-commons",
  "match": "entity",
  "svg": "/assets/icons/grok.svg",
  "apple": {
    "xcodeImageSet": "/assets/apple/grok.imageset/Contents.json",
    "universalSvg": "/assets/icons/grok.svg",
    "appleTouchIconSvg": "/assets/icons/grok.svg",
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
    "maskIcon": "/assets/icons/grok.svg",
    "webManifest": "/manifest/grok.webmanifest"
  }
}
```

### Raw SVG

```bash
curl "http://localhost:8787/assets/icons/grok.svg"
```

Response content type:

```text
image/svg+xml; charset=utf-8
```

### Web Manifest

```bash
curl "http://localhost:8787/manifest/grok.webmanifest"
```

The manifest includes cached PNG icons at `192x192` and `512x512`, plus SVG fallback with `sizes: "any"`.

### Apple Assets

Xcode image set metadata:

```bash
curl "http://localhost:8787/assets/apple/grok.imageset/Contents.json"
```

This returns a minimal `.imageset` `Contents.json` referencing the local SVG. PNG cache is also available:

```bash
curl "http://localhost:8787/assets/raster/grok/apple-touch-icon-180.png"
curl "http://localhost:8787/assets/raster/grok/icon-1024.png"
```

### Android Assets

Adaptive icon XML:

```bash
curl "http://localhost:8787/assets/android/grok/mipmap-anydpi-v26/ic_launcher.xml"
```

VectorDrawable profile:

```bash
curl "http://localhost:8787/assets/android/grok/drawable/ic_launcher_foreground.xml"
curl "http://localhost:8787/assets/android/grok/drawable/ic_launcher_monochrome.xml"
```

Android VectorDrawable is not equivalent to arbitrary SVG. The API provides Android profile XML plus cached PNGs:

```bash
curl "http://localhost:8787/assets/raster/grok/android-chrome-192.png"
curl "http://localhost:8787/assets/raster/grok/android-chrome-512.png"
```

## CLI

```bash
node scripts/resolve-icon.mjs GPT-4o
node scripts/resolve-icon.mjs grok
node scripts/resolve-icon.mjs copilot
node scripts/resolve-icon.mjs qwen
```

Example:

```json
{
  "query": "copilot",
  "id": "github-copilot",
  "name": "GitHub Copilot",
  "ownerId": "microsoft-ai",
  "icon": "assets/icons/github-copilot.svg",
  "match": "entity",
  "score": 100
}
```

## Maintenance

Regenerate alias index:

```bash
node scripts/build-aliases.mjs
```

Generate PNG raster cache:

```bash
npm install
npm run build:raster
```

Validate catalog and local SVGs:

```bash
node scripts/validate-catalog.mjs
node scripts/check-icons.mjs
```

Audit semantic icon matches:

```bash
node scripts/audit-icon-matches.mjs
```

Sync configured brand sources:

```bash
node scripts/sync-brand-icons.mjs
```

Add product-level entries:

```bash
node scripts/add-product-entries.mjs
```

## Adding Or Fixing Icons

1. Add or edit entries in [`catalog/models.json`](catalog/models.json), or add structured sources in [`data/icon-sources.mjs`](data/icon-sources.mjs).
2. For product/model icons, prefer a product-level entry with `ownerId` instead of overloading the vendor entry.
3. Put the local SVG at `assets/icons/<id>.svg`.
4. Set `icon.match` honestly. Do not mark a parent company logo as `entity`.
5. Add aliases in [`data/manual-aliases.mjs`](data/manual-aliases.mjs).
6. Run validation and audit scripts.

## Icon Matching Policy

图标必须匹配条目本体。厂商条目可以使用厂商品牌 logo；产品、助手、模型族条目必须优先使用产品/模型自己的 logo。

如果没有可靠高清矢量来源：

- 使用 `needs-entity-icon` 标记，不伪装为官方图标。
- 如果临时使用母品牌，标记 `parent-brand`。
- API 会返回 `match`，调用方可以自行决定是否展示、降级或提示待补。

## Trademark And License Notes

本仓库只做资源索引、本地缓存和快速访问。品牌名称、商标和图标归各自所有者所有。商用或再分发前，应确认对应品牌资产条款、来源许可和官网品牌规范。
