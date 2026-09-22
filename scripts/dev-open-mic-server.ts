// Local click-through harness for /open-mics.
//
// Serves the built /out directory and answers /api/open-mic/* with the REAL
// worker/index.ts handler backed by an in-memory table. There is no way to run
// the sign up board locally otherwise: `next dev` has no /api route (this is a
// static export) and the Worker needs a D1 binding.
//
// Not part of the build or the test suite. Run it by hand:
//   npm run build && npx tsx scripts/dev-open-mic-server.ts
// then open http://127.0.0.1:4321/open-mics
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import worker from "../worker/index";
// The same stub the Worker tests drive, so this harness cannot fall behind
// the queries the Worker actually issues.
import { FakeD1 } from "./fake-d1";

const db = new FakeD1();

const OUT = join(process.cwd(), "out");
const PORT = Number(process.env.PORT ?? 4321);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml",
};

const env = {
  DB: db,
  ASSETS: { fetch: async () => new Response("not found", { status: 404 }) },
  OPEN_MIC_EXPORT_TOKEN: "local-dev-token",
  OPEN_MIC_HOST_TOKEN: "local-host-token",
  // No RESEND_API_KEY on purpose. Local sign ups must not send real email to
  // whatever address somebody types while clicking around.
} as never;

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);

  // Local only, and deliberately not a Worker route. The cancel and removal
  // tokens are never exposed by any API: they reach a person through their
  // confirmation email and nowhere else. No email is sent locally, so without
  // this there is no way to click through those two pages by hand.
  if (url.pathname === "/__dev/tokens") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        {
          signups: db.rows.map((r) => ({
            date: r.mic_date,
            slot: r.slot,
            name: r.name,
            cancelUrl: `/open-mics/cancel?t=${r.cancel_token}`,
          })),
          comedians: db.comedians.map((c) => ({
            email: c.email,
            removed: Boolean(c.removed_at),
            unsubscribeUrl: `/open-mics/unsubscribe?t=${c.unsubscribe_token}`,
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const request = new Request(`http://127.0.0.1:${PORT}${req.url}`, {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: chunks.length ? Buffer.concat(chunks) : undefined,
    });
    const response = await worker.fetch(request, env, {
      waitUntil: (p: Promise<unknown>) => void p.catch(() => {}),
      passThroughOnException: () => {},
    } as never);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
    return;
  }

  for (const candidate of [url.pathname, `${url.pathname}.html`, join(url.pathname, "index.html")]) {
    const path = join(OUT, candidate);
    try {
      if (!(await stat(path)).isFile()) continue;
      res.writeHead(200, { "Content-Type": TYPES[extname(path)] ?? "application/octet-stream" });
      res.end(await readFile(path));
      return;
    } catch { /* try the next shape */ }
  }
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end(await readFile(join(OUT, "404.html")).catch(() => "not found"));
}).listen(PORT, () => console.log(
    `open-mic dev server\n`
      + `  board:     http://127.0.0.1:${PORT}/open-mics\n`
      + `  host view: http://127.0.0.1:${PORT}/open-mics/run-of-show?token=local-host-token\n`
      + `  export:    http://127.0.0.1:${PORT}/api/open-mic/export?token=local-dev-token\n`
      + `  roster:    http://127.0.0.1:${PORT}/api/open-mic/roster?token=local-dev-token`,
  ));
