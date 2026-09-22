-- D1 schema for the Log Cabin open mic pre sign up list.
--
-- Apply with:
--   npx wrangler d1 execute stoned-goose-open-mic --remote --file worker/schema.sql
--
-- This table holds personal data (name, email, Instagram handle) for comics
-- who have taken a spot, so two things are deliberate:
--
--   1. Nothing here is ever served to the public. The only public endpoint
--      returns counts. See worker/index.ts.
--   2. Rows are deleted, not archived, once their Monday falls out of the four
--      week window. A comic's email is kept for as long as it is needed to run
--      the night they signed up for and no longer. The nightly cron does the
--      delete; there is no "deleted" flag and no soft delete, because a soft
--      delete would mean the site is quietly retaining the list forever.

CREATE TABLE IF NOT EXISTS signups (
  id           TEXT PRIMARY KEY,
  -- The Monday the comic is performing, "YYYY-MM-DD" in Olympia's civil date.
  mic_date     TEXT NOT NULL,
  -- 1 through MIC_SLOT_COUNT. Position on the running order.
  slot         INTEGER NOT NULL,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  -- Stored without the leading "@". The Worker strips it on the way in so the
  -- uniqueness check and the export both see one spelling.
  instagram    TEXT NOT NULL,
  created_at   TEXT NOT NULL,

  -- The cap and the running order, enforced by the database rather than by a
  -- read-then-write in the Worker. Two comics submitting in the same second
  -- cannot both take slot 7: the second INSERT fails and the Worker retries
  -- against a fresh read of the taken slots.
  UNIQUE (mic_date, slot),
  -- One spot per person per night. Beats a client side check, which a second
  -- browser tab defeats.
  UNIQUE (mic_date, email)
);

-- The window query ("which of these four Mondays, and how full") and the
-- nightly purge both filter on mic_date, and the export orders by it.
CREATE INDEX IF NOT EXISTS signups_mic_date_slot ON signups (mic_date, slot);
