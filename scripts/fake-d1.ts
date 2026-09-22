// An in-memory stand-in for D1, shared by the Worker's tests and by the local
// click-through harness in scripts/dev-open-mic-server.ts.
//
// Shared on purpose. Two copies of this drift, and the copy that is not under
// test drifts silently: the harness would start throwing "unhandled query" the
// first time the Worker learned a new one, in the middle of somebody trying to
// see whether a change works.
//
// It recognises exactly the queries worker/index.ts issues and throws on
// anything else, rather than returning an empty result. A new query is then a
// loud failure in `npm test` instead of a handler that quietly sees no rows.
//
// The UNIQUE constraints from worker/schema.sql are reproduced here because
// they are load bearing: they are what makes the Worker's read-then-write slot
// assignment safe, and without them a race would look correct in tests and
// hand out a duplicate running order in production.

export type Row = {
  id: string;
  mic_date: string;
  slot: number;
  name: string;
  email: string;
  instagram: string;
  created_at: string;
  cancel_token: string | null;
};

export type Comedian = {
  email: string;
  name: string;
  instagram: string;
  first_seen: string;
  last_seen: string;
  signup_count: number;
  unsubscribe_token: string;
  removed_at: string | null;
};

/**
 * Enough of D1 to run the Worker, and no more.
 *
 * The UNIQUE constraints are the point of this stub. They are what makes the
 * Worker's retry loop testable: without them the read-then-write would look
 * correct and a race would hand out a duplicate slot in production.
 */
export class FakeD1 {
  rows: Row[] = [];
  comedians: Comedian[] = [];
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

    // handleRunOfShow: one night, no emails. The absence of `email` in this
    // query is the privacy guarantee, so the stub reflects it exactly.
    if (q.startsWith("SELECT slot, name, instagram")) {
      const [date] = bound as string[];
      return this.rows
        .filter((r) => r.mic_date === date)
        .sort((a, b) => a.slot - b.slot)
        .map((r) => ({ slot: r.slot, name: r.name, instagram: r.instagram }));
    }

    // handleCancel lookup.
    if (q.startsWith("SELECT mic_date, slot, name FROM signups WHERE cancel_token")) {
      const [token] = bound as string[];
      return this.rows
        .filter((r) => r.cancel_token === token)
        .map((r) => ({ mic_date: r.mic_date, slot: r.slot, name: r.name }));
    }

    // The roster token read after an upsert.
    if (q.startsWith("SELECT unsubscribe_token FROM comedians")) {
      const [email] = bound as string[];
      return this.comedians
        .filter((c) => c.email === email)
        .map((c) => ({ unsubscribe_token: c.unsubscribe_token }));
    }

    // handleUnsubscribe lookup.
    if (q.startsWith("SELECT email, name, removed_at FROM comedians")) {
      const [token] = bound as string[];
      return this.comedians
        .filter((c) => c.unsubscribe_token === token)
        .map((c) => ({ email: c.email, name: c.name, removed_at: c.removed_at }));
    }

    // handleRoster: active rows only.
    if (q.startsWith("SELECT email, name, instagram, first_seen")) {
      return this.comedians
        .filter((c) => c.removed_at === null)
        .sort((a, b) => b.last_seen.localeCompare(a.last_seen))
        .map((c) => ({
          email: c.email,
          name: c.name,
          instagram: c.instagram,
          first_seen: c.first_seen,
          last_seen: c.last_seen,
          signup_count: c.signup_count,
        }));
    }

    // handleExport: the full list.
    if (q.startsWith("SELECT mic_date, slot, name, email")) {
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
      const [id, mic_date, slot, name, email, instagram, created_at, cancel_token] =
        bound as [
          string, string, number, string, string, string, string, string,
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
      this.rows.push({
        id, mic_date, slot, name, email, instagram, created_at,
        cancel_token: cancel_token ?? null,
      });
      return 1;
    }

    // The roster upsert. Mirrors the ON CONFLICT clause in worker/index.ts:
    // name, handle and last_seen move, the count goes up, and the token and
    // the removal marker are left alone.
    if (q.startsWith("INSERT INTO comedians")) {
      const [email, name, instagram, first_seen, last_seen, unsubscribe_token] =
        bound as [string, string, string, string, string, string];
      const existing = this.comedians.find((c) => c.email === email);
      if (existing) {
        existing.name = name;
        existing.instagram = instagram;
        existing.last_seen = last_seen;
        existing.signup_count += 1;
      } else {
        this.comedians.push({
          email, name, instagram, first_seen, last_seen,
          signup_count: 1, unsubscribe_token, removed_at: null,
        });
      }
      return 1;
    }

    if (q.startsWith("UPDATE comedians SET removed_at")) {
      const [at, token] = bound as [string, string];
      const row = this.comedians.find((c) => c.unsubscribe_token === token);
      if (!row) return 0;
      row.removed_at = at;
      row.name = "";
      row.instagram = "";
      return 1;
    }

    if (q.startsWith("DELETE FROM signups WHERE cancel_token")) {
      const [token] = bound as string[];
      const before = this.rows.length;
      this.rows = this.rows.filter((r) => r.cancel_token !== token);
      return before - this.rows.length;
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
