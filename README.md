# Model Icons Assets

一个面向 GitHub 快速访问的大模型图标资源目录。目标是把主流模型厂商、模型产品和推理平台放到一个可浏览、可检索、可被程序读取的目录里。

## Quick Access

- Gallery: [`docs/index.html`](docs/index.html)
- Catalog JSON: [`catalog/models.json`](catalog/models.json)
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
| `icon.type` | `simple-icons` 或 `favicon` |
| `icon.url` | 可直接访问的图标 URL |

## Current Coverage

OpenAI, ChatGPT, Anthropic, Claude, Google Gemini, Google DeepMind, Meta AI, xAI, Mistral AI, Cohere, Perplexity, DeepSeek, Alibaba Qwen, Zhipu AI, Moonshot AI, Baichuan AI, MiniMax, 01.AI, ByteDance Doubao, Baidu ERNIE, Tencent Hunyuan, Huawei Pangu, Stability AI, Midjourney, Runway, ElevenLabs, Hugging Face, Replicate, Together AI, Fireworks AI, Groq, Ollama, LM Studio.

## Validate

```bash
node scripts/validate-catalog.mjs
node scripts/check-icons.mjs
```

## Add A New Icon

1. 在 [`catalog/models.json`](catalog/models.json) 的 `items` 中新增对象。
2. 优先使用 Simple Icons CDN：`https://cdn.simpleicons.org/<slug>/<hexColor>`。
3. 没有可用官方 SVG 时，用 favicon fallback：`https://www.google.com/s2/favicons?domain=<domain>&sz=128`。
4. 运行校验脚本。

## Trademark And License Notes

本仓库只做资源索引和快速访问。品牌名称、商标和图标归各自所有者所有。商用或再分发前，应确认对应品牌资产条款、Simple Icons 条款或官网品牌规范。
