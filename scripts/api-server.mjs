import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import {
  androidAdaptiveIconXml,
  androidVectorPlaceholderXml,
  assetProfiles,
  webManifest,
  xcodeImageSetContents
} from "./asset-profiles.mjs";
import { resolveIcon } from "./icon-resolver.mjs";

const root = new URL("..", import.meta.url).pathname;
const port = Number(process.env.PORT || 8787);
const iconRoot = path.join(root, "assets/icons");
const rasterRoot = path.join(root, "assets/raster");

const isInside = (file, dir) => {
  const relative = path.relative(dir, file);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
};

const sendFile = (res, file, contentType, cacheControl = "public, max-age=31536000, immutable") => {
  res.writeHead(200, {
    "content-type": contentType,
    "access-control-allow-origin": "*",
    "cache-control": cacheControl
  });
  return fs.createReadStream(file).pipe(res);
};

const sendJson = (res, status, payload) => {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "public, max-age=3600"
  });
  res.end(`${JSON.stringify(payload, null, 2)}\n`);
};

const publicOrigin = (req) => {
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${req.headers.host}`;
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const query = decodeURIComponent(url.searchParams.get("q") || url.pathname.replace(/^\/icon\//, ""));

  if (url.pathname === "/health") return sendJson(res, 200, { ok: true });
  if (url.pathname === "/api/assets") {
    const result = resolveIcon(query);
    if (!result.matched) return sendJson(res, 404, { matched: false, query });
    return sendJson(res, 200, {
      matched: true,
      query,
      ...assetProfiles(result.item, publicOrigin(req))
    });
  }
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
      match: result.item.icon.match || null,
      assets: `/api/assets?q=${encodeURIComponent(result.item.name)}`
    });
  }

  if (url.pathname.startsWith("/manifest/") && url.pathname.endsWith(".webmanifest")) {
    const raw = decodeURIComponent(url.pathname.replace(/^\/manifest\//, "").replace(/\.webmanifest$/, ""));
    const result = resolveIcon(raw);
    if (!result.matched) return sendJson(res, 404, { matched: false, query: raw });
    res.writeHead(200, {
      "content-type": "application/manifest+json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=3600"
    });
    return res.end(`${JSON.stringify(webManifest(result.item), null, 2)}\n`);
  }

  if (url.pathname.startsWith("/assets/apple/") && url.pathname.endsWith("/Contents.json")) {
    const raw = decodeURIComponent(url.pathname.replace(/^\/assets\/apple\//, "").replace(/\.imageset\/Contents\.json$/, ""));
    const result = resolveIcon(raw);
    if (!result.matched) return sendJson(res, 404, { matched: false, query: raw });
    return sendJson(res, 200, xcodeImageSetContents(result.item));
  }

  if (url.pathname.startsWith("/assets/apple/") && url.pathname.endsWith(".svg")) {
    const match = url.pathname.match(/^\/assets\/apple\/([^/]+)\.imageset\/([^/]+\.svg)$/);
    const raw = decodeURIComponent(match?.[1] || "");
    const filename = decodeURIComponent(match?.[2] || "");
    const result = resolveIcon(raw);
    if (!result.matched || filename !== `${result.item.id}.svg`) {
      res.writeHead(404);
      return res.end("Not found");
    }
    const file = path.join(root, result.item.icon.path);
    return sendFile(res, file, "image/svg+xml; charset=utf-8");
  }

  if (url.pathname.startsWith("/assets/android/") && url.pathname.endsWith(".xml")) {
    const match = url.pathname.match(/^\/assets\/android\/([^/]+)\/(.+)$/);
    const raw = decodeURIComponent(match?.[1] || "");
    const file = match?.[2] || "";
    const result = resolveIcon(raw);
    if (!result.matched) return sendJson(res, 404, { matched: false, query: raw });
    if (
      file !== "mipmap-anydpi-v26/ic_launcher.xml" &&
      file !== "drawable/ic_launcher_foreground.xml" &&
      file !== "drawable/ic_launcher_monochrome.xml"
    ) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200, {
      "content-type": "application/xml; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=3600"
    });
    if (file === "mipmap-anydpi-v26/ic_launcher.xml") {
      return res.end(androidAdaptiveIconXml(result.item));
    }
    return res.end(androidVectorPlaceholderXml(result.item));
  }

  if (url.pathname.startsWith("/assets/icons/")) {
    const raw = decodeURIComponent(path.basename(url.pathname, ".svg"));
    const directFile = path.resolve(root, `.${url.pathname}`);
    const result = resolveIcon(raw);
    const file =
      fs.existsSync(directFile) && isInside(directFile, iconRoot)
        ? directFile
        : result.matched
          ? path.resolve(root, result.item.icon.path)
          : null;
    if (!file || !isInside(file, iconRoot) || !fs.existsSync(file)) {
      res.writeHead(404);
      return res.end("Not found");
    }
    return sendFile(res, file, "image/svg+xml; charset=utf-8");
  }

  if (url.pathname.startsWith("/assets/raster/")) {
    const parts = url.pathname.split("/").filter(Boolean);
    const raw = decodeURIComponent(parts[2] || "");
    const rest = parts.slice(3).map((part) => decodeURIComponent(part));
    const directFile = path.resolve(root, `.${url.pathname}`);
    const result = resolveIcon(raw);
    const file =
      fs.existsSync(directFile) && isInside(directFile, rasterRoot)
        ? directFile
        : result.matched
          ? path.resolve(rasterRoot, result.item.id, ...rest)
          : null;
    if (!file || !isInside(file, rasterRoot) || !fs.existsSync(file)) {
      res.writeHead(404);
      return res.end("Not found");
    }
    const isJson = file.endsWith(".json");
    res.writeHead(200, {
      "content-type": isJson ? "application/json; charset=utf-8" : "image/png",
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
