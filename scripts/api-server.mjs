import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { resolveIcon } from "./icon-resolver.mjs";

const root = new URL("..", import.meta.url).pathname;
const port = Number(process.env.PORT || 8787);

const sendJson = (res, status, payload) => {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "public, max-age=3600"
  });
  res.end(`${JSON.stringify(payload, null, 2)}\n`);
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const query = decodeURIComponent(url.searchParams.get("q") || url.pathname.replace(/^\/icon\//, ""));

  if (url.pathname === "/health") return sendJson(res, 200, { ok: true });
  if (url.pathname === "/api/resolve" || url.pathname.startsWith("/icon/")) {
    const result = resolveIcon(query);
    if (!result.matched) return sendJson(res, 404, { matched: false, query });
    return sendJson(res, 200, {
      matched: true,
      query,
      id: result.item.id,
      name: result.item.name,
      ownerId: result.item.ownerId || null,
      score: result.score,
      icon: `/${result.item.icon.path}`,
      source: result.item.icon.source,
      match: result.item.icon.match || null
    });
  }

  if (url.pathname.startsWith("/assets/icons/")) {
    const file = path.join(root, url.pathname);
    if (!file.startsWith(path.join(root, "assets/icons")) || !fs.existsSync(file)) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200, {
      "content-type": "image/svg+xml; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=31536000, immutable"
    });
    return fs.createReadStream(file).pipe(res);
  }

  sendJson(res, 404, {
    error: "Use /api/resolve?q=claude-sonnet or /icon/gpt-4o"
  });
});

server.listen(port, () => {
  console.log(`Icon API listening on http://localhost:${port}`);
});
