// The open mic sign up API.
//
// This site is a Next.js static export and stays one: there is no server
// build, no Next adapter, no SSR. What this file adds is a hand written
// Worker sitting in front of the same static assets, answering three routes
// under /api/open-mic and nothing else. Every other path is served from /out
// exactly as before (see `assets.run_worker_first` in wrangler.jsonc, which
// scopes the Worker to /api/*).
//
//   GET  /api/open-mic/slots   public. Counts per Monday. Never names.
//   POST /api/open-mic/signup  public. Takes one spot.
//   GET  /api/open-mic/export  private. The full list as CSV, token gated.
//
// Privacy is the design constraint, not a feature. The room wants comics to
// see how full a night is without seeing who booked it, so the shape of the
// public response is a count and there is no endpoint that will return a name
// without the export token. That is enforced here rather than in the page,
// because a client side filter is not a privacy boundary.
//
// The scheduled handler runs nightly and deletes the rows for any Monday that
// has dropped out of the four week window.

import {
  MIC_SLOT_COUNT,
  MIC_SPOT_MINUTES,
  isMicDateOpen,
  micWindow,
} from "../lib/open-mic-schedule";

interface Env {
  /** D1 binding. See worker/schema.sql. */
  DB: D1Database;
  /** Static assets binding, /out. */
  ASSETS: Fetcher;
  /** Shared secret for GET /api/open-mic/export. Set with `wrangler secret put`. */
  OPEN_MIC_EXPORT_TOKEN?: string;
  /** Comma separated origins allowed to POST a sign up. */
  OPEN_MIC_ALLOWED_ORIGINS?: string;
}

// Field limits. Generous enough for real names and short enough that the
// export stays a spreadsheet rather than somewhere to paste a payload.
const MAX_NAME = 80;
const MAX_EMAIL = 254; // RFC 5321 maximum path length.
const MAX_INSTAGRAM = 30; // Instagram's own limit.

// Instagram allows letters, digits, periods and underscores.
const INSTAGRAM = /^[A-Za-z0-9._]{1,30}$/;

// Deliberately loose. The Worker is not the authority on whether an address
// exists, only on whether it is worth storing, and a strict pattern rejects
// valid addresses far more often than it catches a typo.
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/**
 * The time trap from components/contact-form.tsx, re-checked server side.
 *
 * The client refuses to submit faster than this, but a client side check only
 * stops the bots that run the page's own JavaScript. The number arrives in the
 * payload, so it is trivially forgeable, which is the point: a bot that lies
 * about it has to know to lie about it.
 */
const MIN_FILL_MS = 2500;

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  // Availability is the one number on the page that must never be stale, and
  // a cached 200 would show a full night as open.
  "Cache-Control": "no-store",
};

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extra },
  });
}

function fieldError(message: string, field?: string) {
  return json({ error: message, field }, 400);
}

/** Collapses whitespace and trims. CMS and form input both arrive dirty. */
function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

/**
 * Same origin only for the write path.
 *
 * The page and the API are served from one hostname, so a sign up POST never
 * legitimately carries a foreign Origin. Checking it costs nothing and closes
 * the drive-by case where someone else's page posts the form on a visitor's
 * behalf. A missing Origin is allowed through: curl sends none, and so do a
 * few privacy extensions on same origin requests.
 *
 * The rule is "same host as the request that arrived", and
 * OPEN_MIC_ALLOWED_ORIGINS only ever ADDS to that. It used to replace it, and
 * that was wrong in the one way that matters: setting the secret to the
 * canonical `https://www.` origin locked out every other hostname the same
 * Worker legitimately answers on, so a comic on the apex domain, on a preview
 * URL, or on workers.dev got "Sign ups only work from the site itself" while
 * standing on the real site. Same-host is also the stronger of the two checks,
 * since it cannot drift out of date the way a hand-maintained list does.
 *
 * Hosts are compared, not whole origin strings, so a trailing slash or a
 * scheme mismatch in a configured value is not a lockout. The scheme is not
 * part of the comparison because this site is https end to end behind
 * Cloudflare, and an http Origin is a redirect away from being the same site
 * rather than a different one.
 */
function originAllowed(request: Request, env: Env): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  if (originHost === new URL(request.url).host) return true;

  return (env.OPEN_MIC_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .some((allowed) => {
      try {
        return new URL(allowed).host === originHost;
      } catch {
        // Configured bare, as a hostname rather than an origin.
        return allowed === originHost;
      }
    });
}

/** Constant time string compare, so a wrong token leaks no length or prefix. */
function secretsMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// --------------------------------------------------------------- GET slots

/**
 * Counts for the four Mondays currently on the list.
 *
 * Rows outside the window are filtered out here as well as deleted nightly.
 * If the cron fails or is paused, a stale Monday still cannot appear on the
 * page, because the window is recomputed on every request and the query only
 * asks about the dates in it.
 */
async function handleSlots(env: Env): Promise<Response> {
  const window = micWindow();
  const placeholders = window.map(() => "?").join(", ");

  const counts = await env.DB.prepare(
    `SELECT mic_date, COUNT(*) AS taken
       FROM signups
      WHERE mic_date IN (${placeholders})
      GROUP BY mic_date`,
  )
    .bind(...window)
    .all<{ mic_date: string; taken: number }>();

  const taken = new Map(counts.results.map((r) => [r.mic_date, r.taken]));

  return json({
    slotCount: MIC_SLOT_COUNT,
    spotMinutes: MIC_SPOT_MINUTES,
    dates: window.map((date) => {
      const used = Math.min(taken.get(date) ?? 0, MIC_SLOT_COUNT);
      return { date, taken: used, remaining: MIC_SLOT_COUNT - used };
    }),
  });
}

// -------------------------------------------------------------- POST signup

type SignupBody = {
  date?: unknown;
  name?: unknown;
  email?: unknown;
  instagram?: unknown;
  /** Honeypot. Any value means a bot filled a field no person can see. */
  honey?: unknown;
  /** Milliseconds between form mount and submit, per MIN_FILL_MS. */
  elapsedMs?: unknown;
};

async function handleSignup(request: Request, env: Env): Promise<Response> {
  if (!originAllowed(request, env)) {
    return json({ error: "Sign ups only work from the site itself." }, 403);
  }

  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return fieldError("That did not arrive as a sign up.");
  }

  // Spam checks first, and both answer 200 with a fake confirmation. Telling a
  // bot which check caught it just teaches the next one, and a comic who is
  // somehow caught by the time trap sees the same screen as a comic who is
  // not, then finds their name missing and emails us. That is the better
  // failure than an error page nobody can act on.
  const honey = typeof body.honey === "string" ? body.honey.trim() : "";
  const elapsed = typeof body.elapsedMs === "number" ? body.elapsedMs : Infinity;
  if (honey !== "" || elapsed < MIN_FILL_MS) {
    return json({ ok: true, slot: null, discarded: true });
  }

  const date = typeof body.date === "string" ? body.date.trim() : "";
  const name = clean(body.name, MAX_NAME);
  const email = clean(body.email, MAX_EMAIL).toLowerCase();
  // A handle pasted as "@goose", "instagram.com/goose", the full
  // "https://www.instagram.com/goose/", or bare. All of them land as "goose",
  // so the per night uniqueness check sees one spelling. Mirrors the same
  // normalisation in lib/form-schemas.ts, and runs even when that one is
  // skipped by posting directly.
  const instagram = clean(body.instagram, MAX_EMAIL)
    .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, "")
    .replace(/^@+/, "")
    .replace(/\/+$/, "")
    .slice(0, MAX_INSTAGRAM);

  if (!isMicDateOpen(date)) {
    return fieldError("That Monday is not on the list right now.", "date");
  }
  if (name.length < 2) {
    return fieldError("Name is required.", "name");
  }
  if (!EMAIL.test(email)) {
    return fieldError("Use a real email.", "email");
  }
  if (!INSTAGRAM.test(instagram)) {
    return fieldError(
      "Instagram handle is letters, numbers, periods and underscores.",
      "instagram",
    );
  }

  const createdAt = new Date().toISOString();

  // Read the taken slots, pick the lowest free one, insert. The UNIQUE
  // constraints in worker/schema.sql are what actually make this safe: if
  // another sign up claims the same slot between the read and the write, the
  // INSERT fails and the loop reads again. Three attempts is ample for twelve
  // slots and a room's worth of traffic, and failing closed after that is
  // better than handing out a duplicate running order.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const rows = await env.DB.prepare(
      `SELECT slot, email FROM signups WHERE mic_date = ?`,
    )
      .bind(date)
      .all<{ slot: number; email: string }>();

    if (rows.results.some((r) => r.email === email)) {
      return json(
        {
          error: "That email already has a spot for this Monday.",
          field: "email",
        },
        409,
      );
    }

    const used = new Set(rows.results.map((r) => r.slot));
    if (used.size >= MIC_SLOT_COUNT) {
      return json({ error: "That Monday is full.", full: true }, 409);
    }

    let slot = 1;
    while (used.has(slot)) slot += 1;

    try {
      await env.DB.prepare(
        `INSERT INTO signups (id, mic_date, slot, name, email, instagram, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(crypto.randomUUID(), date, slot, name, email, instagram, createdAt)
        .run();

      return json({
        ok: true,
        date,
        slot,
        slotCount: MIC_SLOT_COUNT,
        remaining: MIC_SLOT_COUNT - (used.size + 1),
      });
    } catch (error) {
      // UNIQUE (mic_date, email) means a duplicate raced us rather than a slot
      // collision, and retrying would only hit it again.
      const message = String(error);
      if (message.includes("signups.mic_date, signups.email")) {
        return json(
          {
            error: "That email already has a spot for this Monday.",
            field: "email",
          },
          409,
        );
      }
      if (!message.includes("UNIQUE")) throw error;
      // Slot collision. Loop and read the taken slots again.
    }
  }

  return json(
    { error: "The list was busy. Try that once more." },
    503,
    { "Retry-After": "2" },
  );
}

// -------------------------------------------------------------- GET export

function csvCell(value: string): string {
  // Leading =, +, - or @ makes a spreadsheet treat a cell as a formula, and
  // this table is full of Instagram handles and names typed by strangers.
  // Prefixing an apostrophe keeps the value readable and inert.
  const guarded = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${guarded.replace(/"/g, '""')}"`;
}

/**
 * The whole current list as CSV, running order included.
 *
 * Token gated, and the token is accepted from either the Authorization header
 * or a `token` query parameter. The query form exists so the export is a link
 * that can be opened from a phone on a Monday afternoon, which is when it is
 * actually needed. The tradeoff is real: a URL with a secret in it lands in
 * browser history and in any proxy log on the path. It is a read only list
 * that is deleted weekly, the token is rotatable with one `wrangler secret
 * put`, and the alternative is a login screen this site has no server to host.
 */
async function handleExport(request: Request, env: Env): Promise<Response> {
  const expected = env.OPEN_MIC_EXPORT_TOKEN;
  if (!expected) {
    return json({ error: "Export is not configured." }, 503);
  }

  const url = new URL(request.url);
  const header = request.headers.get("Authorization") ?? "";
  const supplied = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : (url.searchParams.get("token") ?? "");

  if (!supplied || !secretsMatch(supplied, expected)) {
    return json({ error: "Not authorised." }, 401, {
      "WWW-Authenticate": 'Bearer realm="open-mic-export"',
    });
  }

  const window = micWindow();
  const placeholders = window.map(() => "?").join(", ");

  // `date` narrows the export to one Monday, which is the running order for
  // the night. Without it you get all four.
  const wanted = url.searchParams.get("date");
  const dates = wanted && window.includes(wanted) ? [wanted] : window;
  const filter = wanted && window.includes(wanted) ? "?" : placeholders;

  const rows = await env.DB.prepare(
    `SELECT mic_date, slot, name, email, instagram, created_at
       FROM signups
      WHERE mic_date IN (${filter})
      ORDER BY mic_date ASC, slot ASC`,
  )
    .bind(...dates)
    .all<{
      mic_date: string;
      slot: number;
      name: string;
      email: string;
      instagram: string;
      created_at: string;
    }>();

  const lines = ["Monday,Slot,Name,Email,Instagram,Signed up"];
  for (const r of rows.results) {
    lines.push(
      [
        csvCell(r.mic_date),
        String(r.slot),
        csvCell(r.name),
        csvCell(r.email),
        // Bare, without the "@". The column header says Instagram, so the
        // sigil is redundant, and every handle starting with "@" would
        // otherwise trip the formula guard below and put an apostrophe in
        // front of all twelve rows every week.
        csvCell(r.instagram),
        csvCell(r.created_at),
      ].join(","),
    );
  }

  const filename = `log-cabin-open-mic-${dates[0]}${
    dates.length > 1 ? `-to-${dates[dates.length - 1]}` : ""
  }.csv`;

  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      // The response contains personal data. Keep it out of every index and
      // out of any referrer sent onward.
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
    },
  });
}

// ------------------------------------------------------------------- purge

/**
 * Delete everything for a Monday that has fallen out of the window.
 *
 * Driven by micWindow() rather than by its own date arithmetic, so "the
 * previous one is deleted the night before" cannot drift away from what the
 * page is showing: the moment a Monday stops being on the list, the next run
 * of this deletes its rows.
 */
async function purgePastSignups(env: Env): Promise<number> {
  const [windowStart] = micWindow();
  const result = await env.DB.prepare(`DELETE FROM signups WHERE mic_date < ?`)
    .bind(windowStart)
    .run();
  return result.meta.changes;
}

// ------------------------------------------------------------------- routes

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // wrangler.jsonc routes only /api/* here. Anything else arriving is a
    // config change, and the right answer is still the static site.
    if (!url.pathname.startsWith("/api/open-mic")) {
      return env.ASSETS.fetch(request);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { Allow: "GET, POST, OPTIONS" },
      });
    }

    try {
      if (url.pathname === "/api/open-mic/slots" && request.method === "GET") {
        return await handleSlots(env);
      }
      if (url.pathname === "/api/open-mic/signup" && request.method === "POST") {
        // Opportunistic purge, so the list stays correct through a week when
        // the cron trigger is paused or the account's cron quota is spent.
        // waitUntil keeps it off the comic's response time.
        ctx.waitUntil(purgePastSignups(env).catch(() => 0));
        return await handleSignup(request, env);
      }
      if (url.pathname === "/api/open-mic/export" && request.method === "GET") {
        return await handleExport(request, env);
      }
    } catch (error) {
      // The message can carry SQL and column names. Log it, return nothing.
      console.error("open-mic api", error);
      return json({ error: "The sign up list is having a moment." }, 500);
    }

    return json({ error: "No such endpoint." }, 404);
  },

  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      purgePastSignups(env)
        .then((deleted) => {
          if (deleted > 0) console.log(`open-mic purge: ${deleted} rows`);
        })
        .catch((error) => console.error("open-mic purge", error)),
    );
  },
};
