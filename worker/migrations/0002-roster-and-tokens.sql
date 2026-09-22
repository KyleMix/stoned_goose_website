-- Adds the comedian roster and the email action tokens to a database that
-- already has the original `signups` table.
--
-- Apply once, to an existing database:
--   npx wrangler d1 execute stoned-goose-open-mic --remote \
--     --file worker/migrations/0002-roster-and-tokens.sql
--
-- A brand new database does not need this: worker/schema.sql already contains
-- everything here.
--
-- ALTER TABLE ADD COLUMN is the one statement below that is NOT idempotent.
-- SQLite errors with "duplicate column name" if it has already run, and D1
-- rolls the whole file back, so a second run is noisy but harmless. If you see
-- that error, this migration is already applied.

ALTER TABLE signups ADD COLUMN cancel_token TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS signups_cancel_token
  ON signups (cancel_token);

CREATE TABLE IF NOT EXISTS comedians (
  email             TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  instagram         TEXT NOT NULL,
  first_seen        TEXT NOT NULL,
  last_seen         TEXT NOT NULL,
  signup_count      INTEGER NOT NULL DEFAULT 1,
  unsubscribe_token TEXT NOT NULL,
  removed_at        TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS comedians_unsubscribe_token
  ON comedians (unsubscribe_token);

CREATE INDEX IF NOT EXISTS comedians_last_seen ON comedians (last_seen);
