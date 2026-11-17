-- Bohemo v2 redesign — Local Fit fields, edition fields, submissions table
-- SPEC.md Task 2. Do not run until Taranga approves.
-- Local Fit convention: NULL = not checked yet; a value = checked.

BEGIN;

-- tools: Local Fit (5 criteria) + verification. tools.verified is untouched.
ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS languages        TEXT[],        -- ISO codes supported; NULL = not checked
  ADD COLUMN IF NOT EXISTS payment_methods  TEXT[],        -- e.g. upi, rupay, gcash; NULL = not checked
  ADD COLUMN IF NOT EXISTS local_pricing    JSONB,         -- keyed by currency; NULL = not checked
  ADD COLUMN IF NOT EXISTS low_bandwidth    BOOLEAN,       -- NULL = not checked, false = checked & fails
  ADD COLUMN IF NOT EXISTS data_regions     TEXT[],        -- country codes where data is stored; NULL = not checked
  ADD COLUMN IF NOT EXISTS made_in_asia     BOOLEAN,
  ADD COLUMN IF NOT EXISTS last_checked     DATE,
  ADD COLUMN IF NOT EXISTS verified_at      TIMESTAMPTZ;   -- Bohemo Verified; badge only when set

-- news: edition fields
ALTER TABLE news
  ADD COLUMN IF NOT EXISTS why_it_matters  TEXT,
  ADD COLUMN IF NOT EXISTS edition_date    DATE,
  ADD COLUMN IF NOT EXISTS edition_rank    SMALLINT,
  ADD COLUMN IF NOT EXISTS tools_mentioned TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE news DROP CONSTRAINT IF EXISTS news_edition_rank_range;
ALTER TABLE news ADD CONSTRAINT news_edition_rank_range
  CHECK (edition_rank IS NULL OR edition_rank BETWEEN 1 AND 7);

CREATE INDEX IF NOT EXISTS idx_news_edition_date ON news (edition_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_news_edition_slot
  ON news (edition_date, edition_rank)
  WHERE edition_date IS NOT NULL AND edition_rank IS NOT NULL;

-- submissions: Submit your tool, Talk to us, Agency, Report a mistake, Expense it, Pro waitlist
CREATE TABLE IF NOT EXISTS submissions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT        NOT NULL CHECK (type IN ('tool_submission','contact','agency','report_mistake','invoice_request','pro_waitlist')),
  email      TEXT        CHECK (email IS NULL OR (length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  payload    JSONB       NOT NULL CHECK (jsonb_typeof(payload) = 'object' AND pg_column_size(payload) <= 16384),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_type_created ON submissions (type, created_at DESC);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Insert-only from the client. No SELECT/UPDATE/DELETE policies: nobody reads these back with the public key.
DROP POLICY IF EXISTS "submissions_insert" ON submissions;
CREATE POLICY "submissions_insert" ON submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

COMMIT;
