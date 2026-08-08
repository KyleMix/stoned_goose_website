// Serve the static export the way the managed hosts do, so header and
// redirect behavior can be checked with curl before deploying.
//
// Why this exists: several things in this repo are only correct once a real
// HTTP response comes back. Extensionless OG image routes need image/png, and
// /.well-known/apple-app-site-association needs application/json with no
// redirect in front of it or iOS rejects the domain. Those rules live in
// public/_headers (Cloudflare, Netlify), are mirrored in vercel.json, and are
// mirrored again in deploy/nginx/site.conf. "The file is in out/" and "the file
// is served correctly" are different claims, and only the second one counts.
//
// This server reads public/_headers and public/_redirects directly rather than
// restating them, so what you curl is the rule as written. It is a local
// approximation of the hosts, not the hosts themselves: treat a pass here as
// "the rule matches the path", and confirm against the real deployment after
// it ships.
//
// Run: npm run serve:out -- [port]   (default 8788)

import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "out");
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 8788);

if (!existsSync(ROOT)) {
  console.error(`[serve-out] ${ROOT} does not exist. Run npm run build first.`);
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
  ".ics": "text/calendar; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".wasm": "application/wasm",
};

// A Cloudflare / Netlify _headers pattern. `*` spans slashes, matching the
// comment in public/_headers and the nested opengraph-image routes it covers.
function globToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\?]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\*/g, ".*")}$`);
}

function parseHeaders(file) {
  if (!existsSync(file)) return [];
  const rules = [];
  let current = null;
  for (const raw of readFileSync(file, "utf8").split("\n")) {
    if (raw.trim() === "" || raw.trimStart().startsWith("#")) continue;
    if (!/^\s/.test(raw)) {
      current = { test: globToRegExp(raw.trim()), headers: [] };
      rules.push(current);
      continue;
    }
    const at = raw.indexOf(":");
    if (current && at !== -1) {
      current.headers.push([raw.slice(0, at).trim(), raw.slice(at + 1).trim()]);
    }
  }
  return rules;
}

function parseRedirects(file) {
  if (!existsSync(file)) return [];
  const rules = [];
  for (const raw of readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;
    const [from, to, code] = line.split(/\s+/);
    if (from && to) rules.push({ from, to, code: Number(code) || 301 });
  }
  return rules;
}

const headerRules = parseHeaders(join(process.cwd(), "public", "_headers"));
const redirectRules = parseRedirects(join(process.cwd(), "public", "_redirects"));

// Mirrors Next's trailingSlash: false export layout and the try_files chain in
// deploy/nginx/site.conf.
function resolveFile(pathname) {
  const rel = decodeURIComponent(pathname).replace(/^\/+/, "");
  const candidates = rel === ""
    ? ["index.html"]
    : [rel, join(rel, "index.html"), `${rel}.html`];
  for (const candidate of candidates) {
    const abs = join(ROOT, candidate);
    if (!abs.startsWith(ROOT)) continue;
    if (existsSync(abs) && statSync(abs).isFile()) return abs;
  }
  return null;
}

const server = createServer((req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;

  const redirect = redirectRules.find((r) => r.from === pathname);
  if (redirect) {
    res.writeHead(redirect.code, { Location: redirect.to });
    res.end();
    return;
  }

  const file = resolveFile(pathname);
  if (!file) {
    const notFound = join(ROOT, "404.html");
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    if (existsSync(notFound)) createReadStream(notFound).pipe(res);
    else res.end("Not found");
    return;
  }

  // Extension first, then anything _headers says, which is what lets an
  // extensionless file be served as JSON or PNG.
  const headers = {
    "Content-Type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream",
    "Content-Length": statSync(file).size,
  };
  for (const rule of headerRules) {
    if (!rule.test.test(pathname)) continue;
    for (const [key, value] of rule.headers) headers[key] = value;
  }

  res.writeHead(200, headers);
  if (req.method === "HEAD") res.end();
  else createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`[serve-out] ${ROOT} on http://localhost:${PORT}`);
  console.log(`[serve-out] ${headerRules.length} header rule(s), ${redirectRules.length} redirect(s) loaded`);
});
