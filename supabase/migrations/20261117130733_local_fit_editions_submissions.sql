-- Bohemo v2 redesign — Local Fit fields, edition fields, submissions table
-- Written for SPEC.md Task 2. Do not run until Taranga approves.

BEGIN;

-- ============================================================
-- tools: Local Fit + verification fields
-- Existing rows get safe defaults; nothing here touches tools.verified.
-- ============================================================

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS languages        TEXT[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_methods  TEXT[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS local_pricing    JSONB,
  ADD COLUMN IF NOT EXISTS low_bandwidth    BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_in_region   BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS made_in_asia     BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_checked     DATE,
  ADD COLUMN IF NOT EXISTS verified_at      TIMESTAMPTZ;

-- ============================================================
-- news: edition fields
-- ============================================================

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS why_it_matters  TEXT,
  ADD COLUMN IF NOT EXISTS edition_date    DATE,
  ADD COLUMN IF NOT EXISTS edition_rank    SMALLINT,
  ADD COLUMN IF NOT EXISTS tools_mentioned TEXT[]      NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_news_edition_date ON news (edition_date DESC);

-- ============================================================
-- submissions: Submit your tool, Talk to us, Report a mistake,
-- Expense it, Pro waitlist
-- ============================================================

CREATE TABLE IF NOT EXISTS submissions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT        NOT NULL CHECK (type IN ('tool_submission', 'contact', 'agency', 'report_mistake', 'invoice_request', 'pro_waitlist')),
  email      TEXT,
  payload    JSONB       NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions (type);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Insert-only for anon and authenticated; no select/update/delete policy,
-- so submissions are write-only from the client — nobody can read them back.
CREATE POLICY "submissions_insert" ON submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

COMMIT;
