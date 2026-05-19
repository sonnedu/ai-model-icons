# Model Icons Assets

一个面向 GitHub 快速访问的大模型图标资源目录。目标是把主流模型厂商、模型产品和推理平台放到一个可浏览、可检索、可被程序读取的目录里。

## Quick Access

- Gallery: [`docs/index.html`](docs/index.html)
- Catalog JSON: [`catalog/models.json`](catalog/models.json)
- Alias Index: [`catalog/aliases.json`](catalog/aliases.json)
- Local SVG Icons: [`assets/icons`](assets/icons)
- Raw JSON: `https://raw.githubusercontent.com/<owner>/<repo>/main/catalog/models.json`
- GitHub Pages: `https://<owner>.github.io/<repo>/`

> 发布到 GitHub 后，把 `<owner>/<repo>` 替换成你的仓库地址即可。

## Catalog Fields

| Field | Description |
| --- | --- |
| `id` | 稳定唯一 ID，建议 kebab-case |
| `name` | 展示名称 |
| `modelFamilies` | 相关模型族或产品线 |
| `category` | `foundation-model`、`assistant`、`media-model`、`audio-model`、`platform`、`local-runtime`、`research-lab` |
| `country` | 品牌/机构主要所在地 |
| `website` | 官网 |
| `icon.type` | 当前统一为 `svg` |
| `icon.path` | 本地高清矢量图标路径，如 `assets/icons/openai.svg` |
| `icon.source` | `generated-vector` 表示本地矢量占位；替换成官方 SVG 后可改为 `official` |
| `icon.quality` | 当前统一为 `vector` |
| `icon.match` | `entity` 表示图标匹配该条目本体；`brand` 表示品牌图标；不要用母公司 logo 冒充产品 logo |

## Current Coverage

当前覆盖 129 个模型厂商、研究机构、AI 产品和推理平台。完整列表见 [`catalog/models.json`](catalog/models.json)。

## Validate

```bash
node scripts/validate-catalog.mjs
node scripts/check-icons.mjs
node scripts/build-aliases.mjs
```

## Resolve Icons

Static usage on GitHub Pages:

- Load [`catalog/models.json`](catalog/models.json)
- Load [`catalog/aliases.json`](catalog/aliases.json)
- Normalize input by lowercasing and removing symbols/spaces, then read `aliases[normalizedInput]`
- Return the matched item's `icon.path`

Local/self-hosted API:

```bash
node scripts/api-server.mjs
```

```bash
curl "http://localhost:8787/api/resolve?q=GPT-4o"
curl "http://localhost:8787/icon/claude-sonnet"
curl "http://localhost:8787/icon/混元"
curl "http://localhost:8787/api/assets?q=grok"
curl "http://localhost:8787/manifest/grok.webmanifest"
curl "http://localhost:8787/assets/apple/grok.imageset/Contents.json"
curl "http://localhost:8787/assets/android/grok/mipmap-anydpi-v26/ic_launcher.xml"
```

CLI:

```bash
node scripts/resolve-icon.mjs GPT-4o
node scripts/resolve-icon.mjs claude-sonnet
node scripts/resolve-icon.mjs qwen
```

The resolver supports case-insensitive matching, punctuation-insensitive matching, aliases, abbreviations, Chinese names, and model-family names.

## Asset Profiles

`/api/assets?q=<name>` returns reusable asset links for SVG, Apple/Xcode image sets, Android adaptive-icon profile, favicon, mask icon, and PWA manifest. Apple touch icons and Android launcher icons often require PNG or native VectorDrawable resources for production apps; this repository is SVG-first, so use the returned SVG directly where supported or rasterize/convert it in your build pipeline.

## Add A New Icon

1. 在 [`data/providers.mjs`](data/providers.mjs) 中新增厂商。
2. 运行 `node scripts/build-catalog.mjs` 生成 catalog 和本地 SVG。
3. 如果有可合法使用的官方 SVG，把对应 `assets/icons/<id>.svg` 替换为官方矢量文件，并把 catalog 里的 `icon.source` 改成对应来源。
4. 运行校验脚本。

## Icon Matching Policy

图标必须匹配条目本体。厂商条目可以使用厂商品牌 logo；产品、助手、模型族条目必须使用产品/模型自己的 logo。没有可靠高清矢量来源时，保留 `generated-vector` 或待补状态，不使用母公司 logo 代替。

## Trademark And License Notes

本仓库只做资源索引和快速访问。品牌名称和商标归各自所有者所有。当前 SVG 是本地矢量占位图，适合高清展示和目录管理；商用或再分发官方品牌图标前，应确认对应品牌资产条款或官网品牌规范。
