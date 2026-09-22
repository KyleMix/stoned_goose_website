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
import { FakeD1, type Comedian, type Row } from "../fake-d1";
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

const ORIGIN = "https://www.stonedgooseproductions.com";
const EXPORT_TOKEN = "test-token-0123456789";
const HOST_TOKEN = "host-token-98765432101";

/** Mirrors the Env interface in worker/index.ts, secrets optional. */
type TestEnv = {
  DB: D1Database;
  ASSETS: Fetcher;
  OPEN_MIC_EXPORT_TOKEN?: string;
  OPEN_MIC_HOST_TOKEN?: string;
  OPEN_MIC_ALLOWED_ORIGINS?: string;
  RESEND_API_KEY?: string;
  OPEN_MIC_FROM_EMAIL?: string;
  OPEN_MIC_REPLY_TO?: string;
};

function makeEnv(db: FakeD1): TestEnv {
  return {
    DB: db as unknown as D1Database,
    ASSETS: {
      fetch: async () => new Response("static asset", { status: 200 }),
    } as unknown as Fetcher,
    OPEN_MIC_EXPORT_TOKEN: EXPORT_TOKEN,
    OPEN_MIC_HOST_TOKEN: HOST_TOKEN,
    OPEN_MIC_ALLOWED_ORIGINS: ORIGIN,
    // No RESEND_API_KEY: sendConfirmation returns early without touching the
    // network, so the suite never makes a real request. The one test that
    // checks the email payload stubs fetch and sets the key itself.
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

  // The regression that took the live form down: OPEN_MIC_ALLOWED_ORIGINS set
  // to the canonical www origin used to REPLACE the same-host rule, so every
  // other hostname the same Worker answers on was refused. A comic standing on
  // the real site was told sign ups only work from the real site. The secret
  // adds to same-host now, it does not replace it.
  {
    const one = fresh();
    one.env.OPEN_MIC_ALLOWED_ORIGINS = "https://www.stonedgooseproductions.com";
    const res = await signup(one, {
      date: monday,
      name: "Same Host",
      email: "samehost@example.com",
      instagram: "samehost",
    });
    eq(res.status, 200, "the request's own host is allowed even when the list names another");
  }

  // Same, with no list configured at all.
  {
    const one = fresh();
    one.env.OPEN_MIC_ALLOWED_ORIGINS = undefined;
    const res = await signup(one, {
      date: monday,
      name: "No List",
      email: "nolist@example.com",
      instagram: "nolist",
    });
    eq(res.status, 200, "same host works with no allowlist configured");
  }

  // An extra origin really is allowed, however it is spelled.
  for (const spelling of [
    "https://preview.example",
    "https://preview.example/",
    "preview.example",
    "https://www.stonedgooseproductions.com, https://preview.example",
  ]) {
    const one = fresh();
    one.env.OPEN_MIC_ALLOWED_ORIGINS = spelling;
    const res = await signup(
      one,
      { date: monday, name: "Preview", email: "p@example.com", instagram: "preview" },
      { origin: "https://preview.example" },
    );
    eq(res.status, 200, `an extra origin configured as "${spelling}" is allowed`);
  }

  // And a genuinely foreign origin is still refused, list or no list.
  {
    const one = fresh();
    one.env.OPEN_MIC_ALLOWED_ORIGINS = "https://preview.example";
    const res = await signup(
      one,
      { date: monday, name: "Evil", email: "e@example.com", instagram: "evil" },
      { origin: "https://evil.example" },
    );
    eq(res.status, 403, "a foreign origin is still refused when a list is configured");
    eq(one.db.rows.length, 0, "and stores nothing");
  }

  // Junk in the Origin header is not a way round the check.
  {
    const one = fresh();
    const res = await signup(
      one,
      { date: monday, name: "Junk", email: "j@example.com", instagram: "junk" },
      { origin: "not-a-url" },
    );
    eq(res.status, 403, "an unparseable Origin is refused rather than trusted");
  }
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

// ------------------------------------------------------------- the roster

{
  const call = fresh();
  await signup(call, {
    date: monday,
    name: "Jess Everett",
    email: "jess@example.com",
    instagram: "@jess.everett",
  });

  eq(call.db.comedians.length, 1, "a sign up puts the comic on the roster");
  const [c] = call.db.comedians;
  eq(c.email, "jess@example.com", "keyed on the lowercased email");
  eq(c.name, "Jess Everett", "with their name");
  eq(c.instagram, "jess.everett", "and the normalised handle");
  eq(c.signup_count, 1, "counting one spot so far");
  eq(c.removed_at, null, "and not removed");
  assert(Boolean(c.unsubscribe_token), "with a removal token issued up front");
  eq(c.first_seen, c.last_seen, "first and last seen match on a first sign up");

  const firstToken = c.unsubscribe_token;

  // A second Monday updates the row rather than adding one.
  await signup(call, {
    date: secondMonday,
    name: "Jess Everett-Smith",
    email: "JESS@example.com",
    instagram: "jesse",
  });
  eq(call.db.comedians.length, 1, "signing up again does not duplicate the roster row");
  eq(call.db.comedians[0].signup_count, 2, "it increments the spot count");
  eq(call.db.comedians[0].name, "Jess Everett-Smith", "and takes the newer name");
  eq(call.db.comedians[0].instagram, "jesse", "and the newer handle");
  eq(
    call.db.comedians[0].unsubscribe_token,
    firstToken,
    "the removal token is stable, so a link in an old email keeps working",
  );

  // The roster export.
  const csv = await (
    await hit(call, `/api/open-mic/roster?token=${EXPORT_TOKEN}`)
  ).text();
  const lines = csv.trim().split("\r\n");
  eq(
    lines[0],
    "Name,Email,Instagram,First signed up,Last signed up,Spots taken",
    "the roster CSV header",
  );
  eq(lines.length, 2, "one row per comic, not per sign up");
  assert(lines[1].includes('"jess@example.com"'), "with the email for booking");
  assert(lines[1].endsWith(",2"), "and the spot count as a bare number");

  eq(
    (await hit(call, "/api/open-mic/roster")).status,
    401,
    "the roster needs the export token",
  );
  eq(
    (await hit(call, `/api/open-mic/roster?token=${HOST_TOKEN}`)).status,
    401,
    "and the host token does not open it",
  );
}

// ------------------------------------------------ the roster survives a purge

{
  const call = fresh();
  await signup(call, {
    date: monday,
    name: "Long Hauler",
    email: "long@example.com",
    instagram: "longhauler",
  });
  // Drag the night into the past and purge, the way a week rolling over does.
  call.db.rows[0].mic_date = pastMonday;

  const pending: Promise<unknown>[] = [];
  await worker.scheduled(
    { scheduledTime: Date.now(), cron: "0 7 * * *" },
    call.env,
    makeCtx(pending),
  );
  await Promise.all(pending);

  eq(call.db.rows.length, 0, "the running order is purged with the night");
  eq(
    call.db.comedians.length,
    1,
    "but the roster row survives, which is the whole point of it",
  );
}

// ---------------------------------------------------------- run of show

{
  const call = fresh();
  for (const [i, who] of [
    ["Min Lin", "minlin"],
    ["Jess Everett", "jess.everett"],
  ].entries()) {
    await signup(call, {
      date: monday,
      name: who[0],
      email: `c${i}@example.com`,
      instagram: who[1],
    });
  }

  eq(
    (await hit(call, "/api/open-mic/run-of-show")).status,
    401,
    "the running order needs a token",
  );
  eq(
    (await hit(call, `/api/open-mic/run-of-show?token=${EXPORT_TOKEN}`)).status,
    401,
    "and it is the host token, not the export one",
  );

  const response = await hit(
    call,
    `/api/open-mic/run-of-show?token=${HOST_TOKEN}`,
  );
  eq(response.status, 200, "the host token opens it");
  eq(
    response.headers.get("X-Robots-Tag"),
    "noindex, nofollow",
    "and the response is not indexable",
  );

  const body = await response.text();
  const data = JSON.parse(body) as {
    date: string;
    taken: number;
    spots: { slot: number; name: string; instagram: string }[];
    dates: { date: string }[];
  };
  eq(data.date, monday, "defaulting to the front of the window, which is tonight");
  eq(data.taken, 2, "reporting how many spots are gone");
  eq(
    data.spots.map((sp) => [sp.slot, sp.name]),
    [[1, "Min Lin"], [2, "Jess Everett"]],
    "in running order",
  );
  eq(data.dates.length, 4, "offering all four Mondays so the page needs no second call");

  // THE privacy guarantee for this route. A host link gets forwarded around;
  // it must not carry twelve people's contact details with it.
  assert(
    !body.includes("@example.com"),
    "the running order must not contain a single email address",
  );
  assert(
    !call.db.queries.some(
      (query) =>
        query.startsWith("SELECT slot, name, instagram") && /\bemail\b/.test(query),
    ),
    "and the query behind it must not select email",
  );

  // A date from the window is honoured; one outside it falls back.
  const other = await hit(
    call,
    `/api/open-mic/run-of-show?token=${HOST_TOKEN}&date=${secondMonday}`,
  );
  eq(
    ((await other.json()) as { date: string }).date,
    secondMonday,
    "an in-window date is honoured",
  );
  const past = await hit(
    call,
    `/api/open-mic/run-of-show?token=${HOST_TOKEN}&date=${pastMonday}`,
  );
  eq(
    ((await past.json()) as { date: string }).date,
    monday,
    "a date off the board falls back to tonight rather than reaching for it",
  );
}

// ------------------------------------------------------------- cancelling

{
  const call = fresh();
  for (let i = 1; i <= 3; i += 1) {
    await signup(call, {
      date: monday,
      name: `Comic ${i}`,
      email: `c${i}@example.com`,
      instagram: `c${i}`,
    });
  }
  const token = call.db.rows[1].cancel_token as string;
  assert(Boolean(token), "every sign up gets a cancel token");

  // GET must only report. A mail client prefetching the link cannot be the
  // thing that releases the spot.
  const peek = await hit(call, `/api/open-mic/cancel?t=${token}`);
  eq(peek.status, 200, "GET on a cancel link answers");
  const detail = (await peek.json()) as { slot: number; name: string; date: string };
  eq(detail.slot, 2, "and says which spot it would release");
  eq(detail.name, "Comic 2", "and whose");
  eq(call.db.rows.length, 3, "and releases nothing, because GET never mutates");

  const done = await hit(call, "/api/open-mic/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  eq(done.status, 200, "POST releases it");
  eq(((await done.json()) as { cancelled: boolean }).cancelled, true, "and says so");
  eq(call.db.rows.length, 2, "the row is gone");

  // And the freed slot is handed out again rather than left as a hole.
  const replacement = await signup(call, {
    date: monday,
    name: "Replacement",
    email: "new@example.com",
    instagram: "newcomic",
  });
  eq(
    ((await replacement.json()) as { slot: number }).slot,
    2,
    "the released spot goes to the next comic",
  );

  // Using the link twice is not an error.
  const again = await hit(call, `/api/open-mic/cancel?t=${token}`);
  eq(again.status, 200, "a spent cancel link still answers 200");
  eq(
    ((await again.json()) as { alreadyGone: boolean }).alreadyGone,
    true,
    "and says there is nothing to do",
  );

  // Junk is refused before it reaches a query.
  eq(
    (await hit(call, "/api/open-mic/cancel?t=nonsense")).status,
    400,
    "a malformed token is refused",
  );
  eq(
    (await hit(call, "/api/open-mic/cancel")).status,
    400,
    "and a missing one too",
  );
  // Cancelling does not touch the roster.
  eq(
    call.db.comedians.length,
    4,
    "releasing a spot leaves the comic on the roster",
  );
}

// --------------------------------------------------------- unsubscribing

{
  const call = fresh();
  await signup(call, {
    date: monday,
    name: "Jess Everett",
    email: "jess@example.com",
    instagram: "jess.everett",
  });
  const token = call.db.comedians[0].unsubscribe_token;

  const peek = await hit(call, `/api/open-mic/unsubscribe?t=${token}`);
  eq(peek.status, 200, "GET on a removal link answers");
  eq(
    ((await peek.json()) as { removed: boolean }).removed,
    false,
    "and reports them as still on the list",
  );
  eq(call.db.comedians[0].removed_at, null, "GET removes nobody");

  const done = await hit(call, "/api/open-mic/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  eq(done.status, 200, "POST removes them");
  assert(Boolean(call.db.comedians[0].removed_at), "removed_at is stamped");
  eq(call.db.comedians[0].name, "", "the name is blanked");
  eq(call.db.comedians[0].instagram, "", "and the handle");
  eq(
    call.db.comedians[0].email,
    "jess@example.com",
    "the email stays, as the record of the request",
  );

  // Their spot is untouched. Leaving a mailing list is not withdrawing from
  // the show, and silently cancelling it would be a nasty surprise.
  eq(call.db.rows.length, 1, "coming off the list does not cancel their spot");

  // The roster export no longer returns them.
  const csv = await (
    await hit(call, `/api/open-mic/roster?token=${EXPORT_TOKEN}`)
  ).text();
  eq(csv.trim().split("\r\n").length, 1, "a removed comic is not in the roster CSV");
  assert(!csv.includes("jess@example.com"), "not even their email");

  // The suppression has to stick, or an unsubscribe link means nothing.
  await signup(call, {
    date: secondMonday,
    name: "Jess Everett",
    email: "jess@example.com",
    instagram: "jess.everett",
  });
  assert(
    Boolean(call.db.comedians[0].removed_at),
    "signing up again does NOT put a removed comic back on the list",
  );
  const after = await (
    await hit(call, `/api/open-mic/roster?token=${EXPORT_TOKEN}`)
  ).text();
  assert(
    !after.includes("jess@example.com"),
    "and they stay out of the roster export",
  );

  // Removing twice is idempotent and not an error.
  const twice = await hit(call, `/api/open-mic/unsubscribe?t=${token}`);
  eq(
    ((await twice.json()) as { already: boolean }).already,
    true,
    "a spent removal link says so rather than erroring",
  );
}

// ----------------------------------------------------- the email payload

{
  const call = fresh();
  call.env.RESEND_API_KEY = "re_test_key";
  call.env.OPEN_MIC_FROM_EMAIL = "Mic <mic@stonedgooseproductions.com>";
  call.env.OPEN_MIC_REPLY_TO = "kyle@stonedgooseproductions.com";

  const sent: { url: string; body: Record<string, unknown> }[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.startsWith("https://api.resend.com")) {
      sent.push({ url, body: JSON.parse(String(init?.body)) });
      return new Response(JSON.stringify({ id: "stub" }), { status: 200 });
    }
    return realFetch(input as never, init);
  }) as typeof fetch;

  try {
    await signup(call, {
      date: monday,
      name: "Jess Everett",
      email: "jess@example.com",
      instagram: "jess.everett",
    });
  } finally {
    globalThis.fetch = realFetch;
  }

  eq(sent.length, 1, "a sign up sends exactly one email");
  const body = sent[0].body as {
    to: string[];
    from: string;
    reply_to: string;
    subject: string;
    text: string;
    html: string;
    headers: Record<string, string>;
  };
  eq(body.to, ["jess@example.com"], "to the comic");
  eq(body.from, "Mic <mic@stonedgooseproductions.com>", "from the configured address");
  eq(body.reply_to, "kyle@stonedgooseproductions.com", "with a real reply-to");
  assert(body.subject.includes("You have a spot"), "with a subject that says what it is");

  // The two links are what make the whole retention arrangement honest, so
  // they are asserted rather than assumed.
  const cancelUrl = `${ORIGIN}/open-mics/cancel?t=${call.db.rows[0].cancel_token}`;
  const unsubUrl = `${ORIGIN}/open-mics/unsubscribe?t=${call.db.comedians[0].unsubscribe_token}`;
  for (const [part, label] of [[body.text, "text"], [body.html, "html"]] as const) {
    assert(part.includes(cancelUrl), `the ${label} part carries the cancel link`);
    assert(part.includes(unsubUrl), `the ${label} part carries the removal link`);
    assert(part.includes("Spot 1 of 12"), `the ${label} part states the spot`);
    assert(part.includes("8 minutes"), `the ${label} part states the length`);
    assert(part.includes("7:00 PM"), `the ${label} part states the show time`);
    assert(
      part.includes("Log Cabin Bar & Grill") || part.includes("Log Cabin Bar &amp; Grill"),
      `the ${label} part names the venue`,
    );
    assert(
      part.includes("comedian list"),
      `the ${label} part says we keep them on a list`,
    );
  }
  eq(
    body.headers["List-Unsubscribe"],
    `<${unsubUrl}>`,
    "and the List-Unsubscribe header points at the same place",
  );
  eq(
    body.headers["List-Unsubscribe-Post"],
    "List-Unsubscribe=One-Click",
    "so Gmail and Outlook can offer removal in their own UI",
  );
}

// --------------------------------------- no email key is a valid setup

{
  const call = fresh();
  call.env.RESEND_API_KEY = undefined;
  const realFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    if (String(input).startsWith("https://api.resend.com")) called = true;
    return realFetch(input as never, init);
  }) as typeof fetch;

  let status = 0;
  try {
    status = (
      await signup(call, {
        date: monday,
        name: "No Email",
        email: "noemail@example.com",
        instagram: "noemail",
      })
    ).status;
  } finally {
    globalThis.fetch = realFetch;
  }

  eq(status, 200, "a sign up works with email switched off");
  eq(call.db.rows.length, 1, "the spot is still taken");
  eq(call.db.comedians.length, 1, "and the roster is still written");
  assert(!called, "and nothing is sent");
}

// ---------------------------------------------------------------- the purge

{
  const call = fresh();
  // Two nights that have dropped off the board, and one that is still on it.
  call.db.rows.push(
    { id: "a", mic_date: pastMonday, slot: 1, name: "Gone", email: "gone@example.com", instagram: "gone", created_at: "x", cancel_token: null },
    { id: "b", mic_date: addDays(pastMonday, -7), slot: 1, name: "Older", email: "older@example.com", instagram: "older", created_at: "x", cancel_token: null },
    { id: "c", mic_date: monday, slot: 1, name: "Current", email: "now@example.com", instagram: "now", created_at: "x", cancel_token: null },
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
    cancel_token: null,
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
        `open-mic-worker test: ${checks} checks pass. Cap, running order, privacy, roster retention, the two email links, host view, exports and purge all hold.`,
      );
    },
    (error) => {
      console.error("open-mic-worker test: threw", error);
      process.exit(1);
    },
  );
}
