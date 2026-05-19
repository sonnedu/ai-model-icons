# Model Icons Assets

一个面向 GitHub 快速访问的大模型图标资源目录。目标是把主流模型厂商、模型产品和推理平台放到一个可浏览、可检索、可被程序读取的目录里。

## Quick Access

- Gallery: [`docs/index.html`](docs/index.html)
- Catalog JSON: [`catalog/models.json`](catalog/models.json)
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

## Current Coverage

当前覆盖 129 个模型厂商、研究机构、AI 产品和推理平台。完整列表见 [`catalog/models.json`](catalog/models.json)。

## Validate

```bash
node scripts/validate-catalog.mjs
node scripts/check-icons.mjs
```

## Add A New Icon

1. 在 [`data/providers.mjs`](data/providers.mjs) 中新增厂商。
2. 运行 `node scripts/build-catalog.mjs` 生成 catalog 和本地 SVG。
3. 如果有可合法使用的官方 SVG，把对应 `assets/icons/<id>.svg` 替换为官方矢量文件，并把 catalog 里的 `icon.source` 改成 `official`。
4. 运行校验脚本。

## Trademark And License Notes

本仓库只做资源索引和快速访问。品牌名称和商标归各自所有者所有。当前 SVG 是本地矢量占位图，适合高清展示和目录管理；商用或再分发官方品牌图标前，应确认对应品牌资产条款或官网品牌规范。
