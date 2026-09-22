-- D1 schema for the Log Cabin open mic: the weekly sign up list, and the
-- durable comedian roster.
--
-- FRESH DATABASE ONLY. Apply with:
--   npx wrangler d1 execute stoned-goose-open-mic --remote --file worker/schema.sql
--
-- An existing database takes the numbered files in worker/migrations/ instead.
-- This file is the end state they add up to, so a new environment gets there
-- in one step and nobody has to replay history.
--
-- Two tables with deliberately different lifetimes:
--
--   signups   the running order for a night. Deleted once its Monday falls
--             out of the four week window. This is operational data.
--   comedians the roster. Survives the purge, because the point of it is to
--             have someone to call when a show needs a booking.
--
-- The page says out loud that the second one exists. That matters: retaining
-- contact details after the night is over is only defensible if the person
-- handing them over knows it is happening and can get back out, which is what
-- unsubscribe_token is for.

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
  -- Unguessable, unique per sign up. The "can't make it" link in the
  -- confirmation email carries this and nothing else, so it authorises
  -- releasing exactly one spot and cannot be used to read the list.
  cancel_token TEXT,

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

-- Cancel links are looked up by token alone. UNIQUE rather than a plain index
-- so two sign ups can never share one, and SQLite permits many NULLs here,
-- which is what rows created before this column existed carry.
CREATE UNIQUE INDEX IF NOT EXISTS signups_cancel_token
  ON signups (cancel_token);

-- The roster. One row per comic, keyed on the email they signed up with.
CREATE TABLE IF NOT EXISTS comedians (
  email             TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  instagram         TEXT NOT NULL,
  first_seen        TEXT NOT NULL,
  last_seen         TEXT NOT NULL,
  -- How many spots they have taken, ever. A rough measure of who actually
  -- turns up, which is the thing worth knowing when booking a real lineup.
  signup_count      INTEGER NOT NULL DEFAULT 1,
  -- Unguessable, stable for the life of the row. The removal link in every
  -- confirmation email carries this.
  unsubscribe_token TEXT NOT NULL,
  -- Set when they ask to come off the roster. The row is kept, with name and
  -- handle blanked, so that a later sign up does not silently put them back on
  -- a list they asked to leave. Nothing that reads the roster for booking
  -- returns a row with this set.
  removed_at        TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS comedians_unsubscribe_token
  ON comedians (unsubscribe_token);

-- Booking reads the roster newest-active-first.
CREATE INDEX IF NOT EXISTS comedians_last_seen ON comedians (last_seen);
