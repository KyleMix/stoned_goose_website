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

const OUT = join(process.cwd(), "out");
const PORT = Number(process.env.PORT ?? 4321);

type Row = Record<string, unknown>;
const rows: Row[] = [];

const db = {
  prepare(sql: string) {
    const q = sql.replace(/\s+/g, " ").trim();
    let bound: unknown[] = [];
    const stmt = {
      bind(...v: unknown[]) { bound = v; return stmt; },
      async all() { return { results: select(q, bound), success: true, meta: { changes: 0, duration: 0 } }; },
      async first() { return select(q, bound)[0] ?? null; },
      async run() { return { results: [], success: true, meta: { changes: write(q, bound), duration: 0 } }; },
    };
    return stmt;
  },
};

function select(q: string, bound: unknown[]): Row[] {
  if (q.startsWith("SELECT mic_date, COUNT(*)")) {
    const counts = new Map<string, number>();
    for (const r of rows) {
      if ((bound as string[]).includes(r.mic_date as string)) {
        counts.set(r.mic_date as string, (counts.get(r.mic_date as string) ?? 0) + 1);
      }
    }
    return [...counts].map(([mic_date, taken]) => ({ mic_date, taken }));
  }
  if (q.startsWith("SELECT slot, email")) {
    return rows.filter((r) => r.mic_date === bound[0]).map((r) => ({ slot: r.slot, email: r.email }));
  }
  if (q.startsWith("SELECT mic_date, slot, name")) {
    return rows
      .filter((r) => (bound as string[]).includes(r.mic_date as string))
      .sort((a, b) => String(a.mic_date).localeCompare(String(b.mic_date)) || Number(a.slot) - Number(b.slot));
  }
  throw new Error(`unhandled select: ${q}`);
}

function write(q: string, bound: unknown[]): number {
  if (q.startsWith("INSERT INTO signups")) {
    const [id, mic_date, slot, name, email, instagram, created_at] = bound as string[];
    if (rows.some((r) => r.mic_date === mic_date && r.slot === Number(slot))) {
      throw new Error("UNIQUE constraint failed: signups.mic_date, signups.slot");
    }
    if (rows.some((r) => r.mic_date === mic_date && r.email === email)) {
      throw new Error("UNIQUE constraint failed: signups.mic_date, signups.email");
    }
    rows.push({ id, mic_date, slot: Number(slot), name, email, instagram, created_at });
    return 1;
  }
  if (q.startsWith("DELETE FROM signups WHERE mic_date <")) {
    const before = rows.length;
    const kept = rows.filter((r) => String(r.mic_date) >= String(bound[0]));
    rows.length = 0;
    rows.push(...kept);
    return before - rows.length;
  }
  throw new Error(`unhandled write: ${q}`);
}

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
} as never;

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);

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
}).listen(PORT, () => console.log(`open-mic dev server: http://127.0.0.1:${PORT}/open-mics`));
