// Exercises worker/index.ts, the open mic sign up API.
//
// This Worker is the one piece of the feature that cannot be clicked through
// locally: it needs a D1 binding, and it is also the piece where a mistake is
// expensive rather than ugly. The two things it must never get wrong are the
// cap (a thirteenth comic on a twelve spot night, or two comics holding spot
// 7) and the privacy rule (a name reachable without the export token). Neither
// is visible in review by reading the SQL.
//
// So the handler is driven here against an in-memory stand-in for D1 that
// enforces the same UNIQUE constraints worker/schema.sql declares. The stub
// recognises the five queries the Worker issues and nothing else: a new query
// makes it throw rather than silently return an empty result, which is what
// keeps this honest as the Worker changes.
//
// Dates come from micWindow() rather than being written in, so this test does
// not start failing on the Tuesday after it was written.
//
// Run via `npm test`.

import worker from "../../worker/index";
import { MIC_SLOT_COUNT, addDays, micWindow } from "../../lib/open-mic-schedule";

let failures = 0;
let checks = 0;

function assert(cond: boolean, message: string) {
  checks += 1;
  if (cond) return;
  failures += 1;
  console.error(`  ✗ ${message}`);
}

function eq(actual: unknown, expected: unknown, message: string) {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${message}\n      got:      ${JSON.stringify(actual)}\n      expected: ${JSON.stringify(expected)}`,
  );
}

// ------------------------------------------------------------- the D1 stub

type Row = {
  id: string;
  mic_date: string;
  slot: number;
  name: string;
  email: string;
  instagram: string;
  created_at: string;
};

/**
 * Enough of D1 to run the Worker, and no more.
 *
 * The UNIQUE constraints are the point of this stub. They are what makes the
 * Worker's retry loop testable: without them the read-then-write would look
 * correct and a race would hand out a duplicate slot in production.
 */
class FakeD1 {
  rows: Row[] = [];
  /** Queries seen, so a test can assert the Worker never asked for names. */
  queries: string[] = [];

  prepare(sql: string) {
    this.queries.push(sql.replace(/\s+/g, " ").trim());
    const db = this;
    let bound: unknown[] = [];

    const stmt = {
      bind(...values: unknown[]) {
        bound = values;
        return stmt;
      },
      async all<T>() {
        return { results: db.run_select(sql, bound) as T[], success: true, meta: { changes: 0, duration: 0 } };
      },
      async first<T>() {
        return (db.run_select(sql, bound)[0] ?? null) as T | null;
      },
      async run() {
        const changes = db.run_write(sql, bound);
        return { results: [], success: true, meta: { changes, duration: 0 } };
      },
    };
    return stmt;
  }

  private run_select(sql: string, bound: unknown[]): Record<string, unknown>[] {
    const q = sql.replace(/\s+/g, " ").trim();

    // handleSlots: counts per Monday.
    if (q.startsWith("SELECT mic_date, COUNT(*)")) {
      const dates = bound as string[];
      const counts = new Map<string, number>();
      for (const r of this.rows) {
        if (dates.includes(r.mic_date)) {
          counts.set(r.mic_date, (counts.get(r.mic_date) ?? 0) + 1);
        }
      }
      return [...counts].map(([mic_date, taken]) => ({ mic_date, taken }));
    }

    // handleSignup: which slots and emails are taken for one Monday.
    if (q.startsWith("SELECT slot, email")) {
      const [date] = bound as string[];
      return this.rows
        .filter((r) => r.mic_date === date)
        .map((r) => ({ slot: r.slot, email: r.email }));
    }

    // handleExport: the full list.
    if (q.startsWith("SELECT mic_date, slot, name")) {
      const dates = bound as string[];
      return this.rows
        .filter((r) => dates.includes(r.mic_date))
        .sort((a, b) => a.mic_date.localeCompare(b.mic_date) || a.slot - b.slot)
        .map((r) => ({
          mic_date: r.mic_date,
          slot: r.slot,
          name: r.name,
          email: r.email,
          instagram: r.instagram,
          created_at: r.created_at,
        }));
    }

    throw new Error(`FakeD1: unhandled SELECT: ${q}`);
  }

  private run_write(sql: string, bound: unknown[]): number {
    const q = sql.replace(/\s+/g, " ").trim();

    if (q.startsWith("INSERT INTO signups")) {
      const [id, mic_date, slot, name, email, instagram, created_at] = bound as [
        string, string, number, string, string, string, string,
      ];
      // The two UNIQUE constraints from worker/schema.sql, with the error text
      // SQLite actually produces, because the Worker branches on it.
      if (this.rows.some((r) => r.mic_date === mic_date && r.slot === slot)) {
        throw new Error(
          "D1_ERROR: UNIQUE constraint failed: signups.mic_date, signups.slot",
        );
      }
      if (this.rows.some((r) => r.mic_date === mic_date && r.email === email)) {
        throw new Error(
          "D1_ERROR: UNIQUE constraint failed: signups.mic_date, signups.email",
        );
      }
      this.rows.push({ id, mic_date, slot, name, email, instagram, created_at });
      return 1;
    }

    if (q.startsWith("DELETE FROM signups WHERE mic_date <")) {
      const [cutoff] = bound as string[];
      const before = this.rows.length;
      this.rows = this.rows.filter((r) => r.mic_date >= cutoff);
      return before - this.rows.length;
    }

    throw new Error(`FakeD1: unhandled write: ${q}`);
  }
}

const ORIGIN = "https://www.stonedgooseproductions.com";
const EXPORT_TOKEN = "test-token-0123456789";

/** Mirrors the Env interface in worker/index.ts, secrets optional. */
type TestEnv = {
  DB: D1Database;
  ASSETS: Fetcher;
  OPEN_MIC_EXPORT_TOKEN?: string;
  OPEN_MIC_ALLOWED_ORIGINS?: string;
};

function makeEnv(db: FakeD1): TestEnv {
  return {
    DB: db as unknown as D1Database,
    ASSETS: {
      fetch: async () => new Response("static asset", { status: 200 }),
    } as unknown as Fetcher,
    OPEN_MIC_EXPORT_TOKEN: EXPORT_TOKEN,
    OPEN_MIC_ALLOWED_ORIGINS: ORIGIN,
  };
}

/** waitUntil runs inline so the opportunistic purge is observable. */
function makeCtx(pending: Promise<unknown>[]) {
  return {
    waitUntil: (p: Promise<unknown>) => void pending.push(p),
    passThroughOnException: () => {},
  } as unknown as ExecutionContext;
}

type Call = { db: FakeD1; env: ReturnType<typeof makeEnv>; pending: Promise<unknown>[] };

function fresh(): Call {
  const db = new FakeD1();
  return { db, env: makeEnv(db), pending: [] };
}

async function hit(
  call: Call,
  path: string,
  init: RequestInit & { origin?: string | null } = {},
) {
  const { origin = ORIGIN, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (origin) headers.set("Origin", origin);
  const request = new Request(`${ORIGIN}${path}`, { ...rest, headers });
  const response = await worker.fetch(request, call.env, makeCtx(call.pending));
  await Promise.all(call.pending);
  call.pending.length = 0;
  return response;
}

function signup(
  call: Call,
  body: Record<string, unknown>,
  init: RequestInit & { origin?: string | null } = {},
) {
  return hit(call, "/api/open-mic/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Past the time trap unless a test overrides it.
    body: JSON.stringify({ elapsedMs: 9000, ...body }),
    ...init,
  });
}

const window = micWindow();
const [monday, secondMonday] = window;
const pastMonday = addDays(monday, -7);
const beyondWindow = addDays(window[window.length - 1], 7);

// Top-level await needs an ES module and this repo's scripts run as CJS under
// tsx, so the cases live in main() rather than at file scope.
async function main() {
// ----------------------------------------------------------------- routing

{
  const call = fresh();
  const response = await hit(call, "/shows");
  eq(response.status, 200, "a non-API path falls through to static assets");
  eq(await response.text(), "static asset", "and is served by the assets binding");

  const missing = await hit(call, "/api/open-mic/nope");
  eq(missing.status, 404, "an unknown API path is a 404");

  const wrongMethod = await hit(call, "/api/open-mic/slots", { method: "POST" });
  eq(wrongMethod.status, 404, "POSTing the read-only slots route is not a route");
}

// ------------------------------------------------------------------- slots

{
  const call = fresh();
  const response = await hit(call, "/api/open-mic/slots");
  eq(response.status, 200, "slots answers 200");
  eq(
    response.headers.get("Cache-Control"),
    "no-store",
    "availability must never be cached",
  );

  const body = (await response.json()) as {
    slotCount: number;
    spotMinutes: number;
    dates: { date: string; taken: number; remaining: number }[];
  };
  eq(body.slotCount, MIC_SLOT_COUNT, "slots reports the cap");
  eq(body.spotMinutes, 8, "slots reports the spot length");
  eq(body.dates.map((d) => d.date), window, "slots lists exactly the window");
  eq(
    body.dates.every((d) => d.taken === 0 && d.remaining === MIC_SLOT_COUNT),
    true,
    "an empty list is all spots open",
  );

  // The privacy rule, asserted against the SQL rather than the response: the
  // public endpoint must not even ask the database for a name.
  const readNames = call.db.queries.some(
    (q) => /SELECT[^;]*\bname\b/.test(q) || /SELECT[^;]*\bemail\b/.test(q),
  );
  assert(!readNames, "the public slots query must not select names or emails");
}

// -------------------------------------------------------- a real sign up

{
  const call = fresh();
  const response = await signup(call, {
    date: monday,
    name: "Jess Everett",
    email: "Jess@Example.COM",
    instagram: "@jess.everett",
  });
  eq(response.status, 200, "a valid sign up is accepted");
  const body = (await response.json()) as { slot: number; remaining: number };
  eq(body.slot, 1, "the first comic gets spot 1");
  eq(body.remaining, MIC_SLOT_COUNT - 1, "and the remaining count drops by one");

  const [row] = call.db.rows;
  eq(row.email, "jess@example.com", "the email is lowercased on the way in");
  eq(row.instagram, "jess.everett", "the leading @ is stripped");
  eq(row.name, "Jess Everett", "the name is stored as typed");

  // Slots are handed out in order, and the response never leaks who has them.
  const second = await signup(call, {
    date: monday,
    name: "Min Lin",
    email: "min@example.com",
    instagram: "https://instagram.com/minlin/",
  });
  const secondBody = (await second.json()) as { slot: number };
  eq(secondBody.slot, 2, "the second comic gets spot 2");
  eq(
    call.db.rows[1].instagram,
    "minlin",
    "a pasted profile URL is normalised to a handle",
  );

  // The same handle, spelled every way a comic might paste it. All of them
  // have to reach the database as one string, or the per-night duplicate
  // check is decorative.
  const spellings = [
    "goose",
    "@goose",
    "  @goose  ",
    "instagram.com/goose",
    "www.instagram.com/goose",
    "https://instagram.com/goose",
    "https://www.instagram.com/goose/",
    "HTTPS://WWW.INSTAGRAM.COM/goose",
  ];
  for (const [i, spelling] of spellings.entries()) {
    const one = fresh();
    const res = await signup(one, {
      date: monday,
      name: "Goose Comic",
      email: `goose${i}@example.com`,
      instagram: spelling,
    });
    eq(res.status, 200, `"${spelling}" is accepted`);
    eq(one.db.rows[0]?.instagram, "goose", `"${spelling}" normalises to "goose"`);
  }
  assert(
    !JSON.stringify(secondBody).includes("Jess"),
    "a sign up response must not name anyone else on the list",
  );
}

// ------------------------------------------------------------- validation

{
  const call = fresh();
  const cases: [Record<string, unknown>, string, string][] = [
    [{ date: pastMonday }, "date", "a Monday that has already gone"],
    [{ date: beyondWindow }, "date", "a Monday past the end of the board"],
    [{ date: addDays(monday, 1) }, "date", "a Tuesday"],
    [{ date: "not-a-date" }, "date", "junk in the date field"],
    [{ date: monday, name: "J" }, "name", "a one-character name"],
    [{ date: monday, name: "Jess Everett", email: "nope" }, "email", "a non-email"],
    [
      { date: monday, name: "Jess Everett", email: "j@example.com", instagram: "no spaces here" },
      "instagram",
      "a handle with spaces",
    ],
    [
      { date: monday, name: "Jess Everett", email: "j@example.com", instagram: "" },
      "instagram",
      "an empty handle",
    ],
  ];

  for (const [body, field, description] of cases) {
    const response = await signup(call, {
      name: "Jess Everett",
      email: "jess@example.com",
      instagram: "jess",
      ...body,
    });
    eq(response.status, 400, `${description} is rejected`);
    const json = (await response.json()) as { field?: string };
    eq(json.field, field, `${description} is blamed on the ${field} field`);
  }
  eq(call.db.rows.length, 0, "no invalid sign up reached the database");
}

// --------------------------------------------------------------- spam traps

{
  const call = fresh();
  const honeyed = await signup(call, {
    date: monday,
    name: "Bot",
    email: "bot@example.com",
    instagram: "bot",
    honey: "http://buy-followers.example",
  });
  eq(honeyed.status, 200, "the honeypot answers 200, telling the bot nothing");
  eq(call.db.rows.length, 0, "but stores nothing");

  const tooFast = await signup(call, {
    date: monday,
    name: "Bot Two",
    email: "bot2@example.com",
    instagram: "bottwo",
    elapsedMs: 300,
  });
  eq(tooFast.status, 200, "the time trap also answers 200");
  eq(call.db.rows.length, 0, "and also stores nothing");

  const noElapsed = await signup(call, {
    date: monday,
    name: "Real Person",
    email: "real@example.com",
    instagram: "real",
    elapsedMs: undefined,
  });
  eq(noElapsed.status, 200, "a missing elapsedMs is not treated as too fast");
  eq(call.db.rows.length, 1, "a payload with no timing still gets a spot");
}

// ------------------------------------------------------------ origin check

{
  const call = fresh();
  const foreign = await signup(
    call,
    { date: monday, name: "Jess Everett", email: "j@example.com", instagram: "jess" },
    { origin: "https://evil.example" },
  );
  eq(foreign.status, 403, "a cross-origin POST is refused");
  eq(call.db.rows.length, 0, "and stores nothing");

  const noOrigin = await signup(
    call,
    { date: monday, name: "Jess Everett", email: "j@example.com", instagram: "jess" },
    { origin: null },
  );
  eq(noOrigin.status, 200, "a request with no Origin header is allowed through");
}

// ------------------------------------------------------- the cap and dupes

{
  const call = fresh();
  for (let i = 1; i <= MIC_SLOT_COUNT; i += 1) {
    const response = await signup(call, {
      date: monday,
      name: `Comic ${i}`,
      email: `comic${i}@example.com`,
      instagram: `comic${i}`,
    });
    const body = (await response.json()) as { slot: number };
    eq(body.slot, i, `comic ${i} gets spot ${i}`);
  }
  eq(call.db.rows.length, MIC_SLOT_COUNT, "twelve rows for a full night");

  const thirteenth = await signup(call, {
    date: monday,
    name: "Comic 13",
    email: "comic13@example.com",
    instagram: "comic13",
  });
  eq(thirteenth.status, 409, "the thirteenth comic is refused");
  eq(
    ((await thirteenth.json()) as { full?: boolean }).full,
    true,
    "and told the night is full rather than given a field error",
  );
  eq(call.db.rows.length, MIC_SLOT_COUNT, "the cap held");

  // A full Monday does not block the next one.
  const nextWeek = await signup(call, {
    date: secondMonday,
    name: "Comic 13",
    email: "comic13@example.com",
    instagram: "comic13",
  });
  eq(nextWeek.status, 200, "the same comic can take a spot the following Monday");
  eq(
    ((await nextWeek.json()) as { slot: number }).slot,
    1,
    "and starts that night's running order",
  );

  // Same email twice on one night.
  const dupe = await signup(call, {
    date: secondMonday,
    name: "Comic 13 Again",
    email: "COMIC13@example.com",
    instagram: "comic13",
  });
  eq(dupe.status, 409, "the same email twice on one night is refused");
  eq(
    ((await dupe.json()) as { field?: string }).field,
    "email",
    "and the email field is blamed, case-insensitively",
  );

  // The board now reports the full night correctly.
  const slots = (await (await hit(call, "/api/open-mic/slots")).json()) as {
    dates: { date: string; taken: number; remaining: number }[];
  };
  const full = slots.dates.find((d) => d.date === monday);
  eq(full?.remaining, 0, "the board shows the full Monday as having no spots");
  eq(full?.taken, MIC_SLOT_COUNT, "and all twelve taken");
}

// --------------------------------------------------- gaps are refilled

{
  const call = fresh();
  for (let i = 1; i <= 3; i += 1) {
    await signup(call, {
      date: monday,
      name: `Comic ${i}`,
      email: `comic${i}@example.com`,
      instagram: `comic${i}`,
    });
  }
  // A drop-out, removed by hand from the running order.
  call.db.rows = call.db.rows.filter((r) => r.slot !== 2);

  const response = await signup(call, {
    date: monday,
    name: "Late Comic",
    email: "late@example.com",
    instagram: "late",
  });
  eq(
    ((await response.json()) as { slot: number }).slot,
    2,
    "the freed spot 2 is handed out again rather than becoming spot 4",
  );
}

// -------------------------------------------------------------- the export

{
  const call = fresh();
  await signup(call, {
    date: monday,
    name: "Jess Everett",
    email: "jess@example.com",
    instagram: "jess.everett",
  });
  await signup(call, {
    date: secondMonday,
    name: "Min Lin",
    email: "min@example.com",
    instagram: "minlin",
  });

  eq(
    (await hit(call, "/api/open-mic/export")).status,
    401,
    "the export with no token is refused",
  );
  eq(
    (await hit(call, "/api/open-mic/export?token=wrong")).status,
    401,
    "the export with a wrong token is refused",
  );
  eq(
    (
      await hit(call, "/api/open-mic/export", {
        headers: { Authorization: `Bearer ${EXPORT_TOKEN}-extra` },
      })
    ).status,
    401,
    "a token with the right prefix but the wrong length is refused",
  );

  // An unconfigured token must not mean an open door.
  const unset = fresh();
  unset.env.OPEN_MIC_EXPORT_TOKEN = undefined;
  eq(
    (await hit(unset, "/api/open-mic/export?token=anything")).status,
    503,
    "an unconfigured export is closed, not open",
  );

  const viaQuery = await hit(call, `/api/open-mic/export?token=${EXPORT_TOKEN}`);
  eq(viaQuery.status, 200, "the export accepts the token as a query parameter");
  eq(
    viaQuery.headers.get("Content-Type"),
    "text/csv; charset=utf-8",
    "and answers as CSV",
  );
  assert(
    (viaQuery.headers.get("Content-Disposition") ?? "").includes("attachment"),
    "the export downloads rather than rendering",
  );
  eq(
    viaQuery.headers.get("X-Robots-Tag"),
    "noindex, nofollow",
    "a response full of personal data is not indexable",
  );

  const csv = await viaQuery.text();
  const lines = csv.trim().split("\r\n");
  eq(
    lines[0],
    "Monday,Slot,Name,Email,Instagram,Signed up",
    "the header row names the four fields plus the running order",
  );
  eq(lines.length, 3, "both Mondays are in the default export");
  assert(lines[1].includes('"Jess Everett"'), "the name is quoted into the CSV");
  assert(
    lines[1].includes('"jess.everett"'),
    "the handle exports bare, so no cell needs a formula guard",
  );
  assert(
    !lines[1].includes("'"),
    "and an ordinary row carries no apostrophe noise",
  );
  assert(lines[1].startsWith(`"${monday}"`), "rows are ordered by Monday");

  const viaHeader = await hit(call, "/api/open-mic/export", {
    headers: { Authorization: `Bearer ${EXPORT_TOKEN}` },
  });
  eq(viaHeader.status, 200, "the export also accepts a Bearer header");

  // One night's running order.
  const oneNight = await hit(
    call,
    `/api/open-mic/export?token=${EXPORT_TOKEN}&date=${secondMonday}`,
  );
  const oneNightLines = (await oneNight.text()).trim().split("\r\n");
  eq(oneNightLines.length, 2, "a date filter narrows the export to that Monday");
  assert(
    oneNightLines[1].includes("Min Lin"),
    "and returns that Monday's comics",
  );

  // A date outside the window falls back to the whole window rather than
  // reaching into deleted or future nights.
  const outside = await hit(
    call,
    `/api/open-mic/export?token=${EXPORT_TOKEN}&date=${pastMonday}`,
  );
  eq(
    (await outside.text()).trim().split("\r\n").length,
    3,
    "a date outside the window is ignored, not honoured",
  );
}

// ------------------------------------------------- CSV formula injection

{
  const call = fresh();
  await signup(call, {
    date: monday,
    // A name that a spreadsheet would otherwise execute.
    name: "=HYPERLINK(\"http://evil.example\",\"click\")",
    email: "sneaky@example.com",
    instagram: "sneaky",
  });
  const csv = await (
    await hit(call, `/api/open-mic/export?token=${EXPORT_TOKEN}`)
  ).text();
  assert(
    csv.includes("\"'=HYPERLINK"),
    "a leading = is defused with an apostrophe so the cell is text",
  );
  assert(
    csv.includes('""http://evil.example""'),
    "embedded quotes are doubled per RFC 4180",
  );
  assert(
    !/(^|,)"=/.test(csv),
    "no cell in the export starts with a bare formula character",
  );
}

// ---------------------------------------------------------------- the purge

{
  const call = fresh();
  // Two nights that have dropped off the board, and one that is still on it.
  call.db.rows.push(
    { id: "a", mic_date: pastMonday, slot: 1, name: "Gone", email: "gone@example.com", instagram: "gone", created_at: "x" },
    { id: "b", mic_date: addDays(pastMonday, -7), slot: 1, name: "Older", email: "older@example.com", instagram: "older", created_at: "x" },
    { id: "c", mic_date: monday, slot: 1, name: "Current", email: "now@example.com", instagram: "now", created_at: "x" },
  );

  const pending: Promise<unknown>[] = [];
  await worker.scheduled(
    { scheduledTime: Date.now(), cron: "0 7 * * *" },
    call.env,
    makeCtx(pending),
  );
  await Promise.all(pending);

  eq(call.db.rows.length, 1, "the nightly purge deletes the nights that have gone");
  eq(
    call.db.rows[0].mic_date,
    monday,
    "and leaves the Mondays still on the board",
  );

  // The same purge runs opportunistically on a sign up, so a paused cron does
  // not mean last week's emails sit in the table for a month.
  call.db.rows.push({
    id: "d", mic_date: pastMonday, slot: 2, name: "Gone Again",
    email: "gone2@example.com", instagram: "gone2", created_at: "x",
  });
  await signup(call, {
    date: secondMonday,
    name: "Fresh Comic",
    email: "fresh@example.com",
    instagram: "fresh",
  });
  assert(
    !call.db.rows.some((r) => r.mic_date === pastMonday),
    "a sign up also sweeps the nights that have fallen off",
  );
}
}

await_free_main();

function await_free_main() {
  main().then(
    () => {
      if (failures > 0) {
        console.error(`open-mic-worker test: ${failures} failure(s) of ${checks}.`);
        process.exit(1);
      }
      console.log(
        `open-mic-worker test: ${checks} checks pass. Cap, running order, privacy, export and purge all hold.`,
      );
    },
    (error) => {
      console.error("open-mic-worker test: threw", error);
      process.exit(1);
    },
  );
}
